import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router-dom";
import {Button, Card, Form, Space, Switch} from "antd";
import TextArea from "antd/es/input/TextArea";

import BottomBarContainer from "component/container/bottom-bar.container";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import {
  configSmsMessageAction,
  getSmsConfigAction,
} from "domain/actions/settings/sms-settings.action";
import {showSuccess} from "utils/ToastUtils";
import {StyledSmsConfigMessage} from "screens/settings/sms/styles";

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
]


const SmsWebsiteOrder: React.FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();

  const [messageStatus, setMessageStatus] = useState<boolean>(true);
  const [initValue, setInitValue] = useState<any>();

  const handleSmsConfigData = useCallback((data: any) => {
    if (data) {
      const messages = JSON.parse(data?.messages);
      setMessageStatus(data.website_msg_status === "ACTIVE");

      const initFormValue = {
        website_message: messages.website_message,
        website_msg_status: data.website_msg_status,
      };
      setInitValue(initFormValue);
      form.setFieldsValue(initFormValue);
    }
  }, [form]);

  useEffect(() => {
    dispatch(getSmsConfigAction(handleSmsConfigData));
  }, [dispatch, handleSmsConfigData]);

  // handle Insert text
  const addTextAtCaret = (textAreaId: any, text: any, fieldName: any) => {
    let textArea = document.getElementById(textAreaId);
    // @ts-ignore
    let cursorPosition = textArea?.selectionStart;
    addTextAtCursorPosition(textArea, cursorPosition, text, fieldName);
    updateCursorPosition(cursorPosition, text, textArea);
  }

  const addTextAtCursorPosition = (textArea: any, cursorPosition: any, text: any, fieldName: any) => {
    let front = (textArea.value).substring(0, cursorPosition);
    let back = (textArea.value).substring(cursorPosition, textArea.value.length);
    textArea.value = front + text + back;
    form.setFieldsValue({[fieldName]: textArea.value});
  }

  const updateCursorPosition = (cursorPosition: any, text: any, textArea: any) => {
    cursorPosition = cursorPosition + text.length;
    textArea.selectionStart = cursorPosition;
    textArea.selectionEnd = cursorPosition;
    textArea.focus();
  }

  const handleInsertKeyword = (text: string) => {
    addTextAtCaret("website_message_id", text, "website_message");
  };
  // end handle insert text

  // handle submit form
  const handleSubmitForm = (value: any) => {
    const requestParams = {
      messages:
        {
          website_message: value.website_message.trim()
        },
      website_msg_status: messageStatus ? "ACTIVE" : "INACTIVE"
    }

    dispatch(configSmsMessageAction(requestParams, () => {
      backAction();
      showSuccess("Cấu hình SMS Phát sinh hóa đơn trên Website thành công!");
    }));
  };

  const onCancel = () => {
    setMessageStatus(initValue.website_msg_status === "ACTIVE");
    form.setFieldsValue(initValue);
  };

  const backAction = () => {
    history.push(UrlConfig.SMS_SETTINGS);
  };


  return (
    <ContentContainer
      title="Phát sinh hóa đơn trên Website"
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
          name: "Phát sinh hóa đơn trên Website",
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
                name="website_msg_status"
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

              <Form.Item
                name={"website_message"}
                label={<b>Nội dung</b>}>
                <TextArea
                  id={"website_message_id"}
                  allowClear
                  placeholder="Nhập nội dung sms"
                  autoSize={{ minRows: 10, maxRows: 10 }}
                />
              </Form.Item>
            </Card>

            <BottomBarContainer
              back="Quay lại"
              backAction={backAction}
              rightComponent={
                <Space>
                  <Button style={{ marginRight: 15 }} onClick={onCancel}>
                    {"Hủy"}
                  </Button>

                  <Button  htmlType="submit" type="primary">
                    {"Lưu lại"}
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

export default SmsWebsiteOrder;
