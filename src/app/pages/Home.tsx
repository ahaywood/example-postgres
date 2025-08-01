import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

// Create a singleton instance
let prisma: PrismaClient | null = null;

function getPrismaClient() {
  if (!prisma) {
    const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export async function Home({ ctx }: RequestInfo) {
  const prisma = getPrismaClient();
  const users = await prisma.user.findMany();

  return (
    <div>
      <h1>Hello World</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
