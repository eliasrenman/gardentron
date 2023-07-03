import { config } from "dotenv";
import axios from "axios";
config();

export const BASE_URL = process.env.IOT_BASE_URL;
export const iotClient = axios.create({
  baseURL: BASE_URL,
});
