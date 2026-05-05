import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)
    const filePath = path.resolve('server/data/users.json')
    
    let users = []
    try {
        const data = await fs.readFile(filePath, 'utf-8')
        users = JSON.parse(data)
    } catch (e) {
        throw createError({ statusCode: 404, statusMessage: 'Data not found' })
    }

    const index = users.findIndex((u: any) => u.id === id)
    if (index === -1) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    users[index] = { ...users[index], ...body }
    await fs.writeFile(filePath, JSON.stringify(users, null, 2))
    
    return users[index]
})
