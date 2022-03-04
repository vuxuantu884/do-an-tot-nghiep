import React from "react";
import { Card, Col, Form, Input, Row } from "antd";
import { FormFieldItem, IFormControl } from "../../screens/products/supplier/add/supplier-add.type";

const { Item } = Form;
const SupplierContact = ({ formFields }: { formFields: FormFieldItem }) => {
  const controlContactRenderer = (control: IFormControl, name: number) => {
    const { label, maxLength, placeholder } = control;
    return (
      <Col span={24} key={label}>
        <Item name={[name, control.name]} label={label}>
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
