import { Card, Form } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig, { WARRANTY_URL } from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  CreateWarrantyProductStatusFormModel,
  UpdateWarrantyProductStatusModel,
  WarrantyProductStatusModel,
  WarrantyProductStatusStatusModel,
} from "model/warranty/warranty.model";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import WarrantyBottomBar from "screens/warranty/components/WarrantyBottomBar/WarrantyBottomBar";
import {
  getWarrantyProductStatusService,
  updateWarrantyProductStatusService,
} from "service/warranty/warranty.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import WarrantyCenterForm from "../components/WarrantyProductStatusForm";
import { StyledComponent } from "./styles";

type WarrantyParamsType = {
  id: string;
};

function WarrantyCenterDetail() {
  let { id } = useParams<WarrantyParamsType>();
  const [form] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();

  const initialFormValues: CreateWarrantyProductStatusFormModel = {
    name: undefined,
    type: undefined,
    status: undefined,
  };

  const onOK = () => {
    form.validateFields().then(() => {
      const values: WarrantyProductStatusModel = form.getFieldsValue();
      let valuesResult: UpdateWarrantyProductStatusModel = {
        ...values,
        status: values.status
          ? WarrantyProductStatusStatusModel.ACTIVE
          : WarrantyProductStatusStatusModel.INACTIVE,
      };
      dispatch(showLoading());
      updateWarrantyProductStatusService(+id, valuesResult)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Cập nhật trạng thái lý do bảo hành thành công");
            history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.productStatus}`);
          } else {
            handleFetchApiError(response, "Cập nhật trạng thái lý do bảo hành", dispatch);
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    });
  };

  const onCancel = () => {
    history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.productStatus}`);
  };

  useEffect(() => {
    if (!id) {
      return;
    }
    dispatch(showLoading());
    getWarrantyProductStatusService(+id)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          let data = response.data;
          const values: CreateWarrantyProductStatusFormModel = {
            name: data.name,
            type: data.type,
            status: data.status === WarrantyProductStatusStatusModel.ACTIVE ? true : false,
          };
          form.setFieldsValue(values);
        } else {
          handleFetchApiError(response, "Chi tiết trạng thái sản phẩm bảo hành", dispatch);
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
            name: "Trạng thái bảo hành",
            path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.productStatus}`,
          },
          {
            name: "Chi tiết trạng thái bảo hành",
          },
        ]}>
        <StyledComponent>
          <Card title="Thông tin chi tiết">
            <WarrantyCenterForm initialFormValues={initialFormValues} form={form} />
          </Card>
        </StyledComponent>
      </ContentContainer>
      <WarrantyBottomBar onOK={onOK} onCancel={onCancel} />
    </React.Fragment>
  );
}

export default WarrantyCenterDetail;
