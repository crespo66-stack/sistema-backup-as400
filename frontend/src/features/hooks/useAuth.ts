import { useMemo } from 'react'

export function useAuth() {
  const user = useMemo(() => ({ name: 'Usuario' }), [])
  return {
    user,
    isAuthenticated: true,
  }
}
