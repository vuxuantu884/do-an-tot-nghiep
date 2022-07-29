export const PaymentStatus = {
  UNPAID: "unpaid",
  PAID: "paid",
  PARTIAL_PAID: "partial_paid",
  REFUNDING: "refunding",
  getName: (status: string) => {
    switch (status) {
      case PaymentStatus.UNPAID:
        return "Chưa thanh toán";
      case PaymentStatus.PAID:
        return "Đã lấy hàng";
      case PaymentStatus.PARTIAL_PAID:
        return "Giao một phần";
      case PaymentStatus.REFUNDING:
      default:
        return "";
    }
  },
  getAll: () => {
    return [
      PaymentStatus.UNPAID,
      PaymentStatus.PAID,
      PaymentStatus.PARTIAL_PAID,
      PaymentStatus.REFUNDING,
    ];
  },
};
