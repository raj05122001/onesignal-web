// src/app/admin/subscribers/page.jsx
// Admin Subscribers Management Page

import SubscribersManagement from '@/components/SubscribersManagement';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Subscribers Management | Admin Panel',
  description: 'View and manage all subscribed users',
};

export default async function SubscribersPage() {
  // Check authentication
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SubscribersManagement />
    </div>
  );
}
