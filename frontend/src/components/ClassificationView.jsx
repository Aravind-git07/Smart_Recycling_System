import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileImage,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Camera,
  Video,
  X,
  Check
} from 'lucide-react';
import { uploadAndClassifyImage } from '../services/api';
import RecommendationCard from './RecommendationCard';

export default function ClassificationView({ onSwitchToManual, onRecordSaved }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  // Camera & Webcam state
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);

  // Clean up webcam streams on unmount
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [webcamStream]);

  // Connect stream to video element when webcam becomes active
  useEffect(() => {
    if (isWebcamActive && videoRef.current && webcamStream) {
      videoRef.current.srcObject = webcamStream;
      videoRef.current.play().catch((err) => {
        console.warn('Auto-play error on video element:', err);
      });
    }
  }, [isWebcamActive, webcamStream]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const processSelectedFile = (file) => {
    setError(null);
    setResult(null);

    // Validate size (15 MB)
    if (file.size > 15 * 1024 * 1024) {
      setError('Selected image exceeds the 15 MB limit. Please select a smaller photo.');
      return;
    }

    // Forgiving validation for all mobile cameras & image types
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|heic|jfif)$/i.test(file.name);
    if (!isImage && file.type !== '') {
      setError('Unsupported file type. Please upload a clear photo (JPG, PNG, WEBP, BMP).');
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

  // Start live webcam feed
  const startWebcam = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setWebcamStream(stream);
      setIsWebcamActive(true);
    } catch (err) {
      console.warn('Webcam access error:', err);
      // If live webcam fails or permission denied, fall back to native phone camera capture
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        setError('Unable to access camera. Please allow camera permissions or use the upload button.');
      }
    }
  };

  // Stop live webcam feed
  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    setIsWebcamActive(false);
  };

  // Snap photo from live webcam
  const captureFromWebcam = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        processSelectedFile(file);
        stopWebcam();
      }
    }, 'image/jpeg', 0.92);
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
    stopWebcam();
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
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

      {/* Hidden inputs: Standard File Picker + Direct Phone Camera Capture */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.jpg,.jpeg,.png,.webp,.bmp,.heic"
        style={{ display: 'none' }}
        id="waste-file-input"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        id="waste-camera-input"
      />

      {!result ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Upload Drop / Camera Area */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                Capture or Upload Waste Photo
              </h3>
              <span className="badge badge-plastic" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
                AI Ready
              </span>
            </div>

            {/* Quick Action Buttons for Camera & Files */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => cameraInputRef.current?.click()}
                style={{
                  padding: '0.65rem 0.75rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <Camera size={18} />
                <span>Take Photo</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '0.65rem 0.75rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <FileImage size={18} />
                <span>Upload File</span>
              </button>
            </div>

            {/* Live Webcam Option if available */}
            {!isWebcamActive ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-hover)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem 1.25rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-card-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  flex: 1,
                  minHeight: '180px'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary)'
                }}>
                  <UploadCloud size={22} />
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.2rem 0' }}>
                    Tap Take Photo or Drop an Image
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Supports Camera capture, JPEG, PNG, WEBP, BMP (up to 15 MB)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    startWebcam();
                  }}
                  className="btn btn-secondary"
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.65rem',
                    marginTop: '0.25rem',
                    gap: '0.35rem'
                  }}
                >
                  <Video size={14} />
                  <span>Open Live Camera Viewfinder</span>
                </button>
              </div>
            ) : (
              /* Live Webcam Viewfinder */
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: '#000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '220px',
                border: '2px solid var(--color-primary)'
              }}>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  style={{ width: '100%', maxHeight: '240px', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  zIndex: 10
                }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={captureFromWebcam}
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      padding: '0.45rem 1rem',
                      fontSize: '0.825rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                    }}
                  >
                    <Check size={16} />
                    <span>Snap Photo</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={stopWebcam}
                    style={{
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.825rem',
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }}
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Test Samples */}
            <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
                Quick Test Samples
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
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
                Photo Preview & Verification
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
                      {selectedFile?.name || 'camera_photo.jpg'}
                    </span>
                    <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {selectedFile?.size ? (selectedFile.size / 1024).toFixed(1) + ' KB' : 'Ready'}
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
                  <span style={{ fontSize: '0.85rem' }}>No photo selected yet</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap "Take Photo" to use your mobile camera</span>
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
