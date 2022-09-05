import { Row, Col, Select, Form, Card, Input } from "antd";
import BaseResponse from "base/base.response";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { DeliveryServicesGetList, getChannels } from "domain/actions/order/order.action";
import { StoreResponse } from "model/core/store.model";
import { HandoverOrderRequest, HandoverRequest } from "model/handover/handover.request";
import { HandoverResponse } from "model/handover/handover.response";
import { RootReducerType } from "model/reducers/RootReducerType";
import { ChannelsResponse, DeliveryServiceResponse } from "model/response/order/order.response";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createHandoverService } from "service/handover/handover.service";
import { handleFetchApiError, haveAccess, isFetchApiSuccessful } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";
import { StyledComponent } from "../pack/styles";
import AddOrderBottomBar from "./component/bottom-bar/add-order-bottom-bar";
import FulfillmentComponent from "./component/fulfillment/fulfillment.component";
import { HandoverReturn, HandoverTransfer, HandoverType } from "./handover.config";

const CreateHandoverScreeen: React.FC<any> = (props: any) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [goodsReceiptsForm] = Form.useForm();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const [isLoading, setIsLoading] = useState(false);

  const [listStores, setListStores] = useState<Array<StoreResponse>>([]);

  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<DeliveryServiceResponse[]>(
    [],
  );
  const [listChannels, setListChannels] = useState<Array<ChannelsResponse>>([]);

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];
    if (listStores && listStores != null) {
      if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
        newData = listStores.filter((store) =>
          haveAccess(store.id, userReducer.account ? userReducer.account.account_stores : []),
        );
      } else {
        // trường hợp sửa đơn hàng mà account ko có quyền với cửa hàng đã chọn, thì vẫn hiển thị
        newData = listStores;
      }
    }
    return newData;
  }, [listStores, userReducer.account]);

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setListThirdPartyLogistics(response);
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getChannels(2, (data: ChannelsResponse[]) => {
        setListChannels(data);
      }),
    );
  }, [dispatch]);

  useLayoutEffect(() => {
    dispatch(StoreGetListAction(setListStores));
  }, [dispatch, setListStores]);

  const onOkPress = useCallback(() => {
    goodsReceiptsForm.submit();
  }, [goodsReceiptsForm]);

  const onFinish = useCallback(
    (request: HandoverRequest) => {
      setIsLoading(true);
      createHandoverService(request)
        .then((response: BaseResponse<HandoverResponse>) => {
          if (isFetchApiSuccessful(response)) {
            let handover: HandoverResponse = response.data;
            history.push(`${UrlConfig.HANDOVER}/${handover.id}`);
          } else {
            handleFetchApiError(response, "Tạo biên bản bàn giao", dispatch);
          }
        })
        .catch((e) => {
          showError("Có lỗi api tạo biên bản bàn giao");
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [dispatch, history],
  );

  return (
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
          path: UrlConfig.HANDOVER,
        },
        {
          name: "Thêm mới",
        },
      ]}
    >
      <Form
        layout="vertical"
        form={goodsReceiptsForm}
        initialValues={{
          orders: [],
          type: HandoverTransfer,
          delivery_service_provider_id: null,
          channel_id: -1,
          note: "",
          store_id: null,
          order_display: [],
        }}
        onFinish={onFinish}
      >
        <StyledComponent>
          <Card>
            <Form.Item
              noStyle
              shouldUpdate={(prev, current) => prev["orders"] !== current["orders"]}
            >
              {({ getFieldValue }) => {
                const orders: Array<HandoverOrderRequest> = getFieldValue("orders");
                return (
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
                          showSearch
                          style={{ width: "95%" }}
                          placeholder="Chọn cửa hàng"
                          notFoundContent="Không tìm thấy kết quả"
                          filterOption={(input, option) => {
                            if (option) {
                              return (
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              );
                            }
                            return false;
                          }}
                          disabled={orders.length > 0 ? true : false}
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
                          showSearch
                          style={{ width: "95%" }}
                          placeholder="Chọn hãng vận chuyển"
                          notFoundContent="Không tìm thấy kết quả"
                          onChange={(value?: number) => {}}
                          filterOption={(input, option) => {
                            if (option) {
                              return (
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              );
                            }
                            return false;
                          }}
                          disabled={orders.length > 0 ? true : false}
                        >
                          <Select.Option key={-1} value={-1}>
                            Tự giao hàng
                          </Select.Option>
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
                        name="type"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn loại biên bản",
                          },
                        ]}
                      >
                        <Select
                          style={{ width: "95%" }}
                          placeholder="Chọn loại biên bản"
                          onChange={(value?: number) => {}}
                          disabled={orders.length > 0 ? true : false}
                        >
                          {HandoverType.map((item, index) => (
                            <Select.Option
                              key={index.toString()}
                              value={item.value}
                              // disabled={item.value === HandoverReturn}
                            >
                              {item.display}
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
                          showSearch
                          style={{ width: "98%" }}
                          placeholder="Chọn biên bản sàn"
                          notFoundContent="Không tìm thấy kết quả"
                          onChange={(value?: number) => {}}
                          filterOption={(input, option) => {
                            if (option) {
                              return (
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                              );
                            }
                            return false;
                          }}
                          disabled={orders.length > 0 ? true : false}
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
                );
              }}
            </Form.Item>
            <Form.Item hidden name="orders">
              <Input />
            </Form.Item>
            <Form.Item hidden name="id">
              <Input />
            </Form.Item>
          </Card>
          <FulfillmentComponent isLoading={isLoading} />
          <AddOrderBottomBar onOkPress={onOkPress} isLoading={isLoading} />
        </StyledComponent>
      </Form>
    </ContentContainer>
  );
};

export default CreateHandoverScreeen;
