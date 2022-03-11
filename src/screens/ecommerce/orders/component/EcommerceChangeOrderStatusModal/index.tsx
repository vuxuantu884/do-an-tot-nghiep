import React, { useEffect, useState } from "react";
import { Button, Modal } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { StyledModalFooterSingle } from "screens/ecommerce/common/commonStyle";
import { EcommerceOrderStatus } from "model/request/ecommerce.request";
import { ChangeOrderStatusErrorLine, ChangeOrderStatusErrorLineType } from "model/response/ecommerce/ecommerce.response";

import successIcon from 'assets/icon/success.svg';
import errorIcon from 'assets/icon/error.svg';

import "./styles.scss";

type EcommerceChangeStatusOrderType = {
  visible: EcommerceOrderStatus | null;
  statusList: Array<ChangeOrderStatusErrorLine>;
  onOk: () => void;
  onCancel: () => void;
};

const isSuccess = (item: ChangeOrderStatusErrorLine) => {
  return item.type === ChangeOrderStatusErrorLineType.SUCCESS
};

const EcommerceChangeStatusOrderModal: React.FC<EcommerceChangeStatusOrderType> = (
  props: EcommerceChangeStatusOrderType
) => {
  const { visible, onOk, onCancel, statusList } = props;
  const title = visible === EcommerceOrderStatus.PACKED ? "Tạo gói hàng Lazada" : visible === EcommerceOrderStatus.READY_TO_SHIP ? "Báo Lazada sẵn sàng giao" : "";
  const moduleName = visible === EcommerceOrderStatus.PACKED ? "tạo gói hàng Lazada" : visible === EcommerceOrderStatus.READY_TO_SHIP ? "báo Lazada sẵn sàng giao" : "";
  const numSuccess = statusList.filter(item => { return isSuccess(item) }).length;

  const [columns] = useState<Array<ICustomTableColumType<ChangeOrderStatusErrorLine>>>([
    {
      title: "STT",
      dataIndex: "",
      align: "center",
      width: "10%",
      render: (value: any, row: ChangeOrderStatusErrorLine, index: any) => {
        return <span className={isSuccess(row) ? "text-success" : "text-error"}>{index + 1}</span>;
      },
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "order_sn",
      width: "40%",
      render: (value: any, row: ChangeOrderStatusErrorLine) => {
        return <span className={isSuccess(row) ? "text-success" : "text-error"}>{value}</span>
      }
    },
    {
      title: "Chi tiết",
      dataIndex: "error_message",
      width: "60%",
      render: (value: any, row: ChangeOrderStatusErrorLine) => {
        return <span className={isSuccess(row) ? "text-success" : "text-error"}>{value}</span>
      }
    }
  ]);
  return (
    <Modal
      width="620px"
      centered
      visible={visible ? true : false}
      title={title}
      closable={true}
      onCancel={onCancel}
      maskClosable={false}
      footer={
        <StyledModalFooterSingle>
          <Button
            type="primary"
            onClick={onOk}
          >
            Xác nhận
          </Button>
        </StyledModalFooterSingle>
      }
      className="error-logs-modal"
    >
      <div className="error-logs-body">
        <div className="error-summary">
          <img src={successIcon} style={{ marginRight: '6px' }} alt="success" /><span>Có <span className="text-success">{numSuccess}</span> đơn hàng <span className="text-success">{moduleName}</span> thành công </span>
        </div>
        <div className="error-summary">
          <img src={errorIcon} style={{ marginRight: '6px' }} alt="success" /><span>Có <span className="text-error">{statusList.length - numSuccess}</span> đơn hàng <span className="text-error">{moduleName}</span> thất bại</span>
        </div>
        <CustomTable
          bordered
          pagination={false}
          dataSource={statusList}
          columns={columns}
          rowKey={(item: ChangeOrderStatusErrorLine) => item.order_sn}
          scroll={{ y: 400 }}
        />
      </div>
    </Modal>
  );
};

export default EcommerceChangeStatusOrderModal;
