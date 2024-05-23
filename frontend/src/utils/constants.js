import { get } from "lodash";

const baseURL = get(process.env, "REACT_BACKEND_URL", "http://localhost:5000");
const selfURL = get(process.env, "REACT_FRONTEND_URL", "http://localhost:3000");

export { baseURL, selfURL };
