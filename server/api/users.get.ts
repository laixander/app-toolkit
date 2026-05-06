import { readFileSync } from 'fs'
import { resolve } from 'path'

export default defineEventHandler(() => {
  const filePath = resolve('server/data/users.json')
  const data = readFileSync(filePath, 'utf-8')
  return JSON.parse(data)
})
