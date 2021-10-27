import React, {useEffect, useState} from "react";
import "./discount.scss";
import { useHistory } from "react-router-dom";
import ContentContainer from "../../../component/container/content.container";
import UrlConfig from "../../../config/url.config";
import {Button, Card, Col, Form, Row, Select} from "antd";
import {showError} from "../../../utils/ToastUtils";
import GeneralInfo from "./components/general.info";
import arrowLeft from "../../../assets/icon/arrow-left.svg";
import {DiscountCreateModel} from "../../../model/promotion/discount.create.model";

const CreateDiscountPage = () => {
  const [discountForm] = Form.useForm();
  const history = useHistory();
  const [isCollapseActive, setCollapseActive] = React.useState<boolean>(true);
  const [customerAdvanceMsg, setCustomerAdvanceMsg] = React.useState<string | null>(null);

  const handerSubmit = (values: any) => {
    let body: DiscountCreateModel = {...values};
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
        onFinishFailed={({ errorFields }) => handleSubmitFail(errorFields)}
        layout="vertical"
        initialValues={{ entitlements: [""] }}
      >
        <Row gutter={24}>
          <Col span={24}>
            <GeneralInfo
              className="general-info"
              form={discountForm}
              name="general_add"
              customerAdvanceMsg={customerAdvanceMsg}
            />
          </Col>
        </Row>
        <div className="customer-bottom-button">
          <div onClick={() => history.goBack()} style={{ cursor: "pointer" }}>
            <img style={{ marginRight: "10px", transform: "rotate(180deg)"}} src={arrowLeft} alt="" />
            Quay lại danh sách chiết khấu
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

export default CreateDiscountPage;
