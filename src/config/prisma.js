require("dotenv").config();

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 3000,
});

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;