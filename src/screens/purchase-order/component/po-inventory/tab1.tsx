import { Button, Form, Table } from "antd";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import imgDefIcon from "assets/img/img-def.svg";
import { POUtils } from "utils/POUtils";
import { formatCurrency } from "utils/AppUtils";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { ProcumentStatus } from "utils/Constants";
import ModalConfirm from "component/modal/ModalConfirm";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { PoProcumentFinishAction } from "domain/actions/po/po-procument.action";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";

type TabAllProps = {
  id?: number;
  code?: string;
  onSuccess: () => void;
};
const TabAll: React.FC<TabAllProps> = (props: TabAllProps) => {
  const [visibleWarning, setVisibleWarning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dispath = useDispatch();
  return (
    <Form.Item
      noStyle
      shouldUpdate={(prev, current) =>
        prev[POField.line_items] !== current[POField.line_items] ||
        prev[POField.procurements] !== current[POField.procurements] ||
        prev[POField.receive_status] !== current[POField.receive_status]
      }
    >
      {({ getFieldValue }) => {
        let line_items: Array<PurchaseOrderLineItem> = getFieldValue(
          POField.line_items
        );
        let procurements: Array<PurchaseProcument> = getFieldValue(
          POField.procurements
        );
        let receive_status: string = getFieldValue(POField.receive_status);
        let items =
          procurements !== undefined && procurements !== null
            ? procurements.filter(
                (item) => item.status === ProcumentStatus.RECEIVED
              )
            : [];
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
            new_line_items[index].planned_quantity =
              new_line_items[index].planned_quantity + item.planned_quantity;
            new_line_items[index].receipt_quantity =
              new_line_items[index].receipt_quantity + item.receipt_quantity;
          }
        });
        return (
          <div>
            <Table
              className="product-table"
              rowKey={(record: PurchaseOrderLineItem) =>
                record.id ? record.id : record.temp_id
              }
              rowClassName="product-table-row"
              dataSource={new_line_items}
              tableLayout="fixed"
              scroll={{ y: 250, x: 600 }}
              pagination={false}
              columns={[
                {
                  title: "STT",
                  align: "center",
                  width: 60,
                  render: (value, record, index) => index + 1,
                },
                {
                  title: "Ảnh",
                  width: 60,
                  dataIndex: "variant_image",
                  render: (value) => (
                    <div className="product-item-image">
                      <img
                        src={value === null ? imgDefIcon : value}
                        alt=""
                        className=""
                      />
                    </div>
                  ),
                },
                {
                  title: "Sản phẩm",
                  width: "90%",
                  className: "ant-col-info",
                  dataIndex: "variant",
                  render: (
                    value: string,
                    item: PurchaseOrderLineItem,
                    index: number
                  ) => (
                    <div>
                      <div>
                        <div className="product-item-sku">{item.sku}</div>
                        <div className="product-item-name">
                          <span className="product-item-name-detail">
                            {value}
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  title: (
                    <div
                      style={{
                        width: "100%",
                        textAlign: "right",
                        flexDirection: "column",
                        display: "flex",
                      }}
                    >
                      SL Đặt hàng
                    </div>
                  ),
                  width: 150,
                  dataIndex: "quantity",
                  render: (value, item, index) => (
                    <div style={{ textAlign: "right" }}>{formatCurrency(value,".")}</div>
                  ),
                },
                {
                  title: (
                    <div
                      style={{
                        width: "100%",
                        textAlign: "right",
                        flexDirection: "column",
                        display: "flex",
                      }}
                    >
                      SL đã nhận
                    </div>
                  ),
                  width: 150,
                  dataIndex: "receipt_quantity",
                  render: (value, item, index) => (
                    <div style={{ textAlign: "right" }}>
                      {value ? formatCurrency(value,".") : 0}
                    </div>
                  ),
                },
                {
                  title: (
                    <div
                      style={{
                        width: "100%",
                        textAlign: "right",
                        flexDirection: "column",
                        display: "flex",
                      }}
                    >
                      SL còn lại
                    </div>
                  ),
                  width: 150,
                  dataIndex: "receipt_quantity",
                  render: (value, item, index) => (
                    <div style={{ textAlign: "right" }}>
                      {formatCurrency(item.quantity - item.receipt_quantity,".")}
                    </div>
                  ),
                },
                {
                  title: "",
                  width: 40,
                  render: (value: string, item, index: number) => "",
                },
              ]}
              summary={(data) => {
                let total = POUtils.totalQuantity(line_items);
                let receipt = POUtils.totalReceipt(line_items);
                return (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell align="center" colSpan={3} index={0}>
                        <div style={{ fontWeight: 700 }}>Tổng</div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" index={1}>
                        <div style={{ fontWeight: 700 }}>
                          {formatCurrency(total,".")}
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" index={2}>
                        <div style={{ fontWeight: 700 }}>
                          {formatCurrency(receipt,".")}
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" index={3}>
                        <div style={{ fontWeight: 700 }}>
                          {formatCurrency(total - receipt,".")}
                        </div>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
            {items.length > 0 &&
              receive_status !== ProcumentStatus.FINISHED &&
              receive_status !== ProcumentStatus.CANCELLED && (
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <AuthWrapper
                        acceptPermissions={[PurchaseOrderPermission.procurements_finish]}
                      >
                  <Button
                    onClick={() => setVisibleWarning(true)}
                    className="create-button-custom ant-btn-outline fixed-button"
                  >
                    Kết thúc nhập kho
                  </Button>
                  </AuthWrapper>
                </div>
              )}
            <ModalConfirm
              onCancel={() => {
                setVisibleWarning(false);
              }}
              onOk={() => {
                setLoading(true);
                if (props.id) {
                  dispath(
                    PoProcumentFinishAction(props.id, "finished", (result) => {
                      setLoading(false);
                      setVisibleWarning(false);
                      if (result !== null) {
                        props.onSuccess();
                      }
                    })
                  );
                }
              }}
              okText="Đồng ý"
              cancelText="Hủy"
              title={`Bạn có chắc chắn muốn kết thúc nhập hàng cho ${props.code} không?`}
              subTitle="Sau khi kết thúc, số lượng được chốt để tính công nợ cho nhà cung cấp"
              visible={visibleWarning}
              loading={loading}
            />
          </div>
        );
      }}
    </Form.Item>
  );
};

export default TabAll;
