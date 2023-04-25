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
import PromotionCampaignProvider, {
  PromotionCampaignContext,
} from "screens/promotion/campaign/components/PromotionCampaignProvider";
import { PromotionCampaignResponse } from "model/promotion/campaign.model";
import {
  getPromotionCampaignDetailAction,
  updatePromotionCampaignAction,
} from "domain/actions/promotion/campaign/campaign.action";
import { scrollAndFocusToDomElement } from "utils/AppUtils";
import ConfirmCancelModal from "screens/promotion/campaign/components/ConfirmCancelModal";
import moment from "moment/moment";
import {
  CAMPAIGN_STATUS_ENUM,
  handleConvertCustomerConditionDate,
  transformPromotionCampaignFormValues,
} from "../campaign.helper";
import ConfirmUpdatePromotionCampaignModal from "./ConfirmUpdatePromotionCampaignModal";

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
  const [isVisibleConfirmUpdateModal, setIsVisibleConfirmUpdateModal] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const [promotionCampaignDetail, setPromotionCampaignDetail] =
    useState<PromotionCampaignResponse>();

  const [isAllStore, setIsAllStore] = useState(true);
  const [isAllCustomer, setIsAllCustomer] = useState(true);
  const [isAllChannel, setIsAllChannel] = useState(true);
  const [isAllSource, setIsAllSource] = useState(true);

  /** handle get promotion campaign detail */
  const handleSetFieldsValue = useCallback(
    (result: PromotionCampaignResponse) => {
      const birthdayDuration = handleConvertCustomerConditionDate(
        result.prerequisite_birthday_duration,
      );
      const weddingDayDuration = handleConvertCustomerConditionDate(
        result.prerequisite_wedding_duration,
      );
      const formValue: any = {
        name: result.name,
        description: result.description,
        note: result.note,
        starts_date: moment(result.starts_date),
        ends_date: result.ends_date ? moment(result.ends_date) : undefined,
        prerequisite_sales_channel_names: result.prerequisite_sales_channel_names,
        prerequisite_order_source_ids: result.prerequisite_order_source_ids,
        prerequisite_store_ids: result.prerequisite_store_ids,
        prerequisite_genders: result.prerequisite_genders?.map((item) => item.toLocaleUpperCase()),

        starts_birthday: birthdayDuration?.startDate,
        ends_birthday: birthdayDuration?.endDate,
        starts_wedding_day: weddingDayDuration?.startDate,
        ends_wedding_day: weddingDayDuration?.endDate,
        prerequisite_customer_group_ids: result.prerequisite_customer_group_ids,
        prerequisite_customer_loyalty_level_ids: result.prerequisite_customer_loyalty_level_ids,
      };

      form.setFieldsValue(formValue);

      //thiết lập các giá trị phạm vi áp dụng
      setIsAllStore(result.prerequisite_store_ids?.length === 0);
      setIsAllChannel(result.prerequisite_sales_channel_names?.length === 0);
      setIsAllSource(result.prerequisite_order_source_ids?.length === 0);
      setIsAllCustomer(result.customer_selection?.toLocaleUpperCase() === "ALL");
    },
    [form],
  );

  const handleSetContextData = useCallback(
    (data: PromotionCampaignResponse) => {
      const rowKeys = data.price_rules?.map((item) => item.id) || [];
      setSelectedRowKeys(rowKeys);
      setTempSelectedRowKeys(rowKeys);
      setPromotionSelectedList(data.price_rules);
      setTempPromotionSelectedList(data.price_rules);
    },
    [
      setSelectedRowKeys,
      setTempSelectedRowKeys,
      setPromotionSelectedList,
      setTempPromotionSelectedList,
    ],
  );

  const getPromotionCampaignDetailCallback = useCallback(
    (response: PromotionCampaignResponse | false) => {
      if (!response || response.state === CAMPAIGN_STATUS_ENUM.ACTIVED) {
        setError(true);
      } else {
        setPromotionCampaignDetail(response);
        handleSetContextData(response);
        handleSetFieldsValue(response);
      }
      dispatch(hideLoading());
    },
    [dispatch, handleSetContextData, handleSetFieldsValue],
  );

  useEffect(() => {
    dispatch(showLoading());
    dispatch(getPromotionCampaignDetailAction(idNumber, getPromotionCampaignDetailCallback));
  }, [dispatch, getPromotionCampaignDetailCallback, idNumber]);
  /** end handle get promotion campaign detail */

  /** handle update promotion campaign */
  const updateCallback = useCallback(
    (data: PromotionCampaignResponse) => {
      if (data) {
        showSuccess("Cập nhật chương trình khuyến mại thành công");
        history.push(`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/${idNumber}`);
      }
      dispatch(hideLoading());
    },
    [dispatch, history, idNumber],
  );

  const handleSubmit = useCallback(
    (values: any) => {
      try {
        if (promotionCampaignDetail?.state === CAMPAIGN_STATUS_ENUM.ACTIVED) {
          showError("Không thể cập nhật chương trình đã kích hoạt.");
          return;
        }
        if (!values) {
          showError("Vui lòng kiểm tra lại dữ liệu.");
          return;
        }
        const body = transformPromotionCampaignFormValues(values);
        body.price_rule_ids = selectedRowKeys;

        dispatch(showLoading());
        dispatch(updatePromotionCampaignAction(idNumber, body, updateCallback));
      } catch (error: any) {
        dispatch(hideLoading());
        showError(error.message);
      }
    },
    [dispatch, idNumber, promotionCampaignDetail?.state, selectedRowKeys, updateCallback],
  );
  /** end handle update promotion campaign */

  const handleCancelUpdate = () => {
    setIsVisibleConfirmCancelModal(true);
  };
  const onCancelConfirmCancelModal = () => {
    setIsVisibleConfirmCancelModal(false);
  };
  const onOkConfirmCancelModal = () => {
    setIsVisibleConfirmCancelModal(false);
    history.push(`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/${idNumber}`);
  };

  const handleUpdatePromotionCampaign = () => {
    setIsVisibleConfirmUpdateModal(true);
  };
  const onCancelConfirmUpdateModal = () => {
    setIsVisibleConfirmUpdateModal(false);
  };
  const onOkConfirmUpdateModal = () => {
    setIsVisibleConfirmUpdateModal(false);
    form.submit();
  };

  return (
    <ContentContainer
      isError={error}
      title={
        promotionCampaignDetail ? promotionCampaignDetail.name : "Cập nhật chương trình khuyến mại"
      }
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
        },
        {
          name: "Quản lý chương trình KM",
          path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}`,
        },
        {
          name: "Cập nhật chương trình KM",
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
        <PromotionCampaignForm
          form={form}
          isAllChannel={isAllChannel}
          isAllCustomer={isAllCustomer}
          isAllSource={isAllSource}
          isAllStore={isAllStore}
        />

        <BottomBarContainer
          back="Quay lại danh sách chương trình KM"
          backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}`)}
          rightComponent={
            <>
              <Button
                onClick={handleCancelUpdate}
                style={{
                  marginRight: "12px",
                  borderColor: "#2a2a86",
                }}
                type="ghost"
              >
                Hủy
              </Button>
              <Button type="primary" onClick={handleUpdatePromotionCampaign}>
                Lưu chương trình KM
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

      {isVisibleConfirmUpdateModal && (
        <ConfirmUpdatePromotionCampaignModal
          visible={isVisibleConfirmUpdateModal}
          onCancel={onCancelConfirmUpdateModal}
          onOk={onOkConfirmUpdateModal}
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
