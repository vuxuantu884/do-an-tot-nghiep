import { DatePicker, Form, Modal, Select } from "antd";
import { getWebAppShopList } from "domain/actions/web-app/web-app.actions";
import { WebAppDownloadOrderQuery } from "model/query/web-app.query";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { convertEndDateToTimestamp, convertStartDateToTimestamp, DATE_FORMAT } from "utils/DateUtils";
import { StyledDownloadOrderData } from "../order-sync/style";

type DownloadOrderModalProps = {
    visible: boolean;
    onOk: (data: any) => void;
    onCancel: () => void;
}
const DownloadDataModal = (props: DownloadOrderModalProps) => {
    const { visible, onOk, onCancel } = props;

    const dispatch = useDispatch();
    const { Option } = Select;
    const { RangePicker } = DatePicker;

    const [isLoading, setIsLoading] = useState(false);
    const [shopList, setShopList] = useState<Array<any>>([]);
    const [dateRange, setDateRange] = useState<any>([]);
    const [startDate, setStartDate] = useState<any>(null);
    const [endDate, setEndDate] = useState<any>(null);
    const [shopId, setShopId] = useState(0);

    //handle date
    const checkDisabledDate = (current: any) => {
        if (!dateRange || dateRange.length === 0) {
            return false;
        }
        const tooLate = dateRange[0] && current.diff(dateRange[0], 'days') > 14;
        const tooEarly = dateRange[1] && dateRange[1].diff(current, 'days') > 14;
        return tooEarly || tooLate;
    }

    const handleChangeDate = (dateRange: any, dateStrings: any) => {
        setStartDate(convertStartDateToTimestamp(dateStrings[0]))
        setEndDate(convertEndDateToTimestamp(dateStrings[1]))
        setDateRange(dateRange)
    }
    //handle download order
    const handleDownloadOrder = () => {
        const params: WebAppDownloadOrderQuery = {
            shop_id: shopId,
            update_time_from: startDate,
            update_time_to: endDate,
        }
        setIsLoading(true);
        onOk && onOk(params);
    };

    const checkDisableOkButton = () => {
        return !shopId || !startDate || !endDate;
    }
    useEffect(() => {
        setIsLoading(true);
        dispatch(getWebAppShopList({}, (responseData) => {
            setIsLoading(false);
            setShopList(responseData);
        }));
    }, [dispatch]);
    return (
        <Modal
            width="600px"
            visible={visible}
            title="Tải dữ liệu"
            okText="Tải dữ liệu"
            cancelText="Hủy"
            onCancel={onCancel}
            onOk={handleDownloadOrder}
            okButtonProps={{ disabled: checkDisableOkButton() }}
            cancelButtonProps={{ disabled: isLoading }}
            closable={!isLoading}
            maskClosable={false}
            confirmLoading={isLoading}
        >
            <StyledDownloadOrderData>
                <Form layout="vertical">
                    <Form.Item
                        label={<b>Lựa chọn gian hàng <span style={{ color: 'red' }}>*</span></b>}
                    >
                        <Select
                            placeholder="Chọn gian hàng"
                            allowClear
                            onSelect={(value: any) => value && setShopId(parseInt(value))}
                            disabled={false}
                            showSearch
                            notFoundContent="Không có dữ liệu gian hàng"
                            filterOption={(input, option) => {
                                if (option) {
                                    const shopName = option.children && option.children[1];
                                    return (
                                        shopName?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    );
                                }
                                return false;
                            }}
                        >
                            {shopList?.map((shop: any) => (
                                <Option key={shop.id} value={shop.id}>
                                    {shop.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label={<b>Thời gian <span style={{ color: 'red' }}>*</span></b>}>
                        <RangePicker
                            disabled={isLoading}
                            placeholder={["Từ ngày", "Đến ngày"]}
                            style={{ width: "100%" }}
                            format={DATE_FORMAT.DDMMYYY}
                            value={dateRange}
                            disabledDate={checkDisabledDate}
                            onChange={handleChangeDate}
                            onCalendarChange={(dataRange: any, dateStrings: any, info: any) => setDateRange(dataRange)}
                            onOpenChange={(open: boolean) => open && setDateRange([])}
                        />
                    </Form.Item>
                    <div><i>Lưu ý: Thời gian tải dữ liệu không vượt quá <b>15 ngày</b></i></div>
                </Form>
            </StyledDownloadOrderData>
        </Modal>
    )
}
export default DownloadDataModal;