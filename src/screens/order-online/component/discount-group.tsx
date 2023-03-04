import { Input, Select, Typography } from "antd";
import OrderNumberInputCustom from "component/custom/order/order-number-input.custom";
import _ from "lodash";
import { DiscountValueType } from "model/promotion/price-rules.model";
import { OrderLineItemRequest } from "model/request/order.request";
import {
  CustomApplyDiscount,
  SuggestDiscountResponseModel,
} from "model/response/order/promotion.response";
import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
  formatCurrency,
  formatPercentage,
  getLineAmountAfterLineDiscount,
  getLineItemDiscountAmount,
  getLineItemDiscountRate,
  getLineItemDiscountValue,
  replaceFormatString,
} from "utils/AppUtils";
import { DISCOUNT_TYPE } from "utils/Constants";
import { showError } from "utils/ToastUtils";
import SelectedPromotion from "./DiscountItemSearch/SelectedPromotion";

type PropTypes = {
  price: number;
  index: number;
  discountRate: number;
  discountAmount: number;
  discountType: string;
  items?: Array<OrderLineItemRequest>;
  handleCardItems: (_items: Array<OrderLineItemRequest>) => void;
  disabled?: boolean;
  onBlur: () => void;
  handleApplyDiscountItem: (_item: any) => void;
  initItemSuggestDiscounts: SuggestDiscountResponseModel[];
  isShowSuggestDiscount?: boolean;
};

function DiscountGroup(props: PropTypes) {
  console.log("props", props);
  const { items, disabled = false, initItemSuggestDiscounts, isShowSuggestDiscount } = props;
  const { Text } = Typography;
  console.log("DiscountGroup discountType", props.discountType);
  const [selected, setSelected] = useState(props.discountType);
  // const [isInputFocus, setIsInputFocus] = useState(false);
  console.log("selected333", selected);
  let showResult = true;

  const [showSearchPromotion, setShowSearchPromotion] = useState(false);
  console.log("showSearchPromotion", showSearchPromotion);
  const handCloseSelectPromotion = useCallback(() => {
    setShowSearchPromotion(false);
  }, []);
  const handleBeforeApplyDiscount = useCallback(
    (discountItem: CustomApplyDiscount) => {
      if (!items) {
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

      let _item = { ...items[props.index] };

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
        _itemDiscount.type = DISCOUNT_TYPE.MONEY;
      } else if (discountType === DISCOUNT_TYPE.PERCENT) {
        if (100 < discountValue) {
          discountValue = 100;
          showError("Chiết khấu không lớn hơn 100%!");
        }
        _itemDiscount.value = Math.round((discountValue * _price) / 100);
        _itemDiscount.rate = discountValue;
        _itemDiscount.amount = (discountValue * _item.amount) / 100;
        _itemDiscount.type = DISCOUNT_TYPE.PERCENT;
      } else if (discountType === DiscountValueType.FIXED_PRICE) {
        //đồng giá
        const newItemPrice = Math.abs(_item.price - discountValue);
        _itemDiscount.amount = newItemPrice * _item.quantity;
        _itemDiscount.rate = (discountValue / _item.amount) * 100;
        _itemDiscount.value = newItemPrice;
        _itemDiscount.type = DISCOUNT_TYPE.MONEY;
      }
      _item.isLineItemSemiAutomatic = true; //là chiết khấu bán tự động
      _item.isLineItemHasSpecialDiscountInReturn = true; //là chiết khấu khi tạo đổi
      _item.discount_value = getLineItemDiscountValue(_item);
      _item.discount_amount = getLineItemDiscountAmount(_item);
      _item.discount_rate = getLineItemDiscountRate(_item);
      _item.line_amount_after_line_discount = getLineAmountAfterLineDiscount(_item);
      //console.log("handleBeforeApplyDiscount", _item);
      props.handleApplyDiscountItem(_item);
      setShowSearchPromotion(false);
    },
    [items, props],
  );
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
    return initItemSuggestDiscounts.map((p) => {
      return {
        ...p,
        calculate_discount: calculateDiscount(
          p,
          items && items[props.index].price ? items[props.index].price : 0,
        ),
        after_value: getAfterValue(
          p,
          items && items[props.index].price ? items[props.index].price : 0,
        ),
      };
    });
  }, [initItemSuggestDiscounts, items, props.index]);

  const changeDiscountType = (value: string) => {
    setSelected(value);
  };

  const ChangeValueDiscount = useCallback(
    (v) => {
      console.log("v1111", v);
      if (!items || v === props.discountRate || v === props.discountAmount) {
        return;
      }
      // khi clear chiết khấu mà có initItemSuggestDiscounts thì show lên
      if (!v) {
        if (initItemSuggestDiscounts.length > 0 && isShowSuggestDiscount) {
          setShowSearchPromotion(true);
        }
      } else {
        setShowSearchPromotion(false);
      }
      if (v < 0) v = -v;
      if (selected === DISCOUNT_TYPE.PERCENT) {
        v = Math.round(v * 100) / 100;
      } else {
        v = Math.round(v);
      }
      // let _items = [...items];
      let _items = _.cloneDeep(items);
      console.log("_items", _items);
      let _item = _items[props.index];
      if (_item.discount_items.length === 0) {
        _item.discount_items = [
          {
            amount: 0,
            value: 0,
            rate: 0,
            reason: "",
            discount_code: "",
            promotion_id: undefined,
          },
        ];
      }
      let _itemDiscount = _item.discount_items[0];

      let _price = _items[props.index].price;
      if (selected === DISCOUNT_TYPE.MONEY) {
        if (_items[props.index].amount < v) {
          showError("Chiết khấu không lớn hơn giá sản phẩm!");
          v = _items[props.index].amount;
        }
        _itemDiscount.amount = v;
        _itemDiscount.rate = (v / _items[props.index].amount) * 100;
        _itemDiscount.value = Math.round(v / _items[props.index].quantity);
        _itemDiscount.sub_type = DiscountValueType.FIXED_AMOUNT;
      } else {
        if (100 < v) {
          v = 100;
          showError("Chiết khấu không lớn hơn 100%!");
        }
        _itemDiscount.value = Math.round((v * _price) / 100);
        _itemDiscount.rate = v;
        _itemDiscount.amount = (v * _items[props.index].amount) / 100;
        _itemDiscount.sub_type = DiscountValueType.PERCENTAGE;
      }

      _itemDiscount.type = selected;
      _itemDiscount.taxable = false;
      _item.discount_value = getLineItemDiscountValue(_item);
      _item.discount_amount = getLineItemDiscountAmount(_item);
      _item.discount_rate = getLineItemDiscountRate(_item);
      _item.isLineItemHasSpecialDiscountInReturn = false;
      _item.line_amount_after_line_discount = getLineAmountAfterLineDiscount(_item);
      if (_item.discount_items.length === 0 || !_item.discount_items[0]?.amount) {
        // _item.discount_items = [];
      }
      console.log("_items", _items);
      props.handleCardItems(_items);
    },
    [initItemSuggestDiscounts.length, isShowSuggestDiscount, items, props, selected],
  );

  useEffect(() => {
    console.log("props.discountType", props.discountType);
    setSelected(props.discountType);
  }, [props.discountType]);

  useEffect(() => {
    var element = document.getElementById(`promotion_${props.index}`);
    const handleClickOutside = (event: any) => {
      if (element && event.target !== element && !element.contains(event.target)) {
        console.log("handCloseSelectPromotion");
        // setIsInputFocus(false);
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
    <div id={`promotion_${props.index}`}>
      <Input.Group compact>
        <Select onChange={(value: string) => changeDiscountType(value)} value={selected}>
          <Select.Option value={DISCOUNT_TYPE.PERCENT}>%</Select.Option>
          <Select.Option value={DISCOUNT_TYPE.MONEY}>₫</Select.Option>
        </Select>
        <OrderNumberInputCustom
          className="hide-number-handle "
          onChange={(v) => ChangeValueDiscount(v)}
          format={(a: string) => {
            if (selected === DISCOUNT_TYPE.MONEY) {
              return formatCurrency(a);
            } else {
              return formatPercentage(a);
            }
          }}
          replace={(a: string) => replaceFormatString(a)}
          placeholder="VD: 100,000"
          disabled={disabled}
          onFocus={(e) => {
            console.log("e", e);
            // setIsInputFocus(true);
            if (e.target.value === "0" && isShowSuggestDiscount) {
              console.log("3333333");
              setShowSearchPromotion(true);
            }
            e.target.setSelectionRange(0, e.target.value.length);
          }}
          min={0}
          max={
            selected === DISCOUNT_TYPE.PERCENT
              ? 100
              : props.items
              ? props.items[props.index].price * props.items[props.index].quantity
              : 0
          }
          value={
            selected === DISCOUNT_TYPE.PERCENT
              ? props.discountRate
              : Math.round(props.discountAmount)
          }
          // onBlur={props.onBlur}
        />
      </Input.Group>
      {showResult && (
        <div className="d-flex justify-content-end yody-table-discount-converted">
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
  );
}

export default DiscountGroup;
