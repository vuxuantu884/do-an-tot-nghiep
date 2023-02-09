import { PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, FormInstance, Row, Select, Form } from "antd";
import React, { createRef, useCallback, useContext, useEffect, useMemo, useState } from "react";
// import { useDispatch } from "react-redux";
import ReportHandOverModal from "../../modal/report-hand-over.modal";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import {
  createGoodsReceipts,
  getByIdGoodsReceipts,
  getGoodsReceiptsSearch,
  updateGoodsReceipts,
} from "domain/actions/goods-receipts/goods-receipts.action";
import { useDispatch } from "react-redux";
import { setPackInfo } from "utils/LocalStorageUtils";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import { GoodsReceiptsSearchQuery } from "model/query/goods-receipts.query";
import moment, { Moment } from "moment";
import { showError, showModalError, showSuccess, showWarning } from "utils/ToastUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { PackModel, PackModelDefaultValue } from "model/pack/pack.model";
import { PackFulFillmentResponse } from "model/response/order/order.response";
import { FulFillmentStatus, PUSHING_STATUS, RECEIPT_TYPE, ShipmentMethod } from "utils/Constants";
import UrlConfig from "config/url.config";
import { convertFromStringToDate, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { getListOrderApi } from "service/order/order.service";
import { formatDateTimeOrderFilter } from "utils/OrderUtils";
import { OrderWithFulfillmentActiveModel } from "model/order/order.model";
import { DATE_FORMAT } from "utils/DateUtils";
import { getFulfillmentActive, isFulfillmentPacked } from "utils/fulfillmentUtils";
// import { useHistory } from "react-router-dom";

type Props = {
  setOrderPushFalseDelivery: (data: OrderWithFulfillmentActiveModel[]) => void;
  setIsVisiblePackedOrderModal: (value: boolean) => void;
};

const initQueryGoodsReceipts: GoodsReceiptsSearchQuery = {
  limit: 5,
  page: 1,
  sort_column: "",
  sort_type: "",
  store_ids: null,
  delivery_service_ids: null,
  ecommerce_ids: null,
  good_receipt_type_ids: null,
  ids: null,
  order_codes: null,
  from_date: "",
  to_date: "",
};

const dateFormat = DATE_FORMAT.DD_MM_YY_HHmmss;

const AddReportHandOver: React.FC<Props> = (props: Props) => {
  const { setOrderPushFalseDelivery, setIsVisiblePackedOrderModal } = props;
  const dispatch = useDispatch();
  // const history= useHistory();

  //useState
  const [visibleModal, setVisibleModal] = useState(false);
  const formRef = createRef<FormInstance>();
  const [goodsReceiptsForm] = Form.useForm();
  const [listGoodsReceipts, setListGoodsReceipts] = useState<GoodsReceiptsResponse[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptsResponse>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //Ref
  const goodsReceiptsRef = React.useRef<any>(null);

  //Context
  const orderPackContextData = useContext(OrderPackContext);
  const setSinglePack = orderPackContextData?.setSinglePack;
  const singlePack = orderPackContextData?.singlePack;
  const listStores = orderPackContextData.listStores;
  const listChannels = orderPackContextData.listChannels;
  const listThirdPartyLogistics = orderPackContextData.listThirdPartyLogistics;
  const listGoodsReceiptsType = orderPackContextData.listGoodsReceiptsType;
  const isFulFillmentPack = orderPackContextData?.isFulFillmentPack;
  const setIsFulFillmentPack = orderPackContextData?.setIsFulFillmentPack;

  const orderPackSuccess: PackFulFillmentResponse[] = useMemo(() => {
    return !singlePack ? [] : !singlePack?.fulfillments ? [] : singlePack.fulfillments;
  }, [singlePack]);

  const handleOk = () => {
    goodsReceiptsForm.submit();
  };

  const handleCancel = () => {
    setVisibleModal(false);
  };

  const showModal = () => {
    setVisibleModal(true);
  };

  const handSubmit = useCallback(
    (value: any) => {
      let store_name = listStores.find((data) => data.id === value.store_id)?.name;

      let ecommerce_name = "Biên bản đơn tự tạo";
      if (value !== -1) {
        let changeName = listChannels.find((data) => data.id === value.ecommerce_id)?.name;
        ecommerce_name = changeName ? changeName : "Biên bản đơn tự tạo";
      }

      let delivery_service_name = listThirdPartyLogistics.find(
        (data) => data.id === value.delivery_service_id,
      )?.name;
      let receipt_type_name = listGoodsReceiptsType?.find(
        (data) => data.id === value.receipt_type_id,
      )?.name;

      let param: any = {
        ...value,
        store_name: store_name,
        ecommerce_name: ecommerce_name,
        delivery_service_name: delivery_service_name,
        receipt_type_name: receipt_type_name,
        delivery_service_type:
          value.delivery_service_id === -1
            ? ShipmentMethod.EMPLOYEE
            : ShipmentMethod.EXTERNAL_SHIPPER,
      };

      dispatch(
        createGoodsReceipts(param, (value: GoodsReceiptsResponse) => {
          if (value) {
            showSuccess("Thêm biên bản bàn giao thành công");
            setVisibleModal(false);
            goodsReceiptsForm.resetFields();

            let fromDate: Moment | undefined = convertFromStringToDate(
              moment(new Date().setHours(-72)),
              "yyyy-MM-dd'T'HH:mm:ss'Z'",
            )?.startOf("day");
            let toDate: Moment | undefined = convertFromStringToDate(
              new Date(),
              "yyyy-MM-dd'T'HH:mm:ss'Z'",
            )?.endOf("day");

            initQueryGoodsReceipts.limit = 1000;
            initQueryGoodsReceipts.page = 1;
            initQueryGoodsReceipts.from_date = fromDate;
            initQueryGoodsReceipts.to_date = toDate;

            dispatch(
              getGoodsReceiptsSearch(
                initQueryGoodsReceipts,
                (data: PageResponse<GoodsReceiptsResponse>) => {
                  setListGoodsReceipts(data.items);
                  let index = data.items.findIndex((p) => p.id === value.id);
                  if (index !== -1) setGoodsReceipts(value);
                },
              ),
            );
          }
        }),
      );
    },
    [
      dispatch,
      listGoodsReceiptsType,
      listStores,
      listThirdPartyLogistics,
      listChannels,
      goodsReceiptsForm,
    ],
  );

  /**
   *
   * @param orderMap kiểm tra tính hợp lệ trước khi lưu đơn hàng vào biên bản
   * @param receiptTypeId
   * @returns true or false
   */
  const validateFulfillments = (
    orderMap: OrderWithFulfillmentActiveModel[],
    receiptTypeId?: number,
  ) => {
    const orderCodes = orderMap.map((p) => p.code);
    const fulfillmentCodes = orderMap.map((p) => p.fulfillment_active);
    const orderPushDeliveryNotCompleted: OrderWithFulfillmentActiveModel[] = orderMap.filter(
      (p: OrderWithFulfillmentActiveModel) =>
        p.fulfillment_active?.shipment?.pushing_status &&
        p.fulfillment_active?.shipment?.pushing_status !== PUSHING_STATUS.COMPLETED,
    );
    const findDuplicated: string[] = orderCodes.filter(
      (item, index: number) => orderCodes.indexOf(item) !== index,
    );
    const fulfillmentIsNotPack = fulfillmentCodes.filter((item) => !isFulfillmentPacked(item));

    if (findDuplicated && findDuplicated.length > 0) {
      showModalError(
        <React.Fragment>
          {findDuplicated.map((p) => (
            <div>
              Đơn hàng <b>{p}</b> đã có trong biên bản
            </div>
          ))}
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
              Đơn giao <b>{p?.code}</b> không ở trạng thái đã đóng gói
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
  };

  const handOrderAddGoodsReceipts = useCallback(() => {
    if (!goodsReceipts) {
      showWarning("Chưa chọn biên bản bàn giao");
      return;
    }

    if (orderPackSuccess.length === 0) {
      showWarning("Chưa có đơn giao đã đóng gói");
      return;
    }

    if (goodsReceipts.orders && goodsReceipts.orders.length > 0) {
      let indexShipping = goodsReceipts.orders?.findIndex(
        (p) => p.fulfillment_status === FulFillmentStatus.SHIPPING,
      );

      if (indexShipping !== -1) {
        showModalError(
          `Không thể cập nhật biên bản, Đơn giao ${goodsReceipts.orders[indexShipping].code} đã xuất kho`,
        );
        return;
      }
    }

    let selectFulfillmentPackSuccess = orderPackSuccess?.filter((p) =>
      isFulFillmentPack.some((single) => single === p.order_code),
    );
    let notSelectOrderPackSuccess = orderPackSuccess?.filter(
      (p) => !isFulFillmentPack.some((single) => single === p.order_code),
    );

    if (
      !selectFulfillmentPackSuccess ||
      (selectFulfillmentPackSuccess && selectFulfillmentPackSuccess.length === 0)
    ) {
      showWarning("chưa chọn đơn giao cần thêm vào biên bản");
      return;
    }

    const handleGoodsReceipts = (receiptsItem: GoodsReceiptsResponse) => {
      const saveFFMOrderNew = () => {
        let queryCode = selectFulfillmentPackSuccess
          ? selectFulfillmentPackSuccess.map((p) => p.order_code)
          : [];
        let queryParam: any = { code: queryCode };
        let orderMapSingleFulfillment: OrderWithFulfillmentActiveModel[] = [];
        setIsLoading(true);
        getListOrderApi(queryParam)
          .then((response) => {
            setIsLoading(false);
            if (isFetchApiSuccessful(response)) {
              let orderData = response.data.items;
              if (orderData && orderData.length > 0) {
                let orderMap: OrderWithFulfillmentActiveModel[] = orderData.map((p) => {
                  return {
                    ...p,
                    fulfillment_active: getFulfillmentActive(p.fulfillments),
                  };
                });

                orderMapSingleFulfillment = [...orderMap];
              }
            } else {
              handleFetchApiError(response, "Danh sách fulfillment", dispatch);
            }
          })
          .then(() => {
            /**
             * kiểm tra các đơn hợp lệ
             * đơn có sẵn trong biên bản
             */
            if (receiptsItem && receiptsItem.orders && receiptsItem.orders?.length > 0) {
              const orderMap: OrderWithFulfillmentActiveModel[] = receiptsItem.orders.map((p) => {
                return {
                  ...p,
                  total_weight: null,
                  payments: [],
                  channel_code: "",
                  total_quantity: 0,
                  fulfillment_active: getFulfillmentActive(p.fulfillments),
                };
              });

              orderMapSingleFulfillment = [...orderMapSingleFulfillment, ...orderMap];
            }
          })
          .then(() => {
            let isValid = validateFulfillments(orderMapSingleFulfillment);

            let param: any = {
              ...receiptsItem,
              codes: orderMapSingleFulfillment.map((p) => p.fulfillment_active?.code || ""),
            };

            // console.log(param);

            if (isValid) {
              /**
               * lưu đơn hàng vào biên bản
               */
              dispatch(
                updateGoodsReceipts(receiptsItem.id, param, (value: GoodsReceiptsResponse) => {
                  if (value) {
                    setGoodsReceipts(value);

                    let packData: PackModel = {
                      ...new PackModelDefaultValue(),
                      ...singlePack,
                      fulfillments: [...notSelectOrderPackSuccess],
                    };

                    setSinglePack(packData);
                    setPackInfo(packData);
                    setIsFulFillmentPack([]);
                    showSuccess("Thêm đơn hàng vào biên bản bàn giao thành công");
                    let pathname = `${process.env.PUBLIC_URL}${UrlConfig.DELIVERY_RECORDS}/${value.id}`;
                    window.open(pathname, "_blank");
                  } else {
                    showError("Thêm đơn hàng vào biên bản bàn giao thất bại");
                  }
                }),
              );
            }
          });
      };

      saveFFMOrderNew();
    };
    handleGoodsReceipts(goodsReceipts);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    goodsReceipts,
    orderPackSuccess,
    isFulFillmentPack,
    dispatch,
    singlePack,
    setSinglePack,
    setIsFulFillmentPack,
  ]);

  useEffect(() => {
    let fromDate = moment().startOf("day").subtract(3, "days").format(dateFormat);
    let toDate = moment().endOf("day").format(dateFormat);

    initQueryGoodsReceipts.limit = 1000;
    initQueryGoodsReceipts.page = 1;
    initQueryGoodsReceipts.from_date = formatDateTimeOrderFilter(fromDate, dateFormat);
    initQueryGoodsReceipts.to_date = formatDateTimeOrderFilter(toDate, dateFormat);

    dispatch(
      getGoodsReceiptsSearch(
        initQueryGoodsReceipts,
        (data: PageResponse<GoodsReceiptsResponse>) => {
          setListGoodsReceipts(data.items);
        },
      ),
    );
  }, [dispatch]);

  const selectGoodsReceipts = useCallback(
    (value: number) => {
      let indexGoods = listGoodsReceipts.findIndex(
        (data: GoodsReceiptsResponse) => data.id === value,
      );
      if (indexGoods !== -1) {
        // console.log("selectGoodsReceipts", listGoodsReceipts[indexGoods])
        dispatch(
          getByIdGoodsReceipts(listGoodsReceipts[indexGoods].id, (receiptsItem) => {
            setGoodsReceipts(receiptsItem);
          }),
        );
      } else setGoodsReceipts(undefined);
    },
    [dispatch, listGoodsReceipts],
  );

  useEffect(() => {
    formRef.current?.setFieldsValue({
      store_id: singlePack?.store_id,
      //delivery_service_id:singlePack?.delivery_service_provider_id
    });
  }, [formRef, singlePack?.store_id]);

  return (
    <Card title="Cho vào biên bản bàn giao" bordered={false} className="pack-give-card">
      <div className="yody-pack-row">
        <Row className="pack-give-card-row">
          <div className="pack-give-card-row-item" style={{ width: "35%" }}>
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
              value={goodsReceipts?.id}
              ref={goodsReceiptsRef}
            >
              {listGoodsReceipts.map((item, index) => (
                <Select.Option key={index.toString()} value={item.id}>
                  {+item.delivery_service_id === -1
                    ? `${item.id} - ${item.store_name} - Tự giao hàng`
                    : `${item.id} - ${item.store_name} - ${item.delivery_service_name}`}{" "}
                  - {``}
                  {item.receipt_type_name}- {item.ecommerce_name}
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
        </Row>
      </div>
      <ReportHandOverModal
        visible={visibleModal}
        formRef={formRef}
        goodsReceiptsForm={goodsReceiptsForm}
        handSubmit={handSubmit}
        handleOk={handleOk}
        handleCancel={handleCancel}
      />
    </Card>
  );
};

export default AddReportHandOver;
