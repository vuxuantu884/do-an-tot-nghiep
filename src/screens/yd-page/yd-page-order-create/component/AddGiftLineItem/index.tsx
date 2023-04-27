import { Button, Col, Modal, Pagination, Radio, RadioChangeEvent, Row, Space } from "antd";
import { useDispatch } from "react-redux";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RadioGroup } from "./styled";
import { OrderItemDiscountRequest, OrderLineItemRequest } from "model/request/order.request";
import { DiscountValueType } from "model/promotion/price-rules.model";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { applyDiscountService } from "service/promotion/discount/discount.service";
import { DiscountRequestModel } from "model/request/promotion.request";
import {
  findAvatar,
  findPriceInVariant,
  findTaxInVariant,
  flattenArray,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import { SuggestDiscountResponseModel } from "model/response/order/promotion.response";
import { PagingParam, ResultPaging } from "model/paging";
import { flatDataPaging } from "utils/Paging";
import GiftSelected from "./GiftSelected";
import { ApplyDiscountGiftsResponseModel } from "model/response/order/promotion.response";
import { searchVariantsApi } from "service/product/product.service";
import { Type } from "config/type.config";
import { VariantResponse } from "model/product/product.model";
import { AppConfig } from "config/app.config";
import { showError } from "utils/ToastUtils";
import { EnumGiftType } from "config/enum.config";

type Props = {
  onOk: (
    items: Array<OrderLineItemRequest>,
    _giftProgramForAllOrdersOrProduct: string | null,
  ) => void;
  param: DiscountRequestModel;
  priceRuleId: number | null;
  selectedItem: OrderLineItemRequest;
  giftProgramForAllOrdersOrProduct?: string | null;
  disabled?: boolean;
  itemsGift?: OrderLineItemRequest[];
};

const resultPagingDefault: ResultPaging = {
  currentPage: 1,
  lastPage: 1,
  perPage: 10,
  total: 0,
  result: [],
};
interface CustomSuggestDiscountResponseModel extends SuggestDiscountResponseModel {
  variantCurrenId?: number | null;
  isDiscountType?: EnumGiftType.BY_ITEM | EnumGiftType.BY_ORDER | null;
}
const AddGiftLineItem: React.FC<Props> = (props: Props) => {
  const { onOk, priceRuleId, giftProgramForAllOrdersOrProduct, selectedItem, itemsGift } = props;
  const dispatch = useDispatch();

  const [isVisibleGift, setVisibleGift] = useState(false);
  const [suggestDiscounts, setSuggestDiscounts] = useState<CustomSuggestDiscountResponseModel[]>();
  const [giftProgramDisplayList, setGiftProgramDisplayList] = useState<
    ApplyDiscountGiftsResponseModel[]
  >([]);
  const [selectedPriceRuleId, setSelectedPriceRuleId] = useState<number | null | undefined>(
    priceRuleId,
  );

  const [pagingParam, setPagingParam] = useState<PagingParam>({
    currentPage: resultPagingDefault.currentPage,
    perPage: resultPagingDefault.perPage,
  });
  const [resultPaging, setResultPaging] = useState<ResultPaging>(resultPagingDefault);

  const [selectedVariantId, setSelectedVariantId] = useState<number[]>([]);

  const selectedVariantIdDefault = useMemo(() => {
    if (!itemsGift) return [];
    return itemsGift?.map((p) => p.variant_id);
  }, [itemsGift]);

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
      product_code: variant.product_code || "",
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
      tax_include: true,
      tax_rate: taxRate,
      show_note: false,
      gifts: [],
      position: undefined,
      available: variant.available,
      taxable: variant.taxable,
    };
    return orderLine;
  };

  const handleGiftProgramDisplayList = (
    _priceRuleId: number,
    _v: CustomSuggestDiscountResponseModel[] | undefined,
  ) => {
    const _suggestDiscountActive = _v?.find((p) => p.price_rule_id === _priceRuleId);
    if (_suggestDiscountActive && _suggestDiscountActive.gifts) {
      setGiftProgramDisplayList(_suggestDiscountActive.gifts);
    } else {
      setGiftProgramDisplayList([]);
    }
  };

  const onOkPress = useCallback(() => {
    (async () => {
      const currentPromotion = resultPaging.result?.find(
        (p: CustomSuggestDiscountResponseModel) => p.price_rule_id === selectedPriceRuleId,
      );

      let orderDiscountModel: OrderItemDiscountRequest = {
        rate: 100,
        value: 0,
        amount: 0,
        promotion_id: currentPromotion?.price_rule_id || null,
        promotion_title: currentPromotion?.title || null,
        order_id: 0,
        discount_code: "",
        reason: "",
        source: "",
        type: DiscountValueType.PERCENTAGE,
        sub_type: DiscountValueType.PERCENTAGE,
        taxable: false,
      };

      const variantIdsApplyDiscount = giftProgramDisplayList
        .map((p) => p.variant_id)
        .filter((p) => selectedVariantId.includes(p));

      if (variantIdsApplyDiscount.length === 0) {
        showError("Qùa tặng chưa được chọn");
        return;
      }

      const initialRequest: any = {
        variant_ids: variantIdsApplyDiscount,
        limit: giftProgramDisplayList.length,
      };
      dispatch(showLoading());

      const response = await searchVariantsApi(initialRequest);
      setVisibleGift(false);
      dispatch(hideLoading());
      if (isFetchApiSuccessful(response)) {
        const _itemsGift: OrderLineItemRequest[] = response.data.items.map((p) => {
          const _v = createItem(p);
          currentPromotion?.isDiscountType && (_v.type = currentPromotion?.isDiscountType);
          _v.discount_items = [orderDiscountModel];

          return _v;
        });
        onOk(_itemsGift, currentPromotion?.isDiscountType || null);
      } else {
        handleFetchApiError(response, "apply quà tặng", dispatch);
      }
    })();
  }, [
    dispatch,
    resultPaging.result,
    giftProgramDisplayList,
    onOk,
    selectedPriceRuleId,
    selectedVariantId,
  ]);

  const onChangePaginationPromotion = (page: number, pageSize?: number) => {
    setPagingParam({ perPage: pageSize || 20, currentPage: page });
  };

  const onChangePromotionRadio = (e: RadioChangeEvent) => {
    setSelectedPriceRuleId((e.target.value as number) || null);
    if (e.target.value) {
      handleGiftProgramDisplayList(e.target.value, suggestDiscounts);
      if (priceRuleId === e.target.value) {
        setSelectedVariantId(selectedVariantIdDefault);
      } else {
        setSelectedVariantId([]);
      }
    }
  };

  useEffect(() => {
    if (isVisibleGift) {
      setSelectedPriceRuleId(priceRuleId);
      (async () => {
        dispatch(showLoading());
        try {
          const response = await applyDiscountService(props.param);
          dispatch(hideLoading());
          if (isFetchApiSuccessful(response)) {
            const _suggestedDiscounts: CustomSuggestDiscountResponseModel[] = [];
            if (
              response.data.suggested_discounts &&
              response.data.suggested_discounts.length !== 0
            ) {
              const customSuggestedDiscounts = response.data.suggested_discounts.map(
                (p: CustomSuggestDiscountResponseModel) => ({
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
              const suggestedDiscountsItem = flattenArray(
                mapSuggestedDiscountsItem,
              ) as CustomSuggestDiscountResponseModel[];

              const suggestedDiscountsItemAddDiscountType = suggestedDiscountsItem.map((p) => ({
                ...p,
                variantCurrenId: p.variantCurrenId,
                isDiscountType: EnumGiftType.BY_ITEM,
              }));
              _suggestedDiscounts.push(...suggestedDiscountsItemAddDiscountType);
            }

            // const uniqueArraySuggestedDiscounts = _suggestedDiscounts.filter(
            //   (obj, index, self) =>
            //     index === self.findIndex((o) => o.price_rule_id === obj.price_rule_id),
            // );

            const suggestedDiscountsWithGifts = _suggestedDiscounts.filter(
              (p) => p.gifts && p.gifts?.length !== 0,
            );

            setSuggestDiscounts(suggestedDiscountsWithGifts);
            if (priceRuleId) {
              handleGiftProgramDisplayList(priceRuleId, suggestedDiscountsWithGifts);
              setSelectedVariantId(selectedVariantIdDefault);
            } else {
              setGiftProgramDisplayList([]);
            }
          } else {
            handleFetchApiError(response, "apply quà tặng", dispatch);
          }
        } catch (e) {
          console.log(e);
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isVisibleGift]);

  useEffect(() => {
    if (!suggestDiscounts || (suggestDiscounts && suggestDiscounts.length <= 0)) {
      setResultPaging(resultPagingDefault);
    } else {
      const uniqueArraySuggestedDiscounts = suggestDiscounts.filter(
        (obj, index, self) =>
          index === self.findIndex((o) => o.price_rule_id === obj.price_rule_id),
      );
      let result = flatDataPaging(uniqueArraySuggestedDiscounts, pagingParam);

      setResultPaging(result);
    }
  }, [suggestDiscounts, pagingParam]);

  const disableSuggestDiscountRadioButton = (item: CustomSuggestDiscountResponseModel) => {
    if (
      giftProgramForAllOrdersOrProduct === EnumGiftType.BY_ORDER &&
      item.isDiscountType !== EnumGiftType.BY_ORDER
    ) {
      return true;
    }
    if (
      giftProgramForAllOrdersOrProduct === EnumGiftType.BY_ITEM &&
      item.isDiscountType !== EnumGiftType.BY_ITEM
    ) {
      return true;
    }

    const variantCurrenIds =
      suggestDiscounts
        ?.filter((p) => p.price_rule_id === item.price_rule_id)
        ?.map((p) => p.variantCurrenId) || [];

    if (
      item.isDiscountType === EnumGiftType.BY_ITEM &&
      !variantCurrenIds.includes(selectedItem.variant_id)
    ) {
      return true;
    }

    if (!giftProgramForAllOrdersOrProduct) {
      return false;
    }

    return false;
  };

  return (
    <>
      <Button
        disabled={props.disabled}
        type="text"
        onClick={() => setVisibleGift(true)}
        style={{
          paddingLeft: 24,
          background: "transparent",
          border: "none",
        }}
      >
        Thêm quà tặng
      </Button>
      <Modal
        centered
        title="Chọn quà khuyến mại"
        width={800}
        onCancel={() => setVisibleGift(false)}
        onOk={onOkPress}
        visible={isVisibleGift}
        cancelText="Hủy"
        okText="Lưu"
        okButtonProps={{
          disabled: !selectedPriceRuleId,
        }}
      >
        <div
          style={{
            height: 500,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 8,
          }}
        >
          <div>
            <h4>Chương trình quà tặng</h4>
            <RadioGroup value={selectedPriceRuleId} onChange={onChangePromotionRadio}>
              <Space direction="vertical">
                {resultPaging &&
                  resultPaging?.result?.map(
                    (item: CustomSuggestDiscountResponseModel, idx: number) => {
                      return (
                        <Radio
                          key={idx}
                          value={item.price_rule_id}
                          disabled={disableSuggestDiscountRadioButton(item)}
                        >
                          {item.title}
                        </Radio>
                      );
                    },
                  )}
              </Space>
            </RadioGroup>

            <Pagination
              simple
              onChange={onChangePaginationPromotion}
              current={pagingParam.currentPage}
              pageSize={pagingParam.perPage}
              total={resultPaging.total}
            />
          </div>
          <GiftSelected
            itemsGift={giftProgramDisplayList}
            onChangeSelected={(rows: ApplyDiscountGiftsResponseModel[]) => {
              const rowsKey = rows.map((p) => p.variant_id);
              setSelectedVariantId(rowsKey);
            }}
            rowsSelected={selectedVariantId}
          />
        </div>
      </Modal>
    </>
  );
};

export default AddGiftLineItem;
