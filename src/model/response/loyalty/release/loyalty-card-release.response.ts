import { BaseObject } from "model/base/base.response";

export interface LoyaltyCardReleaseResponse extends BaseObject {
  name: string
  file: string
  errors: string
  status: string
  success: number
  fail: number
  file_path: string
}