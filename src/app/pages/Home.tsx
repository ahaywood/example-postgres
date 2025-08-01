import { RequestInfo } from "rwsdk/worker";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export async function Home({ ctx }: RequestInfo) {
  const users = await prisma.user.findMany();

  return (
    <div>
      <h1>Hello World</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
