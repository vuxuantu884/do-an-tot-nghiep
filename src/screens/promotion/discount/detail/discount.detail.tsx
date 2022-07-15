import {Button, Card, Col, Modal, Progress, Row, Space} from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import TextShowMore from "component/container/show-more/text-show-more";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import "domain/actions/promotion/promo-code/promo-code.action";
import useAuthorization from "hook/useAuthorization";
import { PriceRule, PriceRuleMethod, PriceRuleState, ProductEntitlements } from "model/promotion/price-rules.model";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
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
  getPriceRuleVariantPaggingAction
} from "../../../../domain/actions/promotion/discount/discount.action";
import { showError, showInfo, showSuccess } from "../../../../utils/ToastUtils";
import GeneralConditionDetail from "../../shared/general-condition.detail";
import DiscountRuleInfo from "../components/discount-rule-info";
import { columnDiscountByRule, columnDiscountQuantity, columnFixedPrice, DISCOUNT_STATUS } from "../../constants";
import { DiscountStyled } from "../discount-style";
import { PageResponse } from "model/base/base-metadata.response";
import exportIcon from "assets/icon/export.svg";
import {exportFile, getFile} from "service/other/export.service";
import {HttpStatus} from "config/http-status.config";
import {generateQuery} from "utils/AppUtils";

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
    }
  });
  const isFirstLoadVariantList = useRef(true);
  const countLoadVariantList = useRef(0);

  //phân quyền
  const [allowUpdatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.UPDATE],
  });

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
      name: "Tên khuyến mãi",
      value: dataDiscount?.title,
      position: "left",
    },
    {
      name: "Mã khuyến mãi",
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
    // {
    //   name: "Tổng doanh thu",
    //   value: "---",
    //   position: "right",
    // },
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
  }

  const handleDeactivate = () => {
    dispatch(showLoading());
    dispatch(bulkDisablePriceRulesAction({ ids: [idNumber] }, (numberOfDisabled: number) => onChangePriceRuleStatus(numberOfDisabled)));
  };


  const handleActivate = () => {
    dispatch(showLoading());
    dispatch(bulkEnablePriceRulesAction({ ids: [idNumber] }, (numberOfDisabled: number) => onChangePriceRuleStatus(numberOfDisabled)));
  };

  const RenderActionButton = () => {
    switch (dataDiscount?.state) {
      case PriceRuleState.ACTIVE:
        return (
          <Button type="primary" onClick={handleDeactivate}>
            Tạm ngừng
          </Button>
        );
      case PriceRuleState.DISABLED:
      case PriceRuleState.DRAFT:
        return (
          <Button type="primary" onClick={handleActivate}>
            Kích hoạt
          </Button>
        );
      default:
        return null;
    }
  };

  const getPriceRuleVariantData = useCallback((page=1, limit=30)=>{
    dispatch(getPriceRuleVariantPaggingAction(idNumber,{page , limit }, handleResponse));
  },[idNumber, dispatch, handleResponse]);

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

    if (dataDiscount?.entitlements[0] && variantLength < variantIdLength + productIdLength && countLoadVariantList.current <= MAX_LOAD_VARIANT_LIST) {
      isVariantNotLoadYet = true;
      countLoadVariantList.current++;
      if (isFirstLoadVariantList.current) {
        showInfo("Đang tải dữ liệu sản phẩm...");
        isFirstLoadVariantList.current = false;
      }
      setTimeout(() => {
        getPriceRuleVariantData()
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

    setQuantityColumn(dataDiscount?.entitled_method !== PriceRuleMethod.FIXED_PRICE ? columnFixedPrice : columnDiscountQuantity);
    setIsLoadingVariantList(isVariantNotLoadYet);
  }, [dataVariants, dataDiscount, dispatch, handleResponse, idNumber, getPriceRuleVariantData]);

  // handle export file
  const [exportCode, setExportCode] = useState<string | null>(null);

  const handleExportVariant = () => {
    const exportParams = generateQuery({
      id: dataDiscount?.id,
      entitled_method: dataDiscount?.entitled_method,
      export_time: Date.now()
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
          showError(`${response.message ? response.message : "Có lỗi xảy ra, vui lòng thử lại sau"}`);
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
  }

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
              showSuccess("Xuất file danh sách sản phẩm khuyến mãi thành công!");
              window.open(response.data.url);
            }
          } else if (response.data && response.data.status === "ERROR") {
            onCancelProgressModal();
            showError("Xuất file danh sách sản phẩm khuyến mãi thất bại!");
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
      extra={
        <Button
          size="large"
          icon={
            <img src={exportIcon} style={{ marginRight: 8 }} alt="" />
          }
          onClick={handleExportVariant}>
          Xuất file danh sách SP
        </Button>
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

                            <div
                            >
                              {detail.value ? detail.value : "---"}
                            </div>

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
                className="card product-card"
                title={
                  <div style={{ alignItems: "center" }}>
                    <span className="title-card">
                      DANH SÁCH SẢN PHẨM VÀ ĐIỀU KIỆN ÁP DỤNG
                    </span>
                  </div>
                }
              >

                {dataDiscount.entitled_method === PriceRuleMethod.ORDER_THRESHOLD &&
                  <>
                    <DiscountRuleInfo dataDiscount={dataDiscount} />
                    <CustomTable
                      columns={columnDiscountByRule}
                      dataSource={dataDiscount.rule?.conditions}
                      pagination={false}
                      rowKey="id"
                    />
                  </>}



                {dataDiscount.entitled_method !== PriceRuleMethod.ORDER_THRESHOLD && dataVariants && <CustomTable
                  rowKey="id"
                  dataSource={dataVariants.items}
                  columns={
                    dataVariants?.items?.length > 1
                      ? quantityColumn
                      : quantityColumn.filter((column: any) => column.title !== "STT") // show only when have more than 1 entitlement
                  }
                  isLoading={isLoadingVariantList}
                  pagination={{
                    total: dataVariants.metadata?.total,
                    pageSize: dataVariants.metadata?.limit,
                    current: dataVariants.metadata?.page,
                    onChange: (page: number, limit?:number) => {
                      getPriceRuleVariantData(page,limit);
                  },
                  onShowSizeChange: (current: number, size: number) => {
                    getPriceRuleVariantData(current,size);
                  },
                  showSizeChanger: true,
                }}
                  isShowPaginationAtHeader
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
                {allowUpdatePromoCode && RenderActionButton()}
              </Space>
            }
          />
        </DiscountStyled>
      )}

      {isVisibleProgressModal &&
        <Modal
          onCancel={onCancelProgressModal}
          visible={isVisibleProgressModal}
          title="Xuất file danh sách sản phẩm được áp dụng chiết khấu"
          centered
          width={600}
          maskClosable={false}
          footer={[
            <div style={{ display: "flex", justifyContent: "space-between"}}>
              <Button
                key="cancel-process-modal"
                danger onClick={onCancelProgressModal}
              >
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
            </div>
          ]}>
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 15 }}>
              {exportProgress < 100 ?
                <span>Đang tạo file, vui lòng đợi trong giây lát...</span>
                :
                <span style={{ color: "#27AE60" }}>Đã xuất file danh sách sản phẩm khuyến mãi thành công!</span>
              }
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
      }
    </ContentContainer>
  );
};

export default PromotionDetailScreen;
