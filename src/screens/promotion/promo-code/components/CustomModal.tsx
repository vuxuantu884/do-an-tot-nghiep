import { PlusOutlined } from "@ant-design/icons";
import { Col, Modal, Row, Form, Input, Button } from "antd";
import { useCallback, useEffect } from "react";
import CloseIcon from "assets/icon/close.svg";
import NumberInput from "component/custom/number-input.custom";
import "./../promo-code.scss";
import { checkPromoCode } from "service/promotion/promo-code/promo-code.service";

type ModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: (data: any) => void
  type?: string;
  title: string;
  okText: string;
  cancelText: string;
  valueChange?: string;
};

const ModalAddCode: React.FC<ModalProps> = (
  props: ModalProps
) => {
  const { type, title, visible, okText, cancelText, valueChange, onCancel, onOk } = props;
  const [form] = Form.useForm();
  useEffect(() => {
    form.setFieldsValue({code: valueChange})
  }, [valueChange, form])

  const onCancelClick = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const onOkClick = useCallback(() => {
    const isFormValid = form.getFieldsError().some((item) => item.errors.length > 0);
    if(isFormValid) return;
    onOk(form.submit());
  }, [onOk, form]);

  function onFinish(value: any) {
    form.resetFields();
    onOk(value);
  }

  function nonAccentVietnamese(str: string) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
    return str.toUpperCase().replaceAll(/\s/g,'');
  }

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
          { type === "EDIT" && valueChange && <Col span={24}>
            <Form
              form={form}
              name="discount_add"
              onFinish={onFinish}
              initialValues={ {code: valueChange} }
            >
              <Form.Item
                name="code"
                style={{marginBottom: 19}}
                rules = {
                  [
                     ({
                        getFieldValue
                     }) => ({
                        validator(rule, value) {
                          return new Promise((resolve, reject) => {
                            const response = checkPromoCode(value);
                            response.then(response => {
                              if (response?.code === 20000000) {
                                reject("Code đã tồn tại");
                              } else {
                                resolve("");
                              }
                            });
                          });
                        }
                     })
                  ]
                }
                normalize={value => nonAccentVietnamese(value)}
              >
                <Input
                  placeholder="Nhập số và ký tự in hoa (tối đa 30 ký tự)"
                  style={{width: "100%"}}
                  maxLength={30}
                />
              </Form.Item>
            </Form>
          </Col>}
          { type === "MANUAL" && <Col span={24}>
            <Form
              form={form}
              name="discount_add"
              onFinish={onFinish}
              layout="vertical"
              initialValues={{ listCode: [{}] }}
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
                              key={key}
                              name={name}
                              style={{marginBottom: 19}}
                              rules = {
                                [
                                   ({
                                      getFieldValue
                                   }) => ({
                                      validator(rule, value) {
                                        return new Promise((resolve, reject) => {
                                          const response = checkPromoCode(value);
                                          response.then(response => {
                                            if (response?.code === 20000000) {
                                              reject("Code đã tồn tại");
                                            } else {
                                              resolve("");
                                            }
                                          });
                                        });
                                      }
                                   })
                                ]
                              }
                              normalize={value => nonAccentVietnamese(value)}
                            >
                              <Input
                                className="modal-input"
                                placeholder="Nhập số và ký tự in hoa (tối đa 30 ký tự)"
                                style={{width: "100%", textTransform: "uppercase"}}
                                maxLength={30}
                                suffix={<img src={CloseIcon} style={{marginRight: 13}} alt="" onClick={() => remove(name)} />}
                              />
                              
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
          { type === "RANDOM" && <Col span={24}>
            <Form
              form={form}
              name="discount_add"
              onFinish={onFinish}
              layout="vertical"
              initialValues={{ 
                count: null,
                prefix: "",
                length: null,
                suffix: ""
              }}
            >
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name="count"
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
                      max={1000}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="prefix"
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
                    name="length"
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
