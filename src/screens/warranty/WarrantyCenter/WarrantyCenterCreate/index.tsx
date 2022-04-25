import { Card, Form } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig, { WARRANTY_URL } from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import useGetCities from "hook/useGetCities";
import useGetDistricts from "hook/useGetDistricts";
import {
  CreateWarrantyCenterParamsModel,
  FormValueCreateCenterType,
} from "model/warranty/warranty.model";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import WarrantyBottomBar from "screens/warranty/components/WarrantyBottomBar/WarrantyBottomBar";
import { createWarrantyCenterService } from "service/warranty/warranty.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { VietNamId, VietNamName } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import WarrantyCenterForm from "../components/WarrantyCenterForm";
import { StyledComponent } from "./styles";

function WarrantyCenterCreate() {
  const [form] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();

  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  const cities = useGetCities();
  const districts = useGetDistricts(selectedCityId);

  const initialFormValues: FormValueCreateCenterType = {
    name: undefined,
    phone: undefined,
    city_id: undefined,
    district_id: undefined,
    address: undefined,
  };

  const onOK = () => {
    form.validateFields().then(() => {
      const values: CreateWarrantyCenterParamsModel = form.getFieldsValue();
      values.city = values.city_id
        ? cities.find((city) => city.id === values.city_id)?.name
        : undefined;
      values.district = values.district_id
        ? districts.find((district) => district.id === values.district_id)?.name
        : undefined;
      values.country = VietNamName;
      values.country_id = VietNamId;
      dispatch(showLoading());
      createWarrantyCenterService(values)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Thêm mới trung tâm bảo hành thành công");
            history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.center}`);
          } else {
            handleFetchApiError(
              response,
              "Thêm mới trung tâm bảo hành",
              dispatch,
            );
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    });
  };

  const onCancel = () => {
    history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.center}`);
  };

  return (
    <React.Fragment>
      <ContentContainer
        title="Bảo hành"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Trung tâm bảo hành",
            path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.center}`,
          },
          {
            name: "Thêm mới trung tâm bảo hành",
          },
        ]}
      >
        <StyledComponent>
          <Card title="Thông tin chi tiết">
            <WarrantyCenterForm
              initialFormValues={initialFormValues}
              form={form}
              setSelectedCityId={setSelectedCityId}
              cities={cities}
              districts={districts}
            />
          </Card>
        </StyledComponent>
      </ContentContainer>
      <WarrantyBottomBar onOK={onOK} onCancel={onCancel} />
    </React.Fragment>
  );
}

export default WarrantyCenterCreate;
