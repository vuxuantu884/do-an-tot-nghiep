import { Row, Col, Select, Form, Card, Input } from "antd";
import BaseResponse from "base/base.response";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { DeliveryServicesGetList, getChannels } from "domain/actions/order/order.action";
import { StoreResponse } from "model/core/store.model";
import { FulfillmentDto } from "model/handover/fulfillment.dto";
import { HandoverOrderRequest, HandoverRequest } from "model/handover/handover.request";
import { HandoverResponse } from "model/handover/handover.response";
import { RootReducerType } from "model/reducers/RootReducerType";
import { ChannelsResponse, DeliveryServiceResponse } from "model/response/order/order.response";
import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fulfillmentListService } from "service/handover/ffm.service";
import {
  getHandoverService,
  updateHandoverService,
  deleteOrderHandoverService,
} from "service/handover/handover.service";
import { haveAccess, isFetchApiSuccessful } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import DetailHandoverComponent from "../component/detail/detail.component";
import FulfillmentComponent from "../component/fulfillment/fulfillment.component";
import { HandoverType } from "../handover.config";
import { getErrorMessageApi, showModalErrorAudio } from "../helper";
import { StyledComponent } from "./styled";

type HandoverParams = {
  id: string;
};

interface DetailLoading<T> {
  isLoad: boolean;
  isError: boolean;
  data: T | null;
}

const CreateHandoverScreen: React.FC<any> = (props: any) => {
  const dispatch = useDispatch();
  const [goodsReceiptsForm] = Form.useForm();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const [handoverData, setHandoverData] = useState<DetailLoading<HandoverResponse>>({
    isLoad: false,
    data: null,
    isError: false,
  });

  interface MasterDataLoad<T> {
    isLoad: boolean;
    data: T;
  }

  const [deliveryServicesData, setDeleveryServiceData] = useState<
    MasterDataLoad<Array<DeliveryServiceResponse>>
  >({
    isLoad: false,
    data: [],
  });

  const [channelData, setChannelData] = useState<MasterDataLoad<Array<ChannelsResponse>>>({
    isLoad: false,
    data: [],
  });

  const [storeData, setStoreData] = useState<MasterDataLoad<Array<StoreResponse>>>({
    isLoad: false,
    data: [],
  });

  const [fulfillmentData, setFulfillmentData] = useState<DetailLoading<Array<FulfillmentDto>>>({
    isLoad: false,
    data: null,
    isError: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  let { id } = useParams<HandoverParams>();
  let handoverId = parseInt(id);

  useEffect(() => {
    if (deliveryServicesData.isLoad && storeData.isLoad && channelData.isLoad) {
      getHandoverService(handoverId)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setHandoverData({
              isLoad: true,
              data: response.data,
              isError: false,
            });
            return;
          }
          setHandoverData({
            isLoad: true,
            data: null,
            isError: true,
          });
        })
        .catch(() => {
          setHandoverData({
            isLoad: true,
            data: null,
            isError: true,
          });
        });
    }
  }, [channelData.isLoad, deliveryServicesData.isLoad, handoverId, storeData.isLoad]);

  useEffect(() => {
    if (handoverData.isLoad && !fulfillmentData.isLoad) {
      let codes = handoverData.data?.orders.map((value) => value.fulfillment_code);
      if (codes && codes.length === 0) {
        setFulfillmentData({
          isLoad: true,
          data: [],
          isError: false,
        });
        return;
      }

      fulfillmentListService(codes || []).then((response) => {
        if (isFetchApiSuccessful(response)) {
          setFulfillmentData({
            isLoad: true,
            data: response.data.items,
            isError: false,
          });
          return;
        }
        setHandoverData({
          isLoad: true,
          data: null,
          isError: true,
        });
      });
    }
  }, [fulfillmentData.isLoad, handoverData.data?.orders, handoverData.isLoad]);

  const dataCanAccess = useMemo(() => {
    let newData: Array<StoreResponse> = [];
    if (storeData.data && storeData.data.length > 0) {
      if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
        newData = storeData.data.filter((store) =>
          haveAccess(store.id, userReducer.account ? userReducer.account.account_stores : []),
        );
      } else {
        // trường hợp sửa đơn hàng mà account ko có quyền với cửa hàng đã chọn, thì vẫn hiển thị
        newData = storeData.data;
      }
    }
    return newData;
  }, [storeData.data, userReducer.account]);

  useEffect(() => {
    if (!deliveryServicesData.isLoad) {
      dispatch(
        DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
          setDeleveryServiceData({
            isLoad: true,
            data: response,
          });
        }),
      );
    }
  }, [deliveryServicesData.isLoad, dispatch]);

  useEffect(() => {
    if (!storeData.isLoad) {
      dispatch(
        StoreGetListAction((dataStore) => {
          setStoreData({
            isLoad: true,
            data: dataStore,
          });
        }),
      );
    }
  }, [dispatch, storeData.isLoad]);

  useEffect(() => {
    if (!channelData.isLoad) {
      dispatch(
        getChannels(2, (data: ChannelsResponse[]) => {
          setChannelData({
            isLoad: true,
            data: data,
          });
        }),
      );
    }
  }, [channelData.isLoad, dispatch]);

  const onFinish = useCallback(
    (
      orders: Array<HandoverOrderRequest>,
      fulfillments: Array<FulfillmentDto>,
      handleToggleInput?: () => void,
    ) => {
      const currentRequest = goodsReceiptsForm.getFieldsValue(true);
      const request: HandoverRequest = {
        ...currentRequest,
        orders: orders,
      };
      setIsLoading(true);
      updateHandoverService(handoverId, request)
        .then((response: BaseResponse<HandoverResponse>) => {
          if (isFetchApiSuccessful(response)) {
            showSuccess("Thêm đơn hàng thành công");
            goodsReceiptsForm.setFieldsValue({
              orders: orders,
              order_display: fulfillments,
            });
            setHandoverData({
              ...handoverData,
              data: handoverData.data
                ? {
                    ...handoverData.data,
                    total: response.data.total,
                  }
                : null,
            });
          } else {
            let textApiInformation = getErrorMessageApi(response?.message || response?.errors);

            showModalErrorAudio(
              <>
                {textApiInformation.map((p) => (
                  <p>{p}</p>
                ))}
              </>,
            );
          }
        })
        .catch(() => {
          showError("Có lỗi api cập nhật biên bản bàn giao");
        })
        .finally(() => {
          setIsLoading(false);
          handleToggleInput && handleToggleInput();
        });
    },
    [goodsReceiptsForm, handoverId, handoverData],
  );

  useEffect(() => {
    goodsReceiptsForm.setFieldsValue({ order_display: fulfillmentData.data });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fulfillmentData.data]);

  return (
    <ContentContainer
      isLoading={!handoverData.isLoad}
      title="Chỉnh sửa biên bản bàn giao"
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
          name: "Biên bản " + (handoverData.data ? handoverData.data?.id : ""),
          path: `${UrlConfig.HANDOVER}/${handoverId}`,
        },
        {
          name: "Chỉnh sửa ",
        },
      ]}
    >
      <Form
        layout="vertical"
        form={goodsReceiptsForm}
        initialValues={{
          orders: handoverData.data?.orders,
          type: handoverData.data?.type,
          delivery_service_provider_id: handoverData.data?.delivery_service_provider_id,
          channel_id: handoverData.data?.channel_id,
          note: handoverData.data?.note,
          store_id: handoverData.data?.store_id,
          order_display: fulfillmentData.data,
        }}
      >
        <StyledComponent>
          <Card hidden>
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
                          allowClear
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
                          {deliveryServicesData.data.map((item, index) => (
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
                            <Select.Option key={index.toString()} value={item.value}>
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
                          {channelData.data.map((item, index) => (
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
          {handoverData.data && <DetailHandoverComponent data={handoverData.data} />}

          <FulfillmentComponent
            onUpdate={(request, orderDisplay, handleToggleInput) => {
              onFinish(request, orderDisplay, handleToggleInput);
            }}
            onDelete={(codes, onSuccess: () => void) => {
              setIsLoading(true);
              deleteOrderHandoverService(handoverId, codes)
                .then((response) => {
                  if (isFetchApiSuccessful(response)) {
                    let orders: Array<HandoverOrderRequest> =
                      goodsReceiptsForm.getFieldValue("orders");
                    let order_display: Array<FulfillmentDto> =
                      goodsReceiptsForm.getFieldValue("order_display");
                    codes.forEach((code) => {
                      let indexOrders = orders.findIndex(
                        (value) => value.fulfillment_code === code,
                      );
                      orders.splice(indexOrders, 1);
                      let indexDisplay = order_display.findIndex((value) => value.code === code);
                      order_display.splice(indexDisplay, 1);
                    });
                    goodsReceiptsForm.setFieldsValue({
                      orders: [...orders],
                      order_display: [...order_display],
                    });
                    setHandoverData({
                      ...handoverData,
                      data: handoverData.data
                        ? {
                            ...handoverData.data,
                            total: response.data.total,
                          }
                        : null,
                    });
                    onSuccess();
                  }
                })
                .catch()
                .finally(() => setIsLoading(false));
            }}
            isLoading={isLoading}
            isFulfillmentLoading={fulfillmentData.isLoad}
          />
        </StyledComponent>
      </Form>
      <BottomBarContainer back="Trở về" />
    </ContentContainer>
  );
};

export default CreateHandoverScreen;
