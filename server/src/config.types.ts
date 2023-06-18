export type Configuration = {
  timeout: number;
  threshold: number;
  check_interval: number;
  moisture: Moisture;
  water_low: boolean;
};

export type Moisture = {
  thresholds: Thresholds;
};

export type Thresholds = {
  lower: { [key: string]: number };
  upper: { [key: string]: number };
};
