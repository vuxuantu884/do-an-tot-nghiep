import { PurchaseOrderReturn } from "model/purchase-order/purchase-order.model";
import { PurchaseOrderLineReturnItem } from "model/purchase-order/purchase-item.model";
import { formatCurrency } from "utils/AppUtils";

export const getTotalQuantityReturn = (poReturnList: Array<PurchaseOrderReturn>) => {
  let total = 0;
  poReturnList.forEach((item: PurchaseOrderReturn) => {
    item.line_return_items.forEach((el: PurchaseOrderLineReturnItem) => {
      total += el.quantity_return;
    });
  });
  return formatCurrency(total);
};

export const POReturnFilterField = {
  info: "info",
  merchandisers: "merchandisers",
  supplier_ids: "supplier_ids",
  store_ids: "store_ids",
};

export const filterPOReturnFieldsMapping = {
  [POReturnFilterField.info]: "Thông tin tìm kiếm",
  [POReturnFilterField.merchandisers]: "Merchandisers",
  [POReturnFilterField.supplier_ids]: "Nhà cung cấp",
  [POReturnFilterField.store_ids]: "Kho trả hàng",
};
