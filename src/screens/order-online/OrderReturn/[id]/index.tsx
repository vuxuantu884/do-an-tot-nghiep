import { Card, Col, Row, Tag } from "antd";
import ContentContainer from "component/container/content.container";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import UrlConfig from "config/url.config";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { actionGetOrderReturn } from "domain/actions/order/order-return.action";
import { PaymentMethodGetList } from "domain/actions/order/order.action";
import { OrderPaymentRequest } from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  OrderResponse,
  ReturnProductModel,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { FulFillmentStatus, PaymentMethodCode } from "utils/Constants";
import ActionHistory from "../../component/order-detail/ActionHistory";
import UpdateCustomerCard from "../../component/update-customer-card";
import CardReturnMoney from "../components/CardReturnMoney";
import CardReturnOrder from "../components/CardReturnOrder";
import CardReturnProducts from "../components/CardReturnProducts";
import CardReturnReceiveProducts from "../components/CardReturnReceiveProducts";

type PropType = {};
type OrderParam = {
  id: string;
};

const ScreenReturnDetail = (props: PropType) => {
  let { id } = useParams<OrderParam>();
  let orderId = parseInt(id);
  const isDetailPage = id ? true : false;
  const dispatch = useDispatch();

  const [isError, setError] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [listReturnProducts, setListReturnProducts] = useState<
    ReturnProductModel[]
  >([]);
  const [customerDetail, setCustomerDetail] = useState<CustomerResponse | null>(
    null
  );
  const [listPaymentMethods, setListPaymentMethods] = useState<
    Array<PaymentMethodResponse>
  >([]);
  const [countChangeSubStatus, setCountChangeSubStatus] = useState<number>(0);
  const [amountReturn, setAmountReturn] = useState<number>(100000);
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [isReceiveReturnProducts, setIsReceiveReturnProducts] =
    useState<boolean>(false);

  const handleChangeSubStatus = () => {
    setCountChangeSubStatus(countChangeSubStatus + 1);
  };

  const handlePayments = (value: Array<OrderPaymentRequest>) => {
    setPayments(value);
  };

  useEffect(() => {
    if (!Number.isNaN(orderId)) {
      dispatch(
        actionGetOrderReturn(orderId, (data: OrderResponse) => {
          setLoadingData(false);
          if (!data) {
            setError(true);
          } else {
            let _data = { ...data };
            _data.fulfillments = _data.fulfillments?.filter(
              (f) =>
                f.status !== FulFillmentStatus.CANCELLED &&
                f.status !== FulFillmentStatus.RETURNED &&
                f.status !== FulFillmentStatus.RETURNING
            );
            setOrderDetail(_data);
            let formatted: ReturnProductModel[] = _data.items.map((single) => {
              return {
                ...single,
                maxQuantity: single.quantity,
              };
            });
            setListReturnProducts(formatted);
            setAmountReturn(0);
          }
        })
      );
    } else {
      setError(true);
    }
  }, [dispatch, orderId]);

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(CustomerDetail(OrderDetail?.customer_id, setCustomerDetail));
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    dispatch(
      PaymentMethodGetList((response) => {
        let result = response.filter(
          (single) => single.code !== PaymentMethodCode.CARD
        );
        setListPaymentMethods(result);
      })
    );
  }, [dispatch]);

  return (
    <ContentContainer
      isLoading={loadingData}
      isError={isError}
      title="Trả hàng cho đơn hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: `${UrlConfig.HOME}`,
        },
        {
          name: "Trả hàng",
          path: `${UrlConfig.HOME}`,
        },
        {
          name: `Chi tiết đơn trả hàng ${id}`,
        },
      ]}
    >
      <div className="orders">
        <Row gutter={24} style={{ marginBottom: "70px" }}>
          <Col md={18}>
            <UpdateCustomerCard
              OrderDetail={OrderDetail}
              customerDetail={customerDetail}
            />
            <CardReturnOrder isDetailPage={isDetailPage} isExchange={false} />
            {/* <CardReturnProducts
              listReturnProducts={listReturnProducts}
              handleReturnProducts={(
                listReturnProducts: ReturnProductModel[]
              ) => setListReturnProducts(listReturnProducts)}
              isDetailPage={isDetailPage}
            /> */}
            {/* <CardReturnMoney
              listPaymentMethods={listPaymentMethods}
              amountReturn={amountReturn}
              payments={payments}
              handlePayments={handlePayments}
              isDetailPage={isDetailPage}
            /> */}
            <CardReturnReceiveProducts
              isDetailPage={isDetailPage}
              isReceiveReturnProducts={isReceiveReturnProducts}
              handleReceiveReturnProducts={setIsReceiveReturnProducts}
            />
          </Col>

          <Col md={6}>
            <Card
              className="card-block card-block-normal"
              title={
                <div className="d-flex">
                  <span className="title-card">THÔNG TIN ĐƠN HÀNG</span>
                </div>
              }
            >
              <div className="padding-24">
                <Row className="" gutter={5}>
                  <Col span={9}>Cửa hàng:</Col>
                  <Col span={15}>
                    <span
                      style={{ fontWeight: 500, color: "#2A2A86" }}
                      className="text-focus"
                    >
                      {OrderDetail?.store}
                    </span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Điện thoại:</Col>
                  <Col span={15}>
                    <span style={{ fontWeight: 500, color: "#222222" }}>
                      {OrderDetail?.customer_phone_number}
                    </span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Địa chỉ:</Col>
                  <Col span={15}>
                    <span style={{ fontWeight: 500, color: "#222222" }}>
                      {OrderDetail?.shipping_address?.full_address}
                    </span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>NVBH:</Col>
                  <Col span={15}>
                    <span
                      style={{ fontWeight: 500, color: "#222222" }}
                      className="text-focus"
                    >
                      {OrderDetail?.assignee}
                    </span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Người tạo:</Col>
                  <Col span={15}>
                    <span
                      style={{ fontWeight: 500, color: "#222222" }}
                      className="text-focus"
                    >
                      {OrderDetail?.account}
                    </span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Đường dẫn:</Col>
                  <Col span={15} style={{ wordWrap: "break-word" }}>
                    {OrderDetail?.url ? (
                      <a href={OrderDetail?.url}>{OrderDetail?.url}</a>
                    ) : (
                      <span className="text-focus">Không</span>
                    )}
                  </Col>
                </Row>
              </div>
            </Card>
            <SubStatusOrder
              subStatusId={OrderDetail?.sub_status_id}
              status={OrderDetail?.status}
              orderId={orderId}
              fulfillments={OrderDetail?.fulfillments}
              handleChangeSubStatus={handleChangeSubStatus}
            />
            <Card
              className="margin-top-20"
              title={
                <div className="d-flex">
                  <span className="title-card">THÔNG TIN BỔ SUNG</span>
                </div>
              }
            >
              <div className="padding-24">
                <Row
                  className=""
                  gutter={5}
                  style={{ flexDirection: "column" }}
                >
                  <Col span={24} style={{ marginBottom: 6 }}>
                    <b>Ghi chú nội bộ:</b>
                  </Col>
                  <Col span={24}>
                    <span
                      className="text-focus"
                      style={{ wordWrap: "break-word" }}
                    >
                      {OrderDetail?.note !== ""
                        ? OrderDetail?.note
                        : "Không có ghi chú"}
                    </span>
                  </Col>
                </Row>

                <Row
                  className="margin-top-10"
                  gutter={5}
                  style={{ flexDirection: "column" }}
                >
                  <Col span={24} style={{ marginBottom: 6 }}>
                    <b>Tags:</b>
                  </Col>
                  <Col span={24}>
                    <span className="text-focus">
                      {OrderDetail?.tags
                        ? OrderDetail?.tags.split(",").map((item, index) => (
                            <Tag
                              key={index}
                              className="orders-tag"
                              style={{
                                backgroundColor: "#F5F5F5",
                                color: "#737373",
                                padding: "5px 10px",
                              }}
                            >
                              {item}
                            </Tag>
                          ))
                        : "Không có tags"}
                    </span>
                  </Col>
                </Row>
              </div>
            </Card>
            <ActionHistory
              orderId={id}
              countChangeSubStatus={countChangeSubStatus}
            />
          </Col>
        </Row>
      </div>
    </ContentContainer>
  );
};

export default ScreenReturnDetail;
