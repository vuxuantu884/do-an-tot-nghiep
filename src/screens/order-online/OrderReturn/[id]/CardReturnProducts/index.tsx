import { SearchOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Input, Table } from "antd";
import { RefSelectProps } from "antd/lib/select";
import emptyProduct from "assets/icon/empty_products.svg";
import { OrderLineItemResponse } from "model/response/order/order.response";
import { createRef } from "react";
import { StyledComponent } from "./styles";

type PropType = {
  listOrders: OrderLineItemResponse[];
};
function CardReturnProducts(props: PropType) {
  const { listOrders } = props;
  const autoCompleteRef = createRef<RefSelectProps>();
  const renderCardExtra = () => {
    return (
      <>
        <Checkbox style={{ marginLeft: 20 }} />
        Trả toàn bộ sản phẩm
      </>
    );
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      width: "40%",
    },
    {
      title: "Số lượng trả",
      dataIndex: "value",
      key: "value",
      width: "40%",
    },
    {
      title: "Giá hàng trả",
      width: "20%",
      render: (row: { key: string }) => {
        return <Button>222</Button>;
      },
    },
    {
      title: "Thành tiền",
      dataIndex: "value",
      key: "value",
      width: "40%",
    },
  ];

  return (
    <StyledComponent>
      <Card
        className="margin-top-20"
        title="Sản phẩm"
        extra={renderCardExtra()}
      >
        Sản phẩm:
        <Input
          size="middle"
          className="yody-search"
          placeholder="Tìm sản phẩm mã 7... (F3)"
          prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
        />
        <Table
          locale={{
            emptyText: (
              <div className="sale_order_empty_product">
                <img src={emptyProduct} alt="empty product"></img>
                <p>Đơn hàng của bạn chưa có sản phẩm nào!</p>
                <Button
                  type="text"
                  className="font-weight-500"
                  style={{
                    background: "rgba(42,42,134,0.05)",
                  }}
                  onClick={() => {
                    autoCompleteRef.current?.focus();
                  }}
                >
                  Thêm sản phẩm ngay (F3)
                </Button>
              </div>
            ),
          }}
          rowKey={(record: any) => record.id}
          columns={columns}
          dataSource={listOrders}
          className="w-100"
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: 300 }}
          sticky
          footer={() =>
            listOrders &&
            listOrders.length > 0 && (
              <div className="row-footer-custom">
                <div className="singleRow">
                  <p>Số lượng:</p>
                  <p>4:</p>
                </div>
                <div className="singleRow">
                  <p>Tổng tiền:</p>
                  <p>4:</p>
                </div>
                <div className="singleRow">
                  <p>Số lượng:</p>
                  <p>270.000</p>
                </div>
                <div className="singleRow">
                  <p>Phí ship báo khách:</p>
                  <p>20.000</p>
                </div>
                <div className="singleRow">
                  <p>Khách cần phải trả:</p>
                  <p>166.000</p>
                </div>
              </div>
            )
          }
        />
      </Card>
    </StyledComponent>
  );
}

export default CardReturnProducts;
