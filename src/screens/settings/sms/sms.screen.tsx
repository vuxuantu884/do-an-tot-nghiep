import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import {getSmsConfigAction} from "domain/actions/settings/sms-settings.action";
import SmsAccountSetting from "screens/settings/sms/component/SmsAccountSetting";
import SmsActionSetting from "screens/settings/sms/component/SmsActionSetting";

const SmsScreen: React.FC = () => {
	const dispatch = useDispatch();

	const [smsConfigData, setSmsConfigData] = useState<any>();

	const handleSmsConfigData = useCallback((data: any) => {
		if (data) {
			setSmsConfigData(data);
		}
	}, []);

	const getSmsConfig = useCallback(() => {
		dispatch(getSmsConfigAction(handleSmsConfigData));
	}, [dispatch, handleSmsConfigData]);

	useEffect(() => {
		getSmsConfig();
	}, [getSmsConfig]);

	return (
		<ContentContainer
			title="Cài đặt gửi tin"
			breadcrumb={[
				{
					name: "Tổng quan",
					path: UrlConfig.HOME,
				},
				{
					name: "Cài đặt gửi tin",
				},
				{
					name: "Notification",
				},
			]}
		>
			<SmsAccountSetting smsConfigData={smsConfigData} />
			<SmsActionSetting smsConfigData={smsConfigData} />

		</ContentContainer>
	)
}

export default SmsScreen;