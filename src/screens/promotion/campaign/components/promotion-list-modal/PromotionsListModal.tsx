import React, { useContext } from "react";
import { Button, Modal, Tabs } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import DiscountListTab from "screens/promotion/campaign/components/promotion-list-modal/DiscountListTab";
import PromotionReleaseListTab from "screens/promotion/campaign/components/promotion-list-modal/PromotionReleaseListTab";
import GiftListTab from "screens/promotion/campaign/components/promotion-list-modal/GiftListTab";
import { PromotionCampaignContext } from "screens/promotion/campaign/components/PromotionCampaignProvider";
import { PROMOTION_TYPE } from "screens/promotion/constants";
import "screens/promotion/campaign/components/promotion-list-modal/promotionListModalStyle.scss";

const { TabPane } = Tabs;

const PromotionsListModal = (props: any) => {
  const { visible, onCloseModal, onOkModal } = props;

  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const {
    tempPromotionSelectedList,
    setActiveTab,
  } = promotionCampaignContext;

  const onChangeTab = (activeKey: string) => {
    setActiveTab(activeKey);
  };

  return (
    <Modal
      visible={visible}
      centered
      maskClosable={false}
      width={1200}
      title="DANH SÁCH KHÁCH HÀNG ĐÃ SỬ DỤNG MÃ"
      onCancel={onCloseModal}
      className="promotion-list-modal"
      footer={[
        <div className="modal-footer">
          {tempPromotionSelectedList?.length > 0 &&
            <div className="selected-number">Đã chọn {tempPromotionSelectedList.length} chương trình</div>
          }
          <Button
            className="ant-btn-outline ant-btn-primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onOkModal}
          >
            Thêm chương trình
          </Button>
        </div>
      ]}
    >
      <Tabs
        defaultActiveKey={PROMOTION_TYPE.DISCOUNT}
        onChange={onChangeTab}
      >
        <TabPane tab="Chiết khấu" key={PROMOTION_TYPE.DISCOUNT}>
          <DiscountListTab />
        </TabPane>
        <TabPane tab="Mã khuyến mại" key={PROMOTION_TYPE.PROMOTION_CODE}>
          <PromotionReleaseListTab />
        </TabPane>
        <TabPane tab="Quà tặng" key={PROMOTION_TYPE.GIFT}>
          <GiftListTab />
        </TabPane>
      </Tabs>
    </Modal>
  );
};
export default PromotionsListModal;
