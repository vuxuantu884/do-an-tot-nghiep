import { EditOutlined } from "@ant-design/icons";
import {
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
  Tag,
  Tooltip,
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import giftIcon from "assets/icon/gift.svg";
import XCloseBtn from "assets/icon/X_close.svg";
import arrowDownIcon from "assets/img/drow-down.svg";
import discountCouponSuccess from "assets/icon/discount-coupon-success.svg";
import BaseResponse from "base/base.response";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import { StoreSearchListAction } from "domain/actions/core/store.action";
import {
  changeIsLoadingDiscountAction,
  changeOrderLineItemsAction,
  setIsShouldSetDefaultStoreBankAccountAction,
} from "domain/actions/order/order.action";
// import { SearchBarCode } from "domain/actions/product/products.action";
import useGetStoreIdFromLocalStorage from "hook/useGetStoreIdFromLocalStorage";
import _ from "lodash";
import { StoreResponse } from "model/core/store.model";
import { ChangeShippingFeeApplyOrderSettingParamModel } from "model/order/order.model";
import { VariantResponse } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  OrderDiscountRequest,
  OrderItemDiscountRequest,
  OrderLineItemRequest,
} from "model/request/order.request";
import { DiscountRequestModel } from "model/request/promotion.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import {
  OrderCorrelativeVariantResponse,
  OrderResponse,
} from "model/response/order/order.response";
import {
  ApplyCouponResponseModel,
  CustomApplyDiscount,
  SuggestDiscountResponseModel,
  AppliedDiscountResponseModel,
  LineItemCreateReturnSuggestDiscountResponseModel,
} from "model/response/order/promotion.response";
import { OrderConfigResponseModel } from "model/response/settings/order-settings.response";
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
import { applyDiscountService } from "service/promotion/discount/discount.service";
import {
  flattenArray,
  findAvatar,
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
  handleDelayActionWhenInsertTextInSearchInput,
  handleFetchApiError,
  haveAccess,
  isFetchApiSuccessful,
  isOrderFinishedOrCancel,
  replaceFormatString,
  findWholesalePriceInVariant,
} from "utils/AppUtils";
import {
  ACCOUNT_ROLE_ID,
  ADMIN_ORDER,
  DISCOUNT_TYPE,
  EnumOrderType,
  PRODUCT_TYPE,
  ShipmentMethodOption,
  STORE_TYPE,
} from "utils/Constants";
import { DISCOUNT_VALUE_TYPE } from "utils/Order.constants";
import {
  checkIfECommerceByOrderChannelCode,
  checkIfECommerceByOrderChannelCodeUpdateOrder,
  checkIfOrderSplit as checkIfSplitOrderIsValid,
  checkOrderGiftWithSplitOrder,
  compareProducts,
  getFlattenLineItem,
  getLineItemCalculationMoney,
  getPositionLineItem,
  isGiftLineItem,
  lineItemsConvertInSearchPromotion,
  removeAllDiscountLineItems,
  removeDiscountLineItem,
} from "utils/OrderUtils";
import { showError, showModalWarning, showSuccess, showWarning } from "utils/ToastUtils";
import ImportProductByExcelButton from "./ImportProductByExcelButton";
import CardProductBottom from "./CardProductBottom";
import { StyledComponent } from "./styles";
import DiscountItemSearch from "screens/order-online/component/DiscountItemSearch";
import DiscountOrderModalSearch from "screens/order-online/component/DiscountOrderModalSearch";
import { DiscountValueType } from "model/promotion/price-rules.model";
import DiscountGroup from "screens/order-online/component/discount-group";
import { DiscountUnitType } from "screens/promotion/constants";
import { getSuggestStoreInventory } from "service/core/store.service";
import SuggestInventoryModal from "screens/order-online/modal/InventoryModal/suggest-inventory.modal";
import OrderSplitModal from "screens/order-online/modal/OrderSplitModal";
import SearchProductComponent from "component/search-product";
import AddGiftLineItem from "screens/order-online/component/AddGiftLineItem";
import AddBag from "screens/order-online/component/AddBag";
import { EnumGiftType } from "config/enum.config";

type PropTypes = {
  storeId: number | null;
  items?: Array<OrderLineItemRequest>;
  shippingFeeInformedToCustomer: number | null;
  form: FormInstance<any>;
  totalAmountCustomerNeedToPay: number;
  orderConfig: OrderConfigResponseModel | null | undefined;
  levelOrder?: number;
  coupon?: string;
  promotion: OrderDiscountRequest | null;
  orderSourceId?: number | null;
  orderProductsAmount: number;
  totalOrderAmount: number;
  isPageOrderUpdate?: boolean;
  isPageOrderDetail?: boolean;
  isCreateReturn?: boolean;
  orderDetail?: OrderResponse | null;
  customer?: CustomerResponse | null;
  loyaltyPoint: LoyaltyPoint | null;
  setStoreId: (item: number | null) => void;
  setCoupon?: (item: string) => void;
  setPromotion?: (item: OrderDiscountRequest | null) => void;
  setItemGift: (item: OrderLineItemRequest[]) => void;
  changeInfo: (items: Array<OrderLineItemRequest>, promotion: OrderDiscountRequest | null) => void;
  setItems: (items: Array<OrderLineItemRequest>) => void;
  fetchData?: () => void;
  returnOrderInformation?: {
    totalAmountReturn: number;
    totalAmountExchangePlusShippingFee: number;
  };
  countFinishingUpdateCustomer: number; // update khách hàng
  countFinishingUpdateSource?: number; // update nguồn
  countFinishingUpdateOrderType?: number; //update loại đơn
  shipmentMethod: number;
  isExchange?: boolean;
  stores: StoreResponse[];
  isReturnOffline?: boolean;
  setPromotionTitle: (value: string) => void;
  handleChangeShippingFeeApplyOrderSettings: (
    value: ChangeShippingFeeApplyOrderSettingParamModel,
  ) => void;
  // isWebAppOrder?: boolean;
  isEcommerceOrder?: boolean;
  initItemSuggestDiscounts?: LineItemCreateReturnSuggestDiscountResponseModel[];
  initOrderSuggestDiscounts?: SuggestDiscountResponseModel[];
  handleApplyDiscountItemCallback?: (item: OrderLineItemRequest) => void;
  isSpecialOrderEcommerce?: {
    isEcommerce: boolean;
    isChange: boolean;
  };
  orderType?: string;
  orderChannel?: string;
  giftTypeInOrder?: string | null;
  orderCorrelativeVariant?: OrderCorrelativeVariantResponse;
};

// var barcode = "";
// var isBarcode = false;
const hubOnlineStoreId = 78;

// const initQueryVariant: VariantSearchQuery = {
//   limit: 10,
//   page: 1,
//   saleable: true,
//   active: true,
// };

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
 * orderType: loại đơn hàng(bán lẻ/ bán buôn)
 *
 */
function OrderCreateProduct(props: PropTypes) {
  let isQuantityIsSame = false;
  /**
   * thời gian delay khi thay đổi số lượng sản phẩm để apply chiết khấu
   */
  const QUANTITY_DELAY_TIME_PROMOTION = 600;
  const QUANTITY_DELAY_TIME = 300;
  const {
    form,
    items,
    storeId,
    levelOrder = 0,
    // coupon = "",
    orderDetail,
    orderConfig,
    shippingFeeInformedToCustomer,
    returnOrderInformation,
    totalAmountCustomerNeedToPay,
    // orderSourceId,
    customer,
    loyaltyPoint,
    promotion,
    orderProductsAmount,
    totalOrderAmount,
    setStoreId,
    setItems,
    setCoupon,
    setPromotion,
    countFinishingUpdateCustomer,
    countFinishingUpdateSource,
    isCreateReturn,
    shipmentMethod,
    stores,
    isExchange,
    isPageOrderDetail,
    isReturnOffline,
    setPromotionTitle,
    handleChangeShippingFeeApplyOrderSettings,
    // isWebAppOrder,
    initItemSuggestDiscounts,
    initOrderSuggestDiscounts,
    handleApplyDiscountItemCallback,
    orderCorrelativeVariant,
  } = props;

  const orderCustomer = useSelector(
    (state: RootReducerType) => state.orderReducer.orderDetail.orderCustomer,
  );
  const dispatch = useDispatch();

  const isShouldUpdateCouponRef = useRef(orderDetail || props.isPageOrderUpdate ? false : true);
  const isShouldUpdateDiscountRef = useRef(orderDetail || props.isPageOrderUpdate ? false : true);
  // const isShouldUpdateOrderTypeRef = useRef(orderDetail || props.isPageOrderUpdate ? false : true);
  const isShouldUpdateOrderTypeRef = useRef(false);
  /**
   * Giảm giá thủ công tùy chỉnh
   * xử lí cho các trường hợp:
   * update đơn hàng sàn
   * tạo đơn đổi trả đơn hàng sàn
   * sao chép đơn hàng sàn
   */

  const isCustomOriginalHandmadeDiscount = useMemo(() => {
    if (
      checkIfECommerceByOrderChannelCodeUpdateOrder(orderDetail?.channel_code) &&
      (props.isPageOrderUpdate || props.isCreateReturn)
    ) {
      return true;
    }
    if (props.isSpecialOrderEcommerce?.isEcommerce) return true;

    return false;
  }, [
    orderDetail?.channel_code,
    props.isPageOrderUpdate,
    props.isCreateReturn,
    props.isSpecialOrderEcommerce?.isEcommerce,
  ]);

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
    //sales_channel_name: isReturnOffline ? POS.source_name : ADMIN_ORDER.channel_name,
    sales_channel_name: props.orderChannel || ADMIN_ORDER.channel_name,
    order_source_id: form.getFieldValue("source_id"),
    assignee_code: customer?.responsible_staff_code || null,
    line_items: [],
    applied_discount: null,
    taxes_included: true,
    tax_exempt: false,
  };
  // const [loadingAutomaticDiscount] = useState(false);
  const [splitLine, setSplitLine] = useState<boolean>(false);
  const [keySearchVariant, setKeySearchVariant] = useState("");
  // const [resultSearchVariant, setResultSearchVariant] = useState<PageResponse<VariantResponse>>({
  //   metadata: {
  //     limit: 0,
  //     page: 1,
  //     total: 0,
  //   },
  //   items: [],
  // });
  // const [searchProducts, setSearchProducts] = useState(false);
  const [isVisiblePickDiscount, setVisiblePickDiscount] = useState(false);
  // const [discountType, setDiscountType] = useState<string>(DISCOUNT_TYPE.MONEY);
  // const [isShowProductSearch, setIsShowProductSearch] = useState(true);
  // const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(true);
  const [isAutomaticDiscount, setIsAutomaticDiscount] = useState(
    form.getFieldValue("automatic_discount") || false,
  );
  const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);
  const [isInventoryModalVisible, setInventoryModalVisible] = useState(false);

  //tách đơn
  //đóng
  // const [couponInputText, setCouponInputText] = useState("");

  const lineItemQuantityInputTimeoutRef: MutableRefObject<any> = useRef();
  const lineItemPriceInputTimeoutRef: MutableRefObject<any> = useRef();
  const lineItemDiscountInputTimeoutRef: MutableRefObject<any> = useRef();

  const [isLineItemChanging, setIsLineItemChanging] = useState(false);
  const [isFinishedCalculateItem, setIsFinishedCalculateItem] = useState(true);

  const [isLoadingInventory, setLoadingInventory] = useState(false);
  const [storeArrayResponse, setStoreArrayResponse] = useState<Array<StoreResponse> | null>([]);
  // const [discountOrder, setDiscounts] = useState<SuggestDiscountResponseModel[]>([]);
  const [inventoryResponse, setInventoryResponse] = useState<Array<any> | null>(null);

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const [visibleOrderSplitModal, setVisibleOrderSplitModal] = useState<boolean>(false);
  const [giftProgramForAllOrdersOrProduct, setGiftProgramForAllOrdersOrProduct] = useState<
    string | null
  >(null);

  const discountRate = promotion?.rate || 0;
  const discountValue = promotion?.value || 0;

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
        if (
          levelOrder <= 3 &&
          !isCustomOriginalHandmadeDiscount &&
          !props.isPageOrderUpdate &&
          props.orderType !== EnumOrderType.b2b
        ) {
          form.setFieldsValue({
            automatic_discount: !isAutomaticDiscount,
          });
          if (isAutomaticDiscount) {
            showSuccess("Tắt chiết khấu tự động thành công!");
            handleRemoveAllAutomaticDiscount();
          } else {
            handleApplyDiscount(items, true);
            showSuccess("Bật chiết khấu tự động thành công!");
          }
        }
        break;
      default:
        break;
    }
    return;
  };

  const isShouldUpdatePrivateNote = useMemo(() => {
    if (props.isPageOrderUpdate && form.getFieldValue("note")) {
      return false;
    }
    return true;
  }, [form, props.isPageOrderUpdate]);

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
    isShouldAutomaticDiscount = true,
  ) => {
    setIsFinishedCalculateItem(false);
    // delay khi thay đổi số lượng
    //nếu có chiết khấu tự động
    if (isAutomaticDiscount) {
      handleDelayActionWhenInsertTextInSearchInput(
        inputRef,
        () => {
          if (isShouldAutomaticDiscount) {
            handleApplyDiscount(_items);
          } else {
            calculateChangeMoney(_items);
          }
        },
        QUANTITY_DELAY_TIME_PROMOTION,
      );
      //nếu có coupon
    }
    // else if (couponInputText) {
    //   handleDelayActionWhenInsertTextInSearchInput(
    //     inputRef,
    //     () => handleApplyCouponWhenInsertCoupon(couponInputText, _items),
    //     QUANTITY_DELAY_TIME_PROMOTION,
    //   );
    // }
    else {
      handleDelayActionWhenInsertTextInSearchInput(
        inputRef,
        () => calculateChangeMoney(_items),
        QUANTITY_DELAY_TIME,
      );
    }
  };

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

    if (isLineItemSemiAutomatic || isNotAutomaticIsLineItemSemiAutomatic) {
      handleDelayActionWhenInsertTextInSearchInput(
        lineItemQuantityInputTimeoutRef,
        async () => {
          setIsLineItemChanging(true);
          if ((index && index === -1) || isCustomOriginalHandmadeDiscount) {
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
          if (!isCustomOriginalHandmadeDiscount) {
            setIsLineItemChanging(true);
            checkValidOrderSuitableDiscount(_items);
          } else {
            calculateChangeMoney(_items);
          }
        },
        QUANTITY_DELAY_TIME,
      );
    } else {
      handleDelayActionWhenInsertTextInSearchInput(
        lineItemQuantityInputTimeoutRef,
        () => {
          if (isAutomaticDiscount) {
            handleApplyDiscount(_items);
          } else {
            calculateChangeMoney(_items);
          }
        },
        QUANTITY_DELAY_TIME_PROMOTION,
      );
    }
  };

  const handUpdateGiftWhenChangingOrderInformation = (
    _items: OrderLineItemRequest[],
    nextFunction?: (nextItems: OrderLineItemRequest[]) => void,
    _indexItem?: number,
  ) => {
    const setLineItemUpdate = (_v: OrderLineItemRequest[]) => {
      if (nextFunction) {
        nextFunction(_v);
      } else {
        setItems(_v);
      }
    };
    const getItemsCollection = () => {
      let _itemsCollection = _.cloneDeep(_items);
      if (props.isPageOrderUpdate && orderCorrelativeVariant && orderCorrelativeVariant.split) {
        _itemsCollection.push(...orderCorrelativeVariant.items);
      }
      _itemsCollection = getFlattenLineItem(_itemsCollection) as OrderLineItemRequest[];

      return _itemsCollection;
    };

    const checkAllLineItemNoGift = (_v: OrderLineItemRequest[]) => {
      const check1 = _v.some((p) => p.gifts && p.gifts.length !== 0);
      const check2 =
        orderCorrelativeVariant?.split && orderCorrelativeVariant?.items.length !== 0
          ? orderCorrelativeVariant?.items.some((item) => isGiftLineItem(item.type))
          : false;
      return check1 || check2;
    };

    const checkLineItemNoGift = (index: number) => {
      const item = _items[index];
      if (item.gifts && item.gifts.length !== 0) {
        return false;
      }

      return true;
    };

    const handleGiftAllUpdate = async (_itemsCollection: OrderLineItemRequest[]) => {
      const _suggestedDiscounts = await callGiftApi(_itemsCollection);
      const validGiftsInLineItem = _items.map((item) => {
        let gifts: OrderLineItemRequest[] = item.gifts;
        const priceRuleId =
          item.gifts && item.gifts.length !== 0
            ? item.gifts[0].discount_items && item.gifts[0].discount_items.length !== 0
              ? item.gifts[0].discount_items[0].promotion_id || null
              : null
            : null;

        const _giftType =
          item.gifts && item.gifts.length !== 0
            ? item.gifts[0].discount_items && item.gifts[0].discount_items.length !== 0
              ? item.gifts[0].type
              : null
            : null;

        if (!priceRuleId) {
          gifts = [];
        } else if (_giftType === EnumGiftType.BY_ITEM) {
          const suggestedDiscountsWithGiftsInVariant = _suggestedDiscounts.filter(
            (p: any) => p.variantCurrenId === item.variant_id,
          );
          if (!suggestedDiscountsWithGiftsInVariant.some((p) => p.price_rule_id === priceRuleId)) {
            gifts = [];
          }
        } else if (_giftType === EnumGiftType.BY_ORDER) {
          if (!_suggestedDiscounts.some((p) => p.price_rule_id === priceRuleId)) {
            gifts = [];
          }
        } else {
          gifts = [];
        }

        return {
          ...item,
          gifts: gifts,
        };
      });
      console.log("validGiftsInLineItem", validGiftsInLineItem);

      if (!checkAllLineItemNoGift(validGiftsInLineItem)) {
        setGiftProgramForAllOrdersOrProduct(null);
      }

      setLineItemUpdate(validGiftsInLineItem);
    };

    const handleGiftUpdateFromIndex = async (
      _itemsCollection: OrderLineItemRequest[],
      index: number,
    ) => {
      if (index === -1) {
        setLineItemUpdate(_items);
        return;
      } else if (checkLineItemNoGift(index)) {
        setLineItemUpdate(_items);
        return;
      }

      const _suggestedDiscounts = await callGiftApi(_itemsCollection);

      let _item = _items[index];
      const priceRuleId =
        _item.gifts && _item.gifts.length !== 0
          ? _item.gifts[0].discount_items && _item.gifts[0].discount_items.length !== 0
            ? _item.gifts[0].discount_items[0].promotion_id || null
            : null
          : null;

      const suggestedDiscountsWithGiftsInVariant = _suggestedDiscounts.filter(
        (p: any) => p.variantCurrenId === _items[index].variant_id,
      );
      if (!suggestedDiscountsWithGiftsInVariant.some((p) => p.price_rule_id === priceRuleId)) {
        _item.gifts = [];
      }

      if (!checkAllLineItemNoGift(_items)) {
        setGiftProgramForAllOrdersOrProduct(null);
      }

      setLineItemUpdate(_items);
    };

    const handleCheckGiftTypeOrderUpdate = async (_itemsCollection: OrderLineItemRequest[]) => {
      const _suggestedDiscounts = await callGiftApi(_itemsCollection);
      const validateGift = (item: OrderLineItemRequest) => {
        const priceRuleId =
          item.discount_items && item.discount_items.length !== 0
            ? item.discount_items[0].promotion_id || null
            : null;

        const _giftType = item.type;
        if (!priceRuleId) return true;

        if (_giftType !== EnumGiftType.BY_ORDER) return true;

        if (_suggestedDiscounts.some((p) => p.price_rule_id === priceRuleId)) return true;
        return false;
      };

      const check = _itemsCollection
        .filter((item) => isGiftLineItem(item.type))
        .some((item) => !validateGift(item));

      if (check) {
        showModalWarning(
          "Chương trình quà tặng không thỏa mãn với đơn hàng, vui lòng kiểm tra lại các đơn hàng liên quan",
          "Cảnh báo",
        );
      }

      setLineItemUpdate(_items);
    };

    const callGiftApi = (_itemsCollection: OrderLineItemRequest[]) =>
      new Promise<SuggestDiscountResponseModel[]>(async (resolve, reject) => {
        const lineItemRequest = _itemsCollection.filter((item) => !isGiftLineItem(item.type));

        const uniqueItems = [...lineItemRequest].filter(
          (obj, index, self) => index === self.findIndex((o) => o.sku === obj.sku),
        );

        const param: DiscountRequestModel = {
          order_id: null,
          customer_id: customer?.id || null,
          order_source_id: form.getFieldValue("source_id"),
          store_id: form.getFieldValue("store_id"),
          sales_channel_name: props.orderChannel || ADMIN_ORDER.channel_name,
          type: "GIFT",
          line_items:
            uniqueItems?.map((_item) => ({
              original_unit_price: _item.price,
              product_id: _item.product_id,
              quantity: _item.quantity,
              sku: _item.sku,
              variant_id: _item.variant_id,
            })) || [],
        };

        const response = await applyDiscountService(param);
        if (isFetchApiSuccessful(response)) {
          const _suggestedDiscounts: SuggestDiscountResponseModel[] = [];
          if (response.data.suggested_discounts && response.data.suggested_discounts.length !== 0) {
            const customSuggestedDiscounts = response.data.suggested_discounts.map(
              (p: SuggestDiscountResponseModel) => ({
                ...p,
                variantCurrenId: null,
                isDiscountType: EnumGiftType.BY_ORDER,
              }),
            );
            _suggestedDiscounts.push(...customSuggestedDiscounts);
          }

          if (response.data.line_items && response.data.line_items.length !== 0) {
            const mapSuggestedDiscountsItem = response.data.line_items.map((p) => {
              const map = p.suggested_discounts.map((p1) => ({
                ...p1,
                variantCurrenId: p.variant_id,
              }));
              return map;
            });
            const suggestedDiscountsItem = flattenArray(mapSuggestedDiscountsItem);

            const suggestedDiscountsItemAddDiscountType = suggestedDiscountsItem.map((p: any) => ({
              ...p,
              variantCurrenId: p.variantCurrenId,
              isDiscountType: EnumGiftType.BY_ITEM,
            }));
            _suggestedDiscounts.push(...suggestedDiscountsItemAddDiscountType);
          }

          const suggestedDiscountsWithGifts = _suggestedDiscounts.filter(
            (p) => p.gifts && p.gifts?.length !== 0,
          );

          resolve(suggestedDiscountsWithGifts);
        } else {
          reject();
        }
      });

    const checkGiftTypeOrderOfOrderSplit = () => {
      return (
        props.isPageOrderUpdate &&
        orderCorrelativeVariant &&
        orderCorrelativeVariant.split &&
        orderCorrelativeVariant.items.some((item) => item.type === EnumGiftType.BY_ORDER)
      );
    };

    (async () => {
      try {
        const _itemsCollection = getItemsCollection();

        const giftType = _itemsCollection.find((p) => isGiftLineItem(p.type))?.type;

        if (!checkAllLineItemNoGift(_items)) {
          setLineItemUpdate(_items);
          setGiftProgramForAllOrdersOrProduct(null);
          return;
        }

        if (
          giftType === EnumGiftType.BY_ITEM &&
          !_items.some((p) => p.gifts && p.gifts.length !== 0)
        ) {
          setLineItemUpdate(_items);
          return;
        }

        if (checkGiftTypeOrderOfOrderSplit()) {
          await handleCheckGiftTypeOrderUpdate(_itemsCollection);
        } else if (giftType === EnumGiftType.BY_ITEM && _indexItem !== undefined) {
          await handleGiftUpdateFromIndex(_itemsCollection, _indexItem);
        } else {
          await handleGiftAllUpdate(_itemsCollection);
        }
      } catch (e) {
        console.log(e);
      }
    })();
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

      // handUpdateDiscountWhenChangingOrderInformation(_items, index);
      handUpdateGiftWhenChangingOrderInformation(
        _items,
        (_nextItems) => {
          handUpdateDiscountWhenChangingOrderInformation(_nextItems, index);
        },
        index,
      );
      if (_item.discount_items && _item.discount_items[0]) {
        handleApplyDiscountItemCallback && handleApplyDiscountItemCallback(_item);
      }
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
          handUpdateGiftWhenChangingOrderInformation(
            _items,
            (_nextItems) => {
              handUpdateDiscountWhenChangingOrderInformation(_nextItems, index);
            },
            index,
          );
        }
      } else {
        _items[index].price = 0;
        _items[index].discount_items = [];
        _items[index].discount_amount = 0;
        _items[index].discount_value = 0;
        _items[index].discount_rate = 0;
        handUpdateGiftWhenChangingOrderInformation(
          _items,
          (_nextItems) => {
            handUpdateDiscountWhenChangingOrderInformation(_nextItems, index);
          },
          index,
        );
        // handUpdateDiscountWhenChangingOrderInformation(_items, index);
      }
    }
  };

  const checkIfLineItemHasAutomaticDiscount = (lineItem: OrderLineItemRequest) => {
    return lineItem.discount_items.some(
      (discount) => discount.promotion_id && discount?.amount > 0,
    );
  };

  const ProductColumn = {
    title: () => <div className="columnHeading__product">Sản phẩm</div>,
    width: "34%",
    className: "yody-pos-name 2",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div className="w-100 columnBody__product">
          <div className="d-flex align-items-center">
            <div className="columnBody__product-inner">
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
          <div className="columnBody__product-gift">
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
                <div key={index1} className="yody-pos-addition yody-pos-gift 3">
                  <div>
                    <img src={giftIcon} alt="" />
                    <i>
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
          {l.discount_items[0] &&
            (l.discount_items[0].promotion_title || l.discount_items[0].reason) && (
              <div className="discount-item">
                {" "}
                <img src={discountCouponSuccess} alt="" width={12} />{" "}
                {l.discount_items[0]?.promotion_title || l.discount_items[0]?.reason}
              </div>
            )}
        </div>
      );
    },
  };
  const checkIfOtherLineItemIsChanged = () => {
    if (isLineItemChanging) {
      return true;
    }
    return false;
  };

  const isDisableAddGiftLineItem = () => {
    if (
      props.isPageOrderUpdate &&
      orderCorrelativeVariant &&
      orderCorrelativeVariant.split &&
      orderCorrelativeVariant.items.some((p) => p.type === EnumGiftType.BY_ORDER)
    ) {
      return true;
    }
    if (giftProgramForAllOrdersOrProduct === EnumGiftType.BY_ORDER) return true;

    return false;
  };

  const AmountColumn = {
    title: () => (
      <div className="columnHeading__amount">
        Số lượng
        {items && getTotalQuantity(items) > 0 && (
          <span className="columnHeading__amount-quantity">
            ({formatCurrency(getTotalQuantity(items))})
          </span>
        )}
      </div>
    ),
    className: "yody-pos-quantity text-center",
    width: "9%",
    align: "right",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div className="yody-pos-qtt columnBody__amount">
          <NumberInput
            className="columnBody__amount-input"
            format={(a: string) => {
              if (a && a !== "0") {
                return formatCurrency(a);
              } else {
                return formatCurrency(1);
              }
            }}
            replace={(a: string) => replaceFormatString(a)}
            value={l.quantity}
            onBlur={() => {
              if (isQuantityIsSame) {
                setIsLineItemChanging(true);
              } else {
                setIsLineItemChanging(false);
              }
            }}
            onChange={(value) => {
              if (!items) {
                return;
              }
              if (isQuantityIsSame && value === l.quantity) {
                isQuantityIsSame = false;
              } else {
                isQuantityIsSame = true;
              }
              onChangeQuantity(value, index);
            }}
            min={1}
            maxLength={4}
            minLength={0}
            disabled={levelOrder > 3 || isLoadingDiscount || checkIfOtherLineItemIsChanged()}
            isChangeAfterBlur={false}
          />
        </div>
      );
    },
  };

  const inventoryColumn = {
    title: () => <div className="columnHeading__inventory">Tồn</div>,
    className: "yody-pos-quantity text-center",
    width: "8%",
    align: "center",
    render: (a: OrderLineItemRequest, item: any, index: number) => {
      let inventory = a.available ? a.available : 0;
      return (
        <div
          className="columnBody__inventory"
          style={inventory > 0 ? { color: "#008000" } : { color: "#e24343" }}
        >
          {a.available ? a.available : 0}
        </div>
      );
    },
  };

  const PriceColumn = {
    title: () => (
      <div className="columnHeading__price">
        <span className="columnHeading__price-title">Đơn giá</span>
        <span className="columnHeading__price-unit unit">₫</span>
      </div>
    ),
    className: "yody-pos-price text-right",
    width: "15%",
    align: "center",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div ref={lineItemPriceInputTimeoutRef} className="columnBody__price">
          <NumberInput
            className="columnBody__price-input"
            format={(a: string) => formatCurrency(a)}
            replace={(a: string) => replaceFormatString(a)}
            placeholder="VD: 100,000"
            maxLength={14}
            minLength={0}
            value={l.price}
            onBlur={() => {
              //setIsLineItemChanging(true);
            }}
            onChange={(value) => {
              onChangePrice(value, index);
            }}
            // disabled={levelOrder > 3 || isAutomaticDiscount}
            disabled={
              levelOrder > 3 ||
              checkIfLineItemHasAutomaticDiscount(l) ||
              promotion !== null ||
              (userReducer?.account?.role_id !== ACCOUNT_ROLE_ID.admin &&
                props.orderType === EnumOrderType.b2c) ||
              isLoadingDiscount ||
              checkIfOtherLineItemIsChanged()
            }
          />
        </div>
      );
    },
  };

  const DiscountColumn = {
    title: () => (
      <div className="text-center columnHeading__discount">
        <div>Khuyến mại</div>
      </div>
    ),
    align: "center",
    width: "20%",
    className: "yody-table-discount text-right",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      const isDiscountOrder = promotion && promotion?.promotion_id ? true : false;
      // lúc trước để tiền sản phẩm đổi có số tiền lớn hơn trả mới cho
      // nhưng giờ để hết, kể cả ít tiền hơn
      // const initItemSuggestDiscountResult = initItemSuggestDiscounts?.filter((single) => {
      //   return single.price * single.quantity <= l.quantity * l.price;
      // });

      const initItemSuggestDiscountResult = initItemSuggestDiscounts;

      return !isCustomOriginalHandmadeDiscount ? (
        <div className="site-input-group-wrapper saleorder-input-group-wrapper discountGroup columnBody__discount">
          <DiscountItemSearch
            index={index}
            discountRate={l.discount_items[0]?.rate ? l.discount_items[0]?.rate : 0}
            discountAmount={l.discount_items[0]?.amount ? l.discount_items[0]?.amount : 0}
            discountType={
              l.discount_items[0]?.type ? l.discount_items[0]?.type : DISCOUNT_TYPE.MONEY
            }
            item={l}
            disabled={
              props.orderType === EnumOrderType.b2b ||
              levelOrder > 3 ||
              isLoadingDiscount ||
              isLineItemChanging ||
              isDiscountOrder
            }
            param={{
              order_id: orderDetail?.id,
              customer_id: customer?.id,
              order_source_id: form.getFieldValue("source_id"),
              store_id: form.getFieldValue("store_id"),
              sales_channel_name: props.orderChannel || ADMIN_ORDER.channel_name,
              assignee_code: customer?.responsible_staff_code || undefined,
            }}
            handleApplyDiscountItem={(_item) => {
              if (!items) return;
              let _items = [...items];
              _items[index] = _item;
              calculateChangeMoney(_items);
              handleApplyDiscountItemCallback && handleApplyDiscountItemCallback(_item);
            }}
            initItemSuggestDiscounts={initItemSuggestDiscountResult || []}
            isCreateReturn={isCreateReturn}
          />
        </div>
      ) : (
        <div className="site-input-group-wrapper saleorder-input-group-wrapper discountGroup columnBody__discount 555">
          <DiscountGroup
            price={l.price}
            index={index}
            discountRate={l.discount_items[0]?.rate ? l.discount_items[0]?.rate : 0}
            discountAmount={l.discount_items[0]?.amount ? l.discount_items[0]?.amount : 0}
            discountType={
              l.discount_items[0]?.type ? l.discount_items[0]?.type : DISCOUNT_TYPE.MONEY
            }
            items={items}
            handleCardItems={(_items) => {
              if (_items[index].discount_items && _items[index].discount_items[0]) {
                _items[index].discount_items[0].promotion_id = undefined;
                _items[index].discount_items[0].promotion_title = "";
                _items[index].discount_items[0].reason = "";
              }
              handleDelayCalculateWhenChangeOrderInput(
                lineItemDiscountInputTimeoutRef,
                _items,
                false,
              );
            }}
            // disabled={levelOrder > 3 || isAutomaticDiscount || couponInputText !== ""}
            disabled={
              levelOrder > 3 ||
              // ||
              // checkIfLineItemHasAutomaticDiscount(l) ||
              // couponInputText !== "" ||
              // checkIfOrderHasAutomaticDiscount()
              isLoadingDiscount ||
              isLineItemChanging
            }
            onBlur={() => {
              setIsLineItemChanging(true);
            }}
            handleApplyDiscountItem={(_item) => {
              if (!items) return;
              let _items = [...items];
              _items[index] = _item;
              calculateChangeMoney(_items);
              handleApplyDiscountItemCallback && handleApplyDiscountItemCallback(_item);
            }}
            initItemSuggestDiscounts={initItemSuggestDiscountResult || []}
            //isShowSuggestDiscount={isWebAppOrder}
          />
        </div>
      );
    },
  };

  const TotalPriceColumn = {
    title: () => (
      <div className="text-center columnHeading__total">
        <span className="columnHeading__total-title">Tổng tiền</span>
        <span className="columnHeading__total-unit unit">₫</span>
      </div>
    ),
    align: "center",
    className: "yody-table-total-money text-right",
    width: "12%",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div className="yody-pos-varian-name columnBody__total">
          {formatCurrency(l.line_amount_after_line_discount)}
        </div>
      );
    },
  };

  const ActionColumn = {
    title: () => (
      <div className="text-center columnHeading__actions">
        <div>Thao tác</div>
      </div>
    ),
    width: "10%",
    className: "saleorder-product-card-action ",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      const priceRuleId =
        l.gifts && l.gifts.length !== 0
          ? l.gifts[0].discount_items && l.gifts[0].discount_items.length !== 0
            ? l.gifts[0].discount_items[0].promotion_id || null
            : null
          : null;
      const menu = (
        <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
          <StyledComponent>
            <Menu.Item key="1">
              <AddGiftLineItem
                priceRuleId={priceRuleId}
                giftProgramForAllOrdersOrProduct={giftProgramForAllOrdersOrProduct}
                selectedItem={l}
                itemsGift={l.gifts}
                onOk={(
                  _v: OrderLineItemRequest[],
                  _giftProgramForAllOrdersOrProduct: string | null,
                ) => {
                  onOkConfirm(index, _v, _giftProgramForAllOrdersOrProduct);
                }}
                param={{
                  order_id: null,
                  customer_id: customer?.id || null,
                  order_source_id: form.getFieldValue("source_id"),
                  store_id: form.getFieldValue("store_id"),
                  sales_channel_name: props.orderChannel || ADMIN_ORDER.channel_name,
                  type: "GIFT",
                  line_items:
                    items?.map((_item) => ({
                      original_unit_price: _item.price,
                      product_id: _item.product_id,
                      quantity: _item.quantity,
                      sku: _item.sku,
                      variant_id: _item.variant_id,
                    })) || [],
                }}
                disabled={isDisableAddGiftLineItem() && !priceRuleId}
              />
            </Menu.Item>
            {priceRuleId && (
              <Menu.Item key="2">
                <Button
                  type="text"
                  onClick={() => {
                    removeDiscountGiftFromLineItem(index);
                  }}
                  className="columnBody__actions-button"
                >
                  Xóa quà tặng
                </Button>
              </Menu.Item>
            )}

            <Menu.Item key="3">
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
                className="columnBody__actions-button"
              >
                Thêm ghi chú
              </Button>
            </Menu.Item>
          </StyledComponent>
        </Menu>
      );
      return (
        <div className="columnBody__actions">
          <div>
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              placement="bottomRight"
              disabled={levelOrder > 3}
            >
              <Button type="text" className="p-0 ant-btn-custom columnBody__actions-buttonDropdown">
                <img src={arrowDownIcon} alt="" />
              </Button>
            </Dropdown>
            <Button
              type="text"
              className="p-0 ant-btn-custom columnBody__actions-buttonClose"
              onClick={() => onDeleteItem(index)}
              disabled={levelOrder > 3 || !isFinishedCalculateItem}
            >
              <img src={XCloseBtn} alt="" />
            </Button>
          </div>
        </div>
      );
    },
  };

  const columns = [
    ProductColumn,
    AmountColumn,
    inventoryColumn,
    PriceColumn,
    DiscountColumn,
    TotalPriceColumn,
    ActionColumn,
  ];

  const autoCompleteRef = createRef<RefSelectProps>();
  const createItem = (
    variant: VariantResponse,
    isWholesale?: boolean, // bán buôn
  ) => {
    let price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
    if (isWholesale) {
      price = findWholesalePriceInVariant(variant.variant_prices, AppConfig.currency); //lấy giá bán buôn
    }
    const taxRate = findTaxInVariant(variant.variant_prices, AppConfig.currency);
    const avatar = findAvatar(variant.variant_images);
    const orderLine: OrderLineItemRequest = {
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

  // const removeAutomaticDiscountItem = (item: OrderLineItemRequest) => {
  //   if (item.discount_items) {
  //     for (let i = 0; i < item.discount_items.length; i++) {
  //       if (
  //         item.discount_items[i].promotion_id &&
  //         !item.isLineItemSemiAutomatic &&
  //         !item.isLineItemHasSpecialDiscountInReturn
  //       ) {
  //         item.discount_items.splice(i, 1);
  //       }
  //     }
  //   }
  // };

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
    if (_items.length === 0) {
      calculateChangeMoney(_items, null);
    }

    console.log("orderDetail?.special_order?.type", orderDetail?.special_order?.type);
    if (
      orderDetail?.special_order?.type !== "orders_split" &&
      props.isPageOrderUpdate &&
      orderCorrelativeVariant &&
      checkOrderGiftWithSplitOrder(orderCorrelativeVariant, _items)
    ) {
      handUpdateDiscountWhenChangingOrderInformation(_items, -1);
    } else {
      handUpdateGiftWhenChangingOrderInformation(
        _items,
        (_nextItems) => {
          handUpdateDiscountWhenChangingOrderInformation(_nextItems, -1);
        },
        -1,
      );
    }
    // else {
    //   // handUpdateDiscountWhenChangingOrderInformation(_items, -1);
    //   handUpdateChangingOrderInformation(_items, -1);
    // }
  };

  const calculateDiscount = (_item: OrderLineItemRequest, _highestValueSuggestDiscount: any) => {
    let item: OrderLineItemRequest = { ..._item };
    let highestValueSuggestDiscount = { ..._highestValueSuggestDiscount };
    let result: OrderLineItemRequest[] = [];
    let value: number = 0;
    if (!highestValueSuggestDiscount) {
      return [];
    }
    if (highestValueSuggestDiscount.value_type === DiscountUnitType.FIXED_AMOUNT.value) {
      value = highestValueSuggestDiscount.value ? highestValueSuggestDiscount.value : 0;
    } else if (highestValueSuggestDiscount.value_type === DiscountUnitType.PERCENTAGE.value) {
      value = highestValueSuggestDiscount.value
        ? item.price * (highestValueSuggestDiscount.value / 100)
        : 0;
    } else if (highestValueSuggestDiscount.value_type === DiscountUnitType.FIXED_PRICE.value) {
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
    itemResult.isLineItemHasSpecialDiscountInReturn = false;
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
      item.discount_items = [];
      return [item];
    }
    const suggest = suggested_discounts[0];
    if (suggest.allocation_count === 0 || !suggest.allocation_count) {
      item.discount_items = [];
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

  const deleteAllGiftsInDiscount = (_v: ApplyCouponResponseModel) => {
    const discountLineItems = _v.line_items.map((p) => ({
      ...p,
      suggested_discounts: p.suggested_discounts.filter(
        (x) => !x.gifts || (x.gifts && x.gifts?.length === 0),
      ),
    }));

    const discountOrder = _v.suggested_discounts.filter(
      (x) => !x.gifts || (x.gifts && x.gifts?.length === 0),
    );

    _v.line_items = discountLineItems;
    _v.suggested_discounts = discountOrder;
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
      sales_channel_name: props.orderChannel || ADMIN_ORDER.channel_name,
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
          deleteAllGiftsInDiscount(response.data); // xóa gift
          const itemClone = [...items];
          const newItem = itemClone.map((single) => {
            single.discount_items = [];
            return getLineItemCalculationMoney(single);
          });

          if (response.data.line_items.length > 0) {
            if (
              isOrderHasDiscountLineItems(response.data) &&
              isOrderHasDiscountOrder(response.data)
            ) {
              let totalDiscountLineItems = getTotalDiscountLineItems(response.data);
              let totalDiscountOrder = getTotalDiscountOrder(response.data, newItem);
              if (totalDiscountLineItems >= totalDiscountOrder) {
                let result = getApplyDiscountLineItem(response, newItem);
                calculateChangeMoney(result, null);
              } else {
                // let itemsAfterRemove = items.map((single) => {
                //   single.discount_items = [];
                //   return single;
                // });
                let promotionResult = handleApplyDiscountOrder(response, newItem);
                if (promotionResult) {
                  setPromotionTitle(promotionResult.reason || "");
                }
                calculateChangeMoney(newItem, promotionResult);
              }
            } else if (isOrderHasDiscountLineItems(response.data)) {
              let result = getApplyDiscountLineItem(response, newItem);
              calculateChangeMoney(result, null);
            } else if (isOrderHasDiscountOrder(response.data)) {
              let promotionResult = handleApplyDiscountOrder(response, newItem);
              if (promotionResult) {
                setPromotionTitle(promotionResult.reason || "");
              }
              calculateChangeMoney(items, promotionResult);
            } else {
              calculateChangeMoney(newItem, null);
              if (isShouldUpdatePrivateNote) {
                // form.setFieldsValue({
                //   note: ``,
                // });
              }
              setPromotionTitle("");
            }
          } else {
            setPromotionTitle("");
            setPromotion && setPromotion(null);
            // showError("Có lỗi khi áp dụng chiết khấu!");
            calculateChangeMoney(items);
          }
        } else {
          calculateChangeMoney(items);
          handleFetchApiError(response, "Áp dụng chiết khấu", dispatch);
        }
      })
      .catch((error) => {
        showError("Cập nhật chiết khấu tự động thất bại!");
      })
      .finally(() => {
        setIsLoadingDiscount(false);
        dispatch(changeIsLoadingDiscountAction(false));
      });
  };

  const updateLineItemInformation = useCallback(
    (_variant: VariantResponse) => {
      const selectProduct = () => {
        if (!items) {
          return;
        }

        let _items = [...items];
        let index = _items.findIndex((i) => i.variant_id === _variant.id);
        const item: OrderLineItemRequest = createItem(_variant);
        item.position = getPositionLineItem(items);

        if (checkInventory(item, orderConfig?.sellable_inventory) === true) {
          if (splitLine || index === -1) {
            _items.unshift(item);
            if (!isAutomaticDiscount) {
              // calculateChangeMoney(_items);
              handUpdateGiftWhenChangingOrderInformation(_items, calculateChangeMoney, 0);
            }
          } else {
            let variantItems = _items.filter((item) => item.variant_id === _variant.id);
            let firstIndex = 0;
            let selectedItem = variantItems[firstIndex];
            selectedItem.quantity += 1;
            selectedItem.line_amount_after_line_discount +=
              selectedItem.price - selectedItem.discount_items[0]?.amount * selectedItem.quantity;
            selectedItem.discount_items.forEach((single) => {
              single.amount = single.value * selectedItem.quantity;
            });
            if (!isAutomaticDiscount) {
              //calculateChangeMoney(_items);
              handUpdateGiftWhenChangingOrderInformation(_items, calculateChangeMoney, index);
            }
          }
        }

        const isLineItemSemiAutomatic = _items.some((p) => p.isLineItemSemiAutomatic); // xác định là ck line item thủ công
        const isOrderSemiAutomatic = promotion?.isOrderSemiAutomatic; //xác định là ck đơn hàng thủ công
        const _index = _items.findIndex((p) => p.sku === item.sku);
        if (isLineItemSemiAutomatic) {
          if (
            props.isPageOrderUpdate &&
            !splitLine &&
            items.some((p) => p.sku === item.sku && p?.discount_items[0])
          ) {
            _items[index].discount_items[0] &&
              handUpdateGiftWhenChangingOrderInformation(
                _items,
                (_nextItems) => {
                  handUpdateDiscountWhenChangingOrderInformation(_nextItems, _index);
                },
                _index,
              );
          } else if (!props.isPageOrderUpdate) {
            handUpdateGiftWhenChangingOrderInformation(
              _items,
              (_nextItems) => {
                handUpdateDiscountWhenChangingOrderInformation(_nextItems);
              },
              _index,
            );
          }
        } else if (isOrderSemiAutomatic) {
          handUpdateGiftWhenChangingOrderInformation(
            _items,
            (_nextItems) => {
              handUpdateDiscountWhenChangingOrderInformation(_nextItems);
            },
            _index,
          );
        } else if (isAutomaticDiscount) {
          handUpdateGiftWhenChangingOrderInformation(_items, handleApplyDiscount, _index);
          // handleApplyDiscount(_items);
        }

        // setIsInputSearchProductFocus(false);
        // onClearVariantSearch();
      };
      handleDelayActionWhenInsertTextInSearchInput(autoCompleteRef, () => selectProduct());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      items,
      promotion,
      isAutomaticDiscount,
      splitLine,
      handleApplyDiscount,
      orderConfig?.sellable_inventory,
    ],
  );

  const addBagLineItem = useCallback(
    (_lineItem: OrderLineItemRequest) => {
      if (!items) {
        return;
      }
      let _items = [...items];
      let index = _items.findIndex((i) => i.variant_id === _lineItem.variant_id);
      if (index === -1) {
        _items.unshift(_lineItem);
        calculateChangeMoney(_items);
      } else {
        let variantItems = _items[index];
        variantItems.quantity += 1;
        variantItems.line_amount_after_line_discount +=
          variantItems.price - variantItems.discount_items[0]?.amount * variantItems.quantity;
        variantItems.discount_items.forEach((single) => {
          single.amount = single.value * variantItems.quantity;
        });
        calculateChangeMoney(_items);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  );

  /**
   * kiểm tra Sản phẩm thêm ăn theo cấu hình cài đặt của tồn kho bán
   */
  const checkInventory = (item: OrderLineItemRequest, sellablInventory?: boolean) => {
    if (!item) return true;

    let available = item.available === null ? 0 : item.available;

    if (available <= 0 && sellablInventory !== true) {
      showError(`Không thể bán sản phẩm đã hết hàng trong kho`);
      return false;
    }

    return true;
  };

  // const onChangeProductSearch = useCallback(
  //   async (value: string) => {
  //     setIsInputSearchProductFocus(true);
  //     setKeySearchVariant(value);

  //     if (!isShowProductSearch || !isInputSearchProductFocus) {
  //       return;
  //     }
  //     if (orderConfig?.allow_choose_item && value) {
  //       await form?.validateFields(["store_id"]).catch(() => {
  //         return;
  //       });
  //     }

  //     initQueryVariant.info = value;
  //     initQueryVariant.store_ids = form?.getFieldValue(["store_id"]);
  //     if (value.length >= 3) {
  //       setSearchProducts(true);
  //     } else {
  //       setSearchProducts(false);
  //     }
  //     const handleSearchProduct = () => {
  //       if (isBarcode === false) {
  //         if (value.trim()) {
  //           (async () => {
  //             try {
  //               await dispatch(
  //                 searchVariantsOrderRequestAction(
  //                   initQueryVariant,
  //                   (data) => {
  //                     setResultSearchVariant(data);
  //                     setSearchProducts(false);
  //                     setIsShowProductSearch(true);
  //                     if (data.items.length === 0) {
  //                       showError("Không tìm thấy sản phẩm!");
  //                     }
  //                   },
  //                   () => {
  //                     setSearchProducts(false);
  //                   },
  //                 ),
  //               );
  //             } catch {
  //               setSearchProducts(false);
  //             }
  //           })();
  //         } else {
  //           setSearchProducts(false);
  //         }
  //       } else {
  //         onClearVariantSearch();
  //         setSearchProducts(false);
  //       }
  //     };
  //     handleDelayActionWhenInsertTextInSearchInput(autoCompleteRef, () => handleSearchProduct());
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [form],
  // );

  const showInventoryModal = useCallback(() => {
    if (items !== null && items?.length) setInventoryModalVisible(true);
    else showWarning("Vui lòng chọn sản phẩm vào đơn hàng!");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, items]);

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
        _rate = (_value / orderProductsAmount) * 100;
      } else if (type === DISCOUNT_TYPE.PERCENT) {
        _rate = discountOrder?.value ?? 0;
        if (_rate >= 100) {
          _rate = 100;
        }
        _value = (_rate * orderProductsAmount) / 100;
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
        isOrderHasSpecialDiscountInReturn: true,
        sub_type: discountOrder?.value_type || "",
      };

      if (items) {
        calculateChangeMoney(items, _promotion);
      }
      showSuccess("Thêm chiết khấu thành công!");
      setCoupon && setCoupon("");
    }
    setVisiblePickDiscount(false);
  };

  const fillCustomNote = (items: OrderLineItemRequest[]) => {
    if (
      items.some((item) => {
        return item?.discount_items && item?.discount_items[0] && item?.discount_items[0]?.reason;
      })
    ) {
      let discountTitleArr: string[] = [];
      let promotion: OrderDiscountRequest[] = [];
      items.forEach((item) => {
        let reason =
          item?.discount_items && item?.discount_items[0] && item?.discount_items[0]?.reason;
        if (reason) {
          promotion.push(item.discount_items[0]);
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
            title = title + discountTitleArr[i];
          }
        }
        if (isShouldUpdatePrivateNote) {
          // form.setFieldsValue({
          //   note: `(${title})`,
          // });
        }
        setPromotionTitle(title);
      }
    }
  };

  /**
   * Cập nhật thông tin sản phẩm, chiết khấu. khi có sự thay đổi về discount line item hoặc discount order
   * @param _items
   * @param _promotion
   */
  const calculateChangeMoney = (
    _items: Array<OrderLineItemRequest>,
    _promotion?: OrderDiscountRequest | null,
  ) => {
    if (_promotion === undefined) {
      if (promotion) {
        let _value = promotion?.value || 0;
        let _rate = promotion?.rate || 0;
        let totalOrderAmount = totalAmount(_items);
        if (promotion.type === DISCOUNT_TYPE.MONEY) {
          _value = promotion?.value || 0;
          if (_value > totalOrderAmount) {
            _value = totalOrderAmount;
          }
          _rate = (_value / totalOrderAmount) * 100;
        } else if (promotion.type === DISCOUNT_TYPE.PERCENT) {
          _rate = promotion?.rate || 0;
          if (_rate > 100) {
            _rate = 100;
          }
          _value = (_rate * totalOrderAmount) / 100;
        }

        _promotion = {
          order_id: promotion.order_id,
          source: promotion.source,
          promotion_id: promotion.promotion_id,
          promotion_title: promotion.promotion_title,
          type: promotion.type,
          amount: _value,
          discount_code: promotion.discount_code,
          taxable: promotion.taxable,
          rate: _rate,
          reason: promotion.promotion_title,
          value: _value,
          isOrderSemiAutomatic: promotion.isOrderSemiAutomatic,
          sub_type: promotion.sub_type,
        };
        // if (promotion?.discount_code && promotion.value) {
        //   let _rate = (promotion.value / totalOrderAmount) * 100;
        //   _promotion.rate = _rate;
        // }
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
    const shippingAddress = orderCustomer ? getCustomerShippingAddress(orderCustomer) : null;
    if (
      _items.length > 0 &&
      shipmentMethod !== ShipmentMethodOption.PICK_AT_STORE &&
      !(checkIfECommerceByOrderChannelCode(orderDetail?.channel_code) && props.isPageOrderUpdate) &&
      !isPageOrderDetail
    ) {
      const orderProductsAmount = totalAmount(_items);
      props.orderType !== EnumOrderType.b2b &&
        handleChangeShippingFeeApplyOrderSettings({
          orderProductsAmount: orderProductsAmount,
          customerShippingAddressCityId: shippingAddress?.city_id,
        });
    }
    setIsLineItemChanging(false);
    setIsFinishedCalculateItem(true);
  };

  const storeIdLogin = useGetStoreIdFromLocalStorage();

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];
    let storesCopy: Array<StoreResponse> = _.cloneDeep(stores);

    if (props.orderType !== EnumOrderType.b2b) {
      //loại bỏ kho Kho dự trữ, Kho phân phối
      storesCopy = stores.filter(
        (store) =>
          store.type.toLowerCase() === STORE_TYPE.STORE.toLowerCase() ||
          store.type.toLowerCase() === STORE_TYPE.WARE_HOUSE.toLowerCase(),
      );

      // đối với đổi trả offline
      // chỉ tạo với kho cửa hàng
      if (isReturnOffline) {
        storesCopy = stores.filter(
          (store) => store.type.toLowerCase() === STORE_TYPE.STORE.toLowerCase(),
        );
      }
    }

    if (storesCopy && storesCopy.length) {
      if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
        newData = storesCopy.filter((store) =>
          haveAccess(store.id, userReducer.account ? userReducer.account.account_stores : []),
        );
      } else {
        newData = storesCopy;
      }

      // trường hợp sửa đơn hàng mà account ko có quyền với cửa hàng đã chọn, thì vẫn hiển thị
      if (storeId && userReducer.account) {
        if (newData.map((single) => single.id).indexOf(storeId) === -1) {
          let initStore = stores.find((single) => single.id === storeId);
          if (initStore) {
            newData.push(initStore);
          }
        }
      }
    }

    // set giá trị mặc định của cửa hàng là cửa hàng có thể truy cập đầu tiên, nếu đã có ở local storage thì ưu tiên lấy, nếu chưa chọn cửa hàng (update đơn hàng không set cửa hàng đầu tiên)
    if (newData && newData[0]?.id && !storeId) {
      if (storeIdLogin && isCreateReturn) {
        setStoreId(storeIdLogin);
      } else if (!isCreateReturn) {
        setStoreId(hubOnlineStoreId);
      }
    }
    return newData;
  }, [
    stores,
    isReturnOffline,
    userReducer.account,
    storeId,
    storeIdLogin,
    isCreateReturn,
    setStoreId,
    props.orderType,
  ]);

  const lineItemsUseInventory = useMemo(() => {
    if (!items) return [];
    const _variant = _.cloneDeep(items);
    const _variantGifts = items.map((p) => p.gifts);
    const _variantGiftsIdConvertArray = flattenArray(_variantGifts);
    const _variants: Array<OrderLineItemRequest> = [..._variant, ..._variantGiftsIdConvertArray];
    return _variants;
  }, [items]);

  const onOkConfirm = useCallback(
    (
      indexItem: number,
      v: Array<OrderLineItemRequest>,
      _giftProgramForAllOrdersOrProduct: string | null,
    ) => {
      if (!items) {
        return;
      }
      let _items = _.cloneDeep(items);
      let _itemGifts = v.map((p) => ({
        ...p,
        position: _items[indexItem].position,
      }));

      _items[indexItem].gifts = _itemGifts;

      console.log("onOkConfirm 1", v);
      console.log("onOkConfirm _items", _items);

      setItems(_items);
      setGiftProgramForAllOrdersOrProduct(_giftProgramForAllOrdersOrProduct);
    },
    [items, setItems],
  );

  const removeDiscountGiftFromLineItem = useCallback(
    (indexItem: number) => {
      if (!items) {
        return;
      }
      let _items = _.cloneDeep(items);

      _items[indexItem].gifts = [];

      setItems(_items);

      const giftNotExists = () => {
        const allProductsWithGifts = _items?.filter((p) => p.gifts && p.gifts.length !== 0) || [];

        if (
          giftProgramForAllOrdersOrProduct === EnumGiftType.BY_ITEM &&
          allProductsWithGifts?.length === 0
        )
          return true;

        if (giftProgramForAllOrdersOrProduct === EnumGiftType.BY_ORDER) return true;
        return false;
      };

      const giftOrderSplitNotExist = () => {
        return orderCorrelativeVariant?.split && orderCorrelativeVariant?.items.length !== 0
          ? !orderCorrelativeVariant?.items.some((item) => isGiftLineItem(item.type))
          : true;
      };

      console.log("giftOrderSplitExist", giftOrderSplitNotExist());
      if (giftNotExists() && giftOrderSplitNotExist()) {
        setGiftProgramForAllOrdersOrProduct(null);
      }
    },
    [giftProgramForAllOrdersOrProduct, items, setItems, orderCorrelativeVariant],
  );

  // const removeCoupon = () => {
  //   if (promotion?.promotion_id || promotion?.discount_code) {
  //     setPromotion && setPromotion(null);
  //   }
  //   if (couponInputText) {
  //     setCoupon && setCoupon("");
  //     setCouponInputText("");
  //   }
  // };

  /**
   * xóa chiết khấu tự dộng trên từng line item hoặc order
   * @returns
   */
  const handleRemoveAllAutomaticDiscount = async () => {
    if (!items || items.length === 0) {
      return;
    }
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

    let _promotion: OrderDiscountRequest | null = { ...promotion };
    if (promotion?.isOrderSemiAutomatic !== true) {
      _promotion = null;
    }
    setPromotionTitle("");
    calculateChangeMoney(_items, _promotion);
  };

  const onClearVariantSearch = () => {
    setKeySearchVariant("");
  };

  const onChangeStore = useCallback(
    (value: number) => {
      setStoreId(value);
      onClearVariantSearch();
      if (items && inventoryResponse) {
        let inventoryInStore = inventoryResponse?.find((p) => p.store_id === value);
        let itemCopy = [...items].map((item) => {
          const itemInStore = inventoryInStore?.variant_inventories.find(
            (i: any) => i.variant_id === item.variant_id,
          );
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

    let lineItems = [];
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
        deleteAllGiftsInDiscount(response.data); // xóa gift
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
            if (
              !_item.isLineItemHasSpecialDiscountInReturn &&
              !isDiscount(suggestedDiscounts, applyDiscount, promotionId)
            ) {
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
          deleteAllGiftsInDiscount(response.data); // xóa gift
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
          check ? calculateChangeMoney(_itemsRequest) : calculateChangeMoney(_itemsRequest, null);
        } else {
          handleFetchApiError(response, "apply chiết khấu", dispatch);
        }
      })
      .catch(() => {})
      .finally(() => {});
  };

  useEffect(() => {
    dispatch(StoreSearchListAction("", setStoreArrayResponse));
  }, [dispatch]);

  useEffect(() => {
    if (items) {
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

  /**
   * gọi lại api chiết khấu tự động khi update cửa hàng, khách hàng, nguồn, số lượng item
   */
  useEffect(() => {
    if (isShouldUpdateDiscountRef.current && items && items?.length > 0) {
      let _items = [...items];

      handUpdateGiftWhenChangingOrderInformation(_items, (_nextItems) => {
        const isLineItemSemiAutomatic = _items.some((p) => p.isLineItemSemiAutomatic); // xác định là ck line item thủ công
        const isOrderSemiAutomatic = promotion?.isOrderSemiAutomatic; //xác định là ck đơn hàng thủ công

        if (isLineItemSemiAutomatic || isOrderSemiAutomatic) {
          if (!props.isPageOrderUpdate) {
            handUpdateDiscountWhenChangingOrderInformation(_nextItems);
          } else if (
            !compareProducts(orderDetail?.items || [], items) ||
            orderDetail?.customer_id !== customer?.id
          ) {
            handUpdateDiscountWhenChangingOrderInformation(_nextItems);
          } else {
            setItems(_nextItems);
          }
        } else if (isAutomaticDiscount) {
          handleApplyDiscount(_nextItems);
        } else {
          setItems(_nextItems);
        }
      });
    } else isShouldUpdateDiscountRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, countFinishingUpdateSource, countFinishingUpdateCustomer]);

  useEffect(() => {
    if (props.giftTypeInOrder) {
      setGiftProgramForAllOrdersOrProduct(props.giftTypeInOrder);
    }
  }, [props.giftTypeInOrder]);

  console.log("giftProgramForAllOrdersOrProduct", giftProgramForAllOrdersOrProduct);
  // đợi 3s cho load trang xong thì sẽ update trong trường hợp clone
  useEffect(() => {
    if (!props.isPageOrderUpdate) {
      setTimeout(() => {
        isShouldUpdateCouponRef.current = true;
        isShouldUpdateDiscountRef.current = true;
        // isShouldUpdateOrderTypeRef.current=true;
      }, 3000);
    }
  }, [props.isPageOrderUpdate]);

  useEffect(() => {
    // window.addEventListener("keypress", eventKeyPress);
    // window.addEventListener("keydown", eventKeydown);
    window.addEventListener("keydown", handlePressKeyBoards);
    return () => {
      // window.removeEventListener("keypress", eventKeyPress);
      // window.removeEventListener("keydown", eventKeydown);
      window.removeEventListener("keydown", handlePressKeyBoards);
    };
  }, [handlePressKeyBoards]);

  useEffect(() => {
    if (isCustomOriginalHandmadeDiscount || props.orderType === EnumOrderType.b2b) {
      setIsAutomaticDiscount(false);
      form.setFieldsValue({ automatic_discount: false });
    } else {
      setIsAutomaticDiscount(form.getFieldValue("automatic_discount"));
    }
  }, [form, isCustomOriginalHandmadeDiscount, props.orderType]);

  /**
   * gọi lại mỗi lần thay đổi orderType, xóa toàn bộ sản phẩm
   */
  useEffect(() => {
    if (isShouldUpdateOrderTypeRef.current && items && items.length !== 0) {
      calculateChangeMoney([], null);
    } else {
      isShouldUpdateOrderTypeRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.countFinishingUpdateOrderType]);

  //đóng
  // useEffect(() => {
  //   if (orderDetail && orderDetail?.discounts && orderDetail?.discounts[0]?.discount_code) {
  //     // setCoupon && setCoupon(orderDetail?.discounts[0]?.discount_code)
  //     setCouponInputText(orderDetail?.discounts[0]?.discount_code);
  //   }
  // }, [orderDetail]);

  useEffect(() => {
    if (items && items.length === 0) {
      // if (isShouldUpdatePrivateNote) {
      //   form.setFieldsValue({
      //     note: "",
      //   });
      // }
      setPromotionTitle("");
    }
  }, [form, items, setPromotionTitle]);

  // useEffect(() => {
  //   if (coupon) {
  //     setIsAutomaticDiscount(false);
  //   }
  // }, [coupon]);

  /**
   * xóa chiết khấu đơn hàng, chiết khấu line item,
   * với trường hợp thay đổi loại đơn đặc biệt khác với loại thay thế, có sàn.
   */
  useEffect(() => {
    if (props.isSpecialOrderEcommerce?.isChange === true && items) {
      const newItems = removeAllDiscountLineItems(items);
      calculateChangeMoney(newItems, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isSpecialOrderEcommerce?.isChange]);

  const getInventory = useCallback(() => {
    setLoadingInventory(true);
    const shippingAddress = orderCustomer ? getCustomerShippingAddress(orderCustomer) : null;

    (async () => {
      const body = {
        address: {
          city_id: shippingAddress?.city_id,
        },
        line_item: lineItemsUseInventory.map((p) => {
          return {
            variant_id: p.variant_id,
            quantity: p.quantity,
          };
        }),
      };
      try {
        const inventorySuggest = await getSuggestStoreInventory(body);
        setInventoryResponse(inventorySuggest.data);
        setLoadingInventory(false);
      } catch (error) {}
    })();
  }, [lineItemsUseInventory, orderCustomer]);
  useEffect(() => {
    if (lineItemsUseInventory.length > 0 && levelOrder <= 3 && isInventoryModalVisible) {
      getInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isInventoryModalVisible]);

  return (
    <StyledComponent>
      <Card
        title={returnOrderInformation ? "Thông tin sản phẩm đổi" : "Sản phẩm"}
        extra={
          <Space size={window.innerWidth > 1366 ? 20 : 10}>
            <Checkbox
              onChange={() => setSplitLine(!splitLine)}
              disabled={
                isCreateReturn ? false : levelOrder > 3 || isOrderFinishedOrCancel(orderDetail)
              }
            >
              Tách dòng
            </Checkbox>
            {/* <span>Chính sách giá:</span> */}
            <Form.Item name="price_type" hidden>
              <Select className="priceTypeSelect" placeholder="Chính sách giá">
                <Select.Option value="retail_price" color="#222222">
                  Giá bán lẻ
                </Select.Option>
                <Select.Option value="whole_sale_price">Giá bán buôn</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="automatic_discount" valuePropName="checked">
              <Checkbox
                disabled={
                  props.orderType === EnumOrderType.b2b ||
                  levelOrder > 3 ||
                  isLoadingDiscount ||
                  props.isPageOrderUpdate ||
                  isCustomOriginalHandmadeDiscount
                }
                value={isAutomaticDiscount}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCoupon && setCoupon("");
                    handleApplyDiscount(items, true);
                    setIsAutomaticDiscount(true);
                  } else {
                    handleRemoveAllAutomaticDiscount();
                    setIsAutomaticDiscount(false);
                  }
                }}
              >
                Chiết khấu tự động
              </Checkbox>
            </Form.Item>
            <ImportProductByExcelButton
              title="Nhập File"
              disabled={props.isPageOrderUpdate}
              storeId={storeId}
              items={items}
              orderType={props.orderType}
              handleItems={(items) => {
                if (props.orderType === EnumOrderType.b2b) {
                  let result = items.map((item) => {
                    return {
                      ...item,
                      discount_items: [],
                      discount_value: 0,
                      discount_amount: 0,
                      discount_rate: 0,
                      line_amount_after_line_discount: item.amount,
                    };
                  });
                  calculateChangeMoney(result);
                } else if (!isAutomaticDiscount) {
                  calculateChangeMoney(items);
                } else {
                  let result = items.map((item) => {
                    return {
                      ...item,
                      discount_items: [],
                      discount_value: 0,
                      discount_amount: 0,
                      discount_rate: 0,
                      line_amount_after_line_discount: item.amount,
                    };
                  });
                  if (isAutomaticDiscount && result.length > 0) {
                    handleApplyDiscount(result);
                  }
                  // else if (couponInputText && result.length > 0) {
                  //   handleApplyCouponWhenInsertCoupon(couponInputText, result);
                  // }
                }
              }}
            />
            <Button
              disabled={levelOrder > 3}
              onClick={() => {
                showInventoryModal();
              }}
            >
              Kiểm tra tồn
            </Button>
            <AddBag addBag={(_v) => addBagLineItem(_v)} />
          </Space>
        }
      >
        <Row gutter={15} className="rowSelectStoreAndProducts">
          <Col md={8}>
            <Form.Item
              name="store_id"
              rules={[
                {
                  required: !(isCreateReturn && !isExchange),
                  message: "Vui lòng chọn cửa hàng!",
                },
              ]}
            >
              <CustomSelect
                className="select-with-search"
                showSearch
                allowClear
                style={{ width: "100%" }}
                placeholder="Chọn cửa hàng"
                notFoundContent="Không tìm thấy kết quả"
                onChange={(value?: number) => {
                  if (value) {
                    onChangeStore(value);
                  } else {
                    // setIsShowProductSearch(false);
                  }
                  dispatch(setIsShouldSetDefaultStoreBankAccountAction(true));
                }}
                disabled={levelOrder > 3}
              >
                {dataCanAccess.map((item, index) => (
                  <Select.Option key={index} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </CustomSelect>
            </Form.Item>
          </Col>
          <Col md={16}>
            <Form.Item>
              {/* <AutoComplete
                notFoundContent={
                  keySearchVariant.length >= 3
                    ? searchProducts
                      ? "Đang tải..."
                      : "Không tìm thấy sản phẩm"
                    : undefined
                }
                id="search_product"
                value={keySearchVariant}
                ref={autoCompleteRef}
                onSelect={onSearchVariantSelect}
                dropdownClassName="search-layout dropdown-search-header"
                dropdownMatchSelectWidth={456}
                className="w-100"
                onSearch={onChangeProductSearch}
                //onKeyDown={eventKeydown}
                options={convertResultSearchVariant}
                maxLength={255}
                // open={isShowProductSearch && isInputSearchProductFocus}
                onFocus={onInputSearchProductFocus}
                onBlur={onInputSearchProductBlur}
                disabled={levelOrder > 3 || loadingAutomaticDiscount}
                defaultActiveFirstOption
                dropdownRender={(menu) => <div>{menu}</div>}
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
              </AutoComplete> */}
              <SearchProductComponent
                keySearch={keySearchVariant}
                setKeySearch={setKeySearchVariant}
                id="search_product"
                onSelect={(variant) => {
                  variant && updateLineItemInformation(variant);
                }}
                placeholder="Tìm sản phẩm mã 7... (F3)/ Barcode sản phẩm"
                storeId={storeId}
                defaultActiveFirstOption={true}
              />
            </Form.Item>
          </Col>
        </Row>
        {/* <AddGiftModal
          items={itemGifts}
          onUpdateData={onUpdateData}
          onCancel={onCancelConfirm}
          onOk={onOkConfirm}
          visible={isVisibleGift}
          storeId={storeId}
        /> */}
        <Table
          locale={{
            emptyText: (
              <div className="sale_order_empty_product">Đơn hàng của bạn chưa có sản phẩm nào!</div>
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
                <div className="yody-foot-total-text totalText__title">TỔNG</div>

                <div className="totalText__priceAmount">
                  {formatCurrency(getTotalAmount(items))}
                </div>

                <div className="totalText__discountAmount">
                  {formatCurrency(getTotalDiscount(items))}
                </div>

                <div className="totalText__orderAmount">
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
            totalOrderAmount={totalOrderAmount}
            calculateChangeMoney={calculateChangeMoney}
            promotion={promotion}
            showDiscountModal={() => setVisiblePickDiscount(true)}
            orderProductsAmount={orderProductsAmount}
            items={items}
            shippingFeeInformedToCustomer={shippingFeeInformedToCustomer}
            returnOrderInformation={returnOrderInformation}
            totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
            levelOrder={levelOrder}
            isCustomOriginalHandmadeDiscount={isCustomOriginalHandmadeDiscount}
            orderType={props.orderType}
          />
        )}
        {setPromotion && (
          <React.Fragment>
            <DiscountOrderModalSearch
              isCustomOriginalHandmadeDiscount={isCustomOriginalHandmadeDiscount}
              amount={orderProductsAmount}
              type={promotion?.type ?? ""}
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
                sales_channel_name: props.orderChannel || ADMIN_ORDER.channel_name,
                assignee_code: customer?.responsible_staff_code || undefined,
                line_items: items?.map((_item) => ({
                  original_unit_price: _item.price,
                  product_id: _item.product_id,
                  quantity: _item.quantity,
                  sku: _item.sku,
                  variant_id: _item.variant_id,
                })),
              }}
              initOrderSuggestDiscounts={initOrderSuggestDiscounts || []}
            />
            {/* <PickCouponModal
              couponInputText={couponInputText}
              onCancelCouponModal={() => {
                setIsVisiblePickCoupon(false);
              }}
              onOkCouponModal={onOkCouponConfirm}
              visible={isVisiblePickCoupon}
            /> */}
          </React.Fragment>
        )}
        {isInventoryModalVisible && (
          <SuggestInventoryModal
            visible={isInventoryModalVisible}
            setVisible={setInventoryModalVisible}
            setVisibleOrderSplitModal={levelOrder ? setVisibleOrderSplitModal : undefined}
            storeId={storeId}
            onChangeStore={onChangeStore}
            columnsItem={lineItemsUseInventory}
            inventoryArray={inventoryResponse}
            storeArrayResponse={storeArrayResponse}
            handleCancel={handleInventoryCancel}
            isLoading={isLoadingInventory}
          />
        )}

        {checkIfSplitOrderIsValid(orderDetail) && visibleOrderSplitModal && (
          <OrderSplitModal
            setVisible={setVisibleOrderSplitModal}
            visible={visibleOrderSplitModal}
            OrderDetail={{ ...orderDetail }}
          />
        )}
      </Card>
    </StyledComponent>
  );
}

export default OrderCreateProduct;
