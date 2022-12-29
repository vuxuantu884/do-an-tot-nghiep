import { Button, Col, Form, Row } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
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
import React, { ReactElement, useCallback, useEffect, useState, useContext } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import GeneralConditionForm from "screens/promotion/shared/general-condition.form";
import { PROMO_TYPE } from "utils/Constants";
import { transformData } from "utils/PromotionUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import IssueForm from "../components/issue-form";
import IssueProvider, { IssueContext } from "../components/issue-provider";
import { IssueStyled } from "../issue-style";
import { createPromotionReleaseAction } from "domain/actions/promotion/promo-code/promo-code.action";
import { RelesaseCreactProduct } from "screens/promotion/shared/general-product-quantity";
import { DiscountUnitType } from "screens/promotion/constants";

export enum CreateReleasePromotionRuleType {
  AND = "AND",
  quantity = "quantity",
  variant_id = "variant_id",
  product_id = "product_id",
}

interface Props {}

function IssueCreate(props: Props): ReactElement {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const { registerWithMinistry } = useContext(IssueContext);

  const [isSetFormValues, setIsSetFormValues] = useState<boolean>(false);

  const [typeSelectPromotion, setTypeSelectPromotion] = useState<string>(
    DiscountUnitType.PERCENTAGE.value,
  );
  const [valueChangePromotion, setValueChangePromotion] = useState<number>(0);
  const [promotionType, setPromotionType] = useState<string>(PriceRuleMethod.ORDER_THRESHOLD);
  const [releasePromotionListType, setReleasePromotionListType] = useState<string>(
    ReleasePromotionListType.EQUALS,
  );

  const [listProductSelectImportNotExclude, setListProductSelectImportNotExclude] = useState<any[]>(
    [],
  );

  const [listProductSelectImportHaveExclude, setListProductSelectImportHaveExclude] = useState<
    any[]
  >([]);

  const [releaseWithExlucdeOrAllProduct, setReleaseWithExlucdeOrAllProduct] = useState<string>(
    RelesaseCreactProduct.ALL,
  );

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

  const initialFormValue = {
    ...form.getFieldsValue(),
    operator: ReleasePromotionListType.EQUALS,
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
      switch (values.operator) {
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
            showSuccess("Thêm thành công");
            history.push(UrlConfig.PROMOTION + UrlConfig.PROMO_CODE);
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
    const initialValues = {
      starts_date: moment(),
      entitled_method: PriceRuleMethod.ORDER_THRESHOLD,
      priority: 1,
      entitlements: [],
    };

    setIsSetFormValues(true);
    form.setFieldsValue(initialValues);
  }, [form]);

  return (
    <ContentContainer
      title="Tạo đợt phát hành khuyến mại"
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
          name: "Tạo đợt phát hành khuyến mại",
        },
      ]}
    >
      <IssueStyled>
        <Form
          form={form}
          name="issue-create"
          initialValues={initialFormValue}
          onFinish={onFinish}
          layout="vertical"
        >
          <Row gutter={24}>
            <Col span={18}>
              <IssueForm
                form={form}
                isSetFormValues={isSetFormValues}
                typeSelectPromotion={typeSelectPromotion}
                setTypeSelectPromotion={setTypeSelectPromotion}
                valueChangePromotion={valueChangePromotion}
                setValueChangePromotion={setValueChangePromotion}
                promotionType={promotionType}
                setPromotionType={setPromotionType}
                releasePromotionListType={releasePromotionListType}
                setReleasePromotionListType={setReleasePromotionListType}
                releaseWithExlucdeOrAllProduct={releaseWithExlucdeOrAllProduct}
                setReleaseWithExlucdeOrAllProduct={setReleaseWithExlucdeOrAllProduct}
                listProductSelectImportNotExclude={listProductSelectImportNotExclude}
                setListProductSelectImportNotExclude={setListProductSelectImportNotExclude}
                listProductSelectImportHaveExclude={listProductSelectImportHaveExclude}
                setListProductSelectImportHaveExclude={setListProductSelectImportHaveExclude}
              />
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
              <AuthWrapper acceptPermissions={[PromotionReleasePermission.CREATE]}>
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
                <Button type="primary" onClick={handleSaveAndActivate}>
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
