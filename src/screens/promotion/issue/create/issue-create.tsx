import { Button, Col, Form, Row } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { PromotionReleasePermission } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  PriceRule,
  PriceRuleMethod,
  ReleasePromotionListType,
} from "model/promotion/price-rules.model";
import moment from "moment";
import React, { ReactElement, useCallback, useEffect, useContext } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import GeneralConditionForm from "screens/promotion/shared/general-condition.form";
import { PROMO_TYPE } from "utils/Constants";
import { transformData } from "utils/PromotionUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import GeneralInfoForm from "screens/promotion/issue/components/GeneralInfoForm";
import IssueProvider, { IssueContext } from "screens/promotion/issue/components/issue-provider";
import { IssueStyled } from "screens/promotion/issue/issue-style";
import { createPromotionReleaseAction } from "domain/actions/promotion/promo-code/promo-code.action";
import { CreateReleasePromotionRuleType } from "screens/promotion/constants";
import PromotionTypeForm from "screens/promotion/issue/components/PromotionTypeForm";
import { scrollAndFocusToDomElement } from "utils/AppUtils";
import useAuthorization from "hook/useAuthorization";

const initialFormValues = {
  starts_date: moment(),
  entitled_method: PriceRuleMethod.ORDER_THRESHOLD,
  is_sms_voucher: false,
  priority: 1,
  entitlements: [],
  operator: ReleasePromotionListType.EQUALS,
};

function IssueCreate(): ReactElement {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  /** phân quyền */
  const [allowActivePromotionRelease] = useAuthorization({
    acceptPermissions: [PromotionReleasePermission.ACTIVE],
  });
  /** */

  const {
    setIsSetFormValues,
    registerWithMinistry,
    releasePromotionListType,
    listProductSelectImportNotExclude,
    listProductSelectImportHaveExclude,
    setPromotionType,
  } = useContext(IssueContext);

  let isActive = true;

  /** Action: Lưu và kích hoạt */
  const handleSaveAndActivate = () => {
    isActive = true;
    form.submit();
  };

  /** Action: Lưu */
  const save = async () => {
    isActive = false;
    form.submit();
  };

  const handleFormFinish = useCallback(
    (values: any, listProduct: any[]) => {
      const listProductMapVariantId = listProduct.filter((item) => item.variant_id);
      const listProductMapProduct = listProduct.filter((item) => !item.variant_id);

      const listVariantId = listProductMapVariantId.map((item) => item.variant_id);
      const listProductId = listProductMapProduct.map((item) => item.product_id);

      let listMapping = [];

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

      if (listProductMapProduct.length) {
        listMapping.push({
          field: CreateReleasePromotionRuleType.product_id,
          operator: releasePromotionListType,
          value: listProductId,
        });
      }

      values.rule.group_operator = CreateReleasePromotionRuleType.AND;
      values.rule.conditions = listMapping;

      values.operator = undefined;
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
        case ReleasePromotionListType.OTHER_CONDITION:
          values.operator = undefined;
          break;
        default:
          break;
      }

      dispatch(showLoading());
      const body = transformData(values, PROMO_TYPE.MANUAL);
      body.activated = isActive;
      body.is_registered = registerWithMinistry;
      dispatch(
        createPromotionReleaseAction(body, (result: PriceRule) => {
          dispatch(hideLoading());
          if (result) {
            showSuccess("Thêm mới chương trình khuyến mại thành công");
            history.push(UrlConfig.PROMOTION + UrlConfig.PROMO_CODE + `/${result.id}`);
          }
        }),
      );
    } catch (error: any) {
      showError(error.message);
      dispatch(hideLoading());
    }
  };

  /**
   * init data
   */
  useEffect(() => {
    setIsSetFormValues(true);
    setPromotionType(PriceRuleMethod.ORDER_THRESHOLD);
    form.setFieldsValue(initialFormValues);
  }, [form, setIsSetFormValues, setPromotionType]);

  return (
    <ContentContainer
      title="Tạo đợt phát hành khuyến mại"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
        },
        {
          name: "Tạo đợt phát hành khuyến mại",
        },
      ]}
    >
      <IssueStyled>
        <Form
          form={form}
          name="issue-create"
          initialValues={initialFormValues}
          onFinish={onFinish}
          onFinishFailed={({ errorFields }: any) => {
            const element: any = document.getElementById(errorFields[0]?.name.join(""));
            scrollAndFocusToDomElement(element);
          }}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={18}>
              <GeneralInfoForm />
              <PromotionTypeForm form={form} />
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
                {allowActivePromotionRelease && (
                  <Button type="primary" onClick={handleSaveAndActivate}>
                    Lưu và kích hoạt
                  </Button>
                )}
              </>
            }
          />
        </Form>
      </IssueStyled>
    </ContentContainer>
  );
}

const IssueCreateWithProvider = () => {
  return (
    <IssueProvider>
      <IssueCreate />
    </IssueProvider>
  );
};

export default IssueCreateWithProvider;
