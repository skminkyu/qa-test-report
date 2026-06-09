import React from 'react';
import { TabType } from '../App';

interface LayoutProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  children: React.ReactNode;
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'form', label: '성적서 기본양식' },
  { id: 'list', label: 'Report No. 관리' },
  { id: 'test-items', label: '시험가능항목 관리' },
  { id: 'signatures', label: '서명 관리' },
];

export default function Layout({ activeTab, setActiveTab, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-red-700 text-white shadow-md no-print">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="text-2xl font-bold tracking-wide">SK stoa</div>
          <div className="text-lg font-semibold">품질관리팀 시험성적서 관리시스템</div>
        </div>
      </header>
      <nav className="bg-white border-b shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-700 text-red-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
