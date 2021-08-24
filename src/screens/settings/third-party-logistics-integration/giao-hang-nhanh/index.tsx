import { Button, Card, Checkbox, Col, Form, Input, Row, Select } from "antd";
import React, { useState } from "react";
import SingleThirdPartyLogisticLayout from "../component/SingleThirdPartyLogisticLayout";
import IconGiaoHangNhanh from "./images/giaoHangNhanh.svg";
import IconClose from "./images/iconClose.svg";
import { StyledComponent } from "./styles";

type PropType = {};

function SingleThirdPartyLogistic(props: PropType) {
  const [form] = Form.useForm();

  const listShops = [
    {
      value: "Cửa hàng 1",
      key: "1",
    },
    {
      value: "Cửa hàng 2",
      key: "2",
    },
    {
      value: "Cửa hàng 3",
      key: "3",
    },
  ];

  const listServices = [
    {
      key: "1",
      value: "Giao nhanh",
    },
    {
      key: "2",
      value: "Giao tiêu chuẩn",
    },
    {
      key: "3",
      value: "Giao chậm",
    },
  ];

  const listShopIsSelected = [
    {
      name: "YODY Chí Linh 1",
      code: "16783488",
    },
    {
      name: "YODY Chí Linh 2",
      code: "16783488",
    },
    {
      name: "YODY Chí Linh 3",
      code: "16783488",
    },
    {
      name: "YODY Chí Linh 4",
      code: "1678348891",
    },
    {
      name: "YODY Chí Linh 5",
      code: "1678348892",
    },
  ];

  const initialFormValue = {
    token_api: "",
    shop_id: "",
    service: "",
    cuaHangApDung: [],
  };

  const [listShopIsSelectedShow, setListShopIsSelectedShow] =
    useState(listShopIsSelected);

  const searchShopIsSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    console.log("value", e.target.value);
    let cloneListShopIsSelected = [...listShopIsSelected];
    let result = cloneListShopIsSelected.filter((singleShop) => {
      return (
        singleShop.name.toLowerCase().includes(value.toLowerCase()) ||
        singleShop.code.toLowerCase().includes(value.toLowerCase())
      );
    });
    setListShopIsSelectedShow(result);
  };

  const handleSubmit = () => {
    const formComponentValue = form.getFieldsValue();
    console.log("formComponentValue", formComponentValue);
  };

  const handleCancelConnect = () => {
    console.log("cancelConnect");
  };

  return (
    <StyledComponent>
      <SingleThirdPartyLogisticLayout
        logoSingleThirdPartyLogistic={IconGiaoHangNhanh}
        nameSingleThirdPartyLogistic="Giao hàng nhanh"
        onSubmit={handleSubmit}
        onCancelConnect={handleCancelConnect}
      >
        <Form
          form={form}
          name="form-single-third-party-logistic"
          layout="vertical"
          initialValues={initialFormValue}
        >
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item name="token_api" label="Token API: ">
                <Input
                  type="text"
                  placeholder="Nhập token API"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div className="sectionSelectShop">
                <Form.Item
                  label="Shop ID"
                  name="shop"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn trạng thái!",
                    },
                  ]}
                >
                  <Select placeholder="Cửa hàng" allowClear>
                    {listShops &&
                      listShops.map((singleShop) => {
                        return (
                          <Select.Option
                            value={singleShop.key}
                            key={singleShop.key}
                          >
                            {singleShop.value}
                          </Select.Option>
                        );
                      })}
                  </Select>
                </Form.Item>
                <div>
                  <Button>Shop ID</Button>
                  <Button>Thêm</Button>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <Form.Item
                name="checkbox-group"
                label="Chọn dịch vụ đã kí hợp đồng với hãng vận chuyển:"
              >
                <Checkbox.Group>
                  {listServices &&
                    listServices.length > 0 &&
                    listServices.map((singleService) => {
                      return (
                        <div key={singleService.key}>
                          <Checkbox value={singleService.key}>
                            {singleService.value}
                          </Checkbox>
                        </div>
                      );
                    })}
                </Checkbox.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Card title="Cửa hàng áp dụng" className="cardShopIsSelected">
                <div className="search">
                  <Input
                    type="text"
                    placeholder="Nhập mã hoặc tên cửa hàng"
                    style={{ width: "100%" }}
                    allowClear
                    onChange={(e) => searchShopIsSelected(e)}
                  />
                </div>
                <div className="listShop">
                  {listShopIsSelectedShow &&
                    listShopIsSelectedShow.length > 0 &&
                    listShopIsSelectedShow.map((single, index) => {
                      return (
                        <div className="singleShop" key={index}>
                          <div className="singleShop__title">
                            <span className="singleShop__name">
                              {single.name}
                            </span>
                            :{" "}
                            <span className="singleShop__code">
                              {single.code}
                            </span>
                          </div>
                          <div className="singleShop__action">
                            <img src={IconClose} alt="" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </SingleThirdPartyLogisticLayout>
    </StyledComponent>
  );
}

export default SingleThirdPartyLogistic;
