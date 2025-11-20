import dotenv from 'dotenv'
import path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma'

// Load environment variables (default: .env in current working directory).
// If you run the server from the repo root, ensure `backend/.env` is loaded.
dotenv.config()

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
	console.error('DATABASE_URL is not set. Ensure backend/.env contains DATABASE_URL and dotenv loads it.');
	throw new Error('DATABASE_URL not set')
}

// Create a masked version of the URL for safe logging (no credentials printed)
let masked = '***'
try {
	const url = new URL(databaseUrl)
	const hasUser = url.username ? '***@' : ''
	masked = `${url.protocol}//${hasUser}${url.hostname}${url.port ? `:${url.port}` : ''}${url.pathname}`
} catch (e) {
	masked = '***'
}
console.log(`Prisma connecting to ${masked}`)

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })

export default prisma