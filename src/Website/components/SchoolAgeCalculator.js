import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Calendar, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';
import { websiteConfig } from '../websiteConfig';

const SchoolAgeCalculator = () => {
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [result, setResult] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get school year options from config
  const schoolYearOptions = [
    {
      value: websiteConfig.dates.currentSchoolYear,
      label: `${websiteConfig.dates.currentSchoolYear} (Current)`,
      short: websiteConfig.dates.currentSchoolYearShort
    },
    {
      value: websiteConfig.dates.nextSchoolYear,
      label: `${websiteConfig.dates.nextSchoolYear} (Next Year)`,
      short: websiteConfig.dates.nextSchoolYearShort
    }
  ];

  // Calculate if student is school-aged
  const calculateAge = () => {
    if (!birthDate || !selectedSchoolYear) return;

    // Get the year from selected school year (e.g., "2025-2026" -> 2025)
    const schoolYearStart = parseInt(selectedSchoolYear.split('-')[0]);

    // September 1st of the school year
    const septemberFirst = new Date(schoolYearStart, 8, 1); // Month is 0-indexed (8 = September)

    // Calculate detailed age difference
    let years = septemberFirst.getFullYear() - birthDate.getFullYear();
    let months = septemberFirst.getMonth() - birthDate.getMonth();
    let days = septemberFirst.getDate() - birthDate.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastMonth = new Date(septemberFirst.getFullYear(), septemberFirst.getMonth(), 0);
      days += lastMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Simple age in years for comparisons
    const ageInYears = years;

    // Check if student is too young (under 6 on September 1st)
    const isTooYoung = ageInYears < 6;

    // Student is school-aged if they are 6-19 on September 1st
    const isSchoolAged = ageInYears < websiteConfig.config.ages.adultStudentMinAge;

    // Format age string
    let ageString = '';
    if (years > 0) {
      ageString += `${years} year${years !== 1 ? 's' : ''}`;
    }
    if (months > 0) {
      if (ageString) ageString += ', ';
      ageString += `${months} month${months !== 1 ? 's' : ''}`;
    }
    if (days > 0 && years < 10) { // Only show days for younger students
      if (ageString) ageString += ', ';
      ageString += `${days} day${days !== 1 ? 's' : ''}`;
    }
    if (!ageString) {
      ageString = '0 days';
    }

    setResult({
      isSchoolAged,
      isTooYoung,
      age: ageInYears,
      ageString,
      schoolYear: selectedSchoolYear,
      date: septemberFirst.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    });
  };

  // Auto-calculate when both fields are filled
  useEffect(() => {
    if (birthDate && selectedSchoolYear) {
      calculateAge();
    }
  }, [birthDate, selectedSchoolYear]);

  // Show date picker when school year is selected
  useEffect(() => {
    if (selectedSchoolYear && !showDatePicker) {
      setShowDatePicker(true);
    }
  }, [selectedSchoolYear]);

  const handleReset = () => {
    setSelectedSchoolYear('');
    setBirthDate(null);
    setResult(null);
    setShowDatePicker(false);
  };

  // Custom date picker input
  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <Button
      onClick={onClick}
      ref={ref}
      variant="outline"
      className="w-full justify-start text-left font-normal"
    >
      <Calendar className="mr-2 h-4 w-4" />
      {value || "Select your birth date"}
    </Button>
  ));

  return (
    <div className="space-y-4">
        {/* Info Alert */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p>
                <strong>School-aged students</strong> are those aged 6-19 on {websiteConfig.config.ages.ageVerificationDate} of the school year. Being school-aged is one requirement for grant-funded courses, but you must also meet the requirements for one of these student types:
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href="/student-faq#nonPrimary"
                  className="text-blue-700 hover:text-blue-900 underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Non-Primary
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="/student-faq#homeEducation"
                  className="text-blue-700 hover:text-blue-900 underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Home Education
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="/student-faq#summerStudents"
                  className="text-blue-700 hover:text-blue-900 underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Summer School
                </a>
              </div>
              <Button
                onClick={() => window.location.href = '/student-faq#student-type-guide'}
                variant="link"
                className="h-auto p-0 text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs"
              >
                Not sure which student type you are? Take our quick survey →
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* School Year Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select School Year</label>
          <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a school year" />
            </SelectTrigger>
            <SelectContent>
              {schoolYearOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Picker - Shows after school year selection */}
        {showDatePicker && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-sm font-medium">Your Birth Date</label>
            <DatePicker
              selected={birthDate}
              onChange={setBirthDate}
              dateFormat="MMMM d, yyyy"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              maxDate={new Date()}
              customInput={<CustomDateInput />}
              placeholderText="Select your birth date"
              className="w-full"
            />
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Alert className={`border-2 ${
              result.isTooYoung
                ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                : result.isSchoolAged
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
            }`}>
              {result.isTooYoung ? (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : result.isSchoolAged ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-base">
                    {result.isTooYoung ? (
                      <>You are not yet eligible for enrollment in {result.schoolYear}.</>
                    ) : result.isSchoolAged ? (
                      <>Yes! You are a school-aged student for {result.schoolYear}.</>
                    ) : (
                      <>No, you are not a school-aged student for {result.schoolYear}.</>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You will be <strong>{result.ageString} old</strong> on {result.date}.
                  </p>

                </div>
              </AlertDescription>
            </Alert>

            {/* Grant Funding Information - Only show for school-aged students */}
            {result.isSchoolAged && !result.isTooYoung && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 mt-3">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-sm">
                  <div className="space-y-2">
                    <p className="font-semibold text-amber-900 dark:text-amber-100">
                      Important: Being school-aged does not automatically qualify you for free courses.
                    </p>
                    <p className="text-amber-800 dark:text-amber-200">
                      You must be enrolled as one of these grant-funded student types:
                    </p>
                    <ul className="list-disc list-inside text-amber-800 dark:text-amber-200 ml-2 space-y-1">
                      <li>Non-Primary Student (enrolled at an Alberta school)</li>
                      <li>Home Education Student</li>
                      <li>Summer School Student (Alberta resident)</li>
                    </ul>
                    <Button
                      onClick={() => window.location.href = '/student-faq#grantFunding'}
                      variant="link"
                      className="h-auto p-0 text-amber-900 hover:text-amber-700 dark:text-amber-100 dark:hover:text-amber-300 font-medium text-sm"
                    >
                      Learn more about grant funding eligibility →
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Reset Button - Shows after calculation */}
        {result && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full animate-in fade-in duration-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Calculate Again
          </Button>
        )}
    </div>
  );
};

export default SchoolAgeCalculator;