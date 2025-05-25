
import React from 'react';
import FundraisingPipelineSummary from './FundraisingPipelineSummary';

interface LPLead {
  id: string;
  name: string;
  type: 'Individual' | 'Family Office' | 'Institutional';
  status: 'Contacted' | 'Interested' | 'In DD' | 'Committed' | 'Declined';
  estimated_commitment?: number;
  confirmed_commitment?: number;
  next_followup_date?: string;
}

interface FundraisingDashboardProps {
  lpLeads: LPLead[];
}

const FundraisingDashboard: React.FC<FundraisingDashboardProps> = ({ lpLeads }) => {
  return <FundraisingPipelineSummary lpLeads={lpLeads} />;
};

export default FundraisingDashboard;
