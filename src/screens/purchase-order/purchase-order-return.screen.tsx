import { Form, Row, Col, Button } from "antd";
import { Fragment, useState, useCallback } from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { POReturnAction } from "domain/actions/po/po.action";
import UrlConfig from "config/UrlConfig";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import ContentContainer from "component/container/content.container";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import POSupplierForm from "./component/po-supplier.form";
import POReturnProductForm from "./component/po-return-product.form";
import POReturnPaymentForm from "./component/po-return-payment.form";
import POStep from "./component/po-step";

interface POReturnProps {}
type PurchaseOrderReturnParams = {
  id: string;
};

const POReturnScreen: React.FC<POReturnProps> = (props: POReturnProps) => {
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { id } = useParams<PurchaseOrderReturnParams>();
  const idNumber = parseInt(id);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
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
    (value: PurchaseOrder) => {
      dispatch(POReturnAction(idNumber, value, onUpdateCall));
    },
    [dispatch, idNumber, onUpdateCall]
  );

  const onConfirmButton = useCallback(() => {
    setLoading(true);
    formMain.submit();
  }, [formMain]);

  const state: any = location.state;
  if (!state) return <Fragment></Fragment>;
  const params: PurchaseOrder = state.params;

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
        onFinish={onFinish}
      >
        <POSupplierForm
          showSupplierAddress={true}
          showBillingAddress={false}
          isEdit={true}
          listCountries={listCountries}
          listDistrict={listDistrict}
          formMain={formMain}
        />
        <POReturnProductForm formMain={formMain} />
        <POReturnPaymentForm formMain={formMain} />
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
            <POStep status={params?.status} />
          </Col>

          <Col md={9} style={{ marginTop: "8px" }}>
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
