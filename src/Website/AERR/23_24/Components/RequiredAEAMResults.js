import React from 'react';
import { Card } from "../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Link } from "lucide-react";

const RequiredAEAMResults = () => {
    const measuresData = [
      {
        domain: "Student Growth and Achievement",
        measure: "Student Learning Engagement",
        currentResult: "n/a",
        prevYearResult: "n/a",
        prev3YearAvg: "n/a",
        albertaCurrent: "83.7",
        albertaPrevYear: "84.4",
        albertaPrev3Year: "84.8",
        achievement: "n/a",
        improvement: "n/a",
        overall: "n/a",
        page: "2"
      },
      {
        domain: "Student Growth and Achievement",
        measure: "Citizenship",
        currentResult: "n/a",
        prevYearResult: "n/a",
        prev3YearAvg: "n/a",
        albertaCurrent: "79.4",
        albertaPrevYear: "80.3",
        albertaPrev3Year: "80.9",
        achievement: "n/a",
        improvement: "n/a",
        overall: "n/a",
        page: "2"
      },
      {
        domain: "Student Growth and Achievement",
        measure: "3-year High School Completion",
        currentResult: "*",
        prevYearResult: "n/a",
        prev3YearAvg: "n/a",
        albertaCurrent: "80.4",
        albertaPrevYear: "80.7",
        albertaPrev3Year: "82.4",
        achievement: "*",
        improvement: "n/a",
        overall: "n/a",
        page: "2"
      },
      {
        domain: "Student Growth and Achievement",
        measure: "Diploma: Acceptable",
        currentResult: "60.9",
        prevYearResult: "50.0",
        prev3YearAvg: "50.0",
        albertaCurrent: "81.5",
        albertaPrevYear: "80.3",
        albertaPrev3Year: "80.3",
        achievement: "Very Low",
        improvement: "Maintained",
        overall: "Concern",
        page: "2"
      },
      {
        domain: "Student Growth and Achievement",
        measure: "Diploma: Excellence",
        currentResult: "16.7",
        prevYearResult: "11.1",
        prev3YearAvg: "11.1",
        albertaCurrent: "22.6",
        albertaPrevYear: "21.2",
        albertaPrev3Year: "21.2",
        achievement: "Intermediate",
        improvement: "Maintained",
        overall: "Acceptable",
        page: "2"
      },
      {
        domain: "Teaching & Leading",
        measure: "Education Quality",
        currentResult: "n/a",
        prevYearResult: "n/a",
        prev3YearAvg: "n/a",
        albertaCurrent: "87.6",
        albertaPrevYear: "88.1",
        albertaPrev3Year: "88.6",
        achievement: "n/a",
        improvement: "n/a",
        overall: "n/a",
        page: "2"
      }
    ];
  
    const footnotes = [
      "Data values have been suppressed where the number of respondents/students is fewer than 6. Suppression is marked with an asterisk (*).",
      "Aggregated Diploma results are a weighted average of percent meeting standards (Acceptable, Excellence) on Diploma Examinations. The weights are the number of students writing the Diploma Exam for each course.",
      "As a grades 10-12 school, RTD Academy does not participate in Provincial Achievement Tests (PATs).",
      "Participation in the Diploma Exams was impacted by the fires in 2022/23. Caution should be used when interpreting trends over time for the province and those school authorities affected by these events."
    ];
  
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Required Alberta Education Assurance Measures - Overall Summary</h2>
          <a 
            href="https://rtdacademy.sharepoint.com/:b:/s/RTDAdministration/EZk-0CSamfNCkyT9rpyitSgB-vGumsR-ixehdQv4ej-G3g?e=pjtFtc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <Link size={16} />
            <span className="text-sm">View Full AEAM Report</span>
          </a>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Assurance Domain</TableHead>
                <TableHead>Measure</TableHead>
                <TableHead className="text-right">Current Result</TableHead>
                <TableHead className="text-right">Prev Year Result</TableHead>
                <TableHead className="text-right">Prev 3 Year Avg</TableHead>
                <TableHead className="text-right">Alberta Current</TableHead>
                <TableHead>Achievement</TableHead>
                <TableHead>Improvement</TableHead>
                <TableHead>Overall</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {measuresData.map((measure, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{measure.domain}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {measure.measure}
                      <span className="text-xs text-gray-500">(p.{measure.page})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{measure.currentResult}</TableCell>
                  <TableCell className="text-right">{measure.prevYearResult}</TableCell>
                  <TableCell className="text-right">{measure.prev3YearAvg}</TableCell>
                  <TableCell className="text-right">{measure.albertaCurrent}</TableCell>
                  <TableCell>{measure.achievement}</TableCell>
                  <TableCell>{measure.improvement}</TableCell>
                  <TableCell>{measure.overall}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
  
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium">Notes:</h3>
          <ul className="list-decimal pl-5 space-y-2">
            {footnotes.map((note, index) => (
              <li key={index} className="text-sm text-gray-600">
                {note}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    );
  };
  
  export default RequiredAEAMResults;