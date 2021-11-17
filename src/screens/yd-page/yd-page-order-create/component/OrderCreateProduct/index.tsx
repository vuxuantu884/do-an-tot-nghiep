/* eslint-disable react-hooks/exhaustive-deps */
import {DownOutlined, EditOutlined, LoadingOutlined, SearchOutlined,} from "@ant-design/icons";
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
  Popover,
  Row,
  Select,
  Table,
  Tooltip,
} from "antd";
import {RefSelectProps} from "antd/lib/select";
import giftIcon from "assets/icon/gift.svg";
import imgDefault from "assets/icon/img-default.svg";
import NumberInput from "component/custom/number-input.custom";
import {AppConfig} from "config/app.config";
import {Type} from "config/type.config";
import UrlConfig from "config/url.config";
import {StoreGetListAction, StoreSearchListAction,} from "domain/actions/core/store.action";
// import {splitOrderAction} from "domain/actions/order/order.action";
import {SearchBarCode, searchVariantsOrderRequestAction,} from "domain/actions/product/products.action";
import {PageResponse} from "model/base/base-metadata.response";
import {StoreResponse} from "model/core/store.model";
import {InventoryResponse} from "model/inventory";
import {OrderItemDiscountModel} from "model/other/order/order-model";
import {VariantResponse, VariantSearchQuery} from "model/product/product.model";
import {RootReducerType} from "model/reducers/RootReducerType";
import {OrderItemDiscountRequest, OrderLineItemRequest} from "model/request/order.request";
import {OrderResponse} from "model/response/order/order.response";
import {OrderConfigResponseModel} from "model/response/settings/order-settings.response";
import {applyCouponService, applyDiscount,} from "service/promotion/discount/discount.service";
import React, {
  createRef,
  MutableRefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import DiscountGroup from "screens/yd-page/yd-page-order-create/component/discount-group";
import AddGiftModal from "screens/yd-page/yd-page-order-create/modal/add-gift.modal";
import InventoryModal from "screens/yd-page/yd-page-order-create/modal/inventory.modal";
import PickDiscountModal from "screens/yd-page/yd-page-order-create/modal/pick-discount.modal";
import {
  findAvatar,
  findPrice,
  findPriceInVariant,
  findTaxInVariant,
  formatCurrency,
  getTotalAmount,
  // getTotalAmountAfferDiscount,
  getTotalDiscount,
  getTotalQuantity,
  haveAccess,
  replaceFormatString,
} from "utils/AppUtils";
import {MoneyType} from "utils/Constants";
import {showError, showSuccess} from "utils/ToastUtils";
import CardProductBottom from "./CardProductBottom";
import {StyledComponent} from "./styles";
import {CouponRequestModel, LineItemRequestModel} from "model/request/promotion.request";
import {CustomerResponse} from "model/response/customer/customer.response";
import PickCouponModal from "screens/order-online/modal/pick-coupon.modal";
import {ApplyCouponResponseModel} from "model/response/order/promotion.response";
import BaseResponse from "base/base.response";
import {HttpStatus} from "config/http-status.config";
import {DISCOUNT_VALUE_TYPE} from "utils/Order.constants";
import {hideLoading, showLoading} from "domain/actions/loading.action";

type PropType = {
  storeId: number | null;
  items?: Array<OrderLineItemRequest>;
  shippingFeeInformedToCustomer: number | null;
  form: FormInstance<any>;
  discountRate?: number;
  discountValue?: number;
  totalAmountCustomerNeedToPay: number;
  orderConfig: OrderConfigResponseModel | null | undefined;
  inventoryResponse: Array<InventoryResponse> | null;
  levelOrder?: number;
  orderSourceId?: number | null;
  updateOrder?: boolean;
  isSplitOrder?: boolean;
  orderDetail?: OrderResponse | null;
  customer?: CustomerResponse | null;
  setStoreId: (item: number) => void;
  setItemGift: (item: []) => void;
  changeInfo: (
    items: Array<OrderLineItemRequest>,
    amount: number,
    discount_rate: number,
    discount_value: number
  ) => void;
  setItems: (items: Array<OrderLineItemRequest>) => void;
  setDiscountRate?: (value: number) => void;
  setDiscountValue?: (value: number) => void;
  setInventoryResponse: (item: Array<InventoryResponse> | null) => void;
  fetchData?: () => void;
  returnOrderInformation?: {
    totalAmountReturn: number;
  };
};

var barcode = "";

const initQueryVariant: VariantSearchQuery = {
  limit: 10,
  page: 1,
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
  const QUANTITY_DELAY_TIME = 1000;
  const {
    form,
    items,
    discountRate = 0,
    discountValue = 0,
    storeId,
    inventoryResponse,
    levelOrder = 0,
    // isSplitOrder,
    // orderDetail,
    orderConfig,
    shippingFeeInformedToCustomer,
    returnOrderInformation,
    totalAmountCustomerNeedToPay,
    orderSourceId,
    customer,
    setStoreId,
    setItems,
    // fetchData,
    setDiscountValue,
    setDiscountRate,
  } = props;
  const dispatch = useDispatch();
  const [loadingAutomaticDiscount, setLoadingAutomaticDiscount] = useState(false);
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
  const [isVisibleGift, setVisibleGift] = useState<boolean>(false);
  const [searchProducts, setSearchProducts] = useState(false);
  const [indexItem, setIndexItem] = useState<number>(-1);
  const [amount, setAmount] = useState<number>(0);
  const [isVisiblePickDiscount, setVisiblePickDiscount] = useState(false);
  const [isVisiblePickCoupon, setIsVisiblePickCoupon] = useState(false);
  const [discountType, setDiscountType] = useState<string>(MoneyType.MONEY);
  const [changeMoney, setChangeMoney] = useState<number>(0);
  const [coupon, setCoupon] = useState<string>("");
  const [isShowProductSearch, setIsShowProductSearch] = useState(false);
  const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(false);
  const [isAutomaticDiscount, setIsAutomaticDiscount] = useState(false);

  const [resultSearchStore, setResultSearchStore] = useState("");
  const [isInventoryModalVisible, setInventoryModalVisible] = useState(false);
  const lineItemQuantityInputTimeoutRef: MutableRefObject<any> = useRef();
  const [storeArrayResponse, setStoreArrayResponse] =
    useState<Array<StoreResponse> | null>([]);

  const eventKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLBodyElement) {
        if (event.key !== "Enter") {
          barcode = barcode + event.key;
        } else if (event.key === "Enter") {
          if (barcode !== "" && event && items) {
            dispatch(
              SearchBarCode(barcode, (data: VariantResponse) => {
                let _items = [...items].reverse();
                const item: OrderLineItemRequest = createItem(data);
                let index = _items.findIndex((i) => i.variant_id === data.id);
                item.position = items.length + 1;

                if (splitLine || index === -1) {
                  _items.push(item);
                  setAmount(amount + item.price);
                  calculateChangeMoney(
                    _items,
                    amount + item.price,
                    discountRate,
                    discountValue
                  );
                } else {
                  let variantItems = _items.filter((item) => item.variant_id === data.id);
                  let lastIndex = variantItems.length - 1;
                  variantItems[lastIndex].quantity += 1;
                  variantItems[lastIndex].line_amount_after_line_discount +=
                    variantItems[lastIndex].price -
                    variantItems[lastIndex].discount_items[0].amount;
                  setAmount(
                    amount +
                      variantItems[lastIndex].price -
                      variantItems[lastIndex].discount_items[0].amount
                  );
                  calculateChangeMoney(
                    _items,
                    amount +
                      variantItems[lastIndex].price -
                      variantItems[lastIndex].discount_items[0].amount,
                    discountRate,
                    discountValue
                  );
                }

                setItems(_items.reverse());
                autoCompleteRef.current?.blur();
                setIsInputSearchProductFocus(false);
                setKeySearchVariant("");
              })
            );
            barcode = "";
          }
        }
        return;
      }
    },
    [items]
  );

  useEffect(() => {
    window.addEventListener("keypress", eventKeyPress);
    return () => {
      window.removeEventListener("keypress", eventKeyPress);
    };
  }, [eventKeyPress]);

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
        }
      });
      return _amount;
    },
    [items]
  );

  useEffect(() => {
    if (items) {
      let amount = totalAmount(items);
      setChangeMoney(amount);
      setAmount(amount);
      let _itemGifts: any = [];
      for (let i = 0; i < items.length; i++) {
        if (!items[i].gifts) {
          return;
        }
        _itemGifts = [..._itemGifts, ...items[i].gifts];
      }
      props.setItemGift(_itemGifts);
    }
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

  const handleChangeItems = useCallback(
    (items) => {
      if (!items) {
        return;
      }
      let _items = [...items];
      let _amount = totalAmount(_items);
      // setItems(_items);
      setAmount(_amount);
      calculateChangeMoney(_items, _amount, discountRate, discountValue);
    },
    [items]
  );

  const onChangeQuantity = (value: number | null, index: number) => {
    if (items) {
      let _items = [...items];
      if (value === _items[index].quantity) {
        return;
      }
      _items[index].quantity = Number(
        value == null ? "0" : value.toString().replace(".", "")
      );
      // delay khi thay đổi số lượng
      if (isAutomaticDiscount) {
        if (lineItemQuantityInputTimeoutRef.current) {
          clearTimeout(lineItemQuantityInputTimeoutRef.current);
        }
        lineItemQuantityInputTimeoutRef.current = setTimeout(() => {
          handleDiscountWhenActiveAutomaticDiscount();
          return;
        }, QUANTITY_DELAY_TIME);
      } else {
        if (lineItemQuantityInputTimeoutRef.current) {
          clearTimeout(lineItemQuantityInputTimeoutRef.current);
        }
        lineItemQuantityInputTimeoutRef.current = setTimeout(() => {
          if(coupon && items && items?.length > 0) {
            handleApplyCouponWhenInsertCoupon(coupon)
          }
        }, QUANTITY_DELAY_TIME);

      }
      setItems(_items);
      handleChangeItems(_items);
    }
  };

  const onChangePrice = (value: number | null, index: number) => {
    if (items) {
      let _items = [...items];
      if (value !== null) {
        _items[index].price = value;
      }
      setItems(_items);
      handleChangeItems(_items);
    }
  };

  const onDiscountItem = (_items: Array<OrderLineItemRequest>) => {
    setItems(_items);
    handleChangeItems(_items);
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
            style={{width: "50%", borderRadius: 5}}
          />
        </Col>
        <Col span={14}>
          <div style={{padding: "5px 0"}}>
            <span
              className="searchDropdown__productTitle"
              style={{color: "#37394D"}}
              title={item.name}
            >
              {item.name}
            </span>
            <div style={{color: "#95A1AC"}}>{item.sku}</div>
          </div>
        </Col>
        <Col span={6}>
          <div style={{textAlign: "right", padding: "0 20px"}}>
            <div style={{display: "inline-block", textAlign: "right"}}>
              <Col style={{color: "#222222"}}>
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
              <div style={{color: "#737373"}}>
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
    resultSearchVariant.items.forEach((item: VariantResponse) => {
      options.push({
        label: renderSearchVariant(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [resultSearchVariant]);

  const ProductColumn = {
    title: () => (
      <div className="text-center">
        <div style={{textAlign: "left"}}>Sản phẩm</div>
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
          <div style={{marginTop: 5}}>
            {l.gifts &&
              l.gifts.map((a, index1) => (
                <div key={index1} className="yody-pos-addition yody-pos-gift">
                  <div>
                    <img src={giftIcon} alt="" />
                    <i style={{marginLeft: 7}}>
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
        <div style={{textAlign: "center"}}>Số lượng</div>
        {items && getTotalQuantity(items) > 0 && (
          <span style={{color: "#2A2A86"}}>({getTotalQuantity(items)})</span>
        )}
      </div>
    ),
    className: "yody-pos-quantity text-center",
    width: "9%",
    align: "right",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      // console.log('maxQuantityToApplyDiscountTest', l)
      return (
        <div className="yody-pos-qtt">
          <NumberInput
            style={{textAlign: "right", fontWeight: 500, color: "#222222"}}
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
          />
        </div>
      );
    },
  };

  const PriceColumn = {
    title: () => (
      <div>
        <span style={{color: "#222222", textAlign: "right"}}>Đơn giá</span>
        <span style={{color: "#808080", marginLeft: "6px", fontWeight: 400}}>₫</span>
      </div>
    ),
    className: "yody-pos-price text-right",
    width: "15%",
    align: "center",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      return (
        <div>
          <NumberInput
            format={(a: string) => formatCurrency(a)}
            replace={(a: string) => replaceFormatString(a)}
            placeholder="VD: 100,000"
            style={{
              textAlign: "right",
              width: "100%",
              fontWeight: 500,
              color: "#222222",
              marginTop: 22,
            }}
            maxLength={14}
            minLength={0}
            value={l.price}
            onChange={(value) => onChangePrice(value, index)}
            disabled={levelOrder > 3 || isAutomaticDiscount}
          />
          <span style={{ fontSize: "12px", color: "red" }}>
            {formatCurrency(items ? items[index].discount_amount : 0)}
          </span>
        </div>
      );
    },
  };

  const ActionColumn = {
    title: () => <div className="text-center"/>,
    width: "3%",
    align: "center",
    className: "saleorder-product-card-action ",
    render: (l: OrderLineItemRequest, item: any, index: number) => {
      const menu = (
        <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
          <Menu.Item key="1">
            <Popover
              content={
                <div className="discount-item-popup">
                  <div className="title">Thêm giảm giá</div>
                  <div className="discount-group">
                    <DiscountGroup
                      price={l.price}
                      index={index}
                      discountRate={l.discount_items[0].rate}
                      discountValue={l.discount_items[0].value}
                      totalAmount={l.discount_items[0].amount}
                      items={items}
                      handleCardItems={onDiscountItem}
                      disabled={levelOrder > 3}
                    />
                  </div>
                </div>
              }
              trigger="click"
            >
              <Button
                type="text"
                onClick={() => {
                  // setDiscountLineItemIndex(index);
                  // setDiscountLineItem(l);
                }}
              >
                Thêm chiết khấu
              </Button>
            </Popover>
          </Menu.Item>
          <Menu.Item key="2">
            <Popover
            content={
              <div className="discount-item-popup">
                <div className="title">
                  Thêm quà tặng
                </div>

                <div className="discount-group">
                  <AddGiftModal
                      items={itemGifts}
                      onUpdateData={onUpdateData}
                  />
              </div>

                <div style={{display: "flex", justifyContent: "flex-end", alignItems: "center"}}>
                  <Button
                      onClick={() => setVisibleGift(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="primary"
                          style={{marginLeft: 20}}
                          onClick={onOkConfirm}
                  >
                    Lưu
                  </Button>
                </div>

              </div>
            }
            trigger="click"
            visible={isVisibleGift}
            destroyTooltipOnHide={true}
            >
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
            </Popover>

          </Menu.Item>
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
          <Menu.Item key="4">
            <Button
              type="text"
              onClick={() => onDeleteItem(index)}
              style={{
                color: "red",
              }}
            >
              Xóa sản phẩm
            </Button>
          </Menu.Item>
        </Menu>
      );
      return (
        <div>
          <div
            className="site-input-group-wrapper saleorder-input-group-wrapper"
            style={{
              borderRadius: 5,
            }}
          >
            <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
              <DownOutlined style={{height: 0}} />
            </Dropdown>
          </div>
        </div>
      );
    },
  };

  const columns = [
    ProductColumn,
    AmountColumn,
    PriceColumn,
    // DiscountColumn,
    // TotalPriceColumn,
    ActionColumn,
  ];

  const autoCompleteRef = createRef<RefSelectProps>();
  const createItem = (variant: VariantResponse) => {
    let price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
    let taxRate = findTaxInVariant(variant.variant_prices, AppConfig.currency);
    let avatar = findAvatar(variant.variant_images);
    const discountItem: OrderItemDiscountModel = createNewDiscountItem();
    let orderLine: OrderLineItemRequest = {
      id: new Date().getTime(),
      sku: variant?.sku,
      variant_id: variant?.id,
      product_id: variant?.product?.id,
      variant: variant?.name,
      variant_barcode: variant?.barcode,
      product_type: variant?.product?.product_type,
      quantity: 1,
      price: price,
      amount: price,
      note: "",
      type: Type.NORMAL,
      variant_image: avatar,
      unit: variant?.product?.unit,
      weight: variant?.weight,
      weight_unit: variant?.weight_unit,
      warranty: variant?.product?.preservation,
      discount_items: [discountItem],
      discount_amount: 0,
      discount_rate: 0,
      composite: variant?.composite,
      is_composite: variant?.composite,
      discount_value: 0,
      line_amount_after_line_discount: price,
      product: variant?.product?.name,
      // tax_include: true,
      tax_include: null,
      tax_rate: taxRate,
      show_note: false,
      gifts: [],
      position: undefined,
      available: variant?.available,
    };
    return orderLine;
  };

  const createNewDiscountItem = () => {
    const newDiscountItem: OrderItemDiscountModel = {
      amount: 0,
      rate: 0,
      reason: "",
      value: 0,
    };
    return newDiscountItem;
  };

  const removeDiscountItem = (item: OrderLineItemRequest) => {
    item.discount_amount = 0;
    item.discount_rate = 0;
    item.discount_value = 0;
    item.discount_items = [
      {
        amount: 0,
        rate: 0,
        discount_code: "",
        promotion_id: undefined,
        reason: "",
        value: 0,
      },
    ];
  };

  const onDeleteItem = (index: number) => {
    if (!items) {
      return;
    }
    let _items = [...items];
    let _amount = amount - _items[index].line_amount_after_line_discount;
    setAmount(_amount);
    _items.splice(index, 1);
    setItems(_items);
    calculateChangeMoney(_items, _amount, discountRate, discountValue);
  };

  // const handleSplitLineItem = (items: OrderLineItemRequest[], lineItem: OrderLineItemRequest, quantity: 1, position:number) => {
  //   items.splice(position, 0, lineItem);
  //   console.log('itemsSplit', items)
  // };

  const handleDiscountWhenActiveAutomaticDiscount = async () => {
    if (!items || items.length === 0) {
      return;
    }
    const orderInfo: any = {
      storeId,
      salesChannelName: "ADMIN",
      customerId: customer?.id,
      orderSourceId: orderSourceId,
    };
    dispatch(showLoading());
    const checkingDiscountResponse = await applyDiscount(items, orderInfo).finally(() => {
      dispatch(hideLoading());
    });
    if (
      checkingDiscountResponse?.code === 20000000 &&
      checkingDiscountResponse.data.line_items.length > 0
    ) {
      let _items: OrderLineItemRequest[] = [];
      // let listDiscountItem = checkingDiscountResponse.data.line_items.map((single: any) => {
      //   return {
      //     discountId: single.variant_id,
      //     allocation_limit: single.suggested_discounts[0].allocation_limit
      //   }
      // })
      // let listDiscountItem: {
      //   variant_id: number,
      //   suggested_discounts: SuggestDiscountResponseModel[],
      // }[] = []
      // // let listDiscountItem = checkingDiscountResponse.data.line_items.reduce((), [])
      // // console.log('listDiscountItem', listDiscountItem)
      // checkingDiscountResponse.data.line_items.forEach((single:any) => {
      //   let duplicateItem = listDiscountItem.find((one) => one.variant_id === single.variant_id)
      //   if(duplicateItem) {
      //     return
      //   } else {
      //     listDiscountItem.push({
      //       variant_id: single.variant_id,
      //       suggested_discounts: single.suggested_discounts,
      //     })
      //   }
      // })
      // console.log('listDiscountItem', listDiscountItem)
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        // let suggested_discounts = listDiscountItem.find(
        let suggested_discounts = checkingDiscountResponse.data.line_items.find(
          (lineItem: any) => lineItem.variant_id === item.variant_id
        )?.suggested_discounts;
        console.log("suggested_discounts", suggested_discounts);
        if (!suggested_discounts || suggested_discounts?.length === 0) {
          removeDiscountItem(item);
        }
        let highestValueSuggestDiscount = suggested_discounts[0]; // backend đã sắp xếp
        const total = item.price;
        let value = 0;
        if (!highestValueSuggestDiscount) {
          removeDiscountItem(item);
        } else {
          if (
            highestValueSuggestDiscount.value_type === DISCOUNT_VALUE_TYPE.fixedAmount
          ) {
            value = highestValueSuggestDiscount.value
              ? highestValueSuggestDiscount.value
              : 0;
          } else if (
            highestValueSuggestDiscount.value_type === DISCOUNT_VALUE_TYPE.percentage
          ) {
            value = highestValueSuggestDiscount.value
              ? total * (highestValueSuggestDiscount.value / 100)
              : 0;
          } else if (
            highestValueSuggestDiscount.value_type === DISCOUNT_VALUE_TYPE.fixedPrice
          ) {
            value = highestValueSuggestDiscount.value
              ? item.price - highestValueSuggestDiscount.value
              : 0;
          }
          value = Math.round(value);
          value = Math.min(value, item.price);

          let rate = Math.round((value / item.price) * 100 * 100) / 100;
          rate = Math.min(rate, 100);
          const discountItem: OrderItemDiscountRequest = {
            rate,
            value,
            amount: value,
            reason: "",
            promotion_id: highestValueSuggestDiscount.price_rule_id || undefined,
          };
          item.discount_items[0] = discountItem;
          item.discount_value = item.quantity * value;
          item.discount_rate = rate;
          // item.maxQuantityToApplyDiscount =
          //   highestValueSuggestDiscount?.allocation_limit || undefined;
          // //thêm tách,
          // if(highestValueSuggestDiscount?.allocation_limit && item.quantity > highestValueSuggestDiscount?.allocation_limit) {
          //   let maxQuantityToDiscount = highestValueSuggestDiscount?.allocation_limit ? highestValueSuggestDiscount?.allocation_limit : 0;
          //   let clone = {
          //     ...item,
          //     quantity: maxQuantityToDiscount,
          //   };
          //   let newItem = {
          //     ...item,
          //     quantity: item.quantity - maxQuantityToDiscount,
          //     discount_items: [{
          //       amount: 0,
          //       rate: 0,
          //       discount_code: "",
          //       promotion_id: undefined,
          //       reason: "",
          //       value: 0,
          //     }],
          //     discount_rate: 0,
          //     discount_value: 0
          //   }
          //   _items =_items.splice(i).concat([clone, newItem])
          //   // handleSplitLineItem(item,item, 1, i+1);
          // }else {
          //   _items.push(item)
          // }
        }

        _items.push(item);
      }
      console.log("_itemszzzzzzzzz", _items);
      // await setItems(_items);
      handleChangeItems(_items);
      showSuccess("Cập nhật chiết khấu thành công!");
    } else {
      showError("Có lỗi khi áp dụng chiết khấu!");
    }
  };

  const handleAutomaticDiscount = async (
    _items: Array<OrderLineItemRequest>,
    item: OrderLineItemRequest,
    splitLine: boolean
  ) => {
    setLoadingAutomaticDiscount(true);
    // let valuestDiscount = 0;
    let quantity = splitLine
      ? _items.filter((singleItem) => singleItem.variant_id === item.variant_id).length
      : item.quantity;
    try {
      const orderInfo: any = {
        storeId,
        salesChannelName: "ADMIN",
      };
      dispatch(showLoading());
      const checkingDiscountResponse = await applyDiscount(
        // [{variant_id: item.variant_id, quantity}],
        [
          {
            applied_discount: null,
            custom: true,
            price: item.price,
            product_id: item.id,
            quantity,
            sku: item.sku,
            taxable: true,
            variant_id: item.variant_id,
          },
        ],
        orderInfo
      );
      setLoadingAutomaticDiscount(false);
      if (
        item &&
        checkingDiscountResponse &&
        checkingDiscountResponse.code === 20000000 &&
        checkingDiscountResponse.data.line_items.length
      ) {
        const suggested_discounts = checkingDiscountResponse.data.line_items.find(
          (lineItem: any) => lineItem.variant_id === item.variant_id
        )?.suggested_discounts;
        if (suggested_discounts && suggested_discounts.length > 0) {
          let highestValueSuggestDiscount = suggested_discounts[0]; // backend đã sắp xếp
          const total = item.amount;
          let value: number = 0;
          if (!highestValueSuggestDiscount) {
            return;
          }
          if (highestValueSuggestDiscount.value_type === "FIXED_AMOUNT") {
            value = highestValueSuggestDiscount.value
              ? highestValueSuggestDiscount.value
              : 0;
          } else if (highestValueSuggestDiscount.value_type === "PERCENTAGE") {
            value = highestValueSuggestDiscount.value
              ? total * (highestValueSuggestDiscount.value / 100)
              : 0;
          } else if (highestValueSuggestDiscount.value_type === "FIXED_PRICE") {
            value = highestValueSuggestDiscount.value
              ? item.price - highestValueSuggestDiscount.value
              : 0;
          }
          // highestValueDiscount = Math.max(
          //   ...suggested_discounts.map((discount: any) => {
          //     let value = 0;
          //     if (discount.value_type === "FIXED_AMOUNT") {
          //       value = (item.price - discount.value) * quantity;
          //     } else if (discount.value_type === "PERCENTAGE") {
          //       value = total * (discount.value / 100);
          //     } else if (discount.value_type === "FIXED_PRICE") {
          //       value = item.price - discount.value;
          //     }
          //     if (value > item.price) {
          //       value = item.price;
          //     }
          //     return value;
          //   })
          // );
          let rate = Math.round((value / item.price) * 100 * 100) / 100;
          rate = Math.min(rate, 100);
          value = Math.min(value, item.price);
          value = Math.round(value);
          const discountItem: OrderItemDiscountRequest = {
            rate,
            value,
            amount: value,
            reason: "",
            promotion_id: highestValueSuggestDiscount.price_rule_id || undefined,
          };
          item.discount_items[0] = discountItem;
          item.discount_value = item.quantity * value;
          item.discount_rate = rate;

          // dung 3 de test, gia tri o duoi 3 la dung
          // item.maxQuantityToApplyDiscount =
          // highestValueSuggestDiscount?.allocation_limit || undefined;
          // item.maxQuantityToApplyDiscount =3
        }
        showSuccess("Thêm chiết khấu thành công!");
      }
      dispatch(hideLoading());
    } catch (e) {
      console.log(e);
      showError("Thao tác thất bại!");
      setLoadingAutomaticDiscount(false);
      dispatch(hideLoading());
      return null;
    }
  };

  const handleApplyCouponWhenSelectItem = async (
    _items: Array<OrderLineItemRequest>,
    item: OrderLineItemRequest
  ) => {
    // setLoadingAutomaticDiscount(true);
    if (!_items) {
      return;
    }
    const lineItems: LineItemRequestModel[] = _items.map((single) => {
      return {
        original_unit_price: single.price,
        product_id: single.product_id,
        quantity: single.quantity,
        sku: single.sku,
        variant_id: single.variant_id,
      };
    });
    if (!isAutomaticDiscount) {
      let params: CouponRequestModel = {
        order_id: null,
        customer_id: customer?.id || null,
        store_id: form.getFieldValue("store_id"),
        sales_channel_name: "Admin",
        order_source_id: form.getFieldValue("source_id"),
        line_items: lineItems,
        applied_discount: {
          code: coupon,
        },
        taxes_included: true,
        tax_exempt: false,
      };
      dispatch(showLoading());
      await applyCouponService(params)
        .then(async (response: BaseResponse<ApplyCouponResponseModel>) => {
          switch (response.code) {
            case HttpStatus.SUCCESS:
              const applyDiscountResponse = response.data.applied_discount;
              if (applyDiscountResponse.invalid === true) {
                showError(applyDiscountResponse.invalid_description);
                setCoupon(" ");
              } else {
                setCoupon(coupon);
                let couponType = applyDiscountResponse.value_type;
                switch (couponType) {
                  case DISCOUNT_VALUE_TYPE.percentage:
                    break;
                  case DISCOUNT_VALUE_TYPE.fixedAmount:
                    break;
                  default:
                    let lineItemDiscountArray = response.data.line_items.filter(
                      (single) => {
                        return single.applied_discount?.invalid === false;
                      }
                    );
                    let itemDiscount = lineItemDiscountArray.find((singleLineItem) => {
                      return singleLineItem.product_id === item.product_id;
                    });
                    if (itemDiscount) {
                      let valueDiscount = 0;
                      let rateDiscount = 0;
                      console.log(
                        "itemDiscount.applied_discount?.value_type",
                        itemDiscount.applied_discount
                      );
                      if (
                        itemDiscount.applied_discount?.value_type ===
                        DISCOUNT_VALUE_TYPE.fixedAmount
                      ) {
                        valueDiscount = itemDiscount.applied_discount?.value || 0;
                        rateDiscount =
                          Math.round((valueDiscount / item.price) * 100 * 100) / 100;
                      } else if (
                        itemDiscount.applied_discount?.value_type ===
                        DISCOUNT_VALUE_TYPE.percentage
                      ) {
                        valueDiscount = itemDiscount.applied_discount?.value
                          ? (itemDiscount.applied_discount.value / 100) * item.price
                          : 0;
                        rateDiscount = itemDiscount.applied_discount?.value || 0;
                        // rateDiscount = Math.round((valueDiscount / item.price) * 100 * 100) / 100;
                      } else if (
                        itemDiscount.applied_discount?.value_type ===
                        DISCOUNT_VALUE_TYPE.fixedPrice
                      ) {
                        valueDiscount = itemDiscount.applied_discount?.value
                          ? item.price - itemDiscount.applied_discount?.value
                          : 0;
                        rateDiscount =
                          Math.round((valueDiscount / item.price) * 100 * 100) / 100;
                      }
                      valueDiscount = Math.min(valueDiscount, amount);
                      valueDiscount = Math.round(valueDiscount);
                      const discountItem: OrderItemDiscountRequest = {
                        rate: rateDiscount,
                        value: valueDiscount,
                        amount: valueDiscount,
                        reason: "",
                        discount_code: itemDiscount.applied_discount?.code || undefined,
                      };
                      item.discount_items[0] = discountItem;
                      // item.discount_rate = rateDiscount;
                      // item.discount_value = item.quantity * rateDiscount;
                    }
                    break;
                }
              }
              break;
            default:
              response.errors.forEach((e) => showError(e));
              break;
          }
        })
        .catch((error) => {
          showError("Có lỗi khi kết nối api tính mã giảm giá!");
        })
        .finally(() => {
          dispatch(hideLoading());
        });
      setIsVisiblePickCoupon(false);
      handleChangeItems(_items);
    }
  };

  const handleApplyCouponWhenInsertCoupon = async (coupon: string, _items = items) => {
    if (!_items) {
      return;
    }
    const lineItems: LineItemRequestModel[] = _items.map((single) => {
      return {
        original_unit_price: single.price,
        product_id: single.product_id,
        quantity: single.quantity,
        sku: single.sku,
        variant_id: single.variant_id,
      };
    });
    if (!isAutomaticDiscount) {
      let params: CouponRequestModel = {
        order_id: null,
        customer_id: customer?.id || null,
        store_id: form.getFieldValue("store_id"),
        sales_channel_name: "Admin",
        order_source_id: form.getFieldValue("source_id"),
        line_items: lineItems,
        applied_discount: {
          code: coupon,
        },
        taxes_included: true,
        tax_exempt: false,
      };
      dispatch(showLoading());
      await applyCouponService(params)
        .then(async (response: BaseResponse<ApplyCouponResponseModel>) => {
          switch (response.code) {
            case HttpStatus.SUCCESS:
              const applyDiscountResponse = response.data.applied_discount;
              if (applyDiscountResponse.invalid === true) {
                showError(applyDiscountResponse.invalid_description);
                setCoupon("");
                _items?.forEach((item) => {
                  removeDiscountItem(item)
                })
                setItems(_items);
                handleChangeItems(_items)
              } else {
                setCoupon(coupon);
                const discount_code = applyDiscountResponse.code || undefined;
                let couponType = applyDiscountResponse.value_type;
                switch (couponType) {
                  case DISCOUNT_VALUE_TYPE.percentage:
                    if (applyDiscountResponse.value) {
                      setDiscountRate && setDiscountRate(applyDiscountResponse.value);
                      // làm tròn vd: 17,234 đồng
                      setDiscountValue &&
                        setDiscountValue(
                          (Math.round((applyDiscountResponse.value / 100) * amount) *
                            100) /
                            100
                        );
                    }
                    break;
                  case DISCOUNT_VALUE_TYPE.fixedAmount:
                    break;
                  case DISCOUNT_VALUE_TYPE.fixedPrice:
                    break;
                  default:
                    let lineItemDiscountArray = response.data.line_items.filter(
                      (single) => {
                        return single.applied_discount?.invalid === false;
                      }
                    );
                    _items.forEach((singleItem) => {
                      let itemDiscount = lineItemDiscountArray.find((singleLineItem) => {
                        return singleLineItem.product_id === singleItem.product_id;
                      });
                      if (itemDiscount) {
                        let applyDiscountLineItem = itemDiscount.applied_discount;
                        let discount_rate = 0;
                        let discount_value = 0;
                        switch (applyDiscountLineItem?.value_type) {
                          case DISCOUNT_VALUE_TYPE.percentage:
                            discount_rate = applyDiscountLineItem?.value
                              ? applyDiscountLineItem?.value
                              : 0;
                            discount_value = discount_rate
                              ? (discount_rate / 100) * singleItem.price
                              : 0;
                            break;
                          case DISCOUNT_VALUE_TYPE.fixedAmount:
                            discount_rate = applyDiscountLineItem?.value
                              ? (applyDiscountLineItem?.value * 100) / singleItem.price
                              : 0;
                            discount_value = applyDiscountLineItem?.value || 0;
                            break;
                          case DISCOUNT_VALUE_TYPE.fixedPrice:
                            discount_value = applyDiscountLineItem?.value
                              ? singleItem.price - applyDiscountLineItem?.value
                              : 0;
                            discount_rate = discount_value
                              ? (discount_value * 100) / singleItem.price
                              : 0;
                            break;
                          default:
                            break;
                        }
                        discount_value = Math.min(discount_value, singleItem.price);
                        discount_rate = Math.min(discount_rate, 100);
                        // let amountDiscount = discount_value
                        //   ? singleItem.quantity * discount_value
                        //   : 0;
                        singleItem.discount_items = [
                          {
                            amount: discount_value,
                            value: discount_value,
                            rate: discount_rate
                              ? Math.round(discount_rate * 100) / 100
                              : 0,
                            reason: "",
                            discount_code,
                          },
                        ];
                        singleItem.discount_rate = discount_rate;
                        singleItem.discount_value = discount_value;
                      } else {
                        removeDiscountItem(singleItem)
                      }
                    });
                    await setItems(_items);
                    handleChangeItems(_items);
                    break;
                }
                showSuccess("Thêm coupon thành công!");
              }
              break;
            default:
              response.errors.forEach((e) => showError(e));
              break;
          }
        })
        .catch((error) => {
          showError("Có lỗi khi kết nối api tính mã giảm giá!");
        })
        .finally(() => {
          dispatch(hideLoading());
        });
      setIsVisiblePickCoupon(false);
    }
  };

  const onSearchVariantSelect = useCallback(
    async (v) => {
      if (!items) {
        return;
      }
      // setLoadingAutomaticDiscount(true);
      let newV = parseInt(v);
      let _items = [...items].reverse();
      let indexSearch = resultSearchVariant.items.findIndex((s) => s.id === newV);
      let index = _items.findIndex((i) => i.variant_id === newV);
      let r: VariantResponse = resultSearchVariant.items[indexSearch];
      const item: OrderLineItemRequest = createItem(r);
      item.position = items.length + 1;
      if (r.id === newV) {
        if (splitLine || index === -1) {
          _items.push(item);
          // await handleAutomaticDiscount(_items, item, splitLine);
          if (isAutomaticDiscount) {
            await handleAutomaticDiscount(_items, item, splitLine);
          } else if (coupon) {
            await handleApplyCouponWhenSelectItem(_items, item);
            // await handleApplyCouponWhenInsertCoupon(coupon, _items);
          }
          setAmount(amount + (item.price - item.discount_items[0].amount));
          calculateChangeMoney(
            _items,
            amount + item.price - item.discount_items[0].amount,
            discountRate,
            discountValue
          );
        } else {
          let variantItems = _items.filter((item) => item.variant_id === newV);
          let lastIndex = variantItems.length - 1;
          variantItems[lastIndex].quantity += 1;
          variantItems[lastIndex].line_amount_after_line_discount +=
            variantItems[lastIndex].price -
            variantItems[lastIndex].discount_items[0].amount *
              variantItems[lastIndex].quantity;

          // await handleAutomaticDiscount(_items, item, splitLine);
          if (isAutomaticDiscount) {
            await handleAutomaticDiscount(_items, item, splitLine);
          } else if (coupon) {
            await handleApplyCouponWhenSelectItem(_items, item);
          }
          setAmount(
            amount +
              variantItems[lastIndex].price -
              variantItems[lastIndex].discount_items[0].amount
          );

          calculateChangeMoney(
            _items,
            amount +
              variantItems[lastIndex].price -
              variantItems[lastIndex].discount_items[0].amount,
            discountRate,
            discountValue
          );
        }
      }
      autoCompleteRef.current?.blur();
      setIsInputSearchProductFocus(false);
      setKeySearchVariant("");
    },
    [resultSearchVariant, items, splitLine, isAutomaticDiscount]
  );

  const onChangeProductSearch = useCallback(
    async (value: string) => {
      setIsInputSearchProductFocus(true);
      setKeySearchVariant(value);
      if (orderConfig?.allow_choose_item && value) {
        await form?.validateFields(["store_id"]).catch(() => {
          return;
        });
      }

      initQueryVariant.info = value;
      initQueryVariant.store_ids = form?.getFieldValue(["store_id"]);
      if (value.trim()) {
        await (async () => {
          setSearchProducts(true);
          try {
            await dispatch(
                searchVariantsOrderRequestAction(initQueryVariant, (data) => {
                  setResultSearchVariant(data);
                  setSearchProducts(false);
                  setIsShowProductSearch(true);
                })
            );
          } catch {
          }
        })();
      } else {
        setSearchProducts(false);
      }
    },
    [form]
  );

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const showInventoryModal = useCallback(() => {
    if (items !== null && items?.length) setInventoryModalVisible(true);
    else showError("Vui lòng chọn sản phẩm vào đơn hàng");
  }, [dispatch, items]);

  useEffect(() => {
    dispatch(StoreSearchListAction(resultSearchStore, setStoreArrayResponse));
  }, [resultSearchStore]);

  const handleInventoryCancel = useCallback(() => {
    setInventoryModalVisible(false);
  }, []);

  const onOkDiscountConfirm = (
    type: string,
    value: number,
    rate: number,
    coupon: string
  ) => {
    console.log('items', items)
    if (items?.length === 0) {
      showError("Bạn cần chọn sản phẩm trước khi thêm chiết khấu!");
    } else {
      // setVisiblePickDiscount(false);
      setDiscountType(type);
      setDiscountValue && setDiscountValue(value);
      setDiscountRate && setDiscountRate(rate);
      if (coupon) {
        handleApplyCouponWhenInsertCoupon(coupon);
      }
      if (items) {
        calculateChangeMoney(items, amount, rate, value);
      }
      showSuccess("Thêm chiết khấu thành công!");
      setCoupon("");
    }
    setVisiblePickDiscount(false);
  };
  const onOkCouponConfirm = (
    type: string,
    value: number,
    rate: number,
    coupon: string
  ) => {
    console.log("coupoonss");
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
      if (items) {
        calculateChangeMoney(items, amount, rate, value);
      }
    }
  };

  const calculateChangeMoney = (
    _items: Array<OrderLineItemRequest>,
    _amount: number,
    _discountRate?: number,
    _discountValue?: number
  ) => {
    if (!_discountRate) {
      _discountRate = 0;
    }
    if (!_discountValue) {
      _discountValue = 0;
    }
    props.changeInfo(_items, _amount, _discountRate, _discountValue);
  };

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];
    if (listStores && listStores.length) {
      newData = listStores.filter((store) =>
        haveAccess(
          store.id,
          userReducer.account ? userReducer.account.account_stores : []
        )
      );
    }
    // set giá trị mặc định của cửa hàng là cửa hàng có thể truy cập đầu tiên
    if (newData && newData[0]?.id) {
      setStoreId(newData[0].id);
    }
    return newData;
  }, [listStores, userReducer.account]);

  const onUpdateData = useCallback(
    (items: Array<OrderLineItemRequest>) => {
      let data = [...items];
      setItemGift(data);
    },
    [items]
  );

  // const onCancleConfirm = useCallback(() => {
  //   setVisibleGift(false);
  // }, []);

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
  }, [items, itemGifts, indexItem]);

  const handleRemoveAllDiscount = async () => {
    if (!items || items.length === 0) {
      return;
    }
    let _items = [...items];
    _items.forEach((lineItem) => {
      lineItem.discount_amount = 0;
      lineItem.discount_items = lineItem.discount_items.map((discount) => {
        return {
          amount: 0,
          rate: 0,
          discount_code: "",
          promotion_id: undefined,
          reason: "",
          value: 0,
        };
      });
      lineItem.discount_rate = 0;
      lineItem.discount_value = 0;
    });
    await setItems(_items);
    await handleChangeItems(_items);
    showSuccess("Xóa tất cả chiết khấu thành công!");
  };

  useLayoutEffect(() => {
    dispatch(StoreGetListAction(setListStores));
  }, [dispatch]);

  const onInputSearchProductFocus = () => {
    setIsInputSearchProductFocus(true);
  };

  const onInputSearchProductBlur = () => {
    setIsInputSearchProductFocus(false);
  };

  // const handleSplitOrder = () => {
  //   if (!orderDetail || !userReducer.account) {
  //     return;
  //   }
  //   if (splitOrderNumber === undefined) {
  //     showError("Vui lòng điền số lượng tách đơn!");
  //     return;
  //   }
  //   if (items && splitOrderNumber > items?.length) {
  //     showError("Số lượng tách đơn không được lớn hơn số lượng loại sản phẩm!");
  //     return;
  //   }
  //   if (splitOrderNumber < 2 || splitOrderNumber > 20) {
  //     showError("Số lượng tách đơn cần lớn hơn 1 và nhỏ hơn 20!");
  //     return;
  //   }
  //
  //   const params: SplitOrderRequest = {
  //     order_code: orderDetail.code,
  //     quantity: splitOrderNumber,
  //     updated_by: userReducer.account.updated_by || "",
  //     updated_name: userReducer.account.updated_name || "",
  //   };
  //   dispatch(
  //     splitOrderAction(params, (response) => {
  //       if (response) {
  //         response.data.forEach((singleOrderId: number) => {
  //           const singleSplitLink = `${process.env.PUBLIC_URL}/orders/${singleOrderId}/update`;
  //           window.open(singleSplitLink, "_blank");
  //         });
  //         fetchData && fetchData();
  //       }
  //     })
  //   );
  // };

  useEffect(() => {
    if (items && items.length > 0) {
      setIsShowProductSearch(true);
    }
  }, []);


  /**
  * gọi lại api chiết khấu khi update cửa hàng, khách hàng, nguồn
  */
  useEffect(() => {
    if (isAutomaticDiscount && items && items?.length > 0) {
      handleDiscountWhenActiveAutomaticDiscount();
    }
  }, [customer?.id, storeId, orderSourceId, items?.length]);

  console.log("isAutomaticDiscount", isAutomaticDiscount);

  return (
    <StyledComponent>
      <Card
        className="yd-page-order padding-12 update-customer-ydpage"
      >
        <Row
          gutter={12}
          style={{marginTop: 6, display: "flex", justifyContent: "space-between"}}
        >
          <Col span={24} style={{marginBottom: 6}}>
            <Select
                style={{minWidth: 145, height: 38}}
                placeholder="Chương trình khuyến mại"
            >
              <Select.Option value="" color="#222222">
                (Tạm thời chưa có)
              </Select.Option>
            </Select>
          </Col>
          <Col span={18}>
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
                style={{width: "100%"}}
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
          <Col span={6} style={{display: "flex", justifyContent: "flex-end"}}>
            <Button
              style={{ width: "100%", padding: "0 6px"}}
              onClick={() => {
                showInventoryModal();
              }}
            >
              Kiểm tra tồn
            </Button>
          </Col>
        </Row>
        <Row style={{display: "flex", justifyContent: "space-between", marginBottom: 6, marginTop: 10, alignItems: "center"}}>
          <Col>
            <Checkbox onChange={() => setSplitLine(!splitLine)}>Tách dòng</Checkbox>
          </Col>
          <Col hidden>
            <Form.Item name="price_type">
              <Select style={{minWidth: 145, height: 38}} placeholder="Chính sách giá">
                <Select.Option value="retail_price" color="#222222">
                  Giá bán lẻ
                </Select.Option>
                <Select.Option value="whole_sale_price">Giá bán buôn</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col>
            <Checkbox
                disabled={levelOrder > 3}
                checked={isAutomaticDiscount}
                onChange={(e) => {
                  setIsAutomaticDiscount(e.target.checked);

                  if (e.target.checked) {
                    setCoupon("");
                    setIsDisableOrderDiscount(true);
                    handleRemoveAllDiscount();
                    handleDiscountWhenActiveAutomaticDiscount();
                  } else {
                    setIsDisableOrderDiscount(false);
                    handleRemoveAllDiscount();
                  }
                }}
            >
              Chiết khấu tự động
            </Checkbox>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
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
                open={isShowProductSearch && isInputSearchProductFocus}
                onFocus={onInputSearchProductFocus}
                onBlur={onInputSearchProductBlur}
                disabled={levelOrder > 3 || loadingAutomaticDiscount}
                dropdownRender={(menu) => (
                  <div>
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
                      <LoadingOutlined style={{color: "#2a2a86"}} />
                    ) : (
                      <SearchOutlined style={{color: "#ABB4BD"}} />
                    )
                  }
                  disabled={levelOrder > 3}
                />
              </AutoComplete>
            </Form.Item>
          </Col>
        </Row>
        <Table
            bordered
          locale={{
            emptyText: (
              <div className="sale_order_empty_product">
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
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={items}
          className="sale-product-box-table2 w-100"
          tableLayout="fixed"
          pagination={false}
          // scroll={{ y: 300 }}
          sticky
          footer={() =>
            items && items.length > 0 ? (
              <Row className="row-footer-custom product-table">
                <Col span={12} style={{display: 'flex'}}>
                <div className="total-text">Tổng giá:</div>
                <div className="total-value-1">
                  {formatCurrency(getTotalAmount(items))}
                </div>
                </Col>
                <Col span={12} style={{display: 'flex'}}>
                <div className="total-text">CK trên SP:</div>
                <div className="total-value-2">
                {formatCurrency(getTotalDiscount(items))}
                </div>
                </Col>
              </Row>
            ) : (
              <div />
            )
          }
          />

        {/* nếu có sản phẩm trong đơn hàng mới hiển thị thông tin ở dưới  */}
        {items && items.length > 0 && (
          <CardProductBottom
            amount={amount}
            calculateChangeMoney={calculateChangeMoney}
            changeMoney={changeMoney}
            coupon={coupon}
            setCoupon={setCoupon}
            discountRate={discountRate}
            discountValue={discountValue}
            setDiscountRate={setDiscountRate}
            setDiscountValue={setDiscountValue}
            showDiscountModal={() => setVisiblePickDiscount(true)}
            showCouponModal={() => setIsVisiblePickCoupon(true)}
            orderAmount={amount}
            items={items}
            shippingFeeInformedToCustomer={shippingFeeInformedToCustomer}
            returnOrderInformation={returnOrderInformation}
            totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
            isDisableOrderDiscount={isDisableOrderDiscount}
            handleRemoveAllDiscount={handleRemoveAllDiscount}
          />
        )}
        {setDiscountValue && setDiscountRate && (
          <React.Fragment>
            <PickDiscountModal
              amount={amount}
              type={discountType}
              value={discountValue}
              rate={discountRate}
              // coupon={coupon}
              onCancelDiscountModal={() => setVisiblePickDiscount(false)}
              onOkDiscountModal={onOkDiscountConfirm}
              visible={isVisiblePickDiscount}
            />
            <PickCouponModal
              coupon={coupon}
              onCancelCouponModal={() => {
                setIsVisiblePickCoupon(false);
                setCoupon("");
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
          setResultSearchStore={setResultSearchStore}
          dataSearchCanAccess={storeArrayResponse}
          handleCancel={handleInventoryCancel}
          // setStoreForm={setStoreForm}
        />
      </Card>
    </StyledComponent>
  );
}

export default OrderCreateProduct;
