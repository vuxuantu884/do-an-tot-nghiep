import { Button, Card, Col, Modal, Row, Space, Table, Tooltip } from "antd"
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import ContentContainer from "component/container/content.container"
import UrlConfig from "config/url.config"
import BottomBarContainer from "component/container/bottom-bar.container"
import { callApiNative } from "utils/ApiUtils"
import { Link, useHistory, useParams } from "react-router-dom"
import { StockInOutItemsOther, StockInOutOtherPrint } from "model/stock-in-out-other";
import { formatCurrency } from "utils/AppUtils";
import StockInOutProductUtils from "../util/StockInOutProductUtils";
import EditNote from "screens/order-online/component/edit-note";
import { primaryColor } from "utils/global-styles/variables";
import { getDetailStockInOutOthers, printStockInOutOtherDetail, updateStockInOutOthers } from "service/inventory/stock-in-out/index.service";
import { StockInOutOther } from "model/stock-in-out-other";
import { StockInOutField, StockInOutPolicyPriceMapping, StockInOutStatus, StockInOutType, StockInOutTypeMapping, StockInReasonMappingField, StockOutReasonMappingField } from "../constant";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import arrowLeft from "assets/icon/arrow-back.svg";
import stockInOutIcon from "assets/icon/stock-in-out-icon.svg"
import stockInOutIconFinalized from "assets/icon/stock-in-out-icon-finalized.svg"
import stockInOutIconCancelled from "assets/icon/stock-in-out-icon-cancelled.svg"
import imgDefIcon from "assets/img/img-def.svg";
import "./index.scss"
import { showError, showSuccess } from "utils/ToastUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import { StockInOutOthersPermission } from "config/permissions/stock-in-out.permission";
import AuthWrapper from "component/authorization/AuthWrapper";
import { DeleteOutlined, PrinterOutlined } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import purify from "dompurify";

type StockInOutParam = {
  id: string;
}

const ImportExportProcurementOtherDetail: React.FC = () => {

  const [stockInOutData, setStockInOutData] = useState<StockInOutOther>()
  const [isError, setIsError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [visibleDelete, setVisibleDelete] = useState<boolean>(false);
  const [printContent, setPrintContent] = useState<string>("")
  const { id } = useParams<StockInOutParam>()

  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions
  );

  const history = useHistory()
  const dispatch = useDispatch()

  const hasPermission = currentPermissions.includes(StockInOutOthersPermission.update);
  const printElementRef = useRef(null);

  const getStockInOutDetail = useCallback(async (id: string) => {
    setIsLoading(true)
    const response = await callApiNative({ isShowError: true, isShowLoading: true }, dispatch, getDetailStockInOutOthers, parseInt(id))
    if (response) {
      setStockInOutData(response)
    } else {
      setIsError(true)
    }
    setIsLoading(false)
  }, [dispatch])

  useEffect(() => {
    getStockInOutDetail(id)
  }, [dispatch, getStockInOutDetail, id])

  const updateStockInOutOthersData = async (value: string, field: string) => {
    if (stockInOutData) {
      const dataSubmit = { ...stockInOutData, [field]: value }
      const response = await callApiNative({ isShowError: true, isShowLoading: true }, dispatch, updateStockInOutOthers, parseInt(id), dataSubmit)
      if (response) {
        showSuccess("Cập nhật thành công")
        getStockInOutDetail(id)
      }
    }

  }

  const printContentCallback = useCallback(
    (printContent: StockInOutOtherPrint) => {
      if (!printContent) return;
      setPrintContent(printContent.html_content);
    },
    []
  );

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const onPrint = useCallback(async () => {
    const response = await callApiNative({isShowError: true}, dispatch, printStockInOutOtherDetail, parseInt(id))
    if (response && response.errors) {
      response.errors.forEach((e:string) => {
        showError(e);
      });
    }else{
      printContentCallback(response);
      handlePrint && handlePrint();
    }
  },[dispatch, handlePrint, id, printContentCallback])

  return (
    <ContentContainer
      title={`Phiếu ${stockInOutData?.type === StockInOutType.stock_in ? "nhập" : "xuất"} khác ${stockInOutData?.code}`}
      isError={isError}
      isLoading={isLoading}
      breadcrumb={[
        {
          name: "Kho hàng",
          path: UrlConfig.HOME,
        },
        {
          name: "Nhập xuất khác",
          path: UrlConfig.STOCK_IN_OUT_OTHERS,
        },
        {
          name: `${stockInOutData?.code}`
        }
      ]}
    >
      {stockInOutData && (
        <Fragment>
          <Row gutter={24} style={{ paddingBottom: 30 }}>
            <Col span={18}>
              <Card className="ie-detail" title={`THÔNG TIN ${StockInOutTypeMapping[stockInOutData.type].toLocaleUpperCase()} KHO`}
                extra={stockInOutData.status === StockInOutStatus.finalized
                  ? <><img style={{ marginRight: 5, marginBottom: 2, width: 16, height: 16 }} src={stockInOutIconFinalized} alt="" /><span style={{ color: "#27AE60", fontWeight: 600 }}>{`ĐÃ ${StockInOutTypeMapping[stockInOutData.type].toLocaleUpperCase()}`}</span></>
                  : <><img style={{ marginRight: 5, marginBottom: 2, width: 16, height: 16 }} src={stockInOutIconCancelled} alt="" /><span style={{ color: "#E24343", fontWeight: 600 }}>ĐÃ HỦY</span></>
                }
              >
                <Row gutter={24}>
                  <Col className="ie-detail-stock-code" span={8}>
                    <div className="ie-detail-stock-code-icon"><img src={stockInOutIcon} alt="" /></div>
                    <div>
                      <div className="ie-detail-text-field">Mã chứng từ:</div>
                      <div className="ie-detail-text-field-result">{stockInOutData.code}</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="ie-detail-text-field">Kho hàng:</div>
                    <div><b>{stockInOutData.store}</b></div>
                  </Col>
                  <Col span={8}>
                    <div className="ie-detail-text-field">{`Lý do ${StockInOutTypeMapping[stockInOutData.type]}:`}</div>
                    <div>
                      <b>{stockInOutData.type === StockInOutType.stock_in
                        ? StockInReasonMappingField[stockInOutData.stock_in_out_reason]
                        : StockOutReasonMappingField[stockInOutData.stock_in_out_reason]}
                      </b>
                    </div>
                  </Col>
                </Row>
              </Card>

              <Card title={`SẢN PHẨM ${StockInOutTypeMapping[stockInOutData.type].toLocaleUpperCase()}`}
                extra={
                  <div style={{ display: "flex" }}>
                    <div className="ie-detail-text-field">Chính sách giá:</div>
                    <b style={{ marginLeft: 4 }}>
                      {StockInOutPolicyPriceMapping[stockInOutData.policy_price]}
                    </b>
                  </div>
                }
              >
                <Table
                  className="product-table"
                  rowKey={(record: StockInOutItemsOther) => record.sku}
                  rowClassName="product-table-row"
                  columns={[
                    {
                      title: "STT",
                      align: "center",
                      width: "5%",
                      render: (value, record, index) => index + 1,
                    },
                    {
                      title: "Ảnh",
                      width: "5%",
                      align: "center",
                      dataIndex: "variant_image",
                      render: (value) => (
                        <div style={{ marginRight: "auto", marginLeft: "auto" }} className="product-item-image">
                          <img
                            src={value === null ? imgDefIcon : value}
                            alt=""
                            className=""
                          />
                        </div>
                      ),
                    },
                    {
                      title: "Sản phẩm",
                      width: "35%",
                      className: "ant-col-info",
                      dataIndex: "variant_name",
                      render: (
                        value: string,
                        item: StockInOutItemsOther,
                        index: number
                      ) => {
                        return (
                          <div>
                            <div>
                              <div className="product-item-sku">
                                <Link
                                  target="_blank"
                                  to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                                  className="text-truncate-1"
                                >
                                  {item.sku}
                                </Link>
                              </div>
                              <div className="product-item-name">
                                <div>
                                  {value}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      title: (
                        <div
                        >
                          <div>Số Lượng</div>
                          <div
                            style={{ color: "#2A2A86", fontWeight: "normal", marginLeft: 5 }}
                          >
                            ({formatCurrency(StockInOutProductUtils.totalQuantity(stockInOutData.stock_in_out_other_items ?? []), ".")})
                          </div>
                        </div>
                      ),
                      width: "15%",
                      dataIndex: "quantity",
                      align: "center",
                      render: (value, item: StockInOutItemsOther, index) => {
                        return (formatCurrency(value, "."))
                      },
                    },
                    {
                      title: (
                        <div
                        >
                          <div>
                            Giá
                            <span
                              style={{
                                color: "#737373",
                                fontSize: "12px",
                                fontWeight: "normal",
                              }}
                            >
                              {" "}
                              ₫
                            </span>
                          </div>
                        </div>
                      ),
                      width: "15%",
                      align: "center",
                      dataIndex: stockInOutData.policy_price,
                      render: (value, item, index) => {
                        return (
                          <div>
                            {formatCurrency(Math.round(value || 0), ".")}
                            <span
                              style={{
                                color: "#737373",
                                fontSize: "12px",
                                fontWeight: "normal",
                              }}
                            >
                            </span>
                          </div>

                        );
                      },
                    },
                    {
                      dataIndex: "amount",
                      title: (
                        <Tooltip title="Thành tiền">
                          <div
                          >
                            Thành tiền
                            <span
                              style={{
                                color: "#737373",
                                fontSize: "12px",
                                fontWeight: "normal",
                              }}
                            >
                              {" "}
                              ₫
                            </span>
                          </div>
                        </Tooltip>
                      ),
                      align: "center",
                      width: "20%",
                      render: (value, item) => (
                        <div
                        >
                          {formatCurrency(Math.round(value || 0), ".")}
                        </div>
                      ),
                    },
                  ]}
                  dataSource={stockInOutData.stock_in_out_other_items ?? []}
                  tableLayout="fixed"
                  pagination={false}
                  bordered
                />
                <Row gutter={24}>

                  <Col span={12} />
                  <Col span={12} className="ie-payment-detail-row">
                    <div style={{ width: "27%", textAlign: "center" }}><b>Tổng tiền:</b></div>
                    <div style={{ width: "30%" }}></div>
                    <div style={{ width: "43%" }} className="ie-payment-detail-row-result">{formatCurrency(Math.round(StockInOutProductUtils.getTotalAmountByStockInOutItems(stockInOutData.stock_in_out_other_items)), ".") ?? "-"}</div>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={6}>
              <Card title={`THÔNG TIN PHIẾU ${StockInOutTypeMapping[stockInOutData.type].toLocaleUpperCase()}`}>
                <Row>
                  <Space direction="vertical" size="middle">
                    <Col>
                      <div className="ie-detail-text-field">Người tạo phiếu:</div>
                      <div>
                        <Link className="ie-detail-text-field-result" to={`${UrlConfig.ACCOUNTS}/${stockInOutData.created_by}`} target="_blank" rel="noopener noreferrer">
                          {stockInOutData.created_by} - {stockInOutData.created_name}
                        </Link>
                      </div>
                    </Col>
                    <Col>
                      <div className="ie-detail-text-field">Nhân viên đề nghị nhập:</div>
                      <div>
                        <Link className="ie-detail-text-field-result" to={`${UrlConfig.ACCOUNTS}/${stockInOutData.account_code}`} target="_blank" rel="noopener noreferrer">
                          {stockInOutData.account_code} - {stockInOutData.account_name}
                        </Link>

                      </div>
                    </Col>
                    <Col>
                      <div className="ie-detail-text-field">Thời gian tạo:</div>
                      <div><b>{ConvertUtcToLocalDate(stockInOutData.created_date, DATE_FORMAT.DDMMYY_HHmm)}</b></div>
                    </Col>
                    <Col>
                      <div className="ie-detail-text-field">Đối tác:</div>
                      <div><b>{stockInOutData.partner_name}</b></div>
                    </Col>
                    <Col>
                      <div className="ie-detail-text-field">Số điện thoại:</div>
                      <div><b>{stockInOutData.partner_mobile}</b></div>
                    </Col>
                    <Col span={24}>
                      <div className="ie-detail-text-field">Địa chỉ:</div>
                      <div><b>{stockInOutData.partner_address}</b></div>
                    </Col>
                  </Space>
                </Row>
              </Card>
              <Card title="THÔNG TIN BỔ SUNG">
                <Row>
                  <Space direction="vertical" size="middle">
                    <Col span={24}>
                      <div className="ie-detail-text-field">
                        <EditNote
                          isHaveEditPermission={hasPermission}
                          note={stockInOutData.internal_note}
                          title="Ghi chú nội bộ: "
                          color={primaryColor}
                          onOk={(newNote) => {
                            if (newNote.length > 255) {
                              showError("Ghi chú không được quá 255 ký tự")
                              return
                            }
                            updateStockInOutOthersData(newNote, StockInOutField.internal_note);
                          }}
                        />
                      </div>

                    </Col>
                    <Col span={24}>
                      <div className="ie-detail-text-field">
                        <EditNote
                          isHaveEditPermission={hasPermission}
                          note={stockInOutData.partner_note}
                          title="Ghi chú đối tác: "
                          color={primaryColor}
                          onOk={(newNote) => {
                            if (newNote.length > 255) {
                              showError("Ghi chú không được quá 255 ký tự")
                              return
                            }
                            updateStockInOutOthersData(newNote, StockInOutField.partner_note);
                          }}
                        />
                      </div>
                    </Col>
                  </Space>
                </Row>
              </Card>
            </Col>
          </Row>
        </Fragment>
      )}
      <BottomBarContainer
        rightComponent={
          <Space>
            <AuthWrapper acceptPermissions={[StockInOutOthersPermission.read]}>
              <Button
                type="primary"
                color="#2A2A86"
                onClick={onPrint}
              ><PrinterOutlined />
                In phiếu
              </Button>
            </AuthWrapper>
            {stockInOutData && stockInOutData?.status !== StockInOutStatus.cancelled && (
              <AuthWrapper acceptPermissions={[StockInOutOthersPermission.update]}>
                <Button
                  type="ghost"
                  danger
                  onClick={() => {
                    setVisibleDelete(true);
                  }}
                >
                  Hủy phiếu
                </Button>
              </AuthWrapper>
            )}
          </Space>
        }
        leftComponent={
          <div
            onClick={() => {
              history.push(`${UrlConfig.STOCK_IN_OUT_OTHERS}`)
              return
            }}
            style={{ cursor: "pointer" }}
          >
            <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
            {"Quay lại danh sách"}
          </div>
        }
      />
      <Modal
        width={500}
        centered
        visible={visibleDelete}
        onCancel={() => setVisibleDelete(false)}
        onOk={() => {
          setVisibleDelete(false);
          if (stockInOutData) updateStockInOutOthersData(StockInOutStatus.cancelled, StockInOutField.status);
        }}
        cancelText={`Hủy`}
        okText={`Đồng ý`}
      >
        <Row align="top">
          <DeleteOutlined
            style={{
              fontSize: 40,
              background: "#e24343",
              color: "white",
              borderRadius: "50%",
              padding: 10,
              marginRight: 10,
            }}
          />
          <strong className="margin-top-10">{`Bạn có chắc chắn muốn hủy phiếu ${stockInOutData?.code}`}</strong>
        </Row>
      </Modal>
      <div style={{ display: "none" }}>
          <div className="printContent" ref={printElementRef}>
              <div
                  dangerouslySetInnerHTML={{
                    __html: purify.sanitize(printContent),
                  }}
              />
          </div>
      </div>
    </ContentContainer>
  )
}

export default ImportExportProcurementOtherDetail
