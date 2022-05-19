import { Col, Form, Row } from "antd";
import ContentContainer from "component/container/content.container";
import SidebarOrderDetailExtraInformation from "component/order/Sidebar/SidebarOrderDetailExtraInformation";
import UrlConfig from "config/url.config";
import { OrderReturnSingleContext } from "contexts/order-return/order-return-single-context";
import { getCustomerDetailAction } from "domain/actions/customer/customer.action";
import {
  getLoyaltyPoint,
  getLoyaltyUsage
} from "domain/actions/loyalty/loyalty.action";
import {
  actionGetOrderReturnCalculateRefund,
  actionGetOrderReturnDetails,
  actionOrderRefund,
  actionSetIsReceivedOrderReturn
} from "domain/actions/order/order-return.action";
import { OrderDetailAction, PaymentMethodGetList } from "domain/actions/order/order.action";
import { OrderReturnCalculateRefundRequestModel } from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  OrderPaymentResponse,
  OrderResponse,
  OrderReturnModel,
  ReturnProductModel
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { getRefundInformationService } from "service/order/order.service";
import { getOrderTotalPaymentAmountReturn, isOrderFromPOS } from "utils/AppUtils";
import { FulFillmentStatus, PaymentMethodCode } from "utils/Constants";
import { findPaymentMethodByCode, isOrderDetailHasPointPayment } from "utils/OrderUtils";
import { getTotalPriceOfAllLineItem } from "utils/POUtils";
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

  const [refund, setRefund] = useState({
    point: 0,
    money: 0,
  })

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
      { returnMoneyMethod: PaymentMethodCode.CASH, returnMoneyNote: undefined },
    ],
  };

  const handleReturnMoney = () => {
    form.validateFields().then(() => {
      const formValue = form.getFieldsValue();
      if (formValue.returnMoneyField && formValue.returnMoneyField[0]) {
        const formValuePayment = formValue.returnMoneyField[0];
        let returnMoneyMethod = listPaymentMethods.find((single) => {
          return single.code === formValuePayment.returnMoneyMethod;
        });
        if (returnMoneyMethod) {
          let payments = [
            {
              payment_method_id: returnMoneyMethod.id,
              payment_method: returnMoneyMethod.name,
              name: returnMoneyMethod.name,
              note: formValuePayment.returnMoneyNote || "",
              amount: Math.ceil(totalAmountReturnToCustomer || 0),
              paid_amount:
                Math.ceil(totalAmountReturnToCustomer || 0) ,
              return_amount: 0,
              customer_id: OrderDetail?.customer_id,
              payment_method_code: returnMoneyMethod.code,
            },
          ];
          if(refund.money > 0 && refund.point > 0) {
            const pointPaymentMethod = findPaymentMethodByCode(listPaymentMethods, PaymentMethodCode.POINT);
            if(pointPaymentMethod) {
              payments.push({
                payment_method_id: pointPaymentMethod.id,
                payment_method: pointPaymentMethod.name,
                name: pointPaymentMethod.name,
                note: "",
                amount: refund.money,
                paid_amount: refund.money,
                return_amount: 0,
                customer_id: OrderDetail?.customer_id,
                payment_method_code: pointPaymentMethod.code,
            })
          }}
          console.log('payments', payments);
          return;
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

  const totalAmountReturnToCustomer = useMemo(() => {
    return (OrderDetail?.total || 0) - refund.money;
  }, [OrderDetail?.total, refund.money])
 
  /**
   * theme context data
   */
  const orderReturnSingleContextData = {
    orderDetail: OrderDetail,
    listReturnProducts,
  };

  const checkIfHasReturnMoneyAll = (OrderDetail?: OrderResponse ) => {
    // const total = getOrderTotalPaymentAmount(OrderDetail?.payments || []);
    const total = getOrderTotalPaymentAmountReturn(OrderDetail?.payments || []);
    return total >= Math.floor(OrderDetail?.money_refund || 0)
  };

  const calculateRefund= useCallback(
    (response: OrderResponse, OrderDetail: OrderResponse | null) => {
      console.log('response', response);
      let isUsingPoint = isOrderDetailHasPointPayment(response, listPaymentMethods);
      console.log('isUsingPoint', isUsingPoint);
      if(isUsingPoint) {
        const orderReturns = response.order_returns;
        const currentOrderReturn = orderReturns?.find(single => single.id === OrderDetail?.id);
        console.log('currentOrderReturn', currentOrderReturn);
        if(currentOrderReturn && OrderDetail?.customer_id && currentOrderReturn.items) {
          getRefundInformationService(OrderDetail?.customer_id, response?.id).then(response => {
            console.log('response', response);
            const currentRefund = response.data.find(single => single.sub_order_id === OrderDetail.id);
            if(currentRefund) {
              setRefund({
                money: currentRefund.money_point,
                point: currentRefund.change_point,
              })
            }
          })
          // const refund_money = currentOrderReturn.total;
          // const otherOrderReturnArr = orderReturns?.filter(single => single.id !== OrderDetail?.id) || []
          // const currentOrderReturnArr:OrderResponse[] = [{
          //   ...currentOrderReturn,
          //   id: response.id,
          //   money_refund: undefined,
          //   point_refund :undefined,
          // }];
          // let return_items = [...otherOrderReturnArr, ...currentOrderReturnArr];
          // const params: OrderReturnCalculateRefundRequestModel = {
          //   customerId: OrderDetail?.customer_id,
          //   items: response.items,
          //   orderId: currentOrderReturn.id,
          //   refund_money,
          //   return_items,
          // };
          // dispatch(
          //   actionGetOrderReturnCalculateRefund(params, (response) => {
          //     console.log('response', response)
          //   })
          // );
        }
      }
    },
    [listPaymentMethods],
  )

  const handleOrderOriginId = useCallback(
    (orderOriginId: number|undefined, OrderDetail: OrderResponse | null) => {
      if (orderOriginId) {
        dispatch(OrderDetailAction(orderOriginId.toString(), (response) => {
          calculateRefund(response, OrderDetail);
        }));
      } 
    },
    [calculateRefund, dispatch],
  )

  useEffect(() => {
    if (!Number.isNaN(returnOrderId)) {
      dispatch(
        actionGetOrderReturnDetails(returnOrderId, (data: OrderReturnModel) => {
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

            const orderOriginId = _data.order_id; // tìm đơn gốc để lấy thông tin điểm
            handleOrderOriginId(orderOriginId, _data);
            if(!checkIfHasReturnMoneyAll(_data)) {
              setIsShowPaymentMethod(true)
            }
          }
        })
      );
    } else {
      setError(true);
    }
  }, [dispatch, handleOrderOriginId, returnOrderId]);

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
  }, [dispatch, customerDetail]);

  useEffect(() => {
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      PaymentMethodGetList((response) => {
        // let result = response.filter(
        //   (single) => single.code !== PaymentMethodCode.CARD
        // );
        // update: ko bỏ quẹt thẻ nữa
        let result = response.filter(
          (single) => single.code
        );
        setListPaymentMethods(result);
      })
    );
  }, [dispatch]);

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
            name: "Danh sách đơn trả hàng",
            path: isOrderFromPOS(OrderDetail) ? `${UrlConfig.OFFLINE_ORDERS}${UrlConfig.ORDERS_RETURN}` : `${UrlConfig.ORDER}${UrlConfig.ORDERS_RETURN}`,
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
                  pointUsing={refund.point}
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
