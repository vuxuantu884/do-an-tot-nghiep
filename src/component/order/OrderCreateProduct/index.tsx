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
  Tag,
  Tooltip,
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import giftIcon from "assets/icon/gift.svg";
import XCloseBtn from "assets/icon/X_close.svg";
import arrowDownIcon from "assets/img/drow-down.svg";
import BaseResponse from "base/base.response";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import SearchedVariant from "component/search-product/SearchedVariant";
import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import { StoreSearchListAction } from "domain/actions/core/store.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  changeIsLoadingDiscountAction,
  changeOrderLineItemsAction,
  setIsShouldSetDefaultStoreBankAccountAction,
} from "domain/actions/order/order.action";
import {
  SearchBarCode,
  searchVariantsOrderRequestAction,
} from "domain/actions/product/products.action";
import useGetStoreIdFromLocalStorage from "hook/useGetStoreIdFromLocalStorage";
import _ from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { InventoryResponse } from "model/inventory";
import { ChangeShippingFeeApplyOrderSettingParamModel } from "model/order/order.model";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
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
  ApplyCouponResponseModel,
  SuggestDiscountResponseModel,
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
import DiscountGroup from "screens/order-online/component/discount-group";
import AddGiftModal from "screens/order-online/modal/AddGiftModal/add-gift.modal";
import InventoryModal from "screens/order-online/modal/inventory.modal";
import PickCouponModal from "screens/order-online/modal/pick-coupon.modal";
import PickDiscountModal from "screens/order-online/modal/pick-discount.modal";
import { applyDiscountService } from "service/promotion/discount/discount.service";
import {
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
  isOrderFromPOS,
  replaceFormatString,
} from "utils/AppUtils";
import {
  ACCOUNT_ROLE_ID,
  ADMIN_ORDER,
  DISCOUNT_TYPE,
  POS,
  PRODUCT_TYPE,
  ShipmentMethodOption,
  STORE_TYPE,
} from "utils/Constants";
import { DISCOUNT_VALUE_TYPE } from "utils/Order.constants";
import { checkIfEcommerceByOrderChannelCode } from "utils/OrderUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import ImportProductByExcelButton from "./ImportProductByExcelButton";
import CardProductBottom from "./CardProductBottom";
import { StyledComponent } from "./styles";

type PropTypes = {
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
  orderProductsAmount: number;
  totalOrderAmount: number;
  isPageOrderUpdate?: boolean;
  isPageOrderDetail?: boolean;
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
  countFinishingUpdateCustomer: number; // load xong api chi tiết KH và hạng KH
  shipmentMethod: number;
  isExchange?: boolean;
  stores: StoreResponse[];
  isReturnOffline?: boolean;
  setPromotionTitle: (value: string) => void;
  handleChangeShippingFeeApplyOrderSettings: (
    value: ChangeShippingFeeApplyOrderSettingParamModel,
  ) => void;
};

var barcode = "";
var isBarcode = false;

const initQueryVariant: VariantSearchQuery = {
  limit: 10,
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
    inventoryResponse,
    levelOrder = 0,
    coupon = "",
    orderDetail,
    orderConfig,
    shippingFeeInformedToCustomer,
    returnOrderInformation,
    totalAmountCustomerNeedToPay,
    orderSourceId,
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
    isCreateReturn,
    shipmentMethod,
    stores,
    isExchange,
    isPageOrderDetail,
    isReturnOffline,
    setPromotionTitle,
    handleChangeShippingFeeApplyOrderSettings,
  } = props;

  // console.log('items', items)
  // console.log('promotion', promotion)
  const orderCustomer = useSelector(
    (state: RootReducerType) => state.orderReducer.orderDetail.orderCustomer,
  );
  const dispatch = useDispatch();
  const [loadingAutomaticDiscount] = useState(false);
  const [splitLine, setSplitLine] = useState<boolean>(false);
  const [isDisableOrderDiscount, setIsDisableOrderDiscount] = useState<boolean>(false);
  const [itemGifts, setItemGift] = useState<Array<OrderLineItemRequest>>([]);
  const [keySearchVariant, setKeySearchVariant] = useState("");
  const [resultSearchVariant, setResultSearchVariant] = useState<PageResponse<VariantResponse>>({
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
  const [discountType, setDiscountType] = useState<string>(DISCOUNT_TYPE.MONEY);
  const [isShowProductSearch, setIsShowProductSearch] = useState(true);
  const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(true);
  const [isAutomaticDiscount, setIsAutomaticDiscount] = useState(false);
  const [isLoadingDiscount, setIsLoadingDiscount] = useState(false);
  const [isInventoryModalVisible, setInventoryModalVisible] = useState(false);

  //tách đơn
  const [isCouponValid, setIsCouponValid] = useState(false);
  const [couponInputText, setCouponInputText] = useState(coupon);

  const lineItemQuantityInputTimeoutRef: MutableRefObject<any> = useRef();
  const lineItemPriceInputTimeoutRef: MutableRefObject<any> = useRef();
  const lineItemDiscountInputTimeoutRef: MutableRefObject<any> = useRef();

  const [isLineItemChanging, setIsLineItemChanging] = useState(false);
  const [isFinishedCalculateItem, setIsFinishedCalculateItem] = useState(true);

  const [storeArrayResponse, setStoreArrayResponse] = useState<Array<StoreResponse> | null>([]);

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  // const [storeSearchIds, setStoreSearchIds] = useState<PageResponse<StoreResponse>>();
  // console.log('props.isPageOrderUpdate', props.isPageOrderUpdate)
  const isShouldUpdateCouponRef = useRef(orderDetail || props.isPageOrderUpdate ? false : true);
  const isShouldUpdateDiscountRef = useRef(orderDetail || props.isPageOrderUpdate ? false : true);
  // console.log('isShouldUpdateCouponRef', isShouldUpdateCouponRef)
  console.log("promotion", promotion);
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
        SearchBarCode(barCode, (data: VariantResponse) => {
          if (data) {
            let _items = [...items];
            let index = _items.findIndex((i) => i.variant_id === data.id);
            const item: OrderLineItemRequest = createItem(data);
            item.position = items.length + 1;
            if (true) {
              if (splitLine || index === -1) {
                _items.unshift(item);
                if (!isAutomaticDiscount && !coupon) {
                  calculateChangeMoney(_items);
                }
              } else {
                let variantItems = _items.filter((item) => item.variant_id === data.id);
                let firstIndex = 0;
                variantItems[firstIndex].quantity += 1;
                variantItems[firstIndex].line_amount_after_line_discount +=
                  variantItems[firstIndex].price -
                  variantItems[firstIndex].discount_items[0]?.amount *
                    variantItems[firstIndex].quantity;
                if (!isAutomaticDiscount && !coupon) {
                  calculateChangeMoney(_items);
                }
              }
            }

            if (isAutomaticDiscount && _items.length > 0) {
              handleApplyDiscount(_items);
            } else if (couponInputText && _items.length > 0) {
              handleApplyCouponWhenInsertCoupon(couponInputText, _items);
            }
            setIsInputSearchProductFocus(false);
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

  const eventKeydown = useCallback(
    (event: any) => {
      if (event.target instanceof HTMLInputElement) {
        if (event.target.id === "search_product") {
          if (event.key !== "Enter") barcode = barcode + event.key;

          if (event.key === "Enter") {
            onClearVariantSearch();
            isBarcode = true;
            if (barcode !== "" && event && items) {
              handleSearchBarcode(barcode, items);
              barcode = "";
            }
          } else {
            isBarcode = false;
            handleDelayActionWhenInsertTextInSearchInput(
              autoCompleteRef,
              () => {
                barcode = "";
              },
              500,
            );
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleSearchBarcode, items],
  );

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
    } else if (couponInputText) {
      handleDelayActionWhenInsertTextInSearchInput(
        inputRef,
        () => handleApplyCouponWhenInsertCoupon(couponInputText, _items),
        QUANTITY_DELAY_TIME_PROMOTION,
      );
    } else {
      handleDelayActionWhenInsertTextInSearchInput(
        inputRef,
        () => calculateChangeMoney(_items),
        QUANTITY_DELAY_TIME,
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
      handleDelayCalculateWhenChangeOrderInput(lineItemQuantityInputTimeoutRef, _items);
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
          handleDelayCalculateWhenChangeOrderInput(lineItemPriceInputTimeoutRef, _items);
        }
      } else {
        _items[index].price = 0;
        _items[index].discount_items = [];
        _items[index].discount_amount = 0;
        _items[index].discount_value = 0;
        _items[index].discount_rate = 0;
        handleDelayCalculateWhenChangeOrderInput(lineItemPriceInputTimeoutRef, _items);
      }
    }
  };

  const onDiscountItem = (_items: Array<OrderLineItemRequest>, index: number) => {
    // nhập chiết khấu tay thì clear chương trình chiết khấu
    if (_items[index].discount_items && _items[index].discount_items[0]) {
      _items[index].discount_items[0].promotion_id = undefined;
      _items[index].discount_items[0].reason = "";
    }
    handleDelayCalculateWhenChangeOrderInput(lineItemDiscountInputTimeoutRef, _items, false);
  };

  const convertResultSearchVariant = useMemo(() => {
    let options: any[] = [];
    resultSearchVariant.items.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <SearchedVariant item={item} />,
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
        </div>
      );
    },
  };
  // console.log('isLineItemChanging', isLineItemChanging)
  const checkIfOtherLineItemIsChanged = () => {
    if (isLineItemChanging) {
      return true;
    }
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
      // console.log('lgg', l)
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
              setIsLineItemChanging(true);
            }}
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
        <div>Chiết khấu</div>
      </div>
    ),
    align: "center",
    width: "20%",
    className: "yody-table-discount text-right",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div className="site-input-group-wrapper saleorder-input-group-wrapper discountGroup columnBody__discount">
          <DiscountGroup
            price={l.price}
            index={index}
            discountRate={l.discount_items[0]?.rate ? l.discount_items[0]?.rate : 0}
            discountAmount={l.discount_items[0]?.amount ? l.discount_items[0]?.amount : 0}
            items={items}
            handleCardItems={(_items) => onDiscountItem(_items, index)}
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
      const menu = (
        <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
          <StyledComponent>
            <Menu.Item key="1">
              <Button
                type="text"
                onClick={() => showAddGiftModal(index)}
                className="columnBody__actions-button"
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
  const createItem = (variant: VariantResponse) => {
    const price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
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

  /**
   * nếu có chiết khấu tay thì ko apply chiết khấu tự động ở line item nữa
   */
  const checkIfReplaceDiscountLineItem = (item: OrderLineItemRequest, newDiscountValue: number) => {
    if (item.discount_items[0] && !item.discount_items[0].promotion_id) {
      return false;
    }
    if (newDiscountValue >= 0) {
      return true;
    }
    return false;
  };
  // console.log('items', items)
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
    if (checkIfReplaceDiscountLineItem(item, value)) {
      value = Math.min(value, item.price);
      value = Math.round(value);
      let rate = Math.round((value / item.price) * 100 * 100) / 100;
      rate = Math.min(rate, 100);

      const discountItem: OrderItemDiscountRequest = {
        ..._item.discount_items[0],
        rate,
        value,
        amount: value * item.quantity,
        reason: value > 0 ? highestValueSuggestDiscount.title : "",
        promotion_id:
          value > 0 ? highestValueSuggestDiscount.price_rule_id || undefined : undefined,
      };
      let itemResult = {
        ..._item,
        discount_items: [discountItem],
      };
      itemResult.discount_value = getLineItemDiscountValue(itemResult);
      itemResult.discount_rate = getLineItemDiscountRate(itemResult);
      itemResult.discount_amount = getLineItemDiscountAmount(itemResult);
      itemResult.line_amount_after_line_discount = getLineAmountAfterLineDiscount(itemResult);
      result.push(itemResult);
    } else {
      result.push(_item);
    }
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
    items: OrderLineItemRequest[] | undefined,
  ) => {
    if (!items) {
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
      let totalLineAmountAfterDiscount = getTotalAmountAfterDiscount(items);
      let discountAmount = getTotalDiscountOrder(checkingDiscountResponse.data, items);
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

  const handleApplyDiscount = async (
    items: OrderLineItemRequest[] | undefined,
    _isAutomaticDiscount: boolean = isAutomaticDiscount,
  ) => {
    isShouldUpdateDiscountRef.current = true;
    if (!items || items.length === 0 || !_isAutomaticDiscount) {
      return;
    }
    // console.log('items', items)
    setIsLoadingDiscount(true);
    dispatch(changeIsLoadingDiscountAction(true));
    // removeCoupon()
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
      sales_channel_name: isReturnOffline ? POS.source_name : ADMIN_ORDER.channel_name,
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
          if (response.data.line_items.length > 0) {
            if (
              isOrderHasDiscountLineItems(response.data) &&
              isOrderHasDiscountOrder(response.data)
            ) {
              let itemsAfterRemove = items.map((single) => {
                removeAutomaticDiscountItem(single);
                return single;
              });
              let totalDiscountLineItems = getTotalDiscountLineItems(response.data);
              let totalDiscountOrder = getTotalDiscountOrder(response.data, itemsAfterRemove);
              if (totalDiscountLineItems > totalDiscountOrder) {
                let result = getApplyDiscountLineItem(response, items);
                calculateChangeMoney(result, null);
              } else {
                let itemsAfterRemove = items.map((single) => {
                  removeAutomaticDiscountItem(single);
                  return single;
                });
                let promotionResult = handleApplyDiscountOrder(response, itemsAfterRemove);
                console.log("promotionResult", promotionResult);
                if (promotionResult) {
                  // form.setFieldsValue({
                  //   note: `(${promotionResult.reason})`,
                  // });
                  setPromotionTitle(promotionResult.reason || "");
                }
                calculateChangeMoney(items, promotionResult);
              }
            } else if (isOrderHasDiscountLineItems(response.data)) {
              let result = getApplyDiscountLineItem(response, items);
              calculateChangeMoney(result, promotion);
            } else if (isOrderHasDiscountOrder(response.data)) {
              let itemsAfterRemove = items.map((single) => {
                removeAutomaticDiscountItem(single);
                return single;
              });
              let promotionResult = handleApplyDiscountOrder(response, itemsAfterRemove);
              if (promotionResult) {
                // form.setFieldsValue({
                //   note: `(${promotionResult.reason})`,
                // });
                setPromotionTitle(promotionResult.reason || "");
              }
              calculateChangeMoney(items, promotionResult);
            } else {
              let itemsAfterRemoveAutomaticDiscount = items.map((single) => {
                removeAutomaticDiscountItem(single);
                return single;
              });
              handleApplyDiscountOrder(response, itemsAfterRemoveAutomaticDiscount);
              calculateChangeMoney(items);
              if (isShouldUpdatePrivateNote) {
                // form.setFieldsValue({
                //   note: ``,
                // });
              }
              setPromotionTitle("");
            }
          } else {
            if (isShouldUpdatePrivateNote) {
              // form.setFieldsValue({
              //   note: "",
              // });
            }
            setPromotionTitle("");
            if (setPromotion) {
              setPromotion(null);
            }
            showError("Có lỗi khi áp dụng chiết khấu!");
            calculateChangeMoney(items);
          }
        } else {
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
    // console.log('_items', _items)
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
        sales_channel_name: isReturnOffline ? POS.source_name : ADMIN_ORDER.channel_name,
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
              let promotionResult = { ...promotion };
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
                    };
                  }
                  break;
                case DISCOUNT_VALUE_TYPE.fixedPrice:
                  if (applyDiscountResponse.value) {
                    let value = orderProductsAmount - applyDiscountResponse.value;
                    let discountValue = Math.min(value, totalAmount);
                    let discountRate = (discountValue / totalAmount) * 100;
                    promotionResult = {
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
                  calculateChangeMoney(_items);
                  setPromotion &&
                    setPromotion({
                      amount: 0,
                      discount_code: applyDiscountResponse.code,
                      promotion_id: null,
                      rate: 0,
                      value: 0,
                    });
                  break;
              }
              if (isShouldUpdatePrivateNote) {
                // form.setFieldsValue({
                //   note: `(${applyDiscountResponse.code}-${applyDiscountResponse.title})`,
                // });
              }
              setPromotionTitle(`(${applyDiscountResponse.code}-${applyDiscountResponse.title})`);
              calculateChangeMoney(_items, promotionResult);
            }
          } else {
            calculateChangeMoney(_items);
            handleFetchApiError(response, "Áp dụng chiết khấu", dispatch);
          }
        })
        .catch((error) => {
          console.log("error", error);
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

        if (isAutomaticDiscount && _items.length > 0) {
          handleApplyDiscount(_items);
        } else if (couponInputText && _items.length > 0) {
          handleApplyCouponWhenInsertCoupon(couponInputText, _items);
        }
        autoCompleteRef?.current?.blur();
        setIsInputSearchProductFocus(false);
        onClearVariantSearch();
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

  // useEffect(() => {
  //   let storeids = [104435, 104436];
  //   dispatch(getStoreSearchIdsAction(storeids, setStoreSearchIds));
  // }, []);

  const handleInventoryCancel = useCallback(() => {
    setInventoryModalVisible(false);
  }, []);

  const onOkDiscountConfirm = (type: string, value: number, rate: number, coupon: string) => {
    let _value = value;
    let _rate = rate;
    let _promotion: OrderDiscountRequest | null | undefined = null;
    if (!items || items?.length === 0) {
      showError("Bạn cần chọn sản phẩm trước khi thêm chiết khấu!");
    } else {
      // setVisiblePickDiscount(false);
      let totalOrderAmount = totalAmount(items);
      setDiscountType(type);
      if (type === DISCOUNT_TYPE.MONEY) {
        _value = value;
        if (_value >= totalOrderAmount) {
          _value = totalOrderAmount;
        }
        _rate = (_value / orderProductsAmount) * 100;
      } else if (type === DISCOUNT_TYPE.PERCENT) {
        _rate = rate;
        if (_rate >= 100) {
          _rate = 100;
        }
        _value = (_rate * orderProductsAmount) / 100;
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
      };
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
          rate: _rate,
          reason: null,
          source: null,
          value: _value,
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
    const shippingAddress = orderCustomer ? getCustomerShippingAddress(orderCustomer) : null;
    if (
      _items.length > 0 &&
      shipmentMethod !== ShipmentMethodOption.PICK_AT_STORE &&
      !(checkIfEcommerceByOrderChannelCode(orderDetail?.channel_code) && props.isPageOrderUpdate) &&
      !isPageOrderDetail
    ) {
      const orderProductsAmount = totalAmount(_items);
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

    //loại bỏ kho Kho dự trữ, Kho phân phối
    let storesCopy = stores.filter(
      (store) =>
        store.type.toLocaleLowerCase() !== STORE_TYPE.DISTRIBUTION_CENTER &&
        store.type.toLocaleLowerCase() !== STORE_TYPE.STOCKPILE,
    );

    // đối với đổi trả offline
    // chỉ tạo với kho cửa hàng
    if (isReturnOffline) {
      storesCopy = stores.filter(
        (store) => store.type.toLocaleLowerCase() === STORE_TYPE.STORE.toLowerCase(),
      );
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
          let initStore = storesCopy.find((single) => single.id === storeId);
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
  }, [isCreateReturn, stores, setStoreId, storeId, storeIdLogin, userReducer?.account]);

  // console.log("dataCanAccess",dataCanAccess.map(p=>{return {name:p.name, type:p.type}} ))

  const onUpdateData = useCallback(
    (items: Array<OrderLineItemRequest>) => {
      let data = [...items];
      setItemGift(data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  );

  const onCancelConfirm = useCallback(() => {
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
    removeCoupon();
    let _items = [...items];
    _items.forEach((lineItem) => {
      if (lineItem.discount_items[0]?.promotion_id) {
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
    setPromotionTitle("");
    // calculateChangeMoney(_items, autoPromotionRate , autoPromotionValue);
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
  };

  const onInputSearchProductBlur = () => {
    setIsInputSearchProductFocus(false);
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

  useEffect(() => {
    if (items && items.length > 0) {
      setIsShowProductSearch(true);
    }
  }, [items]);

  useEffect(() => {
    dispatch(StoreSearchListAction("", setStoreArrayResponse));
  }, [dispatch]);

  useEffect(() => {
    if (isCreateReturn) {
      if (storeIdLogin) {
        setStoreId(storeIdLogin);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeIdLogin, isCreateReturn]);

  useEffect(() => {
    if (items) {
      let _itemGifts: OrderLineItemRequest[] = [];
      for (let i = 0; i < items.length; i++) {
        if (!items[i].gifts) {
          return;
        }
        _itemGifts = [..._itemGifts, ...items[i].gifts];
      }
      console.log("_itemGifts", _itemGifts);
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
   * gọi lại api chiết khấu khi update cửa hàng, khách hàng, nguồn, số lượng item
   */
  useEffect(() => {
    if (isShouldUpdateDiscountRef.current && isAutomaticDiscount && items && items?.length > 0) {
      handleApplyDiscount(items);
      // console.log("items items", items)
    } else isShouldUpdateDiscountRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countFinishingUpdateCustomer, storeId, orderSourceId, isShouldUpdateDiscountRef]);

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
  }, [countFinishingUpdateCustomer, storeId, orderSourceId, isShouldUpdateDiscountRef]);

  // đợi 3s cho load trang xong thì sẽ update trong trường hợp clone
  useEffect(() => {
    if (!props.isPageOrderUpdate) {
      setTimeout(() => {
        isShouldUpdateCouponRef.current = true;
        isShouldUpdateDiscountRef.current = true;
      }, 3000);
    }
  }, [props.isPageOrderUpdate]);

  useEffect(() => {
    window.addEventListener("keypress", eventKeyPress);
    window.addEventListener("keydown", eventKeydown);
    window.addEventListener("keydown", handlePressKeyBoards);
    return () => {
      window.removeEventListener("keypress", eventKeyPress);
      window.removeEventListener("keydown", eventKeydown);
      window.removeEventListener("keydown", handlePressKeyBoards);
    };
  }, [eventKeyPress, handlePressKeyBoards, eventKeydown]);

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

  useEffect(() => {
    if (coupon) {
      setIsAutomaticDiscount(false);
    }
  }, [coupon]);

  // const handleImportNewItem = useCallback(
  //   (item) => {
  //     if (!items) {
  //       return;
  //     }
  //     let _items = [...items];
  //     console.log("long 111", item);
  //     _items.push(item);
  //     console.log("long 222", _items);
  //     setItems(_items);

  //     console.log("long tesst 11");
  //     if (isAutomaticDiscount && _items.length > 0) {
  //       //handleApplyDiscount(_items);
  //     } else if (couponInputText && _items.length > 0) {
  //       //handleApplyCouponWhenInsertCoupon(couponInputText, _items);
  //     }
  //   },
  //   [couponInputText, isAutomaticDiscount, items, setItems],
  // );
  return (
    <StyledComponent>
      <Card
        title={returnOrderInformation ? "Thông tin sản phẩm đổi" : "Sản phẩm"}
        extra={
          <Space size={window.innerWidth > 1366 ? 20 : 10}>
            <Checkbox
              onChange={() => setSplitLine(!splitLine)}
              disabled={levelOrder > 3 || isOrderFinishedOrCancel(orderDetail)}
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
                  }
                }}
              >
                Chiết khấu tự động
              </Checkbox>
            </Form.Item>
            <ImportProductByExcelButton
              disabled={props.isPageOrderUpdate}
              storeId={storeId}
              items={items}
              handleItems={(items) => {
                if (!isAutomaticDiscount && !coupon) {
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
                  } else if (couponInputText && result.length > 0) {
                    handleApplyCouponWhenInsertCoupon(couponInputText, result);
                  }
                }
              }}
            />
            <Button
              disabled={levelOrder > 3 || isOrderFinishedOrCancel(orderDetail)}
              onClick={() => {
                showInventoryModal();
              }}
            >
              Kiểm tra tồn
            </Button>
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
                    setIsShowProductSearch(false);
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
              <AutoComplete
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
              </AutoComplete>
            </Form.Item>
          </Col>
        </Row>
        <AddGiftModal
          items={itemGifts}
          onUpdateData={onUpdateData}
          onCancel={onCancelConfirm}
          onOk={onOkConfirm}
          visible={isVisibleGift}
          storeId={storeId}
        />
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
            setCoupon={setCoupon}
            promotion={promotion}
            setPromotion={setPromotion}
            showDiscountModal={() => setVisiblePickDiscount(true)}
            showCouponModal={() => setIsVisiblePickCoupon(true)}
            orderProductsAmount={orderProductsAmount}
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
            <PickDiscountModal
              amount={orderProductsAmount}
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
        {isInventoryModalVisible && (
          <InventoryModal
            isModalVisible={isInventoryModalVisible}
            setInventoryModalVisible={setInventoryModalVisible}
            storeId={storeId}
            onChangeStore={onChangeStore}
            columnsItem={items}
            inventoryArray={inventoryResponse}
            storeArrayResponse={storeArrayResponse}
            handleCancel={handleInventoryCancel}
            // setStoreForm={setStoreForm}
          />
        )}
      </Card>
    </StyledComponent>
  );
}

export default OrderCreateProduct;
