import { Button, Col, Form, Row } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import {
  getPromotionGiftDetailAction,
  getPromotionGiftProductApplyAction,
  getPromotionGiftVariantAction,
  updatePromotionGiftAction,
} from "domain/actions/promotion/gift/gift.action";
import { GiftVariant, GiftProductEntitlements, PromotionGift } from "model/promotion/gift.model";
import { GiftEntitlementForm } from "model/promotion/gift.model";
import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { parseDurationToMoment, transformGiftRequest } from "utils/PromotionUtils";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { showError, showSuccess } from "utils/ToastUtils";
import GeneralConditionForm from "../../shared/general-condition.form";
import GiftForm from "../components/GiftForm";
import GiftProvider, { GiftContext } from "screens/promotion/gift/components/GiftProvider";
import { GiftStyled } from "screens/promotion/gift/gift.style";
import _ from "lodash";
import { PROMOTION_TYPE } from "screens/promotion/constants";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { PROMOTION_GIFT_PERMISSIONS } from "config/permissions/promotion.permisssion";
import useAuthorization from "hook/useAuthorization";

const GiftUpdate = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();
  let activePromotionGift = true;

  /** phân quyền */
  const [allowActiveGift] = useAuthorization({
    acceptPermissions: [PROMOTION_GIFT_PERMISSIONS.ACTIVE],
  });
  /** */

  const { id } = useParams<{ id: string }>();
  const idNumber = parseInt(id);

  const [giftProductApplyData, setGiftProductApplyData] = useState<Array<GiftVariant>>([]);
  const [giftVariantList, setGiftVariantList] = useState<Array<GiftVariant>>([]);

  const [isAllStore, setIsAllStore] = useState(true);
  const [isAllCustomer, setIsAllCustomer] = useState(true);
  const [isAllChannel, setIsAllChannel] = useState(true);
  const [isAllSource, setIsAllSource] = useState(true);
  // const [isUnlimitQuantity, setIsUnlimitQuantity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const giftContext = useContext(GiftContext);
  const {
    setGiftMethod,
    setGiftDetailData,
    giftDetailData,
    setUnlimitedQuantity,
    setUsageLimitPerCustomer,
    registerWithMinistry,
    setRegisterWithMinistry,
  } = giftContext;

  const [getIndexRemoveDiscount, setGetIndexRemoveDiscount] = useState(null);
  const [originalEntitlements, setOriginalEntitlements] = useState<Array<any>>([]);

  useEffect(() => {
    setRegisterWithMinistry(giftDetailData.is_registered ?? false);
  }, [giftDetailData.is_registered, setRegisterWithMinistry]);

  const parseDataToForm = useCallback(
    (result: PromotionGift) => {
      const formValue: any = {
        title: result.title,
        code: result.code,
        description: result.description,
        quantity_limit: result.quantity_limit,
        priority: result.priority,
        product_type: "PRODUCT",
        starts_date: moment(result.starts_date),
        ends_date: result.ends_date ? moment(result.ends_date) : undefined,
        prerequisite_store_ids: result.prerequisite_store_ids,

        prerequisite_sales_channel_names: result.prerequisite_sales_channel_names,

        prerequisite_order_source_ids: result.prerequisite_order_source_ids,

        value: null,
        usage_limit: result.usage_limit,

        usage_limit_per_customer: result.usage_limit_per_customer,
        is_registered: result.is_registered,
        prerequisite_subtotal_range: result.prerequisite_subtotal_range,

        entitlements: result.entitlements,

        entitled_method: result.entitled_method,
        rule: result.rule,
        prerequisite_genders: result.prerequisite_genders?.map((item) => item.toLocaleUpperCase()),
        prerequisite_customer_group_ids: result.prerequisite_customer_group_ids,
        prerequisite_customer_loyalty_level_ids: result.prerequisite_customer_loyalty_level_ids,
        prerequisite_assignee_codes: result.prerequisite_assignee_codes,

        prerequisite_total_finished_order_from: result.prerequisite_total_finished_order_from,
        prerequisite_total_finished_order_to: result.prerequisite_total_finished_order_to,
        prerequisite_total_money_spend_from: result.prerequisite_total_money_spend_from,
        prerequisite_total_money_spend_to: result.prerequisite_total_money_spend_to,

        starts_birthday: parseDurationToMoment(
          result.prerequisite_birthday_duration?.starts_mmdd_key,
        ),
        ends_birthday: parseDurationToMoment(result.prerequisite_birthday_duration?.ends_mmdd_key),

        starts_wedding_day: parseDurationToMoment(
          result.prerequisite_wedding_duration?.starts_mmdd_key,
        ),
        ends_wedding_day: parseDurationToMoment(
          result.prerequisite_wedding_duration?.ends_mmdd_key,
        ),
      };

      setGiftMethod(result.entitled_method);
      //set default checked Loại khuyến mại
      // setIsUnlimitQuantity(typeof result.quantity_limit !== "number");

      //   //set default checked Bộ lọc
      setIsAllStore(result.prerequisite_store_ids?.length === 0);
      setIsAllChannel(result.prerequisite_sales_channel_names?.length === 0);
      setIsAllSource(result.prerequisite_order_source_ids?.length === 0);

      setIsAllCustomer(result.customer_selection?.toLocaleUpperCase() === "ALL");
      setGiftDetailData(formValue);
      form.setFieldsValue(formValue);
    },
    [form, setGiftMethod, setGiftDetailData],
  );

  /**
   * Update discount
   */
  const updateCallback = (data: PromotionGift) => {
    //Time out 2s để BE đẩy dữ liệu lên
    setTimeout(() => {
      if (data) {
        showSuccess("Cập nhật chương trình quà tặng thành công");
        setIsSubmitting(false);
        history.push(`${UrlConfig.PROMOTION}${UrlConfig.GIFT}/${idNumber}`);
      }
      setIsSubmitting(false);
      dispatch(hideLoading());
    }, 2000);
  };

  const handleSubmit = (values: any) => {
    const formValues = form.getFieldsValue(true);
    try {
      setIsSubmitting(true);
      const body = transformGiftRequest(formValues);
      body.id = idNumber;
      body.is_registered = registerWithMinistry;
      body.activated = activePromotionGift;
      dispatch(showLoading());
      dispatch(updatePromotionGiftAction(body, updateCallback));
    } catch (error: any) {
      setIsSubmitting(false);
      showError(error.message);
    }
  };

  const handleSaveAndActive = () => {
    activePromotionGift = true;
    form.submit();
  };

  const handleSaveOnly = () => {
    activePromotionGift = false;
    form.submit();
  };
  /**
   *
   */
  const getPromotionGiftDetailCallback = useCallback(
    (result: PromotionGift | false) => {
      if (result) {
        parseDataToForm(result);

        if (result.quantity_limit) {
          setUnlimitedQuantity(false);
        } else {
          setUnlimitedQuantity(true);
        }

        if (result.usage_limit_per_customer) {
          setUsageLimitPerCustomer(false);
        } else {
          setUsageLimitPerCustomer(true);
        }
      }
      setIsLoading(false);
    },
    [parseDataToForm, setUnlimitedQuantity, setUsageLimitPerCustomer],
  );

  /**
   * Dùng entitled_product_ids và entitled_variant_ids để lấy data product
   */
  const mergeVariantsData = useCallback(
    (entitled_variant_ids: Array<number>, entitled_product_ids: Array<number>) => {
      const listProduct: Array<GiftProductEntitlements> = entitled_product_ids.map(
        (productId: number) => {
          return (
            giftProductApplyData?.find((v) => v.product_id === productId) ||
            ({} as GiftProductEntitlements)
          );
        },
      );

      const listProductFormVariant = entitled_variant_ids.map((id) => {
        return (
          giftProductApplyData?.find((v) => v.variant_id === id) || ({} as GiftProductEntitlements)
        );
      });
      return [...listProduct, ...listProductFormVariant];
    },
    [giftProductApplyData],
  );

  const setSelectedGifts = useCallback(
    (entitled_gift_ids: Array<number> | undefined) => {
      if (!entitled_gift_ids) {
        return [];
      }
      return entitled_gift_ids.map((id) => {
        return (
          giftVariantList?.find((item: any) => item.variant_id === id) ||
          ({} as GiftProductEntitlements)
        );
      });
    },
    [giftVariantList],
  );

  /**
   * Lấy thông tin [tên sản phẩm, tồn đầu kỳ, giá vốn] sản phẩm khuyến mại
   */
  useEffect(() => {
    const entitlementValue: Array<GiftEntitlementForm> = giftDetailData.entitlements;
    if (entitlementValue) {
      entitlementValue.forEach((item: GiftEntitlementForm) => {
        item.selectedProducts =
          mergeVariantsData(item.entitled_variant_ids, item.entitled_product_ids) || [];
        item.selectedGifts = setSelectedGifts(item.entitled_gift_ids);
      });
      setOriginalEntitlements(entitlementValue);
      if (getIndexRemoveDiscount !== null) {
        entitlementValue.splice(getIndexRemoveDiscount, 1);
      }
      form.setFieldsValue({ entitlements: _.cloneDeep(entitlementValue) });
    }
  }, [giftDetailData, form, getIndexRemoveDiscount, mergeVariantsData, setSelectedGifts]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(
      getPromotionGiftProductApplyAction(idNumber, { page: 1, limit: 1000 }, (data) => {
        if (data) {
          setGiftProductApplyData(data.items);
        }
      }),
    );
    dispatch(
      getPromotionGiftVariantAction(idNumber, { page: 1, limit: 1000 }, (data) => {
        if (data) {
          setGiftVariantList(data.items);
        }
      }),
    );
    dispatch(getPromotionGiftDetailAction(idNumber, getPromotionGiftDetailCallback));
  }, [dispatch, idNumber, getPromotionGiftDetailCallback]);

  return (
    <ContentContainer
      title={giftDetailData.title}
      isLoading={isLoading}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
        },
        {
          name: "Quà tặng",
          path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}`,
        },
        {
          name: "Chỉnh sửa chương trình quà tặng",
          path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}/update`,
        },
      ]}
    >
      <GiftStyled>
        <Form
          form={form}
          name="gift_update"
          onFinish={(values: any) => handleSubmit(values)}
          layout="vertical"
          scrollToFirstError
          initialValues={giftDetailData}
        >
          <Row gutter={24}>
            <Col span={18}>
              <GiftForm
                form={form}
                idNumber={idNumber}
                originalEntitlements={originalEntitlements}
                setGetIndexRemoveDiscount={setGetIndexRemoveDiscount}
              />
            </Col>
            <Col span={6}>
              <GeneralConditionForm
                promotionType={PROMOTION_TYPE.GIFT}
                form={form}
                isAllChannel={isAllChannel}
                isAllCustomer={isAllCustomer}
                isAllSource={isAllSource}
                isAllStore={isAllStore}
              />
            </Col>
          </Row>

          <BottomBarContainer
            back="Quay lại chi tiết quà tặng"
            backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.GIFT}/${idNumber}`)}
            rightComponent={
              <>
                <Button
                  onClick={() => handleSaveOnly()}
                  style={{
                    marginRight: "12px",
                    borderColor: "#2a2a86",
                  }}
                  type="ghost"
                >
                  Lưu
                </Button>
                {allowActiveGift &&
                  <Button type="primary" onClick={() => handleSaveAndActive()}>
                    Lưu và kích hoạt
                  </Button>
                }
              </>
            }
          />
        </Form>
      </GiftStyled>
    </ContentContainer>
  );
};

const DiscountUpdateWithProvider = () => (
  <GiftProvider>
    <GiftUpdate />
  </GiftProvider>
);
export default DiscountUpdateWithProvider;
