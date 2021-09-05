import { Row, Col, Tag, Table } from "antd";
import { ICustomTableColumType } from "component/table/CustomTable";
import { OrderModel } from "model/order/order.model";
import moment from "moment";

function CustomerHistoryInfo(props: any) {
  const { orderHistory, metaData, onPageChange } = props;

  const status_order = [
    {
      name: "Nháp",
      value: "draft",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đóng gói",
      value: "packed",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Xuất kho",
      value: "shipping",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đã xác nhận",
      value: "finalized",
      color: "#FCAF17",
      background: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Hoàn thành",
      value: "completed",
      color: "#27AE60",
      background: "rgba(39, 174, 96, 0.1)",
    },
    {
      name: "Kết thúc",
      value: "finished",
      color: "#27AE60",
      background: "rgba(39, 174, 96, 0.1)",
    },
    {
      name: "Đã huỷ",
      value: "cancelled",
      color: "#ae2727",
      background: "rgba(223, 162, 162, 0.1)",
    },
    {
      name: "Đã hết hạn",
      value: "expired",
      color: "#ae2727",
      background: "rgba(230, 171, 171, 0.1)",
    },
  ];
  const columnsHistory: Array<ICustomTableColumType<OrderModel>> = [
    {
      title: "STT",
      dataIndex: "",
      align: "center",
      visible: true,
      width: "5%",
      render: (value, row, index) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      visible: true,
      // width: "20%",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      visible: true,
      align: "center",
      render: (value: any, row: any, index: any) => {
        const statusTag = status_order.find(
          (status) => status.value === row.status
        );
        return (
          <div>
            <Tag
              style={{
                color: `${statusTag?.color}`,
                backgroundColor: `${statusTag?.background}`,
                width: 100,
                borderRadius: 100,
              }}
            >
              {statusTag?.name}
            </Tag>
          </div>
        );
      },
    },

    {
      title: "Sản phẩm",
      visible: true,
      render: (value, row, index) => {
        return <div>{row.items.length}</div>;
      },
    },

    {
      title: "Giá trị",
      dataIndex: "total_line_amount_after_line_discount",
      visible: true,
      // width: "20%",
    },
    {
      title: "Cửa hàng",
      dataIndex: "store",
      visible: true,
    },
    {
      title: "Nhân viên phụ trách",
      dataIndex: "assignee",
      visible: true,
    },
    {
      title: "Ngày đặt hàng",
      render: (value, row, index) => {
        return (
          <div>{moment(row.created_date).format("DD/MM/YYYY HH:mm:ss")}</div>
        );
      },
      visible: true,
    },
  ];

  const columnFinalOrderHistory = () =>
    columnsHistory.filter((item) => item.visible === true);

  return (
    <Row style={{ marginTop: 16 }}>
      <Col span={24}>
        <Table
          pagination={{
            pageSize: metaData?.limit,
            total: metaData?.total,
            current: metaData?.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          dataSource={orderHistory}
          columns={columnFinalOrderHistory()}
          rowKey={(item: OrderModel) => item.id}
        />
      </Col>
    </Row>
  );
}

export default CustomerHistoryInfo;
