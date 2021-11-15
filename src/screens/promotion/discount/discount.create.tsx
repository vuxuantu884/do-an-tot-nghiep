import React, {useEffect, useState} from "react";
import "./discount.scss";
import {useHistory} from "react-router-dom";
import ContentContainer from "../../../component/container/content.container";
import UrlConfig from "../../../config/url.config";
import {Button, Col, Form, Row} from "antd";
import {showError, showSuccess} from "../../../utils/ToastUtils";
import GeneralInfo from "./components/general.info";
import arrowLeft from "../../../assets/icon/arrow-left.svg";
import {StoreGetListAction} from "../../../domain/actions/core/store.action";
import {getListSourceRequest} from "../../../domain/actions/product/source.action";
import {useDispatch} from "react-redux";
import {StoreResponse} from "../../../model/core/store.model";
import {SourceResponse} from "../../../model/response/order/source.response";
import {createPriceRule} from "../../../service/promotion/discount/discount.service";
import {PROMO_TYPE} from "utils/Constants";
import {getListChannelRequest} from "domain/actions/order/order.action";
import {ChannelResponse} from "model/response/product/channel.response";
import {HttpStatus} from "../../../config/http-status.config";
import {unauthorizedAction} from "../../../domain/actions/auth/auth.action";

const CreateDiscountPage = () => {
  const dispatch = useDispatch();
  const [discountForm] = Form.useForm();
  const history = useHistory();
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);
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
    body.discount_codes = values.discount_code?.length ? [{code: values.discount_code}] : null;
    body.entitled_method = values.entitled_method;
    body.quantity_limit = values.usage_limit;
    body.prerequisite_store_ids = values.prerequisite_store_ids?.length ? values.prerequisite_store_ids : null;
    body.prerequisite_sales_channel_names = values.prerequisite_sales_channel_names?.length ? values.prerequisite_sales_channel_names : null;
    body.prerequisite_order_source_ids = values.prerequisite_order_source_ids?.length ? values.prerequisite_order_source_ids : null;
    body.starts_date = values.starts_date.format();
    body.ends_date = values.ends_date?.format() || null;
    body.entitlements = values.entitlements.map((entitlement: any) => {
      return {
        entitled_variant_ids: entitlement.entitled_variant_ids || null,
        entitled_category_ids: null,
        prerequisite_quantity_ranges: [
          {
            greater_than_or_equal_to: entitlement["prerequisite_quantity_ranges.greater_than_or_equal_to"],
            less_than_or_equal_to: null,
            allocation_limit: entitlement["prerequisite_quantity_ranges.allocation_limit"],
            value_type: body.entitled_method === "FIXED_PRICE" ? "FIXED_PRICE" : entitlement["prerequisite_quantity_ranges.value_type"],
            value: entitlement["prerequisite_quantity_ranges.value"],
          },
        ],
        prerequisite_subtotal_ranges: null,
      };
    });
    return body;
  };

  const handleCreateSuccess = (response:any) => {
    switch (response.code) {
      case HttpStatus.SUCCESS:
        showSuccess("Lưu và kích hoạt thành công");
        history.push(`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${response.data.id}`);
        break;
      case HttpStatus.UNAUTHORIZED:
        dispatch(unauthorizedAction);
        break;
      default:
        showError(`${response.code} - ${response.message}`);
        break;
    }
  }

  const handleSubmit = async (values: any) => {
    const body = transformData(values);
    body.activated = true;
    const createResponse = await createPriceRule(body);
    handleCreateSuccess(createResponse);
  };

  const save = async () => {
    const values = await discountForm.validateFields();
    const body = transformData(values);
    body.activated = false;
    const createResponse = await createPriceRule(body);
    handleCreateSuccess(createResponse);
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
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
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
        onFinish={handleSubmit}
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
        <div className="customer-bottom-button">
          <div onClick={() => history.goBack()} style={{cursor: "pointer"}}>
            <img style={{marginRight: "10px", transform: "rotate(180deg)"}} src={arrowLeft} alt="" />
            Quay lại danh sách chiết khấu
          </div>
          <div>
            <Button
              // onClick={() => reload()}
              style={{marginLeft: ".75rem", marginRight: ".75rem"}}
              type="ghost"
            >
              Hủy
            </Button>
            <Button
              onClick={() => save()}
              style={{marginLeft: ".75rem", marginRight: ".75rem", borderColor: "#2a2a86"}}
              type="ghost"
            >
              Lưu
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu và kích hoạt
            </Button>
          </div>
        </div>
      </Form>
    </ContentContainer>
  );
};

export default CreateDiscountPage;
