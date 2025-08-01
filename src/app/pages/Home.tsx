import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { RequestInfo } from "rwsdk/worker";
import { env } from "cloudflare:workers";

// Create a new client for each request to avoid connection issues
function getPrismaClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter } as any);
}

export async function Home({ ctx }: RequestInfo) {
  const prisma = getPrismaClient();

  try {
    const users = await prisma.user.findMany();
    await prisma.$disconnect();

    return (
      <div>
        <h1>Hello World</h1>
        <pre>{JSON.stringify(users, null, 2)}</pre>
      </div>
    );
  } catch (error) {
    await prisma.$disconnect();
    return (
      <div>
        <h1>Error</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }
}
