import { useState, useEffect } from 'react';
import { Report } from '../types';

interface Props {
  onOpenReport: (id: number) => void;
  onNewReport: () => void;
}

export default function ReportList({ onOpenReport, onNewReport }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/reports').then(r => r.json()).then(data => {
      setReports(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, reportNo: string) => {
    if (!confirm(`Report No. ${reportNo}를 삭제하시겠습니까?`)) return;
    await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Report No. 관리</h2>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">새로고침</button>
          <button onClick={onNewReport} className="px-3 py-2 bg-red-700 text-white rounded text-sm hover:bg-red-800">+ 새 성적서</button>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-400">로딩 중...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 text-gray-400">성적서가 없습니다.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Report No.</th>
                <th className="border border-gray-300 p-2 text-left">제품명</th>
                <th className="border border-gray-300 p-2 text-left">협력업체명</th>
                <th className="border border-gray-300 p-2 text-left">시험담당자</th>
                <th className="border border-gray-300 p-2 text-left">시험항목</th>
                <th className="border border-gray-300 p-2 text-left">발급일자</th>
                <th className="border border-gray-300 p-2 text-center w-20">작업</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => onOpenReport(r.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      {r.report_no}
                    </button>
                  </td>
                  <td className="border border-gray-300 p-2">{r.product_name || '-'}</td>
                  <td className="border border-gray-300 p-2">{r.company || '-'}</td>
                  <td className="border border-gray-300 p-2">{r.tester_name || '-'}</td>
                  <td className="border border-gray-300 p-2 text-xs text-gray-600 max-w-xs truncate">{r.test_items_summary || '-'}</td>
                  <td className="border border-gray-300 p-2">{r.issue_date || '-'}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      onClick={() => handleDelete(r.id, r.report_no)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
