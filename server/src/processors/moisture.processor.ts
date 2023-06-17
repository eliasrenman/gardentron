import Queue from "queue";
import { Prisma } from "@prisma/client";
import { iotClient } from "../axios/iot.axios";
import { MositureRow } from "../cron";
import { config } from "../config";

const queue = new Queue({ results: [] });

queue.start().then((result) => console.log("Successfully started queue"));

export function checkReadingAndEnqueue(rows: MositureRow[]) {
  rows.forEach((row) => {
    // Read config for threshold values
    const threshold = config.config.moisture.thresholds.lower[row.name];
    // Conclude which sensors need watering.
    if (row.value.toNumber() >= threshold) {
      console.log(`Enqueing ${row.name}`);
      // Enqueue relevant sensors
      queue.push(() => process(row));
    }
  });
}

function process(row: MositureRow) {
  console.log("Started processing of", row.name);
  // Enable water gate
  // Check moisture level once per second for configured time
  // If the moisture level does not increase a significant amount trigger water-empty alarm and clear queue
  // If moisture level reaches upper threshold then cancel out of the checking loop
  // Finally turn of the water gate
}
function timeoutCb() {}

function toggleWater(index: number, on: boolean) {
  return iotClient
    .post(`relay/${on ? "activate" : "deactivate"}`, {
      relay: index,
    })
    .then((item) => ({ on: true }));
}
