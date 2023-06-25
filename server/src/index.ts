import { startServer } from "./server";
import { prisma } from "./prisma";
import { config } from "dotenv";
import { logger } from "./config";
config();

startServer()
  .then(async () => {
    await prisma.$connect();
  })
  .catch(async (e) => {
    logger.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
