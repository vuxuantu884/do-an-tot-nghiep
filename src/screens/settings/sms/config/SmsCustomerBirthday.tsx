import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router-dom";
import { Button, Card, Form, Space, Switch, Select, Row, Col } from "antd";
import TextArea from "antd/es/input/TextArea";

import BottomBarContainer from "component/container/bottom-bar.container";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import {
  configSmsMessageAction,
  getSmsConfigAction,
} from "domain/actions/settings/sms-settings.action";
import { cloneDeep } from "lodash";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { scrollAndFocusToDomElement } from "utils/AppUtils";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { smsFormBirthDay } from "model/sms-config/smsConfig.model";
import { getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import { CustomerGroups } from "domain/actions/customer/customer.action";
import { PriceRuleMethod } from "model/promotion/price-rules.model";
import { DiscountUnitType } from "screens/promotion/constants";
import SmsConfigPromotionModal from "screens/settings/sms/component/SmsConfigPromotionModal";
import TreeStore from "component/CustomTreeSelect";
import { getAllPublicSimpleStoreAction } from "domain/actions/core/store.action";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { StyledSmsConfigMessage } from "screens/settings/sms/styles";

import { PlusOutlined } from "@ant-design/icons";
import deleteIcon from "assets/icon/deleteIcon.svg";


const KEY_WORD_LIST = [
  {
    name: "Tên khách hàng",
    key: "customer_name",
    value: "{customer_name}"
  },
  {
    name: "Số điện thoại khách hàng",
    key: "customer_phone",
    value: "{customer_phone}"
  },
  {
    name: "Tiền tích lũy hiện tại",
    key: "total_money_spend",
    value: "{total_money_spend}"
  },
  {
    name: "Điểm tích lũy hiện tại",
    key: "point",
    value: "{point}"
  },
  {
    name: "Hạng khách hàng cũ",
    key: "old_customer_level",
    value: "{old_customer_level}"
  },
  {
    name: "Hạng khách hàng mới",
    key: "customer_level",
    value: "{customer_level}"
  },
  {
    name: "Mã khuyến mại",
    key: "discount_code",
    value: "{discount_code}"
  },
]

const { Option } = Select;

const smsFormDefault: smsFormBirthDay = {
  customer_group_ids: [],
  customer_level_ids: [],
  store_ids: [],
  content: null,

  price_rule: {
    rule: {
      conditions: [
        {
          field: "subtotal",
          operator: "GREATER_THAN",
          value: 0,
        }
      ],
      group_operator: "AND",
      value: null,
      value_type: DiscountUnitType.PERCENTAGE.value,
    },
    entitled_method: PriceRuleMethod.ORDER_THRESHOLD,
    usage_limit: null,
    usage_limit_per_customer: null,
    title: null,
    state: "DISABLED",
  },
  discount_code_length: null,
  discount_code_prefix: null,
  discount_code_suffix: null,
}

const SmsCustomerBirthday: React.FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();

  const [smsFormList, setSmsFormList] = useState<Array<smsFormBirthDay>>([smsFormDefault]);
  const [originSmsFormList, setOriginSmsFormList] = useState<Array<smsFormBirthDay>>([smsFormDefault]);
  const [messageStatus, setMessageStatus] = useState<boolean>(true);
  const [originValue, setOriginValue] = useState<any>();

  const [smsContentId, setSmsContentId] = useState<string>("");

  const handleSmsConfigData = useCallback((data: any) => {
    if (data) {
      setMessageStatus(data.birthday_msg_status === "ACTIVE");
      const initFormValue = {
        birthday_msg_status: data.birthday_msg_status,
      };
      setOriginValue(initFormValue);
      
      if (data.messages) {
        let smsFormListData: Array<smsFormBirthDay> = [];
        Array.isArray(data.messages) && data.messages.forEach((message: any) => {
          if (message && message.type === "BIRTHDAY") {
            const customerLevelIds = message.customer_level_ids?.length > 0 ?
              message.customer_level_ids.split(",").map((item: string) => Number(item)) : [];
            const customerGroupIds = message.customer_group_ids?.length > 0 ?
              message.customer_group_ids.split(",").map((item: string) => Number(item)) : [];
            const storeIds = message.store_ids?.length > 0 ?
              message.store_ids.split(",").map((item: string) => Number(item)) : [];
            smsFormListData.push({
              ...message,
              customer_level_ids: customerLevelIds,
              customer_group_ids: customerGroupIds,
              store_ids: storeIds,
            });
          }
        });
        if (smsFormListData.length > 0) {
          setSmsFormList(smsFormListData);
          setOriginSmsFormList(smsFormListData);
        }
      }

      form.setFieldsValue(initFormValue);
    }
  }, [form]);

  useEffect(() => {
    dispatch(getSmsConfigAction(handleSmsConfigData));
  }, [dispatch, handleSmsConfigData]);

  /** get customer ranks, customer groups */
  const [customerRankList, setCustomerRankList] = useState<Array<LoyaltyUsageResponse>>([]);
  const [customerGroupList, setCustomerGroupList] = useState<Array<any>>([]);
  const [storeList, setStoreList] = useState<Array<StoreResponse>>([]);

  useEffect(() => {
    dispatch(getLoyaltyUsage(setCustomerRankList));
    dispatch(CustomerGroups(setCustomerGroupList));
    dispatch(getAllPublicSimpleStoreAction(setStoreList));
  }, [dispatch]);
  /** get customer ranks, customer groups */

  /** handle promotion modal */
  const [isVisiblePromotionModal, setIsVisiblePromotionModal] = useState<boolean>(false);
  const [promotionModalIndex, setPromotionModalIndex] = useState<number>(0);
  const [promotionModalData, setPromotionModalData] = useState<any>(null);
  
  const openPromotionModal = (smsFormIndex: number) => {
    setPromotionModalIndex(smsFormIndex);
    setPromotionModalData(smsFormList[smsFormIndex]);
    setIsVisiblePromotionModal(true);
  }

  const onOkPromotionModal = (value: any) => {
    const priceRule = {
      entitled_method: value.entitled_method,
      rule: value.rule,
      state: value.state,
      title: value.title,
      usage_limit: value.usage_limit,
      usage_limit_per_customer: value.usage_limit_per_customer,
    }
    let newSmsFormList = cloneDeep(smsFormList);
    const smsFormItem = {
      ...newSmsFormList[promotionModalIndex],
      price_rule: priceRule,
      discount_code_length: value.length,
      discount_code_prefix: value.prefix,
      discount_code_suffix: value.suffix,
    }
    newSmsFormList.splice(promotionModalIndex, 1, smsFormItem);

    setSmsFormList(newSmsFormList);
    setPromotionModalData(null);
    setIsVisiblePromotionModal(false);
  }
  /** end handle promotion modal */

  /** handle Insert text */
  const addTextAtCaret = (textAreaId: string, text: string, smsContentIndex: number) => {
    let textArea = document.getElementById(textAreaId);
    // @ts-ignore
    let cursorPosition = textArea?.selectionStart;
    addTextAtCursorPosition(textArea, cursorPosition, text, smsContentIndex);
    updateCursorPosition(cursorPosition, text, textArea);
  }

  const addTextAtCursorPosition = (textArea: any, cursorPosition: any, text: any, smsContentIndex: number) => {
    let front = (textArea.value).substring(0, cursorPosition);
    let back = (textArea.value).substring(cursorPosition, textArea.value.length);
    textArea.value = front + text + back;
    onChangeSmsContent(textArea.value, smsContentIndex)
  }

  const updateCursorPosition = (cursorPosition: any, text: any, textArea: any) => {
    cursorPosition = cursorPosition + text.length;
    textArea.selectionStart = cursorPosition;
    textArea.selectionEnd = cursorPosition;
    textArea.focus();
  }

  const handleInsertKeyword = (text: string) => {
    if (smsContentId) {
      const smsContentIndex = Number(smsContentId[smsContentId.length - 1]);
      if (text === "{discount_code}" && smsFormList[smsContentIndex]?.price_rule?.state === "DISABLED") {
        showWarning("Vui lòng thiết lập nguyên tắc tạo mới chương trình khuyến mại");
        return;
      }

      addTextAtCaret(smsContentId, text, smsContentIndex);
    } else {
      showWarning("Vui lòng chọn vị trí chèn từ khóa.")
    }
  };
  /** end handle Insert text */

  // handle submit form
  const handleSubmitForm = (value: any) => {
    for (let i = 0; i < smsFormList.length; i++) {
      if (!smsFormList[i].store_ids?.length) {
        showError("Vui lòng chọn cửa hàng mua cuối của khách hàng");
        const selectStoreElement: any = document.getElementsByClassName(`select-store-${i}`);
        if (selectStoreElement?.length > 0) {
          selectStoreElement[0].style.border = "1px solid red";
        }

        const selectStoreInputElement: any = document.getElementById(`store-id-${i}`);
        scrollAndFocusToDomElement(selectStoreInputElement);
        return;
      }

      if (!smsFormList[i].content) {
        showError("Vui lòng nhập nội dung tin nhắn");
        const element: any = document.getElementById(`sms-content-id-${i}`);
        element.classList.add("warning-border");
        scrollAndFocusToDomElement(element);
        return;
      }
    }

    const birthdayMessage = smsFormList.map(smsForm => {
      return {
        ...smsForm,
        customer_level_ids: smsForm.customer_level_ids?.toString(),
        customer_group_ids: smsForm.customer_group_ids?.toString(),
        store_ids: smsForm.store_ids?.toString(),
      }
    })
    const requestParams = {
      messages: { birthday_message: birthdayMessage },
      birthday_msg_status: messageStatus ? "ACTIVE" : "INACTIVE"
    }

    dispatch(configSmsMessageAction(requestParams, () => {
      backAction();
      showSuccess("Cấu hình SMS Trước ngày sinh nhật khách hàng thành công!");
    }));
  };

  const onCancel = () => {
    setMessageStatus(originValue.birthday_msg_status === "ACTIVE");
    setSmsFormList(originSmsFormList);
    form.setFieldsValue(originValue);

    //remove element style
    for (let i = 0; i < originSmsFormList.length; i++) {
      const selectStoreElement: any = document.getElementsByClassName(`select-store-${i}`);
      if (selectStoreElement?.length > 0) {
        selectStoreElement[0].style.border = "unset";
      }

      const smsContentElement: any = document.getElementById(`sms-content-id-${i}`);
      smsContentElement.classList.remove("warning-border");
    }
  };

  const backAction = () => {
    history.push(UrlConfig.SMS_SETTINGS);
  };

  /** handle add, delete sms */
  const addSmsForm = () => {
    let newSmsFormList = cloneDeep(smsFormList);
    newSmsFormList.push(smsFormDefault)
    setSmsFormList(newSmsFormList);
  };

  const deleteSmsForm = (indexDelete: number) => {
    const newSmsFormList = smsFormList.filter(
      (smsForm: any, index: number) => indexDelete !== index);
    setSmsFormList(newSmsFormList);
  };
  /** end handle add, delete sms */

  /** handle select customer rank */
  const handleSelectCustomerRank = (value: any, smsFormIndex: number) => {
    let newSmsFormList = cloneDeep(smsFormList);
    newSmsFormList[smsFormIndex]?.customer_level_ids.push(value);
    setSmsFormList(newSmsFormList);
  };

  const handleDeselectCustomerRank = (value: any, smsFormIndex: number) => {
    let newSmsFormList = cloneDeep(smsFormList);
    if (newSmsFormList[smsFormIndex]?.customer_level_ids) {
      const newCustomerLevelIds =  newSmsFormList[smsFormIndex].customer_level_ids.filter(
        (item: number) => item !== value);
      newSmsFormList[smsFormIndex].customer_level_ids = newCustomerLevelIds;
    }
    setSmsFormList(newSmsFormList);
  };

  const handleClearCustomerRank = (smsFormIndex: number) => {
    let newSmsFormList = cloneDeep(smsFormList);
    newSmsFormList[smsFormIndex].customer_level_ids = [];
    setSmsFormList(newSmsFormList);
  };
  /** end handle select customer rank */

  /** handle select customer group */
  const handleSelectCustomerGroup = (value: any, smsFormIndex: number) => {
    let newSmsFormList = cloneDeep(smsFormList);
    newSmsFormList[smsFormIndex]?.customer_group_ids.push(value);
    setSmsFormList(newSmsFormList);
  };

  const handleDeselectCustomerGroup = (value: any, smsFormIndex: number) => {
    let newSmsFormList = cloneDeep(smsFormList);
    if (newSmsFormList[smsFormIndex]?.customer_group_ids) {
      const newCustomerGroupIds =  newSmsFormList[smsFormIndex].customer_group_ids.filter(
        (item: number) => item !== value);
      newSmsFormList[smsFormIndex].customer_group_ids = newCustomerGroupIds;
    }
    setSmsFormList(newSmsFormList);
  };

  const handleClearCustomerGroup = (smsFormIndex: number) => {
    let newSmsFormList = cloneDeep(smsFormList);
    newSmsFormList[smsFormIndex].customer_group_ids = [];
    setSmsFormList(newSmsFormList);
  };
  /** end handle select customer group */

  /** handle select store */
  const onChangeTreeStore = (value: any, smsFormIndex: number) => {
    const element: any = document.getElementsByClassName(`select-store-${smsFormIndex}`);
    if (element?.length > 0) {
      element[0].style.border = "unset";
    }

    let newSmsFormList = cloneDeep(smsFormList);
    newSmsFormList[smsFormIndex].store_ids = value;
    setSmsFormList(newSmsFormList);
  };
  /** end handle select store */

  /** handle change message content */
  const onFocusTextArea = (e: any) => {
    setSmsContentId(e.target.id);
  };

  const onChangeSmsContent = (value: string, smsFormIndex: number) => {
    const element: any = document.getElementById(`sms-content-id-${smsFormIndex}`);
    element.classList.remove("warning-border");

    let newSmsFormList = cloneDeep(smsFormList);
    newSmsFormList[smsFormIndex].content = value;
    setSmsFormList(newSmsFormList);
  };
  /** end handle change message content */


  return (
    <ContentContainer
      title="Trước ngày sinh nhật khách hàng"
      breadcrumb={[
        {
          name: "Cài đặt",
        },
        {
          name: "Cài đặt gửi tin",
          path: UrlConfig.SMS_SETTINGS,
        },
        {
          name: "Trước ngày sinh nhật khách hàng",
        },
      ]}
    >
      <StyledSmsConfigMessage>
        <div className="sms-config-message">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitForm}
            onFinishFailed={({ errorFields }: any) => {
              const element: any = document.getElementById(errorFields[0].name.join(""));
              scrollAndFocusToDomElement(element);
            }}
            className={"edit-content"}
          >
            <Card>
              <Form.Item
                label={<b>Trạng thái:</b>}
                className={"action-status"}
              >
                <Switch
                  size="small"
                  checked={messageStatus}
                  onChange={(checked) => {
                    setMessageStatus(checked);
                  }}
                  className={"switch-button"}
                />
                {messageStatus ? <span>Hoạt động</span> : <span>Không hoạt động</span>}
              </Form.Item>
            </Card>

            {smsFormList?.map((smsForm: any, smsFormIndex: number) => {
              return (
                <Card key={smsFormIndex}>
                  <Row gutter={24} style={{ marginBottom: "20px" }}>
                    <Col span={12} style={{ marginBottom: "20px" }}>
                      <div style={{ marginBottom: "8px" }}><b>Hạng khách hàng</b></div>
                      <Select
                        autoClearSearchValue={false}
                        mode="multiple"
                        maxTagCount="responsive"
                        showSearch
                        showArrow
                        allowClear
                        placeholder="Chọn hạng khách hàng"
                        optionFilterProp="children"
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        value={smsForm.customer_level_ids}
                        onSelect={(value) => handleSelectCustomerRank(value, smsFormIndex)}
                        onDeselect={(value) => handleDeselectCustomerRank(value, smsFormIndex)}
                        onClear={() => handleClearCustomerRank(smsFormIndex)}
                        style={{ width: "100%" }}
                      >
                        {customerRankList?.map((customerRank: any) => (
                          <Option key={customerRank.rank_id} value={customerRank.rank_id}>
                            {customerRank.rank_name}
                          </Option>
                        ))}
                      </Select>
                    </Col>

                    <Col span={12} style={{ marginBottom: "20px" }}>
                      <div style={{ marginBottom: "8px" }}><b>Nhóm khách hàng</b></div>
                      <Select
                        autoClearSearchValue={false}
                        mode="multiple"
                        maxTagCount="responsive"
                        showSearch
                        showArrow
                        allowClear
                        placeholder="Chọn nhóm khách hàng"
                        optionFilterProp="children"
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        value={smsForm.customer_group_ids}
                        onSelect={(value) => handleSelectCustomerGroup(value, smsFormIndex)}
                        onDeselect={(value) => handleDeselectCustomerGroup(value, smsFormIndex)}
                        onClear={() => handleClearCustomerGroup(smsFormIndex)}
                        style={{ width: "100%" }}
                      >
                        {customerGroupList.map((group: any) => (
                          <Option key={group.id} value={group.id}>
                            {group.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>

                    <Col span={12}>
                      <div style={{ marginBottom: "8px" }}><b>Nguyên tắc tạo mới chương trình khuyến mại</b></div>
                      <Button
                        type="default"
                        onClick={() => openPromotionModal(smsFormIndex)}
                      >
                        Xem chi tiết
                      </Button>
                    </Col>

                    <Col span={12} style={{ marginBottom: "20px" }}>
                      <div style={{ marginBottom: "8px" }}>
                        <b>Cửa hàng mua cuối của KH </b><span style={{ color: "#E24343" }}>*</span>
                      </div>
                      <TreeStore
                        id={`store-id-${smsFormIndex}`}
                        placeholder="Chọn cửa hàng"
                        storeByDepartmentList={storeList as unknown as StoreByDepartment[]}
                        value={smsForm.store_ids}
                        onChange={(value) => onChangeTreeStore(value, smsFormIndex)}
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        style={{ width: "100%" }}
                        className={`select-store-${smsFormIndex}`}
                      />
                    </Col>
                  </Row>

                  <div className={"sms-content"}>
                    <div style={{ marginBottom: "8px" }}>
                      <b>Nội dung </b><span style={{ color: "#E24343" }}>*</span>
                    </div>
                    <TextArea
                      id={`sms-content-id-${smsFormIndex}`}
                      allowClear
                      placeholder="Nhập nội dung sms"
                      value={smsForm.content}
                      onChange={(e) => onChangeSmsContent(e.target.value, smsFormIndex)}
                      onFocus={onFocusTextArea}
                      autoSize={{ minRows: 10, maxRows: 10 }}
                      className={"text-area-input-content"}
                    />
                  </div>


                  <div className={"sms-form-footer"}>
                    {smsFormIndex === smsFormList.length - 1 ?
                      <Button
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => addSmsForm()}
                        className={"add-button"}
                      >
                        Thêm mẫu tin
                      </Button>
                      : <div></div>
                    }

                    {smsFormList.length > 1 &&
                      <Button
                        size="large"
                        icon={<img style={{ marginRight: 12 }} alt="" src={deleteIcon} />}
                        onClick={() => deleteSmsForm(smsFormIndex)}
                        className={"delete-button"}
                      >
                        Xóa
                      </Button>
                    }
                  </div>
                </Card>
              )
            })}

            {isVisiblePromotionModal &&
              <SmsConfigPromotionModal
                promotionModalData={promotionModalData}
                isVisible={isVisiblePromotionModal}
                onOk={onOkPromotionModal}
                smsType={"BIRTHDAY"}
              />
            }

            <BottomBarContainer
              back="Quay lại"
              backAction={backAction}
              rightComponent={
                <Space>
                  <Button style={{ marginRight: 15 }} onClick={onCancel}>
                    {"Hủy"}
                  </Button>

                  <Button  htmlType="submit" type="primary">
                    {"Lưu"}
                  </Button>
                </Space>
              }
            />
          </Form>

          <Card title="DANH SÁCH TỪ KHÓA SỬ DỤNG" className="key-word-list">
            {KEY_WORD_LIST?.map((keyWord) => {
              return (
                <div className="key-word-item" key={keyWord.value}>
                  <div><strong>{keyWord.value}</strong> : <span style={{color: "#75757B"}}>{keyWord.name}</span></div>
                  <Button className="insert-button" onClick={() => handleInsertKeyword(keyWord.value)}>Chèn</Button>
                </div>
              );
            })}
          </Card>
        </div>
      </StyledSmsConfigMessage>
    </ContentContainer>
  );
};

export default SmsCustomerBirthday;
