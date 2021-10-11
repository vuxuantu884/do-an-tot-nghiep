import { Card, Table } from "antd";
import { ICustomTableColumType } from "component/table/CustomTable";

function PackList(props: any) {
  const { data, onPageChange,tableLoading } = props;
  

  const columnsOrderPack: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      dataIndex: "",
      align: "center",
      visible: true,
      width: "10%",
      render: (value: any, row: any, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Đơn hàng",
      dataIndex: "code",
      visible: true,
      render: (value: any, row: any, index: any) => {
        let href = `https://dev.yody.io/unicorn/admin/orders/${row.order_id}`;
        return (
          <a target="blank" href={href}>
            {row.code}
          </a>
        );
      },
    },
    {
      title: "Hãng vận chuyển",
      visible: true,
      render: (value, row, index) => {
        return <div>{row.shipment}</div>;
      },
    },
    {
      title: "Khách hàng",
      visible: true,
      render: (value, row, index) => {
        return <div>{row.customer}</div>;
      },
    },
    {
      title: "Sản phẩm",
      visible: true,
      render: (value, row, index) => {
        return <div>{row.items?.length}</div>;
      },
    },
  ];

  return (
    <Card
      title="Đơn đã đóng gói "
      bordered={false}
      style={{ marginTop: "24px" }}
    >
      <div style={{ padding: "24px" }}>
        <Table
          pagination={{
            pageSize: data?.metadata.limit,
            total: data?.metadata.total,
            current: data?.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          dataSource={data?.items.reverse()}
          columns={columnsOrderPack}
          rowKey={(item: any) => item.id}
          //loading={tableLoading}
          className="ecommerce-order-list"
          key={Math.random()}
        />
      </div>
    </Card>
  );
}

export default PackList;
