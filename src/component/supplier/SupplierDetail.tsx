import React, { useEffect } from "react";
import { Card, Col, Form, FormInstance, Input, Row } from "antd";
import SupplierInputOption from "./SupplierInputOption";
import { useSelector } from "react-redux";
import { RootReducerType } from "../../model/reducers/RootReducerType";
import {FormFieldItem} from "../../screens/products/supplier/add/supplier-add.type";

const { Item } = Form;

const SupplierDetail = ({ form, formFields }: { form: FormInstance, formFields: FormFieldItem }) => {
  const date_unit = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.date_unit);
  const moq_unit = useSelector((state: RootReducerType) => state.bootstrapReducer.data?.moq_unit);

  useEffect(() => {
    if (form && date_unit) {
      form.setFieldsValue({
        debt_time_unit: date_unit[0].value,
      });
    }
    if (form && moq_unit) {
      form.setFieldsValue({
        moq_unit: moq_unit[0].value,
      });
    }
  }, [date_unit, form, moq_unit]);

  return (
    <Form.Item>
      <Card title={formFields.title}>
        <Row gutter={50}>
          <Col span={12}>
            <SupplierInputOption
              list={moq_unit}
              label={"Số lượng đặt hàng tối thiểu"}
              placeholder={"Nhập số lượng"}
              inputName={"moq"}
              selectName={"moq_unit"}
            />
          </Col>
          <Col span={12}>
            <SupplierInputOption
              list={date_unit}
              label={"Thời gian công nợ"}
              placeholder={"Nhập thời gian công nợ"}
              inputName={"debt_time"}
              selectName={"debt_time_unit"}
            />
          </Col>
        </Row>
        <Row gutter={50}>
          <Col span={24}>
            <Item label="Ghi chú" name="note">
              <Input.TextArea style={{ height: 105 }} placeholder="Nhập ghi chú" maxLength={500} />
            </Item>
          </Col>
        </Row>
      </Card>
    </Form.Item>
  );
};

export default SupplierDetail;
