import {
  Button, Form,
  FormInstance,
  Input, Radio,
  Select
} from "antd";
import { Rule } from "antd/lib/form";
import { SelectValue } from "antd/lib/select";
import _ from "lodash";
import { DiscountConditionRule, PriceRule } from "model/promotion/price-rules.model";
import React, { ReactElement, useCallback, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { GoPlus } from "react-icons/go";
import { DiscountUnitType, FIELD_SELECT_OPTIONS, OPERATOR_SELECT_OPTIONS, PRICE_RULE_FIELDS } from "../constants";
import { OrderThresholdStyle } from "../discount/components/order-threshold.style";
const rule = PRICE_RULE_FIELDS.rule;
const conditions = PRICE_RULE_FIELDS.conditions;

enum ColumnIndex {
  field = "field",
  operator = "operator",
  value = "value",
}

const blankRow = {
  [ColumnIndex.field]: "product_name",
  [ColumnIndex.operator]: "EQUALS",
  [ColumnIndex.value]: undefined,
};
interface Props {
  form: FormInstance;
  priceRuleData: PriceRule
}

const defaultValueComponent = (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
  <Form.Item name={name} rules={rules}>
    <Input placeholder="Tên sản phẩm" defaultValue={defaultValue} />
  </Form.Item>
);


export default function GeneralOrderThreshold(props: Props): ReactElement {
  const { form, priceRuleData } = props;

  const [ValueComponentList, setValueComponentList] = React.useState<Array<any>>([
    defaultValueComponent,
  ]);

  const handleDelete = (index: number) => {
    console.log(form.getFieldValue(rule))
    const discountList: Array<any> = form.getFieldValue(rule)?.conditions;
    console.log(discountList);
    const temps = _.cloneDeep(discountList);
    if (Array.isArray(temps)) {
      temps.splice(index, 1);
      //set form value
      form.setFieldsValue({
        [rule]: {
          [conditions]: temps
        }
      });

      const tempValueComponentList = _.cloneDeep(ValueComponentList);
      tempValueComponentList.splice(index, 1);
      setValueComponentList(tempValueComponentList);
    }
  };


  const handleAdd = () => {
    setValueComponentList([...ValueComponentList, defaultValueComponent]);

    const discountList: Array<any> = form.getFieldValue(rule)?.conditions;
    let temps: any = _.cloneDeep(discountList);
    if (Array.isArray(temps)) {
      temps.push(blankRow);
      form.setFieldsValue({
        [rule]: {
          [conditions]: temps
        }
      });

    } else {
      temps = [blankRow];
      form.setFieldsValue({
        [rule]: {
          [conditions]: temps
        }
      });

    }
  };


  function handleChangeFieldSelect(value: SelectValue, index: number): void {
    // Change input value component
    const currentValueComponent = _.find(FIELD_SELECT_OPTIONS, [
      "value",
      value,
    ])?.valueComponent;

    setValueComponentList((prev) => {
      const temps = _.cloneDeep(prev);
      temps[index] = currentValueComponent;
      return temps;
    });

    //reset value at index
    const discountList: Array<any> = form.getFieldValue(rule)?.conditions;
    discountList[index].value = null;
    discountList[index].operator = 'EQUALS';

  }

  const discountList: Array<any> = form.getFieldValue(rule)?.conditions;

  const getIsDisableOptions = useCallback(
    (operatorOptions: string[], index: number) => {
      const currentField = discountList[index].field;

      const acceptTypeOfCurrentField = _.find(FIELD_SELECT_OPTIONS, [
        "value",
        currentField,
      ])?.type;

      const allowUseOptions = operatorOptions.some((operator) => {
        return acceptTypeOfCurrentField?.includes(operator);
      });
      return !allowUseOptions;
    },
    [discountList]
  );

  // init data in create case
  useEffect(() => {
    const condition = form.getFieldValue(rule)?.conditions;
    if (!Array.isArray(condition) || condition.length === 0) {
      form.setFieldsValue({
        [rule]: {
          [conditions]: [blankRow],
          group_operator: "AND",
          value_type: DiscountUnitType.FIXED_AMOUNT.value,
        },
      });
      setValueComponentList([defaultValueComponent]);
    }

  }, [form]);

  useEffect(() => {

    if (priceRuleData?.rule && priceRuleData.rule.conditions?.length > 0) {
      const temp: any[] = [];
      priceRuleData?.rule?.conditions.forEach((element: DiscountConditionRule) => {
        temp.push(_.find(FIELD_SELECT_OPTIONS, ["value", element.field])?.valueComponent);
      });
      setValueComponentList(temp);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRuleData?.rule?.conditions?.length]);

  return (
    <OrderThresholdStyle> 
        <Form.Item
          name={[rule, "group_operator"]}
          rules={[
            { required: true, message: "Điều kiện chiết khấu không được để trống" },
          ]}
        >
          <Radio.Group>
            <Radio value="AND">Thoả tất cả các điều kiện</Radio>
            <Radio value="OR">Thoả 1 trong các điều kiện</Radio>
          </Radio.Group>
        </Form.Item>
        <table>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Thuộc tính</th>
              <th>Loại điều kiện</th>
              <th>Giá trị</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <Form.List name={[rule, conditions]}>
              {(fields, { add, remove }) => {
                const conditionData: any[] = form.getFieldValue(rule)?.conditions;

                return (<>

                  {conditionData?.map((item: any, index) => {
                    return (

                      <tr key={index}>
                        <td>
                          <Form.Item
                            name={[index, ColumnIndex.field]}
                            rules={[
                              {
                                required: true,
                                message: "Thuộc tính không được để trống",
                              },
                            ]}
                          >
                            <Select
                              options={FIELD_SELECT_OPTIONS}
                              onChange={(value) => handleChangeFieldSelect(value, index)}
                            />
                          </Form.Item>
                        </td>
                        <td>
                          <Form.Item
                            name={[index, ColumnIndex.operator]}
                            rules={[
                              {
                                required: true,
                                message: "Loại điều kiện không được để trống",
                              },
                            ]}
                          >
                            <Select>
                              {OPERATOR_SELECT_OPTIONS.map((item: any) => {
                                return (
                                  <Select.Option key={item.value} value={item.value} 
                                  disabled={getIsDisableOptions(item.activeType,index)}
                                  >
                                    {item.label}
                                  </Select.Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                        </td>
                        <td>
                          {ValueComponentList[index] &&
                            ValueComponentList[index](
                              [index, ColumnIndex.value],
                              [{ required: true, message: "Giá trị không được để trống" }],
                            )}
                        </td>
                        <td>
                          <Button
                            className="remove-btn"
                            danger
                            disabled={index === 0 && fields.length === 1}
                            onClick={() => handleDelete(index)}
                          >
                            <AiOutlineClose />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </>)
              }}
            </Form.List>
            <tr>
              <td>
                <Button className="add-btn" onClick={() => handleAdd()}>
                  <GoPlus size="20" /> &nbsp;&nbsp;Thêm điều kiện
                </Button>
              </td>
            </tr>
          </tbody>
        </table> 
    </OrderThresholdStyle>
  );
}
