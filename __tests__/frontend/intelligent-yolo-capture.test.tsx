import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IntelligentYoloCapture } from '@/components/shared/intelligent-yolo-capture'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('IntelligentYoloCapture', () => {
  const mockOnComplete = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders protocol selection tabs with initial protocol', () => {
    render(
      <IntelligentYoloCapture
        targetJoint="Right Knee"
        initialProtocol="sit-to-stand"
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByRole('button', { name: /30s Sit-to-Stand/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Walking Gait/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Upload File/i })).toBeInTheDocument()
  })

  it('switches to file upload mode and allows uploading media to trigger analysis', async () => {
    render(
      <IntelligentYoloCapture
        targetJoint="Right Knee"
        onComplete={mockOnComplete}
      />
    )

    // Click "Upload File" protocol tab
    const uploadTab = screen.getByText(/Upload File/i)
    fireEvent.click(uploadTab)

    // Check file upload dropzone is visible
    expect(screen.getByText(/Upload Mobility Video or Joint Photo/i)).toBeInTheDocument()

    // Simulate file input
    const file = new File(['fake-video-content'], 'test-mobility.mp4', { type: 'video/mp4' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).not.toBeNull()

    // Mock URL.createObjectURL
    const mockUrl = 'blob:http://localhost:3000/mock-video'
    const originalCreateObjectURL = global.URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => mockUrl)

    fireEvent.change(fileInput, { target: { files: [file] } })

    // Wait for analysis to complete and results card to appear
    await waitFor(
      () => {
        expect(screen.getByText(/Mobility Score/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Verify rating elements
    expect(screen.getByText(/Est\. KL Rating/i)).toBeInTheDocument()
    expect(screen.getByText(/Ready for Layer 3/i)).toBeInTheDocument()

    expect(mockOnComplete).toHaveBeenCalledTimes(1)
    const result = mockOnComplete.mock.calls[0][0]
    expect(result.mobilityScore).toBeGreaterThanOrEqual(1)
    expect(result.mobilityScore).toBeLessThanOrEqual(10)
    expect(result.klGrade).toBeGreaterThanOrEqual(0)
    expect(result.klGrade).toBeLessThanOrEqual(4)
    expect(typeof result.safeScope).toBe('boolean')

    global.URL.createObjectURL = originalCreateObjectURL
  })

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <IntelligentYoloCapture
        targetJoint="Right Knee"
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
      />
    )

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelBtn)
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })
})
