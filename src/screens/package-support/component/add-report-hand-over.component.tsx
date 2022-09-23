import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, FormInstance, Select, Form } from "antd";
import React, { createRef, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { useDispatch } from "react-redux";
import { setPackInfo } from "utils/LocalStorageUtils";
import moment from "moment";
import { showError, showModalError, showSuccess, showWarning } from "utils/ToastUtils";
import { PackModel, PackModelDefaultValue } from "model/pack/pack.model";
import { PackFulFillmentResponse } from "model/response/order/order.response";
import { FulFillmentStatus, PUSHING_STATUS, RECEIPT_TYPE } from "utils/Constants";
import UrlConfig from "config/url.config";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { isFulfillmentPacked } from "utils/PackUtils";
import ReportHandOverModal from "../modal/report-hand-over.modal";
import { HandoverSearchRequest } from "model/handover/handover.search";
import {
  getHandoverService,
  searchHandoverService,
  updateHandoverService,
} from "service/handover/handover.service";
import { HandoverResponse } from "model/handover/handover.response";
import { HandoverTransfer } from "screens/order-online/handover/handover.config";
import { HandoverOrderRequest, HandoverRequest } from "model/handover/handover.request";
import BaseResponse from "base/base.response";
import { fulfillmentListService } from "service/handover/ffm.service";
import { FulfillmentDto } from "model/handover/fulfillment.dto";
import { hideLoading, showLoading } from "domain/actions/loading.action";

type Props = {
  setOrderPushFalseDelivery: (data: FulfillmentDto[]) => void;
  setIsVisiblePackedOrderModal: (value: boolean) => void;
};

const dateFormat = DATE_FORMAT.DD_MM_YYYY;

const fromDate = moment().startOf("day").subtract(3, "days").format(dateFormat);
const toDate = moment().endOf("day").format(dateFormat);

const handOverRequestDefault: HandoverSearchRequest = {
  from_created_date: fromDate,
  to_created_date: toDate,
  types: [HandoverTransfer],
  limit: 1000,
  page: 1,
};

const AddReportHandOverComponent: React.FC<Props> = (props: Props) => {
  const { setOrderPushFalseDelivery, setIsVisiblePackedOrderModal } = props;
  const dispatch = useDispatch();
  // const history= useHistory();

  //useState
  const [visibleModal, setVisibleModal] = useState(false);
  const formRef = createRef<FormInstance>();
  const [goodsReceiptsForm] = Form.useForm();
  const [listHandOvers, setListHandOvers] = useState<HandoverResponse[]>([]);
  const [handOver, setHandOver] = useState<HandoverResponse>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //Ref
  const goodsReceiptsRef = React.useRef<any>(null);

  //Context
  const orderPackContextData = useContext(OrderPackContext);
  const setSinglePack = orderPackContextData?.setSinglePack;
  const singlePack = orderPackContextData?.singlePack;
  const isFulFillmentPack = orderPackContextData?.isFulFillmentPack;
  const setIsFulFillmentPack = orderPackContextData?.setIsFulFillmentPack;
  const listStoresDataCanAccess = orderPackContextData?.listStoresDataCanAccess;

  const handOverRequest = useMemo(() => {
    return {
      ...handOverRequestDefault,
      store_ids: listStoresDataCanAccess?.map((p) => p.id),
    };
  }, [listStoresDataCanAccess]);

  const orderPackSuccess: PackFulFillmentResponse[] = useMemo(() => {
    return !singlePack ? [] : !singlePack?.fulfillments ? [] : singlePack.fulfillments;
  }, [singlePack]);

  const handleCancel = () => {
    setVisibleModal(false);
  };

  const showModal = () => {
    setVisibleModal(true);
  };

  /**
   *
   * @param orderMap kiểm tra tính hợp lệ trước khi lưu đơn hàng vào biên bản
   * @param receiptTypeId
   * @returns true or false
   */
  const validateFulfillments = useCallback(
    (fulfillments: FulfillmentDto[], receiptTypeId?: number) => {
      const fulfillmentCodes = fulfillments.map((p) => p.code);
      const orderPushDeliveryNotCompleted: FulfillmentDto[] = fulfillments.filter(
        (p: FulfillmentDto) =>
          p?.shipment?.pushing_status && p?.shipment?.pushing_status !== PUSHING_STATUS.COMPLETED,
      );
      const findDuplicated: string[] = fulfillmentCodes.filter(
        (item, index: number) => fulfillmentCodes.indexOf(item) !== index,
      );
      const fulfillmentIsNotPack = fulfillments.filter((item) => !isFulfillmentPacked(item));

      if (findDuplicated && findDuplicated.length > 0) {
        showModalError(
          <React.Fragment>
            {findDuplicated.map((p) => {
              const indexFFM = fulfillments.findIndex((p1) => p1.code === p);
              return (
                <div>
                  Đơn hàng <b>{fulfillments[indexFFM].order_code}</b> đã có trong biên bản
                </div>
              );
            })}
          </React.Fragment>,
        );

        return false;
      }

      if (
        fulfillmentIsNotPack &&
        fulfillmentIsNotPack.length > 0 &&
        receiptTypeId === RECEIPT_TYPE.SHIPPING
      ) {
        showModalError(
          <React.Fragment>
            {fulfillmentIsNotPack.map((p) => (
              <div>
                Đơn giao <b>{p?.code}</b>, thuộc đơn hàng <b>{p?.order_code}</b> không ở trạng thái
                đã đóng gói
              </div>
            ))}
          </React.Fragment>,
        );

        return false;
      }

      if (orderPushDeliveryNotCompleted && orderPushDeliveryNotCompleted.length > 0) {
        setOrderPushFalseDelivery(orderPushDeliveryNotCompleted);
        setIsVisiblePackedOrderModal(true);

        return false;
      }

      return true;
    },
    [setIsVisiblePackedOrderModal, setOrderPushFalseDelivery],
  );

  const handOrderPushHandOver = useCallback(
    (handOverData: HandoverResponse, newFulfillments: HandoverOrderRequest[]) => {
      setIsLoading(true);
      let notSelectOrderPackSuccess = orderPackSuccess?.filter(
        (p) => !isFulFillmentPack.some((single) => single === p.order_code),
      );

      const request: HandoverRequest = {
        ...handOverData,
        orders: newFulfillments,
      };

      let isSuccessHandOver = true;

      const fulfillmentCodes = newFulfillments.map((p) => p.fulfillment_code);
      fulfillmentListService(fulfillmentCodes)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            isSuccessHandOver = validateFulfillments(response.data.items, RECEIPT_TYPE.SHIPPING);
          } else {
            handleFetchApiError(response, "Api danh sách vận đơn", dispatch);
          }
        })
        .then(() => {
          if (isSuccessHandOver) {
            updateHandoverService(handOverData.id, request)
              .then((response: BaseResponse<HandoverResponse>) => {
                if (isFetchApiSuccessful(response)) {
                  setHandOver(response.data);

                  let packData: PackModel = {
                    ...new PackModelDefaultValue(),
                    ...singlePack,
                    fulfillments: [...notSelectOrderPackSuccess],
                  };

                  setSinglePack(packData);
                  setPackInfo(packData);
                  setIsFulFillmentPack([]);
                  showSuccess("Thêm đơn hàng vào biên bản bàn giao thành công");
                  let pathname = `${process.env.PUBLIC_URL}${UrlConfig.HANDOVER}/${response.data.id}`;
                  window.open(pathname, "_blank");
                } else {
                  handleFetchApiError(response, "Api cập nhật biên bản bàn giao", dispatch);
                }
              })
              .catch(() => {
                showError("Có lỗi api cập nhật biên bản bàn giao");
              })
              .finally(() => {
                setIsLoading(false);
              });
          }
        })
        .catch(() => {
          showError("Có lỗi api lấy danh sách vận đơn");
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [
      dispatch,
      isFulFillmentPack,
      orderPackSuccess,
      setIsFulFillmentPack,
      setSinglePack,
      singlePack,
      validateFulfillments,
    ],
  );

  const handOrderAddGoodsReceipts = useCallback(() => {
    if (!handOver) {
      showWarning("Chưa chọn biên bản bàn giao");
      return;
    }

    if (orderPackSuccess.length === 0) {
      showWarning("Chưa có đơn giao đã đóng gói");
      return;
    }

    if (handOver.orders && handOver.orders.length > 0) {
      let indexShipping = handOver.orders?.findIndex(
        (p) => p.fulfillment_status === FulFillmentStatus.SHIPPING,
      );

      if (indexShipping !== -1) {
        showModalError(
          `Không thể cập nhật biên bản, Đơn giao ${handOver.orders[indexShipping].code} đã xuất kho`,
        );
        return;
      }
    }

    let selectFulfillmentPackSuccess = orderPackSuccess?.filter((p) =>
      isFulFillmentPack.some((single) => single === p.order_code),
    );

    if (
      !selectFulfillmentPackSuccess ||
      (selectFulfillmentPackSuccess && selectFulfillmentPackSuccess.length === 0)
    ) {
      showWarning("chưa chọn đơn giao cần thêm vào biên bản");
      return;
    }

    // let queryCode = selectFulfillmentPackSuccess
    // ? selectFulfillmentPackSuccess.map((p) => p.order_code)
    // : [];
    // let queryParam: any = { code: queryCode };

    // getListOrderApi(queryParam)
    //       .then((response) => {
    //         setIsLoading(false);
    //         if (isFetchApiSuccessful(response)) {
    //           let orderData = response.data.items;
    //           if (orderData && orderData.length > 0) {
    //             let orderMap: OrderWithFulfillmentActiveModel[] = orderData.map((p) => {
    //               return {
    //                 ...p,
    //                 fulfillment_active: getFulfillmentSingle(,p.fulfillments),
    //               };
    //             });
    //           }
    //         } else {
    //           handleFetchApiError(response, "Danh sách fulfillment", dispatch);
    //         }
    //       })

    const newFulfillments = selectFulfillmentPackSuccess.map((p) => {
      return {
        fulfillment_code: p.code,
      };
    });
    const fulfillments = handOver?.orders.map((value) => {
      return {
        fulfillment_code: value.fulfillment_code,
      };
    });

    let fulfillmentsRequest: any = [...newFulfillments, ...fulfillments];

    console.log("fulfillmentsRequest", fulfillmentsRequest);

    handOrderPushHandOver({ ...handOver }, fulfillmentsRequest);
  }, [handOrderPushHandOver, handOver, isFulFillmentPack, orderPackSuccess]);

  const selectGoodsReceipts = useCallback(
    (value: number) => {
      let indexGoods = listHandOvers.findIndex((data: HandoverResponse) => data.id === value);
      if (indexGoods !== -1) {
        // console.log("selectGoodsReceipts", listGoodsReceipts[indexGoods])
        getHandoverService(listHandOvers[indexGoods].id)
          .then((response) => {
            if (isFetchApiSuccessful(response)) {
              setHandOver(response.data);
            }
          })
          .catch((e) => {
            console.log(e);
          });
      } else setHandOver(undefined);
    },
    [listHandOvers],
  );

  const handleReloadHandOver = useCallback(
    (handOverId?: number) => {
      dispatch(showLoading());
      searchHandoverService(handOverRequest)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setListHandOvers(response.data.items);
          }
        })
        .then(() => {
          if (handOverId) {
            getHandoverService(handOverId)
              .then((response) => {
                if (isFetchApiSuccessful(response)) {
                  setHandOver(response.data);
                }
              })
              .catch((e) => {
                console.log(e);
              });
          }
        })
        .catch()
        .finally(() => {
          dispatch(hideLoading());
        });
    },
    [dispatch, handOverRequest],
  );

  useEffect(() => {
    const isStore = listStoresDataCanAccess?.some((p) => p.id === singlePack?.store_id);
    formRef.current?.setFieldsValue({
      store_id: isStore ? singlePack?.store_id : undefined,
      //delivery_service_id:singlePack?.delivery_service_provider_id
    });
  }, [formRef, singlePack?.store_id, listStoresDataCanAccess]);

  useEffect(() => {
    if (listStoresDataCanAccess && listStoresDataCanAccess.length !== 0) {
      searchHandoverService({
        ...handOverRequestDefault,
        store_ids: listStoresDataCanAccess?.map((p) => p.id),
      })
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setListHandOvers(response.data.items);
          } else {
            handleFetchApiError(response, "Danh sách biên bản", dispatch);
          }
        })
        .catch()
        .finally(() => {});
    }
  }, [dispatch, listStoresDataCanAccess]);

  return (
    <Card title="Cho vào biên bản bàn giao" bordered={false} className="pack-give-card">
      <div className="pack-add-hand-over">
        <div style={{ width: "35%" }}>
          <Select
            className="select-with-search"
            //showSearch
            allowClear
            style={{ width: "100%" }}
            placeholder="Chọn biên bản"
            notFoundContent="Không tìm thấy kết quả"
            onChange={(value: number) => {
              selectGoodsReceipts(value);
            }}
            value={handOver?.id}
            ref={goodsReceiptsRef}
          >
            {listHandOvers.map((item, index) => (
              <Select.Option key={index.toString()} value={item.id}>
                {+item.delivery_service_provider_id === -1
                  ? `${item.id} - ${item.store} - Tự giao hàng`
                  : `${item.id} - ${item.store} - ${item.delivery_service_provider}`}{" "}
                - {``} {item.channel}
              </Select.Option>
            ))}
          </Select>
        </div>
        <Button
          icon={<PlusOutlined />}
          ghost
          type="primary"
          size="small"
          block
          onClick={showModal}
          className="pack-give-card-row-item"
          style={{ width: "145px" }}
        >
          Thêm mới
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          size="small"
          block
          onClick={handOrderAddGoodsReceipts}
          className="pack-give-card-row-item"
          style={{ width: "75px" }}
          loading={isLoading}
        >
          Lưu
        </Button>
      </div>
      <ReportHandOverModal
        visible={visibleModal}
        formRef={formRef}
        goodsReceiptsForm={goodsReceiptsForm}
        setVisible={setVisibleModal}
        handleCancel={handleCancel}
        handleReloadHandOver={handleReloadHandOver}
      />
    </Card>
  );
};

export default AddReportHandOverComponent;
