import { Button, Card, Col, Divider, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import "domain/actions/promotion/promo-code/promo-code.action";
import useAuthorization from "hook/useAuthorization";
import { ProductEntitlements } from "model/promotion/discount.create.model";
import { DiscountResponse } from "model/response/promotion/discount/list-discount.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import BottomBarContainer from "../../../component/container/bottom-bar.container";
import CustomTable from "../../../component/table/CustomTable";
import { HttpStatus } from "../../../config/http-status.config";
import { unauthorizedAction } from "../../../domain/actions/auth/auth.action";
import { hideLoading, showLoading } from "../../../domain/actions/loading.action";
import {
  bulkEnablePriceRules,
  getVariants,
  promoGetDetail
} from "../../../domain/actions/promotion/discount/discount.action";
import { bulkDisablePriceRules } from "../../../service/promotion/discount/discount.service";
import { showError } from "../../../utils/ToastUtils";
import GeneralConditionDetail from "../shared/general-condition.detail";
import { columnDiscountByRule, columnDiscountQuantity, columnFixedPrice, discountStatus } from "./constants";
import "./discount.scss";
import { useHistory } from "react-router-dom";
import DiscountRuleInfo from "./components/discount-rule-info";

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
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const idNumber = parseInt(id);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dataDiscount, setDataDiscount] = useState<DiscountResponse | null>(null);
  const [quantityColumn, setQuantityColumn] = useState<any>([]);

  const [dataVariants, setDataVariants] = useState<Array<ProductEntitlements>>([]);

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
      setDataDiscount(result);
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

  const getEntitled_method = (data: DiscountResponse) => {
    if (data.entitled_method === "FIXED_PRICE") return "Đồng giá";
    if (data.entitled_method === "QUANTITY") return "Chiết khấu theo từng sản phẩm";
  };

  const promoDetail: Array<any> | undefined = React.useMemo(() => {
    if (dataDiscount) {
      const details = [
        {
          name: "Tên khuyến mãi",
          value: dataDiscount.title,
          position: "left",
          key: "1",
        },
        {
          name: "Mã khuyến mãi",
          value: dataDiscount.code ? dataDiscount.code : "",
          position: "left",
          key: "2",
        },
        {
          name: "Phương thức km",
          value: getEntitled_method(dataDiscount),
          position: "left",
          key: "3",
        },
        {
          name: "Số lượng đã bán",
          value: dataDiscount?.async_allocation_count,
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
          value: dataDiscount.priority,
          position: "right",
          key: "7",
        },
      ];
      return details;
    }
  }, [dataDiscount]);

  const renderStatus = (data: DiscountResponse) => {
    const status = discountStatus.find((status) => status.code === data.state);
    return <span style={{ marginLeft: "20px" }}>{status?.Component}</span>;

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
    switch (dataDiscount?.state) {
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

  useEffect(() => {

    dispatch(promoGetDetail(idNumber, onResult));
    dispatch(getVariants(idNumber, handleResponse));

  }, [dispatch, handleResponse, idNumber, onResult]);

  useEffect(() => {
    if (dataVariants.length === 0) {
      const ranges = dataDiscount?.entitlements[0]?.prerequisite_quantity_ranges[0]
      setDataVariants([{
        variant_title: <span style={{ color: "#2A2A86", fontWeight: 500 }}>Tất cả sản phẩm</span>,
        sku: "",
        limit: ranges?.allocation_limit,
        cost: -1,
        open_quantity: 0,
        product_id: 0,
        variant_id: 0,
        entitlement: dataDiscount?.entitlements[0],
        isParentProduct: true,
        price_rule_id: 0,
      }])
    }
    setQuantityColumn(dataDiscount?.entitled_method !== "FIXED_PRICE" ? columnFixedPrice : columnDiscountQuantity);
  }, [dataDiscount, dataVariants]);

  return (
    <ContentContainer
      isError={error}
      isLoading={loading}
      title={dataDiscount ? dataDiscount.title : "Chi tiết đợt khuyến mãi"}
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
      {dataDiscount !== null && (
        <React.Fragment>
          <Row gutter={24}>
            <Col span={24} md={18}>
              <Card
                className="card"
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="title-card">THÔNG TIN CÁ NHÂN</span>
                    {renderStatus(dataDiscount)}
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
                                className="text-truncate-2"
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
                          {dataDiscount.description ? dataDiscount.description : "---"}
                        </span>
                      </Col>
                    </Col>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={30}>
                  <Col span={24} style={{ textAlign: "right" }}>
                    <Space size={"large"}>
                      <Link to={`#`}>Xem lịch sử chỉnh sửa</Link>
                      <Link to={`#`}>Xem kết quả khuyến mãi</Link>
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

                {dataDiscount.entitled_method === "ORDER_THRESHOLD" &&
                  <>
                    <DiscountRuleInfo dataDiscount={dataDiscount} />
                    <CustomTable
                      columns={columnDiscountByRule}
                      dataSource={dataDiscount.rule?.conditions}
                      pagination={false}
                      rowKey={(record: any) => record}
                    />
                  </>}

                {dataDiscount.entitled_method !== "ORDER_THRESHOLD" && <CustomTable
                  dataSource={dataVariants}
                  columns={
                    dataVariants.length > 1
                      ? quantityColumn
                      : quantityColumn.filter((column: any) => column.title !== "STT") // show only when have more than 1 entitlement
                  }
                  pagination={false}
                />}

              </Card>
            </Col>
            <GeneralConditionDetail data={dataDiscount} />
          </Row>
          <BottomBarContainer
            back="Quay lại danh sách khuyến mại"
            backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`)}
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
