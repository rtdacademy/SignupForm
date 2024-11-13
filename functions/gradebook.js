const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { sanitizeEmail, API_KEY } = require('./utils');
const _ = require('lodash');

const processGradebookData = (data) => {
 
  return data;
};

const transformGradebookData = (headers, studentData) => {
  const columnHeaders = headers[0] || [];
  const assignmentHeaders = headers[1] || [];
  const categories = transformCategories(headers[2] || []);
  const grades = studentData.grades || {};

  const studentSection = studentData.info[2] || '';

  // Helper function to check if an assignment is an exam
  const isExam = (name) => name.toLowerCase().includes('exam');

  // Status mapping based on grade[3]
  const statusMapping = {
    '-1': 'Not Attempted',
    '0': 'Not Started',
    '10': 'Submitted',
    '12': 'In Progress',
  };

  // First, transform all assignments
  let transformedAssignments = assignmentHeaders.map((header, index) => {
    const pointsPossible = parseFloat(header[2]);
    const grade = grades[index.toString()] || {};
    let score = grade[0] !== undefined ? parseFloat(grade[0]) : undefined;

    if (isNaN(score)) {
      score = 0;
    }

    const percentage =
      score !== undefined && !isNaN(pointsPossible) && pointsPossible > 0
        ? (score / pointsPossible) * 100
        : 0;
    const started = score !== undefined && score !== 0;

    // Handle manual grading status
    let manualGradingStatus;
    if (grade[10] === false) {
      manualGradingStatus = 'Not Required';
    } else if (grade[10] === 0) {
      manualGradingStatus = 'Required';
    } else if (grade[10] === 1) {
      manualGradingStatus = 'Completed';
    } else {
      manualGradingStatus = 'Unknown';
    }

    // Determine the status using the statusMapping
    const statusCode = grade[3] !== undefined ? String(grade[3]) : 'Unknown';
    const status = statusMapping[statusCode] || 'Unknown';

    return {
      name: header[0] || '',
      categoryId: header[1] || null,
      pointsPossible: isNaN(pointsPossible) ? 0 : pointsPossible,
      availability: ['past', 'current', 'future'][header[3]] || 'unknown',
      countingMethod:
        ['counts', 'extra credit', 'does not count'][header[4] - 1] ||
        'unknown',
      isPracticeTest: !!header[5],
      type:
        ['online', 'offline', 'discussion', 'external tool'][header[6]] ||
        'unknown',
      assessmentId: header[7] || '',
      isGroupAssignment: !!header[10],
      isExcused: header[14] === '1',
      uiVersion: header[15] || '',
      section: header[17] || null,
      started: started,
      grade: {
        score: started ? score : 0,
        percentage: isNaN(percentage)
          ? 0
          : parseFloat(percentage.toFixed(2)),
        hasFeedback: !!grade[1],
        hasViewLink: !!grade[2],
        status: status,
        assessmentSessionId: grade[4] || '',
        timeSpent: parseInt(grade[7]) || 0,
        timeOnTask: parseFloat(grade[8]) || 0,
        manualGradingStatus: manualGradingStatus,
        requiresManualGrading: manualGradingStatus === 'Required',
        prerequisitesMet: grade[13] !== undefined ? !!grade[13] : false,
        submissionAllowed: !!grade[16],
      },
    };
  });

  console.log(
    'Total assignments before filtering:',
    transformedAssignments.length
  );

  // Collect exams along with their indices
  const examsByCategory = {};
  transformedAssignments.forEach((assignment, index) => {
    if (isExam(assignment.name)) {
      const categoryId = String(assignment.categoryId); // Ensure consistent type
      if (!examsByCategory[categoryId]) {
        examsByCategory[categoryId] = [];
      }
      examsByCategory[categoryId].push({ assignment, index });
    }
  });

  console.log('Exams by category:', JSON.stringify(examsByCategory));

  // For each category, keep only the highest-scoring exam
  const indicesToRemove = new Set();

  Object.keys(examsByCategory).forEach((categoryId) => {
    const exams = examsByCategory[categoryId];
    if (exams.length > 1) {
      console.log(`Processing category ${categoryId} with ${exams.length} exams`);
      const highestScoringExamEntry = exams.reduce((highest, current) => {
        const highestAssignment = highest.assignment;
        const currentAssignment = current.assignment;

        // If neither exam has a score, keep the first one
        if (!highestAssignment.started && !currentAssignment.started) {
          return highest;
        }
        // If only one exam has a score, choose that one
        if (!highestAssignment.started) return current;
        if (!currentAssignment.started) return highest;
        // If both have scores, compare percentages
        return currentAssignment.grade.percentage > highestAssignment.grade.percentage
          ? current
          : highest;
      }, exams[0]);

      console.log(
        `Highest scoring exam for category ${categoryId}:`,
        JSON.stringify(highestScoringExamEntry.assignment)
      );

      // Mark all exams except the highest-scoring one for removal
      exams.forEach((examEntry) => {
        if (examEntry !== highestScoringExamEntry) {
          indicesToRemove.add(examEntry.index);
        }
      });
    }
  });

  // Remove the exams marked for removal, preserving order
  transformedAssignments = transformedAssignments.filter(
    (assignment, index) => !indicesToRemove.has(index)
  );

  console.log(
    'Total assignments after exam filtering:',
    transformedAssignments.length
  );

  // Now filter based on section
  transformedAssignments = transformedAssignments.filter((assignment) => {
    return !assignment.section || assignment.section === studentSection;
  });

  console.log(
    'Total assignments after section filtering:',
    transformedAssignments.length
  );

  return {
    studentInfo: {
      name: studentData.info[0] || '',
      username: studentData.info[1] || '',
      Section: studentSection,
      studentCode: studentData.info[3] || '',
    },
    assignments: transformedAssignments,
    categories: categories,
    categoryTotals: (studentData.categoryTotals || []).map(
      (category, index) => {
        const earnedPoints = parseFloat(category[3]) || 0;
        const totalPoints = parseFloat(category[7]) || 0;
        const percentage =
          totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

        return {
          categoryId: categories[index] ? categories[index].id : null,
          name: categories[index] ? categories[index].name : '',
          earnedPoints: isNaN(earnedPoints) ? 0 : earnedPoints,
          totalPoints: isNaN(totalPoints) ? 0 : totalPoints,
          weightedTotal: parseFloat(category[6]) || 0,
          weight:
            categories[index] ? parseFloat(categories[index].weight) || 0 : 0,
          percentage: isNaN(percentage)
            ? 0
            : parseFloat(percentage.toFixed(2)),
        };
      }
    ),
    totals: {
      weightedTotal: parseFloat(studentData.totals[1]) || 0,
      earnedPoints: parseFloat(studentData.totals[3]) || 0,
      totalPoints: parseFloat(studentData.totals[7]) || 0,
      percentage: parseFloat(
        (
          ((parseFloat(studentData.totals[3]) || 0) /
            (parseFloat(studentData.totals[7]) || 1)) *
          100
        ).toFixed(2)
      ),
    },
    metadata: {
      userId: studentData.metadata[0] || '',
      isLocked: studentData.metadata[1] === '1',
      hasUserImage: !!studentData.metadata[2],
      hasGradebookComment: !!studentData.metadata[3],
    },
  };
};




const transformCategories = (categoriesData) => {
  return categoriesData.map(category => ({
    id: category[1] || null,
    name: category[0] || '',
    weight: category[11] || '0'
  }));
};

const updateGradebookData = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Check for the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
    return res.status(401).send('Invalid or missing API key');
  }

  try {
    const data = req.body;
    console.log('Received gradebook data:', JSON.stringify(data));

    // Validate required fields
    if (!data.studentEmail || !data.LMSStudentID || !data.LMSCourseID || !data.SharePointStudentID) {
      throw new Error('studentEmail, LMSStudentID, LMSCourseID, and SharePointStudentID are required');
    }

    const sanitizedEmail = sanitizeEmail(data.studentEmail);
    const db = admin.database();
    const studentRef = db.ref(`students/${sanitizedEmail}`);
    const courseRef = studentRef.child(`courses/${data.LMSCourseID}`);
    const gradebookRef = courseRef.child('jsonGradebook');
    const sectionRef = courseRef.child('section');
    const globalSectionsRef = db.ref('courses/sections');

    // Process and transform the gradebook data
    const processedData = processGradebookData(data);
    const transformedData = transformGradebookData(processedData.headers, processedData.student);

    // Extract section from student info
    const studentSection = processedData.student.info[2] || '';

    // Prepare the new gradebook data
    const newGradebookData = {
      lmsStudentId: processedData.LMSStudentID,
      sharePointStudentId: processedData.SharePointStudentID,
      gradebook: transformedData,
      lastChecked: admin.database.ServerValue.TIMESTAMP
    };

    // Get the current gradebook data, section, and global sections
    const [currentGradebookSnapshot, currentSectionSnapshot, globalSectionsSnapshot] = await Promise.all([
      gradebookRef.once('value'),
      sectionRef.once('value'),
      globalSectionsRef.once('value')
    ]);
    
    const currentGradebookData = currentGradebookSnapshot.val();
    const currentSection = currentSectionSnapshot.val();
    const globalSections = globalSectionsSnapshot.val() || {};

    // Track if we need to make any updates
    let updates = {};
    let globalSectionUpdates = {};
    let changesMade = false;

    // Check if gradebook data has changed
    if (!currentGradebookData || isGradebookChanged(currentGradebookData, newGradebookData)) {
      newGradebookData.lastUpdated = admin.database.ServerValue.TIMESTAMP;
      updates['jsonGradebook'] = newGradebookData;
      changesMade = true;
    } else {
      // No changes to gradebook, just update the lastChecked timestamp
      updates['jsonGradebook/lastChecked'] = admin.database.ServerValue.TIMESTAMP;
    }

    // Check if section has changed and needs to be updated in student's course data
    if (studentSection && studentSection !== currentSection) {
      updates['section'] = studentSection;
      changesMade = true;

      // Check if section needs to be added to global sections
      if (studentSection && !globalSections[studentSection]) {
        console.log(`Adding new section ${studentSection} to global sections`);
        globalSectionUpdates[studentSection] = true;
      }
    }

    // Apply updates if there are any changes
    const updatePromises = [];

    if (Object.keys(updates).length > 0) {
      updatePromises.push(courseRef.update(updates));
    }

    if (Object.keys(globalSectionUpdates).length > 0) {
      updatePromises.push(globalSectionsRef.update(globalSectionUpdates));
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      
      const message = changesMade 
        ? `Data updated successfully for student ${sanitizedEmail} in course ${data.LMSCourseID}`
        : `No significant changes detected for student ${sanitizedEmail} in course ${data.LMSCourseID}`;
      
      res.status(200).send(message);
    } else {
      res.status(200).send(`No changes required for student ${sanitizedEmail} in course ${data.LMSCourseID}`);
    }

  } catch (error) {
    console.error('Error updating gradebook data:', error);
    
    // Log the error to the errorLogs/updateGradebookData node
    const errorLogRef = admin.database().ref('errorLogs/updateGradebookData').push();
    const errorLog = {
      timestamp: admin.database.ServerValue.TIMESTAMP,
      error: error.message,
      stack: error.stack,
      studentId: req.body.studentEmail ? sanitizeEmail(req.body.studentEmail) : null,
      courseId: req.body.LMSCourseID,
      jsonGradebookSnapshot: req.body
    };
    await errorLogRef.set(errorLog);

    res.status(500).send('Internal Server Error: ' + error.message);
  }
});

const isGradebookChanged = (current, newData) => {
  const excludeFields = ['lastChecked', 'lastUpdated'];
  const stripTimestamps = obj => {
    const stripped = { ...obj };
    excludeFields.forEach(field => delete stripped[field]);
    return stripped;
  };
  return !_.isEqual(stripTimestamps(current), stripTimestamps(newData));
};



/**
 * Cloud Function: addGradebookIndex
 *
 * Creates the Gradebook index in the courses node so that schedule can be easily matched with the gradebook JSON.
 */
const addGradebookIndex = functions.database.ref('/courses/{courseId}/units')
  .onWrite((change, context) => {
    const units = change.after.val();
    if (!units) return null;

    let gradebookIndex = 0;
    const updatedUnits = units.map(unit => {
      unit.items = unit.items.map(item => {
        if (['lesson', 'assignment', 'exam'].includes(item.type)) {
          item.gradebookIndex = gradebookIndex++;
        }
        return item;
      });
      return unit;
    });

    return admin.database().ref(`/courses/${context.params.courseId}/units`).set(updatedUnits);
  });

  

/**
 * Cloud Function: updateJsonGradebookSchedule
 *
 * Whenever there is an update to the jsonGradebook node, it creates the jsonGradebookSchedule.
 */
const updateJsonGradebookSchedule = functions.database
  .ref('/students/{studentId}/courses/{courseId}/jsonGradebook')
  .onWrite(async (change, context) => {
    const studentId = context.params.studentId;
    const courseId = context.params.courseId;

    try {
      // Get the updated jsonGradebook data
      const jsonGradebook = change.after.val();

      if (!jsonGradebook) {
        throw new Error('jsonGradebook is null or undefined');
      }

      // Access the gradebook data
      const gradebook = jsonGradebook.gradebook;

      if (!gradebook) {
        throw new Error('gradebook is undefined in jsonGradebook');
      }

      // Check if ScheduleJSON exists
      const scheduleSnap = await admin
        .database()
        .ref(`/students/${studentId}/courses/${courseId}/ScheduleJSON`)
        .once('value');
      const scheduleJSON = scheduleSnap.val();

      if (!scheduleJSON) {
        throw new Error(
          'ScheduleJSON does not exist for this student and course.'
        );
      }

      // Perform the gradebook item count check
      const assignments = gradebook.assignments;

      if (!assignments) {
        throw new Error('assignments is undefined in gradebook');
      }

      const gradebookItemCount = assignments.length;
      const maxGradebookIndex = getMaxGradebookIndex(scheduleJSON);

      if (gradebookItemCount <= maxGradebookIndex) {
        throw new Error(
          `Mismatch in gradebook items: Gradebook has ${gradebookItemCount} items, but max index in schedule is ${maxGradebookIndex}`
        );
      }

      // Combine the data
      const combinedData = combineGradebookAndSchedule(
        gradebook,
        scheduleJSON
      );

      // Calculate schedule adherence metrics
      const adherenceMetrics = calculateAdherenceMetrics(combinedData);

      // Add adherence metrics to the combined data
      const finalData = {
        ...combinedData,
        adherenceMetrics,
      };

      // Write the combined data to the new node
      await admin
        .database()
        .ref(
          `/students/${studentId}/courses/${courseId}/jsonGradebookSchedule`
        )
        .set(finalData);

      // Retrieve the student's autoStatus property
      const studentCourseRef = admin
        .database()
        .ref(`/students/${studentId}/courses/${courseId}`);
      const studentCourseSnap = await studentCourseRef.once('value');
      const studentCourseData = studentCourseSnap.val();

      // Check if autoStatus is not false or doesn't exist
      if (studentCourseData.autoStatus !== false) {
        // Determine the new Status based on lessonsBehind
        let newStatus = '';
        const lessonsBehind = adherenceMetrics.lessonsBehind;

        if (lessonsBehind < -1) {
          newStatus = 'Rocking it!';
        } else if (lessonsBehind >= -1 && lessonsBehind < 2) {
          newStatus = 'On Track';
        } else if (lessonsBehind >= 2) {
          newStatus = 'Behind';
        }

        // Get the previous status from Status/Value
        const previousStatus =
          (studentCourseData.Status && studentCourseData.Status.Value) || '';

        // Update the Status/Value and AutoStatusUpdateDate
        await studentCourseRef.update({
          'Status/Value': newStatus,
          AutoStatusUpdateDate: new Date().toISOString(),
        });

        // Create a new log entry in statusLog
        await studentCourseRef.child('statusLog').push({
          timestamp: new Date().toISOString(),
          status: newStatus,
          previousStatus: previousStatus,
          updatedBy: 'autoStatus',
          lessonsBehind: lessonsBehind,
          adherenceMetrics: adherenceMetrics,
        });
      }

      console.log(
        `Successfully updated jsonGradebookSchedule and Status for student ${studentId} in course ${courseId}`
      );
      return null;
    } catch (error) {
      console.error(`Error updating jsonGradebookSchedule: ${error.message}`);

      // Log the error with more details
      await admin
        .database()
        .ref('errorLogs/combineGradebookAndSchedule')
        .push({
          studentId,
          courseId,
          error: error.message,
          stack: error.stack,
          jsonGradebookSnapshot: change.after.val(),
          timestamp: admin.database.ServerValue.TIMESTAMP,
        });

      return null;
    }
  });

// Utility functions remain the same...

function getMaxGradebookIndex(scheduleJSON) {
  let maxIndex = -1;
  scheduleJSON.units.forEach((unit) => {
    unit.items.forEach((item) => {
      if (
        item.gradebookIndex !== undefined &&
        item.gradebookIndex > maxIndex
      ) {
        maxIndex = item.gradebookIndex;
      }
    });
  });
  return maxIndex;
}

function combineGradebookAndSchedule(gradebook, scheduleJSON) {
  const assignments = gradebook.assignments;

  if (!assignments) {
    throw new Error('assignments is undefined in gradebook');
  }

  const combinedUnits = scheduleJSON.units.map((unit) => {
    if (!unit.items) {
      throw new Error(`items is undefined in unit: ${unit.name}`);
    }

    return {
      ...unit,
      items: unit.items.map((item) => {
        if (item.gradebookIndex !== undefined) {
          const assignment = assignments[item.gradebookIndex];

          // Check if the assignment exists
          if (assignment) {
            return {
              ...item,
              gradebookData: assignment,
            };
          } else {
            console.warn(
              `No assignment found at index ${item.gradebookIndex} for item: ${item.title}`
            );
            return {
              ...item,
              gradebookData: null,
            };
          }
        }
        return item;
      }),
    };
  });

  return {
    ...scheduleJSON,
    units: combinedUnits,
    studentInfo: gradebook.studentInfo,
    categoryTotals: gradebook.categoryTotals,
    overallTotals: gradebook.totals,
    metadata: {
      lastUpdated: admin.database.ServerValue.TIMESTAMP,
    },
  };
}

function calculateAdherenceMetrics(combinedData) {
  const currentDate = new Date();
  let lastStartedIndex = -1;
  let currentAssignmentIndex = -1;

  // Flatten all items into a single array to maintain order
  let allItems = [];
  combinedData.units.forEach((unit) => {
    unit.items.forEach((item) => {
      if (item.gradebookIndex !== undefined) {
        allItems.push(item);
      }
    });
  });

  // Sort the items based on their gradebookIndex to ensure correct order
  allItems.sort((a, b) => a.gradebookIndex - b.gradebookIndex);

  // Iterate over all items to find the last started assignment
  for (let i = 0; i < allItems.length; i++) {
    const item = allItems[i];
    const itemDate = new Date(item.date);

    // Update lastStartedIndex if the assignment is started
    if (item.gradebookData && item.gradebookData.started) {
      lastStartedIndex = i;
    }

    // Update currentAssignmentIndex if the item's date is today or earlier
    if (itemDate <= currentDate) {
      currentAssignmentIndex = i;
    }
  }

  // Increment lastStartedIndex by 1
  lastStartedIndex++;

  // Calculate the difference in assignments
  const lessonsBehind = currentAssignmentIndex - lastStartedIndex;
  const isOnTrack = lastStartedIndex >= currentAssignmentIndex;

  return {
    isOnTrack,
    lessonsBehind, // Positive means behind, negative means ahead
    currentAssignmentIndex,
    lastStartedIndex,
  };
}



const updateJsonGradebookScheduleOnScheduleChange = functions.database
  .ref('/students/{studentId}/courses/{courseId}/ScheduleJSON')
  .onWrite(async (change, context) => {
    const { studentId, courseId } = context.params;

    // Get the updated ScheduleJSON data
    const newScheduleJSON = change.after.val();

    if (!newScheduleJSON) {
      console.log('ScheduleJSON was deleted, no update needed.');
      return null;
    }

    try {
      // Get the current jsonGradebookSchedule
      const jsonGradebookScheduleRef = admin.database()
        .ref(`/students/${studentId}/courses/${courseId}/jsonGradebookSchedule`);
      const jsonGradebookScheduleSnapshot = await jsonGradebookScheduleRef.once('value');
      let jsonGradebookSchedule = jsonGradebookScheduleSnapshot.val();

      // If jsonGradebookSchedule doesn't exist, log it and exit
      if (!jsonGradebookSchedule) {
        console.log(`jsonGradebookSchedule does not exist for student ${studentId} in course ${courseId}. No update performed.`);
        return null;
      }

      // Update only the schedule-related fields in jsonGradebookSchedule
      jsonGradebookSchedule.units = newScheduleJSON.units.map(unit => ({
        ...unit,
        items: unit.items.map(item => {
          const existingItem = jsonGradebookSchedule.units
            .flatMap(u => u.items || [])
            .find(i => i.gradebookIndex === item.gradebookIndex);

          return {
            ...existingItem,
            date: item.date,
            gradebookIndex: item.gradebookIndex,
            multiplier: item.multiplier,
            sequence: item.sequence,
            title: item.title,
            type: item.type
          };
        })
      }));

      // Update the metadata
      jsonGradebookSchedule.metadata = {
        ...jsonGradebookSchedule.metadata,
        lastUpdated: admin.database.ServerValue.TIMESTAMP
      };

      // Remove any undefined values
      const cleanObject = (obj) => {
        Object.keys(obj).forEach(key => {
          if (obj[key] && typeof obj[key] === 'object') cleanObject(obj[key]);
          else if (obj[key] === undefined) delete obj[key];
        });
        return obj;
      };

      const cleanedJsonGradebookSchedule = cleanObject(jsonGradebookSchedule);

      // Write the updated jsonGradebookSchedule back to the database
      await jsonGradebookScheduleRef.set(cleanedJsonGradebookSchedule);

      console.log(`Successfully updated jsonGradebookSchedule for student ${studentId} in course ${courseId}`);

      // Trigger the updateJsonGradebookSchedule function by updating the jsonGradebook node
      const jsonGradebookRef = admin.database()
        .ref(`/students/${studentId}/courses/${courseId}/jsonGradebook`);

      // Update the lastChecked field to trigger the onWrite event
      await jsonGradebookRef.update({
        lastChecked: admin.database.ServerValue.TIMESTAMP
      });

      console.log(`Triggered updateJsonGradebookSchedule for student ${studentId} in course ${courseId}`);

      return null;
    } catch (error) {
      console.error(`Error updating jsonGradebookSchedule: ${error.message}`);

      // Log the error with more details, excluding scheduleJSONSnapshot
      await admin.database().ref('errorLogs/updateJsonGradebookScheduleOnScheduleChange').push({
        studentId,
        courseId,
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP
      });

      return null;
    }
  });


module.exports = {
  updateGradebookData,
  addGradebookIndex,
  updateJsonGradebookSchedule,
  updateJsonGradebookScheduleOnScheduleChange,
};