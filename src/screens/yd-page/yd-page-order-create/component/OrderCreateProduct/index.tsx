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
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import giftIcon from "assets/icon/gift.svg";
import imgDefault from "assets/icon/img-default.svg";
import arrowDownIcon from "assets/img/drow-down.svg";
import BaseResponse from "base/base.response";
import NumberInput from "component/custom/number-input.custom";
import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import { StoreSearchListAction } from "domain/actions/core/store.action";
import {
  SearchBarCode,
  searchVariantsOrderRequestAction,
} from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { InventoryResponse } from "model/inventory";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import {
  OrderDiscountRequest,
  OrderItemDiscountRequest,
  OrderLineItemRequest,
} from "model/request/order.request";
import { DiscountRequestModel } from "model/request/promotion.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { OrderResponse } from "model/response/order/order.response";
import {
  AppliedDiscountResponseModel,
  ApplyCouponResponseModel,
  CustomApplyDiscount,
  SuggestDiscountResponseModel,
} from "model/response/order/promotion.response";
import {
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
} from "model/response/settings/order-settings.response";
import React, {
  createRef,
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import PickCouponModal from "screens/order-online/modal/pick-coupon.modal";
import AddGiftModal from "screens/yd-page/yd-page-order-create/modal/add-gift.modal";
import InventoryModal from "screens/yd-page/yd-page-order-create/modal/inventory.modal";
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
  handleCalculateShippingFeeApplyOrderSetting,
  handleDelayActionWhenInsertTextInSearchInput,
  handleFetchApiError,
  haveAccess,
  isFetchApiSuccessful,
  isOrderFinishedOrCancel,
  replaceFormatString,
} from "utils/AppUtils";
import {
  ACCOUNT_ROLE_ID,
  ADMIN_ORDER,
  DISCOUNT_TYPE,
  PRODUCT_TYPE,
  ShipmentMethodOption,
  STORE_TYPE,
} from "utils/Constants";
import { DISCOUNT_VALUE_TYPE } from "utils/Order.constants";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import CardProductBottom from "./CardProductBottom";
import { StyledComponent, StyledRenderSearchVariant } from "./styles";
import "./ordercreateproduct.scss";
import {
  changeIsLoadingDiscountAction,
  changeOrderLineItemsAction,
  setIsShouldSetDefaultStoreBankAccountAction,
} from "domain/actions/order/order.action";
import _ from "lodash";
import { RootReducerType } from "../../../../../model/reducers/RootReducerType";
import useGetStoreIdFromLocalStorage from "../../../../../hook/useGetStoreIdFromLocalStorage";
import { CompareObject } from "utils/CompareObject";
import { DiscountValueType } from "model/promotion/price-rules.model";
import discountCouponSuccess from "assets/icon/discount-coupon-success.svg";
import {
  getLineItemCalculationMoney,
  lineItemsConvertInSearchPromotion,
  removeDiscountLineItem,
} from "utils/OrderUtils";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import DiscountItemSearch from "../DiscountItemSearch";
import DiscountOrderModalSearch from "../DiscountOrderModalSearch";
import { SourceResponse } from "model/response/order/source.response";

type PropType = {
  storeId: number | null;
  items: Array<OrderLineItemRequest>;
  shippingFeeInformedToCustomer: number | null;
  form: FormInstance<any>;
  totalAmountCustomerNeedToPay: number;
  orderConfig: OrderConfigResponseModel | null | undefined;
  inventoryResponse: Array<InventoryResponse> | null;
  levelOrder?: number;
  coupon?: string;
  promotion: OrderDiscountRequest | null;
  orderSource?: SourceResponse | null;
  isPageOrderUpdate?: boolean;
  orderAmount: number;
  totalAmountOrder: number;
  updateOrder?: boolean;
  isSplitOrder?: boolean;
  isCreateReturn?: boolean;
  orderDetail?: OrderResponse | null;
  customer?: CustomerResponse | null;
  loyaltyPoint: LoyaltyPoint | null;
  setStoreId: (item: number) => void;
  setCoupon?: (item: string) => void;
  setPromotion?: (item: OrderDiscountRequest | null) => void;
  setItemGift: (item: OrderLineItemRequest[]) => void;
  changeInfo: (items: Array<OrderLineItemRequest>, promotion: OrderDiscountRequest | null) => void;
  setItems: (items: Array<OrderLineItemRequest>) => void;
  setInventoryResponse: (item: Array<InventoryResponse> | null) => void;
  fetchData?: () => void;
  returnOrderInformation?: {
    totalAmountReturn: number;
    totalAmountExchangePlusShippingFee: number;
  };
  setShippingFeeInformedToCustomer?: (value: number | null) => void;
  shippingServiceConfig: ShippingServiceConfigDetailResponseModel[];
  countFinishingUpdateCustomer: number; // load xong api chi tiết KH và hạng KH
  shipmentMethod: number;
  // isExchange?: boolean;
  listStores: StoreResponse[];

  defaultStoreId: number | null; // YDpage only
  isCheckSplitLine: boolean;
  setCheckSplitLine: (item: any) => void;
};

let barcode = "";
let isBarcode = false;

const initQueryVariant: VariantSearchQuery = {
  limit: 50,
  page: 1,
  saleable: true,
  active: true,
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
  // let isQuantityIsSame = false;
  /**
   * thời gian delay khi thay đổi số lượng sản phẩm để apply chiết khấu
   */
  const QUANTITY_DELAY_TIME_PROMOTION = 600;
  const QUANTITY_DELAY_TIME = 500;
  const {
    form,
    items,
    storeId,
    inventoryResponse,
    levelOrder = 0,
    coupon = "",
    // isSplitOrder,
    orderDetail,
    orderConfig,
    shippingFeeInformedToCustomer,
    returnOrderInformation,
    totalAmountCustomerNeedToPay,
    orderSource,
    customer,
    loyaltyPoint,
    promotion,
    orderAmount,
    totalAmountOrder,
    setStoreId,
    setItems,
    // fetchData,
    setCoupon,
    setPromotion,
    setShippingFeeInformedToCustomer,
    shippingServiceConfig,
    countFinishingUpdateCustomer,
    isCreateReturn,
    shipmentMethod,
    listStores,
    // isExchange,
    defaultStoreId, // YDpage only
    isCheckSplitLine,
    setCheckSplitLine,
  } = props;

  const discountRequestModel: DiscountRequestModel = {
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
    line_items: [],
    applied_discount: null,
    taxes_included: true,
    tax_exempt: false,
  };

  const transportService = useSelector(
    (state: RootReducerType) => state.orderReducer.orderDetail.thirdPL?.service,
  );
  const dispatch = useDispatch();
  const [loadingAutomaticDiscount] = useState(false);
  const [splitLine, setSplitLine] = useState<boolean>(false);
  const [isDisableOrderDiscount, setIsDisableOrderDiscount] = useState<boolean>(false);
  const [itemGifts, setItemGift] = useState<Array<OrderLineItemRequest>>([]);

  const [keySearchVariant, setKeySearchVariant] = useState("");
  const initResultSearchVariant = {
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  };
  const [resultSearchVariant, setResultSearchVariant] =
    useState<PageResponse<VariantResponse>>(initResultSearchVariant);
  const [isVisibleGift, setVisibleGift] = useState(false);
  const [searchProducts, setSearchProducts] = useState(false);
  const [indexItem, setIndexItem] = useState<number>(-1);
  const [isVisiblePickDiscount, setVisiblePickDiscount] = useState(false);
  const [isVisiblePickCoupon, setIsVisiblePickCoupon] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [discountType, setDiscountType] = useState<string>(DISCOUNT_TYPE.MONEY);
  const [changeMoney, setChangeMoney] = useState<number>(0);
  const [isShowProductSearch, setIsShowProductSearch] = useState(true);
  const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(true);
  const [isAutomaticDiscount, setIsAutomaticDiscount] = useState(false);
  const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);
  const [isInventoryModalVisible, setInventoryModalVisible] = useState(false);

  //tách đơn
  // const [splitOrderNumber, setSplitOrderNumber] = useState(0);
  // const [isShowSplitOrder, setIsShowSplitOrder] = useState(false);
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [couponInputText, setCouponInputText] = useState(coupon);

  const lineItemQuantityInputTimeoutRef: MutableRefObject<any> = useRef();
  const lineItemPriceInputTimeoutRef: MutableRefObject<any> = useRef();
  // const lineItemDiscountInputTimeoutRef: MutableRefObject<any> = useRef();

  const [isLineItemChanging, setIsLineItemChanging] = useState(false);
  const [isFinishedCalculateItem, setIsFinishedCalculateItem] = useState(true);

  const [storeArrayResponse, setStoreArrayResponse] = useState<Array<StoreResponse> | null>([]);

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const isShouldUpdateCouponRef = useRef(!(orderDetail || props.updateOrder));
  const isShouldUpdateDiscountRef = useRef(!(orderDetail || props.updateOrder));

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
        findProductInput?.focus();
        break;
      case "F12":
        if (levelOrder <= 3) {
          form.setFieldsValue({
            automatic_discount: !isAutomaticDiscount,
          });
          if (isAutomaticDiscount) {
            showSuccess("Tắt chiết khấu tự động thành công!");
            handleRemoveAllAutomaticDiscount();
          } else {
            handleApplyDiscount(items);
            showSuccess("Bật chiết khấu tự động thành công!");
          }
        }

        break;
      default:
        break;
    }
    return;
  };

  const handleSearchBarcode = useCallback(
    (barCode, items) => {
      dispatch(
        SearchBarCode(barcode, (data: VariantResponse) => {
          if (data) {
            let _items = [...items];
            let index = _items.findIndex((i) => i.variant_id === data.id);
            const item: OrderLineItemRequest = createItem(data);
            item.position = items.length + 1;
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

            if (isAutomaticDiscount && _items.length > 0) {
              handleApplyDiscount(_items);
            } else if (couponInputText && _items.length > 0) {
              handleApplyCouponWhenInsertCoupon(couponInputText, _items);
            }
            autoCompleteRef.current?.blur();
            setIsInputSearchProductFocus(false);
            setKeySearchVariant("");
          }
        }),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [couponInputText, dispatch, isAutomaticDiscount, splitLine],
  );

  const eventKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLBodyElement) {
        if (event.key !== "Enter") {
          barcode = barcode + event.key;
        } else if (event.key === "Enter") {
          if (barcode !== "" && event && items) {
            handleSearchBarcode(barcode, items);
            barcode = "";
          }
        }
        return;
      }
    },

    [items, handleSearchBarcode],
  );

  // const eventKeydown = useCallback((event: any) => {
  //
  // 	if (event.target instanceof HTMLInputElement) {
  // 		if (event.target.id === "search_product") {
  // 			if (event.key !== "Enter") barcode = barcode + event.key;
  //
  // 			if (event.key === "Enter") {
  // 				onClearVariantSearch();
  // 				isBarcode = true;
  // 				if (barcode !== "" && event && items) {
  // 					handleSearchBarcode(barcode, items);
  // 					barcode = "";
  // 				}
  // 			} else {
  // 				isBarcode = false;
  // 				handleDelayActionWhenInsertTextInSearchInput(
  // 					autoCompleteRef,
  // 					() => {
  // 						barcode = "";
  // 					},
  // 					500
  // 				);
  // 			}
  // 		}
  // 	}
  // 	// eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [handleSearchBarcode, items]);

  const isShouldUpdatePrivateNote = useMemo(() => {
    if (props.updateOrder && form.getFieldValue("note")) {
      return false;
    }
    return true;
  }, [form, props.updateOrder]);

  useEffect(() => {
    window.addEventListener("keypress", eventKeyPress);
    // window.addEventListener("keydown", eventKeydown);
    window.addEventListener("keydown", handlePressKeyBoards);
    return () => {
      window.removeEventListener("keypress", eventKeyPress);
      // window.removeEventListener("keydown", eventKeydown);
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
    if (orderDetail && orderDetail?.discounts && orderDetail?.discounts[0]?.discount_code) {
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
          i.discount_value = discountValue;

          let discountRate = 0;
          i.discount_items.forEach((a) => {
            discountRate = discountRate + a.rate;
          });
          i.discount_rate = discountRate;
        }
      });
      return _amount;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  );

  useEffect(() => {
    if (items) {
      let amount = totalAmount(items);
      setChangeMoney(amount);
      let _itemGifts: OrderLineItemRequest[] = [];
      for (let i = 0; i < items.length; i++) {
        if (!items[i].gifts) {
          return;
        }
        _itemGifts = [..._itemGifts, ...items[i].gifts];
      }
      _itemGifts.forEach((item) => {
        item.discount_items = item.discount_items.filter(
          (single) => (single.amount && single.value) || single.promotion_id,
        );
      });

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
    [items],
  );

  const onChangeNote = (e: any, index: number) => {
    let value = e.target.value;
    if (items) {
      let _items = [...items];
      _items[index].note = value;
      setItems(_items);
    }
  };

  // const handleDelayCalculateWhenChangeOrderInput = (
  //   inputRef: React.MutableRefObject<any>,
  //   _items: OrderLineItemRequest[],
  //   isShouldAutomaticDiscount = true,
  // ) => {
  //   setIsFinishedCalculateItem(false);
  //   // delay khi thay đổi số lượng
  //   //nếu có chiết khấu tự động
  //   if (isAutomaticDiscount) {
  //     handleDelayActionWhenInsertTextInSearchInput(
  //       inputRef,
  //       () => {
  //         if (isShouldAutomaticDiscount) {
  //           handleApplyDiscount(_items);
  //         } else {
  //           calculateChangeMoney(_items);
  //         }
  //       },
  //       QUANTITY_DELAY_TIME_PROMOTION,
  //     );
  //     //nếu có coupon
  //   } else if (couponInputText) {
  //     handleDelayActionWhenInsertTextInSearchInput(
  //       inputRef,
  //       () => handleApplyCouponWhenInsertCoupon(couponInputText, _items),
  //       QUANTITY_DELAY_TIME_PROMOTION,
  //     );
  //   } else {
  //     handleDelayActionWhenInsertTextInSearchInput(
  //       inputRef,
  //       () => calculateChangeMoney(_items),
  //       QUANTITY_DELAY_TIME,
  //     );
  //   }
  // };

  /**
   * Cập nhật chiết khấu khi thay đổi thông tin đơn hàng
   * @param _items
   * @param index
   */
  const handUpdateDiscountWhenChangingOrderInformation = (
    _items: OrderLineItemRequest[],
    index?: number,
  ) => {
    const isLineItemSemiAutomatic = _items.some((p) => p.isLineItemSemiAutomatic); // xác định là ck line item thủ công
    const isOrderSemiAutomatic = promotion?.isOrderSemiAutomatic; //xác định là ck đơn hàng thủ công
    const isNotAutomaticIsLineItemSemiAutomatic =
      !isAutomaticDiscount && _items.some((p) => p.discount_items[0]?.promotion_id); // xác định là không có ck tự động, nhưng có ck line item
    const isNotAutomaticIsOrderSemiAutomatic = !isAutomaticDiscount && promotion?.promotion_id; // xác định là không có ck tự động, nhưng có ck đơn hàng

    console.log("handleChangeInputLineItem", isLineItemSemiAutomatic, isOrderSemiAutomatic);
    if (isLineItemSemiAutomatic || isNotAutomaticIsLineItemSemiAutomatic) {
      console.log("là chiết khấu line item", index);
      handleDelayActionWhenInsertTextInSearchInput(
        lineItemQuantityInputTimeoutRef,
        async () => {
          setIsLineItemChanging(true);
          if (index && index === -1) {
            calculateChangeMoney(_items);
          } else {
            checkValidLineItemSuitableDiscount(_items, index);
          }
        },
        QUANTITY_DELAY_TIME,
      );
    } else if (isOrderSemiAutomatic || isNotAutomaticIsOrderSemiAutomatic) {
      handleDelayActionWhenInsertTextInSearchInput(
        lineItemQuantityInputTimeoutRef,
        () => {
          setIsLineItemChanging(true);
          checkValidOrderSuitableDiscount(_items);
          console.log("là chiết khấu đơn hàng");
        },
        QUANTITY_DELAY_TIME,
      );
    } else {
      console.log("là chiết khấu tự động");
      handleDelayActionWhenInsertTextInSearchInput(
        lineItemQuantityInputTimeoutRef,
        () => {
          if (isAutomaticDiscount) {
            handleApplyDiscount(_items);
          } else {
            console.log("calculatesChangeMoney 6");
            calculateChangeMoney(_items);
          }
        },
        QUANTITY_DELAY_TIME_PROMOTION,
      );
    }
  };

  const onChangeQuantity = (value: number | null, index: number) => {
    if (items) {
      let _items = _.cloneDeep(items);
      if (value === _items[index].quantity) {
        setIsLineItemChanging(false);
        return;
      }
      if (value === 0 || !value) {
        value = 1;
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
      handUpdateDiscountWhenChangingOrderInformation(_items, index);
    }
  };

  const onChangePrice = (value: number | null, index: number) => {
    if (items) {
      let _items = _.cloneDeep(items);
      if (value === _items[index].price) {
        setIsLineItemChanging(false);
        return;
      }
      if (value) {
        if (value !== _items[index].price) {
          _items[index].price = value;
          handUpdateDiscountWhenChangingOrderInformation(_items, index);
        }
      } else {
        _items[index].price = 0;
        _items[index].discount_items = [];
        _items[index].discount_amount = 0;
        _items[index].discount_value = 0;
        _items[index].discount_rate = 0;
        handUpdateDiscountWhenChangingOrderInformation(_items, index);
      }
    }
  };

  // const onDiscountItem = (_items: Array<OrderLineItemRequest>, index: number) => {
  //   // nhập chiết khấu tay thì clear chương trình chiết khấu
  //   if (_items[index].discount_items && _items[index].discount_items[0]) {
  //     _items[index].discount_items[0].promotion_id = undefined;
  //     _items[index].discount_items[0].reason = "";
  //   }
  //   handleDelayCalculateWhenChangeOrderInput(lineItemDiscountInputTimeoutRef, _items, false);
  // };

  const renderSearchVariant = (item: VariantResponse) => {
    let avatar = findAvatar(item.variant_images);
    return (
      <StyledRenderSearchVariant>
        <div className="variant-container">
          <div className="variant-img">
            <img
              src={avatar === "" ? imgDefault : avatar}
              alt="anh"
              placeholder={imgDefault}
              style={{ width: "100%" }}
            />
          </div>

          <div className="variant-name">
            <Tooltip title={item.name}>
              <span className="name" style={{ color: "#37394D" }} title={item.name}>
                {item.name}
              </span>
            </Tooltip>

            <div style={{ color: "#95A1AC" }}>{item.sku}</div>
          </div>

          <div className="variant-price">
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
        </div>
      </StyledRenderSearchVariant>
    );
  };

  const convertResultSearchVariant = useMemo(() => {
    let options: any[] = [];
    resultSearchVariant.items.forEach((item: VariantResponse) => {
      options.push({
        label: renderSearchVariant(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [resultSearchVariant]);

  const checkIfLineItemHasAutomaticDiscount = (lineItem: OrderLineItemRequest) => {
    return lineItem.discount_items.some(
      (discount) => discount.promotion_id && discount?.amount > 0,
    );
  };

  // const checkIfOrderHasAutomaticDiscount = () => {
  // 	if (promotion && promotion.promotion_id && promotion?.amount && promotion?.amount > 0) {
  // 		return true;
  // 	}
  // 	return false;
  // };

  const ProductColumn = {
    title: () => (
      <div className="text-center">
        <div style={{ textAlign: "left", marginLeft: 12 }}>SẢN PHẨM</div>
      </div>
    ),
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div
          className="yody-pos-name"
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="d-flex align-items-center">
            <div
              style={{
                width: "100%",
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
                {/*<Tooltip title={l.variant} className="yody-pos-varian-name">*/}
                <span>{l.variant}</span>
                {/*</Tooltip>*/}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 5 }}>
            {l?.gifts.length > 0 &&
              l?.gifts[0].discount_items.length > 0 &&
              l?.gifts[0].discount_items[0]?.promotion_title && (
                <div className="yody-pos-addition yody-pos-gift 3">
                  <div>
                    <Tag color="green">{l?.gifts[0].discount_items[0]?.promotion_title}</Tag>
                  </div>
                </div>
              )}

            {l.gifts &&
              l.gifts.map((a, index1) => (
                <div key={index1} className="yody-pos-addition yody-pos-gift">
                  <div>
                    <img src={giftIcon} alt="" />
                    <i style={{ marginLeft: 7 }}>
                      {a.variant} ({a.quantity})
                    </i>
                  </div>
                </div>
              ))}
          </div>
          <div className="yody-pos-note yd-product-note" hidden={!l.show_note && l.note === ""}>
            <Tooltip title={l.note}>
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
            </Tooltip>
          </div>

          {l.discount_items[0] && l.discount_items[0].promotion_id && (
            <div className="discount-item">
              <img src={discountCouponSuccess} alt="" width={12} />{" "}
              {l.discount_items[0]?.promotion_title || l.discount_items[0]?.reason}
            </div>
          )}
        </div>
      );
    },
  };

  const isOtherLineItemIsChanged = () => {
    if (isLineItemChanging) {
      return true;
    }
    return false;
  };

  const AmountColumn = {
    title: () => (
      <div className="text-center">
        <div style={{ textAlign: "center" }}>SL</div>
      </div>
    ),
    // className: "yody-pos-quantity text-center",
    width: "30px",
    align: "right",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div className="yody-pos-qtt">
          <NumberInput
            format={(a: string) => formatCurrency(a)}
            replace={(a: string) => replaceFormatString(a)}
            style={{ textAlign: "right", fontWeight: 500, color: "#222222" }}
            value={l.quantity}
            // onBlur={() => {
            // 	if(isQuantityIsSame) {
            // 		setIsLineItemChanging(true);
            // 	} else {
            // 		setIsLineItemChanging(false);
            // 	}
            // }}
            onChange={(value) => {
              // if(!items) {
              // 	return;
              // }
              // if(isQuantityIsSame && value === l.quantity) {
              // 	isQuantityIsSame = false
              // } else {
              // 	isQuantityIsSame = true
              // }
              onChangeQuantity(value, index);
            }}
            min={1}
            maxLength={4}
            minLength={0}
            disabled={levelOrder > 3 || isLoadingDiscount || isOtherLineItemIsChanged()}
            isChangeAfterBlur={false}
          />
        </div>
      );
    },
  };

  const PriceColumn = {
    title: () => (
      <div>
        <span style={{ color: "#222222", textAlign: "right" }}>Đơn giá</span>
        <span style={{ color: "#808080", marginLeft: "5px", fontWeight: 400 }}>₫</span>
      </div>
    ),
    width: "75px",
    align: "center",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        // <div>
        // 	{formatCurrency(l.price) + "đ"}
        // </div>
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
              paddingRight: 5,
              paddingLeft: 0,
            }}
            maxLength={14}
            minLength={0}
            value={l.price}
            // onBlur={() => {
            // 	setIsLineItemChanging(false);
            // }}
            onChange={(value) => {
              onChangePrice(value, index);
            }}
            // disabled={levelOrder > 3 || isAutomaticDiscount}
            disabled={
              levelOrder > 3 ||
              checkIfLineItemHasAutomaticDiscount(l) ||
              couponInputText !== "" ||
              promotion !== null ||
              userReducer?.account?.role_id !== ACCOUNT_ROLE_ID.admin ||
              isLoadingDiscount ||
              isOtherLineItemIsChanged()
            }
          />
        </div>
      );
    },
  };

  const DiscountColumn = {
    title: () => (
      <div className="text-center">
        <div>Khuyến mại</div>
      </div>
    ),
    align: "center",
    width: "100px",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      const isDiscountOrder = promotion && promotion?.promotion_id ? true : false;

      const menu = (
        <Menu>
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

          <Menu.Item key="3">
            <Button
              type="text"
              onClick={() => onDeleteItem(index)}
              disabled={levelOrder > 3 || !isFinishedCalculateItem}
              className=""
              style={{
                paddingLeft: 24,
                background: "transparent",
                border: "none",
              }}
            >
              Xóa sản phẩm
            </Button>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className="discount-table-cell">
          <Dropdown
            overlay={menu}
            trigger={["click"]}
            placement="bottomRight"
            disabled={levelOrder > 3}
          >
            <Tooltip title="Thao tác" placement="topRight">
              <Button className="action-button" icon={<img src={arrowDownIcon} alt="" />} />
            </Tooltip>
          </Dropdown>

          <DiscountItemSearch
            index={index}
            discountRate={l.discount_items[0]?.rate ? l.discount_items[0]?.rate : 0}
            discountAmount={l.discount_items[0]?.amount ? l.discount_items[0]?.amount : 0}
            discountType={l.discount_items[0]?.type}
            item={l}
            disabled={levelOrder > 3 || isLoadingDiscount || isLineItemChanging || isDiscountOrder}
            param={{
              order_id: orderDetail?.id,
              customer_id: customer?.id,
              order_source_id: form.getFieldValue("source_id"),
              store_id: form.getFieldValue("store_id"),
              sales_channel_name: ADMIN_ORDER.channel_name,
              assignee_code: customer?.responsible_staff_code || undefined,
            }}
            handleApplyDiscountItem={(_item) => {
              if (!items) return;
              let _items = [...items];
              _items[index] = _item;
              console.log("discount search item ", _item);
              console.log("discount search item ", _items);
              calculateChangeMoney(_items);
            }}
          />
        </div>
      );
    },
  };

  const columns = [ProductColumn, AmountColumn, PriceColumn, DiscountColumn];

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
      taxable: variant.taxable,
    };
    return orderLine;
  };

  // const removeDiscountItem = (item: OrderLineItemRequest) => {
  // 	item.discount_amount = 0;
  // 	item.discount_rate = 0;
  // 	item.discount_value = 0;
  // 	item.discount_items = [];
  // 	item.line_amount_after_line_discount = item.quantity * item.price;
  // };

  const removeAutomaticDiscountItem = (item: OrderLineItemRequest) => {
    if (item.discount_items) {
      for (let i = 0; i < item.discount_items.length; i++) {
        if (item.discount_items[i].promotion_id && !item.isLineItemSemiAutomatic) {
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
    let itemLength = _items.length;
    for (let i = 0; i < itemLength; i++) {
      const item = _items[i];
      const position = i + 1;
      if (item.position !== position) {
        item.position = position;
      }
      item.gifts.forEach((gift) => {
        if (gift.position !== position) {
          gift.position = position;
        }
      });
    }
    _items.splice(index, 1);
    console.log("onDeleteItem", _items);
    if (_items.length === 0) {
      calculateChangeMoney(_items, null);
    } else {
      handUpdateDiscountWhenChangingOrderInformation(_items, -1);
    }
  };

  // const handleSplitLineItem = (items: OrderLineItemRequest[], lineItem: OrderLineItemRequest, quantity: 1, position:number) => {
  //   items.splice(position, 0, lineItem);
  // };

  /**
   * nếu có chiết khấu tay thì ko apply chiết khấu tự động ở line item nữa
   */
  const checkIfReplaceDiscountLineItem = (item: OrderLineItemRequest, newDiscountValue: number) => {
    if (
      (item.discount_items[0] && !item.discount_items[0].promotion_id) ||
      item.isLineItemSemiAutomatic
    ) {
      return false;
    }
    if (newDiscountValue >= 0) {
      return true;
    }
    return false;
  };
  const calculateDiscount = (_item: OrderLineItemRequest, _highestValueSuggestDiscount: any) => {
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

    value = Math.min(value, item.price);
    value = Math.round(value);
    let rate = Math.round((value / item.price) * 100 * 100) / 100;
    rate = Math.min(rate, 100);

    const discountType =
      highestValueSuggestDiscount.value_type === DiscountValueType.PERCENTAGE
        ? DISCOUNT_TYPE.PERCENT
        : highestValueSuggestDiscount.value_type === DiscountValueType.FIXED_AMOUNT ||
          highestValueSuggestDiscount.value_type === DiscountValueType.FIXED_PRICE
        ? DISCOUNT_TYPE.MONEY
        : DISCOUNT_TYPE.MONEY;

    const discountItem: OrderItemDiscountRequest = {
      ..._item.discount_items[0],
      rate,
      value,
      amount: value * item.quantity,
      reason: value > 0 ? highestValueSuggestDiscount.title : null,
      promotion_id: value > 0 ? highestValueSuggestDiscount.price_rule_id || undefined : undefined,
      taxable: highestValueSuggestDiscount.is_registered,
      promotion_title: highestValueSuggestDiscount.title,
      type: discountType,
      sub_type: highestValueSuggestDiscount.value_type,
    };
    let itemResult = {
      ..._item,
      discount_items: [discountItem],
    };
    itemResult.isLineItemSemiAutomatic = false;
    itemResult.discount_value = getLineItemDiscountValue(itemResult);
    itemResult.discount_rate = getLineItemDiscountRate(itemResult);
    itemResult.discount_amount = getLineItemDiscountAmount(itemResult);
    itemResult.line_amount_after_line_discount = getLineAmountAfterLineDiscount(itemResult);
    result.push(itemResult);
    return result;
  };

  const getDiscountMulti = (
    suggested_discounts: SuggestDiscountResponseModel[],
    item: OrderLineItemRequest,
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
    items: OrderLineItemRequest[],
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
    _items: OrderLineItemRequest[] | undefined,
  ) => {
    if (!_items) {
      return promotion;
    }
    if (
      checkingDiscountResponse.data.suggested_discounts === null ||
      checkingDiscountResponse.data.suggested_discounts.length === 0
    ) {
      return promotion;
    }
    let discountOrder = checkingDiscountResponse.data.suggested_discounts[0];

    if (discountOrder) {
      if (!discountOrder?.value) {
        return promotion;
      }
      let totalLineAmountAfterDiscount = getTotalAmountAfterDiscount(_items);
      let discountAmount = getTotalDiscountOrder(checkingDiscountResponse.data, _items);
      if (discountAmount > 0) {
        if (discountAmount > totalLineAmountAfterDiscount) {
          discountAmount = totalLineAmountAfterDiscount;
        }
        let discountRate = (discountAmount / totalLineAmountAfterDiscount) * 100;
        if (discountOrder.price_rule_id) {
          return {
            promotion_id: discountOrder.price_rule_id,
            promotion_title: discountOrder.title,
            reason: discountOrder.title,
            value: discountAmount,
            amount: discountAmount,
            rate: discountRate,
            taxable: discountOrder.is_registered || false,
            sub_type: discountOrder.value_type,
          };
        }
      } else {
        return promotion;
      }
    }
    return promotion;
  };

  const isOrderHasDiscountLineItems = (responseData: ApplyCouponResponseModel) => {
    let result = false;
    if (
      responseData.line_items.some((lineItem) => {
        return lineItem.suggested_discounts.length > 0;
      })
    ) {
      result = true;
    }
    return result;
  };

  const isOrderHasDiscountOrder = (responseData: ApplyCouponResponseModel) => {
    let result = false;
    if (responseData.suggested_discounts.length > 0) {
      result = true;
    }
    return result;
  };

  const getDiscountValue = (type: string | null, value: number | null, totalAmount: number) => {
    let discountAmount = 0;
    if (!value) {
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
    return discountAmount;
  };

  const getTotalDiscountLineItems = (responseData: ApplyCouponResponseModel) => {
    let result = 0;
    responseData.line_items.forEach((lineItem) => {
      let suggestDiscount = lineItem.suggested_discounts[0];
      let discountSingleLineItem = getDiscountValue(
        suggestDiscount?.value_type,
        suggestDiscount?.value,
        lineItem?.original_total,
      );
      result = result + discountSingleLineItem;
    });
    return result;
  };

  const getTotalDiscountOrder = (
    responseData: ApplyCouponResponseModel,
    items: OrderLineItemRequest[] | undefined,
  ) => {
    if (!items) {
      return 0;
    }
    let totalLineAmountAfterDiscount = getTotalAmountAfterDiscount(items);
    let discountOrder = responseData.suggested_discounts[0];
    if (!discountOrder.value_type || !discountOrder.value) {
      return 0;
    }
    let discountAmountOrder = getDiscountValue(
      discountOrder.value_type,
      discountOrder.value,
      totalLineAmountAfterDiscount,
    );
    return discountAmountOrder;
  };

  const lineItemsConvert = (items: OrderLineItemRequest[]) => {
    return items
      .filter((item) => {
        return [PRODUCT_TYPE.normal, PRODUCT_TYPE.combo].includes(item.product_type);
      })
      .map((single) => {
        return {
          original_unit_price: single.price,
          product_id: single.product_id,
          quantity: single.quantity,
          sku: single.sku,
          variant_id: single.variant_id,
        };
      });
  };

  /**
   * Cập nhật chiết khấu tự động
   * @param items
   * @param _isAutomaticDiscount
   * @returns
   */
  const handleApplyDiscount = async (
    items: OrderLineItemRequest[] | undefined,
    _isAutomaticDiscount: boolean = isAutomaticDiscount,
  ) => {
    isShouldUpdateDiscountRef.current = true;
    if (!items || items.length === 0 || !_isAutomaticDiscount) {
      return;
    }
    setIsLoadingDiscount(true);
    dispatch(changeIsLoadingDiscountAction(true));

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
    applyDiscountService(params)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          const itemClone = [...items];
          const newItem = itemClone.map((single) => {
            single.discount_items = [];
            return getLineItemCalculationMoney(single);
          });

          console.log("handleApplyDiscount newItem", newItem);

          if (response.data.line_items.length > 0) {
            if (
              isOrderHasDiscountLineItems(response.data) &&
              isOrderHasDiscountOrder(response.data)
            ) {
              let totalDiscountLineItems = getTotalDiscountLineItems(response.data);
              let totalDiscountOrder = getTotalDiscountOrder(response.data, newItem);
              if (totalDiscountLineItems >= totalDiscountOrder) {
                let result = getApplyDiscountLineItem(response, newItem);
                console.log("calculatesChangeMoney 9");
                calculateChangeMoney(result, null);
              } else {
                // let itemsAfterRemove = items.map((single) => {
                //   single.discount_items = [];
                //   return single;
                // });
                let promotionResult = handleApplyDiscountOrder(response, newItem);
                // if (promotionResult) {
                //   setPromotionTitle(promotionResult.reason || "");
                // }
                console.log("calculatesChangeMoney 10");
                calculateChangeMoney(newItem, promotionResult);
              }
            } else if (isOrderHasDiscountLineItems(response.data)) {
              let result = getApplyDiscountLineItem(response, newItem);
              console.log("calculatesChangeMoney 11");
              calculateChangeMoney(result, null);
            } else if (isOrderHasDiscountOrder(response.data)) {
              // let itemsAfterRemove = items.map((single) => {
              //   single.discount_items = [];
              //   return single;
              // });
              let promotionResult = handleApplyDiscountOrder(response, newItem);
              // if (promotionResult) {
              //   // form.setFieldsValue({
              //   //   note: `(${promotionResult.reason})`,
              //   // });
              //   setPromotionTitle(promotionResult.reason || "");
              // }
              console.log("calculatesChangeMoney 12");
              calculateChangeMoney(items, promotionResult);
            } else {
              // let itemsAfterRemoveAutomaticDiscount = items.map((single) => {
              //   //removeAutomaticDiscountItem(single);
              //   single.discount_items = [];
              //   return single;
              // });
              // handleApplyDiscountOrder(response, newItem);
              console.log("calculatesChangeMoney 13");
              calculateChangeMoney(newItem, null);
              if (isShouldUpdatePrivateNote) {
                // form.setFieldsValue({
                //   note: ``,
                // });
              }
              // setPromotionTitle("");
            }
          } else {
            // setPromotionTitle("");
            // showError("Có lỗi khi áp dụng chiết khấu!");
            console.log("calculatesChangeMoney 14");
            calculateChangeMoney(items);
          }
        } else {
          console.log("calculatesChangeMoney 15");
          calculateChangeMoney(items);
          handleFetchApiError(response, "Áp dụng chiết khấu", dispatch);
        }
      })
      .catch((error) => {
        console.log("error", error);
        showError("Cập nhật chiết khấu tự động thất bại!");
      })
      .finally(() => {
        setIsLoadingDiscount(false);
        dispatch(changeIsLoadingDiscountAction(false));
      });
  };

  const handleApplyCouponWhenInsertCoupon = async (coupon: string, _items = items) => {
    isShouldUpdateCouponRef.current = true;
    if (!_items || _items?.length === 0 || !coupon) {
      return;
    }
    handleRemoveAllAutomaticDiscount();
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
      dispatch(showLoading());
      setIsLoadingDiscount(true);
      dispatch(changeIsLoadingDiscountAction(true));
      await applyDiscountService(params)
        .then(async (response: BaseResponse<ApplyCouponResponseModel>) => {
          if (isFetchApiSuccessful(response)) {
            const applyDiscountResponse = response.data.applied_discount;
            if (applyDiscountResponse.invalid === true) {
              showError(applyDiscountResponse.invalid_description);
              if (
                applyDiscountResponse.invalid_description === "Mã khuyến mại không tồn tại." ||
                applyDiscountResponse.invalid_description === "Khuyến mại đã hết lượt sử dụng."
              ) {
                _items?.forEach((item) => {
                  // removeDiscountItem(item);
                  removeAutomaticDiscountItem(item);
                });
                setCouponInputText && setCouponInputText(coupon);
              } else {
                setCouponInputText && setCouponInputText(coupon);
              }
              setIsCouponValid(false);
              setCoupon && setCoupon("");
              setItems(_items);
              console.log("calculatesChangeMoney 16");
              calculateChangeMoney(_items);
              setPromotion && setPromotion(null);
            } else {
              setCoupon && setCoupon(coupon);
              setCouponInputText(coupon);
              setIsCouponValid(true);
              // const discount_code = applyDiscountResponse.code || undefined;
              let couponType = applyDiscountResponse.value_type;
              let listDiscountItem: any[] = [];
              let totalAmount = getTotalAmountAfterDiscount(_items);
              response.data.line_items.forEach((single) => {
                if (listDiscountItem.some((a) => a.variant_id === single.variant_id)) {
                  return;
                } else if (single.applied_discount?.invalid !== false) {
                  return;
                } else {
                  listDiscountItem.push(single);
                }
              });
              let promotionResult = {
                ...promotion,
                sub_type: applyDiscountResponse.value_type || "",
              };
              switch (couponType) {
                case DISCOUNT_VALUE_TYPE.percentage:
                  if (applyDiscountResponse.value) {
                    let discountRate = Math.min(100, applyDiscountResponse.value);
                    let discountValue = (applyDiscountResponse.value / 100) * totalAmount;
                    promotionResult = {
                      amount: discountValue,
                      discount_code: applyDiscountResponse.code,
                      promotion_id: null,
                      rate: discountRate,
                      value: discountValue,
                      sub_type: applyDiscountResponse.value_type || "",
                    };
                  }
                  break;
                case DISCOUNT_VALUE_TYPE.fixedAmount:
                  if (applyDiscountResponse.value) {
                    let discountValue = Math.min(applyDiscountResponse.value, totalAmount);
                    let discountRate = (discountValue / totalAmount) * 100;
                    promotionResult = {
                      amount: discountValue,
                      discount_code: applyDiscountResponse.code,
                      promotion_id: null,
                      rate: discountRate,
                      value: discountValue,
                      sub_type: applyDiscountResponse.value_type || "",
                    };
                  }
                  break;
                case DISCOUNT_VALUE_TYPE.fixedPrice:
                  if (applyDiscountResponse.value) {
                    let value = orderAmount - applyDiscountResponse.value;
                    let discountValue = Math.min(value, totalAmount);
                    let discountRate = (discountValue / totalAmount) * 100;
                    promotionResult = {
                      amount: discountValue,
                      discount_code: applyDiscountResponse.code,
                      promotion_id: null,
                      rate: discountRate,
                      value: discountValue,
                      sub_type: applyDiscountResponse.value_type || "",
                    };
                  }
                  break;
                // default là chiết khấu theo line
                default:
                  let lineItemDiscountArray = response.data.line_items.filter((single) => {
                    return single.applied_discount?.invalid === false;
                  });
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
                            ...singleItem.discount_items[0],
                            amount: singleItem.quantity * discount_value,
                            value: discount_value,
                            rate: discount_rate ? Math.round(discount_rate * 100) / 100 : 0,
                            reason: applyDiscountLineItem?.title || null,
                          },
                        ];
                        singleItem.discount_value = getLineItemDiscountValue(singleItem);
                        singleItem.discount_rate = getLineItemDiscountRate(singleItem);
                        singleItem.discount_amount = getLineItemDiscountAmount(singleItem);
                        singleItem.line_amount_after_line_discount =
                          getLineAmountAfterLineDiscount(singleItem);
                      }
                    } else {
                      // removeDiscountItem(singleItem);
                      removeAutomaticDiscountItem(singleItem);
                    }
                  });
                  console.log("calculatesChangeMoney 17");
                  calculateChangeMoney(_items);
                  setPromotion &&
                    setPromotion({
                      amount: 0,
                      discount_code: applyDiscountResponse.code,
                      promotion_id: null,
                      rate: 0,
                      value: 0,
                      sub_type: applyDiscountResponse.value_type || "",
                    });
                  break;
              }
              if (isShouldUpdatePrivateNote) {
                // form.setFieldsValue({
                //   note: `(${applyDiscountResponse.code}-${applyDiscountResponse.title})`,
                // });
              }
              console.log("calculatesChangeMoney 18");
              calculateChangeMoney(_items, promotionResult);
            }
          } else {
            console.log("calculatesChangeMoney 19");
            calculateChangeMoney(_items);
            handleFetchApiError(response, "Áp dụng chiết khấu", dispatch);
          }
        })
        .catch((error) => {
          console.log("error", error);
          console.log("calculatesChangeMoney 20");
          calculateChangeMoney(_items);
          showError("Có lỗi khi áp dụng chiết khấu!");
        })
        .finally(() => {
          setIsLoadingDiscount(false);
          dispatch(changeIsLoadingDiscountAction(false));
          dispatch(hideLoading());
        });
      setIsVisiblePickCoupon(false);
    }
  };

  const onSearchVariantSelect = useCallback(
    (v, o) => {
      const selectProduct = () => {
        if (isBarcode === true) return;
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
            if (!isAutomaticDiscount && !coupon) {
              calculateChangeMoney(_items);
            }
          } else {
            let variantItems = _items.filter((item) => item.variant_id === newV);
            let firstIndex = 0;
            let selectedItem = variantItems[firstIndex];
            selectedItem.quantity += 1;
            selectedItem.line_amount_after_line_discount +=
              selectedItem.price - selectedItem.discount_items[0]?.amount * selectedItem.quantity;
            selectedItem.discount_items.forEach((single) => {
              single.amount = single.value * selectedItem.quantity;
            });
            if (!isAutomaticDiscount && !coupon) {
              calculateChangeMoney(_items);
            }
          }
        }

        const isLineItemSemiAutomatic = _items.some((p) => p.isLineItemSemiAutomatic); // xác định là ck line item thủ công
        const isOrderSemiAutomatic = promotion?.isOrderSemiAutomatic; //xác định là ck đơn hàng thủ công
        if (isLineItemSemiAutomatic) {
          if (
            props.isPageOrderUpdate &&
            !splitLine &&
            items.some((p) => p.sku === item.sku && p?.discount_items[0])
          ) {
            const _index = _items.findIndex((p) => p.sku === item.sku);
            _items[index].discount_items[0] &&
              handUpdateDiscountWhenChangingOrderInformation(_items, _index);
          } else if (!props.isPageOrderUpdate) {
            handUpdateDiscountWhenChangingOrderInformation(_items);
          }
        } else if (isOrderSemiAutomatic) {
          handUpdateDiscountWhenChangingOrderInformation(_items);
        } else if (isAutomaticDiscount) {
          handleApplyDiscount(_items);
        }
        //  else if (couponInputText && _items.length > 0) {
        //   console.log("isLineItemSemiAutomatic 3333");
        //   handleApplyCouponWhenInsertCoupon(couponInputText, _items);
        // }
        setIsInputSearchProductFocus(false);
        onClearVariantSearch();
        autoCompleteRef?.current?.blur();
      };
      handleDelayActionWhenInsertTextInSearchInput(autoCompleteRef, () => selectProduct());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      items,
      resultSearchVariant.items,
      promotion,
      isAutomaticDiscount,
      couponInputText,
      autoCompleteRef,
      splitLine,
      handleApplyDiscount,
      handleApplyCouponWhenInsertCoupon,
    ],
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
      if (value.length >= 3) {
        setSearchProducts(true);
      } else {
        setSearchProducts(false);
      }
      const handleSearchProduct = () => {
        if (isBarcode === false) {
          if (value.trim()) {
            (async () => {
              try {
                await dispatch(
                  searchVariantsOrderRequestAction(
                    initQueryVariant,
                    (data) => {
                      setResultSearchVariant(data);
                      setSearchProducts(false);
                      setIsShowProductSearch(true);
                      if (data.items.length === 0) {
                        showError("Không tìm thấy sản phẩm!");
                      }
                    },
                    () => {
                      setSearchProducts(false);
                    },
                  ),
                );
              } catch {
                setSearchProducts(false);
              }
            })();
          } else {
            setSearchProducts(false);
          }
        } else {
          onClearVariantSearch();
          setSearchProducts(false);
        }
      };
      handleDelayActionWhenInsertTextInSearchInput(autoCompleteRef, () => handleSearchProduct());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form],
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

  const onOkDiscountConfirm = (discountOrder?: CustomApplyDiscount) => {
    let type =
      discountOrder?.value_type === DiscountValueType.PERCENTAGE
        ? DISCOUNT_TYPE.PERCENT
        : DISCOUNT_TYPE.MONEY;
    let _value = discountOrder?.value ?? 0;
    let _rate = discountOrder?.value ?? 0;
    let _promotion: OrderDiscountRequest | null | undefined = null;
    if (!items || items?.length === 0) {
      showError("Bạn cần chọn sản phẩm trước khi thêm chiết khấu!");
    } else {
      // setVisiblePickDiscount(false);
      let totalOrderAmount = totalAmount(items);
      // setDiscountType(type);
      if (type === DISCOUNT_TYPE.MONEY) {
        _value = discountOrder?.value ?? 0;
        if (_value >= totalOrderAmount) {
          _value = totalOrderAmount;
        }
        _rate = (_value / orderAmount) * 100;
      } else if (type === DISCOUNT_TYPE.PERCENT) {
        _rate = discountOrder?.value ?? 0;
        if (_rate >= 100) {
          _rate = 100;
        }
        _value = (_rate * orderAmount) / 100;
      }
      _promotion = {
        amount: _value,
        discount_code: discountOrder?.code,
        order_id: null,
        promotion_id: discountOrder?.price_rule_id,
        promotion_title: discountOrder?.title,
        rate: _rate,
        reason: discountOrder?.title,
        source: null,
        value: _value,
        taxable: discountOrder?.is_registered,
        type: type,
        isOrderSemiAutomatic: true,
        sub_type: discountOrder?.value_type || "",
      };

      // if (coupon) {
      //   console.log("handleApplyCouponWhenInsertCoupon 1");
      //   handleApplyCouponWhenInsertCoupon(coupon);
      // }
      if (items) {
        console.log("calculatesChangeMoney 1");
        calculateChangeMoney(items, _promotion);
      }
      showSuccess("Thêm chiết khấu thành công!");
      setCoupon && setCoupon("");
    }
    setVisiblePickDiscount(false);
  };
  const onOkCouponConfirm = (type: string, value: number, rate: number, coupon: string) => {
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
    if (
      items.some((item) => {
        return item?.discount_items && item?.discount_items[0] && item?.discount_items[0]?.reason;
      })
    ) {
      let discountTitleArr: string[] = [];
      items.forEach((item) => {
        let reason =
          item?.discount_items && item?.discount_items[0] && item?.discount_items[0]?.reason;
        if (reason) {
          return discountTitleArr.push(reason);
        }
      });
      discountTitleArr = _.uniq(discountTitleArr);
      if (discountTitleArr && discountTitleArr.length > 0) {
        let title = "";
        for (let i = 0; i < discountTitleArr.length; i++) {
          if (i < discountTitleArr.length - 1) {
            title = title + discountTitleArr[i] + ", ";
          } else {
            title = title + discountTitleArr[i] + ".";
          }
        }
        if (isShouldUpdatePrivateNote) {
          form.setFieldsValue({
            note: `(${title})`,
          });
        }
      }
    }
  };

  /** Kiểm tra sản phẩm có thay đổi không => Chặn thông báo thay đổi phí ship thừa*/
  let prevItem: Array<any> = [];
  const checkIfItemChange = (currentItem: any) => {
    if (currentItem.length !== prevItem.length) {
      prevItem = currentItem;
      return true;
    }
    for (let i = 0; i < currentItem.length; i++) {
      if (!CompareObject(currentItem[i], prevItem[i])) {
        prevItem = currentItem;
        return true;
      }
    }
    return false;
  };

  const calculateChangeMoney = (
    _items: Array<OrderLineItemRequest>,
    _promotion?: OrderDiscountRequest | null,
  ) => {
    if (_promotion === undefined) {
      if (promotion) {
        let _value = 0;
        let _rate = 0;
        let totalOrderAmount = totalAmount(_items);
        if (discountType === DISCOUNT_TYPE.MONEY) {
          _value = promotion?.value || 0;
          if (_value > totalOrderAmount) {
            _value = totalOrderAmount;
          }
          _rate = (_value / totalOrderAmount) * 100;
        } else if (discountType === DISCOUNT_TYPE.PERCENT) {
          _rate = promotion?.rate || 0;
          if (_rate > 100) {
            _rate = 100;
          }
          _value = (_rate * totalOrderAmount) / 100;
        }
        _promotion = {
          amount: _value,
          discount_code: null,
          order_id: null,
          promotion_id: null,
          promotion_title: promotion.promotion_title,
          rate: _rate,
          reason: promotion.promotion_title,
          source: null,
          value: _value,
          taxable: promotion.taxable,
          isOrderSemiAutomatic: promotion.isOrderSemiAutomatic,
          sub_type: promotion.sub_type,
        };
        if (promotion?.discount_code && promotion.value) {
          let _rate = (promotion.value / totalOrderAmount) * 100;
          _promotion.rate = _rate;
        }
      } else {
        _promotion = null;
      }
    }
    if (!_promotion || !_promotion.amount || !_promotion.value) {
      _promotion = null;
    }
    props.changeInfo(_items, _promotion);
    fillCustomNote(_items);
    dispatch(changeOrderLineItemsAction(_items));
    const orderProductsAmount = totalAmount(_items);
    const shippingAddress = customer ? getCustomerShippingAddress(customer) : null;
    if (_items.length > 0) {
      if (shipmentMethod !== ShipmentMethodOption.PICK_AT_STORE && checkIfItemChange(_items)) {
        handleCalculateShippingFeeApplyOrderSetting(
          shippingAddress?.city_id,
          orderProductsAmount,
          shippingServiceConfig,
          transportService,
          form,
          setShippingFeeInformedToCustomer,
        );
      }
    } else {
      prevItem = _items;
    }
    setIsLineItemChanging(false);
    setIsFinishedCalculateItem(true);
  };

  const storeIdLogin = useGetStoreIdFromLocalStorage();

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];

    //loại bỏ kho Kho dự trữ, Kho phân phối
    let listStoresCopy = listStores.filter(
      (store) =>
        store.type.toLocaleLowerCase() !== STORE_TYPE.DISTRIBUTION_CENTER &&
        store.type.toLocaleLowerCase() !== STORE_TYPE.STOCKPILE,
    );

    if (listStoresCopy && listStoresCopy.length) {
      if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
        newData = listStoresCopy.filter((store) =>
          haveAccess(store.id, userReducer.account ? userReducer.account.account_stores : []),
        );
      } else {
        newData = listStoresCopy;
      }

      // trường hợp sửa đơn hàng mà account ko có quyền với cửa hàng đã chọn, thì vẫn hiển thị
      if (storeId && userReducer.account) {
        if (newData.map((single) => single.id).indexOf(storeId) === -1) {
          let initStore = listStoresCopy.find((single) => single.id === storeId);
          if (initStore) {
            newData.push(initStore);
          }
        }
      }
    }
    // set giá trị mặc định của cửa hàng là cửa hàng có thể truy cập đầu tiên, nếu đã có ở local storage thì ưu tiên lấy, nếu chưa chọn cửa hàng (update đơn hàng không set cửa hàng đầu tiên)
    if (newData && newData[0]?.id) {
      if (!storeId) {
        if (storeIdLogin && isCreateReturn) {
          setStoreId(storeIdLogin);
        } else if (!isCreateReturn) {
          const hubOnlineStoreId = 78;
          setStoreId(hubOnlineStoreId);
          // setStoreId(newData[0].id);
        }
      }
    }
    return newData;
  }, [isCreateReturn, listStores, setStoreId, storeId, storeIdLogin, userReducer?.account]);

  useEffect(() => {
    if (isCreateReturn) {
      if (storeIdLogin) {
        setStoreId(storeIdLogin);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeIdLogin, isCreateReturn]);

  const onUpdateData = useCallback(
    (items: Array<OrderLineItemRequest>) => {
      let data = [...items];
      setItemGift(data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
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

  /**
   * xóa chiết khấu tự dộng trên từng line item hoặc order
   * @returns
   */
  const handleRemoveAllAutomaticDiscount = async () => {
    if (!items || items.length === 0) {
      return;
    }
    removeCoupon();
    let _items = [...items];
    _items.forEach((lineItem) => {
      if (lineItem.discount_items[0]?.promotion_id && !lineItem.isLineItemSemiAutomatic) {
        lineItem.discount_amount = 0;
        lineItem.discount_items = [];
        lineItem.discount_rate = 0;
        lineItem.discount_value = 0;
        lineItem.line_amount_after_line_discount = getLineAmountAfterLineDiscount(lineItem);
      }
    });
    if (isShouldUpdatePrivateNote) {
      // form.setFieldsValue({
      //   note: undefined,
      // });
    }

    let _promotion: OrderDiscountRequest | null = { ...promotion };
    if (promotion?.isOrderSemiAutomatic !== true) {
      _promotion = null;
    }
    calculateChangeMoney(_items, _promotion);
  };

  // const handleRemoveAllDiscount = async () => {
  // 	if (!items || items.length === 0) {
  // 		return;
  // 	}
  // 	if (couponInputText) {
  // 		setCoupon && setCoupon("");
  // 		setCouponInputText("");
  // 	}
  // 	let _items = [...items];
  // 	_items.forEach((lineItem) => {
  // 		lineItem.discount_amount = 0;
  // 		lineItem.discount_items = [];
  // 		lineItem.discount_rate = 0;
  // 		lineItem.discount_value = 0;
  // 		lineItem.line_amount_after_line_discount = lineItem.price * lineItem.quantity;
  // 	});
  // 	if (isShouldUpdatePrivateNote) {
  // 		form.setFieldsValue({
  // 			note: undefined
  // 		})
  // 	}
  // 	// showSuccess("Xóa tất cả chiết khấu trước đó thành công!");
  // };

  const onInputSearchProductFocus = () => {
    setIsInputSearchProductFocus(true);
    autoCompleteRef.current?.focus();
    setIsDropdownVisible(true); // handle scroll
  };

  const onInputSearchProductBlur = () => {
    setIsInputSearchProductFocus(false);
    setIsDropdownVisible(false); // handle scroll
  };

  // const handleSplitOrder = () => {
  // 	if (!orderDetail || !userReducer.account) {
  // 		return;
  // 	}
  // 	if (splitOrderNumber === undefined) {
  // 		showError("Vui lòng điền số lượng tách đơn!");
  // 		return;
  // 	}
  // 	if (items && splitOrderNumber > getTotalQuantity(items)) {
  // 		showError("Số lượng tách đơn không được lớn hơn số lượng sản phẩm!");
  // 		return;
  // 	}
  // 	if (splitOrderNumber < 2 || splitOrderNumber > 20) {
  // 		showError("Số lượng tách đơn cần lớn hơn 1 và nhỏ hơn 20!");
  // 		return;
  // 	}
  //
  // 	const params: SplitOrderRequest = {
  // 		order_code: orderDetail.code,
  // 		quantity: splitOrderNumber,
  // 		updated_by: userReducer.account.updated_by || "",
  // 		updated_name: userReducer.account.updated_name || "",
  // 	};
  // 	dispatch(
  // 		splitOrderAction(params, (response) => {
  // 			if (response) {
  // 				response.data.forEach((singleOrderId: number) => {
  // 					const singleSplitLink = `${process.env.PUBLIC_URL}/orders/${singleOrderId}/update?isSplit=true`;
  // 					window.open(singleSplitLink, "_blank");
  // 				});
  // 				fetchData && fetchData();
  // 			}
  // 		})
  // 	);
  // };

  const onClearVariantSearch = () => {
    setKeySearchVariant("");
    setResultSearchVariant({
      metadata: {
        limit: 0,
        page: 1,
        total: 0,
      },
      items: [],
    });
  };

  const onChangeStore = useCallback(
    (value: number) => {
      setStoreId(value);
      setIsShowProductSearch(true);
      onClearVariantSearch();
      if (items && inventoryResponse) {
        let inventoryInStore = inventoryResponse?.filter((p) => p.store_id === value);
        let itemCopy = [...items].map((item) => {
          const itemInStore = inventoryInStore?.find((i) => i.variant_id === item.variant_id);
          return {
            ...item,
            available: itemInStore ? itemInStore.available : 0,
          };
        });
        setItems(itemCopy);
      }
    },
    [inventoryResponse, items, setItems, setStoreId],
  );

  /**
   * kiểm tra line item , đủ điều kiện chương trình khuyến mại
   * @param _itemRequest
   * @returns
   */
  const checkValidLineItemSuitableDiscount = (
    _itemRequest: OrderLineItemRequest[],
    index?: number,
  ) => {
    // let _item = { ..._itemRequest };

    let lineItems: any[] = [];
    if (index === undefined) {
      lineItems = _itemRequest
        .filter((p) => p.discount_items.length !== 0)
        .map((p) => {
          const _discountItem = p.discount_items[0];
          const type = _discountItem.discount_code ? DISCOUNT_TYPE.COUPON : _discountItem.type;
          let keyWord = _discountItem.discount_code
            ? _discountItem.discount_code
            : _discountItem.type === DISCOUNT_TYPE.PERCENT
            ? _discountItem.rate.toString()
            : _discountItem.value.toString();
          if (
            _discountItem.sub_type === DiscountValueType.FIXED_PRICE &&
            _discountItem.type === DISCOUNT_TYPE.MONEY
          ) {
            keyWord = (p.price - _discountItem.value).toString();
          }
          return lineItemsConvertInSearchPromotion(p, keyWord, type);
        });
    } else {
      const _discountItem = _itemRequest[index].discount_items[0];
      if (_discountItem) {
        const type = _discountItem.discount_code ? DISCOUNT_TYPE.COUPON : _discountItem.type;
        let keyWord = _discountItem.discount_code
          ? _discountItem.discount_code
          : _discountItem.type === DISCOUNT_TYPE.PERCENT
          ? _discountItem.rate.toString()
          : _discountItem.value.toString();

        if (
          _discountItem.sub_type === DiscountValueType.FIXED_PRICE &&
          _discountItem.type === DISCOUNT_TYPE.MONEY
        ) {
          keyWord = (_itemRequest[index].price - _discountItem.value).toString();
        }

        const lineItemConvert = lineItemsConvertInSearchPromotion(
          _itemRequest[index],
          keyWord,
          type,
        );
        lineItems = [lineItemConvert];
      }
    }

    if (lineItems.length === 0) {
      calculateChangeMoney(_itemRequest);
      return;
    }

    const params = { ...discountRequestModel, line_items: lineItems };

    applyDiscountService(params).then((response) => {
      if (isFetchApiSuccessful(response)) {
        const isDiscount = (
          _suggesteds: SuggestDiscountResponseModel[],
          _apply: AppliedDiscountResponseModel | null,
          promotionId?: number | null,
        ) => {
          if (_suggesteds && _suggesteds.some((p) => p.price_rule_id === promotionId)) {
            return true;
          }
          if (_apply && _apply?.price_rule_id === promotionId) {
            return true;
          }
          return false;
        };
        if (index === undefined) {
          let _items = [..._itemRequest];

          _itemRequest.forEach((line, index) => {
            const lineItemRes = response.data.line_items.find(
              (itemRes) => itemRes.sku === line.sku,
            );
            if (lineItemRes) {
              const suggestedDiscounts = lineItemRes.suggested_discounts;
              const applyDiscount = lineItemRes.applied_discount;
              const promotionId = line.discount_items[0]?.promotion_id;
              if (!isDiscount(suggestedDiscounts, applyDiscount, promotionId)) {
                let _item = _items[index];
                removeDiscountLineItem(_item);
              }
            }
          });

          calculateChangeMoney(_items);
        } else {
          let _items = [..._itemRequest];
          let _item = _items[index];
          const lineItemRes = response.data.line_items.find((itemRes) => itemRes.sku === _item.sku);
          if (lineItemRes) {
            const suggestedDiscounts = lineItemRes.suggested_discounts;
            const applyDiscount = lineItemRes.applied_discount;
            const promotionId = _item.discount_items[0]?.promotion_id;
            if (!isDiscount(suggestedDiscounts, applyDiscount, promotionId)) {
              removeDiscountLineItem(_item);
            }

            calculateChangeMoney(_items);
          }
        }
      } else {
        handleFetchApiError(response, "apply chiết khấu", dispatch);
      }
    });
  };

  /**
   * kiểm tra order, đủ điều kiện chương trình khuyến mại
   * @param _itemsRequest
   * @returns
   */
  const checkValidOrderSuitableDiscount = (_itemsRequest: OrderLineItemRequest[]) => {
    let _items = [..._itemsRequest];
    let params = { ...discountRequestModel };
    params.line_items = _items?.map((_item) => ({
      original_unit_price: _item.price,
      product_id: _item.product_id,
      quantity: _item.quantity,
      sku: _item.sku,
      variant_id: _item.variant_id,
    }));

    if (promotion?.discount_code && promotion?.discount_code.length !== 0) {
      params.applied_discount = {
        code: promotion?.discount_code,
      };
    } else if (promotion?.type === DISCOUNT_TYPE.PERCENT) {
      params.keyword = promotion?.rate?.toString();
      params.search_type = DiscountValueType.PERCENTAGE;
    } else if (promotion?.type === DISCOUNT_TYPE.MONEY) {
      params.keyword = promotion?.value?.toString();
      params.search_type = DiscountValueType.FIXED_PRICE;
    }

    applyDiscountService(params)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          const suggestedDiscounts = response.data.suggested_discounts;
          const applyDiscount = response.data.applied_discount;

          const isDiscount = () => {
            if (
              suggestedDiscounts &&
              suggestedDiscounts.some((p) => p.price_rule_id === promotion?.promotion_id)
            ) {
              return true;
            }
            if (
              applyDiscount &&
              applyDiscount?.price_rule_id === promotion?.promotion_id &&
              !applyDiscount.invalid
            ) {
              return true;
            }
            return false;
          };
          const check = isDiscount();
          console.log("checkValidOrderSuitableDiscount", check);
          check ? calculateChangeMoney(_itemsRequest) : calculateChangeMoney(_itemsRequest, null);
        } else {
          handleFetchApiError(response, "apply chiết khấu", dispatch);
        }
      })
      .catch(() => {})
      .finally(() => {});
  };

  useEffect(() => {
    if (items && items.length > 0) {
      setIsShowProductSearch(true);
    }
  }, [items]);

  /**
   * gọi lại api chiết khấu tự động khi update cửa hàng, khách hàng, nguồn, số lượng item
   */
  useEffect(() => {
    if (isShouldUpdateDiscountRef.current && items && items?.length > 0) {
      console.log("isAutomaticDiscount  1234");
      let _items = [...items];
      const isLineItemSemiAutomatic = _items.some((p) => p.isLineItemSemiAutomatic); // xác định là ck line item thủ công
      const isOrderSemiAutomatic = promotion?.isOrderSemiAutomatic; //xác định là ck đơn hàng thủ công

      console.log("isAutomaticDiscount  1234", isLineItemSemiAutomatic, isOrderSemiAutomatic);
      if (isLineItemSemiAutomatic || isOrderSemiAutomatic) {
        handUpdateDiscountWhenChangingOrderInformation(_items);
      } else if (isAutomaticDiscount) {
        handleApplyDiscount(items);
      }

      // console.log("items items", items)
    } else isShouldUpdateDiscountRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, orderSource, countFinishingUpdateCustomer]);
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countFinishingUpdateCustomer, storeId, orderSource, isShouldUpdateDiscountRef]);

  // đợi 3s cho load trang xong thì sẽ update trong trường hợp clone
  useEffect(() => {
    if (!props.updateOrder) {
      setTimeout(() => {
        isShouldUpdateCouponRef.current = true;
        isShouldUpdateDiscountRef.current = true;
      }, 3000);
    }
  }, [props.updateOrder]);

  useEffect(() => {
    if (items && items.length === 0) {
      if (isShouldUpdatePrivateNote) {
        form.setFieldsValue({
          note: "",
        });
      }
      setPromotion && setPromotion(null);
    }
  }, [form, isShouldUpdatePrivateNote, items, setPromotion]);

  useEffect(() => {
    if (coupon) {
      setIsAutomaticDiscount(false);
    }
  }, [coupon]);

  /**
   *  handle order YDpage
   */
  const [firstLoad, setFirstLoad] = useState<boolean>(false);
  useEffect(() => {
    if (!defaultStoreId || firstLoad) return;
    let valueDefault = dataCanAccess.filter((item) => item.id === defaultStoreId);
    if (valueDefault.length > 0) {
      form.setFieldsValue({ store_id: valueDefault[0].id });
      setStoreId(valueDefault[0].id);
    } else {
      form.setFieldsValue({ store_id: null });
    }
    if (dataCanAccess.length > 0) {
      setFirstLoad(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultStoreId, dataCanAccess]);

  const handleChangeSplitLine = () => {
    setSplitLine(!splitLine);
    setCheckSplitLine(!isCheckSplitLine);
  };

  /** handle scroll page */
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const setPageScroll = (overflowType: string) => {
    let rootSelector: any = document.getElementById("root");
    if (rootSelector) {
      rootSelector.style.overflow = overflowType;
    }
  };

  // if the popup dropdown is scrolling then page scroll is hidden
  const handleOnSelectPopupScroll = () => {
    if (isDropdownVisible) {
      setPageScroll("hidden");
    }
  };

  const handleOnMouseLeaveSelect = () => {
    setPageScroll("scroll");
  };

  const handleOnDropdownVisibleChange = (open: boolean) => {
    setIsDropdownVisible(open);
  };

  const onInputSelectFocus = () => {
    setIsDropdownVisible(true);
  };

  const onInputSelectBlur = () => {
    setIsDropdownVisible(false);
  };

  useEffect(() => {
    if (!isDropdownVisible) {
      setPageScroll("scroll");
    }
  }, [isDropdownVisible]);
  /** end handle scroll page */
  /**
   *  end handle order YDpage
   */

  return (
    <StyledComponent>
      <Card className="yd-page-order padding-12 update-customer-ydpage">
        <Row
          gutter={12}
          style={{
            marginTop: 6,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Col span={24} style={{ marginBottom: 6 }} hidden>
            <Select style={{ minWidth: 145, height: 38 }} placeholder="Chương trình khuyến mại">
              <Select.Option value="" color="#222222">
                (Tạm thời chưa có)
              </Select.Option>
            </Select>
          </Col>

          <Col span={17}>
            <Form.Item
              name="store_id"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn cửa hàng",
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
                getPopupContainer={(trigger: any) => trigger.parentElement}
                onFocus={onInputSelectFocus}
                onBlur={onInputSelectBlur}
                onDropdownVisibleChange={handleOnDropdownVisibleChange}
                onPopupScroll={handleOnSelectPopupScroll}
                onMouseLeave={handleOnMouseLeaveSelect}
                onChange={(value?: number) => {
                  if (value) {
                    onChangeStore(value);
                  } else {
                    setIsShowProductSearch(false);
                  }
                  dispatch(setIsShouldSetDefaultStoreBankAccountAction(true));
                }}
                filterOption={(input, option) => {
                  if (option) {
                    return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
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
          <Col span={7} style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              style={{ width: "100%", padding: "0 6px" }}
              disabled={isOrderFinishedOrCancel(orderDetail)}
              onClick={() => {
                showInventoryModal();
              }}
            >
              Kiểm tra tồn
            </Button>
          </Col>
        </Row>

        <Row
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <Col>
            <Checkbox checked={isCheckSplitLine} onChange={handleChangeSplitLine}>
              Tách dòng
            </Checkbox>
          </Col>

          <Col hidden>
            <Form.Item name="price_type">
              <Select style={{ minWidth: 145, height: 38 }} placeholder="Chính sách giá">
                <Select.Option value="retail_price" color="#222222">
                  Giá bán lẻ
                </Select.Option>
                <Select.Option value="whole_sale_price">Giá bán buôn</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col>
            <Form.Item name="automatic_discount" valuePropName="checked">
              <Checkbox
                disabled={levelOrder > 3 || isLoadingDiscount || !!coupon}
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
                      calculateChangeMoney(items, promotion);
                    }
                    setPromotion && setPromotion(null);
                  }
                }}
              >
                Chiết khấu tự động
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item>
              <AutoComplete
                notFoundContent={
                  keySearchVariant.length >= 3 ? (
                    searchProducts ? (
                      <Spin size="small" />
                    ) : (
                      "Không tìm thấy sản phẩm"
                    )
                  ) : undefined
                }
                id="search_product"
                value={keySearchVariant}
                ref={autoCompleteRef}
                onSelect={onSearchVariantSelect}
                dropdownClassName="search-layout dropdown-search-header"
                // dropdownMatchSelectWidth={456}
                className="w-100"
                onSearch={onChangeProductSearch}
                options={convertResultSearchVariant}
                maxLength={255}
                open={isShowProductSearch && isInputSearchProductFocus}
                onFocus={onInputSearchProductFocus}
                onBlur={onInputSearchProductBlur}
                disabled={levelOrder > 3 || loadingAutomaticDiscount}
                defaultActiveFirstOption
                dropdownRender={(menu) => <div>{menu}</div>}
                getPopupContainer={(trigger: any) => trigger.parentElement}
                onPopupScroll={handleOnSelectPopupScroll}
                onMouseLeave={handleOnMouseLeaveSelect}
                onDropdownVisibleChange={handleOnDropdownVisibleChange}
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
          bordered
          locale={{
            emptyText: (
              <div className="sale_order_empty_product" style={{ padding: 5 }}>
                {"Đơn hàng của bạn chưa có sản phẩm nào!"}
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
                <div style={{ flexGrow: 1 }}>
                  <div className="unbold">TỔNG TIỀN</div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: getTotalAmountAfterDiscount(items) < 0 ? "#ff4d4f" : "unset",
                    }}
                  >
                    {formatCurrency(getTotalAmountAfterDiscount(items)) + " ₫"}
                  </div>
                </div>

                <div style={{ width: 20, fontWeight: 700 }}>=</div>

                <div style={{ flexGrow: 1 }}>
                  <div className="unbold">TỔNG GIÁ</div>
                  <div style={{ fontWeight: 700 }}>
                    {formatCurrency(getTotalAmount(items)) + " ₫"}
                  </div>
                </div>

                <div style={{ width: 20, fontWeight: 700 }}>-</div>

                <div style={{ flexGrow: 1 }}>
                  <div className="unbold">TỔNG CK</div>
                  <div style={{ fontWeight: 700 }}>
                    {formatCurrency(getTotalDiscount(items)) + " ₫"}
                  </div>
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
            handleRemoveAllAutomaticDiscount={handleRemoveAllAutomaticDiscount}
          />
        )}

        {setPromotion && (
          <React.Fragment>
            <DiscountOrderModalSearch
              amount={orderAmount}
              type={discountType}
              value={discountValue}
              rate={discountRate}
              onCancelDiscountModal={() => setVisiblePickDiscount(false)}
              onOkDiscountModal={onOkDiscountConfirm}
              visible={isVisiblePickDiscount}
              param={{
                order_id: orderDetail?.id,
                customer_id: customer?.id,
                order_source_id: form.getFieldValue("source_id"),
                store_id: form.getFieldValue("store_id"),
                sales_channel_name: ADMIN_ORDER.channel_name,
                assignee_code: customer?.responsible_staff_code || undefined,
                line_items: items?.map((_item) => ({
                  original_unit_price: _item.price,
                  product_id: _item.product_id,
                  quantity: _item.quantity,
                  sku: _item.sku,
                  variant_id: _item.variant_id,
                })),
              }}
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
