import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { CityByCountryAction } from "domain/actions/content/content.action";
import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import { actionCreateConfigurationShippingServiceAndShippingFee } from "domain/actions/settings/order-settings.action";
import { ProvinceModel } from "model/content/district.model";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { VietNamId } from "utils/Constants";
import { ORDER_SETTINGS_STATUS } from "utils/OrderSettings.constants";
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
  const [listProvinces, setListProvinces] = useState<ProvinceModel[]>([]);
  const [list3rdPartyLogistic, setList3rdPartyLogistic] = useState<
    DeliveryServiceResponse[]
  >([]);
  const [initialFormValue, setInitialFormValue] = useState({
    status: ORDER_SETTINGS_STATUS.inactive,
    start_date: null,
    end_date: null,
    program_name: "",
    shipping_fee_configs: [
      {
        from_price: "",
        to_price: "",
        city_name: "",
        transport_fee: "",
      },
    ],
    external_service_transport_type_ids: [],
  });

  const handleSubmitForm = () => {
    form
      .validateFields()
      .then((formValue: any) => {
        const formValueFormatted = {
          ...formValue,
          // format necessary field
          shipping_fee_configs: formValue.shipping_fee_configs.map(
            (single: any) => {
              return {
                from_price: single.from_price,
                to_price: single.to_price,
                city_name: single.city_name,
                transport_fee: single.transport_fee,
              };
            }
          ),
        };
        dispatch(
          actionCreateConfigurationShippingServiceAndShippingFee(
            formValueFormatted,
            () => {}
          )
        );
      })
      .catch((error) => {
        console.log("error", error);
        // const element: any = document.getElementById(
        //   error.errorFields[0].name.join("")
        // );
        // element?.focus();
        // const offsetY =
        //   element?.getBoundingClientRect()?.top + window.pageYOffset + -200;
        // window.scrollTo({ top: offsetY, behavior: "smooth" });
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
        setList3rdPartyLogistic(response);
        let listDeliveryService = [];
        listDeliveryService = response.map((single) => {
          return {
            id: single.id,
            code: single.code,
            logo: single.logo,
            name: single.name,
            transport_types: single.transport_types,
          };
        });
        console.log("listDeliveryService", listDeliveryService);
        setInitialFormValue({
          ...initialFormValue,
          // external_service_transport_type_ids: listDeliveryService,
        });
        form.resetFields();
        setIsLoadedData(true);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, form]);

  useEffect(() => {
    dispatch(
      CityByCountryAction(VietNamId, (response) => {
        setListProvinces(response);
      })
    );
  }, [dispatch]);

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
            <OrderSettingInformation form={form} />
            <OrderSettingValue listProvinces={listProvinces} />
            <SelectThirdPartyLogistic
              initialFormValue={initialFormValue}
              list3rdPartyLogistic={list3rdPartyLogistic}
              form={form}
            />
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
