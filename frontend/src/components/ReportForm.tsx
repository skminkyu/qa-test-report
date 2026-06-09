import { useState, useEffect } from 'react';
import { Tester, TestItem, ReportTestItem, ReportImage, Report } from '../types';
import ReportImages from './ReportImages';

interface Props { reportId: number | null; onSaved: () => void; }

const emptyRow = (): ReportTestItem => ({ test_item_name: '', test_method: '', test_result: '', test_standard: '', detail_method: '' });

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function ReportForm({ reportId, onSaved }: Props) {
  const [page, setPage] = useState<1|2>(1);
  const [testers, setTesters] = useState<Tester[]>([]);
  const [testItems, setTestItems] = useState<TestItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedReportNo, setSavedReportNo] = useState('');
  const [savedReportId, setSavedReportId] = useState<number|null>(reportId);
  const [receiptDate, setReceiptDate] = useState(todayStr());
  const [company, setCompany] = useState('');
  const [issueDate, setIssueDate] = useState(todayStr());
  const [sequence, setSequence] = useState(1);
  const [testerId, setTesterId] = useState<number|''>('');
  const [productName, setProductName] = useState('');
  const [rows, setRows] = useState<ReportTestItem[]>([emptyRow(), emptyRow(), emptyRow()]);
  const [detailMethod, setDetailMethod] = useState('');
  const [images, setImages] = useState<ReportImage[]>([]);
  const [equipmentNotes, setEquipmentNotes] = useState('');

  const selectedTester = testers.find(t => t.id === Number(testerId));
  const teamLeader = testers.find(t => t.is_team_leader === 1);

  useEffect(() => {
    fetch('/api/testers').then(r => r.json()).then(setTesters);
    fetch('/api/test-items').then(r => r.json()).then(setTestItems);
  }, []);

  useEffect(() => {
    if (!reportId) return;
    fetch(`/api/reports/${reportId}`).then(r => r.json()).then((data: Report) => {
      setReceiptDate(data.receipt_date || '');
      setCompany(data.company || '');
      setIssueDate(data.issue_date || '');
      setSequence(data.sequence || 1);
      setTesterId(data.tester_id || '');
      setProductName(data.product_name || '');
      setEquipmentNotes(data.equipment_notes || '');
      setSavedReportNo(data.report_no || '');
      setSavedReportId(data.id);
      if (data.test_items?.length) { setRows(data.test_items); setDetailMethod(data.test_items[0]?.detail_method || ''); }
      if (data.images) setImages(data.images);
    });
  }, [reportId]);

  const handleTestItemSelect = (idx: number, itemName: string) => {
    const found = testItems.find(ti => ti.name === itemName);
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, test_item_name: itemName, test_method: found?.method || r.test_method, test_result: found?.default_result || r.test_result, test_standard: found?.standard || r.test_standard } : r));
  };

  const updateRow = (idx: number, field: keyof ReportTestItem, value: string) =>
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));

  const handleSave = async () => {
    if (!testerId) { alert('시험 담당자를 선택해주세요.'); return; }
    if (!issueDate) { alert('발급일자를 입력해주세요.'); return; }
    setSaving(true);
    try {
      const body = {
        receipt_date: receiptDate, company, issue_date: issueDate, sequence,
        tester_id: testerId, product_name: productName, equipment_notes: equipmentNotes,
        test_items: rows.map(r => ({ ...r, detail_method: detailMethod })).filter(r => r.test_item_name),
        images,
      };
      const res = savedReportId
        ? await fetch(`/api/reports/${savedReportId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.report_no) setSavedReportNo(data.report_no);
      if (data.id) setSavedReportId(data.id);
      onSaved();
      alert(`저장되었습니다.\nReport No: ${data.report_no || savedReportNo}`);
    } catch { alert('저장 중 오류가 발생했습니다.'); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    setReceiptDate(todayStr()); setCompany(''); setIssueDate(todayStr()); setSequence(1);
    setTesterId(''); setProductName(''); setRows([emptyRow(), emptyRow(), emptyRow()]);
    setDetailMethod(''); setImages([]); setEquipmentNotes(''); setSavedReportNo(''); setSavedReportId(null);
  };

  const handlePrint = () => {
    if (!savedReportId) { alert('저장 후 PDF 출력이 가능합니다.'); return; }
    window.print();
  };

  const LogoHeader = ({ pageLabel }: { pageLabel: string }) => (
    <div className="flex items-stretch border border-gray-400">
      <div className="flex-1 flex items-center justify-center border-r border-gray-400 p-3">
        <img src="/logo.png" alt="SK스토아" className="h-12 object-contain" />
      </div>
      <div className="flex-[2] flex items-center justify-center border-r border-gray-400">
        <div className="text-2xl font-bold tracking-widest">시 험 성 적 서</div>
      </div>
      <div className="flex-1 flex items-center justify-center text-sm text-gray-600 p-2">
        <div className="text-center">
          <div className="font-semibold">{pageLabel}</div>
          {savedReportNo && <div className="text-xs mt-1 text-red-700 font-bold">{savedReportNo}</div>}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex gap-2 mb-4 no-print">
        <button onClick={() => setPage(1)} className={`px-4 py-2 rounded font-medium text-sm ${page===1?'bg-red-700 text-white':'bg-white text-gray-700 border'}`}>Page 1 - 시험성적서</button>
        <button onClick={() => setPage(2)} className={`px-4 py-2 rounded font-medium text-sm ${page===2?'bg-red-700 text-white':'bg-white text-gray-700 border'}`}>Page 2 - 이미지</button>
        <div className="flex-1" />
        {savedReportNo && <div className="bg-green-50 border border-green-300 rounded px-4 py-2 text-green-800 font-semibold text-sm">Report No: {savedReportNo}</div>}
        <button onClick={handleReset} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium">초기화</button>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium disabled:opacity-50">{saving?'저장 중...':'저장'}</button>
        <button onClick={handlePrint} className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded text-sm font-medium">PDF 출력</button>
      </div>

      {/* Page 1 */}
      <div className={`${page !== 1 ? 'hidden print-show' : ''}`}>
        <div className="print-page bg-white border border-gray-400 p-6 mx-auto" style={{ maxWidth: 900 }}>
          <LogoHeader pageLabel="Page 1 / 2" />

          <table className="w-full border-collapse border border-gray-400 text-sm">
            <tbody>
              <tr>
                <td className="border border-gray-400 bg-gray-100 font-semibold p-2 w-24 text-center">접수일자</td>
                <td className="border border-gray-400 p-1">
                  <input type="date" value={receiptDate} onChange={e=>setReceiptDate(e.target.value)} className="w-full outline-none text-sm p-1" />
                </td>
                {/* 협력업체명 - 긴 텍스트 자동 축소 */}
                <td className="border border-gray-400 bg-gray-100 font-semibold p-2 w-28 text-center">협력업체명</td>
                <td className="border border-gray-400 p-1 fit-cell">
                  <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="업체명 입력" className="w-full outline-none text-sm p-1" />
                </td>
                <td className="border border-gray-400 bg-gray-100 font-semibold p-2 w-24 text-center">Report No.</td>
                <td className="border border-gray-400 p-2 text-red-700 font-bold text-sm">{savedReportNo||'저장 후 생성'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-gray-100 font-semibold p-2 text-center">발급일자</td>
                <td className="border border-gray-400 p-1">
                  <input type="date" value={issueDate} onChange={e=>setIssueDate(e.target.value)} className="w-full outline-none text-sm p-1" />
                </td>
                <td className="border border-gray-400 bg-gray-100 font-semibold p-2 text-center">순번</td>
                <td className="border border-gray-400 p-1">
                  {/* 화면: 드롭다운 / 프린트: 숫자만 */}
                  <select value={sequence} onChange={e=>setSequence(Number(e.target.value))} className="no-print w-full outline-none text-sm p-1">
                    {[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                  <span className="print-inline text-sm">{sequence}</span>
                </td>
                <td className="border border-gray-400 bg-gray-100 font-semibold p-2 text-center">시험담당자</td>
                <td className="border border-gray-400 p-1">
                  {/* 화면: 드롭다운 (이름+코드) / 프린트: 이름만 */}
                  <select value={testerId} onChange={e=>setTesterId(e.target.value?Number(e.target.value):'')} className="no-print w-full outline-none text-sm p-1">
                    <option value="">선택</option>
                    {testers.map(t=><option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                  </select>
                  <span className="print-inline text-sm">{selectedTester?.name || ''}</span>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 bg-gray-100 font-semibold p-2 text-center">제품명</td>
                <td className="border border-gray-400 p-1 fit-cell" colSpan={5}>
                  <input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="제품명 입력" className="w-full outline-none text-sm p-1" />
                </td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse border border-gray-400 text-sm">
            <thead><tr className="bg-gray-100">
              <th className="border border-gray-400 p-2 text-center w-8 no-print">#</th>
              <th className="border border-gray-400 p-2 text-center">시험항목</th>
              <th className="border border-gray-400 p-2 text-center">시험방법</th>
              <th className="border border-gray-400 p-2 text-center">시험결과</th>
              <th className="border border-gray-400 p-2 text-center">시험기준</th>
              <th className="border border-gray-400 p-2 w-8 no-print"></th>
            </tr></thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-400 p-1 text-center text-xs text-gray-400 no-print">{idx+1}</td>
                  <td className="border border-gray-400 p-1">
                    {/* 화면: 드롭다운 / 프린트: 텍스트만 */}
                    <select value={row.test_item_name} onChange={e=>handleTestItemSelect(idx, e.target.value)} className="no-print w-full outline-none text-sm p-1">
                      <option value="">선택</option>
                      {testItems.map(ti=><option key={ti.id} value={ti.name}>{ti.name}</option>)}
                    </select>
                    <span className="print-inline text-sm">{row.test_item_name}</span>
                  </td>
                  <td className="border border-gray-400 p-1 fit-cell"><input value={row.test_method} onChange={e=>updateRow(idx,'test_method',e.target.value)} className="w-full outline-none text-sm p-1" placeholder="시험방법" /></td>
                  <td className="border border-gray-400 p-1 fit-cell"><input value={row.test_result} onChange={e=>updateRow(idx,'test_result',e.target.value)} className="w-full outline-none text-sm p-1" placeholder="시험결과" /></td>
                  <td className="border border-gray-400 p-1 fit-cell"><input value={row.test_standard} onChange={e=>updateRow(idx,'test_standard',e.target.value)} className="w-full outline-none text-sm p-1" placeholder="시험기준" /></td>
                  <td className="border border-gray-400 p-1 text-center no-print"><button onClick={()=>setRows(prev=>prev.filter((_,i)=>i!==idx))} className="text-red-500 hover:text-red-700 font-bold">×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="no-print mt-1"><button onClick={()=>setRows(prev=>[...prev,emptyRow()])} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ 행 추가</button></div>

          <div className="mt-3 border border-gray-400">
            <div className="bg-gray-100 font-semibold p-2 text-sm border-b border-gray-400">세부 시험방법</div>
            <textarea value={detailMethod} onChange={e=>setDetailMethod(e.target.value)} rows={3} placeholder="세부 시험방법을 입력하세요." className="w-full outline-none text-sm p-2 resize-none" />
          </div>

          <div className="mt-3 border border-gray-400 p-3 text-xs text-gray-600 bg-gray-50">
            <p>본 시험성적서는 의뢰된 시험품에 대한 시험결과만을 나타내며, 제품 전체에 대한 보증을 의미하지 않습니다.</p>
            <p className="mt-1">This report shall not be reproduced except in full, without written approval of the laboratory.</p>
            <p className="mt-1 font-semibold text-center text-red-700 text-sm">SK스토아 품질관리팀</p>
          </div>

          <div className="mt-3 border border-gray-400">
            <div className="bg-gray-100 font-semibold p-2 text-sm border-b border-gray-400 text-center">서명</div>
            <div className="flex">
              <div className="flex-1 border-r border-gray-400 p-3">
                <div className="text-center text-xs font-semibold text-gray-600 mb-2">작성자</div>
                {selectedTester ? (
                  <div className="text-center">
                    <div className="font-semibold text-sm">{selectedTester.name}</div>
                    <div className="text-xs text-gray-500">{selectedTester.title}</div>
                    <div className="text-xs text-gray-500">{selectedTester.email}</div>
                    {selectedTester.signature_image ? <img src={selectedTester.signature_image} alt="서명" className="h-12 mx-auto mt-2 object-contain" /> : <div className="h-12 border border-dashed border-gray-300 mt-2 flex items-center justify-center text-xs text-gray-400">서명 없음</div>}
                  </div>
                ) : <div className="text-center text-xs text-gray-400">담당자를 선택하세요</div>}
              </div>
              <div className="flex-1 p-3">
                <div className="text-center text-xs font-semibold text-gray-600 mb-2">기술책임자</div>
                {teamLeader ? (
                  <div className="text-center">
                    <div className="font-semibold text-sm">{teamLeader.name}</div>
                    <div className="text-xs text-gray-500">{teamLeader.title}</div>
                    <div className="text-xs text-gray-500">{teamLeader.email}</div>
                    {teamLeader.signature_image ? <img src={teamLeader.signature_image} alt="서명" className="h-12 mx-auto mt-2 object-contain" /> : <div className="h-12 border border-dashed border-gray-300 mt-2 flex items-center justify-center text-xs text-gray-400">서명 없음</div>}
                  </div>
                ) : <div className="text-center text-xs text-gray-400">팀장 없음</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page 2 */}
      <div className={`${page !== 2 ? 'hidden print-show' : ''}`}>
        <ReportImages images={images} setImages={setImages} equipmentNotes={equipmentNotes} setEquipmentNotes={setEquipmentNotes} reportNo={savedReportNo} />
      </div>
    </div>
  );
}
