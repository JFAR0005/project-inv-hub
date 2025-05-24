
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const Notes = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Notes</h1>
      <p>This is the notes page. Admins, partners, and founders can access it.</p>
    </div>
  );
};

export default Notes;
