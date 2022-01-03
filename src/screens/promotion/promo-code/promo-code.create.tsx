import { Button, Col, Form, Row } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { getListChannelRequest } from "domain/actions/order/order.action";
import { addPriceRules } from "domain/actions/promotion/discount/discount.action";
import { StoreResponse } from "model/core/store.model";
import { SourceResponse } from "model/response/order/source.response";
import { ChannelResponse } from "model/response/product/channel.response"; 
import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { PROMO_TYPE } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import ContentContainer from "../../../component/container/content.container";
import UrlConfig from "../../../config/url.config";
import { StoreGetListAction } from "../../../domain/actions/core/store.action";
import { getListSourceRequest } from "../../../domain/actions/product/source.action";
import { showError, showSuccess } from "../../../utils/ToastUtils";
import { CustomerFilterField } from "../shared/cusomer-condition.form";
import GeneralCreate from "./components/general.create";
import "./promo-code.scss";
import IssuingProvider, { IssuingContext } from "./issuing-provider";
import { CustomerSelectionOption } from "model/promotion/price-rules.model";


const CreatePromotionCodePage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [promoCodeForm] = Form.useForm();
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);
  const [, setFormValues] = useState({}); // force re-render form value
  //phân quyền
  const { isAllProduct } = useContext(IssuingContext);

  const initialValues = {
    title: "",
    discount_code: "",
    sale_type: "SALE_CODE",
    product_type: "PRODUCT",
    value_type: "PERCENTAGE",
    value: null,
    usage_limit: "1",
    usage_unlimit_per_customer: true,
    starts_date: moment(),

  };

  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
    dispatch(getListSourceRequest(setListSource));
    dispatch(getListChannelRequest(setListChannel));
  }, [dispatch]);

  const transformData = (values: any) => {
    let body: any = {};
    body.type = PROMO_TYPE.MANUAL;
    body.title = values.title;
    body.description = values.description;
    body.discount_codes = values.discount_code?.length
      ? [{ code: "PC" + values.discount_code }]
      : null;
    body.usage_limit = values.usage_limit ? values.usage_limit : null;
    body.usage_limit_per_customer = values.usage_limit_per_customer
      ? values.usage_limit_per_customer
      : null;
    body.prerequisite_store_ids = values.prerequisite_store_ids?.length
      ? values.prerequisite_store_ids
      : null;
    body.prerequisite_sales_channel_names = values.prerequisite_sales_channel_names
      ?.length
      ? values.prerequisite_sales_channel_names
      : null;
    body.prerequisite_order_source_ids = values.prerequisite_order_source_ids?.length
      ? values.prerequisite_order_source_ids
      : null;
    body.starts_date = values.starts_date.format();
    body.ends_date = values.ends_date?.format() || null;
    body.entitled_method = "QUANTITY";
    body.prerequisite_subtotal_range = values.prerequisite_subtotal_range_min
      ? {
        greater_than_or_equal_to: values.prerequisite_subtotal_range_min,
        less_than_or_equal_to: null,
      }
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
    // Áp dụng tất cả
    body.customer_selection = values.customer_selection ? CustomerSelectionOption.ALL : CustomerSelectionOption.PREREQUISITE;

    //Giới tính khách hàng
    body.prerequisite_genders = values.prerequisite_genders;

    //Ngày sinh khách hàng
    const startsBirthday = values[CustomerFilterField.starts_birthday] ? moment(values[CustomerFilterField.starts_birthday]) : null;
    const endsBirthday = values[CustomerFilterField.ends_birthday] ? moment(values[CustomerFilterField.ends_birthday]) : null;
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
    const startsWeddingDays = values[CustomerFilterField.starts_wedding_day] ? moment(values[CustomerFilterField.starts_wedding_day]) : null;
    const endsWeddingDays = values[CustomerFilterField.ends_wedding_day] ? moment(values[CustomerFilterField.ends_wedding_day]) : null;

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

    //Nhóm khách hàng
    body.prerequisite_customer_group_ids = values.prerequisite_customer_group_ids;

    //Hạng khách hàng
    body.prerequisite_customer_loyalty_level_ids = values.prerequisite_customer_loyalty_level_ids;

    //Nhân viên phụ trách
    body.prerequisite_assignee_codes = values.prerequisite_assignee_codes;
    return body;
  };

  const createCallback = useCallback(
    (data) => {
      if (data) {
        setTimeout(() => {
          showSuccess("Thêm thành công");
          history.push(`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${data.id}`);
          dispatch(hideLoading());
        }, 2000);
      } else dispatch(hideLoading());
    },
    [dispatch, history]
  );



  let isActive = true;
  const onFinish = (values: any) => {
    // Action: Lưu và kích hoạt
    if (!isAllProduct && (values.entitlements.length === 0 || values.entitlements[0].entitled_variant_ids.length === 0)) {
      showError("Vui lòng chọn sản phẩm để áp dụng");
      return;
    }

    const body = transformData(values);
    body.activated = isActive;
    dispatch(showLoading());
    dispatch(addPriceRules(body, createCallback));
  };
  const handleSaveAndActivate = (values: any) => {
    // Action: Lưu và kích hoạt
    isActive = true;
    promoCodeForm.submit();
  }
  const save = async () => {
    // Action: Lưu
    isActive = false;
    promoCodeForm.submit();

  };

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
      ]}
    >
      <Form
        form={promoCodeForm}
        name="discount_add"
        onFinish={onFinish}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={(_, values) => setFormValues(values)}
      >
        <Row gutter={24}>
          <Col span={24}>
            <GeneralCreate
              className="general-info"
              form={promoCodeForm}
              name="general_add"
              listStore={listStore}
              listSource={listSource}
              listChannel={listChannel}
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
    </ContentContainer>
  );
};


const CreatePromoWithProvider = () => {
  return (
    <IssuingProvider>
      <CreatePromotionCodePage />
    </IssuingProvider>
  );
}

export default CreatePromoWithProvider;