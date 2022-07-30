import { useFetchMerchans } from "hook/useFetchMerchans";
import {
  POLineItemGridSchema,
  POLineItemGridValue,
  PurchaseOrder,
} from "model/purchase-order/purchase-order.model";
import React, { createContext, ReactNode, useState } from "react";

export enum QUANTITY_PROCUREMENT_UNIT {
  SL = "SL",
  PERCENT = "PERCENT",
}
/**
 * Lưu state nhập nhanh số lượng từng hàng của bảng NHẬP KHO
 */
export declare type QuickInputQtyProcurementLineItem = Array<{
  value: number;
  unit: QUANTITY_PROCUREMENT_UNIT;
}>;
export declare type QuickInputQtySizesOne = Array<{ size: string; value: number }>;
export declare type QuickInputQtySizesMany = Array<{ sku: string; value: number }>;

type PurchaseOrderCreateAction = {
  isGridMode: boolean;
  setIsGridMode: React.Dispatch<React.SetStateAction<boolean>>;
  poLineItemGridChema: Array<POLineItemGridSchema>;
  setPoLineItemGridChema: React.Dispatch<React.SetStateAction<Array<POLineItemGridSchema>>>;
  poLineItemGridValue: Array<Map<string, POLineItemGridValue>>;
  setPoLineItemGridValue: React.Dispatch<
    React.SetStateAction<Array<Map<string, POLineItemGridValue>>>
  >;
  taxRate: number;
  setTaxRate: React.Dispatch<React.SetStateAction<number>>;
  fetchMerchandiser: ReturnType<typeof useFetchMerchans>;
  fetchDesigner: ReturnType<typeof useFetchMerchans>;
  purchaseOrder: PurchaseOrder;
  setPurchaseOrder: React.Dispatch<React.SetStateAction<PurchaseOrder>>;
};

export const PurchaseOrderCreateContext = createContext<PurchaseOrderCreateAction>(
  {} as PurchaseOrderCreateAction,
);

function PurchaseOrderProvider(props: { children: ReactNode }) {
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>({} as PurchaseOrder);
  // mode grid or not
  const [isGridMode, setIsGridMode] = useState(true);

  // schema cho phần nhập nhanh số lượng line item
  const [poLineItemGridChema, setPoLineItemGridChema] = useState<Array<POLineItemGridSchema>>([]);

  //value để lookup data cho mỗi variant theo màu sắc// Mỗi POLineItemGridValue tương ứng 1 sản phẩm cha
  const [poLineItemGridValue, setPoLineItemGridValue] = useState<
    Array<Map<string, POLineItemGridValue>>
  >([]);

  // thuế chung cho các line-item sử dụng bảng grid
  const [taxRate, setTaxRate] = useState<number>(0);

  const fetchMerchandiser = useFetchMerchans();

  const fetchDesigner = useFetchMerchans();

  return (
    <PurchaseOrderCreateContext.Provider
      {...props}
      value={{
        isGridMode,
        setIsGridMode,
        poLineItemGridChema,
        setPoLineItemGridChema,
        poLineItemGridValue,
        setPoLineItemGridValue,
        taxRate,
        setTaxRate,
        fetchMerchandiser,
        fetchDesigner,
        purchaseOrder,
        setPurchaseOrder,
      }}
    />
  );
}

export default PurchaseOrderProvider;
