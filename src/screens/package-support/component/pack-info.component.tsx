import {
  Button,
  Row,
  Select,
  Form,
  Input,
  Typography,
  Table,
  Tooltip,
  FormInstance,
  Card,
} from "antd";
import UrlConfig from "config/url.config";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { getFulfillments, getFulfillmentsPack } from "domain/actions/order/order.action";
import {
  OrderProductListModel,
  OrderLineItemResponse,
  PackFulFillmentResponse,
} from "model/response/order/order.response";
import React, { createRef, useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { formatCurrency } from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import emptyProduct from "assets/icon/empty_products.svg";
import { setPackInfo } from "utils/LocalStorageUtils";
import barcodeIcon from "assets/img/scanbarcode.svg";
import { PackModel, PackModelDefaultValue } from "model/pack/pack.model";
import { RegUtil } from "utils/RegUtils";
import { FulFillmentStatus } from "utils/Constants";
import { FulfillmentsOrderPackQuery } from "model/order/order.model";
import { fullTextSearch } from "utils/StringUtils";
import { VariantResponse } from "model/product/product.model";
import { PageResponse } from "model/base/base-metadata.response";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { ArrowRightOutlined } from "@ant-design/icons";
import { showModalErrorAudio } from "utils/fulfillmentUtils";
interface OrderLineItemResponseExt extends OrderLineItemResponse {
  pick: number;
  color: string;
  reference_barcode?: string | null;
}

var barcode = "";

const PackInfoComponent: React.FC = () => {
  const dispatch = useDispatch();

  //form
  const formRef = createRef<FormInstance>();
  const idDonHangRef = createRef<Input>();
  //useState

  const [packFulFillmentResponse, setPackFulFillmentResponse] = useState<PackFulFillmentResponse>();
  const [variantResponse, setVariantResponse] = useState<VariantResponse[]>();
  const [itemProducts, setItemProducts] = useState<OrderLineItemResponseExt[]>([]);

  const [disableStoreId, setDisableStoreId] = useState(false);
  const [disableDeliveryProviderId, setDisableDeliveryProviderId] = useState(false);
  const [disableOrder, setDisableOrder] = useState(false);
  const [disableProduct, setDisableProduct] = useState(true);
  const [disableQuality, setDisableQuality] = useState(true);

  //element
  const btnFinishPackElement = document.getElementById("btnFinishPack");
  const btnClearPackElement = document.getElementById("btnClearPack");
  const orderRequestElement: any = document.getElementById("order_request");
  const productRequestElement: any = document.getElementById("inputProduct");

  orderRequestElement?.addEventListener("focus", (e: any) => {
    orderRequestElement.select();
  });

  productRequestElement?.addEventListener("focus", (e: any) => {
    productRequestElement.select();
  });

  //context
  const orderPackContextData = useContext(OrderPackContext);

  const setSinglePack = orderPackContextData?.setSinglePack;
  const singlePack = orderPackContextData?.singlePack;
  const listStoresDataCanAccess = orderPackContextData?.listStoresDataCanAccess;
  const listThirdPartyLogistics = orderPackContextData.listThirdPartyLogistics;

  const shipName =
    listThirdPartyLogistics.length > 0 && packFulFillmentResponse
      ? listThirdPartyLogistics.find(
          (x) => x.id === packFulFillmentResponse?.shipment?.delivery_service_provider_id,
        )?.name
      : "";

  const handleProductSearch = useCallback(
    (data: PackFulFillmentResponse) => {
      let variantBarcode = data.items.map((p) => p.variant_barcode);
      let initQueryVariant: any = {
        barcode: variantBarcode,
      };

      dispatch(
        searchVariantsRequestAction(
          initQueryVariant,
          (response: false | PageResponse<VariantResponse>) => {
            response && setVariantResponse(response.items);
          },
        ),
      );
    },
    [dispatch],
  );

  const event = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLBodyElement || event.target instanceof HTMLDivElement) {
        if (event.key !== "Enter") {
          barcode = barcode + event.key;
        } else {
          if (event.key === "Enter") {
            if (barcode !== "" && event) {
              let { order_request } = formRef.current?.getFieldsValue();

              if (order_request && packFulFillmentResponse) {
                formRef.current?.setFieldsValue({ product_request: barcode });
                productRequestElement?.blur();
                ProductPack(barcode, 1);
                //btnFinishPackElement?.click();
              }
              barcode = "";
            }
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formRef, packFulFillmentResponse, productRequestElement],
  );

  const eventKeyboardFunction = useCallback(
    (event: KeyboardEvent) => {
      if (["F3"].indexOf(event.key) !== -1) {
        event.preventDefault();
        event.stopPropagation();
      }
      switch (event.key) {
        case "F3":
          orderRequestElement?.focus();
          break;
        default:
          break;
      }
    },
    [orderRequestElement],
  );

  const onPressEnterOrder = useCallback(
    (value: string) => {
      formRef.current?.validateFields([
        "store_request",
        "delivery_service_provider_id",
        "order_request",
      ]);
      let { store_request, delivery_service_provider_id } = formRef.current?.getFieldsValue();
      if (value) {
        let query: FulfillmentsOrderPackQuery = {
          code: value?.trim(),
          store_id: store_request,
          delivery_service_provider_id: delivery_service_provider_id,
        };
        dispatch(
          getFulfillments(
            query,
            (data: PackFulFillmentResponse[]) => {
              if (data && data.length !== 0) {
                let fMSuccess: PackFulFillmentResponse[] = data.filter(
                  (p) => p.status === FulFillmentStatus.PICKED,
                );

                let storeId: number | null | undefined = data[0]?.stock_location_id
                  ? listStoresDataCanAccess?.findIndex(
                      (p) => p.id === data[0]?.stock_location_id,
                    ) !== -1
                    ? data[0]?.stock_location_id
                    : null
                  : null;
                if (storeId) {
                  setPackFulFillmentResponse(fMSuccess[0]);
                  setDisableStoreId(true);
                  setDisableDeliveryProviderId(true);
                  setDisableOrder(true);
                  setSinglePack({
                    ...new PackModelDefaultValue(),
                    ...singlePack,
                    store_id: storeId,
                  });
                  setPackInfo({
                    ...new PackModelDefaultValue(),
                    ...singlePack,
                    store_id: storeId,
                  });
                  formRef.current?.setFieldsValue({
                    store_request: storeId,
                  });
                  let element = document.getElementById("inputProduct");
                  element?.focus();
                } else showModalErrorAudio("Đơn hàng không thuộc cửa hàng được phân bổ");
                orderRequestElement?.blur();

                handleProductSearch(fMSuccess[0]);
              }
            },
            (error: string[]) => {
              setDisableStoreId(false);
              setDisableDeliveryProviderId(false);
              setDisableOrder(false);
              showModalErrorAudio(
                <>
                  {error.map((p) => (
                    <p>{p}</p>
                  ))}
                </>,
              );
            },
          ),
        );

        orderRequestElement?.select();
      }
    },
    [
      formRef,
      dispatch,
      orderRequestElement,
      listStoresDataCanAccess,
      handleProductSearch,
      setSinglePack,
      singlePack,
    ],
  );

  const onPressEnterProduct = useCallback(
    (value: string) => {
      if (value.trim()) {
        btnFinishPackElement?.click();
        productRequestElement?.select();
      }
    },
    [btnFinishPackElement, productRequestElement],
  );

  const onPressEnterQuality = useCallback(
    (value: string) => {
      if (value.trim()) {
        btnFinishPackElement?.click();
      }
    },
    [btnFinishPackElement],
  );

  const onClickClearPack = () => {
    setDisableStoreId(false);
    setDisableDeliveryProviderId(false);
    setDisableOrder(false);

    setPackFulFillmentResponse(undefined);
    setItemProducts([]);

    formRef.current?.setFieldsValue({
      product_request: "",
      quality_request: "",
      order_request: "",
      // store_request: undefined,
      // delivery_service_provider_id:undefined
    });
  };

  // const handleTrackingConfirm = useCallback(
  //   (ffmCode: string) => {
  //     const query: any = {
  //       fulfillment_code: ffmCode,
  //     };
  //     getShipmentApi(query)
  //       .then((response) => {
  //         if (isFetchApiSuccessful(response)) {
  //           if (response.data?.items && response.data?.items.length > 0) {
  //             // const shipment = response.data?.items[0]?.shipment;
  //             // if (shipment?.pushing_status?.toLocaleUpperCase() === PUSHING_STATUS.COMPLETED.toLocaleUpperCase()) {
  //             // }
  //           }
  //         } else {
  //           handleFetchApiError(response, "Lấy thông tin shipment:", dispatch);
  //         }
  //       })
  //       .catch((e) => {
  //         console.log(e);
  //       })
  //       .finally(() => {
  //         console.log("END");
  //       });
  //   },
  //   [dispatch],
  // );

  const handlePackedFulfillment = useCallback(() => {
    let request = {
      id: packFulFillmentResponse?.id,
      code: packFulFillmentResponse?.code,
      items: itemProducts.map((p) => ({
        sku: p.sku,
        quantity: p.quantity,
      })),
    };

    let packData: PackModel = {
      ...new PackModelDefaultValue(),
      ...singlePack,
    };

    dispatch(
      getFulfillmentsPack(
        request,
        (data: any) => {
          if (data) {
            btnClearPackElement?.click();
            packFulFillmentResponse &&
              packData.fulfillments.unshift({ ...packFulFillmentResponse });
            setSinglePack(packData);
            setPackInfo(packData);
            orderRequestElement?.focus();
            showSuccess("Đóng gói đơn hàng thành công");
          }
        },
        (error: string[]) => {
          showModalErrorAudio(
            <>
              {error.map((p) => (
                <p>{p}</p>
              ))}
            </>,
          );
        },
      ),
    );
  }, [
    btnClearPackElement,
    dispatch,
    itemProducts,
    orderRequestElement,
    packFulFillmentResponse,
    setSinglePack,
    singlePack,
  ]);

  /**
   * nhặt sản phẩm
   * productRequest: sản phẩm đang nhặt
   * qualityRequest: số lượng nhặt
   */
  const ProductPack = useCallback(
    (productRequest: string, qualityRequest: number) => {
      const isItemsQuantityEqualPick = (items: OrderLineItemResponseExt[]) => {
        return !items.some((p) => Number(p.quantity) !== Number(p.pick));
      };

      const isQuantityOfPicksNotTrue = (qualityRequest: number, item: OrderLineItemResponseExt) => {
        return Number(item.pick) + qualityRequest > Number(item.quantity);
      };

      let itemProductsCopy = [...itemProducts];

      /**
       * xác định sản phẩm cần nhặt
       */
      let indexPack = itemProductsCopy.findIndex(
        (p) =>
          p.sku === productRequest.trim() ||
          p.variant_barcode === productRequest.trim() ||
          fullTextSearch(productRequest.trim(), p.reference_barcode || ""),
      );

      if (indexPack === -1) {
        showModalErrorAudio("Sản phẩm này không có trong đơn hàng");
        return;
      }

      let itemProduct = itemProductsCopy[indexPack];

      if (isQuantityOfPicksNotTrue(qualityRequest, itemProduct)) {
        showModalErrorAudio("Số lượng nhặt không đúng");
        return;
      }

      itemProduct.pick += Number(qualityRequest);

      if (itemProduct.pick === itemProduct.quantity) itemProduct.color = "#27AE60";

      setItemProducts([...itemProductsCopy]);
      if (Number(itemProduct.quantity) === Number(itemProduct.pick)) {
        formRef.current?.setFieldsValue({ product_request: "" });
      }
      formRef.current?.setFieldsValue({ qualityRequest: "" });

      /**
       * nhặt đủ thì cho đóng gói luôn
       */
      if (isItemsQuantityEqualPick(itemProductsCopy)) {
        handlePackedFulfillment();
      }
    },
    [formRef, handlePackedFulfillment, itemProducts],
  );

  const FinishPack = useCallback(() => {
    formRef.current?.validateFields();
    let value = formRef?.current?.getFieldsValue();
    if (value.quality_request && !RegUtil.ONLY_NUMBER.test(value.quality_request.trim())) {
      return;
    }

    let store_request = value.store_request;
    let order_request = value.order_request;
    let quality_request = value.quality_request ? +value.quality_request : 1;
    let product_request = value.product_request;

    if (store_request && order_request && product_request)
      ProductPack(product_request, quality_request);
  }, [formRef, ProductPack]);

  const onChangeStoreId = useCallback(
    (value?: number) => {
      setSinglePack({
        ...new PackModelDefaultValue(),
        ...singlePack,
        store_id: value,
      });
      setPackInfo({
        ...new PackModelDefaultValue(),
        ...singlePack,
        store_id: value,
      });
    },
    [singlePack, setSinglePack],
  );
  const onChangeDeliveryServiceId = useCallback(
    (value?: number) => {
      setSinglePack({
        ...new PackModelDefaultValue(),
        ...singlePack,
        delivery_service_provider_id: value,
      });
      setPackInfo({
        ...new PackModelDefaultValue(),
        ...singlePack,
        delivery_service_provider_id: value,
      });
      idDonHangRef?.current?.focus();
    },
    [idDonHangRef, singlePack, setSinglePack],
  );
  ///function

  //useEffect

  useEffect(() => {
    const isStore = listStoresDataCanAccess?.some((p) => p.id === singlePack?.store_id);
    formRef.current?.setFieldsValue({
      store_request: isStore ? singlePack?.store_id : undefined,
      delivery_service_provider_id: singlePack?.delivery_service_provider_id,
    });
  }, [formRef, singlePack, listStoresDataCanAccess]);

  useEffect(() => {
    if (packFulFillmentResponse) {
      let item: OrderLineItemResponseExt[] = [];
      packFulFillmentResponse.items.forEach(function (i: OrderLineItemResponse) {
        let reference_barcode = variantResponse?.find(
          (p) => p.barcode === i.variant_barcode,
        )?.reference_barcodes;
        let indexDuplicate = item.findIndex((p) => p.variant_id === i.variant_id);
        if (indexDuplicate !== -1) {
          let quantity = item[indexDuplicate].quantity + i.quantity;

          item[indexDuplicate].quantity = quantity;
          //item[indexDuplicate].reference_barcode = reference_barcodes;
        } else
          item.push({
            ...i,
            pick: 0,
            color: "#E24343",
            reference_barcode: reference_barcode,
          });
      });
      setItemProducts(item);
    }
  }, [packFulFillmentResponse, variantResponse]);

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

  useEffect(() => {
    window.addEventListener("keydown", eventKeyboardFunction);
    return () => {
      window.removeEventListener("keydown", eventKeyboardFunction);
    };
  }, [eventKeyboardFunction]);
  ///useEffect

  //columns
  const sttColumn = {
    title: () => <span style={{ textAlign: "right" }}>STT</span>,
    className: "",
    width: window.screen.width <= 1600 ? "5%" : "3%",
    align: "center",
    render: (l: any, item: any, index: number) => {
      return <div className="yody-pos-qtt">{index + 1}</div>;
    },
  };
  const productColumn = {
    title: () => (
      <div className="text-center">
        <div style={{ textAlign: "left" }}>Sản phẩm</div>
      </div>
    ),
    width: "25%",
    className: "yody-pos-product",
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
          <div
            className="d-flex align-items-center"
            style={{ display: "flex", justifyContent: "space-around" }}
          >
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
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              className="btn-do-fast"
              onClick={() => {
                if (item.quantity > item.pick) ProductPack(item.sku, item.quantity);
              }}
            ></Button>
          </div>
          {/*  */}
        </div>
      );
    },
  };
  const quantityOrderColumn = {
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
  const quantityPickColumn = {
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
        <div className="yody-product-pick" style={{ background: `${l.color}` }}>
          {formatCurrency(l.pick)}
        </div>
      );
    },
  };

  const columns = [sttColumn, productColumn, quantityOrderColumn, quantityPickColumn];
  ///columns
  return (
    <React.Fragment>
      <Card className="pack-card">
        <Form layout="vertical" ref={formRef}>
          <div className="pack-row pack-row-bottom" style={{ gap: 20 }}>
            <Form.Item label="Cửa hàng" name="store_request" style={{ width: "50%" }}>
              <Select
                className="select-with-search"
                showSearch
                allowClear
                placeholder="Chọn cửa hàng"
                notFoundContent="Không tìm thấy kết quả"
                onChange={(value?: number) => {
                  onChangeStoreId(value);
                }}
                filterOption={(input, option) => fullTextSearch(input, option?.children)}
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
                  style={{ width: "220px", margin: 0 }}
                >
                  <Select
                    style={{ width: "100%" }}
                    showSearch
                    allowClear
                    placeholder="Chọn hãng vận chuyển"
                    notFoundContent="Không tìm thấy kết quả"
                    disabled={disableDeliveryProviderId}
                    onChange={(value?: number) => onChangeDeliveryServiceId(value)}
                    filterOption={(input, option) => fullTextSearch(input, option?.children)}
                  >
                    <Select.Option key={-1} value={-1}>
                      Tự giao hàng
                    </Select.Option>
                    {listThirdPartyLogistics.map((item, index) => (
                      <Select.Option key={index.toString()} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Mã vận đơn:"
                  name="order_request"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập ID đơn hàng hoặc mã vận đơn!",
                    },
                  ]}
                  style={{ width: "calc(100% - 220px)", marginBottom: 0 }}
                >
                  <Input
                    ref={idDonHangRef}
                    placeholder="ID đơn hàng/Mã vận đơn (F3)"
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
            <Form.Item label="Sản phẩm:" style={{ width: "70%" }}>
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
                    style={{ width: "60%" }}
                    placeholder="Quét mã sản phẩm/sku"
                    onPressEnter={(e: any) => {
                      onPressEnterProduct(e.target.value);
                    }}
                    disabled={disableProduct}
                    addonAfter={<img src={barcodeIcon} alt="" />}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  name="quality_request"
                  rules={[
                    () => ({
                      validator(_, value) {
                        if (value && !RegUtil.ONLY_NUMBER.test(value.trim())) {
                          return Promise.reject(new Error("số lượng nhập không đúng định dạng"));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input
                    style={{ width: "40%" }}
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
        {itemProducts && itemProducts.length > 0 && (
          <div className="pack-row pack-row-bottom" style={{ gap: 20 }}>
            <div style={{ width: "50%" }}>
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
            <div style={{ width: "100%" }}>
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
            <div style={{ width: "70%" }}>
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
        <Row justify="space-between" className="pack-row-bottom">
          <Table
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
            dataSource={itemProducts}
            className="order-product-pick"
            tableLayout="fixed"
            pagination={false}
            footer={() =>
              itemProducts && itemProducts.length > 0 ? (
                <div className="row-footer-custom yd-color-black-dark">
                  <div
                    style={{
                      float: "left",
                      width: "38%",
                      paddingLeft: "27px",
                    }}
                  >
                    TỔNG
                  </div>
                  <div
                    style={{
                      width: "23.5%",
                      float: "left",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(
                      itemProducts.reduce(
                        (a: number, b: OrderProductListModel) => a + b.quantity,
                        0,
                      ),
                    )}
                  </div>
                  <div
                    style={{
                      width: "25.84%",
                      float: "left",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(
                      itemProducts.reduce(
                        (a: number, b: OrderProductListModel) => a + Number(b.pick),
                        0,
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div />
              )
            }
          />
        </Row>

        {itemProducts && itemProducts.length > 0 && (
          <div className="pack-row">
            <Button style={{ padding: "0px 25px" }} onClick={onClickClearPack} id="btnClearPack">
              Hủy đóng gói
            </Button>

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
          </div>
        )}
      </Card>
    </React.Fragment>
  );
};

export default PackInfoComponent;
