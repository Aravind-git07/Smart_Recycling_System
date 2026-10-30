import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  Sparkles,
  Layers,
  Trash2,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { correctClassification } from '../services/api';

const ALL_CATEGORIES = [
  'Plastic',
  'Paper',
  'Cardboard',
  'Glass',
  'Metal',
  'Organic',
  'E-Waste',
  'General Waste'
];

export default function RecommendationCard({ result: initialResult, onReset, onRecordUpdated }) {
  const [result, setResult] = useState(initialResult);
  const [correcting, setCorrecting] = useState(false);
  const [correctionSuccess, setCorrectionSuccess] = useState(null);

  if (!result) return null;

  const rec = result.recommendations || {};

  const handleCorrectCategory = async (targetCategory) => {
    if (targetCategory.toLowerCase() === result.category.toLowerCase()) return;

    setCorrecting(true);
    setCorrectionSuccess(null);

    try {
      const updated = await correctClassification(
        result.id,
        targetCategory,
        `${targetCategory} Item (Corrected)`
      );
      setResult(updated);
      setCorrectionSuccess(`Corrected to ${targetCategory}. Recycling guidelines updated.`);
      if (onRecordUpdated) onRecordUpdated(updated);
    } catch (err) {
      alert(`Could not correct category: ${err.message}`);
    } finally {
      setCorrecting(false);
    }
  };

  const getCategoryClass = (cat) => {
    const map = {
      'Plastic': 'badge-plastic',
      'Paper': 'badge-paper',
      'Cardboard': 'badge-cardboard',
      'Glass': 'badge-glass',
      'Metal': 'badge-metal',
      'Organic': 'badge-organic',
      'E-Waste': 'badge-e-waste',
      'General Waste': 'badge-general-waste'
    };
    return map[cat] || 'badge-general-waste';
  };

  const getRecyclabilityClass = (recLevel) => {
    const map = {
      'High': 'badge-high',
      'Moderate': 'badge-moderate',
      'Low': 'badge-low',
      'Non-Recyclable': 'badge-non-recyclable',
      'Hazardous': 'badge-low'
    };
    return map[recLevel] || 'badge-non-recyclable';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Primary Result Banner */}
      <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              <span className={`badge ${getCategoryClass(result.category)}`}>
                {result.category}
              </span>
              <span className={`badge ${getRecyclabilityClass(rec.recyclability)}`}>
                Recyclability: {rec.recyclability}
              </span>
              {rec.recycling_code && (
                <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
                  Code: {rec.recycling_code}
                </span>
              )}
              {rec.bin_color && (
                <span className="badge" style={{ backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' }}>
                  Target Bin: {rec.bin_color}
                </span>
              )}
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.2rem 0' }}>
              {result.item_name || `${result.category} Item`}
            </h2>
          </div>

          {/* Confidence Score (AI Only) */}
          {result.classification_method === 'ai' && typeof result.confidence_score === 'number' && (
            <div style={{
              textAlign: 'right',
              padding: '0.65rem 0.95rem',
              backgroundColor: 'var(--bg-card-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              minWidth: '140px'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                AI Confidence
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {Math.round(result.confidence_score * 100)}%
              </div>
              <div style={{
                height: '5px',
                backgroundColor: '#e2e8f0',
                borderRadius: '9999px',
                marginTop: '0.3rem',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, Math.round(result.confidence_score * 100))}%`,
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '9999px'
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Simple Explanation & Features */}
        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {result.explanation}
          </p>

          {result.visual_features && result.visual_features.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Features:</span>
              {result.visual_features.map((feat, idx) => (
                <span key={idx} style={{
                  fontSize: '0.72rem',
                  padding: '0.15rem 0.5rem',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius-sm)',
                  color: '#334155',
                  border: '1px solid #e2e8f0'
                }}>
                  {feat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Disposal & Practical Reuse */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Trash2 size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Recommended Disposal Method</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {rec.disposal_method}
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Sparkles size={18} color="#0284c7" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Practical Reuse Ideas</h3>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {rec.reuse_ideas && rec.reuse_ideas.map((idea, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>{idea}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sequential Preparation Steps (Clear Numbered Steps, No Checkboxes) */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Layers size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Preparation Instructions</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {rec.preparation_steps && rec.preparation_steps.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary-hover)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                {idx + 1}
              </div>
              <span style={{
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                lineHeight: 1.5
              }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings & Safety Notes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <div className="alert alert-warning" style={{ alignItems: 'flex-start' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>
              Contamination Warning
            </strong>
            <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.45 }}>
              {rec.contamination_warnings}
            </p>
          </div>
        </div>

        <div className="alert alert-danger" style={{ alignItems: 'flex-start' }}>
          <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>
              Safety Precautions
            </strong>
            <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.45 }}>
              {rec.safety_precautions}
            </p>
          </div>
        </div>
      </div>

      {/* Local Regulations Note */}
      <div className="alert alert-info" style={{ alignItems: 'flex-start' }}>
        <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.85rem' }}>
            Local Municipal Note
          </strong>
          <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.45 }}>
            {rec.local_regulations_note}
          </p>
        </div>
      </div>

      {/* Correction Section at the End of the Page (Directly requested by user) */}
      <div className="card" style={{ backgroundColor: '#fcfdfd', border: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Edit3 size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Did the AI predict wrong? Select the correct material:
            </span>
          </div>
          {correcting && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RefreshCw size={13} className="spinner" /> Updating...
            </span>
          )}
        </div>

        {correctionSuccess && (
          <div style={{
            fontSize: '0.8rem',
            color: '#166534',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <CheckCircle size={14} color="#16a34a" />
            <span>{correctionSuccess}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {ALL_CATEGORIES.map((cat) => {
            const isCurrent = cat.toLowerCase() === result.category.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCorrectCategory(cat)}
                disabled={correcting || isCurrent}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  border: isCurrent ? '1.5px solid var(--color-primary)' : '1px solid var(--border-light)',
                  backgroundColor: isCurrent ? 'var(--color-primary-light)' : '#ffffff',
                  color: isCurrent ? 'var(--color-primary-hover)' : 'var(--text-secondary)',
                  fontWeight: isCurrent ? 600 : 500,
                  cursor: isCurrent ? 'default' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat} {isCurrent && '✓'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '0.25rem' }}>
        {onReset && (
          <button className="btn btn-primary" onClick={onReset}>
            Classify Another Item
          </button>
        )}
      </div>
    </div>
  );
}
