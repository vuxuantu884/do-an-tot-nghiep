import {Checkbox, Col, Form, Input, Row, Select, Tooltip} from "antd";
import React, {useState} from "react";
import "../promotion-code.scss";
import NumberInput from "component/custom/number-input.custom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { InfoCircleOutlined } from "@ant-design/icons";

const FixedPriceSelection = (props: any) => {
  const {form} = props;
  const [typeUnit, setTypeUnit] = useState("PERCENT")

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
                  placeholder=" "
                  style={{ width: "calc(100% - 70px)" }}
                />
              </Form.Item>
              <Form.Item name="weight_unit" noStyle>
                <Select
                  placeholder="Đơn vị"
                  style={{ width: "70px" }}
                  defaultValue={"PERCENT"}
                  onChange={(value: string) => setTypeUnit(value)}
                >
                  <Select.Option key='percent' value="PERCENT"> {"%"} </Select.Option>
                  <Select.Option key='percent' value="VND"> {"đ"} </Select.Option>
                </Select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
        <Col span={8}>
        <Form.Item label="Mỗi mã được sử dụng:">
          <NumberInput
            style={{
              textAlign: "right",
              width: "100%",
              color: "#222222",
            }}
            maxLength={999999999999}
            minLength={0}
            // value={}
          />
        </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item label=" ">
            <Checkbox> Không giới hạn </Checkbox>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={30}>
        <Col span={11}>
        <Form.Item label="Tối đa:">
          <NumberInput
            style={{
              textAlign: "right",
              width: "15%",
              color: "#222222",
            }}
            maxLength={999999999999}
            minLength={0}
            disabled={typeUnit !== "PERCENT"}
            // value={}
          />
          </Form.Item>
        </Col>
        <Col span={8}>
        <Form.Item label="Mỗi khách được sử dụng tối đa:">
          <NumberInput
            style={{
              textAlign: "right",
              width: "100%",
              color: "#222222",
            }}
            minLength={0}
            // value={}
          />
        </Form.Item>
        </Col>
        <Col span={5}>
        <Form.Item label=" ">
            <Checkbox> Không giới hạn </Checkbox>
          </Form.Item>
        </Col>
      </Row>
      <hr />
      <Row gutter={30} style={{padding: "20px 16px 0"}}>
        <Checkbox> Áp dụng chung với các mã khuyến mại khác&nbsp;&nbsp;
          <Tooltip title="Bao gồm chiết khấu khách hàng, chiết khấu tích điểm, chiết khấu tự nhập cho đơn hàng và chương trình khuyến mãi">
            <InfoCircleOutlined /> 
          </Tooltip> 
        </Checkbox>
      </Row>
    </Col>
  );
}

export default FixedPriceSelection;
