'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Video,
  Upload,
  StopCircle,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FlipHorizontal,
  Timer,
  Play,
  Pause,
  Maximize2,
  Sparkles,
  FileImage,
  Film
} from 'lucide-react'

export type CapturedMediaType = 'photo' | 'video' | 'file'

export interface CapturedMedia {
  type: CapturedMediaType
  url: string
  blob?: Blob
  fileName: string
  mimeType?: string
}

export interface LiveMediaCaptureProps {
  /** Allowed capture modes */
  allowedModes?: ('photo' | 'video' | 'upload')[]
  /** Default active tab */
  defaultMode?: 'photo' | 'video' | 'upload'
  /** Max recording duration in seconds for video (default 30) */
  maxVideoSeconds?: number
  /** Instruction / hint text displayed below viewfinder */
  helperText?: string
  /** Title for the capture section */
  title?: string
  /** Alignment guide type for overlay */
  alignmentGuide?: 'knee' | 'gait' | 'xray' | 'general'
  /** Initial media if already captured */
  initialMedia?: CapturedMedia | null
  /** Callback when media is captured/selected */
  onCapture: (media: CapturedMedia) => void
  /** Callback when media is cleared */
  onClear?: () => void
}

export function LiveMediaCapture({
  allowedModes = ['photo', 'video', 'upload'],
  defaultMode = 'photo',
  maxVideoSeconds = 30,
  helperText,
  title,
  alignmentGuide = 'general',
  initialMedia = null,
  onCapture,
  onClear,
}: LiveMediaCaptureProps) {
  const [activeTab, setActiveTab] = useState<'photo' | 'video' | 'upload'>(defaultMode)
  const [captured, setCaptured] = useState<CapturedMedia | null>(initialMedia)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [useCountdown, setUseCountdown] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const videoChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }, [])

  const startStream = useCallback(async () => {
    setError(null)
    stopStream()

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: activeTab === 'video', // Only request audio when recording video
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      setIsCameraActive(true)
    } catch (err: any) {
      console.warn('Camera error:', err)
      setError(
        'Unable to access camera. Please allow camera permissions in your browser or choose "Upload File".'
      )
      setIsCameraActive(false)
    }
  }, [facingMode, activeTab, stopStream])

  // Start or stop camera when switching tabs or when unmounting
  useEffect(() => {
    if (activeTab === 'photo' || activeTab === 'video') {
      if (!captured) {
        startStream()
      }
    } else {
      stopStream()
    }
    return () => {
      stopStream()
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [activeTab, captured, startStream, stopStream])

  // Flip camera between front and rear
  function handleFlipCamera() {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }

  // Take a Photo Snapshot
  function takePhotoSnapshot() {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

    canvas.toBlob((blob) => {
      if (blob) {
        const media: CapturedMedia = {
          type: 'photo',
          url: dataUrl,
          blob,
          fileName: `joint_photo_${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
        }
        setCaptured(media)
        stopStream()
        onCapture(media)
      }
    }, 'image/jpeg', 0.92)
  }

  function handleTriggerPhoto() {
    if (useCountdown) {
      setCountdown(3)
      const countTimer = setInterval(() => {
        setCountdown((c) => {
          if (c === null || c <= 1) {
            clearInterval(countTimer)
            takePhotoSnapshot()
            return null
          }
          return c - 1
        })
      }, 1000)
    } else {
      takePhotoSnapshot()
    }
  }

  // Start Video Recording
  function startVideoRecording() {
    if (!streamRef.current) return
    setError(null)
    videoChunksRef.current = []

    // Try supported mime types
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm',
      'video/mp4',
      'video/quicktime',
    ]
    let selectedMime = ''
    for (const mime of mimeTypes) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
        selectedMime = mime
        break
      }
    }

    try {
      const options = selectedMime ? { mimeType: selectedMime } : undefined
      const recorder = new MediaRecorder(streamRef.current, options)
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blobType = selectedMime || 'video/webm'
        const blob = new Blob(videoChunksRef.current, { type: blobType })
        const url = URL.createObjectURL(blob)
        const media: CapturedMedia = {
          type: 'video',
          url,
          blob,
          fileName: `gait_recording_${Date.now()}.${blobType.includes('mp4') ? 'mp4' : 'webm'}`,
          mimeType: blobType,
        }
        setCaptured(media)
        stopStream()
        onCapture(media)
      }

      recorder.start()
      setIsRecording(true)
      setRecordingSeconds(0)

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((sec) => {
          if (sec >= maxVideoSeconds - 1) {
            stopVideoRecording()
            return maxVideoSeconds
          }
          return sec + 1
        })
      }, 1000)
    } catch (err: any) {
      console.error('Failed to start recording:', err)
      setError('Recording failed to start. Please try uploading a video file instead.')
    }
  }

  function stopVideoRecording() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    setIsRecording(false)
  }

  // File Upload handler
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    const isVid = file.type.startsWith('video/')
    const media: CapturedMedia = {
      type: isVid ? 'video' : 'photo',
      url,
      blob: file,
      fileName: file.name,
      mimeType: file.type,
    }
    setCaptured(media)
    stopStream()
    onCapture(media)
  }

  // Retake / Replace
  function handleReset() {
    setCaptured(null)
    setRecordingSeconds(0)
    setIsRecording(false)
    if (onClear) onClear()
    if (activeTab === 'photo' || activeTab === 'video') {
      startStream()
    }
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-foreground">{title}</h3>
          {captured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Ready
            </span>
          )}
        </div>
      )}

      {/* Mode Selection Tabs (if media not yet captured) */}
      {!captured && allowedModes.length > 1 && (
        <div className="flex rounded-xl border border-border bg-secondary/50 p-1">
          {allowedModes.includes('photo') && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('photo')
                setError(null)
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'photo'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Camera className="size-3.5" />
              <span>Take Photo</span>
            </button>
          )}

          {allowedModes.includes('video') && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('video')
                setError(null)
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'video'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Video className="size-3.5" />
              <span>Record Video</span>
            </button>
          )}

          {allowedModes.includes('upload') && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('upload')
                setError(null)
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="size-3.5" />
              <span>Upload File</span>
            </button>
          )}
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {/* Main Display Container */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <AnimatePresence mode="wait">
          {/* STATE 1: CAPTURED PREVIEW */}
          {captured ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative p-4 sm:p-6"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black flex items-center justify-center">
                {captured.type === 'video' ? (
                  <video
                    src={captured.url}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-80 w-full object-contain"
                  />
                ) : (
                  <img
                    src={captured.url}
                    alt="Captured Joint Inspection"
                    className="max-h-80 w-full object-contain"
                  />
                )}

                {/* Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                  <CheckCircle2 className="size-3.5" />
                  <span>{captured.type === 'video' ? 'Video Ready' : 'Photo Ready'}</span>
                </div>
              </div>

              {/* File details & Retake action */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                  {captured.type === 'video' ? (
                    <Film className="size-4 text-primary shrink-0" />
                  ) : (
                    <FileImage className="size-4 text-primary shrink-0" />
                  )}
                  <span className="truncate font-medium">{captured.fileName}</span>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Retake / Choose Another</span>
                </button>
              </div>
            </motion.div>
          ) : activeTab === 'upload' ? (
            /* STATE 2: FILE UPLOAD TAB */
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 sm:p-12 text-center"
            >
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-8 hover:bg-secondary/60 transition-colors">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Upload className="size-7" />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">Click or Drag & Drop to Upload</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Accepts Images (JPG, PNG, WebP, DICOM) or Videos (MP4, MOV, WebM) up to 200 MB
                  </p>
                </div>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs">
                  Browse Files
                </span>
                <input
                  type="file"
                  accept="image/*,video/*,.dcm"
                  className="sr-only"
                  onChange={handleFileUpload}
                />
              </label>
            </motion.div>
          ) : (
            /* STATE 3: LIVE CAMERA VIEWFINDER (PHOTO OR VIDEO) */
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative aspect-video w-full bg-black overflow-hidden"
            >
              {/* Live Video Element */}
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="h-full w-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Alignment Grid Overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {/* 3x3 rule of thirds grid */}
                <div className="grid h-full w-full grid-cols-3 grid-rows-3 border border-white/15">
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10 flex items-center justify-center">
                    {alignmentGuide === 'knee' && (
                      <div className="size-32 rounded-full border border-dashed border-primary/60 bg-primary/5 flex items-center justify-center text-[10px] text-primary/80 font-bold uppercase tracking-wider">
                        Position Knee
                      </div>
                    )}
                  </div>
                  <div className="border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-white/10" />
                  <div className="border-r border-white/10" />
                  <div />
                </div>
              </div>

              {/* Top Bar inside Viewfinder: Flip Camera & Timer Indicator */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                  {isRecording && (
                    <span className="flex items-center gap-1.5 rounded-full bg-destructive/90 px-3 py-1 text-xs font-bold text-destructive-foreground animate-pulse shadow-md">
                      <span className="size-2 rounded-full bg-destructive-foreground" />
                      REC {recordingSeconds}s / {maxVideoSeconds}s
                    </span>
                  )}
                  {activeTab === 'photo' && (
                    <button
                      type="button"
                      onClick={() => setUseCountdown((c) => !c)}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md transition-colors ${
                        useCountdown
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'bg-black/40 text-white hover:bg-black/60'
                      }`}
                    >
                      <Timer className="size-3.5" />
                      <span>{useCountdown ? '3s Timer' : 'Timer Off'}</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md hover:bg-black/60 transition-colors"
                  title="Flip camera"
                >
                  <FlipHorizontal className="size-3.5" />
                  <span className="hidden sm:inline">Flip</span>
                </button>
              </div>

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                  <span className="text-7xl font-extrabold text-white animate-ping">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Bottom Control Bar in Viewfinder */}
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 pointer-events-auto">
                {activeTab === 'photo' ? (
                  <button
                    type="button"
                    onClick={handleTriggerPhoto}
                    disabled={!isCameraActive || countdown !== null}
                    className="group relative flex size-16 items-center justify-center rounded-full border-4 border-white bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    aria-label="Capture Photo"
                  >
                    <Camera className="size-7" />
                  </button>
                ) : isRecording ? (
                  <button
                    type="button"
                    onClick={stopVideoRecording}
                    className="flex items-center gap-2 rounded-full bg-destructive px-6 py-3 text-sm font-bold text-destructive-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95"
                  >
                    <StopCircle className="size-5" />
                    <span>Stop Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startVideoRecording}
                    disabled={!isCameraActive}
                    className="group relative flex size-16 items-center justify-center rounded-full border-4 border-white bg-destructive text-destructive-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    aria-label="Start Video Recording"
                  >
                    <div className="size-5 rounded-full bg-white" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper caption */}
      {helperText && (
        <p className="text-xs text-muted-foreground text-center">
          {helperText}
        </p>
      )}
    </div>
  )
}
