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

  const inferCategoryFromText = (text) => {
    if (!text) return null;
    const lower = text.toLowerCase().trim();
    if (/tin|coke|pepsi|soda\s*can|aluminum|aluminium|foil|steel|metal|iron|copper|brass|\bcan\b/i.test(lower)) {
      if (!/trash\s*can|garbage\s*can/i.test(lower)) return 'Metal';
    }
    if (/glass|jar|pickle|mason|cullet|mirror|wine\s*bottle|beer\s*bottle/i.test(lower)) {
      return 'Glass';
    }
    if (/cardboard|box|carton|corrugated|shipping\s*box|pizza\s*box/i.test(lower)) {
      return 'Cardboard';
    }
    if (/paper|newspaper|magazine|book|notebook|receipt|envelope|printout/i.test(lower)) {
      return 'Paper';
    }
    if (/e-?waste|cable|charger|wire|battery|phone|laptop|circuit|usb|adapter|electronic/i.test(lower)) {
      return 'E-Waste';
    }
    if (/food|fruit|vegetable|peel|banana|apple|bread|scrap|organic|compost/i.test(lower)) {
      return 'Organic';
    }
    if (/plastic|water\s*bottle|shampoo|bottle|jug|tub|container|pvc|pet|hdpe|polymer/i.test(lower)) {
      return 'Plastic';
    }
    return null;
  };

  const handleItemNameChange = (e) => {
    const val = e.target.value;
    setCustomItemName(val);
    const autoCat = inferCategoryFromText(val);
    if (autoCat) {
      setSelectedCat(autoCat);
    }
  };

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                  Choose Waste Category
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Click a material card, or type your item below to auto-select:
                </p>
              </div>
              <div style={{
                backgroundColor: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary)',
                color: 'var(--color-primary-hover)',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span>Active Selection:</span>
                <strong>{selectedCat}</strong>
              </div>
            </div>

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
                  placeholder="e.g. 500ml Clear PET Water Bottle, Coke Tin, Glass Jar, Cereal Box"
                  value={customItemName}
                  onChange={handleItemNameChange}
                />
                {customItemName && inferCategoryFromText(customItemName) && (
                  <div style={{
                    marginTop: '0.45rem',
                    fontSize: '0.8125rem',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 500
                  }}>
                    <CheckCircle size={15} />
                    <span>Auto-detected material: <strong>{inferCategoryFromText(customItemName)}</strong> (Category card selected above)</span>
                  </div>
                )}
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
