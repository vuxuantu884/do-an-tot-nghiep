import { Button, Card, Table, Input, Form, FormInstance } from "antd";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { FulfillmentsItemModel, GoodsReceiptsOrderListModel } from "model/pack/pack.model";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import search from "assets/img/search.svg";
import { StyledComponent } from "../../index.screen.styles";
const { Item } = Form;
type PackListOrderProps = {
  packOrderList: GoodsReceiptsOrderListModel[];
  actions: Array<MenuAction>;
  handleSearchOrder: (item: any) => void;
  onMenuClick: (item: number) => void;
};
const PackListOrder: React.FC<PackListOrderProps> = (props: PackListOrderProps) => {
  const { packOrderList, actions, handleSearchOrder, onMenuClick } = props;
  const formSearchOrderRef = createRef<FormInstance>();

  const [dataPackOrderList, setDataPackOrderList] = useState<GoodsReceiptsOrderListModel[]>([]);

  const packOrderLists = useCallback(
    (value: any) => {
      let query = value.search_term.trim();
      let newData: GoodsReceiptsOrderListModel[] = packOrderList.filter(function (el) {
        return el.order_code.toLowerCase().indexOf(query.toLowerCase()) !== -1
      })
      setDataPackOrderList(newData);
    },
    [packOrderList],
  )

  useEffect(() => {
    if (packOrderList)
      setDataPackOrderList(packOrderList);
  }, [packOrderList]);

  const column: Array<ICustomTableColumType<GoodsReceiptsOrderListModel>> = [
    {
      title: "STT",
      dataIndex: "key",
      visible: true,
      width: "5%",
      align: "center",
      render: (value: number) => {
        return <div>{value + 1}</div>;
      },
    },
    {
      title: "ID đơn ",
      dataIndex: "order_code",
      visible: true,
      width: "10%",
      align: "center",
      render: (value: string) => {
        return (
          <React.Fragment>
            <Link target="_blank" to={`${UrlConfig.ORDER}/${value}`}>
              {value}
            </Link>
          </React.Fragment>
        );
      },
    },
    {
      title: "Khách hàng",
      dataIndex: "customer_name",
      visible: true,
      width: "13%",
      render: (value: string) => {
        return <div>{value}</div>;
      },
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
      render: (items: Array<FulfillmentsItemModel>) => {
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
      width: "25%",
    },
    {
      title: "Phí thu khách",
      dataIndex: "postage",
      visible: true,
      width: "8%",
      align: "center",
      render: (value: number) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "card_number",
      visible: true,
      width: "8%",
      align: "center",
      render: (value: number) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Trạng thái",
      // dataIndex: "status",
      visible: true,
      width: "10%",
      align: "center",
      render: (item: any) => {
        return <div style={{ color: item.status_color }}>{item.status}</div>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      width: "20%",
      align: "left",
      render: (value: string) => {
        return <div>{value}</div>;
      },
    },
  ];

  return (
    <StyledComponent>
      <Card title="Danh sách đơn hàng trong biên bản" className="pack-card">
        <div className="order-filter">
          <div className="page-filter row-padding">
            <div className="page-filter-heading">
              <div className="page-filter-left">
                <ActionButton menu={actions} onMenuClick={onMenuClick} />
              </div>
              <div className="page-filter-right" style={{ width: "40%" }}>
                <Form layout="inline" ref={formSearchOrderRef} onFinish={packOrderLists}>
                  <Item name="search_term" style={{ width: "calc(92% - 62px)" }}>
                    <Input
                      style={{ width: "100%" }}
                      prefix={<img src={search} alt="" />}
                      placeholder="Mã đơn hàng"
                    />
                  </Item>

                  <Item style={{ width: "62px", marginLeft: 16, marginRight: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      onClick={handleSearchOrder}
                    >
                      Lọc
                    </Button>
                  </Item>
                </Form>
              </div>
            </div>
          </div>
        </div>
        <Table
          dataSource={dataPackOrderList}
          scroll={{ x: 1388 }}
          columns={column}
          //pagination={false}
          bordered
          className="row-padding"
        />
      </Card>
    </StyledComponent>
  );
};

export default PackListOrder;
