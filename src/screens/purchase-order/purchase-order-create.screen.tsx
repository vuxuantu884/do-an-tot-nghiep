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
import { PoFormName } from "utils/Constants";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";

const POCreateScreen = () => {
  const collapse = useSelector(
    (state: RootReducerType) => state.appSettingReducer.collapse
  );
  const dispatch = useDispatch();
  const history = useHistory();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [winAccount, setWinAccount] = useState<Array<AccountResponse>>([]);
  const [rdAccount, setRDAccount] = useState<Array<AccountResponse>>([]);
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const onResultRD = useCallback((data: PageResponse<AccountResponse>) => {
    setRDAccount(data.items);
    setLoading(false);
  }, []);
  const onResultWin = useCallback(
    (data: PageResponse<AccountResponse>) => {
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
  const onScroll = useCallback(() => {
    if (window.pageYOffset > 100) {
      setIsShowBillStep(true);
    } else {
      setIsShowBillStep(false);
    }
  }, []);
  const onProviderFinish = (name: string, { values, forms }: any) => {
    debugger;
    if (name === PoFormName.Main) {
      const { formSupplier, formInfo, formPoProduct } = forms;

      Promise.all([
        formSupplier.validateFields(),
        formInfo.validateFields(),
        formPoProduct.validateFields()
      ])
        .then((values) => {
          let supplierInfo = formSupplier.getFieldsValue(true);
          let poInfo = formInfo.getFieldsValue(true);
          let productItem = formPoProduct.getFieldsValue(true);
          let data:PurchaseOrder={...supplierInfo,...poInfo,...productItem}
          console.log("PO");
          console.log(data);
        })
        .catch((result: any) => {
          if (result.errorFields.length > 0) {
            let elName = result.errorFields[0].name.join("_");
            const elementError: any = document.querySelectorAll(
              "[id$=" + elName + "]"
            );
            if (elementError.length > 0) {
              elementError[0].focus();
              const y =
                elementError[0].getBoundingClientRect()?.top +
                window.pageYOffset +
                -250;
              window.scrollTo({ top: y, behavior: "smooth" });
            }
          }
        });
    }
  };
  useEffect(() => {
    dispatch(
      AccountSearchAction(
        { department_ids: [AppConfig.WIN_DEPARTMENT] },
        onResultWin
      )
    );
  }, [dispatch, onResultWin, onResultRD]);
  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  });
  return (
    <ContentContainer
      isLoading={isLoading}
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
      <Form.Provider onFormFinish={onProviderFinish}>
        <Row gutter={20} style={{ paddingBottom: 80 }}>
          {/* Left Side */}
          <Col md={18}>
            <POSupplierForm />
            <POProductForm />
            <POInventoryForm />
            <POPaymentForm />
          </Col>
          {/* Right Side */}
          <Col md={6}>
            <POInfoForm winAccount={winAccount} rdAccount={rdAccount} />
          </Col>
        </Row>
        <Form name={PoFormName.Main}>
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
              style={{ marginLeft: "-20px", marginTop: "3px", padding: "3px" }}
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
              >
                Lưu
              </Button>
            </Col>
          </Row>
        </Form>
      </Form.Provider>
    </ContentContainer>
  );
};

export default POCreateScreen;
