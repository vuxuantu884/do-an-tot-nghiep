import { Button, Col, Form, Input, Row } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { AppConfig } from "config/app.config";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import UrlConfig from "config/url.config";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction
} from "domain/actions/content/content.action";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { PaymentConditionsGetAllAction } from "domain/actions/po/payment-conditions.action";
import { PoCreateAction } from "domain/actions/po/po.action";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { StoreResponse } from "model/core/store.model";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";
import { POField } from "model/purchase-order/po-field";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { PurchaseOrderCreateContext } from "screens/purchase-order/provider/purchase-order.provider";
import {
  POStatus, ProcumentStatus,
  VietNamId
} from "utils/Constants";
import { ConvertDateToUtc } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { ProductResponse } from "../../model/product/product.model";
import { combineLineItemToSubmitData, getTotalPriceOfAllLineItem, POUtils, validateLineItem } from "../../utils/POUtils";
import POInfoForm from "./component/po-info.form";
import POInventoryForm from "./component/po-inventory.form";
import PoProductContainer from "./component/po-product-form/po-product-container";
import POStep from "./component/po-step/po-step";
import POSupplierForm from "./component/po-supplier-form";
import POPaymentConditionsForm from "./component/PoPaymentConditionsForm";
import PurchaseOrderProvider from "./provider/purchase-order.provider";


const POProductFormOld = React.lazy(() => import("./component/po-product.form"));
const POProductFormNew = React.lazy(() => import("./component/po-product-form"));

export type DataSourceType = {
  totalPrice: number;
  vat: number;
  items: ({
    [key: string]: any,
    sizes: string[],
    variant_id: string[],
    product_id: number,
    cloth_code: number,
    price: number,
    barcode: string,
    sku: string,
    isValid: boolean,
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
      status_po: POStatus.DRAFTPO,
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
  let now = moment();
  const dispatch = useDispatch();
  const history = useHistory();
  const [formMain] = Form.useForm();

  const [formInitial] = useState(initPurchaseOrder)

  const [statusAction, setStatusAction] = useState<string>("");
  const [listPaymentConditions, setListPaymentConditions] = useState<
    Array<PoPaymentConditions>
  >([]);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [loadingDraftButton, setLoadingDraftButton] = useState(false);
  const [loadingSaveButton, setLoadingSaveButton] = useState(false);

  //context 
  const { taxRate, poLineItemGridChema, poLineItemGridValue, isGridMode } = useContext(PurchaseOrderCreateContext);

  const createCallback = useCallback(
    (result: PurchaseOrder) => {
      if (result) {
        showSuccess("Thêm mới dữ liệu thành công");
        history.push(`${UrlConfig.PURCHASE_ORDERS}/${result.id}`);
      }else {
        // setLoadingSaveButton(false);
        // setLoadingDraftButton(false);
        throw new Error("Lỗi khi lưu dữ liệu");
      }
    },
    [history]
  );

  const onFinish = (data: PurchaseOrder) => {
    try {
      //TH chọn 1 mã 7
      data.is_grid_mode = isGridMode;
      if (isGridMode) {
        const isValid = validateLineItem(poLineItemGridValue);
        if (!isValid) {
          throw new Error("");
        }
        const newDataItems: any = combineLineItemToSubmitData(poLineItemGridValue, poLineItemGridChema, taxRate);

        const untaxed_amount = Math.round(getTotalPriceOfAllLineItem(poLineItemGridValue))
        const tax_lines = [
          {
            rate: taxRate,
            amount: Math.round((untaxed_amount * taxRate) / 100)
          }
        ]

        const trade_discount_rate = formMain.getFieldValue(
          POField.trade_discount_rate
        );
        const trade_discount_value = formMain.getFieldValue(
          POField.trade_discount_value
        );
        const payment_discount_rate = formMain.getFieldValue(
          POField.payment_discount_rate
        );
        const payment_discount_value = formMain.getFieldValue(
          POField.trade_discount_value
        );
        const trade_discount_amount = POUtils.getTotalDiscount(
          untaxed_amount,
          trade_discount_rate,
          trade_discount_value
        );

        const total_after_tax = POUtils.getTotalAfterTax(
          untaxed_amount,
          trade_discount_amount,
          tax_lines
        );
        const payment_discount_amount = POUtils.getTotalDiscount(
          total_after_tax,
          payment_discount_rate,
          payment_discount_value
        );

        data.line_items = newDataItems
        data.trade_discount_amount = trade_discount_amount
        data.payment_discount_amount = payment_discount_amount
        data.total = Math.round(untaxed_amount + (untaxed_amount * taxRate) / 100)
        data.untaxed_amount = untaxed_amount
        data.tax_lines = tax_lines
      }

      //TH chọn nhiều mã
      if (Array.isArray(data.line_items) && data.line_items.length === 0) {
        let element: any = document.getElementById("#product_search");
        element?.focus();
        const y =
          element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
        window.scrollTo({ top: y, behavior: "smooth" });
        showError("Vui lòng thêm sản phẩm");
        throw new Error("");
      }

      // validate giá nhập     
      const isNotValidPrice = data.line_items.some(item => {
        return !item.price
      })
      if (isNotValidPrice) {
        showError("Vui lòng nhập giá nhập cho sản phẩm")
        throw new Error("");
      }

      const dataClone = { ...data, status: statusAction };
      //validate expect_receipt_date and store_id
      // let isValidReceiptDateAndStore = true;
      // dataClone.procurements.forEach((element) => {
      //   if (!element.expect_receipt_date || !element.store_id) {
      //     isValidReceiptDateAndStore = false;
      //   }
      // });
      if ( dataClone.procurements.length > 0) {
        switch (dataClone.status) {
          case POStatus.DRAFT:
            setLoadingDraftButton(true);
            break;
          case POStatus.FINALIZED:
            setLoadingSaveButton(true);
            break;
        }

        dispatch(PoCreateAction(dataClone, createCallback));
      } else {
        showError("Vui lòng chọn đầy đủ ngày nhận");
        throw new Error("Vui lòng nhập đầy đủ thông tin sản phẩm");
      }
    } catch (error) {
      setLoadingSaveButton(false);
      setLoadingDraftButton(false);
    } finally {
    }
  };


  const onFinishFailed = ({ errorFields }: any) => {
    setStatusAction("");
    const element: any = document.getElementById(
      errorFields[0].name.join("")
    );
    element?.focus();
    const y =
      element?.getBoundingClientRect()?.top + window.pageYOffset + -250;

    window.scrollTo({ top: y, behavior: "smooth" });
  }

  const createPurchaseOrder = (status: string) => {
    setStatusAction(status);
    formMain.submit();
    // remove()
  }

  useEffect(() => {
    dispatch(StoreGetListAction(setListStore));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(VietNamId, setListDistrict));
    dispatch(PaymentConditionsGetAllAction(setListPaymentConditions));
  }, [dispatch]);


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
      extra={<POStep poData={formInitial} />}
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
        <Row gutter={24} style={{ paddingBottom: 30 }}>
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
            <PoProductContainer isEditMode={true} isDisableSwitch={false} form={formMain}>
              {
                (isCodeSeven) => (
                  isCodeSeven ? (
                    <POProductFormNew
                      formMain={formMain}
                      isEditMode={true}
                    />
                  ) : (
                    <POProductFormOld isCodeSeven={isCodeSeven} isEdit={false} formMain={formMain} />
                  )
                )
              }
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
          </Col>
          {/* Right Side */}
          <Col md={6}>
            <POInfoForm
              isEdit={false}
              formMain={formMain}
            />
          </Col>
        </Row>
        <BottomBarContainer
          back={false}
          leftComponent={
            <POStep poData={formInitial} />
          }
          rightComponent={
            <React.Fragment>
              <Button
                disabled={loadingDraftButton || loadingSaveButton}
                className="ant-btn-outline fixed-button cancle-button"
                onClick={() => history.goBack()}
              >
                Huỷ
              </Button>
              <Button
                disabled={loadingSaveButton}
                type="primary"
                className="create-button-custom ant-btn-outline fixed-button"
                loading={loadingDraftButton}
                onClick={() => createPurchaseOrder(POStatus.DRAFT)}
                ghost
              >
                Tạo nháp
              </Button>
              <AuthWrapper acceptPermissions={[PurchaseOrderPermission.approve]}>
                <Button
                  disabled={loadingDraftButton}
                  type="primary"
                  className="create-button-custom"
                  loading={loadingSaveButton}
                  onClick={() => createPurchaseOrder(POStatus.FINALIZED)}
                >
                  Tạo và xác nhận
                </Button>
              </AuthWrapper>
            </React.Fragment>
          }
        />
      </Form>
    </ContentContainer>
  );
};

// export default POCreateScreen;
const POCreateWithProvider = (props: any) => (
  <PurchaseOrderProvider>
    <POCreateScreen {...props} />
  </PurchaseOrderProvider>
)
export default POCreateWithProvider;
