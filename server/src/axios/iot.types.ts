export type MoistureReading = {
  /**
   * A number between 0 and 100 to represent precentages
   */
  precentage: number;
  /**
   * Raw read
   */
  read: number;
};

export type MoistureResponse = {
  data: {
    sensor_0: MoistureReading;
    sensor_1: MoistureReading;
    sensor_2: MoistureReading;
  };
};
