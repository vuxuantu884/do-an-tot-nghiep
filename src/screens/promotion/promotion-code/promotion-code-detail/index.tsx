import { Button, Card, Col, Image, Row, Space, Tag } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import {
  productGetDetail,
  productUpdateAction
} from "domain/actions/product/products.action";
import { ProductResponse } from "model/product/product.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router";
import { Link } from "react-router-dom";
import VoucherIcon from "assets/icon/voucher.svg";
import AddImportCouponIcon from "assets/icon/add_import_coupon_code.svg";
import AddListCouponIcon from "assets/icon/add_list_coupon_code.svg";

export interface ProductParams {
  id: string;
  variantId: string;
}

enum TabName {
  HISTORY = '#historyTab',
  INVENTORY = '#inventoryTab'
}

type detailMapping = {
  name: string;
  value: string | null;
  position: string;
  key: string;
  isWebsite?: boolean;
};

const PromotionDetailScreen: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const location = useLocation();
  const {hash} = location;

  const id = "1";

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [active, setActive] = useState<number>(0);
  const [data, setData] = useState<ProductResponse | null>(null);
  
  const idNumber = parseInt(id);
  const onEdit = useCallback(() => {
    history.push(`${UrlConfig.PRODUCT}/${idNumber}/edit`);
  }, [history, idNumber]);

  const onResult = useCallback((result: ProductResponse | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setData(result);
    }
  }, []);
  const currentVariant = useMemo(() => {
    if (data && data.variants.length > 0) {
      return data.variants[active];
    }
    return null;
  }, [active, data]);

  const productStatusList = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.product_status
  );

  const statusValue = useMemo(() => {
    if (!productStatusList) {
      return "";
    }
    let index = productStatusList?.findIndex(
      (item) => item.value === data?.status
    );
    if (index !== -1) {
      return productStatusList?.[index].name;
    }
    return "";
  }, [data?.status, productStatusList]);

  useEffect(() => {
    dispatch(productGetDetail(idNumber, onResult));
    return () => {};
  }, [dispatch, idNumber, onResult]);

  const promotion = {
    name: "Tên đợt phát hành",
    code: "CPM12",
    typeCode: "Mã giảm giá",
    description: "",
    amountCodeRelease: "0",
    amountUsed: "0",
    discountInfo: "Giảm 3% tối đa 100.000"
  };

  const promotionDetail: Array<any> | undefined = React.useMemo(() => {
    if (promotion) {
      const details = [
        {
          name: "Tên đợt phát hành",
          value: promotion.name,
          position: "left",
          key: "1",
        },
        {
          name: "Mã đợt phát hành",
          value: promotion.code,
          position: "left",
          key: "2",
        },
        {
          name: "Loại mã",
          value: promotion.typeCode,
          position: "left",
          key: "3",
        },
        {
          name: "Mô tả đợt phát hành",
          value: promotion.description,
          position: "left",
          key: "4",
        },
        {
          name: "SL mã phát hành",
          value: promotion.amountCodeRelease,
          position: "right",
          key: "5",
        },
        {
          name: "Số lượng đã sử dụng",
          value: promotion.amountUsed,
          position: "right",
          key: "6",
        },
        {
          name: "Thông tin km",
          value: promotion.discountInfo,
          position: "right",
          key: "7",
        },
      ];
      return details;
    }
  }, [promotion]);

  const timeApply = [
    {
      name: "Từ",
      value: "25-8-2021  14:30",
      key: "1",
    },
    {
      name: "Đến",
      value: "",
      key: "2",
    },
    {
      name: "Còn",
      value: "30 ngày 23:56:13",
      key: "3",
    }
  ];

  return (
    <ContentContainer
      isError={error}
      isLoading={loading}
      title="Chi tiết chiết khấu"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mãi",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMOTION_CODE}`,
        },
        {
          name: "Chiết khấu",
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
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="title-card">THÔNG TIN CÁ NHÂN</span>
                    <Tag
                      className="orders-tag"
                      style={{
                        marginLeft: 10,
                        backgroundColor: "#27AE60",
                        color: "#ffffff",
                        fontSize: 12,
                        fontWeight: 400,
                        marginBottom: 6,
                      }}
                    >
                      Đang áp dụng
                    </Tag>
                  </div>
                }
              >
                <Row gutter={30}>
                  <Col span={12}>
                    {promotionDetail &&
                      promotionDetail
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
                              span={12}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "0 4px 0 0",
                              }}
                            >
                              <span style={{ color: "#666666" }}>{detail.name}</span>
                              <span style={{ fontWeight: 600 }}>:</span>
                            </Col>
                            <Col span={12} style={{ paddingLeft: 0 }}>
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
                    {promotionDetail &&
                      promotionDetail
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
                              span={12}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "0 4px 0 0",
                              }}
                            >
                              <span style={{ color: "#666666" }}>{detail.name}</span>
                              <span style={{ fontWeight: 600 }}>:</span>
                            </Col>
                            <Col span={12} style={{ paddingLeft: 0 }}>
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
                <hr style={{
                    margin: "18px 0",
                    borderBottom: "1px solid #E5E5E5",
                    borderTop: "none",
                  }}/>
                <Row gutter={30}>
                  <Col span={24} > 
                    <span>Không được áp dụng chung với các khuyến mại khác</span>
                  </Col>
                  <Col span={24} style={{marginTop: 15}}>
                    <span>Khách hàng không bị giới hạn số lần sử dụng mã</span>
                  </Col>
                  <Col span={24} style={{marginTop: 15}}>
                    <span>Mỗi mã được sử dụng 1 lần</span>
                  </Col>
                </Row>
                <hr style={{
                    margin: "18px 0",
                    borderBottom: "1px solid #E5E5E5",
                    borderTop: "none",
                }}/>
                <Row gutter={30}>
                  <Col span={24} style={{textAlign: "right"}}>
                    <Link to={``}>
                      Xem lịch sử chỉnh sửa
                    </Link>
                  </Col>
                </Row>
              </Card>
              <Card
                className="card"
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="title-card">Mã giảm giá</span>
                  </div>
                }
              >
                <Row gutter={30} style={{gap: 15}}>
                  <Col span={24} style={{
                      color: "#E24343",
                      textAlign: "center",
                      marginBottom: 20
                  }}>
                    <span>Đợt phát hành chưa có mã nào!</span>
                  </Col>
                  <Col span="24" style={{
                    display: "flex",
                    gap: 15,
                }}>
                      <div style={{
                        backgroundColor: "#F5F5F5",
                        borderRadius: "10px",
                        width: "100%",
                        height: "216px",
                        padding: "15px 13px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}>
                        <img style={{ 
                          marginBottom: "11px",
                          background: "linear-gradient(65.71deg, #0088FF 28.29%, #33A0FF 97.55%)",
                          borderRadius: "50%",
                      }} src={VoucherIcon} alt="" />
                        <p>Thêm mã thủ công</p>
                        <p>Sử dụng khi bạn chỉ phát hành số lượng ít mã giảm giá hoặc áp dụng 1 mã nhiều lần</p>
                      </div>
                      <div style={{
                        backgroundColor: "#F5F5F5",
                        borderRadius: "10px",
                        width: "100%",
                        height: "216px",
                        padding: "15px 13px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}>
                        <img style={{ 
                          marginBottom: "11px",
                          background: "linear-gradient(62.06deg, #0FD186 25.88%, #3FDA9E 100%)",
                          borderRadius: "50%",
                      }} src={AddListCouponIcon} alt="" />
                        <p>Thêm mã ngẫu nhiên</p>
                        <p>Sử dụng khi bạn muốn tạo ra danh sách mã giảm giá ngẫu nhiên và phát cho mỗi khách hàng 1 mã</p>
                      </div>
                      <div style={{
                        backgroundColor: "#F5F5F5",
                        borderRadius: "10px",
                        width: "100%",
                        height: "216px",
                        padding: "15px 13px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}>
                        <img style={{ 
                          marginBottom: "11px",
                          background: "linear-gradient(66.01deg, #FFAE06 37.34%, #FFBE38 101.09%)",
                          borderRadius: "50%",
                      }} src={AddImportCouponIcon} alt="" />
                        <p>Nhập file Excel</p>
                        <p>Sử dụng khi bạn có sẵn danh sách mã giảm giá để nhập lên phần mềm</p>
                        <Link to="">Tải file mẫu</Link>
                      </div>
                  </Col>
                </Row>
              </Card>
              <Card
                className="card"
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="title-card">Điều kiện mua hàng</span>
                  </div>
                }
              >
                <span>Áp dụng cho toàn bộ đơn hàng</span>
              </Card>
            </Col>
            <Col span={24} md={6}>
              <Card className="card">
                <Row>
                  <Col span={24} style={{
                    paddingBottom: 16
                  }}>
                    <span 
                      style={{
                        fontWeight: 500
                      }}
                    >Thời gian áp dụng: 
                      <span style={{
                        paddingLeft: 6,
                        color: "#E24343",
                      }}>*</span>
                    </span>
                  </Col>
                  {timeApply &&
                  timeApply
                    .map((detail: any, index: number) => (
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
                          <span style={{ color: "#666666" }}>{detail.name}</span>
                          <span style={{ fontWeight: 600 }}>:</span>
                        </Col>
                        <Col span={12} style={{ paddingLeft: 0 }}>
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
              <Card className="card">
                <Row>
                    <Col span={24} style={{
                      paddingBottom: 16
                    }}>
                      <span 
                        style={{
                          fontWeight: 500
                        }}
                      >Cửa hàng áp dụng: 
                        <span style={{
                          paddingLeft: 6,
                          color: "#E24343",
                        }}>*</span>
                      </span>
                    </Col>
                      <Col span={24}>
                        <ul style={{
                          padding: "0 16px"
                        }}>
                          <li> YODY Kiến Xương </li>
                          <li> YODY Hai Bà Trưng </li>
                        </ul>
                      </Col>
                </Row>
              </Card>
              <Card className="card">
                <Row>
                    <Col span={24} style={{
                      paddingBottom: 16
                    }}>
                      <span 
                        style={{
                          fontWeight: 500
                        }}
                      >Kênh bán áp dụng: 
                        <span style={{
                          paddingLeft: 6,
                          color: "#E24343",
                        }}>*</span>
                      </span>
                    </Col>
                      <Col span={24}>
                        <ul style={{
                          padding: "0 16px"
                        }}>
                          <li> YODY Kiến Xương </li>
                          <li> YODY Hai Bà Trưng </li>
                        </ul>
                      </Col>
                </Row>
              </Card>
              <Card className="card">
                <Row>
                    <Col span={24} style={{
                      paddingBottom: 16
                    }}>
                      <span 
                        style={{
                          fontWeight: 500
                        }}
                      >Nguồn đơn hàng áp dụng: 
                        <span style={{
                          paddingLeft: 6,
                          color: "#E24343",
                        }}>*</span>
                      </span>
                    </Col>
                      <Col span={24}>
                        <ul style={{
                          padding: "0 16px"
                        }}>
                          <li> YODY Kiến Xương </li>
                          <li> YODY Hai Bà Trưng </li>
                        </ul>
                      </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </React.Fragment>
      )}
      <BottomBarContainer
        back="Quay lại sản phẩm"
        rightComponent={
          <Space>
            <Button style={{ color: '#E24343'}}>Xoá</Button>
            <Button>Sửa</Button>
            <Button>Nhân bản</Button>
            <Button type="primary">Kích hoạt</Button>
          </Space>
          
        }
      />
    </ContentContainer>
  );
};

export default PromotionDetailScreen;
