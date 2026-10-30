import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  ArrowRight,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { getGuidelines } from '../services/api';

export default function GuidelinesView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGuidelines()
      .then(setData)
      .catch((err) => console.error('Failed to load guidelines', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 4-Tier Waste Hierarchy */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Layers size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            4-Tier Waste Management Hierarchy
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {data?.hierarchy?.map((tier, idx) => (
            <div key={idx} style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: 'var(--radius-md)',
              borderLeft: idx === 0 ? '4px solid var(--color-primary)' : '4px solid var(--border-hover)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {tier.tier}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: idx === 0 ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                  {tier.importance}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {tier.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Way Source Segregation Rules */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShieldCheck size={18} color="#0284c7" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            Standard 3-Way Source Segregation Framework
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {data?.segregation_rules?.map((rule, idx) => (
            <div key={idx} style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                {rule.stream}
              </div>
              <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <strong>Included Materials:</strong> {rule.materials}
              </p>
              <div style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: '#f0fdf4',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                color: '#166534',
                border: '1px solid #bbf7d0'
              }}>
                <strong>Segregation Rule:</strong> {rule.golden_rule}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Contamination Mistakes to Avoid */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertTriangle size={18} color="#b45309" />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
            Common Contamination Mistakes & Scientific Reasons
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {data?.common_contamination_mistakes?.map((m, idx) => (
            <div key={idx} style={{
              padding: '1rem',
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-warning-text)', marginBottom: '0.35rem' }}>
                {m.mistake}
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#78350f', lineHeight: 1.5 }}>
                <strong>Scientific Reason:</strong> {m.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* College Project Viva / Review Defense Section */}
      <div className="card" style={{ borderLeft: '4px solid #7c3aed' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <GraduationCap size={20} color="#7c3aed" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            College Viva & Project Review Defense Reference
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          Use these established facts during your project evaluation:
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <li style={{ marginBottom: '0.35rem' }}>
            <strong>Why Material Segregation Matters:</strong> Commingled unsegregated waste results in downcycling and high contamination rejection rates (up to 30% in single-stream plants). Clean separation at source preserves material purity.
          </li>
          <li style={{ marginBottom: '0.35rem' }}>
            <strong>Aluminum Circularity:</strong> Recycling aluminum saves 95% of the electrical energy required to smelt virgin aluminum from raw bauxite ore.
          </li>
          <li style={{ marginBottom: '0.35rem' }}>
            <strong>Plastic Mechanical Downcycling:</strong> Most commodity plastics (#1 PET and #2 HDPE) can typically be mechanically recycled only 2 to 3 times before polymer chains degrade and require dilution with virgin resins.
          </li>
          <li style={{ marginBottom: '0.35rem' }}>
            <strong>Methane Emissions from Organic Waste:</strong> When organic biodegradable matter is trapped anaerobically under landfill compactors without oxygen, it generates methane (CH4), a greenhouse gas with 28x greater global warming potential than CO2 over a 100-year timescale.
          </li>
        </ul>
      </div>
    </div>
  );
}
