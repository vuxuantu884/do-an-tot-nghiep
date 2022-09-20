import { Tooltip } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import { DailyRevenueTableModel, RevenueSearchQuery } from "model/revenue";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import CopyIcon from "../CopyIcon";
import { StyledComponent } from "./style";
import { COD, PaymentMethodCode, REVENUE_STATE } from "utils/Constants";

// import copyFileBtn from "assets/icon/copyfile_btn.svg";
// import iconWarranty from "assets/icon/icon-warranty-menu.svg";
import IconPaymentBank from "assets/icon/payment/chuyen-khoan.svg";
import IconPaymentCod from "assets/icon/payment/cod.svg";
import IconPaymentMOMO from "assets/icon/payment/momo.svg";
import IconPaymentQRCode from "assets/icon/payment/qr.svg";
import IconPaymentSwipeCard from "assets/icon/payment/quet-the.svg";
import IconPaymentReturn from "assets/icon/payment/tien-hoan.svg";
import IconPaymentCash from "assets/icon/payment/tien-mat.svg";
import IconPaymentVNPay from "assets/icon/payment/vnpay.svg";
// import IconPaymentPoint from "assets/icon/payment/YD Coin.svg";
import IconPaymentPointRefund from "assets/icon/payment/tien-doi.svg";
import { StoreResponse } from "model/core/store.model";
import EditNote from "screens/order-online/component/edit-note";
import { primaryColor } from "utils/global-styles/variables";
import { showSuccess } from "utils/ToastUtils";
import { dailyRevenueService } from "service/order/daily-revenue.service";

type Props = {
  params: RevenueSearchQuery;
  data: PageResponse<DailyRevenueTableModel>;
  setData: (v: PageResponse<DailyRevenueTableModel>) => void;
  setParams: (v: RevenueSearchQuery) => void;
  tableLoading?: boolean;
  stores: StoreResponse[];
  setSelectedRowKeys: (v: number[]) => void;
  selectedRowKeys: number[];
};

const copyIconSize = 18;
const dateFormat = DATE_FORMAT.DD_MM_YYYY;
const PAYMENT_ICON = [
  {
    payment_method_code: PaymentMethodCode.BANK_TRANSFER,
    icon: IconPaymentBank,
    tooltip: "Đã chuyển khoản",
  },
  {
    payment_method_code: PaymentMethodCode.QR_CODE,
    icon: IconPaymentQRCode,
    tooltip: "Mã QR",
  },
  {
    payment_method_code: PaymentMethodCode.CARD,
    icon: IconPaymentSwipeCard,
    tooltip: "Đã quẹt thẻ",
  },
  {
    payment_method_code: PaymentMethodCode.CASH,
    icon: IconPaymentCash,
    tooltip: "Tiền khách đưa",
  },
  {
    payment_method_code: COD.code,
    icon: IconPaymentCod,
    tooltip: "Thu người nhận",
  },
  {
    payment_method_code: PaymentMethodCode.POINT,
    icon: IconPaymentReturn,
    tooltip: "Tiêu điểm",
  },
  {
    payment_method_code: PaymentMethodCode.POINT_REFUND,
    icon: IconPaymentPointRefund,
    tooltip: "Tiêu hoàn",
  },
  {
    payment_method_code: PaymentMethodCode.MOMO,
    icon: IconPaymentMOMO,
    tooltip: "MOMO",
  },
  {
    payment_method_code: PaymentMethodCode.VN_PAY,
    icon: IconPaymentVNPay,
    tooltip: "VNPay",
  },
];

const NOTE_TYPE = {
  STORE_NOTE: "store_note",
  ACCOUNTANT_NOTE: "accountant_note",
};

let itemResult: DailyRevenueTableModel[] = [];

const DailyRevenueTableComponent: React.FC<Props> = (props: Props) => {
  const {
    params,
    data,
    setParams,
    tableLoading,
    stores,
    setData,
    setSelectedRowKeys,
    selectedRowKeys,
  } = props;
  const history = useHistory();
  const [columns, setColumns] = useState<Array<ICustomTableColumType<DailyRevenueTableModel>>>([]);

  itemResult = data.items;

  const renderPaymentIconInfo = (paymentMethodCode: string, payment?: number | null) => {
    const paymentIcon = PAYMENT_ICON.find((p) => p.payment_method_code === paymentMethodCode);
    if (!payment) {
      return null;
    }
    return (
      <div>
        <Tooltip title={paymentIcon?.tooltip} className="revenue-payment">
          <img src={paymentIcon?.icon} alt="" />
          <span className="amount">{formatCurrency(payment || 0)}</span>
        </Tooltip>
      </div>
    );
  };

  const onSuccessEditNote = useCallback(
    (note, noteType, id) => {
      showSuccess(`${id} Cập nhật ghi chú thành công`);

      const indexOrder = itemResult.findIndex((item: any) => item.id === id);
      if (indexOrder > -1) {
        if (noteType === NOTE_TYPE.STORE_NOTE) itemResult[indexOrder].store_note = note;

        if (noteType === NOTE_TYPE.ACCOUNTANT_NOTE) itemResult[indexOrder].accountant_note = note;
      }
      setData({
        ...data,
        items: itemResult,
      });
    },
    [data, setData],
  );

  const editNote = useCallback(
    (note, noteType, record: DailyRevenueTableModel) => {
      if (noteType === NOTE_TYPE.STORE_NOTE) {
        dailyRevenueService.editStoreNote(record.id, note).then((response) => {
          onSuccessEditNote(note, NOTE_TYPE.STORE_NOTE, record.id);
        });
      }
      if (noteType === NOTE_TYPE.ACCOUNTANT_NOTE) {
        dailyRevenueService.editAccountantNote(record.id, note).then((response) => {
          onSuccessEditNote(note, NOTE_TYPE.ACCOUNTANT_NOTE, record.id);
        });
      }
    },
    [onSuccessEditNote],
  );

  const initColumns: Array<ICustomTableColumType<DailyRevenueTableModel>> = useMemo(
    () => [
      {
        title: "ID phiếu",
        dataIndex: "id",
        key: "id",
        width: "120px",
        visible: true,
        render: (value, i: DailyRevenueTableModel) => {
          const storeName = stores.find((p) => p.id === i.store_id)?.name;
          return (
            <React.Fragment>
              <div className="noWrap">
                <Link
                  to={`${UrlConfig.DAILY_REVENUE}/${i.id}`}
                  title="Chi tiết phiếu"
                  className="revenueCode"
                >
                  {i.id}
                </Link>
                <span title="Click để copy">
                  <CopyIcon
                    copiedText={i.id.toString()}
                    informationText="Đã copy mã phiếu!"
                    size={copyIconSize}
                  />
                </span>
              </div>
              {i.date && (
                <div className="textSmall" title="Ngày tạo phiếu">
                  {moment(i.date).format(dateFormat)}
                </div>
              )}
              <Link to={`${UrlConfig.STORE}/${i.store_id}`} title="Cửa hàng" className="storeName">
                {storeName}
              </Link>
              {i.opened_by ? (
                <div className="textSmall single mainColor">
                  <Link to={`${UrlConfig.ACCOUNTS}/${i.opened_by}`}>
                    <strong>NV nộp tiền: </strong>
                    {i.opened_by}
                  </Link>
                </div>
              ) : (
                <div className="textSmall single mainColor">
                  <strong>NV nộp tiền: </strong>
                  <span>N/a</span>
                </div>
              )}
              {i.closed_by ? (
                <div className="textSmall single mainColor">
                  <Link to={``}>
                    <strong>Kế toán: </strong>
                    {i.closed_by}
                  </Link>
                </div>
              ) : (
                <div className="textSmall single mainColor">
                  <strong>Kế toán:</strong>
                  <span> N/a</span>
                </div>
              )}
            </React.Fragment>
          );
        },
      },
      {
        title: "Doanh thu",
        dataIndex: "payment",
        key: "payment",
        width: "120px",
        visible: true,
        align: "right",
        render: (value, i: DailyRevenueTableModel) => {
          return (
            <React.Fragment>
              <div className="noWrap singlePayment">
                <div className="total-payment mainColor" title="Tổng tiền">
                  {formatCurrency(i.total_payment || 0)}
                </div>
                {renderPaymentIconInfo(PaymentMethodCode.VN_PAY, i.vnpay_payment)}
                {renderPaymentIconInfo(PaymentMethodCode.MOMO, i.momo_payment)}
                {renderPaymentIconInfo(PaymentMethodCode.BANK_TRANSFER, i.transfer_payment)}
                {renderPaymentIconInfo(PaymentMethodCode.CARD, i.card_payment)}
                {renderPaymentIconInfo(PaymentMethodCode.CASH, i.cash_payment)}
                {renderPaymentIconInfo(PaymentMethodCode.POINT, 0)}
                {renderPaymentIconInfo(PaymentMethodCode.POINT_REFUND, 0)}
                {renderPaymentIconInfo(PaymentMethodCode.COD, 0)}
                {renderPaymentIconInfo(PaymentMethodCode.QR_CODE, i.qrpay_payment)}
              </div>
            </React.Fragment>
          );
        },
      },
      {
        title: "Chi phí",
        dataIndex: "other_cost",
        key: "other_cost",
        width: "120px",
        visible: true,
        align: "right",
        className: "total-cost",
        render: (value, i: DailyRevenueTableModel) => (
          <React.Fragment>{formatCurrency(value || 0)}</React.Fragment>
        ),
      },
      {
        title: "Phụ thu",
        dataIndex: "other_payment",
        key: "other_payment",
        width: "120px",
        visible: true,
        align: "right",
        className: "other-payment",
        render: (value, i: DailyRevenueTableModel) => (
          <React.Fragment>{formatCurrency(value || 0)}</React.Fragment>
        ),
      },
      {
        title: "Tổng phải nộp",
        dataIndex: "amount",
        key: "amount",
        width: "120px",
        visible: true,
        align: "right",
        className: "amount",
        render: (value, i: DailyRevenueTableModel) => (
          <React.Fragment>{formatCurrency(value || 0)}</React.Fragment>
        ),
      },
      {
        title: "Còn phải nộp",
        dataIndex: "remaining_amount",
        key: "remaining_amount",
        width: "120px",
        visible: true,
        align: "right",
        className: "remaining-amount",
        render: (value, i: DailyRevenueTableModel) => (
          <React.Fragment>{formatCurrency(value || 0)}</React.Fragment>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "state",
        key: "state",
        width: "120px",
        visible: true,
        align: "center",
        className: "revenue-states",
        render: (value, i: DailyRevenueTableModel) => {
          return <div className={value}>{REVENUE_STATE.find((p) => p.code === value)?.name}</div>;
        },
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        key: "note",
        width: "200px",
        visible: true,
        align: "left",
        className: "revenueNotes",
        render: (value, i: DailyRevenueTableModel) => {
          return (
            <div className="inner">
              <div className="single">
                <EditNote
                  note={i.store_note}
                  title="Cửa hàng: "
                  color={primaryColor}
                  onOk={(values) => {
                    editNote(values, NOTE_TYPE.STORE_NOTE, i);
                  }}
                />
              </div>
              <div className="single">
                <EditNote
                  note={i.accountant_note}
                  title="Kế toán: "
                  color={primaryColor}
                  onOk={(values) => {
                    editNote(values, NOTE_TYPE.ACCOUNTANT_NOTE, i);
                  }}
                />
              </div>
            </div>
          );
        },
      },
    ],
    [editNote, stores],
  );

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  // const rowSelectionRenderCell = (
  //   checked: boolean,
  //   record: any,
  //   index: number,
  //   originNode: ReactNode,
  // ) => {
  //   return (
  //     <React.Fragment>
  //       <div className="actionButton">{originNode}</div>
  //     </React.Fragment>
  //   );
  // };

  const onSelectedChange = useCallback(
    (_: any[], selected?: boolean, changeRow?: any[]) => {
      let selectedRowKeysCopy: number[] = [...selectedRowKeys];
      if (selected === true) {
        changeRow?.forEach((row, index) => {
          let indexItem = selectedRowKeys.findIndex((p) => p === row.id);
          if (indexItem === -1) {
            selectedRowKeysCopy.push(row.id);
          }
        });
      } else {
        selectedRowKeys.forEach((row, index) => {
          let indexItemKey = changeRow?.findIndex((p) => p.id === row);
          if (indexItemKey !== -1) {
            let i = selectedRowKeysCopy.findIndex((p) => p === row);
            selectedRowKeysCopy.splice(i, 1);
          }
        });
      }
      setSelectedRowKeys(selectedRowKeysCopy);
    },
    [selectedRowKeys, setSelectedRowKeys],
  );

  const onPageChange = useCallback(
    (page, size) => {
      const paramsCopy: RevenueSearchQuery = { ...params };
      paramsCopy.page = Number(page);
      paramsCopy.limit = Number(size);

      let queryParam = generateQuery(paramsCopy);
      setParams(paramsCopy);
      history.push(`${UrlConfig.DAILY_REVENUE}?${queryParam}`);
    },
    [history, params, setParams],
  );

  useEffect(() => {
    setColumns(initColumns);
  }, [columns, initColumns, setColumns]);

  return (
    <React.Fragment>
      <StyledComponent>
        <CustomTable
          bordered
          scroll={{
            x: (1420 * columnFinal.length) / (columns.length ? columns.length : 1),
          }}
          sticky={{ offsetScroll: 5, offsetHeader: 55 }}
          isLoading={tableLoading}
          showColumnSetting={true}
          dataSource={data.items}
          columns={columnFinal}
          isShowPaginationAtHeader
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          onSelectedChange={(selectedRows: any[], selected?: boolean, changeRow?: any[]) =>
            onSelectedChange(selectedRows, selected, changeRow)
          }
          //rowSelectionRenderCell={rowSelectionRenderCell}
          selectedRowKey={selectedRowKeys}
          isRowSelection
          rowKey={(item: DailyRevenueTableModel) => item.id}
        />
      </StyledComponent>
    </React.Fragment>
  );
};

export default DailyRevenueTableComponent;
