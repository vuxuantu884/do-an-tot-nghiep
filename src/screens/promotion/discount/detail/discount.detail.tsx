import { AutoComplete, Button, Card, Col, Input, Modal, Progress, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import TextShowMore from "component/container/show-more/text-show-more";
import { PriceRulesPermission } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import "domain/actions/promotion/promo-code/promo-code.action";
import useAuthorization from "hook/useAuthorization";
import {
  PriceRule,
  PriceRuleMethod,
  PriceRuleState,
  ProductEntitlements,
} from "model/promotion/price-rules.model";
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import BottomBarContainer from "../../../../component/container/bottom-bar.container";
import CustomTable from "../../../../component/table/CustomTable";
import { hideLoading, showLoading } from "../../../../domain/actions/loading.action";
import {
  bulkDisablePriceRulesAction,
  bulkEnablePriceRulesAction,
  getPriceRuleAction,
  getPriceRuleVariantPaggingAction,
  searchProductDiscountVariantAction,
} from "../../../../domain/actions/promotion/discount/discount.action";
import { showError, showInfo, showSuccess } from "../../../../utils/ToastUtils";
import GeneralConditionDetail from "../../shared/general-condition.detail";
import DiscountRuleInfo from "../components/discount-rule-info";
import {
  columnDiscountByRule,
  columnDiscountQuantity,
  columnFixedPrice,
  DiscountUnitType,
  DISCOUNT_STATUS,
} from "screens/promotion/constants";
import { DiscountStyled } from "../discount-style";
import { PageResponse } from "model/base/base-metadata.response";
import exportIcon from "assets/icon/export.svg";
import { exportFile, getFile } from "service/other/export.service";
import { HttpStatus } from "config/http-status.config";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import _ from "lodash";
import { ProductResponse } from "model/product/product.model";
import ParentProductItem from "component/item-select/parent-product-item";
import ProductItem from "./product-item";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";

const MAX_LOAD_VARIANT_LIST = 3;
const RELOAD_VARIANT_LIST_TIME = 3000;

type DetailMapping = {
  name: string;
  value?: ReactNode;
  position: string;
  key?: string;
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
  const [dataDiscount, setDataDiscount] = useState<PriceRule>();
  const [quantityColumn, setQuantityColumn] = useState<any>([]);
  const [dataVariants, setDataVariants] = useState<PageResponse<ProductEntitlements>>({
    items: [],
    metadata: {
      total: 0,
      limit: 30,
      page: 1,
    },
  });
  const [dataDiscountVariant, setDataDiscountVariant] = useState<Array<ProductEntitlements>>([]);
  const [loadingDiscountVariant, setLoadingDiscountVariant] = useState(false);

  const isFirstLoadVariantList = useRef(true);
  const countLoadVariantList = useRef(0);

  const [keySearchVariantDiscount, setKeySearchVariantDiscount] = useState("");

  /** phân quyền */
  const [allowCreateDiscount] = useAuthorization({
    acceptPermissions: [PriceRulesPermission.CREATE],
  });
  const [allowUpdateDiscount] = useAuthorization({
    acceptPermissions: [PriceRulesPermission.UPDATE],
  });
  const [allowActiveDiscount] = useAuthorization({
    acceptPermissions: [PriceRulesPermission.ACTIVE],
  });
  const [allowExportProduct] = useAuthorization({
    acceptPermissions: [PriceRulesPermission.EXPORT],
  });
  /** */

  const onResult = useCallback((result: PriceRule | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setDataDiscount(result);
    }
  }, []);

  const handleResponse = useCallback((result: PageResponse<ProductEntitlements>) => {
    setLoading(false);
    setIsLoadingVariantList(false);
    if (result) {
      setDataVariants(result);
      setDataDiscountVariant(result.items);
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

  const details = [
    {
      name: "Tên khuyến mại",
      value: dataDiscount?.title,
      position: "left",
    },
    {
      name: "Mã khuyến mại",
      value: dataDiscount?.code,
      position: "left",
    },
    {
      name: "Phương thức km",
      value: dataDiscount ? getEntitledMethod(dataDiscount) : "",
      position: "left",
    },
    {
      name: "Số lượng đã bán",
      value: dataDiscount?.async_allocation_count,
      position: "right",
    },
    {
      name: "Số lượng áp dụng",
      value: dataDiscount?.quantity_limit ?? "Không giới hạn",
      position: "right",
    },
    {
      name: "Số lượt áp dụng trên 1 KH",
      value: dataDiscount?.usage_limit_per_customer ?? "Không giới hạn",
      position: "right",
    },
    {
      name: "Mức độ ưu tiên",
      value: dataDiscount?.priority,
      position: "right",
    },
    {
      name: "Mô tả",
      value: <TextShowMore maxLength={50}>{dataDiscount?.description}</TextShowMore>,
      position: "left",
    },
    {
      name: "Đăng ký với Bộ công thương",
      value: <span>{dataDiscount?.is_registered ? "Đã đăng ký" : "Không đăng ký"}</span>,
      position: "left",
    },
  ];

  const RenderStatus = (data: PriceRule) => {
    const status = DISCOUNT_STATUS.find((status) => status.code === data.state);
    return <span style={{ marginLeft: "20px" }}>{status?.Component}</span>;
  };

  const onChangePriceRuleStatus = (numberOfDisabled: number) => {
    if (numberOfDisabled) {
      showSuccess(`Cập nhật chiết khấu thành công`);
      dispatch(getPriceRuleAction(idNumber, onResult));
    } else {
      showError(`Cập nhật chiết khấu thất bại`);
    }
    dispatch(hideLoading());
  };

  const handleDeactivate = () => {
    dispatch(showLoading());
    dispatch(
      bulkDisablePriceRulesAction({ ids: [idNumber] }, (numberOfDisabled: number) =>
        onChangePriceRuleStatus(numberOfDisabled),
      ),
    );
  };

  const handleActivate = () => {
    dispatch(showLoading());
    dispatch(
      bulkEnablePriceRulesAction({ ids: [idNumber] }, (numberOfDisabled: number) =>
        onChangePriceRuleStatus(numberOfDisabled),
      ),
    );
  };

  const RenderActionButton = () => {
    switch (dataDiscount?.state) {
      case PriceRuleState.ACTIVE:
      case PriceRuleState.DRAFT:
        return (
          <Button type="primary" onClick={handleDeactivate}>
            Tạm ngừng
          </Button>
        );
      case PriceRuleState.DISABLED:
      case PriceRuleState.PENDING:
        return (
          <Button type="primary" onClick={handleActivate}>
            Kích hoạt
          </Button>
        );
      default:
        return null;
    }
  };

  const getPriceRuleVariantData = useCallback(
    (page = 1, limit = 30) => {
      dispatch(getPriceRuleVariantPaggingAction(idNumber, { page, limit }, handleResponse));
    },
    [idNumber, dispatch, handleResponse],
  );

  useEffect(() => {
    dispatch(getPriceRuleAction(idNumber, onResult));
    getPriceRuleVariantData();
  }, [dispatch, idNumber, onResult, getPriceRuleVariantData]);

  /**
   * Kiểm tra danh sách sản phẩm nếu trong chiết khấu có sản phẩm mà danh sách variant của chiết khấu chưa có => server chưa lưu dữ liệu variant xong => chờ 3s load lại
   * nếu danh sách sản phẩm trong chiết khấu trống thì thì thêm 1 line data để hiển thị tất cả sản phẩm
   */
  useEffect(() => {
    let isVariantNotLoadYet = false;
    const variantLength = dataVariants?.items?.length ?? 0;
    const variantIdLength = dataDiscount?.entitlements[0]?.entitled_variant_ids.length ?? 0;
    const productIdLength = dataDiscount?.entitlements[0]?.entitled_product_ids.length ?? 0;

    if (
      dataDiscount?.entitlements[0] &&
      variantLength < variantIdLength + productIdLength &&
      countLoadVariantList.current <= MAX_LOAD_VARIANT_LIST
    ) {
      isVariantNotLoadYet = true;
      countLoadVariantList.current++;
      if (isFirstLoadVariantList.current) {
        showInfo("Đang tải dữ liệu sản phẩm...");
        isFirstLoadVariantList.current = false;
      }
      setTimeout(() => {
        getPriceRuleVariantData();
      }, RELOAD_VARIANT_LIST_TIME);
    }

    // if (
    //   dataDiscount?.entitlements[0]?.entitled_product_ids.length === 0
    //   && dataDiscount?.entitlements[0]?.entitled_variant_ids.length === 0) {

    //   const ranges = dataDiscount?.entitlements[0]?.prerequisite_quantity_ranges[0]
    //   setDataVariants([{
    //     variant_title: <span style={{ color: "#2A2A86", fontWeight: 500 }}>Tất cả sản phẩm</span>,
    //     sku: "",
    //     limit: ranges?.allocation_limit,
    //     cost: -1,
    //     open_quantity: 0,
    //     product_id: 0,
    //     variant_id: 0,
    //     entitlement: dataDiscount?.entitlements[0],
    //     price_rule_id: 0,
    //   }])
    // }

    const columnFixedPriceProductHaveExclude = [...columnFixedPrice];
    columnFixedPriceProductHaveExclude.splice(3, 1);

    const columnDiscountQuantityProductHaveExclude = [...columnDiscountQuantity];
    columnDiscountQuantityProductHaveExclude.splice(3, 2);

    if (dataDiscount?.entitlements[0]?.is_exclude) {
      setQuantityColumn(
        dataDiscount?.entitled_method === PriceRuleMethod.FIXED_PRICE
          ? columnFixedPriceProductHaveExclude
          : columnDiscountQuantityProductHaveExclude,
      );
    } else {
      setQuantityColumn(
        dataDiscount?.entitled_method === PriceRuleMethod.FIXED_PRICE
          ? columnFixedPrice
          : columnDiscountQuantity,
      );
    }

    setIsLoadingVariantList(isVariantNotLoadYet);
  }, [
    dataDiscount?.entitled_method,
    dataDiscount?.entitlements,
    dataVariants?.items?.length,
    getPriceRuleVariantData,
  ]);

  // handle export file
  const [exportCode, setExportCode] = useState<string | null>(null);

  const handleExportVariant = () => {
    const exportParams = generateQuery({
      id: dataDiscount?.id,
      entitled_method: dataDiscount?.entitled_method,
      export_time: Date.now(),
    });

    exportFile({
      conditions: exportParams,
      hidden_fields: "",
      type: "TYPE_EXPORT_PROMOTION_VARIANT_LIST",
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setIsVisibleProgressModal(true);
          setExportCode(response.data.code);
        } else {
          showError(
            `${response.message ? response.message : "Có lỗi xảy ra, vui lòng thử lại sau"}`,
          );
        }
      })
      .catch(() => {
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  };

  // process export modal
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const resetProgress = () => {
    setExportProgress(0);
    setExportCode(null);
  };

  const onCancelProgressModal = useCallback(() => {
    resetProgress();
    setIsVisibleProgressModal(false);
  }, []);

  const checkExportFile = useCallback(() => {
    if (!exportCode) return;

    let getFilePromises = getFile(exportCode);
    Promise.all([getFilePromises]).then((responses) => {
      responses.forEach((response: any) => {
        if (isVisibleProgressModal && response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.status === "PROCESSING") {
            const exportPercent = Number(response?.data?.percent);
            setExportProgress(exportPercent < 100 ? exportPercent : 99);
          } else if (response.data && response.data.status === "FINISH") {
            if (response.data.url) {
              setExportCode(null);
              setExportProgress(100);
              showSuccess("Xuất file danh sách sản phẩm khuyến mại thành công!");
              window.open(response.data.url);
            }
          } else if (response.data && response.data.status === "ERROR") {
            onCancelProgressModal();
            showError("Xuất file danh sách sản phẩm khuyến mại thất bại!");
          }
        }
      });
    });
  }, [exportCode, isVisibleProgressModal, onCancelProgressModal]);

  useEffect(() => {
    if (exportProgress === 100 || !exportCode) return;

    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkExportFile, exportCode]);
  // end process export modal
  // end handle export file

  //==> handle search product

  const onResultSearchVariant = useCallback((result: any) => {
    if (result.items.length <= 0) {
      showError("Không tìm thấy sản phẩm hoặc sản phẩm đã ngưng bán");
    }

    if (!result) {
      setDataDiscountVariant([]);
    } else {
      setLoadingDiscountVariant(false);
      setDataDiscountVariant(result.items);
    }
  }, []);

  const onSearchVariant = useCallback(
    (value: string) => {
      setKeySearchVariantDiscount(value);
      setLoadingDiscountVariant(true);

      dispatch(
        searchProductDiscountVariantAction(
          idNumber,
          {
            variant_sku: value.trim(),
          },
          onResultSearchVariant,
        ),
      );
      if (!value) {
        setLoadingDiscountVariant(false);
      }
    },
    [dispatch, idNumber, onResultSearchVariant],
  );

  const renderResult = useMemo(() => {
    let variantOptions: any[] = [];
    let productOptions: any[] = [];
    let productDataSearch: any[] = [];

    dataDiscountVariant.forEach((item: any) => {
      variantOptions.push({
        label: <ProductItem data={item} key={item.entitlement?.id.toString()} />,
        value: JSON.stringify(item),
      });
    });

    _.unionBy(productDataSearch, "id").forEach((item: ProductResponse) => {
      productOptions.push({
        value: JSON.stringify(item),
        label: <ParentProductItem data={item} key={item.code} />,
      });
    });

    return [...productOptions, ...variantOptions];
  }, [dataDiscountVariant]);

  const onSelectVariant = (value: string) => {
    const item = JSON.parse(value);
    setDataDiscountVariant([item]);
    setKeySearchVariantDiscount(item.sku);
  };
  //<== end handle search product

  const handleRenderListProductDiscount = () => {
    return (
      <>
        {dataVariants && (
          <CustomTable
            rowKey="id"
            dataSource={dataDiscountVariant}
            columns={
              dataDiscountVariant?.length > 1
                ? quantityColumn
                : quantityColumn.filter((column: any) => column.title !== "STT") // show only when have more than 1 entitlement
            }
            isLoading={isLoadingVariantList}
            pagination={{
              total: dataVariants.metadata?.total,
              pageSize: dataVariants.metadata?.limit,
              current: dataVariants.metadata?.page,
              onChange: (page: number, limit?: number) => {
                getPriceRuleVariantData(page, limit);
              },
              onShowSizeChange: (current: number, size: number) => {
                getPriceRuleVariantData(current, size);
              },
              showSizeChanger: true,
            }}
            isShowPaginationAtHeader
          />
        )}
      </>
    );
  };

  const handleRenderValueDiscountProuduct = () => {
    if (!dataDiscount) return <span></span>;
    return (
      <>
        {dataDiscount.entitlements[0].prerequisite_quantity_ranges[0].value_type ===
          DiscountUnitType.FIXED_PRICE.value && (
          <span className="discount-code-product-desc">{`${formatCurrency(
            dataDiscount.entitlements[0].prerequisite_quantity_ranges[0].value ?? 0,
          )}${DiscountUnitType.FIXED_PRICE.label}`}</span>
        )}
        {dataDiscount.entitlements[0].prerequisite_quantity_ranges[0].value_type ===
          DiscountUnitType.FIXED_AMOUNT.value && (
          <span className="discount-code-product-desc">{`${formatCurrency(
            dataDiscount.entitlements[0].prerequisite_quantity_ranges[0].value ?? 0,
          )}${DiscountUnitType.FIXED_AMOUNT.label}`}</span>
        )}
        {dataDiscount.entitlements[0].prerequisite_quantity_ranges[0].value_type ===
          DiscountUnitType.PERCENTAGE.value && (
          <span className="discount-code-product-desc">
            {`${dataDiscount.entitlements[0].prerequisite_quantity_ranges[0].value}
      ${DiscountUnitType.PERCENTAGE.label}`}
          </span>
        )}{" "}
      </>
    );
  };

  return (
    <ContentContainer
      isError={error}
      isLoading={loading}
      title={dataDiscount ? dataDiscount.title : "Chi tiết đợt khuyến mại"}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
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
      extra={
        allowExportProduct && (
          <Button
            size="large"
            icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
            onClick={handleExportVariant}
          >
            Xuất file danh sách SP
          </Button>
        )
      }
    >
      {dataDiscount && (
        <DiscountStyled>
          <Row gutter={24}>
            <Col span={24} md={18}>
              <Card
                className="card"
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="title-card">THÔNG TIN CHUNG</span>
                    {RenderStatus(dataDiscount)}
                  </div>
                }
              >
                <Row gutter={30}>
                  <Col span={12}>
                    {details
                      .filter((detail: DetailMapping) => detail.position === "left")
                      .map((detail: DetailMapping, index: number) => (
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
                            <div>{detail.value ? detail.value : "---"}</div>
                          </Col>
                        </Col>
                      ))}
                  </Col>
                  <Col span={12}>
                    {details
                      .filter((detail: DetailMapping) => detail.position === "right")
                      .map((detail: DetailMapping, index: number) => (
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
                            span={10}
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
                      <Link to={`#`}>Xem kết quả khuyến mại</Link>
                    </Space>
                  </Col>
                </Row> */}
              </Card>
              {dataDiscount.entitled_method === PriceRuleMethod.ORDER_THRESHOLD ? (
                <Card
                  className="card product-card"
                  title={
                    <div style={{ alignItems: "center" }}>
                      <span className="title-card">ĐIỀU KIỆN ÁP DỤNG</span>
                    </div>
                  }
                >
                  <div style={{ marginTop: 20 }}>
                    <DiscountRuleInfo dataDiscount={dataDiscount} />
                    <CustomTable
                      columns={columnDiscountByRule}
                      dataSource={dataDiscount.rule?.conditions}
                      pagination={false}
                      rowKey="id"
                    />
                  </div>
                </Card>
              ) : (
                <Card
                  className="card product-card"
                  title={
                    <div style={{ alignItems: "center" }}>
                      <span className="title-card">DANH SÁCH SẢN PHẨM</span>
                    </div>
                  }
                >
                  <div style={{ marginTop: 20 }}>
                    {dataDiscount?.entitlements[0]?.is_apply_all &&
                    !dataDiscount?.entitlements[0]?.is_exclude ? (
                      <span></span>
                    ) : (
                      <Input.Group className="display-flex" style={{ marginTop: 20 }}>
                        <AutoComplete
                          allowClear
                          value={keySearchVariantDiscount}
                          maxLength={255}
                          dropdownMatchSelectWidth={456}
                          style={{ width: "100%" }}
                          dropdownClassName="product"
                          options={renderResult}
                          onSearch={onSearchVariant}
                          onSelect={onSelectVariant}
                        >
                          <Input
                            placeholder="Thêm sản phẩm theo tên, mã SKU, mã vạch, ..."
                            prefix={
                              loadingDiscountVariant ? (
                                <LoadingOutlined style={{ color: "#2a2a86" }} />
                              ) : (
                                <SearchOutlined style={{ color: "#ABB4BD" }} />
                              )
                            }
                          />
                        </AutoComplete>
                      </Input.Group>
                    )}

                    {!dataDiscount?.entitlements[0]?.is_apply_all &&
                      !dataDiscount?.entitlements[0]?.is_exclude &&
                      handleRenderListProductDiscount()}

                    {dataDiscount?.entitlements[0]?.is_apply_all &&
                      !dataDiscount?.entitlements[0]?.is_exclude && (
                        <div className="discount-code-product">
                          <span>Chiết khấu</span>
                          <div className="discount-code-product-value">
                            {handleRenderValueDiscountProuduct()}
                          </div>
                          <span>cho tất cả sản phẩm</span>
                        </div>
                      )
                    }

                    {dataDiscount?.entitlements[0]?.is_exclude && (
                      <div>
                        <div className="discount-code-product" style={{ marginTop: 12 }}>
                          <span>Chiết khấu</span>
                          <div className="discount-code-product-value">
                            {handleRenderValueDiscountProuduct()}
                          </div>
                          <span>cho tất cả sản phẩm, <strong>loại trừ</strong> các sản phẩm sau:</span>
                        </div>
                        <div>{handleRenderListProductDiscount()}</div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </Col>
            <GeneralConditionDetail data={dataDiscount} />
          </Row>
          <BottomBarContainer
            back="Quay lại danh sách chiết khấu"
            backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`)}
            rightComponent={
              <Space>
                {allowCreateDiscount && (
                  <Link to={`${idNumber}/replicate`}>
                    <Button>Nhân bản</Button>
                  </Link>
                )}

                {allowUpdateDiscount && (
                  <Link to={`${idNumber}/update`}>
                    <Button>Chỉnh sửa</Button>
                  </Link>
                )}

                {allowActiveDiscount && RenderActionButton()}
              </Space>
            }
          />
        </DiscountStyled>
      )}

      {isVisibleProgressModal && (
        <Modal
          onCancel={onCancelProgressModal}
          visible={isVisibleProgressModal}
          title="Xuất file danh sách sản phẩm được áp dụng chiết khấu"
          centered
          width={600}
          maskClosable={false}
          footer={[
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button key="cancel-process-modal" danger onClick={onCancelProgressModal}>
                Thoát
              </Button>
              <Button
                key="confirm-process-modal"
                type="primary"
                onClick={onCancelProgressModal}
                loading={exportProgress < 100}
              >
                Xác nhận
              </Button>
            </div>,
          ]}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 15 }}>
              {exportProgress < 100 ? (
                <span>Đang tạo file, vui lòng đợi trong giây lát...</span>
              ) : (
                <span style={{ color: "#27AE60" }}>
                  Đã xuất file danh sách sản phẩm khuyến mại thành công!
                </span>
              )}
            </div>
            <Progress
              type="circle"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              percent={exportProgress}
            />
          </div>
        </Modal>
      )}
    </ContentContainer>
  );
};

export default PromotionDetailScreen;
