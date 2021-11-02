import React, {useEffect, useState} from "react";
import "./price-rules.scss";
import { useHistory } from "react-router-dom";
import ContentContainer from "../../../component/container/content.container";
import UrlConfig from "../../../config/url.config";
import {Button, Card, Col, Form, Row, Select} from "antd";
import {showError} from "../../../utils/ToastUtils";
import arrowLeft from "../../../assets/icon/arrow-left.svg";
import GeneralCreate from "./components/general.create";

const CreatePromotionCodePage = () => {
  const [promotionForm] = Form.useForm();
  const history = useHistory();
  const [customerAdvanceMsg, setCustomerAdvanceMsg] = React.useState<string | null>(null);

  const handerSubmit = (values: any) => {
    let body: any = {...values};
    if (body.customer_selection && body.prerequisite_gender === null) {
      console.log('Vui lòng nhập đối tượng khách hàng')
      setCustomerAdvanceMsg("Vui lòng nhập đối tượng khách hàng")
    }
    console.log("handler submit - values: ", values);
    console.log("handler submit - DiscountCreateModel: ", body);
  }

  const handleSubmitFail = (errorFields: any) => {
    const fieldName = errorFields[0].name.join("");
    if (fieldName === "contact_name" || fieldName === "contact_phone") {
      showError("Vui lòng nhập thông tin liên hệ");
    }
  }

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
          path: `${UrlConfig.PROMOTION}${UrlConfig.PRICE_RULES}`,
        },
        {
          name: "Tạo khuyến mãi",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PRICE_RULES}/create`,
        },
      ]}
    >
      <Form
        form={promotionForm}
        name="discount_add"
        onFinish={handerSubmit}
        onFinishFailed={({ errorFields }) => handleSubmitFail(errorFields)}
        layout="vertical"
        initialValues={{ entitlements: [""] }}
      >
        <Row gutter={24}>
          <Col span={24}>
            <GeneralCreate
              className="general-info"
              form={promotionForm}
              name="general_add"
              customerAdvanceMsg={customerAdvanceMsg}
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
              // onClick={() => reload()}
              style={{ marginLeft: ".75rem", marginRight: ".75rem" }}
              type="ghost"
            >
              Hủy
            </Button>
            <Button
              // onClick={() => reload()}
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
