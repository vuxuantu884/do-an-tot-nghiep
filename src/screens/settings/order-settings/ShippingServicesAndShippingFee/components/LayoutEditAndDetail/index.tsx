import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Form } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { CityByCountryAction } from "domain/actions/content/content.action";
import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import {
  actionCreateConfigurationShippingServiceAndShippingFee,
  actionUpdateConfigurationShippingServiceAndShippingFee,
} from "domain/actions/settings/order-settings.action";
import { ProvinceModel } from "model/content/district.model";
import { CreateShippingServiceConfigReQuestModel } from "model/request/settings/order-settings.resquest";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { VietNamId } from "utils/Constants";
import { LAYOUT_CREATE_AND_DETAIL } from "utils/OrderSettings.constants";
import OrderSettingInformation from "../OrderSettingInformation";
import OrderSettingValue from "../OrderSettingValue";
import SelectThirdPartyLogistic from "../SelectThirdPartyLogistic";
import { StyledComponent } from "./styles";

type PropType = {
  layoutType: string;
  initialFormValue: CreateShippingServiceConfigReQuestModel;
  id?: number;
};

function LayoutEditAndDetail(props: PropType) {
  const { layoutType, initialFormValue, id } = props;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();

  const [isLoadedData, setIsLoadedData] = useState(false);
  const [listProvinces, setListProvinces] = useState<ProvinceModel[]>([]);
  const [list3rdPartyLogistic, setList3rdPartyLogistic] = useState<
    DeliveryServiceResponse[]
  >([]);

  const handleSubmitForm = (action: string) => {
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
        if (action === LAYOUT_CREATE_AND_DETAIL.create) {
          dispatch(
            actionCreateConfigurationShippingServiceAndShippingFee(
              formValueFormatted,
              () => {
                history.push(UrlConfig.ORDER_SETTINGS);
              }
            )
          );
        } else {
          if (id) {
            dispatch(
              actionUpdateConfigurationShippingServiceAndShippingFee(
                id,
                formValueFormatted,
                () => {
                  history.push(UrlConfig.ORDER_SETTINGS);
                }
              )
            );
          }
        }
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
        setList3rdPartyLogistic(response);
        form.resetFields();
        setIsLoadedData(true);
      })
    );
  }, [dispatch, form]);

  useEffect(() => {
    dispatch(
      CityByCountryAction(VietNamId, (response) => {
        setListProvinces(response);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (isLoadedData) {
      form.resetFields();
    }
  }, [isLoadedData, form, initialFormValue]);

  return (
    <StyledComponent>
      <ContentContainer
        // title="Thêm cài đặt dịch vụ vận chuyển & phí ship báo khách"
        title={
          layoutType === LAYOUT_CREATE_AND_DETAIL.create
            ? "Thêm cài đặt dịch vụ vận chuyển & phí ship báo khách"
            : "Chi tiết cài đặt dịch vụ vận chuyển & phí ship báo khách"
        }
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
            name:
              layoutType === LAYOUT_CREATE_AND_DETAIL.create
                ? "Thêm cài đặt"
                : initialFormValue.program_name,
          },
        ]}
      >
        {isLoadedData && (
          <Form form={form} layout="vertical" initialValues={initialFormValue}>
            <OrderSettingInformation
              form={form}
              initialFormValue={initialFormValue}
            />
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
                handleSubmitForm(layoutType);
              }}
            >
              {layoutType === LAYOUT_CREATE_AND_DETAIL.create
                ? "Tạo mới"
                : "Cập nhật"}
            </Button>
          </div>
        </div>
      </ContentContainer>
    </StyledComponent>
  );
}

export default LayoutEditAndDetail;
