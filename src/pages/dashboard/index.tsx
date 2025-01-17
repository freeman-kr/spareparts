import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import MainLayout from '@/components/Layout/MainLayout';
import { supabase } from '@/lib/supabase';
import { Part, StockRequest } from '@/types';
import UserManagement from '@/components/Users/UserManagement';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const { t } = useTranslation('common');
  const [lowStockParts, setLowStockParts] = useState<Part[]>([]);
  const [pendingRequests, setPendingRequests] = useState<StockRequest[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
    getCurrentUserRole();
  }, []);

  const fetchDashboardData = async () => {
    // 재고 부족 부품 조회
    const { data: partsData } = await supabase
      .from('parts')
      .select('*')
      .lt('current_stock', 'minimum_stock');

    if (partsData) {
      setLowStockParts(partsData);
    }

    // 대기 중인 요청 조회
    const { data: requestsData } = await supabase
      .from('stock_requests')
      .select('*')
      .eq('status', 'pending');

    if (requestsData) {
      setPendingRequests(requestsData);
    }
  };

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
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('dashboard')}
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* 재고 부족 알림 */}
          <div 
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => router.push('/parts')}
          >
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">
                {t('low_stock_alert')}
              </h3>
              <div className="mt-3">
                <p className="text-3xl font-semibold text-indigo-600">
                  {lowStockParts.length}
                </p>
              </div>
            </div>
          </div>

          {/* 대기 중인 요청 */}
          <div 
            className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:bg-gray-50"
            onClick={() => router.push('/requests')}
          >
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">
                {t('pending_requests')}
              </h3>
              <div className="mt-3">
                <p className="text-3xl font-semibold text-indigo-600">
                  {pendingRequests.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 사용자 관리 섹션 - admin만 표시 */}
        {currentUserRole === 'admin' && <UserManagement />}
      </div>
    </MainLayout>
  );
} 