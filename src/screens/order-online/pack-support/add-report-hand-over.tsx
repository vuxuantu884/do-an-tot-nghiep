// type AddReportHandOverProps={
import { DeleteOutlined } from "@ant-design/icons";
import {Row, Col, Select, Form, Card} from "antd";
import ContentContainer from "component/container/content.container";
import { MenuAction } from "component/table/ActionButton";
import UrlConfig from "config/url.config";
import {AddReportHandOverContext} from "contexts/order-pack/add-report-hand-over-context";
import {StoreGetListAction} from "domain/actions/core/store.action";
import { createGoodsReceipts, getGoodsReceiptsType, getOrderConcernGoodsReceipts } from "domain/actions/goods-receipts/goods-receipts.action";
import { DeliveryServicesGetList, getChannels } from "domain/actions/order/order.action";
import {StoreResponse} from "model/core/store.model";
import {RootReducerType} from "model/reducers/RootReducerType";
import {ChannelsResponse, DeliveryServiceResponse} from "model/response/order/order.response";
import { GoodsReceiptsResponse, GoodsReceiptsTypeResponse, OrderConcernGoodsReceiptsResponse } from "model/response/pack/pack.response";
import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {haveAccess} from "utils/AppUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import AddOrderBottombar from "./add-order-bottombar";
import AddOrderInReport from "./add-order-in-report";
import "assets/css/_pack.scss";
import { useHistory } from "react-router";

var barcode = "";
// }
const AddReportHandOver: React.FC<any> = (props: any) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [goodsReceiptsForm] = Form.useForm();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
  const [orderListResponse, setOrderListResponse] = useState<OrderConcernGoodsReceiptsResponse[]>([]);

  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<DeliveryServiceResponse[]>([]);
  const [listGoodsReceiptsType,setListGoodsReceiptsType] =useState<Array<GoodsReceiptsTypeResponse>>([]);
  const [listChannels,setListChannels]= useState<Array<ChannelsResponse>>([]);

  const addReportHandOverContextData = {
    listStores,
    setListStores,
    orderListResponse,
    setOrderListResponse,
  };

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];
    if (listStores && listStores != null) {
      newData = listStores.filter((store) =>
        haveAccess(
          store.id,
          userReducer.account ? userReducer.account.account_stores : []
        )
      );
    }
    return newData;
  }, [listStores, userReducer.account]);

  const actions: Array<MenuAction> = [
    {
      id: 1,
      name: "Xóa",
      icon:<DeleteOutlined />,
      color:"#E24343"
    }
  ];

  const handleAddOrder = useCallback((orderCode:string) => {
    if (orderCode)
    {
      dispatch(
        getOrderConcernGoodsReceipts(
          orderCode,
          (data: OrderConcernGoodsReceiptsResponse[]) => {
            if (data.length > 0) {
              data.forEach(function (item, index) {
                let indexOrder = orderListResponse.findIndex((p) => p.id === item.id);
                if (indexOrder !== -1) orderListResponse.splice(indexOrder, 1);

                orderListResponse.push(item);
                setOrderListResponse([...orderListResponse]);
              });
            } else {
              showError("Không tìm thấy đơn hàng");
            }
          }
        )
      );
    }
    else{
      showWarning("Vui lòng nhập mã đơn hàng");
    }
  }, [dispatch, orderListResponse, setOrderListResponse]);

  const eventBarcodeOrder= useCallback((event:KeyboardEvent)=>{
    if(event.target instanceof HTMLBodyElement)
    {
      if(event.key !=="Enter"){
        barcode+=event.key;
      }
      else{
        handleAddOrder(barcode)
        console.log("barcode", barcode);
        barcode = "";
      }
    }
  },[handleAddOrder]);

  useEffect(()=>{
    window.addEventListener("keypress",eventBarcodeOrder);
    return()=>{
      window.removeEventListener("keypress", eventBarcodeOrder);
    }
  },[eventBarcodeOrder]);

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setListThirdPartyLogistics(response);
      })
    );

    dispatch(getGoodsReceiptsType(setListGoodsReceiptsType))

    dispatch(getChannels(2,(data:ChannelsResponse[])=>{
      setListChannels(data)
    }))

  }, [dispatch]);

  useLayoutEffect(() => {
    dispatch(StoreGetListAction(setListStores));
  }, [dispatch, setListStores]);

  const handSubmit = useCallback(
    (value: any) => {

      let codes:any=[];
      if(orderListResponse.length>0)
      {
        orderListResponse.forEach(function(data){
          codes.push(data.code)
        })
  
        let store_name = listStores.find(
          (data) => data.id === value.store_id
        )?.name;
  
        let ecommerce_name = "Biên bản đơn tự tạo";
        if (value !== -1) {
          let changeName = listChannels.find(
            (data) => data.id === value.ecommerce_id
          )?.name;
          ecommerce_name = changeName ? changeName : "Biên bản đơn tự tạo";
        }
  
        let delivery_service_name = listThirdPartyLogistics.find(
          (data) => data.id === value.delivery_service_id
        )?.name;
        let receipt_type_name = listGoodsReceiptsType.find(
          (data) => data.id === value.receipt_type_id
        )?.name;
  
        let param: any = {
          ...value,
          store_name: store_name,
          ecommerce_name: ecommerce_name,
          delivery_service_name: delivery_service_name,
          receipt_type_name: receipt_type_name,
          codes:codes
        };
  
        dispatch(
          createGoodsReceipts(param, (value: GoodsReceiptsResponse) => {
            if(value)
            {
              showSuccess("Thêm biên bản bàn giao thành công");
              history.push(
                `${UrlConfig.PACK_SUPPORT}/${value.id}`
              );
            }
          })
        );
      }
      else{
        showWarning("Chưa có đơn hàng nào được thêm");
      }
    },
    [
      dispatch,
      history,
      listGoodsReceiptsType,
      listStores,
      listThirdPartyLogistics,
      listChannels,
      orderListResponse
    ]
  );

  const onOkPress = useCallback(() => {
    goodsReceiptsForm.submit();
  }, [goodsReceiptsForm]);

  const onMenuClick =(index: number)=>{
    switch (index){
      case 1:
        setOrderListResponse([]);
        break;
      default:
        break;
    }
  }

  return (
    <AddReportHandOverContext.Provider value={addReportHandOverContextData}>
      <ContentContainer
        title="Thêm mới biên bản bàn giao"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Đơn hàng",
            path: UrlConfig.ORDER,
          },
          {
            name: "Hỗ trợ đóng gói",
            path: UrlConfig.PACK_SUPPORT,
          },
          {
            name: "Thêm mới",
          },
        ]}
      >
        <Card className="pack-card">
          <Form layout="vertical" 
            form={goodsReceiptsForm}
            onFinish={handSubmit}
          >
            <Row gutter={24} style={{marginLeft: "0px", marginRight: "0px"}}>
              <Col md={6}>
                <Form.Item
                  label="Cửa hàng"
                  name="store_id"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn cửa hàng",
                    },
                  ]}
                >
                  <Select
                    className="select-with-search"
                    showSearch
                    allowClear
                    style={{width: "95%"}}
                    placeholder="Chọn cửa hàng"
                    notFoundContent="Không tìm thấy kết quả"
                    onChange={(value?: number) => {
                      console.log(value);
                    }}
                    filterOption={(input, option) => {
                      if (option) {
                        return (
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        );
                      }
                      return false;
                    }}
                  >
                    {dataCanAccess.map((item, index) => (
                      <Select.Option key={index.toString()} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col md={6} style={{padding:"0px 4px 0px 15px"}}>
                <Form.Item
                  label="Hãng vận chuyển"
                  name="delivery_service_id"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn hãng vận chuyển",
                    },
                  ]}
                >
                  <Select
                    className="select-with-search"
                    showSearch
                    allowClear
                    style={{width: "95%"}}
                    placeholder="Chọn hãng vận chuyển"
                    notFoundContent="Không tìm thấy kết quả"
                    onChange={(value?: number) => {
                      console.log(value);
                    }}
                    filterOption={(input, option) => {
                      if (option) {
                        return (
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        );
                      }
                      return false;
                    }}
                  >
                    {listThirdPartyLogistics.map((item, index) => (
                      <Select.Option key={index.toString()} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col md={6} style={{padding:"0px 0px 0px 22px"}}>
                <Form.Item
                  label="Loại biên bản"
                  name="receipt_type_id"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn loại biên bản",
                    },
                  ]}
                >
                  <Select
                    className="select-with-search"
                    showSearch
                    allowClear
                    style={{width: "95%"}}
                    placeholder="Chọn loại biên bản"
                    notFoundContent="Không tìm thấy kết quả"
                    onChange={(value?: number) => {
                      console.log(value);
                    }}
                    filterOption={(input, option) => {
                      if (option) {
                        return (
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        );
                      }
                      return false;
                    }}
                  >
                    {listGoodsReceiptsType.map((item, index) => (
                      <Select.Option key={index.toString()} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col md={6} className="col-item-right" style={{padding:"0px 0px 0px 24px"}}>
                <Form.Item
                  label="Biên bản sàn"
                  name="ecommerce_id"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn kiểu biên bản",
                    },
                  ]}
                >
                  <Select
                    className="select-with-search"
                    showSearch
                    allowClear
                    style={{width: "98%"}}
                    placeholder="Chọn biên bản sàn"
                    notFoundContent="Không tìm thấy kết quả"
                    onChange={(value?: number) => {
                      console.log(value);
                    }}
                    filterOption={(input, option) => {
                      if (option) {
                        return (
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        );
                      }
                      return false;
                    }}
                  >
                    <Select.Option key={-1} value={-1}>
                      Mặc định
                    </Select.Option>
                    {listChannels.map((item, index) => (
                      <Select.Option key={index.toString()} value={item.id}>
                        {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <AddOrderInReport
          orderListResponse={orderListResponse}
          setOrderListResponse={setOrderListResponse}
          menu={actions}
          onMenuClick={onMenuClick}
          handleAddOrder={handleAddOrder}
        />

        <AddOrderBottombar onOkPress={onOkPress}/>

      </ContentContainer>
    </AddReportHandOverContext.Provider>
  );
};

export default AddReportHandOver;
