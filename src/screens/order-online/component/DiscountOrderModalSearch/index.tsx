import { Button, Input, Modal, Radio, Row, Space } from "antd";
import { DISCOUNT_TYPE } from "utils/Constants";
import { StyledComponent } from "./styled";
import discountCoupon from "assets/icon/discount-coupon.svg";
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import TableSelectedPromotion from "./TableSelectedPromotion";
import { applyDiscountService } from "service/promotion/discount/discount.service";
import {
  handleDelayActionWhenInsertTextInSearchInput,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import {
  CustomApplyDiscount,
  SuggestDiscountResponseModel,
} from "model/response/order/promotion.response";
import { useDispatch } from "react-redux";
import { DiscountValueType } from "model/promotion/price-rules.model";
import { RegUtil } from "utils/RegUtils";
import _ from "lodash";
import { LoadingOutlined } from "@ant-design/icons";
import { showError } from "utils/ToastUtils";
import discountMoney from "assets/icon/order-money.svg";
import discountPercent from "assets/icon/order-percent.svg";

type Props = {
  visible: boolean;
  onCancelDiscountModal: (e: React.MouseEvent<HTMLElement>) => void;
  onOkDiscountModal: (discountOrder?: CustomApplyDiscount) => void;
  type: string;
  value: number;
  rate: number;
  amount: number;
  param: any;
  isCustomOriginalHandmadeDiscount?: boolean;
  initOrderSuggestDiscounts: SuggestDiscountResponseModel[];
};

const DiscountOrderModalSearch: React.FC<Props> = (props: Props) => {
  const { initOrderSuggestDiscounts } = props;
  console.log("initOrderSuggestDiscounts", initOrderSuggestDiscounts);
  const dispatch = useDispatch();
  const inputRef = useRef<any>();
  const [showSearchPromotion, setShowSearchPromotion] = useState(false);
  const [suggestedDiscounts, setSuggestedDiscounts] = useState<SuggestDiscountResponseModel[]>([]);
  const [_type, setType] = useState<string>(props.type);
  const [discountValue, setDiscountValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const getAfterValue = (discount: any, totalAmount?: number) => {
    if (!totalAmount) totalAmount = 0;

    if (discount.value_type === DiscountValueType.PERCENTAGE) {
      return totalAmount - _.round(((discount.value || 0) * totalAmount) / 100);
    } else {
      return totalAmount - (discount.value || 0);
    }
  };

  const calculateDiscount = (discount: any, totalAmount?: number) => {
    return discount.value_type === DiscountValueType.FIXED_PRICE
      ? Math.abs((totalAmount ?? 0) - (discount.value ?? 0))
      : discount.value;
  };

  const data = useMemo(() => {
    return suggestedDiscounts.map((p) => {
      return {
        ...p,
        calculate_discount: calculateDiscount(p, props.amount),
        after_value: getAfterValue(p, props.amount),
      };
    });
  }, [suggestedDiscounts, props.amount]);

  const handleSearchPromotionApply = useCallback(
    (keyword: string, type: string) => {
      let params: any = {
        ...props.param,
        applied_discount: null,
        taxes_included: true,
        tax_exempt: false,
      };

      if (type === DISCOUNT_TYPE.MONEY) {
        params.keyword = keyword;
        params.search_type = DiscountValueType.FIXED_PRICE;
      } else if (type === DISCOUNT_TYPE.PERCENT) {
        params.keyword = keyword;
        params.search_type = DiscountValueType.PERCENTAGE;
      } else if (type === DISCOUNT_TYPE.COUPON) {
        params.applied_discount = {
          code: keyword,
        };
      }
      setIsLoading(true);
      applyDiscountService(params)
        .then((response) => {
          setIsLoading(false);
          if (isFetchApiSuccessful(response)) {
            if (type === DISCOUNT_TYPE.MONEY || type === DISCOUNT_TYPE.PERCENT) {
              const suggestedDiscounts = response.data.suggested_discounts;
              if (suggestedDiscounts && suggestedDiscounts.length !== 0) {
                setSuggestedDiscounts(suggestedDiscounts);
                setShowSearchPromotion(true);
              } else {
                showError(`Không có chương trình thỏa mãn cho đơn hàng`);
              }
            } else if (type === DISCOUNT_TYPE.COUPON) {
              const listApplyDiscount = response.data.applied_discount;
              if (listApplyDiscount.invalid) {
                showError(listApplyDiscount.invalid_description);
              } else {
                props.onOkDiscountModal(listApplyDiscount);
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
    [props, dispatch],
  );

  const ChangeValueDiscount = useCallback(
    (keyWord) => {
      if (keyWord.length <= 0) {
        if (_type === DISCOUNT_TYPE.MONEY) {
          setSuggestedDiscounts(initOrderSuggestDiscounts);
          setShowSearchPromotion(true);
        }
        return;
      }
      setShowSearchPromotion(false);
      handleSearchPromotionApply(keyWord, _type);
    },
    [_type, handleSearchPromotionApply, initOrderSuggestDiscounts],
  );

  const handleChangeSelect = (type: string) => {
    setType(type);
    setShowSearchPromotion(false);
    setSuggestedDiscounts([]);
  };

  const onchangeDiscount = (value: any) => {
    setDiscountValue(value);
  };

  useEffect(() => {
    setType(DISCOUNT_TYPE.MONEY);
    setDiscountValue("");
    setSuggestedDiscounts([]);
    setShowSearchPromotion(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.visible]);
  // useEffect(() => {
  //   if (props.rate && props.value) {
  //     let value: any = _type === DISCOUNT_TYPE.PERCENT ? props.rate : Math.round(props.value);
  //     setDiscountValue(
  //       value !== null && value !== undefined && value !== "" && value !== 0
  //         ? value.toString()
  //         : "",
  //     );
  //   }

  //   if (props.type) {
  //     setType(props.type);
  //   }
  // }, [_type, props.rate, props.value, props.visible, props.type]);
  return (
    <Modal
      width={700}
      title="Thêm khuyến mại"
      onCancel={props.onCancelDiscountModal}
      centered
      visible={props.visible}
      footer={false}
    >
      <StyledComponent>
        <Row>
          <Radio.Group
            onChange={(tg) => {
              handleChangeSelect(tg.target.value);
            }}
            value={_type}
          >
            <Space direction="vertical">
              <Radio value={DISCOUNT_TYPE.MONEY}>Chiết khấu tiền</Radio>
              <Radio value={DISCOUNT_TYPE.PERCENT}>Chiết khấu phần trăm</Radio>
              <Radio value={DISCOUNT_TYPE.COUPON}>Mã khuyến mại</Radio>
            </Space>
          </Radio.Group>
        </Row>

        <Row className="row-discount-input">
          {_type !== DISCOUNT_TYPE.COUPON && props.isCustomOriginalHandmadeDiscount && (
            <React.Fragment>
              <Input
                className="input-discount-coupon"
                onChange={(v) => {
                  let newValue: string = v.target.value;

                  if (
                    _type !== DISCOUNT_TYPE.COUPON &&
                    newValue &&
                    !RegUtil.ONLY_NUMBER.test(newValue.trim())
                  ) {
                    showError("Chỉ được nhập số");
                    return;
                  }

                  if (_type === DISCOUNT_TYPE.PERCENT && Number(newValue) > 100) {
                    onchangeDiscount("100");
                    return;
                  }

                  onchangeDiscount(newValue);

                  // if (_type === DISCOUNT_TYPE.COUPON) {
                  //   return;
                  // }

                  // handleDelayActionWhenInsertTextInSearchInput(
                  //   inputRef,
                  //   () => {
                  //     ChangeValueDiscount(newValue);
                  //   },
                  //   500,
                  // );
                }}
                value={discountValue}
                placeholder="Tìm kiếm chiết khấu theo ..."
                onFocus={(e) => {
                  e.target.setSelectionRange(0, e.target.value.length);
                  if (e.target.value.length !== 0 && data.length !== 0) {
                    setShowSearchPromotion(true);
                  }
                  if (e.target.value.length === 0) {
                    console.log("333333333");
                    if (_type === DISCOUNT_TYPE.MONEY && suggestedDiscounts.length === 0) {
                      setSuggestedDiscounts(initOrderSuggestDiscounts);
                      setShowSearchPromotion(true);
                    }
                  }
                }}
                prefix={
                  isLoading ? (
                    <LoadingOutlined style={{ color: "#2a2a86" }} />
                  ) : _type === DISCOUNT_TYPE.PERCENT ? (
                    <img src={discountPercent} alt="" />
                  ) : _type === DISCOUNT_TYPE.MONEY ? (
                    <img src={discountMoney} alt="" />
                  ) : undefined
                }
                ref={inputRef}
                onPressEnter={() =>
                  _type === DISCOUNT_TYPE.COUPON && ChangeValueDiscount(discountValue)
                }
              />
              <Button
                type="primary"
                onClick={() => {
                  if (!_type && !discountValue) {
                    showError("Chưa chọn loại chiết khấu hoặc nhập giá trị giảm");
                    return;
                  }
                  const _data: CustomApplyDiscount = {
                    allocation_count: null,
                    allocation_limit: null,
                    price_rule_id: null,
                    title: null,
                    value: Number(discountValue),
                    value_type:
                      _type === DISCOUNT_TYPE.MONEY
                        ? DiscountValueType.FIXED_AMOUNT
                        : DiscountValueType.PERCENTAGE,
                    is_registered: false,
                  };
                  props.onOkDiscountModal(_data);
                }}
              >
                Áp dụng
              </Button>
            </React.Fragment>
          )}
          {_type !== DISCOUNT_TYPE.COUPON && !props.isCustomOriginalHandmadeDiscount && (
            <Input
              //className={_type === DISCOUNT_TYPE.COUPON ? "input-discount-coupon" : undefined}
              onChange={(v) => {
                let newValue: string = v.target.value;

                if (
                  _type !== DISCOUNT_TYPE.COUPON &&
                  newValue &&
                  !RegUtil.ONLY_NUMBER.test(newValue.trim())
                ) {
                  showError("Chỉ được nhập số");
                  return;
                }

                if (_type === DISCOUNT_TYPE.PERCENT && Number(newValue) > 100) {
                  onchangeDiscount("100");
                  return;
                }

                onchangeDiscount(newValue);

                if (_type === DISCOUNT_TYPE.COUPON) {
                  return;
                }

                handleDelayActionWhenInsertTextInSearchInput(
                  inputRef,
                  () => {
                    ChangeValueDiscount(newValue);
                  },
                  500,
                );
              }}
              value={discountValue}
              placeholder="Tìm kiếm chiết khấu theo ..."
              onFocus={(e) => {
                e.target.setSelectionRange(0, e.target.value.length);
                if (e.target.value.length !== 0 && data.length !== 0) {
                  setShowSearchPromotion(true);
                }
                if (e.target.value.length === 0) {
                  console.log("333333333");
                  if (_type === DISCOUNT_TYPE.MONEY && suggestedDiscounts.length === 0) {
                    setSuggestedDiscounts(initOrderSuggestDiscounts);
                    setShowSearchPromotion(true);
                  }
                }
              }}
              prefix={
                isLoading ? (
                  <LoadingOutlined style={{ color: "#2a2a86" }} />
                ) : _type === DISCOUNT_TYPE.PERCENT ? (
                  <img src={discountPercent} alt="" />
                ) : _type === DISCOUNT_TYPE.MONEY ? (
                  <img src={discountMoney} alt="" />
                ) : undefined
              }
              ref={inputRef}
              onPressEnter={() =>
                _type === DISCOUNT_TYPE.COUPON && ChangeValueDiscount(discountValue)
              }
            />
          )}

          {_type === DISCOUNT_TYPE.COUPON && (
            <React.Fragment>
              <Input
                className="input-discount-coupon"
                onChange={(v) => {
                  let newValue: string = v.target.value;

                  if (
                    _type !== DISCOUNT_TYPE.COUPON &&
                    newValue &&
                    !RegUtil.ONLY_NUMBER.test(newValue.trim())
                  ) {
                    showError("Chỉ được nhập số");
                    return;
                  }

                  if (_type === DISCOUNT_TYPE.PERCENT && Number(newValue) > 100) {
                    onchangeDiscount("100");
                    return;
                  }

                  onchangeDiscount(newValue);

                  if (_type === DISCOUNT_TYPE.COUPON) {
                    return;
                  }

                  handleDelayActionWhenInsertTextInSearchInput(
                    inputRef,
                    () => {
                      ChangeValueDiscount(newValue);
                    },
                    500,
                  );
                }}
                value={discountValue}
                placeholder="Tìm kiếm chiết khấu theo ..."
                onFocus={(e) => {
                  e.target.setSelectionRange(0, e.target.value.length);
                  if (e.target.value.length !== 0 && data.length !== 0) {
                    setShowSearchPromotion(true);
                  }
                }}
                prefix={
                  isLoading ? (
                    <LoadingOutlined style={{ color: "#2a2a86" }} />
                  ) : (
                    <img src={discountCoupon} alt="" />
                  )
                }
                ref={inputRef}
                onPressEnter={() =>
                  _type === DISCOUNT_TYPE.COUPON && ChangeValueDiscount(discountValue)
                }
              />
              <Button type="primary" onClick={() => ChangeValueDiscount(discountValue)}>
                Áp dụng
              </Button>
            </React.Fragment>
          )}
        </Row>

        {showSearchPromotion && (
          <TableSelectedPromotion
            data={data}
            handleApplyDiscountItem={(data) => {
              setShowSearchPromotion(false);
              props.onOkDiscountModal(data);
            }}
          />
        )}
      </StyledComponent>
    </Modal>
  );
};

export default DiscountOrderModalSearch;
