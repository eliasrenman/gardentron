import { readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { Configuration } from "./config.types";
import { createLogger, format } from "winston";
import { Console } from "winston/lib/winston/transports";

export class Config<T extends Record<string, any>> {
  private _json!: T;

  constructor(private path: string) {
    this._json = JSON.parse(readFileSync(path).toString());
  }

  public get config() {
    return this._json;
  }

  public set config(val: T) {
    writeFileSync(this.path, JSON.stringify(val, null, 2));

    this._json = val;
  }
}

export const config = new Config<Configuration>(
  resolve(join(__dirname, "../config.json"))
);

const alignColorsAndTime = format.combine(
  format.colorize({
    all: true,
  }),
  format.label({
    label: "[LOGGER]",
  }),
  format.timestamp({
    format: "YY-MM-DD HH:mm:ss",
  }),
  format.printf(
    (info) =>
      ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
  )
);

export const logger = createLogger({
  format: alignColorsAndTime,
  transports: [new Console({})],
});
