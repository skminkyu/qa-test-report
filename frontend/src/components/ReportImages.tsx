import React, { useRef } from 'react';
import { ReportImage } from '../types';

interface Props {
  images: ReportImage[];
  setImages: (imgs: ReportImage[]) => void;
  equipmentNotes: string;
  setEquipmentNotes: (v: string) => void;
  reportNo: string;
}

export default function ReportImages({ images, setImages, equipmentNotes, setEquipmentNotes, reportNo }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImages([...images, { image_data: ev.target?.result as string, caption: '' }]);
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="print-page bg-white border border-gray-400 p-6 mx-auto" style={{ maxWidth: 900 }}>
      <div className="flex items-stretch border border-gray-400">
        <div className="flex-1 flex items-center justify-center border-r border-gray-400 p-3">
          <img src="/logo.png" alt="SK스토아" className="h-12 object-contain" />
        </div>
        <div className="flex-[2] flex items-center justify-center border-r border-gray-400">
          <div className="text-2xl font-bold tracking-widest">IMAGE</div>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-600 p-2">
          <div className="text-center">
            <div className="font-semibold">Page 2 / 2</div>
            {reportNo && <div className="text-xs mt-1 text-red-700 font-bold">{reportNo}</div>}
          </div>
        </div>
      </div>

      {/* 이미지 추가 버튼 - 프린트 시 숨김 */}
      <div className="mt-4 no-print">
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        <button onClick={() => fileRef.current?.click()} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">이미지 추가</button>
        <span className="ml-2 text-xs text-gray-500">여러 파일 선택 가능</span>
      </div>

      {/* 이미지 없을 때: 화면에는 안내문구, 프린트에는 공란 */}
      {images.length === 0 ? (
        <>
          <div className="no-print mt-4 border-2 border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
            이미지가 없습니다. 위 버튼을 클릭하여 이미지를 추가하세요.
          </div>
          {/* 프린트 시 공란 영역 */}
          <div className="print-show mt-4 border border-gray-300" style={{ minHeight: 200 }} />
        </>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="border border-gray-300 rounded p-2">
              <img src={img.image_data} alt={img.caption || `이미지 ${idx+1}`} className="w-full h-48 object-cover rounded" />
              <div className="mt-2 flex gap-2 items-center">
                <input value={img.caption}
                  onChange={e => setImages(images.map((im,i) => i===idx ? {...im, caption: e.target.value} : im))}
                  placeholder="캡션 입력 (예: 조리 전/시작)"
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none" />
                <button onClick={() => setImages(images.filter((_,i) => i!==idx))} className="text-red-500 hover:text-red-700 no-print text-sm font-bold">×</button>
              </div>
              {/* 프린트 시 캡션 표시 */}
              {img.caption && <div className="print-show text-xs text-center mt-1 text-gray-600">{img.caption}</div>}
            </div>
          ))}
        </div>
      )}

      {/* 사용장비 - 내용 없으면 프린트 시 공란 */}
      <div className="mt-4 border border-gray-400">
        <div className="bg-gray-100 font-semibold p-2 text-sm border-b border-gray-400">** 사용장비</div>
        {/* 화면: textarea */}
        <textarea value={equipmentNotes} onChange={e => setEquipmentNotes(e.target.value)}
          rows={3} placeholder="사용장비를 입력하세요."
          className="no-print w-full outline-none text-sm p-2 resize-none" />
        {/* 프린트: 내용 있으면 텍스트, 없으면 공란 */}
        <div className="print-show text-sm p-2" style={{ minHeight: 60 }}>
          {equipmentNotes || ''}
        </div>
      </div>
    </div>
  );
}
