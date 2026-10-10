import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { LiveMediaCapture } from '@/components/shared/live-media-capture'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('LiveMediaCapture Component', () => {
  let mockStream: MediaStream
  let mockTrack: MediaStreamTrack

  beforeEach(() => {
    vi.clearAllMocks()

    mockTrack = {
      stop: vi.fn(),
    } as unknown as MediaStreamTrack

    mockStream = {
      getTracks: vi.fn().mockReturnValue([mockTrack]),
    } as unknown as MediaStream

    // Mock getUserMedia
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
      configurable: true,
    })

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')

    // Mock HTMLMediaElement.prototype.play
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)

    // Mock HTMLCanvasElement
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      drawImage: vi.fn(),
    }) as any

    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,mockphoto')
    HTMLCanvasElement.prototype.toBlob = vi.fn().mockImplementation((callback: BlobCallback) => {
      callback(new Blob(['mock-img'], { type: 'image/jpeg' }))
    })

    // Mock MediaRecorder
    class MockMediaRecorder {
      ondataavailable: ((e: { data: Blob }) => void) | null = null
      onstop: (() => void) | null = null
      state = 'inactive'

      static isTypeSupported = vi.fn().mockReturnValue(true)

      start = vi.fn().mockImplementation(() => {
        this.state = 'recording'
      })

      stop = vi.fn().mockImplementation(() => {
        this.state = 'inactive'
        if (this.ondataavailable) {
          this.ondataavailable({ data: new Blob(['mock-chunk'], { type: 'video/webm' }) })
        }
        if (this.onstop) {
          this.onstop()
        }
      })
    }

    // @ts-ignore
    window.MediaRecorder = MockMediaRecorder
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders photo, video, and upload tabs by default', () => {
    const onCapture = vi.fn()
    render(<LiveMediaCapture onCapture={onCapture} />)

    expect(screen.getByRole('button', { name: /take photo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /record video/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument()
  })

  it('initializes camera stream on photo mode', async () => {
    const onCapture = vi.fn()
    render(<LiveMediaCapture onCapture={onCapture} defaultMode="photo" />)

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
    })
    expect(screen.getByLabelText(/capture photo/i)).toBeInTheDocument()
  })

  it('captures a photo when shutter is clicked', async () => {
    const user = userEvent.setup()
    const onCapture = vi.fn()
    render(<LiveMediaCapture onCapture={onCapture} defaultMode="photo" />)

    await waitFor(() => {
      expect(screen.getByLabelText(/capture photo/i)).toBeInTheDocument()
    })

    await user.click(screen.getByLabelText(/capture photo/i))

    await waitFor(() => {
      expect(onCapture).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'photo',
          mimeType: 'image/jpeg',
        })
      )
    })

    expect(screen.getByText(/photo ready/i)).toBeInTheDocument()
  })

  it('allows switching to upload tab and uploading a file', async () => {
    const user = userEvent.setup()
    const onCapture = vi.fn()
    const { container } = render(<LiveMediaCapture onCapture={onCapture} />)

    await user.click(screen.getByRole('button', { name: /upload file/i }))

    expect(screen.getByText(/click or drag & drop to upload/i)).toBeInTheDocument()

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()

    const testFile = new File(['mock content'], 'test_joint.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [testFile] } })

    await waitFor(() => {
      expect(onCapture).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'photo',
          fileName: 'test_joint.jpg',
        })
      )
    })
  })

  it('allows retaking/clearing captured media', async () => {
    const user = userEvent.setup()
    const onCapture = vi.fn()
    const onClear = vi.fn()
    render(
      <LiveMediaCapture
        onCapture={onCapture}
        onClear={onClear}
        initialMedia={{
          type: 'photo',
          url: 'blob:existing',
          fileName: 'existing.jpg',
        }}
      />
    )

    expect(screen.getByText(/photo ready/i)).toBeInTheDocument()
    expect(screen.getByText('existing.jpg')).toBeInTheDocument()

    const retakeBtn = screen.getByRole('button', { name: /retake \/ choose another/i })
    await user.click(retakeBtn)

    expect(onClear).toHaveBeenCalledOnce()
  })
})
