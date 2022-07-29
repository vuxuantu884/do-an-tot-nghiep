import React, { useCallback, useState } from "react";
import { Form, Input } from "antd";

function CustomInput(props: any) {
  const { name, label, form, message, placeholder, maxLength, isRequired, disabled, type } = props;

  const [value, setValue] = useState<string>("");

  const handleChange = useCallback((v: any) => {
    setValue(v);
  }, []);

  const handleBlur = (v: any) => {
    setValue(v.trim());
  };

  React.useEffect(() => {
    form.setFieldsValue({ [name]: value });
  }, [value, handleChange, form, name]);

  return (
    <Form.Item
      name={name}
      label={<div>{label}</div>}
      rules={[{ required: isRequired, message: `${message}` }]}
    >
      {type === "textarea" ? (
        <Input.TextArea
          style={{ minHeight: 130 }}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={`${placeholder}`}
          onBlur={(e) => handleBlur(e.target.value)}
          onChange={(e) => handleChange(e.target.value)}
        />
      ) : (
        <Input
          disabled={disabled}
          maxLength={maxLength}
          placeholder={`${placeholder}`}
          onBlur={(e) => handleBlur(e.target.value)}
          onChange={(e) => handleChange(e.target.value)}
        />
      )}
    </Form.Item>
  );
}

export default CustomInput;
