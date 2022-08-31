import { formatCurrency } from "utils/AppUtils";
import { PurchaseProcumentLineItem } from "model/purchase-order/purchase-procument";
import { Store } from "antd/lib/form/interface";
import { AppConfig } from "config/app.config";

export enum StoreName {
  ANH = "YODY KHO TỔNG HT ÁNH",
  TUNG = "YODY KHO TỔNG HT TÙNG",
  HIEU = "YODY KHO TỔNG MT",
}

export const checkStoresEnvironment = () => {
  let stores: Array<Store> = [
    { store_id: 17, store: StoreName.ANH },
    { store_id: 16, store: StoreName.TUNG },
    { store_id: 19, store: StoreName.HIEU },
  ];
  if (AppConfig.ENV === "DEV") {
    stores = [
      { store_id: 363, store: StoreName.ANH },
      { store_id: 364, store: StoreName.TUNG },
      { store_id: 365, store: StoreName.HIEU },
    ];
  } else if (AppConfig.ENV === "UAT") {
    stores = [
      { store_id: 198, store: StoreName.ANH },
      { store_id: 197, store: StoreName.TUNG },
      { store_id: 200, store: StoreName.HIEU },
    ];
  }
  return stores;
};

export const getTotalAcceptedQuantity = (
  procurementItems: Array<PurchaseProcumentLineItem>,
) => {
  let total = 0;
  procurementItems.forEach((item: PurchaseProcumentLineItem) => {
    total = total + item.accepted_quantity;
  });
  return formatCurrency(total);
};

export const getTotalRealQuantity = (
  procurementItems: Array<PurchaseProcumentLineItem>,
) => {
  let total = 0;
  procurementItems.forEach((item: PurchaseProcumentLineItem) => {
    total = total + item.real_quantity;
  });
  return formatCurrency(total);
};
