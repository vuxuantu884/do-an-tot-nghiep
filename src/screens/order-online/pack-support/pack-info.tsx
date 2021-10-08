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
  Tooltip,
  FormInstance,
} from "antd";
import scanbarcode from "assets/img/scanbarcode.svg";
import { Type } from "config/type.config";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { getFulfillments } from "domain/actions/order/order.action";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderLineItemResponse, OrderProductListModel } from "model/response/order/order.response";
import {
  createRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { formatCurrency, getTotalQuantity, haveAccess } from "utils/AppUtils";
import giftIcon from "assets/icon/gift.svg";
import { color } from "html2canvas/dist/types/css/types/color";
import { showError } from "utils/ToastUtils";

const PackInfo: React.FC = () => {
  const dispatch = useDispatch();

  //form
  const formRef = createRef<FormInstance>();
  const [form] = Form.useForm();

  //useState
  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [orderResponse, setOrderResponse] = useState<Array<any>>([]);
  const [orderList, setOrderList] = useState<Array<any>>([]);

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

  //event
  const onKeyupOrder = useCallback(
    (value: string) => {
      if (value.trim()) {
        formRef.current?.validateFields(["store_request"]);
        if (formRef.current?.getFieldValue(["store_request"]))
          dispatch(getFulfillments(value, setOrderResponse));
      }
    },
    [dispatch, formRef]
  );

  const onKeyupProduct = useCallback(
    (value: string) => {
      if (value.trim()) {
        formRef.current?.validateFields(["store_request"]);
        formRef.current?.validateFields(["order_request"]);
        formRef.current?.validateFields(["quality_request"]);

        let store_request = formRef.current?.getFieldValue(["store_request"]);
        let order_request = formRef.current?.getFieldValue(["order_request"]);
        let quality_request = formRef.current?.getFieldValue([
          "quality_request",
        ]);
        let product_request = formRef.current?.getFieldValue([
          "product_request",
        ]);

        if (
          store_request &&
          order_request &&
          quality_request &&
          product_request
        ) {
          let indexPack = orderList.findIndex((p) => p.sku === value);
          if (indexPack !== -1) {
            orderList[indexPack].pick = quality_request;
            if (quality_request == orderList[indexPack].quantity)
              orderList[indexPack].color = "#27AE60";
            else
              orderList[indexPack].color = "#E24343";
            setOrderList([...orderList]);
          } else {
            showError("Máy chủ bận")
          }
          console.log(`ok luôn ${product_request}`);
        } else {
          console.log("false luôn");
        }
      }
    },
    [formRef, orderList]
  );
  //event

  //useEffect
  useEffect(() => {
    if (orderResponse) {
      let item: any[] = [];
      orderResponse.forEach(function (value: any) {
        value.items.forEach(function (i: any) {
          item.push({ ...i, pick: 0, color: "#E24343" });
        });
      });
      console.log(item);
      setOrderList(item);
    }
  }, [orderResponse]);

  const Finish = useCallback(() => {}, [formRef]);
  //useEffect

  const SttColumn = {
    title: () => (
      <div className="text-center">
        <div style={{ textAlign: "left" }}>STT</div>
      </div>
    ),
    className: "yody-pos-quantity text-center",
    width: "3%",
    render: (l: any, item: any, index: number) => {
      return <div className="yody-pos-qtt">{index + 1}</div>;
    },
  };

  const ProductColumn = {
    title: () => (
      <div className="text-center">
        <div style={{ textAlign: "left" }}>Sản phẩm</div>
      </div>
    ),
    width: "30%",
    className: "yody-pos-name",
    render: (l: any, item: any, index: number) => {
      return (
        <div
          className="w-100"
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="d-flex align-items-center">
            <div style={{ width: "calc(100% - 32px)", float: "left" }}>
              <div className="yody-pos-sku">
                <Typography.Link style={{ color: "#2A2A86" }}>
                  {l.sku}
                </Typography.Link>
              </div>
              <div className="yody-pos-varian">
                <Tooltip title={l.variant} className="yody-pos-varian-name">
                  <span>{l.variant}</span>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      );
    },
  };

  const QualtityOrderColumn = {
    title: () => (
      <div className="text-center">
        <div>Số lượng đặt</div>
      </div>
    ),
    className: "yody-pos-quantity text-center",
    width: "15%",
    render: (l: any, item: any, index: number) => {
      return <div className="yody-pos-qtt">{l.quantity}</div>;
    },
  };

  const QualtityPickColumn = {
    title: () => (
      <div>
        <span style={{ color: "#222222", textAlign: "right" }}>
          Số lượng nhặt
        </span>
      </div>
    ),
    className: "yody-pos-price text-right",
    width: "15%",
    align: "center",
    render: (l: any, item: any, index: number) => {
      return (
        <div
          className="yody-pos-price"
          style={{ background: `${l.color}`, padding: "15px" }}
        >
          {formatCurrency(l.pick)}
        </div>
      );
    },
  };

  const columns = [
    SttColumn,
    ProductColumn,
    QualtityOrderColumn,
    QualtityPickColumn,
  ];

  return (
    <Form layout="vertical" ref={formRef} form={form}>
      <div style={{ padding: "24px 24px 0 24px" }}>
        <Row gutter={24}>
          <Col md={8}>
            <Form.Item
              label="Cửa hàng"
              name="store_request"
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

          <Col md={8}>
            <Form.Item
              label="ID đơn hàng:"
              name="order_request"
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
                onPressEnter={(e: any) => {
                  onKeyupOrder(e.target.value);
                  console.log(e.target.value);
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
                <Form.Item
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập sản phẩm",
                    },
                  ]}
                  name="product_request"
                >
                  <Input
                    style={{ width: "50%" }}
                    placeholder="mã sản phẩm"
                    onPressEnter={(e: any) => {
                      onKeyupProduct(e.target.value);
                    }}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số lượng",
                    },
                  ]}
                  name="quality_request"
                >
                  <Input
                    style={{ width: "50%" }}
                    placeholder="số lượng"
                    addonAfter={<AiOutlinePlusCircle />}
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>

        {orderList && orderList.length > 0 && (
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
                    {orderResponse[0]?.code}
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
                    {!orderResponse
                      ? ""
                      : orderResponse[0].shipment?.shipper_name}
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
                    {orderResponse[0].customer}
                  </Typography.Text>
                </span>
              </Space>
            </Col>
          </Row>
        )}

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
            dataSource={orderList}
            className="sale-product-box-table2 w-100"
            tableLayout="fixed"
            pagination={false}
            bordered
            footer={() =>
              orderList && orderList.length > 0 ? (
                <div className="row-footer-custom">
                  <div
                    className="yody-foot-total-text"
                    style={{
                      width: "38%",
                      float: "left",
                      fontWeight: 700,
                    }}
                  >
                    TỔNG
                  </div>
                  <div
                    style={{
                      width: "26.66%",
                      float: "left",
                      textAlign: "right",
                      fontWeight: 400,
                    }}
                  >
                    {formatCurrency(
                      orderList.reduce((a:number, b:OrderProductListModel) => a + b.quantity, 0)
                    )}
                  </div>
                  <div
                    style={{
                      width: "24.18%",
                      float: "left",
                      textAlign: "right",
                      fontWeight: 400,
                    }}
                  >
                    {formatCurrency(orderList.reduce((a:number, b:OrderProductListModel) => a + Number(b.pick), 0))}
                  </div>
                </div>
              ) : (
                <div />
              )
            }
          />
        </Row>
      </div>
    </Form>
  );
};

export default PackInfo;
