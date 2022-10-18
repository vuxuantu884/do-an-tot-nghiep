import { Button, Col, Form, Row } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import {
  createPriceRuleAction,
  getPriceRuleAction,
  getVariantsAction,
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
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { showError, showSuccess } from "utils/ToastUtils";
import GeneralConditionForm from "screens/promotion/shared/general-condition.form";
import DiscountUpdateForm from "../components/discount-form";
import DiscountProvider, { DiscountContext } from "../components/discount-provider";
import { DiscountStyled } from "../discount-style";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PriceRulesPermission } from "config/permissions/promotion.permisssion";
import { hideLoading, showLoading } from "domain/actions/loading.action";
const DiscountReplicate = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();

  const { id } = useParams<{ id: string }>();
  const idNumber = parseInt(id);
  let activeDiscount = true;

  const [dataVariants, setDataVariants] = useState<ProductEntitlements[]>([]);

  const [isAllStore, setIsAllStore] = useState(true);
  const [isAllCustomer, setIsAllCustomer] = useState(true);
  const [isAllChannel, setIsAllChannel] = useState(true);
  const [isAllSource, setIsAllSource] = useState(true);
  const [isUnlimitQuantity, setIsUnlimitQuantity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const discountUpdateContext = useContext(DiscountContext);
  const { setDiscountMethod, setDiscountData, discountData } = discountUpdateContext;

  const parseDataToForm = useCallback(
    (result: PriceRule) => {
      const formValue: any = {
        title: result.title,
        discount_code: null,
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
   * Replicate discount
   */
  const handleSubmit = (values: any) => {
    try {
      const body = transformData(values);
      body.activated = activeDiscount;
      dispatch(showLoading());
      dispatch(
        createPriceRuleAction(body, (data) => {
          if (data) {
            showSuccess("Lưu thành công");
            history.push(`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${data.id}`);
          }
          dispatch(hideLoading());
        }),
      );
    } catch (error: any) {
      dispatch(hideLoading());
      showError(error.message);
    }
  };

  const handleSaveAndActive = () => {
    activeDiscount = true;
    form.submit();
  };

  const save = () => {
    activeDiscount = false;
    form.submit();
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
    const entilelementValue: Array<EntilementFormModel> = discountData.entitlements;
    if (entilelementValue) {
      entilelementValue.forEach((item: EntilementFormModel) => {
        item.selectedProducts =
          mergeVariantsData(item.entitled_variant_ids, item.entitled_product_ids) || [];
      });

      form.setFieldsValue({ entitlements: entilelementValue });
    }
  }, [discountData, form, mergeVariantsData]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(getVariantsAction(idNumber, setDataVariants));
    dispatch(getPriceRuleAction(idNumber, onResult));
  }, [dispatch, idNumber, onResult]);

  return (
    <ContentContainer
      title={`Nhân bản chiết khấu "${discountData.title}"`}
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
          name: "Nhân bản chiết khấu",
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
              <DiscountUpdateForm unlimitedUsageProps={isUnlimitQuantity} form={form} />
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
              <AuthWrapper acceptPermissions={[PriceRulesPermission.CREATE]}>
                <Button
                  onClick={() => save()}
                  style={{
                    marginLeft: ".75rem",
                    marginRight: ".75rem",
                    borderColor: "#2a2a86",
                  }}
                  type="ghost"
                >
                  Lưu
                </Button>
                <Button type="primary" onClick={() => handleSaveAndActive()}>
                  Lưu và kích hoạt
                </Button>
              </AuthWrapper>
            }
          />
        </Form>
      </DiscountStyled>
    </ContentContainer>
  );
};

const DiscountReplicateWithProvider = () => (
  <DiscountProvider>
    <DiscountReplicate />
  </DiscountProvider>
);
export default DiscountReplicateWithProvider;
