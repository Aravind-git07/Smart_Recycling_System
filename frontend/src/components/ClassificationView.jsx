import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { uploadAndClassifyImage } from '../services/api';
import RecommendationCard from './RecommendationCard';

export default function ClassificationView({ onSwitchToManual, onRecordSaved }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = (file) => {
    setError(null);
    setResult(null);

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Selected image exceeds the 10 MB limit. Please select a smaller file.');
      return;
    }

    // Validate extension
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
    if (!validExtensions.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPG, PNG, WEBP, or BMP image.');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const data = await uploadAndClassifyImage(selectedFile);
      setResult(data);
      if (onRecordSaved) onRecordSaved(data);
    } catch (err) {
      setError(err.message || 'Image classification failed. Please verify that the image is clear and valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Helper to load synthetic or sample blob for quick 1-click test
  const handleLoadSample = (sampleType) => {
    const samples = {
      plastic: { name: 'plastic_water_bottle.jpg', color: '#38bdf8', label: 'PET Plastic Bottle' },
      cardboard: { name: 'cardboard_shipping_box.jpg', color: '#d97706', label: 'Corrugated Cardboard' },
      metal: { name: 'aluminum_soda_can.jpg', color: '#64748b', label: 'Aluminum Beverage Can' },
      glass: { name: 'glass_container_jar.jpg', color: '#0d9488', label: 'Clear Glass Jar' },
    };

    const s = samples[sampleType];
    if (!s) return;

    // Create a real canvas-generated image blob
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = s.color;
    ctx.fillRect(0, 0, 400, 400);

    // Inner icon / text simulation
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.label, 200, 190);
    ctx.font = '16px sans-serif';
    ctx.fillText('Sample Test Image', 200, 230);

    canvas.toBlob((blob) => {
      const file = new File([blob], s.name, { type: 'image/jpeg' });
      processSelectedFile(file);
    }, 'image/jpeg');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Error Banner */}
      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Classification Error:</strong> {error}
          </div>
        </div>
      )}

      {!result ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Upload Drop Area */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Select or Drop Waste Image
            </h3>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.webp,.bmp"
              style={{ display: 'none' }}
              id="waste-file-input"
            />

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border-hover)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-card-subtle)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                flex: 1,
                minHeight: '220px'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}>
                <UploadCloud size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.2rem 0' }}>
                  Click to browse or drag and drop an image
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  Supports JPEG, PNG, WEBP, BMP (up to 10 MB)
                </p>
              </div>
            </div>

            {/* Quick Test Samples */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Sample Waste Items
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  onClick={() => handleLoadSample('plastic')}
                >
                  Plastic Bottle
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  onClick={() => handleLoadSample('cardboard')}
                >
                  Cardboard Box
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  onClick={() => handleLoadSample('metal')}
                >
                  Aluminum Can
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  onClick={() => handleLoadSample('glass')}
                >
                  Glass Jar
                </button>
              </div>
            </div>
          </div>

          {/* Preview & Action Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Image Preview & Verification
              </h3>

              {previewUrl ? (
                <div>
                  <div style={{
                    width: '100%',
                    height: '220px',
                    backgroundColor: '#000000',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-light)'
                  }}>
                    <img
                      src={previewUrl}
                      alt="Uploaded waste preview"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                      {selectedFile?.name}
                    </span>
                    <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {(selectedFile?.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  height: '220px',
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  gap: '0.5rem'
                }}>
                  <FileImage size={32} opacity={0.6} />
                  <span style={{ fontSize: '0.85rem' }}>No image selected yet</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {selectedFile && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUploadAndAnalyze}
                disabled={!selectedFile || loading}
                id="btn-analyze-waste"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="spinner" />
                    <span>Analyzing Waste...</span>
                  </>
                ) : (
                  <>
                    <span>Classify Waste</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results View */
        <RecommendationCard
          result={result}
          onReset={handleReset}
          onSwitchToManual={onSwitchToManual}
          onRecordUpdated={onRecordSaved}
        />
      )}
    </div>
  );
}
