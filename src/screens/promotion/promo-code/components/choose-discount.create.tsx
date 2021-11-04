import {Checkbox, Col, Form, Input, Row, Select, Tooltip} from "antd";
import React, {useState} from "react";
import "../promo-code.scss";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { InfoCircleOutlined } from "@ant-design/icons";

const ChooseDiscount = (props: any) => {
  const {form} = props;
  const [typeUnit, setTypeUnit] = useState("PERCENTAGE");
  const [isUsageLimit, setIsUsageLimit] = useState(false);
  const [isUsageLimitPerCus, setIsUsageLimitPerCus] = useState(false);

  return (
    <Col span={24}>
      <Row gutter={30}>
        {/* Giá trị khuyến mại */}
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
                name="value"
                noStyle
              >
                <NumberInput
                  onBlur={() => {
                    form.submit();
                  }}
                  isFloat={typeUnit === 'PERCENTAGE'}
                  className="product-item-discount-input"
                  style={{ width: "65%", textAlign: "right" }}
                  placeholder="Nhập giá trị khuyến mãi"
                  format={(a) => formatCurrency(a)}
                  replace={(a) => replaceFormatString(a)}
                  min={0}
                  default={0}
                  maxLength={typeUnit === "FIXED_AMOUNT" ? 15 : 3}
                  max={typeUnit === "FIXED_AMOUNT" ? 9999999 : 100}
                />
              </Form.Item>
              <Form.Item name="value_type" noStyle>
                <Select
                  placeholder="Đơn vị"
                  style={{ width: "70px" }}
                  defaultValue={"PERCENTAGE"}
                  value={typeUnit}
                  onChange={(value: string) => {
                    setTypeUnit(value);
                    form.setFieldsValue({value_type: value})
                  }}
                >
                  <Select.Option key='percent' value="PERCENTAGE"> {"%"} </Select.Option>
                  <Select.Option key='percent' value="FIXED_AMOUNT"> {"đ"} </Select.Option>
                </Select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
        {/* Mỗi mã được sử dụng */}
        <Col span={8}>
          <Form.Item 
            label="Mỗi mã được sử dụng:"
            name="usage_limit"
            rules={[
              {
                required: !isUsageLimit,
                message: "Mã được sử dụng không được để trống",
              }
            ]}
          >
            <NumberInput
              style={{
                textAlign: "right",
                width: "100%",
                color: "#222222",
              }}
              maxLength={999999999999999}
              minLength={0}
              disabled={isUsageLimit}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item label=" ">
            <Checkbox onChange={value => {
              setIsUsageLimit(value.target.checked);
              form.setFieldsValue({
                usage_limit: null
              });
            }}> Không giới hạn </Checkbox>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={30}>
        {/* Tối đa */}
        <Col span={11}>
          <Form.Item label="Tối đa:">
          <NumberInput
            style={{
              textAlign: "right",
              width: "15%",
              color: "#222222",
            }}
            maxLength={999}
            minLength={0}
            min={0}
            max={100}
            disabled={typeUnit !== "PERCENT"}
          />
          </Form.Item>
        </Col>
        {/* Mỗi khách được sử dụng tối đa */}
        <Col span={8}>
          <Form.Item 
            name="usage_limit_per_customer"
            label="Mỗi khách được sử dụng tối đa:"
          >
            <NumberInput
              style={{
                textAlign: "right",
                width: "100%",
                color: "#222222",
              }}
              minLength={0}
              disabled={isUsageLimitPerCus}
            />
          </Form.Item>
        </Col>
        <Col span={5}>
        <Form.Item label=" ">
            <Checkbox onChange={value => {
              setIsUsageLimitPerCus(value.target.checked);
              form.setFieldsValue({
                usage_limit_per_customer: null
              });
            }}> Không giới hạn </Checkbox>
        </Form.Item>
        </Col>
      </Row>
      <hr style={{marginTop: "0"}} />
      <Row gutter={30} style={{padding: "0 16px 0"}}>
        <Checkbox> Áp dụng chung với các mã khuyến mại khác&nbsp;&nbsp;
          <Tooltip title="Bao gồm chiết khấu khách hàng, chiết khấu tích điểm, chiết khấu tự nhập cho đơn hàng và chương trình khuyến mãi">
            <InfoCircleOutlined /> 
          </Tooltip> 
        </Checkbox>
      </Row>
    </Col>
  );
}

export default ChooseDiscount;
