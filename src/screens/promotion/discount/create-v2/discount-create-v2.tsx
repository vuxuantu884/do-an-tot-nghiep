import { Button, Col, Form, Row } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { PriceRulesPermission } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { createPriceRuleAction } from "domain/actions/promotion/discount/discount.action";
import { EntilementFormModel, PriceRuleMethod } from "model/promotion/price-rules.model";
import moment from "moment";
import React, { ReactElement, useContext, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import GeneralConditionForm from "screens/promotion/shared/general-condition.form";
import { PROMO_TYPE } from "utils/Constants";
import { transformData } from "utils/PromotionUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { initEntilements } from "../../constants";
import DiscountUpdateForm from "../components/discount-form";
import DiscountProvider, { DiscountContext } from "../components/discount-provider";
import useAuthorization from "hook/useAuthorization";

function DiscountCreateV2(): ReactElement {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  let activeDiscount = true;

  /** phân quyền */
  const [allowActiveDiscount] = useAuthorization({
    acceptPermissions: [PriceRulesPermission.ACTIVE],
  });
  /** */

  const discountUpdateContext = useContext(DiscountContext);
  const { discountAllProduct, discountProductHaveExclude, registerWithMinistry } =
    discountUpdateContext;

  const handleSubmit = useCallback(
    (values: any) => {
      try {
        if (values.entitled_method !== PriceRuleMethod.ORDER_THRESHOLD) {
          values.entitlements[0].is_apply_all = discountProductHaveExclude ? false : discountAllProduct;
          values.entitlements[0].is_exclude = discountProductHaveExclude;

          if (discountAllProduct && !discountProductHaveExclude) {
            values.entitlements[0].entitled_product_ids = [];
            values.entitlements[0].entitled_variant_ids = [];
          }
        }

        const body = transformData(
          values,
          PROMO_TYPE.AUTOMATIC,
          discountAllProduct,
          discountProductHaveExclude,
        );
        body.activated = activeDiscount;
        body.is_registered = registerWithMinistry;

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
    },
    [
      activeDiscount,
      discountAllProduct,
      discountProductHaveExclude,
      dispatch,
      history,
      registerWithMinistry,
    ],
  );

  const handleSaveAndActive = () => {
    activeDiscount = true;
    form.submit();
  };

  const save = () => {
    activeDiscount = false;
    form.submit();
  };

  /**
   * init data
   */
  useEffect(() => {
    const initialValues = {
      starts_date: moment(),
      entitled_method: PriceRuleMethod.FIXED_PRICE.toString(),
      priority: 1,
      entitlements: [initEntilements],
    };
    form.setFieldsValue(initialValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  useEffect(() => {
    if (discountAllProduct && !discountProductHaveExclude) {
      const entitlementValue: Array<EntilementFormModel> = form.getFieldValue("entitlements");
      entitlementValue[0].prerequisite_quantity_ranges[0].greater_than_or_equal_to = 1;
      entitlementValue[0].prerequisite_quantity_ranges[0].value = 0;
      entitlementValue[0].selectedProducts = [];
      form.setFieldsValue({ entitlements: [entitlementValue[0]] });
    }
  }, [discountAllProduct, discountProductHaveExclude, form]);

  return (
    <ContentContainer
      title="Tạo chiết khấu"
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
          name: "Tạo chiết khấu",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/create`,
        },
      ]}
    >
      <Form
        form={form}
        name="discount_create"
        onFinish={(values: any) => handleSubmit(values)}
        layout="vertical"
        scrollToFirstError
      >
        <Row gutter={24}>
          <Col span={18}>
            <DiscountUpdateForm
              unlimitedUsageProps={true}
              usageLimitPerCustomerProps={true}
              form={form}
            />
          </Col>
          <Col span={6}>
            <GeneralConditionForm
              form={form}
              isAllChannel={true}
              isAllCustomer={true}
              isAllSource={true}
              isAllStore={true}
            />
          </Col>
        </Row>

        <BottomBarContainer
          back="Quay lại danh sách chiết khấu"
          rightComponent={
            <>
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
              {allowActiveDiscount &&
                <Button type="primary" onClick={() => handleSaveAndActive()}>
                  Lưu và kích hoạt
                </Button>
              }
            </>
          }
        />
      </Form>
    </ContentContainer>
  );
}

const DiscountCreateWithProvider = () => (
  <DiscountProvider>
    <DiscountCreateV2 />
  </DiscountProvider>
);
export default DiscountCreateWithProvider;
