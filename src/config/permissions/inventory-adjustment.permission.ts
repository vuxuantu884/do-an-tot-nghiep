
const inventory_adjustment = "inventory_adjustment";

export const InventoryAdjustmentPermission = {
  create: `${inventory_adjustment}_create`, //Tạo phiếu kiểm kho
  update:`${inventory_adjustment}_update`, //Sửa thông tin phiếu kiểm
  read:`${inventory_adjustment}_read`, //Xem phiếu kiểm kho
  audit:`${inventory_adjustment}_audit`, //Kiểm kho online
  adjust:`${inventory_adjustment}_adjust`, //Cân bằng tồn kho
  print : `${inventory_adjustment}_print`, //In biên bản xử lí hàng thừa thiếu
  import : `${inventory_adjustment}_import`, //Import excel(Kiểm kho offline)
  export : `${inventory_adjustment}_export`, //Xuất excel danh sách sản phẩm
};
