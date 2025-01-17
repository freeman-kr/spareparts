import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { HomeIcon, CubeIcon, ClipboardDocumentListIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';

export default function Sidebar() {
  const { t } = useTranslation('common');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    getCurrentUserRole();
  }, []);

  const getCurrentUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      if (data) {
        setCurrentUserRole(data.role);
      }
    }
  };

  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      <Link href="/dashboard">
        <a className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
          <HomeIcon className="mr-3 h-6 w-6" />
          {t('dashboard')}
        </a>
      </Link>
      <Link href="/parts">
        <a className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
          <CubeIcon className="mr-3 h-6 w-6" />
          {t('parts')}
        </a>
      </Link>
      <Link href="/requests">
        <a className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
          <ClipboardDocumentListIcon className="mr-3 h-6 w-6" />
          {t('requests')}
        </a>
      </Link>
      {/* Users 메뉴 */}
      {currentUserRole === 'admin' ? (
        <Link href="/users">
          <div className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <UserGroupIcon className="mr-3 h-6 w-6" />
            {t('users')}
          </div>
        </Link>
      ) : (
        <Link href="/users/profile">
          <a className="flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <UserIcon className="mr-3 h-6 w-6" />
            {t('my_profile')}
          </a>
        </Link>
      )}
    </nav>
  );
} 