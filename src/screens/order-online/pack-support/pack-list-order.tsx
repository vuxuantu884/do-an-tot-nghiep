import {
  Button,
  Card,
  Space,
  Table,
  Input,
  Form,
  FormInstance,
} from "antd";
import ActionButton, {MenuAction} from "component/table/ActionButton";
import {ICustomTableColumType} from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {FulfillmentsItemModel, GoodsReceiptsOrderListModel} from "model/pack/pack.model";
import React, {createRef} from "react";
import {Link} from "react-router-dom";
import search from "assets/img/search.svg";
import {StyledComponent} from "../index.screen.styles";
const {Item} = Form;
type PackListOrderProps = {
  packOrderList: GoodsReceiptsOrderListModel[];
  actions: Array<MenuAction>;
  handleSearchOrder: (item: any) => void;
  onMenuClick: (item: number) => void;
};
const PackListOrder: React.FC<PackListOrderProps> = (props: PackListOrderProps) => {
  const {packOrderList, actions, handleSearchOrder, onMenuClick} = props;
  const formSearchOrderRef = createRef<FormInstance>();

  const column: Array<ICustomTableColumType<GoodsReceiptsOrderListModel>> = [
    {
      title: "STT",
      dataIndex: "key",
      visible: true,
      width: "3%",
      align: "center",
      render: (value: number) => {
        return <div>{value + 1}</div>;
      },
    },
    {
      title: "ID đơn ",
      dataIndex: "order_code",
      visible: true,
      width: "7%",
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
          <span className="quantity quantityWidth">
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
                  <div className="quantity quantityWidth">
                    <span>{item.net_weight?item.net_weight:0}</span>
                  </div>
                  <div className="quantity quantityWidth">
                    <span>{item.quantity?item.quantity:0}</span>
                  </div>
                  <div className="price priceWidth">
                    <span>{item.price?item.price:0}</span>
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
    // {
    //   title: "Sản phẩm",
    //   dataIndex: "product_sku",
    //   visible: true,
    //   width: "15%",
    //   render: (value: string, i: GoodsReceiptsOrderListModel) => {
    //     return (
    //       <React.Fragment>
    //         <div style={{padding: "5px 0"}}>
    //           <Link target="_blank" to={`${UrlConfig.ORDER}/${i.product_sku}`}>
    //             {value}
    //           </Link>
    //           <div style={{fontSize: "0.86em"}}>{i.product_name}</div>
    //         </div>
    //       </React.Fragment>
    //     );
    //   },
    // },
    // {
    //   title: "Khối lượng",
    //   dataIndex: "net_weight",
    //   visible: true,
    //   width: "8%",
    //   render: (value: number) => {
    //     return <div>{value}</div>;
    //   },
    // },
    // {
    //   title: "Số lượng",
    //   dataIndex: "total_quantity",
    //   visible: true,
    //   width: "8%",
    //   render: (value: number) => {
    //     return <div>{value}</div>;
    //   },
    // },
    // {
    //   title: "Giá",
    //   dataIndex: "total_price",
    //   visible: true,
    //   width: "8%",
    //   render: (value: number) => {
    //     return <div>{value}</div>;
    //   },
    // },
    {
      title: "Phí thu khách",
      dataIndex: "postage",
      visible: true,
      width: "8%",
      align:"center",
      render: (value: number) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "card_number",
      visible: true,
      width: "8%",
      align:"center",
      render: (value: number) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      visible: true,
      width: "10%",
      align:"center",
      render: (value: string) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      width: "20%",
      align:"left",
      render: (value: string) => {
        return <div>{value}</div>;
      },
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
    },
    onSelect: (record: any, selected: any, selectedRows: any) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected: any, selectedRows: any, changeRows: any) => {
      console.log(selected, selectedRows, changeRows);
    },
  };

  return (
    <StyledComponent>
      <Card title="Danh sách đơn hàng trong biên bản" className="pack-card">
        <div className="order-filter">
          <div className="page-filter row-padding">
            <div className="page-filter-heading">
              <div className="page-filter-left">
                <ActionButton menu={actions} onMenuClick={onMenuClick} />
              </div>
              <div className="page-filter-right" style={{width: "40%"}}>
                <Space size={4}>
                  <Form layout="inline" ref={formSearchOrderRef}>
                    <Item name="search_term" style={{width: "calc(98% - 62px)"}}>
                      <Input
                        style={{width: "100%"}}
                        prefix={<img src={search} alt="" />}
                        placeholder="ID Đơn hàng"
                      />
                    </Item>

                    <Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        onClick={handleSearchOrder}
                      >
                        Lọc
                      </Button>
                    </Item>
                  </Form>
                </Space>
              </div>
            </div>
          </div>
        </div>
        <Table
          dataSource={packOrderList}
          scroll={{x: 1388}}
          columns={column}
          rowSelection={rowSelection}
          //pagination={false}
          className="row-padding"
        />
      </Card>
    </StyledComponent>
  );
};

export default PackListOrder;
