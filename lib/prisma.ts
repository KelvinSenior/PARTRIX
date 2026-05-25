import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/lib/env";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const globalForPrisma = global as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
