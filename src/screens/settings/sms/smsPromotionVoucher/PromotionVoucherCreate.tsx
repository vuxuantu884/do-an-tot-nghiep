import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Card, Form, Row, Col, Input, Modal, Select, Tooltip } from "antd";
import TextArea from "antd/es/input/TextArea";
import { createSmsPromotionVoucherAction } from "domain/actions/settings/sms-settings.action";
import { showSuccess } from "utils/ToastUtils";
import { StyledSmsPromotionVoucher } from "screens/settings/sms/styles";
import { nonAccentVietnameseHaveNumber } from "utils/PromotionUtils";
import NumberInput from "component/custom/number-input.custom";
import { PriceRule } from "model/promotion/price-rules.model";
import { getPromotionReleaseListAction } from "domain/actions/promotion/promo-code/promo-code.action";
import questionIcon from "assets/icon/question.svg";

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
const MESSAGE_TEXT_INPUT_ID = "create_promotion_voucher_message_id";

interface Props {
  isOpenCreateModal: boolean;
  setIsOpenCreateModal: (isOpenCreateModal: boolean) => void;
  createSmsSuccessCallback: (response: any) => void;
}

const defaultFormValues = {
  content: null,
  price_rule_id: null,
  discount_code_length: null,
  discount_code_prefix: null,
  discount_code_suffix: null,
}

const PromotionVoucherCreate = (props: Props) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { isOpenCreateModal, setIsOpenCreateModal, createSmsSuccessCallback } = props;

  const [loading, setLoading] = useState(false);
  const [promotionVoucherReleaseList, setPromotionVoucherReleaseList] = useState<Array<PriceRule>>([]);

  /** get promotion voucher release */
  const getPromotionReleaseListCallback = useCallback((data: any) => {
    setLoading(false);
    if (data?.items) {
      setPromotionVoucherReleaseList(data.items);
    }
  }, []);

  useEffect(() => {
    const params = {
      is_sms_voucher: true,
    }
    setLoading(true);
    dispatch(getPromotionReleaseListAction(params, getPromotionReleaseListCallback));
  }, [dispatch, getPromotionReleaseListCallback]);
  /** end get promotion voucher release */
  
  useEffect(() => {
    form.setFieldsValue(defaultFormValues);
  }, [form]);

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
    addTextAtCaret(MESSAGE_TEXT_INPUT_ID, text, "content");
  }, [addTextAtCaret]);
  /** end handle Insert text */

  // handle submit form
  const createSmsPromotionVoucherCallback = useCallback((response: any) => {
      if (response) {
        showSuccess("Thêm chương trình mới thành công!");
        setIsOpenCreateModal(false);
        createSmsSuccessCallback(response);
      }
    }, [createSmsSuccessCallback, setIsOpenCreateModal]);
  
  const handleSubmitForm = useCallback((values: any) => {
    const params = {
      ...values,
    }
    dispatch(createSmsPromotionVoucherAction(params, createSmsPromotionVoucherCallback));
  }, [createSmsPromotionVoucherCallback, dispatch]);

  return (
    <Modal
      centered
      width="1000px"
      visible={isOpenCreateModal}
      title="Thêm chương trình"
      okText="Tạo mới"
      onOk={() => form.submit()}
      cancelText="Hủy"
      onCancel={() => setIsOpenCreateModal(false)}
      maskClosable={false}
    >
      <StyledSmsPromotionVoucher>
        <div className="general-form">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitForm}
            className={"general-info create-modal-general-info"}
          >
            <Form.Item
              label={
                <div>
                  <span>Lựa chọn chương trình khuyến mại sinh mã giảm giá</span>
                  <Tooltip
                    overlay="Các chương trình khuyến mại gửi mã SMS được thiết lập trong Khuyến mại/ Mã khuyến mại"
                    placement="top"
                  >
                    <img src={questionIcon} style={{ marginLeft: 5, cursor: "pointer" }} alt="" />
                  </Tooltip>
                </div>
              }
              name="price_rule_id"
              rules={[{ required: true, message: "Vui lòng chọn chương trình khuyến mại" }]}
            >
              <Select
                showArrow
                loading={loading}
                placeholder="Chọn chương trình"
                optionFilterProp="children"
                getPopupContainer={(trigger: any) => trigger.parentElement}
              >
                {promotionVoucherReleaseList.map((promotion: any) => (
                  <Select.Option key={promotion.id} value={promotion.id}>
                    {promotion.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            
            <div>
              <div className={"promotion-code-rule-title"}>Nguyên tắc tạo mã</div>
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
            </div>

            <Form.Item
              name={"content"}
              label={<b>Nội dung tin nhắn:</b>}
              rules={[{ required: true, message: "Vui lòng nhập nội dung tin nhắn" }]}
            >
              <TextArea
                id={MESSAGE_TEXT_INPUT_ID}
                allowClear
                showCount
                maxLength={255}
                placeholder="Nhập nội dung sms"
                autoSize={{ minRows: 6, maxRows: 10 }}
              />
            </Form.Item>
          </Form>

          <div className="key-word-list">
            <div style={{ marginBottom: "8px" }}>Danh sách từ khóa sử dụng:</div>
            <Card>
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
                    >
                      Chèn
                    </Button>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      </StyledSmsPromotionVoucher>
    </Modal>
  );
};

export default PromotionVoucherCreate;
