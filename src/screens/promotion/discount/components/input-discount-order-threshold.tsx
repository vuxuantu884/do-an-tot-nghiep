import { Divider, Form, FormInstance, Radio } from 'antd';
import React from 'react';
import { DiscountUnitType, PRICE_RULE_FIELDS } from 'screens/promotion/constants';
import {formatCurrency, replaceFormatString} from "utils/AppUtils";
import NumberInput from "component/custom/number-input.custom";

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
            form.validateFields();
          }}
        >
          <Radio value={DiscountUnitType.FIXED_AMOUNT.value}>Chiết khấu VND</Radio>
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
                    "Giá trị phải nhỏ hơn hoặc bằng 100%",
                  );
                }
              }
              return Promise.resolve();
            }
          }))
        ]}
      >
        <NumberInput
          style={{ width: "300px", textAlign: "left" }}
          format={(a: string) => formatCurrency(a)}
          replace={(a: string) => replaceFormatString(a)}
          placeholder="Nhập giá trị chiết khấu"
          maxLength={isDiscountByPercentage ? 3 : 11}
          minLength={0}
        />
      </Form.Item>
    </div>
  )
}

export default InputiscountOrderThreshold
