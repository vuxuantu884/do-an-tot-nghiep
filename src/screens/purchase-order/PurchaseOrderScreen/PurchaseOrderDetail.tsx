import { Card, Col, Divider, Form, Input, Row, Tooltip } from "antd";
import Table, { ColumnType } from "antd/lib/table";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { PurchaseOrderLineReturnItem } from "model/purchase-order/purchase-item.model";
import { PurchaseOrderReturn } from "model/purchase-order/purchase-order.model";
import moment from "moment";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { PurchaseOrderTabUrl } from "screens/purchase-order/helper";
import { getPurchaseOrderReturnItem } from "service/purchase-order/purchase-order.service";
import styled from "styled-components";
import { callApiNative } from "utils/ApiUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showError } from "utils/ToastUtils";
import POSupplierAddress from "../component/po-supplier-form/POSupplierAddress";
import imgDefIcon from "assets/img/img-def.svg";
import { formatCurrency } from "utils/AppUtils";
import { getTotalAmountByPurchaseOrderLineReturnItem, POUtils } from "utils/POUtils";

const PurchaseOrderDetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();

  const [formMain] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<PurchaseOrderReturn>();

  const columns: Array<ColumnType<PurchaseOrderLineReturnItem>> = useMemo(() => {
    return [
      {
        title: "STT",
        align: "center",
        width: "5%",
        render: (value, record, index) => index + 1,
      },
      {
        title: "Ảnh",
        width: "5%",
        align: "center",
        dataIndex: "variant_image",
        render: (value) => (
          <div style={{ marginRight: "auto", marginLeft: "auto" }} className="product-item-image">
            <img src={value === null ? imgDefIcon : value} alt="" className="" />
          </div>
        ),
      },
      {
        title: "Sản phẩm",
        width: "35%",
        className: "ant-col-info",
        dataIndex: "variant",
        render: (value: string, item: PurchaseOrderLineReturnItem, index: number) => {
          return (
            <div>
              <div>
                <div className="product-item-sku">
                  <Link
                    target="_blank"
                    to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                    className="text-truncate-1"
                  >
                    {item.sku}
                  </Link>
                </div>
                <div className="product-item-name">
                  <div>{value}</div>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: (
          <div>
            <div>Số Lượng</div>
            <div
              style={{
                color: "#2A2A86",
                fontWeight: "normal",
                marginLeft: 5,
              }}
            ></div>
          </div>
        ),
        width: "15%",
        dataIndex: "quantity_return",
        align: "center",
        render: (value, item: PurchaseOrderLineReturnItem, index) => {
          return formatCurrency(value, ".");
        },
      },
      {
        title: (
          <div>
            <div>
              Giá
              <span
                style={{
                  color: "#737373",
                  fontSize: "12px",
                  fontWeight: "normal",
                }}
              >
                {" "}
                ₫
              </span>
            </div>
          </div>
        ),
        width: "15%",
        align: "center",
        dataIndex: "price",
        render: (value, item, index) => {
          const calculatePrice = POUtils.caculatePrice(
            item.price,
            item.discount_rate,
            item.discount_value,
          );
          return (
            <div>
              {value ? formatCurrency(Math.round(calculatePrice || 0), ".") : ""}
              <span
                style={{
                  color: "#737373",
                  fontSize: "12px",
                  fontWeight: "normal",
                }}
              ></span>
            </div>
          );
        },
      },
      {
        dataIndex: "amount",
        title: (
          <Tooltip title="Thành tiền">
            <div>
              Thành tiền
              <span
                style={{
                  color: "#737373",
                  fontSize: "12px",
                  fontWeight: "normal",
                }}
              >
                {" "}
                ₫
              </span>
            </div>
          </Tooltip>
        ),
        align: "center",
        width: "20%",
        render: (value, item) => {
          let totalAmount = 0;
          const calculatePrice = POUtils.caculatePrice(
            item.price,
            item.discount_rate,
            item.discount_value,
          );
          totalAmount +=
            item.quantity_return * calculatePrice +
            (item.tax_rate / 100) * item.quantity_return * calculatePrice;
          return <div>{totalAmount ? formatCurrency(Math.round(totalAmount || 0), ".") : ""}</div>;
        },
      },
    ];
  }, []);

  const getPOReturnList = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const response: PurchaseOrderReturn = await callApiNative(
          { isShowError: true },
          dispatch,
          getPurchaseOrderReturnItem,
          id,
        );
        if (response) {
          setData(response);
          console.log("response.purchase_order", response.purchase_order);
          formMain.setFieldsValue(response.purchase_order);
        }
      } catch (error: any) {
        showError(error);
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    getPOReturnList(id);
  }, [id]);

  return (
    <ContentContainer
      title={`Quản lý phiếu trả hàng`}
      //   isError={isError}
      isLoading={loading}
      breadcrumb={[
        {
          name: "Đặt hàng",
          path: PurchaseOrderTabUrl.LIST,
        },
        {
          name: "Trả hàng",
          path: PurchaseOrderTabUrl.RETURN,
        },
        {
          name: `${data?.code || ""}`,
        },
      ]}
    >
      {data && data?.purchase_order && (
        <StyledRow gutter={24} style={{ paddingBottom: 30 }}>
          <Col span={18}>
            <Card title="Thông tin phiếu trả">
              <Row gutter={24}>
                <Col span={6}>
                  <div className="rt-title">Mã phiếu:</div>
                  <div className="rt-value">
                    <b>{data?.code}</b>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="rt-title">Mã đơn hàng:</div>
                  <div className="rt-value">
                    <Link
                      rel="noopener noreferrer"
                      target="_blank"
                      to={`${UrlConfig.PURCHASE_ORDERS}/${data?.purchase_order.id}`}
                    >
                      <b>{data?.purchase_order.code}</b>
                    </Link>{" "}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="rt-title">Mã tham chiếu:</div>
                  <div className="rt-value">
                    {" "}
                    <b>{data?.purchase_order.reference}</b>
                  </div>
                </Col>
                <Col span={6}>
                  <div className="rt-title">Lý do trả:</div>
                  <div className="rt-value">
                    {" "}
                    <b>{data?.return_reason}</b>
                  </div>
                </Col>
              </Row>
            </Card>

            <Form form={formMain} initialValues={data?.purchase_order} layout="vertical">
              <Card title="Thông tin nhà cung cấp">
                <Row align="middle">
                  <Link
                    to={`${UrlConfig.SUPPLIERS}/${data?.purchase_order.supplier_id}`}
                    className="primary"
                    target="_blank"
                    style={{ fontSize: "16px", marginRight: 10 }}
                  >
                    {data?.purchase_order.supplier}
                  </Link>
                </Row>
                <Form.Item hidden name="supplier_id">
                  <Input />
                </Form.Item>
                <Form.Item hidden name="supplier">
                  <Input />
                </Form.Item>
                <Form.Item hidden name="phone">
                  <Input />
                </Form.Item>
                <Form.Item hidden name="billing_address">
                  <Input />
                </Form.Item>
                <Form.Item hidden name="supplier_address">
                  <Input />
                </Form.Item>
                <Form.Item
                  shouldUpdate={(prevValues, curValues) =>
                    prevValues.supplier_id !== curValues.supplier_id
                  }
                >
                  {({ getFieldValue }) => {
                    const billing_address = getFieldValue("billing_address");
                    return (
                      <>
                        {" "}
                        {billing_address && (
                          <>
                            <POSupplierAddress
                              getFieldValue={getFieldValue}
                              field="billing_address"
                            />
                            <Divider style={{ marginTop: 0 }} />
                          </>
                        )}
                      </>
                    );
                  }}
                </Form.Item>
              </Card>
            </Form>
            <Card title="Thông tin sản phẩm trả hàng">
              <Table
                className="product-table"
                rowKey={(record: PurchaseOrderLineReturnItem) => record.sku}
                rowClassName="product-table-row"
                columns={columns}
                dataSource={data.line_return_items ?? []}
                tableLayout="fixed"
                pagination={false}
                bordered
              />
              <Row gutter={24}>
                <Col span={12} />
                <Col span={12} className="ie-payment-detail-row">
                  <div style={{ width: "27%", textAlign: "center" }}>
                    <b>Tổng tiền:</b>
                  </div>
                  <div style={{ width: "30%" }}></div>
                  <div style={{ width: "43%" }} className="ie-payment-detail-row-result">
                    {formatCurrency(
                      Math.round(
                        getTotalAmountByPurchaseOrderLineReturnItem(data.line_return_items ?? []),
                      ),
                    ) || ""}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={6}>
            <Card title={`Thông tin bổ sung`}>
              <div className="rt-title">Người tạo:</div>
              <div className="rt-value mb-2">
                <Link
                  to={`${UrlConfig.ACCOUNTS}/${data?.created_by}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <b>
                    {data?.created_by} - {data?.created_name}
                  </b>
                </Link>{" "}
              </div>
              <div className="rt-title">Ngày tạo:</div>
              <div className="rt-value mb-2">
                {" "}
                <b>{moment(data?.created_date).format(DATE_FORMAT.fullDate)}</b>
              </div>
              <div className="rt-title">Merchandiser:</div>
              <div className="rt-value mb-2">
                <Link
                  to={`${UrlConfig.ACCOUNTS}/${data?.purchase_order.merchandiser_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {" "}
                  <b>
                    {" "}
                    {data?.purchase_order.merchandiser_code} - {data?.purchase_order.merchandiser}
                  </b>
                </Link>{" "}
              </div>
              <div className="rt-title">Kho trả hàng:</div>
              <div className="rt-value">
                <b> {data?.store}</b>
              </div>
            </Card>
          </Col>
        </StyledRow>
      )}
    </ContentContainer>
  );
};

const StyledRow = styled(Row)`
  .rt-title {
    color: #666666;
  }
  .mb-2 {
    margin-bottom: 8px;
  }
  .ie-payment-detail-row {
    margin-top: 10px;
    color: #222222;
    display: flex;
    &-result {
      font-weight: 700;
      color: #2a2a86;
      text-align: center;
    }
  }
`;

export default PurchaseOrderDetail;
