import type { User } from '~/types'

const STORAGE_KEY = 'demo-users'
export const useUsers = () => {
  const users = useState<User[]>('users', () => [])
  const isLoading = useState('users-loading', () => false)
  const isHydrated = ref(false)

  const load = () => {
    if (import.meta.server) return
    const stored = localStorage.getItem(STORAGE_KEY)
    users.value = stored ? JSON.parse(stored) : []
  }

  const save = (data: User[]) => {
    users.value = data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  const clear = () => {
    users.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  // Load on init (client-side), wait for mount to prevent hydration mismatch
  if (import.meta.client) {
    onMounted(() => {
      load()
      isHydrated.value = true
    })
  }

  const isPending = computed(() => !isHydrated.value || isLoading.value)

  return {
    users,
    load,
    save,
    clear,
    isLoading,
    isPending
  }
}

