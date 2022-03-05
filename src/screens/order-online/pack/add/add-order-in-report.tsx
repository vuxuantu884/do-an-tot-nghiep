import { Card, Space, Table, Form, Input, Button, Tooltip } from "antd";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import search from "assets/img/search.svg";
import "component/filter/order.filter.scss";
import { createRef, useCallback, useContext, useEffect, useState } from "react";
import { FormInstance } from "antd/es/form/Form";
import { showWarning } from "utils/ToastUtils";
import { PackItemOrderModel } from "model/pack/pack.model";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import emptyProduct from "assets/icon/empty_products.svg";
import { OrderConcernGoodsReceiptsResponse } from "model/response/pack/pack.response";
import { AddReportHandOverContext } from "contexts/order-pack/add-report-hand-over-context";

type AddOrderInReportProps = {
  menu?: Array<MenuAction>;
  orderListResponse: Array<OrderConcernGoodsReceiptsResponse>;
  setOrderListResponse: (item: Array<OrderConcernGoodsReceiptsResponse>) => void;
  onMenuClick?: (index: number) => void;
  handleAddOrder: (code: string) => void;
};
const { Item } = Form;

const AddOrderInReport: React.FC<AddOrderInReportProps> = (
  props: AddOrderInReportProps
) => {
  const { menu, orderListResponse, handleAddOrder } = props;
  const formSearchOrderRef = createRef<FormInstance>();

  //const [orderResponse, setOrderResponse] = useState<OrderResponse>();
  const [packOrderProductList, setPackOrderProductList] =
    useState<PackItemOrderModel[]>();

  const addReportHandOverContextData = useContext(AddReportHandOverContext);
  // const orderListResponse= addReportHandOverContextData?.orderListResponse;
  const setOrderListResponse = addReportHandOverContextData?.setOrderListResponse;
  //
  const handleSearchOrder = useCallback(() => {
    formSearchOrderRef.current?.validateFields(["search_term"]);
    let search_term: any = formSearchOrderRef.current?.getFieldValue(["search_term"]);
    if (search_term) {
      formSearchOrderRef.current?.resetFields();
      handleAddOrder(search_term);
    }
    else {
      showWarning("Vui lòng nhập mã đơn hàng");
    }
  }, [formSearchOrderRef, handleAddOrder]);

  const onMenuClickExt = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          // orderListResponse.forEach(function(data,index){
          //   orderListResponse.splice(index, 1);
          // })
          setOrderListResponse([]);
          break;
        default:
          break;
      }
    },
    [setOrderListResponse]
  );

  useEffect(() => {
    if (orderListResponse.length > 0) {
      let _item: Array<PackItemOrderModel> = [];

      orderListResponse.forEach(function (order) {
        order.fulfillments.forEach(function (fulfillment) {
          fulfillment.items.forEach(function (item) {
            _item.push({
              id: order.id,
              code: order.code,
              receiver: order.customer,
              product: item.product,
              sku: item.sku,
              variant_id: item.variant_id,
              price: fulfillment.total,
              quantity: fulfillment.total_quantity,
              postage: 0,
              total_revenue: fulfillment.total,
            });
          });
        });
      });
      setPackOrderProductList(_item);
    }
  }, [orderListResponse]);

  const columns = [
    {
      title: "ID",

      render: (l: PackItemOrderModel, item: any, index: number) => {
        return (
          <Link target="_blank" to={`${UrlConfig.ORDER}/${l.id}`}>
            {l.code}
          </Link>
        );
      },
    },
    {
      title: "Người nhận",
      dataIndex: "receiver",
      key: "receiver",
    },
    {
      title: "Sản phẩm",
      render: (l: PackItemOrderModel, item: any, index: number) => {
        return (
          <div
            className="w-100"
            style={{
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="d-flex align-items-center">
              <div
                style={{
                  width: "calc(100% - 32px)",
                  float: "left",
                }}
              >
                <div className="yody-pos-sku">
                  <Link
                    target="_blank"
                    to={`${UrlConfig.PRODUCT}/${l.product}/variants/${l.variant_id}`}
                  >
                    {l.sku}
                  </Link>
                </div>
                <div className="yody-pos-varian">
                  <Tooltip title={l.product} className="yody-pos-varian-name">
                    <span>{l.product}</span>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Giá",
      key: "price",
      dataIndex: "price",
      // render: (tags: any) => (
      //   <>
      //     {tags.map((tag: any) => {
      //       let color = tag.length > 5 ? "geekblue" : "green";
      //       if (tag === "loser") {
      //         color = "volcano";
      //       }
      //       return (
      //         <Tag color={color} key={tag}>
      //           {tag.toUpperCase()}
      //         </Tag>
      //       );
      //     })}
      //   </>
      // ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Cước phí",
      dataIndex: "postage",
      key: "postage",
    },
    {
      title: "Tổng thu",
      dataIndex: "total_revenue",
      key: "total_revenue",
    },
  ];

  return (
    <Card title="Danh sách đơn hàng trong biên bản" className="pack-card">
      <div className="order-filter yody-pack-row">
        <div className="page-filter">
          <div className="page-filter-heading">
            <div className="page-filter-left">
              <ActionButton menu={menu} onMenuClick={onMenuClickExt} />
            </div>
            <div className="page-filter-right" style={{ width: "60%" }}>
              <Space size={4}>
                <Form layout="inline" ref={formSearchOrderRef}>
                  <Item name="search_term" style={{ width: "calc(95% - 142px)" }}>
                    <Input
                      style={{ width: "100%" }}
                      prefix={<img src={search} alt="" />}
                      placeholder="Mã đơn hàng"
                    />
                  </Item>

                  <Item style={{ width: "142px", marginLeft: 10, marginRight: 0 }}>
                    <Button type="primary" htmlType="submit" onClick={handleSearchOrder}>
                      Thêm đơn hàng
                    </Button>
                  </Item>
                </Form>
              </Space>
            </div>
          </div>
        </div>
      </div>
      {orderListResponse && orderListResponse.length > 0 && (
        <div className="yody-pack-row">
          <Table
            columns={columns}
            dataSource={packOrderProductList}
            key={Math.random()}
            locale={{
              emptyText: (
                <div className="sale_order_empty_product">
                  <img src={emptyProduct} alt="empty product"></img>
                  <p>Không có dữ liệu!</p>
                </div>
              ),
            }}
            
          />
        </div>

      )}
    </Card>
  );
};
export default AddOrderInReport;
