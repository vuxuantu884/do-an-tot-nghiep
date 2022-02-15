import React, {useEffect, useState} from "react";
import { useDispatch } from "react-redux";
import { Form, Modal, Select } from "antd";

import {StyledDownloadOrderData, StyledLogisticConfirmModal} from "screens/ecommerce/orders/orderStyles";
import {EcommerceStoreAddress, TimeSlotList} from "../../../../model/ecommerce/ecommerce.model";
import {ConvertUtcToLocalDate} from "../../../../utils/DateUtils";
import {createEcommerceLogistic} from "../../../../domain/actions/ecommerce/ecommerce.actions";
import {OrderResponse} from "../../../../model/response/order/order.response";
import {showError, showSuccess} from "../../../../utils/ToastUtils";

type LogisticConfirmModalProps = {
  visible: boolean;
  ecommerceStoreAddress: Array<EcommerceStoreAddress> | null;
  onOk: (data: any) => void;
  onCancel: () => void;
  OrderDetail: OrderResponse | null;
};

const LogisticConfirmModal: React.FC<LogisticConfirmModalProps> = (
  props: LogisticConfirmModalProps
) => {
  const {visible, onCancel, ecommerceStoreAddress, OrderDetail} = props;
  const dispatch = useDispatch();
  const [storeAddressForm] = Form.useForm();

  const [currentStoreTimeSlot, setCurrentStoreTimeSlot] = useState<Array<TimeSlotList>>([]);
  const [addressSelected, setAddressSelected] = useState<Number>();
  const [pickupTime, setPickupTime] = useState<Number | null>(null);

  const handleConfirmToEcommerce = () => {
    const request = {
      order_sn: OrderDetail?.reference_code,
      shop_id: OrderDetail?.ecommerce_shop_id,
      pickup: {
        address_id: addressSelected,
        pickup_time_id: pickupTime && pickupTime.toString()
      }
    }
    console.log(request)
    dispatch(createEcommerceLogistic(request, (data) => {
      if (data.error === ""){
        showSuccess("Gửi thông tin lấy hàng đến hãng vận chuyển thành công")
        window.location.reload();
      }else {
        showError(data.message)
      }
    }))
    onCancel();
  }

  const handleSelectStore = (id: number) => {
    if(ecommerceStoreAddress){
     const currentStore = ecommerceStoreAddress.find((item) => item.address_id === id);
     if(currentStore && currentStore.time_slot_list.length > 0) {
       setAddressSelected(currentStore.address_id)
       setCurrentStoreTimeSlot(currentStore.time_slot_list);
       storeAddressForm.setFieldsValue({
         picking_time: currentStore.time_slot_list.length > 0 ?
             currentStore.time_slot_list[0].date : "Đơn hàng đang giao hoặc đã bị hủy trên sàn"
       });
     }
    }
  }

  const handleSelectPickupTime = (value: any) => {
    setPickupTime(value)
  }

  useEffect(() => {
    if (ecommerceStoreAddress){
      const defaultStore = ecommerceStoreAddress.find((item: EcommerceStoreAddress) => {
        const flags = item.address_flag;
        return flags.find(i => i === "default_address")
      })
      if (defaultStore) {
        setCurrentStoreTimeSlot(defaultStore.time_slot_list);
        setAddressSelected(defaultStore.address_id);
        if(defaultStore.time_slot_list.length > 0) setPickupTime(defaultStore.time_slot_list[0].date);
        storeAddressForm.setFieldsValue({
          address: defaultStore.address_id,
          picking_time: defaultStore.time_slot_list.length > 0 ?
              defaultStore.time_slot_list[0].date : "Đơn hàng đang giao hoặc đã bị hủy trên sàn"
        });
      }
    }
  },[ecommerceStoreAddress, storeAddressForm])
  
  return (
      <StyledLogisticConfirmModal>
        <Modal
            width="600px"
            title="Chuẩn bị hàng"
            okText="Xác nhận"
            cancelText="Hủy"
            onCancel={onCancel}
            onOk={handleConfirmToEcommerce}
            visible={visible}
            maskClosable={false}
            centered
        >
          <StyledDownloadOrderData>
            <Form layout="vertical"
            form={storeAddressForm}
            >
              <Form.Item
              label="Ngày bàn giao"
              name="picking_time"
              >
                <Select
                    placeholder="Chọn ngày bàn giao"
                    allowClear
                    onSelect={(value) => handleSelectPickupTime(value)}
                    // disabled={isLoading}
                >
                  {currentStoreTimeSlot.length > 0 &&
                      currentStoreTimeSlot.map((item, index) =>
                          <Select.Option key={index} value={item.date}>
                            {ConvertUtcToLocalDate(item.date*1000)}
                          </Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item
              label="Địa chỉ lấy hàng"
              name="address"
              >
                <Select
                    placeholder="Chọn địa chỉ lấy hàng"
                    allowClear
                    onSelect={(value: number) => handleSelectStore(value)}
                    // disabled={isLoading}
                >
                  {ecommerceStoreAddress && ecommerceStoreAddress?.map((item) => (
                      <Select.Option key={item.address_id} value={item.address_id}>
                        <span>{item.address}</span>
                      </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </StyledDownloadOrderData>
        </Modal>
      </StyledLogisticConfirmModal>
  );
};

export default LogisticConfirmModal;
