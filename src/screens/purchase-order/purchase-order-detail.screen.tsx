import { Button, Col, Form, Input, Row, Dropdown, Menu, Space } from "antd";
import { Fragment } from "react";
import ContentContainer from "component/container/content.container";
import { AppConfig } from "config/AppConfig";
import UrlConfig from "config/UrlConfig";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { PoDetailAction, PoUpdateAction } from "domain/actions/po/po.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import {
  PurchaseOrder,
  PurchaseOrderPrint,
} from "model/purchase-order/purchase-order.model";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory } from "react-router-dom";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import {
  PODeleteAction,
  POGetPrintContentAction,
} from "domain/actions/po/po.action";
import {
  PoFormName,
  POStatus,
  ProcumentStatus,
  VietNamId,
} from "utils/Constants";
import { POUtils } from "utils/POUtils";
import POInfoForm from "./component/po-info.form";
import POInventoryForm from "./component/po-inventory.form";
import POPaymentForm from "./component/po-payment.form";
import POProductForm from "./component/po-product.form";
import POSupplierForm from "./component/po-supplier.form";

import POReturnList from "./component/po-return-list";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import POStep from "./component/po-step";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { ConvertDateToUtc } from "utils/DateUtils";
import { POField } from "model/purchase-order/po-field";
import { PaymentConditionsGetAllAction } from "domain/actions/po/payment-conditions.action";
import POPaymentConditionsForm from "./component/po-payment-conditions.form";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";
import moment from "moment";
import { PrinterFilled, SaveFilled } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { showSuccess } from "utils/ToastUtils";

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
  const [isError, setError] = useState(false);
  const [status, setStatus] = useState<string>(initPurchaseOrder.status);
  const [winAccount, setWinAccount] = useState<Array<AccountResponse>>([]);
  const [rdAccount, setRDAccount] = useState<Array<AccountResponse>>([]);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [loadingConfirmButton, setLoadingConfirmButton] = useState(false);
  const [listPaymentConditions, setListPaymentConditions] = useState<
    Array<PoPaymentConditions>
  >([]);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [poData, setPurchaseItem] = useState<PurchaseOrder>();
  const [printContent, setPrintContent] = useState<string>("");
  const onDetail = useCallback(
    (result: PurchaseOrder | null) => {
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
    (id: number, isLoading) => {
      dispatch(PoDetailAction(idNumber, onDetail));
    },
    [dispatch, idNumber, onDetail]
  );
  const collapse = useSelector(
    (state: RootReducerType) => state.appSettingReducer.collapse
  );
  const onConfirmButton = useCallback(() => {
    formMain.setFieldsValue({ status: POStatus.FINALIZED });
    formMain.submit();
  }, [formMain]);
  const onResultRD = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        setError(true);
        return;
      }
      setRDAccount(data.items);
    },
    []
  );
  const onResultWin = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        setError(true);
        return;
      }
      setWinAccount(data.items);
      dispatch(
        AccountSearchAction(
          { department_ids: [AppConfig.RD_DEPARTMENT] },
          onResultRD
        )
      );
    },
    [dispatch, onResultRD]
  );
  const onStoreResult = useCallback(
    (result: PageResponse<StoreResponse> | false) => {
      if (!!result) {
        setListStore(result.items);
      }
    },
    []
  );
  const onUpdateCall = useCallback(
    (result: PurchaseOrder | null) => {
      setLoadingConfirmButton(false);
      if (result !== null) {
        showSuccess("Cập nhật nhập hàng thành công");
        loadDetail(idNumber, true);
      }
    },
    [idNumber, loadDetail]
  );
  const onFinish = useCallback(
    (value: PurchaseOrder) => {
      switch (value.status) {
        case POStatus.FINALIZED:
        case POStatus.CANCELLED:
          setLoadingConfirmButton(true);
          dispatch(PoUpdateAction(idNumber, value, onUpdateCall));
          break;
      }
    },
    [dispatch, idNumber, onUpdateCall]
  );
  const onScroll = useCallback(() => {
    if (window.pageYOffset > 100) {
      setIsShowBillStep(true);
    } else {
      setIsShowBillStep(false);
    }
  }, []);
  const onAddProcumentSuccess = useCallback(() => {
    loadDetail(idNumber, true);
  }, [idNumber, loadDetail]);

  const onCancel = useCallback(() => {
    formMain.setFieldsValue({ status: POStatus.CANCELLED });
    formMain.submit();
  }, [formMain]);
  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          setConfirmDelete(true);
          break;
      }
    },
    [setConfirmDelete, poData]
  );
  const redirectToReturn = useCallback(() => {
    history.push(`${UrlConfig.PURCHASE_ORDER}/return/${id}`, {
      params: poData,
      listCountries: listCountries,
      listDistrict: listDistrict,
    });
  }, [history, poData]);
  const menu: Array<MenuAction> = useMemo(() => {
    let menuActions = [];
    if (!poData) return [];
    let poStatus = POUtils.combinePOStatus(poData);
    if (
      poStatus &&
      [POStatus.ORDER, POStatus.FINALIZED, POStatus.PROCUREMENT_DRAFT].includes(
        poStatus
      ) &&
      poData.receipt_quantity < 1
    )
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
      deleteFunc = onCancel;
    if (!poData) return;
    const { receipt_quantity, total_paid } = poData;
    if (!receipt_quantity && total_paid && total_paid > 0) {
      subTitle =
        "Đơn nhập đã được thanh toán với nhà cung cấp. Bạn có muốn tạo hoàn tiền từ nhà cung cấp trước khi hủy đơn nhập hàng không?";
      okText = "Tạo hoàn tiền";
      cancelText = "Hủy đơn hàng";
      deleteFunc = redirectToReturn;
    }

    return (
      <ModalDeleteConfirm
        onCancel={() => setConfirmDelete(false)}
        onOk={() => {
          setConfirmDelete(false);
          deleteFunc();
        }}
        okText={okText}
        cancelText={cancelText}
        title={title}
        subTitle={subTitle}
        visible={isConfirmDelete}
      />
    );
  }, [poData, isConfirmDelete, setConfirmDelete, setConfirmDelete, onCancel]);
  const renderButton = useMemo(() => {
    switch (status) {
      case POStatus.DRAFT:
        return (
          <Button
            type="primary"
            onClick={onConfirmButton}
            className="create-button-custom"
            loading={loadingConfirmButton}
          >
            Duyệt
          </Button>
        );
      default:
        return null;
    }
  }, [loadingConfirmButton, onConfirmButton, status]);
  useEffect(() => {
    dispatch(
      AccountSearchAction(
        { department_ids: [AppConfig.WIN_DEPARTMENT] },
        onResultWin
      )
    );
    dispatch(POGetPrintContentAction(idNumber, printContentCallback));
    dispatch(StoreGetListAction(setListStore));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(VietNamId, setListDistrict));
    dispatch(PaymentConditionsGetAllAction(setListPaymentConditions));
    if (!isNaN(idNumber)) {
      loadDetail(idNumber, true);
    } else {
      setError(true);
    }
  }, [dispatch, idNumber, loadDetail, onResultWin, onStoreResult]);
  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [formMain, onScroll]);

  const printContentCallback = useCallback(
    (printContent: Array<PurchaseOrderPrint>) => {
      if (!printContent || printContent.length === 0) return;
      setPrintContent(printContent[0].htmlContent);
    },
    [setPrintContent]
  );
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const handleExport = () => {
    var temp = document.createElement("div");
    temp.id = "temp";
    temp.innerHTML = printContent;
    let value = document.body.appendChild(temp);
    if (value === null) return;
    html2canvas(value).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "px");
      pdf.addImage(
        imgData,
        "png",
        10,
        0,
        value.offsetWidth / 2,
        value.offsetHeight / 2
      );
      temp.remove();
      pdf.save(`Đơn hàng ${idNumber}.pdf`);
    });
  };

  return (
    <ContentContainer
      isError={isError}
      title="Quản lý đơn đặt hàng"
      breadcrumb={[
        {
          name: "Tổng quản",
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
      extra={<POStep poData={poData} />}
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
                  __html: printContent,
                }}
              ></div>
            </div>
          </div>
        </Space>
      </div>
      <Form
        name={PoFormName.Main}
        form={formMain}
        onFinishFailed={({ errorFields }: any) => {
          const element: any = document.getElementById(
            errorFields[0].name.join("")
          );
          element?.focus();
          const y =
            element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
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
        <Row gutter={24} style={{ paddingBottom: 80 }}>
          {/* Left Side */}
          <Col md={18}>
            <POSupplierForm
              showSupplierAddress={true}
              showBillingAddress={true}
              isEdit={true}
              listCountries={listCountries}
              listDistrict={listDistrict}
              formMain={formMain}
            />
            <POProductForm isEdit={true} formMain={formMain} />
            <POInventoryForm
              onAddProcumentSuccess={onAddProcumentSuccess}
              idNumber={idNumber}
              code={poData?.code}
              isEdit={true}
              now={now}
              status={status}
              stores={listStore}
            />

            {poData && poData.status !== POStatus.DRAFT ? (
              <POPaymentForm poId={parseInt(id)} loadDetail={loadDetail} />
            ) : (
              <POPaymentConditionsForm listPayment={listPaymentConditions} />
            )}
            {poData &&
              ((poData.receipt_quantity && poData.receipt_quantity > 0) ||
                (poData.total_paid && poData.total_paid > 0)) && (
                <POReturnList
                  id={id}
                  params={formMain.getFieldsValue(true)}
                  listCountries={listCountries}
                  listDistrict={listDistrict}
                />
              )}
          </Col>
          {/* Right Side */}
          <Col md={6}>
            <POInfoForm
              isEdit={true}
              winAccount={winAccount}
              rdAccount={rdAccount}
            />
          </Col>
        </Row>

        <Row
          gutter={24}
          className="margin-top-10 "
          style={{
            position: "fixed",
            textAlign: "right",
            width: "100%",
            height: "55px",
            bottom: "0%",
            backgroundColor: "#FFFFFF",
            marginLeft: collapse ? "-25px" : "-30px",
            display: `${isShowBillStep ? "" : "none"}`,
          }}
        >
          <Col
            md={10}
            style={{
              marginLeft: "-20px",
              marginTop: "3px",
              padding: "3px",
              zIndex: 100,
            }}
          >
            <POStep poData={poData} />
          </Col>

          <Col md={9} style={{ marginTop: "8px" }}>
            {/* <Button
              className="ant-btn-outline fixed-button cancle-button"
              onClick={() => history.goBack()}
            >
              Trở về
            </Button> */}
            {renderButton}
          </Col>
        </Row>
      </Form>
      {renderModalDelete()}
    </ContentContainer>
  );
};

export default PODetailScreen;
