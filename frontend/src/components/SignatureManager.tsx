import React, { useState, useEffect, useRef } from 'react';
import { Tester } from '../types';
import Modal from './Modal';

const emptyForm = (): Omit<Tester, 'id'> => ({
  code: '', name: '', title: '', email: '', phone: '', signature_image: null, is_team_leader: 0
});

export default function SignatureManager() {
  const [testers, setTesters] = useState<Tester[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTester, setEditTester] = useState<Tester | null>(null);
  const [form, setForm] = useState<Omit<Tester, 'id'>>(emptyForm());
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => fetch('/api/testers').then(r => r.json()).then(setTesters);
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditTester(null); setForm(emptyForm()); setShowModal(true); };
  const openEdit = (t: Tester) => {
    setEditTester(t);
    setForm({ code: t.code, name: t.name, title: t.title, email: t.email, phone: t.phone, signature_image: t.signature_image, is_team_leader: t.is_team_leader });
    setShowModal(true);
  };

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(prev => ({ ...prev, signature_image: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) { alert('코드번호와 이름은 필수입니다.'); return; }
    if (editTester) {
      await fetch(`/api/testers/${editTester.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/testers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setShowModal(false);
    load();
  };

  const handleDelete = async (t: Tester) => {
    if (!confirm(`"${t.name}"을(를) 삭제하시겠습니까?`)) return;
    await fetch(`/api/testers/${t.id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">서명 관리</h2>
        <button onClick={openAdd} className="px-3 py-2 bg-red-700 text-white rounded text-sm hover:bg-red-800">+ 담당자 추가</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-center">코드번호</th>
              <th className="border border-gray-300 p-2 text-left">이름</th>
              <th className="border border-gray-300 p-2 text-left">직함</th>
              <th className="border border-gray-300 p-2 text-left">이메일</th>
              <th className="border border-gray-300 p-2 text-left">연락처</th>
              <th className="border border-gray-300 p-2 text-center">서명이미지</th>
              <th className="border border-gray-300 p-2 text-center">팀장여부</th>
              <th className="border border-gray-300 p-2 text-center w-20">작업</th>
            </tr>
          </thead>
          <tbody>
            {testers.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 text-center font-mono">{t.code}</td>
                <td className="border border-gray-300 p-2 font-medium">{t.name}</td>
                <td className="border border-gray-300 p-2 text-gray-600">{t.title}</td>
                <td className="border border-gray-300 p-2 text-gray-600">{t.email}</td>
                <td className="border border-gray-300 p-2 text-gray-600">{t.phone}</td>
                <td className="border border-gray-300 p-2 text-center">
                  {t.signature_image ? (
                    <img src={t.signature_image} alt="서명" className="h-8 mx-auto object-contain" />
                  ) : (
                    <span className="text-gray-400 text-xs">없음</span>
                  )}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {t.is_team_leader ? (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-semibold">팀장</span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  <button onClick={() => openEdit(t)} className="text-blue-600 hover:text-blue-800 text-xs mr-2">수정</button>
                  <button onClick={() => handleDelete(t)} className="text-red-500 hover:text-red-700 text-xs">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editTester ? '담당자 수정' : '담당자 추가'} onClose={() => setShowModal(false)} wide>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '코드번호', key: 'code', placeholder: '예: 07' },
                { label: '이름', key: 'name', placeholder: '예: 김민규' },
                { label: '직함', key: 'title', placeholder: '예: 김민규 매니저' },
                { label: '이메일', key: 'email', placeholder: '예: kim@skstoa.com' },
                { label: '연락처', key: 'phone', placeholder: '예: 010-0000-0000' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    value={(form as Record<string, string | number | null>)[key] as string || ''}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="is_team_leader"
                  checked={form.is_team_leader === 1}
                  onChange={e => setForm(prev => ({ ...prev, is_team_leader: e.target.checked ? 1 : 0 }))}
                  className="w-4 h-4"
                />
                <label htmlFor="is_team_leader" className="text-sm font-medium text-gray-700">팀장 (기술책임자)</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">서명 이미지</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleSigUpload} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                이미지 선택
              </button>
              {form.signature_image && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={form.signature_image} alt="서명 미리보기" className="h-16 border rounded object-contain" />
                  <button onClick={() => setForm(prev => ({ ...prev, signature_image: null }))} className="text-red-500 text-xs hover:text-red-700">삭제</button>
                </div>
              )}
            </div>
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
