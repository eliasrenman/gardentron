import Queue from "queue";
import { iotClient } from "../axios/iot.axios";
import { config, logger } from "../config";
import { readMoistureLevels } from "../cron";
import { emitter } from "../eventemitter";
import { AxiosError } from "axios";
import { MoistureValueRow } from "../db/Databasehandler";

const queue = new Queue({ results: [], concurrency: 1 });

queue.start((result) => logger.info("Successfully started queue"));

export function enqueue(rows: MoistureValueRow[]) {
  rows
    .sort((a, b) => +a.name)
    .forEach((row) => {
      // Read config for threshold values
      // const threshold =
      //   config.config.moisture.thresholds.lower["sensor_" + row.name];

      // // Conclude which sensors need watering.
      // if (row.value <= threshold) {

      logger.info(`Enqueing ${row.name} Value at ${row.value}%`);
      // Enqueue relevant sensors
      queue.push((cb) =>
        process(row)
          .then((val) => cb && cb(undefined, val!))
          .catch((err) => cb && cb(err!))
      );
      // } else {
      // logger.info(`Will not enqueue ${row.name} Value at ${row.value}%`);
      // }
    });
  queue.start();
}

async function process(row: MoistureValueRow) {
  logger.info("Started processing of", row.name);
  const index = row.name;
  try {
    // Enable water gate
    await toggleWater(index, true);
    logger.info("Watering for 2 minutes");
    await sleep(60 * 1000 * 2);
    // Check moisture level once per second for configured time
    // await Promise.race([
    //   // sleep(config.config.timeout * 1000),
    //   timeoutCb(row.name, row.value),
    // ]);
    await toggleWater(index, true);
  } catch (e) {
    logger.info(`Failed to processing of ${row.name}`);
    logger.info(e);
    if (e instanceof AxiosError) {
      console.log(e.response?.data);
    }
  } finally {
    // Finally turn of the water gate
    await toggleWater(index, false);
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

  const reading = data.data[+name].precentage;
  const lowerThreshold = initalRead + config.config.threshold;
  logger.info(`Water reading at ${reading} minimum ${lowerThreshold} required`);
  if (lowerThreshold >= reading) {
    logger.info("Water low warning!");
    // Trigger the low water alarm
    queue.end(Error("Water level low"));
    // Update the configuration
    config.config = {
      ...config.config,
      water_low: true,
    };
    // Emit the the event that the confighas been updated
    emitter.emit("config.water_low");
    // return;
  }
  const upperThreshold =
    initalRead +
    config.config.moisture.thresholds.upper[("sensor_" + name) as "sensor_0"];
  if (reading >= upperThreshold) {
    logger.info(
      `Successfully upped the moisture level for ${"sensor_" + name}`
    );
    return;
  }
  // If moisture level reaches upper threshold then cancel out of the checking loop
  logger.info(
    `Calling check water level in ${config.config.check_interval} seconds`
  );
  await sleep(config.config.check_interval * 1000);
  return timeoutCb(name, initalRead);
}

function toggleWater(index: string, on: boolean) {
  return iotClient
    .post(
      `/relay/${on ? "activate" : "deactivate"}`,
      { relay: +index },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then(async (item) => {
      logger.info(`Successfully ${on ? "activate" : "deactivate"}d water gate`);
      return { on };
    });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
