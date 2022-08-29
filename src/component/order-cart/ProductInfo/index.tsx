import { Card, Row, Table } from "antd";
import { ColumnType } from "antd/lib/table";
import emptyProduct from "assets/icon/empty_products.svg";

import { StyledComponent } from "./styles";

type PropTypes = {
  listProducts: any[];
  totalDetail?: any | null;
};

function ProductInfo(props: PropTypes) {
  const { listProducts, totalDetail } = props;

  const columns: ColumnType<any>[] = [
    {
      title: "Sản phẩm",
      width: "30%",
      render: (record: any) => {
        return (
          <div>
            <div style={{ color: "#11006F" }}>{record?.sku}</div>
            <div>{record?.variant_name}</div>
          </div>
        );
      },
    },
    {
      title: () => (
        <div className="text-center">
          <div style={{ textAlign: "center" }}>Số lượng</div>
        </div>
      ),
      align: "center",
      className: "columnQuantity",
      width: "15%",
      render: (record: any) => {
        return <span>{record?.quantity}</span>;
      },
    },

    {
      title: () => (
        <div>
          <span style={{ color: "#222222" }}>Đơn giá</span>
          <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
        </div>
      ),
      align: "center",
      // width:"150px",
      width: "20%",
      className: "yody-table-discount text-right 32",
      render: (record: any) => {
        return <span>{record?.price}</span>;
      },
    },
    {
      title: () => (
        <div>
          <span style={{ color: "#222222" }}>Chiết khấu</span>
          {/* <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span> */}
        </div>
      ),
      align: "center",
      width: "15%",
      key: "total",
      render: (record: any) => {
        return (
          <div>
            <div>{record?.discount_value}</div>
            <div style={{ color: "#ff0000" }}>{record?.discount_rate}%</div>
          </div>
        );
      },
    },
    {
      title: () => (
        <div>
          <span style={{ color: "#222222" }}>Tổng tiền</span>
          <span style={{ color: "#808080", marginLeft: "6px", fontWeight: 400 }}>₫</span>
        </div>
      ),
      align: "right",
      key: "total",
      width: "20%",
      render: (record: any) => {
        return <span>{record?.amount}</span>;
      },
    },
  ];

  return (
    <StyledComponent>
      <Card title="SẢN PHẨM">
        <Table
          locale={{
            emptyText: (
              <div className="sale_order_empty_product">
                <img src={emptyProduct} alt="empty product"></img>
                <p>Chưa có sản phẩm!</p>
              </div>
            ),
          }}
          rowKey={(record: any) => record.id}
          columns={columns}
          dataSource={listProducts}
          className="w-100"
          tableLayout="fixed"
          pagination={false}
          sticky
        />
        <Row style={{ margin: "0px" }} className="boxPayment" gutter={24}>
          <span
            style={{ width: "30%", padding: "8px", fontWeight: "bold" }}
            className="font-size-text"
          >
            TỔNG:
          </span>

          <span
            style={{ width: "15%", textAlign: "center", padding: "8px" }}
            className="font-size-text"
          >
            {totalDetail?.total_quantity}
          </span>
          <span style={{ width: "20%", textAlign: "center", padding: "8px" }}>-</span>
          <span
            style={{ width: "15%", textAlign: "center", padding: "8px" }}
            className="font-size-text"
          >
            {totalDetail?.total_discount_value}
          </span>
          <span style={{ width: "20%", textAlign: "right", padding: "8px" }}>
            {totalDetail?.total_amount_values}
          </span>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default ProductInfo;
