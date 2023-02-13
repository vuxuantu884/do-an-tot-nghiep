import { Button, Form } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { showError, showSuccess } from "utils/ToastUtils";
import PromotionCampaignForm from "screens/promotion/campaign/components/PromotionCampaignForm";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import PromotionCampaignProvider, { PromotionCampaignContext } from "screens/promotion/campaign/components/PromotionCampaignProvider";
import { PromotionCampaignResponse } from "model/promotion/campaign.model";
import {
  getPromotionCampaignDetailAction,
  updatePromotionCampaignAction,
} from "domain/actions/promotion/campaign/campaign.action";
import { scrollAndFocusToDomElement } from "utils/AppUtils";
import ConfirmCancelModal from "screens/promotion/campaign/components/ConfirmCancelModal";

const PromotionCampaignUpdate = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const idNumber = parseInt(id);
  
  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const {
    setTempPromotionSelectedList,
    setTempSelectedRowKeys,
    selectedRowKeys,
    setPromotionSelectedList,
    setSelectedRowKeys,
  } = promotionCampaignContext;

  const [isVisibleConfirmCancelModal, setIsVisibleConfirmCancelModal] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const [promotionCampaignDetail, setPromotionCampaignDetail] = useState<PromotionCampaignResponse>();

  /** handle get promotion campaign detail */
  const handleSetFieldsValue = useCallback(
    (result: PromotionCampaignResponse) => {
      const formValue: any = {
        name: result.name,
        description: result.description,
      };
      form.setFieldsValue(formValue);
    },
    [form],
  );
  
  const handleSetContextData = useCallback(
    (data: PromotionCampaignResponse) => {
      const rowKeys = data.price_rules?.map(item => item.id) || [];
      setSelectedRowKeys(rowKeys);
      setTempSelectedRowKeys(rowKeys);
      setPromotionSelectedList(data.price_rules);
      setTempPromotionSelectedList(data.price_rules);
    },
    [setSelectedRowKeys, setTempSelectedRowKeys, setPromotionSelectedList, setTempPromotionSelectedList],
  );
  
  const getPromotionCampaignDetailCallback = useCallback((response: PromotionCampaignResponse | false) => {
    dispatch(hideLoading());
    if (!response) {
      setError(true);
    } else {
      setPromotionCampaignDetail(response);
      handleSetContextData(response);
      handleSetFieldsValue(response);
    }
  }, [dispatch, handleSetContextData, handleSetFieldsValue]);

  useEffect(() => {
    dispatch(showLoading());
    dispatch(getPromotionCampaignDetailAction(idNumber, getPromotionCampaignDetailCallback));
  }, [dispatch, getPromotionCampaignDetailCallback, idNumber]);
  /** end handle get promotion campaign detail */

  /** handle update promotion campaign */
  const updateCallback = useCallback((data: PromotionCampaignResponse) => {
    if (data) {
      showSuccess("Cập nhật chiến dịch khuyến mại thành công");
      history.push(`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/${idNumber}`);
    }
    dispatch(hideLoading());
  }, [dispatch, history, idNumber]);

  const handleSubmit = useCallback((values: any) => {
    try {
      const body = {
        ...values,
        price_rule_ids: selectedRowKeys
      };

      dispatch(showLoading());
      dispatch(updatePromotionCampaignAction(idNumber, body, updateCallback));
    } catch (error: any) {
      dispatch(hideLoading());
      showError(error.message);
    }
  }, [dispatch, idNumber, selectedRowKeys, updateCallback]);
  /** end handle update promotion campaign */

  const handleCancelCreate = () => {
    setIsVisibleConfirmCancelModal(true);
  };
  const onCancelConfirmCancelModal = () => {
    setIsVisibleConfirmCancelModal(false);
  };
  const onOkConfirmCancelModal = () => {
    setIsVisibleConfirmCancelModal(false);
    history.push(`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/${idNumber}`);
  };

  return (
    <ContentContainer
      isError={error}
      title={promotionCampaignDetail ? promotionCampaignDetail.name : "Cập nhật chiến dịch khuyến mại"}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
        },
        {
          name: "Quản lý chiến dịch",
          path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}`,
        },
        {
          name: "Cập nhật chiến dịch",
          path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/${idNumber}/update`,
        },
      ]}
    >
      <Form
        form={form}
        name="promotion_campaign_create"
        onFinish={handleSubmit}
        layout="vertical"
        onFinishFailed={({ errorFields }: any) => {
          const element: any = document.getElementById(errorFields[0].name.join(""));
          scrollAndFocusToDomElement(element);
        }}
      >
        <PromotionCampaignForm form={form} />

        <BottomBarContainer
          back="Quay lại danh sách chiến dịch"
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
                Lưu chiến dịch
              </Button>
            </>
          }
        />
      </Form>

      {isVisibleConfirmCancelModal && (
        <ConfirmCancelModal
          visible={isVisibleConfirmCancelModal}
          onCancel={onCancelConfirmCancelModal}
          onOk={onOkConfirmCancelModal}
        />
      )}
    </ContentContainer>
  );
};

const PromotionCampaignUpdateWithProvider = () => (
  <PromotionCampaignProvider>
    <PromotionCampaignUpdate />
  </PromotionCampaignProvider>
);
export default PromotionCampaignUpdateWithProvider;
