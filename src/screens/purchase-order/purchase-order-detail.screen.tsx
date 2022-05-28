import { EditOutlined, FilePdfOutlined } from "@ant-design/icons";
import { Button, Col, Collapse, Form, Input, Row, Space } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { AppConfig } from "config/app.config";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction
} from "domain/actions/content/content.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { PaymentConditionsGetAllAction } from "domain/actions/po/payment-conditions.action";
import {
  POCancelAction, PoDetailAction, POGetPurchaseOrderActionLogs, PoUpdateAction
} from "domain/actions/po/po.action";
import purify from "dompurify";
import useAuthorization from "hook/useAuthorization";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import _ from "lodash";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { StoreResponse } from "model/core/store.model";
import { ImportResponse } from "model/other/files/export-model";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";
import { POField } from "model/purchase-order/po-field";
import { POLineItemType, POLoadType, PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import {
  PurchaseOrder,
  PurchaseOrderPrint
} from "model/purchase-order/purchase-order.model";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import { PurchaseOrderActionLogResponse } from "model/response/po/action-log.response";
import moment from "moment";
import React, { lazy, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { getPrintContent } from "service/purchase-order/purchase-order.service";
import { callApiNative } from "utils/ApiUtils";
import { POStatus, ProcumentStatus, VietNamId } from "utils/Constants";
import { ConvertDateToUtc } from "utils/DateUtils";
import { combineLineItemToSubmitData, fetchProductGridData, getUntaxedAmountByLineItemType, POUtils, validateLineItemQuantity } from "utils/POUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import POInfoForm from "./component/po-info.form";
import POInventoryForm from "./component/po-inventory.form";
import POPaymentForm from "./component/po-payment.form";
import POProductFormNew from "./component/po-product-form-grid";
import PoProductContainer from "./component/po-product-form-grid/po-product-container";
import POProductFormOld from "./component/po-product.form";
import POReturnList from "./component/po-return-list";
import POStep from "./component/po-step/po-step";
import POSupplierForm from "./component/po-supplier-form";
import POPaymentConditionsForm from "./component/PoPaymentConditionsForm";
import PurchaseOrderProvider, { PurchaseOrderCreateContext } from "./provider/purchase-order.provider";
import ActionPurchaseOrderHistory from "./Sidebar/ActionHistory";

const ModalDeleteConfirm = lazy(() => import("component/modal/ModalDeleteConfirm"))
const ModalExport = lazy(() => import("./modal/ModalExport"))

const ActionMenu = {
  EXPORT: 1,
  DELETE: 2,
  CLONE: 3,
}

const ActionMenuPrint = {
  FGG: 1, //mẫu in fgg
  NORMAL: 2, //mẫu in thông thường
}

const PrintTypePo = {
  PURCHASE_ORDER: "purchase_order",
  PURCHASE_ORDER_MA_7: "purchase_order_ma_7",
  PURCHASE_ORDER_FGG: "purchase_order_fgg",
  PURCHASE_ORDER_MA_7_FGG: "purchase_order_ma_7_fgg",
}
type PurchaseOrderParam = {
  id: string;
};

const PODetailScreen: React.FC = () => {
  const now = moment();
  const initPurchaseOrder = {
    line_items: [],
    policy_price_code: AppConfig.import_price,
    untaxed_amount: 0,
    trade_discount_rate: null,
    trade_discount_value: null,
    trade_discount_amount: 0,
    payment_discount_rate: null,
    payment_discount_value: null,
    payment_discount_amount: 0,
    total_cost_line: 0,
    total: 0,
    cost_lines: [],
    tax_lines: [],
    supplier_id: 0,
    expect_store_id: "",
    expect_import_date: ConvertDateToUtc(now.startOf("days")),
    order_date: ConvertDateToUtc(now),
    status: POStatus.DRAFT,
    receive_status: ProcumentStatus.DRAFT,
    activated_date: null,
    completed_stock_date: null,
    cancelled_date: null,
    completed_date: null,
  };
  const { id } = useParams<PurchaseOrderParam>();
  let idNumber = parseInt(id);
  const printElementRef = useRef(null);
  const dispatch = useDispatch();
  const history = useHistory();
  const [formMain] = Form.useForm();

  const [visiblePaymentModal, setVisiblePaymentModal] = useState<boolean>(false)
  const [isError, setError] = useState(false);
  const [status, setStatus] = useState<string>(initPurchaseOrder.status);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [listPaymentConditions, setListPaymentConditions] = useState<
    Array<PoPaymentConditions>
  >([]);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [poData, setPurchaseItem] = useState<PurchaseOrder>();
  const [printContent, setPrintContent] = useState<string>("");
  const [isEditDetail, setIsEditDetail] = useState<boolean>(false);
  const [statusAction, setStatusAction] = useState<string>("");
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isSuggest, setSuggest] = useState<boolean>(false);
  const [paymentItem, setPaymentItem] = useState<PurchasePayments>();
  const [initValue, setInitValue] = useState<PurchasePayments | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [actionLog, setActionLog] = useState<PurchaseOrderActionLogResponse[]>([]);
  const [canCancelPO] = useAuthorization({ acceptPermissions: [PurchaseOrderPermission.cancel] })

  const { setPoLineItemGridChema, setPoLineItemGridValue, setTaxRate, isGridMode, setIsGridMode, poLineItemGridValue, poLineItemGridChema, taxRate } = useContext(PurchaseOrderCreateContext);

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const printContentCallback = useCallback(
    (printContent: Array<PurchaseOrderPrint>) => {
      if (!printContent || printContent.length === 0) return;
      setPrintContent(printContent[0].html_content);
    },
    []
  );

  const onDetail = useCallback(
    (result: PurchaseOrder | null) => {
      setLoading(false);
      if (!result) {
        setError(true);
      } else {
        setPurchaseItem(result);
        formMain.setFieldsValue(result);
        setStatus(result.status);
      }
    },
    [formMain]
  );

  const loadDetail = useCallback(
    (id: number, isLoading, isSuggestDetail: boolean) => {
      setSuggest(isSuggestDetail);
      dispatch(PoDetailAction(id, onDetail));
    },
    [dispatch, onDetail]
  );

  const onConfirmButton = () => {
    dispatch(showLoading());
    setIsEditDetail(false);
    setStatusAction(POStatus.FINALIZED);
    formMain.submit();
  };

  const onStoreResult = useCallback((result: Array<StoreResponse>) => {
    if (result) {
      const storeTotals = result.filter(e => e.name?.toLocaleLowerCase().includes('kho tổng'));

      let res = _.uniqBy([...storeTotals, ...result], "name");
      setListStore(res);
    }
  }, []);
  const onUpdateCall = useCallback(
    (result: PurchaseOrder | null) => {
      dispatch(hideLoading());
      setIsEditDetail(false);
      if (result !== null) {
        showSuccess("Cập nhật nhập hàng thành công");
        loadDetail(idNumber, true, false);
      }
    },
    [idNumber, loadDetail, dispatch]
  );
  const onFinish = (value: PurchaseOrder) => {
    try {
      value.is_grid_mode = isGridMode;
      if (isGridMode) {
        if (poLineItemGridValue.length === 0) {
          throw new Error("Vui lòng thêm sản phẩm");
        }
        const gridLineItems: PurchaseOrderLineItem[] = combineLineItemToSubmitData(poLineItemGridValue, poLineItemGridChema, taxRate);
        const supplementLineItems = value?.line_items?.filter(e => e.type === POLineItemType.SUPPLEMENT) || [];
        value.line_items = [...gridLineItems, ...supplementLineItems];
      } else if (poData?.line_items.length === 0) {
        let element: any = document.getElementById("#product_search");
        element?.focus();
        const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
        window.scrollTo({ top: y, behavior: "smooth" });
        throw new Error("Vui lòng thêm sản phẩm");
      }
      
      const atLeastOneItem = validateLineItemQuantity(value.line_items);
      if (!atLeastOneItem) {
        throw new Error("Vui lòng nhập số lượng cho ít nhất 1 sản phẩm");
      }

      const untaxed_amount = getUntaxedAmountByLineItemType(value.line_items, POLoadType.ALL)
      value.untaxed_amount = untaxed_amount
      value.tax_lines = [
        {
          rate: taxRate,
          amount: Math.round((untaxed_amount * taxRate) / 100)
        }
      ]
      value.trade_discount_amount = POUtils.getTotalDiscount(formMain, untaxed_amount);
      const total_after_tax = POUtils.getTotalAfterTax(formMain);
      value.payment_discount_amount = POUtils.getTotalDiscount(formMain, total_after_tax);
      value.total = Math.round(value.line_items.reduce((prev: number, cur: PurchaseOrderLineItem) => {
        const untaxAmount = cur.quantity * cur.price
        return prev + (untaxAmount + (untaxAmount * cur.tax_rate) / 100)
      }, 0))

      const dataClone: any = { ...poData, ...value, status: statusAction };
      switch (dataClone.status) {
        case POStatus.DRAFT:
        case POStatus.STORED:
        case POStatus.COMPLETED:
        case POStatus.FINISHED:
        case POStatus.CANCELLED:
          dispatch(PoUpdateAction(idNumber, dataClone, onUpdateCall));
          break;
        case POStatus.FINALIZED:
          dispatch(PoUpdateAction(idNumber, dataClone, onUpdateCall));
          break;
      }
    } catch (error: any) {
      showError(error.message);
      dispatch(hideLoading());
    }
  };

  const onAddProcumentSuccess = useCallback(
    (isSuggest) => {
      loadDetail(idNumber, true, isSuggest);
    },
    [idNumber, loadDetail]
  );

  const ActionExport = {
    Ok: useCallback((res: ImportResponse) => {
      if (res && res.url) {
        window.location.assign(res.url);
        setShowExportModal(false);
      }
    }, []),
    Cancel: useCallback(() => {
      setShowExportModal(false);
    }, []),
  }

  const onCancel = useCallback(() => {
    dispatch(showLoading());
    dispatch(
      POCancelAction(idNumber, (result) => {
        dispatch(hideLoading());
        if (result !== null) {
          showSuccess("Cập nhật nhập hàng thành công");
          loadDetail(idNumber, false, false);
        }
      })
    );
  }, [dispatch, idNumber, loadDetail]);

  const handleClonePo = useCallback(() => {
    window.open(`${BASE_NAME_ROUTER}${UrlConfig.PURCHASE_ORDERS}/create?poId=${idNumber}`, "_blank");
  }, [idNumber]);

  const onMenuClick = (index: number) => {
    switch (index) {
      case ActionMenu.DELETE:
        setConfirmDelete(true);
        break;
      case ActionMenu.EXPORT:
        setShowExportModal(true);
        break;
      case ActionMenu.CLONE:
        handleClonePo();
    }
  };

  const actionPrint = useCallback(async (poId: number, printType: string) => {
    const res = await callApiNative({ isShowLoading: true }, dispatch, getPrintContent, poId, printType);
    if (res && res.data && res.data.message) {
      showError(res.data.message);
    } else {
      printContentCallback(res);
      handlePrint && handlePrint();
    }
  }, [dispatch, handlePrint, printContentCallback]);

  const onMenuPrint = (index: number) => {
    dispatch(showLoading());
    switch (index) {
      case ActionMenuPrint.NORMAL:
        if (isGridMode) {
          actionPrint(idNumber, PrintTypePo.PURCHASE_ORDER_MA_7);
          break;
        }
        actionPrint(idNumber, PrintTypePo.PURCHASE_ORDER);
        break;
      case ActionMenuPrint.FGG:
        if (isGridMode) {
          actionPrint(idNumber, PrintTypePo.PURCHASE_ORDER_MA_7_FGG);
          break;
        }
        actionPrint(idNumber, PrintTypePo.PURCHASE_ORDER_FGG);
        break;
    }
  };

  const redirectToReturn = useCallback(() => {
    if (poData?.status === POStatus.FINALIZED) {
      setPaymentItem(undefined);
      setVisiblePaymentModal(true)
      setInitValue({
        is_refund: true,
        amount: poData.total_paid,
      });
    } else {
      history.push(`${UrlConfig.PURCHASE_ORDERS}/${id}/return`, {
        params: poData,
        listCountries: listCountries,
        listDistrict: listDistrict,
      });
    }

  }, [history, id, listCountries, listDistrict, poData, setVisiblePaymentModal]);



  const handleExport = useCallback(() => {
    dispatch(showLoading())
    // khởi tạo, đơn vị px, khổ a4
    const pdf = new jsPDF("portrait", "px", "a4");
    const pageMargin = 10;
    // chiều rộng form trong canvas
    const canvasFormWidth = 800;
    // lấy chiều rộng và dài của khổ a4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // khởi tạo canvas
    const temp = document.createElement("div");
    const tempChild = document.createElement("div");
    temp.appendChild(tempChild);
    // tempChild.style.fontFamily = 'Roboto';
    temp.style.width = `${canvasFormWidth}px`;
    temp.style.padding = `${pageMargin}px`;
    temp.style.position = "absolute";
    temp.style.zIndex = "-2";
    temp.style.top = "0px";
    temp.style.margin = 'auto';
    tempChild.style.width = `100%`;
    tempChild.style.height = `100%`;
    temp.style.display = 'block';
    temp.id = "temp";
    tempChild.innerHTML = printContent;
    let value = document.body.appendChild(temp);
    if (value === null) return;


    const imgWidth = pageWidth;
    const rate = 1.8 // mò ra
    const imgHeight = (value.offsetHeight) * (value.offsetWidth / canvasFormWidth) / rate;

    var heightLeft = imgHeight;
    var position = 0;
    const getCanvas = (canvas: HTMLCanvasElement, pdf: jsPDF) => {
      pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft = heightLeft - pageHeight;
      // tách trang
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    };

    html2canvas(value, {
      scale: 5, // fix nhòe
    }).then((canvas) => {
      getCanvas(canvas, pdf);
      temp.remove();
      pdf.save(`Đơn hàng ${idNumber}.pdf`);
      dispatch(hideLoading())
    });
  }, [dispatch, idNumber, printContent]);

  const menu: Array<MenuAction> = useMemo(() => {
    let menuActions = [
      {
        id: ActionMenu.EXPORT,
        name: "Xuất file NPL",
      },
      {
        id: ActionMenu.CLONE,
        name: "Sao chép đơn đặt hàng",
      }
    ];
    if (!poData) return [];
    let poStatus = poData.status;
    if (poStatus && [POStatus.FINALIZED, POStatus.DRAFT].includes(poStatus) && canCancelPO)
      menuActions.push({
        id: ActionMenu.DELETE,
        name: "Hủy",
      });
    return menuActions;
  }, [poData, canCancelPO]);

  const menuPrint: Array<MenuAction> = useMemo(() => {
    return [
      {
        id: ActionMenuPrint.FGG,
        name: "In đơn đặt hàng FGG",
      },
      {
        id: ActionMenuPrint.NORMAL,
        name: "In đơn đặt hàng NCC",
      }
    ];
  }, []);


  const renderModalDelete = useCallback(() => {
    let title = "Bạn chắc chắn hủy đơn nhập hàng này không ?",
      subTitle = "",
      okText = "Đồng ý",
      cancelText = "Hủy",
      deleteFunc = onCancel,
      handleCancel = () => {
        setConfirmDelete(false);
      };

    if (!poData) return;
    const { receipt_quantity, total_paid } = poData;
    if (!receipt_quantity && total_paid && total_paid > 0) {
      subTitle =
        "Đơn nhập đã được thanh toán với nhà cung cấp. Bạn có muốn tạo hoàn tiền từ nhà cung cấp trước khi hủy đơn nhập hàng không?";
      okText = "Tạo hoàn tiền";
      cancelText = "Hủy đơn hàng";
      deleteFunc = redirectToReturn;
      handleCancel = () => {
        onCancel();
        setConfirmDelete(false);
      };
    }
    const footer = [
      <Button key="back" onClick={handleCancel}>
        {cancelText}
      </Button>,
      <Button
        key="ok"
        onClick={() => {
          setConfirmDelete(false);
          deleteFunc();
        }}
        type="primary"
      >
        {okText}
      </Button>,
    ];
    return (
      <ModalDeleteConfirm
        onCancel={() => {
          setConfirmDelete(false);
        }}
        okText={okText}
        cancelText={cancelText}
        title={title}
        subTitle={subTitle}
        visible={isConfirmDelete}
        footer={footer}
      />
    );
  }, [onCancel, poData, isConfirmDelete, redirectToReturn]);


  const RightAction = () => {
    const ActionByStatus = () => {
      switch (status) {
        case POStatus.DRAFT:
          return (
            <>
              <AuthWrapper acceptPermissions={[PurchaseOrderPermission.update]}>
                <Button
                  type="primary"
                  className="create-button-custom ant-btn-outline"
                  ghost
                  icon={!isEditDetail && <EditOutlined />}
                  onClick={() => {
                    if (isEditDetail) {
                      dispatch(showLoading());
                      setStatusAction(POStatus.DRAFT);
                      formMain.submit();
                    } else {
                      setIsEditDetail(!isEditDetail);
                    }
                  }}
                >
                  {isEditDetail ? "Lưu nháp" : "Chỉnh sửa"}
                </Button>
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[PurchaseOrderPermission.approve]}>
                <Button
                  type="primary"
                  onClick={onConfirmButton}
                  className="create-button-custom"
                >
                  Xác nhận
                </Button>
              </AuthWrapper>
            </>
          );
        case POStatus.CANCELLED:
          return null;
        default:
          return (
            <AuthWrapper acceptPermissions={[PurchaseOrderPermission.update]}>
              <Button
                type="primary"
                className="create-button-custom ant-btn-outline"
                ghost
                icon={!isEditDetail && <EditOutlined />}
                onClick={() => {
                  if (isEditDetail) {
                    dispatch(showLoading());
                    setStatusAction(status);
                    formMain.submit();
                  } else {
                    setIsEditDetail(!isEditDetail);
                  }
                }}
              >
                {isEditDetail ? "Lưu lại" : "Chỉnh sửa"}
              </Button>
            </AuthWrapper>
          );
      }
    }

    return (
      <>
        <div id="bottomRight" className="page-filter" style={{ marginRight: -14 }}>
          <Space direction="horizontal" id="bottomRight">
            <Button
              type="default"
              hidden
              onClick={(e) => {
                e.stopPropagation();
                handleExport();
              }}
              icon={<FilePdfOutlined />}
            >Xuất file</Button>
            <ActionButton
              menu={menu}
              onMenuClick={onMenuClick}
              type="primary"
              placement={'topCenter'}
              buttonStyle={{ borderRadius: 2 }}
              getPopupContainer={(trigger: any) => trigger.parentNode}
            />
            <AuthWrapper acceptPermissions={[PurchaseOrderPermission.print]}>
              <ActionButton
                menu={menuPrint}
                onMenuClick={onMenuPrint}
                type="primary"
                placement={'topCenter'}
                buttonStyle={{ borderRadius: 2 }}
                buttonText="In phiếu"
                getPopupContainer={(trigger: any) => trigger.parentNode}
              />
            </AuthWrapper>
            <div style={{ display: "none" }}>
              <div className="printContent" ref={printElementRef}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: purify.sanitize(printContent),
                  }}
                />
              </div>
            </div>
          </Space>
        </div>
        <ActionByStatus />
      </>
    )
  };

  const showPOReturnList = () => {
    if (
      poData &&
      ((poData.receipt_quantity && poData.receipt_quantity > 0) ||
        (poData.total_paid && poData.total_paid > 0))
    ) {
      return (
        <POReturnList
          id={id}
          params={formMain.getFieldsValue(true)}
          listCountries={listCountries}
          listDistrict={listDistrict}
        />
      );
    } else {
      return <></>;
    }
  };

  const checkCanEditDraft = () => {
    const stt = formMain.getFieldValue(POField.status);
    return isEditDetail && (!stt || stt === POStatus.DRAFT);
  };

  const isExpanSupplement = () => {
    const lineItems: PurchaseOrderLineItem[] = formMain.getFieldValue(POField.line_items);
    return lineItems.some((item) => item.type === POLineItemType.SUPPLEMENT);
  }

  const isShowSupplement = () => {
    const stt = formMain.getFieldValue(POField.status);
    return [POStatus.FINALIZED, POStatus.STORED].includes(stt);
  }

  useEffect(() => {
    dispatch(StoreGetListAction(onStoreResult));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(VietNamId, setListDistrict));
    dispatch(PaymentConditionsGetAllAction(setListPaymentConditions));
    if (!isNaN(idNumber)) {
      setLoading(true);
      loadDetail(idNumber, true, false);
    } else {
      setError(true);
    }
  }, [dispatch, idNumber, loadDetail, onStoreResult, printContentCallback]);

  useEffect(() => {
    if (poData?.id) {
      dispatch(
        POGetPurchaseOrderActionLogs(poData?.id, (response: PurchaseOrderActionLogResponse[]) => {
          setActionLog(response);
        })
      );
    }
  }, [dispatch, poData?.id, poData]);


  /**
   * Load data cho lineItem dạng bảng grid
   */
  useEffect(() => {
    if (poData) {
      setIsGridMode?.(poData?.is_grid_mode);
      fetchProductGridData(!!poData.is_grid_mode, poData, "READ_UPDATE", dispatch, setPoLineItemGridChema, setPoLineItemGridValue, setTaxRate);
    }
  }, [poData, dispatch, setPoLineItemGridValue, setPoLineItemGridChema, setTaxRate, setIsGridMode]);

  return (
    <ContentContainer
      isError={isError}
      isLoading={isLoading}
      title="Quản lý đơn đặt hàng"
      breadcrumb={[
        {
          name: "Kho hàng",
        },
        {
          name: "Đặt hàng",
          path: `${UrlConfig.PURCHASE_ORDERS}`,
        },
        {
          name: `Đơn đặt hàng ${poData?.code || ""}`,
        },
      ]}
      extra={poData && <POStep poData={poData} />}
    >
      <Form
        form={formMain}
        onFinishFailed={({ errorFields }: any) => {
          setStatusAction("");
          const element: any = document.getElementById(errorFields[0].name.join(""));
          element?.focus();
          const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
          window.scrollTo({ top: y, behavior: "smooth" });
        }}
        onFinish={onFinish}
        initialValues={initPurchaseOrder}
        layout="vertical"
      >
        <Form.Item name={POField.id} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item name={POField.version} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item name={POField.status} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item name={POField.payments} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item name={POField.procurements} noStyle hidden>
          <Input />
        </Form.Item>
        <Row gutter={24} style={{ paddingBottom: 80 }}>
          {/* Left Side */}
          <Col md={18}>
            <POSupplierForm
              showSupplierAddress={true}
              showBillingAddress={true}
              isEdit={!isEditDetail}
              listCountries={listCountries}
              listDistrict={listDistrict}
              formMain={formMain}
              stepStatus={status}
            />
            <PoProductContainer isEditMode={checkCanEditDraft()} isDisableSwitch={true} form={formMain}>
              {
                isGridMode ? (
                  <POProductFormNew
                    formMain={formMain}
                    isEditMode={checkCanEditDraft()}

                  />
                ) :
                  <POProductFormOld isEdit={isEditDetail} formMain={formMain} poLineItemType={POLineItemType.NORMAL} />
              }
            </PoProductContainer>

            {isShowSupplement() && (
              <Collapse defaultActiveKey={isExpanSupplement() ? ['1'] : []} >
                <Collapse.Panel header="SẢN PHẨM BỔ SUNG" key="1">
                  <POProductFormOld isEdit={isEditDetail} formMain={formMain} poLineItemType={POLineItemType.SUPPLEMENT} />
                </Collapse.Panel>
              </Collapse>
            )
            }

            <POInventoryForm
              onAddProcumentSuccess={onAddProcumentSuccess}
              idNumber={idNumber}
              poData={poData}
              isEdit={true}
              isEditDetail={isEditDetail}
              now={now}
              loadDetail={loadDetail}
              formMain={formMain}
              status={status}
              stores={listStore}
            />
            {poData && poData.status !== POStatus.DRAFT ? (
              <POPaymentForm
                setSuggest={(isSuggest) => setSuggest(isSuggest)}
                isSuggest={isSuggest}
                poData={poData}
                poId={parseInt(id)}
                loadDetail={loadDetail}
                isVisiblePaymentModal={visiblePaymentModal}
                paymentItem={paymentItem}
                setPaymentItem={setPaymentItem}
                setVisiblePaymentModal={setVisiblePaymentModal}
                initValue={initValue}
                setInitValue={setInitValue}
              />
            ) : (
              <POPaymentConditionsForm
                poDataPayments={poData?.payments}
                isEdit={true}
                formMainEdit={formMain}
                listPayment={listPaymentConditions}
                isEditDetail={isEditDetail}
              />
            )}

            {showPOReturnList()}
          </Col>
          {/* Right Side */}
          <Col md={6}>
            <POInfoForm
              isEdit={true}
              isEditDetail={isEditDetail}
              formMain={formMain}
            />
            <ActionPurchaseOrderHistory
              actionLog={actionLog}
            />
          </Col>
        </Row>
        <BottomBarContainer
          back={false}
          leftComponent={
            <React.Fragment>{poData && <POStep poData={poData} />}</React.Fragment>
          }
          height={55}
          rightComponent={<RightAction />}
        />
      </Form>
      {renderModalDelete()}

      <ModalExport
        visible={showExportModal}
        onOk={(res) => { ActionExport.Ok(res) }}
        onCancel={ActionExport.Cancel}
        title="Tải đề xuất NPL"
        okText="Export"
        cancelText="Đóng"
        templateUrl={AppConfig.PO_EXPORT_URL}
        forder="stock-transfer"
        customParams={{ url_template: AppConfig.PO_EXPORT_TEMPLATE_URL, conditions: poData?.id, type: "EXPORT_PO_NPL" }}
      />
    </ContentContainer>
  );
};
const PODetailWithProvider = (props: any) => (
  <PurchaseOrderProvider>
    <PODetailScreen {...props} />
  </PurchaseOrderProvider>
)
export default PODetailWithProvider
