import sqlite from "better-sqlite3";
import { validate } from "node-cron";
import { join, resolve } from "path";

export class DatabaseHandler extends sqlite {
  public moistureValue: MositureValue;

  constructor(filename: string | Buffer, options?: sqlite.Options | undefined) {
    super(filename, options);

    this.moistureValue = new MositureValue(this);
  }
}

type MoistureValueRow = {
  name: string;
  value: number;
  createdAt: Date | string;
  id?: string;
};

class MositureValue {
  constructor(private readonly db: DatabaseHandler) {}

  public create({ data, select }: Create<MoistureValueRow>) {
    const insertResult = this.db
      .prepare(
        `INSERT INTO 'MoistureValue' (name,value,createdAt) VALUES(${
          data.name
        },${data.value},${new Date(data.createdAt).getTime()})`
      )
      .run();
    if (insertResult.changes == 0) {
      throw Error("Failed to insert row.");
    }
    if (!select) {
      return insertResult;
    }

    return this.select("WHERE id = ?", select).get(
      insertResult.lastInsertRowid.toString()
    ) as MoistureValueRow;
  }

  public findMany({
    skip = 0,
    take = 50,
    orderBy = "DESC",
    select,
  }: FindManyQuery<MoistureValueRow>) {
    return this.select(`ORDER BY id ${orderBy} LIMIT ? OFFSET ?`, select).all(
      take,
      skip
    ) as MoistureValueRow[];
  }

  public select(query: string, value: Record<keyof MoistureValueRow, boolean>) {
    const select = this.getSelectStatement(value);
    const sql = `SELECT ${select} FROM 'MoistureValue' ${query}`;
    console.log("SQL SELECT STATEMENT:", sql);
    return this.db.prepare(sql);
  }

  private getSelectStatement(value: Record<keyof MoistureValueRow, boolean>) {
    const selectArray = Object.entries(value)
      .map((item) => item[1] && item[0])
      .filter((item) => !!item) as string[];
    return selectArray.length == Object.values(value).length
      ? "*"
      : selectArray.join(", ");
  }
}

export type FindManyQuery<T extends Record<string, any>> = {
  skip?: number;
  take?: number;
  orderBy?: "ASC" | "DESC";
  select: Select<T>;
};

export type Create<T extends Record<string, any>> = {
  data: T;
  select?: Select<T>;
};

export type Select<T extends Record<string, any>> = Record<keyof T, boolean>;

export const db = new DatabaseHandler(
  join(resolve(__dirname), "../../db.sqlite")
);
