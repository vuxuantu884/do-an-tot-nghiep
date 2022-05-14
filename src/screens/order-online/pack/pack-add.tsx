// type AddReportHandOverProps={
  import { DeleteOutlined } from "@ant-design/icons";
  import { Row, Col, Select, Form, Card, FormInstance } from "antd";
  import ContentContainer from "component/container/content.container";
  import { MenuAction } from "component/table/ActionButton";
  import UrlConfig from "config/url.config";
  import { AddReportHandOverContext } from "contexts/order-pack/add-report-hand-over-context";
  import { StoreGetListAction } from "domain/actions/core/store.action";
  import { createGoodsReceipts, getGoodsReceiptsType, getOrderConcernGoodsReceipts } from "domain/actions/goods-receipts/goods-receipts.action";
  import { DeliveryServicesGetList, getChannels } from "domain/actions/order/order.action";
  import { StoreResponse } from "model/core/store.model";
  import { RootReducerType } from "model/reducers/RootReducerType";
  import { ChannelsResponse, DeliveryServiceResponse } from "model/response/order/order.response";
  import { GoodsReceiptsAddOrderRequest, GoodsReceiptsResponse, GoodsReceiptsTypeResponse, OrderConcernGoodsReceiptsResponse } from "model/response/pack/pack.response";
  import { createRef, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
  import { useDispatch, useSelector } from "react-redux";
  import { useHistory } from "react-router-dom";
  import { getListOrderApi } from "service/order/order.service";
  import { haveAccess } from "utils/AppUtils";
  import { FulFillmentStatus } from "utils/Constants";
  import { showError, showSuccess, showWarning } from "utils/ToastUtils";
  import AddOrderBottombar from "./add/add-order-bottombar";
  import AddOrderInReport from "./add/add-order-in-report";
  import { StyledComponent } from "./styles";
  
  var barcode = "";
  // }
  const AddReportHandOver: React.FC<any> = (props: any) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const [goodsReceiptsForm] = Form.useForm();
    const formSearchOrderRef = createRef<FormInstance>();
    const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  
    const [isLoading, setIsLoading] = useState(false);
  
    const [listStores, setListStores] = useState<Array<StoreResponse>>([]);
    const [codes, setCodes] = useState<Array<String>>([]);
    const [orderListResponse, setOrderListResponse] = useState<OrderConcernGoodsReceiptsResponse[]>([]);
  
    const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<DeliveryServiceResponse[]>([]);
    const [listGoodsReceiptsType, setListGoodsReceiptsType] = useState<Array<GoodsReceiptsTypeResponse>>([]);
    const [listChannels, setListChannels] = useState<Array<ChannelsResponse>>([]);
  
    const addReportHandOverContextData = {
      listStores,
      setListStores,
      orderListResponse,
      setOrderListResponse,
    };
  
    const dataCanAccess = useMemo(() => {
      let newData: Array<StoreResponse> = [];
      if (listStores && listStores != null) {
        if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
          newData = listStores.filter((store) =>
            haveAccess(
              store.id,
              userReducer.account ? userReducer.account.account_stores : []
            )
          );
        }
        else {
          // trường hợp sửa đơn hàng mà account ko có quyền với cửa hàng đã chọn, thì vẫn hiển thị
          newData = listStores;
        }
      }
      return newData;
    }, [listStores, userReducer.account]);
  
    const actions: Array<MenuAction> = [
      {
        id: 1,
        name: "Xóa",
        icon: <DeleteOutlined />,
        color: "#E24343"
      }
    ];
  
    const handleAddOrder = useCallback((param: GoodsReceiptsAddOrderRequest, isBarcode?: boolean) => {
      if (param) {
        console.log("ok")
        dispatch(
          getOrderConcernGoodsReceipts(
            param,
            (data: OrderConcernGoodsReceiptsResponse[]) => {
              let dataAdd: OrderConcernGoodsReceiptsResponse[] = [];
              let orderList = [...orderListResponse]
              if (data.length > 0) {
                // data.forEach(function (item, index) {dataAdd.push(item);});
                dataAdd = data.map(p => p);
  
                if (dataAdd.length === 0) {
                  showError("Đơn hàng không hợp lệ không thể thêm vào biên bản bàn giao");
                } else {
                  let newCodes: Array<string> = [];
                  dataAdd.forEach((item) => {
                    let findIndex = orderList.findIndex(response => response.id === item.id);
                    if (findIndex === -1) {
                      orderList.unshift(item)
                      param.order_codes && newCodes.push(param.order_codes);
                    } else {
                      showError("Đơn hàng đã tồn tại không thể thêm vào biên bản bàn giao");
                    }
                  });
                  setCodes([...codes, ...newCodes]);
                  setOrderListResponse([...orderList]);
                }
  
                const searchTermElement: any = document.getElementById("search_term");
                !isBarcode && searchTermElement && searchTermElement.select();
  
              } else {
                showError("Không tìm thấy đơn hàng");
              }
            }
          )
        );
      }
      else {
        showWarning("Vui lòng nhập mã đơn hàng");
      }
    }, [codes, dispatch, orderListResponse]);
  
    const eventBarcodeOrder = useCallback((event: KeyboardEvent) => {
      if (event.target instanceof HTMLBodyElement) {
        if (event.key !== "Enter") {
          barcode += event.key;
        }
        else {
          goodsReceiptsForm.validateFields(['store_id', 'delivery_service_provider_id', 'channel_id', 'receipt_type_id']);
          const { store_id, delivery_service_provider_id, channel_id, receipt_type_id } = goodsReceiptsForm.getFieldsValue();
          if (!store_id || !delivery_service_provider_id || !channel_id || !receipt_type_id)
            return;
          let param = {
            order_codes: barcode,
            store_id: store_id,
            delivery_service_provider_id: delivery_service_provider_id,
            channel_id: channel_id,
            receipt_type_id: receipt_type_id
          }
          handleAddOrder(param, true)
          barcode = "";
        }
      }
    }, [goodsReceiptsForm, handleAddOrder]);
  
    const getValueReceipts = useCallback((value: any) => {
      goodsReceiptsForm.validateFields(['store_id', 'delivery_service_provider_id', 'channel_id', 'receipt_type_id']);
      if (!value.store_id || !value.delivery_service_provider_id || !value.channel_id || !value.receipt_type_id)
        return { success: false };
      let store_name = listStores.find(
        (data) => data.id === value.store_id
      )?.name;
  
      let ecommerce_name = "Biên bản đơn tự tạo";
      if (value !== -1) {
        let changeName = listChannels.find(
          (data) => data.id === value.channel_id
        )?.name;
        ecommerce_name = changeName ? changeName : "Biên bản đơn tự tạo";
      }
  
      let delivery_service_name = listThirdPartyLogistics.find(
        (data) => data.id === value.delivery_service_provider_id
      )?.name;
      let receipt_type_name = listGoodsReceiptsType.find(
        (data) => data.id === value.receipt_type_id
      )?.name;
  
      let result: any = {
        ...value,
        store_name: store_name,
        ecommerce_id: value.channel_id,
        ecommerce_name: ecommerce_name,
        delivery_service_id: value.delivery_service_provider_id,
        delivery_service_name: delivery_service_name,
        delivery_service_type: "",
        receipt_type_name: receipt_type_name,
        success: true
      };
  
      return result;
    }, [goodsReceiptsForm, listChannels, listGoodsReceiptsType, listStores, listThirdPartyLogistics])
  
    const handleAddOrdersCode = useCallback((order_codes: string) => {
      const searchTermElement: any = document.getElementById("search_term");
      searchTermElement?.select();
  
      const value = goodsReceiptsForm.getFieldsValue();
      const valueReceipts = getValueReceipts(value);
      if (valueReceipts.success === false) return;
  
      let param: GoodsReceiptsAddOrderRequest = {
        order_codes: order_codes,
        ...valueReceipts,
      }
      handleAddOrder(param)
  
    }, [getValueReceipts, goodsReceiptsForm, handleAddOrder])
  
    useEffect(() => {
      const searchTermElement: any = document.getElementById("search_term");
  
      searchTermElement?.addEventListener("focus", (e: any) => {
        searchTermElement.select();
      });
  
      window.addEventListener("keypress", eventBarcodeOrder);
      return () => {
        window.removeEventListener("keypress", eventBarcodeOrder);
      }
    }, [eventBarcodeOrder]);
  
    useEffect(() => {
      dispatch(
        DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
          setListThirdPartyLogistics(response);
        })
      );
  
      dispatch(getGoodsReceiptsType(setListGoodsReceiptsType))
  
      dispatch(getChannels(2, (data: ChannelsResponse[]) => {
        setListChannels(data)
      }))
  
    }, [dispatch]);
  
    useLayoutEffect(() => {
      dispatch(StoreGetListAction(setListStores));
    }, [dispatch, setListStores]);
  
  
  
    const handSubmit = useCallback(
      (value: any) => {
        let codesFFM:string[]=[];
        setIsLoading(true);
        let queryCode = orderListResponse && orderListResponse.length > 0 ? orderListResponse.map((p) => p.code) : [];
        let queryParam: any = { code: queryCode }
        getListOrderApi(queryParam).then((response) => {
          console.log(response)
          let orderData = response.data.items;
          if (orderData && orderData.length > 0) {
  
            orderData?.forEach((item) => {
              if (item.fulfillments && item.fulfillments.length > 0) {
  
                if (value.receipt_type_id === 1) {
                  let fulfillments = item.fulfillments.filter(p => p.status === FulFillmentStatus.PACKED)
                  if (fulfillments.length > 0) {
                    let indexFFM = fulfillments.length - 1;
                    let FFMCode: string | null = item.fulfillments[indexFFM].code;
                    FFMCode && codesFFM.push(FFMCode);
                  }
                }
                else if (value.receipt_type_id === 2) {
                  let fulfillments = item.fulfillments.filter(p => p.status === FulFillmentStatus.CANCELLED)
                  if (fulfillments.length > 0) {
                    let indexFFM = fulfillments.length - 1;
                    let FFMCode: string | null = item.fulfillments[indexFFM].code;
                    FFMCode && codesFFM.push(FFMCode);
                  }
                }
              }
            });
          }
        }).then(() => {
          const valueReceipts = getValueReceipts(value);
          let param: any = {
            ...valueReceipts,
            codes: codesFFM
          };
  
          dispatch(
            createGoodsReceipts(param, (value: GoodsReceiptsResponse) => {
              if (value) {
                showSuccess("Thêm biên bản bàn giao thành công");
  
                history.push(`${UrlConfig.DELIVERY_RECORDS}/${value.id}`);
              }
              setIsLoading(false)
            })
          );
  
        })
      },
      [orderListResponse, dispatch, getValueReceipts, history]
    );
  
    console.log(isLoading)
  
    const onOkPress = useCallback(() => {
      goodsReceiptsForm.submit();
    }, [goodsReceiptsForm]);
  
    const onMenuClick = (index: number) => {
      switch (index) {
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
              name: "Biên bản bàn giao",
              path: UrlConfig.DELIVERY_RECORDS,
            },
            {
              name: "Thêm mới",
            },
          ]}
        >
          <StyledComponent>
            <Card className="pack-card">
              <Form layout="vertical"
                form={goodsReceiptsForm}
                onFinish={handSubmit}
                className="yody-pack-row"
              >
                <Row>
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
                        style={{ width: "95%" }}
                        placeholder="Chọn cửa hàng"
                        notFoundContent="Không tìm thấy kết quả"
                        onChange={(value?: number) => {
                        }}
                        filterOption={(input, option) => {
                          if (option) {
                            return (
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            );
                          }
                          return false;
                        }}
                        disabled={orderListResponse && orderListResponse.length > 0 ? true : false}
                      >
                        {dataCanAccess.map((item, index) => (
                          <Select.Option key={index.toString()} value={item.id}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col md={6} style={{ padding: "0px 4px 0px 15px" }}>
                    <Form.Item
                      label="Hãng vận chuyển"
                      name="delivery_service_provider_id"
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
                        style={{ width: "95%" }}
                        placeholder="Chọn hãng vận chuyển"
                        notFoundContent="Không tìm thấy kết quả"
                        onChange={(value?: number) => {
                        }}
                        filterOption={(input, option) => {
                          if (option) {
                            return (
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            );
                          }
                          return false;
                        }}
                        disabled={orderListResponse && orderListResponse.length > 0 ? true : false}
                      >
                        <Select.Option key={-1} value={-1}>Tự giao hàng</Select.Option>
                        {listThirdPartyLogistics.map((item, index) => (
                          <Select.Option key={index.toString()} value={item.id}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col md={6} style={{ padding: "0px 0px 0px 22px" }}>
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
                        style={{ width: "95%" }}
                        placeholder="Chọn loại biên bản"
                        notFoundContent="Không tìm thấy kết quả"
                        onChange={(value?: number) => {
                        }}
                        filterOption={(input, option) => {
                          if (option) {
                            return (
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            );
                          }
                          return false;
                        }}
                        disabled={orderListResponse && orderListResponse.length > 0 ? true : false}
                      >
                        {listGoodsReceiptsType.map((item, index) => (
                          <Select.Option key={index.toString()} value={item.id}>
                            {item.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col md={6} className="col-item-right" style={{ padding: "0px 0px 0px 24px" }}>
                    <Form.Item
                      label="Biên bản sàn"
                      name="channel_id"
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
                        style={{ width: "98%" }}
                        placeholder="Chọn biên bản sàn"
                        notFoundContent="Không tìm thấy kết quả"
                        onChange={(value?: number) => {
                        }}
                        filterOption={(input, option) => {
                          if (option) {
                            return (
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            );
                          }
                          return false;
                        }}
                        disabled={orderListResponse && orderListResponse.length > 0 ? true : false}
                      >
                        <Select.Option key={-1} value={-1}>
                          Biên bản tự tạo
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
              codes={codes}
              setOrderListResponse={setOrderListResponse}
              menu={actions}
              onMenuClick={onMenuClick}
              handleAddOrder={handleAddOrdersCode}
              formSearchOrderRef={formSearchOrderRef}
              goodsReceiptForm={goodsReceiptsForm}
            />
  
            <AddOrderBottombar onOkPress={onOkPress} isLoading={isLoading} />
          </StyledComponent>
  
  
        </ContentContainer>
      </AddReportHandOverContext.Provider>
    );
  };
  
  export default AddReportHandOver;
  