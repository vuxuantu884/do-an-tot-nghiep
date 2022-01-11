import { Divider, Form, FormInstance, InputNumber, Radio } from 'antd';
import React from 'react';
import { DiscountUnitType, MAX_FIXED_DISCOUNT_VALUE, PRICE_RULE_FIELDS } from 'screens/promotion/constants';
import { formatDiscountValue } from 'utils/PromotionUtils';

interface Props {
  form: FormInstance;
}

const InputiscountOrderThreshold = (props: Props) => {
  const { form } = props;
  const [isDiscountByPercentage, setIsDiscountByPercentage] = React.useState<boolean>(false);

  return (
    <div>
      <Divider style={{ width: "100%" }} />
      <Form.Item
        name={[PRICE_RULE_FIELDS.rule, PRICE_RULE_FIELDS.value_type]}
        label="Giá trị chiết khấu trên hoá đơn"
        rules={[
          { required: true, message: "Giá trị chiết khấu không được để trống" },
        ]}
      >
        <Radio.Group
          onChange={(e) => {
            setIsDiscountByPercentage(e.target.value === DiscountUnitType.PERCENTAGE.value);
            const ruleData = form.getFieldValue(PRICE_RULE_FIELDS.rule);
            ruleData.value = null;
          }}
        >
          <Radio value={DiscountUnitType.FIXED_AMOUNT.value}>Chiết khấu đ</Radio>
          <Radio value={DiscountUnitType.PERCENTAGE.value}>Chiết khấu %</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        label="Giá trị chiết khấu"
        name={[PRICE_RULE_FIELDS.rule, PRICE_RULE_FIELDS.value]}
        rules={[
          { required: true, message: "Giá trị chiết khấu không được để trống" },
          (({ getFieldValue }) => ({
            validator(_, value) {
              if (typeof value === "number" && value < 1) {
                return Promise.reject("Giá trị chiết khấu phải lớn hơn 0");
              }

              if (
                getFieldValue([PRICE_RULE_FIELDS.rule, PRICE_RULE_FIELDS.value_type]) === DiscountUnitType.PERCENTAGE.value
              ) {
                if (value > 100) {
                  return Promise.reject(
                    "Giá trị phải nhỏ hơn hoặc bằng 100",
                  );
                }
              }
              return Promise.resolve();
            }
          }))
        ]}
      >
        <InputNumber
          max={isDiscountByPercentage ? 100 : MAX_FIXED_DISCOUNT_VALUE}
          step={isDiscountByPercentage ? 0.01 : 1}
          placeholder="Nhập giá trị chiết khấu"
          style={{ width: "300px" }}

          formatter={(value) => formatDiscountValue(value, isDiscountByPercentage)}
        />
      </Form.Item>
    </div>
  )
}

export default InputiscountOrderThreshold
