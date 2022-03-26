import { StoreResponse } from "model/core/store.model";
import { StoreBankAccountNumberModel } from "model/order/order.model";
import { thirdPLModel } from "model/order/shipment.model";
import { OrderLineItemRequest } from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";

export interface OrderReducerType {
  orderStore: {
    storeDetail: StoreResponse | null,
    storeBankAccountNumbers: StoreBankAccountNumberModel[],
    selectedStoreBankAccount: string |null,
    isShouldSetDefaultStoreBankAccount: boolean,
  },
  shippingServiceConfig: ShippingServiceConfigDetailResponseModel[];
  orderDetail: {
    orderCustomer: CustomerResponse | null;
    orderLineItems: OrderLineItemRequest[];
    thirdPL: thirdPLModel | null;
    isExportBill: boolean,
  },
  isLoadingDiscount: boolean;
}