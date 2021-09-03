import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import OrderSettingInformation from "./OrderSettingInformation";
import OrderSettingValue from "./OrderSettingValue";
import SelectThirdPartyLogistic from "./SelectThirdPartyLogistic";
import { StyledComponent } from "./styles";

type PropType = {};

function OrderSettings(props: PropType) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();

  const [isLoadedData, setIsLoadedData] = useState(false);
  const [initialFormValue, setInitialFormValue] = useState({
    from_date: null,
    to_date: null,
    print_size: null,
    store: null,
    store_id: null,
    template: null,
    type: null,
    users: [
      {
        value_date_from: moment("2015-01-01", "YYYY-MM-DD HH:mm"),
        value_date_to: moment("2015-01-01", "YYYY-MM-DD HH:mm"),
      },
      {
        value_date_from: moment("2017-01-01", "YYYY-MM-DD HH:mm"),
        value_date_to: moment("2017-01-01", "YYYY-MM-DD HH:mm"),
      },
    ],
    third_party_logistics: [
      {
        key: 0,
        checked: false,
        name: "",
        logo: "",
        fast_deliver: false,
        slow_deliver: false,
      },
    ],
  });

  const handleSubmitForm = () => {
    form
      .validateFields()
      .then((formValue: any) => {
        console.log("formValue", formValue);
      })
      .catch((error) => {
        const element: any = document.getElementById(
          error.errorFields[0].name.join("")
        );
        element?.focus();
        const offsetY =
          element?.getBoundingClientRect()?.top + window.pageYOffset + -200;
        window.scrollTo({ top: offsetY, behavior: "smooth" });
      });
  };

  const handleClickExit = () => {
    history.push(UrlConfig.ORDER_SETTINGS);
  };

  useEffect(() => {
    const fetchBusinesses = () => {};
    fetchBusinesses();
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        let listDeliveryService = [];
        listDeliveryService = response.map((single) => {
          return {
            checked: false,
            key: single.id,
            name: single.name,
            logo: single.logo,
            fast_deliver: false,
            slow_deliver: false,
          };
        });
        console.log("listDeliveryService", listDeliveryService);
        setInitialFormValue({
          ...initialFormValue,
          third_party_logistics: listDeliveryService,
        });
        form.resetFields();
        setIsLoadedData(true);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, form]);

  return (
    <StyledComponent>
      <ContentContainer
        title="Thêm cài đặt dịch vụ vận chuyển & phí ship báo khách"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Cài đặt",
            path: UrlConfig.ACCOUNTS,
          },
          {
            name: "Cấu hình đơn hàng",
            path: UrlConfig.ORDER_SETTINGS,
          },
          {
            name: "Thêm cài đặt",
          },
        ]}
      >
        {isLoadedData && (
          <Form form={form} layout="vertical" initialValues={initialFormValue}>
            <OrderSettingInformation />
            <OrderSettingValue />
            <SelectThirdPartyLogistic initialFormValue={initialFormValue} />
          </Form>
        )}
        <div className="groupButtons">
          <div className="groupButtons__left">
            <Link to={UrlConfig.ORDER_SETTINGS}>
              <ArrowLeftOutlined style={{ marginRight: 10 }} />
              Quay lại cấu hình đơn hàng
            </Link>
          </div>
          <div className="groupButtons__right">
            <Button
              onClick={() => {
                handleClickExit();
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              onClick={() => {
                handleSubmitForm();
              }}
            >
              Lưu
            </Button>
          </div>
        </div>
        <Button onClick={() => handleSubmitForm()}>Lưu</Button>
      </ContentContainer>
    </StyledComponent>
  );
}

export default OrderSettings;
