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

export default function Sidebar({ activeTab, setActiveTab, healthInfo }) {
  const navItems = [
    { id: 'classify', label: 'AI Waste Scanner', icon: UploadCloud, desc: 'Image upload & detection' },
    { id: 'manual', label: 'Manual Selection', icon: ListFilter, desc: 'Direct material guidance' },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, desc: 'Statistics & charts' },
    { id: 'history', label: 'History Log', icon: History, desc: 'Past records & audit' },
    { id: 'guide', label: 'Recycling Guide', icon: BookOpen, desc: 'Rules & safety tips' },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      height: '100vh',
      flexShrink: 0,
      boxShadow: '1px 0 3px rgba(0,0,0,0.02)',
      zIndex: 40
    }}>
      {/* Top Brand Section */}
      <div>
        <div style={{
          padding: '1.25rem 1.25rem 1rem 1.25rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 4px rgba(21, 128, 61, 0.2)'
          }}>
            <Recycle size={22} strokeWidth={2.3} />
          </div>
          <div>
            <h1 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.01em',
              margin: 0,
              lineHeight: 1.2
            }}>
              Smart Recycling
            </h1>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              fontWeight: 500
            }}>
              AI Waste Management
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div style={{ padding: '1rem 0.75rem' }}>
          <div style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0 0.5rem 0.5rem 0.5rem'
          }}>
            Navigation
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
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
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    border: isActive ? '1px solid var(--color-primary-border)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ lineHeight: 1.2 }}>{item.label}</span>
                    <span style={{ fontSize: '0.68rem', color: isActive ? '#166534' : 'var(--text-muted)', marginTop: '2px' }}>
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

    </aside>
  );
}
