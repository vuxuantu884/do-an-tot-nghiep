import { PlusOutlined } from "@ant-design/icons";
import { Col, Modal, Row, Form, Space, Input, Button } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import CloseIcon from "assets/icon/close.svg";
import NumberInput from "component/custom/number-input.custom";

type ModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: (data: any) => void
  isManual: boolean,
  title: string;
  okText: string;
  cancelText: string;
};

const ModalAddCode: React.FC<ModalProps> = (
  props: ModalProps
) => {
  const { isManual, title, visible, okText, cancelText, onCancel, onOk } = props;

  const onCancelClick = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const onOkClick = useCallback(() => {
    onOk(form.submit())
  }, [onOk]);

  const [form] = Form.useForm();

  return (
    <Modal
      onOk={onOkClick}
      onCancel={onCancelClick}
      title={title ? title : ""}
      width={600}
      visible={visible}
      okText={okText ? okText : "Có"}
      cancelText={cancelText ? cancelText : "Không"}
    >
        <Row gutter={24}>
          { isManual && <Col span={24}>
            <Form
              form={form}
              name="discount_add"
              onFinish={(value) => {console.log(value);}}
              onFinishFailed={({ errorFields }) => {console.log(errorFields)}}
              layout="vertical"
              initialValues={{ listCode: [] }}
            >
              <Form.List
                name="listCode"
              >
                {(fields, {add, remove}, {errors}) => {
                  return (
                    <>
                      <p style={{fontWeight: 500, marginBottom: 10}}>Mã giảm giá</p>
                      {
                        fields.map(({key, name, fieldKey, ...restField}) => {
                          return(
                            <Form.Item
                              name={name}
                              style={{marginBottom: 19}}
                            >
                              <div style={{
                                display: "flex",
                                gap: 30
                            }}>
                                <Input
                                  placeholder="Nhập số và ký tự in hoa (tối đa 30 ký tự)"
                                />
                                <img src={CloseIcon} style={{marginRight: 13}} alt="" onClick={() => remove(name)} />
                              </div>
                            </Form.Item>
                          )
                        })
                      }
                      <Button
                        type="link" 
                        onClick={() => add()}
                        icon={<PlusOutlined/>}
                        style={{padding: "0 10px"}}
                      >
                        Thêm mã khác
                      </Button>
                    </>
                  )
                }}
              </Form.List>
            </Form>
          </Col>}
          { !isManual && 
          <Col span={24}>
            <Form
              form={form}
              name="discount_add"
              onFinish={(value) => {console.log(value);}}
              onFinishFailed={({ errorFields }) => {console.log(errorFields)}}
              layout="vertical"
              initialValues={{ 
                amount: null,
                prifix: "",
                ramdom_char: null,
                suffix: ""
              }}
            >
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name="amount"
                    label="Số lượng mã giảm giá:"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số lượng mã giảm giá",
                      },
                    ]}
                  >
                    <NumberInput 
                      placeholder="Tối đã 1,000 mã"
                      style={{ textAlign: "left" }}
                      max={9999}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="prifix"
                    label="Tiền tố:"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tiền tố",
                      },
                    ]}
                  >
                    <Input placeholder="VD: YODY" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="ramdom_char"
                    label="Số kí tự ngẫu nhiên:"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số kí tự ngẫu nhiên",
                      },
                    ]}
                  >
                    <NumberInput 
                      placeholder="VD: 6"
                      style={{ textAlign: "left" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="suffix"
                    label="Hậu tố:"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập hậu tố",
                      },
                    ]}
                  >
                    <Input placeholder="VD: SALE" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>}
        </Row>
    </Modal>
  );
};

export default ModalAddCode;
