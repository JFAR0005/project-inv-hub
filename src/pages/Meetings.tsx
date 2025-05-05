
import React from 'react';
import Layout from '@/components/layout/Layout';
import MeetingScheduler from '@/components/meetings/MeetingScheduler';

const Meetings = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage meetings with founders and team members
          </p>
        </div>
        
        <MeetingScheduler />
      </div>
    </Layout>
  );
};

export default Meetings;
