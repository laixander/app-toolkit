import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    const filePath = path.resolve('server/data/users.json')
    
    let users = []
    try {
        const data = await fs.readFile(filePath, 'utf-8')
        users = JSON.parse(data)
    } catch (e) {
        throw createError({ statusCode: 404, statusMessage: 'Data not found' })
    }

    const filteredUsers = users.filter((u: any) => u.id !== id)
    if (filteredUsers.length === users.length) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    await fs.writeFile(filePath, JSON.stringify(filteredUsers, null, 2))
    
    return { success: true }
})
