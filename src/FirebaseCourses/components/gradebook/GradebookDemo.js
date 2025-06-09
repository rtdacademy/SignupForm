import React from 'react';
import { useGradebook } from '../../context/GradebookContext';

/**
 * Demo component to display raw gradebook data for testing
 */
const GradebookDemo = ({ course }) => {
  const gradebookData = useGradebook();
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg space-y-4">
      <div>
        <h3 className="font-bold mb-2">Course Data (Debug)</h3>
        <pre className="text-xs overflow-auto bg-white p-2 rounded max-h-60">
          {JSON.stringify({
            hasGradebook: !!course?.Gradebook,
            hasAssessments: !!course?.Assessments,
            hasCourseStructure: !!course?.courseStructure,
            courseStructureUnits: course?.courseStructure?.units?.length || 0,
            courseDetailsStructure: !!course?.courseDetails?.courseStructure,
            hasCourseConfig: !!course?.courseConfig,
            courseConfigGradebook: !!course?.courseConfig?.gradebook,
            courseConfigItemStructure: !!course?.courseConfig?.gradebook?.itemStructure,
            courseConfigItemCount: Object.keys(course?.courseConfig?.gradebook?.itemStructure || {}).length
          }, null, 2)}
        </pre>
      </div>
      
      <div>
        <h3 className="font-bold mb-2">Gradebook Context Data (Debug)</h3>
        <pre className="text-xs overflow-auto bg-white p-2 rounded max-h-60">
          {JSON.stringify({
            hasData: gradebookData.hasData,
            summaryExists: !!gradebookData.summary,
            categoriesCount: Object.keys(gradebookData.categories || {}).length,
            itemsCount: Object.keys(gradebookData.items || {}).length,
            assessmentsCount: Object.keys(gradebookData.assessments || {}).length
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default GradebookDemo;