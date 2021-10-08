import {
  Button,
  Row,
  Space,
  Col,
  Select,
  Form,
  Input,
  Typography,
  Table,
} from "antd";
import scanbarcode from "assets/img/scanbarcode.svg";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { getFulfillments } from "domain/actions/order/order.action";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderResponse } from "model/response/order/order.response";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { haveAccess } from "utils/AppUtils";

const PackInfo: React.FC = () => {
  const dispatch = useDispatch();
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [orderResponse, setOrderResponse]= useState<OrderResponse|null>();

  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

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

  useLayoutEffect(() => {
    dispatch(StoreGetListAction(setListStores));
  }, [dispatch]);

  const onKeyupOrder=useCallback((value:string) => {
      if(value.trim())
      {
        dispatch(getFulfillments(value, setOrderResponse));

      }
  },[dispatch]);

  return (
    <Form layout="vertical">
      <div style={{ padding: "24px 24px 0 24px" }}>
        <Row gutter={24}>
          <Col md={8}>
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
                // allowClear
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

          <Col md={8}>
            <Form.Item
              label="ID đơn hàng:"
              name="order_id"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mã đơn hàng hoặc mã đơn giao",
                },
              ]}
            >
              <Input
                className="select-with-search"
                style={{ width: "100%" }}
                placeholder="ID đơn hàng/ Mã đơn giao"
                addonAfter={<AiOutlinePlusCircle />}
                onChange={(value:string) => {
                  console.log(value);
                }}
              />
            </Form.Item>
          </Col>

          <Col md={8}>
            <Form.Item label="Sản phẩm:">
              <Input.Group
                compact
                className="select-with-search"
                style={{ width: "100%" }}
              >
                <Input style={{ width: "50%" }} placeholder="mã sản phẩm" />
                <Input
                  style={{ width: "50%" }}
                  placeholder="số lượng"
                  addonAfter={<AiOutlinePlusCircle />}
                />
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row
          align="middle"
          justify="space-between"
          style={{ height: "40px", borderTop: "1px solid #E5E5E5" }}
        >
          <Col md={7}>
            <Space>
              <span className="customer-detail-text">
                <strong>Đơn hàng:</strong>
                <Typography.Text
                  type="success"
                  style={{
                    color: "#FCAF17",
                    marginLeft: "5px",
                  }}
                >
                  12332443535
                </Typography.Text>
              </span>
            </Space>
          </Col>

          <Col md={7}>
            <Space>
              <span className="customer-detail-text">
                <strong>Hãng vận chuyển:</strong>
                <Typography.Text
                  type="success"
                  style={{
                    color: "#FCAF17",
                    marginLeft: "5px",
                  }}
                >
                  12332443535
                </Typography.Text>
              </span>
            </Space>
          </Col>

          <Col md={10}>
            <Space>
              <span className="customer-detail-text">
                <strong>Khách hàng: </strong>
                <Typography.Text
                  type="success"
                  style={{
                    color: "#FCAF17",
                    marginLeft: "5px",
                  }}
                >
                  12332443535
                </Typography.Text>
              </span>
            </Space>
          </Col>
        </Row>
      </div>
      {/* <div style={{ padding: "10px 0 24px 0" }}>
        <Row className="sale-product-box" justify="space-between">
          <Table
            locale={{
              emptyText: (
                <Button
                  type="text"
                  className="font-weight-500"
                  style={{
                    color: "#2A2A86",
                    background: "rgba(42,42,134,0.05)",
                    borderRadius: 5,
                    padding: 8,
                    height: "auto",
                    marginTop: 15,
                    marginBottom: 15,
                  }}
                >
                  Thêm sản phẩm ngay (F3)
                </Button>
              ),
            }}
            rowKey={(record) => record.id}
            columns={columns}
            dataSource={props.OrderDetail?.items.filter(
              (item) => item.type === Type.NORMAL
            )}
            className="sale-product-box-table2 w-100"
            tableLayout="fixed"
            pagination={false}
          />
        </Row>
      </div> */}
    </Form>
  );
};

export default PackInfo;
