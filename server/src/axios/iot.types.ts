/**
 * A number between 0 and 100 to represent precentages
 */
export type moisturePrecentage = number;

export type moistureResponse = {
  sensor_0: moisturePrecentage;
  sensor_1: moisturePrecentage;
  sensor_2: moisturePrecentage;
};
