import {Card, Col, Divider, Row, Space} from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useParams} from "react-router";
import {Link} from "react-router-dom";
import moment from "moment";
import "./discount.scss";
import {DiscountResponse} from "model/response/promotion/discount/list-discount.response";
import {DATE_FORMAT} from "utils/DateUtils";
import "domain/actions/promotion/promo-code/promo-code.action";
import {StoreGetListAction} from "domain/actions/core/store.action";
import {getListSourceRequest} from "domain/actions/product/source.action";
import {StoreResponse} from "model/core/store.model";
import {SourceResponse} from "model/response/order/source.response";
import {promoGetDetail} from "../../../domain/actions/promotion/discount/discount.action";
import CustomTable, {ICustomTableColumType} from "../../../component/table/CustomTable";

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
    code: 'ACTIVE',
    value: 'Đang áp dụng',
    style: {
      background: "rgba(42, 42, 134, 0.1)",
      borderRadius: "100px",
      color: "rgb(42, 42, 134)",
      padding: "5px 10px",
      marginLeft: "20px"
    }
  },
  {
    code: 'DISABLED',
    value: 'Tạm ngưng',
    style: {
      background: "rgba(252, 175, 23, 0.1)",
      borderRadius: "100px",
      color: "#FCAF17",
      padding: "5px 10px",
      marginLeft: "20px"
    }
  },
  {
    code: 'DRAFT',
    value: 'Chờ áp dụng',
    style: {
      background: "rgb(245, 245, 245)",
      borderRadius: "100px",
      color: "rgb(102, 102, 102)",
      padding: "5px 10px",
      marginLeft: "20px"
    }
  },
  {
    code: 'CANCELLED',
    value: 'Đã huỷ',
    style: {
      background: "rgba(226, 67, 67, 0.1)",
      borderRadius: "100px",
      color: "rgb(226, 67, 67)",
      padding: "5px 10px",
      marginLeft: "20px"
    }
  },
]

const quantityColumn:Array<ICustomTableColumType<any>> = [
  {
    title: "STT",
    align: "center",
    render: (value: any, item: any, index: number) => index
  },
  {
    title: "Sản phẩm",
    dataIndex: "variant",
    render: (value: any, item: any, index: number) => value.id
  },
  {
    title: "Giá bán",
    align: "center",
    visible: true,
    dataIndex: "variant",
  },
  {
    title: "Chiết khấu",
    align: "center",
    dataIndex: "value"
  },
  {
    title: "Giá sau chiết khấu",
    align: "center",
    dataIndex: "value"
  },
  {
    title: "SL Tối thiểu",
    align: "center",
    dataIndex: "minimum"
  },
  {
    title: "Giới hạn",
    align: "center",
    dataIndex: "allocationLimit"
  },
]

const PromotionDetailScreen: React.FC = () => {
  const dispatch = useDispatch();

  const {id} = useParams() as any;
  const idNumber = parseInt(id);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<DiscountResponse | null>(null);
  const [listStore, setListStore] = useState<Array<StoreResponse>>();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [stores, setStore] = useState<Array<StoreResponse>>();
  const [sources, setSource] = useState<Array<SourceResponse>>();
  const [entitlements, setEntitlements] = useState<Array<any>>([]);
  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
    dispatch(getListSourceRequest(setListSource));
    dispatch(promoGetDetail(idNumber, onResult));
  }, []);

  useEffect(() => {
    const stores = listStore?.filter(
      (item) => item.id === data?.prerequisite_store_ids[0],
    );
    setStore(stores);
  }, [listStore]);

  useEffect(() => {
    const source = sources?.filter(
      (item) => item.id === data?.prerequisite_order_source_ids[0],
    );
    setSource(source);
  }, [listSource]);

  const onResult = useCallback((result: DiscountResponse | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setData(result);
    }
  }, []);

  const renderDiscountValue = (value: number, valueType:string) => {
    let symbol = 'đ';
    switch (valueType) {
      case "FIXED_AMOUNT":
        symbol = 'đ';
        break;
      case "PERCENTAGE":
        symbol = '%';
        break;
    }
    return symbol;
  }

  const transformData = (rawData: any | null) => {
    let result: any[] = [];
    if (rawData && rawData.entitlements.length > 0) {
      rawData.entitlements.forEach((rawEntitlement:any) => {
        console.log("rawEntitlement", rawEntitlement)
        rawEntitlement.entitled_variant_ids.forEach((variant:any) => {
          console.log("variant", variant)
          result.push({
            variant: {
              id: variant
            },
            minimum: rawEntitlement.prerequisite_quantity_ranges[0]?.greater_than_or_equal_to,
            allocationLimit: rawEntitlement.prerequisite_quantity_ranges[0]?.allocation_limit,
            value: `${rawEntitlement.prerequisite_quantity_ranges[0]?.value}${renderDiscountValue(rawEntitlement.prerequisite_quantity_ranges[0]?.value, rawEntitlement.prerequisite_quantity_ranges[0]?.value_type)}`
          });
        })
      })
      return result;
    }
    return [];
  }
  useEffect(() => {
    setEntitlements(transformData(data));
  }, [data])

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
          name: "Mô tả",
          value: data.description,
          position: "left",
          key: "4",
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
    )
  }

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
      value: moment(data?.starts_date).isAfter(data?.ends_date),
      key: "3",
    },
  ];


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
                        span={12}
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
                        {stores &&
                        stores.map((item: any, index: number) => <li>{item.name}</li>)}
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
                        <li> YODY Kiến Xương</li>
                        <li> YODY Hai Bà Trưng</li>
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
                        {sources &&
                        sources.map((item: any, index: number) => <li>{item.name}</li>)}
                      </ul>
                    ) : (
                      "Áp dụng toàn bộ"
                    )}
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </React.Fragment>
      )}
    </ContentContainer>
  );
};

export default PromotionDetailScreen;
