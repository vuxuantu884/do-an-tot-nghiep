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
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { ICustomTableColumType } from "component/table/CustomTable";
import { AiOutlineClose } from "react-icons/ai";
import CustomDatePicker from "component/custom/date-picker.custom";
import { PlusOutlined } from "@ant-design/icons";
import { useCallback } from "react";
import moment from "moment";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { POStatus, ProcumentStatus } from "utils/Constants";

type POInventoryDraftProps = {
  stores: Array<StoreResponse>;
  isEdit: boolean;
  formMain: any;
  poData?: PurchaseOrder;
  onCancelPU?: () => void;
  visible?: boolean;
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
    let newProcumentLineItem: Array<PurchaseProcumentLineItem> = [];
    line_items.forEach((item) => {
      let total = 0;
      procument_items.forEach((item1) => {
        item1.procurement_items.forEach((procument_item) => {
          console.log(procument_item);
          if (procument_item.line_item_id === item.position) {
            total = total + procument_item.quantity;
          }
        });
      });
      newProcumentLineItem.push({
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
      status_po: POStatus.DRAFT,
      note: "",
      fake_id: 1,
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
    (value: number | null, indexLineItem: number, indexProcument: number) => {
      let procument_items: Array<PurchaseProcurementViewDraft> =
        formMain.getFieldValue(POField.procurements);
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
    {
      width: 250,
      title: "Cửa hàng nhận",
      dataIndex: "store_id",
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
            line_items.forEach((item, indexLineItem) => {
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
                    value={value[indexLineItem].quantity}
                    onChange={(v) => {
                      onChangeQuantity(v, indexLineItem, indexProcument);
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
                rowKey={(item) => item.fake_id}
                columns={[
                  ...defaultColumns,
                  ...columns,
                  {
                    title: "",
                    fixed: procument_items?.length > 1 && "right",
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
                summary={(data) => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell
                        index={1}
                        colSpan={4 + line_items.length}
                      >
                        <Button
                          onClick={onAdd}
                          icon={<PlusOutlined />}
                          type="link"
                        >
                          Thêm kế hoạch
                        </Button>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
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
           let procument_items: Array<PurchaseProcument> =
           getFieldValue(POField.procurements);
           let line_items: Array<PurchaseOrderLineItem> = getFieldValue(
            POField.line_items
          );
          let columns: Array<
              ICustomTableColumType<PurchaseProcument>
            > = [];
          line_items.forEach((item, indexLineItem) => {
            columns.push({
              width: 90,
              align: 'right',
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
              ) => value[indexLineItem].quantity,
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
                  width: 150,
                  title: "Ngày nhận dự kiến",
                  dataIndex: "expect_receipt_date",
                  render: (value, record, index: number) => (
                    ConvertUtcToLocalDate(value)
                  ),
                },
                {
                  width: 250,
                  title: "Cửa hàng nhận",
                  dataIndex: "store",
                  render: (value, record, index) => (value),
                },
                ...columns
              ]}
            />
          );
        }}
      </Form.Item>
    </POInventoryDraftTable>
  );
};

export default POInventoryDraft;
