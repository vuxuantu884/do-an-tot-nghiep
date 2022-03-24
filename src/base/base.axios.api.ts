import { AppConfig } from "config/app.config";
import { getAxiosBase } from "./base.axios";

/**
 * Get axios instance
 * Tại môi trường local: dùng proxy để access api => KHÔNG DÙNG baseURL của api, chỉ cần prefix /api
 * Tại môi trường production: DÙNG baseURL của api để access api
 */
const devMode = AppConfig.runMode === "development";
const BaseAxiosApi = getAxiosBase({ baseURL: devMode ? `/api` : AppConfig.baseApi + `/api` });
export default BaseAxiosApi;