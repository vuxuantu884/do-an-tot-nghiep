import React from "react";
import { Row, Col, Tag } from "antd";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { OrderModel } from "model/order/order.model";
import NumberFormat from "react-number-format";
import { Link } from "react-router-dom";
import {
  OrderFulfillmentsModel,
  OrderItemModel,
  OrderPaymentModel,
} from "model/order/order.model";
import UrlConfig from "config/url.config";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { delivery_service } from "../common/delivery-service";
import { PageResponse } from "model/base/base-metadata.response";


type PurchaseHistoryProps = {
  orderData: PageResponse<OrderModel>;
  onPageChange: (page: number | undefined, limit: number | undefined) => void;
  tableLoading: boolean;
};

function PurchaseHistory(props: PurchaseHistoryProps) {
  const { orderData, onPageChange, tableLoading } = props;
  const orderPointSpend = (order: any) => {
    if (order && order.payments.length > 0) {
      let _pointPayment = order?.payments?.filter(
        (item: any) => item.payment_method_id === 1
      );
      let totalPoint = _pointPayment.reduce(
        (acc: any, curr: any) => acc + curr.point,
        0
      );
      return totalPoint;
    }
  };

  const orderPointCollected = (order: any) => {
    return 0;
  };

  const status_order = React.useMemo(
    () => [
      {
        name: "Nháp",
        value: "draft",
        color: "#FCAF17",
        background: "rgba(252, 175, 23, 0.1)",
      },
      {
        name: "Đóng gói",
        value: "packed",
        color: "#FCAF17",
        background: "rgba(252, 175, 23, 0.1)",
      },
      {
        name: "Xuất kho",
        value: "shipping",
        color: "#FCAF17",
        background: "rgba(252, 175, 23, 0.1)",
      },
      {
        name: "Đã xác nhận",
        value: "finalized",
        color: "#FCAF17",
        background: "rgba(252, 175, 23, 0.1)",
      },
      {
        name: "Hoàn thành",
        value: "completed",
        color: "#27AE60",
        background: "rgba(39, 174, 96, 0.1)",
      },
      {
        name: "Kết thúc",
        value: "finished",
        color: "#27AE60",
        background: "rgba(39, 174, 96, 0.1)",
      },
      {
        name: "Đã huỷ",
        value: "cancelled",
        color: "#ae2727",
        background: "rgba(223, 162, 162, 0.1)",
      },
      {
        name: "Đã hết hạn",
        value: "expired",
        color: "#ae2727",
        background: "rgba(230, 171, 171, 0.1)",
      },
    ],
    []
  );

  const columnsOrderHistory: Array<ICustomTableColumType<OrderModel>> =
    React.useMemo(
      () => [
        {
          title: "ID đơn hàng",
          dataIndex: "code",
          render: (value: string, i: OrderModel) => (
            <Link to={`${UrlConfig.ORDER}/${i.id}`}>{value}</Link>
          ),
          visible: true,
          fixed: "left",
          className: "custom-shadow-td",
          width: "3.2%",
        },
        {
          title: "Khách hàng",
          render: (record) =>
            record.shipping_address ? (
              <div className="customer custom-td">
                <div className="name p-b-3" style={{ color: "#2A2A86" }}>
                  <Link
                    target="_blank"
                    to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
                    className="primary"
                    style={{ fontSize: "16px" }}
                  >
                    {record.shipping_address.name}
                  </Link>{" "}
                </div>
                <div className="p-b-3">{record.shipping_address.phone}</div>
                <div className="p-b-3">
                  {record.shipping_address.full_address}
                </div>
              </div>
            ) : (
              <div className="customer custom-td">
                <div className="name p-b-3" style={{ color: "#2A2A86" }}>
                  {record.customer}
                </div>
                <div className="p-b-3">{record.customer_phone_number}</div>
              </div>
            ),
          key: "customer",
          visible: true,
          width: "5%",
        },
        {
          title: (
            <div className="product-and-quantity-header">
              <span className="product-name">Sản phẩm</span>
              <span style={{margin: "0 auto"}}>Số lượng</span>
            </div>
          ),
          dataIndex: "items",
          key: "items.name11",
          className: "product-and-quantity",
          render: (items: Array<OrderItemModel>) => {
            return (
              <div className="items">
                {items.map((item, i) => {
                  return (
                    <div className="item-custom-td" key={i}>
                      <div className="product">
                        <Link
                          target="_blank"
                          to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                        >
                          {item.variant}
                        </Link>
                      </div>
                      <div className="quantity">{item.quantity}</div>
                    </div>
                  );
                })}
              </div>
            );
          },
          visible: true,
          align: "left",
          width: "280px",
        },
        {
          title: "Khách phải trả",
          // dataIndex: "",
          render: (record: any) => (
            <>
              <span>
                <NumberFormat
                  value={record.total_line_amount_after_line_discount}
                  className="foo"
                  displayType={"text"}
                  thousandSeparator={true}
                />
              </span>
              <br />
              <span style={{ color: "#EF5B5B" }}>
                {" "}
                -
                <NumberFormat
                  value={record.total_discount}
                  className="foo"
                  displayType={"text"}
                  thousandSeparator={true}
                />
              </span>
            </>
          ),
          key: "customer.amount_money",
          visible: true,
          align: "right",
          width: "3.5%",
        },
        {
          title: "Điểm",
          // dataIndex: "",
          render: (record: any) => (
            <>
              <div>
                <span>Tích:</span>
                <span style={{ marginLeft: 10 }}>
                  {orderPointSpend(record) || 0}
                </span>
              </div>
              <div>
                <span>Tiêu:</span>
                <span style={{ marginLeft: 10 }}>
                  {orderPointCollected(record) || 0}
                </span>
              </div>
            </>
          ),
          key: "customer.amount_money",
          visible: true,
          align: "left",
          width: "3.5%",
        },
        {
          title: "HTVC",
          dataIndex: "fulfillments",
          key: "shipment.type",
          render: (fulfillments: Array<OrderFulfillmentsModel>) => {
            const service_id =
              fulfillments.length && fulfillments[0].shipment
                ? fulfillments[0].shipment.delivery_service_provider_id
                : null;
            const service = delivery_service.find(
              (service) => service.id === service_id
            );
            return (
              service && (
                <img
                  src={service.logo ? service.logo : ""}
                  alt=""
                  style={{ width: "100%", height: "30px" }}
                />
              )
            );
          },
          visible: true,
          width: "3.5%",
          align: "center",
        },
        {
          title: "Trạng thái đơn",
          dataIndex: "status",
          key: "status",
          render: (status_value: string) => {
            const status = status_order.find(
              (status) => status.value === status_value
            );
            return (
              <div>
                {status?.name === "Nháp" && (
                  <div
                    style={{
                      background: "#F5F5F5",
                      borderRadius: "100px",
                      color: "#666666",
                      padding: "3px 10px",
                    }}
                  >
                    {status?.name}
                  </div>
                )}

                {status?.name === "Đã xác nhận" && (
                  <div
                    style={{
                      background: "rgba(42, 42, 134, 0.1)",
                      borderRadius: "100px",
                      color: "#2A2A86",
                      padding: "5px 10px",
                    }}
                  >
                    {status?.name}
                  </div>
                )}

                {status?.name === "Kết thúc" && (
                  <div
                    style={{
                      background: "rgba(39, 174, 96, 0.1)",
                      borderRadius: "100px",
                      color: "#27AE60",
                      padding: "5px 10px",
                    }}
                  >
                    {status?.name}
                  </div>
                )}

                {status?.name === "Đã huỷ" && (
                  <div
                    style={{
                      background: "rgba(226, 67, 67, 0.1)",
                      borderRadius: "100px",
                      color: "#E24343",
                      padding: "5px 10px",
                    }}
                  >
                    {status?.name}
                  </div>
                )}
              </div>
            );
          },
          visible: true,
          align: "center",
        },
        {
          title: "Đóng gói",
          dataIndex: "packed_status",
          key: "packed_status",
          render: (value: string) => {
            let processIcon = null;
            switch (value) {
              case "partial_paid":
                processIcon = "icon-partial";
                break;
              case "paid":
                processIcon = "icon-full";
                break;
              default:
                processIcon = "icon-blank";
                break;
            }
            return (
              <div className="text-center">
                <div className={processIcon} />
              </div>
            );
          },
          visible: true,
          align: "center",
          width: 120,
        },
        {
          title: "Xuất kho",
          dataIndex: "received_status",
          key: "received_status",
          render: (value: string) => {
            let processIcon = null;
            switch (value) {
              case "partial_paid":
                processIcon = "icon-partial";
                break;
              case "paid":
                processIcon = "icon-full";
                break;
              default:
                processIcon = "icon-blank";
                break;
            }
            return (
              <div className="text-center">
                <div className={processIcon} />
              </div>
            );
          },
          visible: true,
          align: "center",
          width: 120,
        },
        {
          title: "Thanh toán",
          dataIndex: "payment_status",
          key: "payment_status",
          render: (value: string) => {
            let processIcon = null;
            switch (value) {
              case "partial_paid":
                processIcon = "icon-partial";
                break;
              case "paid":
                processIcon = "icon-full";
                break;
              default:
                processIcon = "icon-blank";
                break;
            }
            return (
              <div className="text-center">
                <div className={processIcon} />
              </div>
            );
          },
          visible: true,
          align: "center",
          width: 120,
        },
        {
          title: "Trả hàng",
          dataIndex: "return_status",
          key: "return_status",
          render: (value: string) => {
            let processIcon = null;
            switch (value) {
              case "partial_paid":
                processIcon = "icon-partial";
                break;
              case "paid":
                processIcon = "icon-full";
                break;
              default:
                processIcon = "icon-blank";
                break;
            }
            return (
              <div className="text-center">
                <div className={processIcon} />
              </div>
            );
          },
          visible: true,
          align: "center",
          width: 120,
        },
        {
          title: "Tổng SL sản phẩm",
          dataIndex: "items",
          key: "item.quantity.total",
          render: (items) => {
            return items.reduce(
              (total: number, item: any) => total + item.quantity,
              0
            );
          },
          visible: true,
          align: "center",
        },
        {
          title: "Khu vực",
          dataIndex: "shipping_address",
          render: (shipping_address: any) => {
            const ward = shipping_address?.ward
              ? shipping_address.ward + ","
              : "";
            const district = shipping_address?.district
              ? shipping_address.district + ","
              : "";
            const city = shipping_address?.city
              ? shipping_address.city + ","
              : "";
            return (
              shipping_address && (
                <div className="name">{`${ward} ${district} ${city}`}</div>
              )
            );
          },
          key: "area",
          visible: true,
          width: "300px",
        },
        {
          title: "Kho cửa hàng",
          dataIndex: "store",
          key: "store",
          visible: true,
        },
        {
          title: "Nguồn đơn hàng",
          dataIndex: "source",
          key: "source",
          visible: true,
        },
        {
          title: "Khách đã trả",
          dataIndex: "payments",
          key: "customer.paid",
          render: (payments: Array<OrderPaymentModel>) => {
            let total = 0;
            payments.forEach((payment) => {
              total += payment.amount;
            });
            return (
              <NumberFormat
                value={total}
                className="foo"
                displayType={"text"}
                thousandSeparator={true}
              />
            );
          },
          visible: true,
        },

        {
          title: "Còn phải trả",
          key: "customer.pay",
          render: (order: OrderModel) => {
            let paid = 0;
            order.payments.forEach((payment) => {
              paid += payment.amount;
            });
            const missingPaid = order.total_line_amount_after_line_discount
              ? order.total_line_amount_after_line_discount - paid
              : 0;
            return (
              <NumberFormat
                value={missingPaid > 0 ? missingPaid : 0}
                className="foo"
                displayType={"text"}
                thousandSeparator={true}
              />
            );
          },
          visible: true,
        },
        {
          title: "Phương thức thanh toán",
          dataIndex: "payments",
          key: "payments.type",
          render: (payments: Array<OrderPaymentModel>) =>
            payments.map((payment, index) => {
              return <Tag key={index}>{payment.payment_method}</Tag>;
            }),
          visible: true,
        },
        {
          title: "Nhân viên bán hàng",
          render: (record) => (
            <div>{`${record.assignee} - ${record.assignee_code}`}</div>
          ),
          key: "assignee",
          visible: true,
          align: "center",
        },
        {
          title: "Nhân viên tạo đơn",
          render: (record) => (
            <div>{`${record.account} - ${record.account_code}`}</div>
          ),
          key: "account",
          visible: true,
          align: "center",
        },
        {
          title: "Ngày hoàn tất đơn",
          dataIndex: "completed_on",
          render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
          key: "completed_on",
          visible: true,
        },
        {
          title: "Ngày huỷ đơn",
          dataIndex: "cancelled_on",
          render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
          key: "cancelled_on",
          visible: true,
        },
        {
          title: "Ghi chú nội bộ",
          dataIndex: "note",
          key: "note",
          visible: true,
        },
        {
          title: "Ghi chú của khách",
          dataIndex: "customer_note",
          key: "customer_note",
          visible: true,
        },
        {
          title: "Tag",
          dataIndex: "tags",
          // render: (tags: Array<string>) => (
          //   tags?.map(tag => {
          //     return (
          //       <Tag>{tag}</Tag>
          //     )
          //   })
          // ),
          key: "tags",
          visible: true,
        },
        {
          title: "Mã tham chiếu",
          dataIndex: "reference_code",
          key: "reference_code",
          visible: true,
        },
      ],
      [status_order]
    );

  return (
    <Row className="customer-history-table">
      <Col span={24} style={{ marginBottom: 10 }}>
        <CustomTable
          isLoading={tableLoading}
          showColumnSetting={true}
          scroll={{ x: 3630 }}
          sticky={{ offsetScroll: 10, offsetHeader: 55 }}
          pagination={{
            pageSize: orderData.metadata.limit,
            total: orderData.metadata.total,
            current: orderData.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          dataSource={orderData.items}
          columns={columnsOrderHistory}
          rowKey={(item: OrderModel) => item.id}
          className="order-list"
        />
      </Col>
    </Row>
  );
}

export default PurchaseHistory;
