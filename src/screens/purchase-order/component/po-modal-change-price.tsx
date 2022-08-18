import { Button, Modal, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { TiWarningOutline } from "react-icons/ti";
import { formatCurrency } from "utils/AppUtils";

export interface ModalConfirmProps {
  visible?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  onChangePrice?: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  bgIcon?: string;
  loading?: boolean;
  dataSource?: Array<PurchaseOrderLineItem>;
}

export const POModalChangePrice = (props: ModalConfirmProps) => {
  const {
    visible,
    onOk,
    onCancel,
    title,
    subTitle,
    okText,
    cancelText,
    loading,
    dataSource,
    onChangePrice,
  } = props;

  const columns: ColumnsType<PurchaseOrderLineItem> = [
    {
      title: "Mã SP",
      align: "center",
      dataIndex: "sku",
      width: 30,
      render: (value) => value,
    },
    {
      title: "Tên SP",
      align: "left",
      dataIndex: "product",
      width: 90,
      render: (value) => value,
    },
    {
      title: "Giá bán hiện tại",
      align: "center",
      dataIndex: "retail_price",
      width: 60,
      render: (value) => formatCurrency(value, "."),
    },
    {
      title: <span style={{ color: "#E24343" }}>Giá bán mới</span>,
      align: "center",
      dataIndex: "new_retail_price",
      width: 60,
      render: (value) => <span style={{ color: "#E24343" }}>{formatCurrency(value, ".")}</span>,
    },
  ];
  return (
    <Modal
      confirmLoading={loading}
      width="50%"
      className="modal-confirm"
      okText={okText ? okText : "Có"}
      cancelText={cancelText ? cancelText : "Không"}
      visible={visible}
      onOk={onOk}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={onOk}
          className="create-button-custom ant-btn-outline"
          ghost
        >
          Không thay đổi
        </Button>,
        <Button key="link" type="primary" loading={loading} onClick={onChangePrice}>
          Có, thay đổi giá mới
        </Button>,
      ]}
    >
      <div className="modal-confirm-container">
        <div>
          <div
            style={{
              color: "#FFFFFF",
              backgroundColor: "#FCAF17",
              fontSize: "45px",
            }}
            className="modal-confirm-icon"
          >
            <TiWarningOutline />
          </div>
        </div>
        <div className="modal-confirm-right margin-left-20">
          <div className="modal-confirm-title">{title}</div>
          {subTitle !== "" && <div className="modal-confirm-sub-title">{subTitle}</div>}
        </div>
      </div>
      <Table
        className="product-table"
        rowKey={(record: PurchaseOrderLineItem) => (record.id ? record.id : record.variant_id)}
        rowClassName="product-table-row"
        dataSource={dataSource}
        tableLayout="fixed"
        pagination={false}
        columns={columns}
      />
    </Modal>
  );
};
