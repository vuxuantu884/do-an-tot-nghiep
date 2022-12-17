import {
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import { PriceRuleMethod } from "model/promotion/price-rules.model";
import React, { ReactElement, useContext, useLayoutEffect, useState } from "react";
import { handleChangeDiscountMethod } from "utils/PromotionUtils";
import { MAX_FIXED_DISCOUNT_VALUE, priorityOptions } from "../../constants";
import { DiscountContext } from "./discount-provider";
import GroupDiscountList from "./group-discount-list";
import DiscountTypeOrderThreshold from "./discount-type-order-threshold";
import { DiscountFormStyle } from "../discount-style";
const { Option } = Select;
interface Props {
  form: FormInstance;
  unlimitedUsageProps: boolean;
  usageLimitPerCustomerProps: boolean;
  idNumber?: number;
  originalEntitlements?: any;
}

function DiscountUpdateForm({
  form,
  unlimitedUsageProps,
  usageLimitPerCustomerProps,
  idNumber,
  originalEntitlements,
}: Props): ReactElement {
  const discountUpdateContext = useContext(DiscountContext);

  const { discountMethod, setDiscountMethod, registerWithMinistry, setRegisterWithMinistry } =
    discountUpdateContext;

  const [unlimitedQuantity, setUnlimitedQuantity] = useState<boolean>(false);
  const [usageLimitPerCustomer, setUsageLimitPerCustomer] = useState<boolean>(false);

  useLayoutEffect(() => {
    setUnlimitedQuantity(unlimitedUsageProps);
    setUsageLimitPerCustomer(usageLimitPerCustomerProps);
  }, [unlimitedUsageProps, usageLimitPerCustomerProps]);

  return (
    <DiscountFormStyle>
      <Card
        title={
          <div className="d-flex">
            <span className="title-card">THÔNG TIN CHUNG</span>
          </div>
        }
      >
        <Row gutter={30}>
          <Col span={12}>
            <Form.Item
              name="title"
              label={"Tên khuyến mại"}
              rules={[
                {
                  required: true,
                  message: "Cần nhập tên khuyến mãi",
                },
                {
                  max: 255,
                  message: "Tên khuyến mại không được vượt quá 255 ký tự",
                },
              ]}
            >
              <Input placeholder="Nhập tên khuyến mại" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="discount_code" label={"Mã khuyến mại"}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Row gutter={30}>
              <Col span={12}>
                <Form.Item
                  label={"Số lượng áp dụng"}
                  name="quantity_limit"
                  rules={[
                    {
                      required: !unlimitedQuantity,
                      message: "Vui lòng nhập số lượng áp dụng",
                    },
                    {
                      type: "integer",
                      message: "Số lượng áp dụng phải là số nguyên",
                    },
                  ]}
                >
                  <InputNumber
                    disabled={unlimitedQuantity}
                    style={{ borderRadius: "5px", width: "100%" }}
                    placeholder="Nhập số lượng khuyến mại"
                    min={1}
                    max={MAX_FIXED_DISCOUNT_VALUE}
                    step={1}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label=" ">
                  <Space>
                    <Switch
                      checked={unlimitedQuantity}
                      onChange={(value) => {
                        form.setFields([
                          {
                            name: "quantity_limit",
                            value: null,
                            errors: [],
                          },
                        ]);
                        setUnlimitedQuantity(value);
                      }}
                    />
                    {"Không giới hạn"}
                  </Space>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={30}>
              <Col span={12}>
                <Form.Item
                  label={"Số lượt áp dụng trên 1 KH"}
                  name="usage_limit_per_customer"
                  rules={[
                    {
                      required: !usageLimitPerCustomer,
                      message: "Vui lòng nhập số lượt áp dụng trên 1 KH",
                    },
                    {
                      type: "integer",
                      message: "Số lượt áp dụng trên 1 KH phải là số nguyên",
                    },
                  ]}
                >
                  <InputNumber
                    disabled={usageLimitPerCustomer}
                    style={{ borderRadius: "5px", width: "100%" }}
                    placeholder="Nhập số lượt áp dụng trên 1 KH"
                    min={1}
                    max={MAX_FIXED_DISCOUNT_VALUE}
                    step={1}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label=" ">
                  <Space>
                    <Switch
                      checked={usageLimitPerCustomer}
                      onChange={(value) => {
                        form.setFields([
                          {
                            name: "usage_limit_per_customer",
                            value: null,
                            errors: [],
                          },
                        ]);
                        setUsageLimitPerCustomer(value);
                      }}
                    />
                    {"Không giới hạn"}
                  </Space>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={30}>
              <Col span={24}>
                <Form.Item label={<b>Mức độ ưu tiên:</b>} name="priority">
                  <Select placeholder="Chọn mức độ ưu tiên">
                    {priorityOptions.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={12} className="discount-desc-with-ministry">
            <Row gutter={30}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Mô tả"
                  rules={[
                    {
                      max: 500,
                      message: "Mô tả không được vượt quá 500 ký tự",
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Nhập mô tả cho khuyến mại"
                    autoSize={{ minRows: 5 }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={30}>
              <Col span={24}>
                <Form.Item style={{ marginBottom: 28 }}>
                  <Space>
                    <Switch
                      checked={registerWithMinistry}
                      onChange={(value) => {
                        setRegisterWithMinistry(value);
                      }}
                    />
                    Đã đăng ký Bộ công thương
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      <Card>
        <Row gutter={30}>
          <Col span={24}>
            <Form.Item name="entitled_method" label={"Phương thức chiết khấu"}>
              <Select
                onChange={(value: string) => {
                  handleChangeDiscountMethod(value as PriceRuleMethod, form, setDiscountMethod);
                }}
              >
                <Option value={PriceRuleMethod.FIXED_PRICE.toString()}>Đồng giá</Option>
                <Option value={PriceRuleMethod.QUANTITY.toString()}>
                  Chiết khấu theo từng sản phẩm
                </Option>
                <Option value={PriceRuleMethod.ORDER_THRESHOLD.toString()}>
                  Chiết khấu theo đơn hàng
                </Option>
              </Select>
            </Form.Item>
          </Col>
          {/* Phương thức chiết khấu */}
          {discountMethod === PriceRuleMethod.ORDER_THRESHOLD ? (
            <DiscountTypeOrderThreshold form={form} />
          ) : (
            <GroupDiscountList
              form={form}
              idNumber={idNumber}
              originalEntitlements={originalEntitlements}
            />
          )}
        </Row>
      </Card>
    </DiscountFormStyle>
  );
}

export default DiscountUpdateForm;
