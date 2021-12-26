import {CheckCircleOutlined, LoadingOutlined} from "@ant-design/icons";
import {Button, Card, Col, Divider, message, Modal, Row, Space} from "antd";
import Dragger from "antd/lib/upload/Dragger";
import DiscountIcon from "assets/icon/discount.svg";
import UserIcon from "assets/icon/user-icon.svg";
import CloseIcon from "assets/icon/x-close-red.svg";
import AddImportCouponIcon from "assets/img/add_import_coupon_code.svg";
import AddListCouponIcon from "assets/img/add_list_coupon_code.svg";
import VoucherIcon from "assets/img/voucher.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import {PromoPermistion} from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import {hideLoading, showLoading} from "domain/actions/loading.action";
import {
  bulkDisablePriceRulesAction,
  bulkEnablePriceRulesAction,
  getVariants,
  promoGetDetail,
} from "domain/actions/promotion/discount/discount.action";
import {
  addPromoCode,
  getListPromoCode,
} from "domain/actions/promotion/promo-code/promo-code.action";
import useAuthorization from "hook/useAuthorization";
import _ from "lodash";
import {DiscountResponse} from "model/response/promotion/discount/list-discount.response";
import React, {useCallback, useEffect, useState} from "react";
import {VscError} from "react-icons/all";
import {RiUpload2Line} from "react-icons/ri";
import {useDispatch} from "react-redux";
import {useHistory, useParams} from "react-router";
import {Link} from "react-router-dom";
import {showSuccess} from "utils/ToastUtils";
import {getQueryParams, useQuery} from "utils/useQuery";
import CustomTable from "../../../component/table/CustomTable";
import {AppConfig} from "../../../config/app.config";
import {formatCurrency} from "../../../utils/AppUtils";
import {getToken} from "../../../utils/LocalStorageUtils";
import GeneralConditionDetail from "../shared/general-condition.detail";
import CustomModal from "./components/CustomModal";
import "./promo-code.scss";

export interface ProductParams {
  id: string;
  variantId: string;
}

type detailMapping = {
  id: string;
  name: string;
  value: string | null;
  position: string;
  key: string;
  isWebsite?: boolean;
  color: string;
};

const promoStatuses = [
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

const csvColumnMapping: any = {
  sku: "Mã SKU",
  min_amount: "SL Tối thiểu",
  usage_limit: "Giới hạn",
  discount_percentage: "Chiết khấu (%)",
  fixed_amount: "Chiết khấu (VND)",
  invalid: "không đúng định dạng CHỮ HOA + SỐ",
  notfound: "không tìm thấy",
  required: "Không được trống",
  code: "Mã chiết khấu",
  already_exist: "Đã tồn tại trong hệ thống",
  duplicate: "Mã đã bị trùng trong file",
};

const PromotionDetailScreen: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const token = getToken() || "";

  const {id} = useParams() as any;
  const idNumber = parseInt(id);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showAddCodeManual, setShowAddCodeManual] = React.useState<boolean>(false);
  const [showAddCodeRandom, setShowAddCodeRandom] = React.useState<boolean>(false);
  const [showImportFile, setShowImportFile] = React.useState<boolean>(false);
  const [data, setData] = useState<DiscountResponse | null>(null);
  const [checkPromoCode, setCheckPromoCode] = useState<boolean>(true);
  const [importTotal, setImportTotal] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [uploadError, setUploadError] = useState<any>("");
  const [codeErrorsResponse, setCodeErrorsResponse] = useState<Array<any>>([]);
  const [uploadStatus, setUploadStatus] = useState<
    "error" | "success" | "done" | "uploading" | "removed" | undefined
  >(undefined);
  const [dataVariants, setDataVariants] = useState<any | null>(null);
  const [entitlements, setEntitlements] = useState<Array<any>>([]);
  const [minOrderSubtotal, setMinOrderSubtotal] = useState(0);
  const [applyFor, setApplyFor] = useState("Sản phẩm");

  //phân quyền
  const [allowCancelPromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CANCEL],
  });
  const [allowCreatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CREATE],
  });
  const [allowUpdatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.UPDATE],
  });

  const handleResponse = useCallback((result: any | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setDataVariants(result);
    }
  }, []);

  useEffect(() => {
    dispatch(getVariants(idNumber, handleResponse));
  }, [dispatch, handleResponse, idNumber]);

  const checkIsHasPromo = useCallback((data: any) => {
    setCheckPromoCode(data.items.length > 0);
  }, []);

  const query = useQuery();
  const [dataQuery] = useState<any>({
    ...{
      request: "",
      state: "",
    },
    ...getQueryParams(query),
  });

  useEffect(() => {
    dispatch(getListPromoCode(idNumber, dataQuery, checkIsHasPromo));
  }, [dispatch, checkIsHasPromo, idNumber, dataQuery]);

  const onActivate = () => {
    dispatch(showLoading());
    dispatch(bulkEnablePriceRulesAction({ids: [idNumber]}, onActivateSuccess));
  };

  const onDeactivate = () => {
    dispatch(showLoading());
    dispatch(bulkDisablePriceRulesAction({ids: [idNumber]}, onActivateSuccess));
  };

  // section handle call api GET DETAIL
  const onResult = useCallback((result: DiscountResponse | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setData(result);
    }
  }, []);

  const spreadData = (data: any) => {
    let result: any[] = [];
    if (data?.entitlements && data?.entitlements.length > 0) {
      data?.entitlements.forEach((entitlement: any) => {
        entitlement.entitled_variant_ids.forEach((vId: any) => {
          result.push({
            id: vId,
            minimum:
              entitlement.prerequisite_quantity_ranges[0]["greater_than_or_equal_to"],
          });
        });
      });
    }
    return result;
  };

  const mergeVariants = useCallback(
    (sourceData: Array<any>) => {
      return sourceData.map((s) => {
        const variant = dataVariants.find((v: any) => v.variant_id === s.id);
        if (variant) {
          s.title = variant.variant_title;
          s.sku = variant.sku;
        }
        return s;
      });
    },
    [dataVariants]
  );

  useEffect(() => {
    if (dataVariants && data && data.entitlements.length > 0) {
      if (data.prerequisite_subtotal_range?.greater_than_or_equal_to)
        setMinOrderSubtotal(data.prerequisite_subtotal_range?.greater_than_or_equal_to);
      const flattenData: Array<any> = spreadData(data);
      const listEntitlements: Array<any> = mergeVariants(flattenData);
      if (!listEntitlements || listEntitlements.length === 0) {
        setApplyFor("Tất cả sản phẩm");
      }
      setEntitlements(listEntitlements);
    }
  }, [data, dataVariants, mergeVariants]);

  const onActivateSuccess = useCallback(() => {
    dispatch(hideLoading());
    dispatch(promoGetDetail(idNumber, onResult));
  }, [dispatch, idNumber, onResult]);

  // section DELETE by Id
  // function onDelete() {
  //   dispatch(showLoading());
  //   dispatch(deletePriceRulesById(idNumber, onDeleteSuccess));
  // }
  // const onDeleteSuccess = useCallback(() => {
  //   dispatch(hideLoading());
  //   showSuccess("Xóa thành công");
  //   history.push(`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`);
  // }, [dispatch, history]);

  
  const onEdit = useCallback(() => {
    history.push(`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${idNumber}/update`);
  }, [history, idNumber]);

  const renderDiscountInfo = (value: any, type: any) => {
    if (type === "PERCENTAGE") return `Giảm ${value}%`;
    else return `Giảm ${formatCurrency(value)} VNĐ`;
  };

  useEffect(() => {
    dispatch(promoGetDetail(idNumber, onResult));
    return () => {};
  }, [dispatch, idNumber, onResult]);

  const promoDetail: Array<any> | undefined = React.useMemo(() => {
    if (data) {
      const details = [
        {
          id: "title",
          name: "Tên đợt phát hành",
          value: data.title,
          position: "left",
          key: "1",
          color: "#222222",
        },
        {
          id: "code",
          name: "Mã đợt phát hành",
          value: data.code,
          position: "left",
          key: "2",
          color: "#FCAF17",
        },
        {
          id: "type",
          name: "Loại mã",
          value: "Mã giảm giá",
          position: "left",
          key: "3",
          color: "#222222",
        },
        {
          id: "description",
          name: "Mô tả đợt phát hành",
          value: data.description,
          position: "left",
          key: "4",
          color: "#222222",
        },
        {
          id: "number_of_discount_codes",
          name: "SL mã phát hành",
          value: data.number_of_discount_codes,
          position: "right",
          key: "5",
          color: "#222222",
        },
        {
          id: "total_usage_count",
          name: "Số lượng đã sử dụng",
          value: data.total_usage_count,
          position: "right",
          key: "6",
          color: "#222222",
        },
        {
          id: "discount",
          name: "Thông tin khuyến mãi",
          value: renderDiscountInfo(
            data.entitlements[0]?.prerequisite_quantity_ranges[0]?.value,
            data.entitlements[0]?.prerequisite_quantity_ranges[0]?.value_type
          ),
          position: "right",
          key: "7",
          color: "#222222",
        },
      ];
      return details;
    }
  }, [data]);

  // section ADD Code
  function handleAddManual(value: any) {
    if (!value) return;
    let body = {
      discount_codes: [],
      generate_discount_codes: null,
    };
    (value.listCode as Array<string>).forEach((element) => {
      if (!element) return;
      (body.discount_codes as Array<any>).push({code: element});
    });
    dispatch(showLoading());
    dispatch(addPromoCode(idNumber, body, addCallBack));
  }
  function handleAddRandom(value: any) {
    if (!value) return;
    let body = {
      discount_codes: null,
      generate_discount_codes: {
        prefix: value.prefix,
        suffix: value.suffix,
        length: value.length,
        count: value.count,
      },
    };
    dispatch(showLoading());
    dispatch(addPromoCode(idNumber, body, addCallBack));
  }
  const addCallBack = useCallback(
    (response) => {
      dispatch(hideLoading());
      if (response) {
        showSuccess("Thêm thành công");
        dispatch(getListPromoCode(idNumber, dataQuery, checkIsHasPromo));
      }
    },
    [dispatch, idNumber, dataQuery, checkIsHasPromo]
  );

  const renderStatus = (data: DiscountResponse) => {
    const status = promoStatuses.find((status) => status.code === data.state);
    return <span style={status?.style}>{status?.value}</span>;
  };

  const renderActionButton = () => {
    switch (data?.state) {
      case "ACTIVE":
        return (
          <Button type="primary" onClick={onDeactivate}>
            Tạm ngừng
          </Button>
        );
      case "DISABLED":
      case "DRAFT":
        return (
          <Button type="primary" onClick={onActivate}>
            Kích hoạt
          </Button>
        );
      default:
        return null;
    }
  };

  const columns: Array<any> = [
    {
      title: "STT",
      align: "center",
      width: "5%",
      render: (value: any, item: any, index: number) => index + 1,
    },
    {
      title: "Sản phẩm",
      dataIndex: "sku",
      align: "left",
      width: "40%",
      render: (value: string, item: any, index: number) => {
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
      title: "Số lượng tối thiểu",
      align: "center",
      dataIndex: "minimum",
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
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
        },
        {
          name: "Đợt phát hành",
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
                    <span className="title-card">THÔNG TIN CHUNG</span>
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
                              span={12}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "0 4px 0 0",
                              }}
                            >
                              <span style={{color: "#666666"}}>{detail.name}</span>
                              <span style={{color: detail.color}}>:</span>
                            </Col>
                            <Col span={12} style={{paddingLeft: 0}}>
                              <span
                                style={{
                                  wordWrap: "break-word",
                                  color: detail.color,
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
                <hr />
                <Row gutter={30}>
                  <Col span={24}>
                    <img src={CloseIcon} alt="" />
                    <span style={{marginLeft: 14}}>
                      Không được áp dụng chung với các khuyến mại khác
                    </span>
                  </Col>
                  <Col span={24} style={{marginTop: 15}}>
                    <img src={UserIcon} alt="" />
                    <span style={{marginLeft: 14}}>
                      {data.usage_limit_per_customer
                        ? `Khách hàng có ${data.usage_limit_per_customer} lần sử dụng mã`
                        : `Khách hàng không bị giới hạn số lần sử dụng mã`}
                    </span>
                  </Col>
                  <Col span={24} style={{marginTop: 15}}>
                    <img src={DiscountIcon} alt="" />
                    <span style={{marginLeft: 14}}>
                      {data.usage_limit
                        ? `Mỗi mã được sử dụng ${data.usage_limit} lần`
                        : `Mỗi mã được sử dụng không bị giới số lần`}
                    </span>
                  </Col>
                </Row>
                <hr />
                <Row gutter={30}>
                  <Col span={24} style={{textAlign: "right"}}>
                    <Link to={``}>Xem lịch sử chỉnh sửa</Link>
                  </Col>
                </Row>
              </Card>
              <Card
                className="card"
                title={
                  <div style={{alignItems: "center"}}>
                    <span className="title-card">Mã giảm giá</span>
                  </div>
                }
              >
                {checkPromoCode && (
                  <Row gutter={30}>
                    <Col span={24}>
                      <Link
                        to={`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/codes/${idNumber}`}
                      >
                        Xem danh sách mã giảm giá của đợt phát hành
                      </Link>
                    </Col>
                  </Row>
                )}
                {!checkPromoCode && (
                  <Row gutter={30} style={{gap: 15}}>
                    <Col
                      span={24}
                      style={{
                        color: "#E24343",
                        textAlign: "center",
                        marginBottom: 20,
                      }}
                    >
                      <span>Đợt phát hành chưa có mã nào!</span>
                    </Col>
                    <Col
                      span="24"
                      style={{
                        display: "flex",
                        gap: 15,
                      }}
                    >
                      <div
                        className="card-discount-code"
                        onClick={() => setShowAddCodeManual(true)}
                      >
                        <img
                          style={{
                            background:
                              "linear-gradient(65.71deg, #0088FF 28.29%, #33A0FF 97.55%)",
                          }}
                          src={VoucherIcon}
                          alt=""
                        />
                        <p style={{fontWeight: 500}}>Thêm mã thủ công</p>
                        <p>
                          Sử dụng khi bạn chỉ phát hành số lượng ít mã giảm giá hoặc áp
                          dụng 1 mã nhiều lần
                        </p>
                      </div>
                      <div
                        className="card-discount-code"
                        onClick={() => setShowAddCodeRandom(true)}
                      >
                        <img
                          style={{
                            background:
                              "linear-gradient(62.06deg, #0FD186 25.88%, #3FDA9E 100%)",
                          }}
                          src={AddListCouponIcon}
                          alt=""
                        />
                        <p style={{fontWeight: 500}}>Thêm mã ngẫu nhiên</p>
                        <p>
                          Sử dụng khi bạn muốn tạo ra danh sách mã giảm giá ngẫu nhiên và
                          phát cho mỗi khách hàng 1 mã
                        </p>
                      </div>
                      <div
                        className="card-discount-code"
                        onClick={() => setShowImportFile(true)}
                      >
                        <img
                          style={{
                            background:
                              "linear-gradient(66.01deg, #FFAE06 37.34%, #FFBE38 101.09%)",
                          }}
                          src={AddImportCouponIcon}
                          alt=""
                        />
                        <p style={{fontWeight: 500}}>Nhập file Excel</p>
                        <p>
                          Sử dụng khi bạn có sẵn danh sách mã giảm giá để nhập lên phần
                          mềm
                        </p>
                        <a href={AppConfig.DISCOUNT_CODES_TEMPLATE_URL}>Tải file mẫu</a>
                      </div>
                    </Col>
                  </Row>
                )}
              </Card>
              <Card
                className="card"
                title={
                  <div style={{alignItems: "center"}}>
                    <span className="title-card">Điều kiện mua hàng</span>
                  </div>
                }
              >
                <Space size={"large"} direction={"vertical"} style={{width: "100%"}}>
                  <Row>
                    <Col span={12}>
                      <span style={{fontWeight: 500}}>
                        Đơn hàng có giá trị từ: {formatCurrency(minOrderSubtotal)}₫
                      </span>
                    </Col>
                    <Col span={12}>
                      <span style={{fontWeight: 500}}>Áp dụng cho : {applyFor}</span>
                    </Col>
                  </Row>
                  {entitlements.length > 0 ? (
                    <CustomTable
                      dataSource={entitlements}
                      columns={
                        entitlements.length > 1
                          ? columns
                          : columns.filter((column: any) => column.title !== "STT")
                      }
                      pagination={false}
                    />
                  ) : (
                    ""
                  )}
                </Space>
              </Card>
            </Col>
            <GeneralConditionDetail data={data} />
          </Row>
        </React.Fragment>
      )}
      <BottomBarContainer
        back="Quay lại danh sách đợt phát hành"
        rightComponent={
          <Space>
            {/* {allowCancelPromoCode ? (
              <Button disabled onClick={onDelete} style={{color: "#E24343"}}>
                Xoá
              </Button>
            ) : null} */}
            {allowUpdatePromoCode && data?.state!=='DISABLED' ? <Button onClick={onEdit}>Sửa</Button> : null}

            {allowCreatePromoCode ? <Button disabled>Nhân bản</Button> : null}
            {allowCancelPromoCode ? renderActionButton() : null}
          </Space>
        }
      />
      <CustomModal
        type={"MANUAL"}
        visible={showAddCodeManual}
        okText="Thêm"
        cancelText="Thoát"
        title="Thêm mã thủ công"
        onCancel={() => {
          setShowAddCodeManual(false);
        }}
        onOk={(value) => {
          setShowAddCodeManual(false);
          handleAddManual(value);
        }}
      />
      <CustomModal
        type={"RANDOM"}
        visible={showAddCodeRandom}
        okText="Thêm"
        cancelText="Thoát"
        title="Thêm mã ngẫu nhiên"
        onCancel={() => {
          setShowAddCodeRandom(false);
        }}
        onOk={(value: any) => {
          handleAddRandom(value);
          setShowAddCodeRandom(false);
        }}
      />
      <Modal
        onCancel={() => {
          setSuccessCount(0);
          setSuccessCount(0);
          setUploadStatus(undefined);
          setShowImportFile(false);
        }}
        width={650}
        visible={showImportFile}
        title="Nhập file khuyến mại"
        footer={[
          <Button
            key="back"
            onClick={() => {
              setSuccessCount(0);
              setSuccessCount(0);
              setUploadStatus(undefined);
              setShowImportFile(false);
            }}
          >
            Huỷ
          </Button>,

          <Button
            key="link"
            type="primary"
            onClick={() => {
              setSuccessCount(0);
              setSuccessCount(0);
              setUploadStatus(undefined);
              dispatch(getListPromoCode(idNumber, dataQuery, checkIsHasPromo));
              setShowImportFile(false);
            }}
          >
            Xác nhận
          </Button>,
        ]}
      >
        <div
          style={{
            display:
              uploadStatus === undefined || uploadStatus === "removed" ? "" : "none",
          }}
        >
          <Row gutter={12}>
            <Col span={3}>Chú ý:</Col>
            <Col span={19}>
              <p>- Kiểm tra đúng loại phương thức khuyến mại khi xuất nhập file</p>
              <p>- Chuyển đổi file dưới dạng .XSLX trước khi tải dữ liệu</p>
              <p>
                - Tải file mẫu{" "}
                <a href={AppConfig.DISCOUNT_CODES_TEMPLATE_URL}> tại đây </a>{" "}
              </p>
              <p>- File nhập có dụng lượng tối đa là 2MB và 2000 bản ghi</p>
              <p>
                - Với file có nhiều bản ghi, hệ thống cần mất thời gian xử lý từ 3 đến 5
                phút. Trong lúc hệ thống xử lý không F5 hoặc tắt cửa sổ trình duyệt.
              </p>
            </Col>
          </Row>
          <Row gutter={24}>
            <div className="dragger-wrapper">
              <Dragger
                accept=".xlsx"
                multiple={false}
                showUploadList={false}
                beforeUpload={(file) => {
                  if (
                    file.type !==
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  ) {
                    setUploadStatus("error");
                    setUploadError(["Sai định dạng file. Chỉ upload file .xlsx"]);
                    return false;
                  }
                  setUploadStatus("uploading");
                  setUploadError([]);
                  return true;
                }}
                action={`${AppConfig.baseUrl}promotion-service/price-rules/${idNumber}/discount-codes/read-file`}
                headers={{Authorization: `Bearer ${token}`}}
                onChange={(info) => {
                  const {status} = info.file;
                  if (status === "done") {
                    const response = info.file.response;
                    if (response.code === 20000000) {
                      if (response.data.errors.length > 0) {
                        const errors: Array<any> = _.uniqBy(
                          response.data.errors,
                          "index"
                        ).sort((a: any, b: any) => a.index - b.index);
                        setCodeErrorsResponse([...errors]);
                      } else {
                        setCodeErrorsResponse([]);
                      }
                      setImportTotal(response.data.total);
                      setSuccessCount(response.data.success_count);
                      setUploadStatus(status);
                      dispatch(getListPromoCode(idNumber, dataQuery, checkIsHasPromo));
                    } else {
                      setUploadStatus("error");
                      setUploadError(response.errors);
                    }
                  } else if (status === "error") {
                    message.error(`${info.file.name} file upload failed.`);
                    setUploadStatus(status);
                  }
                }}
              >
                <p className="ant-upload-drag-icon">
                  <RiUpload2Line size={48} />
                </p>
                <p className="ant-upload-hint">
                  Kéo file vào đây hoặc tải lên từ thiết bị
                </p>
              </Dragger>
            </div>
          </Row>
        </div>
        <Row>
          <div
            style={{
              display:
                uploadStatus === "done" ||
                uploadStatus === "uploading" ||
                uploadStatus === "success" ||
                uploadStatus === "error"
                  ? ""
                  : "none",
            }}
          >
            <Row justify={"center"}>
              {uploadStatus === "uploading" ? (
                <Col span={24}>
                  <Row justify={"center"}>
                    {/*<Col span={24}>*/}
                    <Space size={"large"}>
                      <LoadingOutlined style={{fontSize: "78px"}} />
                      <h2 style={{padding: "10px 30px"}}>Đang upload file...</h2>
                    </Space>
                    {/*</Col>*/}
                  </Row>
                </Col>
              ) : (
                ""
              )}
              {uploadStatus === "error" ? (
                <Col span={24}>
                  <Row justify={"center"}>
                    <Space size={"large"}>
                      <VscError style={{fontSize: "78px", color: "#E24343"}} />
                      <h2 style={{padding: "10px 30px"}}>
                        <li>{uploadError || "Máy chủ đang bận"}</li>
                      </h2>
                    </Space>
                  </Row>
                </Col>
              ) : (
                ""
              )}
              {uploadStatus === "done" ? (
                <Col span={24}>
                  <Row justify={"center"}>
                    <CheckCircleOutlined style={{fontSize: "78px", color: "#27AE60"}} />
                  </Row>
                  <Row justify={"center"}>
                    <h2 style={{padding: "10px 30px"}}>
                      Xử lý file nhập toàn tất:{" "}
                      <strong style={{color: "#2A2A86"}}>
                        {successCount} / {importTotal}
                      </strong>{" "}
                      mã giảm giá thành công
                    </h2>
                  </Row>
                  <Divider />
                  {codeErrorsResponse.length > 0 ? (
                    <div>
                      <Row justify={"start"}>
                        <h3 style={{color: "#E24343"}}>Danh sách lỗi: </h3>
                      </Row>
                      <Row justify={"start"}>
                        <li style={{padding: "10px 30px"}}>
                          {codeErrorsResponse?.map((error: any, index) => (
                            <ul key={index}>
                              <span>
                                - Dòng {error.index + 2}: {error.value}{" "}
                                {csvColumnMapping[error.type.toLowerCase()]}
                              </span>
                            </ul>
                          ))}
                        </li>
                      </Row>
                    </div>
                  ) : (
                    ""
                  )}
                </Col>
              ) : (
                ""
              )}
            </Row>
          </div>
        </Row>
      </Modal>
    </ContentContainer>
  );
};

export default PromotionDetailScreen;
