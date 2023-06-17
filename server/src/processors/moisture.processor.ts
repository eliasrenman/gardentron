// import Queue from "queue";

import { Prisma } from "@prisma/client";
import { iotClient } from "../axios/iot.axios";
import { MositureRow } from "../cron";

// const q = new Queue({ results: [] });
export function checkReadingAndEnqueue(rows: MositureRow[]) {
  // Read config for threshold values
  // Conclude which sensors need watering.
  // Enqueue relevant
}
function enqueue() {}

function process() {
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
