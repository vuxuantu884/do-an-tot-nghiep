import { ScanOutlined } from "@ant-design/icons";
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
import UrlConfig from "config/url.config";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import {
  getFulfillments,
  getFulfillmentsPack,
} from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  DeliveryServiceResponse,
  OrderProductListModel,
} from "model/response/order/order.response";
import {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { formatCurrency, haveAccess } from "utils/AppUtils";
import { showError, showSuccess, } from "utils/ToastUtils";
import emptyProduct from "assets/icon/empty_products.svg";
import { setPackInfo } from "utils/LocalStorageUtils";

type PackInfoProps = {
  setFulfillmentsPackedItems: (items: PageResponse<any>) => void;
  listThirdPartyLogistics: DeliveryServiceResponse[];
  fulfillmentData: PageResponse<any>;
};

const PackInfo: React.FC<PackInfoProps> = (props: PackInfoProps) => {
  const {
    setFulfillmentsPackedItems,
    fulfillmentData,
    listThirdPartyLogistics,
  } = props;

  const dispatch = useDispatch();

  //form
  const formRef = createRef<FormInstance>();
  const [form] = Form.useForm();

  //useState
 
  const [orderResponse, setOrderResponse] = useState<Array<any>>([]);
  const [orderList, setOrderList] = useState<Array<any>>([]);

  const [disableStoreId, setDisableStoreId] = useState(false);
  const [disableOrder, setDisableOrder] = useState(false);
  const [disableProduct, setDisableProduct] = useState(true);
  const [disableQuality, setDisableQuality] = useState(true);

  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );
  //element
  const btnFinishPackElement = document.getElementById("btnFinishPack");
  const btnClearPackElement = document.getElementById("btnClearPack");
  const OrderRequestElement: any = document.getElementById("order_request");
  const ProductRequestElement: any = document.getElementById("product_request");
  // const QualityRequestElement: any = document.getElementById("quality_request");

  //context
  const orderPackContextData = useContext(OrderPackContext);

  const listStores= orderPackContextData?.listStores;
  //const setListStores= orderPackContextData?.setListStores;

  const shipName =
    listThirdPartyLogistics.length > 0 && orderResponse.length > 0
      ? listThirdPartyLogistics.find(
          (x) => x.id === orderResponse[0].shipment.delivery_service_provider_id
        )?.name
      : "";

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



  OrderRequestElement?.addEventListener("focus", (e: any) => {
    OrderRequestElement.select();
  });

  ProductRequestElement?.addEventListener("focus", (e: any) => {
    ProductRequestElement.select();
  });

  // QualityRequestElement?.addEventListener("focus", (e: any) => {
  //   if (!formRef.current?.getFieldValue(["quality_request"]))
  //     formRef.current?.setFieldsValue({ product_request: "" });
  //   console.log(formRef.current?.getFieldValue(["quality_request"]));
  // });

  const event = useCallback(
    (event: KeyboardEvent) => {
        if (event.target instanceof HTMLBodyElement) {
          if (event.key === "Enter") {
            let product= formRef.current?.getFieldValue(["product_request"]);
            console.log("product",product);
          }
        }
    },
    [formRef]
  );

  useEffect(() => {
      window.addEventListener("keydown", event);
  }, [event]);

  const onKeyupOrder = useCallback(
    (value: string) => {
      if (value.trim()) {
        formRef.current?.validateFields(["store_request"]);
        if (formRef.current?.getFieldValue(["store_request"]))
          dispatch(
            getFulfillments(value.trim(), (data: any) => {
              if (data && data.length !== 0) {
                setOrderResponse(data);
                setDisableStoreId(true);
                setDisableOrder(true);
              } else {
                setDisableStoreId(false);
                setDisableOrder(false);
                showError("Đơn hàng chưa nhặt hàng");
              }
            })
          );
        OrderRequestElement?.select();
      }
    },
    [dispatch, formRef, OrderRequestElement]
  );

  const onKeyupProduct = useCallback(
    (value: string) => {
      if (value.trim()) {
        formRef.current?.validateFields(["store_request"]);
        formRef.current?.validateFields(["order_request"]);
        //formRef.current?.validateFields(["quality_request"]);

        btnFinishPackElement?.click();
        ProductRequestElement?.select();
      }
    },
    [formRef, btnFinishPackElement, ProductRequestElement]
  );

  const onKeyupQuality = useCallback(
    (value: string) => {
      if (value.trim()) {
        // formRef.current?.validateFields(["store_request"]);
        // formRef.current?.validateFields(["order_request"]);
        // formRef.current?.validateFields(["quality_request"]);

        btnFinishPackElement?.click();
      }
    },
    [btnFinishPackElement]
  );

  const onClickClearPack = () => {
    setDisableStoreId(false);
    setDisableOrder(false);

    setOrderResponse([]);
    setOrderList([]);

    formRef.current?.setFieldsValue({ product_request: "" });
    formRef.current?.setFieldsValue({ quality_request: "" });
    formRef.current?.setFieldsValue({ order_request: "" });
    formRef.current?.setFieldsValue({ store_request: "" });
  };
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
      setOrderList(item);
    }
  }, [orderResponse]);

  useEffect(() => {
    if (
      orderList &&
      orderResponse &&
      orderResponse.length !== 0 &&
      orderList.length !== 0
    ) {
      let indexPack = orderList.filter(
        (p: OrderProductListModel) => Number(p.quantity) !== Number(p.pick)
      );

      if (indexPack === undefined || indexPack.length === 0) {
        let request = {
          id: orderResponse[0].id,
          code: orderResponse[0].code,
          items: orderList,
        };

        dispatch(
          getFulfillmentsPack(request, (data: any) => {
            if (data) {
              btnClearPackElement?.click();

              let datas = { ...fulfillmentData };

              datas.metadata.total = Number(datas.metadata.total) + Number(orderList.length);
              datas.items.push({
                order_id: orderResponse[0].order_id,
                code: orderResponse[0].order_code,
                shipment: shipName,
                customer: orderResponse[0].customer,
                items: orderList,
              });

              setFulfillmentsPackedItems(datas);
              setPackInfo(datas);
              showSuccess("Đóng gói đơn hàng thành công");
            }
          })
        );
      }
    }
  }, [
    dispatch,
    orderList,
    orderResponse,
    btnClearPackElement,
    fulfillmentData,
    shipName,
    setFulfillmentsPackedItems,
  ]);
  useEffect(() => {
    if (disableOrder === true) {
      setDisableProduct(false);
      setDisableQuality(false);
    } else {
      setDisableProduct(true);
      setDisableQuality(true);
    }
  }, [disableOrder]);

  //useEffect

  const FinishPack = useCallback(() => {
    let store_request = formRef.current?.getFieldValue(["store_request"]);
    let order_request = formRef.current?.getFieldValue(["order_request"]);
    let quality_request = formRef.current?.getFieldValue(["quality_request"]);
    let product_request = formRef.current?.getFieldValue(["product_request"]);

    if (store_request && order_request && product_request) {
      let indexPack = orderList.findIndex(
        (p) =>
          p.sku === product_request.trim() ||
          p.variant_barcode === product_request.trim()
      );

      if (indexPack !== -1) {
        if (
          Number(orderList[indexPack].quantity) >
          Number(orderList[indexPack].pick)
        ) {
          if (!quality_request) {
            orderList[indexPack].pick = Number(orderList[indexPack].pick) + 1;
          } else {
            orderList[indexPack].pick = Number(quality_request);
          }

          if (orderList[indexPack].pick === orderList[indexPack].quantity)
            orderList[indexPack].color = "#27AE60";
          else orderList[indexPack].color = "#E24343";

          setOrderList([...orderList]);
          if (
            Number(orderList[indexPack].quantity) ===
            Number(orderList[indexPack].pick)
          )
            formRef.current?.setFieldsValue({ product_request: "" });
        } else showError("Sản phẩm đã nhập đủ số lượng");

        formRef.current?.setFieldsValue({ quality_request: "" });
      } else {
        showError("Sản phẩm này không có trong đơn hàng");
      }
    } else {
      console.log("Chưa đủ thông tin");
    }
  }, [formRef, orderList]);

  const SttColumn = {
    title: () => (
      <div className="text-center">
        <div style={{ textAlign: "left" }}>STT</div>
      </div>
    ),
    className: "yody-pos-quantity text-center",
    width: "10%",
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
              <Link
                  target="_blank"
                  to={`${UrlConfig.PRODUCT}/${l.product_id}/variants/${l.variant_id}`}
                >
                  {l.sku}
                </Link>
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
      <div style={{ padding: "24px 0 0 0" }}>
        <Row gutter={24}>
          <Col md={9}>
            <Form.Item
              label="Cửa hàng"
              name="store_request"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn cửa hàng",
                },
              ]}
              style={{ width: "70%" }}
            >
              <Select
                className="select-with-search"
                showSearch
                allowClear
                
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
                disabled={disableStoreId}
              >
                {dataCanAccess.map((item, index) => (
                  <Select.Option key={index.toString()} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col md={7}>
            <Form.Item
              label="ID đơn hàng:"
              name="order_request"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mã đơn hàng hoặc mã đơn giao",
                },
              ]}
              style={{ width: "90%" }}
            >
              <Input
                className="select-with-search"
                
                placeholder="ID đơn hàng/ Mã đơn giao"
                addonAfter={<ScanOutlined />}
                onPressEnter={(e: any) => {
                  onKeyupOrder(e.target.value);
                }}
                disabled={disableOrder}
                id="order_request"
              />
            </Form.Item>
          </Col>

          <Col md={8}>
            <Form.Item label="Sản phẩm:" style={{width: "70%",float: "right"}}>
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
                    disabled={disableProduct}
                  />
                </Form.Item>
                <Form.Item noStyle name="quality_request">
                  <Input
                    style={{ width: "50%" }}
                    placeholder="số lượng"
                    //addonAfter={<img src={ImageScan} alt=""/>}
                    addonAfter={<ScanOutlined />}
                    onPressEnter={(e: any) => {
                      onKeyupQuality(e.target.value);
                    }}
                    disabled={disableQuality}
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>
      </div>
      <div style={{ padding: "24px 0 0 0" }}>
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
                    {shipName}
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
      </div>
      <div style={{ padding: "24px 0 0 0" }}>
        <Row className="sale-product-box" justify="space-between">
          <Table
             locale={{
              emptyText: (
                <div className="sale_order_empty_product">
                  <img src={emptyProduct} alt="empty product"></img>
                  <p>Không có dữ liệu!</p>
                </div>
              ),
            }}
            rowKey={(record) => record.id}
            columns={columns}
            dataSource={orderList}
            className="ecommerce-order-list"
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
                      orderList.reduce(
                        (a: number, b: OrderProductListModel) => a + b.quantity,
                        0
                      )
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
                    {formatCurrency(
                      orderList.reduce(
                        (a: number, b: OrderProductListModel) =>
                          a + Number(b.pick),
                        0
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div />
              )
            }
          />
        </Row>
      </div>
      <div style={{ padding: "24px" }}>
        {orderList && orderList.length > 0 && (
          <Row gutter={24}>
            <Col md={12}>
              <Button
                style={{ padding: "0px 50px" }}
                onClick={onClickClearPack}
                id="btnClearPack"
              >
                Hủy đã đóng gói
              </Button>
            </Col>
            <Col md={12}>
              <Button
                style={{ display: "none" }}
                id="btnFinishPack"
                onClick={(e) => {
                  e.stopPropagation();
                  FinishPack();
                }}
              >
                Đóng gói
              </Button>
            </Col>
          </Row>
        )}
      </div>
    </Form>
  );
};

export default PackInfo;
