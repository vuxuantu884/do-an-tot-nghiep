import { Checkbox, Col, Form, Input, InputNumber, Row, Select } from "antd";
import { FormInstance } from "antd/es/form/Form";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import {
  DiscountUnitType,
  MAX_FIXED_DISCOUNT_VALUE,
  PRICE_RULE_FIELDS,
} from "screens/promotion/constants";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import NumberInput from "component/custom/number-input.custom";
import { IssueContext } from "./issue-provider";
import { PriceRuleMethod } from "model/promotion/price-rules.model";

interface Props {
  form: FormInstance;
  isSetFormValues?: boolean;
  promotionType?: string;
  setValueChangePromotion?: (item: number) => void;
  setTypeSelectPromotion?: (item: string) => void;
}

function IssueTypeForm(props: Props): ReactElement {
  const { form, isSetFormValues, promotionType, setValueChangePromotion, setTypeSelectPromotion } =
    props;
  const { isLimitUsage, isLimitUsagePerCustomer, setIsLimitUsage, setIsLimitUsagePerCustomer } =
    useContext(IssueContext);

  const [isPercentUnit, setIsPercentUnit] = useState<boolean>(true);

  const handleChangeValuePromotion = (value: any) => {
    setValueChangePromotion?.(value);
  };

  useEffect(() => {
    if (isSetFormValues) {
      const priceRuleValueType = form.getFieldValue([
        PRICE_RULE_FIELDS.rule,
        PRICE_RULE_FIELDS.value_type,
      ]);
      if (priceRuleValueType === DiscountUnitType.PERCENTAGE.value) {
        setIsPercentUnit(true);
      } else {
        setIsPercentUnit(false);
      }
    }
  }, [form, isSetFormValues]);

  return (
    <div>
      <Row gutter={20}>
        <Col span={12}>
          <Form.Item required label="Giá trị khuyến mại:">
            <Input.Group compact>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Giá trị khuyến mại không được để trống",
                  },
                  {
                    type: "number",
                    max: MAX_FIXED_DISCOUNT_VALUE,
                    message: `Giá trị khuyến mại không vượt quá ${
                      MAX_FIXED_DISCOUNT_VALUE.toString().length
                    } chữ số`,
                  },
                  () => ({
                    validator(_, value) {
                      if (isPercentUnit) {
                        if (typeof value === "number" && value <= 0) {
                          return Promise.reject("Giá trị khuyến mại phải lớn hơn 0");
                        } else if (value > 100) {
                          return Promise.reject("Giá trị khuyến mại phải nhỏ hơn hoặc bằng 100%");
                        }
                      } else {
                        if (typeof value === "number") {
                          if (value < 1) {
                            return Promise.reject("Giá trị khuyến mại phải lớn hơn 0");
                          }
                          if (!Number.isInteger(value)) {
                            return Promise.reject("Giá trị khuyến mại phải là số nguyên");
                          }
                        }
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
                name={[PRICE_RULE_FIELDS.rule, PRICE_RULE_FIELDS.value]}
                noStyle
              >
                <NumberInput
                  id={[PRICE_RULE_FIELDS.rule, PRICE_RULE_FIELDS.value].join("")}
                  style={{ width: "calc(100% - 70px)", textAlign: "left" }}
                  format={(a: string) => formatCurrency(a)}
                  replace={(a: string) => replaceFormatString(a)}
                  placeholder="Nhập giá trị khuyến mại"
                  onChange={handleChangeValuePromotion}
                  maxLength={isPercentUnit ? 3 : 11}
                  minLength={0}
                />
              </Form.Item>
              <Form.Item name={[PRICE_RULE_FIELDS.rule, PRICE_RULE_FIELDS.value_type]} noStyle>
                <Select
                  style={{ width: "70px" }}
                  onChange={(value: string) => {
                    form.setFieldsValue({
                      [PRICE_RULE_FIELDS.rule]: {
                        value: 0,
                        value_type: value,
                      },
                    });
                    setIsPercentUnit(value === DiscountUnitType.PERCENTAGE.value);
                    setTypeSelectPromotion?.(value);
                  }}
                >
                  <Select.Option
                    key={DiscountUnitType.PERCENTAGE.value}
                    value={DiscountUnitType.PERCENTAGE.value}
                  >
                    {DiscountUnitType.PERCENTAGE.label}
                  </Select.Option>
                  <Select.Option
                    key={DiscountUnitType.FIXED_AMOUNT.value}
                    value={DiscountUnitType.FIXED_AMOUNT.value}
                  >
                    {DiscountUnitType.FIXED_AMOUNT.label}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
        {promotionType === PriceRuleMethod.DISCOUNT_CODE_QTY && (
          <Col span={12}>
            <Form.Item
              label="Số lượng tối thiểu"
              name={PRICE_RULE_FIELDS.min_quantity}
              rules={[
                {
                  type: "number",
                  min: 1,
                  message: "Số sản phẩm áp dụng phải lớn hơn 0",
                },
              ]}
            >
              <InputNumber
                placeholder="Nhập số sản phẩm áp dụng"
                maxLength={10}
                minLength={0}
                min={0}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        )}
      </Row>
      <Row gutter={20}>
        <Col span={12}>
          <Col span={24} className="col-no-padding">
            <Form.Item className="margin-0">
              <Checkbox
                checked={isLimitUsage}
                onChange={(value) => {
                  setIsLimitUsage(value.target.checked);
                  form.setFieldsValue({
                    [PRICE_RULE_FIELDS.usage_limit]: null,
                  });
                }}
              >
                Giới hạn số lần có thể sử dụng mã giảm giá
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={24} className="col-no-padding">
            <Form.Item
              name={PRICE_RULE_FIELDS.usage_limit}
              rules={[
                {
                  required: isLimitUsage,
                  message: "Giới hạn số lần có thể sử dụng mã giảm giá không được để trống",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Số lần sử dụng phải lớn hơn 0",
                },
              ]}
            >
              <InputNumber
                maxLength={10}
                minLength={0}
                min={0}
                disabled={!isLimitUsage}
                style={{ width: "100%" }}
                placeholder="Nhập số lần có thể sử dụng mã giảm giá"
              />
            </Form.Item>
          </Col>
        </Col>
        <Col span={12}>
          <Col span={24}>
            <Form.Item className="margin-0">
              <Checkbox
                checked={isLimitUsagePerCustomer}
                onChange={(value) => {
                  setIsLimitUsagePerCustomer(value.target.checked);
                  form.setFieldsValue({
                    [PRICE_RULE_FIELDS.usage_limit_per_customer]: null,
                  });
                }}
              >
                Giới hạn số lượng mỗi khách được sử dụng
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name={PRICE_RULE_FIELDS.usage_limit_per_customer}
              rules={[
                {
                  required: isLimitUsagePerCustomer,
                  message: "Giới hạn số lượng mỗi khách được sử dụng không được để trống",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Số lần sử dụng phải lớn hơn 0",
                },
              ]}
            >
              <InputNumber
                maxLength={10}
                minLength={0}
                min={0}
                disabled={!isLimitUsagePerCustomer}
                style={{ width: "100%" }}
                placeholder="Nhập số lần mỗi khách được sử dụng"
              />
            </Form.Item>
          </Col>
        </Col>
      </Row>
    </div>
  );
}

export default IssueTypeForm;
