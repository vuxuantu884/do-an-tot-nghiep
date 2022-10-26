import { FulFillmentResponse } from "model/response/order/order.response";
import { FulFillmentStatus } from "utils/Constants";
import audioError from "assets/audio/am-bao-tra-loi-sai.wav";
import { showModalError } from "./ToastUtils";

/*
 *lấy dữ liệu ffm đã đóng gói
 */
export const getFullfilmentPacked = (fulfillment: FulFillmentResponse[]) => {
  let fulfillmentResult = fulfillment.filter((p) => p.status === FulFillmentStatus.PACKED);
  return fulfillmentResult;
};

/*
 *lấy dữ liệu ffm đang hoàn
 */
export const getFullfilmentReturning = (fulfillment: FulFillmentResponse[]) => {
  let fulfillmentResult = fulfillment.filter(
    (p) =>
      p.status === FulFillmentStatus.SHIPPING && p.return_status === FulFillmentStatus.RETURNING,
  );
  return fulfillmentResult;
};

/*
 *kiểm tra là đơn đã đóng gói
 */
export const isFulfillmentPacked = (fulfillment: FulFillmentResponse | any) => {
  let fulfillmentBol = fulfillment?.status === FulFillmentStatus.PACKED;

  return fulfillmentBol;
};

/*
 *kiểm tra là đơn xuất kho hoặc đơn thành công
 */
export const isFulfillmentShiping = (fulfillment: FulFillmentResponse | any) => {
  let fulfillmentBol =
    (fulfillment.status === FulFillmentStatus.SHIPPING ||
      fulfillment.status === FulFillmentStatus.SHIPPED) &&
    fulfillment.return_status === FulFillmentStatus.UNRETURNED;

  return fulfillmentBol;
};

/*
 *kiểm tra là đơn hvc đang hoàn
 */
export const isFullfilmentReturning = (fulfillment: FulFillmentResponse | any) => {
  let fulfillmentBol =
    fulfillment.status === FulFillmentStatus.SHIPPING &&
    fulfillment.return_status === FulFillmentStatus.RETURNING;

  return fulfillmentBol;
};

/*
 *kiểm tra là đơn hvc đã hoàn
 */
export const isFullfilmentReturned = (fulfillment: FulFillmentResponse | any) => {
  let fulfillmentBol =
    fulfillment.status === FulFillmentStatus.CANCELLED &&
    fulfillment.return_status === FulFillmentStatus.RETURNED;
  //&& fullfilment.status_before_cancellation === FulFillmentStatus.SHIPPING;

  return fulfillmentBol;
};

export const showModalErrorAudio = (msg: React.ReactNode, title?: string | undefined) => {
  const AudioErrorPlay = new Audio(audioError);
  AudioErrorPlay.play();
  AudioErrorPlay.currentTime = 1;
  showModalError(msg, title);
};
