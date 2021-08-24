import { Checkbox, Form, Input } from "antd";
import React from "react";
import SingleThirdPartyLogisticLayout from "../component/SingleThirdPartyLogisticLayout";
import IconGiaoHangTietKiem from "./images/iconGiaoHangTietKiem.svg";
import { StyledComponent } from "./styles";

type PropType = {};

function SingleThirdPartyLogistic(props: PropType) {
  const [form] = Form.useForm();

  const listServices = [
    {
      key: "1",
      value: "Đồng giá 20k",
    },
    {
      key: "2",
      value: "Đồng giá 24k",
    },
    {
      key: "3",
      value: "TMĐT phát hôm sau",
    },
    {
      key: "4",
      value: "TMĐT bộ",
    },
    {
      key: "5",
      value: "TMĐT bay",
    },
  ];

  const initialFormValue = {
    token_api: "",
    shop_id: "",
    service: "",
    cuaHangApDung: [],
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
        logoSingleThirdPartyLogistic={IconGiaoHangTietKiem}
        nameSingleThirdPartyLogistic="Giao hàng tiết kiệm"
        onSubmit={handleSubmit}
        onCancelConnect={handleCancelConnect}
      >
        <Form
          form={form}
          name="form-single-third-party-logistic"
          layout="vertical"
          initialValues={initialFormValue}
          style={{ width: "377px", maxWidth: "100%" }}
        >
          <Form.Item name="account" label="Tài khoản: ">
            <Input
              type="text"
              placeholder="Nhập tài khoản"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu: ">
            <Input
              type="password"
              placeholder="Nhập mật khẩu"
              style={{ width: "100%" }}
            />
          </Form.Item>
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
        </Form>
      </SingleThirdPartyLogisticLayout>
    </StyledComponent>
  );
}

export default SingleThirdPartyLogistic;
