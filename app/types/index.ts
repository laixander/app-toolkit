export interface User {
  id: number
  name: string
  email: string
  role: string
}


export interface HeaderAction {
  label: string
  icon: string
  event?: string
  color?: string
  variant?: string
  size?: string
}

export interface AppLog {
  id: string
  message: string
  level: 'info' | 'warn' | 'error'
  timestamp: string
}
