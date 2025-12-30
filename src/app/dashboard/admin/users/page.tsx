'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../../../firebase/firebase';
import { UserDocument } from '@/types/firestore';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      // Query users sorted by creation time
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id })) as UserDocument[];
      setUsers(userList);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // 2. Approve Logic
  const handleApprove = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { accessStatus: 'approved' });
      
      // Update local state to reflect change
      setUsers(users.map(u => u.uid === uid ? { ...u, accessStatus: 'approved' } : u));
      
      alert(`User approved! (Email trigger would go here)`);
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading users...</div>;

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>
      
      <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#262626] bg-[#1a1a1a] text-xs text-gray-400 uppercase">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-300">
            {users.map((user) => (
              <tr key={user.uid} className="border-b border-[#262626] hover:bg-[#1a1a1a]/50">
                <td className="p-4 font-medium text-white">{user.displayName || 'No Name'}</td>
                <td className="p-4 text-gray-400">{user.email}</td>
                <td className="p-4">
                  <Badge variant={
                    user.accessStatus === 'admin' ? 'default' :
                    user.accessStatus === 'approved' ? 'success' : 'neutral'
                  }>
                    {user.accessStatus}
                  </Badge>
                </td>
                <td className="p-4">
                  {user.accessStatus === 'waitlist' && (
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={() => handleApprove(user.uid)}
                    >
                      Approve Access
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}