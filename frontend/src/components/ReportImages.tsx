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
      reader.onload = ev => {
        const data = ev.target?.result as string;
        setImages([...images, { image_data: data, caption: '' }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const updateCaption = (idx: number, caption: string) => {
    setImages(images.map((img, i) => i === idx ? { ...img, caption } : img));
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="print-page bg-white border border-gray-400 p-6 mx-auto" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="flex items-stretch border border-gray-400 mb-0">
        <div className="flex-1 flex items-center justify-center border-r border-gray-400 p-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-700 tracking-widest">SK stoa</div>
            <div className="text-xs text-gray-500 mt-1">품질관리팀</div>
          </div>
        </div>
        <div className="flex-[2] flex items-center justify-center border-r border-gray-400">
          <div className="text-2xl font-bold tracking-widest text-gray-900">IMAGE</div>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-gray-600 p-2">
          <div className="text-center">
            <div className="font-semibold">Page 2 / 2</div>
            {reportNo && <div className="text-xs mt-1 text-red-700 font-bold">{reportNo}</div>}
          </div>
        </div>
      </div>

      {/* Upload button */}
      <div className="mt-4 no-print">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          이미지 추가
        </button>
        <span className="ml-2 text-xs text-gray-500">여러 파일 선택 가능</span>
      </div>

      {/* Image grid */}
      {images.length === 0 ? (
        <div className="mt-4 border-2 border-dashed border-gray-300 p-8 text-center text-gray-400 text-sm">
          이미지가 없습니다. 위 버튼을 클릭하여 이미지를 추가하세요.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="border border-gray-300 rounded p-2">
              <img src={img.image_data} alt={img.caption || `이미지 ${idx + 1}`} className="w-full h-48 object-cover rounded" />
              <div className="mt-2 flex gap-2 items-center">
                <input
                  value={img.caption}
                  onChange={e => updateCaption(idx, e.target.value)}
                  placeholder={`캡션 입력 (예: 조리 전/시작)`}
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                />
                <button onClick={() => removeImage(idx)} className="text-red-500 hover:text-red-700 no-print text-sm font-bold">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Equipment notes */}
      <div className="mt-4 border border-gray-400">
        <div className="bg-gray-100 font-semibold p-2 text-sm border-b border-gray-400">** 사용장비</div>
        <textarea
          value={equipmentNotes}
          onChange={e => setEquipmentNotes(e.target.value)}
          rows={3}
          placeholder="사용장비를 입력하세요."
          className="w-full outline-none text-sm p-2 resize-none"
        />
      </div>
    </div>
  );
}
