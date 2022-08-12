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
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { PaymentConditionsGetAllAction } from "domain/actions/po/payment-conditions.action";
import { POCancelAction, PoDetailAction, PoUpdateAction } from "domain/actions/po/po.action";
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
import {
  POLineItemType,
  POLoadType,
  PurchaseOrderLineItem,
} from "model/purchase-order/purchase-item.model";
import { PurchaseOrder, PurchaseOrderPrint } from "model/purchase-order/purchase-order.model";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import moment from "moment";
import React, { lazy, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  checkChangePriceLineItemPurchaseOrder,
  getPrintContent,
  printPurchaseOrderReturnApi,
} from "service/purchase-order/purchase-order.service";
import { callApiNative } from "utils/ApiUtils";
import { POStatus, ProcumentStatus, VietNamId } from "utils/Constants";
import { ConvertDateToUtc } from "utils/DateUtils";
import {
  checkCanEditDraft,
  checkCanEditPrice,
  checkChangePriceLineItem,
  checkImportPriceLowByLineItem,
  combineLineItemToSubmitData,
  fetchProductGridData,
  getUntaxedAmountByLineItemType,
  isExpandsSupplement,
  isShowSupplement,
  MIN_IMPORT_PRICE_WARNING,
  POUtils,
  validateLineItemQuantity,
} from "utils/POUtils";
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
import PurchaseOrderProvider, {
  PurchaseOrderCreateContext,
} from "./provider/purchase-order.provider";
import POInfoPO from "./component/po-info-po";
import ModalConfirm from "component/modal/ModalConfirm";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import { PrintTypePo } from "./helper";
import { POModalChangePrice } from "./component/po-modal-change-price";
import { formatCurrency } from "utils/AppUtils";

const ModalDeleteConfirm = lazy(() => import("component/modal/ModalDeleteConfirm"));
const ModalExport = lazy(() => import("./modal/ModalExport"));

const ActionMenu = {
  EXPORT: 1,
  DELETE: 2,
  CLONE: 3,
  PRINTING_STAMP: 4,
};

const ActionMenuPrint = {
  FGG: 1, //mẫu in fgg
  NORMAL: 2, //mẫu in thông thường
};

// const PrintTypePo = {
//   PURCHASE_ORDER: "purchase_order",
//   PURCHASE_ORDER_MA_7: "purchase_order_ma_7",
//   PURCHASE_ORDER_FGG: "purchase_order_fgg",
//   PURCHASE_ORDER_MA_7_FGG: "purchase_order_ma_7_fgg",
// };
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
  const printElementRefReturn = useRef(null);
  const dispatch = useDispatch();
  const history = useHistory();
  const [formMain] = Form.useForm();

  const [visiblePaymentModal, setVisiblePaymentModal] = useState<boolean>(false);
  const [isError, setError] = useState(false);
  const [status, setStatus] = useState<string>(initPurchaseOrder.status);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [listPaymentConditions, setListPaymentConditions] = useState<Array<PoPaymentConditions>>(
    [],
  );
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [printContent, setPrintContent] = useState<string>("");
  const [printContentReturn, setPrintContentReturn] = useState<string>("");
  const [isEditDetail, setIsEditDetail] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isSuggest, setSuggest] = useState<boolean>(false);
  const [paymentItem, setPaymentItem] = useState<PurchasePayments>();
  const [dataChangePricer, setDataChangePricer] = useState<PurchaseOrderLineItem[]>([]);
  const [initValue, setInitValue] = useState<PurchasePayments | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  // const [actionLog, setActionLog] = useState<PurchaseOrderActionLogResponse[]>([]);
  const [activePanel, setActivePanel] = useState<string | string[]>();
  const [isShowWarningPriceModal, setShowWarningPriceModal] = useState<boolean>(false);
  const [showConfirmChangePrice, setShowConfirmChangePrice] = useState<boolean>(false);
  const [showConfirmChangeListPrice, setShowConfirmChangeListPrice] = useState<boolean>(false);

  //ref page
  const currentLineItem = useRef<PurchaseOrderLineItem[]>([]);
  const [isRerender, setIsRerender] = useState<boolean>(false);
  const [canCancelPO] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.cancel],
  });
  const [canUpdateImportPrice] = useAuthorization({
    acceptPermissions: [PurchaseOrderPermission.update_import_price],
  });
  const statusAction = useRef<string>("");

  const {
    setPoLineItemGridChema,
    setPoLineItemGridValue,
    setTaxRate,
    isGridMode,
    setIsGridMode,
    poLineItemGridValue,
    poLineItemGridChema,
    taxRate,
    purchaseOrder,
    setPurchaseOrder,
  } = useContext(PurchaseOrderCreateContext);

  const SUPPLEMENT_PANEL_KEY = "supplement";

  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const handlePrintReturn = useReactToPrint({
    content: () => printElementRefReturn.current,
    documentTitle: "Đơn trả hàng nhà cung cấp",
  });

  const printContentCallback = useCallback((printContent: Array<PurchaseOrderPrint>) => {
    if (!printContent || printContent.length === 0) return;
    setPrintContent(printContent[0].html_content);
  }, []);

  const printContentReturnCallback = useCallback((printContent: PurchaseOrderPrint) => {
    if (!printContent) return;
    setPrintContentReturn(printContent.html_content);
  }, []);

  const onDetail = useCallback(
    (result: PurchaseOrder | null) => {
      setLoading(false);
      if (!result) {
        setError(true);
      } else {
        setPurchaseOrder(result);
        formMain.setFieldsValue(result);
        let closingDate = result.ap_closing_date ? moment(result.ap_closing_date) : null;
        if (
          !closingDate &&
          result.status === POStatus.STORED &&
          result.receive_status !== "finished"
        ) {
          closingDate = moment();
        }
        formMain.setFieldsValue({ ap_closing_date: closingDate });
        setStatus(result.status);
      }
    },
    [formMain, setPurchaseOrder],
  );

  const loadDetail = useCallback(
    (id: number, isLoading, isSuggestDetail: boolean) => {
      setSuggest(isSuggestDetail);
      dispatch(PoDetailAction(id, onDetail));
    },
    [dispatch, onDetail],
  );

  const handleChangeStatusPO = (status: string) => {
    setIsEditDetail(false);
    statusAction.current = status;
    handleBeforeSave();
  };

  const onStoreResult = useCallback((result: Array<StoreResponse>) => {
    if (result) {
      const storeTotals = result.filter((e) => e.name?.toLocaleLowerCase().includes("kho tổng"));

      let res = _.uniqBy([...storeTotals, ...result], "name");
      setListStore(res);
    }
  }, []);
  const onUpdateCall = useCallback(
    (result: PurchaseOrder | null) => {
      dispatch(hideLoading());
      setIsEditDetail(false);
      if (result !== null) {
        loadDetail(idNumber, true, false);
        showSuccess("Cập nhật nhập hàng thành công");
      }
    },
    [idNumber, loadDetail, dispatch],
  );
  const onFinish = (value: PurchaseOrder) => {
    dispatch(showLoading());
    const line_items =
      (formMain.getFieldsValue([POField.line_items]).line_items as PurchaseOrderLineItem[]) || [];
    try {
      value.is_grid_mode = isGridMode;
      if (isGridMode) {
        if (poLineItemGridValue.length === 0) {
          throw new Error("Vui lòng thêm sản phẩm");
        }
        if (!value.payment_condition_id && value.payment_condition_name) {
          throw new Error("Đơn vị thời gian công nợ không được để trống");
        }
        const gridLineItems: PurchaseOrderLineItem[] = combineLineItemToSubmitData(
          poLineItemGridValue,
          poLineItemGridChema,
          taxRate,
          line_items,
        );
        const supplementLineItems =
          value?.line_items?.filter((e) => e.type === POLineItemType.SUPPLEMENT) || [];
        value.line_items = [...gridLineItems, ...supplementLineItems];
      } else if (purchaseOrder?.line_items.length === 0) {
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
      value.line_items.forEach((item) => {
        if (item.price < Math.round(item.retail_price * 0.15)) {
          throw new Error(`Vui lòng đặt giá nhập > 15% giá bán cho mã sản phẩm ${item.sku}`);
        }
        if (item.price > item.cost_price && item.cost_price) {
          throw new Error(
            `Vui lòng đặt giá nhập < giá vốn. Hiện giờ sản phẩm ${
              item.sku
            } có giá vốn là: ${formatCurrency(item.cost_price || 0, ".")}`,
          );
        }
      });
      const untaxed_amount = getUntaxedAmountByLineItemType(value.line_items, POLoadType.ALL);
      value.untaxed_amount = untaxed_amount;
      value.tax_lines = [
        {
          rate: taxRate,
          amount: Math.round((untaxed_amount * taxRate) / 100),
        },
      ];
      value.trade_discount_amount = POUtils.getTotalDiscount(formMain, untaxed_amount);
      const total_after_tax = POUtils.getTotalAfterTax(formMain);
      value.payment_discount_amount = POUtils.getTotalDiscount(formMain, total_after_tax);
      value.total = Math.round(
        value.line_items.reduce((prev: number, cur: PurchaseOrderLineItem) => {
          const untaxAmount = cur.quantity * cur.price;
          return prev + (untaxAmount + (untaxAmount * cur.tax_rate) / 100);
        }, 0),
      );
      value.ap_closing_date = value.ap_closing_date
        ? ConvertDateToUtc(value.ap_closing_date)
        : null;
      const dataClone: any = { ...purchaseOrder, ...value, status: statusAction.current };
      dispatch(PoUpdateAction(idNumber, dataClone, onUpdateCall));
    } catch (error: any) {
      showError(error.message);
      if (currentLineItem.current.length) {
        formMain.setFieldsValue({
          [POField.line_items]: currentLineItem.current,
        });
      }
      dispatch(hideLoading());
    } finally {
      currentLineItem.current = [];
    }
  };

  const onAddProcumentSuccess = useCallback(
    (isSuggest) => {
      loadDetail(idNumber, true, isSuggest);
    },
    [idNumber, loadDetail],
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
  };

  const onCancel = useCallback(() => {
    dispatch(showLoading());
    dispatch(
      POCancelAction(idNumber, (result) => {
        dispatch(hideLoading());
        if (result !== null) {
          showSuccess("Cập nhật nhập hàng thành công");
          loadDetail(idNumber, false, false);
        }
      }),
    );
  }, [dispatch, idNumber, loadDetail]);

  const handleClonePo = useCallback(() => {
    window.open(
      `${BASE_NAME_ROUTER}${UrlConfig.PURCHASE_ORDERS}/create?poId=${idNumber}`,
      "_blank",
    );
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
        break;
      case ActionMenu.PRINTING_STAMP:
        history.push(`${UrlConfig.PURCHASE_ORDERS}/${idNumber}/stamp-printing`);
        break;
    }
  };

  const actionPrint = useCallback(
    async (poId: number, printType: string) => {
      const res = await callApiNative(
        { isShowLoading: true },
        dispatch,
        getPrintContent,
        poId,
        printType,
      );
      if (res && res.data && res.data.message) {
        showError(res.data.message);
      } else {
        printContentCallback(res);
        handlePrint && handlePrint();
      }
    },
    [dispatch, handlePrint, printContentCallback],
  );

  const actionPrintReturn = useCallback(
    async (returnId: number) => {
      const res = await callApiNative(
        { isShowLoading: true },
        dispatch,
        printPurchaseOrderReturnApi,
        returnId,
        purchaseOrder?.id ?? 0,
      );

      if (res && res.data && res.data.errors) {
        res.data.errors.forEach((e: string) => {
          showError(e);
        });
      } else {
        printContentReturnCallback(res);
        handlePrintReturn && handlePrintReturn();
      }
    },
    [dispatch, handlePrintReturn, purchaseOrder?.id, printContentReturnCallback],
  );

  const onMenuPrint = (index: number) => {
    dispatch(showLoading());
    switch (index) {
      case ActionMenuPrint.NORMAL:
        // if (isGridMode) {
        //   actionPrint(idNumber, PrintTypePo.PURCHASE_ORDER_MA_7);
        //   break;
        // }
        actionPrint(idNumber, PrintTypePo.PURCHASE_ORDER);
        break;
      case ActionMenuPrint.FGG:
        // if (isGridMode) {
        //   actionPrint(idNumber, PrintTypePo.PURCHASE_ORDER_MA_7_FGG);
        //   break;
        // }
        actionPrint(idNumber, PrintTypePo.PURCHASE_ORDER_FGG);
        break;
    }
  };

  const redirectToReturn = useCallback(() => {
    if (purchaseOrder?.status === POStatus.FINALIZED) {
      setPaymentItem(undefined);
      setVisiblePaymentModal(true);
      setInitValue({
        is_refund: true,
        amount: purchaseOrder.total_paid,
      });
    } else {
      history.push(`${UrlConfig.PURCHASE_ORDERS}/${id}/return`, {
        params: purchaseOrder,
        listCountries: listCountries,
        listDistrict: listDistrict,
      });
    }
  }, [history, id, listCountries, listDistrict, purchaseOrder, setVisiblePaymentModal]);

  const handleExport = useCallback(() => {
    dispatch(showLoading());
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
    temp.style.margin = "auto";
    tempChild.style.width = `100%`;
    tempChild.style.height = `100%`;
    temp.style.display = "block";
    temp.id = "temp";
    tempChild.innerHTML = printContent;
    let value = document.body.appendChild(temp);
    if (value === null) return;

    const imgWidth = pageWidth;
    const rate = 1.8; // mò ra
    const imgHeight = (value.offsetHeight * (value.offsetWidth / canvasFormWidth)) / rate;

    var heightLeft = imgHeight;
    var position = 0;
    const getCanvas = (canvas: HTMLCanvasElement, pdf: jsPDF) => {
      pdf.addImage(canvas, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft = heightLeft - pageHeight;
      // tách trang
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    };

    html2canvas(value, {
      scale: 5, // fix nhòe
    }).then((canvas) => {
      getCanvas(canvas, pdf);
      temp.remove();
      pdf.save(`Đơn hàng ${idNumber}.pdf`);
      dispatch(hideLoading());
    });
  }, [dispatch, idNumber, printContent]);

  const menu: Array<MenuAction> = useMemo(() => {
    const menuActions = [
      {
        id: ActionMenu.EXPORT,
        name: "Xuất file NPL",
      },
      {
        id: ActionMenu.CLONE,
        name: "Sao chép đơn đặt hàng",
      },
    ];
    if (!purchaseOrder) return [];
    const poStatus = purchaseOrder.status;
    if (poStatus && [POStatus.FINALIZED, POStatus.DRAFT].includes(poStatus) && canCancelPO) {
      menuActions.push({
        id: ActionMenu.DELETE,
        name: "Hủy",
      });
    }
    const poProcurementsStatus: Array<string> = purchaseOrder?.procurements
      ?.map((item: PurchaseProcument) => item.status)
      .slice(1);
    // lấy tất cả status của pr trừ pr đầu tiên (bù nhìn)
    // cho phép hủy PO khi các phiếu PR đã hủy
    if (
      poStatus &&
      poStatus === POStatus.STORED &&
      poProcurementsStatus.every((el) => el === ProcumentStatus.CANCELLED) &&
      canCancelPO
    ) {
      menuActions.push({
        id: ActionMenu.DELETE,
        name: "Hủy",
      });
    }
    if (
      [POStatus.FINALIZED, POStatus.STORED, POStatus.COMPLETED, POStatus.FINISHED].includes(
        poStatus,
      )
    ) {
      menuActions.unshift({
        id: ActionMenu.PRINTING_STAMP,
        name: "In mã vạch",
      });
    }
    return menuActions;
  }, [purchaseOrder, canCancelPO]);

  const menuPrint: Array<MenuAction> = useMemo(() => {
    return [
      {
        id: ActionMenuPrint.FGG,
        name: "In đơn đặt hàng FGG",
      },
      {
        id: ActionMenuPrint.NORMAL,
        name: "In đơn đặt hàng NCC",
      },
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

    if (!purchaseOrder) return;
    const { receipt_quantity, total_paid } = purchaseOrder;
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
  }, [onCancel, purchaseOrder, isConfirmDelete, redirectToReturn]);

  const handleBeforeSave = () => {
    const status = purchaseOrder?.status;
    try {
      // case: chưa duyệt => check tất cả sp có giá nhỏ hơn 1000đ trong line item
      const line_items =
        (formMain.getFieldsValue([POField.line_items]).line_items as PurchaseOrderLineItem[]) || [];
      if (status === POStatus.DRAFT || status === POStatus.WAITING_APPROVAL) {
        const lineItems: any[] = isGridMode
          ? combineLineItemToSubmitData(
              poLineItemGridValue,
              poLineItemGridChema,
              taxRate,
              line_items,
            )
          : formMain.getFieldsValue()[POField.line_items];
        if (!lineItems.every((item) => item.price)) {
          setIsEditDetail(true);
          throw new Error(
            "Vui lòng điền giá nhập cho sản phẩm đã có số lượng để tạo đơn thành công",
          );
        }
        if (checkImportPriceLowByLineItem(MIN_IMPORT_PRICE_WARNING, lineItems)) {
          setShowWarningPriceModal(true);
          return;
        }
      } else if (
        [POStatus.FINALIZED, POStatus.STORED].includes(status) &&
        purchaseOrder.receive_status !== ProcumentStatus.FINISHED
      ) {
        //case: đã duyệt - trước kết thúc nhập kho: chỉ check những sản phẩm bổ sung được thêm mới vào có giá nhỏ hơn 1000đ
        const formLineItems: PurchaseOrderLineItem[] = formMain.getFieldValue([POField.line_items]);
        const newSupplementItems = formLineItems.filter(
          (item) => item.type === POLineItemType.SUPPLEMENT && !item.id,
        );
        if (checkImportPriceLowByLineItem(MIN_IMPORT_PRICE_WARNING, newSupplementItems)) {
          setShowWarningPriceModal(true);
          return;
        }
      }
      if (status === POStatus.FINALIZED) {
        const line_items =
          (formMain.getFieldsValue([POField.line_items]).line_items as PurchaseOrderLineItem[]) ||
          [];
        const lineItems: any[] = isGridMode
          ? combineLineItemToSubmitData(
              poLineItemGridValue,
              poLineItemGridChema,
              taxRate,
              line_items,
            )
          : formMain.getFieldsValue()[POField.line_items];
        if (!lineItems.every((item) => item.price)) {
          setIsEditDetail(true);
          throw new Error(
            "Vui lòng điền giá nhập cho sản phẩm đã có số lượng để tạo đơn thành công",
          );
        }
        if (checkImportPriceLowByLineItem(MIN_IMPORT_PRICE_WARNING, lineItems)) {
          setShowWarningPriceModal(true);
          return;
        }
        if (checkChangePriceLineItem(purchaseOrder.line_items, lineItems)) {
          setShowConfirmChangePrice(true);
          return;
        }
      }
      // trạng thái khác : không check giá
      formMain.submit();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleApproval = async () => {
    dispatch(showLoading());
    try {
      const line_items = formMain.getFieldsValue([POField.line_items]) as PurchaseOrderLineItem[];
      const res: PurchaseOrderLineItem[] = await callApiNative(
        { isShowError: true },
        dispatch,
        checkChangePriceLineItemPurchaseOrder,
        line_items,
      );
      if (res) {
        const resFitter = res.filter((item) => item.new_retail_price !== item.retail_price);
        if (resFitter.length > 0) {
          setDataChangePricer(resFitter);
          setShowConfirmChangeListPrice(true);
        } else {
          handleChangeStatusPO(POStatus.FINALIZED);
        }
      }
      dispatch(hideLoading());
    } catch {
      dispatch(hideLoading());
    }
  };

  const handleOnChangePrice = () => {
    const line_items = formMain.getFieldsValue([POField.line_items])
      .line_items as PurchaseOrderLineItem[];
    currentLineItem.current = [...line_items];
    dataChangePricer.forEach((dataChange) => {
      const index = line_items.findIndex((item) => item.variant_id === dataChange.variant_id);
      if (index >= 0) {
        line_items[index].retail_price = dataChange.new_retail_price || 0;
      }
    });
    formMain.setFieldsValue({
      [POField.line_items]: line_items,
    });
    handleChangeStatusPO(POStatus.FINALIZED);
    setShowConfirmChangeListPrice(false);
  };

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
                      statusAction.current = POStatus.DRAFT;
                      handleBeforeSave();
                    } else {
                      setIsEditDetail(!isEditDetail);
                    }
                  }}
                >
                  {isEditDetail ? "Lưu nháp" : "Chỉnh sửa"}
                </Button>
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[PurchaseOrderPermission.create]}>
                <Button
                  type="primary"
                  onClick={() => handleChangeStatusPO(POStatus.WAITING_APPROVAL)}
                  className="create-button-custom"
                >
                  {isEditDetail ? "Lưu và chờ duyệt" : "Chờ duyệt"}
                </Button>
              </AuthWrapper>
            </>
          );
        case POStatus.WAITING_APPROVAL:
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
                      statusAction.current = POStatus.WAITING_APPROVAL;
                      handleBeforeSave();
                    } else {
                      setIsEditDetail(!isEditDetail);
                    }
                  }}
                >
                  {isEditDetail ? "Lưu" : "Chỉnh sửa"}
                </Button>
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[PurchaseOrderPermission.approve]}>
                <Button type="primary" onClick={handleApproval} className="create-button-custom">
                  {isEditDetail ? "Lưu và duyệt" : "Duyệt"}
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
                    statusAction.current = status;
                    handleBeforeSave();
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
    };

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
            >
              Xuất file
            </Button>
            <ActionButton
              menu={menu}
              onMenuClick={onMenuClick}
              type="primary"
              placement={"topCenter"}
              buttonStyle={{ borderRadius: 2 }}
              getPopupContainer={(trigger: any) => trigger.parentNode}
            />
            <AuthWrapper acceptPermissions={[PurchaseOrderPermission.print]}>
              <ActionButton
                menu={menuPrint}
                onMenuClick={onMenuPrint}
                type="primary"
                placement={"topCenter"}
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
            <div style={{ display: "none" }}>
              <div className="printContent" ref={printElementRefReturn}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: purify.sanitize(printContentReturn),
                  }}
                />
              </div>
            </div>
            <div style={{ display: "none" }}></div>
          </Space>
        </div>
        <ActionByStatus />
      </>
    );
  };

  const showPOReturnList = () => {
    if (
      purchaseOrder &&
      ((purchaseOrder.receipt_quantity && purchaseOrder.receipt_quantity > 0) ||
        (purchaseOrder.total_paid && purchaseOrder.total_paid > 0))
    ) {
      return (
        <POReturnList
          id={id}
          params={formMain.getFieldsValue(true)}
          actionPrint={actionPrintReturn}
          onUpdateCallReturn={() => setIsRerender(!isRerender)}
        />
      );
    } else {
      return <></>;
    }
  };

  useEffect(() => {
    dispatch(StoreGetListAction(onStoreResult));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(VietNamId, setListDistrict));
    dispatch(PaymentConditionsGetAllAction(setListPaymentConditions));
  }, [dispatch, onStoreResult, printContentCallback]);

  useEffect(() => {
    if (!isNaN(idNumber)) {
      loadDetail(idNumber, true, false);
    } else {
      setError(true);
    }
  }, [idNumber, loadDetail, isRerender]);

  /**
   * Load data cho lineItem dạng bảng grid
   */
  useEffect(() => {
    if (purchaseOrder) {
      setIsGridMode?.(purchaseOrder?.is_grid_mode);
      fetchProductGridData(
        !!purchaseOrder.is_grid_mode,
        purchaseOrder,
        "READ_UPDATE",
        dispatch,
        setPoLineItemGridChema,
        setPoLineItemGridValue,
        setTaxRate,
      );
    }
  }, [
    purchaseOrder,
    dispatch,
    setPoLineItemGridValue,
    setPoLineItemGridChema,
    setTaxRate,
    setIsGridMode,
  ]);

  useEffect(() => {
    if (isExpandsSupplement(formMain, isEditDetail)) {
      setActivePanel([SUPPLEMENT_PANEL_KEY]);
    } else {
      setActivePanel([]);
    }
  }, [isEditDetail, formMain]);

  return (
    <ContentContainer
      isError={isError}
      isLoading={isLoading}
      title={"Quản lý đơn đặt hàng " + (purchaseOrder?.code || "")}
      breadcrumb={[
        {
          name: "Nhà cung cấp",
        },
        {
          name: "Đặt hàng",
          path: `${UrlConfig.PURCHASE_ORDERS}`,
        },
        {
          name: `Đơn đặt hàng ${purchaseOrder?.code || ""}`,
        },
      ]}
      extra={
        purchaseOrder && (
          <div className="po-step">
            <POStep poData={purchaseOrder} />
          </div>
        )
      }
    >
      <Form
        form={formMain}
        onFinishFailed={({ errorFields }: any) => {
          dispatch(hideLoading());
          statusAction.current = "";
          const element: any = document.getElementById(errorFields[0].name.join("_"));
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
        <Form.Item name={POField.line_items} noStyle hidden>
          <Input />
        </Form.Item>
        <Row gutter={24} style={{ paddingBottom: 80 }}>
          {/* Left Side */}
          <div style={{ display: "flex", width: "100%", marginBottom: "20px" }}>
            <Col md={18} flex={1}>
              <POSupplierForm
                showSupplierAddress={true}
                showBillingAddress={true}
                isEdit={!isEditDetail}
                listCountries={listCountries}
                listDistrict={listDistrict}
                formMain={formMain}
                stepStatus={status}
              />
              <POInfoPO formMain={formMain} isEditDetail={!isEditDetail} />
            </Col>
            {/* Right Side */}
            <Col md={6} flex={1}>
              <POInfoForm isEdit={true} isEditDetail={isEditDetail} />
              {/* <ActionPurchaseOrderHistory actionLog={actionLog} /> */}
            </Col>
          </div>
          <div style={{ padding: "0 12px", width: "100%" }}>
            <PoProductContainer
              isEditMode={checkCanEditDraft(formMain, isEditDetail)}
              isDisableSwitch={true}
              form={formMain}
            >
              {isGridMode ? (
                <POProductFormNew
                  formMain={formMain}
                  isEditMode={checkCanEditDraft(formMain, isEditDetail)}
                  isEditPrice={checkCanEditPrice(formMain, isEditDetail, canUpdateImportPrice)}
                />
              ) : (
                <POProductFormOld
                  isEdit={isEditDetail}
                  formMain={formMain}
                  poLineItemType={POLineItemType.NORMAL}
                  isEditPrice={checkCanEditPrice(formMain, isEditDetail, canUpdateImportPrice)}
                />
              )}
            </PoProductContainer>
            {isShowSupplement(formMain) && (
              <Collapse
                activeKey={activePanel}
                onChange={(key: string | string[]) => setActivePanel(key)}
              >
                <Collapse.Panel header="SẢN PHẨM BỔ SUNG" key={SUPPLEMENT_PANEL_KEY}>
                  <POProductFormOld
                    isEdit={isEditDetail}
                    formMain={formMain}
                    poLineItemType={POLineItemType.SUPPLEMENT}
                  />
                </Collapse.Panel>
              </Collapse>
            )}
            <POInventoryForm
              onAddProcumentSuccess={onAddProcumentSuccess}
              idNumber={idNumber}
              poData={purchaseOrder}
              isEdit={true}
              isEditDetail={isEditDetail}
              now={now}
              loadDetail={loadDetail}
              formMain={formMain}
              status={status}
              stores={listStore}
            />
            {purchaseOrder && purchaseOrder.status !== POStatus.DRAFT ? (
              <POPaymentForm
                setSuggest={(isSuggest) => setSuggest(isSuggest)}
                isSuggest={isSuggest}
                poData={purchaseOrder}
                poId={parseInt(id)}
                loadDetail={loadDetail}
                isVisiblePaymentModal={visiblePaymentModal}
                paymentItem={paymentItem}
                setPaymentItem={setPaymentItem}
                setVisiblePaymentModal={setVisiblePaymentModal}
                initValue={initValue}
                setInitValue={setInitValue}
                isEditMode={isEditDetail}
              />
            ) : (
              <POPaymentConditionsForm
                poDataPayments={purchaseOrder?.payments}
                isEdit={true}
                formMainEdit={formMain}
                listPayment={listPaymentConditions}
                isEditDetail={isEditDetail}
                poData={purchaseOrder}
              />
            )}
            {showPOReturnList()}
          </div>
        </Row>
        <BottomBarContainer
          back={false}
          leftComponent={
            <React.Fragment>
              {purchaseOrder && (
                <div className="po-step">
                  <POStep poData={purchaseOrder} />
                </div>
              )}
            </React.Fragment>
          }
          height={55}
          rightComponent={<RightAction />}
        />
      </Form>
      {renderModalDelete()}

      <ModalExport
        visible={showExportModal}
        onOk={(res) => {
          ActionExport.Ok(res);
        }}
        onCancel={ActionExport.Cancel}
        title="Tải đề xuất NPL"
        okText="Export"
        cancelText="Đóng"
        templateUrl={AppConfig.PO_EXPORT_URL}
        forder="stock-transfer"
        customParams={{
          url_template: AppConfig.PO_EXPORT_TEMPLATE_URL,
          conditions: purchaseOrder?.id,
          type: "EXPORT_PO_NPL",
        }}
      />
      <ModalConfirm
        title="Giá nhập sản phẩm nhỏ hơn 1.000đ"
        subTitle="Bạn có chắc chắn muốn lưu đơn đặt hàng này?"
        visible={isShowWarningPriceModal}
        onCancel={() => setShowWarningPriceModal(false)}
        onOk={() => {
          formMain.submit();
          setShowWarningPriceModal(false);
        }}
      />
      <ModalConfirm
        title="Bạn có chắc chắn thay đổi giá nhập không?"
        visible={showConfirmChangePrice}
        onCancel={() => setShowConfirmChangePrice(false)}
        onOk={() => {
          formMain.submit();
          setShowConfirmChangePrice(false);
        }}
      />
      <POModalChangePrice
        title="Có sản phẩm đã thay đổi giá bán, bạn có muốn thay đổi giá mới không?"
        subTitle="Bảng dưới là danh sách sản phẩm thay đổi giá bán"
        visible={showConfirmChangeListPrice}
        dataSource={dataChangePricer}
        onOk={() => {
          handleChangeStatusPO(POStatus.FINALIZED);
          setShowConfirmChangeListPrice(false);
        }}
        onCancel={() => setShowConfirmChangeListPrice(false)}
        onChangePrice={handleOnChangePrice}
      />
    </ContentContainer>
  );
};
const PODetailWithProvider = (props: any) => (
  <PurchaseOrderProvider>
    <PODetailScreen {...props} />
  </PurchaseOrderProvider>
);
export default PODetailWithProvider;
