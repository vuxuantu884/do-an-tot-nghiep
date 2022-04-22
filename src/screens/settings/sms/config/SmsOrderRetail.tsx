import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useHistory} from "react-router-dom";
import {Button, Card, Form, TreeSelect, Space, Switch} from "antd";
import TextArea from "antd/es/input/TextArea";

import BottomBarContainer from "component/container/bottom-bar.container";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import useFetchStores from "hook/useFetchStores";
import {strForSearch} from "utils/StringUtils";
import {
  configSmsMessageAction,
  getSmsConfigAction,
} from "domain/actions/settings/sms-settings.action";
import {showSuccess} from "utils/ToastUtils";
import {StyledSmsConfigMessage} from "screens/settings/sms/styles";

const KEY_WORD_LIST = [
  {
    name: "ID cửa hàng",
    key: "store_id",
    value: "{store_id}"
  },
  {
    name: "Tên cửa hàng",
    key: "store_name",
    value: "{store_name}"
  },
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
    name: "Điểm tích lũy hiện tại",
    key: "point",
    value: "{point}"
  },
  {
    name: "Điểm sử dụng",
    key: "change_point",
    value: "{change_point}"
  },
]

const { SHOW_PARENT } = TreeSelect;

const SmsOrderRetail: React.FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();

  const [messageStatus, setMessageStatus] = useState<boolean>(true);
  const [storeList, setStoreList] = useState<any>([]);
  const [publicStoreIdList, setPublicStoreIdList] = useState<any>([]);
  const [initValue, setInitValue] = useState<any>();

  const publicStoreData = useFetchStores();

  useEffect(() => {
    if (publicStoreData) {
      const newStoreList = publicStoreData.map(item => {
        return (
          {
            title: item.name,
            key: item.id,
            value: item.id,
          }
        )
      });

      const treeData = [
        {
          title: `Chọn tất cả (${newStoreList?.length})`,
          value: 'all',
          key: 'all',
          children: newStoreList,
        }
      ]
      setStoreList(treeData);

      const newStoreIdList = publicStoreData.map(item => item.id);
      setPublicStoreIdList(newStoreIdList);
    }
  }, [publicStoreData]);

  const handleSmsConfigData = useCallback((data: any) => {
    if (data) {
      const messages = JSON.parse(data?.messages);
      setMessageStatus(data.retail_offline_msg_status === "ACTIVE");

      const unsentStoreList = data.unsent_sms_store_ids.split(",");
      let sentStoreList = publicStoreIdList;
      for (let i = 0 ; i < unsentStoreList.length; i++) {
        sentStoreList = sentStoreList.filter((id: any) => id.toString() !== unsentStoreList[i].toString());
      }

      const initFormValue = {
        sent_sms_store_ids: sentStoreList,
        retail_offline_message: messages.retail_offline_message,
        retail_offline_msg_status: data.retail_offline_msg_status,
      };
      setInitValue(initFormValue);
      form.setFieldsValue(initFormValue);
    }
  }, [form, publicStoreIdList]);

  useEffect(() => {
    if (publicStoreIdList?.length) {
      dispatch(getSmsConfigAction(handleSmsConfigData));
    }
  }, [dispatch, handleSmsConfigData, publicStoreIdList?.length]);

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
    addTextAtCaret("retail_offline_message_id", text, "retail_offline_message");
  };
  // end handle insert text

  // handle submit form
  const handleSubmitForm = (value: any) => {
    let unsentStoreList = publicStoreIdList;
    if (value.sent_sms_store_ids && value.sent_sms_store_ids[0] !== "all") {
      for (let i = 0 ; i< value.sent_sms_store_ids.length; i++) {
        unsentStoreList = unsentStoreList.filter((id: any) => id !== value.sent_sms_store_ids[i]);
      }
    } else {
      unsentStoreList = [];
    }

    const requestParams = {
      unsent_sms_store_ids: unsentStoreList.toString(),
      messages:
        {
          retail_offline_message: value.retail_offline_message.trim()
        },
      retail_offline_msg_status: messageStatus ? "ACTIVE" : "INACTIVE"
    }

    dispatch(configSmsMessageAction(requestParams, () => {
      backAction();
      showSuccess("Cấu hình SMS phát sinh hóa đơn bán lẻ thành công!");
    }));
  };

  const onCancel = () => {
    setMessageStatus(initValue.retail_offline_msg_status === "ACTIVE");
    form.setFieldsValue(initValue);
  };

  const backAction = () => {
    history.push(UrlConfig.SMS_SETTINGS);
  };


  return (
    <ContentContainer
      title="Phát sinh hóa đơn bán lẻ"
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
          name: "Phát sinh hóa đơn bán lẻ",
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
                name="retail_offline_msg_status"
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
                name="sent_sms_store_ids"
                label={<b>Cửa hàng áp dụng</b>}
              >
                <TreeSelect
                  maxTagCount="responsive"
                  showSearch
                  showArrow
                  allowClear
                  treeData={storeList}
                  treeCheckable={true}
                  showCheckedStrategy={SHOW_PARENT}
                  placeholder={"Chọn cửa hàng áp dụng"}
                  treeDefaultExpandAll
                  filterTreeNode={(input: String, option: any) => {
                    if (option.value) {
                      return strForSearch(option.title).includes(strForSearch(input));
                    }
                    return false;
                  }}
                />
              </Form.Item>

              <Form.Item
                name={"retail_offline_message"}
                label={<b>Nội dung</b>}>
                <TextArea
                  id={"retail_offline_message_id"}
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

export default SmsOrderRetail;
