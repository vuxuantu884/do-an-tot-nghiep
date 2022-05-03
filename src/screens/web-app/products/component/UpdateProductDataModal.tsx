import React, { useState } from "react";
import { DatePicker, Modal, Select } from "antd";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";

import { StyledUpdateProductDataModal } from "screens/web-app/products/styles";

type UpdateProductDataModalProps = {
  isVisible: boolean;
  isLoading: boolean;
  webAppShopList: Array<any> | [];
  onCancel: () => void;
  onOk: (params: any) => void;
};

const { Option } = Select;
const { RangePicker } = DatePicker;

const UpdateProductDataModal: React.FC<UpdateProductDataModalProps> = (
  props: UpdateProductDataModalProps
) => {
  
  const {
    isVisible,
    isLoading,
    webAppShopList,
    onCancel,
    onOk,
  } = props;

  const [defaultShopId] = useState(webAppShopList[0]?.id || 438408);  //Set up default shop
  const [shopIdSelected, setShopIdSelected] = useState(defaultShopId || null);
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  
  const selectShop = (shop_id: any) => {
    setShopIdSelected(shop_id);
  }

  const onClearShop = () => {
    setShopIdSelected(null);
  }

  //handle select date
  const [selectedDateValue, setSelectedDateValue] = useState<any>();

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
    const startDate = convertStartDateToTimestamp(dateStrings[0]);
    setStartDate(startDate);
    const endDate = convertEndDateToTimestamp(dateStrings[1]);
    setEndDate(endDate);

    setSelectedDateValue(dates);
  };
  //end handle select date

  const isDisableGetItemOkButton = () => {
    return !startDate || !endDate;
  }

  const onOkModal = () => {
    const params = {
      shop_id: shopIdSelected,
      update_time_from: startDate,
      update_time_to: endDate
    }
    onOk && onOk(params);
  }

  const onCancelModal = () => {
    onCancel && onCancel();
  };
  

  return (
    <Modal
      width="600px"
      className=""
      visible={isVisible}
      title="Cập nhật dữ liệu từ gian hàng"
      okText="Cập nhật dữ liệu sản phẩm"
      cancelText="Hủy"
      onCancel={onCancelModal}
      onOk={onOkModal}
      okButtonProps={{ disabled: isDisableGetItemOkButton() }}
      maskClosable={false}
      confirmLoading={isLoading}
    >
      <StyledUpdateProductDataModal>
        <div className="select-shop">
          <div className="item-title">Lựa chọn gian hàng <span style={{ color: 'red' }}>*</span></div>
          <div className="select-shop-body">
            <Select
              showSearch
              placeholder="Chọn gian hàng"
              allowClear
              onSelect={(value) => selectShop(value)}
              disabled={false}
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
          </div>
        </div>

        <div>
          <div className="item-title">Thời gian <span style={{ color: 'red' }}>*</span></div>
          <RangePicker
            disabled={isLoading}
            placeholder={["Từ ngày", "Đến ngày"]}
            style={{ width: "100%" }}
            format={DATE_FORMAT.DDMMYYY}
            value={selectedDateValue}
            onChange={onChangeDate}
          />
          <div style={{ marginTop: 10 }}><i>Ghi chú: Thời gian cập nhật sản phẩm</i></div>
        </div>
      </StyledUpdateProductDataModal>
    </Modal>
  );
};

export default UpdateProductDataModal;
