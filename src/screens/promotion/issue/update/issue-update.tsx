import { Button, Col, Form, Row } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { PromotionReleasePermission } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import {
  PriceRule,
  PriceRuleMethod,
  ReleasePromotionListType,
} from "model/promotion/price-rules.model";
import moment from "moment";
import React, { ReactElement, useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import GeneralConditionForm from "screens/promotion/shared/general-condition.form";
import { PROMO_TYPE } from "utils/Constants";
import { parseDurationToMoment, transformData } from "utils/PromotionUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import GeneralInfoForm from "screens/promotion/issue/components/GeneralInfoForm";
import IssueProvider, { IssueContext } from "screens/promotion/issue/components/issue-provider";
import {
  getPriceRuleVariantExcludePaggingAction,
  getPromotionReleaseDetailAction,
  updatePromotionReleaseAction,
} from "domain/actions/promotion/promo-code/promo-code.action";
import { IssueStyled } from "screens/promotion/issue/issue-style";
import { CreateReleasePromotionRuleType } from "screens/promotion/constants";
import { PRICE_RULE_FIELDS, AllOrExcludeProductEnum, blankRow } from "screens/promotion/constants";
import PromotionTypeForm from "screens/promotion/issue/components/PromotionTypeForm";

const rule = PRICE_RULE_FIELDS.rule;
const conditions = PRICE_RULE_FIELDS.conditions;

function IssueUpdate(): ReactElement {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const priceRuleId = parseInt(id);
  const [isAllStore, setIsAllStore] = useState(true);
  const [isAllCustomer, setIsAllCustomer] = useState(true);
  const [isAllChannel, setIsAllChannel] = useState(true);
  const [isAllSource, setIsAllSource] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<PriceRule>();
  const [listProductUpdate, setListProductUpdate] = useState<Array<any>>([]);
  const [defaultReleasePromotionListType, setDefaultReleasePromotionListType] = useState<string>();
  const [loading, setLoading] = useState(true);
  const {
    setIsSetFormValues,
    priceRuleData,
    setPriceRuleData,
    setIsLimitUsage,
    setIsLimitUsagePerCustomer,
    setRegisterWithMinistry,
    registerWithMinistry,
    typeSelectPromotion,
    setTypeSelectPromotion,
    setValueChangePromotion,
    promotionType,
    setPromotionType,
    releasePromotionListType,
    setReleasePromotionListType,
    setReleaseWithExcludeOrAllProduct,
    listProductSelectImportNotExclude,
    setListProductSelectImportNotExclude,
    listProductSelectImportHaveExclude,
    setListProductSelectImportHaveExclude,
    setIsSmsVoucher,
  } = useContext(IssueContext);

  useEffect(() => {
    setRegisterWithMinistry(priceRuleData?.is_registered ?? false);
  }, [priceRuleData?.is_registered, setRegisterWithMinistry]);

  useEffect(() => {
    if (promotionType === PriceRuleMethod.ORDER_THRESHOLD) {
      setReleasePromotionListType(PriceRuleMethod.ORDER_THRESHOLD);
      form.setFieldsValue({
        [rule]: {
          [conditions]: [blankRow],
          group_operator: CreateReleasePromotionRuleType.AND,
          value_type: typeSelectPromotion,
        },
      });
    }
  }, [form, promotionType, setReleasePromotionListType, typeSelectPromotion]);

  useEffect(() => {
    if (promotionType === PriceRuleMethod.DISCOUNT_CODE_QTY) {
      if (!data) return;

      if (
        (data.rule?.conditions[0].field === CreateReleasePromotionRuleType.product_id ||
          data.rule?.conditions[0].field === CreateReleasePromotionRuleType.variant_id) &&
        data.rule?.conditions[0].operator === ReleasePromotionListType.EQUALS
      ) {
        setReleasePromotionListType(ReleasePromotionListType.EQUALS);
      } else if (
        (data.rule?.conditions[0].field === CreateReleasePromotionRuleType.product_id ||
          data.rule?.conditions[0].field === CreateReleasePromotionRuleType.variant_id) &&
        data.rule?.conditions[0].operator === ReleasePromotionListType.NOT_EQUAL_TO
      ) {
        setReleasePromotionListType(ReleasePromotionListType.NOT_EQUAL_TO);
      } else {
        setReleasePromotionListType(ReleasePromotionListType.OTHER_CONDITION);
      }
    }
  }, [data, promotionType, setReleasePromotionListType]);

  useEffect(() => {
    if (releasePromotionListType === ReleasePromotionListType.NOT_EQUAL_TO) {
      listProductSelectImportHaveExclude.length > 0
        ? setReleaseWithExcludeOrAllProduct(AllOrExcludeProductEnum.HAVE_EXCLUDE)
        : setReleaseWithExcludeOrAllProduct(AllOrExcludeProductEnum.ALL);
    }
  }, [
    listProductSelectImportHaveExclude.length,
    releasePromotionListType,
    setReleaseWithExcludeOrAllProduct
  ]);

  const handleFormFinish = useCallback(
    (values: any, listProduct: any[]) => {
      const listProductMapVariantId = listProduct.filter((item) => item.variant_id);
      const listProductMapProductId = listProduct.filter((item) => !item.variant_id);

      let listMapping = [];

      const listVariantId = listProductMapVariantId.map((item) => item.variant_id);

      const listProductId = listProductMapProductId.map((item) => item.product_id);

      if (!listProduct.length) {
        listMapping.push({
          field: CreateReleasePromotionRuleType.variant_id,
          operator: releasePromotionListType,
          value: [],
        });
      }

      if (listProductMapVariantId.length) {
        listMapping.push({
          field: CreateReleasePromotionRuleType.variant_id,
          operator: releasePromotionListType,
          value: listVariantId,
        });
      }

      if (listProductMapProductId.length) {
        listMapping.push({
          field: CreateReleasePromotionRuleType.product_id,
          operator: releasePromotionListType,
          value: listProductId,
        });
      }

      values.rule.group_operator = CreateReleasePromotionRuleType.AND;
      values.rule.conditions = listMapping;
    },
    [releasePromotionListType],
  );

  const onFinish = (values: any) => {
    try {
      switch (releasePromotionListType) {
        case ReleasePromotionListType.EQUALS:
          handleFormFinish(values, listProductSelectImportNotExclude);
          break;
        case ReleasePromotionListType.NOT_EQUAL_TO:
          handleFormFinish(values, listProductSelectImportHaveExclude);
          break;
        default:
          break;
      }

      setIsSubmitting(true);
      const body = transformData(values, PROMO_TYPE.MANUAL);
      body.id = priceRuleId;
      body.is_registered = registerWithMinistry;
      dispatch(
        updatePromotionReleaseAction(body, (result: PriceRule) => {
          if (result) {
            showSuccess("Cập nhật thành công");
            history.push(`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${priceRuleId}`);
            setIsSubmitting(false);
          }
        }),
      );
    } catch (error: any) {
      showError(error.message);
      setIsSubmitting(false);
    }
  };

  const parseDataToForm = useCallback(
    (result: PriceRule) => {
      const formValue: any = {
        ...result,
        starts_date: moment(result.starts_date),
        ends_date: result.ends_date ? moment(result.ends_date) : undefined,
        value:
          result.entitlements.length > 0
            ? result.entitlements[0]?.prerequisite_quantity_ranges[0]?.value
            : null,
        value_type:
          result.entitlements.length > 0
            ? result.entitlements[0]?.prerequisite_quantity_ranges[0]?.value_type
            : null,
        prerequisite_genders: result.prerequisite_genders?.map((item) => item.toLocaleUpperCase()),

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

      // set limit usage
      setIsLimitUsage(!!result.usage_limit);
      setIsLimitUsagePerCustomer(!!result.usage_limit_per_customer);
      setIsSmsVoucher(!!result.is_sms_voucher);

      //set default checked Bộ lọc
      setIsAllStore(result.prerequisite_store_ids?.length === 0);
      setIsAllChannel(result.prerequisite_sales_channel_names?.length === 0);
      setIsAllSource(result.prerequisite_order_source_ids?.length === 0);

      setIsAllCustomer(result.customer_selection?.toLocaleUpperCase() === "ALL");
      setPriceRuleData(formValue);

      setIsSetFormValues(true);
      form.setFieldsValue(formValue);
    },
    [setIsLimitUsage, setIsLimitUsagePerCustomer, setPriceRuleData, setIsSetFormValues, form],
  );

  const getPriceRuleVariantDataCallback = (data: any) => {
    setListProductUpdate(data.items);
  };

  const onResult = useCallback(
    (result: PriceRule) => {
      setLoading(false);
      if (result) {
        setData(result);

        if (
          (result.rule?.conditions[0].field === CreateReleasePromotionRuleType.product_id ||
            result.rule?.conditions[0].field === CreateReleasePromotionRuleType.variant_id) &&
          result.rule?.conditions[0].operator === ReleasePromotionListType.EQUALS
        ) {
          setDefaultReleasePromotionListType(ReleasePromotionListType.EQUALS);
        } else if (
          (result.rule?.conditions[0].field === CreateReleasePromotionRuleType.product_id ||
            result.rule?.conditions[0].field === CreateReleasePromotionRuleType.variant_id) &&
          result.rule?.conditions[0].operator === ReleasePromotionListType.NOT_EQUAL_TO
        ) {
          setDefaultReleasePromotionListType(ReleasePromotionListType.NOT_EQUAL_TO);
        } else {
          setDefaultReleasePromotionListType(ReleasePromotionListType.OTHER_CONDITION);
        }

        setPromotionType(result.entitled_method);
        parseDataToForm(result);
      }
    },
    [parseDataToForm, setPromotionType],
  );

  const getPromotionReleaseDetail = useCallback(() => {
    dispatch(getPromotionReleaseDetailAction(priceRuleId, onResult));
  }, [dispatch, priceRuleId, onResult]);

  useEffect(() => {
    if (!data) return;

    if (data.rule) {
      setValueChangePromotion(data.rule.value);
      setTypeSelectPromotion(data.rule.value_type);
    }

    if (
      (data.rule?.conditions[0].field === CreateReleasePromotionRuleType.product_id ||
        data.rule?.conditions[0].field === CreateReleasePromotionRuleType.variant_id) &&
      data.rule?.conditions[0].operator === ReleasePromotionListType.EQUALS
    ) {
      setListProductSelectImportNotExclude(listProductUpdate);
    } else {
      setListProductSelectImportHaveExclude(listProductUpdate);
    }
  }, [
    data,
    listProductUpdate,
    setListProductSelectImportHaveExclude,
    setListProductSelectImportNotExclude,
    setTypeSelectPromotion,
    setValueChangePromotion
  ]);

  // Action: Lấy thông tin khuyến mãi
  useEffect(() => {
    const params = {
      page: 1,
      limit: 1000,
    };

    if (id) {
      dispatch(
        getPriceRuleVariantExcludePaggingAction(
          Number(id),
          params,
          getPriceRuleVariantDataCallback,
        ),
      );
    }
    setLoading(true);
    getPromotionReleaseDetail();
  }, [dispatch, getPromotionReleaseDetail, id]);

  return (
    <ContentContainer
      isLoading={loading}
      // isError={
      //   dataDiscount?.state === "CANCELLED"
      // }
      title="Sửa khuyến mãi"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mãi",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
        },
        {
          name: "Sửa khuyến mãi",
          path: `#`,
        },
      ]}
    >
      <IssueStyled>
        <Form form={form} name="discount_add" onFinish={onFinish} layout="vertical">
          <Row gutter={24}>
            <Col span={18}>
              <GeneralInfoForm />
              <PromotionTypeForm
                form={form}
                defaultReleasePromotionListType={defaultReleasePromotionListType}
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
            back="Quay lại danh sách đợt phát hành"
            backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`)}
            rightComponent={
              <div>
                <AuthWrapper acceptPermissions={[PromotionReleasePermission.UPDATE]}>
                  <Button type="primary" htmlType="submit" loading={isSubmitting}>
                    Lưu
                  </Button>
                </AuthWrapper>
              </div>
            }
          />
        </Form>
      </IssueStyled>
    </ContentContainer>
  );
}

const IssueUpdateWithProvider = () => {
  return (
    <IssueProvider>
      <IssueUpdate />
    </IssueProvider>
  );
};

export default IssueUpdateWithProvider;
