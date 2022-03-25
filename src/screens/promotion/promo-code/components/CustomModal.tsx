import { PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Row } from "antd";
import CloseIcon from "assets/icon/close.svg";
import NumberInput from "component/custom/number-input.custom";
import _ from "lodash";
import { useCallback, useEffect, useLayoutEffect } from "react";
import { useDispatch } from "react-redux";
import { checkPromoCode } from "service/promotion/promo-code/promo-code.service";
import { callApiNative } from "utils/ApiUtils";
import "./../promo-code.scss";

type ModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: (data: any, form?: any) => void;
  type?: string;
  title: string;
  okText: string;
  cancelText: string;
  valueChange?: string;
};

const ModalAddCode: React.FC<ModalProps> = (props: ModalProps) => {
  const {type, title, visible, okText, cancelText, valueChange, onCancel, onOk} = props;
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  useEffect(() => {
    form.setFieldsValue({code: valueChange});
  }, [valueChange, form]);

  const onCancelClick = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const onOkClick = useCallback(() => {
    form.submit();
  }, [form]);

  useLayoutEffect(() => {
    if (visible && form) {
      form.resetFields();
      setTimeout(() => {
        form.setFieldsValue({listCode: [""]});
      }, 300);
    }
  }, [form, visible]);

  function onFinish(value: any) {
    onOk(value, form);
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
    return str
      .toUpperCase()
      .replaceAll(/\s/g, "")
      .replace(/[^a-z0-9]/gi, "");
  }

  function hasDuplicates(value:string, array: Array<any>) {
    return array.filter((item) => item.toLowerCase() === value.toLowerCase()).length > 1;
  }

   function checkCodeLocal(rule: any, value: string, callback: any) {
    const listCode = form.getFieldValue("listCode");
    console.log(listCode);
    if(Array.isArray(listCode) && value && listCode.length>1 && hasDuplicates(value, listCode)) {
      callback("Mã khuyến mãi đã tồn tại trong danh sách");
    }else{
      callback();
    }
  }

 async function checkCodeOnline(value: string, name: number) {
   const result = await callApiNative(
     { isShowError: false },
     dispatch,
     checkPromoCode,
     value
   );
   if (result) {
     form.setFields([
       { name: ["listCode", name], errors: ["Mã khuyến mãi đã tồn tại"] },
     ]);
   } else {
     form.setFields([{ name: ["listCode", name], errors: [] }]);
     console.log("object");
   }
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
        {type === "EDIT" && valueChange && (
          <Col span={24}>
            <Form
              form={form}
              name="discount_add"
              onFinish={onFinish}
              initialValues={{code: valueChange}}
            >
              <Form.Item
                name="code"
                style={{marginBottom: 19}}
                rules={[
                  {required: true, message: "Cần nhập mã giảm giá"},
                  () => ({
                    validator(rule, value) {
                      return new Promise((resolve, reject) => {
                        const response = checkPromoCode(value);
                        response.then((response) => {
                          if (response?.code === 20000000) {
                            reject("Code đã tồn tại");
                          } else {
                            resolve("");
                          }
                        });
                      });
                    },
                  }),
                ]}
                normalize={(value) => nonAccentVietnamese(value)}
              >
                <Input
                  placeholder="Nhập số và ký tự in hoa (tối đa 30 ký tự)"
                  style={{width: "100%"}}
                  maxLength={30}
                />
              </Form.Item>
            </Form>
          </Col>
        )}
        {type === "MANUAL" && (
          <Col span={24}>
            <Form
              form={form}
              name="discount_add"
              onFinish={onFinish}
              layout="vertical"
              initialValues={{listCode: []}}
            >
              <Form.List name="listCode">
                {(fields, {add, remove}, {errors}) => {
                  return (
                    <>
                      <p style={{fontWeight: 500, marginBottom: 10}}>Mã giảm giá</p>
                      {fields.map(({key, name, fieldKey, ...restField}) => {
                        return (
                          <Form.Item
                            key={key}
                            name={name}
                            style={{marginBottom: 19}}
                            rules={[
                              {required: true, message: "Cần nhập mã giảm giá"},
                              ({getFieldValue}) => ({
                                // validator(rule, value, callback) {
                                //   return new Promise((resolve, reject) => {
                                //     const response = checkPromoCode(value);
                                //     response.then((response) => {
                                //       if (response?.code === 20000000) {
                                //         reject("Code đã tồn tại");
                                //       } else {
                                //         resolve("");
                                //       }
                                //     });
                                //   });
                                // },
                                validator: checkCodeLocal,
                              }),
                            ]}
                            normalize={(value) => nonAccentVietnamese(value)}
                          >
                            <Input
                              className="modal-input"
                              placeholder="Nhập số và ký tự in hoa (tối đa 30 ký tự)"
                              style={{width: "100%", textTransform: "uppercase"}}
                              maxLength={30}
                              autoFocus
                              onChange={_.debounce((e:React.ChangeEvent<HTMLInputElement>)=>checkCodeOnline(e.target.value, name), 500)}
                              suffix={
                                <img
                                  src={CloseIcon}
                                  style={{marginRight: 13}}
                                  alt=""
                                  onClick={() => remove(name)}
                                />
                              }
                            />
                          </Form.Item>
                        );
                      })}
                      <Button
                        type="link"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        style={{padding: "0 10px"}}
                      >
                        Thêm mã khác
                      </Button>
                    </>
                  );
                }}
              </Form.List>
            </Form>
          </Col>
        )}
        {type === "RANDOM" && (
          <Col span={24}>
            <Form
              form={form}
              name="discount_add"
              onFinish={onFinish}
              layout="vertical"
              initialValues={{
                count: null,
                prefix: "",
                length: null,
                suffix: "",
              }}
            >
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name="count"
                    label="Số lượng mã giảm giá:"
                    rules={[
                      {required: true, message: "Vui lòng nhập số lượng mã giảm giá"},
                    ]}
                  >
                    <NumberInput
                      placeholder="Tối đã 1,000 mã"
                      style={{textAlign: "left"}}
                      max={1000}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="prefix"
                    label="Tiền tố:"
                    normalize={(value) => nonAccentVietnamese(value)}                    
                  >
                    <Input placeholder="VD: YODY" maxLength={10} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="length"
                    label="Số kí tự ngẫu nhiên:"
                    rules={[
                      {required: true, message: "Vui lòng nhập số kí tự ngẫu nhiên"},
                      () => ({
                        validator(rule, value) {
                          if (!value) return Promise.resolve();
                          if (Number(value) < 4)
                            return Promise.reject(new Error("Số ký tự phải lớn hơn 4"));
                          if (Number(value) > 20)
                            return Promise.reject(new Error("Số ký tự phải nhỏ hơn 20"));
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <NumberInput
                      placeholder="VD: 4"
                      style={{textAlign: "left"}}
                      max={20}
                      min={4}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="suffix"
                    label="Hậu tố:"
                    normalize={(value) => nonAccentVietnamese(value)}
                  >
                    <Input placeholder="VD: SALE" maxLength={10} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        )}
      </Row>
    </Modal>
  );
};

export default ModalAddCode;
