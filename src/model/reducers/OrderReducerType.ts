import { StoreResponse } from "model/core/store.model";
import { StoreBankAccountNumberModel } from "model/order/order.model";

export interface OrderReducerType {
  orderStore: {
    storeDetail: StoreResponse | null,
    storeBankAccountNumbers: StoreBankAccountNumberModel[],
    selectedStoreBankAccount: string |null,
    isShouldSetDefaultStoreBankAccount: boolean,
  },
  orderDetail: {
    isExportBill: boolean,
  }
}