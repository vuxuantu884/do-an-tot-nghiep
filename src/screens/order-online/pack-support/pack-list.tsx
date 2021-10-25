import { Card, Table } from "antd";
import { ICustomTableColumType } from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { useEffect, useState } from "react";
import emptyProduct from "assets/icon/empty_products.svg";
import { setPackInfo } from "utils/LocalStorageUtils";

function PackList(props: any) {
  const { data, onPageChange, queryParams } = props;
  

  // const [dataCustom, setDataCustom] = useState<PageResponse<any>>({
  //   metadata: {
  //     limit: 1,
  //     page: 1,
  //     total: 0,
  //   },
  //   items: [],
  // });

  // useEffect(() => {
  //   if (data.items.length > 0 && queryParams) {
  //     let datas: PageResponse<any> = {
  //       metadata: {
  //         limit: 1,
  //         page: 1,
  //         total: 0,
  //       },
  //       items: [],
  //     };

  //     //let totalPage = Math.ceil(data.metadata.total / queryParams.limit);
  //     let index = (queryParams.page - 1) * queryParams.limit;

  //     for (let i = 0; i < queryParams.limit; i++) {
  //       let stt = index + i;
  //       if (stt <= data.items.length - 1) {
  //         datas.items.push(data.items[stt]);
  //       }
  //     }

  //     datas.metadata.total = Number(data.items.length);
  //     datas.metadata.page = queryParams.page;
  //     datas.metadata.limit = queryParams.limit;

  //     setDataCustom(datas);
  //   }
  // }, [data, queryParams]);

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
    >
      <div>
      <Table 
        columns={columnsOrderPack}
        dataSource={data.items} 
        locale={{
          emptyText: (
            <div className="sale_order_empty_product">
              <img src={emptyProduct} alt="empty product"></img>
              <p>Không có dữ liệu!</p>
            </div>
          ),
        }}
        className="ecommerce-order-list"
      />
        {/* <Table
          locale={{
            emptyText: (
              <div className="sale_order_empty_product">
                <img src={emptyProduct} alt="empty product"></img>
                <p>Không có dữ liệu!</p>
              </div>
            ),
          }}
          pagination={{
            //pageSize: 1,
            //total: dataCustom?.metadata.total,
            //current: dataCustom?.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          dataSource={dataCustom}
          columns={columnsOrderPack}
          rowKey={(item: any) => item.id}
          className="ecommerce-order-list"
          key={Math.random()}
        /> */}
      </div>
    </Card>
  );
}

export default PackList;
