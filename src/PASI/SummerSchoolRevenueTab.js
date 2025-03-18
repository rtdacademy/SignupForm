// SummerSchoolRevenueTab.js
import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';

const SummerSchoolRevenueTab = ({ records }) => {
  return (
    <div className="p-6 bg-slate-50 rounded-md text-center">
      <p className="text-muted-foreground mb-2">Summer School revenue analysis will be available soon</p>
      <p className="text-sm text-muted-foreground">Funding rate: $146 per credit</p>
    </div>
  );
};

export default memo(SummerSchoolRevenueTab);