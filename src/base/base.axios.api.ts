import { AppConfig } from "config/app.config";
import { getAxiosBase } from "./base.axios";

const BaseAxiosApi = getAxiosBase({ baseURL: `${AppConfig.baseApi}/api` });
export default BaseAxiosApi;