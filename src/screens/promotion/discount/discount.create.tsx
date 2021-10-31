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


const CreateDiscountPage = () => {
  const dispatch = useDispatch();
  const [discountForm] = Form.useForm();
  const history = useHistory();
  const [isCollapseActive, setCollapseActive] = React.useState<boolean>(true);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  // const [customerAdvanceMsg, setCustomerAdvanceMsg] = React.useState<string | null>(null);
  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
    dispatch(getListSourceRequest(setListSource));

  }, []);

  const transformData = (values: any) => {
    console.log('transformData: ', values);
    let body: any = {};
    // if (body.customer_selection && body.prerequisite_gender === null) {
    //   console.log('Vui lòng nhập đối tượng khách hàng')
    //   setCustomerAdvanceMsg("Vui lòng nhập đối tượng khách hàng")
    // }
    // body.discount_codes.push(values.discount_codes)
    body.type = "AUTOMATIC";
    body.title = values.title;
    body.priority = values.priority;
    body.description = values.descriptionl
    body.discount_codes = values.discount_code?.length ? [values.discount_code] : null;
    body.entitled_method = values.entitled_method;
    body.usage_limit = values.usage_limit;
    body.prerequisite_order_sources_ids = values.prerequisite_order_sources_ids?.length ? values.prerequisite_order_sources_ids : null;
    body.prerequisite_sales_channel_names = values.prerequisite_sales_channel_names?.length ? values.prerequisite_sales_channel_names : null;
    body.prerequisite_order_sources_ids = values.prerequisite_order_sources_ids?.length ? values.prerequisite_order_sources_ids : null;
    body.starts_date = values.starts_date.format();
    body.ends_date = values.ends_date?.format();
    body.entitlements = values.entitlements.map((entitlement: any) => {
      return {
        entitled_variant_ids: entitlement.entitled_variant_ids || null,
        entitled_category_ids: null,
        prerequisite_quantity_ranges: [
          {
            greater_than_or_equal_to: entitlement['prerequisite_quantity_ranges.greater_than_or_equal_to'],
            less_than_or_equal_to: null,
            allocation_limit: entitlement['prerequisite_quantity_ranges.allocation_limit'],
            value_type: entitlement['prerequisite_quantity_ranges.value_type'],
            value: entitlement['prerequisite_quantity_ranges.value'],
          },
        ],
        prerequisite_subtotal_ranges: null
      }
    })
    return body;
  }
  const handerSubmit = async (values: any) => {
    const body = transformData(values);
    body.disabled = false;
    try {
      const createResponse = await createPriceRule(body);
      if (createResponse.code === 20000000) {
        showSuccess("Lưu và kích hoạt thành công");
        history.push("/promotion/discount");
      } else {
        showError(`${createResponse.code} - ${createResponse.message}`);
      }
    } catch (e) {
      showError(e.toString());
    }
  }

  const save = async () => {
    const values = await discountForm.validateFields();
    const body = transformData(values);
    body.disabled = true;
    try {
      const createResponse = await createPriceRule(body);
      if (createResponse.code === 20000000) {
        showSuccess("Lưu thành công");
        history.push("/promotion/discount");
      } else {
        showError(`${createResponse.code} - ${createResponse.message}`);
      }
    } catch (e) {
      showError(e);
    }
  }

  const handleSubmitFail = (errorFields: any) => {
    const fieldName = errorFields[0].name.join("");
    if (fieldName === "contact_name" || fieldName === "contact_phone") {
      showError("Vui lòng nhập thông tin liên hệ");
      setCollapseActive(true);
    }
  }

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
        onFinish={handerSubmit}
        onFinishFailed={({errorFields}) => handleSubmitFail(errorFields)}
        layout="vertical"
        initialValues={{
          entitlements: [""],
          priority: 1
        }}
      >
        <Row gutter={24}>
          <Col span={24}>
            <GeneralInfo
              className="general-info"
              form={discountForm}
              name="general_add"
              listStore={listStore}
              listSource={listSource}
              // customerAdvanceMsg={customerAdvanceMsg}
            />
          </Col>
        </Row>
        <div className="customer-bottom-button">
          <div onClick={() => history.goBack()} style={{cursor: "pointer"}}>
            <img style={{marginRight: "10px", transform: "rotate(180deg)"}} src={arrowLeft} alt=""/>
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
  )
}

export default CreateDiscountPage;
