import { AccountModel } from "../Account/AccountModel";
import { BaseModel } from "../base-model";

export interface StoreModel extends BaseModel {
  name: string
  group_id: number;
  accounts: Array<AccountModel>
}
