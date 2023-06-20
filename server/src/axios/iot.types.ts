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
  data: MoistureReading[];
};
