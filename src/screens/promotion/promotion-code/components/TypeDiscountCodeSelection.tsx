import {Checkbox, Col, Form, Input, Row, Select, Tooltip} from "antd";
import React, {useState} from "react";
import "../promotion-code.scss";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { InfoCircleOutlined } from "@ant-design/icons";
import CustomInput from "component/custom/custom-input";

const FixedPriceSelection = (props: any) => {
  const {form} = props;

  return (
    <Col span={24}>
      <Row gutter={30}>
        <Col span={11}>
          <Form.Item
            required
            label="Giá trị khuyến mại:"
            
          >
            <Input.Group compact>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Giá trị khuyến mại không được để trống",
                  },
                ]}
                name="weight"
                noStyle
              >
                <NumberInput
                  format={(a) => formatCurrency(a)}
                  replace={(a) => replaceFormatString(a)}
                  maxLength={6}
                  isFloat
                  placeholder="Giá trị khuyến mại"
                  style={{ width: "calc(100% - 70px)" }}
                />
              </Form.Item>
              <Form.Item name="weight_unit" noStyle>
                <Select
                  placeholder="Đơn vị"
                  style={{ width: "70px" }}
                  value="%"
                >
                  <Select.Option key='percent' value="%">
                      {"%"}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
        <Col span={8}>
          <CustomInput
            name="discount_code"
            label="Mỗi mã được sử dụng:"
            form={form}
            message="Vui lòng mã được sử dụng"
            placeholder="Nhập mã được sử dụng"
            maxLength={255}
          />
        </Col>
        <Col span={5}>
          <Checkbox> Không giới hạn </Checkbox>
        </Col>
      </Row>
      <Row gutter={30}>
        <Col span={11}>
        </Col>
        <Col span={8}>
          <CustomInput
            name="discount_code"
            label="Mỗi khách được sử dụng tối đa:"
            form={form}
            message="Vui lòng nhập khách được sử dụng tối đa"
            placeholder="Nhập khách được sử dụng tối đa"
            maxLength={255}
          />
        </Col>
        <Col span={5}>
          <Checkbox> Không giới hạn </Checkbox>
        </Col>
      </Row>
      <hr />
      <Row gutter={30} style={{padding: "20px 16px 0"}}>
        <Checkbox> Áp dụng chung với các mã khuyến mại khác&nbsp;
          <Tooltip title="Áp dụng chung với các mã khuyến mại khác"> <InfoCircleOutlined /> </Tooltip> 
        </Checkbox>
      </Row>
    </Col>
  );
}

export default FixedPriceSelection;
