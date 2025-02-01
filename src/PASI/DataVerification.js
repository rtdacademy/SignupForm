import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent } from "../components/ui/card";
import PASIDataUpload from './PASIDataUpload';
import ASNWrongFormat from './ASNWrongFormat';
import PASISyncReport from './PASISyncReport';

const DataVerification = () => {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Data Verification</h1>
      
      <Tabs defaultValue="pasi" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pasi">PASI Data</TabsTrigger>
          <TabsTrigger value="sync-report">Sync Report</TabsTrigger>
          <TabsTrigger value="asn-wrong-format">Wrong Format ASNs</TabsTrigger>
          
        </TabsList>
        
        <TabsContent value="pasi">
          <Card>
            <CardContent className="pt-6">
              <PASIDataUpload />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asn-wrong-format">
          <Card>
            <CardContent className="pt-6">
              <ASNWrongFormat />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-report">
          <Card>
            <CardContent className="pt-6">
              <PASISyncReport />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataVerification;