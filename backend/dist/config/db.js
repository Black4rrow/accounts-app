"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma_1 = require("../generated/prisma");
// Load environment variables (default: .env in current working directory).
// If you run the server from the repo root, ensure `backend/.env` is loaded.
dotenv_1.default.config();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error('DATABASE_URL is not set. Ensure backend/.env contains DATABASE_URL and dotenv loads it.');
    throw new Error('DATABASE_URL not set');
}
// Create a masked version of the URL for safe logging (no credentials printed)
let masked = '***';
try {
    const url = new URL(databaseUrl);
    const hasUser = url.username ? '***@' : '';
    masked = `${url.protocol}//${hasUser}${url.hostname}${url.port ? `:${url.port}` : ''}${url.pathname}`;
}
catch (e) {
    masked = '***';
}
console.log(`Prisma connecting to ${masked}`);
const adapter = new adapter_pg_1.PrismaPg({ connectionString: databaseUrl });
const prisma = new prisma_1.PrismaClient({ adapter });
exports.default = prisma;
