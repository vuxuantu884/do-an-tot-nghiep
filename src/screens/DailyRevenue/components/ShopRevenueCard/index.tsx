import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import {
  DailyRevenueDetailModel,
  DaiLyRevenuePermissionModel,
  DailyRevenueVisibleCardElementModel,
  ShopRevenueModel,
} from "model/order/daily-revenue.model";
import moment from "moment";
import React from "react";
import RevenueReceiptCard from "screens/DailyRevenue/components/DailyRevenueCard";
import { formatCurrency } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import RefreshIcon from "./images/refreshIcon.svg";
import ShopRevenueIcon from "./images/shopRevenueIcon.svg";
import { StyledComponent } from "./styles";

type Props = {
  dailyRevenueDetail: DailyRevenueDetailModel | undefined;
  shopRevenueModel: ShopRevenueModel | undefined;
  handleUpdateDailyRevenueDetail: () => void;
  visibleCardElement: DailyRevenueVisibleCardElementModel;
  permissions: DaiLyRevenuePermissionModel;
};

function ShopRevenueCard(props: Props) {
  const {
    handleUpdateDailyRevenueDetail,
    shopRevenueModel,
    dailyRevenueDetail,
    visibleCardElement,
    permissions,
  } = props;

  const dateFormat = DATE_FORMAT.DDMMYY_HHmm;

  const items: ShopRevenueModel[] = shopRevenueModel ? [shopRevenueModel] : [];

  const totalShopRevenueAmount = shopRevenueModel ? shopRevenueModel.total_revenue : 0;

  console.log("items", items);

  const shopRevenueCardBottomLeft = (
    <span>
      Tổng doanh thu: <strong>{formatCurrency(totalShopRevenueAmount)}</strong>
    </span>
  );

  const shopRevenueCardBottomRightButtonText = () => {
    if (permissions.allowDailyPaymentsUpdate) {
      return (
        <React.Fragment>
          <img src={RefreshIcon} alt="" />
          Cập nhật
        </React.Fragment>
      );
    }
  };

  const shopRevenueCardBottomRightText = (
    <React.Fragment>
      Cập nhật lần cuối: {moment(dailyRevenueDetail?.updated_at).format(dateFormat)}
    </React.Fragment>
  );

  const columnFinal: Array<ICustomTableColumType<ShopRevenueModel>> = [
    {
      title: "Tiền mặt",
      dataIndex: "cash_payments",
      key: "cash_payments",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
    },
    {
      title: "QR VNpay",
      dataIndex: "vnpay_payments",
      key: "vnpay_payments",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
    },
    {
      title: "QR Momo",
      dataIndex: "momo_payments",
      key: "momo_payments",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },
    {
      title: "QR VCB",
      dataIndex: "vcb_payments",
      key: "vcb_payments",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },
    {
      title: "Chuyển khoản",
      dataIndex: "transfer_payments",
      key: "transfer_payments",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },

    {
      title: "Quẹt thẻ",
      dataIndex: "card_payments",
      key: "card_payments",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },
    {
      title: "Thanh toán khác",
      dataIndex: "unknown_payments",
      key: "unknown_payments",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },
  ];

  return (
    <StyledComponent>
      <RevenueReceiptCard
        title="Doanh thu cửa hàng"
        cardBottomLeft={shopRevenueCardBottomLeft}
        iconUrl={ShopRevenueIcon}
        cardBottomRightButtonText={
          visibleCardElement.revenueCard.updateButton && shopRevenueCardBottomRightButtonText()
        }
        cardBottomRightText={
          visibleCardElement.revenueCard.updateButton && shopRevenueCardBottomRightText
        }
        handleCardBottomRightButtonClick={handleUpdateDailyRevenueDetail}
      >
        <CustomTable
          showColumnSetting={false}
          dataSource={items}
          columns={columnFinal.filter((column) => column.visible)}
          pagination={false}
          rowKey={(item: ShopRevenueModel) => item.card_payments}
        />
      </RevenueReceiptCard>
    </StyledComponent>
  );
}

export default ShopRevenueCard;
