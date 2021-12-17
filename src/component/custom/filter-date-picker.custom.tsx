import { SwapRightOutlined } from "@ant-design/icons";
import { Col, Form, Row } from "antd";
import { FormInstance } from "antd/es/form/Form";
import moment, { Moment } from "moment";
import { CSSProperties, useCallback } from "react";
import { DATE_FORMAT } from "utils/DateUtils";
import { StyledComponent } from "./filter-date-picker.custom.styles";
import CustomDatePicker from "./new-date-picker.custom";

export const DATE_RANGE_SELECT = {
	today: "today",
	yesterday: "yesterday",
	thisWeek: "thisWeek",
	lastWeek: "lastWeek",
	thisMonth: "thisMonth",
	lastMonth: "lastMonth",
}

type PropTypes = {
	value?: string;
	onChange?: (value: string | undefined) => void;
	style?: CSSProperties;
	placeholder?: string;
	className?: string;
	disableDate?: (date: Moment) => boolean;
	format?: string;
	showTime?: boolean;
	defaultValue?: Moment | undefined;
	activeButton: string;
	setActiveButton: (value: string) => void;
	fieldNameFrom: string;
	fieldNameTo: string;
	formRef?: React.RefObject<FormInstance<any>>;
};

function CustomFilterDatePicker(props: PropTypes) {
	const {
		format = DATE_FORMAT.DDMMYYY,
		activeButton,
		setActiveButton,
		fieldNameFrom,
		fieldNameTo,
		formRef,
	} = props;

	const TIME_RANGE = [
		{
			title: "Hôm qua",
			value: DATE_RANGE_SELECT.yesterday
		},
		{
			title: "Hôm nay",
			value: DATE_RANGE_SELECT.today
		},
		{
			title: "Tuần này",
			value: DATE_RANGE_SELECT.thisWeek
		},
		{
			title: "Tuần trước",
			value: DATE_RANGE_SELECT.lastWeek
		},
		{
			title: "Tháng này",
			value: DATE_RANGE_SELECT.thisMonth
		},
		{
			title: "Tháng trước",
			value: DATE_RANGE_SELECT.lastMonth
		},
	]

	const clickOptionDate = useCallback(
		(value) => {
			let minValue = null;
			let maxValue = null;
			switch (value) {
				case DATE_RANGE_SELECT.today:
					minValue = moment().startOf("day").format(format);
					maxValue = moment().endOf("day").format(format);
					break;
				case DATE_RANGE_SELECT.yesterday:
					minValue = moment().startOf("day").subtract(1, "days").format(format);
					maxValue = moment().endOf("day").subtract(1, "days").format(format);
					break;
				case DATE_RANGE_SELECT.thisWeek:
					minValue = moment().startOf("week").format(format);
					maxValue = moment().endOf("week").format(format);
					break;
				case DATE_RANGE_SELECT.lastWeek:
					minValue = moment().startOf("week").subtract(1, "weeks").format(format);
					maxValue = moment().endOf("week").subtract(1, "weeks").format(format);
					break;
				case DATE_RANGE_SELECT.thisMonth:
					minValue = moment().startOf("month").format(format);
					maxValue = moment().endOf("month").format(format);
					break;
				case DATE_RANGE_SELECT.lastMonth:
					minValue = moment().startOf("month").subtract(1, "months").format(format);
					maxValue = moment().endOf("month").subtract(1, "months").format(format);
					break;
				default:
					break;
			}
			console.log('activeButton', activeButton)
			console.log('value', value)
			if (activeButton === value) {
				setActiveButton("");
				formRef?.current?.setFieldsValue({
					[fieldNameFrom]: undefined,
					[fieldNameTo]: undefined,
				});
			} else {
				formRef?.current?.setFieldsValue({
					[fieldNameFrom]: moment(minValue, format).format(format),
					[fieldNameTo]: moment(maxValue, format).format(format)
				})
			}
		},
		[activeButton, fieldNameFrom, fieldNameTo, formRef, format, setActiveButton]
	);

	const renderDatePickerFooter = () => {
		let html = null;
		html = TIME_RANGE.map((range) => {
			return (
				<Col span={8}
					onClick={() => clickOptionDate(range.value)}
					key={range.value}
					style={{ textAlign: "center" }}
				>
					<span className={`datePickerSelectRange ${activeButton === range.value ? "active" : ""}`}>
						{range.title}
					</span>
				</Col>
			)
		})
		return html;
	};

	const renderExtraFooter = () => {
		return (
			<div className="datePickerFooter">
				<Row gutter={15} className="date-option">
					{renderDatePickerFooter()}
				</Row>
			</div>
		);
	};

	const onChangeDate = useCallback(
		() => {
			let value: any = {};
			setActiveButton('')
			value = formRef?.current?.getFieldsValue([fieldNameFrom, fieldNameTo])
			if (value[fieldNameFrom] && value[fieldNameTo] && (+moment(value[fieldNameFrom], format) > + moment(value[fieldNameTo], format))) {
				console.log('invalid')
				formRef?.current?.setFields([
					{
						name: fieldNameFrom,
						errors: ['Khoảng thời gian chưa chính xác'],
					},
					{
						name: fieldNameTo,
						errors: [''],
					},
				])
			} else {
				formRef?.current?.setFields([
					{
						name: fieldNameFrom,
						errors: undefined,
					},
					{
						name: fieldNameTo,
						errors: undefined,
					},
				])
			}
		}, [fieldNameFrom, fieldNameTo, formRef, format, setActiveButton]);

	return (
		<StyledComponent>
			<Form.Item
				name={fieldNameFrom}
				style={{ width: "45%", marginBottom: 0 }}
			>
				<CustomDatePicker
					format={format}
					placeholder="Từ ngày"
					style={{ width: "100%" }}
					onChange={() => onChangeDate()}
					showToday={false}
					renderExtraFooter={renderExtraFooter}
				/>
			</Form.Item>
			<div className="swap-right-icon"><SwapRightOutlined /></div>
			<Form.Item name={fieldNameTo} style={{ width: "45%", marginBottom: 0 }}>
				<CustomDatePicker
					format={format}
					placeholder="Đến ngày"
					style={{ width: "100%" }}
					onChange={() => onChangeDate()}
					showToday={false}
					renderExtraFooter={renderExtraFooter}
				/>
			</Form.Item>
		</StyledComponent>
	);
}

export default CustomFilterDatePicker;
