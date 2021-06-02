import { BootstrapResponse } from "model/response/bootstrap/BootstrapReponse";

export interface BootstrapReducerType {
  isLoad: boolean,
  data: BootstrapResponse|null
}