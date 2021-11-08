import React, {useCallback, useEffect, useState} from "react";
import ContentContainer from "../../../component/container/content.container";
import UrlConfig from "../../../config/url.config";
import arrowLeft from "../../../assets/icon/arrow-left.svg";
import GeneralCreate from "./components/general.create";
import "./promo-code.scss";
import { Button, Col, Form, Row } from "antd";
import { useHistory } from "react-router-dom";
import { showSuccess } from "../../../utils/ToastUtils";
import { useDispatch } from "react-redux";
import { PROMO_TYPE } from "utils/Constants";
import { StoreResponse } from "model/core/store.model";
import { SourceResponse } from "model/response/order/source.response";
import { StoreGetListAction } from "../../../domain/actions/core/store.action";
import { getListSourceRequest } from "../../../domain/actions/product/source.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { addPriceRules } from "domain/actions/promotion/discount/discount.action";

const CreatePromotionCodePage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [promoCodeForm] = Form.useForm();
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);

  const initialValues = {
    title: "",
    discount_code: "",
    sale_type: "SALE_CODE",
    product_type: "PRODUCT",
    value_type: "PERCENTAGE",
  };

  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
    dispatch(getListSourceRequest(setListSource));
  }, [dispatch]);

  const transformData = (values: any) => {
    let body: any = {};
    body.type = PROMO_TYPE.MANUAL;
    body.title = values.title;
    body.description = values.description;
    body.discount_codes = values.discount_code?.length ? [{code: "PC" + values.discount_code}] : null;
    body.usage_limit = values.usage_limit ? values.usage_limit : null;
    body.usage_limit_per_customer = values.usage_limit_per_customer  ? values.usage_limit_per_customer : null;
    body.prerequisite_store_ids = values.prerequisite_store_ids?.length ? values.prerequisite_store_ids : null;
    body.prerequisite_sales_channel_names = values.prerequisite_sales_channel_names?.length ? values.prerequisite_sales_channel_names : null;
    body.prerequisite_order_source_ids = values.prerequisite_order_source_ids?.length ? values.prerequisite_order_source_ids : null;
    body.starts_date = values.prerequisite_duration[0]?.format();
    body.ends_date = values.prerequisite_duration[1]?.format();
    body.entitled_method = "QUANTITY";
    body.entitlements = values.entitlements.map((entitlement: any) => {
      return {
        entitled_variant_ids: entitlement.entitled_variant_ids || null,
        entitled_category_ids: null,
        prerequisite_quantity_ranges: [
          {
            greater_than_or_equal_to: entitlement['prerequisite_quantity_ranges.greater_than_or_equal_to'],
            less_than_or_equal_to: null,
            allocation_limit: entitlement['prerequisite_quantity_ranges.allocation_limit'],
            value_type: values.value_type,
            value: values.value,
          },
        ],
        prerequisite_subtotal_ranges: null
      }
    });
    return body;
  }

  const createCallback = useCallback(() => {
    dispatch(hideLoading());
    showSuccess("Thêm thành công");
    history.push(`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`);
  }, [dispatch, history]);

  const onFinish = (values: any) => {
    // Action: Lưu và kích hoạt
    const body = transformData(values);
    body.disabled = false;
    dispatch(showLoading());
    dispatch(addPriceRules(body, createCallback));
  }

  const save = async () => {
    // Action: Lưu
    const values = await promoCodeForm.validateFields();
    const body = transformData(values);
    body.disabled = true;
    dispatch(showLoading());
    dispatch(addPriceRules(transformData(values), createCallback));
  }

  const reload = React.useCallback(() => {
    promoCodeForm.resetFields();
  }, [promoCodeForm]);

  return (
    <ContentContainer
      title="Tạo khuyến mãi"
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
          name: "Tạo khuyến mãi",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/create`,
        },
      ]}
    >
      <Form
        form={promoCodeForm}
        name="discount_add"
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => console.log(errorFields)}
        layout="vertical"
        initialValues={initialValues}
      >
        <Row gutter={24}>
          <Col span={24}>
          <GeneralCreate
              className="general-info"
              form={promoCodeForm}
              name="general_add"
              listStore={listStore}
              listSource={listSource}
            />
          </Col>
        </Row>
        <div className="customer-bottom-button">
          <div onClick={() => history.goBack()} style={{ cursor: "pointer" }}>
            <img style={{ marginRight: "10px", transform: "rotate(180deg)"}} src={arrowLeft} alt="" />
            Quay lại danh sách
          </div>
          <div>
            <Button
              onClick={() => reload()}
              style={{ marginLeft: ".75rem", marginRight: ".75rem" }}
              type="ghost"
            >
              Hủy
            </Button>
            <Button
              onClick={() => save()}
              style={{ marginLeft: ".75rem", marginRight: ".75rem", borderColor: "#2a2a86" }}
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
  )
}

export default CreatePromotionCodePage;
