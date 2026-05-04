import { useStorage } from '@vueuse/core'

export interface AppLog {
    id: string
    timestamp: string
    level: 'info' | 'warn' | 'error'
    message: string
}

export const useLogger = () => {
    const logs = useStorage<AppLog[]>('app-logs', [])

    const addLog = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
        const newLog: AppLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            level,
            message
        }
        
        // Add to the beginning of the array and limit to 50 logs
        logs.value = [newLog, ...logs.value].slice(0, 50)
    }

    const clearLogs = () => {
        logs.value = []
    }

    return {
        logs,
        addLog,
        clearLogs
    }
}
