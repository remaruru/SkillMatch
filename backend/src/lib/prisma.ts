import { PrismaClient } from '@prisma/client';

// Single shared PrismaClient instance for the entire app.
// Creating multiple instances exhausts the connection pool on free-tier DBs.
const prisma = new PrismaClient();

export default prisma;
