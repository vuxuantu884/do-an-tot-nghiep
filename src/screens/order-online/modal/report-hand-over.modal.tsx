import { Modal, Form, Select, FormInstance, Row, Col } from "antd";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { haveAccess } from "utils/AppUtils";

import { Input } from "antd";
const { TextArea } = Input;

type ReportHandOverModalProps = {
  handleOk: () => void;
  handleCancel: () => void;
  visible: boolean;
  formRef: React.RefObject<FormInstance<any>>;
};
const ReportHandOverModal: React.FC<ReportHandOverModalProps> = (
  props: ReportHandOverModalProps
) => {
  const { handleOk, handleCancel, visible, formRef } = props;

  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  const orderPackContextData = useContext(OrderPackContext);

  const listStores = orderPackContextData.listStores;
  const listThirdPartyLogistics = orderPackContextData.listThirdPartyLogistics;
  const listGoodsReceipts= orderPackContextData.listGoodsReceipts;
  //const setListGoodsReceipts=orderPackContextData.setListGoodsReceipts

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];
    if (listStores && listStores != null) {
      newData = listStores.filter((store) =>
        haveAccess(
          store.id,
          userReducer.account ? userReducer.account.account_stores : []
        )
      );
    }
    return newData;
  }, [listStores, userReducer.account]);

  const testAraay = [
    {
      id: 1,
      name: "long chín",
    },
    {
      id: 2,
      name: "long chín 2",
    },
    {
      id: 3,
      name: "long chín 3",
    },
    {
      id: 4,
      name: "long chín 4",
    },
  ];

  console.log("orderPackContextData", orderPackContextData);
  return (
    <>
      <Modal
        title="Tạo biên bản bàn giao"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form layout="vertical" ref={formRef}>
          <Row gutter={24}>
            <Col md={24}>
              <Form.Item
                label="Cửa hàng"
                name="store_id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn cửa hàng",
                  },
                ]}
              >
                <Select
                  className="select-with-search"
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn cửa hàng"
                  notFoundContent="Không tìm thấy kết quả"
                  onChange={(value?: number) => {
                    console.log(value);
                  }}
                  filterOption={(input, option) => {
                    if (option) {
                      return (
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      );
                    }
                    return false;
                  }}
                >
                  {dataCanAccess.map((item, index) => (
                    <Select.Option key={index.toString()} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col md={24}>
              <Form.Item
                label="Hãng vận chuyển"
                name="hvc"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn hãng vận chuyển",
                  },
                ]}
              >
                <Select
                  className="select-with-search"
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn hãng vận chuyển"
                  notFoundContent="Không tìm thấy kết quả"
                  onChange={(value?: number) => {
                    console.log(value);
                  }}
                  filterOption={(input, option) => {
                    if (option) {
                      return (
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      );
                    }
                    return false;
                  }}
                >
                  {listThirdPartyLogistics.map((item, index) => (
                    <Select.Option key={index.toString()} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col md={24}>
              <Form.Item
                label="Loại biên bản"
                name="receipt_type_id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn loại biên bản",
                  },
                ]}
              >
                <Select
                  className="select-with-search"
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn loại biên bản"
                  notFoundContent="Không tìm thấy kết quả"
                  onChange={(value?: number) => {
                    console.log(value);
                  }}
                  filterOption={(input, option) => {
                    if (option) {
                      return (
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      );
                    }
                    return false;
                  }}
                >
                  {listGoodsReceipts.map((item, index) => (
                    <Select.Option key={index.toString()} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col md={24}>
              <Form.Item
                label="Biên bản sàn"
                name="ecommerce_id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn kiểu biên bản",
                  },
                ]}
              >
                <Select
                  className="select-with-search"
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Chọn kiểu biên bản"
                  notFoundContent="Không tìm thấy kết quả"
                  onChange={(value?: number) => {
                    console.log(value);
                  }}
                  filterOption={(input, option) => {
                    if (option) {
                      return (
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      );
                    }
                    return false;
                  }}
                >
                  {testAraay.map((item, index) => (
                    <Select.Option key={index.toString()} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col md={24}>
              <Form.Item
                label="ID đơn hàng"
                name="codes"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn kiểu biên bản",
                  },
                ]}
              >
                <Select
                  className="select-with-search"
                  showSearch
                  allowClear
                  mode="multiple"
                  style={{ width: "100%" }}
                  placeholder="Chọn ID đơn hàng/ Mã hãng vận chuyển"
                  notFoundContent="Không tìm thấy kết quả"
                  onChange={(value?: number) => {
                    console.log(value);
                  }}
                  filterOption={(input, option) => {
                    if (option) {
                      return (
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      );
                    }
                    return false;
                  }}
                >
                  {testAraay.map((item, index) => (
                    <Select.Option key={index.toString()} value={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>


          <Row gutter={24}>
            <Col md={24}>
              <Form.Item
                label="Mô tả:"
                name="description"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mô tả",
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  className="select-with-search"
                  style={{ width: "100%" }}
                  placeholder="Nhập mô tả"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default ReportHandOverModal;
