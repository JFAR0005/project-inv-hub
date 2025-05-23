import React from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { UserRole } from '@/context/AuthContext';

const Meetings = () => {
  return (
    <ProtectedRoute requiredRoles={['admin', 'partner', 'founder']}>
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Meetings</h1>
              <p className="text-muted-foreground mt-1">
                Schedule and manage your meetings with portfolio companies
              </p>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
              Schedule Meeting
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Upcoming Meetings</h2>
                <div className="space-y-4">
                  <div className="border rounded-md p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Quarterly Review - Acme Inc</h3>
                        <p className="text-sm text-gray-500">Tomorrow at 10:00 AM</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Upcoming
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Participants: John Doe, Jane Smith</p>
                      <p>Location: Zoom Meeting</p>
                    </div>
                  </div>

                  <div className="border rounded-md p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Investment Committee - Beta Corp</h3>
                        <p className="text-sm text-gray-500">May 15, 2023 at 2:00 PM</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Confirmed
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Participants: Investment Team, Founders</p>
                      <p>Location: Conference Room A</p>
                    </div>
                  </div>

                  <div className="border rounded-md p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Due Diligence - New Startup</h3>
                        <p className="text-sm text-gray-500">May 20, 2023 at 11:00 AM</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Tentative
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>Participants: Due Diligence Team, Founders</p>
                      <p>Location: Office</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Calendar</h2>
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    <div className="text-gray-500">Su</div>
                    <div className="text-gray-500">Mo</div>
                    <div className="text-gray-500">Tu</div>
                    <div className="text-gray-500">We</div>
                    <div className="text-gray-500">Th</div>
                    <div className="text-gray-500">Fr</div>
                    <div className="text-gray-500">Sa</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mt-2">
                    {Array.from({ length: 31 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-8 w-8 flex items-center justify-center rounded-full ${
                          i === 14 ? 'bg-primary text-white' : ''
                        } ${[2, 10, 18].includes(i) ? 'bg-blue-100' : ''} hover:bg-gray-100 cursor-pointer`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Recent Meetings</h3>
                  <div className="space-y-2">
                    <div className="text-sm p-2 hover:bg-gray-50 rounded">
                      <p className="font-medium">Tech Review - Gamma Inc</p>
                      <p className="text-xs text-gray-500">May 5, 2023</p>
                    </div>
                    <div className="text-sm p-2 hover:bg-gray-50 rounded">
                      <p className="font-medium">Pitch - Delta Startup</p>
                      <p className="text-xs text-gray-500">May 3, 2023</p>
                    </div>
                    <div className="text-sm p-2 hover:bg-gray-50 rounded">
                      <p className="font-medium">Partner Meeting</p>
                      <p className="text-xs text-gray-500">April 28, 2023</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Meetings;
