import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { 
  Filter, 
  X, 
  CalendarIcon, 
  ArrowDownUp, 
  BarChart4, 
  RefreshCw,
  Save,
  BookOpen,
  MoreHorizontal,
  Trash,
  Users,
  User,
  Laptop,
  BookOpen as BookOpenIcon,
  GraduationCap,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDatabase, ref, set, get, remove, onValue, off } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "../components/ui/tabs";

// Simplified helper function to extract month from date
const extractMonthFromDate = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return null;
  
  try {
    // For YYYY-MM-DD format
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        return parts[1]; // Gets "12" from "2024-12-12"
      }
    }
    
    // For other formats, create a Date object
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    // Extract month as string with leading zero (01-12)
    return String(date.getMonth() + 1).padStart(2, '0');
  } catch (error) {
    console.error("Error extracting month:", error);
    return null;
  }
};

const PasiRecordsFilter = ({ 
  pasiStudentSummariesCombined, 
  onFilteredDataChange,
  searchTerm, setSearchTerm,
  
 
  courseFilter, setCourseFilter,
  dateRangeStart, setDateRangeStart,
  dateRangeEnd, setDateRangeEnd,
  hasGradeFilter, setHasGradeFilter,
  noGradeFilter, setNoGradeFilter,
  hasMultipleRecordsFilter, setHasMultipleRecordsFilter,
  workItemsFilter, setWorkItemsFilter,
  startDateRange, setStartDateRange,
  assignmentDateRange, setAssignmentDateRange,
  resumingOnDateRange, setResumingOnDateRange,
  scheduleEndDateRange, setScheduleEndDateRange,
  selectedMonths, setSelectedMonths,
  hasCom1255Filter, setHasCom1255Filter,
  noCom1255Filter, setNoCom1255Filter,
  hasInf2020Filter, setHasInf2020Filter,
  noInf2020Filter, setNoInf2020Filter,
  studentTypeFilter, setStudentTypeFilter,
  activeStatusFilter, setActiveStatusFilter,
  diplomaMonthFilter, setDiplomaMonthFilter,
  statusValueFilter, setStatusValueFilter,
  paymentStatusFilter, setPaymentStatusFilter,
  approvedFilter, setApprovedFilter,
  deletedFilter, setDeletedFilter,
  dualEnrolmentFilter, setDualEnrolmentFilter,
  schoolEnrolmentFilter, setSchoolEnrolmentFilter,
  pasiStatusFilter, setPasiStatusFilter,
  pasiWorkItemsFilter, setPasiWorkItemsFilter,
  pasiTermFilter, setPasiTermFilter,
  
  openAccordionItems,
  setOpenAccordionItems
}) => {
  // Filter states
  const [filterApplied, setFilterApplied] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  // Add a state to store filtered records
  const [filteredRecords, setFilteredRecords] = useState([]);


  // Saved configurations states
  const [myConfigs, setMyConfigs] = useState([]);
  const [teamConfigs, setTeamConfigs] = useState([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [configName, setConfigName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState(null);
  const [activeConfigTab, setActiveConfigTab] = useState("myconfigs");
  const [staffMembers, setStaffMembers] = useState({});
  
  // Auth context to get current user
  const { user_email_key, user } = useAuth();
  
  // List of months for the UI
  const monthsList = [
    { name: "January", value: "01" },
    { name: "February", value: "02" },
    { name: "March", value: "03" },
    { name: "April", value: "04" },
    { name: "May", value: "05" },
    { name: "June", value: "06" },
    { name: "July", value: "07" },
    { name: "August", value: "08" },
    { name: "September", value: "09" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" }
  ];
  
  // Extract available options from data for filter dropdowns
  const filterOptions = useMemo(() => {
    if (!pasiStudentSummariesCombined) return { 
      statuses: [], 
      terms: [], 
      courses: [],
      workItems: [],
      studentTypes: [],
      activeStatuses: [],
      diplomaMonths: [],
      statusValues: [],
      paymentStatuses: [],
      approved: [],
      deleted: [],
      dualEnrolment: [],
      schoolEnrolment: [],
      pasiStatuses: [],
      pasiWorkItems: [],
      pasiTerms: []
    };
    
    const statuses = [...new Set(pasiStudentSummariesCombined.map(record => record.status).filter(Boolean))];
    
    // Get terms from both main records and nested multipleRecords
    const terms = new Set();
    pasiStudentSummariesCombined.forEach(record => {
      // Add main record term
      if (record.term) terms.add(record.term);
      if (record.pasiTerm) terms.add(record.pasiTerm);
      
      // Add terms from multiple records
      if (record.multipleRecords && record.multipleRecords.length > 0) {
        record.multipleRecords.forEach(subRecord => {
          if (subRecord.term) terms.add(subRecord.term);
        });
      }
    });
    
    const courses = [...new Set(pasiStudentSummariesCombined.map(record => record.courseCode).filter(Boolean))];
    const workItems = [...new Set(pasiStudentSummariesCombined.map(record => record.workItems).filter(Boolean))];
    
    // Extract YourWay related options
    const studentTypes = [...new Set(pasiStudentSummariesCombined.map(record => record.StudentType_Value).filter(Boolean))];
    const activeStatuses = [...new Set(pasiStudentSummariesCombined.map(record => record.ActiveFutureArchived_Value).filter(Boolean))];
    const diplomaMonths = [...new Set(pasiStudentSummariesCombined.map(record => record.DiplomaMonthChoices_Value).filter(Boolean))];
    const statusValues = [...new Set(pasiStudentSummariesCombined.map(record => record.Status_Value).filter(Boolean))];
    const paymentStatuses = [...new Set(pasiStudentSummariesCombined.map(record => record.payment_status).filter(Boolean))];
    
    // Extract PASI related options
    const approved = [...new Set(pasiStudentSummariesCombined.map(record => record.approved).filter(Boolean))];
    const deleted = [...new Set(pasiStudentSummariesCombined.map(record => record.deleted).filter(Boolean))];
    const dualEnrolment = [...new Set(pasiStudentSummariesCombined.map(record => record.dualEnrolment).filter(Boolean))];
    const schoolEnrolment = [...new Set(pasiStudentSummariesCombined.map(record => record.schoolEnrolment).filter(Boolean))];
    const pasiStatuses = [...new Set(pasiStudentSummariesCombined.map(record => record.status).filter(Boolean))];
    const pasiWorkItems = [...new Set(pasiStudentSummariesCombined.map(record => record.workItems).filter(Boolean))];
    const pasiTerms = [...new Set(pasiStudentSummariesCombined.map(record => record.pasiTerm).filter(Boolean))];
    
    return { 
      statuses: statuses.sort(), 
      terms: [...terms].sort(), 
      courses: courses.sort(),
      workItems: workItems.sort(),
      studentTypes: studentTypes.sort(),
      activeStatuses: activeStatuses.sort(),
      diplomaMonths: diplomaMonths.sort(),
      statusValues: statusValues.sort(),
      paymentStatuses: paymentStatuses.sort(),
      approved: approved.sort(),
      deleted: deleted.sort(),
      dualEnrolment: dualEnrolment.sort(),
      schoolEnrolment: schoolEnrolment.sort(),
      pasiStatuses: pasiStatuses.sort(),
      pasiWorkItems: pasiWorkItems.sort(),
      pasiTerms: pasiTerms.sort()
    };
  }, [pasiStudentSummariesCombined]);
  
  // Helper for date range filtering
  const isWithinDateRange = (date, range) => {
    if (!date) return false;
    const d = new Date(date);
    if (isNaN(d.getTime())) return false;
    
    if (range.from && d < range.from) return false;
    if (range.to) {
      const inclusiveTo = new Date(range.to);
      inclusiveTo.setDate(inclusiveTo.getDate() + 1);
      if (d >= inclusiveTo) return false;
    }
    return true;
  };

  // Load staff members
  useEffect(() => {
    const db = getDatabase();
    const staffRef = ref(db, 'staff');
    
    const handleStaffData = (snapshot) => {
      if (snapshot.exists()) {
        setStaffMembers(snapshot.val());
      }
    };
    
    // Set up listener
    onValue(staffRef, handleStaffData);
    
    // Clean up listener
    return () => off(staffRef);
  }, []);

  // Load saved configurations on component mount
  useEffect(() => {
    if (user_email_key) {
      loadSavedConfigurations();
    }
  }, [user_email_key]);

  // Load saved filter configurations from Firebase
  const loadSavedConfigurations = async () => {
    try {
      const db = getDatabase();
      
      // Get my configurations
      const myConfigsRef = ref(db, `staff/${user_email_key}/savedFilterConfigs/pasiRecords`);
      const mySnapshot = await get(myConfigsRef);
      
      if (mySnapshot.exists()) {
        const configs = mySnapshot.val();
        setMyConfigs(Object.entries(configs).map(([id, config]) => ({
          id,
          name: config.name,
          timestamp: config.timestamp,
          filters: config.filters,
          owner: user_email_key,
          isOwner: true
        })));
      } else {
        setMyConfigs([]);
      }
      
      // Get all staff configurations
      const staffRef = ref(db, 'staff');
      const staffSnapshot = await get(staffRef);
      
      if (staffSnapshot.exists()) {
        const staffData = staffSnapshot.val();
        let allTeamConfigs = [];
        
        // Go through each staff member
        await Promise.all(Object.entries(staffData).map(async ([staffKey, staffData]) => {
          // Skip current user since we already loaded those
          if (staffKey === user_email_key) return;
          
          const staffConfigsRef = ref(db, `staff/${staffKey}/savedFilterConfigs/pasiRecords`);
          const staffConfigsSnapshot = await get(staffConfigsRef);
          
          if (staffConfigsSnapshot.exists()) {
            const staffConfigs = staffConfigsSnapshot.val();
            
            const configsArray = Object.entries(staffConfigs).map(([id, config]) => ({
              id,
              name: config.name,
              timestamp: config.timestamp,
              filters: config.filters,
              owner: staffKey,
              ownerName: staffData.displayName || staffKey,
              isOwner: false
            }));
            
            allTeamConfigs = [...allTeamConfigs, ...configsArray];
          }
        }));
        
        // Sort by most recent first
        allTeamConfigs.sort((a, b) => b.timestamp - a.timestamp);
        setTeamConfigs(allTeamConfigs);
      }
    } catch (error) {
      console.error("Error loading saved configurations:", error);
    }
  };

  // Get the staff member display name
  const getStaffDisplayName = (emailKey) => {
    if (!staffMembers || !staffMembers[emailKey]) return emailKey;
    const staff = staffMembers[emailKey];
    return staff.displayName || emailKey;
  };

  // Save current filter configuration
  const saveCurrentConfiguration = async () => {
    if (!configName.trim()) return;
    
    try {
      const db = getDatabase();
      const configId = Date.now().toString();
      const configsRef = ref(db, `staff/${user_email_key}/savedFilterConfigs/pasiRecords/${configId}`);
      
      const currentFilters = {
        searchTerm,
        courseFilter,
        dateRangeStart: dateRangeStart ? dateRangeStart.getTime() : null,
        dateRangeEnd: dateRangeEnd ? dateRangeEnd.getTime() : null,
        hasGradeFilter,
        noGradeFilter,
        hasMultipleRecordsFilter,
        workItemsFilter,
        hasCom1255Filter,
        noCom1255Filter,
        hasInf2020Filter,
        noInf2020Filter,
        studentTypeFilter,
        activeStatusFilter,
        diplomaMonthFilter,
        statusValueFilter,
        paymentStatusFilter,
        approvedFilter,
        deletedFilter,
        dualEnrolmentFilter,
        schoolEnrolmentFilter,
        pasiStatusFilter,
        pasiWorkItemsFilter,
        pasiTermFilter,
        startDateRange: {
          from: startDateRange.from ? startDateRange.from.getTime() : null,
          to: startDateRange.to ? startDateRange.to.getTime() : null
        },
        assignmentDateRange: {
          from: assignmentDateRange.from ? assignmentDateRange.from.getTime() : null,
          to: assignmentDateRange.to ? assignmentDateRange.to.getTime() : null
        },
        resumingOnDateRange: {
          from: resumingOnDateRange.from ? resumingOnDateRange.from.getTime() : null,
          to: resumingOnDateRange.to ? resumingOnDateRange.to.getTime() : null
        },
        scheduleEndDateRange: {
          from: scheduleEndDateRange.from ? scheduleEndDateRange.from.getTime() : null,
          to: scheduleEndDateRange.to ? scheduleEndDateRange.to.getTime() : null
        },
        selectedMonths
      };
      
      await set(configsRef, {
        name: configName,
        timestamp: Date.now(),
        filters: currentFilters
      });
      
      setConfigName("");
      setIsSaveDialogOpen(false);
      loadSavedConfigurations();
    } catch (error) {
      console.error("Error saving filter configuration:", error);
    }
  };

  // Load a saved configuration
  const loadConfiguration = (config) => {
    const filters = config.filters;
    
    setSearchTerm(filters.searchTerm || "");
    setCourseFilter(filters.courseFilter || []);
    setDateRangeStart(filters.dateRangeStart ? new Date(filters.dateRangeStart) : null);
    setDateRangeEnd(filters.dateRangeEnd ? new Date(filters.dateRangeEnd) : null);
    setHasGradeFilter(filters.hasGradeFilter || false);
    setNoGradeFilter(filters.noGradeFilter || false);
    setHasMultipleRecordsFilter(filters.hasMultipleRecordsFilter || false);
    setWorkItemsFilter(filters.workItemsFilter || []);
    
    // Load course requirement filters
    setHasCom1255Filter(filters.hasCom1255Filter || false);
    setNoCom1255Filter(filters.noCom1255Filter || false);
    setHasInf2020Filter(filters.hasInf2020Filter || false);
    setNoInf2020Filter(filters.noInf2020Filter || false);
    
    // Load YourWay related filters
    setStudentTypeFilter(filters.studentTypeFilter || []);
    setActiveStatusFilter(filters.activeStatusFilter || []);
    setDiplomaMonthFilter(filters.diplomaMonthFilter || []);
    setStatusValueFilter(filters.statusValueFilter || []);
    setPaymentStatusFilter(filters.paymentStatusFilter || []);
    
    // Load PASI related filters
    setApprovedFilter(filters.approvedFilter || []);
    setDeletedFilter(filters.deletedFilter || []);
    setDualEnrolmentFilter(filters.dualEnrolmentFilter || []);
    setSchoolEnrolmentFilter(filters.schoolEnrolmentFilter || []);
    setPasiStatusFilter(filters.pasiStatusFilter || []);
    setPasiWorkItemsFilter(filters.pasiWorkItemsFilter || []);
    setPasiTermFilter(filters.pasiTermFilter || []);
    
    setStartDateRange({
      from: filters.startDateRange?.from ? new Date(filters.startDateRange.from) : null,
      to: filters.startDateRange?.to ? new Date(filters.startDateRange.to) : null
    });
    
    setAssignmentDateRange({
      from: filters.assignmentDateRange?.from ? new Date(filters.assignmentDateRange.from) : null,
      to: filters.assignmentDateRange?.to ? new Date(filters.assignmentDateRange.to) : null
    });
    
    setResumingOnDateRange({
      from: filters.resumingOnDateRange?.from ? new Date(filters.resumingOnDateRange.from) : null,
      to: filters.resumingOnDateRange?.to ? new Date(filters.resumingOnDateRange.to) : null
    });
    
    setScheduleEndDateRange({
      from: filters.scheduleEndDateRange?.from ? new Date(filters.scheduleEndDateRange.from) : null,
      to: filters.scheduleEndDateRange?.to ? new Date(filters.scheduleEndDateRange.to) : null
    });
    
    setSelectedMonths(filters.selectedMonths || []);
  };

  // Delete a saved configuration
  const deleteConfiguration = async () => {
    if (!configToDelete || !configToDelete.isOwner) return;
    
    try {
      const db = getDatabase();
      const configRef = ref(db, `staff/${configToDelete.owner}/savedFilterConfigs/pasiRecords/${configToDelete.id}`);
      await remove(configRef);
      
      setIsDeleteDialogOpen(false);
      setConfigToDelete(null);
      loadSavedConfigurations();
    } catch (error) {
      console.error("Error deleting filter configuration:", error);
    }
  };

  // Setup confirmation for deletion
  const confirmDelete = (config) => {
    // Only allow deletion if the user is the owner
    if (!config.isOwner) return;
    
    setConfigToDelete(config);
    setIsDeleteDialogOpen(true);
  };

  // Apply filters and return filtered data to parent
  const applyFilters = () => {
    if (!pasiStudentSummariesCombined) {
      setFilteredRecords([]);
      onFilteredDataChange([]);
      return;
    }
    
    const filteredData = pasiStudentSummariesCombined.filter(record => {
      // Search term filter (search across multiple fields)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const mainRecordMatch = 
          (record.studentName || '').toLowerCase().includes(searchLower) ||
          (record.courseCode || '').toLowerCase().includes(searchLower) ||
          (record.asn || '').toLowerCase().includes(searchLower) ||
          (record.term || record.pasiTerm || '').toLowerCase().includes(searchLower) ||
          (record.status || '').toLowerCase().includes(searchLower) ||
          (record.value || '').toLowerCase().includes(searchLower) ||
          (record.exitDate || '').toLowerCase().includes(searchLower) ||
          (record.startDateFormatted || '').toLowerCase().includes(searchLower) ||
          (record.workItems || '').toLowerCase().includes(searchLower);
        
        // Search in multiple records if they exist
        const multipleRecordsMatch = record.multipleRecords && record.multipleRecords.some(subRecord => 
          (subRecord.term || '').toLowerCase().includes(searchLower) ||
          (subRecord.status || '').toLowerCase().includes(searchLower) ||
          (subRecord.exitDate || '').toLowerCase().includes(searchLower) ||
          (subRecord.workItems || '').toLowerCase().includes(searchLower)
        );
        
        if (!mainRecordMatch && !multipleRecordsMatch) return false;
      }
      
  

      
      // Course filter
      if (courseFilter.length > 0 && record.courseCode && !courseFilter.includes(record.courseCode)) {
        return false;
      }
      
      // Date range filter for registration date
      if (dateRangeStart || dateRangeEnd) {
        // Get the date to compare against
        let dateToCompare;
        
        try {
          // Try to parse the startDateFormatted field
          if (record.startDateFormatted && record.startDateFormatted !== 'N/A') {
            dateToCompare = new Date(record.startDateFormatted);
          } 
          // Fallback to startDate if it exists
          else if (record.startDate) {
            // Check if it's a timestamp
            if (!isNaN(record.startDate)) {
              dateToCompare = new Date(parseInt(record.startDate));
            } else {
              dateToCompare = new Date(record.startDate);
            }
          }
          
          // Check if the date is valid
          if (dateToCompare && isNaN(dateToCompare.getTime())) {
            dateToCompare = null;
          }
        } catch (error) {
          console.error("Error parsing date for filtering:", error);
          dateToCompare = null;
        }
        
        // Apply date range filter if we have a valid date to compare
        if (dateToCompare) {
          if (dateRangeStart && dateToCompare < dateRangeStart) return false;
          if (dateRangeEnd) {
            // Add one day to make the end date inclusive
            const endDateInclusive = new Date(dateRangeEnd);
            endDateInclusive.setDate(endDateInclusive.getDate() + 1);
            if (dateToCompare >= endDateInclusive) return false;
          }
        } else if (dateRangeStart || dateRangeEnd) {
          // If we couldn't parse the date but a date filter is active, exclude this record
          return false;
        }
      }
      
      // Month filter for start date - UPDATED: Only apply to startDateFormatted
      if (selectedMonths.length > 0) {
        // Only check startDateFormatted field for month filtering
        if (!record.startDateFormatted || record.startDateFormatted === 'N/A') return false;
        
        const monthValue = extractMonthFromDate(record.startDateFormatted);
        if (!monthValue || !selectedMonths.includes(monthValue)) return false;
      }
      
      // Date range filters for each field
      if (startDateRange.from || startDateRange.to) {
        if (!isWithinDateRange(record.startDate, startDateRange)) return false;
      }
      if (assignmentDateRange.from || assignmentDateRange.to) {
        if (!isWithinDateRange(record.assignmentDate, assignmentDateRange)) return false;
      }
      if (resumingOnDateRange.from || resumingOnDateRange.to) {
        if (!isWithinDateRange(record.resumingOnDate, resumingOnDateRange)) return false;
      }
      if (scheduleEndDateRange.from || scheduleEndDateRange.to) {
        if (!isWithinDateRange(record.ScheduleEndDate, scheduleEndDateRange)) return false;
      }

      // Has Grade / No Grade filter
      if (hasGradeFilter && (!record.value || record.value === '-' || record.value === 'N/A')) {
        return false;
      }
      
      if (noGradeFilter && record.value && record.value !== '-' && record.value !== 'N/A') {
        return false;
      }
      
      // Has Multiple Records filter
      if (hasMultipleRecordsFilter && (!record.multipleRecords || record.multipleRecords.length <= 1)) {
        return false;
      }
      
      // Work Items filter
      if (workItemsFilter.length > 0) {
        if (!record.workItems) return false;
        if (!workItemsFilter.includes(record.workItems)) return false;
      }
      
      // COM1255 and INF2020 filters
      if (hasCom1255Filter) {
        if (!record.pasiRecords || !record.pasiRecords.com1255) return false;
      }
      
      if (noCom1255Filter) {
        if (record.pasiRecords && record.pasiRecords.com1255) return false;
      }
      
      if (hasInf2020Filter) {
        if (!record.pasiRecords || !record.pasiRecords.inf2020) return false;
      }
      
      if (noInf2020Filter) {
        if (record.pasiRecords && record.pasiRecords.inf2020) return false;
      }
      
      // YourWay Related filters
      if (studentTypeFilter.length > 0) {
        if (!record.StudentType_Value) return false;
        if (!studentTypeFilter.includes(record.StudentType_Value)) return false;
      }
      
      if (activeStatusFilter.length > 0) {
        if (!record.ActiveFutureArchived_Value) return false;
        if (!activeStatusFilter.includes(record.ActiveFutureArchived_Value)) return false;
      }
      
      if (diplomaMonthFilter.length > 0) {
        if (!record.DiplomaMonthChoices_Value) return false;
        if (!diplomaMonthFilter.includes(record.DiplomaMonthChoices_Value)) return false;
      }
      
      if (statusValueFilter.length > 0) {
        if (!record.Status_Value) return false;
        if (!statusValueFilter.includes(record.Status_Value)) return false;
      }
      
      if (paymentStatusFilter.length > 0) {
        if (!record.payment_status) return false;
        if (!paymentStatusFilter.includes(record.payment_status)) return false;
      }
      
      // PASI Related filters
      if (approvedFilter.length > 0) {
        if (!record.approved) return false;
        if (!approvedFilter.includes(record.approved)) return false;
      }
      
      if (deletedFilter.length > 0) {
        if (!record.deleted) return false;
        if (!deletedFilter.includes(record.deleted)) return false;
      }
      
      if (dualEnrolmentFilter.length > 0) {
        if (!record.dualEnrolment) return false;
        if (!dualEnrolmentFilter.includes(record.dualEnrolment)) return false;
      }
      
      if (schoolEnrolmentFilter.length > 0) {
        if (!record.schoolEnrolment) return false;
        if (!schoolEnrolmentFilter.includes(record.schoolEnrolment)) return false;
      }
      
      if (pasiStatusFilter.length > 0) {
        if (!record.status) return false;
        if (!pasiStatusFilter.includes(record.status)) return false;
      }
      
      if (pasiWorkItemsFilter.length > 0) {
        if (!record.workItems) return false;
        if (!pasiWorkItemsFilter.includes(record.workItems)) return false;
      }
      
      if (pasiTermFilter.length > 0) {
        if (!record.pasiTerm) return false;
        if (!pasiTermFilter.includes(record.pasiTerm)) return false;
      }
      
      // All filters passed
      return true;
    });
    
    // Set filter applied flag and count
    setFilterApplied(
      searchTerm || 
      courseFilter.length > 0 || 
      dateRangeStart || 
      dateRangeEnd || 
      hasGradeFilter || 
      noGradeFilter || 
      hasMultipleRecordsFilter ||
      workItemsFilter.length > 0 || 
      hasCom1255Filter ||
      noCom1255Filter ||
      hasInf2020Filter ||
      noInf2020Filter ||
      studentTypeFilter.length > 0 ||
      activeStatusFilter.length > 0 ||
      diplomaMonthFilter.length > 0 ||
      statusValueFilter.length > 0 ||
      paymentStatusFilter.length > 0 ||
      approvedFilter.length > 0 ||
      deletedFilter.length > 0 ||
      dualEnrolmentFilter.length > 0 ||
      schoolEnrolmentFilter.length > 0 ||
      pasiStatusFilter.length > 0 ||
      pasiWorkItemsFilter.length > 0 ||
      pasiTermFilter.length > 0 ||
      startDateRange.from || 
      startDateRange.to ||
      assignmentDateRange.from ||
      assignmentDateRange.to || 
      resumingOnDateRange.from ||
      resumingOnDateRange.to || 
      scheduleEndDateRange.from || 
      scheduleEndDateRange.to ||
      selectedMonths.length > 0 
    );
    
    // Calculate active filter count
    let count = 0;
    if (searchTerm) count++;
    if (courseFilter.length > 0) count++;
    if (dateRangeStart || dateRangeEnd) count++;
    if (hasGradeFilter) count++;
    if (noGradeFilter) count++;
    if (hasMultipleRecordsFilter) count++;
    if (workItemsFilter.length > 0) count++;
    if (hasCom1255Filter) count++;
    if (noCom1255Filter) count++;
    if (hasInf2020Filter) count++;
    if (noInf2020Filter) count++;
    if (studentTypeFilter.length > 0) count++;
    if (activeStatusFilter.length > 0) count++;
    if (diplomaMonthFilter.length > 0) count++;
    if (statusValueFilter.length > 0) count++;
    if (paymentStatusFilter.length > 0) count++;
    if (approvedFilter.length > 0) count++;
    if (deletedFilter.length > 0) count++;
    if (dualEnrolmentFilter.length > 0) count++;
    if (schoolEnrolmentFilter.length > 0) count++;
    if (pasiStatusFilter.length > 0) count++;
    if (pasiWorkItemsFilter.length > 0) count++;
    if (pasiTermFilter.length > 0) count++;
    if (startDateRange.from || startDateRange.to) count++;
    if (assignmentDateRange.from || assignmentDateRange.to) count++;
    if (resumingOnDateRange.from || resumingOnDateRange.to) count++;
    if (scheduleEndDateRange.from || scheduleEndDateRange.to) count++;
    if (selectedMonths.length > 0) count++;
    
    setFilterCount(count);
    
    // Store filtered data in local state
    setFilteredRecords(filteredData);
    
    // Return filtered data to parent
    onFilteredDataChange(filteredData, count);
  };
  
  // Apply filters on mount or when filter settings change
  useEffect(() => {
    applyFilters();
  }, [
    searchTerm, 
    courseFilter, 
    dateRangeStart, 
    dateRangeEnd, 
    hasGradeFilter, 
    noGradeFilter, 
    hasMultipleRecordsFilter,
    workItemsFilter,
    hasCom1255Filter,
    noCom1255Filter,
    hasInf2020Filter,
    noInf2020Filter,
    studentTypeFilter,
    activeStatusFilter,
    diplomaMonthFilter,
    statusValueFilter,
    paymentStatusFilter,
    approvedFilter,
    deletedFilter,
    dualEnrolmentFilter,
    schoolEnrolmentFilter,
    pasiStatusFilter,
    pasiWorkItemsFilter,
    pasiTermFilter,
    pasiStudentSummariesCombined,
    startDateRange,
    assignmentDateRange,
    resumingOnDateRange,
    scheduleEndDateRange,
    selectedMonths
  ]);
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
   
    setCourseFilter([]);
    setDateRangeStart(null);
    setDateRangeEnd(null);
    setHasGradeFilter(false);
    setNoGradeFilter(false);
    setHasMultipleRecordsFilter(false);
    setWorkItemsFilter([]);
    setHasCom1255Filter(false);
    setNoCom1255Filter(false);
    setHasInf2020Filter(false);
    setNoInf2020Filter(false);
    setStudentTypeFilter([]);
    setActiveStatusFilter([]);
    setDiplomaMonthFilter([]);
    setStatusValueFilter([]);
    setPaymentStatusFilter([]);
    setApprovedFilter([]);
    setDeletedFilter([]);
    setDualEnrolmentFilter([]);
    setSchoolEnrolmentFilter([]);
    setPasiStatusFilter([]);
    setPasiWorkItemsFilter([]);
    setPasiTermFilter([]);
    setStartDateRange({ from: null, to: null });
    setAssignmentDateRange({ from: null, to: null });
    setResumingOnDateRange({ from: null, to: null });
    setScheduleEndDateRange({ from: null, to: null });
    setSelectedMonths([]);
  };
  
  // Generate summary statistics
  const stats = useMemo(() => {
    if (!pasiStudentSummariesCombined) return {};
    
    const totalRecords = pasiStudentSummariesCombined.length;
    
    const statusCounts = {};
    const termCounts = {};
    const courseCounts = {};
    
    // Count COM1255 and INF2020
    let com1255Count = 0;
    let inf2020Count = 0;
    
    pasiStudentSummariesCombined.forEach(record => {
      // Count statuses
      if (record.status) {
        statusCounts[record.status] = (statusCounts[record.status] || 0) + 1;
      }
      
      // Count terms
      const term = record.term || record.pasiTerm;
      if (term) {
        termCounts[term] = (termCounts[term] || 0) + 1;
      }
      
      // Count courses
      if (record.courseCode) {
        courseCounts[record.courseCode] = (courseCounts[record.courseCode] || 0) + 1;
      }
      
      // Count COM1255 and INF2020
      if (record.pasiRecords) {
        if (record.pasiRecords.com1255) {
          com1255Count++;
        }
        if (record.pasiRecords.inf2020) {
          inf2020Count++;
        }
      }
    });
    
    return {
      totalRecords,
      statusCounts,
      termCounts,
      courseCounts,
      com1255Count,
      inf2020Count
    };
  }, [pasiStudentSummariesCombined]);
  
  // Helper function to render select dropdown for filter options
  const renderSelectFilter = (options, value, onChange, label) => {
    if (!options || options.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <Label htmlFor={`select-${label}`} className="text-sm">{label}</Label>
        <Select
          value={value.length === 1 ? value[0] : ""}
          onValueChange={(val) => onChange(val ? [val] : [])}
        >
          <SelectTrigger id={`select-${label}`} className="w-full">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option} value={option}>
                {option || "(Empty)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Show selected values if multiple are selected */}
        {value.length > 1 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {value.map(item => (
              <Badge 
                key={item} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {item || "(Empty)"}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => onChange(value.filter(v => v !== item))}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="search">Search</Label>
          
          {/* Saved Configurations Dropdown */}
          {(myConfigs.length > 0 || teamConfigs.length > 0) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Saved Filters</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <Tabs defaultValue="myconfigs" value={activeConfigTab} onValueChange={setActiveConfigTab}>
                  <div className="p-2">
                    <TabsList className="w-full">
                      <TabsTrigger value="myconfigs" className="flex items-center gap-1 flex-1">
                        <User className="h-3.5 w-3.5" />
                        <span>My Filters</span>
                      </TabsTrigger>
                      <TabsTrigger value="teamconfigs" className="flex items-center gap-1 flex-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>Team Filters</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="myconfigs" className="m-0">
                    {myConfigs.length > 0 ? (
                      myConfigs.map(config => (
                        <div key={config.id} className="px-1 py-1">
                          <div className="flex items-center justify-between gap-2">
                            <DropdownMenuItem
                              onClick={() => loadConfiguration(config)}
                              className="flex-grow cursor-pointer"
                            >
                              {config.name}
                            </DropdownMenuItem>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              onClick={() => confirmDelete(config)}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-2 px-2 text-sm text-muted-foreground">
                        You haven't saved any filters yet.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="teamconfigs" className="m-0">
                    {teamConfigs.length > 0 ? (
                      teamConfigs.map(config => (
                        <div key={`${config.owner}-${config.id}`} className="px-1 py-1 border-b last:border-b-0 border-border/40">
                          <div className="flex items-center justify-between gap-2">
                            <DropdownMenuItem
                              onClick={() => loadConfiguration(config)}
                              className="flex-grow cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span>{config.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  by {getStaffDisplayName(config.owner)}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-2 px-2 text-sm text-muted-foreground">
                        No team filters available.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Save Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSaveDialogOpen(true)}
            className={!myConfigs.length && !teamConfigs.length ? "flex items-center gap-1" : "hidden"}
          >
            <Save className="h-4 w-4" />
            <span>Save Filter</span>
          </Button>
        </div>
        
        <div className="relative">
          <Input
            id="search"
            type="text"
            placeholder="Search by name, ASN, course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 w-9 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Filter count badge */}
      <div className="flex items-center justify-between text-sm">
        {filterApplied && (
          <span className="text-muted-foreground">Active filters</span>
        )}
        <div className="flex space-x-2 ml-auto">
          {filterApplied && (
            <Badge variant="secondary">
              {filterCount} {filterCount === 1 ? 'filter' : 'filters'}
            </Badge>
          )}
          {/* Save Configuration Button */}
          {filterApplied && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaveDialogOpen(true)}
              className="flex items-center gap-1 h-6"
            >
              <Save className="h-3 w-3" />
              <span className="text-xs">Save</span>
            </Button>
          )}
        </div>
      </div>

      {/* Show total filtered records at the top */}
      <div className="flex items-center justify-end text-xs text-muted-foreground mb-2">
        Showing <span className="font-semibold mx-1">{filteredRecords?.length || 0}</span> record{filteredRecords?.length === 1 ? '' : 's'}
      </div>
      
      {/* Reset filters button */}
      {filterApplied && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <RefreshCw className="h-3 w-3 mr-2" /> Reset all filters
        </Button>
      )}
      
      {/* Accordion for filter sections */}
      <Accordion 
  type="multiple" 
  value={openAccordionItems} 
  onValueChange={setOpenAccordionItems}
  className="w-full space-y-2"
>
        {/* Course Requirements Filter */}
        <AccordionItem value="course-requirements">
          <AccordionTrigger className="text-sm py-2 bg-amber-100">
            <div className="flex items-center">
              <Laptop className="h-4 w-4 mr-2" />
              Course Requirements
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">COM1255 (E-Learning & LMS)</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasCom1255"
                      checked={hasCom1255Filter}
                      onCheckedChange={setHasCom1255Filter}
                    />
                    <Label htmlFor="hasCom1255" className="text-sm flex items-center">
                      Has COM1255
                      {stats.com1255Count > 0 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {stats.com1255Count}
                        </Badge>
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noCom1255"
                      checked={noCom1255Filter}
                      onCheckedChange={setNoCom1255Filter}
                    />
                    <Label htmlFor="noCom1255" className="text-sm flex items-center">
                      Missing COM1255
                      {stats.totalRecords && stats.com1255Count > 0 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {stats.totalRecords - stats.com1255Count}
                        </Badge>
                      )}
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">INF2020 (Computer Science 2)</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasInf2020"
                      checked={hasInf2020Filter}
                      onCheckedChange={setHasInf2020Filter}
                    />
                    <Label htmlFor="hasInf2020" className="text-sm flex items-center">
                      Has INF2020
                      {stats.inf2020Count > 0 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {stats.inf2020Count}
                        </Badge>
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noInf2020"
                      checked={noInf2020Filter}
                      onCheckedChange={setNoInf2020Filter}
                    />
                    <Label htmlFor="noInf2020" className="text-sm flex items-center">
                      Missing INF2020
                      {stats.totalRecords && stats.inf2020Count > 0 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {stats.totalRecords - stats.inf2020Count}
                        </Badge>
                      )}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* YourWay Related Filter */}
        <AccordionItem value="yourway-related">
          <AccordionTrigger className="text-sm py-2 bg-green-100">
            <div className="flex items-center">
              <BookOpenIcon className="h-4 w-4 mr-2" />
              YourWay Related
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Student Type Filter */}
              {renderSelectFilter(
                filterOptions.studentTypes,
                studentTypeFilter,
                setStudentTypeFilter,
                "Student Type"
              )}
              
              {/* Active/Future/Archived Status Filter */}
              {renderSelectFilter(
                filterOptions.activeStatuses,
                activeStatusFilter,
                setActiveStatusFilter,
                "Status"
              )}
              
              {/* Diploma Month Choices Filter */}
              {renderSelectFilter(
                filterOptions.diplomaMonths,
                diplomaMonthFilter,
                setDiplomaMonthFilter,
                "Diploma Month"
              )}
              
              {/* Status Value Filter */}
              {renderSelectFilter(
                filterOptions.statusValues,
                statusValueFilter,
                setStatusValueFilter,
                "Status Value"
              )}
              
              {/* Payment Status Filter */}
              {renderSelectFilter(
                filterOptions.paymentStatuses,
                paymentStatusFilter,
                setPaymentStatusFilter,
                "Payment Status"
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* PASI Related Filter */}
        <AccordionItem value="pasi-related">
          <AccordionTrigger className="text-sm py-2 bg-blue-100">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              PASI Related
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Approved Filter */}
              {renderSelectFilter(
                filterOptions.approved,
                approvedFilter,
                setApprovedFilter,
                "Approved"
              )}
              
              {/* Deleted Filter */}
              {renderSelectFilter(
                filterOptions.deleted,
                deletedFilter,
                setDeletedFilter,
                "Deleted"
              )}
              
              {/* Dual Enrolment Filter */}
              {renderSelectFilter(
                filterOptions.dualEnrolment,
                dualEnrolmentFilter,
                setDualEnrolmentFilter,
                "Dual Enrolment"
              )}
              
              {/* School Enrolment Filter */}
              {renderSelectFilter(
                filterOptions.schoolEnrolment,
                schoolEnrolmentFilter,
                setSchoolEnrolmentFilter,
                "School Enrolment"
              )}
              
              {/* PASI Status Filter */}
              {renderSelectFilter(
                filterOptions.pasiStatuses,
                pasiStatusFilter,
                setPasiStatusFilter,
                "PASI Status"
              )}
              
              {/* PASI Work Items Filter */}
              {renderSelectFilter(
                filterOptions.pasiWorkItems,
                pasiWorkItemsFilter,
                setPasiWorkItemsFilter,
                "Work Items"
              )}
              
              {/* PASI Term Filter */}
              {renderSelectFilter(
                filterOptions.pasiTerms,
                pasiTermFilter,
                setPasiTermFilter,
                "PASI Term"
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        
        {/* Course Filter */}
        <AccordionItem value="course">
          <AccordionTrigger className="text-sm py-2 bg-green-100">Course</AccordionTrigger>
          <AccordionContent>
            <div className="max-h-40 overflow-y-auto pr-2">
              <div className="flex flex-col gap-2 pt-2">
                {filterOptions.courses.map(course => (
                  <div key={course} className="flex items-center space-x-2">
                    <Checkbox
                      id={`course-${course}`}
                      checked={courseFilter.includes(course)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCourseFilter([...courseFilter, course]);
                        } else {
                          setCourseFilter(courseFilter.filter(c => c !== course));
                        }
                      }}
                    />
                    <Label htmlFor={`course-${course}`} className="text-sm flex items-center">
                      {course}
                      {stats.courseCounts && stats.courseCounts[course] && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {stats.courseCounts[course]}
                        </Badge>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Start Date Month Filter - Using 01-12 format */}
        <AccordionItem value="months">
          <AccordionTrigger className="text-sm py-2 bg-yellow-100">Start Date Months</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
              {monthsList.map((month) => (
                <div key={month.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`month-${month.value}`}
                    checked={selectedMonths.includes(month.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMonths([...selectedMonths, month.value]);
                      } else {
                        setSelectedMonths(selectedMonths.filter(m => m !== month.value));
                      }
                    }}
                  />
                  <Label htmlFor={`month-${month.value}`} className="text-sm">{month.name}</Label>
                </div>
              ))}
            </div>
            {selectedMonths.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMonths([])}
                className="mt-2"
              >
                <X className="h-4 w-4 mr-1" /> Clear months
              </Button>
            )}
          </AccordionContent>
        </AccordionItem>
        
        {/* Registration Date Filter */}
        <AccordionItem value="date">
          <AccordionTrigger className="text-sm py-2 bg-purple-100">Registration Date</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Start Date */}
                <div>
                  <Label htmlFor="startDate" className="text-sm">Start Date</Label>
                  <div className="relative mt-1">
                    <DatePicker
                      selected={dateRangeStart}
                      onChange={(date) => setDateRangeStart(date)}
                      placeholderText="Select date"
                      className="w-full p-2 border rounded"
                      dateFormat="MMM d, yyyy"
                      isClearable
                      withPortal
                      popperClassName="z-50"
                    />
                  </div>
                </div>
                
                {/* End Date */}
                <div>
                  <Label htmlFor="endDate" className="text-sm">End Date</Label>
                  <div className="relative mt-1">
                    <DatePicker
                      selected={dateRangeEnd}
                      onChange={(date) => setDateRangeEnd(date)}
                      placeholderText="Select date"
                      className="w-full p-2 border rounded"
                      dateFormat="MMM d, yyyy"
                      isClearable
                      withPortal
                      popperClassName="z-50"
                    />
                  </div>
                </div>
              </div>
              
              {/* Clear dates button */}
              {(dateRangeStart || dateRangeEnd) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateRangeStart(null);
                    setDateRangeEnd(null);
                  }}
                  className="mt-1"
                >
                  <X className="h-4 w-4 mr-1" /> Clear dates
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Date Range Filters for Multiple Fields */}
        <AccordionItem value="date-multi">
          <AccordionTrigger className="text-sm py-2 bg-pink-100">Date Filters</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 pt-2">
              {/* startDate */}
              <div>
                <Label className="text-sm">Start Date</Label>
                <div className="flex gap-2">
                  <div className="w-full">
                    <DatePicker
                      selected={startDateRange.from}
                      onChange={(date) => setStartDateRange(r => ({ ...r, from: date }))}
                      placeholderText="From"
                      className="w-full p-2 border rounded"
                      dateFormat="MMM d, yyyy"
                      isClearable
                      withPortal
                      popperClassName="z-50"
                    />
                  </div>
                  <div className="w-full">
                    <DatePicker
                      selected={startDateRange.to}
                      onChange={(date) => setStartDateRange(r => ({ ...r, to: date }))}
                      placeholderText="To"
                      className="w-full p-2 border rounded"
                      dateFormat="MMM d, yyyy"
                      isClearable
                      withPortal
                      popperClassName="z-50"
                    />
                  </div>
                </div>
                {(startDateRange.from || startDateRange.to) && (
                  <Button variant="ghost" size="sm" onClick={() => setStartDateRange({ from: null, to: null })} className="mt-1">
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
              </div>
              {/* assignmentDate */}
              <div>
                <Label className="text-sm">Assignment Date</Label>
                <div className="flex gap-2">
                  <div className="w-full">
                    <DatePicker
                      selected={assignmentDateRange.from}
                      onChange={(date) => setAssignmentDateRange(r => ({ ...r, from: date }))}
                      placeholderText="From"
                      className="w-full p-2 border rounded"
                      dateFormat="MMM d, yyyy"
                      isClearable
                      withPortal
                      popperClassName="z-50"
                    />
                  </div>
                  <div className="w-full">
                    <DatePicker
                      selected={assignmentDateRange.to}
                      onChange={(date) => setAssignmentDateRange(r => ({ ...r, to: date }))}
                      placeholderText="To"
                      className="w-full p-2 border rounded"
                      dateFormat="MMM d, yyyy"
                      isClearable
                      withPortal
                      popperClassName="z-50"
                    />
                  </div>
                </div>
                {(assignmentDateRange.from || assignmentDateRange.to) && (
                  <Button variant="ghost" size="sm" onClick={() => setAssignmentDateRange({ from: null, to: null })} className="mt-1">
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
              </div>
              {/* resumingOnDate */}
              <div>
                <Label className="text-sm">Resuming On Date</Label>
                <div className="flex gap-2">
                  <div className="w-full">
                    <DatePicker
                      selected={resumingOnDateRange.from}
                      onChange={(date) => setResumingOnDateRange(r => ({ ...r, from: date }))}
                      placeholderText="From"
                      className="w-full p-2 border rounded"
                      dateFormat="MMM d, yyyy"
                      isClearable
                      withPortal
                      popperClassName="z-50"
                    />
                  </div>
                  <div className="w-full">
                    <DatePicker
                      selected={resumingOnDateRange.to}
                      onChange={(date) => setResumingOnDateRange(r => ({ ...r, to: date }))}
                      placeholderText="To"
                      className="w-full p-2 border rounded"
                      dateFormat="MMM d, yyyy"
                      isClearable
                      withPortal
                      popperClassName="z-50"
                    />
                  </div>
                </div>
                {(resumingOnDateRange.from || resumingOnDateRange.to) && (
                  <Button variant="ghost" size="sm" onClick={() => setResumingOnDateRange({ from: null, to: null })} className="mt-1">
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
              </div>
              {/* ScheduleEndDate */}
              <div>
                <Label className="text-sm">Schedule End Date</Label>
                <div className="flex gap-2">
                  <div className="w-full">
                    <DatePicker
                      selected={scheduleEndDateRange.from}
                      onChange={(date) => setScheduleEndDateRange(r => ({ ...r, from: date }))}
                      placeholderText="From"
                      className="w-full p-2 border rounded"
                      dateFormat="MMM d, yyyy"
                      isClearable
                      withPortal
                      popperClassName="z-50"
                    />
                  </div>
                  <div className="w-full">
                    <DatePicker
                      selected={scheduleEndDateRange.to}
                      onChange={(date) => setScheduleEndDateRange(r => ({ ...r, to: date }))}
                      placeholderText="To"
                      className="w-full p-2 border rounded"
                      dateFormat="MMM d, yyyy"
                      isClearable
                      withPortal
                      popperClassName="z-50"
                    />
                  </div>
                </div>
                {(scheduleEndDateRange.from || scheduleEndDateRange.to) && (
                  <Button variant="ghost" size="sm" onClick={() => setScheduleEndDateRange({ from: null, to: null })} className="mt-1">
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        {/* Additional Filters */}
        <AccordionItem value="additional">
          <AccordionTrigger className="text-sm py-2 bg-indigo-100">Additional Filters</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 pt-2">
              {/* Grade Filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Grade Status</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasGrade"
                      checked={hasGradeFilter}
                      onCheckedChange={setHasGradeFilter}
                    />
                    <Label htmlFor="hasGrade" className="text-sm">Has grade</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="noGrade"
                      checked={noGradeFilter}
                      onCheckedChange={setNoGradeFilter}
                    />
                    <Label htmlFor="noGrade" className="text-sm">Missing grade</Label>
                  </div>
                </div>
              </div>
              
              {/* Multiple Records Filter */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="multipleRecords"
                  checked={hasMultipleRecordsFilter}
                  onCheckedChange={setHasMultipleRecordsFilter}
                />
                <Label htmlFor="multipleRecords" className="text-sm">Has multiple records</Label>
              </div>
              
              {/* Work Items Filter */}
              {filterOptions.workItems.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Work Items</Label>
                  <div className="flex flex-col gap-2">
                    {filterOptions.workItems.map(item => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`workitem-${item}`}
                          checked={workItemsFilter.includes(item)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setWorkItemsFilter([...workItemsFilter, item]);
                            } else {
                              setWorkItemsFilter(workItemsFilter.filter(w => w !== item));
                            }
                          }}
                        />
                        <Label htmlFor={`workitem-${item}`} className="text-sm">{item}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Save Configuration Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Filter Configuration</DialogTitle>
            <DialogDescription>
              Give a name to your current filter configuration to save it for later use.
              Your team members will be able to see and use this filter.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="configName" className="text-right">
                Name
              </Label>
              <Input
                id="configName"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="My filter configuration"
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveCurrentConfiguration} disabled={!configName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the saved filter configuration
              {configToDelete && ` "${configToDelete.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteConfiguration} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PasiRecordsFilter;