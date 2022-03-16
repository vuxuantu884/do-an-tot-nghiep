
import { EditOutlined, LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import {
	AutoComplete,
	Button,
	Card,
	Checkbox,
	Col,
	Dropdown,
	Form,
	FormInstance,
	Input,
	Menu,
	Row,
	Select,
	Space,
	Table,
	Tooltip
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import emptyProduct from "assets/icon/empty_products.svg";
import giftIcon from "assets/icon/gift.svg";
import imgDefault from "assets/icon/img-default.svg";
import XCloseBtn from "assets/icon/X_close.svg";
import arrowDownIcon from "assets/img/drow-down.svg";
import BaseResponse from "base/base.response";
import NumberInput from "component/custom/number-input.custom";
import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import {
	//getStoreSearchIdsAction ,
	StoreGetListAction,
	StoreSearchListAction
} from "domain/actions/core/store.action";
import { changeOrderLineItemsAction, setIsShouldSetDefaultStoreBankAccountAction, splitOrderAction } from "domain/actions/order/order.action";
import {
	SearchBarCode,
	searchVariantsOrderRequestAction
} from "domain/actions/product/products.action";
import _ from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { InventoryResponse } from "model/inventory";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
	OrderDiscountRequest,
	OrderItemDiscountRequest,
	OrderLineItemRequest,
	SplitOrderRequest
} from "model/request/order.request";
import {
	DiscountRequestModel
} from "model/request/promotion.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { OrderResponse } from "model/response/order/order.response";
import {
	ApplyCouponResponseModel,
	SuggestDiscountResponseModel
} from "model/response/order/promotion.response";
import { OrderConfigResponseModel } from "model/response/settings/order-settings.response";
import React, {
	createRef,
	MutableRefObject,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DiscountGroup from "screens/order-online/component/discount-group";
import AddGiftModal from "screens/order-online/modal/add-gift.modal";
import InventoryModal from "screens/order-online/modal/inventory.modal";
import PickCouponModal from "screens/order-online/modal/pick-coupon.modal";
import PickDiscountModal from "screens/order-online/modal/pick-discount.modal";
import { applyDiscountService } from "service/promotion/discount/discount.service";
import {
	findAvatar,
	findPrice,
	findPriceInVariant,
	findTaxInVariant,
	formatCurrency,
	getCustomerShippingAddress,
	getLineAmountAfterLineDiscount,
	getLineItemDiscountAmount,
	getLineItemDiscountRate,
	getLineItemDiscountValue,
	getTotalAmount,
	getTotalAmountAfterDiscount,
	getTotalDiscount,
	getTotalQuantity,
	handleCalculateShippingFeeApplyOrderSetting,
	handleDelayActionWhenInsertTextInSearchInput,
	handleFetchApiError,
	haveAccess,
	isFetchApiSuccessful,
	isOrderFinishedOrCancel,
	replaceFormatString
} from "utils/AppUtils";
import { ACCOUNT_ROLE_ID, ADMIN_ORDER, MoneyType, PRODUCT_TYPE } from "utils/Constants";
import { DISCOUNT_VALUE_TYPE } from "utils/Order.constants";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import CardProductBottom from "./CardProductBottom";
import { StyledComponent } from "./styles";

type PropType = {
	storeId: number | null;
	items?: Array<OrderLineItemRequest>;
	shippingFeeInformedToCustomer: number | null;
	form: FormInstance<any>;
	totalAmountCustomerNeedToPay: number;
	orderConfig: OrderConfigResponseModel | null | undefined;
	inventoryResponse: Array<InventoryResponse> | null;
	levelOrder?: number;
	coupon?: string;
	promotion: OrderDiscountRequest | null;
	orderSourceId?: number | null;
	orderAmount: number;
	totalAmountOrder: number;
	updateOrder?: boolean;
	isSplitOrder?: boolean;
	orderDetail?: OrderResponse | null;
	customer?: CustomerResponse | null;
	loyaltyPoint: LoyaltyPoint | null;
	setStoreId: (item: number) => void;
	setCoupon?: (item: string) => void;
	setPromotion?: (item: OrderDiscountRequest | null) => void;
	setItemGift: (item: []) => void;
	changeInfo: (
		items: Array<OrderLineItemRequest>,
		promotion: OrderDiscountRequest | null,
	) => void;
	setItems: (items: Array<OrderLineItemRequest>) => void;
	setInventoryResponse: (item: Array<InventoryResponse> | null) => void;
	fetchData?: () => void;
	returnOrderInformation?: {
		totalAmountReturn: number;
		totalAmountExchangePlusShippingFee: number;
	};
	setShippingFeeInformedToCustomer?:(value:number | null)=>void;
};

var barcode = "";

const initQueryVariant: VariantSearchQuery = {
	limit: 10,
	page: 1,
	saleable: true,
};

/**
 * component dùng trong trang tạo đơn, update đơn hàng, đổi trả đơn hàng
 *
 * formRef: form
 *
 * items: danh sách sản phẩm
 *
 * discountRate: tỉ lệ chiết khấu
 *
 * discountValue: giá trị chiết khấu
 *
 * storeId: id cửa hàng
 *
 * inventoryResponse: thông tin inventory (tồn kho)
 *
 * levelOrder: phân quyền
 *
 * isSplitOrder: đơn hàng có thể tách đơn (khi update đơn hàng)
 *
 * orderDetail: chi tiết đơn hàng
 *
 * orderConfig: cấu hình đơn hàng
 *
 * shippingFeeInformedToCustomer: phí ship báo khách
 *
 * setStoreId: xử lý khi chọn cửa hàng
 *
 * setItems: xử lý khi chọn sản phẩm
 *
 * fetchData: load lại data
 *
 * setDiscountValue: xử lý giá trị chiết khấu
 *
 * setDiscountRate: xử lý tỉ lệ chiết khấu
 *
 * returnOrderInformation: thông tin đổi trả
 *
 * totalAmountCustomerNeedToPay: số tiền khách cần trả
 *
 * customer: thông tin khách hàng, để apply coupon
 *
 */
function OrderCreateProduct(props: PropType) {
	/**
	 * thời gian delay khi thay đổi số lượng sản phẩm để apply chiết khấu
	 */
	const QUANTITY_DELAY_TIME = 300;
	const {
		form,
		items,
		storeId,
		inventoryResponse,
		levelOrder = 0,
		coupon = "",
		isSplitOrder,
		orderDetail,
		orderConfig,
		shippingFeeInformedToCustomer,
		returnOrderInformation,
		totalAmountCustomerNeedToPay,
		orderSourceId,
		customer,
		loyaltyPoint,
		promotion,
		orderAmount,
		totalAmountOrder,
		setStoreId,
		setItems,
		fetchData,
		setCoupon,
		setPromotion,
		setShippingFeeInformedToCustomer,
	} = props;
	const orderCustomer= useSelector((state: RootReducerType) => state.orderReducer.orderDetail.orderCustomer);

  const shippingServiceConfig = useSelector((state: RootReducerType) => state.orderReducer.shippingServiceConfig);

  const transportService = useSelector((state: RootReducerType) => state.orderReducer.orderDetail.thirdPL?.service);
	const dispatch = useDispatch();
	const [loadingAutomaticDiscount] = useState(false);
	const [splitLine, setSplitLine] = useState<boolean>(false);
	const [isDisableOrderDiscount, setIsDisableOrderDiscount] = useState<boolean>(false);
	const [itemGifts, setItemGift] = useState<Array<OrderLineItemRequest>>([]);
	const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
	const [keySearchVariant, setKeySearchVariant] = useState("");
	const [resultSearchVariant, setResultSearchVariant] = useState<
		PageResponse<VariantResponse>
	>({
		metadata: {
			limit: 0,
			page: 1,
			total: 0,
		},
		items: [],
	});
	const [isVisibleGift, setVisibleGift] = useState(false);
	const [searchProducts, setSearchProducts] = useState(false);
	const [indexItem, setIndexItem] = useState<number>(-1);
	const [isVisiblePickDiscount, setVisiblePickDiscount] = useState(false);
	const [isVisiblePickCoupon, setIsVisiblePickCoupon] = useState(false);
	const [discountType, setDiscountType] = useState<string>(MoneyType.MONEY);
	const [changeMoney, setChangeMoney] = useState<number>(0);
	const [isShowProductSearch, setIsShowProductSearch] = useState(true);
	const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(true);
	const [isAutomaticDiscount, setIsAutomaticDiscount] = useState(false);
	const [isCalculateDiscount, setIsCalculateDiscount] = useState(false);
	const [isInventoryModalVisible, setInventoryModalVisible] = useState(false);

	//tách đơn
	const [splitOrderNumber, setSplitOrderNumber] = useState(0);
	const [isShowSplitOrder, setIsShowSplitOrder] = useState(false);
	const [isCouponValid, setIsCouponValid] = useState(false);
	const [couponInputText, setCouponInputText] = useState(coupon);

	const lineItemQuantityInputTimeoutRef: MutableRefObject<any> = useRef();
	const lineItemPriceInputTimeoutRef: MutableRefObject<any> = useRef();
	const lineItemDiscountInputTimeoutRef: MutableRefObject<any> = useRef();

	const [storeArrayResponse, setStoreArrayResponse] =
		useState<Array<StoreResponse> | null>([]);

	const userReducer = useSelector((state: RootReducerType) => state.userReducer);

	// const [storeSearchIds, setStoreSearchIds] = useState<PageResponse<StoreResponse>>();

	const isShouldUpdateCouponRef = useRef(orderDetail ? false : true);
	const isShouldUpdateDiscountRef = useRef(orderDetail ? false : true);

	let discountRate = promotion?.rate || 0;
	let discountValue = promotion?.value || 0;

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handlePressKeyBoards = (event: KeyboardEvent) => {
		let findProductInput = document.getElementById("search_product");
		let isAutomaticDiscount: boolean = form.getFieldValue("automatic_discount");
		if (["F3", "F12"].indexOf(event.key) !== -1) {
			event.preventDefault();
			event.stopPropagation();
		}
		//if (event.target instanceof HTMLBodyElement) {
		switch (event.key) {
			case "F3":
				findProductInput?.focus()
				break;
			case "F12":
				form.setFieldsValue({
					automatic_discount: !isAutomaticDiscount
				})
				if (isAutomaticDiscount) {
					showSuccess("Tắt chiết khấu tự động thành công!")
					handleRemoveAllAutomaticDiscount();
				} else {
					handleApplyDiscount(items);
					showSuccess("Bật chiết khấu tự động thành công!")
				}
				break;
			default:
				break;
		}
		return;
	};

	const eventKeyPress = useCallback(
		(event: KeyboardEvent) => {
			if (event.target instanceof HTMLBodyElement) {
				if (event.key !== "Enter") {
					barcode = barcode + event.key;
				} else if (event.key === "Enter") {
					if (barcode !== "" && event && items) {
						dispatch(
							SearchBarCode(barcode, (data: VariantResponse) => {
								if (data) {
									let _items = [...items];
									let index = _items.findIndex((i) => i.variant_id === data.id);
									const item: OrderLineItemRequest = createItem(data);
									item.position = items.length + 1;
									if (true) {
										if (splitLine || index === -1) {
											_items.unshift(item);
											calculateChangeMoney(_items);
										} else {
											let variantItems = _items.filter((item) => item.variant_id === data.id);
											let firstIndex = 0;
											variantItems[firstIndex].quantity += 1;
											variantItems[firstIndex].line_amount_after_line_discount +=
												variantItems[firstIndex].price -
												variantItems[firstIndex].discount_items[0]?.amount *
												variantItems[firstIndex].quantity;
											calculateChangeMoney(_items);
										}
									}

									if (isAutomaticDiscount && _items.length > 0) {
										handleApplyDiscount(_items);
									} else if (couponInputText && _items.length > 0) {
										handleApplyCouponWhenInsertCoupon(couponInputText, _items);
									}
									autoCompleteRef.current?.blur();
									setIsInputSearchProductFocus(false);
									setKeySearchVariant("");
								}
							})
						);
						barcode = "";
					}
				}
				return;
			}
		},

		// eslint-disable-next-line react-hooks/exhaustive-deps
		[items, isAutomaticDiscount, couponInputText, splitLine]
	);

	useEffect(() => {
		window.addEventListener("keypress", eventKeyPress);
		window.addEventListener("keydown", handlePressKeyBoards);
		return () => {
			window.removeEventListener("keypress", eventKeyPress);
			window.removeEventListener("keydown", handlePressKeyBoards);
		};
	}, [eventKeyPress, handlePressKeyBoards]);

	useEffect(() => {
		setIsAutomaticDiscount(form.getFieldValue("automatic_discount"));
	}, [form]);

	useEffect(() => {
		if (isAutomaticDiscount) {
			setIsDisableOrderDiscount(true);
		} else {
			setIsDisableOrderDiscount(false);
		}
	}, [isAutomaticDiscount]);

	useEffect(() => {
		if (
			orderDetail &&
			orderDetail?.discounts &&
			orderDetail?.discounts[0]?.discount_code
		) {
			// setCoupon && setCoupon(orderDetail?.discounts[0]?.discount_code)
			setCouponInputText(orderDetail?.discounts[0]?.discount_code);
			setIsCouponValid(true);
		}
	}, [orderDetail]);

	const totalAmount = useCallback(
		(items: Array<OrderLineItemRequest>) => {
			if (!items) {
				return 0;
			}
			let _items = [...items];
			let _amount = 0;

			_items.forEach((i) => {
				let total_discount_items = 0;
				i.discount_items.forEach((d) => {
					total_discount_items = total_discount_items + d.value;
				});
				let amountItem = (i.price - total_discount_items) * i.quantity;
				i.line_amount_after_line_discount = amountItem;
				i.amount = i.price * i.quantity;
				_amount += amountItem;
				if (i.amount !== null) {
					let totalDiscount = 0;
					i.discount_items.forEach((a) => {
						totalDiscount = totalDiscount + a.amount;
					});
					i.discount_amount = totalDiscount;

					let discountValue = 0;
					i.discount_items.forEach((a) => {
						discountValue = discountValue + a.value;
					});
					i.discount_value = totalDiscount;

					let discountRate= 0;
					i.discount_items.forEach((a) => {
						discountRate = discountRate + a.rate;
					});
					i.discount_rate = discountRate;
				}
			});
			return _amount;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[items]
	);

	useEffect(() => {
		if (items) {
			let amount = totalAmount(items);
			setChangeMoney(amount);
			let _itemGifts: any = [];
			for (let i = 0; i < items.length; i++) {
				if (!items[i].gifts) {
					return;
				}
				_itemGifts = [..._itemGifts, ...items[i].gifts];
			}
			props.setItemGift(_itemGifts);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items]);

	const showAddGiftModal = useCallback(
		(index: number) => {
			if (items) {
				setIndexItem(index);
				setItemGift([...items[index].gifts]);
				setVisibleGift(true);
			}
		},
		[items]
	);

	const onChangeNote = (e: any, index: number) => {
		let value = e.target.value;
		if (items) {
			let _items = [...items];
			_items[index].note = value;
			setItems(_items);
		}
	};

	const handleDelayCalculateWhenChangeOrderInput = (
		inputRef: React.MutableRefObject<any>,
		_items: OrderLineItemRequest[],
		isShouldAutomaticDiscount = true
	) => {
		console.log('_items', _items)
		// delay khi thay đổi số lượng
		//nếu có chiết khấu tự động
		if (isAutomaticDiscount) {
			handleDelayActionWhenInsertTextInSearchInput(
				inputRef,
				() => {
					if (isShouldAutomaticDiscount) {
						handleApplyDiscount(_items)
					} else {
						calculateChangeMoney(_items)
					}
				},
				QUANTITY_DELAY_TIME
			);
		//nếu có coupon
		} else if(couponInputText) {
			handleDelayActionWhenInsertTextInSearchInput(
				inputRef,
				() => handleApplyCouponWhenInsertCoupon(couponInputText, _items),
				QUANTITY_DELAY_TIME
			);
		} else {
			handleDelayActionWhenInsertTextInSearchInput(
				inputRef,
				() => calculateChangeMoney(_items),
				QUANTITY_DELAY_TIME
			);
		}
	};

	const onChangeQuantity = (value: number | null, index: number) => {
		if (items) {
			let _items = _.cloneDeep(items)
			if (value === _items[index].quantity) {
				return;
			}
			let _item = _items[index];
			_item.quantity = Number(value == null ? "0" : value.toString().replace(".", ""));
			_item.discount_items.forEach((singleDiscount) => {
				singleDiscount.amount = _item.quantity * singleDiscount.value;
			});
			_item.amount = _item.quantity * _item.price;
			_item.discount_value = getLineItemDiscountValue(_item);
			_item.discount_amount = getLineItemDiscountAmount(_item);
			_item.discount_rate = getLineItemDiscountRate(_item);
			_item.line_amount_after_line_discount = getLineAmountAfterLineDiscount(_item);
			handleDelayCalculateWhenChangeOrderInput(lineItemQuantityInputTimeoutRef, _items);
		}
	};

	const onChangePrice = (value: number | null, index: number) => {
		if (items) {
			let _items = _.cloneDeep(items)
			if (value !== null && value !== _items[index].price) {
				_items[index].price = value;
				handleDelayCalculateWhenChangeOrderInput(lineItemPriceInputTimeoutRef, _items);
			}
		}
	};

	const onDiscountItem = (_items: Array<OrderLineItemRequest>) => {
		console.log('_items', _items)
		handleDelayCalculateWhenChangeOrderInput(lineItemDiscountInputTimeoutRef, _items, false);
	};

	// render

	const renderSearchVariant = (item: VariantResponse) => {
		let avatar = findAvatar(item.variant_images);
		return (
			<Row>
				<Col
					span={4}
					style={{
						alignItems: "center",
						justifyContent: "center",
						display: "flex",
						padding: "4px 6px",
					}}
				>
					<img
						src={avatar === "" ? imgDefault : avatar}
						alt="anh"
						placeholder={imgDefault}
						style={{ width: "50%", borderRadius: 5 }}
					/>
				</Col>
				<Col span={14}>
					<div style={{ padding: "5px 0" }}>
						<span
							className="searchDropdown__productTitle"
							style={{ color: "#37394D" }}
							title={item.name}
						>
							{item.name}
						</span>
						<div style={{ color: "#95A1AC" }}>{item.sku}</div>
					</div>
				</Col>
				<Col span={6}>
					<div style={{ textAlign: "right", padding: "0 20px" }}>
						<div style={{ display: "inline-block", textAlign: "right" }}>
							<Col style={{ color: "#222222" }}>
								{`${findPrice(item.variant_prices, AppConfig.currency)} `}
								<span
									style={{
										color: "#737373",
										textDecoration: "underline",
										textDecorationColor: "#737373",
									}}
								>
									đ
								</span>
							</Col>
							<div style={{ color: "#737373" }}>
								Có thể bán:
								<span
									style={{
										color:
											(item.available === null ? 0 : item.available) > 0
												? "#2A2A86"
												: "rgba(226, 67, 67, 1)",
									}}
								>
									{` ${item.available === null ? 0 : item.available}`}
								</span>
							</div>
						</div>
					</div>
				</Col>
			</Row>
		);
	};

	const convertResultSearchVariant = useMemo(() => {
		let options: any[] = [];
		resultSearchVariant.items.forEach((item: VariantResponse, index: number) => {
			options.push({
				label: renderSearchVariant(item),
				value: item.id ? item.id.toString() : "",
			});
		});
		return options;
	}, [resultSearchVariant]);

	const checkIfLineItemHasAutomaticDiscount = (lineItem: OrderLineItemRequest) => {
		return lineItem.discount_items.some((discount) => discount.promotion_id);
	};

	const checkIfOrderHasAutomaticDiscount = () => {
		if (promotion && promotion.promotion_id) {
			return true;
		}
		return false;
	};

	const ProductColumn = {
		title: () => (
			<div className="text-center">
				<div style={{ textAlign: "left" }}>Sản phẩm</div>
			</div>
		),
		width: "34%",
		className: "yody-pos-name 2",
		render: (l: OrderLineItemRequest, item: any, index: number) => {
			return (
				<div
					className="w-100"
					style={{
						overflow: "hidden",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<div className="d-flex align-items-center">
						<div
							style={{
								width: "calc(100% - 32px)",
								float: "left",
							}}
						>
							<div className="yody-pos-sku">
								<Link
									target="_blank"
									to={`${UrlConfig.PRODUCT}/${l.product_id}/variants/${l.variant_id}`}
								>
									{l.sku}
								</Link>
							</div>
							<div className="yody-pos-varian">
								<Tooltip title={l.variant} className="yody-pos-varian-name">
									<span>{l.variant}</span>
								</Tooltip>
							</div>
						</div>
					</div>
					<div style={{ marginTop: 5 }}>
						{l.gifts &&
							l.gifts.map((a, index1) => (
								<div key={index1} className="yody-pos-addition yody-pos-gift 3">
									<div>
										<img src={giftIcon} alt="" />
										<i style={{ marginLeft: 7 }}>
											{a.variant} ({a.quantity})
										</i>
									</div>
								</div>
							))}
					</div>
					<div className="yody-pos-note" hidden={!l.show_note && l.note === ""}>
						<Input
							addonBefore={<EditOutlined />}
							maxLength={255}
							allowClear={true}
							onBlur={() => {
								if (l.note === "") {
									if (!items) {
										return;
									}
									let _items = [...items];
									_items[index].show_note = false;
									setItems(_items);
								}
							}}
							className="note"
							value={l.note}
							onChange={(e) => onChangeNote(e, index)}
							placeholder="Ghi chú"
						/>
					</div>
				</div>
			);
		},
	};

	const AmountColumn = {
		title: () => (
			<div className="text-center">
				<div style={{ textAlign: "center" }}>Số lượng</div>
				{items && getTotalQuantity(items) > 0 && (
					<span style={{ color: "#2A2A86" }}>({formatCurrency(getTotalQuantity(items))})</span>
				)}
			</div>
		),
		className: "yody-pos-quantity text-center",
		width: "9%",
		align: "right",
		render: (l: OrderLineItemRequest, item: any, index: number) => {
			return (
				<div className="yody-pos-qtt">
					<NumberInput
						format={(a: string) => formatCurrency(a)}
						replace={(a: string) => replaceFormatString(a)}
						style={{ textAlign: "right", fontWeight: 500, color: "#222222" }}
						value={l.quantity}
						onChange={(value) => {
							// let maxQuantityToApplyDiscount = l?.maxQuantityToApplyDiscount;
							// if (
							//   isAutomaticDiscount &&
							//   value &&
							//   maxQuantityToApplyDiscount &&
							//   value > maxQuantityToApplyDiscount
							// ) {
							//   showError(
							//     `Quá số lượng hưởng chiết khấu/ khuyến mại là ${maxQuantityToApplyDiscount} sản phẩm ở sản phẩm ${l.product} . Vui lòng tách dòng!`
							//   );
							//   l.quantity = maxQuantityToApplyDiscount;
							//   value = maxQuantityToApplyDiscount;
							//   return;
							// }
							onChangeQuantity(value, index);
						}}
						// max={l.maxQuantityToApplyDiscount}
						min={1}
						maxLength={4}
						minLength={0}
						disabled={levelOrder > 3}
						isChangeAfterBlur = {false}
					/>
				</div>
			);
		},
	};

	const inventoryColumnt = {
		title: () => (
			<div>
				<span style={{ color: "#222222", textAlign: "center" }}>Tồn</span>
			</div>
		),
		className: "yody-pos-quantity text-center",
		width: "8%",
		align: "center",
		render: (a: OrderLineItemRequest, item: any, index: number) => {
			let inventory = a.available ? a.available : 0;
			return (
				<span style={inventory > 0 ? { color: "#008000" } : { color: "#e24343" }}>{a.available ? a.available : 0}</span>
			);
		},
	};

	const PriceColumn = {
		title: () => (
			<div>
				<span style={{ color: "#222222", textAlign: "right" }}>Đơn giá</span>
				<span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
			</div>
		),
		className: "yody-pos-price text-right",
		width: "15%",
		align: "center",
		render: (l: OrderLineItemRequest, item: any, index: number) => {
			return (
				<div ref={lineItemPriceInputTimeoutRef}>
					<NumberInput
						format={(a: string) => formatCurrency(a)}
						replace={(a: string) => replaceFormatString(a)}
						placeholder="VD: 100,000"
						style={{
							textAlign: "right",
							width: "100%",
							fontWeight: 500,
							color: "#222222",
						}}
						maxLength={14}
						minLength={0}
						value={l.price}
						onChange={(value) => {
							onChangePrice(value, index);
						}}
						// disabled={levelOrder > 3 || isAutomaticDiscount}
						disabled={
							levelOrder > 3 ||
							checkIfLineItemHasAutomaticDiscount(l) ||
							couponInputText !== "" ||
							promotion !== null ||
							(userReducer?.account?.role_id !== ACCOUNT_ROLE_ID.admin)
						}
					/>
				</div>
			);
		},
	};

	const DiscountColumn = {
		title: () => (
			<div className="text-center">
				<div>Chiết khấu</div>
			</div>
		),
		align: "center",
		width: "20%",
		className: "yody-table-discount text-right",
		render: (l: OrderLineItemRequest, item: any, index: number) => {
			console.log('l', l)
			return (
				<div className="site-input-group-wrapper saleorder-input-group-wrapper discountGroup">
					<DiscountGroup
						price={l.price}
						index={index}
						discountRate={l.discount_items[0]?.rate ? l.discount_items[0]?.rate : 0}
						discountValue={l.discount_items[0]?.value ? l.discount_items[0]?.value : 0}
						totalAmount={l.discount_items[0]?.amount ? l.discount_items[0]?.amount : 0}
						items={items}
						handleCardItems={onDiscountItem}
						// disabled={levelOrder > 3 || isAutomaticDiscount || couponInputText !== ""}
						disabled={
							levelOrder > 3 ||
							checkIfLineItemHasAutomaticDiscount(l) ||
							// couponInputText !== "" ||
							checkIfOrderHasAutomaticDiscount()
						}
					/>
				</div>
			);
		},
	};

	const TotalPriceColumn = {
		title: () => (
			<div className="text-center">
				<span style={{ color: "#222222" }}>Tổng tiền</span>
				<span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
			</div>
		),
		align: "center",
		className: "yody-table-total-money text-right",
		width: "12%",
		render: (l: OrderLineItemRequest, item: any, index: number) => {
			return (
				<div className="yody-pos-varian-name">
					{formatCurrency(l.line_amount_after_line_discount)}
				</div>
			);
		},
	};

	const ActionColumn = {
		title: () => (
			<div className="text-center">
				<div>Thao tác</div>
			</div>
		),
		width: "10%",
		className: "saleorder-product-card-action ",
		render: (l: OrderLineItemRequest, item: any, index: number) => {
			const menu = (
				<Menu className="yody-line-item-action-menu saleorders-product-dropdown">
					<Menu.Item key="1">
						<Button
							type="text"
							onClick={() => showAddGiftModal(index)}
							className=""
							style={{
								paddingLeft: 24,
								background: "transparent",
								border: "none",
							}}
						>
							Thêm quà tặng
						</Button>
					</Menu.Item>
					<Menu.Item key="2">
						<Button
							type="text"
							onClick={() => {
								if (!items) {
									return;
								}
								let _items = [...items];
								_items[index].show_note = true;
								setItems(_items);
							}}
							className=""
							style={{
								paddingLeft: 24,
								background: "transparent",
								border: "none",
							}}
						>
							Thêm ghi chú
						</Button>
					</Menu.Item>
				</Menu>
			);
			return (
				<div
					style={{
						display: "flex",
						justifyContent: "right",
					}}
				>
					<div>
						<Dropdown
							overlay={menu}
							trigger={["click"]}
							placement="bottomRight"
							disabled={levelOrder > 3}
						>
							<Button type="text" className="p-0 ant-btn-custom" style={{ border: "0px" }}>
								<img src={arrowDownIcon} alt="" style={{ width: 17 }} />
							</Button>
						</Dropdown>
						<Button
							style={{ background: "transparent", border: "0px" }}
							type="text"
							className="p-0 ant-btn-custom"
							onClick={() => onDeleteItem(index)}
							disabled={levelOrder > 3}
						>
							<img src={XCloseBtn} alt="" style={{ width: 22 }} />
						</Button>
					</div>
				</div>
			);
		},
	};

	const columns = [
		ProductColumn,
		AmountColumn,
		inventoryColumnt,
		PriceColumn,
		DiscountColumn,
		TotalPriceColumn,
		ActionColumn,
	];

	const autoCompleteRef = createRef<RefSelectProps>();
	const createItem = (variant: VariantResponse) => {
		let price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
		let taxRate = findTaxInVariant(variant.variant_prices, AppConfig.currency);
		let avatar = findAvatar(variant.variant_images);
		let orderLine: OrderLineItemRequest = {
			id: new Date().getTime(),
			sku: variant.sku,
			variant_id: variant.id,
			product_id: variant.product.id,
			variant: variant.name,
			variant_barcode: variant.barcode,
			product_type: variant.product.product_type,
			product_code: variant.product.code,
			quantity: 1,
			price: price,
			amount: price,
			note: "",
			type: Type.NORMAL,
			variant_image: avatar,
			unit: variant.product.unit,
			weight: variant.weight,
			weight_unit: variant.weight_unit,
			warranty: variant.product.care_labels,
			discount_items: [],
			discount_amount: 0,
			discount_rate: 0,
			composite: variant.composite,
			is_composite: variant.composite,
			discount_value: 0,
			line_amount_after_line_discount: price,
			product: variant.product.name,
			// tax_include: true,
			tax_include: null,
			tax_rate: taxRate,
			show_note: false,
			gifts: [],
			position: undefined,
			available: variant.available,
		};
		return orderLine;
	};

	const removeDiscountItem = (item: OrderLineItemRequest) => {
		item.discount_amount = 0;
		item.discount_rate = 0;
		item.discount_value = 0;
		item.discount_items = [];
		item.line_amount_after_line_discount = item.quantity * item.price;
	};

	const removeAutomaticDiscountItem = (item: OrderLineItemRequest) => {
		if (item.discount_items) {
			for (let i = 0; i < item.discount_items.length; i++) {
				if (item.discount_items[i].promotion_id) {
					item.discount_items.splice(i, 1);
				}
			}
		}
	};

	const onDeleteItem = (index: number) => {
		if (!items) {
			return;
		}
		let _items = [...items];
		_items.splice(index, 1);
		if (isAutomaticDiscount && _items.length > 0) {
			handleApplyDiscount(_items);
		} else if (couponInputText && _items.length > 0) {
			handleApplyCouponWhenInsertCoupon(couponInputText, _items);
		}
		setItems(_items);
		calculateChangeMoney(_items);
	};

	// const handleSplitLineItem = (items: OrderLineItemRequest[], lineItem: OrderLineItemRequest, quantity: 1, position:number) => {
	//   items.splice(position, 0, lineItem);
	// };

	const calculateDiscount = (
		_item: OrderLineItemRequest,
		_highestValueSuggestDiscount: any
	) => {
		let item: OrderLineItemRequest = { ..._item };
		let highestValueSuggestDiscount = { ..._highestValueSuggestDiscount };
		let result: OrderLineItemRequest[] = [];
		let value: number = 0;
		if (!highestValueSuggestDiscount) {
			return [];
		}
		if (highestValueSuggestDiscount.value_type === "FIXED_AMOUNT") {
			value = highestValueSuggestDiscount.value ? highestValueSuggestDiscount.value : 0;
		} else if (highestValueSuggestDiscount.value_type === "PERCENTAGE") {
			value = highestValueSuggestDiscount.value
				? item.price * (highestValueSuggestDiscount.value / 100)
				: 0;
		} else if (highestValueSuggestDiscount.value_type === "FIXED_PRICE") {
			value = highestValueSuggestDiscount.value
				? item.price - highestValueSuggestDiscount.value
				: 0;
		}
		if (value > 0) {
			value = Math.min(value, item.price);
			value = Math.round(value);
			let rate = Math.round((value / item.price) * 100 * 100) / 100;
			rate = Math.min(rate, 100);

			const discountItem: OrderItemDiscountRequest = {
				rate,
				value,
				amount: value * item.quantity,
				reason: highestValueSuggestDiscount.title,
				promotion_id: highestValueSuggestDiscount.price_rule_id || undefined,
			};
			let itemResult = {
				..._item,
				discount_items: [discountItem],
			};
			itemResult.discount_value = getLineItemDiscountValue(itemResult);
			itemResult.discount_rate = getLineItemDiscountRate(itemResult);
			itemResult.discount_amount = getLineItemDiscountAmount(itemResult);
			itemResult.line_amount_after_line_discount =
				getLineAmountAfterLineDiscount(itemResult);
			result.push(itemResult);
		} else {
			result.push(_item);
		}
		return result;
	};

	const getDiscountMulti = (
		suggested_discounts: SuggestDiscountResponseModel[],
		item: OrderLineItemRequest
	): OrderLineItemRequest[] => {
		let result: OrderLineItemRequest[] = [];
		if (suggested_discounts.length === 0) {
			removeAutomaticDiscountItem(item);
			return [item];
		}
		const suggest = suggested_discounts[0];
		if (suggest.allocation_count === 0 || !suggest.allocation_count) {
			removeAutomaticDiscountItem(item);
			result = [item]; // trong pos chưa test
		} else if (item.quantity <= suggest.allocation_count) {
			result = calculateDiscount(item, suggest);
		} else if (item.quantity > suggest.allocation_count) {
			let itemResult: OrderLineItemRequest = {
				...item,
				quantity: suggest.allocation_count,
			};
			let result1 = calculateDiscount(itemResult, suggest);
			let suggestLeft = suggested_discounts;
			suggestLeft.splice(0, 1);
			let newItem = {
				...item,
				quantity: item.quantity - suggest.allocation_count,
			};
			let result2 = getDiscountMulti(suggestLeft, newItem);
			result = [...result, ...result1, ...result2];
		}
		return result;
	};

	const getApplyDiscountLineItem = (
		checkingDiscountResponse: BaseResponse<ApplyCouponResponseModel>,
		items: OrderLineItemRequest[]
	) => {
		let result: OrderLineItemRequest[] = [];
		let responseLineItemLength = checkingDiscountResponse.data.line_items.length;
		for (let i = 0; i < responseLineItemLength; i++) {
			let line = checkingDiscountResponse.data.line_items[i];
			const suggested_discounts = line.suggested_discounts;
			let discountMulti = getDiscountMulti(suggested_discounts, items[i]);
			result = result.concat(discountMulti);
		}
		return result;
	};

	const handleApplyDiscountOrder = (
		checkingDiscountResponse: BaseResponse<ApplyCouponResponseModel>,
		items: OrderLineItemRequest[] | undefined
	) => {
		if (!items) {
			return null;
		}
		if (checkingDiscountResponse.data.suggested_discounts === null || checkingDiscountResponse.data.suggested_discounts.length === 0) {
			return null;
		}
		let discountOrder = checkingDiscountResponse.data.suggested_discounts[0];
		if (discountOrder) {
			if (!discountOrder?.value) {
				return null;
			}
			let totalLineAmountAfterDiscount = getTotalAmountAfterDiscount(items);
			let discountAmount =  getTotalDiscountOrder(checkingDiscountResponse.data, items);
			// let discountAmount = 0;
			// switch (discountOrder.value_type) {
			// 	case DISCOUNT_VALUE_TYPE.fixedAmount:
			// 		discountAmount = discountOrder.value;
			// 		break;
			// 	case DISCOUNT_VALUE_TYPE.percentage:
			// 		discountAmount = (discountOrder.value / 100) * totalLineAmountAfterDiscount;
			// 		break;
			// 	case DISCOUNT_VALUE_TYPE.fixedPrice:
			// 		discountAmount = totalLineAmountAfterDiscount - discountOrder.value;
			// 		break;
			// 	default:
			// 		break;
			// }
			if (discountAmount > 0) {
				if (discountAmount > totalLineAmountAfterDiscount) {
					discountAmount = totalLineAmountAfterDiscount;
				}
				let discountRate = (discountAmount / totalLineAmountAfterDiscount) * 100;
				if (discountOrder.price_rule_id) {
					return {
						promotion_id: discountOrder.price_rule_id,
						reason: discountOrder.title,
						value: discountAmount,
						amount: discountAmount,
						rate: discountRate,
					}
				}
			} else {
				return null;
			}
		}
		return null;
	};
	

	const isOrderHasDiscountLineItems = (responseData:ApplyCouponResponseModel) => {
		let result = false;
		if(responseData.line_items.some(lineItem => {
			return lineItem.suggested_discounts.length > 0
		})) {
			result = true;
		}
		return result;
	};

	const isOrderHasDiscountOrder = (responseData:ApplyCouponResponseModel) => {
		let result = false;
		if(responseData.suggested_discounts.length > 0) {
			result = true;
		}
		return result;
	};

	const getDiscountValue = (type: string|null, value: number|null, totalAmount: number) => {
		let discountAmount = 0;
		if(!value) {
			value = 0;
		}
		switch (type) {
			case DISCOUNT_VALUE_TYPE.fixedAmount:
				discountAmount = value;
				break;
			case DISCOUNT_VALUE_TYPE.percentage:
				discountAmount = (value / 100) * totalAmount;
				break;
			case DISCOUNT_VALUE_TYPE.fixedPrice:
				discountAmount = totalAmount - value;
				break;
			default:
				break;
		}
		return discountAmount
	};

	const getTotalDiscountLineItems = (responseData:ApplyCouponResponseModel) => {
		let result = 0;
		responseData.line_items.forEach(lineItem => {
			let suggestDiscount = lineItem.suggested_discounts[0];
			let discountSingleLineItem = getDiscountValue(suggestDiscount?.value_type, suggestDiscount?.value, lineItem?.original_total );
			result = result + discountSingleLineItem;
		})
		return result;
	};

	const getTotalDiscountOrder = (responseData:ApplyCouponResponseModel, items: OrderLineItemRequest[] | undefined) => {
		if(!items) {
			return 0
		}
		let totalLineAmountAfterDiscount = getTotalAmountAfterDiscount(items);
		let discountOrder = responseData.suggested_discounts[0];
		if(!discountOrder.value_type || !discountOrder.value) {
			return 0
		}
		let discountAmountOrder = getDiscountValue(discountOrder.value_type, discountOrder.value, totalLineAmountAfterDiscount)
		return discountAmountOrder
	};

	const lineItemsConvert = (items: OrderLineItemRequest[]) => {
		return items.filter(item => {
			return [PRODUCT_TYPE.normal, PRODUCT_TYPE.combo].includes(item.product_type)
		}).map((single) => {
			return {
				original_unit_price: single.price,
				product_id: single.product_id,
				quantity: single.quantity,
				sku: single.sku,
				variant_id: single.variant_id,
			};
		});
	};

	const handleApplyDiscount = async (
		items: OrderLineItemRequest[] | undefined,
		_isAutomaticDiscount: boolean = isAutomaticDiscount
	) => {
		isShouldUpdateDiscountRef.current = true;
		if (!items || items.length === 0 || !_isAutomaticDiscount) {
			return;
		}
		console.log('items', items)
		setIsCalculateDiscount(true);
		removeCoupon()
		// handleRemoveAllAutomaticDiscount();
		let params: DiscountRequestModel = {
			order_id: orderDetail?.id || null,
			customer_id: customer?.id || null,
			gender: customer?.gender || null,
			customer_group_id: customer?.customer_group_id || null,
			customer_loyalty_level_id: loyaltyPoint?.loyalty_level_id || null,
			customer_type_id: customer?.type_id || null,
			birthday_date: customer?.birthday || null,
			wedding_date: customer?.wedding_date || null,
			store_id: form.getFieldValue("store_id"),
			sales_channel_name: ADMIN_ORDER.channel_name,
			order_source_id: form.getFieldValue("source_id"),
			assignee_code: customer?.responsible_staff_code || null,
			line_items: lineItemsConvert(items),
			applied_discount: null,
			taxes_included: true,
			tax_exempt: false,
		};
		applyDiscountService(params).then((response) => {
			if (isFetchApiSuccessful(response)) {
				if (response.data.line_items.length > 0) {
					if(isOrderHasDiscountLineItems(response.data) && isOrderHasDiscountOrder(response.data)) {
						let itemsAfterRemove = items.map(single => {
							removeDiscountItem(single)
							return single
						})
						let totalDiscountLineItems = getTotalDiscountLineItems(response.data);
						let totalDiscountOrder = getTotalDiscountOrder(response.data, itemsAfterRemove);
						if(totalDiscountLineItems > totalDiscountOrder) {
							let result = getApplyDiscountLineItem(response, items);
							calculateChangeMoney(result, null);
						} else {
							let itemsAfterRemove = items.map(single => {
								removeDiscountItem(single)
								return single
							})
							let promotionResult = handleApplyDiscountOrder(response, itemsAfterRemove);
							if(promotionResult) {
								form.setFieldsValue({
									note: `(${promotionResult.reason})`
								})
							}
							calculateChangeMoney(items, promotionResult)
						}
					} else if(isOrderHasDiscountLineItems(response.data)) {
							let result = getApplyDiscountLineItem(response, items);
							calculateChangeMoney(result, null)
					} else if(isOrderHasDiscountOrder(response.data)) {
						let itemsAfterRemove = items.map(single => {
							removeDiscountItem(single)
							return single
						})
						let promotionResult = handleApplyDiscountOrder(response, itemsAfterRemove);
						if(promotionResult) {
							form.setFieldsValue({
								note: `(${promotionResult.reason})`
							})
						}
						calculateChangeMoney(items, promotionResult)
					} else {
						form.setFieldsValue({
							note: ``
						})
						calculateChangeMoney(items)
					}
					showSuccess("Cập nhật chiết khấu tự động thành công!");
				} else {
					form.setFieldsValue({
						note: ""
					})
					showError("Có lỗi khi áp dụng chiết khấu!");
					calculateChangeMoney(items)
				}
			} else {
				calculateChangeMoney(items)
				handleFetchApiError(response, "Áp dụng chiết khấu", dispatch)
			}
    }).catch((error) => {
      console.log('error', error)
      showError("Cập nhật chiết khấu tự động thất bại!");
    }).finally (()=>{
      setIsCalculateDiscount(false);
    });
		
	};

	const handleApplyCouponWhenInsertCoupon = async (coupon: string, _items = items) => {
		console.log('_items', _items)
		isShouldUpdateCouponRef.current = true;
		if (!_items || _items?.length === 0 || !coupon) {
			return;
		}
		handleRemoveAllDiscount();
		coupon = coupon.trim();
		if (!isAutomaticDiscount) {
			let params: DiscountRequestModel = {
				order_id: orderDetail?.id || null,
				customer_id: customer?.id || null,
				gender: customer?.gender || null,
				customer_group_id: customer?.customer_group_id || null,
				customer_loyalty_level_id: loyaltyPoint?.loyalty_level_id || null,
				customer_type_id: customer?.type_id || null,
				birthday_date: customer?.birthday || null,
				wedding_date: customer?.wedding_date || null,
				store_id: form.getFieldValue("store_id"),
				sales_channel_name: ADMIN_ORDER.channel_name,
				order_source_id: form.getFieldValue("source_id"),
				assignee_code: customer?.responsible_staff_code || null,
				line_items: lineItemsConvert(_items),
				applied_discount: {
					code: coupon,
				},
				taxes_included: true,
				tax_exempt: false,
			};
			// dispatch(showLoading());
			await applyDiscountService(params)
				.then(async (response: BaseResponse<ApplyCouponResponseModel>) => {
					if (isFetchApiSuccessful(response)) {
						const applyDiscountResponse = response.data.applied_discount;
							if (applyDiscountResponse.invalid === true) {
								showError(applyDiscountResponse.invalid_description);
								if (
									applyDiscountResponse.invalid_description ===
									"Mã khuyến mại không tồn tại." ||
									applyDiscountResponse.invalid_description ===
									"Khuyến mại đã hết lượt sử dụng."
								) {
									_items?.forEach((item) => {
										removeDiscountItem(item);
									});
									setCouponInputText && setCouponInputText(coupon);
								} else {
									setCouponInputText && setCouponInputText(coupon);
								}
								setIsCouponValid(false);
								setCoupon && setCoupon("");
								setItems(_items);
								calculateChangeMoney(_items);
								setPromotion && setPromotion(null)
							} else {
								setCoupon && setCoupon(coupon);
								setCouponInputText(coupon);
								setIsCouponValid(true);
								// const discount_code = applyDiscountResponse.code || undefined;
								let couponType = applyDiscountResponse.value_type;
								let listDiscountItem: any[] = [];
								let totalAmount = getTotalAmountAfterDiscount(_items);
								console.log('totalAmount', totalAmount)
								console.log('_items222222222222', _items)
								response.data.line_items.forEach((single) => {
									if (listDiscountItem.some((a) => a.variant_id === single.variant_id)) {
										return;
									} else if (single.applied_discount?.invalid !== false) {
										return;
									} else {
										listDiscountItem.push(single);
									}
								});
								let promotionResult = {...promotion};
								switch (couponType) {
									case DISCOUNT_VALUE_TYPE.percentage:
										if (applyDiscountResponse.value) {
											let discountRate = Math.min(100, applyDiscountResponse.value);
											let discountValue = (applyDiscountResponse.value / 100) * totalAmount;
												promotionResult ={
													amount: discountValue,
													discount_code: applyDiscountResponse.code,
													promotion_id: null,
													rate: discountRate,
													value: discountValue,
												};
										}
										break;
									case DISCOUNT_VALUE_TYPE.fixedAmount:
										if (applyDiscountResponse.value) {
											let discountValue = Math.min(applyDiscountResponse.value, totalAmount);
											let discountRate = (discountValue / totalAmount) * 100;
											promotionResult ={
													amount: discountValue,
													discount_code: applyDiscountResponse.code,
													promotion_id: null,
													rate: discountRate,
													value: discountValue,
												};
										}
										break;
									case DISCOUNT_VALUE_TYPE.fixedPrice:
										if (applyDiscountResponse.value) {
											let value = orderAmount - applyDiscountResponse.value;
											let discountValue = Math.min(value, totalAmount);
											let discountRate = (discountValue / totalAmount) * 100;
											promotionResult ={
													amount: discountValue,
													discount_code: applyDiscountResponse.code,
													promotion_id: null,
													rate: discountRate,
													value: discountValue,
												};
										}
										break;
									// default là chiết khấu theo line
									default:
										let lineItemDiscountArray = response.data.line_items.filter(
											(single) => {
												return single.applied_discount?.invalid === false;
											}
										);
										_items.forEach((singleItem) => {
											let itemDiscount = lineItemDiscountArray.find((singleLineItem) => {
												return singleLineItem.variant_id === singleItem.variant_id;
											});
											if (itemDiscount) {
												let applyDiscountLineItem = itemDiscount.applied_discount;
												let discount_value = 0;
												switch (applyDiscountLineItem?.value_type) {
													case DISCOUNT_VALUE_TYPE.percentage:
														discount_value = applyDiscountLineItem?.value
															? (applyDiscountLineItem?.value / 100) * singleItem.price
															: 0;
														break;
													case DISCOUNT_VALUE_TYPE.fixedAmount:
														discount_value = applyDiscountLineItem?.value || 0;
														break;
													case DISCOUNT_VALUE_TYPE.fixedPrice:
														discount_value = applyDiscountLineItem?.value
															? singleItem.price - applyDiscountLineItem?.value
															: 0;
														break;
													default:
														break;
												}
												if (discount_value > 0) {
													discount_value = Math.min(discount_value, singleItem.price);
													let discount_rate = (discount_value * 100) / singleItem.price;
													singleItem.discount_items = [
														{
															amount: singleItem.quantity * discount_value,
															value: discount_value,
															rate: discount_rate
																? Math.round(discount_rate * 100) / 100
																: 0,
															reason: applyDiscountLineItem?.title || null,
														},
													];
													singleItem.discount_value =
														getLineItemDiscountValue(singleItem);
													singleItem.discount_rate = getLineItemDiscountRate(singleItem);
													singleItem.discount_amount =
														getLineItemDiscountAmount(singleItem);
													singleItem.line_amount_after_line_discount =
														getLineAmountAfterLineDiscount(singleItem);
												}
											} else {
												removeDiscountItem(singleItem);
											}
										});
										calculateChangeMoney(_items);
										setPromotion && setPromotion({
											amount: 0,
											discount_code: applyDiscountResponse.code,
											promotion_id: null,
											rate: 0,
											value: 0,
										})
										break;
								}
								form.setFieldsValue({
									note: `(${applyDiscountResponse.code}-${applyDiscountResponse.title})`
								})
								calculateChangeMoney(_items, promotionResult)
								showSuccess("Thêm coupon thành công!");
							}
					} else {
						calculateChangeMoney(_items)
						handleFetchApiError(response, "Áp dụng chiết khấu", dispatch)
					}
				})
				.catch((error) => {
					console.log("error", error);
					calculateChangeMoney(_items)
					showError("Có lỗi khi áp dụng chiết khấu!");
				})
				.finally(() => {
					// dispatch(hideLoading());
				});
			setIsVisiblePickCoupon(false);
		}
	};

	const onSearchVariantSelect = useCallback(
		async (v, o) => {
			if (!items) {
				return;
			}

			let newV = parseInt(v);
			let _items = [...items];
			let indexSearch = resultSearchVariant.items.findIndex((s) => s.id === newV);
			let index = _items.findIndex((i) => i.variant_id === newV);
			let r: VariantResponse = resultSearchVariant.items[indexSearch];
			const item: OrderLineItemRequest = createItem(r);
			item.position = items.length + 1;
			if (r.id === newV && checkInventory(item) === true) {
				if (splitLine || index === -1) {
					_items.unshift(item);
					calculateChangeMoney(_items);
				} else {
					let variantItems = _items.filter((item) => item.variant_id === newV);
					let firstIndex = 0;
					variantItems[firstIndex].quantity += 1;
					variantItems[firstIndex].line_amount_after_line_discount +=
						variantItems[firstIndex].price -
						variantItems[firstIndex].discount_items[0]?.amount *
						variantItems[firstIndex].quantity;
					calculateChangeMoney(_items);
				}
			}

			if (isAutomaticDiscount && _items.length > 0) {
				handleApplyDiscount(_items);
			} else if (couponInputText && _items.length > 0) {
				handleApplyCouponWhenInsertCoupon(couponInputText, _items);
			}
			autoCompleteRef.current?.blur();
			setIsInputSearchProductFocus(false);
			setKeySearchVariant("");
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[items, resultSearchVariant.items, promotion, isAutomaticDiscount, couponInputText, autoCompleteRef, splitLine, handleApplyDiscount, handleApplyCouponWhenInsertCoupon]
	);

	/**
	 * kiểm tra Sản phẩm thêm ăn theo cấu hình cài đặt của tồn kho bán
	 */
	const checkInventory = (item: OrderLineItemRequest) => {
		if (!item) return true;

		let available = item.available === null ? 0 : item.available;

		if (available <= 0 && orderConfig?.sellable_inventory !== true) {
			showError(`Không thể bán sản phẩm đã hết hàng trong kho`);
			return false;
		}

		return true;
	};

	const onChangeProductSearch = useCallback(
		async (value: string) => {
			setIsInputSearchProductFocus(true);
			setKeySearchVariant(value);
			if (!isShowProductSearch || !isInputSearchProductFocus) {
				return;
			}
			if (orderConfig?.allow_choose_item && value) {
				await form?.validateFields(["store_id"]).catch(() => {
					return;
				});
			}

			initQueryVariant.info = value;
			initQueryVariant.store_ids = form?.getFieldValue(["store_id"]);
			if (value.length >=3) {
				setSearchProducts(true);
			} else {
				setSearchProducts(false);
			}
			const handleSearchProduct = () => {
				if (value.trim()) {
					(async () => {
						try {
							await dispatch(
								searchVariantsOrderRequestAction(initQueryVariant, (data) => {
									setResultSearchVariant(data);
									setSearchProducts(false);
									setIsShowProductSearch(true);
									if(data.items.length === 0) {
										showError("Không tìm thấy sản phẩm!")
									}
								}, () => {
									setSearchProducts(false);
								})
							);
						} catch {
							setSearchProducts(false);
						}
					})();
				} else {
					setSearchProducts(false);
				}
			};
			handleDelayActionWhenInsertTextInSearchInput(autoCompleteRef, () =>
				handleSearchProduct()
			);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[form]
	);

	const showInventoryModal = useCallback(() => {
		if (items !== null && items?.length) setInventoryModalVisible(true);
		else showWarning("Vui lòng chọn sản phẩm vào đơn hàng!");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, items]);

	useEffect(() => {
		dispatch(StoreSearchListAction("", setStoreArrayResponse));
	}, [dispatch]);

	// useEffect(() => {
	//   let storeids = [104435, 104436];
	//   dispatch(getStoreSearchIdsAction(storeids, setStoreSearchIds));
	// }, []);

	const handleInventoryCancel = useCallback(() => {
		setInventoryModalVisible(false);
	}, []);

	const onOkDiscountConfirm = (
		type: string,
		value: number,
		rate: number,
		coupon: string
	) => {
		let _value = value;
		let _rate = rate;
		let _promotion: OrderDiscountRequest | null | undefined = null
		if (!items || items?.length === 0) {
			showError("Bạn cần chọn sản phẩm trước khi thêm chiết khấu!");
		} else {
			// setVisiblePickDiscount(false);
			let totalOrderAmount = totalAmount(items);
			setDiscountType(type);
			if (type === MoneyType.MONEY) {
				_value = value;
				if(_value >= totalOrderAmount)	{
					_value = totalOrderAmount;
				}
				_rate = (_value / orderAmount) * 100;
			} else if (type === MoneyType.PERCENT) {
				_rate = rate;
				if(_rate >= 100)	{
					_rate = 100;
				}
				_value = (_rate * orderAmount) / 100;
			}
			_promotion = {
				amount: _value,
				discount_code: null,
				order_id: null,
				promotion_id: null,
				rate: _rate,
				reason: null,
				source: null,
				value: _value,
			}
			if (coupon) {
				handleApplyCouponWhenInsertCoupon(coupon);
			}
			if (items) {
				calculateChangeMoney(items, _promotion);
			}
			showSuccess("Thêm chiết khấu thành công!");
			setCoupon && setCoupon("");
		}
		setVisiblePickDiscount(false);
	};
	const onOkCouponConfirm = (
		type: string,
		value: number,
		rate: number,
		coupon: string
	) => {
		if (items?.length === 0) {
			showError("Bạn cần chọn sản phẩm trước khi thêm mã khuyến mại!");
		} else {
			// setVisiblePickDiscount(false);
			// setDiscountType(type);
			// setDiscountValue && setDiscountValue(value);
			// setDiscountRate && setDiscountRate(rate);
			if (coupon) {
				handleApplyCouponWhenInsertCoupon(coupon);
			} else {
				showError("Vui lòng điền mã giảm giá!");
			}
		}
	};

	const fillCustomNote = (items: OrderLineItemRequest[]) => {
		if(items.some(item => {
			return (item?.discount_items && item?.discount_items[0] && item?.discount_items[0]?.reason) 
		})) {
			let discountTitleArr: string[] = [];
			items.forEach(item => {
				let reason = item?.discount_items && item?.discount_items[0] && item?.discount_items[0]?.reason;
				if(reason) {
					return discountTitleArr.push(reason)
				}
			})
			discountTitleArr = _.uniq(discountTitleArr);
			if(discountTitleArr && discountTitleArr.length > 0) {
				let title = ""
				for (let i = 0; i < discountTitleArr.length; i++) {
					if(i< discountTitleArr.length -1) {
						title = title + discountTitleArr[i] + ", "
					} else {
						title = title + discountTitleArr[i] + "."
					}
				}
				form.setFieldsValue({
					note: `(${title})`
				})
			}
		}
	};

	const calculateChangeMoney = (
		_items: Array<OrderLineItemRequest>,
		_promotion?: OrderDiscountRequest | null,
	) => {
		console.log('_promotion', _promotion)
		if (_promotion === undefined) {
			if (promotion) {
				let _value = 0;
				let _rate = 0;
				let totalOrderAmount = totalAmount(_items);
				if (discountType === MoneyType.MONEY) {
					_value = promotion?.value || 0;
					_rate = (_value / totalOrderAmount) * 100;
				} else if (discountType === MoneyType.PERCENT) {
					_rate = promotion?.rate || 0;
					_value = (_rate * totalOrderAmount) / 100;
				}
				_promotion = {
					amount: _value,
					discount_code: null,
					order_id: null,
					promotion_id: null,
					rate: _rate,
					reason: null,
					source: null,
					value: _value,
				}
				if(promotion?.discount_code && promotion.value) {
					let _rate = (promotion.value / totalOrderAmount) * 100;
					_promotion.rate = _rate;
				}
			} else {
				_promotion = null
			}
		}
		fillCustomNote(_items);
		props.changeInfo(_items, _promotion);
		dispatch(changeOrderLineItemsAction(_items));
		const orderAmount = totalAmount(_items);
		if(orderCustomer) {
			const shippingAddress = getCustomerShippingAddress(orderCustomer);
			handleCalculateShippingFeeApplyOrderSetting(shippingAddress?.city_id, orderAmount, shippingServiceConfig,
				transportService, form, setShippingFeeInformedToCustomer
				);
		}
	};

	const dataCanAccess = useMemo(() => {
		let newData: Array<StoreResponse> = [];
		if (listStores && listStores.length) {
			if(userReducer.account?.account_stores && userReducer.account?.account_stores.length>0)
			{
				newData = listStores.filter((store) =>
					haveAccess(
						store.id,
						userReducer.account ? userReducer.account.account_stores : []
					)
				);
			}
			else{
				newData=listStores;
			}
			
			// trường hợp sửa đơn hàng mà account ko có quyền với cửa hàng đã chọn, thì vẫn hiển thị
			if (storeId && userReducer.account) {
				if (userReducer.account.account_stores.map((single) => single.store_id).indexOf(storeId) === -1) {
					let initStore = listStores.find((single) => single.id === storeId)
					if (initStore) {
						newData.push(initStore);
					}
				}
			}
		}
		// set giá trị mặc định của cửa hàng là cửa hàng có thể truy cập đầu tiên, nếu chưa chọn cửa hàng (update đơn hàng không set cửa hàng đầu tiên)
		if (newData && newData[0]?.id) {
			if (!storeId) {
				setStoreId(newData[0].id);
			}
		}
		return newData;
	}, [listStores, setStoreId, storeId, userReducer.account]);

	const onUpdateData = useCallback(
		(items: Array<OrderLineItemRequest>) => {
			let data = [...items];
			setItemGift(data);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[items]
	);

	const onCancleConfirm = useCallback(() => {
		setVisibleGift(false);
	}, []);

	const onOkConfirm = useCallback(() => {
		if (!items) {
			return;
		}
		setVisibleGift(false);
		let _items = [...items];
		let _itemGifts = [...itemGifts];
		_itemGifts.forEach((itemGift) => (itemGift.position = _items[indexItem].position));
		_items[indexItem].gifts = itemGifts;
		setItems(_items);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items, itemGifts, indexItem]);

	const removeCoupon = () => {
		if (promotion?.promotion_id || promotion?.discount_code) {
			setPromotion && setPromotion(null);
		}
		if (couponInputText) {
			setCoupon && setCoupon("");
			setCouponInputText("");
		}
	};

	const handleRemoveAllAutomaticDiscount = async () => {
		if (!items || items.length === 0) {
			return;
		}
		removeCoupon()
		let _items = [...items];
		_items.forEach((lineItem) => {
			if (lineItem.discount_items[0]?.promotion_id || couponInputText) {
				lineItem.discount_amount = 0;
				lineItem.discount_items = []
				lineItem.discount_rate = 0;
				lineItem.discount_value = 0;
				lineItem.line_amount_after_line_discount = getLineAmountAfterLineDiscount(lineItem);
			}
		});
		form.setFieldsValue({
			note: undefined
		})
		// calculateChangeMoney(_items, autoPromotionRate , autoPromotionValue);
		showSuccess("Xóa tất cả chiết khấu tự động trước đó thành công!");
	};

	const handleRemoveAllDiscount = async () => {
		if (!items || items.length === 0) {
			return;
		}
		if (couponInputText) {
			setCoupon && setCoupon("");
			setCouponInputText("");
		}
		let _items = [...items];
		_items.forEach((lineItem) => {
			lineItem.discount_amount = 0;
			lineItem.discount_items = [];
			lineItem.discount_rate = 0;
			lineItem.discount_value = 0;
			lineItem.line_amount_after_line_discount = lineItem.price * lineItem.quantity;
		});
		form.setFieldsValue({
			note: undefined
		})
		// showSuccess("Xóa tất cả chiết khấu trước đó thành công!");
	};

	useLayoutEffect(() => {
		dispatch(StoreGetListAction(setListStores));
	}, [dispatch]);

	const onInputSearchProductFocus = () => {
		setIsInputSearchProductFocus(true);
		autoCompleteRef.current?.focus();
	};

	const onInputSearchProductBlur = () => {
		setIsInputSearchProductFocus(false);
	};

	const handleSplitOrder = () => {
		if (!orderDetail || !userReducer.account) {
			return;
		}
		if (splitOrderNumber === undefined) {
			showError("Vui lòng điền số lượng tách đơn!");
			return;
		}
		if (items && splitOrderNumber > getTotalQuantity(items)) {
			showError("Số lượng tách đơn không được lớn hơn số lượng sản phẩm!");
			return;
		}
		if (splitOrderNumber < 2 || splitOrderNumber > 20) {
			showError("Số lượng tách đơn cần lớn hơn 1 và nhỏ hơn 20!");
			return;
		}

		const params: SplitOrderRequest = {
			order_code: orderDetail.code,
			quantity: splitOrderNumber,
			updated_by: userReducer.account.updated_by || "",
			updated_name: userReducer.account.updated_name || "",
		};
		dispatch(
			splitOrderAction(params, (response) => {
				if (response) {
					response.data.forEach((singleOrderId: number) => {
						const singleSplitLink = `${process.env.PUBLIC_URL}/orders/${singleOrderId}/update`;
						window.open(singleSplitLink, "_blank");
					});
					fetchData && fetchData();
				}
			})
		);
	};

	useEffect(() => {
		if (items && items.length > 0) {
			setIsShowProductSearch(true);
		}
	}, [items]);

	/**
	 * gọi lại api chiết khấu khi update cửa hàng, khách hàng, nguồn, số lượng item
	 */
	useEffect(() => {
		if (isShouldUpdateDiscountRef.current)
			if (
				isShouldUpdateDiscountRef.current &&
				isAutomaticDiscount &&
				items &&
				items?.length > 0
			) {
				handleApplyDiscount(items);
			} else isShouldUpdateDiscountRef.current = true;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loyaltyPoint, storeId, orderSourceId]);

	/**
	 * gọi lại api couponInputText khi thay đổi số lượng item
	 */
	useEffect(() => {
		if (
			!isAutomaticDiscount &&
			isShouldUpdateCouponRef.current &&
			couponInputText &&
			items &&
			items?.length > 0
		) {
			handleApplyCouponWhenInsertCoupon(couponInputText, items);
		}

		setTimeout(() => {
			isShouldUpdateCouponRef.current = true;
			isShouldUpdateDiscountRef.current = true;
		}, 1000);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loyaltyPoint, storeId, orderSourceId]);

	useEffect(() => {
		if (items && items.length === 0) {
			form.setFieldsValue({
				note: ""
			})
			setPromotion && setPromotion(null)
		}
	}, [form, items, setPromotion]);

	return (
		<StyledComponent>
			<Card
				title={returnOrderInformation ? "Thông tin sản phẩm đổi" : "Sản phẩm"}
				extra={
					<Space size={window.innerWidth > 1366 ? 20 : 10}>
						<Checkbox onChange={() => setSplitLine(!splitLine)} disabled = {isOrderFinishedOrCancel(orderDetail)}>Tách dòng</Checkbox>
						{/* <span>Chính sách giá:</span> */}
						<Form.Item name="price_type" hidden>
							<Select style={{ minWidth: 145, height: 38 }} placeholder="Chính sách giá">
								<Select.Option value="retail_price" color="#222222">
									Giá bán lẻ
								</Select.Option>
								<Select.Option value="whole_sale_price">Giá bán buôn</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item name="automatic_discount" valuePropName="checked">
							<Checkbox
								disabled={levelOrder > 3 || isCalculateDiscount || typeof(promotion?.discount_code) === "string"}
								value={isAutomaticDiscount}
								onChange={(e) => {
									if (e.target.checked) {
										setCoupon && setCoupon("");
										handleApplyDiscount(items, true);
										setIsAutomaticDiscount(true);
									} else {
										setIsDisableOrderDiscount(false);
										handleRemoveAllAutomaticDiscount();
										setIsAutomaticDiscount(false);
										if (items) {
											calculateChangeMoney(items, null)
										}
									}
								}}
							>
								Chiết khấu tự động
							</Checkbox>
						</Form.Item>
						{/* <Select
							style={{ minWidth: 145, height: 38 }}
							placeholder="Chương trình khuyến mại"
						>
							<Select.Option value="" color="#222222">
								(Tạm thời chưa có)
							</Select.Option>
						</Select> */}
						<Button
							disabled = {isOrderFinishedOrCancel(orderDetail)}
							onClick={() => {
								showInventoryModal();
							}}
						>
							Kiểm tra tồn
						</Button>
						{isSplitOrder && (
							<div className="splitOrder">
								<Checkbox onChange={(e) => setIsShowSplitOrder(e.target.checked)}>
									Tách đơn
								</Checkbox>
								{isShowSplitOrder && (
									<React.Fragment>
										<NumberInput
											style={{ width: 50 }}
											value={splitOrderNumber}
											onChange={(value) => {
												if (value) {
													setSplitOrderNumber(value);
												} else {
													setSplitOrderNumber(0);
												}
											}}
										/>
										<Button
											type="primary"
											onClick={handleSplitOrder}
											style={{ padding: "0 10px" }}
										>
											Thực hiện
										</Button>
									</React.Fragment>
								)}
							</div>
						)}
					</Space>
				}
			>
				<Row gutter={15} className="rowSelectStoreAndProducts">
					<Col md={8}>
						<Form.Item
							name="store_id"
							rules={[
								{
									required: true,
									message: "Vui lòng chọn cửa hàng!",
								},
							]}
						>
							<Select
								className="select-with-search"
								showSearch
								allowClear
								style={{ width: "100%" }}
								placeholder="Chọn cửa hàng"
								notFoundContent="Không tìm thấy kết quả"
								onChange={(value?: number) => {
									if (value) {
										setStoreId(value);
										setIsShowProductSearch(true);
										setKeySearchVariant("");
										setResultSearchVariant({
											metadata: {
												limit: 0,
												page: 1,
												total: 0,
											},
											items: [],
										});
									} else {
										setIsShowProductSearch(false);
									}
									dispatch(setIsShouldSetDefaultStoreBankAccountAction(true))
								}}
								filterOption={(input, option) => {
									if (option) {
										return (
											option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
										);
									}
									return false;
								}}
								disabled={levelOrder > 3}
							>
								{dataCanAccess.map((item, index) => (
									<Select.Option key={index} value={item.id}>
										{item.name}
									</Select.Option>
								))}
							</Select>
						</Form.Item>
					</Col>
					<Col md={16}>
						<Form.Item>
							<AutoComplete
								notFoundContent={
									keySearchVariant.length >= 3 ? "Không tìm thấy sản phẩm" : undefined
								}
								id="search_product"
								value={keySearchVariant}
								ref={autoCompleteRef}
								onSelect={onSearchVariantSelect}
								dropdownClassName="search-layout dropdown-search-header"
								dropdownMatchSelectWidth={456}
								className="w-100"
								onSearch={onChangeProductSearch}
								options={convertResultSearchVariant}
								maxLength={255}
								// open={isShowProductSearch && isInputSearchProductFocus}
								onFocus={onInputSearchProductFocus}
								onBlur={onInputSearchProductBlur}
								disabled={levelOrder > 3 || loadingAutomaticDiscount}
								defaultActiveFirstOption
								dropdownRender={(menu) => (
									<div>
										{/* <div
                      className="row-search w-100"
                      style={{
                        minHeight: "42px",
                        lineHeight: "50px",
                        cursor: "pointer",
                      }}
                    >
                      <div className="rs-left w-100">
                        <div style={{ float: "left", marginLeft: "20px" }}>
                          <img src={addIcon} alt="" />
                        </div>
                        <div className="rs-info w-100">
                          <span
                            className="text"
                            style={{ marginLeft: "23px", lineHeight: "18px" }}
                          >
                            Thêm mới sản phẩm
                          </span>
                        </div>
                      </div>
                    </div>
                    <Divider style={{ margin: "4px 0" }} /> */}
										{menu}
									</div>
								)}
							>
								<Input
									size="middle"
									className="yody-search"
									placeholder="Tìm sản phẩm mã 7... (F3)"
									prefix={
										searchProducts ? (
											<LoadingOutlined style={{ color: "#2a2a86" }} />
										) : (
											<SearchOutlined style={{ color: "#ABB4BD" }} />
										)
									}
									disabled={levelOrder > 3}
								/>
							</AutoComplete>
						</Form.Item>
					</Col>
				</Row>
				<AddGiftModal
					items={itemGifts}
					onUpdateData={onUpdateData}
					onCancel={onCancleConfirm}
					onOk={onOkConfirm}
					visible={isVisibleGift}
					storeId={storeId}
				/>
				<Table
					locale={{
						emptyText: (
							<div className="sale_order_empty_product">
								<img src={emptyProduct} alt="empty product"></img>
								<p>Đơn hàng của bạn chưa có sản phẩm nào!</p>
								<Button
									type="text"
									className="font-weight-500"
									style={{
										background: "rgba(42,42,134,0.05)",
									}}
									onClick={() => {
										autoCompleteRef.current?.focus();
									}}
									disabled={levelOrder > 3}
								>
									Thêm sản phẩm ngay (F3)
								</Button>
							</div>
						),
					}}
					rowKey={(record, index) => record.id + (index || 0)}
					columns={columns}
					dataSource={items}
					className="sale-product-box-table2 w-100"
					tableLayout="fixed"
					pagination={false}
					// scroll={{ y: 300 }}
					sticky
					footer={() =>
						items && items.length > 0 ? (
							<div className="row-footer-custom">
								<div
									className="yody-foot-total-text"
									style={{
										width: "32%",
										float: "left",
										fontWeight: 700,
									}}
								>
									TỔNG
								</div>

								<div
									style={{
										width: "27.5%",
										float: "left",
										textAlign: "right",
									}}
								>
									{formatCurrency(getTotalAmount(items))}
								</div>

								<div
									style={{
										width: "14.5%",
										float: "left",
										textAlign: "right",
									}}
								>
									{formatCurrency(getTotalDiscount(items))}
								</div>

								<div
									style={{
										width: "13.5%",
										float: "left",
										textAlign: "right",
										color: "#000000",
										fontWeight: 700,
									}}
								>
									{formatCurrency(getTotalAmountAfterDiscount(items))}
								</div>
							</div>
						) : (
							<div />
						)
					}
				/>

				{/* nếu có sản phẩm trong đơn hàng mới hiển thị thông tin ở dưới  */}
				{items && items.length > 0 && (
					<CardProductBottom
						amount={orderAmount}
						totalAmountOrder={totalAmountOrder}
						calculateChangeMoney={calculateChangeMoney}
						changeMoney={changeMoney}
						setCoupon={setCoupon}
						promotion={promotion}
						setPromotion={setPromotion}
						showDiscountModal={() => setVisiblePickDiscount(true)}
						showCouponModal={() => setIsVisiblePickCoupon(true)}
						orderAmount={orderAmount}
						items={items}
						shippingFeeInformedToCustomer={shippingFeeInformedToCustomer}
						returnOrderInformation={returnOrderInformation}
						totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
						isDisableOrderDiscount={isDisableOrderDiscount}
						isCouponValid={isCouponValid}
						couponInputText={couponInputText}
						setCouponInputText={setCouponInputText}
						handleRemoveAllDiscount={handleRemoveAllDiscount}
					/>
				)}
				{setPromotion && (
					<React.Fragment>
						<PickDiscountModal
							amount={orderAmount}
							type={discountType}
							value={discountValue}
							rate={discountRate}
							// coupon={coupon}
							onCancelDiscountModal={() => setVisiblePickDiscount(false)}
							onOkDiscountModal={onOkDiscountConfirm}
							visible={isVisiblePickDiscount}
						/>
						<PickCouponModal
							couponInputText={couponInputText}
							onCancelCouponModal={() => {
								setIsVisiblePickCoupon(false);
							}}
							onOkCouponModal={onOkCouponConfirm}
							visible={isVisiblePickCoupon}
						/>
					</React.Fragment>
				)}
				<InventoryModal
					isModalVisible={isInventoryModalVisible}
					setInventoryModalVisible={setInventoryModalVisible}
					storeId={storeId}
					setStoreId={setStoreId}
					columnsItem={items}
					inventoryArray={inventoryResponse}
					storeArrayResponse={storeArrayResponse}
					handleCancel={handleInventoryCancel}
				// setStoreForm={setStoreForm}
				/>
			</Card>
		</StyledComponent>
	);
}

export default OrderCreateProduct;
