import {
  Button,
  Card,
  Col,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Tabs,
  Typography,
} from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import RenderTabBar from "component/table/StickyTabBar";
import UrlConfig, { PurchaseOrderTabUrl } from "config/url.config";
import { isEmpty } from "lodash";
import { PurchaseOrder, PurchaseOrderPrint } from "model/purchase-order/purchase-order.model";
import {
  PurchaseProcument,
  PurchaseProcumentLineItem,
  PurchaseProcumentSubmit,
} from "model/purchase-order/purchase-procument";
import { useDispatch, useSelector } from "react-redux";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import PurchaseOrderHistory from "screens/purchase-order/tab/PurchaseOrderHistory";
import {
  getPurchaseOrderApi,
  printMultipleProcurementApi,
} from "service/purchase-order/purchase-order.service";
import { callApiNative } from "utils/ApiUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import ImageProduct from "screens/products/product/component/ImageProduct";
import { POUtils } from "utils/POUtils";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { DeleteOutlined, ImportOutlined, PhoneOutlined, PrinterOutlined } from "@ant-design/icons";
import EditNote from "screens/order-online/component/edit-note";
import { primaryColor } from "utils/global-styles/variables";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { PoProcumentDeleteAction } from "domain/actions/po/po-procument.action";
import { showError, showSuccess } from "utils/ToastUtils";
import {
  confirmPoProcumentService,
  updatePurchaseProcumentNoteService,
} from "service/purchase-order/purchase-procument.service";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useReactToPrint } from "react-to-print";
import purify from "dompurify";
import statusDraft from "assets/icon/status-draft-new.svg";
import statusFinalized from "assets/icon/status-finalized-new.svg";
import statusStored from "assets/icon/status-finished-new.svg";
import statusCancelled from "assets/icon/status-cancelled-new.svg";
import { ProcurementStep } from "../components";
import procurementIcon from "assets/icon/stock-in-out-icon.svg";
import arrowLeft from "assets/icon/arrow-back.svg";
import NumberInput from "component/custom/number-input.custom";
import { ImportProcurementExcel } from "../ProcurementCreateManualScreen/components";
import moment from "moment";
import { ProcurementDetailWrapper } from "./style";
import {
  ProcurementStatus,
  ProcurementStatusName,
  POProcurementField,
  POProcurementLineItemField,
} from "../helper";

type ProcurementParam = {
  id: string;
  prID: string;
};

const ProcurementDetailScreen: React.FC = () => {
  const { id: poID, prID } = useParams<ProcurementParam>();
  const [poData, setPOData] = useState<PurchaseOrder>();
  const [procurementData, setProcurementData] = useState<PurchaseProcument>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isError, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(PurchaseOrderTabUrl.INVENTORY);
  const [isVisibleDelete, setIsVisibleDelete] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const { TabPane } = Tabs;
  const { Text } = Typography;
  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );
  const [printContent, setPrintContent] = useState<string>("");
  const [totalRealQuantity, setTotalRealQuantity] = useState<number>(0);
  const [isLoadingBtn, setIsLoadingBtn] = useState<boolean>(false);
  const [isImport, setIsImport] = useState<boolean>(false);
  const printElementRef = useRef(null);
  const [formMain] = Form.useForm();

  const getPODetail = useCallback(async () => {
    const res: PurchaseOrder = await callApiNative(
      { isShowError: true, isShowLoading: true },
      dispatch,
      getPurchaseOrderApi,
      poID,
    );
    if (res && !isEmpty(res.procurements)) {
      setPOData(res);
      setLoading(false);
      const detailProcurement = res.procurements.find(
        (item: PurchaseProcument) => item.id === parseInt(prID),
      );
      if (!isEmpty(detailProcurement)) {
        setProcurementData(detailProcurement);
        const total = POUtils.totalRealQuantityProcument(
          detailProcurement?.procurement_items ?? [],
        );
        setTotalRealQuantity(total);
        formMain.setFieldsValue(detailProcurement);
      } else {
        setError(true);
      }
    } else {
      setError(true);
    }
  }, [dispatch, formMain, poID, prID]);

  useEffect(() => {
    if (poID && prID) {
      setLoading(true);
      getPODetail();
      return;
    }
    setError(true);
  }, [dispatch, getPODetail, poID, prID]);

  const onChangeActive = (active: string) => {
    setActiveTab(active);
  };

  const onUpdateReceivedProcurement = async (note: string) => {
    if (poID && procurementData && prID) {
      const data: PurchaseProcument = {
        ...procurementData,
        [POProcurementField.note]: note,
      };
      const res = await callApiNative(
        { isShowError: true },
        dispatch,
        updatePurchaseProcumentNoteService,
        parseInt(poID),
        parseInt(prID),
        data,
      );
      if (res) {
        getPODetail();
        showSuccess("Cập nhật thành công");
      }
    }
  };

  const renderStatus = () => {
    let icon = "";
    let color = "";
    if (!procurementData) {
      return "";
    }
    switch (procurementData.status) {
      case ProcurementStatus.DRAFT:
        icon = statusDraft;
        color = "#666666";
        break;
      case ProcurementStatus.NOT_RECEIVED:
        icon = statusFinalized;
        color = "#2A2A86";
        break;
      case ProcurementStatus.RECEIVED:
        icon = statusStored;
        color = "#27AE60";
        break;
      case ProcurementStatus.CANCELLED:
        icon = statusCancelled;
        color = "#E24343";
        break;
    }
    return (
      <div style={{ color: color, fontSize: 16 }}>
        {icon && (
          <img
            width={23}
            height={23}
            src={icon}
            alt=""
            style={{ marginRight: 4, marginBottom: 2 }}
          />
        )}
        {ProcurementStatusName[procurementData.status]}
      </div>
    );
  };

  const confirmDeletePhrase: string = useMemo(() => {
    if (!procurementData) return "";
    let prefix = "phiếu nháp";
    if (procurementData.status === ProcurementStatus.NOT_RECEIVED) prefix = "phiếu duyệt";
    else if (procurementData.status === ProcurementStatus.RECEIVED) prefix = "phiếu nhập kho";
    return `Bạn chắc chắn huỷ ${prefix} ${procurementData?.code}?`;
  }, [procurementData]);

  const onDeleteProcumentCallback = (result: any) => {
    if (result !== null) {
      showSuccess("Huỷ phiếu thành công");
      getPODetail();
    }
  };

  const onDeleteProcument = (value: PurchaseProcument) => {
    if (poID && value.id) {
      dispatch(PoProcumentDeleteAction(parseInt(poID), value.id, onDeleteProcumentCallback));
    }
  };

  const checkHaveEditPermission = () => {
    const hasPermission = [PurchaseOrderPermission.update].some((element) => {
      return currentPermissions.includes(element);
    });
    return hasPermission;
  };
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const printContentCallback = useCallback(
    (printContent: Array<PurchaseOrderPrint>) => {
      const pageBreak = "<div class='pageBreak'></div>";
      if (!printContent || printContent.length === 0) return;
      const textResponse = printContent.map((single) => {
        return "<div class='singleOrderPrint'>" + single.html_content + "</div>";
      });
      let textResponseFormatted = textResponse.join(pageBreak);
      //xóa thẻ p thừa
      let result = textResponseFormatted.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint],
  );

  const onPrint = useCallback(async () => {
    const res = await callApiNative(
      { isShowLoading: true },
      dispatch,
      printMultipleProcurementApi,
      procurementData?.id.toString() ?? "0",
    );
    if (res && res.errors) {
      res.errors.forEach((e: string) => {
        showError(e);
      });
      return;
    }
    printContentCallback(res);
    handlePrint && handlePrint();
  }, [dispatch, procurementData?.id, printContentCallback, handlePrint]);

  const importRealQuantity = (data: Array<PurchaseProcumentLineItem>) => {
    formMain.setFieldsValue({ [POProcurementField.procurement_items]: [...data] });
    const total = POUtils.totalRealQuantityProcument(data);
    setTotalRealQuantity(total);
    setIsImport(false);
  };

  const handleChangeQuantityPrLineItem = (quantity: number, sku: string) => {
    let procurementItems: Array<PurchaseProcumentLineItem> = formMain.getFieldValue(
      POProcurementField.procurement_items,
    );
    const prItemIdx = procurementItems.findIndex(
      (el: PurchaseProcumentLineItem) => el.sku.toUpperCase().trim() === sku.toUpperCase().trim(),
    );
    if (prItemIdx !== -1 && quantity !== undefined) {
      procurementItems[prItemIdx].real_quantity = quantity;
      formMain.setFieldsValue({ [POProcurementField.procurement_items]: [...procurementItems] });
      const total = POUtils.totalRealQuantityProcument(procurementItems);
      setTotalRealQuantity(total);
    }
  };

  const onFinish = async () => {
    setIsLoadingBtn(true);
    const values: PurchaseProcumentSubmit = formMain.getFieldsValue(true);
    values.is_update_after_receive = isEdit;
    const response = await callApiNative(
      { isShowError: true },
      dispatch,
      confirmPoProcumentService,
      parseInt(poID),
      parseInt(prID),
      values,
    );
    if (response) {
      showSuccess("Thành công");
      setIsEdit(false);
      getPODetail();
    }
    setIsLoadingBtn(false);
  };

  const checkAllowEditPr = () => {
    const today = moment(new Date()).format(DATE_FORMAT.YYYYMMDD);
    const receivedDate = ConvertUtcToLocalDate(
      procurementData?.stock_in_date,
      DATE_FORMAT.YYYYMMDD,
    );
    const validateDay = moment(today).isSame(receivedDate, "day");
    if (procurementData?.status === ProcurementStatus.RECEIVED && validateDay) {
      return true;
    }
    return false;
  };

  return (
    <ContentContainer
      isError={isError}
      isLoading={isLoading}
      title={` Phiếu nhập kho ${procurementData?.code}` || ""}
      breadcrumb={[
        {
          name: "Nhà cung cấp",
        },
        {
          name: "Nhập kho",
          path: `${UrlConfig.PROCUREMENT}`,
        },
        {
          name: `${poData?.code || ""}`,
          path: `${UrlConfig.PURCHASE_ORDERS}/${poData?.id}`,
        },
      ]}
      extra={procurementData && <ProcurementStep procurementData={procurementData} />}
    >
      <ProcurementDetailWrapper>
        <Card className="pr-detail">
          <Tabs
            style={{ overflow: "initial" }}
            activeKey={activeTab}
            onChange={(active) => onChangeActive(active)}
            renderTabBar={RenderTabBar}
          >
            <TabPane tab="Thông tin phiếu" key={PurchaseOrderTabUrl.INVENTORY}>
              <Form form={formMain} onFinish={onFinish}>
                <Form.Item hidden name={[POProcurementField.procurement_items]}>
                  <Input />
                </Form.Item>
                <div style={{ marginTop: 10, marginBottom: 15 }}>
                  <Space direction="vertical" size="middle" style={{ display: "flex" }}>
                    <Row>
                      <Col span={6} className="pr-detail-pr-code">
                        <div className="pr-detail-pr-code-icon">
                          <img src={procurementIcon} alt="" />
                        </div>
                        <div>
                          <div>Mã phiếu nhập kho:</div>
                          <div>
                            <Text style={{ color: "#2A2A86", fontSize: 16 }} strong>
                              {procurementData?.code}
                            </Text>
                          </div>
                          {renderStatus()}
                        </div>
                      </Col>
                      <Col span={6}>
                        <div>Mã đơn đặt hàng:</div>
                        <div>
                          <Link
                            to={`${UrlConfig.PURCHASE_ORDERS}/${poData?.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {poData?.code}
                          </Link>
                        </div>
                        <div>
                          <Text strong>{poData?.reference}</Text>
                        </div>
                      </Col>
                      {procurementData?.status === ProcurementStatus.RECEIVED && (
                        <Col span={6}>
                          Người nhận:{" "}
                          <div>
                            <Text strong>{procurementData?.stock_in_by}</Text>
                          </div>
                        </Col>
                      )}
                      <Col span={6}>
                        <div>Nhà cung cấp:</div>
                        <div>
                          <Link to={`${UrlConfig.SUPPLIERS}/${poData?.supplier_id}`}>
                            {poData?.supplier ?? poData?.supplier_address.name}
                          </Link>
                        </div>
                        <div>
                          <PhoneOutlined />{" "}
                          <Text>{poData?.phone ?? poData?.supplier_address?.phone}</Text>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={6} style={{ paddingLeft: 54 }}>
                        Kho nhận hàng:{" "}
                        <div>
                          <Text strong>{procurementData?.store}</Text>
                        </div>
                      </Col>
                      <Col span={6}>
                        Ngày nhận hàng dự kiến:{" "}
                        <div>
                          <Text strong>
                            {ConvertUtcToLocalDate(
                              procurementData?.expect_receipt_date,
                              DATE_FORMAT.DDMMYYY,
                            )}
                          </Text>
                        </div>
                      </Col>
                      <Col span={6}>
                        Ngày xe hàng về:{" "}
                        <div>
                          <Text strong>
                            {ConvertUtcToLocalDate(
                              procurementData?.delivery_date,
                              DATE_FORMAT.DDMMYYY,
                            )}
                          </Text>
                        </div>
                      </Col>
                      <Col span={6}>
                        {procurementData && (
                          <EditNote
                            isHaveEditPermission={checkHaveEditPermission()}
                            note={procurementData.note}
                            title="Ghi chú: "
                            color={primaryColor}
                            onOk={(newNote) => {
                              onUpdateReceivedProcurement(newNote);
                            }}
                          />
                        )}
                      </Col>
                    </Row>
                  </Space>
                </div>
                <Form.Item
                  shouldUpdate={(prev, current) => {
                    return (
                      prev[POProcurementField.procurement_items] !==
                      current[POProcurementField.procurement_items]
                    );
                  }}
                  noStyle
                >
                  {({ getFieldValue }) => {
                    let procurementItems: Array<PurchaseProcumentLineItem> =
                      getFieldValue(POProcurementField.procurement_items) ?? [];

                    if (poData && procurementData && !isEmpty(procurementItems)) {
                      const prItemsData = procurementItems.filter(
                        (el: PurchaseProcumentLineItem) =>
                          el.planned_quantity > 0 || el.real_quantity > 0,
                      );
                      return (
                        <>
                          <Table
                            className="product-table"
                            rowClassName="product-table-row"
                            dataSource={prItemsData}
                            tableLayout="fixed"
                            sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
                            pagination={false}
                            columns={[
                              {
                                title: "STT",
                                align: "center",
                                width: "5%",
                                render: (value, record, index) => index + 1,
                              },
                              {
                                title: "Ảnh",
                                align: "center",
                                width: "5%",
                                dataIndex: POProcurementLineItemField.variant_image,
                                render: (value: string) => {
                                  return (
                                    <>
                                      {value ? (
                                        <Image
                                          width={40}
                                          height={40}
                                          placeholder="Xem"
                                          src={value ?? ""}
                                        />
                                      ) : (
                                        <ImageProduct
                                          isDisabled={true}
                                          onClick={undefined}
                                          path={value}
                                        />
                                      )}
                                    </>
                                  );
                                },
                              },
                              {
                                title: "Sản phẩm",
                                width: 150,
                                className: "ant-col-info",
                                dataIndex: POProcurementLineItemField.variant,
                                render: (
                                  value: string,
                                  item: PurchaseProcumentLineItem,
                                  index: number,
                                ) => (
                                  <div>
                                    <div>
                                      <div className="product-item-sku">
                                        {item.sku.toUpperCase()}
                                      </div>
                                      <div className="product-item-name text-truncate-1">
                                        <div className="product-item-name-detail">{value}</div>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              },
                              {
                                title: (
                                  <>
                                    <span>SL kế hoạch</span>
                                    <span style={{ color: "#2A2A86", marginLeft: 5 }}>
                                      <span>{`(${formatCurrency(
                                        POUtils.totalPlannedQuantityProcurement(prItemsData),
                                      )})`}</span>
                                    </span>
                                  </>
                                ),
                                width: 100,
                                align: "center",
                                dataIndex: POProcurementLineItemField.planned_quantity,
                                render: (value, item, index) => (
                                  <div style={{ fontWeight: 700 }}>
                                    {value ? formatCurrency(value) : 0}
                                  </div>
                                ),
                              },
                              {
                                title: (
                                  <>
                                    <span>SL được duyệt</span>
                                    <span style={{ color: "#2A2A86", marginLeft: 5 }}>
                                      <span>{`(${formatCurrency(
                                        POUtils.totalAccpectQuantityProcument(prItemsData),
                                      )})`}</span>
                                    </span>
                                  </>
                                ),
                                align: "center",
                                width: 100,
                                dataIndex: POProcurementLineItemField.accepted_quantity,
                                render: (value, item, index) => (
                                  <div style={{ fontWeight: 700 }}>
                                    {value ? formatCurrency(value) : 0}
                                  </div>
                                ),
                              },
                              {
                                title: (
                                  <div style={{ paddingRight: 25 }}>
                                    <span>SL thực nhận</span>
                                    <span style={{ color: "#27AE60", marginLeft: 5 }}>
                                      <span>{`(${formatCurrency(totalRealQuantity)})`}</span>
                                    </span>
                                  </div>
                                ),
                                align:
                                  procurementData?.status === ProcurementStatus.NOT_RECEIVED ||
                                  isEdit
                                    ? "right"
                                    : "center",
                                width: 100,
                                dataIndex: POProcurementLineItemField.real_quantity,
                                render: (value, item: PurchaseProcumentLineItem, index) => {
                                  return procurementData.status ===
                                    ProcurementStatus.NOT_RECEIVED || isEdit ? (
                                    <div style={{ marginRight: 15 }}>
                                      <NumberInput
                                        isFloat={false}
                                        value={value}
                                        minLength={1}
                                        placeholder="0"
                                        maxLength={12}
                                        onChange={(quantity) => {
                                          if (quantity === null) {
                                            quantity = 0;
                                          }
                                          handleChangeQuantityPrLineItem(quantity || 0, item.sku);
                                        }}
                                        format={(value: string) => {
                                          return formatCurrency(value);
                                        }}
                                        replace={(a: string) => replaceFormatString(a)}
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        paddingRight: 30,
                                        fontWeight: 700,
                                        color: "#27AE60",
                                      }}
                                    >
                                      {value ? formatCurrency(value) : 0}
                                    </div>
                                  );
                                },
                              },
                            ]}
                          />
                          <ImportProcurementExcel
                            onCancel={(preData: Array<PurchaseProcumentLineItem>) => {
                              importRealQuantity(preData);
                            }}
                            onOk={(data: Array<PurchaseProcumentLineItem>) => {
                              importRealQuantity(data);
                            }}
                            title="Import số lượng thực nhận"
                            visible={isImport}
                            dataTable={procurementItems}
                          />
                        </>
                      );
                    }
                  }}
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="Lịch sử thao tác" key={PurchaseOrderTabUrl.HISTORY}>
              <PurchaseOrderHistory poData={poData} procumentCode={procurementData?.code} />
            </TabPane>
          </Tabs>
        </Card>

        <BottomBarContainer
          rightComponent={
            <Space>
              {!isEdit && (
                <Button type="primary" color="#2A2A86" onClick={onPrint}>
                  <PrinterOutlined />
                  In phiếu
                </Button>
              )}
              {poData && checkAllowEditPr() && (
                <>
                  {isEdit && (
                    <Button
                      icon={<ImportOutlined />}
                      onClick={() => {
                        setIsImport(true);
                      }}
                    >
                      Import Excel
                    </Button>
                  )}
                  <AuthWrapper acceptPermissions={[PurchaseOrderPermission.update]}>
                    <Button
                      style={{ border: "1px solid #2A2A86", color: "#2A2A86" }}
                      loading={isLoadingBtn}
                      onClick={() => {
                        if (!isEdit) {
                          setIsEdit(true);
                          return;
                        }
                        formMain.submit();
                      }}
                    >
                      {isEdit ? "Lưu" : "Chỉnh sửa"}
                    </Button>
                  </AuthWrapper>
                </>
              )}
              {poData && procurementData?.status === ProcurementStatus.NOT_RECEIVED && (
                <>
                  <Button
                    icon={<ImportOutlined />}
                    onClick={() => {
                      setIsImport(true);
                    }}
                  >
                    Import Excel
                  </Button>

                  <AuthWrapper acceptPermissions={[PurchaseOrderPermission.update]}>
                    <Button
                      type="primary"
                      color="#2A2A86"
                      loading={isLoadingBtn}
                      onClick={() => formMain.submit()}
                    >
                      Xác nhận nhập
                    </Button>
                  </AuthWrapper>
                </>
              )}
            </Space>
          }
          leftComponent={
            <div
              onClick={() => {
                history.push(`${UrlConfig.PROCUREMENT}`);
                return;
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
          visible={isVisibleDelete}
          onCancel={() => setIsVisibleDelete(false)}
          onOk={() => {
            setIsVisibleDelete(false);
            if (procurementData) onDeleteProcument(procurementData);
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
            <strong className="margin-top-10">{confirmDeletePhrase}</strong>
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
      </ProcurementDetailWrapper>
    </ContentContainer>
  );
};

export default ProcurementDetailScreen;
