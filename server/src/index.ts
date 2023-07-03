import { startServer } from "./server";
import { config } from "dotenv";
import { logger } from "./config";
config();

startServer()
  .then(async () => {
    logger.info("Server started");
  })
  .catch(async (e) => {
    logger.error(e);

    process.exit(1);
  });
