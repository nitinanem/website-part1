'use client'

import { LiveMediaCapture, type CapturedMedia } from '@/components/shared/live-media-capture'

export interface XrayStepData {
  xrayRef: string | null
  fileName: string | null
  previewUrl?: string | null
}

interface Props {
  data: XrayStepData
  onChange: (d: XrayStepData) => void
  onSkip: () => void
}

export function StepXrayUpload({ data, onChange, onSkip }: Props) {
  function handleCapture(media: CapturedMedia) {
    onChange({
      xrayRef: media.fileName,
      fileName: media.fileName,
      previewUrl: media.url,
    })
  }

  function handleClear() {
    onChange({
      xrayRef: null,
      fileName: null,
      previewUrl: null,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-semibold">X-ray Film & Scan (Optional)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If you have a recent knee or hip X-ray, take a photo of the film against a light source or upload digital files (JPG, PNG, DICOM) to enable automated KL grading.
        </p>
      </div>

      <LiveMediaCapture
        allowedModes={['upload', 'photo']}
        defaultMode="upload"
        alignmentGuide="xray"
        title="X-ray Capture / Upload"
        helperText="Tip: If photographing physical film, hold it steadily in front of an evenly lit window or white screen."
        initialMedia={
          data.fileName
            ? {
                type: 'photo',
                url: data.previewUrl || '',
                fileName: data.fileName,
              }
            : null
        }
        onCapture={handleCapture}
        onClear={handleClear}
      />

      <button
        type="button"
        onClick={onSkip}
        className="w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60"
      >
        Skip — I don&#39;t have an X-ray
      </button>
    </div>
  )
}

