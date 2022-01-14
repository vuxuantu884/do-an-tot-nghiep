import { Button, Col, Form, Row } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import { addPriceRules } from "domain/actions/promotion/discount/discount.action";
import { PriceRule, PriceRuleMethod } from "model/promotion/price-rules.model";
import moment from "moment";
import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import GeneralConditionForm from "screens/promotion/shared/general-condition.form";
import { PROMO_TYPE } from "utils/Constants";
import { transformData } from "utils/PromotionUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import IssueForm from "../components/issue-form";
import IssueProvider from "../components/issue-provider";
import { IssueStyled } from "../issue-style";

interface Props {}

function IssueCreate(props: Props): ReactElement {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  let isActive = true;
  const handleSaveAndActivate = (values: any) => {
    // Action: Lưu và kích hoạt
    isActive = true;
    form.submit();
  };
  const save = async () => {
    // Action: Lưu
    isActive = false;
    form.submit();
  };

  const onFinish = (values: any) => {
    try {
      setIsSubmitting(true);
      const body = transformData(values, PROMO_TYPE.MANUAL);
      body.activated = isActive;
      dispatch(
        addPriceRules(body, (result: PriceRule) => {
          if (result) {
            showSuccess("Thêm thành công");
            history.push(UrlConfig.PROMOTION + UrlConfig.PROMO_CODE);
            setIsSubmitting(false);
          }
        })
      );
    } catch (error: any) {
      showError(error.message);
      setIsSubmitting(false);
    }
  };

      /**
     * init data
     */
       useEffect(() => {
        const initialValues = {
            starts_date: moment(),
            entitled_method: PriceRuleMethod.ORDER_THRESHOLD,
            priority: 1,
            entitlements: []
        }
        form.setFieldsValue(initialValues);
    }, [form])
    
  return (
    <ContentContainer
      title="Tạo khuyến mãi"
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
          name: "Tạo khuyến mãi",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/create`,
        },
      ]}>
      <IssueStyled>
        <Form
          form={form}
          name="issue-create"
          onFinish={onFinish}
          layout="vertical">
          <Row gutter={24}>
            <Col span={18}>
              <IssueForm form={form} />
            </Col>
            <Col span={6}>
              <GeneralConditionForm
                form={form}
                /**
                 * default value
                 */
                isAllChannel={true}
                isAllCustomer={true}
                isAllSource={true}
                isAllStore={true}
              />
            </Col>
          </Row>
          <BottomBarContainer
            back="Quay lại danh sách đợt phát hành"
            rightComponent={
              <AuthWrapper acceptPermissions={[PromoPermistion.CREATE]}>
                <Button
                  onClick={() => save()}
                  style={{
                    marginLeft: ".75rem",
                    marginRight: ".75rem",
                    borderColor: "#2a2a86",
                  }}
                  type="ghost"
                  loading={isSubmitting && !isActive}>
                  Lưu
                </Button>
                <Button
                  type="primary"
                  onClick={handleSaveAndActivate}
                  loading={isSubmitting && !isActive}>
                  Lưu và kích hoạt
                </Button>
              </AuthWrapper>
            }
          />
        </Form>
      </IssueStyled>
    </ContentContainer>
  );
}

const IssueCreateWithProvider = (props: Props) => {
  return (
    <IssueProvider>
      <IssueCreate {...props} />
    </IssueProvider>
  );
};

export default IssueCreateWithProvider;
