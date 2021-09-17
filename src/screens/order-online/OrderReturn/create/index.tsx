import { Card, Col, Row, Tag } from "antd";
import ContentContainer from "component/container/content.container";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import UrlConfig from "config/url.config";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { actionCreateOrderReturn } from "domain/actions/order/order-return.action";
import {
  OrderDetailAction,
  PaymentMethodGetList,
} from "domain/actions/order/order.action";
import {
  FulFillmentRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
  OrderRequest,
  ShipmentRequest,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  OrderLineItemResponse,
  OrderResponse,
  ReturnProductModel,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { FulFillmentStatus, PaymentMethodCode } from "utils/Constants";
import { useQuery } from "utils/useQuery";
import UpdateCustomerCard from "../../component/update-customer-card";
import CardReturnMoney from "../components/CardReturnMoney";
import CardReturnOrder from "../components/CardReturnOrder";
import CardReturnProducts from "../components/CardReturnProducts";
import CardExchangeProducts from "../components/CardExchangeProducts";
import CardReturnReceiveProducts from "../components/CardReturnReceiveProducts";
import ReturnBottomBar from "../components/ReturnBottomBar";

type PropType = {
  id?: string;
};

const ScreenReturnDetail = (props: PropType) => {
  const [isError, setError] = useState<boolean>(false);
  const [isCanReturn, setIsCanReturn] = useState<boolean>(false);
  const [isCanSubmit, setIsCanSubmit] = useState<boolean>(false);
  const [isExchange, setIsExchange] = useState<boolean>(false);
  const [isStepExchange, setIsStepExchange] = useState<boolean>(false);
  const history = useHistory();
  const query = useQuery();
  let queryOrderID = query.get("orderID");

  let orderId = queryOrderID ? parseInt(queryOrderID) : undefined;
  const [shippingFeeCustomer, setShippingFeeCustomer] = useState<number | null>(
    null
  );

  const dispatch = useDispatch();

  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [listReturnProducts, setListReturnProducts] = useState<
    ReturnProductModel[]
  >([]);
  const [listOrderProducts, setListOrderProducts] = useState<
    OrderLineItemResponse[]
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

  const [listExchangeProducts, setListExchangeProducts] = useState<
    OrderLineItemRequest[]
  >([]);

  const onGetDetailSuccess = useCallback((data: false | OrderResponse) => {
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
      let returnFulfillment = data.fulfillments?.find((singleFulfillment) => {
        return singleFulfillment.status === FulFillmentStatus.SHIPPED;
      });
      if (returnFulfillment) {
        setIsCanReturn(true);
      }
      let returnProduct: ReturnProductModel[] = _data.items.map((single) => {
        return {
          ...single,
          maxQuantity: single.quantity,
          quantity: 0,
        };
      });
      setListReturnProducts(returnProduct);
      setListOrderProducts(_data.items);

      setAmountReturn(0);
    }
  }, []);

  const handleChangeSubStatus = () => {
    setCountChangeSubStatus(countChangeSubStatus + 1);
  };

  const handlePayments = (value: Array<OrderPaymentRequest>) => {
    setPayments(value);
  };

  const handleIsCanSubmit = (status: boolean) => {
    setIsCanSubmit(status);
  };

  const handleIsExchange = (isExchange: boolean) => {
    setIsExchange(isExchange);
  };

  const handleIsStepExchange = (isExchange: boolean) => {
    setIsStepExchange(isExchange);
  };

  const handleListExchangeProducts = (
    listExchangeProducts: OrderLineItemRequest[]
  ) => {
    setListExchangeProducts(listExchangeProducts);
  };

  const handleSubmit = () => {
    let newFulfillment: FulFillmentRequest[] = [];
    if (OrderDetail?.fulfillments) {
      newFulfillment = OrderDetail.fulfillments.map((single) => {
        let shipment = single.shipment;
        let newShipment: ShipmentRequest = {
          ...single.shipment,
          delivery_service_provider_id:
            shipment?.delivery_service_provider_id || null,
          delivery_service_provider_type:
            shipment?.delivery_service_provider_type || null,
          shipper_code: shipment?.shipper_code || null,
          shipper_name: shipment?.shipper_name || null,
          handover_id: shipment?.handover_id || null,
          service: shipment?.service || null,
          fee_type: shipment?.fee_type || null,
          fee_base_on: shipment?.fee_base_on || null,
          delivery_fee: shipment?.delivery_fee || null,
          shipping_fee_informed_to_customer:
            shipment?.shipping_fee_informed_to_customer || null,
          shipping_fee_paid_to_three_pls:
            shipment?.shipping_fee_paid_to_three_pls || null,
          reference_status: shipment?.reference_status || null,
          reference_status_explanation:
            shipment?.reference_status_explanation || null,
          cod: shipment?.cod || null,
          cancel_reason: shipment?.cancel_reason || null,
          tracking_code: shipment?.tracking_code || null,
          tracking_url: shipment?.tracking_url || null,
          received_date: shipment?.received_date || null,
          sender_address_id: shipment?.sender_address_id || null,
          note_to_shipper: shipment?.note_to_shipper || null,
          requirements: shipment?.requirements || null,
          sender_address: null,
          shipping_address: null,
          office_time: null,
        };
        return {
          store_id: single.store_id,
          account_code: single.account_code,
          assignee_code: single.assignee_code,
          delivery_type: single.delivery_type,
          stock_location_id: single.stock_location_id,
          payment_status: single.payment_status,
          total: single.total,
          total_tax: single.total_tax,
          total_discount: single.total_discount,
          total_quantity: single.total_quantity,
          discount_rate: single.discount_rate,
          discount_value: single.discount_value,
          discount_amount: single.discount_amount,
          total_line_amount_after_line_discount:
            single.total_line_amount_after_line_discount,
          shipment: newShipment,
          items: single.items,
        };
      });
    }
    if (OrderDetail && listReturnProducts) {
      let orderDetailFormatted: OrderRequest = {
        ...OrderDetail,
        action: "",
        delivery_service_provider_id: null,
        delivery_fee: null,
        shipper_code: "",
        shipper_name: "",
        shipping_fee_paid_to_three_pls: null,
        requirements: null,
        items: listReturnProducts,
        fulfillments: newFulfillment,
      };
      dispatch(
        actionCreateOrderReturn(orderDetailFormatted, (response) => {
          console.log("response", response);
        })
      );
    }
  };

  const handleCancel = () => {
    history.push("/");
  };

  const renderIfCannotReturn = () => {
    return <div>Đơn hàng không thể đổi trả!</div>;
  };

  const renderIfCanReturn = () => {
    return (
      <React.Fragment>
        <div className="orders">
          <Row gutter={24} style={{ marginBottom: "70px" }}>
            <Col md={18}>
              {/*--- customer ---*/}
              <UpdateCustomerCard
                OrderDetail={OrderDetail}
                customerDetail={customerDetail}
              />
              {/*--- end customer ---*/}
              <CardReturnOrder
                isDetailPage={false}
                isExchange={isExchange}
                handleIsExchange={handleIsExchange}
              />
              <CardReturnProducts
                listReturnProducts={listReturnProducts}
                handleReturnProducts={(
                  listReturnProducts: ReturnProductModel[]
                ) => setListReturnProducts(listReturnProducts)}
                listOrderProducts={listOrderProducts}
                handleIsCanSubmit={handleIsCanSubmit}
                isDetailPage={false}
              />
              {isExchange && isStepExchange && (
                <CardExchangeProducts
                  items={listExchangeProducts}
                  handleCardItems={handleListExchangeProducts}
                  shippingFeeCustomer={shippingFeeCustomer}
                />
              )}
              <CardReturnMoney
                listPaymentMethods={listPaymentMethods}
                amountReturn={amountReturn}
                payments={payments}
                handlePayments={handlePayments}
                isDetailPage={false}
              />
              <CardReturnReceiveProducts isDetailPage={false} />
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
            </Col>
          </Row>
        </div>
        <ReturnBottomBar
          onSubmit={() => handleSubmit()}
          onCancel={() => handleCancel()}
          isCanSubmit={isCanSubmit}
          isExchange={isExchange}
          isStepExchange={isStepExchange}
          handleIsStepExchange={handleIsStepExchange}
        />
      </React.Fragment>
    );
  };

  useEffect(() => {
    setShippingFeeCustomer(10000);
    if (orderId) {
      dispatch(OrderDetailAction(orderId, onGetDetailSuccess));
    } else {
      setError(true);
    }
  }, [dispatch, orderId, onGetDetailSuccess]);

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
      isError={isError}
      title="Trả hàng cho đơn hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: `${UrlConfig.HOME}`,
        },
        {
          name: "Đơn hàng",
        },
        {
          name: "Trả hàng",
        },
        {
          name: `Tạo đơn trả hàng cho đơn hàng ${orderId}`,
        },
      ]}
    >
      {isCanReturn ? renderIfCanReturn() : renderIfCannotReturn()}
    </ContentContainer>
  );
};

export default ScreenReturnDetail;
