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

type PropTypes = {
  dailyRevenueDetail: DailyRevenueDetailModel | undefined;
  handleUpdateDailyRevenueDetail: () => void;
  visibleCardElement: DailyRevenueVisibleCardElementModel;
  permissions: DaiLyRevenuePermissionModel;
};

function ShopRevenueCard(props: PropTypes) {
  const { handleUpdateDailyRevenueDetail, dailyRevenueDetail, visibleCardElement, permissions } =
    props;

  const dateFormat = DATE_FORMAT.DDMMYY_HHmm;

  const items: ShopRevenueModel[] = dailyRevenueDetail
    ? [
        {
          card_payment: dailyRevenueDetail.card_payment,
          cash_payment: dailyRevenueDetail.cash_payment,
          transfer_payment: dailyRevenueDetail.transfer_payment,
          vnpay_payment: dailyRevenueDetail.vnpay_payment,
          spos_payment: dailyRevenueDetail.spos_payment,
          mpos_payment: dailyRevenueDetail.mpos_payment,
          momo_payment: dailyRevenueDetail.momo_payment,
          other_payment: dailyRevenueDetail.other_payment,
          qrpay_payment: dailyRevenueDetail.qrpay_payment,
        },
      ]
    : [];

  const totalShopRevenueAmount = dailyRevenueDetail?.total_revenue || 0;

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
      dataIndex: "cash_payment",
      key: "cash_payment",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },
    {
      title: " QR Momo",
      dataIndex: "momo_payment",
      key: "momo_payment",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
    },
    {
      title: "QR VNPay",
      dataIndex: "vnpay_payment",
      key: "vnpay_payment",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },
    {
      title: "Chuyển khoản",
      dataIndex: "transfer_payment",
      key: "transfer_payment",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },

    {
      title: "Quẹt thẻ",
      dataIndex: "card_payment",
      key: "card_payment",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },
    {
      title: "MPOS",
      dataIndex: "mpos_payment",
      key: "mpos_payment",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: false,
      align: "right",
    },
    {
      title: "SPOS",
      dataIndex: "spos_payment",
      key: "spos_payment",
      render: (value: string) => {
        return <span className="noWrap">{formatCurrency(value)}</span>;
      },
      visible: false,
      align: "right",
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
          rowKey={(item: ShopRevenueModel) => item.card_payment}
        />
      </RevenueReceiptCard>
    </StyledComponent>
  );
}

export default ShopRevenueCard;
