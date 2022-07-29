import { BaseObject } from "model/base/base.response";

export interface ProductUploadModel extends BaseObject {
  content_type: string;
  name: string;
  path: string;
  size: number;
  extension: string;
}
