import cron from "node-cron";
import { iotClient } from "../axios/iot.axios";
import { MoistureResponse } from "../axios/iot.types";
import { prisma } from "../prisma";
import { emitter } from "../eventemitter";
import { AxiosError } from "axios";

export function registerCronjobs() {
  cron.schedule("* * * * *", async () => {
    console.log("Checking moisture levels");

    // Read moisture sensors
    try {
      const { data } = await readMoistureLevels();
      const rows = await insertRows(data);

      console.log("Successfully checked moisture levels");
      if (rows.length === 0) return;
      // Emit event
      emitter.emit("moisture.updated", ...rows);
    } catch (e) {
      console.log(e);
    }
  });
}

function readMoistureLevels() {
  return iotClient
    .get<MoistureResponse | undefined>("moisture/read")
    .catch((err: AxiosError) => {
      return {
        data: undefined,
      };
    });
}

export type MositureRow = Awaited<ReturnType<typeof insertRows>>[number];

async function insertRows(data: MoistureResponse | undefined) {
  if (!data) {
    return [];
  }

  return Promise.all(
    Object.entries(data.data).map(([key, value]) =>
      prisma.moistureValue.create({
        data: {
          name: key,
          value: value.precentage,
          createdAt: new Date(),
        },
        select: { createdAt: true, id: true, name: true, value: true },
      })
    )
  );
}
