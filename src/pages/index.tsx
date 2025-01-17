import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import MainLayout from '@/components/Layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { Part, StockRequest } from '@/types'

interface DashboardData {
  lowStockParts: Part[]
  pendingRequests: (StockRequest & {
    parts: {
      code: string
      name: string
    }
    users: {
      name: string
    }
  })[]
}

export default function Dashboard() {
  const { t } = useTranslation('common')
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData>({
    lowStockParts: [],
    pendingRequests: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 재고 부족 부품 조회
      const { data: lowStockParts, error: partsError } = await supabase
        .from('parts')
        .select('*')
        .filter('current_stock', 'lte', 'minimum_stock')
        .order('name')

      if (partsError) throw partsError

      // 대기 중인 재고 요청 조회
      const { data: pendingRequests, error: requestsError } = await supabase
        .from('stock_requests')
        .select(`
          *,
          parts:part_id(code, name),
          users:requester_id(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      if (requestsError) throw requestsError

      setData({
        lowStockParts: lowStockParts || [],
        pendingRequests: pendingRequests || []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 재고 부족 경고 */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                {t('low_stock_alert')} ({data.lowStockParts.length})
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 재고 부족 부품 목록 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('low_stock_parts')}</h2>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {data.lowStockParts.map((part) => (
                  <li key={part.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {part.code} - {part.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('current_stock')}: {part.current_stock} / {t('minimum_stock')}: {part.minimum_stock}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 대기 중인 재고 요청 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">{t('pending_requests')}</h2>
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {data.pendingRequests.map((request) => (
                  <li key={request.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {request.parts.code} - {request.parts.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('quantity')}: {request.quantity} | {t('requester')}: {request.users.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          request.request_type === 'PURCHASE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {t(request.request_type.toLowerCase())}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 