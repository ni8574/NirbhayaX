import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, RotateCcw, Check, X, AlertTriangle, Radio } from 'lucide-react';

export default function EvidenceCaptureModal({ isOpen, onClose, onCapture, initialMode = 'camera' }) {
  const [mode, setMode] = useState(initialMode);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [permissionError, setPermissionError] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setCapturedImage(null);
      setRecordedAudioBlob(null);
      setPermissionError(null);
      startStream(initialMode);
    } else {
      stopStream();
    }
    return () => stopStream();
  }, [isOpen, initialMode]);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startStream = async (targetMode) => {
    stopStream();
    setPermissionError(null);
    try {
      if (targetMode === 'camera') {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
        setStream(videoStream);
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
      } else if (targetMode === 'audio') {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(audioStream);
      }
    } catch (err) {
      console.warn('[Capture Error]:', err);
      setPermissionError(`Device hardware access not granted (${err.name || 'Permission Denied'}). Using simulated live capture fallback.`);
    }
  };

  const handleTakeSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
    } else {
      // Demo fallback photo
      setCapturedImage('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e1b4b"/><circle cx="300" cy="180" r="70" fill="%23c084fc"/><text x="50%25" y="75%25" font-size="20" fill="white" text-anchor="middle" font-family="sans-serif">DEMO LIVE CAPTURE • INCIDENT SCENE</text></svg>');
    }
  };

  const startAudioRecording = () => {
    if (!stream) {
      // Start fallback audio recording
      setIsRecordingAudio(true);
      setAudioDuration(0);
      timerRef.current = setInterval(() => {
        setAudioDuration(d => d + 1);
      }, 1000);
      return;
    }
    audioChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingAudio(true);
      setAudioDuration(0);
      timerRef.current = setInterval(() => {
        setAudioDuration(d => d + 1);
      }, 1000);
    } catch (e) {
      console.warn('MediaRecorder error:', e);
      setIsRecordingAudio(true);
      timerRef.current = setInterval(() => setAudioDuration(d => d + 1), 1000);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Fallback synthetic blob
      const sampleBlob = new Blob(['DEMO_ACOUSTIC_DISTRESS_AUDIO_RECORDING_DATA'], { type: 'audio/wav' });
      setRecordedAudioBlob(sampleBlob);
    }
    setIsRecordingAudio(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleConfirm = () => {
    if (mode === 'camera' && capturedImage) {
      onCapture({
        type: 'image',
        dataUrl: capturedImage,
        filename: `camera_capture_${Date.now()}.jpg`,
        mimeType: 'image/jpeg'
      });
    } else if (mode === 'audio' && (recordedAudioBlob || audioDuration > 0)) {
      onCapture({
        type: 'audio',
        blob: recordedAudioBlob || new Blob(['DEMO_AUDIO_STATEMENT'], { type: 'audio/wav' }),
        filename: `voice_statement_${Date.now()}.wav`,
        mimeType: 'audio/wav',
        duration: audioDuration
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-purple-800/60 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/40 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            {mode === 'camera' ? (
              <Camera className="w-5 h-5 text-purple-400" />
            ) : (
              <Mic className="w-5 h-5 text-teal-400" />
            )}
            <h3 className="font-bold text-white text-base">
              {mode === 'camera' ? 'Live Camera Capture' : 'Live Verbal Statement Recorder'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-2 bg-slate-950/80 gap-2 border-b border-purple-900/30">
          <button
            onClick={() => { setMode('camera'); startStream('camera'); }}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              mode === 'camera'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera Viewfinder</span>
          </button>
          <button
            onClick={() => { setMode('audio'); startStream('audio'); }}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              mode === 'audio'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice Recorder</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 flex flex-col items-center justify-center min-h-[300px] bg-slate-950">
          {permissionError && (
            <div className="w-full mb-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{permissionError}</span>
            </div>
          )}

          {/* Camera Viewfinder */}
          {mode === 'camera' && (
            <div className="w-full flex flex-col items-center">
              {!capturedImage ? (
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-purple-900/40 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span>LIVE</span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-teal-500/50">
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-1 rounded text-[10px] text-teal-300 font-mono">
                    Captured Snapshot
                  </div>
                </div>
              )}

              <div className="mt-4 flex space-x-3">
                {!capturedImage ? (
                  <button
                    onClick={handleTakeSnapshot}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-purple-900/30"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Snapshot</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center space-x-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake</span>
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Use This Image</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Audio Microphone Recorder */}
          {mode === 'audio' && (
            <div className="w-full flex flex-col items-center text-center py-4">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecordingAudio
                  ? 'bg-red-950/70 border-2 border-red-500 animate-pulse text-red-400'
                  : 'bg-teal-950/60 border border-teal-800 text-teal-400'
              }`}>
                <Mic className="w-10 h-10" />
              </div>

              <div className="mt-4 font-mono text-2xl font-bold text-white">
                {String(Math.floor(audioDuration / 60)).padStart(2, '0')}:
                {String(audioDuration % 60).padStart(2, '0')}
              </div>

              {isRecordingAudio && (
                <div className="flex items-center space-x-1 mt-3">
                  <span className="w-1.5 h-4 bg-teal-400 animate-bounce"></span>
                  <span className="w-1.5 h-8 bg-purple-400 animate-bounce delay-75"></span>
                  <span className="w-1.5 h-6 bg-teal-400 animate-bounce delay-150"></span>
                  <span className="w-1.5 h-10 bg-indigo-400 animate-bounce delay-200"></span>
                  <span className="w-1.5 h-5 bg-teal-400 animate-bounce delay-100"></span>
                </div>
              )}

              <p className="text-xs text-slate-400 mt-2 max-w-xs">
                {isRecordingAudio
                  ? 'Recording live acoustic distress narration. Speak clearly.'
                  : recordedAudioBlob
                  ? 'Recording complete. Ready for Whisper speech transcription.'
                  : 'Press start to record verbal emergency statement.'}
              </p>

              <div className="mt-5 flex space-x-3">
                {!isRecordingAudio ? (
                  !recordedAudioBlob ? (
                    <button
                      onClick={startAudioRecording}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-900/40"
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { setRecordedAudioBlob(null); setAudioDuration(0); }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center space-x-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Re-record</span>
                      </button>
                      <button
                        onClick={handleConfirm}
                        className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Analyze Audio</span>
                      </button>
                    </>
                  )
                ) : (
                  <button
                    onClick={stopAudioRecording}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/50 rounded-xl font-bold text-xs flex items-center space-x-2"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

