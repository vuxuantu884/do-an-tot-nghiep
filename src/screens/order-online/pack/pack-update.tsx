import { DeleteOutlined } from "@ant-design/icons";
import { Card, Col, Row, Space, Form, Input, Button, FormInstance } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ContentContainer from "component/container/content.container";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import UrlConfig from "config/url.config";
import {
  deleteOrdergoodsReceips,
  getByIdGoodsReceipts,
  // getOrderGoodsReceipts,
  updateGoodsReceipts,
} from "domain/actions/goods-receipts/goods-receipts.action";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import search from "assets/img/search.svg";
import moment from "moment";
import "./styles.scss";
import { GoodsReceiptsInfoOrderModel, VariantModel } from "model/pack/pack.model";
import { Link } from "react-router-dom";
import { StyledComponent } from "./styles";
import { showModalError, showSuccess, showWarning } from "utils/ToastUtils";
import { formatCurrency, insertCustomIndexArray } from "utils/AppUtils";
import { PagingParam, ResultPaging } from "model/paging";
import { flatDataPaging } from "utils/Paging";
import ButtonWarningHandover from "./component/button-warning-handover";
import { getFulfillmentActive, isFulfillmentPacked } from "utils/fulfillmentUtils";

const { Item } = Form;
type PackParam = {
  id: string;
};

const resultPagingDefault: ResultPaging = {
  currentPage: 1,
  lastPage: 1,
  perPage: 30,
  total: 0,
  result: [],
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedRowCode, setSelectedRowCode] = useState<string[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [selectedRowOrderId, setSelectedRowOrderId] = useState<number[]>([]);
  const [pagingParam, setPagingParam] = useState<PagingParam>({
    currentPage: resultPagingDefault.currentPage,
    perPage: resultPagingDefault.perPage,
  });
  const [resultPaging, setResultPaging] = useState<ResultPaging>(resultPagingDefault);

  const actions: Array<MenuAction> = [
    {
      id: 1,
      name: "Xóa",
      icon: <DeleteOutlined />,
      color: selectedRowKeys.length === 0 ? "rgba(0,0,0,.25)" : "#E24343",
      //disabled: selectedRowKeys.length === 0
      disabled: false,
    },
  ];

  const stores = useMemo(() => {
    let result: any = [];
    const storeId = packDetail?.store_id;
    if (storeId) {
      result.push({
        id: storeId,
      });
    }
    return result;
  }, [packDetail?.store_id]);

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
      packDetail.orders?.forEach((itemOrder, index) => {
        let product: VariantModel[] = [];
        let ship_price = 0;
        let total_price = 0;

        let fulfillments = getFulfillmentActive(itemOrder.fulfillments);

        ship_price = itemOrder?.shipping_fee_informed_to_customer || 0;
        total_price = (fulfillments && fulfillments.total) || 0;

        fulfillments &&
          fulfillments.items.forEach((itemProduct) => {
            product.push({
              sku: itemProduct.sku,
              product_id: itemProduct.product_id,
              product: itemProduct.product,
              variant_id: itemProduct.variant_id,
              variant: itemProduct.variant,
              variant_barcode: itemProduct.variant_barcode,
              quantity: itemProduct.quantity,
              price: itemProduct.price,
            });
          });
        //}

        let resultItem: GoodsReceiptsInfoOrderModel = {
          key: index,
          order_id: itemOrder.id ? itemOrder.id : 0,
          order_code: itemOrder.code ? itemOrder.code : "",
          fulfillment_code: fulfillments?.code,
          customer_id: itemOrder.customer_id || 0,
          customer_name: itemOrder.shipping_address ? itemOrder.shipping_address.name : "",
          customer_phone: itemOrder.shipping_address
            ? itemOrder.shipping_address.phone
            : "không có dữ liệu",
          customer_address: itemOrder.shipping_address
            ? itemOrder.shipping_address.full_address
            : "không có dữ liệu",
          product: product,
          ship_price: ship_price,
          total_price: total_price,
        };

        result.push(resultItem);
      });
      setGoodsReceiptsInfoOrderModel(result);
    }
  }, [packDetail]);

  const onSelectedChange = (
    selectedRow: GoodsReceiptsInfoOrderModel[],
    selected?: boolean,
    changeRow?: any[],
  ) => {
    let selectedRowKeysCopy: number[] = [...selectedRowKeys];
    let selectedRowOrderIdCopy: number[] = [...selectedRowOrderId];
    let selectedRowCodeCopy: string[] = [...selectedRowCode];

    if (selected === true) {
      changeRow?.forEach((data, index) => {
        let indexItem = selectedRowKeys.findIndex((p) => p === data.key);
        if (indexItem === -1) {
          selectedRowKeysCopy.push(data.key);
          selectedRowOrderIdCopy.push(data.order_id);
          selectedRowCodeCopy.push(data.fulfillment_code);
        }
      });
    } else {
      selectedRowKeys.forEach((data, index) => {
        let indexItem = changeRow?.findIndex((p) => p.key === data);

        if (indexItem !== -1) {
          let i = selectedRowKeysCopy.findIndex((p) => p === data);
          selectedRowKeysCopy.splice(i, 1);
          selectedRowOrderIdCopy.splice(i, 1);
          selectedRowCodeCopy.splice(i, 1);
        }
      });
    }

    setSelectedRowOrderId([...selectedRowOrderIdCopy]);
    setSelectedRowKeys([...selectedRowKeysCopy]);
    setSelectedRowCode([...selectedRowCodeCopy]);
  };

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1: //xóa
          //showWarning("Đang bảo trì");
          if (!packDetail) return;
          if (selectedRowOrderId.length === 0) {
            showWarning("Vui lòng chọn đơn hàng cần xóa");
            break;
          }

          let receitpsId = packDetail?.id;
          let orderIds = [...selectedRowOrderId];

          // console.log(selectedRowOrderId);
          dispatch(
            deleteOrdergoodsReceips(orderIds, receitpsId, (success?: boolean) => {
              success && dispatch(getByIdGoodsReceipts(PackId, setPackDetail));
            }),
          );
          setSelectedRowKeys([]);
          setSelectedRowCode([]);
          setSelectedRowOrderId([]);
          break;
      }
    },
    [PackId, dispatch, packDetail, selectedRowOrderId],
  );

  const handleSubmit = useCallback(
    (value: any) => {
      if (!packDetail) return;

      const orderIdElement: any = document.getElementById("order_id");
      orderIdElement?.select();
      let order_id = value.order_id?.trim().toUpperCase();
      let success = true;

      if (!order_id) {
        showWarning("Vui lòng chọn đơn hàng cần thêm");
        return;
      }

      let indexOrder = packDetail.orders?.findIndex((p) => p.code === order_id);
      // console.log("0", packDetail?.orders)
      if (indexOrder !== -1) {
        showWarning("Đơn hàng đã tồn tại trong biên bản");
        return;
      }
      let codes: string[] = [];

      if (packDetail && packDetail.orders && packDetail.orders.length > 0) {
        packDetail?.orders?.forEach((orderItem) => {
          let fulfillments = orderItem.fulfillments;
          let fulfillment = getFulfillmentActive(fulfillments);
          /**
           * receipt_type_id === 1 => đơn chuyển đi
           */
          if (!isFulfillmentPacked(fulfillment) && packDetail.receipt_type_id === 1) {
            success = false;
            showModalError(
              `Không thể cập nhật biên bản, Đơn hàng ${orderItem?.code} không ở trạng thái đã đóng gói`,
            );
          }

          if (success) {
            if (fulfillment?.code && order_id !== fulfillment?.code) codes.push(fulfillment?.code);
            else {
              success = false;
              showModalError(`Đơn hàng ${fulfillment?.code} đã có trong biên bản`);
            }
          }
        });

        if (packDetail.orders?.length !== codes.length && success) {
          showModalError("Không thể cập nhật biên bản do mất đơn hàng");
          success = false;
        }
      }

      codes = insertCustomIndexArray([...codes], 0, order_id);

      let id = packDetail?.id ? packDetail?.id : 0;
      let param: any = {
        ...packDetail,
        codes: codes,
      };

      if (success) {
        dispatch(
          updateGoodsReceipts(id, param, (data: GoodsReceiptsResponse) => {
            if (data) {
              setPackDetail(data);
              showSuccess("Thêm đơn hàng vào biên bản thành công");
              searchOrderForm?.resetFields();
            }

            orderIdElement?.select();
          }),
        );
      }
    },
    [dispatch, packDetail, searchOrderForm],
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

  const eventBarcodeOrder = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLBodyElement) {
        if (event.key !== "Enter") {
          barcode += event.key.toUpperCase();
        } else {
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
            codes = insertCustomIndexArray([...codes], 0, barcode);
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
              }),
            );
          } else {
            showWarning(`${barcode} đã có trong biên bản!`);
          }
          barcode = "";
        }
      }
    },
    [dispatch, packDetail],
  );

  useEffect(() => {
    const orderIdElement: any = document.getElementById("order_id");

    orderIdElement?.addEventListener("focus", (e: any) => {
      orderIdElement.select();
    });

    window.addEventListener("keypress", eventBarcodeOrder);
    return () => {
      window.removeEventListener("keypress", eventBarcodeOrder);
    };
  }, [eventBarcodeOrder]);

  useEffect(() => {
    if (
      !goodsReceiptsInfoOrderModel ||
      (goodsReceiptsInfoOrderModel && goodsReceiptsInfoOrderModel.length <= 0)
    ) {
      setResultPaging(resultPagingDefault);
    } else {
      let result = flatDataPaging(goodsReceiptsInfoOrderModel, pagingParam);
      setResultPaging(result);
    }
  }, [goodsReceiptsInfoOrderModel, pagingParam]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Hỗ trợ đóng gói"
        isError={isError}
        breadcrumb={[
          {
            name: "Đơn hàng",
            path: UrlConfig.ORDER,
          },
          {
            name: "Biên bản bàn giao",
            path: UrlConfig.DELIVERY_RECORDS,
          },
          {
            name: `Biên bản bàn giao ${PackId}`,
            path: `${UrlConfig.DELIVERY_RECORDS}/${PackId}`,
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
                <span className="t1">{moment(packDetail?.updated_date).format("DD/MM/YYYY")}</span>
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

        <Card
          title="Thông tin biên bản bàn giao"
          className="pack-info-update-card"
          extra={<ButtonWarningHandover stores={stores} isHiddenCreate={true} />}
        >
          <div className="order-filter">
            <div className="page-filter" style={{ padding: "0px 0px 20px 0px" }}>
              <div className="page-filter-heading">
                <div className="page-filter-left">
                  <ActionButton menu={actions} onMenuClick={onMenuClick} />
                </div>
                <div
                  className="page-filter-right"
                  style={{
                    width: "88%",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
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

          <CustomTable
            bordered
            isRowSelection
            pagination={{
              pageSize: resultPaging.perPage,
              total: resultPaging.total,
              current: resultPaging.currentPage,
              showSizeChanger: true,
              onChange: (page, size) => {
                // console.log("size", size)
                setPagingParam({ perPage: size || 10, currentPage: page });
              },
              onShowSizeChange: (page, size) => {
                setPagingParam({ perPage: size || 10, currentPage: page });
              },
            }}
            onSelectedChange={(selectedRows, selected, changeRow) =>
              onSelectedChange(selectedRows, selected, changeRow)
            }
            selectedRowKey={selectedRowKeys}
            dataSource={resultPaging.result}
            columns={columns}
            rowKey={(item: any) => item.key}
          />
        </Card>
      </ContentContainer>
    </StyledComponent>
  );
};

export default PackUpdate;
