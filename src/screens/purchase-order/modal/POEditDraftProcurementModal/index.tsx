import { PlusOutlined } from "@ant-design/icons";
import { Table, Modal, Button, Select } from "antd";
import CustomDatePicker from "component/custom/date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import { ICustomTableColumType } from "component/table/CustomTable";
import { StoreResponse } from "model/core/store.model";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import {
  PurchaseProcumentLineItem,
  PurchaseProcurementViewDraft,
} from "model/purchase-order/purchase-procument";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { POInventoryDraftTable } from "screens/purchase-order/component/po-inventory/POInventoryDraft/styles";
import { ProcumentStatus } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";

type ProcurementModalProps = {
  visible?: boolean;
  onCancel?: () => void;
  onOk: (value: Array<PurchaseProcurementViewDraft>) => void;
  lineItems: Array<PurchaseOrderLineItem>;
  dataSource: Array<PurchaseProcurementViewDraft>;
  stores: Array<StoreResponse>;
  confirmLoading: boolean,
};

const POEditDraftProcurementModal: React.FC<ProcurementModalProps> = (
  props: ProcurementModalProps
) => {
  const { visible, onCancel, dataSource, onOk } = props;
  const [procumentViewDraft, setProcumentViewDraft] = useState<
    Array<PurchaseProcurementViewDraft>
  >([]);
  const defaultColumns: Array<
    ICustomTableColumType<PurchaseProcurementViewDraft>
  > = [
      {
        width: 50,
        title: "Stt",
        align: "center",
        fixed: true,
        render: (value, record, index) => index + 1,
      },
      {
        width: 250,
        title: "Cửa hàng nhận",
        fixed: true,
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
            {props.stores.map((item) => (
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

  const onAdd = useCallback(() => {
    let new_line_items: Array<PurchaseOrderLineItem> = [];
    props.lineItems.forEach((item) => {
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
      procumentViewDraft.forEach((item1) => {
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
    procumentViewDraft.push({
      reference: "",
      store_id: procumentViewDraft[procumentViewDraft.length - 1].store_id,
      expect_receipt_date:
        procumentViewDraft[procumentViewDraft.length - 1].expect_receipt_date,
      procurement_items: newProcumentLineItem,
      status: ProcumentStatus.DRAFT,
      note: "",
      fake_id: new Date().getTime(),
    });
    setProcumentViewDraft([...procumentViewDraft]);
  }, [procumentViewDraft, props.lineItems]);

  const onChangeDate = useCallback(
    (value: string | undefined, index1: number) => {
      procumentViewDraft[index1].expect_receipt_date = value ? value : "";
      setProcumentViewDraft([...procumentViewDraft]);
    },
    [procumentViewDraft]
  );

  const onChangeStore = useCallback(
    (value: number, index1: number) => {
      procumentViewDraft[index1].store_id = value;
      setProcumentViewDraft([...procumentViewDraft]);
    },
    [procumentViewDraft]
  );

  const onChangeQuantity = useCallback(
    (value: number | null, sku: string, indexProcument: number) => {
      let indexLineItem = procumentViewDraft[
        indexProcument
      ].procurement_items.findIndex((item) => item.sku === sku);
      procumentViewDraft[indexProcument].procurement_items[
        indexLineItem
      ].quantity = value ? value : 0;
      setProcumentViewDraft([...procumentViewDraft]);
    },
    [procumentViewDraft]
  );

  const deleteProcument = useCallback(
    (index: number) => {
      procumentViewDraft.splice(index, 1);
      setProcumentViewDraft([...procumentViewDraft]);
    },
    [procumentViewDraft]
  );

  const columnTable = useMemo(() => {
    let columns: Array<ICustomTableColumType<PurchaseProcurementViewDraft>> =
      [];
    props.lineItems.forEach((item, indexLineItem) => {
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
            value={value.find((item1) => item1.sku === item.sku)?.quantity}
            onChange={(v) => {
              onChangeQuantity(v, item.sku, indexProcument);
            }}
          />
        ),
      });
    });
    return columns;
  }, [onChangeQuantity, props.lineItems]);
  const dataDraft = useMemo(() => {
    let data: Array<PurchaseProcurementViewDraft> = [];
    props.dataSource.forEach((item) => {
      data.push({ ...item });
    });
    return data;
  }, [props.dataSource]);
  const onOkDraft = useCallback(() => {
    onOk(procumentViewDraft);
  }, [onOk, procumentViewDraft]);
  useEffect(() => {
    if (visible) {
      setProcumentViewDraft([...dataDraft]);
    }
  }, [dataDraft, visible]);
  return (
    <Modal
      width={"60%"}
      centered
      title={"Sửa kế hoạch nhập kho"}
      visible={visible}
      onOk={onOkDraft}
      onCancel={() => {
        setProcumentViewDraft([...dataDraft]);
        onCancel && onCancel();
      }}
      cancelText={`Hủy`}
      confirmLoading={props.confirmLoading}
      okText={`Lưu`}
    >
      <POInventoryDraftTable>
        <Table
          className="product-table"
          dataSource={procumentViewDraft}
          pagination={false}
          rowKey={(item) => (item.id ? item.id : item.fake_id)}
          scroll={{ y: 300, x: 1000 }}
          columns={[
            ...defaultColumns,
            ...columnTable,
            {
              title: "",
              fixed: dataSource.length > 1 && "right",
              width: 40,
              render: (value: string, item, index: number) =>
                procumentViewDraft.length > 1 && (
                  <Button
                    onClick={() => deleteProcument(index)}
                    className="product-item-delete"
                    icon={<AiOutlineClose />}
                  />
                ),
            },
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
                    props.lineItems.map((new_line_items, index) => (
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
      </POInventoryDraftTable>
    </Modal>
  );
};

export default POEditDraftProcurementModal;
