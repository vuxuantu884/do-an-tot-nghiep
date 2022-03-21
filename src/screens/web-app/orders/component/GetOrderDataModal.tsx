import React, { useState } from "react";
import { DatePicker, Form, Modal, Select } from "antd";
import moment from "moment";
import { DATE_FORMAT } from 'utils/DateUtils';
import {WebAppDownloadOrderQuery} from "model/query/web-app.query";
import { StyledDownloadOrderData } from "screens/web-app/orders/orderStyles";

type GetOrderDataModalType = {
  visible: boolean;
  isLoading: boolean;
  webAppShopList: Array<any> | [];
  onOk: (data: any) => void;
  onCancel: () => void;
};

const { Option } = Select;
const { RangePicker } = DatePicker;


const GetOrderDataModal: React.FC<GetOrderDataModalType> = (
  props: GetOrderDataModalType
) => {
  const { visible, isLoading, webAppShopList, onOk, onCancel } = props;

  const [defaultShopId] = useState(webAppShopList[0]?.id || 438408);  //Set up default shop
  const [shopIdSelected, setShopIdSelected] = useState(defaultShopId || null);
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);

  const selectShop = (shop_id: any) => {
    setShopIdSelected(shop_id);
  }

  const onClearShop = () => {
    setShopIdSelected(null);
  }

  //handle select date
  // check disable select date
  const [dates, setDates] = useState<any>([]);
  const [selectedDateValue, setSelectedDateValue] = useState<any>();

  const disabledDate = (current: any) => {
    if (!dates || dates.length === 0) {
      return false;
    }
    const tooLate = dates[0] && current.diff(dates[0], 'days') > 14;
    const tooEarly = dates[1] && dates[1].diff(current, 'days') > 14;
    return tooEarly || tooLate;
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      setDates([]);
    }
  };

  const onCalendarChange = (dates: any, dateStrings: any, info: any) => {
    setDates(dates);
  };

  const convertStartDateToTimestamp = (date: any) => {
    const myDate = date.split("/");
    let newDate = myDate[1] + "." + myDate[0] + "." + myDate[2] + " 00:00:00";
    return moment(new Date(newDate)).unix();
  }

  const convertEndDateToTimestamp = (date: any) => {
    const myDate = date.split("/");
    const today = new Date();
    let time = "23:59:59";

    if ((Number(myDate[0]) === Number(today.getDate())) &&
      (Number(myDate[1]) === Number(today.getMonth()) + 1) &&
      (Number(myDate[2]) === Number(today.getFullYear()))
    ) {
      time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    }

    const newDate = myDate[1] + "." + myDate[0] + "." + myDate[2];
    const dateTime = newDate + " " + time;
    return moment(new Date(dateTime)).unix();
  }

  const onChangeDate = (dates: any, dateStrings: any) => {
    const startDateValue = convertStartDateToTimestamp(dateStrings[0]);
    setStartDate(startDateValue);
    const endDateValue = convertEndDateToTimestamp(dateStrings[1]);
    setEndDate(endDateValue);

    setSelectedDateValue(dates);
  };
  //end handle select date

  const handleDownloadEcommerceOrders = () => {
    const params: WebAppDownloadOrderQuery = {
      shop_id: shopIdSelected,
      update_time_from: startDate,
      update_time_to: endDate,
    }
    onOk && onOk(params);
  };

  const isDisableOkButton = () => {
    return !shopIdSelected || !startDate || !endDate;
  }

  const cancelGetOrderModal = () => {
    onCancel && onCancel();
  };


  return (
    <Modal
      width="600px"
      visible={visible}
      title="Tải dữ liệu đơn hàng"
      okText="Tải dữ liệu"
      cancelText="Hủy"
      onCancel={cancelGetOrderModal}
      onOk={handleDownloadEcommerceOrders}
      okButtonProps={{ disabled: isDisableOkButton() }}
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
              onSelect={(value) => selectShop(value)}
              disabled={true}
              showSearch
              onClear={onClearShop}
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
              defaultValue={defaultShopId}
            >
              {webAppShopList?.map((shop: any) => (
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
              value={selectedDateValue}
              disabledDate={disabledDate}
              onChange={onChangeDate}
              onCalendarChange={onCalendarChange}
              onOpenChange={onOpenChange}
            />
          </Form.Item>

          <div><i>Lưu ý: Thời gian tải dữ liệu không vượt quá <b>15 ngày</b></i></div>
        </Form>
      </StyledDownloadOrderData>
    </Modal>
  );
};

export default GetOrderDataModal;
