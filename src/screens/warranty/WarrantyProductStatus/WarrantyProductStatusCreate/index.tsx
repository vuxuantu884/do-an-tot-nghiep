/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, Form } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig, { WARRANTY_URL } from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  CreateWarrantyProductStatusFormModel,
  CreateWarrantyProductStatusModel,
  WarrantyProductStatusStatusModel,
} from "model/warranty/warranty.model";
import React from "react";
import { useDispatch } from "react-redux";
import { RouterProps, useHistory } from "react-router-dom";
import WarrantyBottomBar from "screens/warranty/components/WarrantyBottomBar/WarrantyBottomBar";
import { createProductStatusService } from "service/warranty/warranty.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import WarrantyProductStatusForm from "../components/WarrantyProductStatusForm";
import { StyledComponent } from "./styles";

type PropTypes = RouterProps & {};

function WarrantyProductStatusCreate(props: PropTypes) {
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
      const values = form.getFieldsValue();
      let valuesResult: CreateWarrantyProductStatusModel = {
        ...values,
        status: values.status
          ? WarrantyProductStatusStatusModel.ACTIVE
          : WarrantyProductStatusStatusModel.INACTIVE,
      };
      dispatch(showLoading());
      createProductStatusService(valuesResult)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Thêm mới trạng thái sản phẩm thành công");
            history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.productStatus}`);
          } else {
            handleFetchApiError(response, "Thêm mới trạng thái sản phẩm", dispatch);
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
            name: "Thêm mới trạng thái bảo hành",
          },
        ]}>
        <StyledComponent>
          <Card title="Thông tin chi tiết">
            <WarrantyProductStatusForm initialFormValues={initialFormValues} form={form} />
          </Card>
        </StyledComponent>
      </ContentContainer>
      <WarrantyBottomBar onOK={onOK} onCancel={onCancel} />
    </React.Fragment>
  );
}

export default WarrantyProductStatusCreate;
