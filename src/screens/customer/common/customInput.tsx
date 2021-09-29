import React, { useCallback, useState } from "react";
import { Form, Input } from "antd";
import { RegUtil } from "utils/RegUtils";

function CustomInput(props: any) {
  const {
    name,
    label,
    form,
    message,
    placeholder,
    maxLength,
    isRequired,
    disabled,
  } = props;
  const [value, setValue] = useState<string>("");

  const handleChange = useCallback((v: any) => {
    if (!RegUtil.NO_ALL_SPACE.test(v) && v.trim()) {
      setValue(v.trim());
    } else {
      setValue("");
    }
  }, []);

  const handleBlur = (v: any) => {
    setValue(v.trim());
    form.setFieldsValue({ [name]: value });
  };

  React.useEffect(() => {
    if (value) form.setFieldsValue({ [name]: value });
  }, [value, handleChange, form, name]);

  return (
    <Form.Item
      name={name}
      label={<div>{label}</div>}
      rules={[{ required: isRequired, message: `${message}` }]}
    >
      <Input
        disabled={disabled}
        maxLength={maxLength}
        placeholder={`${placeholder}`}
        onBlur={(value) => handleBlur(value.target.value)}
        onChange={(value) => handleChange(value.target.value)}
      ></Input>
    </Form.Item>
  );
}

export default CustomInput;
