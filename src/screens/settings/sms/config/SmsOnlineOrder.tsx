import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Card, Form, Space, Switch } from "antd";
import TextArea from "antd/es/input/TextArea";

import BottomBarContainer from "component/container/bottom-bar.container";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import {
  configSmsMessageAction,
  getSmsConfigAction,
} from "domain/actions/settings/sms-settings.action";
import { showSuccess } from "utils/ToastUtils";
import { POS } from "utils/Constants";
import { SMS_CONFIG_PERMISSIONS } from "config/permissions/sms-config.permission";
import useAuthorization from "hook/useAuthorization";
import { StyledSmsConfigMessage } from "screens/settings/sms/styles";
import CustomSelect from "component/custom/select.custom";
import { ChannelResponse } from "model/response/product/channel.response";
import { getListChannelRequest } from "domain/actions/order/order.action";

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
];

const MESSAGE_CONTENT_ID = "online_order_message_id";

const updateSmsPermission = [SMS_CONFIG_PERMISSIONS.UPDATE];

const SmsOnlineOrder: React.FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();

  const [allowUpdateSms] = useAuthorization({
    acceptPermissions: updateSmsPermission,
    not: false,
  });

  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);
  const [messageStatus, setMessageStatus] = useState<boolean>(true);
  const [initValue, setInitValue] = useState<any>();

  const handleSmsConfigData = useCallback(
    (data: any) => {
      if (data) {
        const messages = data.messages?.find((item: any) => item.type === "ONLINE");
        setMessageStatus(data.online_order_msg_status === "ACTIVE");
        const channelIds = data.sent_channel_ids?.split(",")?.map((item: any) => Number(item));
        const initFormValue = {
          online_order_message: messages?.content,
          online_order_msg_status: data.online_order_msg_status,
          sent_channel_ids: channelIds,
        };
        setInitValue(initFormValue);
        form.setFieldsValue(initFormValue);
      }
    },
    [form],
  );

  useEffect(() => {
    dispatch(getSmsConfigAction(handleSmsConfigData));
  }, [dispatch, handleSmsConfigData]);

  useEffect(() => {
    dispatch(getListChannelRequest((channelData) => {
      const onlineChannel = channelData.filter(channel => channel.code !== POS.channel_code);
      setListChannel(onlineChannel);
    }));
  }, [dispatch]);

  /** handle Insert text */
  const addTextAtCaret = (textAreaId: any, text: any, fieldName: any) => {
    let textArea = document.getElementById(textAreaId);
    // @ts-ignore
    let cursorPosition = textArea?.selectionStart;
    addTextAtCursorPosition(textArea, cursorPosition, text, fieldName);
    updateCursorPosition(cursorPosition, text, textArea);
  };

  const addTextAtCursorPosition = (
    textArea: any,
    cursorPosition: any,
    text: any,
    fieldName: any,
  ) => {
    let front = textArea?.value.substring(0, cursorPosition);
    let back = textArea?.value.substring(cursorPosition, textArea.value.length);
    textArea.value = front + text + back;
    form.setFieldsValue({ [fieldName]: textArea.value });
  };

  const updateCursorPosition = (cursorPosition: any, text: any, textArea: any) => {
    cursorPosition = cursorPosition + text.length;
    textArea.selectionStart = cursorPosition;
    textArea.selectionEnd = cursorPosition;
    textArea.focus();
  };

  const handleInsertKeyword = (text: string) => {
    addTextAtCaret(MESSAGE_CONTENT_ID, text, "online_order_message");
  };
  /** end handle Insert text */

  // handle submit form
  const handleSubmitForm = (value: any) => {
    const requestParams = {
      sent_channel_ids: value.sent_channel_ids.toString(),
      messages: {
        online_order_message: value.online_order_message.trim(),
      },
      online_order_msg_status: messageStatus ? "ACTIVE" : "INACTIVE",
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
    form.setFieldsValue(initValue);
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
          name: "Notifications",
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
            <Card title="SMS">
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
                  {listChannel &&
                    listChannel.map((channel) => (
                      <CustomSelect.Option key={channel.code} value={channel.id}>
                        {channel.name}
                      </CustomSelect.Option>
                    ))}
                </CustomSelect>
              </Form.Item>

              <Form.Item name={"online_order_message"} label={<b>Nội dung</b>}>
                <TextArea
                  id={MESSAGE_CONTENT_ID}
                  allowClear
                  placeholder="Nhập nội dung sms"
                  autoSize={{ minRows: 10, maxRows: 10 }}
                  disabled={!allowUpdateSms}
                />
              </Form.Item>
            </Card>

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
