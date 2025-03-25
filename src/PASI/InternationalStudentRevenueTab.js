// InternationalStudentRevenueTab.js
import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

const InternationalStudentRevenueTab = ({ records }) => {
  return (
    <div className="p-6 bg-slate-50 rounded-md text-center">
      <p className="text-muted-foreground mb-2">International Student revenue analysis will be available soon</p>
      <p className="text-sm text-muted-foreground">Tuition-based funding</p>
    </div>
  );
};

export default memo(InternationalStudentRevenueTab);