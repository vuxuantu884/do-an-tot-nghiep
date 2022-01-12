import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Tooltip } from "antd";
import { HiChevronDoubleDown, HiChevronDoubleRight } from "react-icons/hi";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { OrderModel } from "model/order/order.model";
import NumberFormat from "react-number-format";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { formatCurrency, isNullOrUndefined } from "utils/AppUtils";
import { PageResponse } from "model/base/base-metadata.response";
import moment from "moment";
import { DeliveryServiceResponse, OrderLineItemResponse } from "model/response/order/order.response";
import { dangerColor, primaryColor } from "utils/global-styles/variables";
import { nameQuantityWidth, StyledPurchaseHistory } from "screens/customer/customer-detail/customerDetailStyled";
import EditNote from "screens/order-online/component/edit-note";
import { COD, FulFillmentStatus, OrderStatus, PaymentMethodCode, PoPaymentStatus, POS, ShipmentMethod } from "utils/Constants";
import { DeliveryServicesGetList, GetListOrderCustomerAction, getReturnsAction, updateOrderPartial } from "domain/actions/order/order.action";

import iconShippingFeeInformedToCustomer from "screens/order-online/component/OrderList/ListTable/images/iconShippingFeeInformedToCustomer.svg";
import iconShippingFeePay3PL from "screens/order-online/component/OrderList/ListTable/images/iconShippingFeePay3PL.svg";
import iconWeight from "screens/order-online/component/OrderList/ListTable/images/iconWeight.svg";
import IconPaymentBank from "screens/order-online/component/OrderList/ListTable/images/paymentBank.svg";
import IconPaymentCard from "screens/order-online/component/OrderList/ListTable/images/paymentCard.svg";
import IconPaymentCod from "screens/order-online/component/OrderList/ListTable/images/paymentCod.svg";
import IconPaymentCash from "screens/order-online/component/OrderList/ListTable/images/paymentMoney.svg";
import IconPaymentPoint from "screens/order-online/component/OrderList/ListTable/images/paymentPoint.svg";
import IconStore from "screens/order-online/component/OrderList/ListTable/images/store.svg";
import { ReturnModel } from "model/order/return.model";


type PurchaseHistoryProps = {
  customerId: number;
};

function PurchaseHistory(props: PurchaseHistoryProps) {
  const { customerId } = props;

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

  const [deliveryServices, setDeliveryServices] = useState<
    Array<DeliveryServiceResponse>
  >([]);
  
  
  const dispatch = useDispatch();

  // get order returned
  const [orderReturnedList, setOrderReturnedList] = useState<Array<ReturnModel>>([]);

  const updateOrderReturnedList = useCallback(
    (data: PageResponse<ReturnModel> | false) => {
      setTableLoading(false);
      if (!!data) {
        setOrderReturnedList(data.items);
      }
    },
    []
  );
  
  useEffect(() => {
    if (customerId) {
      const orderReturnedParams: any = { customer_ids: [customerId] };
      setTableLoading(true);
      dispatch(getReturnsAction(orderReturnedParams, updateOrderReturnedList));
    }
  }, [customerId, dispatch, updateOrderReturnedList]);
  // end get order returned

  // handle get purchase history
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [queryParams, setQueryParams] = useState<any>({
    limit: 10,
    page: 1,
    customer_ids: null,
  });

  const [orderHistoryData, setOrderHistoryData] = useState<PageResponse<OrderModel>>({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const onPageChange = useCallback(
    (page, limit) => {
      queryParams.page = page;
      queryParams.limit = limit;
      setQueryParams({ ...queryParams });
    },
    [queryParams, setQueryParams]
  );

  const updateOrderHistoryData = useCallback(
    (data: PageResponse<OrderModel> | false) => {
      setTableLoading(false);
      if (data) {
        setOrderHistoryData(data);
      }
    },
    []
  );
  
  useEffect(() => {
    if (customerId) {
      queryParams.customer_ids = [customerId];
      setTableLoading(true);
      dispatch(GetListOrderCustomerAction(queryParams, updateOrderHistoryData));
    }
  }, [customerId, dispatch, queryParams, updateOrderHistoryData]);

  const orderHistoryList = useCallback(() => {
    const newOrderHistoryList = orderHistoryData?.items.map((order) => {
      const order_return = orderReturnedList.filter(orderReturn => orderReturn.order_id.toString() === order.id.toString());
      const newOrder = {...order, order_return: order_return};
      return newOrder;
    });

    return newOrderHistoryList;
  }, [orderHistoryData?.items, orderReturnedList]);
  // end handle get purchase history
  
  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setDeliveryServices(response);
      })
    );
  }, [dispatch]);

  const paymentIcons = [
		{
			payment_method_code: PaymentMethodCode.BANK_TRANSFER,
			icon: IconPaymentBank,
			tooltip: "Đã chuyển khoản",
		},
		{
			payment_method_code: PaymentMethodCode.QR_CODE,
			icon: IconPaymentBank,
			tooltip: "Mã QR",
		},
		{
			payment_method_code: PaymentMethodCode.CARD,
			icon: IconPaymentCard,
			tooltip: "Đã quẹt thẻ",
		},
		{
			payment_method_code: PaymentMethodCode.CASH,
			icon: IconPaymentCash,
			tooltip: "Đã thanh toán tiền mặt",
		},
		{
			payment_method_code: COD.code,
			icon: IconPaymentCod,
			tooltip: "Thu người nhận",
		},
		{
			payment_method_code: null,
			icon: IconPaymentCash,
			tooltip: null,
		},
		{
			payment_method_code: PaymentMethodCode.POINT,
			icon: IconPaymentPoint,
			tooltip: "Tiêu điểm",
		},
	];

  // eslint-disable-next-line react-hooks/exhaustive-deps
	const renderOrderPaymentMethods = (orderDetail: OrderModel) => {
		let html = null;
		html = orderDetail.payments.map((payment, index) => {
			if (!payment.amount) {
				return null;
			}
			let selectedPayment = paymentIcons.find(
				(single) => single.payment_method_code === payment.payment_method_code
			);
			return (
				<div className="singlePayment" key={index}>
					{ payment.paid_amount < 0 ? 
						(
							<Tooltip title="Hoàn tiền">
								<img src={selectedPayment?.icon} alt="" />
								<span className="amount">{formatCurrency(payment.paid_amount)}</span>
							</Tooltip>
						) : (
							<Tooltip title={selectedPayment?.tooltip || payment.payment_method}>
								<img src={selectedPayment?.icon} alt="" />
								<span className="amount">{formatCurrency(payment.paid_amount)}</span>
							</Tooltip>
						)
					}
				</div>
			);
		});
		return html;
	};

	const renderOrderPayments = useCallback(
		(orderDetail: OrderModel) => {
			return (
				<React.Fragment>
					{renderOrderPaymentMethods(orderDetail)}
					{/* {orderDetail.total_discount ? (
						<Tooltip title="Chiết khấu đơn hàng">
							<div className="totalDiscount" style={{ color: dangerColor }}>
								<span>
									{" "}
									-
									<NumberFormat
										value={orderDetail.total_discount}
										className="foo"
										displayType={"text"}
										thousandSeparator={true}
									/>
								</span>
							</div>
						</Tooltip>

					) : null} */}
				</React.Fragment>
			);
		},
		[renderOrderPaymentMethods]
	);

  const onSuccessEditNote = useCallback(
		(newNote, noteType, orderID) => {
			const newItems = [...orderHistoryData.items];
			const indexOrder = newItems.findIndex((item: any) => item.id === orderID);
			if (indexOrder > -1) {
				if (noteType === "note") {
					newItems[indexOrder].note = newNote;
				} else if (noteType === "customer_note") {
					newItems[indexOrder].customer_note = newNote;
				}
			}
			const newData = {
				...orderHistoryData,
				items: newItems,
			};
			setOrderHistoryData(newData);
		},
		[orderHistoryData, setOrderHistoryData]
	);

  const editNote = useCallback(
		(newNote, noteType, orderID) => {
			let params: any = {};
			if (noteType === "note") {
				params.note = newNote;
			}
			if (noteType === "customer_note") {
				params.customer_note = newNote;
			}
			dispatch(
				updateOrderPartial(params, orderID, () =>
					onSuccessEditNote(newNote, noteType, orderID),
				)
			);
		},
		[dispatch, onSuccessEditNote]
	);
  

  const columnsOrderHistory: Array<ICustomTableColumType<OrderModel>> = React.useMemo(() => 
    [
      {
        title: "ID đơn hàng",
        dataIndex: "code",
        visible: true,
        fixed: "left",
        className: "custom-shadow-td",
        width: 170,
        render: (value: string, item: OrderModel) => {
          return (
            <div>
              <Link to={`${UrlConfig.ORDER}/${item.id}`} target="_blank">{value}</Link>
              <div style={{ fontSize: "12px", color: "#666666" }}>
                <div>
                {moment(item.created_date).format(DATE_FORMAT.HHmm_DDMMYYYY)}
                <Tooltip title="Cửa hàng">
                  <div>
                    {item.store}
                  </div>
                </Tooltip>
              </div>
              {item.source &&
                <div style={{ fontSize: "12px" }}>
                  <strong style={{ color: "#000000" }}>Nguồn: </strong>
                  <span style={{ color: "#222222", wordBreak: "break-all" }}>{item.source}</span>
                </div>
              }
              </div>
            </div>
        )},
      },
      {
        title: (
          <div className="productNameQuantityPriceHeader">
            <span className="productNameWidth">Sản phẩm
              <span className="separator">, </span>
            </span>
            <span className="quantity quantityWidth">
              <span>SL
                <span className="separator">, </span>
              </span>
            </span>
            <span className="price priceWidth">
              <span>Giá </span>
            </span>
          </div>
        ),
        dataIndex: "items",
        key: "productNameQuantityPrice",
        className: "productNameQuantityPrice",
        render: (items: Array<OrderLineItemResponse>) => {
          return (
            <div className="items">
              {items.map((item, i) => {
                return (
                  <div className="custom-td" key={item.variant_id}>
                    <div className="product productNameWidth 2">
                      <div className="inner">
                        <Link
                          target="_blank"
                          to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                        >
                          {item.sku}
                        </Link>
                        <br />
                        <div className="productNameText" title={item.variant}>
                          {item.variant}
                        </div>
                      </div>
                    </div>
                    <div className="quantity quantityWidth">
                      <NumberFormat
                        value={item.quantity}
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </div>
                    <div className="price priceWidth">
                      <div>
                        <Tooltip title="Giá sản phẩm">
                          <span>{formatCurrency(item.price)}</span>
                        </Tooltip>

                        {item?.discount_items && item.discount_items[0]?.value && (
                          <Tooltip title="Khuyến mại sản phẩm">
                            <div className="itemDiscount" style={{ color: dangerColor }}>
                              <span>
                                {" "}
                                -{" "}
                                {formatCurrency(Math.round(item.discount_items[0].rate*100) /100)}%
                              </span>
                            </div>
                          </Tooltip>

                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
        visible: true,
        align: "left",
        width: nameQuantityWidth,
      },
      {
        title: "Thành tiền",
        render: (record: any) => (
          <React.Fragment>
            <Tooltip title="Thành tiền">
              <NumberFormat
                value={record.total_line_amount_after_line_discount}
                className="foo"
                displayType={"text"}
                thousandSeparator={true}
              />
            </Tooltip>
            {record.total_discount ? (
              <React.Fragment>
                <br />
                <Tooltip title="Chiết khấu đơn hàng">
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
                </Tooltip>
              </React.Fragment>
            ) : null}
          </React.Fragment>
        ),
        key: "customer.amount_money",
        visible: true,
        align: "right",
        width: 100,
      },
      {
        title: "Thanh toán",
        dataIndex: "payment_status",
        key: "payment_status",
        render: (value: string, record: OrderModel) => {
          return <React.Fragment>{renderOrderPayments(record)}</React.Fragment>;
        },
        visible: true,
        align: "left",
        width: 120,
      },
      {
        title: "Điểm",
        // dataIndex: "",
        render: (record: any) => (
          <>
            <div>
              <span style={{ color: "#27AE60" }}>Tích:</span>
              <span style={{ marginLeft: 10 }}>
                {orderPointSpend(record) || 0}{" điểm"}
              </span>
            </div>
            <div>
              <span style={{ color: "#E24343" }}>Tiêu:</span>
              <span style={{ marginLeft: 10 }}>
                {orderPointCollected(record) || 0}{" điểm"}
              </span>
            </div>
          </>
        ),
        key: "customer.amount_money",
        visible: true,
        align: "left",
        width: 120,
      },
      {
        title: "Vận chuyển",
        key: "shipment.type",
        className: "shipmentType",
        render: (value: string, record: OrderModel) => {
          const sortedFulfillments = record.fulfillments?.sort(
            (a: any, b: any) => b.id - a.id
          );
          if (record.source_id === POS.source_id) {
            return (
              <React.Fragment>
                <div className="single">
                  <img src={IconStore} alt="" className="icon" />
                  Bán tại quầy
                </div>
              </React.Fragment>
            )
          }
          if(record?.fulfillments && record.fulfillments[0]?.status === FulFillmentStatus.CANCELLED) {
            return (
              <div className="single">
                <img
                  src={iconShippingFeePay3PL}
                  alt=""
                  className="iconShipping"
                />
                Đã hủy vận chuyển
              </div>
            )
          }
          if (sortedFulfillments) {
            if (sortedFulfillments[0]?.shipment) {
              switch (sortedFulfillments[0].shipment?.delivery_service_provider_type) {
                case ShipmentMethod.EXTERNAL_SERVICE:
                  const thirdPLId =
                    sortedFulfillments[0].shipment.delivery_service_provider_id;
                  const service = deliveryServices.find(
                    (service) => service.id === thirdPLId
                  );
                  return (
                    <React.Fragment>
                      {service && (
                        <React.Fragment>
                          <div className="single">
                            <img
                              src={service.logo ? service.logo : ""}
                              alt=""
                            />
                          </div>
                          <Tooltip title="Tổng khối lượng">
                            <div className="single">
                              <img
                                src={iconWeight}
                                alt=""
                              />
                              <span>{record.total_weight || 0} gr</span>
                            </div>
                          </Tooltip>
                          <Tooltip title="Phí ship báo khách">
                            <div className="single">
                              <img
                                src={iconShippingFeeInformedToCustomer}
                                alt=""
                              />
                              <span>{formatCurrency(sortedFulfillments[0].shipment.shipping_fee_informed_to_customer || 0)}</span>
                            </div>
                          </Tooltip>

                          <Tooltip title="Phí vận chuyển">
                            <div className="single">
                              <img
                                src={iconShippingFeePay3PL}
                                alt=""
                                className="iconShipping"
                              />
                              {formatCurrency(sortedFulfillments[0].shipment.shipping_fee_paid_to_three_pls || 0)}
                            </div>
                          </Tooltip>

                        </React.Fragment>
                      )}
                    </React.Fragment>
                  );
                case ShipmentMethod.EMPLOYEE:
                case ShipmentMethod.EXTERNAL_SHIPPER:
                  return (<React.Fragment>
                    <div className="single">
                      Đối tác {" - "}
                      <span style={{ color: primaryColor }}>{sortedFulfillments[0].shipment.shipper_code}-{sortedFulfillments[0].shipment.shipper_name}</span>
                    </div>
                    <Tooltip title="Tổng khối lượng">
                      <div className="single">
                        <img
                          src={iconWeight}
                          alt=""
                        />
                        <span>{record.total_weight || 0} gr</span>
                      </div>
                    </Tooltip>
                    <Tooltip title="Phí ship báo khách">
                      <div className="single">
                        <img
                          src={iconShippingFeeInformedToCustomer}
                          alt=""
                        />
                        <span>{formatCurrency(sortedFulfillments[0].shipment.shipping_fee_informed_to_customer || 0)}</span>
                      </div>
                    </Tooltip>

                    <Tooltip title="Phí vận chuyển">
                      <div className="single">
                        <img
                          src={iconShippingFeePay3PL}
                          alt=""
                        />
                        {formatCurrency(sortedFulfillments[0].shipment.shipping_fee_paid_to_three_pls || 0)}
                      </div>
                    </Tooltip>

                  </React.Fragment>)
                case ShipmentMethod.PICK_AT_STORE:
                  return (<React.Fragment>
                    <div className="single">
                      Nhận tại {" - "}
                      <Link target="_blank" to={`${UrlConfig.STORE}/${record?.store_id}`}>
                        {record.store}
                      </Link>
                    </div>
                    <Tooltip title="Tổng khối lượng">
                      <div className="single">
                        <img
                          src={iconWeight}
                          alt=""
                        />
                        <span>{record.total_weight || 0} gr</span>
                      </div>
                    </Tooltip>
                    <Tooltip title="Phí ship báo khách">
                      <div className="single">
                        <img
                          src={iconShippingFeeInformedToCustomer}
                          alt=""
                        />
                        <span>{formatCurrency(sortedFulfillments[0].shipment.shipping_fee_informed_to_customer || 0)}</span>
                      </div>
                    </Tooltip>

                    <Tooltip title="Phí vận chuyển">
                      <div className="single">
                        <img
                          src={iconShippingFeePay3PL}
                          alt=""
                        />
                        {formatCurrency(sortedFulfillments[0].shipment.shipping_fee_paid_to_three_pls || 0)}
                      </div>
                    </Tooltip>

                  </React.Fragment>)
                default:
                  return (
                    <React.Fragment>
                      <Tooltip title="Tổng khối lượng">
                        <div className="single">
                          <img
                            src={iconWeight}
                            alt=""
                          />
                          <span>{record.total_weight || 0} gr</span>
                        </div>
                      </Tooltip>
                      <Tooltip title="Phí ship báo khách">
                        <div className="single">
                          <img
                            src={iconShippingFeeInformedToCustomer}
                            alt=""
                          />
                          <span>{formatCurrency(sortedFulfillments[0].shipment.shipping_fee_informed_to_customer || 0)}</span>
                        </div>
                      </Tooltip>

                      <Tooltip title="Phí vận chuyển">
                        <div className="single">
                          <img
                            src={iconShippingFeePay3PL}
                            alt=""
                          />
                          {formatCurrency(sortedFulfillments[0].shipment.shipping_fee_paid_to_three_pls || 0)}
                        </div>
                      </Tooltip>
                    </React.Fragment>
                  );
              }
            }
          }
          return "";
        },
        visible: true,
        width: 120,
        align: "left",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        className: "orderStatus",
        render: (value: string, record: OrderModel) => {
          if (!record || !status_order) {
            return null
          }
          const status = status_order.find((status) => status.value === record.status);
          return (
            <div className="orderStatus">
              <div className="inner">
                <div className="single">
                  <div>
                    <strong>Xử lý đơn: </strong>
                  </div>
                  {record.sub_status ? record.sub_status : "-"}
                </div>
                <div className="single">
                  <div>
                    <strong>Đơn hàng: </strong>
                  </div>
                  {record.status === OrderStatus.DRAFT && (
                    <div
                      style={{
                        color: "#737373",
                      }}
                    >
                      {status?.name}
                    </div>
                  )}

                  {record.status === OrderStatus.FINALIZED && (
                    <div
                      style={{
                        color: "#FCAF17",
                      }}
                    >
                      {status?.name}
                    </div>
                  )}

                  {record.status === OrderStatus.FINISHED && (
                    <div
                      style={{
                        color: "#27AE60",
                      }}
                    >
                      {status?.name}
                    </div>
                  )}

                  {record.status === OrderStatus.CANCELLED && (
                    <div
                      style={{
                        color: "#E24343",
                      }}
                    >
                      {status?.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        },
        visible: true,
        align: "left",
        width: 120,
      },
      {
        title: "Ghi chú",
        className: "notes",
        render: (value: string, record: OrderModel) => (
          <div className="orderNotes">
            <div className="inner">
              <div className="single">
                <EditNote
                  note={record.customer_note}
                  title="Khách hàng: "
                  color={primaryColor}
                  onOk={(newNote) => {
                    editNote(newNote, "customer_note", record.id);
                  }}
                  isDisable={record.status===OrderStatus.FINISHED}
                />
              </div>
              <div className="single">
                <EditNote
                  note={record.note}
                  title="Nội bộ: "
                  color={primaryColor}
                  onOk={(newNote) => {
                    editNote(newNote, "note", record.id);
                  }}
                  isDisable={record.status===OrderStatus.FINISHED}
                />
              </div>
            </div>
          </div>
        ),
        key: "note",
        visible: true,
        align: "left",
        width: 150,
      },
      {
        title: "NV bán hàng",
        render: (value, record: OrderModel) => (
          <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record.assignee_code}`}>
            {`${record.assignee_code} - ${record.assignee}`}
          </Link>
        ),
        key: "assignee",
        visible: true,
        align: "center",
        width: 130,
      },
      {
        title: "NV tạo đơn",
        render: (value, record: OrderModel) => (
          <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}>
            {`${record.account_code} - ${record.account}`}
          </Link>
        ),
        key: "account",
        visible: true,
        align: "center",
        width: 130,
      },
      {
        title: "Ngày hoàn tất đơn",
        dataIndex: "finished_on",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
        key: "finished_on",
        visible: true,
        align: "center",
        width: 150,
      },
      {
        title: "Ngày huỷ đơn",
        dataIndex: "cancelled_on",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
        key: "cancelled_on",
        visible: true,
        align: "center",
        width: 150,
      },
      {
        title: "Biên bản bàn giao",
        dataIndex: "Biên bản bàn giao",
        key: "Biên bản bàn giao",
        render: (value) => (
          null
        ),
        visible: true,
        // width: 160,
      },
      {
        title: "Mã Afilliate",
        dataIndex: "Mã Afilliate",
        key: "Mã Afilliate",
        render: (value) => (
          null
        ),
        visible: true,
        // width: 160,
      },
      {
        title: "Ghi chú hóa đơn",
        dataIndex: "Ghi chú hóa đơn",
        key: "Ghi chú hóa đơn",
        render: (value) => (
          null
        ),
        visible: true,
        // width: 190,
      },
      {
        title: "Tag",
        dataIndex: "tags",
        render: (values, record: OrderModel) => {
          let result: React.ReactNode = null;
          if (record?.tags) {
            const listTags = record?.tags.split(",");
            if (listTags && listTags.length > 0) {
              result = (
                <ul>
                  {listTags.map((tag, index) => {
                    return (
                      <li key={index}>
                        {tag}
                      </li>
                    )
                  })}
                </ul>
              )
            }
          }
          return result;
        },
        key: "tags",
        visible: true,
        align: "left",
        width: 150,
      },
      {
        title: "Mã tham chiếu",
        dataIndex: "reference_code",
        key: "reference_code",
        render: (value, record: OrderModel) => {
          let result: React.ReactNode = null;
          if (record?.url) {
            result = (
              <a href={record?.url}>{value}</a>
            )
          } if(record?.linked_order_code) {
            return (
              <Link to={`${UrlConfig.ORDER}/${record.linked_order_code}`} target="_blank">
                {record?.linked_order_code}
              </Link>
            )
          }else {
            result = value
          }
          return result;
        },
        visible: true,
        width: 150,
      },
    ],
    [deliveryServices, editNote, renderOrderPayments, status_order]
  );

  const columnsOrderReturned: Array<ICustomTableColumType<ReturnModel>> = [
    {
      title: "Mã đơn trả hàng",
      dataIndex: "code_order_return",
      width: 150,
      render: (value: string, item: ReturnModel) => (
        <div>
          <div className="name p-b-3" style={{ color: "#2A2A86" }}>
            <Link
              target="_blank"
              to={`${UrlConfig.ORDERS_RETURN}/${item.id}`}
            >
              {item.code_order_return}
            </Link>
          </div>
          <div style={{ fontSize: "12px", color: "#666666" }}>
            {item.created_date
              ? moment(item.created_date).format(DATE_FORMAT.HHmm_DDMMYYYY)
              : ""
            }
          </div>
        </div>
      ),
    },
    {
      title: "Người nhận",
      key: "customer",
      visible: true,
      width: 150,
      render: (record: any) => (
        <div className="customer">
          <div className="name p-b-3" style={{ color: "#2A2A86" }}>
            <Link
              target="_blank"
              to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
            >
              {record.customer_name}
            </Link>
          </div>
          <div className="p-b-3">{record.customer_phone_number}</div>
          <div className="p-b-3">{record.customer_email}</div>
        </div>
      ),
    },
    {
      title: "Kho cửa hàng",
      dataIndex: "store",
      key: "store",
      align: "center",
      width: 200,
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      width: 150,
      render: (value: string, item: ReturnModel) => {
        const received = {
          text: item.received ? "Đã nhận" : "Chưa nhận",
          color: item.received ? "#27AE60" : "#E24343",
        }
        const payment_status = {
          text: item.payment_status === PoPaymentStatus.PAID ? "Đã hoàn" : "Chưa hoàn",
          color: item.payment_status === PoPaymentStatus.PAID ? "#27AE60" : "#E24343",
        }
        return (
          <div>
            <div>
              <div>
                <strong>Hàng: </strong>
                <span style={{ color: `${received.color}` }}>{received.text}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#666666" }}>
                {item.receive_date
                  ? moment(item.receive_date).format(DATE_FORMAT.HHmm_DDMMYYYY)
                  : ""
                }
              </div>
            </div>

            <div>
              <strong>Tiền: </strong>
              <span style={{ color: `${payment_status.color}` }}>{payment_status.text}</span>
            </div>
          </div>
        )
      },
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_amount",
      key: "total_amount",
      align: "center",
      width: 120,
      render: (value: number) => (
        <b>
          {!isNullOrUndefined(value) ?
            <NumberFormat
              value={value}
              displayType={"text"}
              thousandSeparator={true}
            />
            : "--"
          }
        </b>
      ),
    },
    {
      title: "Lý do trả",
      dataIndex: "reason",
      key: "reason",
      align: "center",
    },
  ];


  return (
    <StyledPurchaseHistory>
      <CustomTable
        bordered
        isLoading={tableLoading}
        showColumnSetting={true}
        scroll={{ x: 2800 }}
        sticky={{ offsetScroll: 10, offsetHeader: 55 }}
        pagination={{
          pageSize: orderHistoryData.metadata.limit,
          total: orderHistoryData.metadata.total,
          current: orderHistoryData.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        dataSource={orderHistoryList()}
        columns={columnsOrderHistory}
        rowKey={(item: OrderModel) => item.id}
        expandable={{
          // rowExpandable: item => item.order_return.length > 0,
          expandIcon: (props) => {
            let icon = <HiChevronDoubleRight size={20} />;
            if (props.expanded) {
              icon = <HiChevronDoubleDown size={20} color="#2A2A86" />;
            }
            return (
              <>
                {props.record?.order_return?.length ?
                  <div
                    style={{cursor: "pointer"}}
                    onClick={(event) => props.onExpand(props.record, event)}
                  >
                    {icon}
                  </div>
                  : <></>
                }
              </>
              
            );
          },
          expandedRowRender: (item, index) => {
            return (
              <div key={index} className="expanded-row-render">
                <CustomTable
                  bordered
                  columns={columnsOrderReturned}
                  dataSource={item.order_return}
                  pagination={false}
                  rowKey={(item: ReturnModel) => item.id}
                />
              </div>
            );
          },
        }}
      />
    </StyledPurchaseHistory>
  );
}

export default PurchaseHistory;
