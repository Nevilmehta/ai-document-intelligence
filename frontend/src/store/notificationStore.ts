import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppNotification {
  id: string
  title: string
  description?: string
  analysisId?: number
  read: boolean
  createdAt: string
}

interface NotificationStore {
  notifications: AppNotification[]
  addNotification: (n: Pick<AppNotification, 'title' | 'description' | 'analysisId'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  remove: (id: string) => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],

      addNotification: (n) =>
        set((state) => ({
          notifications: [
            {
              id: crypto.randomUUID(),
              ...n,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ].slice(0, 50),
        })),

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      remove: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),
    }),
    { name: 'docintel-notifications' }
  )
)
