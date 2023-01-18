import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Card, Form, Row, Col, Input, } from "antd";
import TextArea from "antd/es/input/TextArea";
import {
  updateSmsPromotionVoucherAction,
} from "domain/actions/settings/sms-settings.action";
import { showSuccess } from "utils/ToastUtils";
import { SMS_CONFIG_PERMISSIONS } from "config/permissions/sms-config.permission";
import useAuthorization from "hook/useAuthorization";
import { StyledSmsPromotionVoucher } from "screens/settings/sms/styles";
import { nonAccentVietnameseHaveNumber } from "utils/PromotionUtils";
import NumberInput from "component/custom/number-input.custom";
import { smsPromotionVoucher } from "model/sms-config/smsConfig.model";

const KEY_WORD_LIST = [
  {
    name: "Tên khách hàng",
    key: "customer_name",
    value: "{customer_name}",
  },
  {
    name: "Mã khuyến mại",
    key: "discount_code",
    value: "{discount_code}",
  },
];
const MESSAGE_CONTENT_ID = "promotion_voucher_message_id";
const updateSmsPermission = [SMS_CONFIG_PERMISSIONS.UPDATE];

interface Props {
  smsDetail: smsPromotionVoucher;
  smsIndex: number;
  handleExpandSmsItem: (expandIconId: string) => void;
}

const PromotionVoucherDetail = (props: Props) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { smsDetail, smsIndex, handleExpandSmsItem } = props;
  const [allowUpdateSms] = useAuthorization({
    acceptPermissions: updateSmsPermission,
    not: false,
  });

  const [inputTextAreaId, setInputTextAreaId] = useState<string>(MESSAGE_CONTENT_ID);
  const [originFormValues, setOriginFormValues] = useState<any>();

  useEffect(() => {
    if (smsIndex) {
      const _inputTextAreaId = MESSAGE_CONTENT_ID + "_" + smsIndex?.toString();
      setInputTextAreaId(_inputTextAreaId);
    }
  }, [smsIndex]);
  
  useEffect(() => {
    if (smsDetail) {
      const { content, discount_code_prefix, discount_code_length, discount_code_suffix } = smsDetail;
      const formValues = {
        content,
        discount_code_length,
        discount_code_prefix,
        discount_code_suffix,
      }
      form.setFieldsValue(formValues);
      setOriginFormValues(formValues);
    }
  }, [smsDetail, form]);

  /** handle Insert text */
  const addTextAtCursorPosition = useCallback((
    textArea: any,
    cursorPosition: any,
    text: any,
    fieldName: any,
  ) => {
    let front = textArea?.value.substring(0, cursorPosition);
    let back = textArea?.value.substring(cursorPosition, textArea.value.length);
    textArea.value = front + text + back;
    form.setFieldsValue({ [fieldName]: textArea.value });
  }, [form]);

  const addTextAtCaret = useCallback((textAreaId: any, text: any, fieldName: any) => {
    let textArea = document.getElementById(textAreaId);
    // @ts-ignore
    let cursorPosition = textArea?.selectionStart;
    addTextAtCursorPosition(textArea, cursorPosition, text, fieldName);
    updateCursorPosition(cursorPosition, text, textArea);
  }, [addTextAtCursorPosition]);

  const updateCursorPosition = (cursorPosition: any, text: any, textArea: any) => {
    cursorPosition = cursorPosition + text.length;
    textArea.selectionStart = cursorPosition;
    textArea.selectionEnd = cursorPosition;
    textArea.focus();
  };

  const handleInsertKeyword = useCallback((text: string) => {
    addTextAtCaret(inputTextAreaId, text, "content");
  }, [addTextAtCaret, inputTextAreaId]);
  /** end handle Insert text */

  // handle submit form
  const handleSubmitForm = useCallback((values: any) => {
      console.log("handleSubmitForm: ", values);
      
      const params = {
        ...values,
        price_rule_id: smsDetail.price_rule_id
      }
      
      if (smsDetail.id) {
        dispatch(updateSmsPromotionVoucherAction(smsDetail.id, params, (response) => {
          if (response) {
            showSuccess("Lưu thông tin thành công!");
          }
        }));
      }
  }, [dispatch, smsDetail.id, smsDetail.price_rule_id]);

  const onCancel = () => {
    const expandIconId = `promotion-voucher-expand-icon-${smsDetail.id}`
    handleExpandSmsItem(expandIconId);
    form.setFieldsValue(originFormValues);
  };

  return (
    <StyledSmsPromotionVoucher>
      <div className="general-form">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitForm}
          className={"general-info"}
        >
          <Card title="Nguyên tắc tạo mã">
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="discount_code_prefix"
                  label="Tiền tố:"
                  normalize={(value) => nonAccentVietnameseHaveNumber(value)}
                >
                  <Input placeholder="VD: YODY" maxLength={10} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="discount_code_length"
                  label="Số kí tự ngẫu nhiên:"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số kí tự ngẫu nhiên",
                    },
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
                    style={{ textAlign: "left" }}
                    max={20}
                    min={4}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="discount_code_suffix"
                  label="Hậu tố:"
                  normalize={(value) => nonAccentVietnameseHaveNumber(value)}
                >
                  <Input placeholder="VD: SALE" maxLength={10} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item
            name={"content"}
            label={<b>Nội dung tin nhắn:</b>}
            rules={[{ required: true, message: "Vui lòng nhập nội dung tin nhắn" }]}
          >
            <TextArea
              id={inputTextAreaId}
              allowClear
              showCount
              maxLength={255}
              placeholder="Nhập nội dung sms"
              autoSize={{ minRows: 6, maxRows: 10 }}
              disabled={!allowUpdateSms}
            />
          </Form.Item>

          {allowUpdateSms && (
            <div className={"general-info-button"}>
              <Button style={{ marginRight: 15 }} onClick={onCancel}>
                {"Hủy"}
              </Button>

              <Button htmlType="submit" type="primary">
                {"Lưu"}
              </Button>
            </div>
          )}
        </Form>

        <Card title="Danh sách từ khóa sử dụng" className="key-word-list">
          {KEY_WORD_LIST?.map((keyWord) => {
            return (
              <div className="key-word-item" key={keyWord.value}>
                <div>
                  <strong>{keyWord.value}</strong> :{" "}
                  <span style={{ color: "#75757B" }}>{keyWord.name}</span>
                </div>
                <Button
                  className="insert-button"
                  onClick={() => handleInsertKeyword(keyWord.value)}
                  disabled={!allowUpdateSms}
                >
                  Chèn
                </Button>
              </div>
            );
          })}
        </Card>
      </div>
    </StyledSmsPromotionVoucher>
  );
};

export default PromotionVoucherDetail;
