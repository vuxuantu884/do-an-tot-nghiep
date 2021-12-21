import { Button, Form, Select, Table } from "antd";
import { StoreResponse } from "model/core/store.model";
import { POField } from "model/purchase-order/po-field";

import { POInventoryDraftTable } from "./styles";
import NumberInput from "component/custom/number-input.custom";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import {
  PurchaseProcument,
  PurchaseProcumentLineItem,
  PurchaseProcurementViewDraft,
} from "model/purchase-order/purchase-procument";
import { ICustomTableColumType } from "component/table/CustomTable";
import { AiOutlineClose } from "react-icons/ai";
import CustomDatePicker from "component/custom/date-picker.custom";
import { PlusOutlined } from "@ant-design/icons";
import { useCallback } from "react";
import moment from "moment";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { ProcumentStatus } from "utils/Constants";
import { formatCurrency } from "utils/AppUtils";

type POInventoryDraftProps = {
  stores: Array<StoreResponse>;
  isEdit: boolean;
  formMain: any;
};

const POInventoryDraft: React.FC<POInventoryDraftProps> = (
  props: POInventoryDraftProps
) => {
  const { stores, isEdit, formMain } = props;
  const onAdd = useCallback(() => {
    let procument_items: Array<PurchaseProcurementViewDraft> =
      formMain.getFieldValue(POField.procurements);
    let line_items: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
      POField.line_items
    );
    let new_line_items: Array<PurchaseOrderLineItem> = [];
    line_items.forEach((item) => {
      let index = new_line_items.findIndex((item1) => item1.sku === item.sku);
      if (index === -1) {
        new_line_items.push({ ...item });
      } else {
        new_line_items[index].quantity =
          new_line_items[index].quantity + item.quantity;
      }
    });
    let newProcumentLineItem: Array<PurchaseProcumentLineItem> = [];
    new_line_items.forEach((item) => {
      let total = 0;
      procument_items.forEach((item1) => {
        item1.procurement_items.forEach((procument_item) => {
          if (procument_item.sku === item.sku) {
            total = total + procument_item.quantity;
          }
        });
      });
      newProcumentLineItem.push({
        barcode: item.barcode,
        accepted_quantity: 0,
        code: item.code,
        line_item_id: item.position,
        note: "",
        ordered_quantity: item.quantity,
        planned_quantity: 0,
        quantity: item.quantity - total > 0 ? item.quantity - total : 0,
        real_quantity: 0,
        sku: item.sku,
        variant: item.variant,
        variant_image: item.variant,
      });
    });
    procument_items.push({
      reference: "",
      store_id: procument_items[procument_items.length - 1].store_id,
      expect_receipt_date:
        procument_items[procument_items.length - 1].expect_receipt_date,
      procurement_items: newProcumentLineItem,
      status: ProcumentStatus.DRAFT,
      note: "",
      fake_id: new Date().getTime(),
    });
    formMain.setFieldsValue({
      [POField.procurements]: [...procument_items],
    });
  }, [formMain]);

  const onChangeDate = useCallback(
    (value: string | undefined, index1: number) => {
      let procument_items: Array<PurchaseProcurementViewDraft> =
        formMain.getFieldValue(POField.procurements);
      procument_items[index1].expect_receipt_date = value ? value : "";
      formMain.setFieldsValue({
        [POField.procurements]: [...procument_items],
      });
    },
    [formMain]
  );

  const onChangeStore = useCallback(
    (value: number, index1: number) => {
      let procument_items: Array<PurchaseProcurementViewDraft> =
        formMain.getFieldValue(POField.procurements);
      procument_items[index1].store_id = value;
      formMain.setFieldsValue({
        [POField.procurements]: [...procument_items],
      });
    },
    [formMain]
  );

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

  const deleteProcument = useCallback(
    (index: number) => {
      let procument_items: Array<PurchaseProcurementViewDraft> =
        formMain.getFieldValue(POField.procurements);
      procument_items.splice(index, 1);
      formMain.setFieldsValue({
        [POField.procurements]: [...procument_items],
      });
    },
    [formMain]
  );

  const defaultColumns: Array<
    ICustomTableColumType<PurchaseProcurementViewDraft>
  > = [
      {
        width: 50,
        title: "Stt",
        align: "center",
        render: (value, record, index) => index + 1,
      },
      {
        title: "Cửa hàng nhận",
        dataIndex: "store_id",
        width: 200,
        render: (value, record, index) => (
            <Select
            onChange={(value1: number) => onChangeStore(value1, index)}
            value={value}
            showSearch
            showArrow
            placeholder="Chọn kho nhận"
            optionFilterProp="children"
          >
            {stores.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        ),
      },
      {
        width: 150,
        title: "Ngày nhận dự kiến",
        dataIndex: "expect_receipt_date",
        render: (value, record, index: number) => (
          <CustomDatePicker
            value={value}
            disableDate={(date) => date <= moment().startOf("days")}
            format={DATE_FORMAT.DDMMYYY}
            onChange={(value1) => onChangeDate(value1, index)}
          />
        ),
      },

    ];

  if (!isEdit) {
    return (
      <POInventoryDraftTable>
        <Form.Item
          noStyle
          shouldUpdate={(prev, current) =>
            prev[POField.line_items] !== current[POField.line_items] ||
            prev[POField.procurements] !== current[POField.procurements]
          }
        >
          {({ getFieldValue }) => {
            let line_items: Array<PurchaseOrderLineItem> = getFieldValue(
              POField.line_items
            );
            let procument_items: Array<PurchaseProcurementViewDraft> =
              getFieldValue(POField.procurements);
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
              } else {
                new_line_items[index].quantity =
                  new_line_items[index].quantity + item.quantity;
              }
            });
            new_line_items.forEach((item, indexLineItem) => {
              columns.push({
                width: 100,
                title: () => (
                  <div style={{ textAlign: "center" }}>
                    <div>{item.sku}</div>
                    <div>(SL: {item.quantity})</div>
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
                scroll={{ y: 300, x: 950 }}
                rowKey={(item) => item.id ? item.id : item.fake_id}
                columns={[
                  ...defaultColumns,
                  ...columns,
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
                summary={(data) => {
                  let newTotal: any = {};
                  data.forEach(item => {
                    item.procurement_items.forEach(item => {
                      if (newTotal[item.sku]) {
                        newTotal[item.sku] = newTotal[item.sku] + item.quantity;
                      } else {
                        newTotal[item.sku] = item.quantity
                      }
                    })
                  })
                  return (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell
                          index={0}
                          colSpan={2}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", width: '100%' }}>
                            <Button
                              onClick={onAdd}
                              icon={<PlusOutlined />}
                              type="link"
                            >
                              Thêm kế hoạch
                            </Button>
                            <b>TỔNG</b>
                          </div>

                        </Table.Summary.Cell>
                        <Table.Summary.Cell
                          index={2}
                          colSpan={1}
                        ></Table.Summary.Cell>
                        {
                          new_line_items.map((new_line_items, index) => (
                            <Table.Summary.Cell align="right" index={index + 2}>
                              <div style={{ marginRight: 15 }}>{newTotal[new_line_items.sku]}</div>
                            </Table.Summary.Cell>
                          ))
                        }
                        <Table.Summary.Cell
                          index={3}
                          colSpan={1}
                        />
                      </Table.Summary.Row>
                    </Table.Summary>
                  )
                }}
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
          prev[POField.procurements] !== current[POField.procurements]
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
              width: 90,
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
              ) => formatCurrency(value.find(item1 => item1.sku === item.sku)?.quantity ?? 0,".")
            });
          });
          return (
            <Table
              className="product-table"
              pagination={false}
              scroll={{ y: 300, x: 950 }}
              rowKey={(item) => item.id}
              dataSource={procument_items}
              columns={[
                {
                  width: 50,
                  title: "Stt",
                  align: "center",
                  render: (value, record, index) => index + 1,
                },
                {
                  width: 250,
                  title: "Cửa hàng nhận",
                  dataIndex: "store",
                  render: (value, record, index) => value,
                },
                {
                  width: 150,
                  title: "Ngày nhận dự kiến",
                  dataIndex: "expect_receipt_date",
                  render: (value, record, index: number) =>
                    ConvertUtcToLocalDate(value,DATE_FORMAT.DDMMYYY),
                },
                ...columns,
              ]}
              summary={(data) => {
                let newTotal: any = {};
                data.forEach(item => {
                  item.procurement_items.forEach(item => {
                    if (newTotal[item.sku]) {
                      newTotal[item.sku] = newTotal[item.sku] + item.quantity;
                    } else {
                      newTotal[item.sku] = item.quantity
                    }
                  })
                })
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell
                        index={0}
                        colSpan={2}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: "flex-end", width: '100%' }}>
                          <b>TỔNG</b>
                        </div>

                      </Table.Summary.Cell>
                      <Table.Summary.Cell
                        index={2}
                        colSpan={1}
                      ></Table.Summary.Cell>
                      {
                        new_line_items.map((new_line_items, index) => (
                          <Table.Summary.Cell align="right" index={index + 2}>
                            <div>{formatCurrency(newTotal[new_line_items.sku],".")}</div>
                          </Table.Summary.Cell>
                        ))
                      }
                    </Table.Summary.Row>
                  </Table.Summary>
                )
              }}
            />
          );
        }}
      </Form.Item>
    </POInventoryDraftTable>
  );
};

export default POInventoryDraft;
