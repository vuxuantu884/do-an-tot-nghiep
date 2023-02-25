import React, { ReactElement, useCallback, useContext, useState } from "react";
import {
  Card,
  Form,
  FormInstance,
  Input,
} from "antd";
import PromotionsListModal from "screens/promotion/campaign/components/promotion-list-modal/PromotionsListModal";
import PromotionSelectedList from "screens/promotion/campaign/components/PromotionSelectedList";
import { PromotionCampaignContext } from "screens/promotion/campaign/components/PromotionCampaignProvider";

interface Props {
  form: FormInstance;
}
function PromotionCampaignForm({ form }: Props): ReactElement {
  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const {
    tempPromotionSelectedList,
    setTempPromotionSelectedList,
    tempSelectedRowKeys,
    setTempSelectedRowKeys,
    promotionSelectedList,
    setPromotionSelectedList,
    selectedRowKeys,
    setSelectedRowKeys,
  } = promotionCampaignContext;

  const [isVisiblePromotionListModal, setIsVisiblePromotionListModal] = useState<boolean>(false);
  const onOpenPromotionListModal = () => {
    setIsVisiblePromotionListModal(true);
  };
  const onClosePromotionListModal = useCallback(() => {
    setIsVisiblePromotionListModal(false);
    setTempPromotionSelectedList(promotionSelectedList);
    setTempSelectedRowKeys(selectedRowKeys);
  }, [promotionSelectedList, selectedRowKeys, setTempPromotionSelectedList, setTempSelectedRowKeys]);

  const onOkPromotionListModal = useCallback(() => {
    setIsVisiblePromotionListModal(false);
    setPromotionSelectedList(tempPromotionSelectedList);
    setSelectedRowKeys(tempSelectedRowKeys);
  }, [setPromotionSelectedList, setSelectedRowKeys, tempPromotionSelectedList, tempSelectedRowKeys]);

  const onPressEnterNameInput = () => {
    let element: any = document.getElementById("name");
    element.blur();
  };
  const onBlurNameInput = (e: any) => {
    const nameValue = e.target.value.trim();
    form.setFieldsValue({
      name: nameValue,
    });
  };

  return (
    <div>
      <Card title="THÔNG TIN CHƯƠNG TRÌNH KHUYẾN MẠI">
        <Form.Item
          name="name"
          label="Tên chương trình khuyến mại"
          rules={[
            {
              required: true,
              message: "Bạn cần bổ sung tên chương trình KM",
            },
            {
              max: 255,
              message: "Tên chương trình KM không được vượt quá 255 ký tự",
            },
          ]}
        >
          <Input
            id="name"
            placeholder="Nhập tên chương trình KM"
            onPressEnter={onPressEnterNameInput}
            onBlur={onBlurNameInput}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả chương trình KM"
          rules={[
            {
              max: 500,
              message: "Mô tả không được vượt quá 500 ký tự",
            },
          ]}
        >
          <Input.TextArea placeholder="Nhập nội dung mô tả" autoSize={{ minRows: 5, maxRows: 10 }} />
        </Form.Item>
      </Card>

      <PromotionSelectedList
        isEdit
        onOpenPromotionListModal={onOpenPromotionListModal}
      />

      {isVisiblePromotionListModal && (
        <PromotionsListModal
          visible={isVisiblePromotionListModal}
          onOkModal={onOkPromotionListModal}
          onCloseModal={onClosePromotionListModal}
        />
      )}
    </div>
  );
}
export default PromotionCampaignForm;
