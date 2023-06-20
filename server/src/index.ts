import { startServer } from "./server";
import { prisma } from "./prisma";
import { config } from "dotenv";
config();

startServer()
  .then(async () => {
    await prisma.$connect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
