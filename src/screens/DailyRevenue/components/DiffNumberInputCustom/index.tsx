import { SwapRightOutlined } from "@ant-design/icons";
import { Form, InputNumber } from "antd";
import { FormInstance } from "antd/es/form/Form";
import React, { useCallback } from "react";
import { formatCurrency, replaceFormat } from "utils/AppUtils";
import { StyledComponent } from "./style";

type Props = {
  fieldNameFrom: string;
  fieldNameTo: string;
  formRef?: React.RefObject<FormInstance<any>>;
  min?: number;
  max?: number;
};

const DiffNumberInputCustom: React.FC<Props> = (props: Props) => {
  const { fieldNameFrom, fieldNameTo, formRef, min, max } = props;

  const onChangeDiff = useCallback(() => {
    let value: any;
    value = formRef?.current?.getFieldsValue([fieldNameFrom, fieldNameTo]);
    console.log("fieldName", value);
    if (Number(value[fieldNameFrom] || 0) > Number(value[fieldNameTo] || 0)) {
      formRef?.current?.setFields([
        {
          name: fieldNameFrom,
          errors: ["Khoảng chênh lệch chưa chính xác"],
        },
        {
          name: fieldNameTo,
          errors: [""],
        },
      ]);
    } else {
      formRef?.current?.setFields([
        {
          name: fieldNameFrom,
          errors: undefined,
        },
        {
          name: fieldNameTo,
          errors: undefined,
        },
      ]);
    }
  }, [fieldNameFrom, fieldNameTo, formRef]);

  return (
    <StyledComponent>
      <Form.Item style={{ width: "45%", marginBottom: 0 }} name={fieldNameFrom}>
        <InputNumber
          style={{ width: "100%" }}
          onChange={onChangeDiff}
          formatter={(value) => {
            return formatCurrency(value || 0);
          }}
          parser={(value: string | undefined) => replaceFormat(value || "")}
          min={min}
          max={max}
        />
      </Form.Item>
      <div className="swap-right-icon">
        <SwapRightOutlined />
      </div>
      <Form.Item style={{ width: "45%", marginBottom: 0 }} name={fieldNameTo}>
        <InputNumber
          style={{ width: "100%" }}
          onChange={onChangeDiff}
          formatter={(value) => {
            return formatCurrency(value || 0);
          }}
          parser={(value: string | undefined) => replaceFormat(value || "")}
          min={min}
          max={max}
        />
      </Form.Item>
    </StyledComponent>
  );
};

export default DiffNumberInputCustom;
