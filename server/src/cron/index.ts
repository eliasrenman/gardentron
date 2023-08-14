import cron from "node-cron";
import { iotClient } from "../axios/iot.axios";
import { MoistureResponse } from "../axios/iot.types";
import { emitter } from "../eventemitter";
import { AxiosError } from "axios";
import { logger } from "../config";
import { MoistureValueRow, db } from "../db/Databasehandler";
import { enqueue } from "../processors/moisture.processor";

export function registerCronjobs() {
  cron.schedule(
    "*/30 * * * *",
    async () => {
      logger.info("Checking moisture levels");

      // Read moisture sensors
      try {
        const { data } = await readMoistureLevels();
        const rows = insertRows(data);

        logger.info("Successfully checked moisture levels");
        if (rows.length === 0) return;
        // Emit event
        emitter.emit("moisture.updated", ...rows);
      } catch (e) {
        logger.info(e);
      }
    },
    { runOnInit: true }
  );
  cron.schedule(
    "0 19 * * *",
    async () => {
      logger.info("Scheduling watering");
      const { data } = await readMoistureLevels();
      const rows = insertRows(data);
      enqueue(rows);
    },
    { runOnInit: true }
  );
}

export function readMoistureLevels() {
  return iotClient
    .get<MoistureResponse | undefined>("moisture/read")
    .catch((err: AxiosError) => {
      console.log(err);
      return {
        data: undefined,
      };
    });
}

function insertRows(data: MoistureResponse | undefined): MoistureValueRow[] {
  if (!data) {
    return [];
  }
  return Object.entries(data.data).map(([key, value]) => {
    const result = db.moistureValue.create({
      data: {
        name: key,
        value: value.precentage,
        createdAt: new Date(),
      },
      select: { createdAt: true, id: true, name: true, value: true },
    });
    if ("changes" in result && "lastInsertRowid" in result) {
      throw Error("Failed to insert row");
    }
    return result as MoistureValueRow;
  });
}
