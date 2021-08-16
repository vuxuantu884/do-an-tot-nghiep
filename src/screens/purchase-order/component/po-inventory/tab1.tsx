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

type TabAllProps = {
  id?: number,
  onSuccess: () => void
}
const TabAll: React.FC<TabAllProps> = (props: TabAllProps) => {
  const [visibleWarning, setVisibleWarning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dispath = useDispatch();
  return (
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
        let procurements: Array<PurchaseProcument> = getFieldValue(
          POField.procurements
        );
        let items =
          procurements !== undefined
            ? procurements.filter(
                (item) => item.status === ProcumentStatus.RECEIVED
              )
            : [];
        return (
          <div>
            <Table
              className="product-table"
              rowKey={(record: PurchaseOrderLineItem) =>
                record.id ? record.id : record.temp_id
              }
              rowClassName="product-table-row"
              dataSource={line_items}
              tableLayout="fixed"
              scroll={{ y: 250, x: 845 }}
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
                    <div style={{ textAlign: "right" }}>{value}</div>
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
                      {value ? value : 0}
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
                      {item.quantity - item.receipt_quantity}
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
                          {formatCurrency(total)}
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" index={2}>
                        <div style={{ fontWeight: 700 }}>
                          {formatCurrency(receipt)}
                        </div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" index={3}>
                        <div style={{ fontWeight: 700 }}>
                          {formatCurrency(total - receipt)}
                        </div>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
            {items.length > 0 && (
              <div
                style={{
                  marginTop: 20,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  onClick={() => setVisibleWarning(true)}
                  className="create-button-custom ant-btn-outline fixed-button"
                >
                  Kết thúc nhập kho
                </Button>
              </div>
            )}
            <ModalConfirm
              onCancel={() => {
                setVisibleWarning(false);
              }}
              onOk={() => {
                setLoading(true);
                if(props.id) {
                  dispath(PoProcumentFinishAction(props.id, 'finished', (result) => {
                    setLoading(false);
                    setVisibleWarning(false);
                    if(result !== null) {
                      props.onSuccess();
                    }
                  }))
                }
              }}
              okText="Đồng ý"
              cancelText="Hủy"
              title="Bạn có chắc chắn muốn kết thúc nhập kho không?"
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
