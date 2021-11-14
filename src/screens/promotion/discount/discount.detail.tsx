import {Button, Card, Col, Divider, Row, Space} from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useParams} from "react-router";
import {Link} from "react-router-dom";
import moment from "moment";
import Countdown from "react-countdown";
import "./discount.scss";
import {DiscountResponse} from "model/response/promotion/discount/list-discount.response";
import {DATE_FORMAT} from "utils/DateUtils";
import "domain/actions/promotion/promo-code/promo-code.action";
import {StoreGetListAction} from "domain/actions/core/store.action";
import {getListSourceRequest} from "domain/actions/product/source.action";
import {StoreResponse} from "model/core/store.model";
import {SourceResponse} from "model/response/order/source.response";
import {
  bulkEnablePriceRules,
  getVariants,
  promoGetDetail,
} from "../../../domain/actions/promotion/discount/discount.action";
import CustomTable from "../../../component/table/CustomTable";
import {formatCurrency} from "../../../utils/AppUtils";
import {ChannelResponse} from "model/response/product/channel.response";
import {getListChannelRequest} from "domain/actions/order/order.action";
import BottomBarContainer from "../../../component/container/bottom-bar.container";
import {hideLoading, showLoading} from "../../../domain/actions/loading.action";
import {bulkDisablePriceRules} from "../../../service/promotion/discount/discount.service";
import {HttpStatus} from "../../../config/http-status.config";
import {unauthorizedAction} from "../../../domain/actions/auth/auth.action";
import {showError} from "../../../utils/ToastUtils";

export interface ProductParams {
  id: string;
  variantId: string;
}

type detailMapping = {
  name: string;
  value: string | null;
  position: string;
  key: string;
  isWebsite?: boolean;
};

const discountStatuses = [
  {
    code: "ACTIVE",
    value: "Đang áp dụng",
    style: {
      background: "rgba(42, 42, 134, 0.1)",
      borderRadius: "100px",
      color: "rgb(42, 42, 134)",
      padding: "5px 10px",
      marginLeft: "20px",
    },
  },
  {
    code: "DISABLED",
    value: "Tạm ngưng",
    style: {
      background: "rgba(252, 175, 23, 0.1)",
      borderRadius: "100px",
      color: "#FCAF17",
      padding: "5px 10px",
      marginLeft: "20px",
    },
  },
  {
    code: "DRAFT",
    value: "Chờ áp dụng",
    style: {
      background: "rgb(245, 245, 245)",
      borderRadius: "100px",
      color: "rgb(102, 102, 102)",
      padding: "5px 10px",
      marginLeft: "20px",
    },
  },
  {
    code: "CANCELLED",
    value: "Đã huỷ",
    style: {
      background: "rgba(226, 67, 67, 0.1)",
      borderRadius: "100px",
      color: "rgb(226, 67, 67)",
      padding: "5px 10px",
      marginLeft: "20px",
    },
  },
];

const PromotionDetailScreen: React.FC = () => {
  const dispatch = useDispatch();

  const {id} = useParams() as any;
  const idNumber = parseInt(id);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<DiscountResponse | null>(null);
  const [costType, setCostType] = useState<string>();
  const [dataVariants, setDataVariants] = useState<any | null>(null);
  const [listStore, setListStore] = useState<Array<StoreResponse>>();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);
  const [entitlements, setEntitlements] = useState<Array<any>>([]);
  const [quantityColumn, setQuantityColumn] = useState<any>([]);

  useEffect(() => {
    setTimeout(() => {
      dispatch(StoreGetListAction(setListStore));
      dispatch(getListSourceRequest(setListSource));
      dispatch(getListChannelRequest(setListChannel));
      dispatch(promoGetDetail(idNumber, onResult));
      dispatch(getVariants(idNumber, handleResponse));
    }, 500)
  }, []);

  const onResult = useCallback((result: DiscountResponse | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setData(result);
    }
  }, []);

  const handleResponse = useCallback((result: any | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setDataVariants(result);
    }
  }, []);

  useEffect(() => {
    if (dataVariants && data && data.entitlements.length > 0) {
      const entitlementQuantity = data.entitlements[0].prerequisite_quantity_ranges[0];
      const costType = entitlementQuantity?.value_type;
      const discountValue = entitlementQuantity?.value;
      const allocationLimit = entitlementQuantity?.allocation_limit;
      const minimum = entitlementQuantity?.greater_than_or_equal_to;
      setEntitlements(transformData(costType, discountValue, allocationLimit, minimum));
      setCostType(costType);
    }
  }, [data, dataVariants]);

  useEffect(() => {
    const column = [
      {
        title: "STT",
        align: "center",
        render: (value: any, item: any, index: number) => index + 1,
      },
      {
        title: "Sản phẩm",
        dataIndex: "sku",
        visible: true,
        align: "left",
        width: "20%",
        render: (
          value: string,
          item: any,
          index: number,
        ) => {
          return (
            <div>
              <Link to={`${UrlConfig.PRODUCT}/${idNumber}/variants/${item.id}`}>
                {value}
              </Link>
              <div>{item.title}</div>
            </div>
          );
        },
      },
      {
        title: "Giá bán",
        align: "center",
        visible: false,
        dataIndex: "cost",
        render: (
          value: string,
        ) => formatCurrency(value),
      },
      {
        title: "Chiết khấu",
        align: "center",
        dataIndex: "discountValue",
      },
      {
        title: "Giá sau chiết khấu",
        align: "center",
        dataIndex: "total",
        render: (
          value: string,
        ) => <span style={{color: "#E24343"}}>{value}</span>,
      },
      {
        title: "SL Tối thiểu",
        align: "center",
        dataIndex: "minimum",
      },
      {
        title: "Giới hạn",
        align: "center",
        dataIndex: "allocationLimit",
      },
    ];
    const column2 = [
      {
        title: "STT",
        align: "center",
        render: (value: any, item: any, index: number) => index + 1,
      },
      {
        title: "Sản phẩm",
        dataIndex: "sku",
        visible: true,
        align: "left",
        width: "20%",
        render: (
          value: string,
          item: any,
          index: number,
        ) => {
          return (
            <div>
              <Link to={`${UrlConfig.PRODUCT}/${idNumber}/variants/${item.id}`}>
                {value}
              </Link>
              <div>{item.title}</div>
            </div>
          );
        },
      },
      {
        title: "Giá bán",
        align: "center",
        visible: false,
        dataIndex: "cost",
        render: (
          value: string,
        ) => formatCurrency(value),
      },
      {
        title: "Giá cố định",
        align: "center",
        dataIndex: "total",
        render: (value:any) => <span style={{color: "#E24343"}}>{formatCurrency(value)}</span>,
      },
      {
        title: "SL Tối thiểu",
        align: "center",
        dataIndex: "minimum",
      },
      {
        title: "Giới hạn",
        align: "center",
        dataIndex: "allocationLimit",
      },
    ];
    setQuantityColumn(costType !== "FIXED_PRICE" ? column : column2);
  }, [costType]);

  const renderTotalBill = (cost: number, value: number, discount: number, valueType: string) => {
    console.log("cost: ", cost);
    console.log("value: ", value);
    console.log("discount: ", discount);
    console.log("valueType: ", valueType);
    let result = "";
    switch (valueType) {
      case "FIXED_PRICE":
        result = formatCurrency(Math.round(value /1000)*1000);
        break;
      case "FIXED_AMOUNT":
        result = `${formatCurrency(Math.round((cost - discount)/1000)*1000)}`;
        break;
      case "PERCENTAGE":
        result = `${formatCurrency(Math.round((cost - ((cost * discount) / 100)) / 1000)*1000)}`;
        break;
    }
    return result;
  };

  const renderDiscountValue = (value: number, valueType: string) => {
    let result = "";
    switch (valueType) {
      case "FIXED_PRICE":
        result = formatCurrency(value);
        break;
      case "FIXED_AMOUNT":
        result = formatCurrency(value);
        break;
      case "PERCENTAGE":
        result = `${value}%`;
        break;
    }
    return result;
  };

  const transformData = (costType: string, discountValue: number, allocationLimit: number, minimum: number) => {
    let result: any[] = [];
    dataVariants.forEach((variant: any) => {
      data?.entitlements.forEach(item => {
        const isExit = (item.entitled_variant_ids as number[]).includes(variant.variant_id);
        const value = item.prerequisite_quantity_ranges[0].value;
        if (isExit) {
          result.push({
            id: variant?.variant_id,
            title: variant?.variant_title,
            sku: variant?.sku,
            cost: variant?.cost,
            minimum: minimum,
            allocationLimit: allocationLimit,
            discountValue: `${renderDiscountValue(discountValue, costType)}`,
            total: `${renderTotalBill(variant?.cost, value, discountValue, costType)}`,
          })
        }
      });
    });
    return result;
  };

  const getEntitled_method = (data: DiscountResponse) => {
    if (data.entitled_method === "FIXED_PRICE") return "Đồng giá";
    if (data.entitled_method === "QUANTITY") return "Chiết khấu theo từng sản phẩm";
  };

  const promoDetail: Array<any> | undefined = React.useMemo(() => {
    if (data) {
      const details = [
        {
          name: "Tên khuyến mãi",
          value: data.title,
          position: "left",
          key: "1",
        },
        {
          name: "Mã khuyến mãi",
          value: data.code ? data.code : "",
          position: "left",
          key: "2",
        },
        {
          name: "Phương thức km",
          value: getEntitled_method(data),
          position: "left",
          key: "3",
        },
        {
          name: "Số lượng đã bán",
          value: "---",
          position: "right",
          key: "5",
        },
        {
          name: "Tổng doanh thu",
          value: "---",
          position: "right",
          key: "6",
        },
        {
          name: "Mức độ ưu tiên",
          value: data.priority,
          position: "right",
          key: "7",
        },
      ];
      return details;
    }
  }, [data]);

  const renderStatus = (data: DiscountResponse) => {
    const status = discountStatuses.find(status => status.code === data.state);
    return (
      <span
        style={status?.style}
      >
          {status?.value}
        </span>
    );
  };

  const onActivate = () => {
    dispatch(showLoading());
    dispatch(bulkEnablePriceRules({ids: [idNumber]}, onActivateSuccess));
  }

  const onDeactivate = async () => {
    dispatch(showLoading());
    try {
      const deactivateResponse = await bulkDisablePriceRules({ids: [idNumber]});
      switch (deactivateResponse.code) {
        case HttpStatus.SUCCESS:
          dispatch(promoGetDetail(idNumber, onResult));
          break;
        case HttpStatus.UNAUTHORIZED:
          dispatch(unauthorizedAction());
          break;
        default:
          deactivateResponse.errors.forEach((e:any) => showError(e.toString()));
          break;
      }
    } catch (error) {
      showError("Thao tác thất bại")
    } finally {
      dispatch(hideLoading());
    }
  }

  const onActivateSuccess = useCallback(() => {
    dispatch(hideLoading());
    dispatch(promoGetDetail(idNumber, onResult));
  }, [dispatch, idNumber, onResult]);


  // @ts-ignore
  const renderer = ({days, hours, minutes, seconds, completed}) => {
    if (completed) {
      // Render a complete state
      return <span>Kết thúc chương trình</span>;
    } else {
      // Render a countdown
      return (
        <span style={{color: "#FCAF17", fontWeight: 500}}>
          {days > 0 ? `${days} Ngày` : ""} {hours}:{minutes}
        </span>
      );
    }
  };

  const timeApply = [
    {
      name: "Từ",
      value:
        data?.starts_date && moment(data.starts_date).format(DATE_FORMAT.DDMMYY_HHmm),
      key: "1",
    },
    {
      name: "Đến",
      value: data?.ends_date && moment(data.ends_date).format(DATE_FORMAT.DDMMYY_HHmm),
      key: "2",
    },
    {
      name: "Còn",
      value: data?.ends_date ? <Countdown zeroPadTime={2} zeroPadDays={2} date={moment(data?.ends_date).toDate()}
                                          renderer={renderer} /> : "---",
      key: "3",
    },
  ];

  const renderActionButton = () => {
    switch (data?.state) {
      case "ACTIVE":
        return <Button type="primary" onClick={onDeactivate}>Tạm ngừng</Button>
      case "DISABLED":
      case "DRAFT":
        return <Button type="primary" onClick={onActivate}>Kích hoạt</Button>
      default:
        return null;
    }
  }

  return (
    <ContentContainer
      isError={error}
      isLoading={loading}
      title={data ? data.title : "Chi tiết đợt khuyến mãi"}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mãi",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
        },
        {
          name: "Chiết khấu",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
        },
        {
          name: "Chi tiết chương trình",
        },
      ]}
    >
      {data !== null && (
        <React.Fragment>
          <Row gutter={24}>
            <Col span={24} md={18}>
              <Card
                className="card"
                title={
                  <div style={{alignItems: "center"}}>
                    <span className="title-card">THÔNG TIN CÁ NHÂN</span>
                    {renderStatus(data)}
                  </div>
                }
              >
                <Row gutter={30}>
                  <Col span={12}>
                    {promoDetail &&
                    promoDetail
                      .filter((detail: detailMapping) => detail.position === "left")
                      .map((detail: detailMapping, index: number) => (
                        <Col
                          key={index}
                          span={24}
                          style={{
                            padding: 0,
                            display: "flex",
                            marginBottom: 10,
                            color: "#222222",
                          }}
                        >
                          <Col
                            span={8}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "0 4px 0 0",
                            }}
                          >
                            <span style={{color: "#666666"}}>{detail.name}</span>
                            <span style={{fontWeight: 600}}>:</span>
                          </Col>
                          <Col span={12} style={{paddingLeft: 0}}>
                              <span
                                style={{
                                  wordWrap: "break-word",
                                }}
                              >
                                {detail.value ? detail.value : "---"}
                              </span>
                          </Col>
                        </Col>
                      ))}
                  </Col>
                  <Col span={12}>
                    {promoDetail &&
                    promoDetail
                      .filter((detail: detailMapping) => detail.position === "right")
                      .map((detail: detailMapping, index: number) => (
                        <Col
                          key={index}
                          span={24}
                          style={{
                            display: "flex",
                            marginBottom: 10,
                            color: "#222222",
                          }}
                        >
                          <Col
                            span={8}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "0 4px 0 0",
                            }}
                          >
                            <span style={{color: "#666666"}}>{detail.name}</span>
                            <span style={{fontWeight: 600}}>:</span>
                          </Col>
                          <Col span={12} style={{paddingLeft: 0}}>
                              <span
                                style={{
                                  wordWrap: "break-word",
                                }}
                              >
                                {detail.value ? detail.value : "---"}
                              </span>
                          </Col>
                        </Col>
                      ))}
                  </Col>
                </Row>
                <Row gutter={30}>
                  <Col span={24}>
                    <Col
                      key={"description"}
                      span={24}
                      style={{
                        padding: 0,
                        display: "flex",
                        marginBottom: 10,
                        color: "#222222",
                      }}
                    >
                      <Col
                        span={4}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0 8px 0 0",
                        }}
                      >
                        <span style={{color: "#666666"}}>Mô tả</span>
                        <span style={{fontWeight: 600}}>:</span>
                      </Col>
                      <Col span={18} style={{paddingLeft: 0}}>
                              <span
                                style={{
                                  wordWrap: "break-word",
                                }}
                              >
                                {data.description ? data.description  : "---"}
                              </span>
                      </Col>
                    </Col>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={30}>
                  <Col span={24} style={{textAlign: "right"}}>
                    <Space size={"large"}>
                      <Link to={``}>Xem lịch sử chỉnh sửa</Link>
                      <Link to={``}>Xem kết quả khuyến mãi</Link>
                    </Space>
                  </Col>
                </Row>
              </Card>
              <Card
                className="card"
                title={
                  <div style={{alignItems: "center"}}>
                    <span className="title-card">DANH SÁCH SẢN PHẨM VÀ ĐIỀU KIỆN ÁP DỤNG</span>
                  </div>
                }
              >
                <CustomTable
                  dataSource={entitlements}
                  columns={quantityColumn}
                  pagination={false}
                />
              </Card>
            </Col>
            <Col span={24} md={6}>
              {/* Thời gian áp dụng */}
              <Card className="card">
                <Row>
                  <Col
                    span={24}
                    style={{
                      paddingBottom: 16,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Thời gian áp dụng:
                      <span
                        style={{
                          paddingLeft: 6,
                          color: "#E24343",
                        }}
                      >
                        *
                      </span>
                    </span>
                  </Col>
                  {timeApply &&
                  timeApply.map((detail: any, index: number) => (
                    <Col
                      key={index}
                      span={24}
                      style={{
                        display: "flex",
                        marginBottom: 10,
                        color: "#222222",
                      }}
                    >
                      <Col
                        span={5}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0 4px 0 0",
                        }}
                      >
                        <span style={{color: "#666666"}}>{detail.name}</span>
                        <span style={{fontWeight: 600}}>:</span>
                      </Col>
                      <Col span={15} style={{paddingLeft: 0}}>
                          <span
                            style={{
                              wordWrap: "break-word",
                              fontWeight: 500,
                            }}
                          >
                            {detail.value ? detail.value : "---"}
                          </span>
                      </Col>
                    </Col>
                  ))}
                </Row>
              </Card>
              {/* Cửa hàng áp dụng */}
              <Card className="card">
                <Row>
                  <Col
                    span={24}
                    style={{
                      paddingBottom: 16,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Cửa hàng áp dụng:
                      <span
                        style={{
                          paddingLeft: 6,
                          color: "#E24343",
                        }}
                      >
                        *
                      </span>
                    </span>
                  </Col>
                  <Col span={24}>
                    {data?.prerequisite_store_ids.length > 0 ? (
                      <ul
                        style={{
                          padding: "0 16px",
                        }}
                      >
                        {listStore &&
                        data.prerequisite_store_ids.map(id => <li>{listStore.find(store => store.id === id)?.name}</li>)}
                      </ul>
                    ) : (
                      "Áp dụng toàn bộ"
                    )}
                  </Col>
                </Row>
              </Card>
              {/* Kênh bán áp dụng */}
              <Card className="card">
                <Row>
                  <Col
                    span={24}
                    style={{
                      paddingBottom: 16,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Kênh bán áp dụng:
                      <span
                        style={{
                          paddingLeft: 6,
                          color: "#E24343",
                        }}
                      >
                        *
                      </span>
                    </span>
                  </Col>
                  <Col span={24}>
                    {data?.prerequisite_sales_channel_names.length > 0 ? (
                      <ul
                        style={{
                          padding: "0 16px",
                        }}
                      >
                        {listChannel &&
                        data.prerequisite_sales_channel_names.map(name => <li>{listChannel.find(channel => channel.name === name)?.name}</li>)}
                      </ul>
                    ) : (
                      "Áp dụng toàn bộ"
                    )}
                  </Col>
                </Row>
              </Card>
              {/* Nguồn đơn hàng áp dụng */}
              <Card className="card">
                <Row>
                  <Col
                    span={24}
                    style={{
                      paddingBottom: 16,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 500,
                      }}
                    >
                      Nguồn đơn hàng áp dụng:
                      <span
                        style={{
                          paddingLeft: 6,
                          color: "#E24343",
                        }}
                      >
                        *
                      </span>
                    </span>
                  </Col>
                  <Col span={24}>
                    {data?.prerequisite_order_source_ids.length > 0 ? (
                      <ul
                        style={{
                          padding: "0 16px",
                        }}
                      >
                        {listSource &&
                        data.prerequisite_order_source_ids.map(id => <li>{listSource.find(source => source.id === id)?.name}</li>)}
                      </ul>
                    ) : (
                      "Áp dụng toàn bộ"
                    )}
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          <BottomBarContainer
            back="Quay lại danh sách khuyến mại"
            rightComponent={
              <Space>
                <Button disabled >Sửa</Button>
                <Button disabled >Nhân bản</Button>
                {renderActionButton()}
              </Space>
            }
          />
        </React.Fragment>
      )}
    </ContentContainer>
  );
};

export default PromotionDetailScreen;
