import { BootstrapResponse } from "model/content/bootstrap.model";

export interface BootstrapReducerType {
  isLoad: boolean;
  data: BootstrapResponse | null;
}
