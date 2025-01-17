import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/Layout/MainLayout';
import { User } from '@/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export default function Profile() {
  const { t } = useTranslation('common');
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setUserData(data);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">{t('my_profile')}</h1>
        {userData && (
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
            </div>
          </div>
        )}
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