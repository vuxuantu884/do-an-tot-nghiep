import {Button, Col, Form, Row} from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import {PromoPermistion} from "config/permissions/promotion.permisssion";
import {getListChannelRequest} from "domain/actions/order/order.action";
import useAuthorization from "hook/useAuthorization";
import _ from "lodash";
import {ChannelResponse} from "model/response/product/channel.response";
import {CustomerSelectionOption} from "model/response/promotion/discount/list-discount.response";
import moment from "moment";
import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router-dom";
import {PROMO_TYPE} from "utils/Constants";
import {DATE_FORMAT} from "utils/DateUtils";
import ContentContainer from "../../../../component/container/content.container";
import {HttpStatus} from "../../../../config/http-status.config";
import UrlConfig from "../../../../config/url.config";
import {unauthorizedAction} from "../../../../domain/actions/auth/auth.action";
import {StoreGetListAction} from "../../../../domain/actions/core/store.action";
import {getListSourceRequest} from "../../../../domain/actions/product/source.action";
import {StoreResponse} from "../../../../model/core/store.model";
import {SourceResponse} from "../../../../model/response/order/source.response";
import {createPriceRule} from "../../../../service/promotion/discount/discount.service";
import {showError, showSuccess} from "../../../../utils/ToastUtils";
import {CustomerFilterField} from "../../shared/cusomer-condition.form";
import GeneralInfo from "./general.info";
import "../discount.scss";

const CreateDiscountPage = () => {
  const dispatch = useDispatch();
  const [discountForm] = Form.useForm();
  const history = useHistory();
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);

  //phân quyền
  const [allowCreatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CREATE],
  });

  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
    dispatch(getListSourceRequest(setListSource));
    dispatch(getListChannelRequest(setListChannel));
  }, [dispatch]);

  const transformData = (values: any) => {
    let body: any = {};
    body.type = PROMO_TYPE.AUTOMATIC;
    body.title = values.title;
    body.priority = values.priority;
    body.description = values.description;
    body.discount_codes = values.discount_code?.length
      ? [{code: values.discount_code}]
      : null;
    body.entitled_method = values.entitled_method;
    body.quantity_limit = values.usage_limit;
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
    body.entitlements = values?.entitlements?.map((entitlement: any) => {
      return {
        entitled_variant_ids: entitlement.entitled_variant_ids || null,
        entitled_category_ids: null,
        prerequisite_quantity_ranges: [
          {
            greater_than_or_equal_to:
              entitlement["prerequisite_quantity_ranges.greater_than_or_equal_to"],
            less_than_or_equal_to: null,
            allocation_limit:
              entitlement["prerequisite_quantity_ranges.allocation_limit"],
            value_type:
              body.entitled_method === "FIXED_PRICE"
                ? "FIXED_PRICE"
                : entitlement["prerequisite_quantity_ranges.value_type"],
            value: entitlement["prerequisite_quantity_ranges.value"],
          },
        ],
        prerequisite_subtotal_ranges: null,
      };
    });

    // ==Đối tượng khách hàng==
    // Áp dụng tất cả
    body.customer_selection = values.customer_selection
      ? CustomerSelectionOption.ALL
      : CustomerSelectionOption.PREREQUISITE;

    //Giới tính khách hàng
    body.prerequisite_genders = values.prerequisite_genders;

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
                startsWeddingDays
                  .format(DATE_FORMAT.DDMM)
                  .substring(0, 2)
                  .padStart(2, "0")
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
    body.prerequisite_customer_loyalty_level_ids =
      values.prerequisite_customer_loyalty_level_ids;

    //Nhân viên phụ trách
    body.prerequisite_assignee_codes = values.prerequisite_assignee_codes;

    //==Chiết khấu nâng cao theo đơn hàng==
    //Điều kiện chung

    const rule = {
      ...values.rule,
      conditions: values.conditions,
    };

    if (_.isEmpty(JSON.parse(JSON.stringify(rule)))) {
      body.rule = null; 
    } else {
      body.rule = rule;
    }
    return body;
  };

  const handleCreateSuccess = (response: any) => {
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess("Lưu và kích hoạt thành công");
        history.push(`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${response.data.id}`);
        break;
      case HttpStatus.UNAUTHORIZED:
        dispatch(unauthorizedAction);
        break;
      case 40000003:
        showError(`${response.code} - ${response.message}`);
        break;
      default:
        showError(`${response.code} - ${response.message}`);
        break;
    }
  };

  let activeDiscout = true;
  const handleSubmit = async (values: any) => {
    try {
      const body = transformData(values);
      body.activated = activeDiscout;
      const createResponse = await createPriceRule(body);
      handleCreateSuccess(createResponse);
    } catch (error: any) {
      showError(error.message);
    }
  };
  const handleSaveAndActive = () => {
    activeDiscout = true;
    discountForm.submit();
  };
  const save = () => {
    activeDiscout = false;
    discountForm.submit();
  };

  const handleSubmitFail = (errorFields: any) => {
    const fieldName = errorFields[0].name.join("");
    if (fieldName === "contact_name" || fieldName === "contact_phone") {
      showError("Vui lòng nhập thông tin liên hệ");
      // setCollapseActive(true);
    }
  };

  return (
    <ContentContainer
      title="Tạo chiết khấu"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
          path: `${UrlConfig.PROMOTION}`,
        },
        {
          name: "Chiết khấu",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
        },
        {
          name: "Tạo Chiết khấu",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/create`,
        },
      ]}
    >
      <Form
        form={discountForm}
        name="discount_add"
        onFinish={(values: any) => handleSubmit(values)}
        onFinishFailed={({errorFields}) => handleSubmitFail(errorFields)}
        layout="vertical"
        scrollToFirstError
        initialValues={{
          entitlements: [""],
          priority: 1,
          entitled_method: "FIXED_PRICE",
        }}
      >
        <Row>
          <Col span={24}>
            <GeneralInfo
              className="general-info"
              form={discountForm}
              name="general_add"
              listStore={listStore}
              listSource={listSource}
              listChannel={listChannel}
              // customerAdvanceMsg={customerAdvanceMsg}
            />
          </Col>
        </Row>

        <BottomBarContainer
          back="Quay lại danh sách chiết khấu"
          rightComponent={
            allowCreatePromoCode && (
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
                <Button type="primary" onClick={() => handleSaveAndActive()}>
                  Lưu và kích hoạt
                </Button>
              </>
            )
          }
        />
      </Form>
    </ContentContainer>
  );
};

export default CreateDiscountPage;
