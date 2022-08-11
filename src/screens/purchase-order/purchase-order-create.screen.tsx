import { Button, Col, Form, Input, Row } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import ModalConfirm from "component/modal/ModalConfirm";
import { AppConfig } from "config/app.config";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import UrlConfig from "config/url.config";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { PaymentConditionsGetAllAction } from "domain/actions/po/payment-conditions.action";
import { PoCreateAction, PoDetailAction } from "domain/actions/po/po.action";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { StoreResponse } from "model/core/store.model";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";
import { POField } from "model/purchase-order/po-field";
import {
  POLineItemType,
  POLoadType,
  PurchaseOrderLineItem,
} from "model/purchase-order/purchase-item.model";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { PurchaseOrderCreateContext } from "screens/purchase-order/provider/purchase-order.provider";
import { formatCurrency } from "utils/AppUtils";
import { POStatus, ProcumentStatus, VietNamId } from "utils/Constants";
import { ConvertDateToUtc } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { ProductResponse } from "../../model/product/product.model";
import {
  checkImportPriceLowByLineItem,
  combineLineItemToSubmitData,
  fetchProductGridData,
  getUntaxedAmountByLineItemType,
  MIN_IMPORT_PRICE_WARNING,
  POUtils,
  validateLineItemQuantity,
  convertLineItemsToProcurementItems,
} from "../../utils/POUtils";
import POInfoPO from "./component/po-info-po";
import POInfoForm from "./component/po-info.form";
import POInventoryForm from "./component/po-inventory.form";
import PoProductContainer from "./component/po-product-form-grid/po-product-container";
import POStep from "./component/po-step/po-step";
import POSupplierForm from "./component/po-supplier-form";
import POPaymentConditionsForm from "./component/PoPaymentConditionsForm";
import PurchaseOrderProvider from "./provider/purchase-order.provider";

const POProductFormOld = React.lazy(() => import("./component/po-product.form"));
const POProductFormNew = React.lazy(() => import("./component/po-product-form-grid"));

export type DataSourceType = {
  totalPrice: number;
  vat: number;
  items: ({
    [key: string]: any;
    sizes: string[];
    variant_id: string[];
    product_id: number;
    cloth_code: number;
    price: number;
    barcode: string;
    sku: string;
    isValid: boolean;
  } & ProductResponse)[];
};

const initPurchaseOrder = {
  line_items: [],
  policy_price_code: AppConfig.import_price,
  untaxed_amount: 0,
  trade_discount_rate: null,
  trade_discount_value: null,
  trade_discount_amount: 0,
  designer_code: null,
  payments: [],
  procurements: [
    {
      fake_id: new Date().getTime(),
      reference: "",
      store_id: null,
      expect_receipt_date: "",
      procurement_items: [],
      status: ProcumentStatus.DRAFT,
      note: "",
      actived_date: "",
      actived_by: "",
      stock_in_date: "",
      stock_in_by: "",
    },
  ],
  payment_discount_rate: null,
  payment_discount_value: null,
  payment_discount_amount: 0,
  total_cost_line: 0,
  total: 0,
  cost_lines: [],
  tax_lines: [],
  supplier_id: 0,
  expect_import_date: ConvertDateToUtc(moment()),
  order_date: null,
  status: POStatus.DRAFT,
  receive_status: ProcumentStatus.DRAFT,
  activated_date: null,
  completed_stock_date: null,
  cancelled_date: null,
  completed_date: null,
};

const POCreateScreen: React.FC = () => {
  const now = moment();
  const history = useHistory();
  const searchParams = new URLSearchParams(history.location.search);
  const poId = searchParams.get("poId");
  const dispatch = useDispatch();
  const [formMain] = Form.useForm();

  const [formInitial] = useState(initPurchaseOrder);

  const [statusAction, setStatusAction] = useState<string>("");
  const [listPaymentConditions, setListPaymentConditions] = useState<Array<PoPaymentConditions>>(
    [],
  );
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [isShowWarningPriceModal, setIsShowWarningPriceModal] = useState<boolean>(false);
  //context
  const {
    taxRate,
    poLineItemGridChema,
    poLineItemGridValue,
    isGridMode,
    setIsGridMode,
    setPoLineItemGridChema,
    setPoLineItemGridValue,
    setTaxRate,
  } = useContext(PurchaseOrderCreateContext);

  //reducer
  const myAccountCode = useSelector((state: RootReducerType) => state.userReducer.account?.code);

  const createCallback = useCallback(
    (result: PurchaseOrder) => {
      if (result) {
        showSuccess("Thêm mới dữ liệu thành công");
        history.push(`${UrlConfig.PURCHASE_ORDERS}/${result.id}`);
      }
      dispatch(hideLoading());
    },
    [history, dispatch],
  );

  const onFinish = (value: PurchaseOrder) => {
    dispatch(showLoading());
    try {
      value.is_grid_mode = isGridMode;
      if (isGridMode) {
        if (poLineItemGridValue.length === 0) {
          throw new Error("Vui lòng thêm sản phẩm");
        }
        if (!value.payment_condition_id && value.payment_condition_name) {
          throw new Error("Đơn vị thời gian công nợ không được để trống");
        }
        value.line_items = combineLineItemToSubmitData(
          poLineItemGridValue,
          poLineItemGridChema,
          taxRate,
          value.line_items,
        );
        const newProcurement = convertLineItemsToProcurementItems(
          value.line_items,
          value.procurements,
        );
        value.procurements = newProcurement;
      } else if (Array.isArray(value.line_items) && value.line_items.length === 0) {
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
        console.log(item.cost_price);
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
      const dataClone = { ...value, status: statusAction };

      dispatch(PoCreateAction(dataClone, createCallback));
    } catch (error: any) {
      showError(error.message);
      dispatch(hideLoading());
    } finally {
    }
  };

  const onFinishFailed = ({ errorFields }: any) => {
    setStatusAction("");
    const element: any = document.getElementById(errorFields[0].name.join("_"));
    element?.focus();
    const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
    window.scrollTo({ top: y, behavior: "smooth" });
    dispatch(hideLoading());
  };

  const createPurchaseOrder = (status: string) => {
    setStatusAction(status);
    try {
      const lineItems: any[] = isGridMode
        ? combineLineItemToSubmitData(poLineItemGridValue, poLineItemGridChema, taxRate)
        : formMain.getFieldsValue()[POField.line_items];
      if (!lineItems?.every((item) => item.price)) {
        throw new Error("Vui lòng điền giá nhập cho sản phẩm đã có số lượng để tạo đơn thành công");
      }
      if (checkImportPriceLowByLineItem(MIN_IMPORT_PRICE_WARNING, lineItems)) {
        setIsShowWarningPriceModal(true);
      } else {
        formMain.submit();
      }
    } catch (error: any) {
      showError(error.message);
    }
  };

  useEffect(() => {
    if (myAccountCode) {
      formMain.setFieldsValue({ [POField.merchandiser_code]: myAccountCode });
    }
  }, [myAccountCode, formMain]);

  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(VietNamId, setListDistrict));
    dispatch(PaymentConditionsGetAllAction(setListPaymentConditions));
  }, [dispatch]);

  useEffect(() => {
    if (poId) {
      dispatch(
        PoDetailAction(Number(poId), (data: PurchaseOrder | null) => {
          if (data) {
            setIsGridMode(data.is_grid_mode);
            fetchProductGridData(
              data.is_grid_mode,
              data,
              "READ_UPDATE",
              dispatch,
              setPoLineItemGridChema,
              setPoLineItemGridValue,
              setTaxRate,
            );
            const line_items = data.line_items.map((item: PurchaseOrderLineItem) => {
              return { ...item, receipt_quantity: 0, planned_quantity: 0 };
            });
            const procurements = [data.procurements[0]];
            procurements?.forEach((pro: any) => {
              pro.code = null;
              pro.id = null;
              pro.procurement_items.forEach((item: any) => {
                item.id = null;
                item.code = null;
              });
            });
            const params = {
              ...data,
              line_items,
              procurements,
              id: null,
              code: null,
              status: POStatus.DRAFT,
              total_payment: 0,
              payments: [],
              payment_discount_amount: 0,
              payment_discount_rate: null,
              payment_discount_value: null,
              payment_note: null,
              payment_refunds: null,
              receive_status: POStatus.DRAFT,
              reference: null,
            };
            formMain.setFieldsValue(params);
          }
        }),
      );
    }
  }, [
    poId,
    dispatch,
    formMain,
    setPoLineItemGridChema,
    setPoLineItemGridValue,
    setTaxRate,
    setIsGridMode,
  ]);

  return (
    <ContentContainer
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
          name: "Tạo mới đơn đặt hàng",
        },
      ]}
      extra={
        <div className="po-step">
          <POStep poData={formInitial} />
        </div>
      }
    >
      <Form
        form={formMain}
        onFinishFailed={onFinishFailed}
        onFinish={onFinish}
        initialValues={formInitial}
        layout="vertical"
      >
        <Form.Item name={POField.status} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item name={POField.payments} noStyle hidden>
          <Input />
        </Form.Item>
        <Form.Item name={POField.procurements} noStyle hidden>
          <Input />
        </Form.Item>
        <Row gutter={24} style={{ marginBottom: "20px" }}>
          {/* Left Side */}
          <Col md={18}>
            <POSupplierForm
              showSupplierAddress={true}
              showBillingAddress={true}
              isEdit={false}
              listCountries={listCountries}
              listDistrict={listDistrict}
              formMain={formMain}
            />
            <POInfoPO formMain={formMain} />
          </Col>
          {/* Right Side */}
          <Col md={6}>
            <POInfoForm isEdit={false} />
          </Col>
        </Row>
        <div style={{ width: "100%" }}>
          <PoProductContainer isEditMode={true} isDisableSwitch={false} form={formMain}>
            {isGridMode ? (
              <POProductFormNew formMain={formMain} isEditMode={true} />
            ) : (
              <POProductFormOld
                poLineItemType={POLineItemType.NORMAL}
                isEdit={true}
                formMain={formMain}
              />
            )}
          </PoProductContainer>
          <POInventoryForm
            isEdit={false}
            now={now}
            status={formMain.getFieldValue(POField.status)}
            stores={listStore}
            formMain={formMain}
            isShowStatusTag={false}
          />
          <POPaymentConditionsForm
            formMain={formMain}
            isEdit={false}
            listPayment={listPaymentConditions}
          />
        </div>
        <BottomBarContainer
          back={false}
          leftComponent={
            <div className="po-step">
              <POStep poData={formInitial} />
            </div>
          }
          rightComponent={
            <React.Fragment>
              <Button
                className="ant-btn-outline fixed-button cancle-button"
                onClick={() => history.push(UrlConfig.PURCHASE_ORDERS)}
              >
                Huỷ
              </Button>
              <AuthWrapper acceptPermissions={[PurchaseOrderPermission.create]}>
                <Button
                  type="primary"
                  className="create-button-custom ant-btn-outline fixed-button"
                  onClick={() => createPurchaseOrder(POStatus.DRAFT)}
                  ghost
                >
                  Tạo nháp
                </Button>
                <Button
                  type="primary"
                  className="create-button-custom"
                  onClick={() => createPurchaseOrder(POStatus.WAITING_APPROVAL)}
                >
                  Tạo và chờ duyệt
                </Button>
              </AuthWrapper>
            </React.Fragment>
          }
        />
      </Form>
      <ModalConfirm
        title="Giá nhập sản phẩm nhỏ hơn 1.000đ"
        subTitle="Bạn có chắc chắn muốn tạo đơn đặt hàng này?"
        visible={isShowWarningPriceModal}
        onCancel={() => setIsShowWarningPriceModal(false)}
        onOk={() => {
          formMain.submit();
          setIsShowWarningPriceModal(false);
        }}
      />
    </ContentContainer>
  );
};

const POCreateWithProvider = (props: any) => (
  <PurchaseOrderProvider>
    <POCreateScreen {...props} />
  </PurchaseOrderProvider>
);
export default POCreateWithProvider;
