export type Configuration = {
  timeout: number;
  threshold: number;
  moisture: Moisture;
};

export type Moisture = {
  thresholds: Thresholds;
};

export type Thresholds = {
  lower: { [key: string]: number };
  upper: { [key: string]: number };
};
