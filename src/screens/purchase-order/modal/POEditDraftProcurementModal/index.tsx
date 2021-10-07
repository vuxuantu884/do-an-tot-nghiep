import { PlusOutlined } from "@ant-design/icons";
import { Table, Modal, Button, Select } from "antd";
import CustomDatePicker from "component/custom/date-picker.custom";
import NumberInput from "component/custom/number-input.custom";
import { ICustomTableColumType } from "component/table/CustomTable";
import { StoreResponse } from "model/core/store.model";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { PurchaseProcument, PurchaseProcumentLineItem } from "model/purchase-order/purchase-procument";
import moment from "moment";
import { useCallback, useMemo } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { POInventoryDraftTable } from "screens/purchase-order/component/po-inventory/POInventoryDraft/styles";
import { DATE_FORMAT } from "utils/DateUtils";

type ProcurementModalProps = {
  visible?: boolean;
  onCancel?: () => void;
  onOk: (value: Array<PurchaseProcument>) => void;
  lineItems: Array<PurchaseOrderLineItem>;
  dataSource: Array<PurchaseProcument>;
  stores: Array<StoreResponse>
};

const POEditDraftProcurementModal: React.FC<ProcurementModalProps> = (
  props: ProcurementModalProps
) => {
  const { visible, onCancel, dataSource } = props;
  const defaultColumns: Array<ICustomTableColumType<PurchaseProcument>> = [
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
          {props.stores.map((item) => (
            <Select.Option key={item.id} value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  const onAdd = useCallback(() => {

  }, []);

  const onChangeDate = useCallback(
    (value: string | undefined, index1: number) => {
    },
    []
  );

  const onChangeStore = useCallback(
    (value: number, index1: number) => {
    },
    []
  );

  const onChangeQuantity = useCallback(
    (value: number | null, sku: string, indexProcument: number) => {

    },
    []
  );

  const deleteProcument = useCallback(
    (index: number) => {
    },
    []
  );

  const columnTable = useMemo(() => {
    let columns: Array<
              ICustomTableColumType<PurchaseProcument>
            > = [];
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
            value={value.find(item1 => item1.sku === item.sku)?.quantity}
            onChange={(v) => {
              onChangeQuantity(v, item.sku, indexProcument);
            }}
          />
        ),
      });
    });
    return columns
  }, [onChangeQuantity, props.lineItems])

  return (
    <Modal
      width={"60%"}
      centered
      title={"Sửa kế hoạch nhập kho"}
      visible={visible}
      onCancel={() => {
        onCancel && onCancel();
      }}
      cancelText={`Hủy`}
      okText={`Lưu`}
    >
      <POInventoryDraftTable>
        <Table
          dataSource={dataSource}
          pagination={false}
          scroll={{ y: 300, x: 1000 }}
          columns={[
            ...defaultColumns,
            ...columnTable,
            {
              title: "",
              fixed: dataSource.length > 1 && "right",
              width: 40,
              render: (value: string, item, index: number) =>
                dataSource.length > 1 && (
                  <Button
                    onClick={() => deleteProcument(index)}
                    className="product-item-delete"
                    icon={<AiOutlineClose />}
                  />
                ),
            },
          ]}
          summary={(data) => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell
                  index={1}
                  colSpan={4 + props.lineItems.length}
                >
                  <Button onClick={onAdd} icon={<PlusOutlined />} type="link">
                    Thêm kế hoạch
                  </Button>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </POInventoryDraftTable>
    </Modal>
  );
};

export default POEditDraftProcurementModal;
