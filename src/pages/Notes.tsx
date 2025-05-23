
import React from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { UserRole } from '@/context/AuthContext';

const Notes = () => {
  return (
    <ProtectedRoute requiredRoles={['admin', 'partner', 'founder']}>
      <div className="container mx-auto py-8">
        {/* Notes page content */}
        <h1 className="text-2xl font-bold mb-4">Notes</h1>
        <p>This is the notes page. Only admins, partners, and founders can access it.</p>
      </div>
    </ProtectedRoute>
  );
};

export default Notes;
