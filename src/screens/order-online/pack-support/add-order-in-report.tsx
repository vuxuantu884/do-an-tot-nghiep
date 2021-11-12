import {Card, Space, Table, Form, Input, Button, Tooltip} from "antd";
import ActionButton, {MenuAction} from "component/table/ActionButton";
import search from "assets/img/search.svg";
import "component/filter/order.filter.scss";
import { createRef, useCallback, useEffect, useState } from "react";
import { FormInstance } from "antd/es/form/Form";
import { getDetailOrder } from "domain/actions/order/order.action";
import { useDispatch } from "react-redux";
import { showError } from "utils/ToastUtils";
import { OrderResponse } from "model/response/order/order.response";
import { PackItemOrderModel } from "model/pack/pack.model";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import emptyProduct from "assets/icon/empty_products.svg";

type AddOrderInReportProps = {
  menu?: Array<MenuAction>;
  orderListResponse:Array<OrderResponse>;
  setOrderListResponse:(item:Array<OrderResponse>)=>void;
  onMenuClick?:(index:number)=>void;
};
const {Item} = Form;

const AddOrderInReport: React.FC<AddOrderInReportProps> = (
  props: AddOrderInReportProps
) => {
  const dispatch = useDispatch();
  const {menu,orderListResponse,setOrderListResponse,onMenuClick} = props;
  const formSearchOrderRef = createRef<FormInstance>();

  //const [orderResponse, setOrderResponse] = useState<OrderResponse>();
  const [packOrderProductList,setPackOrderProductList]=useState<PackItemOrderModel[]>();

  // const addReportHandOverContextData = useContext(AddReportHandOverContext);
  // const orderListResponse= addReportHandOverContextData?.orderListResponse;
  // const setOrderListResponse=addReportHandOverContextData?.setOrderListResponse;
  //
  const handleSearchOrder = useCallback(
    () => {
        formSearchOrderRef.current?.validateFields(["search_term"]);
        let search_term:any= formSearchOrderRef.current?.getFieldValue(["search_term"])
        if (search_term)
          dispatch(
            getDetailOrder(search_term, (data: OrderResponse) => {
              if (data) {
                let indexOrder=orderListResponse.findIndex((p)=>p.id===data.id);
                if(indexOrder!==-1)
                  orderListResponse.splice(indexOrder, 1);
                  
                orderListResponse.push(data);
                setOrderListResponse([...orderListResponse]);
                formSearchOrderRef.current?.resetFields();
              } else {
                showError("Đơn hàng chưa nhặt hàng");
              }
            })
          );
    },
    [dispatch, formSearchOrderRef,orderListResponse,setOrderListResponse]
  );

  const onMenuClickExt =useCallback((index: number)=>{
    switch (index){
      case 1:
        // orderListResponse.forEach(function(data,index){
        //   orderListResponse.splice(index, 1);
        // })
        setOrderListResponse([]);
        break;
      default:
        break;
    }
  },[setOrderListResponse]);
 
  useEffect(()=>{
    console.log("orderListResponse_Effect",orderListResponse);
    if(orderListResponse.length>0)
    {
      let _item:Array<PackItemOrderModel>=[];
     
      orderListResponse.forEach(function(order){

        order.items.forEach(function(product){
          _item.push(
            {
              id:order.id,
              code:order.code,
              receiver:order.customer,
              product:product.product,
              sku:product.sku,
              price:product.price,
              quantity:product.quantity,
              postage:0,
              total_revenue:order.total
            }
          )
        });
      });
      setPackOrderProductList(_item);
    }
  },[orderListResponse]);

  const columns = [
    {
      title: "ID",
 
      render:(l: PackItemOrderModel, item: any, index: number)=>{
        return(
          <Link
                    target="_blank"
                    to={`${UrlConfig.ORDER}/${l.id}`}
                  >
                    {l.sku}
                  </Link>
        )
      }
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
                    to={`${UrlConfig.PRODUCT}/${l.product}/variants/${l.product}`}
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
    <Card title="Danh sách đơn hàng trong biên bản">
      <div className="order-filter">
        <div className="page-filter">
          <div className="page-filter-heading">
            <div className="page-filter-left">
              <ActionButton
                menu={menu}
                onMenuClick={onMenuClickExt}
              />
            </div>
            <div className="page-filter-right" style={{width:"60%"}}>
              <Space size={4}>
                <Form layout="inline" ref={formSearchOrderRef} >
                  <Item name="search_term" style={{width:"calc(97% - 142px)"}}>
                    <Input
                      style={{width: "100%"}}
                      prefix={<img src={search} alt="" />}
                      placeholder="Tìm kiếm theo mã đơn giao, mã đơn hàng, tên người nhận, sđt người nhận"
                    />
                  </Item>

                  <Item>
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
      {orderListResponse&& orderListResponse.length>0 &&(
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
      )}
    </Card>
  );
};
export default AddOrderInReport;
