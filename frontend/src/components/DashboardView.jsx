import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  Cpu,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { getDashboardStats } from '../services/api';

export default function DashboardView({ onNavigateToClassify, onSelectHistoryItem }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '0.75rem' }}>
        <RefreshCw size={20} className="spinner" color="var(--color-primary)" />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Calculating dashboard statistics from database...</span>
      </div>
    );
  }

  const total = stats?.total_classifications || 0;
  const aiCount = stats?.ai_classifications || 0;
  const manualCount = stats?.manual_classifications || 0;
  const catCounts = stats?.category_counts || {};
  const recCounts = stats?.recyclability_counts || {};
  const weekly = stats?.weekly_trend || [];
  const recents = stats?.recent_activities || [];

  const aiPercentage = total > 0 ? Math.round((aiCount / total) * 100) : 0;
  const manualPercentage = total > 0 ? Math.round((manualCount / total) * 100) : 0;
  const highRecyclableCount = recCounts['High'] || 0;
  const highRecyclablePercent = total > 0 ? Math.round((highRecyclableCount / total) * 100) : 0;

  // Find max category count for bar scaling
  const maxCatCount = Math.max(...Object.values(catCounts), 1);
  const maxWeeklyCount = Math.max(...weekly.map(w => w.total), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          className="btn btn-secondary"
          onClick={fetchStats}
          disabled={loading}
          style={{ fontSize: '0.8125rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Database Error:</strong> {error}
        </div>
      )}

      {total === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <BarChart3 size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
            No Classification Records Yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
            Start by uploading a waste photograph or manually selecting a material to populate live recycling metrics.
          </p>
          <button className="btn btn-primary" onClick={onNavigateToClassify}>
            Classify First Waste Item
          </button>
        </div>
      ) : (
        <>
          {/* Key Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div className="card" style={{ borderTop: '3px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Classifications
                </span>
                <Layers size={16} color="var(--color-primary)" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {total}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Recorded waste items
              </span>
            </div>

            <div className="card" style={{ borderTop: '3px solid #0284c7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  AI Vision Analyses
                </span>
                <Cpu size={16} color="#0284c7" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {aiCount}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {aiPercentage}% of total classifications
              </span>
            </div>

            <div className="card" style={{ borderTop: '3px solid #7c3aed' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Manual Selections
                </span>
                <UserCheck size={16} color="#7c3aed" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {manualCount}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {manualPercentage}% of total classifications
              </span>
            </div>

            <div className="card" style={{ borderTop: '3px solid #16a34a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  High Recyclability
                </span>
                <CheckCircle2 size={16} color="#16a34a" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {highRecyclablePercent}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {highRecyclableCount} highly recyclable items
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Category Distribution Bar Chart */}
            <div className="card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Category-Wise Distribution
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Distribution of recorded waste materials by category
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.keys(catCounts).length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No category data available.</p>
                ) : (
                  Object.entries(catCounts).map(([cat, count]) => {
                    const pct = Math.round((count / total) * 100);
                    const widthPct = Math.max(4, Math.round((count / maxCatCount) * 100));
                    return (
                      <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{
                          height: '10px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '9999px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${widthPct}%`,
                            backgroundColor: 'var(--color-primary)',
                            borderRadius: '9999px',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Method Breakdown & Recyclability */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Classification Method Ratio
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Proportion of AI Vision vs User Manual Designation
                </p>

                {/* Progress bar ratio */}
                <div style={{
                  height: '24px',
                  backgroundColor: '#7c3aed',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  display: 'flex',
                  marginBottom: '0.75rem'
                }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${aiPercentage}%`,
                      backgroundColor: 'var(--color-primary)',
                      transition: 'width 0.3s ease'
                    }}
                    title={`AI Vision: ${aiPercentage}%`}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }} />
                    <span>AI Vision: <strong>{aiCount}</strong> ({aiPercentage}%)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '10px', height: '10px', backgroundColor: '#7c3aed', borderRadius: '2px' }} />
                    <span>Manual Selection: <strong>{manualCount}</strong> ({manualPercentage}%)</span>
                  </div>
                </div>

                {/* Recyclability Status */}
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.65rem' }}>
                  Recyclability Potential Breakdown
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
                  {Object.entries(recCounts).map(([rec, count]) => (
                    <div key={rec} style={{
                      padding: '0.6rem 0.85rem',
                      backgroundColor: 'var(--bg-card-subtle)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Activity Trend */}
          <div className="card">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              7-Day Activity Volume
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Daily recorded classifications over the past 7 days
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', paddingTop: '1rem', borderBottom: '1px solid var(--border-light)' }}>
              {weekly.map((day, idx) => {
                const barHeight = maxWeeklyCount > 0 ? Math.max(6, Math.round((day.total / maxWeeklyCount) * 110)) : 6;
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    flex: 1
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {day.total}
                    </span>
                    <div
                      style={{
                        width: '32px',
                        height: `${barHeight}px`,
                        backgroundColor: day.total > 0 ? 'var(--color-primary)' : '#e2e8f0',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.25s ease'
                      }}
                      title={`${day.date}: ${day.total} items (${day.ai} AI, ${day.manual} Manual)`}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>
                Recent Classification Activities
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Latest 5 logged events
              </span>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th>Method</th>
                    <th>Recyclability</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recents.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                      <td>
                        <span className="badge badge-plastic" style={{ textTransform: 'capitalize' }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {item.classification_method === 'ai' ? 'AI Vision' : 'Manual'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                          {item.recyclability}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(item.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
