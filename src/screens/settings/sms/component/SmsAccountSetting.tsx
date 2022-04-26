import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {Button, Card, Form, Input, Select, Switch} from "antd";
import {StyledSmsSetting} from "screens/settings/sms/styles";
import {formatCurrency, replaceFormatString} from "utils/AppUtils";
import NumberInput from "component/custom/number-input.custom";
import {updateSmsConfigAction} from "domain/actions/settings/sms-settings.action";
import {showSuccess} from "utils/ToastUtils";


const SMS_TYPE = [
	{
		label: "Esms",
		key: "Esms",
		value: "http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get",
	},
];

const STATUS_TYPE = [
	{
		label: "Hoạt động",
		key: "active-status",
		value: "ACTIVE",
	},
	{
		label: "Ngừng hoạt động",
		key: "inactive-status",
		value: "INACTIVE",
	},
];

const SmsAccountSetting: React.FC<any> = (props: any) => {
	const {smsConfigData} = props;

	const dispatch = useDispatch();
	const [form] = Form.useForm();

	const [isUnicode, setIsUnicode] = useState<boolean>(true);

	const handleSmsAccountData = useCallback((data: any) => {
		if (data) {
			form.setFieldsValue({
				esms_host: data.esms_host,
				brand_name: data.brand_name,
				care_price: data.care_price,
				ads_price: data.ads_price,
				status: data.status,
				// is_unicode: data.is_unicode,
				api_key: data.api_key,
				secret_key: data.secret_key,
			});
			setIsUnicode(data.is_unicode);
		}
	}, [form]);

	useEffect(() => {
		if (smsConfigData) {
			handleSmsAccountData(smsConfigData);
		}
	}, [handleSmsAccountData, smsConfigData]);

	const handleUpdateSmsConfig = (values: any) => {
		const request = {
			...values,
			is_unicode: isUnicode
		}
		dispatch(updateSmsConfigAction(request, () => {
			showSuccess("Cài đặt tài khoản gửi tin thành công!");
		}));
	}

	return (
		<StyledSmsSetting>
			<Card title={"CÀI ĐẶT TÀI KHOẢN GỬI TIN"} className="sms-settings">
				<Form
					form={form}
					name="sms-settings"
					onFinish={handleUpdateSmsConfig}
					layout="vertical"
				>
					<div className="row-item">
						<Form.Item
							name="esms_host"
							label={<b>Cổng SMS</b>}
							rules={[{ required: true, message: "Vui lòng chọn cổng SMS" }]}
							className="left-item"
						>
							<Select
								showSearch
								placeholder="Chọn cổng SMS"
								allowClear
							>
								{SMS_TYPE.map((sms: any) => (
									<Select.Option key={sms.key} value={sms.value}>
										{sms.label}
									</Select.Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item
							name="brand_name"
							label={<b>Brand Name</b>}
							rules={[{ required: true, message: "Vui lòng nhập tên thương hiệu" }]}
							className="right-item"
						>
							<Input
								maxLength={255}
								type="text"
								placeholder="Nhập Brand name"
							/>
						</Form.Item>
					</div>

					<div className="row-item">
						<Form.Item
							name="care_price"
							label={<b>Giá SMS CSKH</b>}
							rules={[{ required: true, message: "Vui lòng nhập giá SMS CSKH" }]}
							className="left-item"
						>
							<NumberInput
								format={(a: string) => formatCurrency(a)}
								replace={(a: string) => replaceFormatString(a)}
								placeholder="---"
								style={{textAlign: 'left'}}
								maxLength={15}
							/>
						</Form.Item>

						<Form.Item
							name="ads_price"
							label={<b>GIÁ SMS quảng cáo</b>}
							rules={[{ required: true, message: "Vui lòng nhập giá SMS quảng cáo" }]}
							className="right-item"
						>
							<NumberInput
								format={(a: string) => formatCurrency(a)}
								replace={(a: string) => replaceFormatString(a)}
								placeholder="---"
								style={{textAlign: 'left'}}
								maxLength={15}
							/>
						</Form.Item>
					</div>

					<div className="row-item">
						<Form.Item
							name="status"
							label={<b>Trạng thái</b>}
							rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
							className="left-item"
						>
							<Select
								showSearch
								placeholder="Chọn trạng thái"
								allowClear
							>
								{STATUS_TYPE.map((status: any) => (
									<Select.Option key={status.key} value={status.value}>
										{status.label}
									</Select.Option>
								))}
							</Select>
						</Form.Item>

						<Form.Item
							name="is_unicode"
							label={<b>Gửi tin có dấu:</b>}
							className="right-item"
						>
							<Switch
								checked={isUnicode}
								onChange={(checked) => {
									setIsUnicode(checked);
								}}
							/>
						</Form.Item>
					</div>

					<div className="row-item">
						<Form.Item
							name="api_key"
							label={<b>API Key</b>}
							rules={[{ required: true, message: "Vui lòng nhập API Key" }]}
							className="left-item"
						>
							<Input
								maxLength={255}
								type="text"
								placeholder="Nhập API Key"
							/>
						</Form.Item>

						<Form.Item
							name="secret_key"
							label={<b>Secret Key</b>}
							rules={[{ required: true, message: "Vui lòng nhập Secret Key" }]}
							className="right-item"
						>
							<Input
								maxLength={255}
								type="text"
								placeholder="Nhập Secret Key"
							/>
						</Form.Item>
					</div>

					<div>
						<Button type="primary" htmlType="submit">
							Lưu lại
						</Button>
					</div>
				</Form>
			</Card>

		</StyledSmsSetting>
	);
};

export default SmsAccountSetting;
