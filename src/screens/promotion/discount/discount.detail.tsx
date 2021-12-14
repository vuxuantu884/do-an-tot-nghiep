import { Button, Card, Col, Divider, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import "domain/actions/promotion/promo-code/promo-code.action";
import useAuthorization from "hook/useAuthorization";
import { DiscountResponse } from "model/response/promotion/discount/list-discount.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { renderDiscountValue, renderTotalBill } from "utils/PromotionUtils";
import BottomBarContainer from "../../../component/container/bottom-bar.container";
import CustomTable from "../../../component/table/CustomTable";
import { HttpStatus } from "../../../config/http-status.config";
import { unauthorizedAction } from "../../../domain/actions/auth/auth.action";
import { hideLoading, showLoading } from "../../../domain/actions/loading.action";
import {
  bulkEnablePriceRules,
  getVariants,
  promoGetDetail,
} from "../../../domain/actions/promotion/discount/discount.action";
import { bulkDisablePriceRules } from "../../../service/promotion/discount/discount.service";
import { formatCurrency } from "../../../utils/AppUtils";
import { showError } from "../../../utils/ToastUtils";
import GeneralConditionDetail from "../shared/general-condition.detail";
import "./discount.scss";

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

  const { id } = useParams() as any;
  const idNumber = parseInt(id);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<DiscountResponse | null>(null);
  const [costType, setCostType] = useState<string>();
  const [dataVariants, setDataVariants] = useState<any | null>(null);
  const [entitlements, setEntitlements] = useState<Array<any>>([]);
  const [quantityColumn, setQuantityColumn] = useState<any>([]);

  //phân quyền
  const [allowCancelPromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CANCEL],
  });
  const [allowUpdatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.UPDATE],
  });
  const [allowCreatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CREATE],
  });

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
    setTimeout(() => {
      dispatch(promoGetDetail(idNumber, onResult));
      dispatch(getVariants(idNumber, handleResponse));
    }, 500);
  }, [dispatch, handleResponse, idNumber, onResult]);

  const spreadData = (data: any) => {
    let result: any[] = [];
    if (data?.entitlements && data?.entitlements.length > 0) {
      data?.entitlements.forEach((entitlement: any) => {
        entitlement.entitled_variant_ids.forEach((vId: any) => {
          const value = entitlement.prerequisite_quantity_ranges[0]["value"];
          const valueType = entitlement.prerequisite_quantity_ranges[0]["value_type"];
          result.push({
            id: vId,
            minimum:
              entitlement.prerequisite_quantity_ranges[0]["greater_than_or_equal_to"],
            allocationLimit:
              entitlement.prerequisite_quantity_ranges[0]["allocation_limit"],
            value: value,
            valueType: valueType,
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
          s.cost = variant.cost;
          s.discountValue = `${renderDiscountValue(s.value, s.valueType)}`;
          s.total = `${renderTotalBill(variant.cost, s.value, s.valueType)}`;
        }
        return s;
      });
    },
    [dataVariants]
  );

  useEffect(() => {
    if (dataVariants && data && data.entitlements.length > 0) {
      setCostType(data.entitled_method);
      const flattenData: Array<any> = spreadData(data);
      const listEntitlements: Array<any> = mergeVariants(flattenData);

      if (!listEntitlements || listEntitlements.length === 0) {
        const rawEntitlement = data.entitlements[0];
        const quantityRange = rawEntitlement.prerequisite_quantity_ranges[0];
        listEntitlements.push({
          title: <span style={{ color: "#2A2A86", fontWeight: 500 }}>Tất cả sản phẩm</span>,
          sku: null,
          minimum: quantityRange.greater_than_or_equal_to,
          allocationLimit: quantityRange.allocation_limit,
          discountValue: `${renderDiscountValue(
            quantityRange.value,
            quantityRange.value_type
          )}`,
          total: `${renderTotalBill(
            quantityRange.cost,
            quantityRange.value,
            quantityRange.value_type
          )}`,
        });
      }
      setEntitlements(listEntitlements);
    }
  }, [data, dataVariants, mergeVariants]);

  useEffect(() => {
    const column = [
      {
        title: "STT",
        align: "center",
        width: "5%",
        render: (value: any, item: any, index: number) => index + 1,
      },
      {
        title: "Sản phẩm",
        dataIndex: "sku",
        visible: true,
        align: "left",
        width: "20%",
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
        title: "Giá bán",
        align: "center",
        visible: false,
        dataIndex: "cost",
        render: (value: string) => formatCurrency(value),
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
        render: (value: string) => <span style={{ color: "#E24343" }}>{value}</span>,
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
        width: "5%",
        // visible: entitlements.length > 1,
        visible: false,
        render: (value: any, item: any, index: number) => index + 1,
      },
      {
        title: "Sản phẩm",
        dataIndex: "sku",
        visible: true,
        align: "left",
        width: "20%",
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
        title: "Giá bán",
        align: "center",
        visible: false,
        dataIndex: "cost",
        render: (value: string) => formatCurrency(value),
      },
      {
        title: "Giá cố định",
        align: "center",
        dataIndex: "total",
        render: (value: any) => (
          <span style={{ color: "#E24343" }}>{formatCurrency(value)}</span>
        ),
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
  }, [costType, idNumber]);


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
          value: data?.async_allocation_count,
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
    const status = discountStatuses.find((status) => status.code === data.state);
    return <span style={status?.style}>{status?.value}</span>;
  };

  const onActivate = () => {
    dispatch(showLoading());
    dispatch(bulkEnablePriceRules({ ids: [idNumber] }, onActivateSuccess));
  };

  const onDeactivate = async () => {
    dispatch(showLoading());
    try {
      const deactivateResponse = await bulkDisablePriceRules({ ids: [idNumber] });
      switch (deactivateResponse.code) {
        case HttpStatus.SUCCESS:
          dispatch(promoGetDetail(idNumber, onResult));
          break;
        case HttpStatus.UNAUTHORIZED:
          dispatch(unauthorizedAction());
          break;
        default:
          deactivateResponse.errors.forEach((e: any) => showError(e.toString()));
          break;
      }
    } catch (error) {
      showError("Thao tác thất bại");
    } finally {
      dispatch(hideLoading());
    }
  };

  const onActivateSuccess = useCallback(() => {
    dispatch(hideLoading());
    dispatch(promoGetDetail(idNumber, onResult));
  }, [dispatch, idNumber, onResult]);

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
                  <div style={{ alignItems: "center" }}>
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
                              span={8}
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
                        <span style={{ color: "#666666" }}>Mô tả</span>
                        <span style={{ fontWeight: 600 }}>:</span>
                      </Col>
                      <Col span={18} style={{ paddingLeft: 0 }}>
                        <span
                          style={{
                            wordWrap: "break-word",
                          }}
                        >
                          {data.description ? data.description : "---"}
                        </span>
                      </Col>
                    </Col>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={30}>
                  <Col span={24} style={{ textAlign: "right" }}>
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
                  <div style={{ alignItems: "center" }}>
                    <span className="title-card">
                      DANH SÁCH SẢN PHẨM VÀ ĐIỀU KIỆN ÁP DỤNG
                    </span>
                  </div>
                }
              >
                <CustomTable
                  dataSource={entitlements}
                  columns={
                    entitlements.length > 1
                      ? quantityColumn
                      : quantityColumn.filter((column: any) => column.title !== "STT")
                  }
                  pagination={false}
                />
              </Card>
            </Col>
            <GeneralConditionDetail data={data} />
          </Row>
          <BottomBarContainer
            back="Quay lại danh sách khuyến mại"
            rightComponent={
              <Space>
                {allowUpdatePromoCode && <Link to={`${idNumber}/update`}><Button>Sửa</Button> </Link>}
                {allowCreatePromoCode && <Button disabled>Nhân bản</Button>}
                {allowCancelPromoCode && renderActionButton()}
              </Space>
            }
          />
        </React.Fragment>
      )}
    </ContentContainer>
  );
};

export default PromotionDetailScreen;
