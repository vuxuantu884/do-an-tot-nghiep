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
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import WarrantyBottomBar from "screens/warranty/components/WarrantyBottomBar/WarrantyBottomBar";
import {
  getWarrantyCenterDetailService,
  updateWarrantyCenterService,
} from "service/warranty/warranty.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { VietNamId, VietNamName } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import WarrantyCenterForm from "../components/WarrantyCenterForm";
import { StyledComponent } from "./styles";

type WarrantyParamsType = {
  id: string;
};

function WarrantyCenterDetail() {
  let { id } = useParams<WarrantyParamsType>();
  const [form] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();

  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

  const cities = useGetCities();
  const districts = useGetDistricts(selectedCityId);

  const [initialFormValues, setInitialFormValues] =
    useState<FormValueCreateCenterType>({
      name: undefined,
      phone: undefined,
      city_id: undefined,
      district_id: undefined,
      address: undefined,
    });

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
      updateWarrantyCenterService(+id, values)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Cập nhật trung tâm bảo hành thành công");
            history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.center}`);
          } else {
            handleFetchApiError(
              response,
              "Cập nhật trung tâm bảo hành",
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

  useEffect(() => {
    if (!id) {
      return;
    }
    dispatch(showLoading());
    getWarrantyCenterDetailService(+id)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          let warrantyCenter = response.data;
          const values: FormValueCreateCenterType = {
            name: warrantyCenter.name,
            phone: warrantyCenter.phone,
            city_id: warrantyCenter.city_id,
            district_id: warrantyCenter.district_id,
            address: warrantyCenter.address,
          };
          setInitialFormValues(values);
          form.setFieldsValue(values);
        } else {
          handleFetchApiError(
            response,
            "Chi tiết trung tâm bảo hành",
            dispatch,
          );
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  }, [dispatch, form, history, id]);

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
            name: "Chi tiết trung tâm bảo hành",
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

export default WarrantyCenterDetail;
