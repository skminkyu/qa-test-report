import { useState } from 'react';
import Layout from './components/Layout';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import TestItems from './components/TestItems';
import SignatureManager from './components/SignatureManager';

export type TabType = 'form' | 'list' | 'test-items' | 'signatures';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('form');
  const [editReportId, setEditReportId] = useState<number | null>(null);

  const handleOpenReport = (id: number) => {
    setEditReportId(id);
    setActiveTab('form');
  };

  const handleNewReport = () => {
    setEditReportId(null);
    setActiveTab('form');
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); if (tab === 'form') setEditReportId(null); }}>
      {activeTab === 'form' && (
        <ReportForm
          key={editReportId ?? 'new'}
          reportId={editReportId}
          onSaved={() => {}}
        />
      )}
      {activeTab === 'list' && (
        <ReportList onOpenReport={handleOpenReport} onNewReport={handleNewReport} />
      )}
      {activeTab === 'test-items' && <TestItems />}
      {activeTab === 'signatures' && <SignatureManager />}
    </Layout>
  );
}

export default App;
