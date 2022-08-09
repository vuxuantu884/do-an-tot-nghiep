import { DeleteOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, List, Row, Space } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import ActionButton from "component/table/ActionButton";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { FulfillmentDto, FulfillmentLineItemDto } from "model/handover/fulfillment.dto";
import { HandoverResponse } from "model/handover/handover.response";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { fulfillmentListService } from "service/handover/ffm.service";
import {
  deleteOrderHandoverService,
  getHandoverService,
  printHandOverService,
} from "service/handover/handover.service";
import { formatCurrency, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import DetailHandoverComponent from "./component/detail/detail.component";
import { DetailStyle } from "./detail.styles";
import search from "assets/img/search.svg";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import emptyProduct from "assets/icon/empty_products.svg";
import PrintComponent from "component/print";
import { showWarning } from "utils/ToastUtils";
import { PagingParam, ResultPaging } from "model/paging";
import { flatDataPaging } from "utils/Paging";

type HandoverParams = {
  id: string;
};

interface DetailLoading<T> {
  isLoad: boolean;
  isError: boolean;
  data: T | null;
}

const typePrint = {
  simple: "simple",
  detail: "detail",
};

export interface HandoverProductView {
  sku: string;
  variant: string;
  quantity: number;
  variant_id: number;
  product_id: number;
}

const resultPagingDefault: ResultPaging = {
  currentPage: 1,
  lastPage: 1,
  perPage: 30,
  total: 0,
  result: [],
};

const DetailHandoverScreen: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [filterKey, setFilterKey] = useState<string>("");
  const [selected, setSelected] = useState<Array<string>>([]);
  const [handoverData, setHandoverData] = useState<DetailLoading<HandoverResponse>>({
    isLoad: false,
    data: null,
    isError: false,
  });
  const [fulfillmentsData, setFulfillmentData] = useState<DetailLoading<Array<FulfillmentDto>>>({
    isLoad: false,
    data: null,
    isError: false,
  });

  const [isLoading, setLoading] = useState<boolean>(true);
  const [htmlContent, setHtmlContent] = useState<string | string[]>("");

  const [pagingParam, setPagingParam] = useState<PagingParam>({
    currentPage: resultPagingDefault.currentPage,
    perPage: resultPagingDefault.perPage,
  });
  const [resultPaging, setResultPaging] = useState<ResultPaging>(resultPagingDefault);

  let { id } = useParams<HandoverParams>();
  let handoverId = parseInt(id);

  useEffect(() => {
    if (!handoverData.isLoad) {
      getHandoverService(handoverId)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setHandoverData({
              isLoad: true,
              data: response.data,
              isError: false,
            });
            return;
          }
          setHandoverData({
            isLoad: true,
            data: null,
            isError: true,
          });
        })
        .catch(() => {
          setHandoverData({
            isLoad: true,
            data: null,
            isError: true,
          });
        });
    }
  }, [handoverData.isLoad, handoverId]);

  const fulfillmentsDto = useMemo(() => {
    let result = [];
    if (fulfillmentsData.data == null) {
      return [];
    }
    if (filterKey === "") {
      result = fulfillmentsData.data;
    }
    result = fulfillmentsData.data.filter((value) => {
      return value.code.includes(filterKey) || value.order_code.includes(filterKey);
    });

    return result.map((p, index) => {
      return {
        ...p,
        key: index,
      };
    });
  }, [filterKey, fulfillmentsData.data]);

  useEffect(() => {
    if (!fulfillmentsDto || (fulfillmentsDto && fulfillmentsDto.length <= 0)) {
      setResultPaging(resultPagingDefault);
    } else {
      let result = flatDataPaging(fulfillmentsDto, pagingParam);
      setResultPaging(result);
    }
  }, [fulfillmentsDto, pagingParam]);

  const onSelectedChange = useCallback(
    (selectedRow: Array<FulfillmentDto>) => {
      let fulfillments = selectedRow.filter(function (el) {
        return el !== undefined;
      });
      setSelected(fulfillments.map((value) => value.code));
    },
    [setSelected],
  );

  const getFulfillments = (codes: Array<string>) => {
    return fulfillmentListService(codes).then((response) => {
      if (isFetchApiSuccessful(response)) {
        setFulfillmentData({
          isLoad: true,
          data: response.data.items,
          isError: false,
        });
        return;
      }
      setHandoverData({
        isLoad: true,
        data: null,
        isError: true,
      });
    });
  };

  useEffect(() => {
    if (handoverData.isLoad && !fulfillmentsData.isLoad) {
      let codes = handoverData.data?.orders.map((value) => value.fulfillment_code);
      if (codes === undefined || codes.length === 0) {
        setFulfillmentData({
          isLoad: true,
          data: [],
          isError: false,
        });
        return;
      }
      getFulfillments(codes);
    }
  }, [fulfillmentsData.isLoad, handoverData.data?.orders, handoverData.isLoad]);

  const print = useCallback(() => {}, []);
  const deleteOrder = useCallback(() => {
    if (selected === undefined || selected === null || selected.length === 0) {
      return;
    }
    dispatch(showLoading());
    deleteOrderHandoverService(handoverId, selected)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          setHandoverData({
            ...handoverData,
            data: response.data,
          });
          let codes = response.data.orders.map((value) => value.fulfillment_code);
          if (codes === undefined || codes.length === 0) {
            setFulfillmentData({
              isLoad: true,
              data: [],
              isError: false,
            });
            return;
          }
          getFulfillments(codes);
          setSelected([]);
        }
      })
      .catch(() => {})
      .finally(() => dispatch(hideLoading()));
  }, [dispatch, handoverData, handoverId, selected]);

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          print();
          break;
        case 2:
          deleteOrder();
          break;
      }
    },
    [deleteOrder, print],
  );

  const handoverProduct = useMemo(() => {
    let arrayProduct: Array<HandoverProductView> = [];
    if (fulfillmentsData.isLoad) {
      fulfillmentsData.data?.forEach((fulfillment) => {
        fulfillment.items.forEach((product) => {
          let index = arrayProduct.findIndex((view) => view.variant_id === product.variant_id);
          if (index === -1) {
            arrayProduct.push({
              product_id: product.product_id,
              variant_id: product.variant_id,
              sku: product.sku,
              variant: product.variant,
              quantity: product.quantity,
            });
            return;
          }
          arrayProduct[index].quantity = arrayProduct[index].quantity + product.quantity;
        });
      });
    }
    return arrayProduct;
  }, [fulfillmentsData.data, fulfillmentsData.isLoad]);

  const handlePrintPack = useCallback(
    (type: string) => {
      if (handoverId) {
        dispatch(showLoading());
        printHandOverService(handoverId, type)
          .then((response) => {
            if (isFetchApiSuccessful(response)) {
              if (response.data) {
                setHtmlContent(response.data[0].html_content);
              }
            } else {
              handleFetchApiError(response, "In biên bản bàn giao", dispatch);
            }
          })
          .catch((e) => console.log(e))
          .finally(() => dispatch(hideLoading()));
      }
    },
    [dispatch, handoverId],
  );

  useEffect(() => {
    if (fulfillmentsData.isLoad && handoverData.isLoad) {
      setLoading(false);
    }
  }, [fulfillmentsData.isLoad, handoverData.isLoad]);

  return (
    <DetailStyle>
      <ContentContainer
        isLoading={isLoading}
        isError={handoverData.isError}
        title="Biên bản bàn giao"
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
            path: UrlConfig.HANDOVER,
          },
          {
            name: "Biên bản " + (handoverData.data ? handoverData.data?.id : ""),
          },
        ]}
      >
        {handoverData.isLoad && !handoverData.isError && handoverData.data !== null && (
          <React.Fragment>
            <Row gutter={20}>
              <Col span={17}>
                <DetailHandoverComponent data={handoverData.data} />
                <Card className="order-list" title="Danh sách đơn hàng">
                  {fulfillmentsDto.length === 0 ? (
                    <div className="empty-view">
                      <img src={emptyProduct} alt="empty product" />
                      <Button
                        onClick={() => {
                          history.push(`${UrlConfig.HANDOVER}/${handoverId}/update`);
                        }}
                        type="primary"
                      >
                        Thêm đơn hàng vào biên bản
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="page-filter">
                        <div className="page-filter-heading">
                          <div className="page-filter-left">
                            <ActionButton
                              menu={[
                                {
                                  id: 1,
                                  name: "In lại đơn giao",
                                  icon: <PrinterOutlined />,
                                  disabled: selected.length === 0,
                                  color: "#141414",
                                },
                                {
                                  id: 2,
                                  name: "Xóa",
                                  icon: <DeleteOutlined />,
                                  color: "#E24343",
                                  disabled: selected.length === 0,
                                },
                              ]}
                              onMenuClick={onMenuClick}
                            />
                          </div>
                          <Input
                            id="input-search"
                            value={filterKey}
                            onChange={(a) => setFilterKey(a.target.value.toUpperCase())}
                            className="input-search"
                            style={{ width: "100%" }}
                            prefix={<img src={search} alt="" />}
                            placeholder="ID đơn hàng/Mã vận đơn"
                          />
                        </div>
                      </div>
                      <CustomTable
                        scroll={{ x: 800 }}
                        isRowSelection
                        bordered
                        selectedRowKey={selected}
                        rowKey={(fulfillment: FulfillmentDto) => fulfillment.code}
                        dataSource={resultPaging.result}
                        onSelectedChange={onSelectedChange}
                        columns={[
                          {
                            title: "STT",
                            key: "STT",
                            dataIndex: "key",
                            render: (value, record, index) => value + 1,
                            align: "center",
                            width: "60px",
                            fixed: "left",
                          },
                          {
                            title: "Mã đơn hàng",
                            key: "order_code",
                            dataIndex: "order_code",
                            render: (value, record, index) => (
                              <React.Fragment>
                                <div>
                                  <Link to={`${UrlConfig.ORDER}/${record.order_id}`}>{value}</Link>
                                </div>
                                <div>
                                  <Link
                                    to={`${UrlConfig.ORDER}/${record.order_id}`}
                                    className="fulfillment-small"
                                  >
                                    {record.code}
                                  </Link>
                                </div>
                              </React.Fragment>
                            ),
                            align: "center",
                            width: "130px",
                            fixed: "left",
                          },
                          {
                            title: "Khách hàng",
                            key: "customer",
                            dataIndex: "customer",
                            render: (value, record, index) => value,
                            align: "center",
                            width: "120px",
                            fixed: "left",
                          },
                          {
                            dataIndex: "items",
                            title: "Sản phẩm",
                            width: "300px",
                            className: "products",
                            render: (data) => {
                              return (
                                <div>
                                  {data.map((item: FulfillmentLineItemDto, index: number) => {
                                    return (
                                      <div key={index.toString()} className="row-item">
                                        <Link
                                          target="_blank"
                                          to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                                          className="product-name-ellipsis"
                                          title={item.variant}
                                        >
                                          {item.variant}
                                        </Link>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            },
                          },
                          {
                            dataIndex: "sub_status",
                            key: "sub_status",
                            title: "Trạng thái",
                            width: "130px",
                            align: "center",
                            render: (value) => <div className="status-color">{value}</div>,
                          },
                          {
                            dataIndex: "items",
                            title: "SL",
                            width: "100px",
                            align: "center",
                            className: "products",
                            render: (data) => {
                              return (
                                <div>
                                  {data.map((item: FulfillmentLineItemDto, index: number) => {
                                    return (
                                      <div key={index.toString()} className="row-item center">
                                        {item.quantity}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            },
                          },
                          {
                            dataIndex: "items",
                            title: "Giá",
                            align: "center",
                            width: "100px",
                            className: "products",
                            render: (data) => {
                              return (
                                <div>
                                  {data.map((item: FulfillmentLineItemDto, index: number) => {
                                    return (
                                      <div key={index.toString()} className="row-item center">
                                        {formatCurrency(item.price)}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            },
                          },
                          {
                            dataIndex: "shipment",
                            title: "Cước phí",
                            align: "center",
                            width: "100px",
                            render: (value, data, index) =>
                              formatCurrency(data.shipping_fee_informed_to_customer),
                          },
                          {
                            dataIndex: "total",
                            title: "Tổng thu",
                            width: "100px",
                            align: "center",
                            render: (data) => formatCurrency(data),
                          },
                        ]}
                        pagination={{
                          pageSize: resultPaging.perPage,
                          total: resultPaging.total,
                          current: resultPaging.currentPage,
                          showSizeChanger: true,
                          onChange: (page, size) => {
                            setPagingParam({ perPage: size || 10, currentPage: page });
                          },
                          onShowSizeChange: (page, size) => {
                            setPagingParam({ perPage: size || 10, currentPage: page });
                          },
                        }}
                      />
                    </>
                  )}
                </Card>
              </Col>
              <Col span={7}>
                <Card title="Danh sách sản phẩm">
                  <List
                    locale={{
                      emptyText: "Không có sản phẩm",
                    }}
                    dataSource={handoverProduct}
                    rowKey={(handoverProduct) => handoverProduct.variant_id.toString()}
                    renderItem={(item) => (
                      <div className="row-product-item">
                        <Link
                          target="_blank"
                          to={`${UrlConfig.PRODUCT}/${item.product_id}${UrlConfig.VARIANTS}/${item.variant_id}`}
                          className="yody-text-ellipsis"
                          title={item.variant}
                        >
                          {item.variant}
                        </Link>
                        <Space className="row-sku">
                          <div className="sku">{item.sku}</div>
                          <div className="quantity">
                            x{` `}
                            {item.quantity}
                          </div>
                        </Space>
                      </div>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </React.Fragment>
        )}
        <BottomBarContainer
          back="Trở lại danh sách"
          rightComponent={
            <Space>
              <Button
                disabled={!fulfillmentsData.data || fulfillmentsData.data.length === 0}
                icon={<PrinterOutlined />}
                onClick={() => {
                  handlePrintPack(typePrint.simple);
                }}
              >
                In biên bản
              </Button>
              {/* <Button
                disabled={!fulfillmentsData.data || fulfillmentsData.data.length === 0}
                icon={<PrinterOutlined />}
                onClick={() => {
                  showWarning("Đang bảo trì");
                }}
              >
                In biên bản đầy đủ
              </Button> */}
              <Button
                onClick={() => {
                  history.push(`${UrlConfig.HANDOVER}/${handoverId}/update`);
                }}
                type="primary"
              >
                Chỉnh sửa biên bản
              </Button>
            </Space>
          }
        />
        <PrintComponent htmlContent={htmlContent} setHtmlContent={setHtmlContent} />
      </ContentContainer>
    </DetailStyle>
  );
};

export default DetailHandoverScreen;
