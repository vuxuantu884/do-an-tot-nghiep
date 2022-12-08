import { Button, Form, Radio, Select } from "antd";
import { FormInstance } from "antd/es/form/Form";
import { SelectValue } from "antd/lib/select";
import * as React from "react";
import { AiOutlineClose } from "react-icons/ai";
import { GoPlus } from "react-icons/go";
import {
  FIELD_SELECT_OPTIONS_PRODUCT_QUANTITY,
  OPERATOR_SELECT_OPTIONS,
} from "screens/promotion/constants";

enum ColumnIndex {
  field = "field",
  operator = "operator",
  value = "value",
}

export interface IGeneralProductQuantityConditionsProps {
  rule: string;
  conditions: string;
  form: FormInstance;
  handleChangeFieldSelect: (value: SelectValue, index: number) => void;
  getIsDisableOptions: (operatorOptions: string[], index: number) => boolean;
  ValueComponentList: any[];
  handleDelete: (index: number) => void;
  handleAdd: () => void;
}

export default function GeneralProductQuantityConditions(
  props: IGeneralProductQuantityConditionsProps,
) {
  const {
    rule,
    conditions,
    form,
    handleChangeFieldSelect,
    getIsDisableOptions,
    ValueComponentList,
    handleDelete,
    handleAdd,
  } = props;
  return (
    <div className="list-apply-product-promotion">
      <Form.Item
        name={[rule, "group_operator"]}
        rules={[
          {
            required: true,
            message: "Điều kiện chiết khấu không được để trống",
          },
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
        <tbody className="table-condition-body">
          <Form.List name={[rule, conditions]}>
            {(fields, { add, remove }) => {
              const conditionData: any[] = form.getFieldValue(rule)?.conditions;

              return (
                <>
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
                              options={FIELD_SELECT_OPTIONS_PRODUCT_QUANTITY}
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
                                  <Select.Option
                                    key={item.value}
                                    value={item.value}
                                    disabled={getIsDisableOptions(item.activeType, index)}
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
                              [
                                {
                                  required: true,
                                  message: "Giá trị không được để trống",
                                },
                              ],
                            )}
                        </td>
                        <td>
                          <Button
                            className="remove-btn"
                            danger
                            disabled={index === 0 && fields.length === 1}
                            onClick={() => handleDelete(index)}
                            style={{ marginBottom: 24 }}
                          >
                            <AiOutlineClose />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </>
              );
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
    </div>
  );
}
