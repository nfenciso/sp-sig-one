import { get } from "lodash";

var baseURL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";// get(process.env, "REACT_APP_BACKEND_URL", "http://localhost:5000");
var selfURL = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";

export { baseURL, selfURL };
