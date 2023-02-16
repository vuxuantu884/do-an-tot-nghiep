import React, { Fragment, ReactElement, ReactNode, useCallback, useContext, useMemo } from "react";
import {
  Button,
  Card,
} from "antd";
import { cloneDeep } from "lodash";
import { DISCOUNT_STATUS, PROMOTION_TYPE } from "screens/promotion/constants";
import { Link } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { PromotionCampaignContext } from "screens/promotion/campaign/components/PromotionCampaignProvider";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import DatePromotionColumn from "screens/promotion/shared/date-column";
import { EmptyDataTable } from "screens/promotion/campaign/components/EmptyDataTable";
import { PromotionSelectedListStyled, RemovePromotionColumnStyled } from "screens/promotion/campaign/campaign.style";
import closeIcon from "assets/icon/X_close.svg";

interface Props {
  isEdit?: boolean;
  onOpenPromotionListModal?: () => void;
}

function PromotionSelectedList({
  isEdit,
  onOpenPromotionListModal,
}: Props): ReactElement {
  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const {
    setTempPromotionSelectedList,
    setTempSelectedRowKeys,
    promotionSelectedList,
    setPromotionSelectedList,
    selectedRowKeys,
    setSelectedRowKeys,
  } = promotionCampaignContext;

  const handleRemovePromotion = useCallback(
    (item: any) => {
      const _promotionSelectedList = cloneDeep(promotionSelectedList);
      const _selectedRowKeys = cloneDeep(selectedRowKeys);
      const rowKeysChange = item ? [item.id] : [];

      const newPromotionSelectedList = _promotionSelectedList.filter(
        (itemSelected: any) => !rowKeysChange.includes(itemSelected.id)
      );
      setPromotionSelectedList(newPromotionSelectedList);
      setTempPromotionSelectedList(newPromotionSelectedList);
      
      const newSelectedRowKeys = _selectedRowKeys.filter(
        (rowKey: any) => !rowKeysChange.includes(rowKey)
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
      setTempSelectedRowKeys
    ]
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
          return <Link
              to={promotionDetailUrl}
              style={{ color: "#2A2A86", fontWeight: 500 }}
              target="_blank"
            >
              {item.code}
            </Link>
        },
      },
      {
        title: "Tên chương trình",
        render: (item: any) => (
          <div>{item.title}</div>
        ),
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
        render: (item: any) => (
          <div>{`${item.created_by} - ${item.created_name}`}</div>
        ),
      },
      {
        title: "Người duyệt",
        align: "center",
        render: (item: any) => {
          return (
            <>
              {(item.activated_by || item.activated_name) ?
                <div>{`${item.activated_by || ""} - ${item.activated_name || ""}`}</div>
                : <></>
              }
            </>
          );
        },
      },
      {
        title: "Đăng ký BCT",
        align: "center",
        width: "140px",
        render: (item: any) => (
          <div>
            {item.is_registered ?
              <span>Đã đăng ký</span>
              :
              <span>Chưa đăng ký</span>
            }
          </div>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "state",
        align: "center",
        width: "140px",
        render: (state: string) => {
          const StatusTag: ReactNode = DISCOUNT_STATUS.find((e: any) => e.code === state)?.Component ?? (
            <Fragment />
          );
          return StatusTag;
        },
      },
    ];
    
    if (isEdit) {
      return [
        ...defaultColumns,
        {
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
        },
      ]
    } else {
      return defaultColumns;
    }
  }, [handleRemovePromotion, isEdit])

  return (
    <PromotionSelectedListStyled>
      <Card
        title="DANH SÁCH CTKM ÁP DỤNG"
        extra={isEdit &&
          <Button
            className="ant-btn-outline ant-btn-primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onOpenPromotionListModal}
          >
            Thêm chương trình đã có
          </Button>
        }
      >
        <CustomTable
          bordered
          locale={{
            emptyText: <EmptyDataTable />
          }}
          rowKey={(item: any) => item.id}
          pagination={false}
          dataSource={promotionSelectedList}
          columns={columns}
        />
      </Card>
    </PromotionSelectedListStyled>
  );
}
export default PromotionSelectedList;
