import { Col, Form, FormInstance, Input, Row } from "antd";
import WarningIcon from "assets/icon/ydWarningIcon.svg";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { StoreDetailCustomAction } from "domain/actions/core/store.action";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import {
  orderCreateAction,
  OrderDetailAction,
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderSettingsModel } from "model/other/order/order-model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  BillingAddress,
  FulFillmentRequest,
  OrderDiscountRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
  OrderRequest,
  ShipmentRequest,
  ShippingAddress,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  FulFillmentResponse,
  // OrderLineItemResponse,
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getAmountPaymentRequest,
  getTotalAmountAfferDiscount,
} from "utils/AppUtils";
import {
  MoneyPayThreePls,
  OrderStatus,
  PaymentMethodOption,
  ShipmentMethod,
  ShipmentMethodOption,
  TaxTreatment,
} from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";
import OrderDetailBottomBar from "./component/order-detail/BottomBar";
import CardCustomer from "./component/order-detail/CardCustomer";
import CardPayment from "./component/order-detail/CardPayment";
import CardProduct from "./component/order-detail/CardProduct";
import CardShipment from "./component/order-detail/CardShipment";
import OrderDetailSidebar from "./component/order-detail/Sidebar";
import SaveAndConfirmOrder from "./modal/save-confirm.modal";

let typeButton = "";

export default function Order() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(
    null
  );
  const [items, setItems] = useState<Array<OrderLineItemRequest>>([]);
  const [itemGifts, setItemGifts] = useState<Array<OrderLineItemRequest>>([]);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [shipmentMethod, setShipmentMethod] = useState<number>(
    ShipmentMethodOption.DELIVER_LATER
  );
  const [paymentMethod, setPaymentMethod] = useState<number>(3);
  const [hvc, setHvc] = useState<number | null>(null);
  const [feeGhtk, setFeeGhtk] = useState<number | null>(null);
  const [shippingFeeCustomer, setShippingFeeCustomer] = useState<number | null>(
    null
  );
  const [shippingFeeCustomerHVC, setShippingFeeCustomerHVC] = useState<
    number | null
  >(null);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  console.log("payments", payments);
  const [fulfillments, setFulfillments] = useState<Array<FulFillmentResponse>>(
    []
  );
  const [tags, setTag] = useState<string>("");
  const formRef = createRef<FormInstance>();
  const [isVisibleSaveAndConfirm, setIsVisibleSaveAndConfirm] =
    useState<boolean>(false);
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [serviceType, setServiceType] = useState<string>();
  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  const [orderSettings, setOrderSettings] = useState<OrderSettingsModel>({
    chonCuaHangTruocMoiChonSanPham: false,
    cauHinhInNhieuLienHoaDon: 1,
  });

  const queryParams = useQuery();
  const actionParam = queryParams.get("action") || null;
  const cloneIdParam = queryParams.get("cloneId") || null;
  const onChangeInfoCustomer = (_objCustomer: CustomerResponse | null) => {
    setCustomer(_objCustomer);
  };
  const onChangeShippingAddress = (
    _objShippingAddress: ShippingAddress | null
  ) => {
    setShippingAddress(_objShippingAddress);
  };

  const onChangeBillingAddress = (
    _objBillingAddress: BillingAddress | null
  ) => {
    setBillingAddress(_objBillingAddress);
  };

  const ChangeShippingFeeCustomer = (value: number | null) => {
    setShippingFeeCustomer(value);
  };
  const ChangeShippingFeeCustomerHVC = (value: number | null) => {
    setShippingFeeCustomerHVC(value);
  };

  const onChangeInfoProduct = (
    _items: Array<OrderLineItemRequest>,
    amount: number,
    discount_rate: number,
    discount_value: number
  ) => {
    setItems(_items);
    setDiscountRate(discount_rate);
    setDiscountValue(discount_value);
    setOrderAmount(amount);
  };

  const onStoreSelect = (storeId: number) => {
    setStoreId(storeId);
  };

  const changePaymentMethod = (value: number) => {
    setPaymentMethod(value);
  };

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    setPayments(value);
  };

  const onShipmentSelect = (value: number) => {
    setShipmentMethod(value);
  };

  let initialRequest: OrderRequest = {
    action: "", //finalized
    store_id: null,
    price_type: "retail_price", //giá bán lẻ giá bán buôn
    tax_treatment: TaxTreatment.INCLUSIVE,
    delivery_service_provider_id: null,
    shipper_code: null,
    shipper_name: "",
    delivery_fee: null,
    shipping_fee_informed_to_customer: null,
    shipping_fee_paid_to_three_pls: null,
    dating_ship: moment(),
    requirements: null,
    source_id: null,
    note: "",
    tags: "",
    customer_note: "",
    account_code: userReducer.account?.code,
    assignee_code: null,
    customer_id: null,
    reference_code: "",
    url: "",
    total_line_amount_after_line_discount: null,
    total: null,
    total_tax: "",
    total_discount: null,
    currency: "VNĐ",
    items: [],
    discounts: [],
    fulfillments: [],
    shipping_address: null,
    billing_address: null,
    payments: [],
  };
  const [isLoadForm, setIsLoadForm] = useState(false);
  const [initialForm, setInitialForm] = useState<OrderRequest>({
    ...initialRequest,
    shipping_address: shippingAddress,
    billing_address: billingAddress,
  });

  let isCloneOrder = false;
  if (actionParam === "clone" && cloneIdParam) {
    isCloneOrder = true;
  }

  const onChangeTag = useCallback(
    (value: []) => {
      const strTag = value.join(", ");
      setTag(strTag);
    },
    [setTag]
  );
  //Fulfillment Request
  const createFulFillmentRequest = (value: OrderRequest) => {
    let shipmentRequest = createShipmentRequest(value);
    let request: FulFillmentRequest = {
      store_id: value.store_id,
      account_code: userReducer.account?.code,
      assignee_code: value.assignee_code,
      delivery_type: "",
      stock_location_id: null,
      payment_status: "",
      total: orderAmount,
      total_tax: null,
      total_discount: null,
      total_quantity: null,
      discount_rate: discountRate,
      discount_value: discountValue,
      discount_amount: null,
      total_line_amount_after_line_discount: null,
      shipment: shipmentRequest,
      items: items,
    };

    let listFulfillmentRequest = [];
    if (
      paymentMethod !== PaymentMethodOption.POSTPAYMENT ||
      shipmentMethod === ShipmentMethodOption.SELF_DELIVER ||
      shipmentMethod === ShipmentMethodOption.PICK_AT_STORE
    ) {
      listFulfillmentRequest.push(request);
    }

    if (shipmentMethod === ShipmentMethodOption.PICK_AT_STORE) {
      request.delivery_type = "pick_at_store";
    }

    if (
      paymentMethod === PaymentMethodOption.POSTPAYMENT &&
      shipmentMethod === ShipmentMethodOption.DELIVER_LATER &&
      typeButton === OrderStatus.FINALIZED
    ) {
      request.shipment = null;
      listFulfillmentRequest.push(request);
    }
    return listFulfillmentRequest;
  };

  const createShipmentRequest = (value: OrderRequest) => {
    let objShipment: ShipmentRequest = {
      delivery_service_provider_id: null, //id đối tác vận chuyển
      delivery_service_provider_type: "", //shipper
      shipper_code: "",
      shipper_name: "",
      handover_id: null,
      service: null,
      fee_type: "",
      fee_base_on: "",
      delivery_fee: null,
      shipping_fee_paid_to_three_pls: null,
      expected_received_date: value.dating_ship?.utc().format(),
      reference_status: "",
      shipping_fee_informed_to_customer: null,
      reference_status_explanation: "",
      cod: null,
      cancel_reason: "",
      tracking_code: "",
      tracking_url: "",
      received_date: "",
      sender_address_id: null,
      note_to_shipper: "",
      requirements: value.requirements,
      sender_address: null,
      office_time: officeTime,
    };

    switch (shipmentMethod) {
      case ShipmentMethodOption.DELIVER_PARTNER:
        return {
          ...objShipment,
          delivery_service_provider_id: hvc,
          delivery_service_provider_type: "external_service",
          sender_address_id: storeId,
          shipping_fee_informed_to_customer:
            value.shipping_fee_informed_to_customer,
          service: serviceType!,
          shipping_fee_paid_to_three_pls:
            hvc === 1 ? feeGhtk : MoneyPayThreePls.VALUE,
        };

      case ShipmentMethodOption.SELF_DELIVER:
        return {
          ...objShipment,
          delivery_service_provider_type: "Shipper",
          shipper_code: value.shipper_code,
          shipping_fee_informed_to_customer:
            value.shipping_fee_informed_to_customer,
          shipping_fee_paid_to_three_pls: value.shipping_fee_paid_to_three_pls,
          cod:
            orderAmount +
            (shippingFeeCustomer ? shippingFeeCustomer : 0) -
            getAmountPaymentRequest(payments) -
            discountValue,
        };

      case ShipmentMethodOption.PICK_AT_STORE:
        objShipment.delivery_service_provider_type = "pick_at_store";
        let newCod = orderAmount;
        if (shippingFeeCustomer !== null) {
          if (
            orderAmount +
              shippingFeeCustomer -
              getAmountPaymentRequest(payments) >
            0
          ) {
            newCod =
              orderAmount +
              shippingFeeCustomer -
              getAmountPaymentRequest(payments);
          }
        } else {
          if (orderAmount - getAmountPaymentRequest(payments) > 0) {
            newCod = orderAmount - getAmountPaymentRequest(payments);
          }
        }
        return {
          ...objShipment,
          delivery_service_provider_type: "pick_at_store",
          cod: newCod,
        };

      case ShipmentMethodOption.DELIVER_LATER:
        return null;

      default:
        break;
    }
  };

  const createDiscountRequest = () => {
    let objDiscount: OrderDiscountRequest = {
      rate: discountRate,
      value: discountValue,
      amount: discountValue,
      promotion_id: null,
      reason: "",
      source: "",
    };
    let listDiscountRequest = [];
    if (discountRate === 0 && discountValue === 0) {
      return null;
    } else {
      listDiscountRequest.push(objDiscount);
    }
    return listDiscountRequest;
  };

  const createOrderCallback = useCallback(
    (value: OrderResponse) => {
      if (value.fulfillments && value.fulfillments.length > 0) {
        showSuccess("Đơn được lưu và duyệt thành công");
        history.push(`${UrlConfig.ORDER}/${value.id}`);
      } else {
        showSuccess("Đơn được lưu nháp thành công");
        history.push(`${UrlConfig.ORDER}/${value.id}`);
      }
    },
    [history]
  );

  const handleTypeButton = (type: string) => {
    typeButton = type;
  };

  //show modal save and confirm order ?
  const onCancelSaveAndConfirm = () => {
    setIsVisibleSaveAndConfirm(false);
  };

  const onOkSaveAndConfirm = () => {
    typeButton = OrderStatus.DRAFT;
    formRef.current?.submit();
    setIsVisibleSaveAndConfirm(false);
  };

  const showSaveAndConfirmModal = () => {
    if (
      shipmentMethod !== ShipmentMethodOption.DELIVER_LATER ||
      paymentMethod !== 3
    ) {
      setIsVisibleSaveAndConfirm(true);
    } else {
      typeButton = OrderStatus.DRAFT;
      formRef.current?.submit();
    }
  };
  const onFinish = (values: OrderRequest) => {
    const element2: any = document.getElementById("save-and-confirm");
    element2.disable = true;
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    let total_line_amount_after_line_discount =
      getTotalAmountAfferDiscount(items);
    //Nếu là lưu nháp Fulfillment = [], payment = []
    if (typeButton === OrderStatus.DRAFT) {
      values.fulfillments = [];
      values.payments = [];
      values.shipping_fee_informed_to_customer = 0;
      values.action = OrderStatus.DRAFT;
      values.total = orderAmount;
      values.shipping_fee_informed_to_customer = 0;
    } else {
      //Nếu là đơn lưu và duyệt
      values.fulfillments = lstFulFillment;
      values.action = OrderStatus.FINALIZED;
      values.payments = payments.filter((payment) => payment.amount > 0);
      values.total = orderAmount;
      if (
        values?.fulfillments &&
        values.fulfillments.length > 0 &&
        values.fulfillments[0].shipment
      ) {
        values.fulfillments[0].shipment.cod =
          orderAmount +
          (shippingFeeCustomer ? shippingFeeCustomer : 0) -
          getAmountPaymentRequest(payments) -
          discountValue;
      }
    }
    values.tags = tags;
    values.items = items.concat(itemGifts);
    values.discounts = lstDiscount;
    values.shipping_address = shippingAddress;
    values.billing_address = billingAddress;
    values.customer_id = customer?.id;
    values.total_line_amount_after_line_discount =
      total_line_amount_after_line_discount;
    if (!values.customer_id) {
      showError("Vui lòng chọn khách hàng và nhập địa chỉ giao hàng");
      const element: any = document.getElementById("search_customer");
      element?.focus();
    } else {
      if (items.length === 0) {
        showError("Vui lòng chọn ít nhất 1 sản phẩm");
        const element: any = document.getElementById("search_product");
        element?.focus();
      } else {
        if (shipmentMethod === ShipmentMethodOption.SELF_DELIVER) {
          if (values.delivery_service_provider_id === null) {
            showError("Vui lòng chọn đối tác giao hàng");
          } else {
            dispatch(orderCreateAction(values, createOrderCallback));
          }
        } else {
          if (
            shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER &&
            !serviceType
          ) {
            showError("Vui lòng chọn đơn vị vận chuyển");
          } else {
            dispatch(orderCreateAction(values, createOrderCallback));
          }
        }
      }
    }
  };

  const handleChangeProduct = (value: string) => {
    console.log("valueParent", value);
  };

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );
  const scroll = useCallback(() => {
    if (window.pageYOffset > 100) {
      setIsShowBillStep(true);
    } else {
      setIsShowBillStep(false);
    }
  }, []);

  const handleCardItems = (cardItems: Array<OrderLineItemRequest>) => {
    setItems(cardItems);
  };
  const renderOrder = () => {
    return (
      <ContentContainer
        title="Tạo mới đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: "/",
          },
          {
            name: "Đơn hàng",
          },
          {
            name: "Tạo mới đơn hàng",
          },
        ]}
        extra={<CreateBillStep status="draff" orderDetail={null} />}
      >
        <div className="orders">
          {isLoadForm && (
            <Form
              layout="vertical"
              initialValues={initialForm}
              ref={formRef}
              onFinishFailed={({ errorFields }: any) => {
                const element: any = document.getElementById(
                  errorFields[0].name.join("")
                );
                element?.focus();
                const y =
                  element?.getBoundingClientRect()?.top +
                  window.pageYOffset +
                  -250;
                window.scrollTo({ top: y, behavior: "smooth" });
              }}
              onFinish={onFinish}
            >
              <Form.Item noStyle hidden name="action">
                <Input />
              </Form.Item>
              <Form.Item noStyle hidden name="currency">
                <Input />
              </Form.Item>
              <Form.Item noStyle hidden name="account_code">
                <Input />
              </Form.Item>
              <Form.Item noStyle hidden name="tax_treatment">
                <Input />
              </Form.Item>
              <Form.Item noStyle hidden name="tags">
                <Input />
              </Form.Item>
              <Row gutter={20} style={{ marginBottom: "70px" }}>
                <Col md={18}>
                  <CardCustomer
                    InfoCustomerSet={onChangeInfoCustomer}
                    ShippingAddressChange={onChangeShippingAddress}
                    BillingAddressChange={onChangeBillingAddress}
                    parentCustomerDetail={customer}
                  />
                  <CardProduct
                    changeInfo={onChangeInfoProduct}
                    selectStore={onStoreSelect}
                    storeId={storeId}
                    shippingFeeCustomer={shippingFeeCustomer}
                    setItemGift={setItemGifts}
                    orderSettings={orderSettings}
                    formRef={formRef}
                    onChangeProduct={(value: string) =>
                      handleChangeProduct(value)
                    }
                    items={items}
                    handleCardItems={handleCardItems}
                  />
                  <CardShipment
                    setShipmentMethodProps={onShipmentSelect}
                    shipmentMethod={shipmentMethod}
                    storeDetail={storeDetail}
                    setShippingFeeInformedCustomer={ChangeShippingFeeCustomer}
                    setShippingFeeInformedCustomerHVC={
                      ChangeShippingFeeCustomerHVC
                    }
                    amount={orderAmount}
                    setPaymentMethod={setPaymentMethod}
                    paymentMethod={paymentMethod}
                    shippingFeeCustomer={shippingFeeCustomer}
                    shippingFeeCustomerHVC={shippingFeeCustomerHVC}
                    customerInfo={customer}
                    items={items}
                    discountValue={discountValue}
                    setOfficeTime={setOfficeTime}
                    officeTime={officeTime}
                    setServiceType={setServiceType}
                    setHVC={setHvc}
                    setFeeGhtk={setFeeGhtk}
                    payments={payments}
                    onPayments={onPayments}
                    fulfillments={fulfillments}
                    isCloneOrder={isCloneOrder}
                  />
                  <CardPayment
                    setSelectedPaymentMethod={changePaymentMethod}
                    payments={payments}
                    setPayments={onPayments}
                    paymentMethod={paymentMethod}
                    shipmentMethod={shipmentMethod}
                    amount={
                      orderAmount +
                      (shippingFeeCustomer ? shippingFeeCustomer : 0) -
                      discountValue
                    }
                    isCloneOrder={isCloneOrder}
                  />
                </Col>
                <Col md={6}>
                  <OrderDetailSidebar
                    accounts={accounts}
                    onChangeTag={onChangeTag}
                  />
                </Col>
              </Row>
              {isShowBillStep && (
                <OrderDetailBottomBar
                  formRef={formRef}
                  handleTypeButton={handleTypeButton}
                  isVisibleGroupButtons={true}
                  showSaveAndConfirmModal={showSaveAndConfirmModal}
                />
              )}
            </Form>
          )}
        </div>
        <SaveAndConfirmOrder
          onCancel={onCancelSaveAndConfirm}
          onOk={onOkSaveAndConfirm}
          visible={isVisibleSaveAndConfirm}
          okText="Đồng ý"
          cancelText="Hủy"
          title="Bạn có chắc chắn lưu nháp đơn hàng này không?"
          text="Đơn hàng này sẽ bị xóa thông tin giao hàng hoặc thanh toán nếu có"
          icon={WarningIcon}
        />
      </ContentContainer>
    );
  };

  useEffect(() => {
    if (storeId != null) {
      dispatch(StoreDetailCustomAction(storeId, setStoreDetail));
    }
  }, [dispatch, storeId]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  //windows offset
  useEffect(() => {
    window.addEventListener("scroll", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
    };
  }, [scroll]);

  /**
   * orderSettings
   */
  useEffect(() => {
    setOrderSettings({
      chonCuaHangTruocMoiChonSanPham: true,
      cauHinhInNhieuLienHoaDon: 3,
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (isCloneOrder && cloneIdParam) {
        dispatch(
          OrderDetailAction(+cloneIdParam, (response) => {
            console.log("response", response);
            const { customer_id } = response;

            if (customer_id) {
              dispatch(
                CustomerDetail(customer_id, (responseCustomer) => {
                  setCustomer(responseCustomer);
                })
              );
            }
            if (response) {
              let responseItems: any = [...response.items];
              let newDatingShip = initialForm.dating_ship;
              let newShipperCode = initialForm.shipper_code;
              let new_shipping_fee_informed_to_customer =
                initialForm.shipping_fee_informed_to_customer;
              let new_payments = initialForm.payments;
              if (response.fulfillments && response.fulfillments[0]) {
                if (response?.fulfillments[0]?.shipment) {
                  newDatingShip = moment(
                    response.fulfillments[0]?.shipment?.expected_received_date
                  );
                  newShipperCode =
                    response.fulfillments[0]?.shipment?.shipper_code;
                  new_shipping_fee_informed_to_customer =
                    response.fulfillments[0]?.shipment
                      .shipping_fee_informed_to_customer;
                }
                if (response.payments && response.payments?.length > 0) {
                  new_payments = response.payments;
                  setPaymentMethod(2);
                  setPayments(new_payments);
                }
              }
              setItems(responseItems);
              setOrderAmount(response.total);
              setInitialForm({
                ...initialForm,
                customer_note: response.customer_note,
                source_id: response.source_id,
                assignee_code: response.assignee_code,
                store_id: response.store_id,
                items: responseItems,
                dating_ship: newDatingShip,
                shipper_code: newShipperCode,
                shipping_fee_informed_to_customer:
                  new_shipping_fee_informed_to_customer,
                payments: new_payments,
                reference_code: response.reference_code,
                url: response.url,
                note: response.note,
                tags: response.tags,
              });
              let newShipmentMethod = ShipmentMethodOption.DELIVER_LATER;
              if (
                response.fulfillments &&
                response.fulfillments[0] &&
                response?.fulfillments[0]?.shipment
                  ?.delivery_service_provider_type
              ) {
                switch (
                  response.fulfillments[0].shipment
                    ?.delivery_service_provider_type
                ) {
                  case ShipmentMethod.SHIPPER:
                    newShipmentMethod = ShipmentMethodOption.SELF_DELIVER;
                    break;
                  case ShipmentMethod.EXTERNAL_SERVICE:
                    newShipmentMethod = ShipmentMethodOption.DELIVER_PARTNER;
                    break;
                  default:
                    break;
                }
                setShipmentMethod(newShipmentMethod);
                setFulfillments(response.fulfillments);
                if (response.store_id) {
                  setStoreId(response.store_id);
                }
              }
            }
            setIsLoadForm(true);
          })
        );
      } else {
        setIsLoadForm(true);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloneIdParam, dispatch, isCloneOrder]);

  return <React.Fragment>{renderOrder()}</React.Fragment>;
}
