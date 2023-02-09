import React, { useCallback, useEffect, useMemo, useState } from "react";
import {useDispatch} from "react-redux";
import { Button, Card } from "antd";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import { getSmsConfigAction } from "domain/actions/settings/sms-settings.action";
import { smsPromotionVoucher } from "model/sms-config/smsConfig.model";
import { PriceRule, PriceRuleState } from "model/promotion/price-rules.model";
import { StyledSmsPromotionVoucher } from "screens/settings/sms/styles";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { PlusOutlined } from "@ant-design/icons";
import { ReactComponent as DoubleRightArrowIcon } from "assets/icon/double-right-arrow.svg";
import { ReactComponent as DoubleDownArrowIcon } from "assets/icon/double-down-arrow.svg";
import { SMS_TYPE } from "screens/settings/sms/helper";
import PromotionVoucherDetail from "screens/settings/sms/smsPromotionVoucher/PromotionVoucherDetail";
import { getPromotionReleaseListAction } from "domain/actions/promotion/promo-code/promo-code.action";
import PromotionVoucherCreate from "../smsPromotionVoucher/PromotionVoucherCreate";

const expandIconIdPrev = "promotion-voucher-expand-icon-";
const SmsPromotionVoucher: React.FC = () => {
  const dispatch = useDispatch();

  const [isGettingPromotion, setIsGettingPromotion] = useState(false);
  const [isGettingSmsData, setIsGettingSmsData] = useState(false);
  const [smsPromotionVoucherList, setSmsPromotionVoucherList] = useState<Array<smsPromotionVoucher>>([]);
  const [promotionReleaseList, setPromotionReleaseList] = useState<Array<PriceRule>>([]);
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const [newSmsId, setNewSmsId] = useState<number | null>(null);

  const columns: Array<ICustomTableColumType<any>> = useMemo(
    () => [
      {
        title: "Chương trình khuyến mãi",
        render: (item) => {
          const expandIconId = `${expandIconIdPrev}${item.id}`
          const priceRule = promotionReleaseList.find(promotion => promotion.id === item.price_rule_id);
          return (
            <>
              <span style={{ marginRight: 10 }}>{priceRule?.title}</span>
              <span className={"link"} onClick={() => handleExpandSmsItem(expandIconId)}>
              Xem chi tiết
            </span>
            </>
          );
        },
      },
      {
        title: "Trạng thái",
        align: "center",
        width: 170,
        render: (item) => {
          const priceRule = promotionReleaseList.find(promotion => promotion.id === item.price_rule_id);
          let isActive = priceRule?.state === PriceRuleState.ACTIVE;
          return (
            <>
              {isActive ?
                <span className={"sms-status sms-active-status"}>Đang hoạt động</span>
                :
                <div className={"sms-status sms-inactive-status"}>Ngưng hoạt động</div>
              }
            </>
          );
        },
      },
    ],
    [promotionReleaseList]
  );

  /** get sms config data */
  const handleSmsConfigResponse = useCallback((data: any) => {
    setIsGettingSmsData(false);
    if (data?.messages) {
      const smsFormListData = Array.isArray(data.messages) && data.messages.filter(
        (message: any) => message?.type === SMS_TYPE.VOUCHER);
      setSmsPromotionVoucherList(smsFormListData);
    }
  }, []);
  
  const getSmsConfigData = useCallback(() => {
    setIsGettingSmsData(true);
    dispatch(getSmsConfigAction(handleSmsConfigResponse));
  }, [dispatch, handleSmsConfigResponse]);

  useEffect(() => {
    getSmsConfigData();
  }, [getSmsConfigData]);
  /** end get sms config data */
  
  /** get promotion release */
  const getPromotionReleaseListCallback = useCallback((data: any) => {
    setIsGettingPromotion(false);
    if (data?.items) {
      setPromotionReleaseList(data.items);
    }
  }, []);

  useEffect(() => {
    if (smsPromotionVoucherList?.length > 0) {
      const priceRuleIds = smsPromotionVoucherList.map(item => item.price_rule_id);
      const params = {
        ids: priceRuleIds,
        limit: priceRuleIds.length,
      }
      setIsGettingPromotion(true);
      dispatch(getPromotionReleaseListAction(params, getPromotionReleaseListCallback));
    }
  }, [dispatch, getPromotionReleaseListCallback, smsPromotionVoucherList]);
  /** end get promotion release */

  const handleExpandSmsItem = (expandIconId: string) => {
    let expandIconElement = document.getElementById(expandIconId);
    expandIconElement?.click();
  }
  
  /** create sms success callback */
  const createSmsSuccessCallback = useCallback((newSms: any) => {
    const newSmsPromotionVoucherList = [
      ...smsPromotionVoucherList,
      {
        id: newSms.id,
        content: newSms.content,
        price_rule_id: newSms.price_rule_id,
        discount_code_length: newSms.discount_code_length,
        discount_code_prefix: newSms.discount_code_prefix,
        discount_code_suffix: newSms.discount_code_suffix,
      }
    ];
    setSmsPromotionVoucherList(newSmsPromotionVoucherList);
    setNewSmsId(newSms.id);
  }, [smsPromotionVoucherList])

  useEffect(() => {
    if (newSmsId) {
      const expandIconId = `${expandIconIdPrev}${newSmsId}`;
      handleExpandSmsItem(expandIconId);
    }
  }, [newSmsId]);
  /** end create sms success callback */

  return (
    <StyledSmsPromotionVoucher>
      <ContentContainer
        title="Gửi tin sinh mã giảm giá theo chương trình khuyến mãi"
        breadcrumb={[
          {
            name: "Cài đặt",
          },
          {
            name: "Cài đặt gửi tin",
            path: UrlConfig.SMS_SETTINGS,
          },
          {
            name: "Gửi tin sinh mã giảm giá theo chương trình khuyến mãi",
          },
        ]}
        extra={
          <Button
            className="ant-btn-primary new-sms-button"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setIsOpenCreateModal(true)}
          >
            <span className="button-text">Thêm chương trình</span>
          </Button>
        }
      >
        <div className="sms-promotion-voucher">
          <Card>
            <CustomTable
              bordered
              isLoading={isGettingPromotion || isGettingSmsData}
              pagination={false}
              sticky={{ offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
              dataSource={smsPromotionVoucherList}
              columns={columns}
              rowKey={(data) => data.price_rule_id}
              expandable={{
                expandIcon: ({ expanded, onExpand, record }) => {
                  let icon = <DoubleRightArrowIcon />;
                  if (expanded) {
                    icon = <DoubleDownArrowIcon />;
                  }
                  return (
                    <div
                      id={`${expandIconIdPrev}${record.id}`}
                      className={"expand-icon"}
                      onClick={(event) => onExpand(record, event)}
                    >
                      {icon}
                    </div>
                  );
                },
                expandedRowRender: (record, index) => {
                  return (
                    <div key={index}>
                      <PromotionVoucherDetail
                        smsDetail={record}
                        smsIndex={index}
                        handleExpandSmsItem={handleExpandSmsItem}
                      />
                    </div>
                  );
                },
              }}
            />
          </Card>
        </div>
      </ContentContainer>

      {isOpenCreateModal && (
        <PromotionVoucherCreate
          isOpenCreateModal={isOpenCreateModal}
          setIsOpenCreateModal={setIsOpenCreateModal}
          createSmsSuccessCallback={createSmsSuccessCallback}
        />
      )}
    </StyledSmsPromotionVoucher>
  );
};

export default SmsPromotionVoucher;
