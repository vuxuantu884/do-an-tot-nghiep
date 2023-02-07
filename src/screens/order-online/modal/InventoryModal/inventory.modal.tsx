import { Button, Col, Input, Modal, Radio, Row } from "antd";
import { StoreResponse } from "model/core/store.model";
import { InventoryResponse } from "model/inventory";
import { OrderLineItemRequest } from "model/request/order.request";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { STORE_TYPE } from "utils/Constants";
import { dangerColor, grayF5Color, successColor } from "utils/global-styles/variables";
import { StyledComponent } from "./inventory.modal.styles";
import "./inventory.modal.scss";
import { fullTextSearch } from "utils/StringUtils";
import { SearchOutlined } from "@ant-design/icons";

type InventoryModalProps = {
  isModalVisible: boolean;
  setInventoryModalVisible: (item: boolean) => void;
  storeId: number | null;
  onChangeStore: (item: number) => void;
  columnsItem?: Array<OrderLineItemRequest>;
  inventoryArray: Array<InventoryResponse> | null;
  storeArrayResponse: Array<StoreResponse> | null;
  handleCancel: () => void;
};

const priority = {
  ware_house: 2,
  store: 1,
  distribution_center: 1,
  stockpile: 1,
};

interface InventoryStore {
  id: number;
  name: string;
  priority: number;
  data: any;
}

const InventoryModal: React.FC<InventoryModalProps> = (props: InventoryModalProps) => {
  const {
    isModalVisible,
    columnsItem,
    inventoryArray,
    storeArrayResponse,
    storeId,
    onChangeStore,
    setInventoryModalVisible,
    handleCancel,
  } = props;

  const rowHeight = 45;

  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [storeData, setStoreData] = useState<StoreResponse[] | null>(null);

  const [rowProductHeight, setRowProductHeight] = useState(rowHeight);

  const setAllAvailable = (variantId: number) => {
    let inventoryInt = 0;
    if (inventoryArray && inventoryArray.length) {
      data.forEach(function (item) {
        inventoryInt += item.data[variantId];
      });
    }
    return inventoryInt === null ? 0 : inventoryInt;
  };

  const onChange = (e: any) => {
    setSelectedStoreId(e.target.value);
  };

  const onSearchInventory = useCallback(
    (value: string) => {
      let _item: StoreResponse[] | any = storeArrayResponse?.filter((x) =>
        fullTextSearch(value.toLowerCase().trim(), x.name.toLowerCase()),
      );
      setStoreData(_item);
    },
    [storeArrayResponse],
  );

  const data = useMemo(() => {
    let stores: Array<InventoryStore> = [];
    if (!storeData) return stores;
    let validStore = storeData.filter(
      (store) =>
        store.type.toLocaleLowerCase() !== STORE_TYPE.DISTRIBUTION_CENTER &&
        store.type.toLocaleLowerCase() !== STORE_TYPE.STOCKPILE,
    );

    validStore?.forEach((value, index) => {
      let store: InventoryStore = {
        id: value.id,
        name: value.name,
        priority: value.type === "ware_house" ? priority.ware_house : 1,
        data: {},
      };

      columnsItem?.forEach((value1) => {
        let inventory = inventoryArray?.find(
          (value2) => value1.variant_id === value2.variant_id && value.id === value2.store_id,
        );
        store.data[value1.variant_id.toString()] =
          inventory && inventory.available ? inventory.available : 0;
      });
      stores.push(store);
    });

    stores.sort((a, b) => {
      let item1 = 0;
      let item2 = 0;
      columnsItem?.forEach((value) => {
        if (a.data[value.variant_id.toString()] >= value.quantity) {
          item1++;
        }
        if (b.data[value.variant_id.toString()] >= value.quantity) {
          item2++;
        }

        if (a.data[value.variant_id.toString()] >= 0) {
          item1++;
        }
        if (b.data[value.variant_id.toString()] >= 0) {
          item2++;
        }
      });
      return item2 - item1;
    });
    return stores;
  }, [columnsItem, storeData, inventoryArray]);

  useEffect(() => {
    if (storeId) setSelectedStoreId(storeId);
  }, [storeId]);

  useEffect(() => {
    if (storeArrayResponse) setStoreData(storeArrayResponse);
  }, [storeArrayResponse]);

  const element = document.getElementById("stickyRowProduct");

  useEffect(() => {
    setRowProductHeight(
      element?.clientHeight && element?.clientHeight > rowHeight
        ? element?.clientHeight
        : rowHeight,
    );
  }, [element]);

  return (
    <Modal
      title={
        <div className="customer-title">
          <span className="title">Kiểm tra thông tin tồn kho</span>
          <Input
            placeholder="Tìm kiếm kho"
            allowClear
            onChange={(tg) => {
              onSearchInventory(tg.target.value);
            }}
            className="input-search"
            suffix={<SearchOutlined />}
          />
        </div>
      }
      visible={isModalVisible}
      centered
      okText="Chọn kho"
      cancelText="Thoát"
      width={900}
      onCancel={handleCancel}
      className="inventory-modal"
      closable={false}
      okButtonProps={{ hidden: true }}
    >
      <StyledComponent>
        <Row gutter={24} className="margin-top-10">
          <Col md={24}>
            <div className="overflow-table">
              <Radio.Group onChange={onChange} value={selectedStoreId} style={{ width: "100%" }}>
                <table className="rules">
                  <thead
                    id="stickyRowProduct"
                    style={{ top: -1, background: grayF5Color }}
                    className="tableElementSticky"
                  >
                    <tr>
                      <th className="condition">Sản phẩm</th>
                      {columnsItem?.map((data, index) => (
                        <th className="condition" key={index}>
                          {data.variant}
                        </th>
                      ))}
                      <th className="condition-button"></th>
                    </tr>
                  </thead>
                  <tbody
                    style={{ top: rowProductHeight - 5, background: "white" }}
                    id="stickyRowCustomer"
                    className="tableElementSticky"
                  >
                    <tr>
                      <td className="condition">Khách đặt</td>
                      {columnsItem?.map((data, index) => (
                        <td className="condition" key={index}>
                          {data.quantity}
                        </td>
                      ))}
                      <td className="condition-button"></td>
                    </tr>
                  </tbody>
                  <thead
                    style={{
                      top: rowProductHeight - 8 + rowHeight,
                      background: grayF5Color,
                    }}
                    className="tableElementSticky"
                  >
                    <tr>
                      <th className="condition">Tổng có thế bán</th>
                      {columnsItem?.map((data, index) => (
                        <th className="condition" key={index}>
                          {setAllAvailable(data.variant_id)}
                        </th>
                      ))}
                      <th className="condition-button"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {data?.map((item, index) => (
                      <tr key={index}>
                        <th
                          className={storeId === item.id ? "condition active" : "condition"}
                          key={index}
                        >
                          {item.name}
                        </th>

                        {columnsItem?.map((_itemi, index) => (
                          <td
                            className="condition"
                            key={_itemi.variant_id}
                            style={
                              item.data[_itemi.variant_id] <= 0 ||
                              item.data[_itemi.variant_id] < _itemi.quantity
                                ? { color: dangerColor }
                                : { color: successColor }
                            }
                          >
                            {item.data[_itemi.variant_id]}
                          </td>
                        ))}
                        <td className="condition-button">
                          <Button
                            size="small"
                            type="primary"
                            ghost
                            onClick={() => {
                              if (item.id) onChangeStore(item.id);
                              setInventoryModalVisible(false);
                            }}
                            disabled={storeId === item.id}
                          >
                            Chọn kho
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Radio.Group>
            </div>
          </Col>
        </Row>
      </StyledComponent>
    </Modal>
  );
};

export default InventoryModal;
