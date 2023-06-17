import { readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { Configuration } from "./config.types";

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
