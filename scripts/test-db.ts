import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.user.count();
  console.log("Conexao OK. Usuarios no banco:", count);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("FALHA na conexao:", e);
    process.exit(1);
  });
