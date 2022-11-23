import { EditOutlined } from "@ant-design/icons";
import { Button, Form, Select, Input, Popover } from "antd";
import React, { useEffect, useState } from "react";
import TextWithLineBreak from "../TextWithLineBreak";
import { StyledComponent } from "./styles";
import { select_type_especially_order } from "../../common/fields.export";

type FormValueType = {
  [key: string]: any;
};
type PropTypes = {
  note?: any;
  title?: string;
  color?: string;
  isDisable?: boolean;
  isGroupButton?: boolean;
  isHaveEditPermission?: boolean;
  onOk: (values: FormValueType) => void;
  noteFormValue: FormValueType;
  promotionText?: string;
};

function EditOrderEspecially(props: PropTypes) {
  const {
    note,
    title,
    onOk,
    isDisable = false,
    isGroupButton = false,
    isHaveEditPermission = true,
    noteFormValue,
  } = props;

  const [form] = Form.useForm();

  const initialFormValues = {
    note: "",
    customer_note: "",
  };

  const [visible, setVisible] = useState(false);
  const handleVisibleChange = (visible: boolean) => {
    setVisible(visible);
    if (!visible) {
      form.resetFields();
    }
  };

  const onSubmit = () => {
    form.validateFields().then((values) => {
      // console.log("values", values);
      onOk(values);
    });
  };

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...noteFormValue,
      });
    }
  }, [form, noteFormValue, visible]);

  return (
    <StyledComponent>
      <div className="wrapper">
        <Popover
          content={
            <StyledComponent>
              <Form form={form} layout="vertical" initialValues={initialFormValues}>
                <div className="formInner">
                  <Form.Item
                    name=""
                    label="Loại:"
                  >
                    <Select
                      className="select-especially-order"
                      placeholder="Chọn loại"
                      allowClear
                      // onChange={onChange}
                      // onSearch={onSearch}
                      options={select_type_especially_order}
                    />
                  </Form.Item>
                  <Form.Item
                    name=""
                    label="Nhân viên CSĐH:"
                  >
                    <Select
                      className="select-especially-order"
                      placeholder="Mã nhân viên, tên nhân viên"
                      allowClear
                      // onChange={onChange}
                      // onSearch={onSearch}
                      options={select_type_especially_order}
                    />
                  </Form.Item>
                  <Form.Item
                    name=""
                    label="Đơn gốc:"
                  >
                    <Input
                      className="select-especially-order"
                      placeholder="Mã đơn hàng, sđt khách hàng"
                      allowClear
                      // onChange={onChange}
                      // onSearch={onSearch}
                    />
                  </Form.Item>
                  <Form.Item
                    name=""
                    label="Đơn trả:"
                  >
                    <Input
                      className="select-especially-order"
                      placeholder="Mã đơn trả, sđt khách hàng"
                      allowClear
                      // onChange={onChange}
                      // onSearch={onSearch}
                    />
                  </Form.Item>
                  <Form.Item
                    name=""
                    label="Sản phẩm:"
                  >
                    <Input
                      className="select-especially-order"
                      placeholder="Tìm sản phẩm"
                      allowClear
                      // onChange={onChange}
                      // onSearch={onSearch}
                    />
                  </Form.Item>
                  <Form.Item
                    name=""
                    label="Số tền:"
                  >
                    <Input
                      className="select-especially-order"
                      placeholder="Nhập số dòng"
                      allowClear
                      // onChange={onChange}
                      // onSearch={onSearch}
                    />
                  </Form.Item>
                  <Form.Item
                    name=""
                    label="Lý do:"
                  >
                    <Input
                      className="select-especially-order"
                      placeholder="Nhập lý do"
                      allowClear
                      // onChange={onChange}
                      // onSearch={onSearch}
                    />
                  </Form.Item>
                  {/*<Form.Item*/}
                  {/*  name="note"*/}
                  {/*  label="Ghi chú nội bộ"*/}
                  {/*  //rules={[{ max: 255, message: "Không được nhập quá 255 ký tự!" }]}*/}
                  {/*>*/}
                  {/*  <Input.TextArea disabled={isDisable} rows={3} />*/}
                  {/*</Form.Item>*/}
                  <div className="buttonWrapper">
                    <Button
                      onClick={() => {
                        setVisible(false);
                      }}
                    >
                      Huỷ
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        onSubmit();
                        setVisible(false);
                      }}
                      disabled={isDisable}
                    >
                      Lưu
                    </Button>
                  </div>
                </div>
              </Form>
            </StyledComponent>
          }
          title="Đơn đặc biệt"
          trigger="click"
          visible={visible}
          onVisibleChange={handleVisibleChange}
        >
            <EditOutlined className="iconEdit" style={{ color: props.color }} title="Sửa ghi chú" />
        </Popover>
      </div>
    </StyledComponent>
  );
}

export default EditOrderEspecially;
