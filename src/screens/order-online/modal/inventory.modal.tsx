import {Col, Input, Modal, Radio, Row} from "antd";
import {StoreResponse} from "model/core/store.model";
import {InventoryResponse} from "model/inventory";
import {OrderLineItemRequest} from "model/request/order.request";
import React, {useCallback, useEffect, useMemo, useState} from "react";

type InventoryModalProps = {
  isModalVisible: boolean;
  setInventoryModalVisible: (item: boolean) => void;
  storeId: number | null;
  setStoreId: (item: number) => void;
  columnsItem?: Array<OrderLineItemRequest>;
  inventoryArray: Array<InventoryResponse> | null;
  setResultSearchStore: any;
  dataSearchCanAccess: Array<StoreResponse> | null;
  handleCancel: () => void;
};

const pitority = {
  ware_house: 2,
  store: 1,
  distribution_center: 1,
  stockpile: 1,
};

interface InventoryStore {
  id: number,
  name: string,
  pitority: number,
  data: any,
}

const InventoryModal: React.FC<InventoryModalProps> = (props: InventoryModalProps) => {
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
  } = props;

  // const [changeStoreItem, sethangeStoreItem] = useState<number | null>(null);
  // const inventoryData:any=[];
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const setAllAvailable = (variantId: number) => {
    let inventoryInt = 0;
    if (inventoryArray && inventoryArray.length) {
      let newData: Array<InventoryResponse> = [];
      newData = inventoryArray.filter((store) => store.variant_id === variantId);
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
    setSelectedStoreId(e.target.value);
  };

  const onSearchInventory = useCallback(
    (value) => {
      setResultSearchStore(value);
    },
    [setResultSearchStore]
  );

  const handleOk = useCallback(() => {
    if (selectedStoreId) {
      setStoreId(selectedStoreId);
    }
    setInventoryModalVisible(false);
  }, [selectedStoreId, setInventoryModalVisible, setStoreId]);

  const data = useMemo(() => {
    let stores: Array<InventoryStore> = [];
    dataSearchCanAccess?.forEach((value, index) => {
      let store: InventoryStore = {
        id: value.id,
        name: value.name,
        pitority: value.type === "ware_house" ? pitority.ware_house : 1,
        data: {},
      };

      columnsItem?.forEach((value1) => {
        let inventory = inventoryArray?.find((value2) => value1.variant_id === value2.variant_id && value.id === value2.store_id);
        store.data[value1.variant_id.toString()] =  inventory && inventory.available ? inventory.available : 0
      });
      stores.push(store);
    });
    stores.sort((a, b) => {
      let item1 = 0;
      let item2 = 0;
      let totalAvaiable1= 0;
      let totalAvaiable2 = 0;
      columnsItem?.forEach((value) => {
        if(a.data[value.variant_id.toString()] > value.quantity) {
          item1++;
        }
        if(b.data[value.variant_id.toString()] > value.quantity) {
          item2++;
        }
      });
      
      Object.keys(a.data).forEach((key) => {
        totalAvaiable1 = totalAvaiable1 + a.data[key];
      })
      Object.keys(b.data).forEach((key) => {
        totalAvaiable2 = totalAvaiable2 + b.data[key];
      })
      if(item1 === columnsItem?.length && item2 === columnsItem?.length) {
        if(a.pitority >= b.pitority) {
          return totalAvaiable2 - totalAvaiable1;
        } else {
          return b.pitority - a.pitority;
        }
      }
      if(totalAvaiable1 !== totalAvaiable2) {
        return totalAvaiable2 - totalAvaiable1;
      }
      return item2 - item1;
    })
    return stores; 
  }, [columnsItem, dataSearchCanAccess, inventoryArray]);

  useEffect(() => {
    if (storeId) setSelectedStoreId(storeId);
  }, [storeId]);

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
            <Radio.Group
              onChange={onChange}
              value={selectedStoreId}
              style={{width: "100%"}}
            >
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
                      <td className="condition" key={index}>{data.quantity}</td>
                    ))}
                  </tr>
                </tbody>
                <thead>
                  <tr>
                    <th className="condition">Tổng có thế bán</th>
                    {columnsItem?.map((data, index) => (
                      <th className="condition" key={index}>{setAllAvailable(data.variant_id)}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data?.map((item, index) => (
                    <tr key={index}>
                      <th className="condition" key={index}>
                        {/* <Checkbox
                                  defaultChecked={false}
                                  onChange={(e) => onChangePreventIndex(e.target.checked, index)}
                                /> {data.name} */}
                        <Radio value={item.id}>{item.name}</Radio>
                      </th>
                      {Object.keys(item.data).map((key: any) => (
                        <td className="condition" key={key}>
                          {item.data[key]}
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
