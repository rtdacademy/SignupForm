import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  getDatabase,
  ref as dbRef,
  get,
  onValue,
  off
} from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { getAlbertaCourseById as getAlbertaCourse } from '../../config/albertaCourses';

/**
 * Main hook for portfolio operations
 * Handles all CRUD operations for portfolio structure and entries
 */
export const usePortfolio = (familyId, studentId, schoolYear) => {
  const { user } = useAuth();
  const [portfolioMetadata, setPortfolioMetadata] = useState(null);
  const [portfolioStructure, setPortfolioStructure] = useState([]);
  const [portfolioEntries, setPortfolioEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStructureId, setSelectedStructureId] = useState(null);

  const db = getFirestore();
  const storage = getStorage();
  
  // Track if Alberta courses sync is in progress to prevent duplicates
  const isSyncingRef = useRef(false);
  const lastSyncKey = useRef(null);

  // Portfolio paths
  const portfolioPath = `portfolios/${familyId}/${studentId}`;
  const metadataPath = `${portfolioPath}/metadata`;
  const structurePath = `${portfolioPath}/structure`;
  const entriesPath = `${portfolioPath}/entries`;

  // Subscribe to portfolio metadata changes in real-time
  useEffect(() => {
    if (!familyId || !studentId || !user) {
      setLoading(false);
      return;
    }

    const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
    
    // Set up real-time listener for metadata
    const unsubscribe = onSnapshot(
      metadataRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          setPortfolioMetadata(docSnap.data());
        } else {
          // Initialize new portfolio metadata if it doesn't exist
          const newMetadata = {
            studentId,
            familyId,
            schoolYear: schoolYear || new Date().getFullYear(),
            createdAt: serverTimestamp(),
            lastModified: serverTimestamp(),
            portfolioType: 'custom', // or 'alberta-courses'
            totalEntries: 0,
            totalFiles: 0,
            starterCourseDeleted: false,
            hasArchivedItems: false
          };
          
          try {
            await setDoc(metadataRef, newMetadata);
            setPortfolioMetadata(newMetadata);
          } catch (err) {
            console.error('Error creating portfolio metadata:', err);
            setError(err.message);
          }
        }
      },
      (err) => {
        console.error('Error subscribing to portfolio metadata:', err);
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [familyId, studentId, schoolYear, user]);

  // Subscribe to portfolio structure changes
  useEffect(() => {
    if (!familyId || !studentId) return;

    // Use structure subcollection under familyId, filtered by studentId
    // We'll filter out archived items in the client since Firestore's != doesn't match missing fields
    const structureRef = collection(db, 'portfolios', familyId, 'structure');
    const q = query(
      structureRef, 
      where('studentId', '==', studentId),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const structures = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Filter out archived items (isArchived === true)
          // Include items where isArchived is false or undefined (for backward compatibility)
          if (data.isArchived !== true) {
            structures.push({
              id: doc.id,
              ...data
            });
          }
        });
        setPortfolioStructure(structures);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading portfolio structure:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [familyId, studentId]);

  // Auto-sync Alberta courses from SOLO plan
  useEffect(() => {
    if (!familyId || !studentId || !schoolYear || !user) return;

    const syncKey = `${familyId}-${studentId}-${schoolYear}`;
    
    // Skip if we already synced for this combination or sync is in progress
    if (lastSyncKey.current === syncKey || isSyncingRef.current) {
      return;
    }

    const syncAlbertaCourses = async () => {
      console.log(`Starting Alberta course sync for ${syncKey}`);
      isSyncingRef.current = true;
      lastSyncKey.current = syncKey;
      
      try {
        // Load selected Alberta courses from SOLO plan
        const db = getDatabase();
        const coursesRef = dbRef(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${studentId}/selectedAlbertaCourses`);
        const snapshot = await get(coursesRef);
        
        if (snapshot.exists()) {
          const selectedCourses = snapshot.val();
          console.log('Found SOLO plan courses:', selectedCourses);
          const firestore = getFirestore();
          const batch = writeBatch(firestore);
          
          // Get existing Alberta course structures for this school year
          const structureRef = collection(firestore, 'portfolios', familyId, 'structure');
          const existingQuery = query(
            structureRef,
            where('studentId', '==', studentId),
            where('isAlbertaCourse', '==', true),
            where('schoolYear', '==', schoolYear)
          );
          const existingSnapshot = await getDocs(existingQuery);
          const existingCourseIds = new Set();
          const existingCourseDocs = new Map(); // Store doc refs for archiving
          
          existingSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.albertaCourseId) {
              existingCourseIds.add(data.albertaCourseId);
              existingCourseDocs.set(data.albertaCourseId, { ref: doc.ref, data });
            }
          });
          
          // Build set of currently selected course IDs
          const currentlySelectedIds = new Set();
          for (const courseIds of Object.values(selectedCourses)) {
            courseIds.forEach(id => currentlySelectedIds.add(id));
          }
          
          // Process selected courses - add new ones or restore archived ones
          let order = 0;
          let coursesToAdd = 0;
          let coursesToRestore = 0;
          
          for (const [subjectKey, courseIds] of Object.entries(selectedCourses)) {
            for (const courseId of courseIds) {
              // Check if course exists and might be archived
              if (existingCourseDocs.has(courseId)) {
                const courseDoc = existingCourseDocs.get(courseId);
                if (courseDoc.data.isArchived) {
                  // Restore archived course
                  batch.update(courseDoc.ref, {
                    isArchived: false,
                    archivedAt: null,
                    archivedReason: null,
                    restoredAt: serverTimestamp(),
                    restoredBy: user.uid
                  });
                  coursesToRestore++;
                  console.log(`Restoring archived Alberta course: ${courseId}`);
                }
                continue; // Skip if already exists and not archived
              }
              
              const courseInfo = getAlbertaCourse(courseId);
              if (!courseInfo) {
                console.warn(`Course info not found for ${courseId}, skipping`);
                continue;
              }
              
              coursesToAdd++;
              
              const newStructureRef = doc(collection(firestore, 'portfolios', familyId, 'structure'));
              
              batch.set(newStructureRef, {
                id: newStructureRef.id,
                studentId: studentId,
                schoolYear: schoolYear, // Add school year to track
                type: 'course',
                parentId: null,
                title: courseInfo.name,
                description: courseInfo.description,
                courseCode: courseInfo.code,
                albertaCourseId: courseId,
                isAlbertaCourse: true,
                isArchived: false,  // Important: explicitly set to false
                subject: subjectKey,
                order: order++,
                icon: getIconForSubject(subjectKey),
                color: getSubjectColor(subjectKey),
                createdAt: serverTimestamp(),
                createdBy: user.uid,
                tags: {}
              });
            }
          }
          
          // Archive courses that are no longer in the SOLO plan
          let coursesToArchive = 0;
          for (const [courseId, courseDoc] of existingCourseDocs) {
            if (!currentlySelectedIds.has(courseId) && !courseDoc.data.isArchived) {
              batch.update(courseDoc.ref, {
                isArchived: true,
                archivedAt: serverTimestamp(),
                archivedBy: user.uid,
                archivedReason: 'Removed from Program Plan'
              });
              coursesToArchive++;
              console.log(`Archiving Alberta course removed from plan: ${courseId}`);
            }
          }
          
          // Commit batch if there are any changes
          if (coursesToAdd > 0 || coursesToRestore > 0 || coursesToArchive > 0) {
            await batch.commit();
            console.log(`Sync complete: Added ${coursesToAdd}, Restored ${coursesToRestore}, Archived ${coursesToArchive} Alberta courses`);
            
            // Update metadata if items were archived
            if (coursesToArchive > 0) {
              const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
              await updateDoc(metadataRef, {
                hasArchivedItems: true,
                lastModified: serverTimestamp()
              });
            }
          } else {
            console.log('No Alberta course changes to sync');
          }
        } else {
          console.log('No SOLO plan data found for student');
        }
      } catch (err) {
        console.error('Error syncing Alberta courses:', err);
      } finally {
        isSyncingRef.current = false;
      }
    };

    syncAlbertaCourses();
  }, [familyId, studentId, schoolYear, user]);
  
  // Listen for real-time changes to SOLO plan and re-sync
  useEffect(() => {
    if (!familyId || !studentId || !schoolYear || !user) return;
    
    const database = getDatabase();
    const soloCoursesRef = dbRef(database, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${studentId}/selectedAlbertaCourses`);
    
    // Set up listener for changes
    const unsubscribe = onValue(soloCoursesRef, (snapshot) => {
      // Reset sync key to force re-sync when data changes
      const syncKey = `${familyId}-${studentId}-${schoolYear}`;
      if (lastSyncKey.current === syncKey) {
        console.log('SOLO plan courses changed, triggering re-sync');
        lastSyncKey.current = null; // Reset to allow re-sync
        
        // Small delay to batch multiple rapid changes
        setTimeout(() => {
          const reSyncAlbertaCourses = async () => {
            if (isSyncingRef.current) return;
            
            console.log('Re-syncing Alberta courses after SOLO plan change');
            isSyncingRef.current = true;
            
            try {
              const selectedCourses = snapshot.val() || {};
              const firestore = getFirestore();
              const batch = writeBatch(firestore);
              
              // Get existing Alberta course structures
              const structureRef = collection(firestore, 'portfolios', familyId, 'structure');
              const existingQuery = query(
                structureRef,
                where('studentId', '==', studentId),
                where('isAlbertaCourse', '==', true),
                where('schoolYear', '==', schoolYear)
              );
              const existingSnapshot = await getDocs(existingQuery);
              const existingCourseDocs = new Map();
              
              existingSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.albertaCourseId) {
                  existingCourseDocs.set(data.albertaCourseId, { ref: doc.ref, data });
                }
              });
              
              // Build set of currently selected course IDs
              const currentlySelectedIds = new Set();
              for (const courseIds of Object.values(selectedCourses)) {
                if (Array.isArray(courseIds)) {
                  courseIds.forEach(id => currentlySelectedIds.add(id));
                }
              }
              
              let coursesToAdd = 0;
              let coursesToRestore = 0;
              let coursesToArchive = 0;
              
              // Add new courses or restore archived ones
              let order = 0;
              for (const [subjectKey, courseIds] of Object.entries(selectedCourses)) {
                if (!Array.isArray(courseIds)) continue;
                
                for (const courseId of courseIds) {
                  if (existingCourseDocs.has(courseId)) {
                    const courseDoc = existingCourseDocs.get(courseId);
                    if (courseDoc.data.isArchived) {
                      batch.update(courseDoc.ref, {
                        isArchived: false,
                        archivedAt: null,
                        archivedReason: null,
                        restoredAt: serverTimestamp(),
                        restoredBy: user.uid
                      });
                      coursesToRestore++;
                    }
                  } else {
                    // Add new course
                    const courseInfo = getAlbertaCourse(courseId);
                    if (courseInfo) {
                      const newStructureRef = doc(collection(firestore, 'portfolios', familyId, 'structure'));
                      batch.set(newStructureRef, {
                        id: newStructureRef.id,
                        studentId: studentId,
                        schoolYear: schoolYear,
                        type: 'course',
                        parentId: null,
                        title: courseInfo.name,
                        description: courseInfo.description,
                        courseCode: courseInfo.code,
                        albertaCourseId: courseId,
                        isAlbertaCourse: true,
                        isArchived: false,
                        subject: subjectKey,
                        order: order++,
                        icon: getIconForSubject(subjectKey),
                        color: getSubjectColor(subjectKey),
                        createdAt: serverTimestamp(),
                        createdBy: user.uid,
                        tags: {}
                      });
                      coursesToAdd++;
                    }
                  }
                }
              }
              
              // Archive courses no longer selected
              for (const [courseId, courseDoc] of existingCourseDocs) {
                if (!currentlySelectedIds.has(courseId) && !courseDoc.data.isArchived) {
                  batch.update(courseDoc.ref, {
                    isArchived: true,
                    archivedAt: serverTimestamp(),
                    archivedBy: user.uid,
                    archivedReason: 'Removed from Program Plan'
                  });
                  coursesToArchive++;
                }
              }
              
              if (coursesToAdd > 0 || coursesToRestore > 0 || coursesToArchive > 0) {
                await batch.commit();
                console.log(`Real-time sync: Added ${coursesToAdd}, Restored ${coursesToRestore}, Archived ${coursesToArchive}`);
                
                // Update metadata if items were archived or restored
                if (coursesToArchive > 0 || coursesToRestore > 0) {
                  const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
                  await updateDoc(metadataRef, {
                    hasArchivedItems: coursesToArchive > 0 ? true : undefined,
                    lastModified: serverTimestamp()
                  });
                }
              }
              
              lastSyncKey.current = syncKey; // Mark as synced again
            } catch (err) {
              console.error('Error in real-time Alberta course sync:', err);
            } finally {
              isSyncingRef.current = false;
            }
          };
          
          reSyncAlbertaCourses();
        }, 1000); // 1 second delay to batch changes
      }
    });
    
    // Cleanup listener on unmount
    return () => {
      off(soloCoursesRef);
    };
  }, [familyId, studentId, schoolYear, user]);
  
  // Create starter course for empty portfolios (only if no Alberta courses exist)
  useEffect(() => {
    if (!familyId || !studentId || !user || loading) return;
    if (!portfolioMetadata || portfolioMetadata.starterCourseDeleted) return;
    
    // Check if portfolio is empty (no structures)
    if (portfolioStructure.length === 0) {
      // Small delay to allow Alberta course sync to complete first
      const timer = setTimeout(async () => {
        try {
          // Check the database directly to see if any structures exist now
          const firestore = getFirestore();
          const structureRef = collection(firestore, 'portfolios', familyId, 'structure');
          const structureQuery = query(
            structureRef,
            where('studentId', '==', studentId),
            where('isArchived', '!=', true)
          );
          const snapshot = await getDocs(structureQuery);
          
          // Only create starter course if still empty
          if (snapshot.empty) {
            const newStructureRef = doc(collection(firestore, 'portfolios', familyId, 'structure'));
            
            await setDoc(newStructureRef, {
              id: newStructureRef.id,
              studentId: studentId,
              schoolYear: schoolYear,
              type: 'course',
              parentId: null,
              title: 'My First Course',
              description: 'Welcome to your portfolio! Start by adding your learning experiences here.',
              isStarterCourse: true,
              isArchived: false,
              order: 0,
              icon: 'BookOpen',
              color: '#8B5CF6', // Purple
              createdAt: serverTimestamp(),
              createdBy: user.uid,
              tags: {}
            });
            
            console.log('Created starter course for new portfolio');
          } else {
            console.log('Skipping starter course - structures already exist');
          }
        } catch (err) {
          console.error('Error creating starter course:', err);
        }
      }, 3000); // Wait 3 seconds for Alberta course sync to complete
      
      return () => clearTimeout(timer);
    }
  }, [familyId, studentId, schoolYear, user, portfolioStructure, portfolioMetadata, loading]);

  // Subscribe to portfolio entries for selected structure
  useEffect(() => {
    if (!familyId || !studentId || !selectedStructureId) {
      console.log('Portfolio entries subscription skipped:', { familyId, studentId, selectedStructureId });
      return;
    }

    console.log('Setting up portfolio entries subscription:', {
      familyId,
      studentId,
      selectedStructureId
    });

    // Use entries subcollection under familyId, filtered by both studentId and structureId
    const entriesRef = collection(db, 'portfolios', familyId, 'entries');

    // Try a simpler query first to check if the compound index is the issue
    const q = query(
      entriesRef,
      where('structureId', '==', selectedStructureId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('Firestore query snapshot received:', {
          size: snapshot.size,
          empty: snapshot.empty,
          selectedStructureId,
          studentId
        });

        const entries = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Entry found:', {
            id: doc.id,
            structureId: data.structureId,
            studentId: data.studentId,
            title: data.title
          });

          // Only include entries for the current student
          if (data.studentId === studentId) {
            entries.push({
              id: doc.id,
              ...data
            });
          }
        });
        console.log(`Loaded ${entries.length} entries for structure ${selectedStructureId}`);
        setPortfolioEntries(entries);
      },
      (err) => {
        console.error('Error loading portfolio entries:', err);
        console.error('Query details:', {
          familyId,
          studentId,
          selectedStructureId
        });
        setError(err.message);
      }
    );

    return () => unsubscribe();
  }, [familyId, studentId, selectedStructureId]);

  // Create new structure item (course/module/lesson)
  const createStructureItem = useCallback(async (structureData) => {
    try {
      const structureRef = doc(collection(db, 'portfolios', familyId, 'structure'));
      
      const newStructure = {
        ...structureData,
        id: structureRef.id,
        studentId, // Add studentId to the document
        isArchived: false,  // Ensure new items are not archived by default
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        order: structureData.order || portfolioStructure.length
      };

      await setDoc(structureRef, newStructure);
      
      // Update metadata
      const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
      await updateDoc(metadataRef, {
        lastModified: serverTimestamp()
      });

      return structureRef.id;
    } catch (err) {
      console.error('Error creating structure item:', err);
      throw err;
    }
  }, [familyId, studentId, user, portfolioStructure]);

  // Update structure item
  const updateStructureItem = useCallback(async (structureId, updates) => {
    try {
      const structureRef = doc(db, 'portfolios', familyId, 'structure', structureId);
      
      await updateDoc(structureRef, {
        ...updates,
        lastModified: serverTimestamp()
      });

      // Update metadata
      const metadataRef = doc(db, 'portfolios', familyId, studentId, 'info', 'metadata');
      await updateDoc(metadataRef, {
        lastModified: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating structure item:', err);
      throw err;
    }
  }, [familyId, studentId]);

  // Archive structure item instead of deleting
  const deleteStructureItem = useCallback(async (structureId) => {
    try {
      // Check if item is an Alberta course (prevent archiving)
      const structureRef = doc(db, 'portfolios', familyId, 'structure', structureId);
      const structureDoc = await getDoc(structureRef);
      
      if (structureDoc.exists()) {
        const data = structureDoc.data();
        
        if (data.isAlbertaCourse) {
          console.warn('Cannot archive Alberta course. Remove it from SOLO plan instead.');
          throw new Error('Alberta courses cannot be archived. Please remove them from the SOLO Education Plan.');
        }
        
        // Archive instead of delete
        await updateDoc(structureRef, {
          isArchived: true,
          archivedAt: serverTimestamp(),
          archivedBy: user.uid
        });
        
        // If this was the starter course, mark it as deleted in metadata
        if (data.isStarterCourse) {
          const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
          await updateDoc(metadataRef, {
            starterCourseDeleted: true,
            hasArchivedItems: true,
            lastModified: serverTimestamp()
          });
        } else {
          // Just update metadata for regular items
          const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
          await updateDoc(metadataRef, {
            hasArchivedItems: true,
            lastModified: serverTimestamp()
          });
        }
        
        console.log('Archived structure item:', structureId);
      }
    } catch (err) {
      console.error('Error archiving structure item:', err);
      throw err;
    }
  }, [familyId, studentId, user]);
  
  // Restore archived structure item
  const restoreStructureItem = useCallback(async (structureId) => {
    try {
      const structureRef = doc(db, 'portfolios', familyId, 'structure', structureId);
      
      await updateDoc(structureRef, {
        isArchived: false,
        archivedAt: null,
        archivedBy: null,
        archivedReason: null,
        restoredAt: serverTimestamp(),
        restoredBy: user.uid
      });
      
      // Check if there are any remaining archived items
      const structureCollectionRef = collection(db, 'portfolios', familyId, 'structure');
      const archivedQuery = query(
        structureCollectionRef,
        where('studentId', '==', studentId),
        where('isArchived', '==', true)
      );
      const archivedSnapshot = await getDocs(archivedQuery);
      
      // Update metadata with correct hasArchivedItems status
      const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
      await updateDoc(metadataRef, {
        hasArchivedItems: !archivedSnapshot.empty,
        lastModified: serverTimestamp()
      });
      
      console.log('Restored structure item:', structureId);
    } catch (err) {
      console.error('Error restoring structure item:', err);
      throw err;
    }
  }, [familyId, studentId, user]);
  
  // Get archived structure items
  const getArchivedStructure = useCallback(async () => {
    try {
      const structureRef = collection(db, 'portfolios', familyId, 'structure');
      // Remove orderBy to avoid issues with missing fields
      const q = query(
        structureRef, 
        where('studentId', '==', studentId),
        where('isArchived', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const archivedItems = [];
      snapshot.forEach((doc) => {
        archivedItems.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort on client side, with fallback for missing archivedAt
      archivedItems.sort((a, b) => {
        const aTime = a.archivedAt?.seconds || 0;
        const bTime = b.archivedAt?.seconds || 0;
        return bTime - aTime; // Most recent first
      });
      
      console.log(`Found ${archivedItems.length} archived items`);
      return archivedItems;
    } catch (err) {
      console.error('Error loading archived items:', err);
      return [];
    }
  }, [familyId, studentId]);

  // Create new portfolio entry
  const createPortfolioEntry = useCallback(async (entryData, files = []) => {
    try {
      const entryRef = doc(collection(db, 'portfolios', familyId, 'entries'));
      
      // Upload files if provided
      const uploadedFiles = await uploadFiles(files, entryRef.id);
      
      const newEntry = {
        ...entryData,
        id: entryRef.id,
        studentId: studentId,
        files: uploadedFiles,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        lastModified: serverTimestamp(),
        order: entryData.order || portfolioEntries.length
      };

      await setDoc(entryRef, newEntry);
      
      // Update metadata
      const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
      await updateDoc(metadataRef, {
        lastModified: serverTimestamp(),
        totalEntries: (portfolioMetadata?.totalEntries || 0) + 1,
        totalFiles: (portfolioMetadata?.totalFiles || 0) + uploadedFiles.length
      });

      return entryRef.id;
    } catch (err) {
      console.error('Error creating portfolio entry:', err);
      throw err;
    }
  }, [familyId, studentId, user, portfolioEntries, portfolioMetadata]);

  // Update portfolio entry
  const updatePortfolioEntry = useCallback(async (entryId, updates, newFiles = []) => {
    try {
      const entryRef = doc(db, 'portfolios', familyId, 'entries', entryId);
      
      // Upload new files if provided
      const uploadedFiles = newFiles.length > 0 ? await uploadFiles(newFiles, entryId) : [];
      
      const updateData = {
        ...updates,
        lastModified: serverTimestamp()
      };
      
      if (uploadedFiles.length > 0) {
        const currentEntry = portfolioEntries.find(e => e.id === entryId);
        updateData.files = [...(currentEntry?.files || []), ...uploadedFiles];
      }

      await updateDoc(entryRef, updateData);
      
      // Update metadata
      const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
      await updateDoc(metadataRef, {
        lastModified: serverTimestamp(),
        totalFiles: (portfolioMetadata?.totalFiles || 0) + uploadedFiles.length
      });
    } catch (err) {
      console.error('Error updating portfolio entry:', err);
      throw err;
    }
  }, [familyId, studentId, portfolioEntries, portfolioMetadata]);

  // Delete portfolio entry
  const deletePortfolioEntry = useCallback(async (entryId) => {
    try {
      const entry = portfolioEntries.find(e => e.id === entryId);
      
      // Delete associated files from storage
      if (entry?.files?.length > 0) {
        for (const file of entry.files) {
          await deleteFile(file.url);
        }
      }
      
      // Delete the entry
      const entryRef = doc(db, 'portfolios', familyId, 'entries', entryId);
      await deleteDoc(entryRef);
      
      // Update metadata
      const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
      await updateDoc(metadataRef, {
        lastModified: serverTimestamp(),
        totalEntries: Math.max(0, (portfolioMetadata?.totalEntries || 1) - 1),
        totalFiles: Math.max(0, (portfolioMetadata?.totalFiles || 0) - (entry?.files?.length || 0))
      });
    } catch (err) {
      console.error('Error deleting portfolio entry:', err);
      throw err;
    }
  }, [familyId, studentId, portfolioEntries, portfolioMetadata]);

  // Upload files to cloud storage
  const uploadFiles = async (files, entryId) => {
    const uploadPromises = files.map(async (file) => {
      const fileName = `${Date.now()}_${file.name}`;
      const storagePath = `portfolios/${familyId}/${studentId}/${entryId}/${fileName}`;
      const storageRefPath = storageRef(storage, storagePath);
      
      const snapshot = await uploadBytes(storageRefPath, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        path: storagePath
      };
    });

    return Promise.all(uploadPromises);
  };

  // Delete file from storage
  const deleteFile = async (fileUrl) => {
    try {
      const fileRef = storageRef(storage, fileUrl);
      await deleteObject(fileRef);
    } catch (err) {
      console.error('Error deleting file:', err);
      // Continue even if file deletion fails
    }
  };

  // Reorder structure items
  const reorderStructure = useCallback(async (reorderedItems) => {
    try {
      const batch = writeBatch(db);
      
      reorderedItems.forEach((item, index) => {
        const structureRef = doc(db, 'portfolios', familyId, 'structure', item.id);
        batch.update(structureRef, { order: index });
      });
      
      await batch.commit();
    } catch (err) {
      console.error('Error reordering structure:', err);
      throw err;
    }
  }, [familyId, studentId]);

  // Get structure hierarchy (for nested view)
  const getStructureHierarchy = useCallback(() => {
    const buildHierarchy = (parentId = null) => {
      return portfolioStructure
        .filter(item => item.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map(item => ({
          ...item,
          children: buildHierarchy(item.id)
        }));
    };
    
    return buildHierarchy();
  }, [portfolioStructure]);

  // Generate portfolio from Alberta courses
  const generateFromAlbertaCourses = useCallback(async (selectedCourses, soloplanData) => {
    try {
      const batch = writeBatch(db);
      let order = 0;
      
      // Create structure for each selected course
      for (const [subjectKey, courseIds] of Object.entries(selectedCourses)) {
        for (const courseId of courseIds) {
          const courseInfo = getAlbertaCourse(courseId);
          if (courseInfo) {
            const structureRef = doc(collection(db, 'portfolios', familyId, 'structure'));
            batch.set(structureRef, {
              id: structureRef.id,
              studentId: studentId,
              type: 'course',
              parentId: null,
              title: courseInfo.name,
              description: courseInfo.description,
              courseCode: courseInfo.code,
              isArchived: false,  // Important: explicitly set to false
              order: order++,
              icon: '📚',
              color: getSubjectColor(subjectKey),
              createdAt: serverTimestamp(),
              createdBy: user.uid,
              tags: {
                activities: soloplanData?.activitiesAndMethods || [],
                assessments: soloplanData?.assessmentMethods || [],
                resources: soloplanData?.resourcesAndMaterials || []
              }
            });
          }
        }
      }
      
      await batch.commit();
      
      // Update metadata to indicate Alberta courses portfolio
      const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
      await updateDoc(metadataRef, {
        portfolioType: 'alberta-courses',
        lastModified: serverTimestamp()
      });
    } catch (err) {
      console.error('Error generating from Alberta courses:', err);
      throw err;
    }
  }, [familyId, studentId, user]);

  // Helper function to get subject colors
  const getSubjectColor = (subject) => {
    const colors = {
      english_language_arts: '#3B82F6', // Blue
      mathematics: '#EF4444', // Red
      science: '#10B981', // Green
      social_studies: '#F59E0B', // Amber
      physical_education: '#8B5CF6', // Purple
      career_life_management: '#EC4899', // Pink
      career_technology_studies: '#14B8A6' // Teal
    };
    return colors[subject] || '#6B7280'; // Default gray
  };

  // Comment operations
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Subscribe to comments for selected entry
  const loadComments = useCallback(async (entryId) => {
    if (!entryId) {
      setComments([]);
      return;
    }

    setLoadingComments(true);
    try {
      const commentsRef = collection(db, 'portfolios', familyId, 'comments');
      const q = query(
        commentsRef,
        where('entryId', '==', entryId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const commentsList = [];
          snapshot.forEach((doc) => {
            commentsList.push({
              id: doc.id,
              ...doc.data()
            });
          });
          setComments(commentsList);
          setLoadingComments(false);
        },
        (err) => {
          console.error('Error loading comments:', err);
          setLoadingComments(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up comments listener:', err);
      setLoadingComments(false);
    }
  }, [familyId]);

  // Create a new comment
  const createComment = useCallback(async (commentData) => {
    try {
      const commentRef = doc(collection(db, 'portfolios', familyId, 'comments'));
      
      const newComment = {
        ...commentData,
        id: commentRef.id,
        authorEmail: user.email,
        authorName: user.displayName || user.email,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        edited: false
      };

      await setDoc(commentRef, newComment);
      
      // Update entry's comment count
      if (commentData.entryId) {
        const entryRef = doc(db, 'portfolios', familyId, 'entries', commentData.entryId);
        const entryDoc = await getDoc(entryRef);
        if (entryDoc.exists()) {
          const currentCount = entryDoc.data().commentCount || 0;
          await updateDoc(entryRef, {
            commentCount: currentCount + 1,
            lastCommentAt: serverTimestamp()
          });
        }
      }

      return commentRef.id;
    } catch (err) {
      console.error('Error creating comment:', err);
      throw err;
    }
  }, [familyId, user]);

  // Update a comment
  const updateComment = useCallback(async (commentId, updates) => {
    try {
      const commentRef = doc(db, 'portfolios', familyId, 'comments', commentId);
      
      await updateDoc(commentRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        edited: true,
        editedBy: user.uid,
        editedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  }, [familyId, user]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId, entryId) => {
    try {
      const commentRef = doc(db, 'portfolios', familyId, 'comments', commentId);
      await deleteDoc(commentRef);
      
      // Update entry's comment count
      if (entryId) {
        const entryRef = doc(db, 'portfolios', familyId, 'entries', entryId);
        const entryDoc = await getDoc(entryRef);
        if (entryDoc.exists()) {
          const currentCount = entryDoc.data().commentCount || 1;
          await updateDoc(entryRef, {
            commentCount: Math.max(0, currentCount - 1)
          });
        }
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  }, [familyId]);

  // Get comment count for an entry
  const getCommentCount = useCallback(async (entryId) => {
    try {
      const commentsRef = collection(db, 'portfolios', familyId, 'comments');
      const q = query(commentsRef, where('entryId', '==', entryId));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (err) {
      console.error('Error getting comment count:', err);
      return 0;
    }
  }, [familyId]);

  // Quick add entry (simplified version)
  const createQuickEntry = useCallback(async (entryData, files = []) => {
    try {
      // This is a simplified version of createPortfolioEntry
      const entryRef = doc(collection(db, 'portfolios', familyId, 'entries'));
      
      // Upload files if provided
      const uploadedFiles = await uploadFiles(files, entryRef.id);
      
      const newEntry = {
        ...entryData,
        id: entryRef.id,
        studentId: studentId,
        files: uploadedFiles,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        lastModified: serverTimestamp(),
        quickAdd: true, // Mark as quick-add entry
        order: entryData.order || portfolioEntries.length,
        commentCount: 0
      };

      await setDoc(entryRef, newEntry);
      
      // Update metadata
      const metadataRef = doc(db, 'portfolios', familyId, 'metadata', studentId);
      await updateDoc(metadataRef, {
        lastModified: serverTimestamp(),
        totalEntries: (portfolioMetadata?.totalEntries || 0) + 1,
        totalFiles: (portfolioMetadata?.totalFiles || 0) + uploadedFiles.length
      });

      return entryRef.id;
    } catch (err) {
      console.error('Error creating quick entry:', err);
      throw err;
    }
  }, [familyId, studentId, user, portfolioEntries, portfolioMetadata, uploadFiles]);

  return {
    // State
    portfolioMetadata,
    portfolioStructure,
    portfolioEntries,
    loading,
    error,
    selectedStructureId,
    comments,
    loadingComments,
    
    // Actions
    setSelectedStructureId,
    createStructureItem,
    updateStructureItem,
    deleteStructureItem,
    restoreStructureItem,
    getArchivedStructure,
    createPortfolioEntry,
    updatePortfolioEntry,
    deletePortfolioEntry,
    reorderStructure,
    getStructureHierarchy,
    generateFromAlbertaCourses,
    createQuickEntry,
    
    // Comment operations
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    getCommentCount,
    
    // Utilities
    uploadFiles
  };
};

// Hook for SOLO plan integration
export const useSOLOIntegration = (familyId, studentId, schoolYear) => {
  const [soloplanData, setSOLOPlanData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId || !studentId || !schoolYear) {
      setLoading(false);
      return;
    }

    const loadSOLOPlan = async () => {
      try {
        const db = getDatabase();
        const soloRef = dbRef(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${schoolYear.replace('/', '_')}/${studentId}`);
        const snapshot = await get(soloRef);
        
        if (snapshot.exists()) {
          setSOLOPlanData(snapshot.val());
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading SOLO plan:', err);
        setLoading(false);
      }
    };

    loadSOLOPlan();
  }, [familyId, studentId, schoolYear]);

  // Get tag suggestions based on content
  const getTagSuggestions = useCallback((content, type = 'all') => {
    if (!soloplanData || !content) return [];
    
    const suggestions = {
      activities: [],
      assessments: [],
      resources: []
    };
    
    // Simple keyword matching for demonstration
    // This could be enhanced with more sophisticated NLP
    const contentLower = content.toLowerCase();
    
    if (type === 'all' || type === 'activities') {
      soloplanData.activitiesAndMethods?.forEach(activity => {
        const description = soloplanData.activityDescriptions?.[activity] || '';
        if (description.toLowerCase().includes(contentLower) || 
            activity.includes(contentLower)) {
          suggestions.activities.push(activity);
        }
      });
    }
    
    if (type === 'all' || type === 'assessments') {
      soloplanData.assessmentMethods?.forEach(assessment => {
        const description = soloplanData.assessmentDescriptions?.[assessment] || '';
        if (description.toLowerCase().includes(contentLower) || 
            assessment.includes(contentLower)) {
          suggestions.assessments.push(assessment);
        }
      });
    }
    
    if (type === 'all' || type === 'resources') {
      soloplanData.resourcesAndMaterials?.forEach(resource => {
        const description = soloplanData.resourceDescriptions?.[resource] || '';
        if (description.toLowerCase().includes(contentLower) || 
            resource.includes(contentLower)) {
          suggestions.resources.push(resource);
        }
      });
    }
    
    return suggestions;
  }, [soloplanData]);

  return {
    soloplanData,
    loading,
    getTagSuggestions,
    activities: soloplanData?.activitiesAndMethods || [],
    assessments: soloplanData?.assessmentMethods || [],
    resources: soloplanData?.resourcesAndMaterials || [],
    activityDescriptions: soloplanData?.activityDescriptions || {},
    assessmentDescriptions: soloplanData?.assessmentDescriptions || {},
    resourceDescriptions: soloplanData?.resourceDescriptions || {},
    customActivities: soloplanData?.customActivities || [],
    customAssessments: soloplanData?.customAssessments || [],
    customResources: soloplanData?.customResources || []
  };
};

// Icon mapping for subjects and structure types
export const getIconForSubject = (subject) => {
  const iconMap = {
    english_language_arts: 'BookOpen',
    mathematics: 'Calculator',
    science: 'Beaker',
    social_studies: 'Globe',
    physical_education: 'Activity',
    career_life_management: 'Briefcase',
    career_technology_studies: 'Wrench',
    // Default structure type icons
    course: 'GraduationCap',
    subject: 'BookOpen',
    module: 'Folder',
    lesson: 'FileText',
    topic: 'Hash'
  };
  return iconMap[subject] || 'Folder';
};

