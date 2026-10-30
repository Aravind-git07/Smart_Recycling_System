import React, { useState, useEffect } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  X,
  FileImage,
  CheckCircle2
} from 'lucide-react';
import { getHistory, getHistoryDetail, deleteHistoryRecord, clearAllHistory } from '../services/api';

export default function HistoryView({ onNavigateToClassify }) {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Detail Modal State
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Confirm Clear All Modal
  const [showClearModal, setShowClearModal] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(page, pageSize, categoryFilter, methodFilter, searchTerm);
      setRecords(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to retrieve classification history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, categoryFilter, methodFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const handleOpenDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const data = await getHistoryDetail(id);
      setSelectedRecord(data);
    } catch (err) {
      alert(`Could not load record details: ${err.message}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete classification record #${id}?`)) return;

    try {
      await deleteHistoryRecord(id);
      fetchHistory();
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleConfirmClearAll = async () => {
    try {
      await clearAllHistory();
      setShowClearModal(false);
      setPage(1);
      fetchHistory();
    } catch (err) {
      alert(`Clear failed: ${err.message}`);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Controls Bar */}
      {total > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            className="btn btn-danger"
            onClick={() => setShowClearModal(true)}
            style={{ fontSize: '0.8125rem' }}
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div><strong>Database Error:</strong> {error}</div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by item name, material, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.2rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              style={{ width: 'auto', minWidth: '140px' }}
            >
              <option value="all">All Categories</option>
              <option value="Plastic">Plastic</option>
              <option value="Paper">Paper</option>
              <option value="Cardboard">Cardboard</option>
              <option value="Glass">Glass</option>
              <option value="Metal">Metal</option>
              <option value="Organic">Organic</option>
              <option value="E-Waste">E-Waste</option>
              <option value="General Waste">General Waste</option>
            </select>

            <select
              className="form-select"
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
              style={{ width: 'auto', minWidth: '130px' }}
            >
              <option value="all">All Methods</option>
              <option value="ai">AI Vision Only</option>
              <option value="manual">Manual Only</option>
            </select>

            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Data Table */}
      {records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <HistoryIcon size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
            No Matching Records Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
            {total === 0
              ? 'No classifications have been logged yet. Upload an image or select a category manually to begin.'
              : 'No historical records match your filter criteria. Try adjusting your search term or category filter.'}
          </p>
          {total === 0 && (
            <button className="btn btn-primary" onClick={onNavigateToClassify}>
              Classify Waste Item
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Image</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Method</th>
                  <th>Confidence</th>
                  <th>Recyclability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => handleOpenDetail(r.id)}>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(r.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      {r.image_url ? (
                        <img
                          src={r.image_url}
                          alt={r.item_name}
                          style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                        />
                      ) : (
                        <div style={{ width: '38px', height: '38px', backgroundColor: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <FileImage size={18} />
                        </div>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.item_name}</td>
                    <td>
                      <span className="badge badge-plastic" style={{ textTransform: 'capitalize' }}>
                        {r.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {r.classification_method === 'ai' ? 'AI Vision' : 'Manual'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: r.confidence_score ? 'var(--color-primary)' : 'var(--text-muted)', fontWeight: r.confidence_score ? 600 : 400 }}>
                        {r.confidence_score ? `${Math.round(r.confidence_score * 100)}%` : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                        {r.recyclability}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleOpenDetail(r.id)}
                          title="View Details"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={(e) => handleDeleteItem(r.id, e)}
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid var(--border-light)',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <span>Showing {records.length} of {total} records (Page {page} of {totalPages})</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <button
                className="btn btn-secondary"
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-plastic" style={{ textTransform: 'capitalize', marginBottom: '0.4rem' }}>
                  {selectedRecord.category}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {selectedRecord.item_name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Record ID #{selectedRecord.id} • {new Date(selectedRecord.created_at).toLocaleString()}
                </span>
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.4rem' }}
                onClick={() => setSelectedRecord(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Image if present */}
            {selectedRecord.image_url && (
              <div style={{
                height: '200px',
                backgroundColor: '#000000',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={selectedRecord.image_url}
                  alt={selectedRecord.item_name}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Explanation */}
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Classification Details:
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {selectedRecord.explanation}
              </p>
            </div>

            {/* Disposal & Preparation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Recommended Disposal Method:</div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {selectedRecord.recommendations?.disposal_method}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Preparation Steps:</div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {selectedRecord.recommendations?.preparation_steps?.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{step}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Contamination Warning:</div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-warning-text)' }}>
                  {selectedRecord.recommendations?.contamination_warnings}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '440px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--color-danger-text)' }}>
              Clear Entire Classification History?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              This will permanently delete all {total} recorded classifications and stored images from the local SQLite database. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowClearModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmClearAll}>
                Yes, Clear All Records
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
