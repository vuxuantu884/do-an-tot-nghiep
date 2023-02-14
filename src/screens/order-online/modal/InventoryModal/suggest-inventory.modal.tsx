import { SearchOutlined } from "@ant-design/icons";
import { Button, Col, Input, Modal, Radio, Row, Spin } from "antd";
import { StoreResponse } from "model/core/store.model";
import { OrderLineItemRequest } from "model/request/order.request";
import React, { useCallback, useEffect, useState } from "react";
import { dangerColor, grayF5Color, successColor } from "utils/global-styles/variables";
import { StyledComponent } from "./inventory.modal.styles";
import "./inventory.modal.scss";
import { fullTextSearch } from "utils/StringUtils";

type SuggestInventoryModalProps = {
  visible: boolean;
  setVisible: (item: boolean) => void;
  storeId: number | null;
  onChangeStore: (item: number) => void;
  columnsItem?: Array<OrderLineItemRequest>;
  inventoryArray: Array<any> | null;
  storeArrayResponse: Array<StoreResponse> | null;
  handleCancel: () => void;
  isLoading?: boolean;
};

const SuggestInventoryModal: React.FC<SuggestInventoryModalProps> = (
  props: SuggestInventoryModalProps,
) => {
  const { visible, columnsItem, inventoryArray, storeId, onChangeStore, setVisible, handleCancel } =
    props;

  const rowHeight = 45;

  const [storeData, setStoreData] = useState<any[] | null>([]);

  const [rowProductHeight, setRowProductHeight] = useState(rowHeight);

  const setAllAvailable = (variantId: number) => {
    let inventoryInt = 0;
    if (inventoryArray && inventoryArray.length) {
      inventoryArray.forEach((item) => {
        const variant = item.variant_inventories.find((i: any) => i.variant_id === variantId);
        variant && (inventoryInt += variant.available);
      });
    }
    return inventoryInt === null ? 0 : inventoryInt;
  };

  const onSearchInventory = useCallback(
    (value: string) => {
      let _item: StoreResponse[] | any = inventoryArray?.filter((x) =>
        fullTextSearch(value.toLowerCase().trim(), x.store.toLowerCase()),
      );
      setStoreData(_item);
    },
    [inventoryArray],
  );

  useEffect(() => {
    setStoreData(inventoryArray);
  }, [inventoryArray, storeId]);

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
            disabled={props.isLoading}
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
      visible={visible}
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
        <Spin spinning={props.isLoading} tip="đang tải dữ liệu ...">
          <Row gutter={24} className="margin-top-10">
            <Col md={24}>
              <div className="overflow-table">
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
                    {storeData?.map((item, index) => (
                      <tr key={index}>
                        <th
                          className={storeId === item.store_id ? "condition active" : "condition"}
                          key={index}
                        >
                          {item.store}{" "}
                          <span style={{ color: dangerColor }}>
                            {index === 0 ? " - Kho gợi ý" : ""}
                          </span>
                        </th>

                        {columnsItem?.map((_itemi, index) => {
                          let variantDetails = item.variant_inventories.find(
                            (i: any) => i.variant_id === _itemi.variant_id,
                          );
                          if (!variantDetails || !variantDetails.available) {
                            variantDetails = {
                              ...variantDetails,
                              available: 0,
                            };
                          }
                          return (
                            <td
                              className="condition"
                              key={_itemi.variant_id}
                              style={
                                variantDetails.available < _itemi.quantity
                                  ? { color: dangerColor }
                                  : { color: successColor }
                              }
                            >
                              {variantDetails.available}
                            </td>
                          );
                        })}
                        <td className="condition-button">
                          <Button
                            size="small"
                            type="primary"
                            ghost
                            onClick={() => {
                              if (item.store_id) onChangeStore(item.store_id);
                              setVisible(false);
                            }}
                            disabled={storeId === item.store_id}
                          >
                            Chọn kho
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        </Spin>
      </StyledComponent>
    </Modal>
  );
};

export default SuggestInventoryModal;
