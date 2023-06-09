import React, { ReactElement, useEffect, useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Col, Form, Row } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import { PROMOTION_GIFT_PERMISSIONS } from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  createPromotionGiftAction,
  enablePromotionGiftAction,
} from "domain/actions/promotion/gift/gift.action";
import { GIFT_METHOD_ENUM } from "model/promotion/gift.model";
import moment from "moment";
import GeneralConditionForm from "screens/promotion/shared/general-condition.form";
import { transformGiftRequest } from "utils/PromotionUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { PROMOTION_TYPE } from "screens/promotion/constants";
import GiftForm from "screens/promotion/gift/components/GiftForm";
import GiftProvider, { GiftContext } from "screens/promotion/gift/components/GiftProvider";
import { scrollAndFocusToDomElement } from "utils/AppUtils";
import useAuthorization from "hook/useAuthorization";

function GiftCreate(): ReactElement {
  const history = useHistory();
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  /** phân quyền */
  const [allowActiveGift] = useAuthorization({
    acceptPermissions: [PROMOTION_GIFT_PERMISSIONS.ACTIVE],
  });
  /** */
  const [isActivePromotionGift, setIsActivePromotionGift] = useState(false);

  const giftContext = useContext(GiftContext);
  const { registerWithMinistry } = giftContext;

  const onActivePromotionGift = (idNumber: number) => {
    dispatch(showLoading());
    dispatch(
      enablePromotionGiftAction(idNumber, (response) => {
        dispatch(hideLoading());
        if (response) {
          showSuccess("Thêm mới và kích hoạt chương trình quà tặng thành công");
          history.push(`${UrlConfig.PROMOTION}${UrlConfig.GIFT}/${idNumber}`);
        }
      }),
    );
  };

  const handleSubmit = (values: any) => {
    try {
      const formValues = form.getFieldsValue(true);
      const body = transformGiftRequest(formValues);
      body.is_registered = registerWithMinistry;

      dispatch(showLoading());
      dispatch(
        createPromotionGiftAction(body, (data) => {
          //Time out 2s để BE đẩy dữ liệu lên
          setTimeout(() => {
            dispatch(hideLoading());
            if (data) {
              if (isActivePromotionGift) {
                onActivePromotionGift(data.id);
              } else {
                showSuccess("Thêm mới chương trình quà tặng thành công");
                history.push(`${UrlConfig.PROMOTION}${UrlConfig.GIFT}/${data.id}`);
              }
            }
          }, 2000);
        }),
      );
    } catch (error: any) {
      dispatch(hideLoading());
      showError(error.message);
    }
  };

  const handleSaveAndActive = () => {
    setIsActivePromotionGift(true);
    form.submit();
  };

  const handleSaveOnly = () => {
    setIsActivePromotionGift(false);
    form.submit();
  };

  /** init data */
  useEffect(() => {
    const initEntitlements = {
      entitled_variant_ids: [],
      entitled_product_ids: [],
      entitled_gift_ids: [],
      selectedProducts: [],
      selectedGifts: [],
      prerequisite_quantity_ranges: [
        {
          greater_than_or_equal_to: 1,
        },
      ],
    };

    const initialValues = {
      starts_date: moment(),
      entitled_method: GIFT_METHOD_ENUM.QUANTITY,
      priority: 1,
      entitlements: [initEntitlements],
    };
    form.setFieldsValue(initialValues);
  }, [form]);

  return (
    <ContentContainer
      title="Tạo chương trình quà tặng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
        },
        {
          name: "Quà tặng",
          path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}`,
        },
        {
          name: "Tạo chương trình quà tặng",
          path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}/create`,
        },
      ]}
    >
      <Form
        form={form}
        name="gift_create"
        onFinish={(values: any) => handleSubmit(values)}
        layout="vertical"
        onFinishFailed={({ errorFields }: any) => {
          const element: any = document.getElementById(errorFields[0].name.join(""));
          scrollAndFocusToDomElement(element);
        }}
      >
        <Row gutter={24}>
          <Col span={18}>
            <GiftForm form={form} />
          </Col>
          <Col span={6}>
            <GeneralConditionForm
              promotionType={PROMOTION_TYPE.GIFT}
              form={form}
              isAllChannel={true}
              isAllCustomer={true}
              isAllSource={true}
              isAllStore={true}
            />
          </Col>
        </Row>

        <BottomBarContainer
          back="Quay lại danh sách quà tặng"
          backAction={() => history.push(`${UrlConfig.PROMOTION}${UrlConfig.GIFT}`)}
          rightComponent={
            <AuthWrapper acceptPermissions={[PROMOTION_GIFT_PERMISSIONS.CREATE]}>
              <Button
                onClick={() => handleSaveOnly()}
                style={{
                  marginRight: "12px",
                  borderColor: "#2a2a86",
                }}
                type="ghost"
              >
                Lưu
              </Button>
              {allowActiveGift && (
                <Button type="primary" onClick={() => handleSaveAndActive()}>
                  Lưu và kích hoạt
                </Button>
              )}
            </AuthWrapper>
          }
        />
      </Form>
    </ContentContainer>
  );
}

const DiscountCreateWithProvider = () => (
  <GiftProvider>
    <GiftCreate />
  </GiftProvider>
);
export default DiscountCreateWithProvider;
