import { FormInstance } from "antd/es/form/Form";
import { EnumOptionValueOrPercent } from "config/enum.config";
import { useFetchMerchans } from "hook/useFetchMerchans";
import { groupBy } from "lodash";
import { ProcurementLineItemField } from "model/procurement/field";
import { POLineItemType, PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import {
  PODataSourceGrid,
  POExpectedDate,
  POLineItemGridSchema,
  POLineItemGridValue,
  ProcurementTable,
  PurchaseOrder,
} from "model/purchase-order/purchase-order.model";
import {
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import React, { createContext, ReactNode, useState } from "react";
import { ProcurementStatus } from "utils/Constants";
import { v4 as uuidv4 } from "uuid";

export enum QUANTITY_PROCUREMENT_UNIT {
  SL = "SL",
  PERCENT = "PERCENT",
}

export const INITIAL_EXPECTED_DATE: POExpectedDate[] = [
  {
    date: "",
    value: 0,
    option: EnumOptionValueOrPercent.PERCENT,
  },
];
/**
 * Lưu state nhập nhanh số lượng từng hàng của bảng NHẬP KHO
 */
export declare type QuickInputQtyProcurementLineItem = Array<{
  value: number;
  unit: QUANTITY_PROCUREMENT_UNIT;
}>;
export declare type QuickInputQtySizesOne = Array<{
  size: string;
  value: number;
}>;
export declare type QuickInputQtySizesMany = Array<{
  sku: string;
  value: number;
}>;

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
  procurementTableData: Array<PODataSourceGrid>;
  setProcurementTableData: React.Dispatch<React.SetStateAction<Array<PODataSourceGrid>>>;
  expectedDate: Array<POExpectedDate>;
  setExpectedDate: React.Dispatch<React.SetStateAction<Array<POExpectedDate>>>;
  procurementsAll: Array<PurchaseProcument[]>;
  setProcurementsAll: React.Dispatch<React.SetStateAction<Array<PurchaseProcument[]>>>;
  procurementTable: Array<ProcurementTable>;
  setDisabledDate: React.Dispatch<React.SetStateAction<boolean>>;
  disabledDate: boolean;
  setProcurementTable: React.Dispatch<React.SetStateAction<Array<ProcurementTable>>>;
  handleSetProcurementTableContext: (
    procurements: PurchaseProcument[],
    line_items: PurchaseOrderLineItem[],
    procurementsAll: Array<PurchaseProcument[]>,
  ) => void;
  handleChangeProcument: (formMain: FormInstance<any>) => void;
  handleSortProcurements: (procurements: PurchaseProcument[]) => PurchaseProcument[];
};

export const PurchaseOrderCreateContext = createContext<PurchaseOrderCreateAction>(
  {} as PurchaseOrderCreateAction,
);

function PurchaseOrderProvider(props: { children: ReactNode }) {
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder>({} as PurchaseOrder);
  const [procurementTableData, setProcurementTableData] = useState<Array<PODataSourceGrid>>([]);
  const [expectedDate, setExpectedDate] = useState<Array<POExpectedDate>>([
    ...INITIAL_EXPECTED_DATE,
  ]);
  // mode grid or not
  const [isGridMode, setIsGridMode] = useState(true);
  const [disabledDate, setDisabledDate] = useState<boolean>(false);

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

  const [procurementsAll, setProcurementsAll] = useState<Array<PurchaseProcument[]>>([]);

  const [procurementTable, setProcurementTable] = useState<Array<ProcurementTable>>([]);

  const handleSetProcurementTableContext = (
    procurements: PurchaseProcument[],
    line_items: PurchaseOrderLineItem[],
    procurementsAll: Array<PurchaseProcument[]>,
  ) => {
    if (procurements.length > 0 && procurements[0].procurement_items.length > 0) {
      const procurementItems = line_items as any[];
      const procurementTable: ProcurementTable[] = procurementItems.map((procurementItem) => {
        const quantityLineItems = procurementItems
          .filter((item) => item.sku === procurementItem.sku)
          .reduce((total, element) => total + element.quantity, 0);
        const plannedQuantities = procurementsAll.map((procurementAll) => {
          const procurementItemByVariantId = procurementAll
            .reduce(
              (acc, val) => acc.concat(val.procurement_items),
              [] as Array<PurchaseProcumentLineItem>,
            )
            .filter((item) => item.sku === procurementItem.sku);
          let plannedQuantity = NaN;
          if (procurementItemByVariantId.length) {
            plannedQuantity = procurementItemByVariantId.reduce(
              (total, element) => total + element?.planned_quantity || 0,
              0,
            );
          }
          return plannedQuantity;
        });
        const realQuantities = procurementsAll.map((procurementAll) => {
          const procurementItemByVariantId = procurementAll
            .reduce(
              (acc, val) => acc.concat(val.procurement_items),
              [] as Array<PurchaseProcumentLineItem>,
            )
            .filter((item) => item.sku === procurementItem.sku);

          let realQuantity = NaN;
          if (procurementItemByVariantId.length) {
            realQuantity = procurementItemByVariantId.reduce(
              (total, element) => total + element?.real_quantity || 0,
              0,
            );
          }
          return realQuantity;
        });

        const uuids = groupBy(
          procurementsAll.reduce((acc, val) => acc.concat(val)),
          "uuid",
        );
        const procurementItemIndex = procurements[0].procurement_items.findIndex(
          (item) => item.sku === procurementItem.sku,
        );
        if (procurementItemIndex === -1) {
          return {
            quantityLineItems,
            plannedQuantities,
            realQuantities,
            ...procurementItem,
            uuids: Object.keys(uuids),
          };
        }
        return {
          quantityLineItems,
          plannedQuantities,
          realQuantities,
          ...procurements[0].procurement_items[procurementItemIndex],
          uuids: Object.keys(uuids),
        };
      });
      setProcurementTable(procurementTable);
    }
  };

  const handleChangeProcument = (formMain: FormInstance<any>) => {
    const procurements: PurchaseProcument[] =
      (formMain.getFieldsValue()?.procurements as PurchaseProcument[]) || [];
    const lineItems: PurchaseOrderLineItem[] =
      (formMain.getFieldsValue()?.line_items as PurchaseOrderLineItem[]) || [];
    let lineItemsBackUp = JSON.parse(JSON.stringify(lineItems)) as PurchaseOrderLineItem[];
    const procurementsBackUp = procurements.map((procurement) => {
      procurement.procurement_items.forEach((procurementItem, indexProcurementItem) => {
        const indexLineItem = lineItems.findIndex(
          (lineItem) => lineItem.sku === procurementItem.sku,
        );
        if (indexLineItem === -1) {
          procurement.procurement_items.splice(indexProcurementItem, 1);
        } else {
          lineItemsBackUp = lineItemsBackUp.filter(
            (lineItemBackUp) => lineItemBackUp.sku !== procurementItem.sku,
          );
        }
      });
      return {
        ...procurement,
        procurement_items: procurement.procurement_items,
      };
    });
    const procurementsResult: PurchaseProcument[] = procurementsBackUp.map((procurement, index) => {
      const procurementItem: PurchaseProcumentLineItem[] = lineItemsBackUp.map((lineItem) => {
        return {
          accepted_quantity: 0,
          line_item_id: lineItem.id || 0,
          amount: lineItem.amount,
          barcode: lineItem.barcode,
          note: "",
          ordered_quantity: 0,
          planned_quantity: 0,
          price: lineItem.price,
          product_name: lineItem.product,
          quantity: 0,
          real_quantity: 0,
          retail_price: lineItem.retail_price,
          sku: lineItem.sku,
          variant: lineItem.variant,
          variant_id: lineItem.variant_id,
          variant_image: lineItem.variant_image,
          id: procurement.uuid ? procurement.uuid : uuidv4() + index.toString(),
          percent: procurement.percent,
        };
      });
      if (procurement.status !== ProcurementStatus.draft) {
        return {
          ...procurement,
          procurement_items: [...procurement.procurement_items],
        };
      }
      return {
        ...procurement,
        procurement_items: [...procurement.procurement_items, ...procurementItem],
      };
    });
    const procurementsFilter = groupBy(
      procurementsResult,
      ProcurementLineItemField.expect_receipt_date,
    );
    const procurementsAllResult: Array<PurchaseProcument[]> = Object.values(procurementsFilter).map(
      (procurementAll, indexProcurementAll) => {
        const uuid = uuidv4();
        return [
          ...procurementAll.map((item) => {
            return {
              ...item,
              uuid: uuid,
              percent: item?.percent || 0,
              procurement_items: [
                ...item.procurement_items.map((procurementItem) => {
                  return {
                    ...procurementItem,
                    percent: item?.percent,
                    uuid: uuid + indexProcurementAll,
                  };
                }),
              ],
            };
          }),
        ];
      },
    );
    const procurementsForm: PurchaseProcument[] = [];
    procurementsAllResult.forEach((procurementsResult) => {
      procurementsResult.forEach((item) => {
        procurementsForm.push(item);
      });
    });
    formMain.setFieldsValue({
      procurements: procurementsForm,
    });
    setProcurementsAll([...procurementsAllResult]);
    handleSetProcurementTableContext(procurementsResult, lineItems, procurementsAllResult);
  };

  const handleSortProcurements = (procurements: PurchaseProcument[]) => {
    procurements.sort((pre, next) => {
      if (!pre.expect_receipt_date || !next.expect_receipt_date) return 0;
      const preDate = new Date(moment(pre.expect_receipt_date).format("MM-DD-YYYY"));
      const nextDate = new Date(moment(next.expect_receipt_date).format("MM-DD-YYYY"));
      return preDate.getTime() - nextDate.getTime() >= 0 ? 1 : -1;
    });
    return procurements;
  };

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
        procurementTableData,
        setProcurementTableData,
        expectedDate,
        setExpectedDate,
        procurementsAll,
        setProcurementsAll,
        procurementTable,
        setProcurementTable,
        handleSetProcurementTableContext,
        handleChangeProcument,
        handleSortProcurements,
        disabledDate,
        setDisabledDate,
      }}
    />
  );
}

export default PurchaseOrderProvider;
