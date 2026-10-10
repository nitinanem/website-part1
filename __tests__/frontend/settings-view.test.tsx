import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SettingsView } from '@/components/dashboard/settings-view'
import { LanguageProvider } from '@/lib/i18n/context'
import { getPatient, updatePatient } from '@/lib/api/patients'
import { getSettings, saveSettings } from '@/lib/api/settings'

const motionComponents: Record<string, any> = {}

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_, prop: string) => {
        if (!motionComponents[prop]) {
          motionComponents[prop] = ({ children, ...props }: any) => {
            const Tag = prop as any
            return <Tag {...props}>{children}</Tag>
          }
        }
        return motionComponents[prop]
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/lib/api/settings', () => ({
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
}))

vi.mock('@/lib/api/patients', () => ({
  getPatient: vi.fn(),
  updatePatient: vi.fn(),
  getDoctors: vi.fn().mockResolvedValue([]),
  mockDoctors: [],
}))

describe('SettingsView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getSettings).mockResolvedValue({
      patientId: 'p1',
      dailyReminders: true,
      weeklyEmail: false,
      language: 'en',
      whatsApp: { enabled: true, phone: '+91 98765 43210' },
    })
    vi.mocked(saveSettings).mockResolvedValue({
      patientId: 'p1',
      dailyReminders: true,
      weeklyEmail: false,
      language: 'en',
      whatsApp: { enabled: true, phone: '+91 98765 43210' },
    })
    vi.mocked(getPatient).mockResolvedValue({
      id: 'p1',
      name: 'Aman Sharma',
      age: 54,
      phone: '+91 98765 43210',
      email: 'aman.sharma@example.com',
      gender: 'male',
      primaryJoint: 'Right Knee',
      abhaId: '91-4820-9182-3849',
      latestAssessmentId: null,
      latestAssessmentStatus: null,
    })
    vi.mocked(updatePatient).mockImplementation(async (id, patch) => ({
      id,
      name: patch.name || 'Aman Sharma',
      age: patch.age ?? 54,
      phone: patch.phone || '+91 98765 43210',
      email: patch.email || 'aman.sharma@example.com',
      gender: patch.gender || 'male',
      primaryJoint: patch.primaryJoint || 'Right Knee',
      latestAssessmentId: null,
      latestAssessmentStatus: null,
    }))
  })

  it('renders patient profile details, verified badge, and preferences', async () => {
    render(
      <LanguageProvider>
        <SettingsView />
      </LanguageProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Aman Sharma')[0]).toBeInTheDocument()
    })

    expect(screen.getByText('aman.sharma@example.com')).toBeInTheDocument()
    expect(screen.getByText('Verified Patient')).toBeInTheDocument()
    expect(screen.getByText('54 yrs')).toBeInTheDocument()
    expect(screen.getByText('Joint: Right Knee')).toBeInTheDocument()
  })

  it('opens profile editor form when Edit button is clicked and saves changes', async () => {
    render(
      <LanguageProvider>
        <SettingsView />
      </LanguageProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Aman Sharma')[0]).toBeInTheDocument()
    })

    // Click "Edit" button
    const editBtn = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editBtn)

    // Verify form opened
    expect(screen.getByText('Edit Personal & Medical Profile')).toBeInTheDocument()
    const nameInput = screen.getByPlaceholderText('e.g. Aman Sharma') as HTMLInputElement
    expect(nameInput.value).toBe('Aman Sharma')

    // Change name
    fireEvent.change(nameInput, { target: { value: 'Aman Kumar Sharma' } })

    // Save changes
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(updatePatient).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({
          name: 'Aman Kumar Sharma',
        })
      )
    })

    // Verify success banner
    expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument()
  })

  it('enforces age clamping between 0 and 200', async () => {
    render(
      <LanguageProvider>
        <SettingsView />
      </LanguageProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Aman Sharma')[0]).toBeInTheDocument()
    })

    const editBtn = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editBtn)

    const ageInput = screen.getByPlaceholderText('e.g. 54') as HTMLInputElement

    // Enter age 250 -> clamped to 200
    fireEvent.change(ageInput, { target: { value: '250' } })
    await waitFor(() => {
      expect(ageInput.value).toBe('200')
    })

    // Enter age -10 -> clamped to 0
    fireEvent.change(ageInput, { target: { value: '-10' } })
    await waitFor(() => {
      expect(ageInput.value).toBe('0')
    })
  })

  it('allows sending test WhatsApp reminder ping', async () => {
    render(
      <LanguageProvider>
        <SettingsView />
      </LanguageProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send Test Ping/i })).toBeInTheDocument()
    })

    const pingBtn = screen.getByRole('button', { name: /Send Test Ping/i })
    fireEvent.click(pingBtn)

    expect(screen.getByText(/Test notification simulated!/i)).toBeInTheDocument()
  })

  it('renders clean prompts for new accounts without mock fallbacks', async () => {
    vi.mocked(getPatient).mockResolvedValueOnce({
      id: 'p_new',
      name: 'New Patient',
      age: null,
      phone: null,
      email: 'new.patient@example.com',
      gender: null,
      primaryJoint: null,
      abhaId: null,
      latestAssessmentId: null,
      latestAssessmentStatus: null,
    } as any)

    render(
      <LanguageProvider>
        <SettingsView />
      </LanguageProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByText('New Patient')[0]).toBeInTheDocument()
    })

    // Must NOT display hardcoded mock fallbacks
    expect(screen.queryByText('54 yrs')).not.toBeInTheDocument()
    expect(screen.queryByText('+91 98765 43210')).not.toBeInTheDocument()
    expect(screen.queryByText('Joint: Right Knee')).not.toBeInTheDocument()

    // Must display clean add/select prompts
    expect(screen.getByRole('button', { name: /Add age/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Add phone/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Select joint/i })).toBeInTheDocument()

    // Open profile editor
    const editBtn = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editBtn)

    // Form inputs must not be pre-filled with mock gender or joint
    const genderSelect = screen.getByLabelText('Gender') as HTMLSelectElement
    expect(genderSelect.value).toBe('')

    const jointSelect = screen.getByLabelText('Primary Joint of Concern') as HTMLSelectElement
    expect(jointSelect.value).toBe('')
  })
})

