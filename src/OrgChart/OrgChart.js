import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  Panel,
  ReactFlowProvider,
  Handle,
  Position,
  NodeResizer
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getDatabase, ref, get, set } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast, Toaster } from 'sonner';
import {
  FaUserTie,
  FaUsersCog,
  FaChalkboardTeacher,
  FaCode,
  FaPalette,
  FaChartLine,
  FaHandshake,
  FaTools,
  FaMobile,
  FaGlobe,
  FaShieldAlt,
  FaFileAlt,
  FaBullseye,
  FaMoneyBillWave,
  FaBox,
  FaUsers,
  FaCogs,
  FaUserGraduate
} from 'react-icons/fa';
import { Button } from "../components/ui/button";
import {
  Lock,
  Unlock,
  PlusCircle,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean']
  ]
};

const formats = [
  'bold',
  'italic',
  'underline',
  'list',
  'bullet',
  'link'
];

const iconOptions = [
  { Icon: FaUserTie, label: 'Executive' },
  { Icon: FaUsersCog, label: 'Manager' },
  { Icon: FaChalkboardTeacher, label: 'Teacher' },
  { Icon: FaCode, label: 'Developer' },
  { Icon: FaPalette, label: 'Designer' },
  { Icon: FaChartLine, label: 'Analyst' },
  { Icon: FaHandshake, label: 'HR' },
  { Icon: FaTools, label: 'Support' },
  { Icon: FaMobile, label: 'Mobile Dev' },
  { Icon: FaGlobe, label: 'Web Dev' },
  { Icon: FaShieldAlt, label: 'Security' },
  { Icon: FaFileAlt, label: 'Content' },
  { Icon: FaBullseye, label: 'Marketing' },
  { Icon: FaMoneyBillWave, label: 'Finance' },
  { Icon: FaBox, label: 'Product' },
  { Icon: FaUsers, label: 'Team Lead' },
  { Icon: FaCogs, label: 'Operations' },
  { Icon: FaUserGraduate, label: 'Training' }
];

// Color options for node styling
const colorOptions = [
  { label: 'Teal', value: 'teal' },
  { label: 'Blue', value: 'blue' },
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Purple', value: 'purple' },
  { label: 'Orange', value: 'orange' },
];

// Function to map color values to CSS classes
const getColorClasses = (color) => {
  const colorMap = {
    teal: 'border-teal-500 bg-teal-50',
    blue: 'border-blue-500 bg-blue-50',
    red: 'border-red-500 bg-red-50',
    green: 'border-green-500 bg-green-50',
    purple: 'border-purple-500 bg-purple-50',
    orange: 'border-orange-500 bg-orange-50',
  };
  return colorMap[color] || 'border-stone-400 bg-white';
};

// CourseBadge Component
function CourseBadge({ title, isTeacher, isLead }) {
  const getBadgeColor = () => {
    if (isTeacher) {
      return isLead ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRole = () => {
    if (isTeacher) {
      return isLead ? 'Lead' : 'Teacher';
    }
    return 'Support';
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor()} mr-1 mb-1`}>
      <span className="max-w-[100px] truncate">{title}</span>
      <span className="ml-1 opacity-75">({getRole()})</span>
    </span>
  );
}

function CustomNode({ data, selected }) {
  const [value, setValue] = useState(data?.label || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [courses, setCourses] = useState([]);
  const db = getDatabase();

  // Current icon component - updated logic
  const CurrentIcon = iconOptions.find(opt => opt.label === data.iconLabel)?.Icon || FaUserTie;

  // Editor change handler
  const onDescriptionChange = (content) => {
    setDescription(content);
    data.onChangeDescription && data.onChangeDescription(content);
  };

  const [description, setDescription] = useState(data?.description || '');

  const handleDoubleClick = (e) => {
    if (data.isLocked) {
      e.preventDefault();
      return;
    }
    setIsEditing(!isEditing);
  };

  // Load staff and courses data
  useEffect(() => {
    const loadData = async () => {
      // Load staff members
      const staffRef = ref(db, 'staff');
      const staffSnapshot = await get(staffRef);
      
      if (staffSnapshot.exists()) {
        const staffData = staffSnapshot.val();
        const staffList = Object.entries(staffData).map(([key, value]) => ({
          email_key: key,
          ...value
        })).filter(staff => staff.firstName && staff.lastName);
        
        setStaffMembers(staffList);
      }

      // Load courses
      const coursesRef = ref(db, 'courses');
      const coursesSnapshot = await get(coursesRef);
      
      if (coursesSnapshot.exists()) {
        const coursesData = coursesSnapshot.val();
        const coursesList = Object.entries(coursesData).map(([id, course]) => ({
          id,
          title: course.Title,
          teachers: course.Teachers || [],
          supportStaff: course.SupportStaff || []
        }));
        
        setCourses(coursesList);
      }
    };

    loadData();
  }, [db]);

  // Get staff member's courses
  const getStaffCourses = () => {
    if (!data.staffMember?.email_key) return [];

    return courses.map(course => ({
      ...course,
      role: {
        isTeacher: course.teachers.includes(data.staffMember.email_key),
        isLead: course.teachers[0] === data.staffMember.email_key,
        isSupport: course.supportStaff.includes(data.staffMember.email_key)
      }
    })).filter(course => course.role.isTeacher || course.role.isSupport);
  };

  const onChange = (evt) => {
    setValue(evt.target.value);
    data.onChangeLabel && data.onChangeLabel(evt.target.value);
  };

  const onColorChange = (evt) => {
    data.onChangeColor && data.onChangeColor(evt.target.value);
  };

  const onStaffSelect = (email_key) => {
    if (email_key === 'unassigned') {
      data.onChangeStaffMember && data.onChangeStaffMember(null);
    } else {
      const selectedMember = staffMembers.find(staff => staff.email_key === email_key);
      if (selectedMember) {
        data.onChangeStaffMember && data.onChangeStaffMember({
          email: selectedMember.email,
          email_key: selectedMember.email_key,
          firstName: selectedMember.firstName,
          lastName: selectedMember.lastName
        });
      }
    }
  };

  const getStaffDisplayName = () => {
    if (data.staffMember) {
      return `${data.staffMember.firstName} ${data.staffMember.lastName}`;
    }
    return 'Unassigned';
  };

  const getCurrentStaffValue = () => {
    return data.staffMember?.email_key || 'unassigned';
  };

  // Function to render description content based on lock state
  const renderDescription = () => {
    if (data.isLocked) {
      if (!data.description) return null;
    
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.description;
      const textContent = tempDiv.textContent || tempDiv.innerText;
      const isLongContent = textContent.length > 100;
    
      return (
        // Add 'nopan' and the onMouseDown handler here
        <div className="mt-2 nodrag nopan" onMouseDown={(e) => e.stopPropagation()}>
          <div className={`text-sm text-gray-600 ${!isExpanded && isLongContent ? 'line-clamp-2' : ''}`}>
            <div
              className="ql-editor p-0"
              style={{ padding: 0 }}
              dangerouslySetInnerHTML={{ __html: data.description }}
            />
          </div>
          {isLongContent && (
            <button
              className="text-sm text-blue-600 hover:text-blue-800 mt-1 flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      );
    }
    
    
  
    if (isEditing) {
      return (
        <div className="mt-2 min-h-[100px] nodrag">
          <ReactQuill
            theme="snow"
            value={description || ''}
            onChange={onDescriptionChange}
            modules={modules}
            formats={formats}
            className="bg-white/50 rounded"
          />
        </div>
      );
    }
  
    return null;
  };
  

  return (
    <div className="relative">
      {!data.isLocked && (
        <NodeResizer
          minWidth={200}
          maxWidth={600}
          isVisible={selected}
          onResize={(evt, { width }) => {
            data.onResizeNode && data.onResizeNode({ width, height: 'auto' });
          }}
        />
      )}
      <div
        className={`px-4 py-2 shadow-md rounded-md border-2 ${
          selected ? 'border-[3px]' : ''
        } ${getColorClasses(data.color)}`}
        onDoubleClick={handleDoubleClick}
        style={{ width: data.dimensions?.width || 600 }}
      >
        <div className="flex flex-col">
          <div className="flex">
            <div className="rounded-full w-12 h-12 flex justify-center items-center bg-white/50">
              <CurrentIcon size={24} className="text-gray-600" />
            </div>
            <div className="ml-2 flex-grow">
              <input
                className={`nodrag text-lg font-bold bg-transparent border-none focus:outline-none w-full ${data.isLocked ? 'cursor-not-allowed' : ''}`}
                value={value}
                onChange={onChange}
                placeholder="Position Title"
                readOnly={data.isLocked}
              />
              <div className="text-gray-500">{getStaffDisplayName()}</div>
              {data.staffMember && (
                <div className="text-gray-400 text-sm">{data.staffMember.email}</div>
              )}
            </div>
          </div>

          {/* Course badges */}
          {data.staffMember && getStaffCourses().length > 0 && (
            <div className="mt-2 flex flex-wrap">
              {getStaffCourses().map(course => (
                <CourseBadge
                  key={course.id}
                  title={course.title}
                  isTeacher={course.role.isTeacher}
                  isLead={course.role.isLead}
                />
              ))}
            </div>
          )}

          {/* Description - Rich text editor or rendered content */}
          {renderDescription()}

          {/* Settings panel - Only show when editing */}
          {isEditing && !data.isLocked && (
            <div className="mt-2 space-y-2">
              <Select onValueChange={onStaffSelect} value={getCurrentStaffValue()} disabled={data.isLocked}>
                <SelectTrigger className="nodrag w-full bg-white/50">
                  <SelectValue placeholder="Assign staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.email_key} value={staff.email_key}>
                      {staff.firstName} {staff.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                onValueChange={(value) => data.onChangeIcon && data.onChangeIcon(value)}
                value={data.iconLabel || 'Executive'}
                disabled={data.isLocked}
              >
                <SelectTrigger className="nodrag w-full bg-white/50">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.label} value={option.label}>
                      <div className="flex items-center gap-2">
                        <option.Icon size={16} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <select
                className={`nodrag w-full p-2 text-sm border rounded bg-white/50 ${data.isLocked ? 'cursor-not-allowed' : ''}`}
                value={data.color || 'teal'}
                onChange={onColorChange}
                disabled={data.isLocked}
              >
                {colorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <Handle
          type="target"
          position={Position.Top}
          className="!w-16 !h-1.5 !bg-blue-400"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-16 !h-1.5 !bg-blue-400"
        />
      </div>
    </div>
  );
}

const nodeTypes = { editableNode: CustomNode };
const getNodeId = () => `node_${+new Date()}`;

const initialNodes = [
  {
    id: '1',
    type: 'editableNode',
    position: { x: 0, y: -50 },
    data: {
      label: 'CEO',
      role: 'Chief Executive Officer',
      iconLabel: 'Executive',
      color: 'teal',
      description: 'Leadership and strategic direction',
      staffMember: null,
      isLocked: true,
      dimensions: { width: 300, height: 'auto' },
      onChangeLabel: (newLabel) => {},
      onChangeDescription: (newDesc) => {},
      onChangeColor: (newColor) => {},
      onChangeStaffMember: (staffMember) => {},
      onResizeNode: (dimensions) => {},
      onChangeIcon: (iconLabel) => {},
      staffMembers: [],
    },
  },
  {
    id: '2',
    type: 'editableNode',
    position: { x: -200, y: 100 },
    data: {
      label: 'Manager',
      role: 'Department Manager',
      iconLabel: 'Manager',
      color: 'blue',
      description: 'Team and project management',
      staffMember: null,
      isLocked: true,
      dimensions: { width: 300, height: 'auto' },
      onChangeLabel: (newLabel) => {},
      onChangeDescription: (newDesc) => {},
      onChangeColor: (newColor) => {},
      onChangeStaffMember: (staffMember) => {},
      onResizeNode: (dimensions) => {},
      onChangeIcon: (iconLabel) => {},
      staffMembers: [],
    },
  },
];

function OrgChartInner() {
  const { user, hasAdminAccess } = useAuth();
  const db = getDatabase();
  const { setViewport, getViewport } = useReactFlow();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [viewportState, setLocalViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialState, setInitialState] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [staffMembers, setStaffMembers] = useState([]);
  const [courses, setCourses] = useState([]);

  const canEdit = hasAdminAccess();

  useEffect(() => {
    if (!canEdit) {
      setIsLocked(true);
    }
  }, [canEdit]);

  const handleNodeResize = (nodeId, dimensions) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                dimensions,
              },
            }
          : node
      )
    );
  };

  const handleNodeIconChange = (nodeId, iconLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                iconLabel,
              },
            }
          : node
      )
    );
  };

  useEffect(() => {
    const loadStaffAndCourses = async () => {
      const staffRef = ref(db, 'staff');
      const staffSnapshot = await get(staffRef);
      
      if (staffSnapshot.exists()) {
        const staffData = staffSnapshot.val();
        const staffList = Object.entries(staffData).map(([key, value]) => ({
          email_key: key,
          ...value
        })).filter(staff => staff.firstName && staff.lastName);
        
        setStaffMembers(staffList);
      }

      const coursesRef = ref(db, 'courses');
      const coursesSnapshot = await get(coursesRef);
      
      if (coursesSnapshot.exists()) {
        const coursesData = coursesSnapshot.val();
        const coursesList = Object.entries(coursesData).map(([id, course]) => ({
          id,
          title: course.Title,
          teachers: course.Teachers || [],
          supportStaff: course.SupportStaff || []
        }));
        
        setCourses(coursesList);
      }
    };

    loadStaffAndCourses();
  }, [db]);

  useEffect(() => {
    const loadData = async () => {
      const snapshot = await get(ref(db, 'orgChart'));
      if (snapshot.exists()) {
        const { nodes: savedNodes = [], edges: savedEdges = [], viewport: savedViewport = { x: 0, y: 0, zoom: 1 } } = snapshot.val();

        const enrichedNodes = savedNodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isLocked: !canEdit || isLocked,
            staffMembers: staffMembers,
            onChangeLabel: canEdit ? (newLabel) => handleNodeLabelChange(node.id, newLabel) : undefined,
            onChangeDescription: canEdit ? (newDesc) => handleNodeDescriptionChange(node.id, newDesc) : undefined,
            onChangeColor: canEdit ? (newColor) => handleNodeColorChange(node.id, newColor) : undefined,
            onChangeStaffMember: canEdit ? (staffMember) => handleNodeStaffMemberChange(node.id, staffMember) : undefined,
            onResizeNode: canEdit ? (dimensions) => handleNodeResize(node.id, dimensions) : undefined,
            onChangeIcon: canEdit ? (iconLabel) => handleNodeIconChange(node.id, iconLabel) : undefined,
          },
        }));

        setNodes(enrichedNodes);
        setEdges(savedEdges);
        setLocalViewport(savedViewport);
        setViewport(savedViewport);
        setInitialState({
          nodes: savedNodes,
          edges: savedEdges,
          viewport: savedViewport
        });
        setHasUnsavedChanges(false);
      } else {
        const defaultState = {
          nodes: initialNodes.map(node => ({
            ...node,
            data: {
              ...node.data,
              isLocked: isLocked,
              staffMembers: staffMembers,
              onChangeLabel: canEdit ? (newLabel) => handleNodeLabelChange(node.id, newLabel) : undefined,
              onChangeDescription: canEdit ? (newDesc) => handleNodeDescriptionChange(node.id, newDesc) : undefined,
              onChangeColor: canEdit ? (newColor) => handleNodeColorChange(node.id, newColor) : undefined,
              onChangeStaffMember: canEdit ? (staffMember) => handleNodeStaffMemberChange(node.id, staffMember) : undefined,
              onResizeNode: canEdit ? (dimensions) => handleNodeResize(node.id, dimensions) : undefined,
              onChangeIcon: canEdit ? (iconLabel) => handleNodeIconChange(node.id, iconLabel) : undefined,
            },
          })),
          edges: [{ id: 'e1-2', source: '1', target: '2' }],
          viewport: { x: 0, y: 0, zoom: 1 }
        };
        setNodes(defaultState.nodes);
        setEdges(defaultState.edges);
        setLocalViewport(defaultState.viewport);
        setInitialState(defaultState);
        await saveToFirebase(defaultState.nodes, defaultState.edges, defaultState.viewport);
      }
    };

    loadData();
  }, [db, setViewport, staffMembers, canEdit, isLocked]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isLocked: !canEdit || isLocked,
          staffMembers: staffMembers,
          onChangeLabel: canEdit ? (newLabel) => handleNodeLabelChange(node.id, newLabel) : undefined,
          onChangeDescription: canEdit ? (newDesc) => handleNodeDescriptionChange(node.id, newDesc) : undefined,
          onChangeColor: canEdit ? (newColor) => handleNodeColorChange(node.id, newColor) : undefined,
          onChangeStaffMember: canEdit ? (staffMember) => handleNodeStaffMemberChange(node.id, staffMember) : undefined,
          onResizeNode: canEdit ? (dimensions) => handleNodeResize(node.id, dimensions) : undefined,
          onChangeIcon: canEdit ? (iconLabel) => handleNodeIconChange(node.id, iconLabel) : undefined,
        },
      }))
    );
  }, [isLocked, staffMembers, canEdit]);

  useEffect(() => {
    if (initialState) {
      const sanitizeNode = (node) => ({
        ...node,
        data: {
          label: node.data.label || '',
          description: node.data.description || '',
          color: node.data.color || 'teal',
          staffMember: node.data.staffMember || null,
          dimensions: node.data.dimensions || { width: 300, height: 'auto' },
          iconLabel: node.data.iconLabel || 'Executive',
        },
      });

      const currentNodes = nodes.map(sanitizeNode);
      const savedNodes = initialState.nodes.map(sanitizeNode);

      const currentStateString = JSON.stringify({
        nodes: currentNodes,
        edges: edges,
        viewport: viewportState
      });
      
      const savedStateString = JSON.stringify({
        nodes: savedNodes,
        edges: initialState.edges,
        viewport: initialState.viewport
      });

      setHasUnsavedChanges(currentStateString !== savedStateString);
    }
  }, [nodes, edges, viewportState, initialState]);

  const handleNodeLabelChange = (nodeId, newLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label: newLabel,
              },
            }
          : node
      )
    );
  };

  const handleNodeDescriptionChange = (nodeId, newDescription) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                description: newDescription,
              },
            }
          : node
      )
    );
  };

  const handleNodeColorChange = (nodeId, newColor) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                color: newColor,
              },
            }
          : node
      )
    );
  };

  const handleNodeStaffMemberChange = (nodeId, staffMember) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                staffMember,
              },
            }
          : node
      )
    );
  };

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);
        return updated.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isLocked: !canEdit || isLocked,
            staffMembers: staffMembers,
            onChangeLabel: canEdit ? (newLabel) => handleNodeLabelChange(node.id, newLabel) : undefined,
            onChangeDescription: canEdit ? (newDesc) => handleNodeDescriptionChange(node.id, newDesc) : undefined,
            onChangeColor: canEdit ? (newColor) => handleNodeColorChange(node.id, newColor) : undefined,
            onChangeStaffMember: canEdit ? (staffMember) => handleNodeStaffMemberChange(node.id, staffMember) : undefined,
            onResizeNode: canEdit ? (dimensions) => handleNodeResize(node.id, dimensions) : undefined,
            onChangeIcon: canEdit ? (iconLabel) => handleNodeIconChange(node.id, iconLabel) : undefined,
          },
        }));
      });
    },
    [isLocked, staffMembers, canEdit]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const saveToFirebase = async (currentNodes = nodes, currentEdges = edges, currentViewport = viewportState) => {
    const nodesToSave = currentNodes.map((node) => ({
      ...node,
      data: {
        label: node.data.label || 'New Node',
        description: node.data.description || '',
        color: node.data.color || 'teal',
        staffMember: node.data.staffMember || null,
        isLocked: node.data.isLocked || true,
        dimensions: node.data.dimensions || { width: 300, height: 'auto' },
        iconLabel: node.data.iconLabel || 'Executive',
      },
    }));

    try {
      const currentZoom = getViewport();
      const viewportToSave = {
        ...currentZoom,
        zoom: currentZoom.zoom || 1
      };

      await set(ref(db, 'orgChart'), {
        nodes: nodesToSave,
        edges: currentEdges,
        viewport: viewportToSave,
      });

      setInitialState({
        nodes: nodesToSave,
        edges: currentEdges,
        viewport: viewportToSave
      });
      
      setHasUnsavedChanges(false);
      toast.success('Organization chart saved successfully');
    } catch (error) {
      console.error('Error saving org chart:', error);
      toast.error('Failed to save organization chart');
    }
  };

  const handleRevert = async () => {
    if (initialState) {
      const enrichedNodes = initialState.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isLocked: !canEdit || isLocked,
          staffMembers: staffMembers,
          onChangeLabel: canEdit ? (newLabel) => handleNodeLabelChange(node.id, newLabel) : undefined,
          onChangeDescription: canEdit ? (newDesc) => handleNodeDescriptionChange(node.id, newDesc) : undefined,
          onChangeColor: canEdit ? (newColor) => handleNodeColorChange(node.id, newColor) : undefined,
          onChangeStaffMember: canEdit ? (staffMember) => handleNodeStaffMemberChange(node.id, staffMember) : undefined,
          onResizeNode: canEdit ? (dimensions) => handleNodeResize(node.id, dimensions) : undefined,
          onChangeIcon: canEdit ? (iconLabel) => handleNodeIconChange(node.id, iconLabel) : undefined,
        },
      }));

      setNodes(enrichedNodes);
      setEdges(initialState.edges);
      setLocalViewport(initialState.viewport);
      setViewport(initialState.viewport);
      setHasUnsavedChanges(false);
      toast.success('Changes reverted successfully');
    }
  };

  const onAdd = useCallback(() => {
    if (!canEdit) return;

    const newNodeId = getNodeId();
    const newNode = {
      id: newNodeId,
      type: 'editableNode',
      position: {
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
      },
      data: {
        label: 'New Position',
        staffMember: null,
        iconLabel: 'Executive',
        color: 'teal',
        description: '',
        isLocked: isLocked,
        dimensions: { width: 300, height: 'auto' },
        staffMembers: staffMembers,
        onChangeLabel: canEdit ? (newLabel) => handleNodeLabelChange(newNodeId, newLabel) : undefined,
        onChangeDescription: canEdit ? (newDesc) => handleNodeDescriptionChange(newNodeId, newDesc) : undefined,
        onChangeColor: canEdit ? (newColor) => handleNodeColorChange(newNodeId, newColor) : undefined,
        onChangeStaffMember: canEdit ? (staffMember) => handleNodeStaffMemberChange(newNodeId, staffMember) : undefined,
        onResizeNode: canEdit ? (dimensions) => handleNodeResize(newNodeId, dimensions) : undefined,
        onChangeIcon: canEdit ? (iconLabel) => handleNodeIconChange(newNodeId, iconLabel) : undefined,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [isLocked, staffMembers, canEdit]);

  const handleInteractiveChange = useCallback((locked) => {
    if (!canEdit) return;
    
    setIsLocked(!locked);
    if (locked && hasUnsavedChanges) {
      toast.warning('You have unsaved changes. Please save or revert before locking.');
    }
  }, [hasUnsavedChanges, canEdit]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      defaultEdgeOptions={{
        style: {
          stroke: '#9e9e9e', // A lighter grey shade
          strokeWidth: 2,
          //filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))'
        }
      }}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      onMoveEnd={(_, viewport) => setLocalViewport(viewport)}
      className="bg-teal-50"
      panOnScroll={true}
      panOnDrag={true}
      zoomOnScroll={true}
      zoomOnPinch={true}
      nodesDraggable={canEdit && !isLocked}
      nodesConnectable={canEdit && !isLocked}
      elementsSelectable={canEdit && !isLocked}
    >
      <MiniMap />
      <Controls showInteractive={false} />
      <Background />

      {canEdit && (
        <Panel position="top-right" className="p-3">
          <div className="flex items-center gap-3">
            {/* Lock Status Indicator */}
            {isLocked && (
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm">
                <Lock className="h-4 w-4" />
                <span>Locked</span>
              </div>
            )}
            
            {/* Unsaved Changes Indicator - Only show when unlocked */}
            {hasUnsavedChanges && !isLocked && (
              <div className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-50/80 px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Unsaved changes</span>
              </div>
            )}

            {/* Buttons Container */}
            <div className="flex items-center gap-2 shadow-sm">
              {/* Save Button */}
              <Button
                onClick={() => saveToFirebase()}
                disabled={!hasUnsavedChanges || isLocked}
                variant={hasUnsavedChanges && !isLocked ? "default" : "secondary"}
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </Button>

              {/* Revert Button - Only show when there are unsaved changes and unlocked */}
              {hasUnsavedChanges && !isLocked && (
                <Button
                  onClick={handleRevert}
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Revert</span>
                </Button>
              )}

              {/* Add Position Button */}
              <Button
                onClick={onAdd}
                disabled={isLocked}
                variant={!isLocked ? "default" : "secondary"}
                size="sm"
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add</span>
              </Button>

              {/* Lock/Unlock Toggle Button */}
              <Button
                onClick={() => handleInteractiveChange(isLocked)}
                variant={isLocked ? "default" : "destructive"}
                size="sm"
                className="gap-2"
              >
                {isLocked ? (
                  <>
                    <Unlock className="h-4 w-4" />
                    <span>Unlock</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Lock</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Panel>
      )}
    </ReactFlow>
  );
}

export default function OrgChart() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      
      <ReactFlowProvider>
        <OrgChartInner />
      </ReactFlowProvider>
    </div>
  );
}
