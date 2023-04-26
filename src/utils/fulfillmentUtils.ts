import { Shipment } from "./../model/order/shipment.model";
import { FulFillmentResponse } from "model/response/order/order.response";
import { FulFillmentStatus } from "utils/Constants";
import audioError from "assets/audio/am-bao-tra-loi-sai.wav";
import { showModalError } from "./ToastUtils";

/**
 * Là Fulfillment đã xác nhận
 * @param fulfillment
 * @returns
 */
export const isFulfillmentConfirmed = (fulfillment: FulFillmentResponse | any) => {
  if (!fulfillment) return false;
  return (
    fulfillment?.status === FulFillmentStatus.UNSHIPPED &&
    fulfillment.return_status === FulFillmentStatus.UNRETURNED
  );
};

/**
 * Là Fulfillment nhặt hàng
 * @param fulfillment
 * @returns
 */
export const isFulfillmentPicked = (fulfillment: FulFillmentResponse | any) => {
  if (!fulfillment) return false;
  return fulfillment?.status === FulFillmentStatus.PICKED;
};

/**
 * Là Fulfillment đã đóng gói
 *  * @param fulfillment
 * @returns
 */
export const isFulfillmentPacked = (fulfillment: FulFillmentResponse | any) => {
  if (!fulfillment) return false;
  return fulfillment?.status === FulFillmentStatus.PACKED;
};

/*
 *Là Fulfillment xuất kho
 * @param fulfillment
 * @returns
 */
export const isFulfillmentShipping = (fulfillment: FulFillmentResponse | any) => {
  if (!fulfillment) return false;

  return (
    fulfillment.status === FulFillmentStatus.SHIPPING &&
    fulfillment.return_status === FulFillmentStatus.UNRETURNED
  );
};

/*
 *Là Fulfillment giao thành công
 */
export const isFulfillmentShipped = (fulfillment: FulFillmentResponse | any) => {
  if (!fulfillment) return false;

  return (
    fulfillment.status === FulFillmentStatus.SHIPPED &&
    fulfillment.return_status === FulFillmentStatus.UNRETURNED
  );
};

/*
 *Là Fulfillment hvc đang hoàn
 */
export const isFulfillmentReturning = (fulfillment: FulFillmentResponse | any) => {
  if (!fulfillment) return false;

  return (
    fulfillment.status === FulFillmentStatus.SHIPPING &&
    fulfillment.return_status === FulFillmentStatus.RETURNING
  );
};

/*
 *Là Fulfillment hvc đã hoàn
 */
export const isFulfillmentReturned = (fulfillment: FulFillmentResponse | any) => {
  if (!fulfillment) return false;

  return (
    fulfillment.status === FulFillmentStatus.CANCELLED &&
    fulfillment.return_status === FulFillmentStatus.RETURNED &&
    fulfillment?.status_before_cancellation === FulFillmentStatus.SHIPPING
  );
};

export const sortFulfillments = (fulfillments: FulFillmentResponse[] | null | undefined) => {
  if (!fulfillments) {
    return [];
  }
  // lấy ffm có shipment, ko phải ffm ẩn rồi so sánh
  return fulfillments.filter((single) => single.shipment).sort((a, b) => b.id - a.id);
};

export const getFulfillmentActive = (fulfillments?: FulFillmentResponse[] | null | any) => {
  if (!fulfillments) return undefined; //không tìm thấy ffm

  let fulfillmentsExitsShipment = fulfillments.filter((p: any) => p.shipment);

  const sortedFulfillments = sortFulfillments(fulfillmentsExitsShipment);
  return sortedFulfillments[0];
};

/*
 *lấy dữ liệu ffm đã đóng gói
 */
export const getFulfillmentPacked = (fulfillment: FulFillmentResponse[]) => {
  let fulfillmentResult = fulfillment.filter((p) => isFulfillmentPacked(p));
  return fulfillmentResult;
};

/*
 *lấy dữ liệu ffm đang hoàn
 */
export const getFulfillmentReturning = (fulfillment: FulFillmentResponse[]) => {
  let fulfillmentResult = fulfillment.filter((p) => isFulfillmentReturning(p));
  return fulfillmentResult;
};

export const showModalErrorAudio = (msg: React.ReactNode, title?: string | undefined) => {
  const AudioErrorPlay = new Audio(audioError);
  AudioErrorPlay.play();
  AudioErrorPlay.currentTime = 1;
  showModalError(msg, title);
};

export const getLogisticsInFulfillment = (fulfillment: FulFillmentResponse | any) => {
  if (!fulfillment) return undefined; //không tìm thấy ffm
  const logistics = fulfillment.shipment?.delivery_service_provider_code;
  return logistics ?? undefined;
};
