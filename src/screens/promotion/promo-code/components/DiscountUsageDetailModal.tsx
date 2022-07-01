import React from "react";
import {Button, Modal} from "antd";
import {Link} from "react-router-dom";
import {DiscountUsageDetailResponse} from "model/promotion/price-rules.model";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import UrlConfig from "config/url.config";

type ModalDeleteConfirmProps = {
  visible: boolean;
  onCloseModal: () => void;
  discountUsageDetailList: Array<DiscountUsageDetailResponse>;
};

const DiscountUsageDetailModal: React.FC<ModalDeleteConfirmProps> = (props: ModalDeleteConfirmProps) => {
  const { visible, onCloseModal, discountUsageDetailList } = props;

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      align: "center",
      width: 70,
      render: (value: any, item: any, index: any) => {
        return (
          <div>{index + 1}</div>
        );
      },
    },
    {
      title: "Số điện thoại",
      dataIndex: "customer_phone",
      align: "left",
      width: 130,
      render: (value: string, item: any) => {
        return (
          <Link to={`${UrlConfig.CUSTOMER}/${item.customer_id}`} target="_blank">{value}</Link>
        );
      },
    },
    {
      title: "Tên khách hàng",
      dataIndex: "customer_name",
      align: "left",
      width: 180,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "order_code",
      align: "left",
      render: (value: string, item: any) => {
        return (
          <Link to={`${UrlConfig.ORDER}/${item.order_id}`} target="_blank">{value}</Link>
        );
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      width={600}
      title="DANH SÁCH KHÁCH HÀNG ĐÃ SỬ DỤNG MÃ"
      onCancel={onCloseModal}
      footer={[
        <Button key="close" type="primary" onClick={onCloseModal}>
          Đóng
        </Button>
      ]}
    >
      <div>
        <CustomTable
          bordered
          pagination={false}
          dataSource={discountUsageDetailList}
          columns={columns}
          rowKey={(item: any) => item.order_id}
        />
      </div>
    </Modal>
  );
};

export default DiscountUsageDetailModal;
