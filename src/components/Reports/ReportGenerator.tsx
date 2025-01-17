import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { supabase } from '@/lib/supabase';

type ReportType = 'stock' | 'requests' | 'activity';

export default function ReportGenerator() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('stock');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      let data;
      switch (reportType) {
        case 'stock':
          data = await generateStockReport();
          break;
        case 'requests':
          data = await generateRequestsReport();
          break;
        case 'activity':
          data = await generateActivityReport();
          break;
      }

      downloadReport(data, reportType);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(t('report_generation_failed'));
    } finally {
      setLoading(false);
    }
  };

  const generateStockReport = async () => {
    const { data, error } = await supabase
      .from('parts')
      .select(`
        *,
        stock_history (
          quantity,
          type,
          created_at
        )
      `)
      .order('name');

    if (error) throw error;
    return data;
  };

  const generateRequestsReport = async () => {
    const { data, error } = await supabase
      .from('stock_requests')
      .select(`
        *,
        parts (code, name),
        users (name)
      `)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  const generateActivityReport = async () => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        users (name)
      `)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  };

  const downloadReport = (data: any, type: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">{t('generate_report')}</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('report_type')}
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="stock">{t('stock_report')}</option>
              <option value="requests">{t('requests_report')}</option>
              <option value="activity">{t('activity_report')}</option>
            </select>
          </div>
          
          {reportType !== 'stock' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('start_date')}
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('end_date')}
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}

          <button
            onClick={generateReport}
            disabled={loading}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? t('generating') : t('generate')}
          </button>
        </div>
      </div>
    </div>
  );
} 