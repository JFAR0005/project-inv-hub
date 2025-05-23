import React from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { UserRole } from '@/context/AuthContext';

const Notes = () => {
  return (
    <ProtectedRoute requiredRoles={['admin', 'partner', 'founder']}>
      <Layout>
        <div className="container mx-auto py-8">
          {/* Notes page content */}
          <h1 className="text-2xl font-bold mb-4">Notes</h1>
          <p>This is the notes page. Only admins, partners, and founders can access it.</p>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Notes;
