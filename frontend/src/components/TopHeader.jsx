import React from 'react';
import { Calendar } from 'lucide-react';

const PAGE_META = {
  classify: {
    title: 'AI Waste Scanner',
    subtitle: 'Upload a waste photograph to classify the material and receive recycling guidance.'
  },
  manual: {
    title: 'Manual Waste Selection',
    subtitle: 'Choose a waste material directly to get preparation steps and recycling instructions.'
  },
  dashboard: {
    title: 'Recycling Dashboard',
    subtitle: 'Live statistics and material breakdown calculated from stored database records.'
  },
  history: {
    title: 'Classification History',
    subtitle: 'Searchable log of previous classifications and user corrections stored in SQLite.'
  },
  guide: {
    title: 'Waste Segregation Guide',
    subtitle: 'Standard waste categories, 3-way bin rules, and practical tips to avoid contamination.'
  }
};

export default function TopHeader({ activeTab }) {
  const meta = PAGE_META[activeTab] || PAGE_META.classify;
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          margin: 0,
          lineHeight: 1.3
        }}>
          {meta.title}
        </h1>
        <p style={{
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
          margin: '0.15rem 0 0 0'
        }}>
          {meta.subtitle}
        </p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.35rem 0.75rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-card-subtle)',
        border: '1px solid var(--border-light)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <Calendar size={13} color="var(--text-muted)" />
        <span>{today}</span>
      </div>
    </header>
  );
}
