import React, { useCallback, useState } from "react";
import { Form, Input } from "antd";

type CustomInputProps = {
  name: string;
  label: any;
  form?: any;
  message?: string;
  placeholder?: string;
  maxLength?: number;
  isRequired?: boolean;
  customer?: any;
  loyaltyPoint?: any;
  loyaltyUsageRules?: any;
};
const color: any = {
  "KH mới": "#00F000",
  "KH cũ": "#F5C4C4",
  "Vip S": "#cccccc",
  "Vip G": "#F0F000",
  "Vip R": "#FF0000",
  "Vip D": "#007FFF",
};
function CustomInput(props: CustomInputProps) {
  const {
    name,
    label,
    form,
    message,
    placeholder,
    maxLength,
    isRequired,
    customer,
    loyaltyPoint,
    loyaltyUsageRules,
  } = props;
  const [value, setValue] = useState<string>("");
  const handleChange = useCallback((v: any) => {
    setValue(v.trim());
  }, []);
  const handleBlur = (v: any) => {
    setValue(v.trim());
    form.setFieldsValue({ [name]: value });
  };

  React.useEffect(() => {
    if (value) form.setFieldsValue({ [name]: value });
  }, [value, handleChange, form, name]);
  const rankLvl = () => {
    if (loyaltyUsageRules) {
      return loyaltyUsageRules?.find(
        (item: any) => item.rank_id === loyaltyPoint?.loyalty_level_id
      )?.rank_name;
    }
  };
  return (
    <Form.Item
      name={name}
      label={<div>{label}</div>}
      rules={[{ required: isRequired, message: `${message}` }]}
    >
      <Input
        suffix={
          customer ? (
            <span style={{ backgroundColor: `${color[rankLvl()]}` }}>
              {rankLvl() && `${rankLvl() || ""}: ${loyaltyPoint?.point || 0} điểm`}
            </span>
          ) : null
        }
        maxLength={maxLength}
        placeholder={`${placeholder}`}
        onBlur={(value) => handleBlur(value.target.value)}
        onChange={(value) => handleChange(value.target.value)}
      ></Input>
    </Form.Item>
  );
}

export default CustomInput;
