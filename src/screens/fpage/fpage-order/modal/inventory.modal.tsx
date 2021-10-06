import React, { useCallback, useEffect, useState } from "react";
import { Col, Input, Modal, Row, Radio } from "antd";
import { OrderLineItemRequest } from "model/request/order.request";
import { StoreResponse } from "model/core/store.model";
import { InventoryResponse } from "model/inventory";

type InventoryModalProps = {
  isModalVisible: boolean;
  setInventoryModalVisible:(item:boolean)=>void;
  storeId: number | null;
  setStoreId: (item: number) => void;
  columnsItem?: Array<OrderLineItemRequest>;
  inventoryArray: Array<InventoryResponse> | null;
  setResultSearchStore: any;
  dataSearchCanAccess: Array<StoreResponse> | null;
  handleCancel: () => void;
  setStoreForm:(id:number|null)=>void
};

const InventoryModal: React.FC<InventoryModalProps> = (
  props: InventoryModalProps
) => {
  const {
    isModalVisible,
    columnsItem,
    inventoryArray,
    setResultSearchStore,
    dataSearchCanAccess,
    storeId,
    setStoreId,
    setInventoryModalVisible,
    handleCancel,
    setStoreForm
  } = props;

  const [changeStoreItem, sethangeStoreItem] = useState<number | null>(null);
  const setAvailable = (storeId: number, variantId: number) => {
    let inventoryInt = null;
    if (inventoryArray && inventoryArray.length) {
      let inventory = inventoryArray.find(
        (x: any) => x.store_id === storeId && x.variant_id === variantId
      );
      inventoryInt =
        inventory === undefined || inventory === null ? 0 : inventory.available;
    }
    return inventoryInt === null ? 0 : inventoryInt;
  };

  const setAllAvailable = (variantId: number) => {
    let inventoryInt = 0;
    if (inventoryArray && inventoryArray.length) {
      let newData: Array<InventoryResponse> = [];
      newData = inventoryArray.filter((store) => store.variant_id===variantId);
      newData.forEach(function (value) {
        if (value.variant_id === variantId)
          inventoryInt +=
            value?.available === undefined || value?.available === null
              ? 0
              : value?.available;
      });
    }
    return inventoryInt === null ? 0 : inventoryInt;
  };

  const onChange = (e: any) => {
    sethangeStoreItem(e.target.value);
  };

  useEffect(() => {
    if (storeId) sethangeStoreItem(storeId);
  }, [storeId]);

  const onSearchInventory = useCallback(
    (value) => {
      setResultSearchStore(value);
    },
    [setResultSearchStore]
  );

  const handleOk = useCallback(() => {
    if (changeStoreItem) {
      setStoreId(changeStoreItem);
      setStoreForm(changeStoreItem);
      setInventoryModalVisible(false)
    }
  }, [setStoreId,changeStoreItem,setInventoryModalVisible,setStoreForm]);

  return (
    <Modal
      title="Check thông tin tồn kho"
      visible={isModalVisible}
      centered
      okText="Chọn kho"
      cancelText="Thoát"
      width={900}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Row gutter={24}>
        <Col md={12}>
          <Input.Search
            placeholder="Tìm kiếm kho"
            allowClear
            onSearch={onSearchInventory}
          />
        </Col>
      </Row>
      <Row gutter={24} className="margin-top-10">
        <Col md={24}>
          <div className="overflow-table">
            <Radio.Group onChange={onChange} value={changeStoreItem}  style={{ width: "100%" }}> 
              <table className="rules">
                <thead>
                  <tr>
                    <th className="condition">Sản phẩm</th>
                    {columnsItem?.map((data, index) => (
                      <th className="condition" key={index}>{data.variant}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="condition">Khách đặt</td>
                    {columnsItem?.map((data, index) => (
                      <td className="condition"  key={index}>{data.quantity}</td>
                    ))}
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th className="condition">Tổng có thế bán</th>
                    {columnsItem?.map((data, index) => (
                      <th className="condition" key={index}>
                        {setAllAvailable(data.variant_id)}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {dataSearchCanAccess?.map((data, index) => (
                    <tr  key={index}>
                      <th className="condition">
                        {/* <Checkbox
                                  defaultChecked={false}
                                  onChange={(e) => onChangePreventIndex(e.target.checked, index)}
                                /> {data.name} */}
                        <Radio value={data.id}>{data.name}</Radio>
                      </th>
                      {columnsItem?.map((dataI, index) => (
                        <td className="condition" key={index}>
                          {setAvailable(data.id, dataI.variant_id)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Radio.Group>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default InventoryModal;
