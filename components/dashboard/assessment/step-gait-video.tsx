'use client'

import { LiveMediaCapture, type CapturedMedia } from '@/components/shared/live-media-capture'

export interface GaitVideoStepData {
  videoRef: string | null
  fileName: string | null
  previewUrl?: string | null
  mediaType?: 'photo' | 'video' | 'file'
}

interface Props {
  data: GaitVideoStepData
  onChange: (d: GaitVideoStepData) => void
}

export function StepGaitVideo({ data, onChange }: Props) {
  function handleCapture(media: CapturedMedia) {
    onChange({
      videoRef: media.fileName,
      fileName: media.fileName,
      previewUrl: media.url,
      mediaType: media.type,
    })
  }

  function handleClear() {
    onChange({
      videoRef: null,
      fileName: null,
      previewUrl: null,
      mediaType: undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-semibold">Gait & Joint Visual Capture</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Record a 15–30 second walking video or take a photo of your knee joint in good lighting. You can also upload an existing video or image file.
        </p>
      </div>

      <LiveMediaCapture
        allowedModes={['video', 'photo', 'upload']}
        defaultMode="video"
        maxVideoSeconds={30}
        alignmentGuide="knee"
        title="Live Camera / Media Input"
        helperText="Position your knee within the guide or step back so your walking pattern is visible. Ensure bright, even lighting."
        initialMedia={
          data.fileName
            ? {
                type: (data.mediaType as any) || 'video',
                url: data.previewUrl || '',
                fileName: data.fileName,
              }
            : null
        }
        onCapture={handleCapture}
        onClear={handleClear}
      />
    </div>
  )
}

