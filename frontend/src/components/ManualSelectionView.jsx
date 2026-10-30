import React, { useState, useEffect } from 'react';
import {
  ListFilter,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Info
} from 'lucide-react';
import { getCategories, manualClassify } from '../services/api';
import RecommendationCard from './RecommendationCard';

export default function ManualSelectionView({ onSwitchToAI, onRecordSaved }) {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('Plastic');
  const [customItemName, setCustomItemName] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCat) {
        setSelectedCat(data[0].name);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCat) return;

    setLoading(true);
    setError(null);

    try {
      const data = await manualClassify(selectedCat, customItemName, userNotes);
      setResult(data);
      if (onRecordSaved) onRecordSaved(data);
    } catch (err) {
      setError(err.message || 'Failed to generate recycling recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setCustomItemName('');
    setUserNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div><strong>Error:</strong> {error}</div>
        </div>
      )}

      {!result ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Category Selection Grid */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Choose Waste Category
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Click on the primary material composition of your waste item:
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem'
            }}>
              {categories.map((cat) => {
                const isSelected = selectedCat.toLowerCase() === cat.name.toLowerCase();
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.name)}
                    style={{
                      border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-light)'}`,
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: isSelected ? 'var(--color-primary-hover)' : 'var(--text-main)'
                        }}>
                          {cat.name}
                        </span>
                        {isSelected && (
                          <CheckCircle size={16} color="var(--color-primary)" />
                        )}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 0.5rem 0' }}>
                        {cat.description}
                      </p>
                    </div>

                    <div style={{
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border-light)',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>Bin: <strong>{cat.bin_color}</strong></span>
                      <span>Code: <strong>{cat.recycling_code}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Item Details Form */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
              Item Details (Optional)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="custom-item-name">
                  Specific Item Name or Description
                </label>
                <input
                  id="custom-item-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 500ml Clear PET Water Bottle, Cereal Box, Aluminum Drink Can"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="custom-item-notes">
                  Condition Notes or Questions
                </label>
                <input
                  id="custom-item-notes"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Contains oily residue, cap is missing, paper is laminated"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              {onSwitchToAI && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onSwitchToAI}
                >
                  Prefer to take a photo? Use AI Vision
                </button>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !selectedCat}
                id="btn-get-manual-guidance"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="spinner" />
                    <span>Loading Guidelines...</span>
                  </>
                ) : (
                  <>
                    <span>Get Recycling Guidelines</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <RecommendationCard
          result={result}
          onReset={handleReset}
          onSwitchToManual={null}
          onRecordUpdated={onRecordSaved}
        />
      )}
    </div>
  );
}
