import { Card, Form } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig, { WARRANTY_URL } from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  CreateWarrantyReasonParamsModel,
  FormValueCreateReasonType,
} from "model/warranty/warranty.model";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import WarrantyBottomBar from "screens/warranty/components/WarrantyBottomBar/WarrantyBottomBar";
import {
  getWarrantyReasonDetailService,
  updateWarrantyReasonService,
} from "service/warranty/warranty.service";
import { goToTopPage, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import WarrantyReasonForm from "../components/WarrantyReasonForm";
import { StyledComponent } from "./styles";

type WarrantyParamsType = {
  id: string;
};

function WarrantyCenterDetail() {
  let { id } = useParams<WarrantyParamsType>();
  const [form] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();

  const initialFormValues: FormValueCreateReasonType = {
    name: undefined,
    price: undefined,
    customer_fee: undefined,
    status: undefined,
  };

  const onOK = () => {
    form.validateFields().then(() => {
      const values: CreateWarrantyReasonParamsModel = form.getFieldsValue();
      dispatch(showLoading());
      updateWarrantyReasonService(+id, values)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Cập nhật lý do bảo hành thành công");
            goToTopPage();
            history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.reason}`);
          } else {
            handleFetchApiError(response, "Cập nhật lý do bảo hành", dispatch);
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    });
  };

  const onCancel = () => {
    history.push(`${UrlConfig.WARRANTY}/${WARRANTY_URL.reason}`);
  };

  useEffect(() => {
    if (!id) {
      return;
    }
    dispatch(showLoading());
    getWarrantyReasonDetailService(+id)
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          let warrantyReason = response.data;
          const values: FormValueCreateReasonType = {
            name: warrantyReason.name,
            price: warrantyReason.price,
            customer_fee: warrantyReason.customer_fee,
            status: warrantyReason.status,
          };
          form.setFieldsValue(values);
        } else {
          handleFetchApiError(response, "Chi tiết lý do bảo hành", dispatch);
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
            name: "Lý do bảo hành",
            path: `${UrlConfig.WARRANTY}/center`,
          },
          {
            name: "Chi tiết lý do bảo hành",
          },
        ]}
      >
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

export default WarrantyCenterDetail;
