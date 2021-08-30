import React, { useCallback, useState } from "react";
import { Form, Input } from "antd";

function CustomInput(props: any) {
  const { name, label, form, message, placeholder, maxLength, isRequired } =
    props;
  const [value, setValue] = useState<string>("");

  const handleChange = useCallback((v: any) => {
    setValue(v.trim());
  }, []);

  const handleBlur = (v: any) => {
    setValue(v.trim());
    form.setFieldsValue({ [name]: value });
  };

  React.useEffect(() => {
    if(value) form.setFieldsValue({ [name]: value });
  }, [value, handleChange, form, name]);

  return (
    <Form.Item
      name={name}
      label={<div>{label}</div>}
      rules={[
        { required: isRequired, message: `${message}` },
        
      ]}
    >
      <Input
        maxLength={maxLength}
        placeholder={`${placeholder}`}
        onBlur={(value) => handleBlur(value.target.value)}
        onChange={(value) => handleChange(value.target.value)}
      ></Input>
    </Form.Item>
  );
}

export default CustomInput;
