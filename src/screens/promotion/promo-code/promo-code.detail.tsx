import { Button, Card, Col, Modal, Row, Space, Tag } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from 'react-router';
import { Link } from "react-router-dom";
import VoucherIcon from "assets/img/voucher.svg";
import AddImportCouponIcon from "assets/img/add_import_coupon_code.svg";
import AddListCouponIcon from "assets/img/add_list_coupon_code.svg";
import CloseIcon from "assets/icon/x-close-red.svg";
import UserIcon from "assets/icon/user-icon.svg";
import DiscountIcon from "assets/icon/discount.svg";
import "./promo-code.scss";
import ModalAddCode from "./components/ModalAddCode";
import Dragger from "antd/lib/upload/Dragger";
import { RiUpload2Line } from "react-icons/ri";
import { deletePriceRulesById, promoGetDetail } from "domain/actions/promotion/discount/discount.action";
import { DiscountResponse } from "model/response/promotion/discount/list-discount.response";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";
import { getListPromoCode } from "domain/actions/promotion/promo-code/promo-code.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { StoreResponse } from "model/core/store.model";
import { SourceResponse } from "model/response/order/source.response";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { showSuccess } from "utils/ToastUtils";

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

const PromotionDetailScreen: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { id } = useParams() as any;
  const idNumber = parseInt(id);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [showAddCodeManual, setShowAddCodeManual] = React.useState<boolean>(false);
  const [showAddCodeRandom, setShowAddCodeRandom] = React.useState<boolean>(false);
  const [showImportFile, setShowImportFile] = React.useState<boolean>(false);
  const [data, setData] = useState<DiscountResponse | null>(null);
  const [listStore, setListStore] = useState<Array<StoreResponse>>();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [checkPromoCode, setCheckPromoCode] = useState<boolean>(true);
  const [store, setStore] = useState<Array<StoreResponse>>();
  const [source, setSource] = useState<Array<SourceResponse>>();


  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
    dispatch(getListSourceRequest(setListSource));
  }, []);
 
  useEffect(() => {
    const stores =  listStore?.filter(item => item.id === data?.prerequisite_store_ids[0])
    setStore(stores);
  }, [listStore]);

  useEffect(() => {
    const source = listSource?.filter(item => item.id === data?.prerequisite_order_source_ids[0])
    setSource(source);
  }, [listSource]);

  const handleCheckPromoList = useCallback((data: any) => {
    setCheckPromoCode(data.length > 0);
  }, []);

  useEffect(() => {
    dispatch(getListPromoCode(idNumber, handleCheckPromoList));
  }, [dispatch, handleCheckPromoList, idNumber]);

  // section DELETE by Id
  function onDelete() {
    dispatch(showLoading());
    dispatch(deletePriceRulesById(idNumber, onDeleteSuccess));
  }
  const onDeleteSuccess = useCallback(() => {
    dispatch(hideLoading());
    showSuccess("Xóa thành công");
    history.push(`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`);
  }, [dispatch]);

  // section EDIT item
  const onEdit = useCallback(() => {
    // TO DO
  }, [history, idNumber]);

  // section handle call api GET DETAIL
  const onResult = useCallback((result: DiscountResponse | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setData(result);
    }
  }, []);
  useEffect(() => {
    dispatch(promoGetDetail(idNumber, onResult));
    return () => {};
  }, [dispatch, idNumber, onResult]);

  const promoDetail: Array<any> | undefined = React.useMemo(() => {
    if (data) {
      const details = [
        {
          name: "Tên đợt phát hành",
          value: data.title,
          position: "left",
          key: "1",
        },
        {
          name: "Mã đợt phát hành",
          value: data.discount_codes[0]?.code ? data.discount_codes[0]?.code : "",
          position: "left",
          key: "2",
        },
        {
          name: "Loại mã",
          value: "Mã giảm giá",
          position: "left",
          key: "3",
        },
        {
          name: "Mô tả đợt phát hành",
          value: data.description,
          position: "left",
          key: "4",
        },
        {
          name: "SL mã phát hành",
          value: data.usage_limit,
          position: "right",
          key: "5",
        },
        {
          name: "Số lượng đã sử dụng",
          value: data.usage_limit_per_customer,
          position: "right",
          key: "6",
        },
        {
          name: "Thông tin km",
          value: "", // TODO
          position: "right",
          key: "7",
        },
      ];
      return details;
    }
  }, [data]);
 
  const timeApply = [
    {
      name: "Từ",
      value: data?.starts_date && moment(data.starts_date).format(DATE_FORMAT.DDMMYY_HHmm),
      key: "1",
    },
    {
      name: "Đến",
      value: data?.ends_date && moment(data.ends_date).format(DATE_FORMAT.DDMMYY_HHmm),
      key: "2",
    },
    {
      name: "Còn",
      value:  moment(data?.starts_date).isAfter(data?.ends_date),
      key: "3",
    }
  ];

  function savePromoCode(value: any) {
    console.log(value);
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
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
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
                  <div style={{alignItems: "center" }}>
                    <span className="title-card">THÔNG TIN CÁ NHÂN</span>
                    <Tag className="status-tag"> Đang áp dụng </Tag>
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
                <hr />
                <Row gutter={30}>
                  <Col span={24}> 
                    <img src={CloseIcon} alt="" />
                    <span style={{marginLeft: 14}}>Không được áp dụng chung với các khuyến mại khác</span>
                  </Col>
                  <Col span={24} style={{marginTop: 15}}>
                    <img src={UserIcon} alt="" />
                    <span style={{marginLeft: 14}}>Khách hàng không bị giới hạn số lần sử dụng mã</span>
                  </Col>
                  <Col span={24} style={{marginTop: 15}}>
                    <img src={DiscountIcon} alt="" />
                    <span style={{marginLeft: 14}}>Mỗi mã được sử dụng 1 lần</span>
                  </Col>
                </Row>
                <hr />
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
                  <div style={{ alignItems: "center" }}>
                    <span className="title-card">Mã giảm giá</span>
                  </div>
                }
              >
                {checkPromoCode  &&  <Row gutter={30}>
                    <Col span={24}>
                      <Link 
                        to={`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/codes/${idNumber}`}
                      >Xem danh sách mã giảm giá của đợt phát hành</Link>
                    </Col>
                  </Row>
                }
                {!checkPromoCode && <Row gutter={30} style={{gap: 15}}>
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
                    <div className="card-discount-code" onClick={() => setShowAddCodeManual(true)}>
                      <img style={{ background: "linear-gradient(65.71deg, #0088FF 28.29%, #33A0FF 97.55%)" }} src={VoucherIcon} alt="" />
                      <p style={{fontWeight: 500}}>Thêm mã thủ công</p>
                      <p>Sử dụng khi bạn chỉ phát hành số lượng ít mã giảm giá hoặc áp dụng 1 mã nhiều lần</p>
                    </div>
                    <div className="card-discount-code" onClick={() => setShowAddCodeRandom(true)}>
                      <img style={{ background: "linear-gradient(62.06deg, #0FD186 25.88%, #3FDA9E 100%)" }} src={AddListCouponIcon} alt="" />
                      <p style={{fontWeight: 500}}>Thêm mã ngẫu nhiên</p>
                      <p>Sử dụng khi bạn muốn tạo ra danh sách mã giảm giá ngẫu nhiên và phát cho mỗi khách hàng 1 mã</p>
                    </div>
                    <div className="card-discount-code" onClick={() => setShowImportFile(true)}>
                      <img style={{ background: "linear-gradient(66.01deg, #FFAE06 37.34%, #FFBE38 101.09%)" }} src={AddImportCouponIcon} alt="" />
                      <p style={{fontWeight: 500}}>Nhập file Excel</p>
                      <p>Sử dụng khi bạn có sẵn danh sách mã giảm giá để nhập lên phần mềm</p>
                      <Link to="#">Tải file mẫu</Link>
                    </div>
                  </Col>
                </Row>}
              </Card>
              <Card
                className="card"
                title={
                  <div style={{ alignItems: "center" }}>
                    <span className="title-card">Điều kiện mua hàng</span>
                  </div>
                }
              >
                <span>Áp dụng cho toàn bộ đơn hàng</span>
              </Card>
            </Col>
            <Col span={24} md={6}>
              {/* Thời gian áp dụng */}
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
              {/* Cửa hàng áp dụng */}
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
                        {
                          data?.prerequisite_store_ids.length > 0 ? (<ul style={{
                            padding: "0 16px"
                          }}>
                            {
                              store && store.map((item: any, index: number) => (
                                <li>{item.name}</li>
                              ))
                            }
                          </ul>) : "Áp dụng toàn bộ"
                        }
                      </Col>
                </Row>
              </Card>
              {/* Kênh bán áp dụng */}
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
                        {
                          data?.prerequisite_sales_channel_names.length > 0 ? (<ul style={{
                            padding: "0 16px"
                          }}>
                            <li> YODY Kiến Xương </li>
                            <li> YODY Hai Bà Trưng </li>
                          </ul>) : "Áp dụng toàn bộ"
                        }
                      </Col>
                </Row>
              </Card>
              {/* Nguồn đơn hàng áp dụng */}
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
                        {
                          data?.prerequisite_order_source_ids.length > 0 ? (<ul style={{
                            padding: "0 16px"
                          }}>
                            {
                              source && source.map((item: any, index: number) => (
                                <li>{item.name}</li>
                              ))
                            }
                          </ul>) : "Áp dụng toàn bộ"
                        }
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
            <Button onClick={onDelete} style={{ color: '#E24343'}}>Xoá</Button>
            <Button onClick={onEdit}>Sửa</Button>
            <Button>Nhân bản</Button>
            <Button type="primary">Kích hoạt</Button>
          </Space>
          
        }
      />
      <ModalAddCode
        isManual={true}
        visible={showAddCodeManual}
        okText="Thêm"
        cancelText="Thoát"
        title="Thêm mã thủ công"
        onCancel={() => {
          setShowAddCodeManual(false);
        }}
        onOk={() => {
          setShowAddCodeManual(false);
        }}
      />
      <ModalAddCode
        isManual={false}
        visible={showAddCodeRandom}
        okText="Thêm"
        cancelText="Thoát"
        title="Thêm mã ngẫu nhiên"
        onCancel={() => {
          setShowAddCodeRandom(false);
        }}
        onOk={(value: any) => {
          console.log(value);
          
          setShowAddCodeRandom(false);
          savePromoCode(value);
        }}
      />
      <Modal
        onCancel={() => setShowImportFile(false)}
        width={650}
        visible={showImportFile}
        title="Nhập file khuyến mại"
        footer={[
          <Button key="back" onClick={() => setShowImportFile(false)}>
            Huỷ
          </Button>,

          <Button
            key="link"
            type="primary"
          >
            Nhập file
          </Button>,
        ]}
      >
        <Row gutter={12}>
          <Col span={3}>
            Chú ý:
          </Col>
          <Col span={19}>
            <p>- Kiểm tra đúng loại phương thức khuyến mại khi xuất nhập file</p>
            <p>- Chuyển đổi file dưới dạng .XSLX trước khi tải dữ liệu</p>
            <p>- Tải file mẫu <Link to="#">tại đây</Link></p>
            <p>- File nhập có dụng lượng tối đa là 2MB và 2000 bản ghi</p>
            <p>- Với file có nhiều bản ghi, hệ thống cần mất thời gian xử lý từ 3 đến 5 phút. Trong lúc hệ thống xử lý
              không F5 hoặc tắt cửa sổ trình duyệt.</p>
          </Col>
        </Row>
        <Row gutter={24}>
          <div className="dragger-wrapper">
            <Dragger accept=".xlsx">
              <p className="ant-upload-drag-icon">
                <RiUpload2Line size={48}/>
              </p>
              <p className="ant-upload-hint">
                Kéo file vào đây hoặc tải lên từ thiết bị
              </p>
            </Dragger>
          </div>
        </Row>
      </Modal>
    </ContentContainer>
  );
};

export default PromotionDetailScreen;
