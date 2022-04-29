/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, Form } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig, { WARRANTY_URL } from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { CreateWarrantyReasonParamsModel, FormValueCreateReasonType } from "model/warranty/warranty.model";
import React from "react";
import { useDispatch } from "react-redux";
import { RouterProps, useHistory } from "react-router-dom";
import WarrantyBottomBar from "screens/warranty/components/WarrantyBottomBar/WarrantyBottomBar";
import { createWarrantyReasonService } from "service/warranty/warranty.service";
import {
  handleFetchApiError,
  isFetchApiSuccessful
} from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import WarrantyReasonForm from "../components/WarrantyReasonForm";
import { StyledComponent } from "./styles";

type PropTypes = RouterProps & {};


function WarrantyStatusCreate(props: PropTypes) {

  const [form] = Form.useForm();
  const history = useHistory()
  const dispatch = useDispatch()

  const initialFormValues: FormValueCreateReasonType = {
    name:undefined,
    price: undefined,
    customer_fee: undefined,
    status: undefined,
  };

  const onOK = () => {
    form.validateFields().then(() => {
      const values:CreateWarrantyReasonParamsModel= form.getFieldsValue();
      dispatch(showLoading())
      createWarrantyReasonService(values).then(response=> {
        if (isFetchApiSuccessful(response)) {
          showSuccess("Thêm mới lý do bảo hành thành công")
          history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.reason}`)
        } else {
          handleFetchApiError(response, "Thêm mới lý do bảo hành", dispatch)
        }
      }).finally(() => {
        dispatch(hideLoading())
      })
    })
  };

  const onCancel = () => {
    history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.reason}`)
  }
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
            name: "Lý do bảo hành",
            path: `${UrlConfig.WARRANTY}/${WARRANTY_URL.reason}`,
          },
          {
            name: "Thêm mới lý do bảo hành",
          },
        ]}>
        <StyledComponent>
          <Card title="Thông tin chi tiết">
          <WarrantyReasonForm initialFormValues={initialFormValues} form={form} />
          </Card>
        </StyledComponent>
      </ContentContainer>
      <WarrantyBottomBar onOK={onOK} onCancel={onCancel} />

    </React.Fragment>
  );
}

export default WarrantyStatusCreate;
