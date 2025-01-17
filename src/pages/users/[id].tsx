import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import MainLayout from '@/components/Layout/MainLayout';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function UserProfile() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  const [userData, setUserData] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchUserData();
      getCurrentUserRole();
    }
  }, [id]);

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

  const fetchUserData = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // admin이 아니고 자신의 프로필이 아닌 경우 접근 제한
    if (currentUserRole !== 'admin' && currentUser?.id !== id) {
      router.push('/dashboard');
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      router.push('/dashboard');
      return;
    }

    setUserData(data);
  };

  if (!userData) return null;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">{t('user_profile')}</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('name')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{userData.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('role')}
              </label>
              <p className="mt-1 text-sm text-gray-900">{t(userData.role + '_role')}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('status')}
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {userData.active ? t('user_active') : t('user_inactive')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export const getServerSideProps = async ({ locale }: { locale: string }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
};