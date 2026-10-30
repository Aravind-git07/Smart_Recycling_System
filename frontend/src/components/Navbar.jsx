import React from 'react';
import {
  Recycle,
  UploadCloud,
  ListFilter,
  BarChart3,
  History,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, healthInfo }) {
  const navItems = [
    { id: 'classify', label: 'AI Classification', icon: UploadCloud },
    { id: 'manual', label: 'Manual Selection', icon: ListFilter },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
    { id: 'guide', label: 'Segregation Guide', icon: BookOpen },
  ];

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
        flexWrap: 'wrap'
      }}>
        {/* Brand Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Recycle size={22} strokeWidth={2.2} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.01em',
              margin: 0
            }}>
              AI-Based Smart Recycling System
            </h1>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              margin: 0
            }}>
              Automated Waste Classification & Material Recovery Guidance
            </p>
          </div>
        </div>

        {/* Right Area: Navigation & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Navigation Tabs */}
          <nav style={{ display: 'flex', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    border: isActive ? '1px solid var(--color-primary-border)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* System Health Status Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.65rem',
            backgroundColor: healthInfo?.status === 'healthy' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${healthInfo?.status === 'healthy' ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '9999px',
            fontSize: '0.72rem',
            color: healthInfo?.status === 'healthy' ? '#166534' : '#991b1b',
            whiteSpace: 'nowrap'
          }}
          title={healthInfo?.ai_engine ? `Engine: ${healthInfo.ai_engine}` : 'Connecting to API...'}
          >
            {healthInfo?.status === 'healthy' ? (
              <CheckCircle2 size={13} color="#16a34a" />
            ) : (
              <AlertCircle size={13} color="#dc2626" />
            )}
            <span>
              {healthInfo?.status === 'healthy'
                ? (healthInfo.gemini_api_configured ? 'Gemini AI Vision' : 'Offline CV Engine')
                : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
