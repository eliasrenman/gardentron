import Queue from "queue";
import { Prisma } from "@prisma/client";
import { iotClient } from "../axios/iot.axios";
import { MositureRow, readMoistureLevels } from "../cron";
import { config } from "../config";
import { emitter } from "../eventemitter";

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

async function process(row: MositureRow) {
  console.log("Started processing of", row.name);
  const index = row.name.replace(/[^0-9]/g, "");
  try {
    // Enable water gate
    await toggleWater(index, true);
    // Check moisture level once per second for configured time
    await Promise.race([
      sleep(config.config.timeout * 1000),
      timeoutCb(row.name, row.value.toNumber()),
    ]);
  } catch (e) {
    console.log(`Failed to processing of ${row.name}`, e);
  } finally {
    // Finally turn of the water gate
    toggleWater(index, false);
  }
}
async function timeoutCb(name: string, initalRead: number): Promise<void> {
  // If the moisture level does not increase a significant amount trigger water-empty alarm and clear queue
  const { data } = await readMoistureLevels();
  if (!data) {
    throw Error(`Failed getting a moisture level reading for ${name}`);
  }
  if (!(name in data.data)) {
    throw Error(
      `Recieved invalid response for mosisture level reading for ${name}`
    );
  }
  const reading = data.data[name as "sensor_0"].precentage;
  const lowerThreshold = initalRead + config.config.threshold;
  if (lowerThreshold >= reading) {
    // Trigger the low water alarm
    queue.end(Error("Water level low"));
    // Update the configuration
    config.config = {
      ...config.config,
      water_low: true,
    };
    // Emit the the event that the confighas been updated
    emitter.emit("config.water_low");
    return;
  }
  const upperThreshold =
    initalRead + config.config.moisture.thresholds.upper[name as "sensor_0"];
  if (reading >= upperThreshold) {
    console.log(`Successfully upped the moisture level for ${name}`);
    return;
  }
  // If moisture level reaches upper threshold then cancel out of the checking loop
  await sleep(config.config.check_interval * 1000);
  return timeoutCb(name, initalRead);
}

function toggleWater(index: string, on: boolean) {
  return iotClient
    .post(`relay/${on ? "activate" : "deactivate"}`, {
      relay: index,
    })
    .then((item) => ({ on: true }));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
