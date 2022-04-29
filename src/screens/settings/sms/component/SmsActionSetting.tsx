import React, {useCallback, useEffect, useState} from "react";
import {Card} from "antd";
import {StyledSmsSetting} from "screens/settings/sms/styles";
import CustomTable, {ICustomTableColumType} from "../../../../component/table/CustomTable";
import {Link} from "react-router-dom";
import UrlConfig from "config/url.config";

const SMS_ACTION_INIT = [
	{
		label: "Phát sinh hóa đơn bán lẻ",
		key: "retail_offline_message",
		url: `${UrlConfig.SMS_SETTINGS}/order-retail`,
		value: "",
	},
	{
		label: "Phát sinh hóa đơn trên Website",
		key: "website_message",
		url: `${UrlConfig.SMS_SETTINGS}/website-order`,
		value: "",
	},
	// {
	// 	label: "Khách hàng tăng cấp độ (Cài đặt được nhiều tin)",
	// 	key: "customer_level_up_message",
	// 	url: `${UrlConfig.SMS_SETTINGS}/level-up`,
	// 	value: "",
	// },
	// {
	// 	label: "Khách hàng giảm cấp độ",
	// 	key: "customer_level_down_message",
	// 	url: `${UrlConfig.SMS_SETTINGS}/level-down`,
	// 	value: "",
	// },
	// {
	// 	label: "Trước ngày sinh nhật khách hàng",
	// 	key: "birthday_message",
	// 	url: `${UrlConfig.SMS_SETTINGS}/birthday`,
	// 	value: "",
	// },
];

const SmsActionSetting: React.FC<any> = (props: any) => {
	const {smsConfigData} = props;

	const [smsActionList, setSmsActionList] = useState<any>(SMS_ACTION_INIT);

	const handleSmsActionData = useCallback((data: any) => {
		if (data) {
			const messages = JSON.parse(data?.messages);
			const newSmsActionList = smsActionList.map((action: any) => {
				return {
					...action,
					value: messages?.[action.key]?.toString().trim()
				}
			})
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
			)}
		},
		{
			title: "Mô tả",
			dataIndex: "value",
			render: (value) => {
				return (
					<>
						{value ?
							<div>{value}</div>
							:
							<div style={{ color: "#75757B" }}>Chưa có tin nhắn</div>
						}
					</>
				)
			}
		},
	]

	return (
		<StyledSmsSetting>
			<Card title={"CÀI ĐẶT HÀNH ĐỘNG GỬI TIN"}>
				<CustomTable
					bordered
					pagination={false}
					dataSource={smsActionList}
					columns={smsActionColumns}
				/>
			</Card>
		</StyledSmsSetting>
	);
};

export default SmsActionSetting;
