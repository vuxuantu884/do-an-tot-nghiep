/**
 * @deprecated : component này cần refactor
 */
import {Button, Card, Col, message, Modal, Row, Space} from "antd";
import Dragger from "antd/lib/upload/Dragger";
import DiscountIcon from "assets/icon/discount.svg";
import UserIcon from "assets/icon/user-icon.svg";
import CloseIcon from "assets/icon/x-close-red.svg";
import AddImportCouponIcon from "assets/img/add_import_coupon_code.svg";
import AddListCouponIcon from "assets/img/add_list_coupon_code.svg";
import VoucherIcon from "assets/img/voucher.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { PROMOTION_CDN } from "config/cdn/promotion.cdn";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  addPriceRules,
  bulkDisablePriceRulesAction,
  bulkEnablePriceRulesAction, getPriceRuleAction, getVariantsAction
} from "domain/actions/promotion/discount/discount.action";
import {
  addPromoCode,
  getListPromoCode
} from "domain/actions/promotion/promo-code/promo-code.action";
import useAuthorization from "hook/useAuthorization";
import { PriceRule, PriceRuleMethod } from "model/promotion/price-rules.model";
import React, { useCallback, useEffect, useState } from "react";
import { VscError } from "react-icons/all";
import { RiUpload2Line } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import {showError, showSuccess, showWarning} from "utils/ToastUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import CustomTable from "../../../component/table/CustomTable";
import { AppConfig } from "../../../config/app.config";
import {formatCurrency, isNullOrUndefined} from "utils/AppUtils";
import { getToken } from "../../../utils/LocalStorageUtils";
import { columnDiscountByRule } from "../constants";
import DiscountRuleInfo from "../discount/components/discount-rule-info";
import GeneralConditionDetail from "../shared/general-condition.detail";
import CustomModal from "./components/CustomModal";
import "./promo-code.scss";
import {addPromotionCodeApi, getPromotionJobsApi} from "../../../service/promotion/promo-code/promo-code.service";
import {HttpStatus} from "../../../config/http-status.config";
import {EnumJobStatus} from "../../../config/enum.config";
import ProcessAddDiscountCodeModal from "screens/promotion/promo-code/components/ProcessAddDiscountCodeModal";

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

const PromotionDetailScreen: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const token = getToken() || "";

  const { id } = useParams() as any;
  const idNumber = parseInt(id);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingClone, setLoadingClone] = useState(false);
  const [showAddCodeManual, setShowAddCodeManual] = React.useState<boolean>(false);
  const [showAddCodeRandom, setShowAddCodeRandom] = React.useState<boolean>(false);
  const [showImportFile, setShowImportFile] = React.useState<boolean>(false);
  const [data, setData] = useState<PriceRule | null>(null);
  const [checkPromoCode, setCheckPromoCode] = useState<boolean>(true);
  const [uploadError, setUploadError] = useState<any>("");
  const [uploadStatus, setUploadStatus] = useState<
    "error" | "success" | "done" | "uploading" | "removed" | undefined
  >(undefined);
  const [dataVariants, setDataVariants] = useState<any | null>(null);
  const [, setEntitlements] = useState<Array<any>>([]);
  const [, setMinOrderSubtotal] = useState(0);
  const [, setApplyFor] = useState("Sản phẩm");

  //phân quyền
  const [allowCancelPromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CANCEL],
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
    dispatch(getVariantsAction(idNumber, handleResponse));
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


  const getDiscountCodeData = useCallback(() => {
    dispatch(getListPromoCode(idNumber, dataQuery, checkIsHasPromo));
  }, [checkIsHasPromo, dataQuery, dispatch, idNumber]);

  useEffect(() => {
    getDiscountCodeData();
  }, [getDiscountCodeData]);

  const onActivate = () => {
    dispatch(showLoading());
    dispatch(bulkEnablePriceRulesAction({ ids: [idNumber] }, onActivateSuccess));
  };

  const onDeactivate = () => {
    dispatch(showLoading());
    dispatch(bulkDisablePriceRulesAction({ ids: [idNumber] }, onActivateSuccess));
  };

  // section handle call api GET DETAIL
  const onResult = useCallback((result: PriceRule | false) => {
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
    dispatch(getPriceRuleAction(idNumber, onResult));
  }, [dispatch, idNumber, onResult]);


  const onEdit = useCallback(() => {
    history.push(`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${idNumber}/update`);
  }, [history, idNumber]);

  const renderDiscountInfo = (value: any, type: any) => {
    if (type === "PERCENTAGE") return `Giảm ${value}%`;
    else return `Giảm ${formatCurrency(value)} VNĐ`;
  };

  useEffect(() => {
    dispatch(getPriceRuleAction(idNumber, onResult));
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
      (body.discount_codes as Array<any>).push({ code: element });
    });

    resetProgress();
    dispatch(showLoading());
    addPromotionCodeApi(idNumber, body)
      .then((response) => {
        setShowAddCodeManual(false);
        if (response?.code) {
          setIsVisibleProcessModal(true);
          setJobCreateCode(response.code);
          setIsProcessing(true);
        } else {
          showWarning("Có lỗi khi tạo tiến trình Thêm mới mã giảm giá");
        }
      })
      .catch((error) => {
        if (error.response?.data?.errors?.length > 0) {
          const errorMessage = error.response?.data?.errors[0];
          showError(`${errorMessage ? errorMessage: "Có lỗi xảy ra, vui lòng thử lại sau"}`);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  }

  // handle jobs create new discount code
  const [jobCreateCode, setJobCreateCode] = useState<string>("");
  const [isVisibleProcessModal, setIsVisibleProcessModal] = useState(false);
  const [processPercent, setProcessPercent] = useState<number>(0);
  const [progressData, setProgressData] = useState(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const resetProgress = () => {
    setProcessPercent(0);
    setJobCreateCode("");
  }

  const getPromotionJobs = useCallback(() => {
    if (!jobCreateCode) return;

    let promotionJobsPromises: any = getPromotionJobsApi(jobCreateCode);
    Promise.all([promotionJobsPromises]).then((responses) => {
      responses.forEach((response) => {
        const processData = response?.data;
        if (response.code === HttpStatus.SUCCESS && processData && !isNullOrUndefined(processData.total)) {
          setProgressData(processData);
          if (processData.status?.toUpperCase() === EnumJobStatus.finish) {
            setProcessPercent(100);
            setJobCreateCode("");
            setIsProcessing(false);
          } else {
            if (processData.processed >= processData.total) {
              setProcessPercent(99);
            } else {
              const percent = Math.round((processData.processed / processData.total) * 100 * 100) / 100;
              setProcessPercent(percent);
            }
          }
        }
      });
    });
  }, [jobCreateCode]);

  useEffect(() => {
    if (processPercent === 100 || !jobCreateCode) return;

    getPromotionJobs();

    const getFileInterval = setInterval(getPromotionJobs,3000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPromotionJobs, jobCreateCode]);

  const onOKProgressImportCustomer = () => {
    resetProgress();
    setIsVisibleProcessModal(false);
    setUploadStatus(undefined);
    getDiscountCodeData();
  }
  // end handle jobs create new discount code

  const handleAddRandom = (value: any) => {
    if (!value) return;
    resetProgress();
    const body = {
      discount_codes: null,
      generate_discount_codes: {
        prefix: value.prefix,
        suffix: value.suffix,
        length: value.length,
        count: value.count,
      },
    };

    dispatch(showLoading());
    addPromotionCodeApi(idNumber, body)
      .then((response) => {
        setShowAddCodeManual(false);
        if (response?.code) {
          setIsVisibleProcessModal(true);
          setJobCreateCode(response.code);
          setIsProcessing(true);
        } else {
          showWarning("Có lỗi khi tạo tiến trình Thêm mới mã giảm giá");
        }
      })
      .catch((error) => {
        if (error.response?.data?.errors?.length > 0) {
          const errorMessage = error.response?.data?.errors[0];
          showError(`${errorMessage ? errorMessage: "Có lỗi xảy ra, vui lòng thử lại sau"}`);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  }

  const addCallBack = useCallback(
    (response) => {
      dispatch(hideLoading());
      if (response) {
        showSuccess("Thêm thành công");
        getDiscountCodeData();
      }
    },
    [dispatch, getDiscountCodeData]
  );

  /**
   * Clone KM
   */
  const handleClone = () => {
    /**
     * Đoạn này chạy thử là hiểu logic
     */
    setLoadingClone(true);
    const match = /.+\(([0-9]+)\)$/.exec(`${data?.title}`);
    const clonedTitle = match ? `${data?.title?.substring(0, data?.title?.length - match[1].length - 3)} (${parseInt(match[1], 10) + 1})` : `${data?.title?.trimRight()} (2)`;
    dispatch(addPriceRules({ ...data, discount_codes: [], title: clonedTitle } as PriceRule, (response) => {
      if (response) {
        showSuccess("Nhân bản thành công");
        history.push(response.id + "");
      }else{
        showError("Nhân bản thất bại");
      }
      setLoadingClone(false);
    }
    ));
  }
  const renderStatus = (data: PriceRule) => {
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

  // const columns: Array<any> = [
  //   {
  //     title: "STT",
  //     align: "center",
  //     width: "5%",
  //     render: (value: any, item: any, index: number) => index + 1,
  //   },
  //   {
  //     title: "Sản phẩm",
  //     dataIndex: "sku",
  //     align: "left",
  //     width: "40%",
  //     render: (value: string, item: any, index: number) => {
  //       return (
  //         <div>
  //           <Link to={`${UrlConfig.PRODUCT}/${idNumber}/variants/${item.id}`}>
  //             {value}
  //           </Link>
  //           <div>{item.title}</div>
  //         </div>
  //       );
  //     },
  //   },
  //   {
  //     title: "Số lượng tối thiểu",
  //     align: "center",
  //     dataIndex: "minimum",
  //   },
  // ];

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
                  <div style={{ alignItems: "center" }}>
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
                              <span style={{ color: "#666666" }}>{detail.name}</span>
                              <span style={{ color: detail.color }}>:</span>
                            </Col>
                            <Col span={12} style={{ paddingLeft: 0 }}>
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
                    <span style={{ marginLeft: 14 }}>
                      Không được áp dụng chung với các khuyến mại khác
                    </span>
                  </Col>
                  <Col span={24} style={{ marginTop: 15 }}>
                    <img src={UserIcon} alt="" />
                    <span style={{ marginLeft: 14 }}>
                      {data.usage_limit_per_customer
                        ? `Khách hàng có ${data.usage_limit_per_customer} lần sử dụng mã`
                        : `Khách hàng không bị giới hạn số lần sử dụng mã`}
                    </span>
                  </Col>
                  <Col span={24} style={{ marginTop: 15 }}>
                    <img src={DiscountIcon} alt="" />
                    <span style={{ marginLeft: 14 }}>
                      {data.usage_limit
                        ? `Mỗi mã được sử dụng ${data.usage_limit} lần`
                        : `Mỗi mã được sử dụng không bị giới số lần`}
                    </span>
                  </Col>
                </Row>
                <hr />

              </Card>
              <Card
                className="card"
                title={
                  <div style={{ alignItems: "center" }}>
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
                  <Row gutter={30} style={{ gap: 15 }}>
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
                        <p style={{ fontWeight: 500 }}>Thêm mã thủ công</p>
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
                        <p style={{ fontWeight: 500 }}>Thêm mã ngẫu nhiên</p>
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
                        <p style={{ fontWeight: 500 }}>Nhập file Excel</p>
                        <p>
                          Sử dụng khi bạn có sẵn danh sách mã giảm giá để nhập lên phần
                          mềm
                        </p>
                        <a href={PROMOTION_CDN.DISCOUNT_CODES_TEMPLATE_URL}>Tải file mẫu</a>
                      </div>
                    </Col>
                  </Row>
                )}
              </Card>
              <Card
                title={"Điều kiện mua hàng"}
              >
                <Space size={"large"} direction={"vertical"} style={{ width: "100%" }}>
                  {/* <Row>
                    <Col span={12}>
                      <span style={{ fontWeight: 500 }}>
                        Đơn hàng có giá trị từ: {formatCurrency(minOrderSubtotal)}₫
                      </span>
                    </Col>
                    <Col span={12}>
                      <span style={{ fontWeight: 500 }}>Áp dụng cho : {applyFor}</span>
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
                  )} */}
                  {data.entitled_method === PriceRuleMethod.ORDER_THRESHOLD &&
                    <>
                      <DiscountRuleInfo dataDiscount={data} />
                      <CustomTable
                        columns={columnDiscountByRule}
                        dataSource={data.rule?.conditions}
                        pagination={false}
                        rowKey="id"
                      />
                    </>}
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
            <Button onClick={handleClone} loading={loadingClone}>Nhân bản</Button>
            {data?.state !== 'CANCELLED' && <AuthWrapper acceptPermissions={[PromoPermistion.UPDATE]}><Button onClick={onEdit}>Sửa</Button></AuthWrapper>}
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
              setUploadStatus(undefined);
              getDiscountCodeData();
              setShowImportFile(false);
            }}
          >
            Xong
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
                <a href={PROMOTION_CDN.DISCOUNT_CODES_TEMPLATE_URL}> tại đây </a>{" "}
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
                  if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                    setUploadStatus("error");
                    setUploadError(["Sai định dạng file. Chỉ upload file .xlsx"]);
                    return false;
                  }
                  setShowImportFile(false);
                  setIsVisibleProcessModal(true);
                  setUploadError([]);
                  return true;
                }}
                action={`${AppConfig.baseUrl}promotion-service/price-rules/${idNumber}/discount-codes/read-file2`}
                headers={{ Authorization: `Bearer ${token}` }}
                onChange={(info) => {
                  const { status } = info.file;
                  if (status === "done") {
                    setUploadStatus(undefined);
                    if (info.file?.response?.code) {
                      setIsVisibleProcessModal(true);
                      resetProgress();
                      setJobCreateCode(info.file.response.code);
                      setIsProcessing(true);
                    } else {
                      setIsVisibleProcessModal(false);
                      setUploadStatus("error");
                      setUploadError("Có lỗi khi tạo tiến trình Thêm mới mã giảm giá.");
                    }
                  } else if (status === "error") {
                    setIsVisibleProcessModal(false);
                    message.error(`${info.file.name} file upload failed.`);
                    setUploadStatus("error");
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
          <div style={{ display: uploadStatus === "error" ? "" : "none" }}>
            <Row justify={"center"}>
              {uploadStatus === "error" ? (
                <Col span={24}>
                  <Row justify={"center"}>
                    <Space size={"large"}>
                      <VscError style={{ fontSize: "78px", color: "#E24343" }} />
                      <h2 style={{ padding: "10px 30px" }}>
                        <li>{uploadError || "Máy chủ đang bận"}</li>
                      </h2>
                    </Space>
                  </Row>
                </Col>
              ) : (
                ""
              )}
            </Row>
          </div>
        </Row>
      </Modal>

      {/* Process create new discount code */}
      {isVisibleProcessModal &&
        <ProcessAddDiscountCodeModal
          visible={isVisibleProcessModal}
          onOk={onOKProgressImportCustomer}
          progressData={progressData}
          progressPercent={processPercent}
          isProcessing={isProcessing}
        />
      }
    </ContentContainer>
  );
};

export default PromotionDetailScreen;
