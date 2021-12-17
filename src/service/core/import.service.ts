import BaseResponse from "base/base.response";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";

const uploadFileApi= (
  files: File[] | undefined,
  folder: string,
): Promise<BaseResponse<string[]>> => {
  let url = `${ApiConfig.CORE}/upload/file`;
  const formData = new FormData();
  formData.append("folder", folder);

  files?.forEach((file) => {
    formData.append("files", file);
  });
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };
  return BaseAxios.post(url, formData, config);
}


export { uploadFileApi};
