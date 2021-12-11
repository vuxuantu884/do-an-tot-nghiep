import {
  Button,
  Col,
  Divider,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Radio,
  Row,
  Select
} from "antd";
import { SelectValue } from "antd/lib/select";
import _ from "lodash";
import { DiscountConditionRule } from "model/promotion/discount.create.model";
import { Rule } from "rc-field-form/lib/interface";
import React, { ReactElement, useContext, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { GoPlus } from "react-icons/go";
import { formatDiscountValue } from "utils/PromotionUtils";
import { TotalBillDiscountStyle } from "../components/total-bill-discount.style";
import { FieldSelectOptions } from "../constants";
import { DiscountUpdateContext } from "./discount-update-provider";
const rule = "rule";
const conditions = "conditions";

enum ColumnIndex {
  field = "field",
  operator = "operator",
  value = "value",
}

enum DiscountValueType {
  FIXED_AMOUNT = "FIXED_AMOUNT",
  PERCENTAGE = "PERCENTAGE",
  FIXED_PRICE = "FIXED_PRICE",
}

const blankRow = {
  [ColumnIndex.field]: "product_name",
  [ColumnIndex.operator]: "EQUALS",
  [ColumnIndex.value]: null,
};
interface Props {
  form: FormInstance;
}

const defaultValueComponent = (name: string | Array<any>, rules: Rule[], defaultValue?: string) => (
  <Form.Item name={name} rules={rules}>
    <Input placeholder="Tên sản phẩm" defaultValue={defaultValue} />
  </Form.Item>
);


const OperatorSelectOptions = [
  {
    label: "Bằng",
    value: "EQUALS",
  },
  {
    label: "Không bằng",
    value: "NOT_EQUAL_TO",
  },
  {
    label: "Chứa",
    value: "CONTAINS",
  },
  {
    label: "Không chứa",
    value: "DOES_NOT_CONTAIN",
  },
  {
    label: "Bắt đầu với",
    value: "STARTS_WITH",
  },
  {
    label: "Kết thúc với",
    value: "ENDS_WITH",
  },
  {
    label: "Lớn hơn",
    value: "GREATER_THAN",
  },
  {
    label: "Lớn hơn hoặc bằng",
    value: "GREATER_THAN_OR_EQUAL_TO",
  },
  {
    label: "Nhỏ hơn",
    value: "LESS_THAN",
  },
  {
    label: "Nhỏ hơn hoặc bằng",
    value: "LESS_THAN_OR_EQUAL_TO",
  },
];

export default function TotalBillDiscountUpdate(props: Props): ReactElement {
  const { form } = props;

  const discountUpdateContext = useContext(DiscountUpdateContext);
  const { discountData } = discountUpdateContext;
  const [isDiscountByPercentage, setIsDiscountByPercentage] = React.useState<boolean>(false);
  const [dataSource, setDataSource] = React.useState<Array<DiscountConditionRule>>([]);
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
      //set state list display
      setDataSource(temps);
      //set state value component
      const tempValueComponentList = _.cloneDeep(ValueComponentList);
      tempValueComponentList.splice(index, 1);
      setValueComponentList(tempValueComponentList);
    }
  };

  const handleAdd = () => {
    setValueComponentList([...ValueComponentList, defaultValueComponent]);

    const discountList: Array<any> = form.getFieldValue(rule)?.conditions;
    const temps = _.cloneDeep(discountList);
    if (Array.isArray(temps)) {
      temps.push(blankRow);
      form.setFieldsValue({
        [rule]: {
          [conditions]: temps
        }
      });
      setDataSource(temps);
    }
  };

  function handleChangeFieldSelect(value: SelectValue, index: number): void {
    //set state value component
    const currentValueComponent = _.find(FieldSelectOptions, [
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
  }

  // init data
  useEffect(() => {
    const condition = form.getFieldValue(rule)?.conditions;
    if (!Array.isArray(condition) || condition.length === 0) {
      form.setFieldsValue({
        [conditions]: [blankRow],
        [rule]: {
          group_operator: "AND",
          value_type: DiscountValueType.FIXED_AMOUNT.toString(),
        },
      });

      setDataSource(form.getFieldValue(rule).conditions);
    }
  }, [form]);

  useEffect(() => {
    const temp: any[] = [];
    setDataSource(discountData?.rule?.conditions || []);
    discountData?.rule?.conditions.forEach((element: DiscountConditionRule) => {
      temp.push(_.find(FieldSelectOptions, ["value", element.field])?.valueComponent);
    });
    setValueComponentList(temp);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountData?.rule?.conditions.length]);

  return (
    <TotalBillDiscountStyle>
      <Row style={{ padding: "0 20px" }}>
        <Col span={24}>
          <div>
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
                {dataSource.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <Form.Item
                        name={[rule, conditions, index, ColumnIndex.field]}
                        rules={[
                          {
                            required: true,
                            message: "Thuộc tính không được để trống",
                          },
                        ]}
                      >
                        <Select
                          options={FieldSelectOptions}
                          onChange={(value) => handleChangeFieldSelect(value, index)}
                        />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        name={[rule, conditions, index, ColumnIndex.operator]}
                        rules={[
                          {
                            required: true,
                            message: "Loại điều kiện không được để trống",
                          },
                        ]}
                      >
                        <Select options={OperatorSelectOptions} />
                      </Form.Item>
                    </td>
                    <td>
                      {ValueComponentList[index] &&
                        ValueComponentList[index](
                          [rule, conditions, index, ColumnIndex.value],
                          [{ required: true, message: "Giá trị không được để trống" }],
                          item.value
                        )}
                    </td>
                    <td>
                      <Button
                        className="remove-btn"
                        danger
                        onClick={() => handleDelete(index)}
                      >
                        <AiOutlineClose />
                      </Button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <Button className="add-btn" onClick={() => handleAdd()}>
                      <GoPlus size="20" /> &nbsp;&nbsp;Thêm điều kiện
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
            <Divider style={{ width: "100%" }} />
            <Form.Item
              name={[rule, "value_type"]}
              label="Giá trị chiết khấu trên hoá đơn"
              rules={[
                { required: true, message: "Giá trị chiết khấu không được để trống" },
              ]}
            >
              <Radio.Group
                onChange={(e) => {
                  setIsDiscountByPercentage(e.target.value === DiscountValueType.PERCENTAGE.toString());
                  const ruleData = form.getFieldValue(rule);
                  ruleData.value = null;
                }}
              >
                <Radio value={DiscountValueType.FIXED_AMOUNT}>Chiết khấu đ</Radio>
                <Radio value={DiscountValueType.PERCENTAGE}>Chiết khấu %</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="Giá trị chiết khấu"
              name={[rule, "value"]}
              rules={[
                { required: true, message: "Giá trị chiết khấu không được để trống" },
              ]}
            >
              <InputNumber
                max={isDiscountByPercentage ? 100 : 999999999}
                step={isDiscountByPercentage ? 0.01 : 1}
                placeholder="Nhập giá trị chiết khấu"
                style={{ width: "300px" }}

                formatter={(value) => formatDiscountValue(value, isDiscountByPercentage)}
              />
            </Form.Item>
          </div>
        </Col>
      </Row>
    </TotalBillDiscountStyle>
  );
}
