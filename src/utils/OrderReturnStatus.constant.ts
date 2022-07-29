export const OrderReturnStatus = {
  RETURNED: "returned",
  UNRETURNED: "unreturned",
  getName: (status: string) => {
    switch (status) {
      case OrderReturnStatus.RETURNED:
        return "Có đổi trả hàng";
      case OrderReturnStatus.UNRETURNED:
        return "Không đổi trả hàng";
      default:
        return "";
    }
  },
  getAll: () => {
    return [OrderReturnStatus.RETURNED, OrderReturnStatus.UNRETURNED];
  },
};
