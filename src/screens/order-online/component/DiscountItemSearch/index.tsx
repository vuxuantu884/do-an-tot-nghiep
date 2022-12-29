import { Input, Select, Typography } from "antd";
import _ from "lodash";
import { OrderLineItemRequest } from "model/request/order.request";
import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  formatCurrency,
  formatPercentage,
  getLineAmountAfterLineDiscount,
  getLineItemDiscountAmount,
  getLineItemDiscountRate,
  getLineItemDiscountValue,
  handleDelayActionWhenInsertTextInSearchInput,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import { DISCOUNT_TYPE } from "utils/Constants";
import { showError } from "utils/ToastUtils";
import discountCoupon from "assets/icon/discount-coupon.svg";
import SelectedPromotion from "./SelectedPromotion";
import { DiscountRequestModel } from "model/request/promotion.request";
import { DiscountValueType } from "model/promotion/price-rules.model";
import { applyDiscountService } from "service/promotion/discount/discount.service";
import { useDispatch } from "react-redux";
import {
  CustomApplyDiscount,
  SuggestDiscountResponseModel,
} from "model/response/order/promotion.response";
import { CloseCircleOutlined, RedoOutlined } from "@ant-design/icons";
import { StyledComponent } from "./styled";
import { RegUtil } from "utils/RegUtils";
import { lineItemsConvertInSearchPromotion } from "utils/OrderUtils";

type PropTypes = {
  discountRate: number;
  discountAmount: number;
  discountType: string;
  index?: number;
  item?: OrderLineItemRequest;
  disabled?: boolean;
  param: any;
  onBlur?: () => void;
  handleApplyDiscountItem: (v: OrderLineItemRequest) => void;
};

function DiscountItemSearch(props: PropTypes) {
  const { disabled = false } = props;
  const dispatch = useDispatch();
  const { Text } = Typography;
  const inputRef = useRef<any>();
  const [selected, setSelected] = useState(DISCOUNT_TYPE.MONEY);
  const [discountValue, setDiscountValue] = useState<string>("");
  const [showSearchPromotion, setShowSearchPromotion] = useState(false);
  const [suggestedDiscounts, setSuggestedDiscounts] = useState<SuggestDiscountResponseModel[]>([]);
  let showResult = true;

  const disableInput = props.item?.discount_items[0]?.promotion_id ? true : disabled;

  const getAfterValue = (discount: any, totalAcount: number) => {
    if (discount.value_type === DiscountValueType.PERCENTAGE) {
      return totalAcount - _.round(((discount.value || 0) * totalAcount) / 100);
    } else if (discount.value_type === DiscountValueType.FIXED_PRICE) {
      return discount.value;
    } else if (discount.value_type === DiscountValueType.FIXED_AMOUNT) {
      return totalAcount - (discount.value || 0);
    }
  };

  const calculateDiscount = (discount: any, totalPrice: number) => {
    return discount.value_type === DiscountValueType.FIXED_PRICE
      ? Math.abs(totalPrice - (discount.value ?? 0))
      : discount.value;
  };
  const data = useMemo(() => {
    return suggestedDiscounts.map((p) => {
      return {
        ...p,
        calculate_discount: calculateDiscount(p, props.item?.price ?? 0),
        after_value: getAfterValue(p, props.item?.price ?? 0),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedDiscounts]);
  const handleBeforeApplyDiscount = useCallback(
    (discountItem: CustomApplyDiscount) => {
      if (!props.item) {
        return;
      }
      // console.log("ChangeValueDiscount", itemDiscount, items, props.indexItem);
      let discountValue = discountItem.value || 0;
      const discountType =
        discountItem.value_type === DiscountValueType.PERCENTAGE
          ? DISCOUNT_TYPE.PERCENT
          : discountItem.value_type === DiscountValueType.FIXED_AMOUNT
          ? DISCOUNT_TYPE.MONEY
          : discountItem.value_type === DiscountValueType.FIXED_PRICE
          ? DiscountValueType.FIXED_PRICE
          : discountItem.value_type;

      console.log("discountType", discountType);
      if (discountValue < 0) discountValue = -discountValue;
      if (discountType === DISCOUNT_TYPE.PERCENT) {
        discountValue = Math.round(discountValue * 100) / 100;
      } else {
        discountValue = Math.round(discountValue);
      }

      let _item = { ...props.item };

      if (_item.discount_items.length === 0) {
        _item.discount_items = [
          {
            amount: 0,
            value: 0,
            rate: 0,
            reason: null,
            discount_code: "",
            promotion_id: undefined,
            type: discountType ?? "",
            promotion_title: null,
            taxable: discountItem.is_registered,
            sub_type: discountItem.value_type,
          },
        ];
      }
      let _itemDiscount = _item.discount_items[0];
      _itemDiscount.promotion_id = discountItem.price_rule_id;
      _itemDiscount.promotion_title = discountItem.title;
      if (discountItem.code && discountItem.code.length !== 0)
        _itemDiscount.discount_code = discountItem.code;
      let _price = _item.price;
      if (discountType === DISCOUNT_TYPE.MONEY) {
        if (_item.amount < discountValue) {
          showError("Chiết khấu không lớn hơn giá sản phẩm!");
          discountValue = _item.amount;
        }
        _itemDiscount.amount = discountValue * _item.quantity;
        _itemDiscount.rate = (discountValue / _item.amount) * 100;
        _itemDiscount.value = discountValue;
      } else if (discountType === DISCOUNT_TYPE.PERCENT) {
        if (100 < discountValue) {
          discountValue = 100;
          showError("Chiết khấu không lớn hơn 100%!");
        }
        _itemDiscount.value = Math.round((discountValue * _price) / 100);
        _itemDiscount.rate = discountValue;
        _itemDiscount.amount = (discountValue * _item.amount) / 100;
      } else if (discountType === DiscountValueType.FIXED_PRICE) {
        //đồng giá
        const newItemPrice = Math.abs(_item.price - discountValue);
        _itemDiscount.amount = newItemPrice * _item.quantity;
        _itemDiscount.rate = (discountValue / _item.amount) * 100;
        _itemDiscount.value = newItemPrice;
        _itemDiscount.type = DISCOUNT_TYPE.MONEY;
      }
      _item.isLineItemSemiAutomatic = true; //là chiết khấu bán tự động
      _item.discount_value = getLineItemDiscountValue(_item);
      _item.discount_amount = getLineItemDiscountAmount(_item);
      _item.discount_rate = getLineItemDiscountRate(_item);
      _item.line_amount_after_line_discount = getLineAmountAfterLineDiscount(_item);
      //console.log("handleBeforeApplyDiscount", _item);
      props.handleApplyDiscountItem(_item);
      setShowSearchPromotion(false);
    },
    [props],
  );
  const changeDiscountType = (value: string) => {
    setSelected(value);
  };

  const handleSearchPromotionApply = useCallback(
    (_item: OrderLineItemRequest, v: string, type: string) => {
      const lineItemConvert = lineItemsConvertInSearchPromotion(_item, v, type);
      let params: DiscountRequestModel = {
        ...props.param,
        line_items: [lineItemConvert],
        applied_discount: null,
        taxes_included: true,
        tax_exempt: false,
      };
      applyDiscountService(params)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            console.log("handleSearchPromotionApply", response);

            if (type === DISCOUNT_TYPE.MONEY || type === DISCOUNT_TYPE.PERCENT) {
              const suggestedDiscounts = response.data.line_items[0].suggested_discounts;
              if (suggestedDiscounts && suggestedDiscounts.length !== 0) {
                setSuggestedDiscounts(suggestedDiscounts);
                setShowSearchPromotion(true);
              } else {
                showError(`Không có chương trình thỏa mãn cho sản phẩm`);
              }
            } else if (type === DISCOUNT_TYPE.COUPON) {
              const _applyDiscount = response.data.line_items[0].applied_discount;
              if (_applyDiscount) {
                if (_applyDiscount.invalid) {
                  showError(
                    _applyDiscount.invalid_description || "Không có coupon thỏa mãn cho sản phẩm",
                  );
                  setDiscountValue("");
                } else {
                  handleBeforeApplyDiscount(_applyDiscount as any);
                }
              } else {
                showError(`Không có coupon thỏa mãn cho sản phẩm`);
                setDiscountValue("");
              }

              setSuggestedDiscounts([]);
              setShowSearchPromotion(false);
            }
          } else {
            handleFetchApiError(response, "apply chiết khấu", dispatch);
          }
        })
        .catch(() => {})
        .finally(() => {});
    },
    [props.param, handleBeforeApplyDiscount, dispatch],
  );

  const removeDiscountItem = useCallback(() => {
    if (!props.item) return;
    let _item = { ...props.item };
    _item.isLineItemSemiAutomatic = false;
    _item.discount_amount = 0;
    _item.discount_items = [];
    _item.discount_rate = 0;
    _item.discount_value = 0;
    _item.line_amount_after_line_discount = getLineAmountAfterLineDiscount(_item);
    props.handleApplyDiscountItem(_item);
    setSuggestedDiscounts([]);
    setSelected(DISCOUNT_TYPE.MONEY);
  }, [props]);
  const ChangeValueDiscount = useCallback(
    (keyWord) => {
      if (keyWord.length <= 0) {
        setShowSearchPromotion(false);
        return;
      }
      if (!props.item) return;
      handleSearchPromotionApply(props.item, keyWord.trim(), selected);
    },
    [props.item, handleSearchPromotionApply, selected],
  );

  const handCloseSelectPromotion = useCallback(() => {
    setShowSearchPromotion(false);
    let value: any =
      selected === DISCOUNT_TYPE.PERCENT ? props.discountRate : Math.round(props.discountAmount);
    const _discountValue =
      value !== null && value !== undefined && value !== "" && value !== 0 ? value.toString() : "";
    setDiscountValue(_discountValue ? formatCurrency(_discountValue) : "");
  }, [props.discountAmount, props.discountRate, selected]);
  useEffect(() => {
    let value: any =
      selected === DISCOUNT_TYPE.PERCENT ? props.discountRate : Math.round(props.discountAmount);
    const _discountValue =
      value !== null && value !== undefined && value !== "" && value !== 0 ? value.toString() : "";
    setDiscountValue(_discountValue ? formatCurrency(_discountValue) : "");
  }, [props.discountAmount, props.discountRate, selected]);
  useEffect(() => {
    setSelected(props.discountType);
  }, [props.discountType]);
  useEffect(() => {
    var element = document.getElementById(`promotion_${props.index}`);
    const handleClickOutside = (event: any) => {
      if (element && event.target !== element && !element.contains(event.target)) {
        console.log("handCloseSelectPromotion");
        handCloseSelectPromotion();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handCloseSelectPromotion, props.index]);

  return (
    <StyledComponent>
      <div id={`promotion_${props.index}`}>
        <Input.Group compact>
          <Select
            onChange={(value: string) => changeDiscountType(value)}
            value={selected}
            disabled={props.item?.discount_items[0]?.promotion_id ? true : disabled}
            style={{ width: "30%" }}
          >
            <Select.Option value={DISCOUNT_TYPE.PERCENT}>%</Select.Option>
            <Select.Option value={DISCOUNT_TYPE.MONEY}>₫</Select.Option>
            <Select.Option value={DISCOUNT_TYPE.COUPON}>
              <img src={discountCoupon} alt="" width={12} />
            </Select.Option>
          </Select>

          <Input
            className="input"
            style={{ textAlign: "right" }}
            onChange={(v) => {
              let keyWord: string = v.target.value;

              if (
                selected !== DISCOUNT_TYPE.COUPON &&
                keyWord &&
                !RegUtil.ONLY_NUMBER.test(keyWord.trim())
              ) {
                showError("Chỉ được nhập số");
                return;
              }

              if (selected === DISCOUNT_TYPE.PERCENT && Number(keyWord) > 100) {
                setDiscountValue("100");
                return;
              }

              setDiscountValue(keyWord);

              if (selected === DISCOUNT_TYPE.COUPON) {
                return;
              }

              handleDelayActionWhenInsertTextInSearchInput(
                inputRef,
                () => ChangeValueDiscount(keyWord),
                500,
              );
            }}
            value={discountValue}
            placeholder={
              selected === DISCOUNT_TYPE.PERCENT
                ? "Nhập số %"
                : selected === DISCOUNT_TYPE.MONEY
                ? "Nhập số tiền"
                : selected === DISCOUNT_TYPE.COUPON
                ? "Nhập mã giảm giá"
                : ""
            }
            onFocus={(e) => {
              e.target.setSelectionRange(0, e.target.value.length);
              if (e.target.value.length !== 0 && data.length !== 0) {
                setShowSearchPromotion(true);
              }
            }}
            // onBlur={(e) => {
            //   props.onBlur && props.onBlur();
            //   if (!props.item?.discount_items[0]?.promotion_id) {
            //     setDiscountValue("");
            //   }
            // }}
            ref={inputRef}
            disabled={disableInput}
            onPressEnter={(e: any) => {
              let keyWord: string = e.target.value;
              if (selected === DISCOUNT_TYPE.COUPON) {
                ChangeValueDiscount(keyWord?.trim());
              }
            }}
          />

          {props.item?.discount_items[0]?.promotion_id && !disabled && (
            <CloseCircleOutlined className="close-discount-item" onClick={removeDiscountItem} />
          )}

          {!props.item?.discount_items[0]?.promotion_id &&
            !disabled &&
            selected === DISCOUNT_TYPE.COUPON && (
              <RedoOutlined
                className="load-coupon-discount-item"
                onClick={() => ChangeValueDiscount(discountValue)}
              />
            )}
        </Input.Group>
        {showResult && (
          <div className="d-flex justify-content-end yody-table-discount-converted">
            {props.item?.discount_items[0]?.discount_code && (
              <Text type="danger" style={{ paddingRight: 35 }}>
                {props.item?.discount_items[0]?.discount_code}
              </Text>
            )}

            <Text type="danger">
              {selected === DISCOUNT_TYPE.MONEY
                ? formatPercentage(props.discountRate) + "%"
                : formatCurrency(props.discountAmount)}
            </Text>
          </div>
        )}

        {showSearchPromotion === true && (
          <SelectedPromotion
            handClose={handCloseSelectPromotion}
            data={data}
            handleApplyDiscountItem={handleBeforeApplyDiscount}
          />
        )}
      </div>
    </StyledComponent>
  );
}

export default DiscountItemSearch;
