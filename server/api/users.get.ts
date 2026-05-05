import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async () => {
    const filePath = path.resolve('server/data/users.json')
    try {
        const data = await fs.readFile(filePath, 'utf-8')
        return JSON.parse(data)
    } catch (e) {
        return []
    }
})
