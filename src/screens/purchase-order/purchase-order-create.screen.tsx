import { Button, Row, Col, Form, Input } from "antd";
import POSupplierForm from "./component/po-supplier.form";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import POProductForm from "./component/po-product.form";
import POInventoryForm from "./component/po-inventory.form";
import POInfoForm from "./component/po-info.form";
import { useDispatch } from "react-redux";
import React, { useCallback, useEffect, useState } from "react";
import { AppConfig } from "config/app.config";
import { useHistory } from "react-router-dom";
import {
  POStatus,
  ProcumentStatus,
  VietNamId,
} from "utils/Constants";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PoCreateAction } from "domain/actions/po/po.action";
import { showError, showSuccess } from "utils/ToastUtils";

import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import { PaymentConditionsGetAllAction } from "domain/actions/po/payment-conditions.action";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
// import POStep from "./component/po-step";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { ConvertDateToUtc } from "utils/DateUtils";
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";
import { POField } from "model/purchase-order/po-field";
import moment from "moment";
import POStep from "./component/po-step";
import POPaymentConditionsForm from "./component/PoPaymentConditionsForm";
import BottomBarContainer from "component/container/bottom-bar.container";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";

const POCreateScreen: React.FC = () => {
  let now = moment();
  let initPurchaseOrder = {
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

  const dispatch = useDispatch();
  const history = useHistory();
  const [formMain] = Form.useForm();

  const [statusAction, setStatusAction] = useState<string>(""); 
  const [listPaymentConditions, setListPaymentConditions] = useState<
    Array<PoPaymentConditions>
  >([]); 
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [loadingDraftButton, setLoadingDraftButton] = useState(false);
  const [loadingSaveButton, setLoadingSaveButton] = useState(false);
 
  const createCallback = useCallback(
    (result: PurchaseOrder) => {
      if (result) {
        showSuccess("Thêm mới dữ liệu thành công");
        history.push(`${UrlConfig.PURCHASE_ORDERS}/${result.id}`);
      } else {
        setLoadingSaveButton(false);
        setLoadingDraftButton(false);
      }
    },
    [history]
  );

  const onFinish = useCallback(
    (data: PurchaseOrder) => {
      if (data.line_items.length === 0) {
        let element: any = document.getElementById("#product_search");
        element?.focus();
        const y =
          element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
        window.scrollTo({ top: y, behavior: "smooth" });
        showError("Vui lòng thêm sản phẩm");
        return;
      }
      const dataClone = { ...data, status: statusAction };
      //validate expect_receipt_date and store_id
      let isValidReceiptDateAndStore = true;
      dataClone.procurements.forEach((element) => {
        if (!element.expect_receipt_date || !element.store_id) {
          isValidReceiptDateAndStore = false;
        }
      });
      if (isValidReceiptDateAndStore && dataClone.procurements.length > 0) {
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
        showError("Vui lòng chọn đầy đủ ngày nhận và kho nhập");
        return;
      }
    },
    [createCallback, dispatch, statusAction]
  );

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
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Đặt hàng",
          path: `${UrlConfig.PURCHASE_ORDERS}`,
        },
        {
          name: "Tạo mới đơn đặt hàng",
        },
      ]}
      extra={<POStep poData={initPurchaseOrder} />}
    >
      <Form
        form={formMain}
        onFinishFailed={({ errorFields }: any) => {
          setStatusAction("");
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
            <POProductForm isEdit={false} formMain={formMain} />
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
            />
          </Col>
        </Row>
        <BottomBarContainer
          back={false}
          leftComponent={
            <POStep poData={initPurchaseOrder} />
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
                onClick={() => {
                  setStatusAction(POStatus.DRAFT);
                  formMain.submit();
                }}
              >
                Tạo nháp
              </Button>
              <AuthWrapper acceptPermissions={[PurchaseOrderPermission.approve]}>
              <Button
                disabled={loadingDraftButton}
                type="primary"
                className="create-button-custom"
                loading={loadingSaveButton}
                onClick={() => {
                  setStatusAction(POStatus.FINALIZED);
                  formMain.submit();
                }}
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

export default POCreateScreen;
