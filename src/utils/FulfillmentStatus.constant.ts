export const FulfillmentStatus = {
    UNSHIPPED: "unshipped",
    PICKED: "picked",
    PARTIAL: "partial",
    PACKED: "packed",
    SHIPPING: "shipping",
    SHIPPED: "shipped",
    CANCELLED: "cancelled",
    RETURNING: "returning",
    RETURNED: "returned",
    getName: (status: string) => {
      switch (status){
        case FulfillmentStatus.UNSHIPPED:
            return "Chưa giao";
        case FulfillmentStatus.PICKED:
            return "Đã lấy hàng";
        case FulfillmentStatus.PARTIAL:
            return "Giao một phần";
        case FulfillmentStatus.PACKED:
            return "Đã đóng gói";
        case FulfillmentStatus.SHIPPING:
            return "Đang giao";
        case FulfillmentStatus.SHIPPED:
            return "Đã giao";
        case FulfillmentStatus.CANCELLED:
            return "Đã huỷ";
        case FulfillmentStatus.RETURNING:
            return "Đang trả lại";
        case FulfillmentStatus.RETURNED:
            return "Đã trả lại";
        default:
            return "";
      }
    },
    getAll: () => {
        return [
            FulfillmentStatus.UNSHIPPED,
            FulfillmentStatus.PICKED,
            FulfillmentStatus.PARTIAL,
            FulfillmentStatus.PACKED,
            FulfillmentStatus.SHIPPING,
            FulfillmentStatus.SHIPPED,
            FulfillmentStatus.CANCELLED,
            FulfillmentStatus.RETURNING,
            FulfillmentStatus.RETURNED

        ]
    },
    getListWebApp: () => {
        return [
            FulfillmentStatus.UNSHIPPED,
            FulfillmentStatus.SHIPPING,
            FulfillmentStatus.SHIPPED
        ]
    }
  }