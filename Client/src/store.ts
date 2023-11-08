import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface UserState {
  username: string
  userId: number
  setUsername: (username: string) => void
  setUserId: (userId: number) => void
  logOut: () => void
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        username: "",
        userId: 0,
        setUsername: (username: string) => set({ username }),
        setUserId: (userId: number) => set({ userId }),
        logOut: () => set({ username: "", userId: 0 }),
      }),
      { name: 'userStore' }
    )
  )
)

