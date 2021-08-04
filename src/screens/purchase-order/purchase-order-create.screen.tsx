import { CheckOutlined } from "@ant-design/icons";
import { Button, Row, Col, Form, Steps } from "antd";
import POSupplierForm from "./component/po-supplier.form";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import POProductForm from "./component/po-product.form";
import POInventoryForm from "./component/po-inventory.form";
import POPaymentForm from "./component/po-payment.form";
import POInfoForm from "./component/po-info.form";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { AppConfig } from "config/AppConfig";
import { useHistory } from "react-router-dom";
import { RootReducerType } from "model/reducers/RootReducerType";
import { PoFormName, VietNamId } from "utils/Constants";
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
import { PoPaymentConditions } from "model/purchase-order/payment-conditions.model";
import POPaymentConditionsForm from "./component/po-payment-conditions.form";

const POCreateScreen: React.FC = () => {
  let initPurchaseOrder = {
    line_items: [],
    price_type: AppConfig.import_price,
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
  };
  const collapse = useSelector(
    (state: RootReducerType) => state.appSettingReducer.collapse
  );
  const [isError, setError] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();
  const [formMain] = Form.useForm();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [winAccount, setWinAccount] = useState<Array<AccountResponse>>([]);
  const [listPaymentConditions, setListPaymentConditions] = useState<
    Array<PoPaymentConditions>
  >([]);
  const [rdAccount, setRDAccount] = useState<Array<AccountResponse>>([]);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [loadingSaveButton, setLoadingSaveButton] = useState(false);
  const onResultRD = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        setError(true);
        return;
      }
      setRDAccount(data.items);
      setLoading(false);
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
          { department_ids: [AppConfig.RD_DEPARTMENT], status: "active" },
          onResultRD
        )
      );
    },
    [dispatch, onResultRD]
  );
  const onScroll = useCallback(() => {
    if (window.pageYOffset > 100) {
      setIsShowBillStep(true);
    } else {
      setIsShowBillStep(false);
    }
  }, []);
  const createCallback = useCallback(
    (result: PurchaseOrder) => {
      if (result) {
        showSuccess("Thêm mới dữ liệu thành công");
        history.push(UrlConfig.PURCHASE_ORDER);
      } else {
        setLoadingSaveButton(false);
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
      setLoadingSaveButton(true);
      dispatch(PoCreateAction(data, createCallback));
    },
    [createCallback, dispatch]
  );

  useEffect(() => {
    dispatch(
      AccountSearchAction(
        { department_ids: [AppConfig.WIN_DEPARTMENT], status: "active" },
        onResultWin
      )
    );
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(VietNamId, setListDistrict));
    dispatch(PaymentConditionsGetAllAction(setListPaymentConditions));
  }, [dispatch, onResultWin, onResultRD]);
  
  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [formMain, onScroll]);
  return (
    <ContentContainer
      isLoading={isLoading}
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
          name: "Tạo mới đơn đặt hàng",
        },
      ]}
      extra={
        <Steps
          progressDot={(dot: any, { status, index }: any) => (
            <div className="ant-steps-icon-dot">
              {(status === "process" || status === "finish") && (
                <CheckOutlined />
              )}
            </div>
          )}
          size="small"
          current={0}
        >
          <Steps.Step title="Đặt hàng" />
          <Steps.Step title="Xác nhận" />
          <Steps.Step title="Phiếu nháp" />
          <Steps.Step title="Nhập kho" />
          <Steps.Step title="Hoàn thành" />
        </Steps>
      }
    >
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
        <Row gutter={24} style={{ paddingBottom: 80 }}>
          {/* Left Side */}
          <Col md={18}>
            <POSupplierForm
              isEdit={false}
              listCountries={listCountries}
              listDistrict={listDistrict}
              formMain={formMain}
            />
            <POProductForm formMain={formMain} />
            <POInventoryForm />
            {/* <POPaymentForm /> */}
            <POPaymentConditionsForm listPayment={listPaymentConditions} />
          </Col>
          {/* Right Side */}
          <Col md={6}>
            <POInfoForm winAccount={winAccount} rdAccount={rdAccount} />
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
            <Steps
              progressDot={(dot: any, { status, index }: any) => (
                <div className="ant-steps-icon-dot">
                  {(status === "process" || status === "finish") && (
                    <CheckOutlined />
                  )}
                </div>
              )}
              size="small"
              current={0}
            >
              <Steps.Step title="Đặt hàng" />
              <Steps.Step title="Xác nhận" />
              <Steps.Step title="Phiếu nháp" />
              <Steps.Step title="Nhập kho" />
              <Steps.Step title="Hoàn thành" />
            </Steps>
          </Col>

          <Col md={9} style={{ marginTop: "8px" }}>
            <Button
              className="ant-btn-outline fixed-button cancle-button"
              onClick={() => history.goBack()}
            >
              Huỷ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="create-button-custom"
              loading={loadingSaveButton}
            >
              Lưu
            </Button>
          </Col>
        </Row>
      </Form>
    </ContentContainer>
  );
};

export default POCreateScreen;
