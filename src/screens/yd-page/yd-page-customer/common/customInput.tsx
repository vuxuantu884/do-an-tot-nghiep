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
  isDisable?: boolean;
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
    isDisable,
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
            <span style={{ fontWeight: 600, color: "#2a2a86" }}>
              {rankLvl() ? `${rankLvl() || ""}: ${loyaltyPoint?.point || 0} điểm` : "Chưa có hạng"}
            </span>
          ) : null
        }
        maxLength={maxLength}
        placeholder={`${placeholder}`}
        onBlur={(value) => handleBlur(value.target.value)}
        onChange={(value) => handleChange(value.target.value)}
        disabled={isDisable}
      />
    </Form.Item>
  );
}

export default CustomInput;
