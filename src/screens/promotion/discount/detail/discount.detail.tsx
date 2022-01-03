import { Button, Card, Col, Row, Space } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import TextShowMore from "component/container/show-more/text-show-more";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import "domain/actions/promotion/promo-code/promo-code.action";
import useAuthorization from "hook/useAuthorization";
import { PriceRuleMethod, PriceRule, ProductEntitlements } from "model/promotion/price-rules.model";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import BottomBarContainer from "../../../../component/container/bottom-bar.container";
import CustomTable from "../../../../component/table/CustomTable";
import { HttpStatus } from "../../../../config/http-status.config";
import { unauthorizedAction } from "../../../../domain/actions/auth/auth.action";
import { hideLoading, showLoading } from "../../../../domain/actions/loading.action";
import {
  bulkEnablePriceRulesAction,
  getVariants,
  promoGetDetail
} from "../../../../domain/actions/promotion/discount/discount.action";
import { bulkDisablePriceRules } from "../../../../service/promotion/discount/discount.service";
import { showError, showInfo } from "../../../../utils/ToastUtils";
import GeneralConditionDetail from "../../shared/general-condition.detail";
import DiscountRuleInfo from "../components/discount-rule-info";
import { columnDiscountByRule, columnDiscountQuantity, columnFixedPrice, discountStatus } from "../constants/index";
import "../discount.scss";

const MAX_LOAD_VARIANT_LIST = 5;
const RELOAD_VARIANT_LIST_TIME = 3000;
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
  const [isLoadingVariantList, setIsLoadingVariantList] = useState(false);
  const [dataDiscount, setDataDiscount] = useState<PriceRule | null>(null);
  const [quantityColumn, setQuantityColumn] = useState<any>([]);
  const [dataVariants, setDataVariants] = useState<Array<ProductEntitlements>>();
  const isFirstLoadVariantList = useRef(true);
  const countLoadVariantList = useRef(0);

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

  const onResult = useCallback((result: PriceRule | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setDataDiscount(result);
    }
  }, []);

  const handleResponse = useCallback((result: ProductEntitlements[]) => {
    setLoading(false);
    if (result) {
      setDataVariants(result);
    } else {
      setError(true);
    }
  }, []);

  const getEntitledMethod = (data: PriceRule) => {

    switch (data.entitled_method) {
      case PriceRuleMethod.FIXED_PRICE:
        return "Đồng giá";
      case PriceRuleMethod.QUANTITY:
        return "Chiết khấu theo từng sản phẩm";
      case PriceRuleMethod.ORDER_THRESHOLD:
        return "Chiết khấu theo đơn hàng";
    }

  };

  const promoDetail: Array<any> | undefined = React.useMemo(() => {
    if (dataDiscount) {
      const details = [
        {
          name: "Tên khuyến mãi",
          value: dataDiscount.title,
          position: "left",
        },
        {
          name: "Mã khuyến mãi",
          value: dataDiscount.code ? dataDiscount.code : "",
          position: "left",
        },
        {
          name: "Phương thức km",
          value: getEntitledMethod(dataDiscount),
          position: "left",
        },
        {
          name: "Số lượng đã bán",
          value: dataDiscount?.async_allocation_count,
          position: "right",
        },
        {
          name: "Số lượng áp dụng",
          value: dataDiscount?.quantity_limit || "Không giới hạn",
          position: "right",
        },
        // {
        //   name: "Tổng doanh thu",
        //   value: "---",
        //   position: "right",
        // },
        {
          name: "Mức độ ưu tiên",
          value: dataDiscount.priority,
          position: "right",
        },
        {
          name: "Mô tả",
          value: <TextShowMore maxLength={50}>{dataDiscount.description}</TextShowMore>,
          position: "left",
        },
      ];
      return details;
    }
  }, [dataDiscount]);

  const renderStatus = (data: PriceRule) => {
    const status = discountStatus.find((status) => status.code === data.state);
    return <span style={{ marginLeft: "20px" }}>{status?.Component}</span>;

  };

  const onActivate = () => {
    dispatch(showLoading());
    dispatch(bulkEnablePriceRulesAction({ ids: [idNumber] }, onActivateSuccess));
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

  /**
   * Kiểm tra danh sách sản phẩm nếu trong chiết khấu có sản phẩm mà danh sách variant của chiết khấu chưa có => server chưa lưu dữ liệu variant xong => chờ 3s load lại
   * nếu danh sách sản phẩm trong chiết khấu trống thì thì thêm 1 line data để hiển thị tất cả sản phẩm
   */
  useEffect(() => {
    let isVariantNotLoadYet = false;
    const variantLength = dataVariants?.length ?? 0;
    const variantIdLength = dataDiscount?.entitlements[0]?.entitled_variant_ids.length ?? 0;
    const productIdLength = dataDiscount?.entitlements[0]?.entitled_product_ids.length ?? 0;

    if (dataDiscount?.entitlements[0] && variantLength < variantIdLength + productIdLength && countLoadVariantList.current <= MAX_LOAD_VARIANT_LIST) {
      isVariantNotLoadYet = true;
      countLoadVariantList.current++;
      if (isFirstLoadVariantList.current) {
        showInfo("Đang tải dữ liệu sản phẩm...");
        isFirstLoadVariantList.current = false;
      }
      setTimeout(() => {
        dispatch(getVariants(idNumber, handleResponse));
      }, RELOAD_VARIANT_LIST_TIME);
    }


    if (
      dataDiscount?.entitlements[0]?.entitled_product_ids.length === 0
      && dataDiscount?.entitlements[0]?.entitled_variant_ids.length === 0) {

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
        price_rule_id: 0,
      }])
    }

    setQuantityColumn(dataDiscount?.entitled_method !== PriceRuleMethod.FIXED_PRICE ? columnFixedPrice : columnDiscountQuantity);
    setIsLoadingVariantList(isVariantNotLoadYet);
  }, [dataVariants, dataDiscount, dispatch, handleResponse, idNumber]);

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

                              <div
                              >
                                {detail.value ? detail.value : "---"}
                              </div>

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

                {/* <Divider />
                <Row gutter={30}>
                  <Col span={24} style={{ textAlign: "right" }}>
                    <Space size={"large"}>
                      <Link to={`#`}>Xem lịch sử chỉnh sửa</Link>
                      <Link to={`#`}>Xem kết quả khuyến mãi</Link>
                    </Space>
                  </Col>
                </Row> */}
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
                      rowKey="id"
                    />
                  </>}



                {dataDiscount.entitled_method !== "ORDER_THRESHOLD" && dataVariants && <CustomTable
                  rowKey="id"
                  dataSource={dataVariants}
                  columns={
                    dataVariants.length > 1
                      ? quantityColumn
                      : quantityColumn.filter((column: any) => column.title !== "STT") // show only when have more than 1 entitlement
                  }
                  isLoading={isLoadingVariantList}
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
                {allowUpdatePromoCode && (
                  <AuthWrapper acceptPermissions={[PromoPermistion.UPDATE]}>
                    <Link to={`${idNumber}/update`}><Button>Sửa</Button> </Link>
                  </AuthWrapper>
                )
                }
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
