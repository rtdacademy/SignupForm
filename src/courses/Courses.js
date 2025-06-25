import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, update, remove, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit,
  FaExclamationTriangle,
  FaPlus,
  FaTrash,
  FaClock,
  FaRegLightbulb,
  FaLink,
  FaFire,
  FaEnvelope,
  FaSync,
  FaDatabase
} from 'react-icons/fa';
import { BookOpen } from 'lucide-react';
import Modal from 'react-modal';
// Keep react-select for multi-select fields.
import ReactSelect from 'react-select';
import { Switch } from '../components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger
} from '../components/ui/sheet';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import CourseUnitsEditor from './CourseUnitsEditor';
import AddCourseDialog from './AddCourseDialog';
import DeleteCourseDialog from './DeleteCourseDialog';
import CourseWeightingDialog from './CourseWeightingDialog';
import ImprovedEmailManager from './ImprovedEmailManager';
import JsonDisplay from '../components/JsonDisplay';

// Import UI kit Select components for single–value selects
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import PermissionIndicator from '../context/PermissionIndicator';

Modal.setAppElement('#root');

const monthOptions = [
  { value: 'January', label: 'January' },
  { value: 'April', label: 'April' },
  { value: 'June', label: 'June' },
  { value: 'August', label: 'August' },
  { value: 'November', label: 'November' }
];

// Helper Functions
const formatDateForDatabase = (localDate) => {
  const [year, month, day] = localDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 7));
  return {
    date: date.toISOString(),
    displayDate: localDate,
    timezone: 'America/Edmonton'
  };
};

const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Date(date.getTime() - (7 * 60 * 60 * 1000))
    .toLocaleDateString('en-CA', {
      timeZone: 'America/Edmonton',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
};

// Time Selection Options
const timeOptions = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 1;
  return { value: hour.toString(), label: hour.toString() };
});

const minuteOptions = Array.from({ length: 60 }, (_, i) => {
  const minute = i.toString().padStart(2, '0');
  return { value: minute, label: minute };
});

const periodOptions = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' }
];

function DiplomaTimeEntry({ diplomaTime, onChange, onDelete, isEditing }) {
  const handleDateChange = (e) => {
    const localDate = e.target.value;
    const { date, displayDate, timezone } = formatDateForDatabase(localDate);
    onChange({
      ...diplomaTime,
      date,
      displayDate,
      timezone
    });
  };

  const handleTimeChange = (selected, { name }) => {
    onChange({
      ...diplomaTime,
      [name]: selected.value
    });
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input
            type="date"
            value={diplomaTime.displayDate || formatDateForDisplay(diplomaTime.date) || ''}
            onChange={handleDateChange}
            disabled={!isEditing}
          />
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Time</label>
            <div className="flex space-x-2 items-center">
              <Select
                name="hour"
                value={diplomaTime.hour}
                onValueChange={(value) => handleTimeChange({ value }, { name: 'hour' })}
                disabled={!isEditing}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>:</span>
              <Select
                name="minute"
                value={diplomaTime.minute}
                onValueChange={(value) => handleTimeChange({ value }, { name: 'minute' })}
                disabled={!isEditing}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
                <SelectContent>
                  {minuteOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                name="period"
                value={diplomaTime.period}
                onValueChange={(value) => handleTimeChange({ value }, { name: 'period' })}
                disabled={!isEditing}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="AM/PM" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Month</label>
          <Select
            name="month"
            value={diplomaTime.month}
            onValueChange={(value) => onChange({ ...diplomaTime, month: value })}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={diplomaTime.confirmed || false}
              onCheckedChange={(checked) => onChange({ ...diplomaTime, confirmed: checked })}
              disabled={!isEditing}
            />
            <label className="text-sm">Confirmed</label>
          </div>

          {isEditing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              type="button"
            >
              <FaTrash className="mr-1" /> Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function DiplomaTimes({ courseId, diplomaTimes, isEditing }) {
  const [times, setTimes] = useState(diplomaTimes || []);

  useEffect(() => {
    setTimes(diplomaTimes || []);
  }, [diplomaTimes]);

  const handleAdd = () => {
    if (!isEditing) return;

    const today = new Date();
    const localDate = today.toLocaleDateString('en-CA', {
      timeZone: 'America/Edmonton',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const { date, displayDate, timezone } = formatDateForDatabase(localDate);
    
    const newTime = {
      id: `diploma-time-${Date.now()}`,
      date,
      displayDate,
      timezone,
      month: monthOptions[0].value,
      hour: '9',
      minute: '00',
      period: 'AM',
      confirmed: false
    };

    const updatedTimes = [...times, newTime];
    setTimes(updatedTimes);
    updateDatabase(updatedTimes);
  };

  const handleChange = (index, updatedTime) => {
    if (!isEditing) return;

    const updatedTimes = times.map((time, i) => 
      i === index ? updatedTime : time
    );
    setTimes(updatedTimes);
    updateDatabase(updatedTimes);
  };

  const handleDelete = (index) => {
    if (!isEditing) return;

    const updatedTimes = times.filter((_, i) => i !== index);
    setTimes(updatedTimes);
    updateDatabase(updatedTimes);
  };

  const updateDatabase = async (updatedTimes) => {
    try {
      const db = getDatabase();
      const courseRef = ref(db, `courses/${courseId}`);
      await update(courseRef, { 
        diplomaTimes: updatedTimes.length > 0 ? updatedTimes : null 
      });
      console.log('Successfully updated diploma times:', updatedTimes);
    } catch (error) {
      console.error('Error updating diploma times:', error);
      alert('An error occurred while updating diploma times.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Diploma Times</h3>
        {isEditing && (
          <Button 
            onClick={handleAdd}
            type="button"
            className="flex items-center"
          >
            <FaPlus className="mr-2" /> Add Time
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {(!times || times.length === 0) ? (
          <p className="text-gray-500 text-center py-4">No diploma times added yet.</p>
        ) : (
          times.map((time, index) => (
            <DiplomaTimeEntry
              key={time.id}
              diplomaTime={time}
              onChange={(updatedTime) => handleChange(index, updatedTime)}
              onDelete={() => handleDelete(index)}
              isEditing={isEditing}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Component for displaying and managing Firebase course configuration from database
function DatabaseCourseConfig({ courseId, isEditing }) {
  const [config, setConfig] = useState(null);
  const [versionControl, setVersionControl] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingSync, setCheckingSync] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const checkSyncStatus = async () => {
    if (!courseId) return;
    
    try {
      setCheckingSync(true);
      
      // Read file config and database config to compare
      const functions = getFunctions();
      const getConfigFunction = httpsCallable(functions, 'getCourseConfigV2');
      
      // Get file config
      const fileResult = await getConfigFunction({ courseId });
      
      if (!fileResult.data.success) {
        setSyncStatus({ error: fileResult.data.error || 'Could not read course config file' });
        return;
      }
      
      // Calculate hash of file content
      const fileConfig = fileResult.data.courseConfig;
      const fileConfigString = JSON.stringify(fileConfig, null, 2);
      const fileHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fileConfigString));
      const fileHashHex = Array.from(new Uint8Array(fileHash)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Compare with database version control hash
      if (versionControl && versionControl.contentHash) {
        if (versionControl.contentHash === fileHashHex) {
          setSyncStatus({ 
            upToDate: true, 
            message: 'Database is up to date with file',
            fileVersion: fileConfig.metadata?.version || 'Unknown',
            dbVersion: versionControl.version || 'Unknown'
          });
        } else {
          setSyncStatus({ 
            needsSync: true, 
            message: 'Configuration file has been updated and needs syncing',
            fileVersion: fileConfig.metadata?.version || 'Unknown',
            dbVersion: versionControl.version || 'Unknown'
          });
        }
      } else {
        // No version control data means database hasn't been synced yet
        setSyncStatus({ 
          needsSync: true, 
          message: 'Configuration has never been synced to database',
          fileVersion: fileConfig.metadata?.version || 'Unknown',
          dbVersion: 'Not synced'
        });
      }
      
    } catch (err) {
      console.error('Error checking sync status:', err);
      setSyncStatus({ error: err.message });
    } finally {
      setCheckingSync(false);
    }
  };

  const fetchCourseConfigFromDatabase = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const db = getDatabase();
      
      // Fetch both config and version control data
      const configRef = ref(db, `courses/${courseId}/course-config`);
      const versionRef = ref(db, `courses/${courseId}/course-config-version-control`);
      
      const [configSnapshot, versionSnapshot] = await Promise.all([
        get(configRef),
        get(versionRef)
      ]);
      
      if (configSnapshot.exists()) {
        setConfig(configSnapshot.val());
        setError(null);
      } else {
        setConfig(null);
        setError(`No course configuration found in database for course ${courseId}`);
      }
      
      if (versionSnapshot.exists()) {
        setVersionControl(versionSnapshot.val());
      } else {
        setVersionControl(null);
      }
      
    } catch (err) {
      console.error('Error fetching course config from database:', err);
      setError(`Failed to fetch course configuration: ${err.message}`);
      setConfig(null);
      setVersionControl(null);
    } finally {
      setLoading(false);
    }
  };

  const manualSync = async () => {
    try {
      setSyncing(true);
      const functions = getFunctions();
      const syncFunction = httpsCallable(functions, 'syncCourseConfigToDatabase');
      
      // Force sync when user manually triggers
      const result = await syncFunction({ courseId, force: true });
      
      if (result.data.success) {
        console.log('Manual sync successful:', result.data);
        // Refresh the data and sync status after sync
        await Promise.all([
          fetchCourseConfigFromDatabase(),
          checkSyncStatus()
        ]);
        alert(`Sync successful! ${result.data.results[0]?.message || 'Configuration updated'}`);
      } else {
        console.error('Manual sync failed:', result.data);
        alert(`Sync failed: ${result.data.error}`);
      }
    } catch (err) {
      console.error('Error during manual sync:', err);
      alert(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchCourseConfigFromDatabase();
      await checkSyncStatus();
    };
    
    initializeData();
  }, [courseId]);

  const getSubtitle = () => {
    if (loading) return 'Loading database configuration...';
    if (error) return error;
    if (!config) return 'No configuration data found in database';
    
    let subtitle = 'Live data from Realtime Database';
    if (versionControl) {
      subtitle += ` • Version: ${versionControl.version} • Last synced: ${new Date(versionControl.lastSynced).toLocaleString()}`;
    }
    return subtitle;
  };

  const getSyncStatusMessage = () => {
    if (checkingSync) return 'Checking for changes...';
    if (!syncStatus) return 'Sync status unknown';
    
    if (syncStatus.error) {
      return `Error: ${syncStatus.error}`;
    }
    
    if (syncStatus.upToDate) {
      return `${syncStatus.message} (File: v${syncStatus.fileVersion}, DB: v${syncStatus.dbVersion})`;
    }
    
    if (syncStatus.needsSync) {
      return `${syncStatus.message} (File: v${syncStatus.fileVersion}, DB: v${syncStatus.dbVersion})`;
    }
    
    return 'Ready to check sync status';
  };

  const getSyncStatusColor = () => {
    if (checkingSync) return 'text-blue-500';
    if (!syncStatus || syncStatus.error) return 'text-red-500';
    if (syncStatus.upToDate) return 'text-green-500';
    if (syncStatus.needsSync) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const shouldShowSyncButton = () => {
    return syncStatus && (syncStatus.needsSync || syncStatus.error);
  };

  return (
    <div className="space-y-4">
      {/* Sync Warning Banner - Only show when sync is needed */}
      {syncStatus && syncStatus.needsSync && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="text-yellow-500" />
              <span className="font-medium text-yellow-800">Configuration Out of Sync</span>
            </div>
            {isEditing && (
              <Button
                onClick={manualSync}
                disabled={syncing || checkingSync}
                variant="default"
                size="sm"
                className="flex items-center bg-yellow-600 hover:bg-yellow-700"
              >
                <FaSync className={`mr-1 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            {getSyncStatusMessage()}
          </div>
        </div>
      )}

      {/* Sync Status and Controls */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaDatabase className="text-blue-500" />
            <span className="font-medium">Database Configuration</span>
            {versionControl && (
              <span className="text-sm text-gray-600">
                (v{versionControl.version})
              </span>
            )}
          </div>
          
          {isEditing && shouldShowSyncButton() && (
            <Button
              onClick={manualSync}
              disabled={syncing || checkingSync}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <FaSync className={`mr-1 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync from File'}
            </Button>
          )}
        </div>
        
        {/* Sync Status Display */}
        <div className={`mt-2 text-sm ${getSyncStatusColor()}`}>
          <span>{getSyncStatusMessage()}</span>
        </div>
      </div>

      {/* Configuration Display */}
      <JsonDisplay 
        data={config || { error: error || 'No data available' }}
        title="Course Configuration"
        subtitle={getSubtitle()}
        filePath={versionControl?.syncedFrom || `Database: /courses/${courseId}/course-config/`}
      />
      
      {/* Version Control Information */}
      {versionControl && (
        <JsonDisplay 
          data={versionControl}
          title="Version Control Information"
          subtitle="Sync metadata and version tracking"
          filePath={`Database: /courses/${courseId}/course-config-version-control/`}
        />
      )}
    </div>
  );
}

function Courses({
  courses,
  staffMembers,
  selectedCourseId,
  courseData,
  courseWeights,
  isEditing,
  onCourseSelect,
  onCourseUpdate,
  onWeightsUpdate,
  toggleEditing
}) {
  const { user, isStaff, hasSuperAdminAccess } = useAuth();
  const navigate = useNavigate();
  
  // Local UI state (not moved to parent)
 
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCourseForDeletion, setSelectedCourseForDeletion] = useState(null);

  const activeOptions = [
    { value: 'Current', label: 'Current' },
    { value: 'Required', label: 'Required' },
    { value: 'Old', label: 'Old' },
    { value: 'Not Used', label: 'Not Used' },
    { value: 'Custom', label: 'Custom' },
  ];

  const firebaseActiveOptions = [
    { value: 'Current', label: 'Current' },
    { value: 'Required', label: 'Required' },
    { value: 'Not Used', label: 'Not Used' },
    { value: 'Development', label: 'Development' },
  ];

  const gradeOptions = [
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '10', label: '10' },
    { value: '11', label: '11' },
    { value: '12', label: '12' },
  ];

  const diplomaCourseOptions = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ];

  // Basic auth check
  useEffect(() => {
    if (!user || !isStaff(user)) {
      navigate('/login');
      return;
    }
  }, [user, isStaff, navigate]);

  const handleCourseSelect = (courseId) => {
    onCourseSelect(courseId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...courseData,
      [name]: value,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { [name]: value })
      .then(() => {
        console.log(`Successfully updated ${name}`);
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  // Handler for allowedEmails updates
  const handleAllowedEmailsUpdate = (updatedEmails) => {
    const updatedData = {
      ...courseData,
      allowedEmails: updatedEmails
    };
    onCourseUpdate(updatedData);
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    // Convert value to integer
    const numValue = value === '' ? '' : parseInt(value, 10);
    const updatedData = {
      ...courseData,
      [name]: numValue,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { [name]: numValue })
      .then(() => {
        console.log(`Successfully updated ${name}`);
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleSelectChange = (value, name) => {
    const updatedData = {
      ...courseData,
      [name]: value,
    };

    // Special handling: if DiplomaCourse is set to 'No', clear diplomaTimes.
    if (name === 'DiplomaCourse' && value === 'No') {
      updatedData.diplomaTimes = null;
    }

    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    const updates = { [name]: value };
    if (name === 'DiplomaCourse' && value === 'No') {
      updates.diplomaTimes = null;
    }

    update(courseRef, updates)
      .then(() => {
        console.log(`Successfully updated ${name}`);
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleMultiSelectChange = (selectedOptions, { name }) => {
    const values = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    const updatedData = {
      ...courseData,
      [name]: values,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { [name]: values })
      .then(() => {
        console.log(`Successfully updated ${name}`);
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleUnitsChange = (newUnits) => {
    const updatedData = {
      ...courseData,
      units: newUnits,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { units: newUnits })
      .then(() => {
        console.log('Successfully updated units');
      })
      .catch((error) => {
        console.error('Error updating course units:', error);
        alert('An error occurred while updating the course units.');
      });
  };

  const handleEditClick = () => {
    if (hasSuperAdminAccess()) {
      toggleEditing(true);
    } else {
      // Optional: show a toast or small notification that super admin access is required
      alert("Super Admin access required to edit courses");
    }
  };


  const handleSwitchChange = (checked) => {
    if (!isEditing) return;

    const updatedData = {
      ...courseData,
      allowStudentChats: checked,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { allowStudentChats: checked })
      .then(() => {
        console.log('Successfully updated allowStudentChats');
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleDoesNotRequireScheduleChange = (checked) => {
    if (!isEditing) return;

    const updatedData = {
      ...courseData,
      doesNotRequireSchedule: checked,
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { doesNotRequireSchedule: checked })
      .then(() => {
        console.log('Successfully updated doesNotRequireSchedule');
      })
      .catch((error) => {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
      });
  };

  const handleStatsChange = (checked) => {
    if (!isEditing) return;

    const updatedData = {
      ...courseData,
      showStats: checked
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { showStats: checked })
      .then(() => {
        console.log('Successfully updated showStats');
      })
      .catch((error) => {
        console.error('Error updating showStats:', error);
        alert('An error occurred while updating showStats.');
      });
  };

  const handleLtiLinksChange = (checked) => {
    if (!isEditing) return;

    const updatedData = {
      ...courseData,
      ltiLinksComplete: checked
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { ltiLinksComplete: checked })
      .then(() => {
        console.log('Successfully updated ltiLinksComplete');
      })
      .catch((error) => {
        console.error('Error updating ltiLinksComplete:', error);
        alert('An error occurred while updating LTI links status.');
      });
  };

  const handleOnRegistrationChange = (checked) => {
    if (!isEditing) return;

    const updatedData = {
      ...courseData,
      OnRegistration: checked
    };
    onCourseUpdate(updatedData);

    const db = getDatabase();
    const courseRef = ref(db, `courses/${selectedCourseId}`);
    update(courseRef, { OnRegistration: checked })
      .then(() => {
        console.log('Successfully updated OnRegistration');
      })
      .catch((error) => {
        console.error('Error updating OnRegistration:', error);
        alert('An error occurred while updating registration visibility.');
      });
  };

  const inputClass = `mt-1 block w-full p-2 border ${
    isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-100'
  } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm`;

  const groupedCourses = useMemo(() => {
    const groups = {};
    
    // Check if courses exists before trying to use Object.entries
    if (!courses) {
      return {};
    }
    
    Object.entries(courses)
      .filter(([courseId]) => courseId !== 'sections')
      .forEach(([courseId, course]) => {
        const grade = course.grade ? course.grade.trim() : 'Other';
        if (!grade) {
          if (!groups['Other']) groups['Other'] = [];
          groups['Other'].push({ courseId, course });
        } else {
          if (!groups[grade]) groups[grade] = [];
          groups[grade].push({ courseId, course });
        }
      });
  
    // Rest of function remains the same
    Object.keys(groups).forEach(grade => {
      groups[grade].sort((a, b) => {
        const idA = parseInt(a.courseId);
        const idB = parseInt(b.courseId);
        return idA - idB;
      });
    });
  
    const sortedGrades = Object.keys(groups)
      .filter((g) => g !== 'Other')
      .sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.localeCompare(b);
      });
    if (groups['Other']) {
      sortedGrades.push('Other');
    }
  
    const sortedGroups = {};
    sortedGrades.forEach((grade) => {
      sortedGroups[grade] = groups[grade];
    });
  
    return sortedGroups;
  }, [courses]);

  const handleDeleteCourse = async () => {
    if (!selectedCourseForDeletion) return;
  
    try {
      const db = getDatabase();
      const courseRef = ref(db, `courses/${selectedCourseForDeletion.id}`);
      await remove(courseRef);
      console.log(`Successfully deleted course: ${selectedCourseForDeletion.title}`);
  
      setDeleteDialogOpen(false);
      setSelectedCourseForDeletion(null);
      onCourseSelect(null);
      onCourseUpdate({});
      
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('An error occurred while deleting the course.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)]">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-200 p-4 pb-24 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Courses</h2>

        <AddCourseDialog />

        {Object.keys(groupedCourses).length > 0 ? (
          <div>
            {Object.entries(groupedCourses).map(([grade, coursesInGrade]) => (
              <div key={grade} className="mb-4">
                <h3 className="text-md font-semibold mb-2">{grade}</h3>
                <ul className="space-y-1 pl-4">
                  {coursesInGrade.map(({ courseId, course }) => (
                    <li
                      key={courseId}
                      className={`p-2 rounded cursor-pointer ${
                        selectedCourseId === courseId
                          ? 'bg-blue-500 text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-2 flex-1"
                          onClick={() => handleCourseSelect(courseId)}
                        >
                          {course.modernCourse && (
                            <FaRegLightbulb
                              className={`${selectedCourseId === courseId ? 'text-white' : 'text-yellow-500'}`}
                              title="Modern Course"
                            />
                          )}
                          {course.firebaseCourse && (
                            <FaFire
                              className={`${selectedCourseId === courseId ? 'text-white' : 'text-orange-500'}`}
                              title="Firebase Course"
                            />
                          )}
                          {course.ltiLinksComplete && (
                            <FaLink
                              className={`${selectedCourseId === courseId ? 'text-white' : 'text-green-500'}`}
                              title="LTI Links Complete"
                            />
                          )}
                          {course.allowedEmails && course.allowedEmails.length > 0 && (
                            <FaEnvelope
                              className={`${selectedCourseId === courseId ? 'text-white' : 'text-purple-500'}`}
                              title={`Email Restricted (${course.allowedEmails.length} email${course.allowedEmails.length === 1 ? '' : 's'})`}
                            />
                          )}
                          <span>{course.Title || `Course ID: ${courseId}`}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialogOpen(true);
                            setSelectedCourseForDeletion({ id: courseId, title: course.Title });
                          }}
                          className={`p-1 rounded hover:bg-gray-200 ${
                            selectedCourseId === courseId ? 'text-white hover:text-red-600' : 'text-gray-500 hover:text-red-600'
                          }`}
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p>No courses available.</p>
        )}
      </div>
 {/* Course Details */}
 <div className="w-3/4 p-4 pb-24 overflow-y-auto">
        {selectedCourseId ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                  Course: {courses[selectedCourseId]?.Title || selectedCourseId}
                </h2>
                {courseData?.modernCourse && (
                  <div className="flex items-center gap-1 text-yellow-500" title="Modern Course">
                    <FaRegLightbulb />
                    <span className="text-sm font-medium">Modern Course</span>
                  </div>
                )}
                {courseData?.firebaseCourse && (
                  <div className="flex items-center gap-1 text-orange-500" title="Firebase Course">
                    <FaFire />
                    <span className="text-sm font-medium">Firebase Course</span>
                  </div>
                )}
                {courseData?.ltiLinksComplete && (
                  <div className="flex items-center gap-1 text-green-500" title="LTI Links Complete">
                    <FaLink />
                    <span className="text-sm font-medium">LTI Links Complete</span>
                  </div>
                )}
                {courseData?.allowedEmails && courseData.allowedEmails.length > 0 && (
                  <div className="flex items-center gap-1 text-purple-500" title="Email Restricted">
                    <FaEnvelope />
                    <span className="text-sm font-medium">Email Restricted</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
  {!isEditing && (
    <>
      <button
        onClick={handleEditClick}
        className={`flex items-center px-3 py-1 ${
          hasSuperAdminAccess()
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 cursor-not-allowed'
        } text-white rounded transition duration-200 text-sm`}
        disabled={!hasSuperAdminAccess()}
      >
        <FaEdit className="mr-1" /> Edit Course
        {!hasSuperAdminAccess() && (
          <PermissionIndicator type="SUPER_ADMIN" className="ml-1" />
        )}
      </button>

      {/* Add this new button for modern courses only */}
      {courseData?.modernCourse && !courseData?.firebaseCourse && (
  <Button
    onClick={() => window.open(`/course-editor/${selectedCourseId}`, '_blank')}
    variant="default"
    className="flex items-center bg-green-600 hover:bg-green-700 text-white mr-2"
  >
    <BookOpen className="mr-2 h-4 w-4" /> Edit Course Content
  </Button>
)}
    </>
  )}
  {/* Only show Course Weighting Dialog for non-Firebase courses */}
  {!courseData?.firebaseCourse && (
    <CourseWeightingDialog
                  courseId={selectedCourseId}
                  courseUnits={courseData.units || []}
                  courseWeights={courseWeights}
                  onWeightsUpdate={(categoryWeights, updatedUnits) => {
                    const db = getDatabase();
                    
                    try {
                      // Validate categoryWeights
                      if (!categoryWeights || typeof categoryWeights !== 'object') {
                        throw new Error('Invalid category weights');
                      }

                      // Create clean category weights object ensuring all values are numbers
                      const cleanCategoryWeights = {
                        lesson: Number(categoryWeights.lesson) || 0,
                        assignment: Number(categoryWeights.assignment) || 0,
                        exam: Number(categoryWeights.exam) || 0
                      };

                      // Create an update object starting with weights
                      const updates = {
                        [`courses/${selectedCourseId}/weights`]: cleanCategoryWeights
                      };

                      // Update unit weights if we have valid units
                      if (Array.isArray(updatedUnits)) {
                        updatedUnits.forEach((unit, unitIndex) => {
                          if (unit?.items && Array.isArray(unit.items)) {
                            unit.items.forEach((item, itemIndex) => {
                              // Ensure weight is a valid number before adding to updates
                              const weight = Number(item.weight);
                              if (!isNaN(weight)) {
                                updates[`courses/${selectedCourseId}/units/${unitIndex}/items/${itemIndex}/weight`] = weight;
                              }
                            });
                          }
                        });
                      }

                      // Log the final updates object for debugging
                      console.log('Sending updates:', updates);

                      // Get a reference to the root of the database
                      const rootRef = ref(db);

                      // Perform the multi-location update using the root reference
                      update(rootRef, updates)
                        .then(() => {
                          console.log('Successfully updated course weights');
                          onCourseUpdate({
                            ...courseData,
                            units: updatedUnits
                          });
                          onWeightsUpdate(cleanCategoryWeights);
                        })
                        .catch((error) => {
                          console.error('Firebase update error:', error);
                          alert('An error occurred while updating the course weights.');
                        });


                    } catch (error) {
                      console.error('Error preparing updates:', error.message, '\nFull error:', error);
                      alert('An error occurred while preparing the updates: ' + error.message);
                    }
                  }}
                  isEditing={isEditing}
                />
  )}
              </div>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {courseData.firebaseCourse ? (
                // Simplified Firebase Course Form
                <div className="flex flex-wrap -mx-2">
                  {/* Course Name */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Name
                    </label>
                    <input
                      type="text"
                      name="Title"
                      value={courseData.Title || ''}
                      disabled
                      className={`mt-1 block w-full p-2 border border-gray-200 bg-gray-100 rounded-md shadow-sm text-sm`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Read-only. To change the course name, edit the "title" field in:<br />
                      <code className="bg-gray-100 px-1 rounded">src/FirebaseCourses/courses/{selectedCourseId}/course-display.json</code>
                    </p>
                  </div>

                  {/* Development emails */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Development emails
                    </label>
                    <ImprovedEmailManager
                      courseId={selectedCourseId}
                      allowedEmails={courseData.allowedEmails || []}
                      isEditing={isEditing}
                      onUpdate={handleAllowedEmailsUpdate}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {courseData.allowedEmails && courseData.allowedEmails.length > 0
                        ? `Restricted to ${courseData.allowedEmails.length} email${courseData.allowedEmails.length === 1 ? '' : 's'}`
                        : 'Available to all students'}
                    </p>
                  </div>

                  {/* Show on Registration Form */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Show on Registration Form</span>
                      <Switch
                        checked={courseData.OnRegistration === true}
                        onCheckedChange={handleOnRegistrationChange}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, this course will appear in the registration form.
                    </p>
                  </div>

                  {/* Restrict Course Access */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Restrict Course Access</span>
                      <Switch
                        checked={courseData.restrictCourseAccess === true}
                        onCheckedChange={(checked) => handleSelectChange(checked, "restrictCourseAccess")}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, student access to this course will be restricted. Developers can still access.
                    </p>
                  </div>

                  {/* Course ID */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course ID
                    </label>
                    <input
                      type="text"
                      name="LMSCourseID"
                      value={courseData.LMSCourseID || ''}
                      disabled
                      className={`mt-1 block w-full p-2 border border-gray-200 bg-gray-100 rounded-md shadow-sm text-sm`}
                    />
                  </div>
                
                  {/* Active */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Active
                    </label>
                    <Select
                      name="Active"
                      value={courseData.Active}
                      onValueChange={(value) => handleSelectChange(value, "Active")}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select active status" />
                      </SelectTrigger>
                      <SelectContent>
                        {firebaseActiveOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Minimum Completion Months */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Completion Months
                    </label>
                    <input
                      type="number"
                      name="minCompletionMonths"
                      value={courseData.minCompletionMonths || ''}
                      onChange={handleNumberInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="Enter minimum months"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum number of months required to complete this course
                    </p>
                  </div>

                  {/* Recommended Completion Months */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Recommended Completion Months
                    </label>
                    <input
                      type="number"
                      name="recommendedCompletionMonths"
                      value={courseData.recommendedCompletionMonths || ''}
                      onChange={handleNumberInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="Enter recommended months"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended time frame to complete this course
                    </p>
                  </div>

                  {/* Diploma Course */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Diploma Course
                    </label>
                    <Select
                      name="DiplomaCourse"
                      value={courseData.DiplomaCourse}
                      onValueChange={(value) => handleSelectChange(value, "DiplomaCourse")}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Diploma Course" />
                      </SelectTrigger>
                      <SelectContent>
                        {diplomaCourseOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Course Type */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Type
                    </label>
                    <Select
                      name="CourseType"
                      value={courseData.CourseType || ''}
                      onValueChange={(value) => handleSelectChange(value, "CourseType")}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Option">Option</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {courseData.CourseType === 'Custom' && (
                      <input
                        type="text"
                        name="CourseTypeCustom"
                        value={courseData.CourseTypeCustom || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`${inputClass} mt-2`}
                        placeholder="Enter custom value"
                      />
                    )}
                  </div>

                  {/* Grade */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Grade
                    </label>
                    <Select
                      name="grade"
                      value={courseData.grade || ''}
                      onValueChange={(value) => handleSelectChange(value, "grade")}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Course Description */}
                  <div className="w-full px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Description
                    </label>
                    <Textarea
                      name="description"
                      value={courseData.description || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      placeholder="Enter course description"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide a detailed description of the course that will be visible to students.
                    </p>
                  </div>

                  {/* Allow Student-to-Student Chats */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Allow Student-to-Student Chats</span>
                      <Switch
                        checked={courseData.allowStudentChats || false}
                        onCheckedChange={handleSwitchChange}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, students can chat with other students in this course.
                    </p>
                  </div>

                  {/* Does Not Require Schedule */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Does Not Require Schedule</span>
                      <Switch
                        checked={courseData.doesNotRequireSchedule || false}
                        onCheckedChange={handleDoesNotRequireScheduleChange}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, this course does not require a schedule.
                    </p>
                  </div>

                  {/* Teachers (Using ReactSelect for multi-select) */}
                  <div className="w-full md:w-1/2 lg:w-2/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Teachers
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      The first teacher in the list will have primary assignment
                    </p>
                    <ReactSelect
                      isMulti
                      name="Teachers"
                      options={staffMembers}
                      value={staffMembers.filter(
                        (staff) =>
                          courseData.Teachers &&
                          courseData.Teachers.includes(staff.value)
                      )}
                      onChange={handleMultiSelectChange}
                      isDisabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  {/* Support Staff (Using ReactSelect for multi-select) */}
                  <div className="w-full md:w-1/2 lg:w-2/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Support Staff
                    </label>
                    <ReactSelect
                      isMulti
                      name="SupportStaff"
                      options={staffMembers}
                      value={staffMembers.filter(
                        (staff) =>
                          courseData.SupportStaff &&
                          courseData.SupportStaff.includes(staff.value)
                      )}
                      onChange={handleMultiSelectChange}
                      isDisabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                // Original Complex Course Form
                <div className="flex flex-wrap -mx-2">
                  {/* Course Name */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Name
                    </label>
                    <input
                      type="text"
                      name="Title"
                      value={courseData.Title || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </div>

                  {/* Email Restrictions */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Restrictions
                    </label>
                    <ImprovedEmailManager
                      courseId={selectedCourseId}
                      allowedEmails={courseData.allowedEmails || []}
                      isEditing={isEditing}
                      onUpdate={handleAllowedEmailsUpdate}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {courseData.allowedEmails && courseData.allowedEmails.length > 0
                        ? `Restricted to ${courseData.allowedEmails.length} email${courseData.allowedEmails.length === 1 ? '' : 's'}`
                        : 'Available to all students'}
                    </p>
                  </div>

                  {/* Show on Registration Form */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Show on Registration Form</span>
                      <Switch
                        checked={courseData.OnRegistration === true}
                        onCheckedChange={handleOnRegistrationChange}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, this course will appear in the registration form.
                    </p>
                  </div>

                  {/* Restrict Course Access */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Restrict Course Access</span>
                      <Switch
                        checked={courseData.restrictCourseAccess === true}
                        onCheckedChange={(checked) => handleSelectChange(checked, "restrictCourseAccess")}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, student access to this course will be restricted. Developers can still access.
                    </p>
                  </div>

                  {/* LMS Course ID  */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      LMS Course ID
                    </label>
                    <input
                      type="text"
                      name="LMSCourseID"
                      value={courseData.LMSCourseID || ''}
                      disabled
                      className={`mt-1 block w-full p-2 border border-gray-200 bg-gray-100 rounded-md shadow-sm text-sm`}
                    />
                  </div>

                  {/* Course Version */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Version
                    </label>
                    <Select
                      name="CourseVersion"
                      value={
                        courseData.firebaseCourse ? "firebase" :
                        courseData.modernCourse ? "modern" : "original"
                      }
                      onValueChange={(value) => {
                        const updatedData = {
                          ...courseData,
                          modernCourse: value === "modern",
                          firebaseCourse: value === "firebase"
                        };
                        onCourseUpdate(updatedData);
                        const db = getDatabase();
                        const courseRef = ref(db, `courses/${selectedCourseId}`);
                        update(courseRef, {
                          modernCourse: value === "modern",
                          firebaseCourse: value === "firebase"
                        })
                          .then(() => console.log('Updated Course Version'))
                          .catch((error) => alert('Error updating course version'));
                      }}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="firebase">Firebase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Active */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Active
                    </label>
                    <Select
                      name="Active"
                      value={courseData.Active}
                      onValueChange={(value) => handleSelectChange(value, "Active")}
                      disabled={!isEditing}
                      >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select active status" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {courseData.Active === 'Custom' && (
                      <input
                        type="text"
                        name="ActiveCustom"
                        value={courseData.ActiveCustom || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`${inputClass} mt-2`}
                        placeholder="Enter custom value"
                      />
                    )}
                  </div>

                  {/* Show Stats Switch */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Show Course Statistics</span>
                      <Switch
                        checked={courseData.showStats || false}
                        onCheckedChange={handleStatsChange}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Enable to display course statistics to students
                    </p>
                  </div>

                  {/* LTI Links Switch - NEW FEATURE */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>LTI Links Complete</span>
                      <Switch
                        checked={courseData.ltiLinksComplete || false}
                        onCheckedChange={handleLtiLinksChange}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Indicate that all LTI links have been created for this course
                    </p>
                  </div>

                  {/* Course Credits - NEW FIELD */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Credits
                    </label>
                    <input
                      type="number"
                      name="courseCredits"
                      value={courseData.courseCredits || ''}
                      onChange={handleNumberInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="Enter number of credits"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the number of credits this course is worth
                    </p>
                  </div>

                  {/* Minimum Completion Months - NEW FIELD */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Completion Months
                    </label>
                    <input
                      type="number"
                      name="minCompletionMonths"
                      value={courseData.minCompletionMonths || ''}
                      onChange={handleNumberInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="Enter minimum months"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum number of months required to complete this course
                    </p>
                  </div>

                  {/* Recommended Completion Months - NEW FIELD */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Recommended Completion Months
                    </label>
                    <input
                      type="number"
                      name="recommendedCompletionMonths"
                      value={courseData.recommendedCompletionMonths || ''}
                      onChange={handleNumberInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      min="0"
                      step="1"
                      placeholder="Enter recommended months"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended time frame to complete this course
                    </p>
                  </div>

                  {/* Diploma Course */}
                  <div className="w-full px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diploma Course
                    </label>
                    <div className="flex space-x-4 items-start">
                      <div className="w-1/3">
                        <Select
                          name="DiplomaCourse"
                          value={courseData.DiplomaCourse}
                          onValueChange={(value) => handleSelectChange(value, "DiplomaCourse")}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Diploma Course" />
                          </SelectTrigger>
                          <SelectContent>
                            {diplomaCourseOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {courseData.DiplomaCourse === 'Yes' && (
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="outline" 
                              type="button"
                              disabled={!isEditing}
                              className="flex-shrink-0"
                            >
                              <FaClock className="mr-2" /> Manage Diploma Times
                            </Button>
                          </SheetTrigger>
                          <SheetContent 
                            side="right" 
                            className="w-[400px] sm:w-[540px]"
                            description="Manage diploma exam times for this course"
                          >
                            <SheetHeader>
                              <SheetTitle>Diploma Times Management</SheetTitle>
                              <SheetDescription>
                                Add and manage diploma exam times for this course. Each time can have a specific date, time, month, and confirmation status.
                              </SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-200px)] mt-6">
                              <div className="pr-4">
                                <DiplomaTimes
                                  courseId={selectedCourseId}
                                  diplomaTimes={courseData.diplomaTimes || []}
                                  isEditing={isEditing}
                                />
                              </div>
                            </ScrollArea>
                          </SheetContent>
                        </Sheet>
                      )}
                    </div>
                  </div>

                  {/* Course Type */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Type
                    </label>
                    <Select
                      name="CourseType"
                      value={courseData.CourseType || ''}
                      onValueChange={(value) => handleSelectChange(value, "CourseType")}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select course type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Option">Option</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    {courseData.CourseType === 'Custom' && (
                      <input
                        type="text"
                        name="CourseTypeCustom"
                        value={courseData.CourseTypeCustom || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`${inputClass} mt-2`}
                        placeholder="Enter custom value"
                      />
                    )}
                  </div>

                  {/* Number of Hours to Complete */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Hours to Complete
                    </label>
                    <input
                      type="number"
                      name="NumberOfHours"
                      value={courseData.NumberOfHours || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Specify the total number of hours required to complete the course.
                    </p>
                  </div>

                  {/* Grade */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Grade
                    </label>
                    <input
                      type="text"
                      name="grade"
                      value={courseData.grade || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      placeholder="Enter grade"
                    />
                  </div>

                  {/* Course Description */}
                  <div className="w-full px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Description
                    </label>
                    <Textarea
                      name="description"
                      value={courseData.description || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={inputClass}
                      placeholder="Enter course description"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Provide a detailed description of the course that will be visible to students.
                    </p>
                  </div>

                  {/* Allow Student-to-Student Chats */}
                  <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                      <span>Allow Student-to-Student Chats</span>
                      <Switch
                        checked={courseData.allowStudentChats || false}
                        onCheckedChange={handleSwitchChange}
                        disabled={!isEditing}
                        className="ml-2"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      When enabled, students can chat with other students in this course.
                    </p>
                  </div>

                  {/* Teachers (Using ReactSelect for multi-select) */}
                  <div className="w-full md:w-1/2 lg:w-2/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Teachers
                    </label>
                    <ReactSelect
                      isMulti
                      name="Teachers"
                      options={staffMembers}
                      value={staffMembers.filter(
                        (staff) =>
                          courseData.Teachers &&
                          courseData.Teachers.includes(staff.value)
                      )}
                      onChange={handleMultiSelectChange}
                      isDisabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  {/* Support Staff (Using ReactSelect for multi-select) */}
                  <div className="w-full md:w-1/2 lg:w-2/3 px-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Support Staff
                    </label>
                    <ReactSelect
                      isMulti
                      name="SupportStaff"
                      options={staffMembers}
                      value={staffMembers.filter(
                        (staff) =>
                          courseData.SupportStaff &&
                          courseData.SupportStaff.includes(staff.value)
                      )}
                      onChange={handleMultiSelectChange}
                      isDisabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Course Content - Different displays for Firebase vs regular courses */}
              <div className="mt-8">
                {courseData.firebaseCourse ? (
                  // Firebase Course - Show database configuration with sync controls
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Firebase Course Configuration</h3>
                      <DatabaseCourseConfig courseId={selectedCourseId} isEditing={isEditing} />
                    </div>
                  </div>
                ) : (
                  // Regular Course - Show editable units
                  <CourseUnitsEditor
                    courseId={selectedCourseId}
                    units={courseData.units || []}
                    onUnitsChange={handleUnitsChange}
                    isEditing={isEditing}
                  />
                )}
              </div>
            </form>
          </div>
        ) : (
          <p>Select a course to view details.</p>
        )}
      </div>

      {/* Delete Course Dialog */}
      <DeleteCourseDialog
        isOpen={deleteDialogOpen}
        setIsOpen={setDeleteDialogOpen}
        courseId={selectedCourseForDeletion?.id}
        courseTitle={selectedCourseForDeletion?.title}
        onDeleteComplete={() => {
          setSelectedCourseForDeletion(null);
          if (selectedCourseId === selectedCourseForDeletion?.id) {
            onCourseSelect(null);
            onCourseUpdate({});
          }
        }}
        onDelete={handleDeleteCourse}
      />

    
    </div>
  );
}

export default Courses;