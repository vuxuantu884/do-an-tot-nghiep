import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Card, Col, Form, Row, Select, Space, Switch } from "antd";
import TextArea from "antd/es/input/TextArea";

import BottomBarContainer from "component/container/bottom-bar.container";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import {
  configSmsMessageAction,
  getSmsConfigAction,
} from "domain/actions/settings/sms-settings.action";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { POS } from "utils/Constants";
import { scrollAndFocusToDomElement } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { cloneDeep } from "lodash";
import moment from "moment";
import useAuthorization from "hook/useAuthorization";
import { SMS_CONFIG_PERMISSIONS } from "config/permissions/sms-config.permission";
import { ChannelResponse } from "model/response/product/channel.response";
import { smsFormOrderOnline } from "model/sms-config/smsConfig.model";
import { PriceRuleMethod } from "model/promotion/price-rules.model";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { SourceResponse } from "model/response/order/source.response";
import { getListChannelRequest } from "domain/actions/order/order.action";
import { getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import { CustomerGroups } from "domain/actions/customer/customer.action";
import { getListAllSourceRequest } from "domain/actions/product/source.action";
import SmsConfigPromotionModal from "screens/settings/sms/component/SmsConfigPromotionModal";
import CustomSelect from "component/custom/select.custom";
import TreeSource from "component/treeSource";
import { DiscountUnitType } from "screens/promotion/constants";
import { StyledSmsConfigMessage } from "screens/settings/sms/styles";
import { PlusOutlined } from "@ant-design/icons";
import deleteIcon from "assets/icon/deleteIcon.svg";

const { Option } = Select;

const KEY_WORD_LIST = [
  {
    name: "Tên khách hàng",
    key: "customer_name",
    value: "{customer_name}",
  },
  {
    name: "Số điện thoại khách hàng",
    key: "customer_phone",
    value: "{customer_phone}",
  },
  {
    name: "Mã đơn hàng",
    key: "order_code",
    value: "{order_code}",
  },
  {
    name: "Điểm tích lũy hiện tại",
    key: "point",
    value: "{point}",
  },
  {
    name: "Điểm sử dụng",
    key: "change_point",
    value: "{change_point}",
  },
  {
    name: "Nguồn đơn hàng",
    key: "source_id",
    value: "{source_id}",
  },
  {
    name: "Mã khuyến mại",
    key: "discount_code",
    value: "{discount_code}"
  },
];

const smsFormDefault: smsFormOrderOnline = {
  source_ids: [],
  customer_group_ids: [],
  customer_level_ids: [],
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
    apply_days: null,
    title: null,
    state: "DISABLED",
  },
  discount_code_length: null,
  discount_code_prefix: null,
  discount_code_suffix: null,
}

const updateSmsPermission = [SMS_CONFIG_PERMISSIONS.UPDATE];

const SmsOnlineOrder: React.FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();

  const [allowUpdateSms] = useAuthorization({
    acceptPermissions: updateSmsPermission,
    not: false,
  });

  const [messageStatus, setMessageStatus] = useState<boolean>(true);
  const [initValue, setInitValue] = useState<any>();

  const [smsFormList, setSmsFormList] = useState<Array<smsFormOrderOnline>>([smsFormDefault]);
  const [originSmsFormList, setOriginSmsFormList] = useState<Array<smsFormOrderOnline>>([smsFormDefault]);
  const [smsContentId, setSmsContentId] = useState<string>("");

  const handleSmsConfigData = useCallback(
    (data: any) => {
      if (data) {
        setMessageStatus(data.online_order_msg_status === "ACTIVE");
        const channelIds = data.sent_channel_ids?.split(",")?.map((item: any) => Number(item));
        const initFormValue = {
          online_order_msg_status: data.online_order_msg_status,
          sent_channel_ids: channelIds,
        };
        setInitValue(initFormValue);

        if (data.messages) {
          let smsFormListData: Array<smsFormOrderOnline> = [];
          Array.isArray(data.messages) && data.messages.forEach((message: any) => {
            if (message && message.type === "ONLINE") {
              const customerLevelIds = message.customer_level_ids?.length > 0 ?
                message.customer_level_ids.split(",").map((item: string) => Number(item)) : [];
              const customerGroupIds = message.customer_group_ids?.length > 0 ?
                message.customer_group_ids.split(",").map((item: string) => Number(item)) : [];
              const sourceIds = message.source_ids?.length > 0 ?
                message.source_ids.split(",").map((item: string) => Number(item)) : [];
              smsFormListData.push({
                ...message,
                customer_level_ids: customerLevelIds,
                customer_group_ids: customerGroupIds,
                source_ids: sourceIds,
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
    },
    [form],
  );

  useEffect(() => {
    dispatch(getSmsConfigAction(handleSmsConfigData));
  }, [dispatch, handleSmsConfigData]);

  /** get customer ranks, customer groups */
  const [channelList, setChannelList] = useState<Array<ChannelResponse>>([]);
  const [customerRankList, setCustomerRankList] = useState<Array<LoyaltyUsageResponse>>([]);
  const [customerGroupList, setCustomerGroupList] = useState<Array<any>>([]);
  const [sourceList, setSourceList] = useState<Array<SourceResponse>>([]);
  
  useEffect(() => {
    dispatch(getLoyaltyUsage(setCustomerRankList));
    dispatch(CustomerGroups(setCustomerGroupList));
    dispatch(getListAllSourceRequest(setSourceList));
    dispatch(getListChannelRequest((channelData) => {
      const onlineChannel = channelData.filter(channel => channel.code !== POS.channel_code);
      setChannelList(onlineChannel);
    }));
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
      apply_days: value.apply_days,
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
  const onChangeTreeSource = (value: any, smsFormIndex: number) => {
    const element: any = document.getElementsByClassName(`select-source-${smsFormIndex}`);
    if (element?.length > 0) {
      element[0].style.border = "unset";
    }

    let newSmsFormList = cloneDeep(smsFormList);
    newSmsFormList[smsFormIndex].source_ids = value;
    setSmsFormList(newSmsFormList);
  };



  /** end handle select customer rank */

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

  /** handle Insert text */
  const addTextAtCaret = (textAreaId: any, text: any, smsContentIndex: number) => {
    let textArea = document.getElementById(textAreaId);
    // @ts-ignore
    let cursorPosition = textArea?.selectionStart;
    addTextAtCursorPosition(textArea, cursorPosition, text, smsContentIndex);
    updateCursorPosition(cursorPosition, text, textArea);
  };

  const addTextAtCursorPosition = (
    textArea: any,
    cursorPosition: any,
    text: any,
    smsContentIndex: number,
  ) => {
    let front = textArea?.value.substring(0, cursorPosition);
    let back = textArea?.value.substring(cursorPosition, textArea.value.length);
    textArea.value = front + text + back;
    onChangeSmsContent(textArea.value, smsContentIndex)
  };

  const updateCursorPosition = (cursorPosition: any, text: any, textArea: any) => {
    cursorPosition = cursorPosition + text.length;
    textArea.selectionStart = cursorPosition;
    textArea.selectionEnd = cursorPosition;
    textArea.focus();
  };

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
      if (!smsFormList[i].source_ids?.length) {
        showError("Vui lòng chọn Nguồn");
        const selectSourceElement: any = document.getElementsByClassName(`select-source-${i}`);
        if (selectSourceElement?.length > 0) {
          selectSourceElement[0].style.border = "1px solid red";
        }

        const selectSourceInputElement: any = document.getElementById(`source-id-${i}`);
        scrollAndFocusToDomElement(selectSourceInputElement);
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

      const onlineOrderMessage = smsFormList.map(smsForm => {
        return {
          ...smsForm,
          customer_level_ids: smsForm.customer_level_ids?.toString(),
          customer_group_ids: smsForm.customer_group_ids?.toString(),
          source_ids: smsForm.source_ids?.toString(),
        }
      });

    const requestParams = {
      messages: { online_order_message: onlineOrderMessage },
      online_order_msg_status: messageStatus ? "ACTIVE" : "INACTIVE",
      sent_channel_ids: value.sent_channel_ids.toString(),
    };

    dispatch(
      configSmsMessageAction(requestParams, () => {
        backAction();
        showSuccess("Cấu hình SMS \"Đi đơn online thành công\" thành công!");
      }),
    );
  };

  const onCancel = () => {
    setMessageStatus(initValue.online_order_msg_status === "ACTIVE");
    setSmsFormList(originSmsFormList);
    form.setFieldsValue(initValue);

    //remove element style
    for (let i = 0; i < originSmsFormList.length; i++) {
      const selectSourceElement: any = document.getElementsByClassName(`select-source-${i}`);
      if (selectSourceElement?.length > 0) {
        selectSourceElement[0].style.border = "unset";
      }

      const smsContentElement: any = document.getElementById(`sms-content-id-${i}`);
      smsContentElement.classList.remove("warning-border");
    }
  };

  const backAction = () => {
    history.push(UrlConfig.SMS_SETTINGS);
  };

  return (
    <ContentContainer
      title="Đi đơn online thành công"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Cài đặt gửi tin",
          path: UrlConfig.SMS_SETTINGS,
        },
        {
          name: "Đi đơn online thành công",
        },
      ]}
    >
      <StyledSmsConfigMessage>
        <div className="sms-config-message">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitForm}
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
                  disabled={!allowUpdateSms}
                />
                {messageStatus ? <span>Hoạt động</span> : <span>Không hoạt động</span>}
              </Form.Item>

              <Form.Item name="sent_channel_ids" label="Kênh bán hàng">
                <CustomSelect
                  mode="multiple"
                  showSearch
                  allowClear
                  showArrow
                  placeholder="Chọn kênh bán hàng"
                  notFoundContent="Không tìm thấy kết quả"
                  style={{ width: "100%" }}
                  optionFilterProp="children"
                  getPopupContainer={(trigger) => trigger.parentNode}
                  maxTagCount="responsive"
                >
                  {channelList &&
                    channelList.map((channel) => (
                      <CustomSelect.Option key={channel.code} value={channel.id}>
                        {channel.name}
                      </CustomSelect.Option>
                    ))}
                </CustomSelect>
              </Form.Item>
            </Card>

            {smsFormList?.map((smsForm: any, smsFormIndex: number) => {
              return (
                <Card key={smsFormIndex}>
                  <Row gutter={24} style={{ marginBottom: "20px" }}>
                    <Col span={12} style={{ marginBottom: "20px" }}>
                      <div style={{ marginBottom: "8px" }}>
                        <b>Nguồn </b><span style={{ color: "#E24343" }}>*</span>
                      </div>
                      <TreeSource
                        placeholder="Chọn nguồn"
                        name="source_ids"
                        listSource={sourceList}
                        value={smsForm.source_ids}
                        onChange={(value) => onChangeTreeSource(value, smsFormIndex)}
                        style={{ width: "100%" }}
                        id={`source-id-${smsFormIndex}`}
                        className={`select-source-${smsFormIndex}`}
                      />
                    </Col>

                    <Col span={12}>
                      <div style={{ marginBottom: "8px" }}><b>Nhóm khách hàng</b></div>
                      <Select
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
                        // onFocus={onInputSelectFocus}
                        // onBlur={onInputSelectBlur}
                        // onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        // onPopupScroll={handleOnSelectPopupScroll}
                        // onMouseLeave={handleOnMouseLeaveSelect}
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
                      <div style={{ marginBottom: "8px" }}><b>Hạng khách hàng</b></div>
                      <Select
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
                        // onFocus={onInputSelectFocus}
                        // onBlur={onInputSelectBlur}
                        // onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        // onPopupScroll={handleOnSelectPopupScroll}
                        // onMouseLeave={handleOnMouseLeaveSelect}
                      >
                        {customerRankList?.map((customerRank: any) => (
                          <Option key={customerRank.rank_id} value={customerRank.rank_id}>
                            {customerRank.rank_name}
                          </Option>
                        ))}
                      </Select>
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
                smsType={"ONLINE_ORDER"}
              />
            }

            <BottomBarContainer
              back="Quay lại"
              backAction={backAction}
              rightComponent={
                allowUpdateSms && (
                  <Space>
                    <Button style={{ marginRight: 15 }} onClick={onCancel}>
                      {"Hủy"}
                    </Button>

                    <Button htmlType="submit" type="primary">
                      {"Lưu lại"}
                    </Button>
                  </Space>
                )
              }
            />
          </Form>

          <Card title="DANH SÁCH TỪ KHÓA SỬ DỤNG" className="key-word-list">
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
      </StyledSmsConfigMessage>
    </ContentContainer>
  );
};


export default SmsOnlineOrder;
