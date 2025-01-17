import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  HomeIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: HomeIcon },
    { name: t('parts'), href: '/parts', icon: CubeIcon },
    { name: t('requests'), href: '/requests', icon: ClipboardDocumentListIcon },
    { name: t('users'), href: '/users', icon: UsersIcon },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 사이드바 */}
      <div 
        className="fixed inset-y-0 left-0 bg-gray-800 transition-all duration-300 group"
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className={`flex flex-col h-full ${sidebarOpen ? 'w-64' : 'w-16'}`}>
          <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
            <h1 className={`font-bold text-white transition-all duration-300 ${
              sidebarOpen ? 'text-xl' : 'text-sm'
            }`}>
              {sidebarOpen ? t('app_title') : 'FIM'}
            </h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    router.pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className={`ml-3 transition-all duration-300 ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4">
            <button
              onClick={handleSignOut}
              className={`flex items-center justify-center px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-all duration-300 ${
                sidebarOpen ? 'w-full' : 'w-8 h-8'
              }`}
            >
              {sidebarOpen ? t('sign_out') : '×'}
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-16'}`}>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 