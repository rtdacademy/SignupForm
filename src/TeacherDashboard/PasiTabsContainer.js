import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FileText, FileX } from 'lucide-react';
import PasiRecords from './pasiRecords';
import MissingPasi from './MissingPasi';

const PasiTabsContainer = () => {
  const [activeTab, setActiveTab] = useState("records");

  return (
    <div className="container mx-auto py-2">
      <Tabs
        defaultValue="records"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>PASI Records</span>
            </TabsTrigger>
            <TabsTrigger value="missing" className="flex items-center gap-2">
              <FileX className="h-4 w-4" />
              <span>Missing Records</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="records" className="mt-0">
          <PasiRecords />
        </TabsContent>

        <TabsContent value="missing" className="mt-0">
          <MissingPasi />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PasiTabsContainer;