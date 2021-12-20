import { Tooltip } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
	updateOrderPartial
} from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderItemModel, OrderModel } from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import moment from "moment";
import React, { ReactNode, useCallback, useEffect, useMemo } from "react";
import NumberFormat from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { formatCurrency } from "utils/AppUtils";
import { COD, OrderStatus, PaymentMethodCode, POS, ShipmentMethod } from "utils/Constants";
import { dangerColor } from "utils/global-styles/variables";
import EditNote from "../../edit-note";
import iconShippingFeeInformedToCustomer from "./images/iconShippingFeeInformedToCustomer.svg";
import iconShippingFeePay3PL from "./images/iconShippingFeePay3PL.svg";
import iconWeight from "./images/iconWeight.svg";
import IconPaymentBank from "./images/paymentBank.svg";
import IconPaymentCard from "./images/paymentCard.svg";
import IconPaymentCod from "./images/paymentCod.svg";
import IconPaymentCash from "./images/paymentMoney.svg";
import IconPaymentPoint from "./images/paymentPoint.svg";
import IconShopee from "./images/shopee.svg";
import IconStore from "./images/store.svg";
import IconWebsite from "./images/website.svg";
import { nameQuantityWidth, StyledComponent } from "./OrdersTable.styles";

type PropsType = {
	tableLoading: boolean;
	data: PageResponse<OrderModel>;
	columns: ICustomTableColumType<OrderModel>[];
	deliveryServices: DeliveryServiceResponse[];
	setColumns: (columns: ICustomTableColumType<OrderModel>[]) => void;
	setData: (data: PageResponse<OrderModel>) => void;
	onPageChange: (page: any, size: any) => void;
	onSelectedChange: (selectedRow: any) => void;
	setShowSettingColumn: (value: boolean) => void;
};

function OrdersTable(props: PropsType) {
	const {
		tableLoading,
		data,
		columns,
		deliveryServices,
		onPageChange,
		onSelectedChange,
		setShowSettingColumn,
		setColumns,
		setData,
	} = props;

	console.log('deliveryServices3333', deliveryServices)

	const dispatch = useDispatch();
	const status_order = useSelector(
		(state: RootReducerType) => state.bootstrapReducer.data?.order_status
	);

	let data1: any = {
		metadata: {
			limit: 30,
			page: 1,
			total: 0,
		},
		items: [],
	};

	const paymentIcons = [
		{
			payment_method_code: PaymentMethodCode.BANK_TRANSFER,
			icon: IconPaymentBank,
			tooltip: "Đã chuyển khoản",
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
			tooltip: "Đã thanh toán tiền mặt",
		},
		{
			payment_method_code: PaymentMethodCode.POINT,
			icon: IconPaymentPoint,
			tooltip: "Tiêu điểm",
		},
	];

	const onSuccessEditNote = useCallback(
		(newNote, noteType, orderID) => {
			console.log("ok ok");
			const indexOrder = data1.items.findIndex((item: any) => item.id === orderID);
			const newItems = [...data1.items];
			console.log("data", data1);
			if (indexOrder > -1) {
				const newItem: any = newItems[indexOrder];
				newItems.splice(indexOrder, 1, {
					...newItem,
					note: noteType === "note" ? newNote : newItem.note,
					customer_note: noteType === "customer_note" ? newNote : newItem.customer_note,
				});
			}
			const newData = {
				...data1,
				items: newItems,
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
			data1 = newData;
			setData(newData);
		},
		[data1]
	);

	const editNote = useCallback(
		(newNote, noteType, orderID) => {
			console.log("newNote, noteType, orderID", newNote, noteType, orderID);
			let params: any = {};
			if (noteType === "note") {
				params.note = newNote;
			}
			if (noteType === "customer_note") {
				params.customer_note = newNote;
			}
			dispatch(
				updateOrderPartial(params, orderID, () =>
					onSuccessEditNote(newNote, noteType, orderID)
				)
			);
		},
		[dispatch, onSuccessEditNote]
	);

	const renderOrderSource = (orderDetail: OrderModel) => {
		let html = null;
		switch (orderDetail.source_code) {
			case POS.source_code:
				html = (
					<Tooltip title="Đơn hàng tại quầy">
						<img src={IconStore} alt="" />
					</Tooltip>
				);
				break;
			case "shopee":
				html = (
					<Tooltip title="Đơn hàng tại shopee">
						<img src={IconShopee} alt="" />
					</Tooltip>
				);
				break;
			default:
				html = (
					<Tooltip title="Đơn hàng từ Website">
						<img src={IconWebsite} alt="" />
					</Tooltip>
				);
				break;
		}
		return html;
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const renderOrderPaymentMethods = (orderDetail: OrderModel) => {
		let html = null;
		html = orderDetail.payments.map((payment) => {
			if (!payment.amount) {
				return null;
			}
			let selectedPayment = paymentIcons.find(
				(single) => single.payment_method_code === payment.payment_method_code
			);
			return (
				<div className="singlePayment">
					<Tooltip title={selectedPayment?.tooltip}>
						<img src={selectedPayment?.icon} alt="" />
						<span className="amount">{formatCurrency(payment.amount)}</span>
					</Tooltip>
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
					{orderDetail.total_discount ? (
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
					) : null}
				</React.Fragment>
			);
		},
		[renderOrderPaymentMethods]
	);

	const renderCustomerAddress = (orderDetail: OrderModel) => {
		let html = orderDetail.customer_address;
		if (orderDetail.customer_ward) {
			html += ` - ${orderDetail.customer_ward}`;
		}
		if (orderDetail.customer_district) {
			html += ` - ${orderDetail.customer_district}`;
		}
		if (orderDetail.customer_city) {
			html += ` - ${orderDetail.customer_city}`;
		}
		return html;
	};

	const initColumns: ICustomTableColumType<OrderModel>[] = useMemo(() => {
		return [
			{
				title: "ID đơn hàng",
				dataIndex: "code",
				key: "code",
				render: (value: string, i: OrderModel) => {
					return (
						<React.Fragment>
							<Link
								target="_blank"
								to={`${UrlConfig.ORDER}/${i.id}`}
								style={{ fontWeight: 500 }}
							>
								{value}
							</Link>
							<div style={{ fontSize: "0.86em" }}>
								{moment(i.created_date).format("hh:mm DD-MM-YYYY")}
							</div>
							<div style={{ fontSize: "0.86em", marginTop: 5 }}>
								<Link target="_blank" to={`${UrlConfig.STORE}/${i?.store_id}`}>
									{i.store}
								</Link>
							</div>
						</React.Fragment>
					);
				},
				visible: true,
				fixed: "left",
				className: "custom-shadow-td",
				width: 115,
			},
			{
				title: "Khách hàng",
				render: (record: OrderModel) => (
					<div className="customer custom-td">
						<div className="name p-b-3" style={{ color: "#2A2A86" }}>
							<Link
								target="_blank"
								to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
								className="primary"
							>
								{record.customer}
							</Link>{" "}
						</div>
						{/* <div className="p-b-3">{record.shipping_address.phone}</div>
						<div className="p-b-3">{record.shipping_address.full_address}</div> */}
						{record.customer_phone_number && (
							<div className="p-b-3">
								<a href={`tel:${record.customer_phone_number}`}>
									{record.customer_phone_number}
								</a>
							</div>
						)}
						<div className="p-b-3">{renderCustomerAddress(record)}</div>
					</div>
				),
				key: "customer",
				visible: true,
				width: 130,
			},
			{
				title: (
					<div className="productNameQuantityHeader">
						<span className="productNameWidth">Sản phẩm</span>
						<span className="quantity quantityWidth">
							<span>SL</span>
						</span>
					</div>
				),
				dataIndex: "items",
				key: "productNameQuantity",
				className: "productNameQuantity",
				render: (items: Array<OrderItemModel>) => {
					return (
						<div className="items">
							{items.map((item, i) => {
								return (
									<div className="item custom-td" key={item.variant_id}>
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
											<span>{item.quantity}</span>
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
			// {
			//   title: "Kho cửa hàng",
			//   dataIndex: "store",
			//   key: "store",
			//   visible: true,
			//   align: "center",
			// },
			{
				title: "Giá",
				// dataIndex: "",
				render: (record: any) => (
					<React.Fragment>
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
					</React.Fragment>
				),
				key: "customer.amount_money",
				visible: true,
				align: "left",
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
				width: 100,
			},
			{
				title: "Vận chuyển",
				key: "shipment.type",
				className: "shipmentType",
				render: (value: string, record: OrderModel) => {
					const sortedFulfillments = record.fulfillments?.sort(
						(a: any, b: any) => b.id - a.id
					);
					console.log('sortedFulfillments', sortedFulfillments)
					console.log('deliveryServices', deliveryServices)
					if (record.source_code === POS.source_code || (sortedFulfillments && sortedFulfillments[0]?.delivery_type === ShipmentMethod.PICK_AT_STORE)) {
						return (
							<React.Fragment>
								<div className="single">
									<img src={IconStore} alt="" className="icon" />
									Bán tại quầy
								</div>
							</React.Fragment>
						)
					}
					if (sortedFulfillments) {
						if (sortedFulfillments[0]?.shipment) {
							switch (sortedFulfillments[0].shipment.delivery_service_provider_type) {
								case ShipmentMethod.EXTERNAL_SERVICE:
									const service_code =
										sortedFulfillments[0].shipment.delivery_service_provider_code;
									const service = deliveryServices.find(
										(service) => service.external_service_code === service_code
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
													{record?.total_weight && (
														<div className="single">
															<img
																src={iconWeight}
																alt=""
															/>
															{record.total_weight} gr
														</div>

													)}
													<div className="single">
														<img
															src={iconShippingFeeInformedToCustomer}
															alt=""
														/>
														{formatCurrency(sortedFulfillments[0].shipment.shipping_fee_informed_to_customer || 0)}
													</div>
													<div className="single">
														<img
															src={iconShippingFeePay3PL}
															alt=""
														/>
														{formatCurrency(sortedFulfillments[0].shipment.shipping_fee_paid_to_three_pls || 0)}
													</div>
												</React.Fragment>
											)}
										</React.Fragment>
									);
								case ShipmentMethod.SHIPPER:
									return `Đối tác - ${sortedFulfillments[0].shipment.shipper_code} - ${sortedFulfillments[0].shipment.shipper_name}`;
								case ShipmentMethod.PICK_AT_STORE:
									return `Nhận tại - ${record.store}`;
								default:
									return "";
							}
						}
					}
					return "";
				},
				visible: true,
				width: 110,
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
												color: "#2A2A86",
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
									onOk={(newNote) => {
										console.log("newNote", newNote);
										editNote(newNote, "customer_note", record.id);
									}}
								/>
							</div>
							<div className="single">
								<EditNote
									note={record.note}
									title="Nội bộ: "
									onOk={(newNote) => {
										console.log("newNote", newNote);
										editNote(newNote, "note", record.id);
									}}
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
				title: "Tổng SLSP",
				dataIndex: "total_quantity",
				key: "total_quantity",
				visible: true,
				align: "center",
				width: 75,
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
				title: "Biên bản bàn giao",
				dataIndex: "Biên bản bàn giao",
				key: "Biên bản bàn giao",
				render: (value) => (
					null
				),
				visible: true,
				width: 160,
			},
			{
				title: "Mã Afilliate",
				dataIndex: "Mã Afilliate",
				key: "Mã Afilliate",
				render: (value) => (
					null
				),
				visible: true,
				width: 160,
			},
			{
				title: "Ghi chú hóa đơn",
				dataIndex: "Ghi chú hóa đơn",
				key: "Ghi chú hóa đơn",
				render: (value) => (
					null
				),
				visible: true,
				width: 190,
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
				width: 120,
			},
			{
				title: "Mã tham chiếu",
				dataIndex: "linked_order_code",
				key: "linked_order_code",
				render: (value) => (
					<Link target="_blank" to={`${UrlConfig.ORDER}/${value}`}>
						{value}
					</Link>
				),
				visible: true,
				width: 120,
			},
		];
	}, [deliveryServices, editNote, renderOrderPayments, status_order]);

	const columnFinal = useMemo(
		() => columns.filter((item) => item.visible === true),
		[columns]
	);

	const rowSelectionRenderCell = (
		checked: boolean,
		record: OrderModel,
		index: number,
		originNode: ReactNode
	) => {
		return (
			<React.Fragment>
				{originNode}
				<div className="orderSource">{renderOrderSource(record)}</div>
			</React.Fragment>
		);
	};

	useEffect(() => {
		if (columns.length === 0) {
			setColumns(initColumns);
		}
	}, [columns, initColumns, setColumns]);

	return (
		<StyledComponent>
			<CustomTable
				isRowSelection
				isLoading={tableLoading}
				showColumnSetting={true}
				scroll={{ x: (2400 * columnFinal.length) / (columns.length ? columns.length : 1) }}
				sticky={{ offsetScroll: 10, offsetHeader: 55 }}
				pagination={{
					pageSize: data.metadata.limit,
					total: data.metadata.total,
					current: data.metadata.page,
					showSizeChanger: true,
					onChange: onPageChange,
					onShowSizeChange: onPageChange,
				}}
				rowSelectionRenderCell={rowSelectionRenderCell}
				onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
				onShowColumnSetting={() => setShowSettingColumn(true)}
				dataSource={data.items}
				columns={columnFinal}
				rowKey={(item: OrderModel) => item.id}
				className="order-list"
			/>
		</StyledComponent>
	);
}
export default OrdersTable;
