import cron from "node-cron";
import { iotClient } from "../axios/iot.axios";
import { moistureResponse } from "../axios/iot.types";
import { prisma } from "../prisma";
import { emitter } from "../eventemitter";

export function registerCronjobs() {
  cron.schedule("* * * * *", async () => {
    console.log("Checking moisture levels");

    // Read moisture sensors
    const { data } = await iotClient.post<moistureResponse>("moisture");
    const rows = [];
    for (const [key, value] of Object.entries(data)) {
      const row = await prisma.moistureValue.create({
        data: {
          name: key,
          value,
          createdAt: new Date(),
        },
        select: { createdAt: true, id: true, name: true, value: true },
      });

      rows.push(row);
    }

    // Emit event
    emitter.emit("moisture.updated", rows);
  });
}
