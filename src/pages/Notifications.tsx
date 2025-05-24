
import React from 'react';
import EnhancedProtectedRoute from '@/components/layout/EnhancedProtectedRoute';
import NotificationCenter from '@/components/notifications/NotificationCenter';

const Notifications = () => {
  return (
    <EnhancedProtectedRoute allowedRoles={['admin', 'partner']}>
      <div className="container mx-auto px-4 py-8">
        <NotificationCenter />
      </div>
    </EnhancedProtectedRoute>
  );
};

export default Notifications;
