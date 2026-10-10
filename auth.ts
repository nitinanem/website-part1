import { getSession } from '@/lib/auth-session'

export const auth = async () => {
  const session = await getSession()
  if (!session) {
    return null
  }

  return {
    user: {
      id: session.patientId || session.id,
      userId: session.id,
      patientId: session.patientId,
      doctorId: session.doctorId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  }
}
