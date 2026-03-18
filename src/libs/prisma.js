import prismaPkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { PrismaClient } = prismaPkg;
const { Pool } = pg;

const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter,
    log: ["query"],
});

if(process.env.NODE_ENV !== "production"){
    globalForPrisma.prisma = prisma;
};

export default prisma;
export { prisma };


