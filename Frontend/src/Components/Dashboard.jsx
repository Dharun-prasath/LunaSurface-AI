import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';

const API = 'http://localhost:8000';

// ─── 3D MOON ─────────────────────────────────────────────────────────────────
const MoonModel = () => {
  const moonRef = useRef();
  const [moonTexture] = useTexture(['https://threejs.org/examples/textures/planets/moon_1024.jpg']);
  useFrame(() => { moonRef.current.rotation.y += 0.004; });
  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[1.75, 64, 64]} />
      <meshStandardMaterial map={moonTexture} roughness={0.8} metalness={0.1} />
    </mesh>
  );
};

// ─── GLITCH TEXT ─────────────────────────────────────────────────────────────
const GlitchText = ({ text, style }) => (
  <span style={{ position: 'relative', ...style }}>
    {text}
    <span style={{
      position: 'absolute', left: '2px', top: 0,
      color: '#ff4d4d', opacity: 0.4, clipPath: 'inset(40% 0 50% 0)',
      pointerEvents: 'none',
    }}>{text}</span>
  </span>
);

// ─── PATCH CARD ───────────────────────────────────────────────────────────────
const PatchCard = ({ patch, analyzedPatch, isSelected, onClick, G, TEAL, viewMode }) => {
  const [hovered, setHovered]   = useState(false);
  const [imgError, setImgError] = useState(false);

  // In analysis mode, use analyzed image if available; fall back to raw
  const displayUrl = (viewMode === 'analyzed' && analyzedPatch)
    ? analyzedPatch.image_url
    : patch.image_url;

  const hasAnalyzed = !!analyzedPatch;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
        transition: 'all .18s cubic-bezier(.4,0,.2,1)',
        border: isSelected
          ? `1.5px solid ${viewMode === 'analyzed' && hasAnalyzed ? TEAL : G}`
          : hovered
            ? `1px solid ${G}55`
            : `1px solid rgba(169,226,255,0.12)`,
        background: isSelected
          ? viewMode === 'analyzed' && hasAnalyzed
            ? 'rgba(77,255,184,0.08)'
            : 'rgba(169,226,255,0.10)'
          : hovered ? 'rgba(169,226,255,0.05)' : 'rgba(0,0,0,0.40)',
        boxShadow: isSelected
          ? `0 0 16px ${viewMode === 'analyzed' && hasAnalyzed ? 'rgba(77,255,184,0.18)' : 'rgba(169,226,255,0.20)'}`
          : 'none',
        transform: hovered && !isSelected ? 'translateY(-1px)' : 'none',
      }}
    >
      <div style={{ width: '100%', height: '88px', overflow: 'hidden', position: 'relative', background: '#050a10' }}>
        {imgError ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', opacity: 0.2 }}>◫</div>
        ) : (
          <img
            src={displayUrl}
            alt={patch.patch_id}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        {isSelected && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, rgba(169,226,255,0.10) 0%, transparent 60%)`,
            pointerEvents: 'none',
          }} />
        )}
        {/* Index badge */}
        <div style={{
          position: 'absolute', top: '4px', left: '4px',
          background: 'rgba(0,0,0,0.82)',
          border: `1px solid ${isSelected ? (viewMode === 'analyzed' && hasAnalyzed ? TEAL : G) : 'rgba(169,226,255,0.22)'}`,
          borderRadius: '4px', padding: '1px 6px', fontSize: '9px',
          color: isSelected ? (viewMode === 'analyzed' && hasAnalyzed ? TEAL : G) : 'rgba(169,226,255,0.65)',
          letterSpacing: '1px', fontFamily: "'Share Tech Mono', monospace",
        }}>
          #{String(patch.index).padStart(3, '0')}
        </div>
        {/* Analyzed badge */}
        {hasAnalyzed && (
          <div style={{
            position: 'absolute', bottom: '4px', right: '4px',
            background: 'rgba(77,255,184,0.18)', border: `1px solid ${TEAL}66`,
            borderRadius: '3px', padding: '1px 5px',
            fontSize: '8px', color: TEAL, letterSpacing: '1px',
            fontFamily: "'Share Tech Mono', monospace",
          }}>◈ AI</div>
        )}
        {isSelected && (
          <div style={{
            position: 'absolute', top: '4px', right: '4px',
            background: viewMode === 'analyzed' && hasAnalyzed ? TEAL : G,
            borderRadius: '50%', width: '14px', height: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '8px', color: '#000', fontWeight: '900',
          }}>✓</div>
        )}
      </div>

      <div style={{
        padding: '5px 7px 6px',
        borderTop: `1px solid ${isSelected ? 'rgba(169,226,255,0.20)' : 'rgba(169,226,255,0.06)'}`,
      }}>
        <div style={{
          fontSize: '9px',
          color: isSelected ? (viewMode === 'analyzed' && hasAnalyzed ? TEAL : G) : 'rgba(255,255,255,0.48)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          fontFamily: "'Share Tech Mono', monospace", letterSpacing: '0.5px',
        }}>
          {patch.patch_id.length > 15 ? '…' + patch.patch_id.slice(-13) : patch.patch_id}
        </div>
      </div>
    </div>
  );
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stars, setStars]                         = useState([]);
  const [backendOk, setBackendOk]                 = useState(false);
  const [showUploadModal, setShowUploadModal]     = useState(false);
  const [uploadFile, setUploadFile]               = useState(null);
  const [uploadStatus, setUploadStatus]           = useState('idle');
  const [logs, setLogs]                           = useState([]);
  const [patches, setPatches]                     = useState([]);
  const [analyzedPatches, setAnalyzedPatches]     = useState([]);  // map: patch_id → analyzed
  const [selectedPatch, setSelectedPatch]         = useState(null);
  const [lightboxOpen, setLightboxOpen]           = useState(false);
  const [pipelineRunning, setPipelineRunning]     = useState(false);
  const [analysisRunning, setAnalysisRunning]     = useState(false);
  const [patchesLoading, setPatchesLoading]       = useState(false);
  const [queueFilter, setQueueFilter]             = useState('');
  // 'raw' | 'analyzed'
  const [viewMode, setViewMode]                   = useState('raw');

  const logsEndRef = useRef(null);
  const sseRef     = useRef(null);
  const dropRef    = useRef(null);

  // ── Stars ──
  useEffect(() => {
    setStars(Array.from({ length: 120 }).map((_, i) => ({
      id: i, top: Math.random() * 100, left: Math.random() * 100,
      size: Math.random() * 2 + 0.5, delay: Math.random() * 8,
    })));
  }, []);

  // ── Health ──
  useEffect(() => {
    fetch(`${API}/health`).then(r => r.ok && setBackendOk(true)).catch(() => {});
  }, []);

  // ── Auto-scroll logs ──
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = useCallback((msg) => {
    setLogs(prev => [...prev.slice(-300), msg]);
  }, []);

  // ── CSS ──
  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
      @keyframes twinkle  { 0%,100%{opacity:.25;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
      @keyframes scanline { 0%{top:-4px} 100%{top:100%} }
      @keyframes fadeUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      @keyframes spin     { to{transform:rotate(360deg)} }
      @keyframes logIn    { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
      @keyframes shimmer  { 0%,100%{opacity:.4} 50%{opacity:1} }
      @keyframes cardPop  { from{opacity:0;transform:scale(.94) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
      @keyframes pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(77,255,184,0.4)} 50%{box-shadow:0 0 0 6px rgba(77,255,184,0)} }
      .luna-btn:hover     { filter:brightness(1.2); transform:translateY(-1px); }
      .luna-btn:active    { transform:translateY(0); }
      .btn-process:hover  { background:rgba(169,226,255,0.18)!important; transform:translateY(-1px); box-shadow:0 0 20px #a9e2ff55!important; }
      .btn-process:active { transform:translateY(0); }
      .btn-analysis:hover { background:rgba(77,255,184,0.22)!important; transform:translateY(-1px); box-shadow:0 0 20px #4dffb855!important; }
      .btn-analysis:active{ transform:translateY(0); }
      .btn-patches:hover  { background:rgba(169,226,255,0.22)!important; transform:translateY(-1px); box-shadow:0 0 18px rgba(169,226,255,0.35)!important; }
      .btn-patches:active { transform:translateY(0); }
      .queue-filter::placeholder { color:rgba(169,226,255,0.28); }
      .queue-filter:focus { outline:none; border-color:rgba(169,226,255,0.50)!important; box-shadow:0 0 8px rgba(169,226,255,0.14); }
      ::-webkit-scrollbar       { width:3px; height:3px; }
      ::-webkit-scrollbar-track { background:transparent; }
      ::-webkit-scrollbar-thumb { background:#a9e2ff2a; border-radius:2px; }
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  const G     = '#a9e2ff';
  const TEAL  = '#4dffb8';
  const PANEL = 'rgba(4,10,20,0.82)';

  // ── SSE ──────────────────────────────────────────────────────────────────
  const startSSE = useCallback(() => {
    if (sseRef.current) sseRef.current.close();
    const es = new EventSource(`${API}/status`);
    sseRef.current = es;
    es.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (!d.log) return;

        // ── Per-image live signal ─────────────────────────────────────────
        if (d.log.startsWith('PATCH_ANALYZED:')) {
          const relPath = d.log.slice('PATCH_ANALYZED:'.length);
          // strip _analyzed.png suffix to recover raw patch_id
          const stem = relPath
            .replace(/_analyzed\.png$/i, '')
            .replace(/_analyzed$/i, '');
          const newEntry = {
            patch_id:  stem,
            filename:  relPath.split('/').pop(),
            rel_path:  relPath,
            image_url: `${API}/analyzed-image/${relPath}`,
          };
          setAnalyzedPatches(prev => {
            if (prev.some(p => p.patch_id === stem)) return prev;
            return [...prev, newEntry];
          });
          // If this patch is currently selected → auto-show analyzed view
          setSelectedPatch(sel => {
            if (sel && sel.patch_id === stem) {
              setViewMode('analyzed');
            }
            return sel;
          });
          return; // don't print PATCH_ANALYZED lines to console
        }

        // ── Normal log line ───────────────────────────────────────────────
        addLog(d.log);
        if (d.log.includes('Analysis complete')) {
          setAnalysisRunning(false);
        }
      } catch {}
    };
    es.onerror = () => {};
  }, [addLog]);

  // ── FETCH analyzed results (used on initial Patches load) ────────────────
  const _fetchAnalyzedResults = useCallback(async () => {
    try {
      const r = await fetch(`${API}/results-analyzed`);
      if (!r.ok) return;
      const d = await r.json();
      if (d.results?.length > 0) {
        setAnalyzedPatches(d.results);
        addLog(`◈ ${d.results.length} analyzed patch(es) loaded`);
      }
    } catch {}
  }, [addLog]);

  // ── PROCESS ──────────────────────────────────────────────────────────────
  const handleProcess = async () => {
    if (pipelineRunning) return;
    setPipelineRunning(true);
    setLogs([]);
    startSSE();
    addLog('⚙ Starting run_all.py…');
    try {
      const r = await fetch(`${API}/run-pipeline`, { method: 'POST' });
      if (!r.ok) throw new Error(await r.text());
      addLog('⏳ Pipeline running — click ◫ Patches when done');
    } catch (err) {
      addLog(`❌ ${err.message}`);
      setPipelineRunning(false);
    }
    setTimeout(() => setPipelineRunning(false), 1500);
  };

  // ── ANALYSIS ─────────────────────────────────────────────────────────────
  const handleAnalysis = async () => {
    if (analysisRunning) return;
    if (patches.length === 0) {
      addLog('⚠ Load patches first (◫ Patches), then run Analysis');
      return;
    }
    setAnalysisRunning(true);
    setLogs([]);
    startSSE();
    addLog('🔬 Starting crater analysis…');
    try {
      const r = await fetch(`${API}/run-analysis`, { method: 'POST' });
      if (!r.ok) throw new Error(await r.text());
      addLog('⏳ Analysis running — results auto-load when complete');
    } catch (err) {
      addLog(`❌ ${err.message}`);
      setAnalysisRunning(false);
    }
  };

  // ── PATCHES BUTTON ────────────────────────────────────────────────────────
  const handleLoadPatches = async () => {
    if (patchesLoading) return;
    setPatchesLoading(true);
    addLog('◫ Scanning patches/ folder…');
    try {
      const r = await fetch(`${API}/results`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      if (d.results?.length > 0) {
        setPatches(d.results);
        setSelectedPatch(d.results[0]);
        addLog(`✅ Loaded ${d.results.length} patch${d.results.length !== 1 ? 'es' : ''}`);
        // Also check for existing analyzed results
        await _fetchAnalyzedResults();
      } else {
        addLog('⚠ No patches found — run the pipeline first');
      }
    } catch (err) {
      addLog(`❌ Failed: ${err.message}`);
    } finally {
      setPatchesLoading(false);
    }
  };

  // ── Upload ──────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploadStatus('uploading');
    setLogs([]);
    startSSE();
    try {
      addLog(`📥 Uploading ${uploadFile.name}…`);
      const form = new FormData();
      form.append('file', uploadFile);
      const up = await fetch(`${API}/upload`, { method: 'POST', body: form });
      if (!up.ok) throw new Error(await up.text());
      addLog('✅ Saved to raw_zips/');
      setUploadStatus('idle');
    } catch (err) {
      addLog(`❌ ${err.message}`);
      setUploadStatus('error');
    }
  };

  // ── Drag & drop ─────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); dropRef.current?.classList.add('drag-over'); };
  const onDragLeave = () => dropRef.current?.classList.remove('drag-over');
  const onDrop = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith('.zip')) setUploadFile(f);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const filteredPatches = queueFilter.trim()
    ? patches.filter(p =>
        p.patch_id.toLowerCase().includes(queueFilter.toLowerCase()) ||
        String(p.index).includes(queueFilter)
      )
    : patches;

  const selectedIdx = filteredPatches.findIndex(p => p.patch_id === selectedPatch?.patch_id);
  const canGoPrev   = selectedIdx > 0;
  const canGoNext   = selectedIdx < filteredPatches.length - 1;

  // Build analyzed lookup: strip "_analyzed" suffix to match raw patch_id
  const analyzedMap = {};
  analyzedPatches.forEach(ap => {
    // ap.patch_id might be "foo_analyzed"; key back to "foo"
    const rawId = ap.patch_id.replace(/_analyzed$/, '');
    analyzedMap[rawId] = ap;
  });

  // Determine which image URL to show in the center panel
  const centerPatch = selectedPatch
    ? (viewMode === 'analyzed' && analyzedMap[selectedPatch.patch_id])
      ? analyzedMap[selectedPatch.patch_id]
      : selectedPatch
    : null;

  const hasAnalyzedForSelected = selectedPatch && !!analyzedMap[selectedPatch.patch_id];
  const isShowingAnalyzed = viewMode === 'analyzed' && hasAnalyzedForSelected;

  return (
    <div style={{
      background: '#000', minHeight: '100vh', color: '#fff',
      fontFamily: "'Rajdhani',sans-serif", overflow: 'hidden', position: 'relative',
    }}>

      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        {stars.map(s => (
          <span key={s.id} style={{
            position: 'absolute', borderRadius: '50%', background: '#fff',
            top: `${s.top}%`, left: `${s.left}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            boxShadow: '0 0 4px #fff',
            animation: `twinkle ${2 + s.delay * .3}s ${s.delay}s infinite ease-in-out`,
          }} />
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && centerPatch && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.94)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setLightboxOpen(false)}>
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightboxOpen(false)} style={{
              position: 'absolute', top: '-14px', right: '-14px',
              background: 'rgba(0,0,0,.8)', border: `1px solid ${G}66`,
              color: G, borderRadius: '50%', width: '30px', height: '30px',
              cursor: 'pointer', fontSize: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
            <img
              src={centerPatch.image_url}
              alt={centerPatch.patch_id}
              style={{ maxWidth: '88vw', maxHeight: '86vh', borderRadius: '10px', border: `1px solid ${isShowingAnalyzed ? TEAL : G}33`, display: 'block' }}
            />
            {isShowingAnalyzed && (
              <div style={{
                position: 'absolute', bottom: '-28px', left: '50%', transform: 'translateX(-50%)',
                fontSize: '11px', color: TEAL, letterSpacing: '1px', whiteSpace: 'nowrap',
              }}>◈ Crater Detection Overlay</div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={e => e.target === e.currentTarget && uploadStatus === 'idle' && setShowUploadModal(false)}>
          <div style={{
            background: 'rgba(4,10,20,.98)', border: `1px solid ${G}33`,
            borderRadius: '14px', padding: '32px', width: '500px', maxWidth: '92vw',
            animation: 'fadeUp .25s ease',
          }}>
            <h2 style={{ margin: '0 0 4px', color: G, fontSize: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Upload OHRC Dataset
            </h2>
            <p style={{ margin: '0 0 22px', color: 'rgba(255,255,255,.5)', fontSize: '13px' }}>
              Drop a <code style={{ color: G }}>.zip</code> — saved to <code style={{ color: G }}>raw_zips/</code>
            </p>

            <div ref={dropRef} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
              onClick={() => !uploadFile && document.getElementById('zip-input').click()}
              style={{
                border: `2px dashed ${uploadFile ? G : G + '44'}`, borderRadius: '10px', padding: '28px',
                textAlign: 'center', cursor: uploadFile ? 'default' : 'pointer',
                marginBottom: '18px', transition: 'all .2s', background: 'rgba(0,0,0,.3)',
              }}>
              {uploadFile ? (
                <div>
                  <div style={{ fontSize: '30px', marginBottom: '8px' }}>📦</div>
                  <div style={{ color: G, fontWeight: '700', fontSize: '15px' }}>{uploadFile.name}</div>
                  <div style={{ color: 'rgba(255,255,255,.4)', fontSize: '12px', marginTop: '4px' }}>
                    {(uploadFile.size / 1024 / 1024).toFixed(1)} MB
                  </div>
                  {uploadStatus === 'idle' && (
                    <button onClick={e => { e.stopPropagation(); setUploadFile(null); }}
                      style={{ marginTop: '10px', background: 'none', border: 'none', color: '#ff4d4d88', cursor: 'pointer', fontSize: '12px' }}>
                      ✕ Remove
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '34px', marginBottom: '10px' }}>⬆</div>
                  <div style={{ color: 'rgba(255,255,255,.7)', fontSize: '15px' }}>Drag & drop or click</div>
                  <div style={{ color: 'rgba(255,255,255,.3)', fontSize: '12px', marginTop: '6px' }}>.zip only</div>
                </div>
              )}
              <input id="zip-input" type="file" accept=".zip" style={{ display: 'none' }}
                onChange={e => setUploadFile(e.target.files[0])} />
            </div>

            {logs.length > 0 && (
              <div style={{
                background: 'rgba(0,0,0,.7)', borderRadius: '8px', border: `1px solid ${G}22`,
                padding: '10px', maxHeight: '120px', overflowY: 'auto',
                fontFamily: "'Share Tech Mono',monospace", fontSize: '11px', marginBottom: '14px',
              }}>
                {logs.slice(-20).map((l, i) => (
                  <div key={i} style={{
                    color: l.startsWith('❌') ? '#ff4d4d' : l.startsWith('✅') ? TEAL : 'rgba(255,255,255,.8)',
                    marginBottom: '3px',
                  }}>{l}</div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              {(uploadStatus === 'idle' || uploadStatus === 'error') ? (
                <>
                  <button className="luna-btn" onClick={() => setShowUploadModal(false)}
                    style={{
                      flex: 1, padding: '11px', background: 'none', border: `1px solid ${G}44`,
                      color: 'rgba(255,255,255,.6)', borderRadius: '8px', cursor: 'pointer',
                      fontFamily: "'Rajdhani',sans-serif", fontWeight: '600', fontSize: '14px', transition: 'all .2s',
                    }}>Cancel</button>
                  <button className="luna-btn" onClick={handleUpload} disabled={!uploadFile}
                    style={{
                      flex: 2, padding: '11px',
                      background: uploadFile ? 'rgba(169,226,255,0.1)' : 'rgba(255,255,255,.04)',
                      border: `1px solid ${uploadFile ? G : G + '33'}`,
                      color: uploadFile ? G : 'rgba(255,255,255,.3)',
                      borderRadius: '8px', cursor: uploadFile ? 'pointer' : 'not-allowed',
                      fontFamily: "'Rajdhani',sans-serif", fontWeight: '700', fontSize: '14px',
                      letterSpacing: '1px', transition: 'all .2s',
                    }}>⬆ UPLOAD ZIP</button>
                </>
              ) : (
                <div style={{ flex: 1, textAlign: 'center', padding: '11px', color: 'rgba(255,255,255,.4)', fontSize: '13px' }}>
                  Uploading… please wait
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <div style={{
        position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '14px 36px',
        background: 'rgba(0,0,0,.9)', borderBottom: `1px solid ${G}18`, backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px', color: G, filter: `drop-shadow(0 0 8px ${G})` }}>◎</span>
          <GlitchText text="LunaSurface AI" style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '2px' }} />
          <span style={{
            fontSize: '11px', color: `${G}77`, letterSpacing: '2px', textTransform: 'uppercase',
            borderLeft: `1px solid ${G}33`, paddingLeft: '12px',
          }}>Crater Detection System</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: backendOk ? TEAL : '#ff4d4d',
              boxShadow: backendOk ? `0 0 8px ${TEAL}` : '0 0 8px #ff4d4d', display: 'inline-block',
            }} />
            {backendOk ? 'BACKEND ONLINE' : 'BACKEND OFFLINE'}
          </span>
          {patches.length > 0 && (
            <span style={{ fontSize: '12px', color: `${G}cc`, letterSpacing: '1px' }}>◈ {patches.length} Patches</span>
          )}
          {analyzedPatches.length > 0 && (
            <span style={{ fontSize: '12px', color: `${TEAL}cc`, letterSpacing: '1px' }}>◈ {analyzedPatches.length} Analyzed</span>
          )}
          <button className="luna-btn" onClick={() => setShowUploadModal(true)}
            style={{
              padding: '8px 18px', border: `1px solid ${G}`, background: 'transparent', color: G,
              borderRadius: '6px', cursor: 'pointer', fontFamily: "'Rajdhani',sans-serif",
              fontWeight: '700', fontSize: '13px', letterSpacing: '1px',
              boxShadow: `0 0 14px ${G}22`, transition: 'all .2s',
            }}>⬆ UPLOAD DATASET</button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{
        display: 'flex', padding: '18px', gap: '18px',
        height: 'calc(100vh - 57px)', position: 'relative', zIndex: 1, boxSizing: 'border-box',
      }}>

        {/* ── LEFT ── */}
        <div style={{
          flex: '0 0 310px', background: PANEL, borderRadius: '14px', padding: '14px',
          display: 'flex', flexDirection: 'column', gap: '10px', border: `1px solid ${G}18`,
        }}>
          {/* Moon */}
          <div style={{ height: '240px', borderRadius: '10px', overflow: 'hidden', position: 'relative', border: `1px solid ${G}22`, flexShrink: 0 }}>
            <div style={{
              position: 'absolute', left: 0, right: 0, height: '2px',
              background: `linear-gradient(to right,transparent,${G}88,transparent)`,
              zIndex: 2, animation: 'scanline 3.5s linear infinite', pointerEvents: 'none',
            }} />
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} style={{ width: '100%', height: '100%', background: 'transparent' }}>
              <ambientLight intensity={6} />
              <pointLight position={[10, 10, 10]} intensity={1.2} />
              <MoonModel />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
            </Canvas>
            <div style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '9px', color: `${G}55`, letterSpacing: '3px', zIndex: 3, pointerEvents: 'none' }}>
              LIVE SURFACE SCAN
            </div>
          </div>

          {/* Log Console */}
          <div style={{
            flex: 1, background: 'rgba(0,0,0,.55)', borderRadius: '8px',
            border: `1px solid ${G}18`, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0,
          }}>
            <div style={{ padding: '6px 10px', borderBottom: `1px solid ${G}12`, display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: (pipelineRunning || analysisRunning) ? TEAL : `${G}44`,
                boxShadow: (pipelineRunning || analysisRunning) ? `0 0 6px ${TEAL}` : 'none',
                animation: (pipelineRunning || analysisRunning) ? 'shimmer 1s infinite' : 'none',
                display: 'inline-block', flexShrink: 0,
              }} />
              <span style={{ fontSize: '9px', color: `${G}66`, letterSpacing: '2px', textTransform: 'uppercase' }}>
                {analysisRunning ? 'Analysis Console' : 'Pipeline Console'}
              </span>
              {(pipelineRunning || analysisRunning) && (
                <span style={{
                  marginLeft: 'auto', display: 'inline-block', width: '10px', height: '10px',
                  border: `1.5px solid ${G}66`, borderTopColor: G,
                  borderRadius: '50%', animation: 'spin .8s linear infinite', flexShrink: 0,
                }} />
              )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', fontFamily: "'Share Tech Mono',monospace", fontSize: '10px', minHeight: 0 }}>
              {logs.length === 0
                ? <div style={{ color: `${G}28`, animation: 'shimmer 2s infinite', marginTop: '4px' }}>No logs yet — click Process to start</div>
                : logs.map((l, i) => (
                  <div key={i} style={{
                    color: l.startsWith('❌') ? '#ff4d4d' : l.startsWith('✅') ? TEAL :
                      l.startsWith('⚙') || l.startsWith('🔧') || l.startsWith('🔬') ? G : 'rgba(255,255,255,.7)',
                    marginBottom: '3px', lineHeight: '1.4', animation: 'logIn .12s ease', wordBreak: 'break-all',
                  }}>{l}</div>
                ))
              }
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Process + Analysis */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button className="btn-process" onClick={handleProcess} disabled={pipelineRunning}
              style={{
                flex: 1, padding: '11px 0',
                background: pipelineRunning ? 'rgba(169,226,255,0.04)' : 'rgba(169,226,255,0.08)',
                border: `1px solid ${pipelineRunning ? G + '44' : G}`,
                color: pipelineRunning ? `${G}55` : G,
                borderRadius: '8px', cursor: pipelineRunning ? 'not-allowed' : 'pointer',
                fontFamily: "'Rajdhani',sans-serif", fontWeight: '700', fontSize: '13px',
                letterSpacing: '1.5px', textTransform: 'uppercase', transition: 'all .2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
              {pipelineRunning
                ? <span style={{ display: 'inline-block', width: '11px', height: '11px', border: `1.5px solid ${G}66`, borderTopColor: G, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                : <span>⚙</span>}
              {pipelineRunning ? 'Running…' : 'Process'}
            </button>

            <button
              className="btn-analysis"
              onClick={handleAnalysis}
              disabled={analysisRunning || patches.length === 0}
              style={{
                flex: 1, padding: '11px 0',
                background: analysisRunning
                  ? 'rgba(77,255,184,0.04)'
                  : patches.length === 0
                    ? 'rgba(77,255,184,0.02)'
                    : 'rgba(77,255,184,0.10)',
                border: `1px solid ${analysisRunning || patches.length === 0 ? TEAL + '44' : TEAL}`,
                color: analysisRunning || patches.length === 0 ? `${TEAL}44` : TEAL,
                borderRadius: '8px',
                cursor: analysisRunning || patches.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'Rajdhani',sans-serif", fontWeight: '700', fontSize: '13px',
                letterSpacing: '1.5px', textTransform: 'uppercase', transition: 'all .2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                animation: analysisRunning ? 'pulse 1.5s infinite' : 'none',
              }}>
              {analysisRunning
                ? <span style={{ display: 'inline-block', width: '11px', height: '11px', border: `1.5px solid ${TEAL}66`, borderTopColor: TEAL, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                : <span>◈</span>}
              {analysisRunning ? 'Analysing…' : 'Analysis'}
            </button>
          </div>
        </div>

        {/* ── CENTER: Patch Detail ── */}
        <div style={{
          flex: 1, background: PANEL, borderRadius: '14px', padding: '20px',
          display: 'flex', flexDirection: 'column', border: `1px solid ${G}18`, overflow: 'hidden',
        }}>
          {selectedPatch ? (
            <>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: `${G}77`, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '3px' }}>
                    Patch {selectedPatch.index} of {selectedPatch.total}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: isShowingAnalyzed ? TEAL : G, letterSpacing: '1px' }}>
                    {selectedPatch.patch_id}
                  </div>
                </div>

                {/* View toggle — Raw / Analyzed */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  {/* RAW toggle */}
                  <button
                    onClick={() => setViewMode('raw')}
                    style={{
                      padding: '5px 12px',
                      background: viewMode === 'raw' ? `${G}18` : 'transparent',
                      border: `1px solid ${viewMode === 'raw' ? G : G + '33'}`,
                      color: viewMode === 'raw' ? G : `${G}55`,
                      borderRadius: '5px', cursor: 'pointer',
                      fontFamily: "'Rajdhani',sans-serif", fontWeight: '700', fontSize: '11px',
                      letterSpacing: '1px', transition: 'all .2s',
                    }}>
                    RAW
                  </button>
                  {/* ANALYZED toggle */}
                  <button
                    onClick={() => {
                      if (!hasAnalyzedForSelected) {
                        addLog('⚠ No analysis yet — click ◈ Analysis to run crater detection');
                        return;
                      }
                      setViewMode('analyzed');
                    }}
                    style={{
                      padding: '5px 12px',
                      background: viewMode === 'analyzed' && hasAnalyzedForSelected ? `${TEAL}18` : 'transparent',
                      border: `1px solid ${
                        viewMode === 'analyzed' && hasAnalyzedForSelected
                          ? TEAL
                          : hasAnalyzedForSelected ? TEAL + '66' : TEAL + '22'
                      }`,
                      color: viewMode === 'analyzed' && hasAnalyzedForSelected
                        ? TEAL
                        : hasAnalyzedForSelected ? `${TEAL}88` : `${TEAL}33`,
                      borderRadius: '5px',
                      cursor: hasAnalyzedForSelected ? 'pointer' : 'not-allowed',
                      fontFamily: "'Rajdhani',sans-serif", fontWeight: '700', fontSize: '11px',
                      letterSpacing: '1px', transition: 'all .2s',
                    }}>
                    {hasAnalyzedForSelected ? '◈ CRATERS' : '◈ PENDING'}
                  </button>

                  <div style={{
                    fontSize: '10px', color: `${G}55`, letterSpacing: '1px',
                    border: `1px solid ${G}22`, borderRadius: '6px', padding: '5px 10px', marginLeft: '4px',
                  }}>
                    {isShowingAnalyzed ? centerPatch?.filename : selectedPatch.filename}
                  </div>
                </div>
              </div>

              {/* Mode label bar */}
              {isShowingAnalyzed && (
                <div style={{
                  marginBottom: '10px', padding: '6px 12px',
                  background: `${TEAL}0a`, border: `1px solid ${TEAL}33`,
                  borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <span style={{ fontSize: '10px', color: TEAL, letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700' }}>
                    ◈ Crater Detection Overlay Active
                  </span>
                  <span style={{ fontSize: '9px', color: `${TEAL}66`, fontFamily: "'Share Tech Mono',monospace" }}>
                    Red circles = segmented craters · Labels = C1, C2…
                  </span>
                </div>
              )}

              {/* Image */}
              <div style={{
                flex: 1, borderRadius: '10px', overflow: 'hidden',
                border: `1px solid ${isShowingAnalyzed ? TEAL + '44' : G + '22'}`,
                cursor: 'zoom-in', position: 'relative', minHeight: 0,
                boxShadow: isShowingAnalyzed ? `0 0 24px ${TEAL}18` : 'none',
                transition: 'border-color .3s, box-shadow .3s',
              }} onClick={() => setLightboxOpen(true)}>
                <img
                  key={centerPatch?.image_url}   /* key forces remount on URL change */
                  src={centerPatch?.image_url}
                  alt={centerPatch?.patch_id}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#050a10' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px',
                  background: 'linear-gradient(transparent,rgba(0,0,0,.85))',
                  fontSize: '10px', color: isShowingAnalyzed ? `${TEAL}88` : `${G}88`,
                  textAlign: 'center', letterSpacing: '1px',
                }}>🔍 Click to enlarge</div>
              </div>

              {/* Prev / Next */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button className="luna-btn" disabled={!canGoPrev}
                  onClick={() => setSelectedPatch(filteredPatches[selectedIdx - 1])}
                  style={{
                    flex: 1, padding: '9px',
                    background: 'rgba(169,226,255,0.05)', border: `1px solid ${G}33`,
                    color: !canGoPrev ? `${G}22` : G,
                    borderRadius: '8px', cursor: !canGoPrev ? 'not-allowed' : 'pointer',
                    fontFamily: "'Rajdhani',sans-serif", fontWeight: '700', fontSize: '13px',
                    letterSpacing: '1px', transition: 'all .2s',
                  }}>← Prev</button>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'rgba(255,255,255,.35)', letterSpacing: '1px' }}>
                  {selectedIdx + 1} / {filteredPatches.length}
                </div>
                <button className="luna-btn" disabled={!canGoNext}
                  onClick={() => setSelectedPatch(filteredPatches[selectedIdx + 1])}
                  style={{
                    flex: 1, padding: '9px',
                    background: 'rgba(169,226,255,0.05)', border: `1px solid ${G}33`,
                    color: !canGoNext ? `${G}22` : G,
                    borderRadius: '8px', cursor: !canGoNext ? 'not-allowed' : 'pointer',
                    fontFamily: "'Rajdhani',sans-serif", fontWeight: '700', fontSize: '13px',
                    letterSpacing: '1px', transition: 'all .2s',
                  }}>Next →</button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
              <div style={{ fontSize: '50px', opacity: .1 }}>◎</div>
              <div style={{ color: 'rgba(255,255,255,.2)', fontSize: '14px', letterSpacing: '1px', textAlign: 'center', lineHeight: '1.6' }}>
                {pipelineRunning ? 'Pipeline running…' : analysisRunning ? 'Crater analysis running…' : 'Upload → ⚙ Process → ◫ Patches → ◈ Analysis'}
              </div>
              {(pipelineRunning || analysisRunning) && (
                <span style={{ display: 'inline-block', width: '18px', height: '18px', border: `2px solid ${G}33`, borderTopColor: analysisRunning ? TEAL : G, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Patch Queue ── */}
        <div style={{
          flex: '0 0 320px', background: PANEL, borderRadius: '14px',
          padding: '16px', display: 'flex', flexDirection: 'column',
          border: `1px solid ${G}18`, overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: G, letterSpacing: '2px', textTransform: 'uppercase', textShadow: `0 0 8px ${G}44`, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Patch Queue
              {patches.length > 0 && (
                <span style={{ fontSize: '9px', color: '#000', background: G, borderRadius: '10px', padding: '1px 7px', fontWeight: '800', lineHeight: '16px' }}>
                  {filteredPatches.length}{queueFilter && patches.length !== filteredPatches.length ? `/${patches.length}` : ''}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {analyzedPatches.length > 0 && (
                <span style={{ fontSize: '9px', color: TEAL, fontFamily: "'Share Tech Mono',monospace", background: `${TEAL}12`, border: `1px solid ${TEAL}33`, borderRadius: '4px', padding: '2px 6px' }}>
                  ◈ {analyzedPatches.length} AI
                </span>
              )}
              {patches.length > 0 && (
                <span style={{ fontSize: '9px', color: `${G}44`, fontFamily: "'Share Tech Mono',monospace" }}>
                  {patches.length} PNG{patches.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Queue view mode toggle */}
          {patches.length > 0 && analyzedPatches.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexShrink: 0 }}>
              <button onClick={() => setViewMode('raw')} style={{
                flex: 1, padding: '5px',
                background: viewMode === 'raw' ? `${G}15` : 'transparent',
                border: `1px solid ${viewMode === 'raw' ? G + '66' : G + '22'}`,
                color: viewMode === 'raw' ? G : `${G}44`,
                borderRadius: '5px', cursor: 'pointer',
                fontFamily: "'Rajdhani',sans-serif", fontWeight: '700', fontSize: '10px',
                letterSpacing: '1px', transition: 'all .15s',
              }}>RAW</button>
              <button onClick={() => setViewMode('analyzed')} style={{
                flex: 1, padding: '5px',
                background: viewMode === 'analyzed' ? `${TEAL}15` : 'transparent',
                border: `1px solid ${viewMode === 'analyzed' ? TEAL + '66' : TEAL + '22'}`,
                color: viewMode === 'analyzed' ? TEAL : `${TEAL}44`,
                borderRadius: '5px', cursor: 'pointer',
                fontFamily: "'Rajdhani',sans-serif", fontWeight: '700', fontSize: '10px',
                letterSpacing: '1px', transition: 'all .15s',
              }}>◈ CRATERS</button>
            </div>
          )}

          {/* Filter */}
          {patches.length > 0 && (
            <div style={{ position: 'relative', marginBottom: '10px', flexShrink: 0 }}>
              <span style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: `${G}55`, pointerEvents: 'none' }}>⌕</span>
              <input
                className="queue-filter"
                value={queueFilter}
                onChange={e => setQueueFilter(e.target.value)}
                placeholder="Filter patches…"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(0,0,0,0.45)', border: `1px solid rgba(169,226,255,0.18)`,
                  borderRadius: '6px', padding: '6px 28px 6px 26px',
                  color: 'rgba(255,255,255,0.80)', fontSize: '11px',
                  fontFamily: "'Share Tech Mono',monospace",
                  transition: 'border-color .2s, box-shadow .2s',
                }}
              />
              {queueFilter && (
                <button onClick={() => setQueueFilter('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: `${G}55`, cursor: 'pointer', fontSize: '11px', padding: 0, lineHeight: 1 }}>✕</button>
              )}
            </div>
          )}

          <div style={{ height: '1px', background: `linear-gradient(to right,transparent,${G}22,transparent)`, marginBottom: '10px', flexShrink: 0 }} />

          {/* Grid */}
          <div style={{
            flex: 1, overflowY: 'auto', minHeight: 0,
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px', alignContent: 'start', paddingRight: '2px',
          }}>
            {filteredPatches.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(255,255,255,.18)', fontSize: '12px', marginTop: '40px', letterSpacing: '1px', lineHeight: '1.8' }}>
                {patches.length > 0 && queueFilter ? (
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.3 }}>⌕</div>
                    No matches for <span style={{ color: G + '66' }}>"{queueFilter}"</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '28px', marginBottom: '10px', opacity: 0.15 }}>◫</div>
                    <div style={{ marginBottom: '6px' }}>No patches loaded</div>
                    <div style={{ fontSize: '10px', opacity: 0.6, lineHeight: '1.6' }}>Run pipeline first,<br />then click ◫ Patches</div>
                  </div>
                )}
              </div>
            ) : (
              filteredPatches.map((p, i) => (
                <div key={p.patch_id} style={{ animation: `cardPop .2s ease ${Math.min(i * 0.015, 0.25)}s both` }}>
                  <PatchCard
                    patch={p}
                    analyzedPatch={analyzedMap[p.patch_id] || null}
                    isSelected={selectedPatch?.patch_id === p.patch_id}
                    onClick={() => setSelectedPatch(p)}
                    G={G}
                    TEAL={TEAL}
                    viewMode={viewMode}
                  />
                </div>
              ))
            )}
          </div>

          {/* Selected footer */}
          {selectedPatch && (
            <div style={{
              marginTop: '8px', flexShrink: 0, padding: '7px 10px',
              background: isShowingAnalyzed ? `${TEAL}08` : `${G}08`,
              border: `1px solid ${isShowingAnalyzed ? TEAL + '1a' : G + '1a'}`,
              borderRadius: '7px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '9px', color: isShowingAnalyzed ? `${TEAL}88` : `${G}88`, letterSpacing: '1px', fontFamily: "'Share Tech Mono',monospace", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {isShowingAnalyzed ? '◈' : '◫'} {selectedPatch.patch_id}
              </div>
              <div style={{ fontSize: '9px', color: isShowingAnalyzed ? `${TEAL}55` : `${G}55`, fontFamily: "'Share Tech Mono',monospace", flexShrink: 0, marginLeft: '8px' }}>
                {selectedIdx + 1}/{filteredPatches.length}
              </div>
            </div>
          )}

          {/* ── PATCHES BUTTON ── */}
          <button className="btn-patches" onClick={handleLoadPatches} disabled={patchesLoading}
            style={{
              marginTop: '10px', flexShrink: 0, width: '100%', padding: '12px 0',
              background: patchesLoading ? 'rgba(169,226,255,0.04)' : 'rgba(169,226,255,0.10)',
              border: `1px solid ${patchesLoading ? G + '44' : G}`,
              color: patchesLoading ? `${G}55` : G,
              borderRadius: '9px', cursor: patchesLoading ? 'not-allowed' : 'pointer',
              fontFamily: "'Rajdhani',sans-serif", fontWeight: '700', fontSize: '13px',
              letterSpacing: '2px', textTransform: 'uppercase', transition: 'all .2s',
              boxShadow: patchesLoading ? 'none' : `0 0 14px rgba(169,226,255,0.18), inset 0 0 20px rgba(169,226,255,0.04)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
            {patchesLoading ? (
              <>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', border: `1.5px solid ${G}66`, borderTopColor: G, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                Loading…
              </>
            ) : (
              <>
                <span style={{ fontSize: '15px' }}>◫</span>
                Patches
                {patches.length > 0 && (
                  <span style={{ fontSize: '9px', background: `${G}22`, border: `1px solid ${G}44`, borderRadius: '8px', padding: '1px 6px', letterSpacing: '1px' }}>
                    {patches.length}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}