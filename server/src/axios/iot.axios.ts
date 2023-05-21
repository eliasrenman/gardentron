import axios from "axios";

export const iotClient = axios.create({
  baseURL: process.env.IOT_BASE_URL,
});
