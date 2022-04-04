import { Button, Card, Table, Input, Form, FormInstance } from "antd";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { FulfillmentsItemModel, GoodsReceiptsOrderListModel } from "model/pack/pack.model";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import search from "assets/img/search.svg";
import { StyledComponent } from "../../index.screen.styles";
import EditNote from "screens/order-online/component/edit-note";
// import { OrderModel } from "model/order/order.model";
import { useDispatch } from "react-redux";
import { updateOrderPartial } from "domain/actions/order/order.action";
import { formatCurrency } from "utils/AppUtils";
const { Item } = Form;
type PackListOrderProps = {
  packOrderList: GoodsReceiptsOrderListModel[];
  actions: Array<MenuAction>;
  handleSearchOrder: (item: any) => void;
  onMenuClick: (item: number) => void;
};
const PackListOrder: React.FC<PackListOrderProps> = (props: PackListOrderProps) => {
  const { packOrderList, actions, handleSearchOrder, onMenuClick } = props;
  const dispatch=useDispatch();
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

  const onSuccessEditNote = useCallback(
    (newNote, noteType, orderID) => {
      // const indexOrder = itemResult.findIndex((item: any) => item.id === orderID);
      // if (indexOrder > -1) {
      //   if (noteType === "note") {
      //     itemResult[indexOrder].note = newNote;
      //   } else if (noteType === "customer_note") {
      //     itemResult[indexOrder].customer_note = newNote;
      //   }
      // }
      // setItems(itemResult);
      //dataPackOrderList, setDataPackOrderList
      const dataPackOrderListCopy=[...dataPackOrderList]
      const indexOrder= dataPackOrderListCopy.findIndex((item)=>item.order_id===orderID);
      if(indexOrder!==-1)
      {
        if (noteType === "note")
        {
          dataPackOrderListCopy[indexOrder].note=newNote;
        }
        else if(noteType === "customer_note") {
          dataPackOrderListCopy[indexOrder].customer_note=newNote
        }
      }
      setDataPackOrderList([...dataPackOrderListCopy]);
    },
    [dataPackOrderList]
  );

  const editNote = useCallback(
    (newNote, noteType, orderID) => {
      let params: any = {};
      if (noteType === "note") {
        params.note = newNote;
      }
      if (noteType === "customer_note") {
        params.customer_note = newNote;
      }
      dispatch(
        updateOrderPartial(params, orderID, () => onSuccessEditNote(newNote, noteType, orderID, ))
      );
    },
    [dispatch, onSuccessEditNote]
  );

  useEffect(() => {
    if (packOrderList)
      setDataPackOrderList(packOrderList);
  }, [packOrderList]);

  const column: Array<ICustomTableColumType<GoodsReceiptsOrderListModel>> = [
    {
      title: "STT",
      dataIndex: "key",
      visible: true,
      width: "60px",
      align: "center",
      render: (value: number) => {
        return <div>{value + 1}</div>;
      },
    },
    {
      title: "ID đơn ",
      dataIndex: "order_code",
      visible: true,
      width: "130px",
      align: "center",
      render: (value: string) => {
        return (
          <React.Fragment>
            <Link target="_blank" to={`${UrlConfig.ORDER}/${value}`} style={{whiteSpace:"nowrap"}}>
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
      width: "200px",
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
                    <span>{formatCurrency(item.net_weight ? item.net_weight : 0)}</span>
                  </div>
                  <div className="quantity quantityWidth">
                    <span>{item.quantity ? item.quantity : 0}</span>
                  </div>
                  <div className="price priceWidth">
                    <span>{formatCurrency(item.price ? item.price : 0)}</span>
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
      width: "150",
      align: "center",
      render: (value: number) => {
        return <div>{formatCurrency(value)}</div>;
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "card_number",
      visible: true,
      width: "150",
      align: "center",
      render: (value: number) => {
        return <div>{formatCurrency(value)}</div>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "sub_status",
      visible: true,
      width: "150",
      align: "center",
      render: (value: any) => {
        return <div>{value}</div>;
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      visible: true,
      width: "150",
      align: "left",
      render: (value: string, record: GoodsReceiptsOrderListModel) => (
        <div className="orderNotes">
          <div className="inner">
            {/* <div className="single">
              <EditNote
                note={record.note}
                title="Khách hàng: "
                color={"#2a2a86"}
                onOk={(newNote) => {
                  editNote(newNote, "customer_note", record.order_id, record);
                }}
              // isDisable={record.status === OrderStatus.FINISHED}
              />
            </div> */}
            <div className="single">
              <EditNote
                note={record.note}
                title="Nội bộ: "
                color={"#2a2a86"}
                onOk={(newNote) => {
                  editNote(newNote, "note", record.order_id);
                }}
              // isDisable={record.status === OrderStatus.FINISHED}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <StyledComponent>
      <Card title="Danh sách đơn hàng trong biên bản" className="pack-card-orders">
        <div className="order-filter">
          <div className="page-filter">
            <div className="page-filter-heading">
              <div className="page-filter-left">
                <ActionButton menu={actions} onMenuClick={onMenuClick} />
              </div>
              <Form layout="inline" ref={formSearchOrderRef} onFinish={packOrderLists}
                className="page-filter-right"
                style={{ width: "40%", flexWrap: "nowrap", justifyContent: " flex-end" }}
              >
                <Item name="search_term" style={{ width: "100%", marginRight:"10px" }}>
                  <Input
                    style={{ width: "100%" }}
                    prefix={<img src={search} alt="" />}
                    placeholder="Mã đơn hàng"
                  />
                </Item>

                <Item style={{ width: "62px", marginRight: 0 }}>
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
        <Table
          dataSource={dataPackOrderList}
          scroll={{ x: 1500 }}
          columns={column}
          //pagination={false}
          bordered
        />
      </Card>
    </StyledComponent>
  );
};

export default PackListOrder;
