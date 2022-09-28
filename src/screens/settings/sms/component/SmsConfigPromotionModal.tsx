import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Form, Input, Modal, Row, Select } from "antd";

import { nonAccentVietnamese } from "utils/PromotionUtils";
import { formatCurrency, replaceFormatString, scrollAndFocusToDomElement } from "utils/AppUtils";
import NumberInput from "component/custom/number-input.custom";
import { PriceRuleMethod } from "model/promotion/price-rules.model";
import { PRICE_RULE_FIELDS } from "screens/promotion/constants";
import OrderThresholdIssueTypeForm from "screens/promotion/issue/components/issue-type-order-threshold-form";
import GeneralOrderThreshold from "screens/promotion/shared/general-order-threshold";
import IssueProvider, { IssueContext } from "screens/promotion/issue/components/issue-provider";
import { StyledPromotionModal } from "screens/settings/sms/styles";
import { cloneDeep } from "lodash";


const { Option } = Select;

const KEYWORD_LIST = [
  {
    name: "Hạng khách hàng",
    key: "customer_ranks",
    value: "{customer_ranks}",
  },
  {
    name: "Nhóm khách hàng",
    key: "customer_groups",
    value: "{customer_groups}",
  },
  {
    name: "Thời gian",
    key: "time",
    value: "{time}",
  },
];

const SmsConfigPromotionModal: React.FC<any> = (props: any) => {
  const { isVisible, onOk, promotionModalData, smsType } = props;
  const [form] = Form.useForm();

  const [originFormValues, setOriginFormValues] = useState<any>();
  const [isSetFormValues, setIsSetFormValues] = useState<boolean>(false);

  const { priceRuleData, setPriceRuleData, setIsLimitUsage, setIsLimitUsagePerCustomer } =
    useContext(IssueContext);
  
  useEffect(() => {
    if (promotionModalData) {
      const formValues = {
        apply_days: promotionModalData.price_rule?.apply_days,
        entitled_method: promotionModalData.price_rule?.entitled_method,
        prefix: promotionModalData.discount_code_prefix,
        length: promotionModalData.discount_code_length,
        suffix: promotionModalData.discount_code_suffix,
        title: promotionModalData.price_rule?.title,
        usage_limit: promotionModalData.price_rule?.usage_limit,
        usage_limit_per_customer: promotionModalData.price_rule?.usage_limit_per_customer,
        rule: promotionModalData.price_rule?.rule,
        state: promotionModalData.price_rule?.state,
      }

      setOriginFormValues(formValues);
      setIsLimitUsage(!!formValues.usage_limit);
      setIsLimitUsagePerCustomer(!!formValues.usage_limit_per_customer);
      setPriceRuleData({
        rule: formValues.rule,
        activated_by: "",
        activated_name: "",
        async_usage_count: 0,
        code: "",
        entitled_method: formValues.entitled_method,
        entitlements: [],
        id: 0,
        number_of_discount_codes: 0,
        number_of_entitlements: 0,
        priority: 0,
        title: formValues.title,
      });

      setIsSetFormValues(true);
      form.setFieldsValue(formValues);
    }
  }, [form, promotionModalData, setIsLimitUsage, setIsLimitUsagePerCustomer, setPriceRuleData]);
  
  /** handle Insert key word */
  const updateCursorPosition = (cursorPosition: any, text: any, textArea: any) => {
    cursorPosition = cursorPosition + text.length;
    textArea.selectionStart = cursorPosition;
    textArea.selectionEnd = cursorPosition;
    textArea.focus();
  };

  const addTextAtCursorPosition = (
    textArea: any,
    cursorPosition: any,
    text: any,
    fieldName: any,
  ) => {
    let front = textArea.value.substring(0, cursorPosition);
    let back = textArea.value.substring(cursorPosition, textArea.value.length);
    textArea.value = front + text + back;
    form.setFieldsValue({ [fieldName]: textArea.value });
  };

  const addTextAtCaret = (inputId: any, text: any, fieldName: any) => {
    let textArea = document.getElementById(inputId);
    // @ts-ignore
    let cursorPosition = textArea?.selectionStart;
    addTextAtCursorPosition(textArea, cursorPosition, text, fieldName);
    updateCursorPosition(cursorPosition, text, textArea);
  };

  const handleInsertKeyword = (keyWordValue: string) => {
    addTextAtCaret("title", keyWordValue, "title");
  };
  /** end handle Insert key word */

  const handleSelectKeyWord = (keyWord: any) => {
    handleInsertKeyword(keyWord.value);
  };

  const handleSubmitPromotionModalForm = (value: any) => {
    value.state = "ACTIVE";
    onOk(value);
    form.resetFields();
  };
  
  const onCancelModal = () => {
    onOk(originFormValues);
    form.resetFields();
  };

  const keywordList = useMemo(() => {
    const _keywordList = cloneDeep(KEYWORD_LIST);
    if (smsType === "BIRTHDAY") {
      _keywordList.splice(2, 0,
        {
          name: "Cửa hàng",
          key: "stores",
          value: "{stores}",
        }
      );
    }

    if (smsType === "ONLINE_ORDER") {
      _keywordList.splice(0, 0,
        {
          name: "Nguồn",
          key: "sources",
          value: "{sources}",
        }
      );
    }
    return _keywordList;
  }, [smsType]);


  return (
    <Modal
      visible={isVisible}
      closable={false}
      maskClosable={false}
      centered
      title={"Nguyên tắc tạo mới chương trình khuyến mại"}
      width={800}
      okText="OK"
      onOk={() => form.submit()}
      cancelText="Hủy"
      onCancel={onCancelModal}
    >
      <StyledPromotionModal>
        <div className={"promotion-modal-body"}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitPromotionModalForm}
            onFinishFailed={({ errorFields }: any) => {
              const element: any = document.getElementById(errorFields[0].name.join(""));
              scrollAndFocusToDomElement(element);
            }}
            className={"edit-content"}
          >
            <Card>
              <Form.Item
                name="title"
                label={"Tên đợt phát hành"}
                rules={[
                  {
                    required: true,
                    message: "Cần nhập tên khuyến mại",
                  },
                  {
                    max: 255,
                    message: "Tên khuyến mại không vượt quá 255 ký tự",
                  },
                ]}
                style={{ display: "block" }}
              >
                <Input id={"title"} placeholder="Nhập tên đợt phát hành" />
              </Form.Item>

              <div style={{ marginBottom: "8px" }}><b>Chọn từ khóa:</b></div>
              <div className="key-word">
                <Row gutter={24}>
                  {keywordList?.map((keyWord: any, index: number) => (
                    <Col key={index} span={6} className="key-word">
                      <Button
                        style={{ width: "100%" }}
                        onClick={() => handleSelectKeyWord(keyWord)}
                      >
                        {keyWord.name}
                      </Button>
                    </Col>
                  ))}
                </Row>
              </div>
            </Card>

            <Card title="Loại khuyến mãi">
              <Row gutter={30}>
                <Col span={24}>
                  <Form.Item
                    label="Chọn loại"
                    name={PRICE_RULE_FIELDS.entitled_method}
                  >
                    <Select showArrow placeholder="Chọn loại mã khuyến mãi">
                      <Option
                        key={PriceRuleMethod.ORDER_THRESHOLD}
                        value={PriceRuleMethod.ORDER_THRESHOLD}
                      >
                        Khuyến mãi theo đơn hàng
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <OrderThresholdIssueTypeForm form={form} isSetFormValues={isSetFormValues} />
                </Col>
                <Col span={24}></Col>
              </Row>
            </Card>

            <Card title="Điều kiện áp dụng">
              <GeneralOrderThreshold form={form} priceRuleData={priceRuleData} />
            </Card>

            {smsType !== "BIRTHDAY" &&
              <Card>
                <Form.Item
                  name="apply_days"
                  label={"Thời gian áp dụng chương trình (Số ngày)"}
                  rules={[
                    {
                      required: true,
                      message: "Số ngày áp dụng phải lớn hơn 0",
                    },
                    () => ({
                      validator(_, value) {
                        if (typeof value === "number" && value <= 0) {
                          return Promise.reject("Số ngày áp dụng phải lớn hơn 0");
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  style={{ display: "block", width: "50%" }}
                >
                  <NumberInput
                    format={(a: string) => formatCurrency(a)}
                    replace={(a: string) => replaceFormatString(a)}
                    placeholder="Nhập số ngày áp dụng"
                    maxLength={3}
                    style={{ textAlign: "left" }}
                  />
                </Form.Item>
              </Card>
            }

            <Card title="Nguyên tắc tạo mã ngẫu nhiên">
              <Row gutter={24}>
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
                    name="suffix"
                    label="Hậu tố:"
                    normalize={(value) => nonAccentVietnamese(value)}
                  >
                    <Input placeholder="VD: SALE" maxLength={10} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Form>
        </div>
      </StyledPromotionModal>
    </Modal>
  );
};

const SmsConfigPromotionModalWithProvider = (props: any) => {
  return (
    <IssueProvider>
      <SmsConfigPromotionModal {...props} />
    </IssueProvider>
  );
};

export default SmsConfigPromotionModalWithProvider;
