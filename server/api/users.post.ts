import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const filePath = path.resolve('server/data/users.json')
    
    let users = []
    try {
        const data = await fs.readFile(filePath, 'utf-8')
        users = JSON.parse(data)
    } catch (e) {}

    const newUser = {
        id: users.length ? Math.max(...users.map((u: any) => u.id)) + 1 : 1,
        ...body
    }
    
    users.push(newUser)
    await fs.writeFile(filePath, JSON.stringify(users, null, 2))
    
    return newUser
})
