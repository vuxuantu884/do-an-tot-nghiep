import { Button, Form, Table } from "antd";
import { POField } from "model/purchase-order/po-field";
import { POLineItemType, PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
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
import { Link } from "react-router-dom";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";

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
        const line_items: Array<PurchaseOrderLineItem> = getFieldValue(POField.line_items);
        const procurements: Array<PurchaseProcument> = getFieldValue(POField.procurements);
        const receive_status: string = getFieldValue(POField.receive_status);

        const items =
          procurements !== undefined && procurements !== null
            ? procurements.filter((item) => item.status === ProcumentStatus.RECEIVED)
            : [];
        const new_line_items: Array<PurchaseOrderLineItem> = line_items;
        return (
          <div>
            <Table
              className="product-table"
              rowKey={(record: PurchaseOrderLineItem) => (record.id ? record.id : record.temp_id)}
              rowClassName="product-table-row"
              dataSource={new_line_items}
              tableLayout="fixed"
              // scroll={{ y: 250 }}
              pagination={false}
              columns={[
                {
                  title: "STT",
                  align: "center",
                  width: 35,
                  render: (value, record, index) => index + 1,
                },
                {
                  title: "Ảnh",
                  width: 35,
                  dataIndex: "variant_image",
                  render: (value) => (
                    <div className="product-item-image">
                      <img src={value === null ? imgDefIcon : value} alt="" className="" />
                    </div>
                  ),
                },
                {
                  title: "Sản phẩm",
                  width: 85,
                  className: "ant-col-info",
                  dataIndex: "variant",
                  render: (value: string, item: PurchaseOrderLineItem, index: number) => (
                    <div>
                      <div>
                        <div className="product-item-sku">
                          <Link
                            to="#"
                            onClick={() => {
                              const url = `${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`;
                              const newWindow = window.open(url, "_blank", "noopener,noreferrer");
                              if (newWindow) newWindow.opener = null;
                            }}
                          >
                            {item.sku}
                          </Link>
                        </div>
                        <div className="product-item-name text-truncate-1">
                          <div className="product-item-name-detail">{value}</div>
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
                  width: 80,
                  dataIndex: "quantity",
                  render: (value, item, index) => (
                    <div style={{ textAlign: "right" }}>{formatCurrency(value || 0, ".")}</div>
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
                  width: 75,
                  dataIndex: "receipt_quantity",
                  render: (value, item, index) => (
                    <div style={{ textAlign: "right" }}>
                      {value ? formatCurrency(value, ".") : 0}
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
                        color: "#E24343",
                      }}
                    >
                      SL còn lại
                    </div>
                  ),
                  width: 75,
                  dataIndex: "receipt_quantity",
                  render: (value, item, index) => (
                    <div
                      style={{
                        textAlign: "right",
                        color:
                          item.quantity - (item.receipt_quantity || 0) > 0 ? "#E24343" : "#27AE60",
                      }}
                    >
                      {formatCurrency(item.quantity - (item.receipt_quantity || 0), ".")}
                    </div>
                  ),
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
                        <div style={{ fontWeight: 700 }}>{formatCurrency(total || 0, ".")}</div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" index={2}>
                        <div style={{ fontWeight: 700 }}>{formatCurrency(receipt || 0, ".")}</div>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell align="right" index={3}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: total - receipt > 0 ? "#E24343" : "#27AE60",
                          }}
                        >
                          {formatCurrency(total - receipt || 0, ".")}
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
                  <AuthWrapper acceptPermissions={[PurchaseOrderPermission.procurements_finish]}>
                    <Button
                      onClick={() => setVisibleWarning(true)}
                      className={
                        receive_status === ProcumentStatus.RECEIVED ||
                        receive_status === ProcumentStatus.PARTIAL_RECEIVED
                          ? "po-form text-danger"
                          : ""
                      }
                      // className="create-button-custom ant-btn-outline fixed-button"
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
                    }),
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
