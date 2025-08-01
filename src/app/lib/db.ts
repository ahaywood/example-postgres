import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "cloudflare:workers";

// Create a singleton instance
let prisma: PrismaClient | null = null;

export function getPrismaClient() {
  if (!prisma) {
    const adapter = new PrismaPg({
      connectionString: env.DATABASE_URL,
      pool: {
        min: 1,
        max: 5,
      },
    });
    prisma = new PrismaClient({ adapter } as any);
  }
  return prisma;
}
