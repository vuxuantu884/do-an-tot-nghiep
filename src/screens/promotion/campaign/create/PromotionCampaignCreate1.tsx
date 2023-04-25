import React, { ReactElement, useContext, useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Form, Modal } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { showError, showSuccess } from "utils/ToastUtils";
import { scrollAndFocusToDomElement } from "utils/AppUtils";
import PromotionCampaignProvider, { PromotionCampaignContext } from "screens/promotion/campaign/components/PromotionCampaignProvider";
import PromotionCampaignForm from "screens/promotion/campaign/components/PromotionCampaignForm";
import { createPromotionCampaignAction } from "domain/actions/promotion/campaign/campaign.action";
import WarningExclamationCircleIcon from "assets/icon/warning-exclamation-circle.svg";
import CloseIcon from "assets/icon/X_close.svg";
import { ConfirmCancelModalStyled } from "screens/promotion/campaign/campaign.style";

function PromotionCampaignCreate(): ReactElement {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const { selectedRowKeys } = promotionCampaignContext;

  const [isVisibleConfirmCancelModal, setIsVisibleConfirmCancelModal] = useState<boolean>(false);

  /** handle create promotion campaign */
  const handleSubmit = useCallback((values: any) => {
    try {
      const body = {
        ...values,
        price_rule_ids: selectedRowKeys
      };
      
      dispatch(showLoading());
      dispatch(
        createPromotionCampaignAction(body, (data) => {
          if (data) {
            showSuccess("Tạo mới chương trình khuyến mại thành công");
            history.push(`${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/${data.id}`);
          }
          dispatch(hideLoading());
        }),
      );
    } catch (error: any) {
      dispatch(hideLoading());
      showError(error.message);
    }
  }, [dispatch, history, selectedRowKeys]);
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
      title="Tạo mới chương trình khuyến mại"
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
          name: "Tạo mới chương trình khuyến mại",
          path: `${UrlConfig.PROMOTION}${UrlConfig.CAMPAIGN}/create`,
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
                Lưu chương trình KM
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
