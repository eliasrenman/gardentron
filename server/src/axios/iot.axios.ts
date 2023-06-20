import axios from "axios";
export const BASE_URL = process.env.IOT_BASE_URL;
export const iotClient = axios.create({
  baseURL: BASE_URL,
});
