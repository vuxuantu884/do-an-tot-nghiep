import {
  Button,
  Row,
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
import { getFulfillments, getFulfillmentsPack } from "domain/actions/order/order.action";
import {
  OrderResponse,
  OrderProductListModel,
  OrderLineItemResponse,
  DeliveryServiceResponse,
  PackFulFillmentResponse
} from "model/response/order/order.response";
import React, { createRef, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { formatCurrency } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import emptyProduct from "assets/icon/empty_products.svg";
import { setPackInfo } from "utils/LocalStorageUtils";
import barcodeIcon from "assets/img/scanbarcode.svg";
import { PackModel, PackModelDefaltValue } from "model/pack/pack.model";
import { RegUtil } from "utils/RegUtils";
import { FulFillmentStatus } from "utils/Constants";

interface OrderLineItemResponseExt extends OrderLineItemResponse {
  pick: number;
  color: string;
}

var barcode = "";

const PackInfo: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  //form
  const formRef = createRef<FormInstance>();
  const idDonHangRef = createRef<Input>();

  //useState

  const [packFulFillmentResponse, setPackFulFillmentResponse] = useState<PackFulFillmentResponse>();
  // const [packFulFillmentResponse, setPackFulFillmentResponse] = useState<Array<any>>([]);
  const [itemProductList, setItemProductList] = useState<OrderLineItemResponseExt[]>([]);

  const [disableStoreId, setDisableStoreId] = useState(false);
  const [disableDeliveryPproviderId, setDisableDeliveryProviderId] = useState(false);
  const [disableOrder, setDisableOrder] = useState(false);
  const [disableProduct, setDisableProduct] = useState(true);
  const [disableQuality, setDisableQuality] = useState(true);


  //element
  const btnFinishPackElement = document.getElementById("btnFinishPack");
  const btnClearPackElement = document.getElementById("btnClearPack");
  const OrderRequestElement: any = document.getElementById("order_request");
  const ProductRequestElement: any = document.getElementById("product_request");

  OrderRequestElement?.addEventListener("focus", (e: any) => {
    OrderRequestElement.select();
  });

  ProductRequestElement?.addEventListener("focus", (e: any) => {
    ProductRequestElement.select();
  });

  //context
  const orderPackContextData = useContext(OrderPackContext);

  const setPackModel = orderPackContextData?.setPackModel;
  const packModel = orderPackContextData?.packModel;
  const listStoresDataCanAccess = orderPackContextData?.listStoresDataCanAccess;
  const listThirdPartyLogistics = orderPackContextData.listThirdPartyLogistics;

  const shipName =
    listThirdPartyLogistics.length > 0 && packFulFillmentResponse
      ? listThirdPartyLogistics.find(
        (x) => x.id === packFulFillmentResponse?.shipment?.delivery_service_provider_id
      )?.name
      : "";

  const deliveryServiceProvider = useMemo(() => {
    let dataAccess: DeliveryServiceResponse[] = [];
    listThirdPartyLogistics.forEach((item, index) => {
      if (dataAccess.findIndex((p) => p.name.toLocaleLowerCase().trim().indexOf(item.name.toLocaleLowerCase().trim()) !== -1) === -1)
        dataAccess.push({ ...item })
    });
    return dataAccess;
  }, [listThirdPartyLogistics]);

  ///context

  //function

  const event = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLBodyElement ||
        event.target instanceof HTMLDivElement
      ) {
        if (event.key !== "Enter") {
          barcode = barcode + event.key;
        } else {
          if (event.key === "Enter") {
            if (barcode !== "" && event) {
              let { order_request } = formRef.current?.getFieldsValue();

              if (order_request && packFulFillmentResponse) {
                formRef.current?.setFieldsValue({ product_request: barcode });
                ProductRequestElement.select();
                btnFinishPackElement?.click();
              }
              barcode = "";
            }
          }
        }
      }
    },
    [formRef, ProductRequestElement, btnFinishPackElement, packFulFillmentResponse]
  );

  const onPressEnterOrder = useCallback(
    (value: string) => {
      formRef.current?.validateFields(["store_request", "delivery_service_provider_id","order_request"]);
      let { store_request, delivery_service_provider_id } = formRef.current?.getFieldsValue();
      if (value) {
        dispatch(
          getFulfillments(value.trim(), store_request, delivery_service_provider_id, (data: PackFulFillmentResponse[]) => {
            if (data && data.length !== 0) {
              console.log(data)
              let fMSuccess:PackFulFillmentResponse[]=data.filter((p)=>p.status!==FulFillmentStatus.CANCELLED&&p.status!==FulFillmentStatus.RETURNED&&p.status!==FulFillmentStatus.RETURNING)
              console.log("fMSuccess",fMSuccess)
              setPackFulFillmentResponse(fMSuccess[0]);
              setDisableStoreId(true);
              setDisableDeliveryProviderId(true);
              setDisableOrder(true);
              let a = document.getElementById("inputProduct");
              setTimeout(() => {
                a?.focus();
              }, 200);
            } else {
              setDisableStoreId(false);
              setDisableDeliveryProviderId(false)
              setDisableOrder(false);
              showError("Không tìm thấy đơn hàng");
            }
          })
        );

        OrderRequestElement?.select();
      }
    },
    [formRef, dispatch, OrderRequestElement]
  );

  const onPressEnterProduct = useCallback(
    (value: string) => {
      if (value.trim()) {
        btnFinishPackElement?.click();
        ProductRequestElement?.select();
      }
    },
    [btnFinishPackElement, ProductRequestElement]
  );

  const onPressEnterQuality = useCallback(
    (value: string) => {
      if (value.trim()) {
        btnFinishPackElement?.click();
      }
    },
    [btnFinishPackElement]
  );

  const onClickClearPack = () => {
    setDisableStoreId(false);
    setDisableDeliveryProviderId(false)
    setDisableOrder(false);

    setPackFulFillmentResponse(undefined);
    setItemProductList([]);

    formRef.current?.setFieldsValue({
      product_request: "",
      quality_request: "",
      order_request: "",
      // store_request: undefined,
      // delivery_service_provider_id:undefined
    });
  };

  const FinishPack = useCallback(() => {
    formRef.current?.validateFields();
    let value = formRef?.current?.getFieldsValue();
    if (value.quality_request && !RegUtil.ONLY_NUMBER.test(value.quality_request.trim())) {
      return
    }

    let store_request = value.store_request;
    let order_request = value.order_request;
    let quality_request = value.quality_request ? +value.quality_request : 1;
    let product_request = value.product_request;

    if (store_request && order_request && product_request) {
      let indexPack = itemProductList.findIndex(
        (p) =>
          p.sku === product_request.trim() || p.variant_barcode === product_request.trim()
      );

      if (indexPack !== -1) {

        if ((Number(itemProductList[indexPack].pick) + quality_request) > (Number(itemProductList[indexPack].quantity))) {
          showError("Số lượng nhặt không đúng");
          return
        } else {
          itemProductList[indexPack].pick += Number(quality_request);

          if (itemProductList[indexPack].pick === itemProductList[indexPack].quantity)
            itemProductList[indexPack].color = "#27AE60";

          setItemProductList([...itemProductList]);
          if (Number(itemProductList[indexPack].quantity) === Number(itemProductList[indexPack].pick))
            formRef.current?.setFieldsValue({ product_request: "" });
        }

        formRef.current?.setFieldsValue({ quality_request: "" });
      } else {
        showError("Sản phẩm này không có trong đơn hàng");
      }
    }
  }, [formRef, itemProductList]);

  const onChangeStoreId = useCallback((value?: number) => {
    setPackModel({ ...new PackModelDefaltValue(), ...packModel, store_id: value });
    setPackInfo({ ...packModel, store_id: value });
  }, [packModel, setPackModel]);
  const onChangeDeliveryServiceId = useCallback((value?: number) => {
    setPackModel({ ...new PackModelDefaltValue(), ...packModel, delivery_service_provider_id: value });
    setPackInfo({ ...packModel, delivery_service_provider_id: value });
    idDonHangRef?.current?.focus();
  }, [idDonHangRef, packModel, setPackModel]);
  ///function

  //useEffect

  useEffect(() => {
    formRef.current?.setFieldsValue({
      // product_request: "",
      // quality_request: "",
      //order_request: "",
      store_request: packModel?.store_id,
      delivery_service_provider_id: packModel?.delivery_service_provider_id
    });
  }, [formRef, packModel]);

  useEffect(() => {
    if (packFulFillmentResponse) {
      console.log("packFulFillmentResponse", packFulFillmentResponse);
      let item: OrderLineItemResponseExt[] = [];
      packFulFillmentResponse.items.forEach(function (i: OrderLineItemResponse) {

        let indexDuplicate = item.findIndex(p => p.variant_id === i.variant_id);
        if (indexDuplicate !== -1) {
          let quantity = item[indexDuplicate].quantity + i.quantity;
          
          //item.push({ ...i, quantity: quantity || 0, pick: 0, color: "#E24343" });
          item[indexDuplicate].quantity=quantity;
          console.log("indexDuplicate", item[indexDuplicate]);
        }
        else
          item.push({ ...i, pick: 0, color: "#E24343" });
      });
      setItemProductList(item);
    }
  }, [packFulFillmentResponse]);

  useEffect(() => {
    if (
      itemProductList &&
      packFulFillmentResponse &&
      itemProductList.length !== 0
    ) {
      let indexPack = itemProductList.filter(
        (p: OrderLineItemResponseExt) => Number(p.quantity) !== Number(p.pick)
      );

      console.log("indexPack",indexPack)

      if (indexPack === undefined || indexPack.length === 0) {
        let request = {
          id: packFulFillmentResponse.id,
          code: packFulFillmentResponse.code,
          items: itemProductList,
        };

        let packData: PackModel = { ...new PackModelDefaltValue(), ...packModel };
        console.log("PackModel", packData);

        dispatch(
          getFulfillmentsPack(request, (data: any) => {
            if (data) {
              btnClearPackElement?.click();

              packData?.order?.push({ ...packFulFillmentResponse });
              setPackModel(packData);
              setPackInfo(packData);
              showSuccess("Đóng gói đơn hàng thành công");
            }
          })
        );
      }
    }
  }, [dispatch, itemProductList, packFulFillmentResponse, btnClearPackElement, packModel, setPackModel, history]);

  useEffect(() => {
    if (disableOrder) {
      setDisableProduct(false);
      setDisableQuality(false);
    } else {
      setDisableProduct(true);
      setDisableQuality(true);
    }
  }, [disableOrder]);

  useEffect(() => {
    window.addEventListener("keypress", event);
    return () => {
      window.removeEventListener("keypress", event);
    };
  }, [event]);
  ///useEffect

  //columns
  const SttColumn = {
    title: () => (
      <span style={{ textAlign: "right" }}>STT</span>
    ),
    className: "",
    width: window.screen.width <= 1600 ? "5%" : "3%",
    align: "center",
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
    width: "25%",
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
    align: "center",
    render: (l: any, item: any, index: number) => {
      return <div className="yody-pos-qtt">{l.quantity}</div>;
    },
  };
  const QualtityPickColumn = {
    title: () => (
      <div>
        <span style={{ color: "#222222", textAlign: "right" }}>Đã nhặt hàng</span>
      </div>
    ),
    className: "yody-columns-of-picks text-right",
    width: "15%",
    align: "center",
    render: (l: any, item: any, index: number) => {
      return (
        <div
          className="yody-product-pick"
          style={{ background: `${l.color}` }}
        >
          {formatCurrency(l.pick)}
        </div>
      );
    },
  };

  const columns = [SttColumn, ProductColumn, QualtityOrderColumn, QualtityPickColumn];
  ///columns
  return (
    <React.Fragment>
      <Form layout="vertical" ref={formRef} className="yody-pack-row">
        <div className="yody-row-flex">
          <Form.Item
            label="Cửa hàng"
            name="store_request"
            // rules={[
            //   {
            //     required: true,
            //     message: "Vui lòng chọn cửa hàng"
            //   },
            // ]}
            style={{ width: "42%", paddingRight: "97px" }}
          >
            <Select
              className="select-with-search"
              showSearch
              allowClear
              placeholder="Chọn cửa hàng"
              notFoundContent="Không tìm thấy kết quả"
              onChange={(value?: number) => {
                onChangeStoreId(value);
              }}
              filterOption={(input, option) => {
                if (option) {
                  return (
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  );
                }
                return false;
              }}
              disabled={disableStoreId}
            >
              {listStoresDataCanAccess?.map((item, index) => (
                <Select.Option key={index.toString()} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ width: "100%" }}>
            <Input.Group compact>
              <Form.Item
                label="Hãng vận chuyển:"
                name="delivery_service_provider_id"
                // rules={[
                //   {
                //     required: true,
                //     message: "Vui lòng chọn hãng vận chuyển"
                //   },
                // ]}
                style={{ width: "220px", margin: 0 }}
              >
                <Select
                  style={{ width: "100%" }}
                  showSearch
                  allowClear
                  placeholder="Chọn hãng vận chuyển"
                  notFoundContent="Không tìm thấy kết quả"
                  disabled={disableDeliveryPproviderId}
                  onChange={(value?: number) => onChangeDeliveryServiceId(value)}
                >
                  <Select.Option key={-1} value={-1}>Tự giao hàng</Select.Option>
                  {
                    deliveryServiceProvider.map((item, index) => (
                      <Select.Option key={index.toString()} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))
                  }
                </Select>
              </Form.Item>

              <Form.Item
                label="ID đơn hàng/Mã vận đơn:"
                name="order_request"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập ID đơn hàng hoặc mã vận đơn!",
                  },
                ]}
                style={{ width: "calc(100% - 220px)" }}
              >
                <Input
                  ref={idDonHangRef}
                  placeholder="ID đơn hàng/Mã vận đơn"
                  addonAfter={<img src={barcodeIcon} alt="" />}
                  onPressEnter={(e: any) => {
                    onPressEnterOrder(e.target.value?.toUpperCase());
                  }}
                  disabled={disableOrder}
                  id="order_request"
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>
          <Form.Item label="Sản phẩm:" style={{ width: "55%", paddingLeft: "30px" }}>
            <Input.Group compact className="select-with-search" style={{ width: "100%" }}>
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
                  id="inputProduct"
                  style={{ width: "50%" }}
                  placeholder="Mã sản phẩm"
                  onPressEnter={(e: any) => {
                    onPressEnterProduct(e.target.value);
                  }}
                  disabled={disableProduct}
                />
              </Form.Item>
              <Form.Item noStyle name="quality_request"
                rules={
                  [
                    () => ({
                      validator(_, value) {
                        if (value && !RegUtil.ONLY_NUMBER.test(value.trim())) {
                          return Promise.reject(new Error("số lượng nhập không đúng định dạng"));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]
                }
              >
                <Input
                  style={{ width: "50%" }}
                  placeholder="số lượng"
                  addonAfter={<img src={barcodeIcon} alt="" />}
                  onPressEnter={(e: any) => {
                    onPressEnterQuality(e.target.value);
                  }}
                  disabled={disableQuality}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </div>
      </Form>
      {itemProductList && itemProductList.length > 0 && (
        <div className="yody-row-flex yody-pack-row">
          <div className="yody-row-item" style={{ width: "42%", paddingRight: "97px" }}>
            <span className="customer-detail-text">
              <strong>Đơn hàng:</strong>
              <Typography.Text
                type="success"
                style={{
                  color: "#FCAF17",
                  marginLeft: "5px",
                }}
              >
                {packFulFillmentResponse?.code}
              </Typography.Text>
            </span>
          </div>
          <div className="yody-row-item" style={{ width: "55%" }}>
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
          </div>
          <div className="yody-row-item" style={{ paddingLeft: "30px", width: "100%" }}>
            <span className="customer-detail-text">
              <strong>Khách hàng: </strong>
              <Typography.Text
                type="success"
                style={{
                  color: "#FCAF17",
                  marginLeft: "5px",
                }}
              >
                {packFulFillmentResponse?.customer}
              </Typography.Text>
            </span>
          </div>
        </div>
      )}
      <Row justify="space-between" className="yody-pack-row">
        <Table
          //loading={loading}
          locale={{
            emptyText: (
              <div className="sale_order_empty_product">
                <img src={emptyProduct} alt="empty product" />
                <p>Không có dữ liệu!</p>
              </div>
            ),
          }}
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={itemProductList}
          className="order-product-pick"
          tableLayout="fixed"
          pagination={false}
          footer={() =>
            itemProductList && itemProductList.length > 0 ? (
              <div className="row-footer-custom">
                <div className="yody-foot-total-text">
                  TỔNG
                </div>
                <div
                  style={{
                    width: "23.5%",
                    float: "left",
                    textAlign: "right",
                    fontWeight: 400,
                  }}
                >
                  {formatCurrency(
                    itemProductList.reduce(
                      (a: number, b: OrderProductListModel) => a + b.quantity,
                      0
                    )
                  )}
                </div>
                <div
                  style={{
                    width: "25.9%",
                    float: "left",
                    textAlign: "right",
                    fontWeight: 400,
                  }}
                >
                  {formatCurrency(
                    itemProductList.reduce(
                      (a: number, b: OrderProductListModel) => a + Number(b.pick),
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

      {itemProductList && itemProductList.length > 0 && (
        <div className="yody-pack-row">
          <Row gutter={24}>
            <Col md={12}>
              <Button
                style={{ padding: "0px 25px" }}
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
        </div>
      )}


    </React.Fragment>
  )
};

export default PackInfo;

