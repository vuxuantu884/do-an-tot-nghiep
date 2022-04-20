import { Modal, Select } from 'antd';
import React, { useState, useEffect  } from 'react';
export interface PreparationShopeeProductModalProps {
    title: string;
    visible: boolean;
    onOk: any;
    onCancel: any;
    okText: string;
    cancelText: string;
    referenceCodeByShopAddress: Array<any>
    ecommerceShopAddress: Array<any>;
    ecommerceShopListByAddress: Array<any>;
    listShopOrderList: any;
    setListShopOrderList: (item: any) => any;
    listShopPickUpAddress: any;
    setListShopPickUpAddress: (item: any) => any;
}

function PreparationShopeeProductModal (props: PreparationShopeeProductModalProps) {

  const {
    title,
    visible,
    onOk,
    onCancel,
    okText,
    cancelText,
    referenceCodeByShopAddress,
    ecommerceShopAddress,
    ecommerceShopListByAddress,
    listShopOrderList,
    setListShopOrderList,
    listShopPickUpAddress,
    setListShopPickUpAddress,

  } = props
  

  const { Option } = Select

  const [checkStoreAddress, setCheckStoreAddress] = useState(true);
  
  const handleGetEcommerceShopAddress = (value: number) => {
    setCheckStoreAddress(false)

    // eslint-disable-next-line array-callback-return
      ecommerceShopAddress.forEach(item => {
        const date = new Date();
        const timestamp = date.setHours(24, 0, 0, 0) / 1000;
        const pickTime = timestamp + 57600;
  
        const newListShopPickUpAddress = 
        listShopPickUpAddress?.filter((shopPick: any) => shopPick.shop_id !== item.shop_id)
  
        const newListShopOrderList =
        listShopOrderList?.filter((shopOrderList: any) => shopOrderList.shop_id !== item.shop_id)
        
        // eslint-disable-next-line array-callback-return
        item.store_addresses.map((store: any) => {
          if (store.address_id === value) {
            setListShopPickUpAddress(
              [
                ...newListShopPickUpAddress,
                {
                  shop_id: item.shop_id,
                  pickup_address: {
                    address_id: value,
                    pickup_time_id: pickTime,
                  }
                }
              ]
            )

            // eslint-disable-next-line array-callback-return
            referenceCodeByShopAddress.map(order => {
              if (order.shop_id === item.shop_id) {
                setListShopOrderList(
                  [
                    ...newListShopOrderList,
                    {
                      order_list: order.order_list,
                      shop_id: order.shop_id,
                      address_id: value,
                      pickup_time_id: pickTime,
                    }
                  ]
                )
              }
            })
          }
        })
      })
  }

  useEffect(() => {
    ecommerceShopAddress.length 
    && ecommerceShopAddress.map(item => item.store_addresses === null && setCheckStoreAddress(true))
  }, [ecommerceShopAddress]);

  const handleClearValueShopAddress = () => {
    setCheckStoreAddress(true)
  }

  return (
    <Modal
       title={title}
       visible={visible}
       onOk={onOk}
       onCancel={onCancel}
       okText={okText}
       cancelText={cancelText}
       okButtonProps={{ disabled: checkStoreAddress }}
    >
      {
       ecommerceShopAddress.length && ecommerceShopAddress?.map((shop) => (
        <div key={shop.address_id}>
         <div style={{ display: "flex", alignItems: "center" }}>
          <p style={{ margin: 0 }}>Địa chỉ lấy hàng:</p>
          <span style={{ fontWeight: 600, paddingLeft: 6 }}>
              {
              ecommerceShopListByAddress.map((list) => 
                list.id === shop.shop_id 
                && `Gian hàng ${list.name.toUpperCase()}`
              )}
            </span>
         </div>
         {
           shop.store_addresses !== null
           ? 
           <Select
           allowClear
           key={shop.id}
           style={{ width: "100%", margin: "6px 0 12px 0" }}
           placeholder="Chọn địa chỉ lấy hàng"
           onSelect={(value: number) => handleGetEcommerceShopAddress(value)}
           onClear={handleClearValueShopAddress}
           >
             {shop.store_addresses.map((shop: any) => (
               <Option
                 key={shop.address_id}
                 value={shop.address_id}
             >
               <span>{shop.address}</span>
             </Option>
             ))}
           </Select>
            :
            <div className="store-address-empty">
              <Select
                  allowClear
                  key={shop.id}
                  style={{ width: "100%", padding: "10px 0 6px 0" }}
                  placeholder="Chọn địa chỉ lấy hàng"
                  onClear={handleClearValueShopAddress}
              >
                Trống
              </Select>
              <span style={{ color: "#E24343" }}>{shop.error_message}</span>
            </div> 
         }
        </div>
       ))
      }
    </Modal>
  );
}

export default PreparationShopeeProductModal
