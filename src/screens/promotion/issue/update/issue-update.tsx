import { Button, Col, Form, Row } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import {
  getPriceRuleAction,
  updatePriceRuleByIdAction,
} from "domain/actions/promotion/discount/discount.action";
import { PriceRule } from "model/promotion/price-rules.model";
import moment from "moment";
import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import GeneralConditionForm from "screens/promotion/shared/general-condition.form";
import { PROMO_TYPE } from "utils/Constants";
import { parseDurationToMoment, transformData } from "utils/PromotionUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import IssueForm from "../components/issue-form";
import IssueProvider, { IssueContext } from "../components/issue-provider";
import { IssueStyled } from "../issue-style";

interface Props {}

function IssueUpdate(props: Props): ReactElement {
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

  const [loading, setLoading] = useState(true);
  const { setPriceRuleData, setIsLimitUsage, setIsLimitUsagePerCustomer } =
    useContext(IssueContext);

  const onFinish = (values: any) => {
    try {
      setIsSubmitting(true);
      const body = transformData(values, PROMO_TYPE.MANUAL);
      body.id = priceRuleId;
      dispatch(
        updatePriceRuleByIdAction(body, (result: PriceRule) => {
          if (result) {
            showSuccess("Cập nhật thành công");
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
            ? result.entitlements[0]?.prerequisite_quantity_ranges[0]
                ?.value_type
            : null,
        prerequisite_genders: result.prerequisite_genders?.map((item) =>
          item.toLocaleUpperCase()
        ),

        starts_birthday: parseDurationToMoment(
          result.prerequisite_birthday_duration?.starts_mmdd_key
        ),
        ends_birthday: parseDurationToMoment(
          result.prerequisite_birthday_duration?.ends_mmdd_key
        ),

        starts_wedding_day: parseDurationToMoment(
          result.prerequisite_wedding_duration?.starts_mmdd_key
        ),
        ends_wedding_day: parseDurationToMoment(
          result.prerequisite_wedding_duration?.ends_mmdd_key
        ),
      };

      // set limit usage
      setIsLimitUsage(!!result.usage_limit);
      setIsLimitUsagePerCustomer(!!result.usage_limit_per_customer);

      //set default checked Bộ lọc
      setIsAllStore(result.prerequisite_store_ids?.length === 0);
      setIsAllChannel(result.prerequisite_sales_channel_names?.length === 0);
      setIsAllSource(result.prerequisite_order_source_ids?.length === 0);

      setIsAllCustomer(result.customer_selection.toLocaleUpperCase() === "ALL");
      setPriceRuleData(formValue);
      form.setFieldsValue(formValue);
    },
    [form, setPriceRuleData, setIsLimitUsage, setIsLimitUsagePerCustomer]
  );

  /**
   *
   */
  const onResult = useCallback(
    (result: PriceRule) => {
      if (result) {
        parseDataToForm(result);
        setLoading(false);
      }
    },
    [parseDataToForm]
  );

  // Action: Lấy thông tin khuyến mãi
  useEffect(() => {
    setLoading(true);
    dispatch(getPriceRuleAction(priceRuleId, onResult));
  }, [dispatch, priceRuleId, onResult]);

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
      ]}>
      <IssueStyled>
        <Form
          form={form}
          name="discount_add"
          onFinish={onFinish}
          layout="vertical">
          <Row gutter={24}>
            <Col span={18}>
              <IssueForm form={form} />
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
            backAction={() =>
              history.push(`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`)
            }
            rightComponent={
              <div>
                <AuthWrapper acceptPermissions={[PromoPermistion.UPDATE]}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}>
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

const IssueUpdateWithProvider = (props: Props) => {
  return (
    <IssueProvider>
      <IssueUpdate {...props} />
    </IssueProvider>
  );
};

export default IssueUpdateWithProvider;
