import { Button, Form, Table } from "antd";
import CustomDatePicker from "component/custom/date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import { ICustomTableColumType } from "component/table/CustomTable";
import _ from "lodash";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import {
  PurchaseProcument,
  PurchaseProcumentLineItem,
  PurchaseProcurementViewDraft
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { useCallback } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { POInventoryDraftTable } from "./styles";

// const MAX_QTY_INPUT = 999999;
// const MAX_PERCENT_INPUT = 100;

// const OPTIONS_QUANTITY_PROCUREMENT_UNIT = [
//   {
//     value: QUANTITY_PROCUREMENT_UNIT.SL,
//     label: "SL",
//   },
//   {
//     value: QUANTITY_PROCUREMENT_UNIT.PERCENT,
//     label: "%",
//   }
// ];

type POInventoryDraftProps = {
  stores: Array<StoreResponse>;
  isEdit: boolean;
  formMain: any;
};

const POInventoryDraft: React.FC<POInventoryDraftProps> = (
  props: POInventoryDraftProps
) => {
  const { isEdit, formMain } = props;
  //state để lưu dữ liệu nhập nhanh cho 1 dòng procuments. vì là dữ liệu trung gian, nên không cần lưu trong form data
  // const { quickInputQtyProcurementLineItem, setQuickInputQtyProcurementLineItem } = useContext(PurchaseOrderCreateContext);

  // Lưu lại storeId lần chọn cuối để làm giá trị mặc định cho lần sau thao tác
  // const [storeIdLastest, setStoreIdLastest] = useLocalStorage<number>(STORE_ID_PROCUREMENT_LASTEST_KEY);

  // const onAdd = () => {
  //   let procument_items: Array<PurchaseProcurementViewDraft> =
  //     formMain.getFieldValue(POField.procurements);
  //   let line_items: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
  //     POField.line_items
  //   );
  //   let new_line_items: Array<PurchaseOrderLineItem> = [];
  //   line_items.forEach((item) => {
  //     let index = new_line_items.findIndex((item1) => item1.sku === item.sku);
  //     if (index === -1) {
  //       new_line_items.push({ ...item });
  //     } else {
  //       new_line_items[index].quantity =
  //         new_line_items[index]?.quantity + item?.quantity;
  //     }
  //   });
  //   let newProcumentLineItem: Array<PurchaseProcumentLineItem> = [];
  //   new_line_items.forEach((item) => {
  //     let total = 0;
  //     procument_items.forEach((item1) => {
  //       item1.procurement_items.forEach((procument_item) => {
  //         if (procument_item.sku === item.sku) {
  //           total = total + procument_item?.quantity;
  //         }
  //       });
  //     });
  //     newProcumentLineItem.push({
  //       barcode: item.barcode,
  //       accepted_quantity: 0,
  //       code: item.code,
  //       line_item_id: item.position,
  //       note: "",
  //       ordered_quantity: item.quantity,
  //       planned_quantity: 0,
  //       quantity: 0,
  //       real_quantity: 0,
  //       sku: item.sku,
  //       variant: item.variant,
  //       variant_image: item.variant,
  //     });
  //   });
  //   procument_items.push({
  //     reference: "",
  //     store_id: storeIdLastest,
  //     expect_receipt_date:
  //       procument_items[procument_items.length - 1].expect_receipt_date,
  //     procurement_items: newProcumentLineItem,
  //     status: ProcumentStatus.DRAFT,
  //     note: "",
  //     fake_id: new Date().getTime(),
  //   });
  //   formMain.setFieldsValue({
  //     [POField.procurements]: [...procument_items],
  //   });

  //   // thêm giá trị cho state nhập nhanh số lượng tại bảng Nhập kho
  //   setQuickInputQtyProcurementLineItem((prev) => {
  //     prev.push({
  //       unit: QUANTITY_PROCUREMENT_UNIT.PERCENT,
  //       value: 100,
  //     });
  //     return [...prev];
  //   });
  // }


  // const onChangeStore = (value: number, index1: number) => {
  //   const procument_items: Array<PurchaseProcurementViewDraft> =
  //     formMain.getFieldValue(POField.procurements);
  //   procument_items[index1].store_id = value;
  //   formMain.setFieldsValue({
  //     [POField.procurements]: [...procument_items],
  //   });
  //   // lưu lại storeId lần chọn cuối để làm giá trị mặc định cho lần sau thao tác
  //   setStoreIdLastest(value);
  // };

  const onChangeQuantity = useCallback(
    (value: number | null, sku: string, indexProcument: number) => {
      let procument_items: Array<PurchaseProcurementViewDraft> =
        formMain.getFieldValue(POField.procurements);
      let indexLineItem = procument_items[indexProcument].procurement_items.findIndex((item) => item.sku === sku);
      procument_items[indexProcument].procurement_items[
        indexLineItem
      ].quantity = value ? value : 0;
      formMain.setFieldsValue({
        [POField.procurements]: [...procument_items],
      });
    },
    [formMain]
  );

  const deleteProcument = (index: number) => {
    const procument_items: Array<PurchaseProcurementViewDraft> =
      formMain.getFieldValue(POField.procurements);
    procument_items.splice(index, 1);
    formMain.setFieldsValue({
      [POField.procurements]: [...procument_items],
    });

    // Xoá dòng này trong quickInputQtyProcurementLineItem
    // const newInputValues = quickInputQtyProcurementLineItem
    //   .filter((item, inputIndex: number) => inputIndex !== index);

    // setQuickInputQtyProcurementLineItem(newInputValues);
  };

  // const handleChangeQuantityLineItemProcument =useCallback((value: number, index: number, unit?: QUANTITY_PROCUREMENT_UNIT) => {
  //   // nếu không truyển unit thì lấy unit hiện tại của dòng nhập nhanh
  //   unit = unit ? unit : quickInputQtyProcurementLineItem[index].unit;
  //   // set lại giá trị cho dòng nhập nhanh
  //   quickInputQtyProcurementLineItem[index].value = value;
  //   setQuickInputQtyProcurementLineItem([...quickInputQtyProcurementLineItem]);

  //   const procurements: Array<PurchaseProcurementViewDraft> =
  //     formMain.getFieldValue(POField.procurements)

  //   /**
  //    * Case SL : set quantity cho dòng nhập nhanh
  //    */
  //   if (unit === QUANTITY_PROCUREMENT_UNIT.SL) {
  //     procurements[index].procurement_items.forEach((item) => {
  //       item.quantity = value;
  //     });

  //   } else if (unit === QUANTITY_PROCUREMENT_UNIT.PERCENT) {
  //     /**
  //      * Case % : set quantity * % cho dòng nhập nhanh
  //      */
  //     procurements[index].procurement_items.forEach((item: PurchaseOrderLineItemDraft) => {
  //       // lấy giá nhập SL từ bảng product * %        
  //       if(item.id && quickInputProductLineItem.get(item.id)){
  //         const qtyOfSize = quickInputProductLineItem.get(item.id) || 0;
  //         item.quantity = Math.round(value * qtyOfSize / 100);
  //       }else{
  //         item.quantity = 0;
  //       }
  //     });
  //   }
  //   formMain.setFieldsValue({
  //     [POField.procurements]: [...procurements],
  //   });
  // },[quickInputProductLineItem, formMain, quickInputQtyProcurementLineItem, setQuickInputQtyProcurementLineItem]);

  // const handleChangeUnitLineItemProcument = (unit: QUANTITY_PROCUREMENT_UNIT, index: number) => {

  //   setQuickInputQtyProcurementLineItem((prevState) => {
  //     prevState[index].unit = unit;
  //     return [...prevState];
  //   });

  //   handleChangeQuantityLineItemProcument(quickInputQtyProcurementLineItem[index].value, index, unit);
  // }

  const defaultColumns: Array<
    ICustomTableColumType<PurchaseProcurementViewDraft>
  > = [
      // {
      //   width: 50,
      //   title: "STT",
      //   align: "center",
      //   render: (value, record, index) => index + 1,
      // },
      {
        title: "Kho nhận",
        dataIndex: "store_id",
        width: 200,
        render: (value, record, index) => (
          // <Select
          //   onChange={(value1: number) => onChangeStore(value1, index)}
          //   value={value}
          //   showSearch
          //   showArrow
          //   placeholder="Chọn kho nhận"
          //   optionFilterProp="children"
          // >
          //   {stores.map((item) => (
          //     <Select.Option key={item.id} value={item.id}>
          //       {item.name}
          //     </Select.Option>
          //   ))}
          // </Select>
          "YD KHO TỔNG"
        ),
      },
      {
        width: 150,
        title: "Ngày nhận dự kiến",
        dataIndex: "expect_receipt_date",
        render: (value, record, index: number) => (
          <Form.Item label=""
            name={[POField.procurements, index, POField.expect_receipt_date]}
            rules={[{
              required: true,
              message: "Vui lòng nhập ngày nhận dự kiến",
            }]}
            help={false}
            style={{ marginBottom: 0 }}
          >
            <CustomDatePicker
              value={value}
              disableDate={(date) => date <= moment().startOf("days")}
              format={DATE_FORMAT.DDMMYYY}
            />
          </Form.Item>
        ),
      },
      // {
      //   title: "Phân bổ",
      //   width: 150,
      //   render: (value, record, index) => {
      //     /**
      //      * Chỗ này lưu bằng contextApi để gửi qua lại các cpn trong màn tạo PO,
      //      * vì không cần gửi lên server và cái form data hiện tại quá phức tạp nên không lưu bằng Form value
      //      */
      //     //tìm số item còn thiếu và thêm giá trị mặc định vào
      //     const tempsQuickInputQty = [...quickInputQtyProcurementLineItem];

      //     if (quickInputQtyProcurementLineItem.length - 1 < index) {
      //       const diffLength = index + 1 - quickInputQtyProcurementLineItem.length;
      //       for (let i = 0; i < diffLength; i++) {
      //         tempsQuickInputQty.push({ unit: QUANTITY_PROCUREMENT_UNIT.PERCENT, value: 100 });
      //       }
      //     }
      //     return <Input.Group compact>
      //       <NumberInput
      //         value={quickInputQtyProcurementLineItem[index].value}
      //         onChange={(e) => handleChangeQuantityLineItemProcument(e || 0, index)}
      //         style={{ width: "calc(100% - 50px)" }}
      //         min={0}
      //         maxLength={MAX_QTY_INPUT.toString().length}
      //         max={quickInputQtyProcurementLineItem[index].unit === QUANTITY_PROCUREMENT_UNIT.SL ? MAX_QTY_INPUT : MAX_PERCENT_INPUT}
      //       />
      //       <Select
      //         style={{ borderRadius: "0px", width: "50px" }}
      //         showArrow={false}
      //         value={quickInputQtyProcurementLineItem[index].unit}
      //         onChange={(value: QUANTITY_PROCUREMENT_UNIT) => handleChangeUnitLineItemProcument(value, index)}
      //       >
      //         {OPTIONS_QUANTITY_PROCUREMENT_UNIT.map((item) => (
      //           <Select.Option value={item.value} key={item.value}>
      //             {item.label}
      //           </Select.Option>
      //         ))}

      //       </Select>
      //     </Input.Group>
      //   },
      // }
    ];

  if (!isEdit) {
    return (
      <POInventoryDraftTable>
        <Form.Item
          noStyle
          shouldUpdate={(prev, current) =>
            JSON.stringify(prev[POField.line_items]) !== JSON.stringify(current[POField.line_items]) ||
            prev[POField.procurements] !== current[POField.procurements]
          }
        >
          {({ getFieldValue }) => {
            let line_items: Array<PurchaseOrderLineItem> = getFieldValue(
              POField.line_items
            );
            let procument_items: Array<PurchaseProcurementViewDraft> =
              getFieldValue(POField.procurements) || [];
            let columns: Array<
              ICustomTableColumType<PurchaseProcurementViewDraft>
            > = [];
            let new_line_items: Array<PurchaseOrderLineItem> = [];
            line_items.forEach((item) => {
              let index = new_line_items.findIndex(
                (item1) => item1.sku === item.sku
              );
              if (index === -1) {
                new_line_items.push({ ...item });
              }
              else {
                // new_line_items[index].quantity =
                //   new_line_items[index]?.quantity + item?.quantity;
              }
            });

            new_line_items.forEach((item, indexLineItem) => {
              columns.push({
                width: 100,
                title: () => (
                  <div style={{ textAlign: "center" }}>
                    <div>{item.sku}</div>
                    {/* <div>(SL: {item?.quantity})</div> */}
                  </div>
                ),
                dataIndex: "procurement_items",
                render: (
                  value: Array<PurchaseProcumentLineItem>,
                  record,
                  indexProcument
                ) => (
                  <NumberInput
                    placeholder="Số lượng"
                    value={value.find(item1 => item1.sku === item.sku)?.quantity}
                    onChange={(v) => {
                      onChangeQuantity(v, item.sku, indexProcument);
                    }}
                  />
                ),
              });
            });

            return (
              <Table
                className="product-table"
                pagination={false}
                rowKey={(item) => item.id ? item.id : item.fake_id}
                columns={[
                  ...defaultColumns,
                  // ...columns,
                  {
                    title: "",
                    // fixed: procument_items?.length > 0 && "right",
                    width: 40,
                    render: (value: string, item, index: number) =>
                      procument_items.length > 1 && (
                        <Button
                          onClick={() => deleteProcument(index)}
                          className="product-item-delete"
                          icon={<AiOutlineClose />}
                        />
                      ),
                  },
                ]}
                dataSource={procument_items}
              // summary={(data) => {
              //   let newTotal: any = {};
              //   data.forEach(item => {
              //     item.procurement_items.forEach(item => {
              //       if (newTotal[item.sku]) {
              //         newTotal[item.sku] = newTotal[item.sku] + item.quantity;
              //       } else {
              //         newTotal[item.sku] = item.quantity
              //       }
              //     })
              //   })
              //   return (
              //     <Table.Summary>
              //       <Table.Summary.Row>
              //         <Table.Summary.Cell
              //           index={4}
              //           colSpan={4}
              //         >
              //           <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", width: '100%' }}>
              //             <Button
              //               onClick={onAdd}
              //               icon={<PlusOutlined />}
              //               type="link"
              //             >
              //               Thêm kế hoạch
              //             </Button>
              //             <b>TỔNG</b>
              //           </div>

              //         </Table.Summary.Cell>
              //         {
              //           new_line_items.map((new_line_items, index) => (
              //             <Table.Summary.Cell align="right" index={index + 4} key={new_line_items.sku}>
              //               <div style={{ marginRight: 15 }}>{newTotal[new_line_items.sku]}</div>
              //             </Table.Summary.Cell>
              //           ))
              //         }
              //         <Table.Summary.Cell
              //           index={3}
              //           colSpan={1}
              //         />
              //       </Table.Summary.Row>
              //     </Table.Summary>
              //   )
              // }}
              />
            );
          }}
        </Form.Item>
      </POInventoryDraftTable>
    );
  }
  return (
    <POInventoryDraftTable>
      <Form.Item
        noStyle
        shouldUpdate={(prev, current) =>
          _.isEqual(prev[POField.procurements], current[POField.procurements])
        }
      >
        {({ getFieldValue }) => {
          const procument_items: Array<PurchaseProcument> = getFieldValue(
            POField.procurements
          );
          return (<div>
            <p>Cửa hàng nhận : <b>{procument_items?.length > 0 && procument_items[0] ? procument_items[0].store : "-"}</b> </p>
            <p>Ngày nhận dự kiến: <b>{procument_items?.length > 0 && procument_items[0] ? ConvertUtcToLocalDate(procument_items[0].expect_receipt_date, DATE_FORMAT.DDMMYYY) : "-"}</b></p>
          </div>)
        }}
      </Form.Item>
      {/* <Form.Item
        noStyle
        shouldUpdate={(prev, current) =>
          _.isEqual(prev[POField.procurements], current[POField.procurements])
        }
      >
        {({ getFieldValue }) => {
          let procument_items: Array<PurchaseProcument> = getFieldValue(
            POField.procurements
          );
          let line_items: Array<PurchaseOrderLineItem> = getFieldValue(
            POField.line_items
          );
          let new_line_items: Array<PurchaseOrderLineItem> = [];
          line_items.forEach((item) => {
            let index = new_line_items.findIndex(
              (item1) => item1.sku === item.sku
            );
            if (index === -1) {
              new_line_items.push({ ...item });
            } else {
              new_line_items[index].quantity =
                new_line_items[index].quantity + item.quantity;
            }
          });

          let columns: Array<ICustomTableColumType<PurchaseProcument>> = [];
          new_line_items.forEach((item, indexLineItem) => {
            columns.push({
              width: 100,
              align: "right",
              title: () => (
                <div style={{ textAlign: "right" }}>
                  <div>{item.sku}</div>
                  <div>(SL: {item.quantity})</div>
                </div>
              ),
              dataIndex: "procurement_items",
              render: (
                value: Array<PurchaseProcumentLineItem>,
                record,
                indexProcument
              ) => formatCurrency(value.find(item1 => item1.sku === item.sku)?.quantity ?? 0, ".")
            });
          });
          return (
            <Table
              className="product-table"
              pagination={false}
              // scroll={{ y: 400, x: 950 }}
              rowKey={(item) => item.id}
              dataSource={procument_items}
              columns={[
                // {
                //   width: 50,
                //   title: "STT",
                //   align: "center",
                //   fixed: "left",
                //   render: (value, record, index) => index + 1,
                // },
                {
                  width: 150,
                  title: "Cửa hàng nhận",
                  dataIndex: "store",
                  fixed: "left",
                  render: (value, record, index) => value,
                },
                {
                  width: 110,
                  title: "Ngày nhận dự kiến",
                  dataIndex: "expect_receipt_date",
                  fixed: "left",
                  render: (value, record, index: number) =>
                    ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY),
                },
                // ...columns,
              ]}
              // summary={(data) => {
              //   let newTotal: any = {};
              //   data.forEach(item => {
              //     item.procurement_items.forEach(item => {
              //       if (newTotal[item.sku]) {
              //         newTotal[item.sku] = newTotal[item.sku] + item.quantity;
              //       } else {
              //         newTotal[item.sku] = item.quantity
              //       }
              //     })
              //   })
              //   return (
              //     <Table.Summary fixed>
              //       <Table.Summary.Row>
              //         <Table.Summary.Cell
              //           index={0}
              //           colSpan={3}
              //         >
              //           <div style={{ textAlign: "center" }}>
              //             <b>TỔNG</b>
              //           </div>
              //         </Table.Summary.Cell>
              //         {
              //           new_line_items.map((new_line_items, index) => (
              //             <Table.Summary.Cell align="right" index={index + 3} key={new_line_items.barcode}>
              //               <div>{formatCurrency(newTotal[new_line_items.sku], ".")}</div>
              //             </Table.Summary.Cell>
              //           ))
              //         }
              //       </Table.Summary.Row>
              //     </Table.Summary>
              //   )
              // }}
            />
          );
        }}
      </Form.Item> */}
    </POInventoryDraftTable>
  );
};

export default POInventoryDraft;
