import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  role: null,
  setAuth: (data) =>
    set({
      user: data.user,
      token: data.token,
      role: data.role,
    }),
  clearAuth: () =>
    set({
      user: null,
      token: null,
      role: null,
    }),
}))

export default useAuthStore
