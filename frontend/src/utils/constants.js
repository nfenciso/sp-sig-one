import { get } from "lodash";

const baseURL = get(process.env, "REACT_BACKEND_URL", "http://localhost:5000");

export { baseURL };