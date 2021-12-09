import BaseAction from "base/base.action";
import { ImportType } from "domain/types/core.type"; 

export const uploadFileAction = (
  files: File[] | undefined,
  folder: string,
  onResult: (res: any) => void
) => {
  return BaseAction(ImportType.UPLOAD_CORE_FILE, { files, folder, onResult });
};