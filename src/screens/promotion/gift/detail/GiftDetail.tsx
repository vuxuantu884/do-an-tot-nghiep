import { AutoComplete, Button, Card, Col, Divider, Input, Modal, Progress, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import TextShowMore from "component/container/show-more/text-show-more";
import { PROMOTION_GIFT_PERMISSIONS } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import "domain/actions/promotion/promo-code/promo-code.action";
import useAuthorization from "hook/useAuthorization";
import {
  PromotionGift,
  GIFT_STATE_ENUM,
  GiftProductEntitlements,
  GiftVariant,
} from "model/promotion/gift.model";
import { GIFT_METHOD_ENUM } from "model/promotion/gift.model";
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import BottomBarContainer from "component/container/bottom-bar.container";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  disablePromotionGiftAction,
  enablePromotionGiftAction,
  getPromotionGiftDetailAction,
  getPromotionGiftProductApplyAction,
  getPromotionGiftVariantAction,
  searchProductDiscountVariantAction,
} from "domain/actions/promotion/gift/gift.action";
import { showError, showInfo, showSuccess } from "utils/ToastUtils";
import GeneralConditionDetail from "screens/promotion/shared/general-condition.detail";
import { columnDiscountByRule, DISCOUNT_STATUS } from "screens/promotion/constants";
import { GiftStyled } from "screens/promotion/gift/gift.style";
import { PageResponse } from "model/base/base-metadata.response";
import exportIcon from "assets/icon/export.svg";
import { exportFile, getFile } from "service/other/export.service";
import { HttpStatus } from "config/http-status.config";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import _ from "lodash";
import { ProductResponse } from "model/product/product.model";
import ParentProductItem from "component/item-select/parent-product-item";
import ProductItem from "screens/promotion/gift/detail/ProductItem";
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

const GiftDetail: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const idNumber = parseInt(id);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoadingVariantList, setIsLoadingVariantList] = useState(false);
  const [giftDetail, setGiftDetail] = useState<PromotionGift>();
  const [dataVariants, setDataVariants] = useState<PageResponse<GiftProductEntitlements>>({
    items: [],
    metadata: {
      total: 0,
      limit: 30,
      page: 1,
    },
  });
  const [dataDiscountVariant, setDataDiscountVariant] = useState<Array<GiftProductEntitlements>>(
    [],
  );
  const [loadingDiscountVariant, setLoadingDiscountVariant] = useState(false);

  const isFirstLoadVariantList = useRef(true);
  const countLoadVariantList = useRef(0);

  const [keySearchVariantDiscount, setKeySearchVariantDiscount] = useState("");

  const [giftVariantList, setGiftVariantList] = useState<Array<GiftVariant>>([]);

  /** phân quyền */
  const [allowCreateGift] = useAuthorization({
    acceptPermissions: [PROMOTION_GIFT_PERMISSIONS.CREATE],
  });
  const [allowUpdateGift] = useAuthorization({
    acceptPermissions: [PROMOTION_GIFT_PERMISSIONS.UPDATE],
  });
  const [allowExportProduct] = useAuthorization({
    acceptPermissions: [PROMOTION_GIFT_PERMISSIONS.EXPORT],
  });
  const [allowActiveGift] = useAuthorization({
    acceptPermissions: [PROMOTION_GIFT_PERMISSIONS.ACTIVE],
  });
  /** */

  const getPromotionGiftDetailCallback = useCallback((result: PromotionGift | false) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      setGiftDetail(result);
    }
  }, []);

  const getEntitledMethod = (data: PromotionGift) => {
    switch (data.entitled_method) {
      case GIFT_METHOD_ENUM.QUANTITY:
        return "Tặng quà theo sản phẩm";
      case GIFT_METHOD_ENUM.ORDER_THRESHOLD:
        return "Tặng quà theo đơn hàng";
    }
  };

  const details = [
    {
      name: "Tên khuyến mại",
      value: giftDetail?.title,
      position: "left",
    },
    {
      name: "Mã khuyến mại",
      value: giftDetail?.code,
      position: "left",
    },
    {
      name: "Loại khuyến mại",
      value: giftDetail ? getEntitledMethod(giftDetail) : "",
      position: "right",
    },
    {
      name: "Mô tả",
      value: <TextShowMore maxLength={50}>{giftDetail?.description}</TextShowMore>,
      position: "left",
    },

    {
      name: "Đăng ký với Bộ công thương",
      value: <span>{giftDetail?.is_registered ? "Đã đăng ký" : "Không đăng ký"}</span>,
      position: "right",
    },
  ];

  const RenderStatus = (data: PromotionGift) => {
    const status = DISCOUNT_STATUS.find((status) => status.code === data.state);
    return <span style={{ marginLeft: "20px" }}>{status?.Component}</span>;
  };

  const handleDeactivate = () => {
    dispatch(showLoading());
    dispatch(
      disablePromotionGiftAction(idNumber, (response: any) => {
        if (response) {
          showSuccess("Tạm ngừng chương trình quà tặng thành công");
          setLoading(true);
          dispatch(getPromotionGiftDetailAction(idNumber, getPromotionGiftDetailCallback));
        } else {
          showError("Tạm ngừng chương trình quà tặng thất bại");
        }
        dispatch(hideLoading());
      }),
    );
  };

  const handleActivate = () => {
    dispatch(showLoading());
    dispatch(
      enablePromotionGiftAction(idNumber, (response: any) => {
        if (response) {
          showSuccess("Kích hoạt chương trình quà tặng thành công");
          setLoading(true);
          dispatch(getPromotionGiftDetailAction(idNumber, getPromotionGiftDetailCallback));
        } else {
          showError("Kích hoạt chương trình quà tặng thất bại");
        }
        dispatch(hideLoading());
      }),
    );
  };

  const RenderActionButton = () => {
    switch (giftDetail?.state) {
      case GIFT_STATE_ENUM.ACTIVE:
      case GIFT_STATE_ENUM.DRAFT:
        return (
          <Button type="primary" onClick={handleDeactivate}>
            Tạm ngừng
          </Button>
        );
      case GIFT_STATE_ENUM.DISABLED:
      case GIFT_STATE_ENUM.PENDING:
        return (
          <Button type="primary" onClick={handleActivate}>
            Kích hoạt
          </Button>
        );
      default:
        return null;
    }
  };

  const handleGetGiftProductApplyCallback = useCallback(
    (result: PageResponse<GiftProductEntitlements>) => {
      setLoading(false);
      setIsLoadingVariantList(false);
      if (result) {
        setDataVariants(result);
        setDataDiscountVariant(result.items);
      } else {
        setError(true);
      }
    },
    [],
  );

  const getPromotionGiftProductApply = useCallback(
    (page = 1, limit = 30) => {
      dispatch(
        getPromotionGiftProductApplyAction(
          idNumber,
          { page, limit },
          handleGetGiftProductApplyCallback,
        ),
      );
    },
    [idNumber, dispatch, handleGetGiftProductApplyCallback],
  );

  const handleGetGiftVariantCallback = useCallback((result: PageResponse<GiftVariant>) => {
    if (result) {
      setGiftVariantList(result.items);
    } else {
      setError(true);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(getPromotionGiftDetailAction(idNumber, getPromotionGiftDetailCallback));
    dispatch(getPromotionGiftVariantAction(idNumber, { page: 1 }, handleGetGiftVariantCallback));
    getPromotionGiftProductApply();
  }, [
    dispatch,
    idNumber,
    getPromotionGiftDetailCallback,
    getPromotionGiftProductApply,
    handleGetGiftVariantCallback,
  ]);

  /**
   * Kiểm tra danh sách sản phẩm nếu trong chiết khấu có sản phẩm mà danh sách variant của chiết khấu chưa có => server chưa lưu dữ liệu variant xong => chờ 3s load lại
   * nếu danh sách sản phẩm trong chiết khấu trống thì thì thêm 1 line data để hiển thị tất cả sản phẩm
   */
  useEffect(() => {
    let isVariantNotLoadYet = false;
    const variantLength = dataVariants?.items?.length ?? 0;
    const variantIdLength = giftDetail?.entitlements[0]?.entitled_variant_ids.length ?? 0;
    const productIdLength = giftDetail?.entitlements[0]?.entitled_product_ids.length ?? 0;

    if (
      giftDetail?.entitlements[0] &&
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
        getPromotionGiftProductApply();
      }, RELOAD_VARIANT_LIST_TIME);
    }
    setIsLoadingVariantList(isVariantNotLoadYet);
  }, [dataVariants, giftDetail, dispatch, idNumber, getPromotionGiftProductApply]);

  // handle export file
  const [exportCode, setExportCode] = useState<string | null>(null);

  const handleExportVariant = () => {
    const exportParams = generateQuery({
      id: giftDetail?.id,
      entitled_method: giftDetail?.entitled_method,
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

  const giftProductApplyColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      align: "center",
      width: "70px",
      render: (value: any, item: any, index: number) => index + 1,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "sku",
      align: "left",
      render: (sku: string, item: GiftProductEntitlements) => {
        let url = `${UrlConfig.PRODUCT}/${item.product_id}`;
        if (item.variant_id) {
          url = `${url}/variants/${item.variant_id}`;
        }
        return (
          <div>
            <Link to={url} target="_blank">
              {sku}
            </Link>
            <br />
            <div>{item.title}</div>
          </div>
        );
      },
    },
    {
      title: "Giá bán",
      align: "center",
      width: "200px",
      dataIndex: "retail_price",
      render: (retail_price: number) => {
        if (retail_price >= 0) {
          return formatCurrency(retail_price);
        } else {
          return "-";
        }
      },
    },
    {
      title: "Số lượng tối thiểu",
      align: "center",
      width: "200px",
      render: (item: any) => {
        const greater_than_or_equal_to =
          item.entitlement &&
          item.entitlement.prerequisite_quantity_ranges[0]?.greater_than_or_equal_to;
        if (Number(greater_than_or_equal_to) >= 0) {
          return formatCurrency(Number(greater_than_or_equal_to));
        } else {
          return "-";
        }
      },
    },
  ];

  const giftVariantColumn: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      align: "center",
      width: "70px",
      render: (value: any, item: any, index: number) => index + 1,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "sku",
      align: "left",
      render: (sku: string, item: GiftProductEntitlements) => {
        let url = `${UrlConfig.PRODUCT}/${item.product_id}`;
        if (item.variant_id) {
          url = `${url}/variants/${item.variant_id}`;
        }
        return (
          <div>
            <Link to={url} target="_blank">
              {sku}
            </Link>
            <br />
            <div>{item.title}</div>
          </div>
        );
      },
    },
    {
      title: "Giá bán",
      align: "center",
      width: "200px",
      dataIndex: "retail_price",
      render: (retail_price: number) => {
        if (retail_price >= 0) {
          return formatCurrency(retail_price);
        } else {
          return "-";
        }
      },
    },
    // {
    //   title: "Số lượng tồn",
    //   align: "center",
    //   width: "200px",
    //   render: (item: any) => {
    //     if (Number(item.open_quantity) >= 0) {
    //       return formatCurrency(Number(item.open_quantity));
    //     } else {
    //       return "-";
    //     }
    //   },
    // },
  ];

  return (
    <ContentContainer
      isError={error}
      isLoading={loading}
      title={giftDetail ? giftDetail.title : "Chi tiết chương trình quà tặng"}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
        },
        {
          name: "Quà tặng",
          path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}`,
        },
        {
          name: "Chi tiết chương trình",
        },
      ]}
      extra={
        // Tạm thời ẩn
        allowExportProduct &&
        false && (
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
      {giftDetail && (
        <GiftStyled>
          <Row gutter={24}>
            <Col span={24} md={18}>
              <Card
                className="card"
                title={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="title-card">THÔNG TIN CHUNG</span>
                    {RenderStatus(giftDetail)}
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
              </Card>
              <Card
                className="card product-card"
                title={
                  <div style={{ alignItems: "center" }}>
                    <span className="title-card">DANH SÁCH SẢN PHẨM VÀ ĐIỀU KIỆN ÁP DỤNG</span>
                  </div>
                }
              >
                {/*Tạm thời ẩn*/}
                <Input.Group className="display-flex" style={{ display: "none", marginTop: 20 }}>
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

                {/*Chi tiết quà tặng theo đơn hàng*/}
                {giftDetail.entitled_method === GIFT_METHOD_ENUM.ORDER_THRESHOLD && (
                  <>
                    <div style={{ fontSize: "16px", padding: "20px 0" }}>
                      <span>Quà tặng cho đơn hàng thoả mãn </span>
                      <span style={{ color: "#e24343", fontWeight: "bold" }}>
                        {giftDetail?.rule?.group_operator === "AND" ? " tất cả" : " 1 trong"}
                      </span>
                      <span> các điều kiện</span>
                    </div>
                    <CustomTable
                      columns={columnDiscountByRule}
                      dataSource={giftDetail?.rule?.conditions}
                      pagination={false}
                      rowKey="id"
                    />
                  </>
                )}

                {/*Chi tiết quà tặng theo sản phẩm*/}
                {giftDetail.entitled_method === GIFT_METHOD_ENUM.QUANTITY && (
                  <CustomTable
                    bordered={true}
                    dataSource={dataDiscountVariant}
                    columns={giftProductApplyColumns}
                    isLoading={isLoadingVariantList}
                    scroll={{ y: 500 }}
                    pagination={{
                      total: dataVariants.metadata?.total,
                      pageSize: dataVariants.metadata?.limit,
                      current: dataVariants.metadata?.page,
                      onChange: (page: number, limit?: number) => {
                        getPromotionGiftProductApply(page, limit);
                      },
                      onShowSizeChange: (current: number, size: number) => {
                        getPromotionGiftProductApply(current, size);
                      },
                      showSizeChanger: true,
                    }}
                    isShowPaginationAtHeader
                    rowKey={(item: any) => item.product_id}
                  />
                )}
              </Card>

              <Card
                className="card product-card"
                title={
                  <div style={{ alignItems: "center" }}>
                    <span className="title-card">DANH SÁCH QUÀ TẶNG</span>
                  </div>
                }
              >
                <CustomTable
                  bordered={true}
                  dataSource={giftVariantList}
                  columns={giftVariantColumn}
                  isLoading={isLoadingVariantList}
                  pagination={false}
                  scroll={{ y: 500 }}
                  style={{ paddingTop: 20 }}
                  rowKey={(item: any) => item.product_id}
                />

                <Divider style={{ marginTop: 20 }} />
              </Card>
            </Col>

            <GeneralConditionDetail data={giftDetail} />
          </Row>

          <BottomBarContainer
            back="Quay lại danh sách quà tặng"
            backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.GIFT}`)}
            rightComponent={
              <Space>
                {/*Tạm thời chưa dùng*/}
                {allowCreateGift && false && (
                  <Link to={`${idNumber}/replicate`}>
                    <Button>Nhân bản</Button>
                  </Link>
                )}

                {allowUpdateGift && (
                  <Link to={`${idNumber}/update`}>
                    <Button>Chỉnh sửa</Button>
                  </Link>
                )}

                {allowActiveGift && RenderActionButton()}
              </Space>
            }
          />
        </GiftStyled>
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

export default GiftDetail;
