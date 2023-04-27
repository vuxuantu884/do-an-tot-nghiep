import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Form, Modal } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { showError, showSuccess } from "utils/ToastUtils";
import { scrollAndFocusToDomElement } from "utils/AppUtils";
import PromotionCampaignProvider from "screens/promotion/campaign/components/PromotionCampaignProvider";
import PromotionCampaignForm from "screens/promotion/campaign/components/PromotionCampaignForm";
import { createPromotionCampaignAction } from "domain/actions/promotion/campaign/campaign.action";
import WarningExclamationCircleIcon from "assets/icon/warning-exclamation-circle.svg";
import CloseIcon from "assets/icon/X_close.svg";
import { ConfirmCancelModalStyled } from "screens/promotion/campaign/campaign.style";
import PromotionCampaignStep from "screens/promotion/campaign/components/PromotionCampaignStep";
import { CustomerSelectionOption } from "model/promotion/price-rules.model";
import { CustomerConditionFields, DEFAULT_CUSTOMER_CONDITION_DATE } from "screens/promotion/campaign/campaign.helper";
import moment from "moment/moment";

function PromotionCampaignCreate(): ReactElement {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [isVisibleConfirmCancelModal, setIsVisibleConfirmCancelModal] = useState<boolean>(false);

  useEffect(() => {
    const initialValues = {
      starts_date: moment(),
      customer_selection: CustomerSelectionOption.ALL,
    };
    form.setFieldsValue(initialValues);
  }, [form]);
  
  /** handle create promotion campaign */
  const transformFormValues = (values: any) => {
    const body = {
      ...values,
      prerequisite_store_ids: values.prerequisite_store_ids ?? [],
      prerequisite_customer_group_ids: values.prerequisite_customer_group_ids ?? [],
      prerequisite_customer_loyalty_level_ids: values.prerequisite_customer_loyalty_level_ids ?? [],
      prerequisite_genders: values.prerequisite_genders ?? [],
      prerequisite_order_source_ids: values.prerequisite_order_source_ids ?? [],
      prerequisite_sales_channel_names: values.prerequisite_sales_channel_names ?? [],
    };

    if (values.customer_selection === CustomerSelectionOption.ALL) {
      body.prerequisite_birthday_duration = [];
      body.prerequisite_wedding_duration = [];
    } else {
      /** handle customer birthday */
      if (!values.starts_birthday && !values.ends_birthday) {
        body.prerequisite_birthday_duration = [];
      } else {
        const startsBirthday = values.starts_birthday?.format('DDMM') || DEFAULT_CUSTOMER_CONDITION_DATE.START_DATE_OF_YEAR;
        const endsBirthday = values.ends_birthday?.format('DDMM') || DEFAULT_CUSTOMER_CONDITION_DATE.END_DATE_OF_YEAR;
        body.prerequisite_birthday_duration = [startsBirthday, endsBirthday];
      }

      /** handle customer wedding day */
      if (!values.starts_wedding_day && !values.ends_wedding_day) {
        body.prerequisite_wedding_duration = [];
      } else {
        const startsWeddingDay = values.starts_wedding_day?.format('DDMM') || DEFAULT_CUSTOMER_CONDITION_DATE.START_DATE_OF_YEAR;
        const endsWeddingDay = values.ends_wedding_day?.format('DDMM') || DEFAULT_CUSTOMER_CONDITION_DATE.END_DATE_OF_YEAR;
        body.prerequisite_wedding_duration = [startsWeddingDay, endsWeddingDay];
      }
    }

    delete body[CustomerConditionFields.starts_birthday];
    delete body[CustomerConditionFields.ends_birthday];
    delete body[CustomerConditionFields.starts_wedding_day];
    delete body[CustomerConditionFields.ends_wedding_day];

    return body;
  }

  const handleSubmit = useCallback((values: any) => {
    try {
      if (!values) {
        showError("Vui lòng kiểm tra lại dữ liệu.")
        return;
      }
      const body = transformFormValues(values);

      dispatch(showLoading());
      dispatch(
        createPromotionCampaignAction(body, (data) => {
          if (data) {
            showSuccess("Đăng ký chương trình khuyến mại thành công");
            history.push(`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/${data.id}`);
          }
          dispatch(hideLoading());
        }),
      );
    } catch (error: any) {
      dispatch(hideLoading());
      showError(error.message);
    }
  }, [dispatch, history]);

  const onFinishFailed = ({ errorFields }: any) => {
    const element: any = document.getElementById(errorFields[0].name.join(""));
    showError(errorFields?.[0]?.errors?.[0] || "Vui lòng kiểm tra lại dữ liệu");
    scrollAndFocusToDomElement(element);
  }
  /** end handle update promotion campaign */

  const handleCancelCreate = () => {
    setIsVisibleConfirmCancelModal(true);
  };
  const onCancelConfirmCancelModal = () => {
    setIsVisibleConfirmCancelModal(false);
  };
  const onOkConfirmCancelModal = () => {
    setIsVisibleConfirmCancelModal(false);
    history.push(`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}`);
  };

  return (
    <ContentContainer
      title="Đăng ký chương trình"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
        },
        {
          name: "Quản lý CTKM",
          path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}`,
        },
        {
          name: "Đăng ký chương trình",
          path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/create`,
        },
      ]}
    >
      <PromotionCampaignStep />
      <Form
        form={form}
        name="promotion_campaign_create"
        onFinish={handleSubmit}
        layout="vertical"
        onFinishFailed={onFinishFailed}
      >
        <PromotionCampaignForm
          form={form}
          isAllChannel={true}
          isAllCustomer={true}
          isAllSource={true}
          isAllStore={true}
        />

        <BottomBarContainer
          back="Quay lại danh sách chương trình KM"
          backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}`)}
          rightComponent={
            <>
              <Button
                onClick={() => handleCancelCreate()}
                style={{
                  marginRight: "12px",
                  borderColor: "#2a2a86",
                }}
                type="ghost"
              >
                Hủy
              </Button>
              <Button type="primary" onClick={() => form.submit()}>
                Đăng ký chương trình
              </Button>
            </>
          }
        />
      </Form>

      {isVisibleConfirmCancelModal && (
        <Modal
          centered
          width="400px"
          visible={isVisibleConfirmCancelModal}
          title=""
          maskClosable={false}
          closable={false}
          onCancel={onCancelConfirmCancelModal}
          okText="Đồng ý"
          cancelText="Ở lại"
          onOk={onOkConfirmCancelModal}
        >
          <ConfirmCancelModalStyled>
            <div className="header-modal">
              <div>
                <img src={WarningExclamationCircleIcon} alt="" style={{ marginRight: "16px" }} />
                <span>Chú ý</span>
              </div>
              <img
                src={CloseIcon}
                alt="close-modal-icon"
                onClick={onCancelConfirmCancelModal}
                style={{ width: "25px", height: "25px" }}
              />
            </div>
            <div className="content-modal">
              <div>Mọi thay đổi sẽ không được lưu lại.</div>
              <div>Bạn có đồng ý thoát?</div>
            </div>
          </ConfirmCancelModalStyled>
        </Modal>
      )}
    </ContentContainer>
  );
}

const PromotionCampaignCreateWithProvider = () => (
  <PromotionCampaignProvider>
    <PromotionCampaignCreate />
  </PromotionCampaignProvider>
);
export default PromotionCampaignCreateWithProvider;
