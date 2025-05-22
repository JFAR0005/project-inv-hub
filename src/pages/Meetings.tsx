
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import MeetingsCalendar from '@/components/meetings/MeetingsCalendar';
import MeetingsList from '@/components/meetings/MeetingsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MeetingScheduleForm from '@/components/meetings/MeetingScheduleForm';

const Meetings = () => {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<'week' | 'month'>('week');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Meetings</h1>
            <p className="text-muted-foreground mt-1">
              Schedule and manage meetings with founders and team members
            </p>
          </div>
          <Button onClick={() => setIsScheduleDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
          </Button>
        </div>
        
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="list">Upcoming Meetings</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="mt-4">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Calendar View</h2>
              <div className="flex space-x-2">
                <Button 
                  variant={activeView === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveView('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={activeView === 'month' ? 'default' : 'outline'}
                  size="sm" 
                  onClick={() => setActiveView('month')}
                >
                  Month
                </Button>
              </div>
            </div>
            <MeetingsCalendar view={activeView} />
          </TabsContent>
          <TabsContent value="list" className="mt-4">
            <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
            <MeetingsList />
          </TabsContent>
        </Tabs>
      </div>

      {/* Schedule Meeting Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Schedule a Meeting</DialogTitle>
          </DialogHeader>
          <MeetingScheduleForm onSuccess={() => setIsScheduleDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Meetings;
