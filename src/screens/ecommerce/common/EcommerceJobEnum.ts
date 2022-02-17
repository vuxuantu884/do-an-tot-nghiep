const labelJob = [
    {
      label: "stock",
      display: "Đồng bộ tồn",
      cancel_success_message: "Hủy đồng bộ tồn thành công",
      cancel_fail_message: "Hủy đồng bộ tồn thất bại"
    },
    {
      label: "variant",
      display: "Tải sản phẩm",
      cancel_success_message: "Hủy tải sản phẩm thành công",
      cancel_fail_message: "Hủy đồng bộ tồn thất bại"
    },
    {
      label: "order",
      display: "Tải đơn hàng",
      cancel_success_message: "Hủy tải đơn hàng thành công",
      cancel_fail_message:"Hủy tải đơn hàng thất bại",
    },
    {
      label: "import",
      display: "Đồng bộ sản phẩm",
      cancel_success_message: "Hủy đồng bộ sản phẩm bằng file thành công",
      cancel_fail_message: "Hủy đồng bộ sản phẩm bằng file thất bại",
    },
    {
      label: "export",
      display: "Xuất sản phẩm",
      cancel_success_message: "Hủy xuất sản phẩm ra excel thành công",
      cancel_fail_message: "Hủy đồng bộ sản phẩm bằng file thất bại",
    },
    {
      label: "sync-variant",
      display: "Đồng bộ sản phẩm",
      cancel_success_message: "Hủy đồng bộ sản phẩm thành công",
      cancel_fail_message: "Hủy đồng bộ sản phẩm bằng file thất bại",
    },
  ]

export default {
  cancelSuccessMessage: (type: String) => {
    return labelJob.find(item => item.label === type)?.cancel_success_message
  },
  cancelFailMessage: (type: String) => {
    return labelJob.find(item => item.label === type)?.cancel_fail_message
  },
  getDisplay: (type: String) => {
   return labelJob.find(item => item.label === type)
  }
}