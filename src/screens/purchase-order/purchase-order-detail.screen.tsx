import { Button, Col, Form, Row, } from "antd";
import ContentContainer from "component/container/content.container";
import { AppConfig } from "config/AppConfig";
import UrlConfig from "config/UrlConfig";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { PoDetailAction } from "domain/actions/po/po.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { PoFormName, VietNamId } from "utils/Constants";
import POInfoForm from "./component/po-info.form";
import POInventoryForm from "./component/po-inventory.form";
import POPaymentForm from "./component/po-payment.form";
import POProductForm from "./component/po-product.form";
import POSupplierForm from "./component/po-supplier.form";
import {
  CountryGetAllAction,
  DistrictGetByCountryAction,
} from "domain/actions/content/content.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import POStep from "./component/po-step";
import { StoreResponse } from "model/core/store.model";
import { StoreGetListAction } from "domain/actions/core/store.action";


type  PurchaseOrderParam = {
  id: string;
};
const PODetailScreen: React.FC = () => {
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
  const { id } = useParams<PurchaseOrderParam>();
  let idNumber = parseInt(id);
  const dispatch = useDispatch();
  const history = useHistory();
  const [formMain] = Form.useForm();
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [winAccount, setWinAccount] = useState<Array<AccountResponse>>([]);
  const [rdAccount, setRDAccount] = useState<Array<AccountResponse>>([]);
  const [listCountries, setCountries] = useState<Array<CountryResponse>>([]);
  const [listDistrict, setListDistrict] = useState<Array<DistrictResponse>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [loadingSaveButton, setLoadingSaveButton] = useState(false);
  const collapse = useSelector(
    (state: RootReducerType) => state.appSettingReducer.collapse
  );
  const onDetail = useCallback((result: PurchaseOrder|null) => {
    setLoading(false);
    if (!result) {
      setError(true);
    } else {
      formMain.setFieldsValue(result);
    }
  }, [formMain]);
  const onResultRD = useCallback((data: PageResponse<AccountResponse>|false) => {
    if(!data) {
      setError(true);
      return;
    }
    setRDAccount(data.items);
    setLoading(false);
  }, []);
  const onResultWin = useCallback(
    (data: PageResponse<AccountResponse>|false) => {
      if(!data) {
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
      if(!!result) {
        setListStore(result.items);
      }
    },
    []
  );
  const onScroll = useCallback(() => {
    if (window.pageYOffset > 100) {
      setIsShowBillStep(true);
    } else {
      setIsShowBillStep(false);
    }
  }, []);
  useEffect(() => {
    dispatch(
      AccountSearchAction(
        { department_ids: [AppConfig.WIN_DEPARTMENT] },
        onResultWin
      )
    );
    dispatch(StoreGetListAction(setListStore));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(DistrictGetByCountryAction(VietNamId, setListDistrict));
    if(!isNaN(idNumber)) {
      dispatch(PoDetailAction(idNumber, onDetail));
    } else {
      setError(true);
    }
    
  }, [dispatch, idNumber, onDetail, onResultWin, onStoreResult]);
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
          name: `Đơn hàng ${id}`,
        },
      ]}
      extra={
        <POStep status="" />
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
        // onFinish={onFinish}
        initialValues={initPurchaseOrder}
        layout="vertical"
      >
       <Row gutter={24} style={{ paddingBottom: 80 }}>
          {/* Left Side */}
          <Col md={18}>
            <POSupplierForm
              isEdit={true}
              listCountries={listCountries}
              listDistrict={listDistrict}
              formMain={formMain}
            />
            <POProductForm formMain={formMain} />
            <POInventoryForm stores={listStore} />
            <POPaymentForm />
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
            style={{ marginLeft: "-20px", marginTop: "3px", padding: "3px", zIndex: 100 }}
          >
            <POStep status="" />
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
  )
}

export default PODetailScreen;