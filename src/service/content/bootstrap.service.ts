import BaseAxios from "base/base.axios";
import BaseResponse from "base/base.response";
import { ApiConfig } from "config/api.config";
import { BootstrapResponse } from "model/content/bootstrap.model";

const getBootsrapAPI = (): Promise<BaseResponse<BootstrapResponse>> => {
  let url = `${ApiConfig.CONTENT}/common/enums`;
  return BaseAxios.get(url);
};

export { getBootsrapAPI };
