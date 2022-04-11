import { POLineItemGridSchema, POLineItemGridValue } from 'model/purchase-order/purchase-order.model';
import React, { createContext, ReactNode, useState } from 'react'

export enum QUANTITY_PROCUREMENT_UNIT {
  SL = "SL",
  PERCENT = "PERCENT",
}
/**
 * Lưu state nhập nhanh số lượng từng hàng của bảng NHẬP KHO
 */
export declare type QuickInputQtyProcurementLineItem = Array<{ value: number, unit: QUANTITY_PROCUREMENT_UNIT }>
export declare type QuickInputQtySizesOne = Array<{ size: string, value: number }>;
export declare type QuickInputQtySizesMany = Array<{ sku: string, value: number }>;

type PurchaseOrderCreateAction = {
  // quickInputQtyProcurementLineItem: QuickInputQtyProcurementLineItem,
  // setQuickInputQtyProcurementLineItem: React.Dispatch<React.SetStateAction<QuickInputQtyProcurementLineItem>>,
  isGridMode: boolean,
  setIsGridMode: React.Dispatch<React.SetStateAction<boolean>>,
  poLineItemGridChema: Array<POLineItemGridSchema>,
  setPoLineItemGridChema: React.Dispatch<React.SetStateAction<Array<POLineItemGridSchema>>>,
  poLineItemGridValue: Array<Map<string, POLineItemGridValue>>,
  setPoLineItemGridValue: React.Dispatch<React.SetStateAction<Array<Map<string, POLineItemGridValue>>>>,
  taxRate: number,
  setTaxRate: React.Dispatch<React.SetStateAction<number>>,
  // quickInputProductLineItem:Map<number, number>,
  // setQuickInputProductLineItem: React.Dispatch<React.SetStateAction<Map<number, number>>>
}

export const PurchaseOrderCreateContext = createContext<PurchaseOrderCreateAction>({} as PurchaseOrderCreateAction);

function PurchaseOrderProvider(props: { children: ReactNode }) {
  // mode grid or not
  const [isGridMode, setIsGridMode] = useState(true);

  // quick input qty cho bảng procurement
  // const [quickInputQtyProcurementLineItem, setQuickInputQtyProcurementLineItem] =
  //   useState<QuickInputQtyProcurementLineItem>([{ value: 100, unit: QUANTITY_PROCUREMENT_UNIT.PERCENT }]);

  // Lưu lại giá trị nhập nhanh số lượng sản phẩm trong bảng Sản phẩm (line_items) Map<variantId, quantity> 
  // const [quickInputProductLineItem, setQuickInputProductLineItem] = useState<Map<number, number>>(new Map());

  // schema cho phần nhập nhanh số lượng line item 
  const [poLineItemGridChema, setPoLineItemGridChema] = useState<Array<POLineItemGridSchema>>([]);

  //value để lookup data cho mỗi variant theo màu sắc// Mỗi POLineItemGridValue tương ứng 1 sản phẩm cha
  const [poLineItemGridValue, setPoLineItemGridValue] = useState<Array<Map<string, POLineItemGridValue>>>([]);

  // thuế chung cho các line-item sử dụng bảng grid
  const [taxRate, setTaxRate] = useState<number>(0);

  return (
    <PurchaseOrderCreateContext.Provider
      {...props}
      value={{
        // quickInputQtyProcurementLineItem,
        // setQuickInputQtyProcurementLineItem,
        isGridMode,
        setIsGridMode,
        poLineItemGridChema,
        setPoLineItemGridChema,
        poLineItemGridValue,
        setPoLineItemGridValue,
        taxRate,
        setTaxRate,
        // quickInputProductLineItem,
        // setQuickInputProductLineItem
      }}
    />
  )
}

export default PurchaseOrderProvider