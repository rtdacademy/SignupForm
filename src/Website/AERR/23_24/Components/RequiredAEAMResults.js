import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
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
          <div className="flex gap-3">
       
          </div>
        </div>
        
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Official Data Sources</h3>
          <p className="text-sm text-green-700">
            All AEAM data below is sourced directly from official Alberta Education APORI reports. 
            The following charts and visualizations provide comprehensive analysis of our performance across all required measures.
          </p>
          <a
            href="https://rtdacademy.sharepoint.com/:b:/s/RTDAdministration/EWwoTaNnMXdBvLLOvcVlnOABofgUMpi_r3UN9gFV5mOmgw?e=9qx0aS"
            className="text-sm text-green-600 hover:text-green-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Official APORI School Report (PDF)
          </a>
        </div>

        {/* AEAM Charts Section */}
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-semibold">Alberta Education Assurance Measures - Visual Analysis</h3>
          
          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trends">Performance Trends & Analysis</TabsTrigger>
              <TabsTrigger value="summary">Overall AEAM Summary</TabsTrigger>
            </TabsList>

            {/* Performance Trends Tab - Default View */}
            <TabsContent value="trends" className="space-y-8">
              {/* Historical Trends Chart */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Historical Trend Analysis</h4>
                <div className="bg-white border rounded-lg p-4">
                  <img 
                    src="/aerr-images/DiplomaResultsHistory.png" 
                    alt="RTD Academy Diploma Results Historical Trends"
                    className="w-full max-w-4xl mx-auto"
                  />
                  <div className="mt-4 bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      This historical trend chart illustrates RTD Academy's significant improvement in diploma examination results over our operational years. The visual representation clearly shows our upward trajectory, with Acceptable Standard achievement rising from 50.0% to 60.9%, and Standard of Excellence improving from 11.1% to 16.7%. These trend lines demonstrate the positive impact of our enhanced support systems and targeted interventions. The increase in student numbers from 18 to 138 writers also reflects our growing capacity to serve Alberta students through our asynchronous model.
                    </p>
                  </div>
                </div>
              </div>

              {/* Course-Specific Results */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Course-Specific Diploma Results</h4>
                
                {/* Math 30-1 */}
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="font-medium mb-3">Mathematics 30-1 Performance</h5>
                  <img 
                    src="/aerr-images/30_1.png" 
                    alt="Mathematics 30-1 Diploma Results"
                    className="w-full max-w-4xl mx-auto"
                  />
                  <div className="mt-4 bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Mathematics 30-1 represents our largest diploma examination cohort with 68 writers in 2023-24. The visual charts show our performance compared to provincial averages, with notable improvement from 38.5% to 58.8% at Acceptable Standard. The gap between school-awarded marks (97.1% Acceptable, 51.5% Excellence) and diploma results indicates an area of focus for our continued improvement efforts. We are implementing structured interventions including 'Rock the Diploma' preparation sessions and enhanced assessment alignment to better prepare students for provincial examinations.
                    </p>
                  </div>
                </div>

                {/* Math 30-2 */}
                <div className="bg-white border rounded-lg p-4">
                  <h5 className="font-medium mb-3">Mathematics 30-2 Performance</h5>
                  <img 
                    src="/aerr-images/30_2.png" 
                    alt="Mathematics 30-2 Diploma Results"
                    className="w-full max-w-4xl mx-auto"
                  />
                  <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Mathematics 30-2 shows strong performance with 69 writers achieving 63.8% at Acceptable Standard and 18.8% at Standard of Excellence. The visual comparison with provincial averages demonstrates that while we trail provincial results, our school shows consistent improvement. The alignment between school-awarded marks (95.7% Acceptable, 53.6% Excellence) and diploma results is closer than in Math 30-1, suggesting our assessment practices in this course better prepare students for diploma examinations. This course represents a success story in our mathematics program.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Overall Summary Tab - Hidden by default */}
            <TabsContent value="summary" className="space-y-4">
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Overall AEAM Performance Summary</h4>
                <div className="bg-white border rounded-lg p-4">
                  <img 
                    src="/aerr-images/Overall Summary.png" 
                    alt="RTD Academy Overall AEAM Performance Summary"
                    className="w-full max-w-4xl mx-auto"
                  />
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      This table presents RTD Academy's performance across all Alberta Education Assurance Measures. As a non-primary school serving grades 10-12, many standard measures (PATs, Early Years Literacy, etc.) are not applicable to our institution. The key applicable measures for our school are the Diploma Examination results, where we show 60.9% at Acceptable Standard and 16.7% at Standard of Excellence. While our Acceptable Standard achievement is evaluated as 'Very Low' compared to provincial averages, our improvement trajectory and maintained performance demonstrate our ongoing commitment to enhancing student outcomes.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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