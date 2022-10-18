import { Button, Col, Form, Row } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import {
  getPriceRuleAction,
  getVariantsAction,
  updatePriceRuleByIdAction,
} from "domain/actions/promotion/discount/discount.action";
import {
  EntilementFormModel,
  PriceRule,
  ProductEntitlements,
} from "model/promotion/price-rules.model";
import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { parseDurationToMoment, transformData } from "utils/PromotionUtils";
import ContentContainer from "../../../../component/container/content.container";
import UrlConfig from "../../../../config/url.config";
import { showError, showSuccess } from "../../../../utils/ToastUtils";
import GeneralConditionForm from "../../shared/general-condition.form";
import DiscountUpdateForm from "../components/discount-form";
import DiscountProvider, { DiscountContext } from "../components/discount-provider";
import { DiscountStyled } from "../discount-style";
import _ from "lodash";
const DiscountUpdate = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();

  const { id } = useParams<{ id: string }>();
  const idNumber = parseInt(id);

  const [dataVariants, setDataVariants] = useState<ProductEntitlements[]>([]);

  const [isAllStore, setIsAllStore] = useState(true);
  const [isAllCustomer, setIsAllCustomer] = useState(true);
  const [isAllChannel, setIsAllChannel] = useState(true);
  const [isAllSource, setIsAllSource] = useState(true);
  const [isUnlimitQuantity, setIsUnlimitQuantity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const discountUpdateContext = useContext(DiscountContext);
  const { setDiscountMethod, setDiscountData, discountData } = discountUpdateContext;

  const [getIndexRemoveDiscount, setGetIndexRemoveDiscount] = useState(null);
  const [originalEntitlements, setOriginalEntitlements] = useState<Array<any>>([]);

  const parseDataToForm = useCallback(
    (result: PriceRule) => {
      const formValue: any = {
        title: result.title,
        discount_code: result.code,
        description: result.description,
        quantity_limit: result.quantity_limit,
        priority: result.priority,
        product_type: "PRODUCT",
        starts_date: moment(result.starts_date),
        ends_date: result.ends_date ? moment(result.ends_date) : undefined,
        prerequisite_store_ids: result.prerequisite_store_ids,

        prerequisite_sales_channel_names: result.prerequisite_sales_channel_names,

        prerequisite_order_source_ids: result.prerequisite_order_source_ids,

        value:
          result.entitlements.length > 0
            ? result.entitlements[0]?.prerequisite_quantity_ranges[0]?.value
            : null,
        value_type:
          result.entitlements.length > 0
            ? result.entitlements[0]?.prerequisite_quantity_ranges[0]?.value_type
            : null,
        usage_limit: result.usage_limit,

        usage_limit_per_customer: result.usage_limit_per_customer,
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

      setDiscountMethod(result.entitled_method);
      //set default checked Loại khuyến mãi
      setIsUnlimitQuantity(typeof result.quantity_limit !== "number");

      //   //set default checked Bộ lọc
      setIsAllStore(result.prerequisite_store_ids?.length === 0);
      setIsAllChannel(result.prerequisite_sales_channel_names?.length === 0);
      setIsAllSource(result.prerequisite_order_source_ids?.length === 0);

      setIsAllCustomer(result.customer_selection?.toLocaleUpperCase() === "ALL");
      setDiscountData(formValue);
      form.setFieldsValue(formValue);
    },
    [form, setDiscountMethod, setDiscountData],
  );

  /**
   * Update discount
   */
  const updateCallback = (data: PriceRule) => {
    if (data) {
      showSuccess("Cập nhật chiết khấu thành công");
      setIsSubmitting(false);
      history.push(`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${idNumber}`);
    } else {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (values: any) => {
    let _originalEntitlements = _.cloneDeep(originalEntitlements);
    for (let i = 0; i < values.entitlements?.length; i++) {
      _originalEntitlements = _originalEntitlements.filter(
        (item) => item.id !== values.entitlements[i].id,
      );
    }
    values.entitlements = values.entitlements?.concat(_originalEntitlements);
    try {
      setIsSubmitting(true);
      const body = transformData(values);
      body.id = idNumber;
      dispatch(updatePriceRuleByIdAction(body, updateCallback));
    } catch (error: any) {
      setIsSubmitting(false);
      showError(error.message);
    }
  };

  /**
   *
   */
  const onResult = useCallback(
    (result: PriceRule | false) => {
      if (result) {
        parseDataToForm(result);
        setIsLoading(false);
      }
    },
    [parseDataToForm],
  );

  /**
   * Dùng entitled_product_ids và entitled_variant_ids để lấy data product
   */
  const mergeVariantsData = useCallback(
    (entitled_variant_ids: Array<number>, entitled_product_ids: Array<number>) => {
      const listProduct: Array<ProductEntitlements> = entitled_product_ids.map(
        (productId: number) => {
          return (
            dataVariants?.find((v) => v.product_id === productId) || ({} as ProductEntitlements)
          );
        },
      );

      const listProductFormVariant = entitled_variant_ids.map((id) => {
        return dataVariants?.find((v) => v.variant_id === id) || ({} as ProductEntitlements);
      });
      return [...listProduct, ...listProductFormVariant];
    },
    [dataVariants],
  );

  /**
   * Lấy thông tin [tên sản phẩm, tồn đầu kỳ, giá vốn] sản phẩm khuyến mãi
   */
  useEffect(() => {
    const entitlementValue: Array<EntilementFormModel> = discountData.entitlements;
    if (entitlementValue) {
      entitlementValue.forEach((item: EntilementFormModel) => {
        item.selectedProducts =
          mergeVariantsData(item.entitled_variant_ids, item.entitled_product_ids) || [];
      });
      setOriginalEntitlements(entitlementValue);
      if (getIndexRemoveDiscount !== null) {
        entitlementValue.splice(getIndexRemoveDiscount, 1);
      }
      form.setFieldsValue({ entitlements: entitlementValue });
    }
  }, [discountData, form, getIndexRemoveDiscount, mergeVariantsData]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(getVariantsAction(idNumber, setDataVariants));
    dispatch(getPriceRuleAction(idNumber, onResult));
  }, [dispatch, idNumber, onResult]);

  return (
    <ContentContainer
      title={discountData.title}
      isLoading={isLoading}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Chiết khấu",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
        },
        {
          name: "Sửa Chiết khấu",
          path: `#`,
        },
      ]}
    >
      <DiscountStyled>
        <Form
          form={form}
          name="discount_update"
          onFinish={(values: any) => handleSubmit(values)}
          layout="vertical"
          scrollToFirstError
          initialValues={discountData}
        >
          <Row gutter={24}>
            <Col span={18}>
              <DiscountUpdateForm
                unlimitedUsageProps={isUnlimitQuantity}
                form={form}
                idNumber={idNumber}
                originalEntitlements={originalEntitlements}
                setGetIndexRemoveDiscount={setGetIndexRemoveDiscount}
              />
            </Col>
            <Col span={6}>
              <GeneralConditionForm
                form={form}
                isAllChannel={isAllChannel}
                isAllCustomer={isAllCustomer}
                isAllSource={isAllSource}
                isAllStore={isAllStore}
              />
            </Col>
          </Row>

          <BottomBarContainer
            back="Quay lại danh sách chiết khấu"
            backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`)}
            rightComponent={
              <Button type="primary" loading={isSubmitting} onClick={() => form.submit()}>
                Lưu
              </Button>
            }
          />
        </Form>
      </DiscountStyled>
    </ContentContainer>
  );
};

const DiscountUpdateWithProvider = () => (
  <DiscountProvider>
    <DiscountUpdate />
  </DiscountProvider>
);
export default DiscountUpdateWithProvider;
