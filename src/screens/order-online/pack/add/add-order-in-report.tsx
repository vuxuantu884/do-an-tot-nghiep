import { Card, Space, Table, Form, Input, Button } from "antd";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import search from "assets/img/search.svg";
import "component/filter/order.filter.scss";
import { createRef, useCallback, useMemo, useState } from "react";
import { FormInstance } from "antd/es/form/Form";
import { showWarning } from "utils/ToastUtils";
import { PackItemOrderModel } from "model/pack/pack.model";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import emptyProduct from "assets/icon/empty_products.svg";
import { OrderConcernGoodsReceiptsResponse } from "model/response/pack/pack.response";
import { ICustomTableColumType } from "component/table/CustomTable";
import {StyledComponent} from "../../scss/index.screen.styles";

type AddOrderInReportProps = {
  menu?: Array<MenuAction>;
  orderListResponse: Array<OrderConcernGoodsReceiptsResponse>;
  setOrderListResponse: (item: Array<OrderConcernGoodsReceiptsResponse>) => void;
  handleAddOrder: (code: string) => void;
};
const { Item } = Form;

const AddOrderInReport: React.FC<AddOrderInReportProps> = (
  props: AddOrderInReportProps
) => {
  const { menu, orderListResponse, setOrderListResponse, handleAddOrder } = props;
  const formSearchOrderRef = createRef<FormInstance>();

  const packOrderProductList = useMemo(() => {
    let _item: Array<any> = [];

    orderListResponse.forEach(function (order, index) {
      order.fulfillments.forEach(function (fulfillment) {
        _item.push({
          key: index,
          id: order.id,
          code: order.code,
          receiver: order.customer,
          items: fulfillment.items,
          price: fulfillment.total,
          postage: 0,
          total_revenue: fulfillment.total,
        });
      });
    });

    return _item
  }, [orderListResponse]);

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

  const [selectedRowCode, setSelectedRowCode] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: any) => {
      const keys = selectedRows.map((row: any) => row.key);
      const codes = selectedRows.map((row: any) => row.code);
      setSelectedRowKeys(keys);
      setSelectedRowCode(codes);
    }
  };

  const onMenuClickExt = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          if (selectedRowKeys.length === 0) {
            showWarning("Vui lòng chọn đơn hàng cần xóa");
            break;
          }
          const newOrderList = [...orderListResponse]
          selectedRowCode.forEach(orderCode => {
            const findIndex = newOrderList.findIndex(order => order.code === orderCode)
            newOrderList.splice(findIndex, 1)
          })
          setOrderListResponse(newOrderList);

          setSelectedRowKeys([]);
          break;
        default:
          break;
      }
    },
    [orderListResponse, selectedRowCode, selectedRowKeys.length, setOrderListResponse]
  );

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "ID",
      align: "center",
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
      align: "center",
      key: "receiver",
    },
    {
      title: (
        <div className="productNameQuantityHeader">
          <span className="productNameWidth">Sản phẩm</span>
          <span className="mass massWidth">
            <span>Khối lượng</span>
          </span>
          <span className="quantity quantityWidth">
            <span>Số lượng</span>
          </span>
          <span className="price priceWidth">
            <span>Giá</span>
          </span>
        </div>
      ),
      dataIndex: "items",
      key: "items",
      className: "productNameQuantity",
      render: (items: Array<any>) => {
        return (
          <div className="items">
            {items.map((item, i) => {
              return (
                <div className="item custom-td">
                  <div className="product productNameWidth">
                    <Link
                      target="_blank"
                      to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                    >
                      {item.variant}
                    </Link>
                  </div>
                  <div className="mass massWidth">
                    <span>{item.net_weight ? item.net_weight : 0}</span>
                  </div>
                  <div className="quantity quantityWidth">
                    <span>{item.quantity ? item.quantity : 0}</span>
                  </div>
                  <div className="price priceWidth">
                    <span>{item.price ? item.price : 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
      visible: true,
      align: "left",
      width: "40%",
    },
    // {
    //   title: "Cước phí",
    //   dataIndex: "postage",
    //   align: "center",
    //   key: "postage",
    // },
    {
      title: "Tổng thu",
      dataIndex: "total_revenue",
      align: "center",
      key: "total_revenue",
    },
  ];

  return (
    <StyledComponent>
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
              rowSelection={{
                type: "checkbox",
                ...rowSelection,
              }}
              columns={columns}
              dataSource={packOrderProductList}
              // key={Math.random()}
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
    </StyledComponent>
  );
};
export default AddOrderInReport;
