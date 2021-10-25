import { PrinterFilled, SaveFilled } from "@ant-design/icons";
import { Button, Col, Form, Input, Row, Space } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction
} from "domain/actions/content/content.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { PaymentConditionsGetAllAction } from "domain/actions/po/payment-conditions.action";
import {
  POCancelAction,
  PoDetailAction, POGetPrintContentAction, PoUpdateAction
} from "domain/actions/po/po.action";
import purify from "dompurify";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { StoreResponse } from "model/core/store.model";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";
import { POField } from "model/purchase-order/po-field";
import {
  PurchaseOrder,
  PurchaseOrderPrint
} from "model/purchase-order/purchase-order.model";
import { PurchasePayments } from "model/purchase-order/purchase-payment.model";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { POStatus, ProcumentStatus, VietNamId } from "utils/Constants";
import { ConvertDateToUtc } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import POInfoForm from "./component/po-info.form";
import POInventoryForm from "./component/po-inventory.form";
import POPaymentForm from "./component/po-payment.form";
import POProductForm from "./component/po-product.form";
import POReturnList from "./component/po-return-list";
import POStep from "./component/po-step";
import POSupplierForm from "./component/po-supplier.form";
import POPaymentConditionsForm from "./component/PoPaymentConditionsForm";


type PurchaseOrderParam = {
  id: string;
};

const PODetailScreen: React.FC = () => {
  let now = moment();
  let initPurchaseOrder = {
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
  const [winAccount, setWinAccount] = useState<Array<AccountResponse>>([]);
  const [rdAccount, setRDAccount] = useState<Array<AccountResponse>>([]);

  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);

  const [loadingConfirmButton, setLoadingConfirmButton] = useState(false);
  const [loadingSaveDraftButton, setLoadingSaveDraftButton] = useState(false);
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
      dispatch(PoDetailAction(idNumber, onDetail));
    },
    [dispatch, idNumber, onDetail]
  );

  const onConfirmButton = useCallback(() => {
    setStatusAction(POStatus.FINALIZED);
    setIsEditDetail(true);
    formMain.submit();
  }, [formMain]);

  const onResultRD = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      setError(true);
      return;
    }
    setRDAccount(data.items);
  }, []);
  const onResultWin = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        setError(true);
        return;
      }
      setWinAccount(data.items);
      dispatch(
        AccountSearchAction({ department_ids: [AppConfig.RD_DEPARTMENT] }, onResultRD)
      );
    },
    [dispatch, onResultRD]
  );
  const onStoreResult = useCallback((result: PageResponse<StoreResponse> | false) => {
    if (!!result) {
      setListStore(result.items);
    }
  }, []);
  const onUpdateCall = useCallback(
    (result: PurchaseOrder | null) => {
      setLoadingConfirmButton(false);
      setLoadingSaveDraftButton(false);
      setIsEditDetail(false);
      if (result !== null) {
        showSuccess("Cập nhật nhập hàng thành công");
        loadDetail(idNumber, true, false);
      }
    },
    [idNumber, loadDetail]
  );
  const onFinish = useCallback(
    (value: PurchaseOrder) => {
      if (value.line_items.length === 0) {
        let element: any = document.getElementById("#product_search");
        element?.focus();
        const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
        window.scrollTo({ top: y, behavior: "smooth" });
        showError("Vui lòng thêm sản phẩm");
        return;
      }

      const dataClone = { ...value, status: statusAction };
      switch (dataClone.status) {
        case POStatus.DRAFT:
        case POStatus.STORED:
        case POStatus.COMPLETED:
        case POStatus.FINISHED:
        case POStatus.CANCELLED:
          setLoadingSaveDraftButton(true);
          dispatch(PoUpdateAction(idNumber, dataClone, onUpdateCall));
          break;
        case POStatus.FINALIZED:
          setLoadingConfirmButton(true);
          dispatch(PoUpdateAction(idNumber, dataClone, onUpdateCall));
          break;
      }
    },
    [dispatch, idNumber, onUpdateCall, statusAction]
  );

  const onAddProcumentSuccess = useCallback(
    (isSuggest) => {
      loadDetail(idNumber, true, isSuggest);
    },
    [idNumber, loadDetail]
  );

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
  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          setConfirmDelete(true);
          break;
      }
    },
    [setConfirmDelete]
  );
  const redirectToReturn = useCallback(() => {
    console.log('poData?.status', poData?.status);
    if(poData?.status === POStatus.FINALIZED){
      setPaymentItem(undefined);
      setVisiblePaymentModal(true)
      setInitValue({
        is_refund: true,
        amount: poData.total_paid,
      });
    }else{
       history.push(`${UrlConfig.PURCHASE_ORDER}/${id}/return`, {
      params: poData,
      listCountries: listCountries,
      listDistrict: listDistrict,
    });
    }
   
  }, [history, id, listCountries, listDistrict, poData, setVisiblePaymentModal]);
  const menu: Array<MenuAction> = useMemo(() => {
    let menuActions = [];
    if (!poData) return [];
    let poStatus = poData.status;
    if (poStatus && [POStatus.FINALIZED, POStatus.DRAFT].includes(poStatus))
      menuActions.push({
        id: 1,
        name: "Hủy",
      });
    return menuActions;
  }, [poData]);
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

  const renderButton = useMemo(() => {
    switch (status) {
      case POStatus.DRAFT:
        return (
          <>
            <Button
              type="primary"
              className="create-button-custom ant-btn-outline"
              loading={isEditDetail && loadingSaveDraftButton}
              onClick={() => {
                if (isEditDetail) {
                  setStatusAction(POStatus.DRAFT);
                  formMain.submit();
                } else {
                  setIsEditDetail(!isEditDetail);
                }
              }}
            >
              {isEditDetail ? "Lưu nháp" : "Sửa"}
            </Button>
            <Button
              type="primary"
              onClick={onConfirmButton}
              className="create-button-custom"
              loading={loadingConfirmButton}
            >
              Duyệt
            </Button>
          </>
        );
      case POStatus.CANCELLED:
        return null;
      default:
        return (
          <Button
            type="primary"
            className="create-button-custom ant-btn-outline"
            loading={isEditDetail && loadingSaveDraftButton}
            onClick={() => {
              if (isEditDetail) {
                setStatusAction(status);
                formMain.submit();
              } else {
                setIsEditDetail(!isEditDetail);
              }
            }}
          >
            {isEditDetail ? "Lưu" : "Sửa"}
          </Button>
        );
    }
  }, [
    formMain,
    isEditDetail,
    loadingConfirmButton,
    loadingSaveDraftButton,
    onConfirmButton,
    status,
  ]);

  const printContentCallback = useCallback(
    (printContent: Array<PurchaseOrderPrint>) => {
      if (!printContent || printContent.length === 0) return;
      setPrintContent(printContent[0].html_content);
    },
    [setPrintContent]
  );
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  useEffect(() => { 
    dispatch(
      AccountSearchAction({ department_ids: [AppConfig.WIN_DEPARTMENT] }, onResultWin)
    );
    dispatch(POGetPrintContentAction(idNumber, printContentCallback));
    dispatch(StoreGetListAction(setListStore));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(VietNamId, setListDistrict));
    dispatch(PaymentConditionsGetAllAction(setListPaymentConditions));
    if (!isNaN(idNumber)) {
      setLoading(true);
      loadDetail(idNumber, true, false);
    } else {
      setError(true);
    }
  }, [dispatch, idNumber, loadDetail, onResultWin, onStoreResult, printContentCallback]);

  const handleExport = () => {
    var temp = document.createElement("div");
    temp.id = "temp";
    temp.innerHTML = printContent;
    let value = document.body.appendChild(temp);
    if (value === null) return;
    html2canvas(value).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("portrait", "px");
      pdf.addImage(imgData, "png", 10, 10, value.offsetWidth / 4, value.offsetHeight / 2);
      temp.remove();
      pdf.save(`Đơn hàng ${idNumber}.pdf`);
    });
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

  return (
    <ContentContainer
      isError={isError}
      isLoading={isLoading}
      title="Quản lý đơn đặt hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Đặt hàng",
          path: `${UrlConfig.PURCHASE_ORDER}`,
        },
        {
          name: `Đơn hàng ${id}`,
        },
      ]}
      extra={poData && <POStep poData={poData} />}
    >
 
      <div id="test" className="page-filter">
        <Space direction="horizontal">
          <ActionButton menu={menu} onMenuClick={onMenuClick} type="primary" />

          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              handlePrint && handlePrint();
            }}
            icon={<PrinterFilled style={{ fontSize: 28 }} />}
          ></Button>
          <Button
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              handleExport();
            }}
            icon={<SaveFilled style={{ fontSize: 28 }} />}
          ></Button>
          <div style={{ display: "none" }}>
            <div className="printContent" ref={printElementRef}>
              <div
                dangerouslySetInnerHTML={{
                  __html: purify.sanitize(printContent),
                }}
              ></div>
            </div>
          </div>
        </Space>
      </div>
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
            />
            <POProductForm isEdit={!isEditDetail} formMain={formMain} />
            <POInventoryForm
              onAddProcumentSuccess={onAddProcumentSuccess}
              idNumber={idNumber}
              poData={poData}
              isEdit={!isEditDetail}
              now={now}
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
              winAccount={winAccount}
              rdAccount={rdAccount}
              isEditDetail={isEditDetail}
            />
          </Col>
        </Row>
        <BottomBarContainer
          back={false}
          leftComponent={
            <React.Fragment>{poData && <POStep poData={poData} />}</React.Fragment>
          }
          height={80}
          rightComponent={renderButton}
        />
      </Form>
      {renderModalDelete()}
     
    </ContentContainer>
  );
};
 export default PODetailScreen
