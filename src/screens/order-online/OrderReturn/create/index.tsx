import { Card, Col, Row, Tag } from "antd";
import ContentContainer from "component/container/content.container";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { actionCreateOrderReturn } from "domain/actions/order/order-return.action";
import {
  OrderDetailAction,
  PaymentMethodGetList,
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderSettingsModel } from "model/other/order/order-model";
import { OrderPaymentRequest, OrderRequest } from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  OrderLineItemResponse,
  OrderResponse,
  ReturnProductModel,
  StoreCustomResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { FulFillmentStatus, PaymentMethodCode } from "utils/Constants";
import { useQuery } from "utils/useQuery";
import UpdateCustomerCard from "../../component/update-customer-card";
import CardReturnMoney from "../components/CardReturnMoney";
import CardReturnOrder from "../components/CardReturnOrder";
import CardReturnProducts from "../components/CardReturnProducts";
import CardReturnReceiveProducts from "../components/CardReturnReceiveProducts";
import ReturnBottomBar from "../components/ReturnBottomBar";

type PropType = {
  id?: string;
};

const ScreenReturnDetail = (props: PropType) => {
  const [isError, setError] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const query = useQuery();
  let orderID = query.get("orderID");

  let OrderId = orderID ? parseInt(orderID) : undefined;
  const isFirstLoad = useRef(true);

  const dispatch = useDispatch();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);

  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [listReturnProducts, setListReturnProducts] = useState<
    ReturnProductModel[]
  >([]);
  const [listOrderProducts, setListOrderProducts] = useState<
    OrderLineItemResponse[]
  >([]);
  const [OrderDetailAllFulfillment, setOrderDetailAllFulfillment] =
    useState<OrderResponse | null>(null);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [customerDetail, setCustomerDetail] = useState<CustomerResponse | null>(
    null
  );
  const [listPaymentMethods, setListPaymentMethods] = useState<
    Array<PaymentMethodResponse>
  >([]);
  const [countChangeSubStatus, setCountChangeSubStatus] = useState<number>(0);
  const [amountReturn, setAmountReturn] = useState<number>(100000);
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);

  const [orderSettings, setOrderSettings] = useState<OrderSettingsModel>({
    chonCuaHangTruocMoiChonSanPham: false,
    cauHinhInNhieuLienHoaDon: 1,
  });

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );
  const onGetDetailSuccess = useCallback((data: false | OrderResponse) => {
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
      setListOrderProducts(_data.items);
      setOrderDetailAllFulfillment(data);
    }
  }, []);

  const handleChangeSubStatus = () => {
    setCountChangeSubStatus(countChangeSubStatus + 1);
  };

  const handlePayments = (value: Array<OrderPaymentRequest>) => {
    setPayments(value);
  };

  const handleSubmit = () => {
    console.log("OrderDetail", OrderDetail);
    if (OrderDetail && listReturnProducts) {
      console.log("333");
      let abc: OrderRequest = {
        ...OrderDetail,
        action: "",
        delivery_service_provider_id: null,
        delivery_fee: null,
        shipper_code: "",
        shipper_name: "",
        shipping_fee_paid_to_three_pls: null,
        requirements: null,
        items: listReturnProducts,
        fulfillments: [],
      };
      dispatch(
        actionCreateOrderReturn(abc, (response) => {
          console.log("response", response);
        })
      );
    }
  };

  const handleCancel = () => {
    console.log("333");
  };

  useEffect(() => {
    if (isFirstLoad.current) {
      if (OrderId) {
        dispatch(OrderDetailAction(OrderId, onGetDetailSuccess));
      } else {
        setError(true);
      }
    }
    isFirstLoad.current = false;
  }, [dispatch, OrderId, onGetDetailSuccess]);

  useLayoutEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(CustomerDetail(OrderDetail?.customer_id, setCustomerDetail));
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    if (OrderDetail?.store_id != null) {
      dispatch(StoreDetailAction(OrderDetail?.store_id, setStoreDetail));
    }
  }, [dispatch, OrderDetail?.store_id]);

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

  useEffect(() => {
    setOrderSettings({
      chonCuaHangTruocMoiChonSanPham: true,
      cauHinhInNhieuLienHoaDon: 3,
    });
  }, []);

  if (!orderID) {
    setLoadingData(false);
    return null;
  }

  return (
    <ContentContainer
      // isLoading={loadingData}
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
          name: `Tạo đơn trả hàng cho đơn hàng ${orderID}`,
        },
      ]}
    >
      <div className="orders">
        <Row gutter={24} style={{ marginBottom: "70px" }}>
          <Col md={18}>
            {/*--- customer ---*/}
            <UpdateCustomerCard
              OrderDetail={OrderDetail}
              customerDetail={customerDetail}
            />
            {/*--- end customer ---*/}
            <CardReturnOrder />
            <CardReturnProducts
              listReturnProducts={listReturnProducts}
              handleReturnProducts={(
                listReturnProducts: OrderLineItemResponse[]
              ) => setListReturnProducts(listReturnProducts)}
              listOrderProducts={listOrderProducts}
            />
            <CardReturnMoney
              listPaymentMethods={listPaymentMethods}
              amountReturn={amountReturn}
              payments={payments}
              handlePayments={handlePayments}
            />
            <CardReturnReceiveProducts />
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
            </Card>
            <SubStatusOrder
              subStatusId={OrderDetail?.sub_status_id}
              status={OrderDetail?.status}
              orderId={OrderId}
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
              <Row className="" gutter={5} style={{ flexDirection: "column" }}>
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
            </Card>
          </Col>
        </Row>
      </div>
      <ReturnBottomBar
        onSubmit={() => handleSubmit()}
        onCancel={() => handleCancel()}
      />
    </ContentContainer>
  );
};

export default ScreenReturnDetail;
