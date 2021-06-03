import { AccountModel } from "./Account/AccountModel";
import { BaseModel } from "./BaseModel";

export interface StoreModel extends BaseModel {
  name: string
  group_id: number;
  accounts: Array<AccountModel>
}
