import { get } from "lodash";

const baseURL = get(process.env, "BACKEND_URL", "http://localhost:5000");

export { baseURL };