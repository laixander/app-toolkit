export const useDemoSeeder = () => {
  const { save, clear } = useUsers()

  const seedAll = async () => {
    const data = await $fetch('/api/users')
    save(data as any[])
  }

  const resetAll = async () => {
    clear()
  }

  return {
    seedAll,
    resetAll
  }
}
