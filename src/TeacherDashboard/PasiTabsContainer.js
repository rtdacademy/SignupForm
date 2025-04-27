import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FileText, FileX, Link } from 'lucide-react';
import { Badge } from "../components/ui/badge";
import PasiRecords from './pasiRecords';
import MissingPasi from './MissingPasi';
import MissingYourWay from './MissingYourWay';
import { useSchoolYear } from '../context/SchoolYearContext';

const PasiTabsContainer = () => {
  const [activeTab, setActiveTab] = useState("records");
  const { unlinkedPasiRecords } = useSchoolYear();

  return (
    <div className="container mx-auto py-2">
      <Tabs
        defaultValue="records"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-3 w-[600px]">
            <TabsTrigger value="records" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>PASI Records</span>
            </TabsTrigger>
            <TabsTrigger value="missing" className="flex items-center gap-2">
              <FileX className="h-4 w-4" />
              <span>Missing Records</span>
            </TabsTrigger>
            <TabsTrigger value="unlinked" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span>Unlinked Records</span>
              {unlinkedPasiRecords?.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {unlinkedPasiRecords.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="records" className="mt-0">
          <PasiRecords />
        </TabsContent>

        <TabsContent value="missing" className="mt-0">
          <MissingPasi />
        </TabsContent>

        <TabsContent value="unlinked" className="mt-0">
          <MissingYourWay />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PasiTabsContainer;