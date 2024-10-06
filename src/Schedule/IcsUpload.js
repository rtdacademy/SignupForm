import React, { useState, useEffect } from 'react';
import { getDatabase, ref, push, onValue, remove } from 'firebase/database';
import ICAL from 'ical.js';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const CALENDAR_CATEGORIES = [
  { value: 'blockOutDates', label: 'Block Out Dates' },
  { value: 'studentCalendars', label: 'Student Calendars' },
  { value: 'staffCalendars', label: 'Staff Calendars' },
  { value: 'otherCalendars', label: 'Other Calendars' },
];

const IcsUpload = () => {
  const [file, setFile] = useState(null);
  const [calendarName, setCalendarName] = useState('');
  const [calendarCategory, setCalendarCategory] = useState(CALENDAR_CATEGORIES[0].value);
  const [uploadStatus, setUploadStatus] = useState('');
  const [calendars, setCalendars] = useState({});
  const [previewCalendar, setPreviewCalendar] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const calendarsRef = ref(db, 'calendars');
    onValue(calendarsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCalendars(data);
      } else {
        setCalendars({});
      }
    });
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCalendarNameChange = (e) => {
    setCalendarName(e.target.value);
  };

  const parseICSFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const icsData = event.target.result;
        const jcalData = ICAL.parse(icsData);
        const comp = new ICAL.Component(jcalData);
        const events = comp.getAllSubcomponents('vevent');
        
        const parsedEvents = events.map(event => {
          const summary = event.getFirstPropertyValue('summary');
          const startDate = event.getFirstPropertyValue('dtstart').toJSDate();
          const endDate = event.getFirstPropertyValue('dtend').toJSDate();
          
          return { summary, startDate: startDate.toISOString(), endDate: endDate.toISOString() };
        });
        
        resolve(parsedEvents);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const uploadEventsToFirebase = (events) => {
    const db = getDatabase();
    const calendarsRef = ref(db, `calendars/${calendarCategory}`);
    
    return push(calendarsRef, {
      name: calendarName,
      uploadDate: new Date().toISOString(),
      events: events,
    });
  };

  const handleUpload = async () => {
    if (file && calendarName && calendarCategory) {
      const normalizedName = calendarName.toLowerCase();
      const isDuplicate = Object.values(calendars[calendarCategory] || {}).some(
        cal => cal.name.toLowerCase() === normalizedName
      );
      
      if (isDuplicate) {
        setUploadStatus('A calendar with this name already exists in the selected category. Please choose a different name.');
        return;
      }

      try {
        setUploadStatus('Parsing ICS file...');
        const parsedEvents = await parseICSFile(file);
        setUploadStatus('Uploading events to Firebase...');
        await uploadEventsToFirebase(parsedEvents);
        setUploadStatus('Upload complete!');
        setFile(null);
        setCalendarName('');
      } catch (error) {
        console.error('Error uploading events:', error);
        setUploadStatus('Error uploading events. Please try again.');
      }
    } else {
      setUploadStatus('Please select a file, enter a calendar name, and choose a category.');
    }
  };

  const handleDelete = async (categoryId, calendarId) => {
    const db = getDatabase();
    const calendarRef = ref(db, `calendars/${categoryId}/${calendarId}`);
    try {
      await remove(calendarRef);
      setUploadStatus('Calendar deleted successfully.');
    } catch (error) {
      console.error('Error deleting calendar:', error);
      setUploadStatus('Error deleting calendar. Please try again.');
    }
  };

  const handlePreview = (calendar) => {
    setPreviewCalendar(calendar);
    setIsSheetOpen(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-primary mb-4">Calendars</h1>
      <Card className="mb-4">
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Upload ICS File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label htmlFor="calendar-name" className="text-xs">Calendar Name</Label>
              <Input
                id="calendar-name"
                type="text"
                value={calendarName}
                onChange={handleCalendarNameChange}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="calendar-category" className="text-xs">Category</Label>
              <Select onValueChange={setCalendarCategory} value={calendarCategory}>
                <SelectTrigger className="w-full mt-1 h-8 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CALENDAR_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ics-file" className="text-xs">ICS File</Label>
              <Input
                id="ics-file"
                type="file"
                accept=".ics"
                onChange={handleFileChange}
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <Button onClick={handleUpload} size="sm">
              Upload ICS
            </Button>
            {uploadStatus && (
              <p className="text-xs font-semibold text-secondary">{uploadStatus}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Uploaded Calendars</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={CALENDAR_CATEGORIES[0].value}>
            <TabsList className="grid w-full grid-cols-4">
              {CALENDAR_CATEGORIES.map((category) => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {CALENDAR_CATEGORIES.map((category) => (
              <TabsContent key={category.value} value={category.value}>
                <ScrollArea className="h-[calc(100vh-450px)] w-full rounded-md border p-2">
                  {calendars[category.value] ? (
                    Object.entries(calendars[category.value]).map(([calendarId, calendar]) => (
                      <div key={calendarId} className="mb-2 p-2 bg-secondary/10 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-primary text-sm">{calendar.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              Uploaded: {new Date(calendar.uploadDate).toLocaleString()}
                            </p>
                          </div>
                          <div className="space-x-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(category.value, calendarId)}
                              className="text-xs h-7"
                            >
                              Delete
                            </Button>
                            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                              <SheetTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePreview(calendar)}
                                  className="text-xs h-7"
                                >
                                  Preview
                                </Button>
                              </SheetTrigger>
                              <SheetContent>
                                <SheetHeader>
                                  <SheetTitle>Calendar Preview: {previewCalendar?.name}</SheetTitle>
                                  <SheetDescription>
                                    Uploaded on: {previewCalendar && new Date(previewCalendar.uploadDate).toLocaleString()}
                                  </SheetDescription>
                                </SheetHeader>
                                <ScrollArea className="h-[calc(100vh-200px)] mt-4">
                                  {previewCalendar?.events.map((event, index) => (
                                    <div key={index} className="mb-2">
                                      <h5 className="font-semibold text-primary text-sm">{event.summary}</h5>
                                      <p className="text-xs text-muted-foreground">
                                        Start: {new Date(event.startDate).toLocaleString()}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        End: {new Date(event.endDate).toLocaleString()}
                                      </p>
                                      <Separator className="my-1" />
                                    </div>
                                  ))}
                                </ScrollArea>
                              </SheetContent>
                            </Sheet>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No calendars in this category.</p>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default IcsUpload;