import { Col, Form, Row } from "antd";
import ContentContainer from "component/container/content.container";
import SidebarOrderDetailExtraInformation from "component/order/Sidebar/SidebarOrderDetailExtraInformation";
import UrlConfig from "config/url.config";
import { OrderReturnSingleContext } from "contexts/order-return/order-return-single-context";
import { getCustomerDetailAction } from "domain/actions/customer/customer.action";
import {
  getLoyaltyPoint,
  getLoyaltyUsage,
} from "domain/actions/loyalty/loyalty.action";
import {
  actionGetOrderReturnDetails,
  actionOrderRefund,
  actionSetIsReceivedOrderReturn,
} from "domain/actions/order/order-return.action";
import { PaymentMethodGetList } from "domain/actions/order/order.action";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  OrderPaymentResponse,
  OrderResponse,
  OrderReturnModel,
  ReturnProductModel,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { FulFillmentStatus, PaymentMethodCode } from "utils/Constants";
import UpdateCustomerCard from "../../component/update-customer-card";
import CardReturnMoneyPageDetail from "../components/CardReturnMoney/CardReturnMoneyPageDetail";
import CardReturnReceiveProducts from "../components/CardReturnReceiveProducts";
import CardShowReturnProducts from "../components/CardShowReturnProducts";
import OrderReturnActionHistory from "../components/Sidebar/OrderReturnActionHistory";
import OrderShortDetailsReturn from "../components/Sidebar/OrderShortDetailsReturn";

type PropType = {};
type OrderParam = {
  id: string;
};

const ScreenReturnDetail = (props: PropType) => {
  let { id } = useParams<OrderParam>();
  let returnOrderId = parseInt(id);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [isError, setError] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerResponse | null>(
    null
  );
  const [listPaymentMethods, setListPaymentMethods] = useState<
    Array<PaymentMethodResponse>
  >([]);

  const [isReceivedReturnProducts, setIsReceivedReturnProducts] =
    useState(false);
  const [listReturnProducts, setListReturnProducts] = useState<
    ReturnProductModel[]
  >([]);
  const [payments, setPayments] = useState<Array<OrderPaymentResponse>>([]);

  const [countChangeSubStatus, setCountChangeSubStatus] = useState<number>(0);

  //loyalty
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<
    Array<LoyaltyUsageResponse>
  >([]);

  const handleReceivedReturnProducts = () => {
    setIsReceivedReturnProducts(true);
    dispatch(
      actionSetIsReceivedOrderReturn(returnOrderId, () => {
        dispatch(
          actionGetOrderReturnDetails(
            returnOrderId,
            (data: OrderReturnModel) => {
              if (!data) {
                setError(true);
              } else {
                let _data = { ...data };
                setOrderDetail(_data);
              }
              setCountChangeSubStatus(countChangeSubStatus + 1);
            }
          )
        );
      })
    );
  };

  const [isShowPaymentMethod, setIsShowPaymentMethod] = useState(false);

  const initialFormValue = {
    returnMoneyField: [
      { returnMoneyMethod: undefined, returnMoneyNote: undefined },
    ],
  };

  const handleReturnMoney = () => {
    form.validateFields().then(() => {
      const formValue = form.getFieldsValue();
      if (formValue.returnMoneyField && formValue.returnMoneyField[0]) {
        const formValuePayment = formValue.returnMoneyField[0];
        let returnMoneyMethod = listPaymentMethods.find((single) => {
          return single.id === formValuePayment.returnMoneyMethod;
        });
        if (returnMoneyMethod) {
          const payments = [
            {
              payment_method_id: returnMoneyMethod.id,
              payment_method: returnMoneyMethod.name,
              name: returnMoneyMethod.name,
              note: formValuePayment.returnMoneyNote || "",
              amount: 0,
              paid_amount:
                totalAmountReturnToCustomer || 0,
              return_amount:
                totalAmountReturnToCustomer || 0,
              customer_id: OrderDetail?.customer_id,
            },
          ];
          dispatch(
            actionOrderRefund(returnOrderId, { payments }, (response) => {
              dispatch(
                actionGetOrderReturnDetails(
                  returnOrderId,
                  (data: OrderReturnModel) => {
                    if (!data) {
                      setError(true);
                    } else {
                      let _data = { ...data };
                      setOrderDetail(_data);
                      if (_data.payments) {
                        setPayments(_data.payments);
                      }
                      setCountChangeSubStatus(countChangeSubStatus + 1);
                    }
                  }
                )
              );
              setIsShowPaymentMethod(false);
            })
          );
        }
      }
    });
  };

  const totalAmountReturnToCustomer = OrderDetail?.total;

  /**
   * theme context data
   */
  const orderReturnSingleContextData = {
    orderDetail: OrderDetail,
    listReturnProducts,
  };

  useEffect(() => {
    if (!Number.isNaN(returnOrderId)) {
      dispatch(
        actionGetOrderReturnDetails(returnOrderId, (data: OrderReturnModel) => {
          console.log("data", data);
          setLoadingData(false);
          setIsReceivedReturnProducts(data.received);
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
            if (_data.items) {
              let returnProductFormatted: ReturnProductModel[] =
                _data.items.map((single) => {
                  return {
                    ...single,
                    maxQuantityCanBeReturned: single.quantity,
                  };
                });
              setListReturnProducts(returnProductFormatted);
            }
            if (_data.payments) {
              setPayments(_data.payments);
            }
          }
        })
      );
    } else {
      setError(true);
    }
  }, [dispatch, returnOrderId]);

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(getCustomerDetailAction(OrderDetail?.customer_id, setCustomerDetail));
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    if (customerDetail != null) {
      dispatch(getLoyaltyPoint(customerDetail.id, setLoyaltyPoint));
    } else {
      setLoyaltyPoint(null);
    }
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch, customerDetail]);

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

  // check open tab url
  const urlLinkCheck = `${process.env.PUBLIC_URL}${UrlConfig.ORDER_SETTINGS}`;
  console.log("urlLinkCheck", urlLinkCheck);
  console.log("process.env.PUBLIC_URL", process.env.PUBLIC_URL);

  return (
    <OrderReturnSingleContext.Provider value={orderReturnSingleContextData}>
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
            name: OrderDetail?.code ? `Chi tiết đơn trả hàng ${OrderDetail?.code}` : "Đang tải dữ liệu...",
          },
        ]}
      >
        <div className="orders">
          <Row gutter={24} style={{ marginBottom: "70px" }}>
            <Col md={18}>
              <Form
                layout="vertical"
                initialValues={initialFormValue}
                form={form}
              >
                <UpdateCustomerCard
                  OrderDetail={OrderDetail}
                  customerDetail={customerDetail}
                  loyaltyPoint={loyaltyPoint}
                  loyaltyUsageRules={loyaltyUsageRules}
                />
                <CardShowReturnProducts
                  listReturnProducts={listReturnProducts}
                  pointUsing={OrderDetail?.point_refund}
                  totalAmountReturnToCustomer={totalAmountReturnToCustomer}
                  isDetailPage
									OrderDetail={OrderDetail}
                />
                <CardReturnMoneyPageDetail
                  listPaymentMethods={listPaymentMethods}
                  payments={payments}
                  totalAmountReturnToCustomer={totalAmountReturnToCustomer}
                  isShowPaymentMethod={isShowPaymentMethod}
                  setIsShowPaymentMethod={setIsShowPaymentMethod}
                  handleReturnMoney={handleReturnMoney}
                />
                <CardReturnReceiveProducts
                  isDetailPage
                  isReceivedReturnProducts={isReceivedReturnProducts}
                  handleReceivedReturnProducts={handleReceivedReturnProducts}
                />
              </Form>
            </Col>
            <Col md={6}>
              <OrderShortDetailsReturn OrderDetail={OrderDetail} />
              <OrderReturnActionHistory
                orderId={id}
                countChangeSubStatus={countChangeSubStatus}
              />
              <SidebarOrderDetailExtraInformation OrderDetail={OrderDetail} />
            </Col>
          </Row>
        </div>
      </ContentContainer>
    </OrderReturnSingleContext.Provider>
  );
};

export default ScreenReturnDetail;
