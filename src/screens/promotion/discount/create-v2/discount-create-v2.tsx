import { Button, Col, Form, Row } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { PriceRulesPermission } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { createPriceRuleAction } from "domain/actions/promotion/discount/discount.action";
import { PriceRuleMethod } from "model/promotion/price-rules.model";
import moment from "moment";
import React, { ReactElement, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import GeneralConditionForm from "screens/promotion/shared/general-condition.form";
import { transformData } from "utils/PromotionUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { DiscountUnitType } from "../../constants";
import DiscountUpdateForm from "../components/discount-form";
import DiscountProvider from "../components/discount-provider";

function DiscountCreateV2(): ReactElement {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  let activeDiscout = true;

  function handleSubmit(values: any) {
    try {
      const body = transformData(values);
      body.activated = activeDiscout;
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
  }

  const handleSaveAndActive = () => {
    activeDiscout = true;
    form.submit();
  };

  const save = () => {
    activeDiscout = false;
    form.submit();
  };

  /**
   * init data
   */
  useEffect(() => {
    const initEntilements = {
      entitled_variant_ids: [],
      entitled_product_ids: [],
      selectedProducts: [],
      prerequisite_variant_ids: [],
      entitled_category_ids: [],
      prerequisite_quantity_ranges: [
        {
          greater_than_or_equal_to: 1,
          less_than_or_equal_to: null,
          allocation_limit: undefined,
          value: 0,
          value_type: DiscountUnitType.FIXED_PRICE.value,
        },
      ],
    };

    const initialValues = {
      starts_date: moment(),
      entitled_method: PriceRuleMethod.FIXED_PRICE.toString(),
      priority: 1,
      entitlements: [initEntilements],
    };
    form.setFieldsValue(initialValues);
  }, [form]);

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
    </ContentContainer>
  );
}

const DiscountCreateWithProvider = () => (
  <DiscountProvider>
    <DiscountCreateV2 />
  </DiscountProvider>
);
export default DiscountCreateWithProvider;
