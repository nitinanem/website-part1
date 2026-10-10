import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AuthView } from '@/components/auth-view'
import { DoctorCheck } from '@/components/public/doctor-check'
import { LanguageProvider } from '@/lib/i18n/context'

describe('Age Limit Range (0 to 200)', () => {
  it('verifies AuthView signup age input has min=0 and max=200 and clamps input', () => {
    render(
      <LanguageProvider>
        <AuthView onNavigate={vi.fn()} />
      </LanguageProvider>
    )

    // Switch to Sign Up mode
    const signUpTab = screen.getByRole('button', { name: /^sign up$/i })
    fireEvent.click(signUpTab)

    const ageInput = screen.getByPlaceholderText('45') as HTMLInputElement
    expect(ageInput).toBeInTheDocument()
    expect(ageInput).toHaveAttribute('type', 'number')
    expect(ageInput).toHaveAttribute('min', '0')
    expect(ageInput).toHaveAttribute('max', '200')

    // Test typing a value exceeding 200 (e.g., 777777)
    fireEvent.change(ageInput, { target: { value: '777777' } })
    expect(ageInput.value).toBe('200')

    // Test typing a negative value
    fireEvent.change(ageInput, { target: { value: '-10' } })
    expect(ageInput.value).toBe('0')
  })

  it('verifies DoctorCheck age input has min=0 and max=200 and strictly clamps numbers > 200', () => {
    render(
      <LanguageProvider>
        <DoctorCheck />
      </LanguageProvider>
    )

    const numberInputs = screen.getAllByRole('spinbutton')
    const ageInput = numberInputs[0] as HTMLInputElement
    expect(ageInput).toBeInTheDocument()
    expect(ageInput).toHaveAttribute('min', '0')
    expect(ageInput).toHaveAttribute('max', '200')

    // Test typing 777777
    fireEvent.change(ageInput, { target: { value: '777777' } })
    expect(ageInput.value).toBe('200')

    // Test typing valid value 65
    fireEvent.change(ageInput, { target: { value: '65' } })
    expect(ageInput.value).toBe('65')

    // Test typing negative number
    fireEvent.change(ageInput, { target: { value: '-5' } })
    expect(ageInput.value).toBe('0')
  })
})
