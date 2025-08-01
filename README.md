# RedwoodSDK Example with Prisma + Postgres

## Quick Start

```bash
git clone https://github.com/ahaywood/example-postgres.git
cd example-postgres
pnpm i

# Run local Postgres database
npx prisma dev

# In a separate Terminal Window
pnpm dev
```

## Explanation of all the steps necessary to set this up in your own project

This project started from the [RedwoodSDK Minimal Starter Kit](https://github.com/redwoodjs/sdk/tree/main/starters/minimal):

```bash
npx create-rwsdk example-postgres -t minimal
```

Install [Prisma](https://www.prisma.io/):

```bash
pnpm install prisma@6.8.2 --save-dev
npx prisma init
```

_NOTE: I'm installing a specific version of Prisma. Otherwise, you may run into issues with the latest version._

This will set up Prisma within your project.

Within the Terminal run:

```bash
npx prisma dev
```

This will get Postgres running locally on your computer.

It will also add a `DATABASE_URL` to your `.env` file that looks something like this:

```
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=***"
```

Change the `DATABASE_URL` to `DIRECT_DATABASE_URL`:

```
DIRECT_DATABASE_URL="prisma+postgres://localhost:51213/?api_key=***"
```

You'll reference the `DIRECT_DATABASE_URL` when you're making migrations.

Add a `DATABASE_URL` variable with the following connection string. This is the connection string we'll reference throughout our application:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=1&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&single_user_connections=true&socket_timeout=0"
```

You can also get these values by going to the Postgres server:

```bash
npx prisma dev
```

and hitting `h` to get the `DIRECT_DATABASE_URL` and `t` to get the `DATABASE_URL`.

Update your `schema.prisma` file:

```prisma
generator client {
  provider = "prisma-client"

  runtime                = "workerd"
  moduleFormat           = "esm"
  generatedFileExtension = "ts"
  importFileExtension    = "ts"

  output   = "../src/generated/prisma"
  engineType = "library"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl      = env("DIRECT_DATABASE_URL")
}
```

Then, add your first modal to the bottom of your `schema.prisma` file:

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

You can generate a migration:

```bash
npx prisma migrate dev
```

This will prompt you to name your migration. A new folder with a `.sql` file will be placed inside the `prisma/migrations` folder and then it will run the migration.

Each time you run a migration, it should update and generate a new Prisma folder for you (`/src/generated/prisma`). This folder should be added to your `.gitignore` file (if it hasn't been already.)

From time to time, you may need to regenerate the Prisma folder in order to get keep your database functions and types updated:

```bash
npx prisma generate
```

You can preview your database by running:

```bash
npx prisma studio
```

Within your browser, go to: http://localhost:5555/

![Prisma Studio](./README/prisma-studio.png)

Feel free to add some data so that when you start making API calls within the the application, you'll be able to tell it's connecting accurately.

Within the `src` directory, create a new folder called `lib`. Inside, create a new file called `db.ts`:

```ts
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "cloudflare:workers";

// Create a singleton instance
let prisma: PrismaClient | null = null;

export function getPrismaClient() {
  if (!prisma) {
    const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
    prisma = new PrismaClient({ adapter } as any);
  }
  return prisma;
}
```

This file establishes the connection to the Prisma database and can be reused from one page to the next.

Now, within the `src/pages/Home.ts` file, let's make a database call:

```ts
import { RequestInfo } from "rwsdk/worker";
import { getPrismaClient } from "../lib/db";

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
```

- On line 2, you'll notice we're importing the `getPrismaClient` function we created in `lib/db.ts`
- Then, inside our page component, we're able to use the Prisma client and get all the users within our database:

```ts
const prisma = getPrismaClient();
const users = await prisma.user.findMany();
```

Run your RedwoodSDK project:

```bash
pnpm dev
```

You should see a list of all the users from the database:

![Hello World Screenshot](./README/hello-world.png)

## Troubleshooting

**If you run into an issue where the connection to the database times out,** try restarting the Postgres server:

```bash
npx prisma generate
```