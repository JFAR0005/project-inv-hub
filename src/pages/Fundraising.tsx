
import React from 'react';
import EnhancedProtectedRoute from '@/components/layout/EnhancedProtectedRoute';
import FundraisingTracker from '@/components/fundraising/FundraisingTracker';

const Fundraising = () => {
  return (
    <EnhancedProtectedRoute allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <FundraisingTracker />
      </div>
    </EnhancedProtectedRoute>
  );
};

export default Fundraising;
