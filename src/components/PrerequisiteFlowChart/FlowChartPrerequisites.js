import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState, 
  useEdgesState,
  Panel,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getStraightPath,
  useNodes,
  useReactFlow
} from '@xyflow/react';
import { getSmartEdge, svgDrawStraightLinePath } from '@tisoap/react-flow-smart-edge';
import '@xyflow/react/dist/style.css';
import { 
  courseData, 
  getAllCourses, 
  getCourseById, 
  subjectColors, 
  streamInfo,
  specialNotes 
} from './courseData';

// Add custom CSS for slide-in animation
const slideInKeyframes = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
`;

// Insert the CSS into the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = slideInKeyframes;
  document.head.appendChild(style);
}

// Custom Course Node Component
const CourseNode = ({ data, selected }) => {
  const course = data.course;
  const subject = data.subject;
  const colors = subjectColors[subject] || subjectColors.mathematics;
  const stream = streamInfo[course.stream] || streamInfo.academic;

  const nodeStyle = {
    backgroundColor: selected ? colors.primary : colors.light,
    borderColor: colors.primary,
    color: selected ? 'white' : '#1F2937',
    borderWidth: '2px',
    borderStyle: 'solid'
  };

  const handleMoreInfo = (e) => {
    e.stopPropagation();
    data.onMoreInfo(course);
  };

  return (
    <div 
      className="px-4 py-3 rounded-lg shadow-lg transition-all duration-200 relative"
      style={{
        ...nodeStyle,
        width: '220px',
        height: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      {/* Input handles for prerequisites */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: colors.primary }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{ background: colors.primary, top: '60%' }}
      />
      
      {/* More Info Button */}
      <button
        onClick={handleMoreInfo}
        className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md"
        title="More Information"
      >
        i
      </button>
      
      <div className="text-center">
        <div className="font-bold text-sm mb-1">{course.code}</div>
        <div className="text-xs opacity-90 mb-1 leading-tight">{course.name}</div>
        
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="flex items-center text-xs">
            <span className="mr-1">{stream.icon}</span>
            <span className="truncate">{stream.label}</span>
          </span>
          <span className="text-xs">{course.credits}cr</span>
        </div>
        
        {course.diplomaExam && (
          <div className="bg-red-500 text-white text-xs px-1 py-0.5 rounded mb-1">
            Diploma Exam
          </div>
        )}
        
        <div className="text-xs opacity-80 leading-tight line-clamp-2">{course.description}</div>
        
        {course.recommendedGrade && (
          <div className="text-xs mt-1 opacity-80">
            Rec: {course.recommendedGrade}%+
          </div>
        )}
      </div>
      
      {/* Output handles for next courses */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: colors.primary }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{ background: colors.primary, top: '60%' }}
      />
    </div>
  );
};

// Node types
const nodeTypes = {
  courseNode: CourseNode,
};

// Custom Orthogonal (Step/Manhattan) Edge Component
const CustomOrthogonalEdge = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition, 
  targetPosition, 
  style = {}, 
  markerEnd,
  sourceHandle,
  targetHandle
}) => {
  // Create orthogonal path (right angles only)
  const createOrthogonalPath = () => {
    // For non-standard pathways (right to left), create a different routing
    if (sourceHandle === 'right-source' && targetHandle === 'left-target') {
      // Go right from source, then curve around to approach target from left
      const offset = 50;
      const midX = Math.max(sourceX + offset, targetX - offset);
      return `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
    } else {
      // Standard left-to-right routing
      const midX = sourceX + (targetX - sourceX) * 0.5;
      return `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
    }
  };

  const pathString = createOrthogonalPath();

  return <BaseEdge path={pathString} markerEnd={markerEnd} style={style} />;
};

// Edge types - using custom orthogonal edges for clean right-angle routing
const edgeTypes = {
  orthogonal: CustomOrthogonalEdge,
};

const FlowChartPrerequisites = () => {
  const [activeSubject, setActiveSubject] = useState('mathematics');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [detailsCourse, setDetailsCourse] = useState(null);

  // Handle showing course details
  const handleMoreInfo = useCallback((course) => {
    setDetailsCourse(course);
    setShowCourseDetails(true);
  }, []);

  // Create nodes and edges from course data using grid positioning
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    
    // Grid configuration
    const gridConfig = {
      colWidth: 400,    // Width between columns (Grade 10, 11, 12, Post-12)
      rowHeight: 200,   // Height between rows (different pathways) - reduced from 300
      startX: 150,      // Left margin
      startY: 100,      // Top margin - consistent for single subject view
      subjectOffsetY: 0 // No offset when viewing single subject
    };
    
    // Position courses using grid system
    const subjectKeys = Object.keys(courseData);
    
    subjectKeys.forEach((subject, subjectIndex) => {
      const subjectCourses = courseData[subject];
      
      // Get all courses for this subject
      Object.values(subjectCourses).forEach(gradeLevel => {
        gradeLevel.forEach(course => {
          // Use gridPosition if available, otherwise fall back to old method
          if (course.gridPosition) {
            const x = gridConfig.startX + (course.gridPosition.col * gridConfig.colWidth);
            const y = gridConfig.startY + (subjectIndex * gridConfig.subjectOffsetY) + (course.gridPosition.row * gridConfig.rowHeight);
            
            nodes.push({
              id: course.id,
              type: 'courseNode',
              position: { x, y },
              data: { 
                course,
                subject,
                label: course.code,
                onMoreInfo: handleMoreInfo
              },
            });
          }
          
          // Create edges for prerequisites (standard pathways)
          if (course.prerequisites && course.prerequisites.length > 0) {
            course.prerequisites.forEach(prereqId => {
              edges.push({
                id: `${prereqId}-${course.id}`,
                source: prereqId,
                target: course.id,
                type: 'orthogonal',
                animated: false,
                style: {
                  stroke: subjectColors[subject]?.primary || '#3B82F6',
                  strokeWidth: 3,
                },
                markerEnd: {
                  type: 'arrowclosed',
                  color: subjectColors[subject]?.primary || '#3B82F6',
                  width: 20,
                  height: 20,
                },
              });
            });
          }

          // Create edges for non-standard pathways (dotted lines)
          if (course.nonStandardLeadsTo && course.nonStandardLeadsTo.length > 0) {
            course.nonStandardLeadsTo.forEach(nextId => {
              // All non-standard pathways should go from right side to left side
              const sourceHandle = 'right-source';
              const targetHandle = 'left-target';
              
              edges.push({
                id: `${course.id}-${nextId}-nonstandard`,
                source: course.id,
                target: nextId,
                sourceHandle,
                targetHandle,
                type: 'orthogonal',
                animated: false,
                style: {
                  stroke: subjectColors[subject]?.primary || '#3B82F6',
                  strokeWidth: 3,
                  strokeDasharray: '8,8', // Dotted line
                  opacity: 0.8,
                },
                markerEnd: {
                  type: 'arrowclosed',
                  color: subjectColors[subject]?.primary || '#3B82F6',
                  width: 20,
                  height: 20,
                },
              });
            });
          }
        });
      });
    });
    
    return { initialNodes: nodes, initialEdges: edges };
  }, [handleMoreInfo, activeSubject]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useRef(null);

  // Filter nodes and edges based on selected subject
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const subject = node.data.subject;
      return subject === activeSubject;
    });
  }, [nodes, activeSubject]);

  const filteredEdges = useMemo(() => {
    let edgesToShow = edges;
    
    // Filter by subject
    const visibleNodeIds = new Set(filteredNodes.map(node => node.id));
    edgesToShow = edgesToShow.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
    
    // Only show non-standard (dotted) edges when a course is selected
    edgesToShow = edgesToShow.filter(edge => {
      const isNonStandard = edge.id.includes('-nonstandard');
      
      if (isNonStandard) {
        // Only show non-standard edges if:
        // 1. A course is selected AND
        // 2. The edge involves the selected course (either as source or target)
        return selectedNode && (
          edge.source === selectedNode.id || 
          edge.target === selectedNode.id
        );
      }
      
      // Always show standard edges
      return true;
    });
    
    return edgesToShow;
  }, [edges, filteredNodes, activeSubject, selectedNode]);

  // Effect to fit view when subject changes
  useEffect(() => {
    if (reactFlowInstance.current) {
      // Small delay to allow nodes to update
      setTimeout(() => {
        reactFlowInstance.current.fitView({
          padding: 0.3,
          duration: 500
        });
      }, 100);
    }
  }, [activeSubject, filteredNodes]);

  // Handle node clicks
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    
    // Highlight connected nodes
    const connectedNodeIds = new Set([node.id]);
    const nodeEdges = edges.filter(edge => 
      edge.source === node.id || edge.target === node.id
    );
    
    nodeEdges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    // Update edges to highlight connections
    setEdges(edges => 
      edges.map(edge => ({
        ...edge,
        animated: connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target),
        style: {
          ...edge.style,
          strokeWidth: connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target) ? 3 : 2,
          opacity: connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target) ? 1 : 0.3,
        }
      }))
    );

    // Update nodes to highlight connections
    setNodes(nodes => 
      nodes.map(n => ({
        ...n,
        style: {
          ...n.style,
          opacity: connectedNodeIds.has(n.id) ? 1 : 0.3,
        }
      }))
    );
  }, [edges, setEdges, setNodes]);

  // Clear selection
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    
    // Reset all nodes and edges to normal
    setNodes(nodes => 
      nodes.map(node => ({
        ...node,
        style: { ...node.style, opacity: 1 }
      }))
    );
    
    setEdges(edges => 
      edges.map(edge => ({
        ...edge,
        animated: false,
        style: { ...edge.style, strokeWidth: 2, opacity: 1 }
      }))
    );
  }, [setNodes, setEdges]);

  // Subject Tabs Component (for larger screens)
  const SubjectTabs = () => (
    <div className="hidden md:flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {Object.entries(subjectColors).map(([subject, colors]) => (
        <button
          key={subject}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeSubject === subject 
              ? 'bg-white shadow-sm text-gray-900' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => setActiveSubject(subject)}
        >
          {subject.charAt(0).toUpperCase() + subject.slice(1).replace(/([A-Z])/g, ' $1')}
        </button>
      ))}
    </div>
  );

  // Subject Select Component (for smaller screens)
  const SubjectSelect = () => (
    <div className="md:hidden">
      <select
        value={activeSubject}
        onChange={(e) => setActiveSubject(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        {Object.entries(subjectColors).map(([subject, colors]) => (
          <option key={subject} value={subject}>
            {subject.charAt(0).toUpperCase() + subject.slice(1).replace(/([A-Z])/g, ' $1')}
          </option>
        ))}
      </select>
    </div>
  );

  // Course Details Panel (simplified, less intrusive)
  const CourseDetailsPanel = () => {
    if (!selectedNode) return null;

    const course = selectedNode.data.course;
    const subject = selectedNode.data.subject;

    // Get prerequisites and next courses
    const prerequisites = course.prerequisites ? 
      course.prerequisites.map(id => getCourseById(id)).filter(Boolean) : [];
    const nextCourses = getAllCourses().filter(c => 
      c.prerequisites && c.prerequisites.includes(course.id)
    );

    const handleMoreInfoClick = () => {
      setDetailsCourse(course);
      setShowCourseDetails(true);
    };

    return (
      <div className="fixed right-4 bottom-4 bg-white rounded-lg shadow-lg p-4 max-w-sm text-sm z-50">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-gray-800 text-base">{course.code}</h3>
          <button
            onClick={() => setSelectedNode(null)}
            className="text-gray-500 hover:text-gray-700 text-lg leading-none ml-2"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-2">
          <p className="text-gray-600 text-xs">{course.description}</p>
          
          <div className="flex justify-between text-xs">
            <span><strong>Credits:</strong> {course.credits}</span>
            <span><strong>Grade:</strong> {course.grade}</span>
            {course.diplomaExam && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">Diploma Exam</span>
            )}
          </div>
          
          {prerequisites.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-700 text-xs mb-1">Prerequisites:</h4>
              <div className="flex flex-wrap gap-1">
                {prerequisites.map(prereq => (
                  <span key={prereq.id} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                    {prereq.code}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {nextCourses.length > 0 && (
            <div>
              <h4 className="font-semibold text-green-700 text-xs mb-1">Opens pathway to:</h4>
              <div className="flex flex-wrap gap-1">
                {nextCourses.map(next => (
                  <span key={next.id} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {next.code}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* More Info Button */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={handleMoreInfoClick}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <span className="bg-white bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                i
              </span>
              More Info & Career Pathways
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Detailed Course Information Sheet
  const CourseDetailsSheet = () => {
    if (!showCourseDetails || !detailsCourse) return null;

    const course = detailsCourse;
    const subject = Object.keys(courseData).find(subj => 
      Object.values(courseData[subj]).some(gradeLevel => 
        gradeLevel.some(c => c.id === course.id)
      )
    );
    const colors = subjectColors[subject] || subjectColors.mathematics;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
        onClick={() => setShowCourseDetails(false)}
      >
        <div 
          className="bg-white shadow-2xl w-full md:w-[80%] h-full overflow-hidden animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{course.code}</h2>
              <p className="text-lg text-gray-600">{course.name}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span>{course.credits} credits</span>
                <span>Grade {course.grade}</span>
                <span style={{ color: colors.primary }}>
                  {streamInfo[course.stream]?.icon} {streamInfo[course.stream]?.label}
                </span>
                {course.diplomaExam && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                    Diploma Exam Required
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowCourseDetails(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-120px)]">
            {/* Course Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Description</h3>
              <p className="text-gray-700">{course.description}</p>
              {course.detailedInfo?.importance && (
                <p className="text-gray-600 mt-2 italic">{course.detailedInfo.importance}</p>
              )}
            </div>

            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Prerequisites</h3>
                <div className="flex flex-wrap gap-2">
                  {course.prerequisites.map(prereqId => {
                    const prereq = getCourseById(prereqId);
                    return prereq ? (
                      <span key={prereqId} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        {prereq.code}
                      </span>
                    ) : null;
                  })}
                </div>
                {course.recommendedGrade && (
                  <p className="text-sm text-gray-600 mt-2">
                    Recommended: {course.recommendedGrade}% or higher in prerequisite courses
                  </p>
                )}
              </div>
            )}

            {/* Skills Developed */}
            {course.detailedInfo?.skills && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills You'll Develop</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {course.detailedInfo.skills.map((skill, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Pathways */}
            {course.careerPathways && course.careerPathways.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Pathways</h3>
                <p className="text-gray-600 mb-3">This course opens doors to careers in:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {course.careerPathways.map((career, index) => (
                    <div key={index} className="bg-purple-50 text-purple-800 px-3 py-2 rounded-lg text-sm">
                      {career}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* University Programs */}
            {course.universityPrograms && course.universityPrograms.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">University Programs</h3>
                <p className="text-gray-600 mb-3">This course is typically required or recommended for:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {course.universityPrograms.map((program, index) => (
                    <div key={index} className="bg-blue-50 text-blue-800 px-3 py-2 rounded-lg text-sm">
                      {program}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {course.leadsTo && course.leadsTo.length > 0 ? (
                  <div>
                    <p className="text-gray-700 mb-2">After completing this course, you can take:</p>
                    <div className="flex flex-wrap gap-2">
                      {course.leadsTo.map(nextId => {
                        const nextCourse = getCourseById(nextId);
                        return nextCourse ? (
                          <span key={nextId} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {nextCourse.code}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">
                    This is a fianl course in this pathway. You're ready for post-secondary studies or the workforce!
                  </p>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {!course.careerPathways && !course.universityPrograms && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Detailed career and university pathway information is being updated for this course. 
                  Please consult with your guidance counselor for specific program requirements.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="w-full h-screen bg-gray-50">
      {/* Header with Tabs */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm border-b p-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Alberta Education Prerequisite Flow Chart
          </h1>
          <p className="text-gray-600 text-sm mb-3">
            Interactive flow chart showing course prerequisites and pathways
          </p>
          
          {/* Subject Selection - Tabs for large screens, Select for small screens */}
          <div className="flex justify-center">
            <SubjectTabs />
          </div>
          <div className="flex justify-center">
            <SubjectSelect />
          </div>
        </div>
      </div>

      {/* Main Flow Chart */}
      <div className="pt-32 h-full">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={(instance) => {
            reactFlowInstance.current = instance;
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{
            padding: 0.3,
            minZoom: 0.4,
            maxZoom: 1.5
          }}
          defaultZoom={0.6}
          attributionPosition="bottom-right"
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background color="#f3f4f6" />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              const subject = node.data.subject;
              return subjectColors[subject]?.primary || '#3B82F6';
            }}
            className="bg-white"
          />
          
          {/* Panels */}
          <CourseDetailsPanel />
        </ReactFlow>
      </div>

      {/* Course Details Sheet Modal */}
      <CourseDetailsSheet />
    </div>
  );
};

export default FlowChartPrerequisites;