import React, { useCallback, useEffect, useState } from "react";
import {
  Form,
  Col,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  DatePicker,
  AutoComplete,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Option } from "rc-select";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { Table } from "antd";
import { OrderLineItemRequest } from "model/request/order.request";

type InventoryModalProps = {
  isModalVisible: boolean;
  columnsItem?: Array<OrderLineItemRequest>;
  handleOk: () => void;
  handleCancel: () => void;
};

const InventoryModal: React.FC<InventoryModalProps> = (
  props: InventoryModalProps
) => {
  const { isModalVisible, columnsItem, handleOk, handleCancel } = props;

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
          <AutoComplete
            id="search_customer"
            dropdownClassName="search-layout-customer dropdown-search-header"
            dropdownMatchSelectWidth={456}
            style={{ width: "100%" }}
          >
            <Input
              placeholder="Tìm kiếm kho"
              prefix={<SearchOutlined style={{ color: "#878790" }} />}
            />
          </AutoComplete>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col md={24}>
          <div className="overflow-table">
            <table className="rules">
              <thead>
                <tr>
                  <th className="condition">Sản phẩm</th>
                  {
                    columnsItem?.map((data, index) => (
                      <th className="condition" key={index}>{data.variant}</th>
                    ))
                  }
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="condition">
                    Số điểm có thẻ tiêu không quá ... giá trị hóa đơn
                  </td>
                  <td className="condition" key={1}>
                    1
                  </td>
                  <td className="condition" key={2}>
                    2
                  </td>
                  <td className="condition" key={3}>
                    3
                  </td>
                  <td className="condition" key={4}>
                    4
                  </td>
                  {/* {
                          rules.map((rule, index) => (
                            <td className="condition" key={index}>
                              <CurrencyInput
                                position="before"
                                currency={['%']}
                                value={rule.limit_order_percent}
                                onChangeCurrencyType={(value) => handleChangePointUseType(value, index)}
                                onChange={(value) => handleChangePointUse(value, index)}
                              />
                            </td>
                          ))
                        } */}
                </tr>
                <tr>
                  <td className="condition">
                    Không được tiêu điểm cho đơn hàng có chiết khấu{" "}
                  </td>
                  <td className="condition" key={1}>
                    1
                  </td>
                  <td className="condition" key={2}>
                    2
                  </td>
                  <td className="condition" key={3}>
                    3
                  </td>
                  <td className="condition" key={4}>
                    4
                  </td>
                  {/* {
                          rules.map((rule, index) => (
                            <td className="condition checkbox" key={index}>
                              <Checkbox
                                defaultChecked={rule.block_order_have_discount}
                                onChange={(e) => onChangePreventDiscountOrder(e.target.checked, index)}
                              />
                            </td>
                          ))
                        } */}
                </tr>
              </tbody>
            </table>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default InventoryModal;
