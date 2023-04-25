import React, {
  Fragment,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button, Card } from "antd";
import { cloneDeep } from "lodash";
import { DISCOUNT_STATUS, PROMOTION_TYPE } from "screens/promotion/constants";
import { Link } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { PromotionCampaignContext } from "screens/promotion/campaign/components/PromotionCampaignProvider";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import DatePromotionColumn from "screens/promotion/shared/date-column";
import { EmptyDataTable } from "screens/promotion/campaign/components/EmptyDataTable";
import {
  PromotionSelectedListStyled,
  RemovePromotionColumnStyled,
} from "screens/promotion/campaign/campaign.style";
import closeIcon from "assets/icon/X_close.svg";
import PromotionsListModal from "./promotion-list-modal/PromotionsListModal";
import { PromotionCampaignResponse } from "model/promotion/campaign.model";
import { showError, showSuccess } from "utils/ToastUtils";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { updatePromotionCampaignItemAction } from "domain/actions/promotion/campaign/campaign.action";
import { useDispatch } from "react-redux";
import { compareNumberArray } from "utils/AppUtils";
import useAuthorization from "hook/useAuthorization";
import { PROMOTION_CAMPAIGN_PERMISSIONS } from "config/permissions/promotion.permisssion";

interface Props {
  promotionCampaignDetail?: PromotionCampaignResponse;
  getPromotionCampaignDetail?: () => void;
}

function PromotionSelectedList({
  promotionCampaignDetail,
  getPromotionCampaignDetail,
}: Props): ReactElement {
  const dispatch = useDispatch();

  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const {
    tempPromotionSelectedList,
    setTempPromotionSelectedList,
    tempSelectedRowKeys,
    setTempSelectedRowKeys,
    promotionSelectedList,
    setPromotionSelectedList,
    originalSelectedRowKeys,
    selectedRowKeys,
    setSelectedRowKeys,
  } = promotionCampaignContext;

  /** phân quyền */
  const [allowSetupPromotionCampaign] = useAuthorization({
    acceptPermissions: [PROMOTION_CAMPAIGN_PERMISSIONS.SETUP],
  });
  /** */

  const [isPromotionSelectedListChanged, setIsPromotionSelectedListChanged] =
    useState<boolean>(false);
  const [isVisiblePromotionListModal, setIsVisiblePromotionListModal] = useState<boolean>(false);
  const onOpenPromotionListModal = () => {
    setIsVisiblePromotionListModal(true);
  };
  const onClosePromotionListModal = useCallback(() => {
    setIsVisiblePromotionListModal(false);
    setTempPromotionSelectedList(promotionSelectedList);
    setTempSelectedRowKeys(selectedRowKeys);
  }, [
    promotionSelectedList,
    selectedRowKeys,
    setTempPromotionSelectedList,
    setTempSelectedRowKeys,
  ]);

  const onOkPromotionListModal = useCallback(() => {
    setIsVisiblePromotionListModal(false);
    setPromotionSelectedList(tempPromotionSelectedList);
    setSelectedRowKeys(tempSelectedRowKeys);
  }, [
    setPromotionSelectedList,
    setSelectedRowKeys,
    tempPromotionSelectedList,
    tempSelectedRowKeys,
  ]);

  const handleRemovePromotion = useCallback(
    (item: any) => {
      const _promotionSelectedList = cloneDeep(promotionSelectedList);
      const _selectedRowKeys = cloneDeep(selectedRowKeys);
      const rowKeysChange = item ? [item.id] : [];

      const newPromotionSelectedList = _promotionSelectedList.filter(
        (itemSelected: any) => !rowKeysChange.includes(itemSelected.id),
      );
      setPromotionSelectedList(newPromotionSelectedList);
      setTempPromotionSelectedList(newPromotionSelectedList);

      const newSelectedRowKeys = _selectedRowKeys.filter(
        (rowKey: any) => !rowKeysChange.includes(rowKey),
      );
      setSelectedRowKeys(newSelectedRowKeys);
      setTempSelectedRowKeys(newSelectedRowKeys);
    },
    [
      promotionSelectedList,
      selectedRowKeys,
      setPromotionSelectedList,
      setSelectedRowKeys,
      setTempPromotionSelectedList,
      setTempSelectedRowKeys,
    ],
  );

  /** table columns */
  const columns = useMemo(() => {
    const defaultColumns: Array<ICustomTableColumType<any>> = [
      {
        title: "STT",
        align: "center",
        width: "60px",
        render: (value, row, index) => {
          return <span>{index + 1}</span>;
        },
      },
      {
        title: "ID",
        align: "center",
        width: "110px",
        render: (item: any) => {
          let promotionDetailUrl = "";
          switch (item.type) {
            case PROMOTION_TYPE.GIFT:
              promotionDetailUrl = `${UrlConfig.PROMOTION}${UrlConfig.GIFT}/${item.id}`;
              break;
            case PROMOTION_TYPE.DISCOUNT:
              promotionDetailUrl = `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${item.id}`;
              break;
            case PROMOTION_TYPE.PROMOTION_CODE:
              promotionDetailUrl = `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${item.id}`;
              break;
            default:
              break;
          }
          return (
            <Link
              to={promotionDetailUrl}
              style={{ color: "#2A2A86", fontWeight: 500 }}
              target="_blank"
            >
              {item.code}
            </Link>
          );
        },
      },
      {
        title: "Tên chương trình",
        render: (item: any) => <div>{item.title}</div>,
      },
      {
        title: "Thời gian",
        align: "center",
        width: "150px",
        render: (item: any) => (
          <DatePromotionColumn startDate={item.starts_date} endDate={item.ends_date} />
        ),
      },
      {
        title: "Người tạo",
        align: "center",
        render: (item: any) => <div>{`${item.created_by} - ${item.created_name}`}</div>,
      },
      {
        title: "Người duyệt",
        align: "center",
        render: (item: any) => {
          return (
            <>
              {item.activated_by || item.activated_name ? (
                <div>{`${item.activated_by || ""} - ${item.activated_name || ""}`}</div>
              ) : (
                <></>
              )}
            </>
          );
        },
      },
      {
        title: "Đăng ký BCT",
        align: "center",
        width: "140px",
        render: (item: any) => (
          <div>{item.is_registered ? <span>Đã đăng ký</span> : <span>Chưa đăng ký</span>}</div>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "state",
        align: "center",
        width: "140px",
        render: (state: string) => {
          const StatusTag: ReactNode = DISCOUNT_STATUS.find((e: any) => e.code === state)
            ?.Component ?? <Fragment />;
          return StatusTag;
        },
      },
    ];

    if (allowSetupPromotionCampaign) {
      defaultColumns.push({
        width: "60px",
        render: (item: any) => {
          return (
            <RemovePromotionColumnStyled>
              <img
                src={closeIcon}
                className="remove-item-icon"
                alt="remove-item"
                onClick={() => handleRemovePromotion(item)}
              />
            </RemovePromotionColumnStyled>
          );
        },
      });
    }

    return defaultColumns;
  }, [allowSetupPromotionCampaign, handleRemovePromotion]);

  /** handle update promotion list */
  const updateCallback = useCallback(
    (data: PromotionCampaignResponse) => {
      dispatch(hideLoading());
      if (data) {
        showSuccess("Cập nhật danh sách khuyến mại thành công");
        getPromotionCampaignDetail && getPromotionCampaignDetail();
      }
    },
    [dispatch, getPromotionCampaignDetail],
  );

  const handleUpdatePromotionItemList = useCallback(() => {
    try {
      if (!promotionCampaignDetail) {
        return;
      }
      if (!selectedRowKeys?.length) {
        showError("Vui lòng chọn khuyến mại!");
        return;
      }

      const body = {
        ...promotionCampaignDetail,
        price_rule_ids: selectedRowKeys,
      };

      dispatch(showLoading());
      dispatch(updatePromotionCampaignItemAction(promotionCampaignDetail.id, body, updateCallback));
    } catch (error: any) {
      dispatch(hideLoading());
      showError(error.message);
    }
  }, [dispatch, promotionCampaignDetail, selectedRowKeys, updateCallback]);
  /** end handle update promotion campaign */

  /** checking promotion list is changed */
  useEffect(() => {
    const isChanged = !compareNumberArray(originalSelectedRowKeys, selectedRowKeys);
    setIsPromotionSelectedListChanged(isChanged);
  }, [originalSelectedRowKeys, selectedRowKeys]);

  return (
    <PromotionSelectedListStyled>
      <Card
        title="DANH SÁCH KM ÁP DỤNG"
        extra={
          allowSetupPromotionCampaign && (
            <Button
              className="ant-btn-outline ant-btn-primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={onOpenPromotionListModal}
            >
              Thêm chương trình đã có
            </Button>
          )
        }
      >
        <CustomTable
          bordered
          locale={{
            emptyText: <EmptyDataTable />,
          }}
          rowKey={(item: any) => item.id}
          pagination={false}
          dataSource={promotionSelectedList}
          columns={columns}
        />

        {isPromotionSelectedListChanged && allowSetupPromotionCampaign && (
          <Button
            type="primary"
            onClick={handleUpdatePromotionItemList}
            style={{ float: "right", marginTop: "20px" }}
            disabled={selectedRowKeys?.length === 0}
          >
            Lưu
          </Button>
        )}
      </Card>

      {isVisiblePromotionListModal && (
        <PromotionsListModal
          visible={isVisiblePromotionListModal}
          onOkModal={onOkPromotionListModal}
          onCloseModal={onClosePromotionListModal}
        />
      )}
    </PromotionSelectedListStyled>
  );
}
export default PromotionSelectedList;
