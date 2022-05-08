import { DeleteOutlined } from "@ant-design/icons";
import {
  Card,
  Col,
  Row,
  Space,
  Form,
  Input,
  Button,
  FormInstance,
  Table,
} from "antd";
import { ICustomTableColumType } from "component/table/CustomTable";
import ContentContainer from "component/container/content.container";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import UrlConfig from "config/url.config";
import {
  getByIdGoodsReceipts,
  // getOrderGoodsReceipts,
  updateGoodsReceipts,
} from "domain/actions/goods-receipts/goods-receipts.action";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import search from "assets/img/search.svg";
import moment from "moment";
import "./styles.scss";
import { GoodsReceiptsInfoOrderModel, VariantModel } from "model/pack/pack.model";
import { Link } from "react-router-dom";
import { StyledComponent } from "./styles";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { formatCurrency } from "utils/AppUtils";
import { FulFillmentStatus } from "utils/Constants";

const { Item } = Form;
type PackParam = {
  id: string;
};

var barcode = "";

const PackUpdate: React.FC = () => {
  const dispatch = useDispatch();
  let { id } = useParams<PackParam>();
  let PackId = parseInt(id);
  const formSearchOrderRef = createRef<FormInstance>();
  const [searchOrderForm] = Form.useForm();

  const [isError, setError] = useState<boolean>(false);
  const [packDetail, setPackDetail] = useState<GoodsReceiptsResponse>();
  const [goodsReceiptsInfoOrderModel, setGoodsReceiptsInfoOrderModel] = useState<
    GoodsReceiptsInfoOrderModel[]
  >([]);
  // const [orderList, setOrderList] = useState<OrderResponse[]>([]);
  const [selectedRowCode, setSelectedRowCode] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const actions: Array<MenuAction> = [
    {
      id: 1,
      name: "Xóa",
      icon: <DeleteOutlined />,
      color: selectedRowKeys.length === 0 ? "rgba(0,0,0,.25)" : "#E24343",
      disabled: selectedRowKeys.length === 0
    },
  ];

  useEffect(() => {
    if (PackId) {
      dispatch(getByIdGoodsReceipts(PackId, setPackDetail));
      // dispatch(getOrderGoodsReceipts(setOrderList));
    } else {
      setError(true);
    }
  }, [dispatch, PackId]);

  useEffect(() => {
    if (packDetail) {
      let result: GoodsReceiptsInfoOrderModel[] = [];
      packDetail.orders?.forEach(function (itemOrder, index) {
        let product: VariantModel[] = [];
        let ship_price = 0;
        let total_price = 0;
        let ffrmCode = null;

        // itemOrder.fulfillments?.forEach(function (itemFulfillment) {
        //   if (packDetail.receipt_type_id === 1) {
        //     if (itemFulfillment.status === 'packed') {
        //       ship_price =
        //         ship_price +
        //         (itemFulfillment?.shipment?.shipping_fee_informed_to_customer
        //           ? itemFulfillment.shipment.shipping_fee_informed_to_customer
        //           : 0);
        //       total_price = total_price + (itemFulfillment.total ? itemFulfillment.total : 0);

        //       itemFulfillment.items.forEach(function (itemProduct) {
        //         product.push({
        //           sku: itemProduct.sku,
        //           product_id: itemProduct.product_id,
        //           product: itemProduct.product,
        //           variant_id: itemProduct.variant_id,
        //           variant: itemProduct.variant,
        //           variant_barcode: itemProduct.variant_barcode,
        //           quantity: itemProduct.quantity,
        //           price: itemProduct.price
        //         });
        //       });
        //     }
        //   } else {
        //     if (itemFulfillment.status === 'cancelled') {
        //       ship_price =
        //         ship_price +
        //         (itemFulfillment?.shipment?.shipping_fee_informed_to_customer
        //           ? itemFulfillment.shipment.shipping_fee_informed_to_customer
        //           : 0);
        //       total_price = total_price + (itemFulfillment.total ? itemFulfillment.total : 0);

        //       itemFulfillment.items.forEach(function (itemProduct) {
        //         product.push({
        //           sku: itemProduct.sku,
        //           product_id: itemProduct.product_id,
        //           product: itemProduct.product,
        //           variant_id: itemProduct.variant_id,
        //           variant: itemProduct.variant,
        //           variant_barcode: itemProduct.variant_barcode,
        //           quantity: itemProduct.quantity,
        //           price: itemProduct.price
        //         });
        //       });
        //     }
        //   }

        // });

        if (itemOrder.fulfillments && itemOrder.fulfillments.length !== 0) {
          let indexFFM = itemOrder.fulfillments?.length - 1;// xác định fulfillments cuối cùng. xử dụng cho case hiện tại-> 1 đơn hàng có 1 fulfillments
          let itemFFM = itemOrder.fulfillments[indexFFM];
          ffrmCode = itemFFM.code;

          ship_price =
            ship_price +
            (itemFFM?.shipment?.shipping_fee_informed_to_customer
              ? itemFFM.shipment.shipping_fee_informed_to_customer
              : 0);
          total_price = total_price + (itemFFM.total ? itemFFM.total : 0);

          itemFFM.items.forEach(function (itemProduct) {
            product.push({
              sku: itemProduct.sku,
              product_id: itemProduct.product_id,
              product: itemProduct.product,
              variant_id: itemProduct.variant_id,
              variant: itemProduct.variant,
              variant_barcode: itemProduct.variant_barcode,
              quantity: itemProduct.quantity,
              price: itemProduct.price
            });
          });
        }

        let resultItem: GoodsReceiptsInfoOrderModel = {
          key: index,
          order_id: itemOrder.id ? itemOrder.id : 0,
          order_code: itemOrder.code ? itemOrder.code : "",
          fulfillment_code: ffrmCode,
          customer_id: itemOrder.customer_id || 0,
          customer_name: itemOrder.shipping_address ? itemOrder.shipping_address.name : "",
          customer_phone: itemOrder.shipping_address
            ? itemOrder.shipping_address.phone
            : "không có dữ liệu",
          customer_address: itemOrder.shipping_address ? itemOrder.shipping_address.full_address : "không có dữ liệu",
          product: product,
          ship_price: ship_price,
          total_price: total_price,
        };

        result.push(resultItem);
      });
      setGoodsReceiptsInfoOrderModel(result);
    }
  }, [packDetail]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: any) => {
      const keys = selectedRows.map((row: any) => row.key);
      const codes = selectedRows.map((row: any) => row.fulfillment_code);
      console.log(codes);
      setSelectedRowKeys(keys);
      setSelectedRowCode(codes);
    }
  };

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1: //xóa
          if (selectedRowCode.length === 0) {
            showWarning("Vui lòng chọn đơn hàng cần xóa");
            break;
          }
          let _newItem: string[] = [];

          let orderRemaining= packDetail?.orders?.filter((p)=>!p.fulfillments?.some(p1=>selectedRowCode.some(p2=>p2===p1.code)));
          orderRemaining?.forEach((itemOrder, index)=>{
            if (itemOrder.fulfillments && itemOrder.fulfillments.length !== 0){
              let indexFFM = itemOrder.fulfillments?.length - 1;// xác định fulfillments cuối cùng. xử dụng cho case hiện tại-> 1 đơn hàng có 1 fulfillments
              let itemFFM = itemOrder.fulfillments[indexFFM];
              itemFFM?.code&& _newItem.push(itemFFM?.code);
            }
          })

          let param: any = {
            ...packDetail,
            codes: _newItem,
          };

          dispatch(
            updateGoodsReceipts(PackId, param, (data: GoodsReceiptsResponse) => {
              if (data) {
                showSuccess("Cập nhập biên bản thành công");
                setPackDetail(data);
              }
            })
          );
          setSelectedRowKeys([]);
          break;
      }
    },
    [selectedRowCode, packDetail, dispatch, PackId]
  );

  const insert = (arr: any, index: number, newItem: any) => [
    ...arr.slice(0, index),
    newItem,
    ...arr.slice(index)
  ]

  const handleSubmit = useCallback(
    (value: any) => {

      if (!packDetail) return;
      const orderIdElement: any = document.getElementById("order_id");
      orderIdElement?.select();
      let order_id = value.order_id?.trim().toUpperCase();

      if (!order_id) {
        showWarning("Vui lòng chọn đơn hàng cần thêm");
        return;
      }

      let indexOrder = packDetail.orders?.findIndex((p) => p.code === order_id);
      if (indexOrder !== -1) {
        showWarning("Đơn hàng đã tồn tại trong biên bản");
        return;
      }
      let codes: string[] = []

      // if (packDetail.orders)
      //   codes = packDetail.orders?.map((p) => {
      //     if (packDetail.receipt_type_id === 1) {
      //       let fulfillments = p.fulfillments
      //         ?.filter(f => f.status === "packed");
      //       if (fulfillments && fulfillments.length > 0) {
      //         return fulfillments[0].code ? fulfillments[0].code : ""
      //       }
      //       return "";
      //     } else if (packDetail.receipt_type_id === 2) {
      //       let fulfillments = p.fulfillments
      //         ?.filter(f => f.status === "cancelled" && f.return_status === "returning");
      //       if (fulfillments && fulfillments.length > 0) {
      //         return fulfillments[0].code ? fulfillments[0].code : ""
      //       }
      //       return "";
      //     } else {
      //       return "";
      //     }
      //   });

      if (packDetail.orders) {
        packDetail?.orders?.forEach((item) => {
          if (item.fulfillments && item.fulfillments.length > 0) {
            let indexFFM = item.fulfillments.length - 1;

            if (packDetail.receipt_type_id === 1 && item.fulfillments[indexFFM].status === FulFillmentStatus.PACKED) {
              let FFMCode: string | null = item.fulfillments[indexFFM].code;
              FFMCode && codes.push(FFMCode);
            }
            else if (packDetail.receipt_type_id === 2
              && item.fulfillments[indexFFM].return_status === FulFillmentStatus.RETURNING
              && item.fulfillments[indexFFM].status === FulFillmentStatus.CANCELLED) {
              let FFMCode: string | null = item.fulfillments[indexFFM].code;
              FFMCode && codes.push(FFMCode);
            }
          }
        });
      }
      if (codes.indexOf(order_id) === -1) {

        codes = insert([...codes], 0, order_id);

        console.log("codes", codes)

        let id = packDetail?.id ? packDetail?.id : 0;
        let param: any = {
          ...packDetail,
          codes: codes,
        };

        dispatch(
          updateGoodsReceipts(id, param, (data: GoodsReceiptsResponse) => {
            if (data) {
              setPackDetail(data);
              showSuccess("Thêm đơn hàng vào biên bản thành công");
            }

            orderIdElement?.select();
          })
        );
      }
      else {
        showWarning(`${order_id} đã có trong biên bản!`);
        orderIdElement?.select();
      }
    },
    [dispatch, packDetail]
  );

  const columns: Array<ICustomTableColumType<GoodsReceiptsInfoOrderModel>> = [
    {
      title: "ID",
      dataIndex: "order_code",
      visible: true,
      className: "custom-shadow-td",
      width: "10%",
      render: (value: string, i: GoodsReceiptsInfoOrderModel) => {
        return (
          <React.Fragment>
            <Link
              target="_blank"
              to={`${UrlConfig.ORDER}/${i.order_id}`}
              style={{ fontWeight: 500, whiteSpace: "nowrap" }}
            >
              {value}
            </Link>
          </React.Fragment>
        );
      },
    },
    {
      title: "Khách hàng",
      dataIndex: "customer_name",
      render: (value: string, i: GoodsReceiptsInfoOrderModel) => {
        return (
          <React.Fragment>
            <div style={{ padding: "5px 10px" }}>
              <Link target="_blank" to={`${UrlConfig.CUSTOMER}/${i.customer_id}`}>
                {value}
              </Link>
              <div style={{ fontSize: "0.86em" }}>{i.customer_phone}</div>
              <div style={{ fontSize: "0.86em", marginTop: 5 }}>{i.customer_address}</div>
            </div>
          </React.Fragment>
        );
      },
      visible: true,
      className: "custom-shadow-td customer-column",
      width: "25%",
    },
    {
      title: (
        <div className="productNameQuantityHeader">
          <span className="productNameWidth">Sản phẩm</span>
          <span className="quantity quantityWidth">
            <span>SL</span>
          </span>
          <span className="price priceWidth">
            <span>Giá</span>
          </span>
        </div>
      ),
      dataIndex: "product",
      key: "product",
      className: "productNameQuantity",
      render: (items: Array<VariantModel>) => {
        return (
          <div className="items">
            {items.map((item, i) => {
              return (
                <div className="item custom-td">
                  <div className="product productNameWidth">
                    <Link
                      target="_blank"
                      to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                    >
                      {item.variant}
                    </Link>
                  </div>
                  <div className="quantity quantityWidth">
                    <span>{item.quantity}</span>
                  </div>
                  <div className="price priceWidth">
                    <span>{formatCurrency(item?.price || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
      visible: true,
      align: "left",
      width: "25%",
    },
    {
      title: "Cước phí",
      dataIndex: "ship_price",
      render: (value: number) => <div>{formatCurrency(value || 0)}</div>,
      key: "ship_price",
      visible: true,
      align: "center",
    },
    {
      title: "Tổng thu",
      dataIndex: "total_price",
      render: (value: number) => <div>{formatCurrency(value || 0)}</div>,
      key: "total_price",
      visible: true,
      align: "center",
    },
  ];

  const eventBarcodeOrder = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLBodyElement) {
      if (event.key !== "Enter") {
        barcode += event.key.toUpperCase();
      }
      else {
        if (!packDetail) return;

        let indexOrder = packDetail?.orders?.findIndex((p) => p.code === barcode);
        if (indexOrder !== -1) {
          showWarning("Đơn hàng đã tồn tại trong biên bản");
          return;
        }

        let codes: string[] = [];

        packDetail?.orders?.forEach((item) => {
          if (item.fulfillments && item.fulfillments.length > 0) {
            let indexFFM = item.fulfillments.length - 1;
            let FFMCode: string | null = item.fulfillments[indexFFM].code;
            FFMCode && codes.push(FFMCode);
          }
        });

        if (codes.indexOf(barcode) === -1) {
          codes = insert([...codes], 0, barcode);
          let id = packDetail?.id ? packDetail?.id : 0;
          let param: any = {
            ...packDetail,
            codes: codes,
          };

          dispatch(
            updateGoodsReceipts(id, param, (data: GoodsReceiptsResponse) => {
              if (data) {
                setPackDetail(data);
                showSuccess("Thêm đơn hàng vào biên bản thành công");
              }
            })
          );
        }
        else {
          showWarning(`${barcode} đã có trong biên bản!`);
        }
        barcode = "";
      }
    }
  }, [dispatch, packDetail]);

  useEffect(() => {
    const orderIdElement: any = document.getElementById("order_id");

    orderIdElement?.addEventListener("focus", (e: any) => {
      orderIdElement.select();
    });

    window.addEventListener("keypress", eventBarcodeOrder);
    return () => {
      window.removeEventListener("keypress", eventBarcodeOrder);
    }
  }, [eventBarcodeOrder]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Hỗ trợ đóng gói"
        isError={isError}
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Đơn hàng",
            path: UrlConfig.ORDER,
          },
          {
            name: "Biên bản bàn giao",
            path: UrlConfig.DELIVERY_RECORDS,
          },
          {
            name: `Biên bản bàn giao: ${PackId}`,
            path: `${UrlConfig.DELIVERY_RECORDS}/${PackId}`
          },
          {
            name: "Thêm đơn hàng",
          },
        ]}
      >
        <Card title="Thông tin biên bản bàn giao">
          <Row
            align="middle"
            justify="space-between"
            style={{
              height: "40px",
              marginLeft: "14px",
              marginRight: "14px",
            }}
            className="pack-info-order"
          >
            <Col md={6}>
              <Space>
                <span className="t1-color">Ngày:</span>
                <span className="t1">
                  {moment(packDetail?.updated_date).format("DD/MM/YYYY")}
                </span>
                <span className="t1">{packDetail?.orders?.length} đơn</span>
              </Space>
            </Col>

            <Col md={8}>
              <Space>
                <span className="t1-color">Cửa hàng:</span>
                <span className="t1">{packDetail?.store_name}</span>
              </Space>
            </Col>

            <Col md={10}>
              <Space>
                <span className="t1-color">Biên bản sàn:</span>
                <span className="t1">{packDetail?.ecommerce_name}</span>
              </Space>
            </Col>
          </Row>
          <Row
            align="middle"
            justify="space-between"
            style={{
              height: "40px",
              marginLeft: "14px",
              marginRight: "14px",
            }}
            className="pack-info-order"
          >
            <Col md={6}>
              <Space>
                <span className="t1-color">Loại:</span>
                <span className="t1">{packDetail?.receipt_type_name}</span>
              </Space>
            </Col>

            <Col md={8}>
              <Space>
                <span className="t1-color">Hãng vận chuyển:</span>
                <span className="t1">{packDetail?.delivery_service_name}</span>
              </Space>
            </Col>
            <Col md={10}></Col>
          </Row>
        </Card>

        <Card title="Thông tin biên bản bàn giao" className="pack-info-update-card">
          <div className="order-filter">
            <div className="page-filter" style={{ padding: "0px 0px 20px 0px" }}>
              <div className="page-filter-heading">
                <div className="page-filter-left">
                  <ActionButton menu={actions} onMenuClick={onMenuClick} />
                </div>
                <div
                  className="page-filter-right"
                  style={{ width: "88%", display: "flex", justifyContent: "flex-end" }}
                >
                  <Form
                    layout="inline"
                    ref={formSearchOrderRef}
                    form={searchOrderForm}
                    onFinish={handleSubmit}
                  >
                    <Item name="order_id" style={{ width: 400 }}>
                      <Input
                        prefix={<img src={search} alt="" />}
                        placeholder="ID đơn hàng/Mã vận đơn"
                      />
                    </Item>
                    <Item style={{ width: 150, marginRight: 0 }}>
                      <Button
                        type="primary"
                        //onClick={handleSearchOrder}
                        htmlType="submit"
                        style={{ width: 150 }}
                      >
                        Thêm đơn hàng
                      </Button>
                    </Item>
                  </Form>
                </div>
              </div>
            </div>
          </div>
          <Table
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
            bordered
            columns={columns}
            dataSource={goodsReceiptsInfoOrderModel}
          //key={Math.random()}
          />
        </Card>
      </ContentContainer>
    </StyledComponent>
  );
};

export default PackUpdate;
