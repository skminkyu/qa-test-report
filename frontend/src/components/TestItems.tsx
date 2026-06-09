import { useState, useEffect } from 'react';
import { TestItem } from '../types';
import Modal from './Modal';

const emptyItem = (): Omit<TestItem, 'id'> => ({
  name: '', code: '', default_result: '', standard: '', method: ''
});

export default function TestItems() {
  const [items, setItems] = useState<TestItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<TestItem | null>(null);
  const [form, setForm] = useState(emptyItem());

  const load = () => fetch('/api/test-items').then(r => r.json()).then(setItems);
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditItem(null); setForm(emptyItem()); setShowModal(true); };
  const openEdit = (item: TestItem) => { setEditItem(item); setForm({ name: item.name, code: item.code, default_result: item.default_result, standard: item.standard, method: item.method }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.code) { alert('시험항목명과 시험코드는 필수입니다.'); return; }
    if (editItem) {
      await fetch(`/api/test-items/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/test-items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (item: TestItem) => {
    if (!confirm(`"${item.name}"을(를) 삭제하시겠습니까?`)) return;
    await fetch(`/api/test-items/${item.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">시험가능항목 관리</h2>
        <button onClick={openAdd} className="px-3 py-2 bg-red-700 text-white rounded text-sm hover:bg-red-800">+ 항목 추가</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">시험항목명</th>
              <th className="border border-gray-300 p-2 text-left">시험코드</th>
              <th className="border border-gray-300 p-2 text-left">시험결과(기본)</th>
              <th className="border border-gray-300 p-2 text-left">시험기준</th>
              <th className="border border-gray-300 p-2 text-left">시험방법</th>
              <th className="border border-gray-300 p-2 text-center w-24">작업</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 font-medium">{item.name}</td>
                <td className="border border-gray-300 p-2 text-gray-600">{item.code}</td>
                <td className="border border-gray-300 p-2">{item.default_result}</td>
                <td className="border border-gray-300 p-2 text-xs">{item.standard}</td>
                <td className="border border-gray-300 p-2 text-xs">{item.method}</td>
                <td className="border border-gray-300 p-2 text-center">
                  <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 text-xs mr-2">수정</button>
                  <button onClick={() => handleDelete(item)} className="text-red-500 hover:text-red-700 text-xs">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editItem ? '시험항목 수정' : '시험항목 추가'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            {[
              { label: '시험항목명', key: 'name', placeholder: '예: 형광유무' },
              { label: '시험코드', key: 'code', placeholder: '예: STQ 23:03' },
              { label: '시험결과(기본값)', key: 'default_result', placeholder: '예: 음성' },
              { label: '시험기준', key: 'standard', placeholder: '예: 형광물질 불검출' },
              { label: '시험방법', key: 'method', placeholder: '예: 형광증백제 검사지 사용' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  value={(form as Record<string, string>)[key]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">저장</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded text-sm hover:bg-gray-300">취소</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
