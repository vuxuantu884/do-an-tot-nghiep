import { Button, Col, Form, Row } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  getVariantsAction,
  getPriceRuleAction,
  updatePriceRuleByIdAction
} from "domain/actions/promotion/discount/discount.action";
import { PriceRule, ProductEntitlements } from "model/promotion/price-rules.model"; 
import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import { DATE_FORMAT } from "utils/DateUtils";
import { parseDurationToMoment } from "utils/PromotionUtils";
import ContentContainer from "../../../component/container/content.container";
import UrlConfig from "../../../config/url.config";
import { showError, showSuccess } from "../../../utils/ToastUtils";
import IssueProvider, { IssueContext } from "../issue/components/issue-provider";
import { CustomerFilterField } from "../shared/cusomer-condition.form";
import GeneralConditionForm from "../shared/general-condition.form";
import PromoCodeUpdateForm from "./components/promo-code-update-form"; 
import "./promo-code.scss";

const PromoCodeUpdate = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [form] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const idNumber = parseInt(id);

  const [loading, setLoading] = useState(true);
  const [dataDiscount, setDataDiscount] = useState<PriceRule>();

  const [isAllStore, setIsAllStore] = useState(true);
  const [isAllCustomer, setIsAllCustomer] = useState(true);
  const [isAllChannel, setIsAllChannel] = useState(true);
  const [isAllSource, setIsAllSource] = useState(true);

  const [isUnlimitUsage, setIsUnlimitUsage] = useState(false);
  const [isUnlimitUsagePerUser, setIsUnlimitUsagePerUser] = useState(false);

  const [dataVariants, setDataVariants] = useState<ProductEntitlements[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Array<any>>([]);
  const [typeUnit, setTypeUnit] = useState<string>("PERCENTAGE");

  const { isAllProduct, setIsAllProduct } = useContext(IssueContext);

  const transformData = (values: any) => {
    let body: any = values;

    body.starts_date = values.starts_date?.format();
    body.ends_date = values.ends_date?.format() || null;

    body.prerequisite_subtotal_range = values?.prerequisite_subtotal_range
      ?.greater_than_or_equal_to
      ? values.prerequisite_subtotal_range
      : null;

    if (values.entitlements && values.entitlements.length > 0) {
      body.entitlements = values.entitlements.map((entitlement: any) => {
        return {
          entitled_variant_ids: entitlement.entitled_variant_ids || null,
          entitled_category_ids: null,
          prerequisite_quantity_ranges: [
            {
              greater_than_or_equal_to:
                entitlement.prerequisite_quantity_ranges[0].greater_than_or_equal_to,
              less_than_or_equal_to: null,
              allocation_limit: null,
              value_type: values.value_type,
              value: values.value,
            },
          ],
          prerequisite_subtotal_ranges: null,
        };
      });
    } else {
      body.entitlements = [
        {
          entitled_variant_ids: null,
          entitled_category_ids: null,
          prerequisite_quantity_ranges: [
            {
              greater_than_or_equal_to: null,
              less_than_or_equal_to: null,
              allocation_limit: null,
              value_type: values.value_type,
              value: values.value,
            },
          ],
          prerequisite_subtotal_ranges: null,
        },
      ];
    }
    // ==Đối tượng khách hàng==

    // Giới tính
    body.prerequisite_genders = values.prerequisite_genders ?? [];
    //Ngày sinh khách hàng
    const startsBirthday = values[CustomerFilterField.starts_birthday]
      ? moment(values[CustomerFilterField.starts_birthday])
      : null;
    const endsBirthday = values[CustomerFilterField.ends_birthday]
      ? moment(values[CustomerFilterField.ends_birthday])
      : null;
    if (startsBirthday || endsBirthday) {
      body.prerequisite_birthday_duration = {
        starts_mmdd_key: startsBirthday
          ? Number(
            (startsBirthday.month() + 1).toString().padStart(2, "0") +
            startsBirthday.format(DATE_FORMAT.DDMM).substring(0, 2).padStart(2, "0")
          )
          : null,
        ends_mmdd_key: endsBirthday
          ? Number(
            (endsBirthday.month() + 1).toString().padStart(2, "0") +
            endsBirthday.format(DATE_FORMAT.DDMM).substring(0, 2).padStart(2, "0")
          )
          : null,
      };
    } else {
      body.prerequisite_birthday_duration = null;
    }

    //==Ngày cưới khách hàng
    const startsWeddingDays = values[CustomerFilterField.starts_wedding_day]
      ? moment(values[CustomerFilterField.starts_wedding_day])
      : null;
    const endsWeddingDays = values[CustomerFilterField.ends_wedding_day]
      ? moment(values[CustomerFilterField.ends_wedding_day])
      : null;

    if (startsWeddingDays || endsWeddingDays) {
      body.prerequisite_wedding_duration = {
        starts_mmdd_key: startsWeddingDays
          ? Number(
            (startsWeddingDays.month() + 1).toString().padStart(2, "0") +
            startsWeddingDays.format(DATE_FORMAT.DDMM).substring(0, 2).padStart(2, "0")
          )
          : null,
        ends_mmdd_key: endsWeddingDays
          ? Number(
            (endsWeddingDays.month() + 1).toString().padStart(2, "0") +
            endsWeddingDays.format(DATE_FORMAT.DDMM).substring(0, 2).padStart(2, "0")
          )
          : null,
      };
    } else {
      body.prerequisite_wedding_duration = null;
    }

    //Khách hàng thuộc nhóm
    body.prerequisite_customer_group_ids = values.prerequisite_customer_group_ids ?? [];
    //Khách hàng thuộc cấp độ
    body.prerequisite_customer_loyalty_level_ids =
      values.prerequisite_customer_loyalty_level_ids ?? [];
    //Nhân viên phụ trách
    body.prerequisite_assignee_codes = values.prerequisite_assignee_codes ?? [];
    return body;
  };

  const updateCallback = (data: PriceRule) => {
    if (data) {
      setTimeout(() => {
        showSuccess("Thêm thành công");
        history.push(`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${idNumber}`);
        dispatch(hideLoading());
      }, 2000);
    } else dispatch(hideLoading());
  };

  const onFinish = (values: any) => {
    if (!isAllProduct && (values.entitlements.length === 0 || values.entitlements[0].entitled_variant_ids.length === 0)) {
      showError("Vui lòng chọn sản phẩm để áp dụng");
      return;
    }

    const body = transformData(values);
    body.id = idNumber;
    dispatch(showLoading());
    dispatch(updatePriceRuleByIdAction(body, updateCallback));
  };

  const parseDataToForm = useCallback(
    (result: PriceRule) => {
      const formValue: any = {
        title: result.title,
        discount_code: result.code,
        description: result.description,
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
        prerequisite_subtotal_range: {
          greater_than_or_equal_to:
            result.prerequisite_subtotal_range?.greater_than_or_equal_to,
        },
        product_type: "PRODUCT",
        entitlements: result.entitlements,
        // Áp dụng khách hàng
        prerequisite_genders: result.prerequisite_genders?.map((item) =>
          item.toLocaleUpperCase()
        ),
        prerequisite_customer_group_ids: result.prerequisite_customer_group_ids,
        prerequisite_customer_loyalty_level_ids: result.prerequisite_customer_loyalty_level_ids,
        prerequisite_assignee_codes: result.prerequisite_assignee_codes,

        starts_birthday: parseDurationToMoment(result.prerequisite_birthday_duration?.starts_mmdd_key),
        ends_birthday: parseDurationToMoment(result.prerequisite_birthday_duration?.ends_mmdd_key),

        starts_wedding_day: parseDurationToMoment(result.prerequisite_wedding_duration?.starts_mmdd_key),
        ends_wedding_day: parseDurationToMoment(result.prerequisite_wedding_duration?.ends_mmdd_key)
      };
      //đơn vị khuyến mãi
      if (result.entitlements?.length > 0 && result.entitlements[0]?.prerequisite_quantity_ranges[0]?.value_type) {
        setTypeUnit(
          result.entitlements[0]?.prerequisite_quantity_ranges[0]?.value_type
        )
      }
      //set default checked Loại khuyến mãi
      setIsUnlimitUsage(typeof result.usage_limit !== "number");
      setIsUnlimitUsagePerUser(typeof result.usage_limit_per_customer !== "number");

      //set default checked Bộ lọc
      setIsAllStore(result.prerequisite_store_ids?.length === 0);
      setIsAllChannel(result.prerequisite_sales_channel_names?.length === 0);
      setIsAllSource(result.prerequisite_order_source_ids?.length === 0);

      setIsAllCustomer(result.customer_selection.toLocaleUpperCase() === "ALL");

      form.setFieldsValue(formValue);
    },
    [form]
  );

  const onResult = useCallback(
    (result: PriceRule | false) => {
      setLoading(false);
      if (result) {
        setDataDiscount(result);
        parseDataToForm(result);
      }
    },
    [parseDataToForm]
  );
  // tách dòng variant
  const spreadVariantData = (data: any) => {
    let result: any[] = [];
    if (data?.entitlements && data?.entitlements.length > 0) {
      data?.entitlements.forEach((entitlement: any, index: number) => {
        entitlement.entitled_variant_ids.forEach((vId: any) => {
          result.push({
            id: vId,
            greater_than_or_equal_to:
              entitlement.prerequisite_quantity_ranges[0]["greater_than_or_equal_to"],
          });
        });
      });
    }

    return result;
  };

  const mergeVariants = useCallback(
    (sourceData: Array<any>) => {
      return sourceData.map((s) => {
        const variant = dataVariants.find((v: any) => v.variant_id === s.id);
        if (variant) {
          s.name = variant.variant_title;
          s.sku = variant.sku;
        }
        return s;
      });
    },
    [dataVariants]
  );

  // Action: Lấy thông tin sản phẩm khuyến mãi
  useEffect(() => {
    if (dataVariants && dataDiscount && dataDiscount.entitlements.length > 0) {
      // if (dataDiscount.prerequisite_subtotal_range?.greater_than_or_equal_to) {
      const flattenData: Array<any> = spreadVariantData(dataDiscount);
      const listEntitlements: Array<any> = mergeVariants(flattenData);

      setSelectedProduct(listEntitlements);
      setIsAllProduct && setIsAllProduct(listEntitlements.length === 0)
      // }
    }
  }, [dataVariants, dataDiscount, mergeVariants, setIsAllProduct]);

  // Action: Lấy thông tin khuyến mãi
  useEffect(() => {
    setLoading(true);
    dispatch(getVariantsAction(idNumber, setDataVariants));
    dispatch(getPriceRuleAction(idNumber, onResult));
  }, [dispatch, idNumber, onResult]);

  return (
    <ContentContainer
      isLoading={loading}
      isError={
        dataDiscount?.state === "CANCELLED"
      }
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
      <Form form={form} name="discount_add" onFinish={onFinish} layout="vertical">
        <Row gutter={24}>
          <Col span={18}>
            <PromoCodeUpdateForm
              form={form}
              isUnlimitUsage={isUnlimitUsage}
              isUnlimitUsagePerUser={isUnlimitUsagePerUser}
              selectedProduct={selectedProduct}
              typeUnit={typeUnit}
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
              <AuthWrapper acceptPermissions={[PromoPermistion.UPDATE]}>
                <Button type="primary" htmlType="submit">
                  Lưu
                </Button>
              </AuthWrapper>
            </div>
          }
        />
      </Form>
    </ContentContainer>
  );
};

const UpdatePromoWithProvider = () => {
  return (
    <IssueProvider>
      <PromoCodeUpdate />
    </IssueProvider>
  );
}

export default UpdatePromoWithProvider; 
