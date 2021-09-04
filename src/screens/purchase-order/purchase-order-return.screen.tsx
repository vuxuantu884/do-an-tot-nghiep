import { Form, Row, Col, Button } from "antd";
import { Fragment, useState, useCallback } from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { POReturnAction } from "domain/actions/po/po.action";
import UrlConfig from "config/url.config";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import ContentContainer from "component/container/content.container";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import POSupplierForm from "./component/po-supplier.form";
import POReturnProductForm from "./component/po-return-product.form";
import POReturnPaymentForm from "./component/po-return-payment.form";
import POStep from "./component/po-step";
import { POField } from "model/purchase-order/po-field";
import { POUtils } from "utils/POUtils";
import {
  PurchaseOrderLineReturnItem,
  Vat,
} from "model/purchase-order/purchase-item.model";

interface POReturnProps {}
type PurchaseOrderReturnParams = {
  id: string;
};

const POReturnScreen: React.FC<POReturnProps> = (props: POReturnProps) => {
  const [isError] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { id } = useParams<PurchaseOrderReturnParams>();
  const idNumber = parseInt(id);
  const [formMain] = Form.useForm();
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const collapse = useSelector(
    (state: RootReducerType) => state.appSettingReducer.collapse
  );
  const onUpdateCall = useCallback(() => {
    setLoading(false);
    history.replace(`${UrlConfig.PURCHASE_ORDER}/${id}`);
  }, [history, id]);
  const onFinish = useCallback(
    (values: PurchaseOrder) => {
      values.line_return_items = values.line_return_items.filter(
        (item) => item.quantity_return > 0
      );
      dispatch(POReturnAction(idNumber, values, onUpdateCall));
    },
    [dispatch, idNumber, onUpdateCall]
  );
  const onCancelButton = () => {
    history.replace(`${UrlConfig.PURCHASE_ORDER}/${id}`);
  };
  const onConfirmButton = useCallback(() => {
    formMain.validateFields().then((values) => {
      setLoading(true);
      values[POField.expect_return_date] = Date.now();
      onFinish(values);
    });
  }, [formMain, onFinish]);

  const state: any = location.state;
  if (!state) return <Fragment></Fragment>;
  const params: PurchaseOrder = state.params;
  const listCountries: Array<CountryResponse> = state.listCountries;
  const listDistrict: Array<DistrictResponse> = state.listDistrict;
  return (
    <ContentContainer
      isLoading={isLoading}
      isError={isError}
      title={`Trả hàng cho đơn mua hàng ${id}`}
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
          name: `Đơn hàng`,
          path: `${UrlConfig.PURCHASE_ORDER}/${id}`,
        },
      ]}
    >
      <Form
        form={formMain}
        initialValues={params}
        layout="vertical"
        // onFinish={onFinish}
      >
        <POSupplierForm
          showSupplierAddress={true}
          showBillingAddress={false}
          isEdit={true}
          hideExpand={true}
          listCountries={listCountries}
          listDistrict={listDistrict}
          formMain={formMain}
        />
        <Form.Item shouldUpdate={(prevValues, curValues) => true} noStyle>
          {({ getFieldValue }) => {
            let tax_lines = getFieldValue(POField.tax_lines),
              line_return_items = getFieldValue(POField.line_return_items);
            let totalReturn = 0,
              totalVat = 0;
            line_return_items &&
              line_return_items.forEach((item: PurchaseOrderLineReturnItem) => {
                if (!item.quantity_return) return;
                totalReturn +=
                  item.quantity_return *
                  POUtils.caculatePrice(
                    item.price,
                    item.discount_rate,
                    item.discount_value
                  );
              });
            tax_lines.forEach((item: Vat) => {
              totalVat += item.amount;
            });
            return (
              <Fragment>
                <POReturnProductForm
                  formMain={formMain}
                  totalVat={totalVat}
                  totalReturn={totalReturn}
                  tax_lines={tax_lines}
                />
                <POReturnPaymentForm
                  formMain={formMain}
                  totalReturn={totalReturn}
                  totalVat={totalVat}
                />
              </Fragment>
            );
          }}
        </Form.Item>
        <Row
          gutter={24}
          className="margin-top-10 "
          style={{
            position: "fixed",
            textAlign: "right",
            width: "100%",
            height: "55px",
            bottom: "0%",
            zIndex: 10,
            backgroundColor: "#FFFFFF",
            marginLeft: collapse ? "-25px" : "-30px",
            // display: `${isShowBillStep ? "" : "none"}`,
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
            <POStep poData={params} />
          </Col>

          <Col md={9} style={{ marginTop: "8px" }}>
            <Button type="default" className="light" onClick={onCancelButton}>
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={onConfirmButton}
              className="create-button-custom"
            >
              Hoàn trả
            </Button>
          </Col>
        </Row>
      </Form>
    </ContentContainer>
  );
};

export default POReturnScreen;
