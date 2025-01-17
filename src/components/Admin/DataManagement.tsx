import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { supabase } from '@/lib/supabase';

export default function DataManagement() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      // 각 테이블의 데이터 가져오기
      const tables = ['parts', 'stock_requests', 'stock_history', 'stock_alerts'];
      const backupData: Record<string, any> = {};

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*');
        
        if (error) throw error;
        backupData[table] = data;
      }

      // JSON 파일로 다운로드
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error creating backup:', error);
      alert(t('backup_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    setLoading(true);

    try {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          
          // 각 테이블 복원
          for (const [table, data] of Object.entries(backupData)) {
            const { error } = await supabase
              .from(table)
              .upsert(data as any[]);

            if (error) throw error;
          }

          alert(t('restore_success'));
        } catch (error) {
          console.error('Error restoring data:', error);
          alert(t('restore_failed'));
        } finally {
          setLoading(false);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">{t('data_management')}</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <button
              onClick={handleBackup}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? t('backing_up') : t('create_backup')}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('restore_backup')}
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              disabled={loading}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 