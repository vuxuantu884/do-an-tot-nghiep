import {
    Row,
    Col,
  } from "antd";
  import CustomTable from "component/table/CustomTable";
  import { ICustomTableColumType } from "component/table/CustomTable";
  import { OrderModel } from "model/order/order.model";
  import moment from "moment";

function CustomerHistoryInfo(props : any) {
  const { orderHistory } = props;


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
          // width: "20%",
          // render: (value, row, index) => {
          //   return <div style={{ width: 200 }}>{row.name}</div>;
          // },
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
                  <CustomTable
                    showColumnSetting={false}
                    pagination={false}
                    dataSource={orderHistory}
                    columns={columnFinalOrderHistory()}
                    rowKey={(item: OrderModel) => item.id}
                  />
                </Col>
              </Row>
    )
}

export default CustomerHistoryInfo
