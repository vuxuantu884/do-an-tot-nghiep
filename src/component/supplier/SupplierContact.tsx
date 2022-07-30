import React from "react";
import { Card, Col, Form, Input, Row } from "antd";
import { FormFieldItem, FormFields, IFormControl } from "../../screens/products/supplier/add/supplier-add.type";
import { RegUtil } from "utils/RegUtils";

const { Item } = Form;
const SupplierContact = ({ formFields }: { formFields: FormFieldItem }) => {

  const validatePhone = (_: any, value: any, callback: any): void => {
    if (value) {
      if (!RegUtil.PHONE.test(value)) {
        callback(`Số điện thoại không đúng định dạng`);
      }
    }else{
      callback()
     }
  };

  const controlContactRenderer = (control: IFormControl, name: number) => {
    const { label, maxLength, placeholder, rules = [] } = control;
    return (
      <Col span={24} key={label}>
        <Item name={[name, control.name]} label={label}
          rules={rules.map((rule: any) => {
            if (control.name === FormFields.contact_phone) {
              if (!rule?.message) {
                return { validator: validatePhone };
              }
              return rule;
            }

            return rule;
          })}
          >
          <Input {...{ maxLength, placeholder }} />
        </Item>
      </Col>
    );
  };

  return (
    <>
      <Card title={formFields.title}>
        <Form.List name={formFields.key}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                <React.Fragment key={key}>
                  {formFields.formGroups.map((group, index) => (
                    <Row key={index}>
                      {group.map((control) => controlContactRenderer(control, name))}
                    </Row>
                  ))}
                </React.Fragment>
              ))}
            </>
          )}
        </Form.List>
      </Card>
    </>
  );
};

export default SupplierContact;
