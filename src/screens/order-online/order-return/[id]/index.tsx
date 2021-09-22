import { Col, Row } from "antd";
import ContentContainer from "component/container/content.container";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import UrlConfig from "config/url.config";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import {
  actionGetOrderReturnDetails,
  actionSetIsReceivedOrderReturn,
} from "domain/actions/order/order-return.action";
import { PaymentMethodGetList } from "domain/actions/order/order.action";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  OrderResponse,
  OrderReturnModel,
  ReturnProductModel,
} from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { FulFillmentStatus } from "utils/Constants";
import UpdateCustomerCard from "../../component/update-customer-card";
import CardReturnOrder from "../components/CardReturnOrder";
import CardReturnProducts from "../components/CardReturnProducts";
import CardReturnReceiveProducts from "../components/CardReturnReceiveProducts";
import OrderMoreDetails from "../components/Sidebar/OrderMoreDetails";
import OrderShortDetails from "../components/Sidebar/OrderShortDetails";

type PropType = {};
type OrderParam = {
  id: string;
};

const ScreenReturnDetail = (props: PropType) => {
  let { id } = useParams<OrderParam>();
  let returnOrderId = parseInt(id);
  const isDetailPage = id ? true : false;
  const dispatch = useDispatch();

  const [isError, setError] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerResponse | null>(
    null
  );

  const [isReceivedReturnProducts, setIsReceivedReturnProducts] =
    useState(false);

  const [discountValue, setDisCountValue] = useState<number>(0);
  const [listReturnProducts, setListReturnProducts] = useState<
    ReturnProductModel[]
  >([]);

  const handleReceivedReturnProducts = () => {
    setIsReceivedReturnProducts(true);
    dispatch(actionSetIsReceivedOrderReturn(returnOrderId, () => {}));
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
                    maxQuantity: single.quantity,
                  };
                });
              setListReturnProducts(returnProductFormatted);
            }
            // let formatted: ReturnProductModel[] = _data.items.map((single) => {
            //   return {
            //     ...single,
            //     maxQuantity: single.quantity,
            //   };
            // });
            // setListReturnProducts(formatted);
            // setAmountReturn(0);
          }
        })
      );
    } else {
      setError(true);
    }
  }, [dispatch, returnOrderId]);

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(CustomerDetail(OrderDetail?.customer_id, setCustomerDetail));
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    dispatch(
      PaymentMethodGetList((response) => {
        // let result = response.filter(
        //   (single) => single.code !== PaymentMethodCode.CARD
        // );
        // setListPaymentMethods(result);
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
            {!isDetailPage && (
              <CardReturnOrder isDetailPage={isDetailPage} isExchange={false} />
            )}
            <CardReturnProducts
              discountValue={discountValue}
              listReturnProducts={listReturnProducts}
              isDetailPage={true}
            />
            {/* <CardReturnMoney
              listPaymentMethods={listPaymentMethods}
              amountReturn={amountReturn}
              payments={payments}
              handlePayments={handlePayments}
              isDetailPage={isDetailPage}
            /> */}
            <CardReturnReceiveProducts
              isDetailPage={isDetailPage}
              isReceivedReturnProducts={isReceivedReturnProducts}
              handleReceivedReturnProducts={handleReceivedReturnProducts}
            />
          </Col>
          <Col md={6}>
            <OrderShortDetails OrderDetail={OrderDetail} />
            <SubStatusOrder
              subStatusId={OrderDetail?.sub_status_id}
              status={OrderDetail?.status}
              orderId={returnOrderId}
              fulfillments={OrderDetail?.fulfillments}
              handleChangeSubStatus={() => {}}
            />
            <OrderMoreDetails OrderDetail={OrderDetail} />
          </Col>
        </Row>
      </div>
    </ContentContainer>
  );
};

export default ScreenReturnDetail;
