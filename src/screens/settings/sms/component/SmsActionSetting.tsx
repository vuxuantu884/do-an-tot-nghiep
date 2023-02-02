import React, { useCallback, useEffect, useState } from "react";
import { Card } from "antd";
import { StyledSmsSetting } from "screens/settings/sms/styles";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { cloneDeep } from "lodash";
import { SMS_TYPE } from "screens/settings/sms/helper";

const SMS_ACTION_INIT = [
  {
    label: "Phát sinh hóa đơn bán lẻ",
    type: SMS_TYPE.OFFLINE,
    url: `${UrlConfig.SMS_SETTINGS}/order-retail`,
    value: [],
  },
  {
    label: "Phát sinh hóa đơn trên Website",
    type: SMS_TYPE.WEBSITE,
    url: `${UrlConfig.SMS_SETTINGS}/website-order`,
    value: [],
  },
  {
    label: "Đi đơn online thành công",
    type: SMS_TYPE.ONLINE,
    url: `${UrlConfig.SMS_SETTINGS}/online-order`,
    value: [],
  },
	{
		label: "Trước ngày sinh nhật khách hàng",
    type: SMS_TYPE.BIRTHDAY,
		url: `${UrlConfig.SMS_SETTINGS}/customer-birthday`,
		value: [],
	},
  /** tạm ẩn "CTKM tặng voucher" */
	// {
	// 	label: "CTKM tặng voucher",
  //   type: SMS_TYPE.VOUCHER,
	// 	url: `${UrlConfig.SMS_SETTINGS}/promotion-voucher`,
	// 	value: [],
	// },
];

const SmsActionSetting: React.FC<any> = (props: any) => {
  const { smsConfigData } = props;

  const [smsActionList, setSmsActionList] = useState<any>(SMS_ACTION_INIT);

  const handleSmsActionData = useCallback((data: any) => {
    if (data && data.messages) {
      let newSmsActionList = cloneDeep(smsActionList);
      Array.isArray(data.messages) && data.messages.forEach((message: any) => {
        const smsActionIndex = newSmsActionList.findIndex((smsAction: any) => smsAction.type === message.type);
        if (smsActionIndex >= 0) {
          newSmsActionList[smsActionIndex].value.push(message.content);
        }
      });
      setSmsActionList(newSmsActionList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (smsConfigData) {
      handleSmsActionData(smsConfigData);
    }
  }, [handleSmsActionData, smsConfigData]);

  const smsActionColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "Tên hành động",
      dataIndex: "label",
      width: 300,
      render: (value, item) => {
        return (
          <Link target="" to={item.url}>
            {value}
          </Link>
        );
      },
    },
    {
      title: "Mô tả",
      dataIndex: "value",
      className: "message-content",
      render: (value) => {
        return (
          <>
            {value.length > 0 ?
              value.map((item: string, index: number) => {
                return (
                  <div key={index}>{item}</div>
                )
              })
              :
              <div style={{ color: "#75757B" }}>Chưa có tin nhắn</div>}
          </>
        );
      },
    },
  ];

  return (
    <StyledSmsSetting>
      <Card title={"CÀI ĐẶT HÀNH ĐỘNG GỬI TIN"} className={"sms-action-setting"}>
        <CustomTable
          bordered
          pagination={false}
          dataSource={smsActionList}
          columns={smsActionColumns}
          rowKey={(item: any) => item.label}
        />
      </Card>
    </StyledSmsSetting>
  );
};

export default SmsActionSetting;
