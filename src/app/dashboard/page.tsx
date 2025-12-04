import React from 'react';

export default function DashboardHome() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Scriptoplay</h1>
      <p className="text-gray-600">
        You are currently in the private beta environment.
      </p>
      
      {/* Placeholder for future dashboard widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
          Project Stats
        </div>
        <div className="h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
          Recent Scripts
        </div>
        <div className="h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
          Quick Actions
        </div>
      </div>
    </div>
  );
}