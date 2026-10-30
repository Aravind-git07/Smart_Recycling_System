import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import ClassificationView from './components/ClassificationView';
import ManualSelectionView from './components/ManualSelectionView';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import GuidelinesView from './components/GuidelinesView';
import { checkSystemHealth } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('classify');
  const [healthInfo, setHealthInfo] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // Initial health check
    checkSystemHealth()
      .then(setHealthInfo)
      .catch(() => setHealthInfo({ status: 'degraded' }));

    // Periodic heartbeat every 30s
    const interval = setInterval(() => {
      checkSystemHealth()
        .then(setHealthInfo)
        .catch(() => setHealthInfo({ status: 'degraded' }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleRecordSaved = (data) => {
    showToast(`Saved '${data.item_name || data.category}' to history.`);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthInfo={healthInfo}
      />

      {/* Main Content Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Clean Separated Top Header */}
        <TopHeader activeTab={activeTab} />

        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderLeft: '4px solid var(--color-primary)'
          }}>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* View Content */}
        <main style={{ flex: 1, padding: '2rem 2.25rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {activeTab === 'classify' && (
              <ClassificationView
                onSwitchToManual={() => setActiveTab('manual')}
                onRecordSaved={handleRecordSaved}
              />
            )}

            {activeTab === 'manual' && (
              <ManualSelectionView
                onSwitchToAI={() => setActiveTab('classify')}
                onRecordSaved={handleRecordSaved}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigateToClassify={() => setActiveTab('classify')}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                onNavigateToClassify={() => setActiveTab('classify')}
              />
            )}

            {activeTab === 'guide' && (
              <GuidelinesView />
            )}
          </div>
        </main>

        {/* Clean Footer */}
        <footer style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border-light)',
          padding: '1rem 2.25rem',
          marginTop: 'auto'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: 'var(--text-muted)'
          }}>
            <span>Smart Recycling System</span>
            <span>Waste Classification & Recycling Guidance</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
