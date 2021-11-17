import {
  FileExcelOutlined,
  PrinterOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";
import ContentContainer from "component/container/content.container";
import {MenuAction} from "component/table/ActionButton";
import UrlConfig from "config/url.config";
import {getByIdGoodsReceipts} from "domain/actions/goods-receipts/goods-receipts.action";
import {PageResponse} from "model/base/base-metadata.response";
import {
  GoodsReceiptsFileModel,
  GoodsReceiptsOrderListModel,
  GoodsReceiptsTotalProductModel,
} from "model/pack/pack.model";
import {GoodsReceiptsResponse} from "model/response/pack/pack.response";
import {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useParams} from "react-router";
import PackDetailInfo from "./pack-support/pack-detail-info";
import PackListOrder from "./pack-support/pack-list-order";
import PackQuantityProduct from "./pack-support/pack-quantity-product";

type PackParam = {
  id: string;
};

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "In biên bản đầy đủ",
    icon: <PrinterOutlined />,
  },
  {
    id: 2,
    name: "In biên bản rút gọn",
    icon: <PrinterOutlined />,
  },
  {
    id: 3,
    name: "Xuất excel đơn hàng trong biên bản",
    icon: <FileExcelOutlined />,
  },
  {
    id: 4,
    name: "Thêm đơn hàng vào biên bản",
    icon: <ReconciliationOutlined />,
  },
];

const PackDetail: React.FC = () => {
  const dispatch = useDispatch();
  let {id} = useParams<PackParam>();
  let PackId = parseInt(id);

  const [isError, setError] = useState<boolean>(false);
  const [packDetail, setPackDetail] = useState<GoodsReceiptsResponse>();
  const [packFile, setPackFile] = useState<GoodsReceiptsFileModel[]>([
    {
      file_name: "Nhanh.vn_Shipping_Hanover_1124699_20210927_134025.xlsx",
      create_name: "le van long",
      create_time: "17-11-2021",
    },
    {
      file_name: "Nhanh.vn_Shipping_Hanover_1124699_20210927_134025.xlsx",
      create_name: "le van long",
      create_time: "17-11-2021",
    },
  ]);

  const [packProductQuantity, setPackProductQuantity] = useState<
    GoodsReceiptsTotalProductModel[]
  >([
    {
      key: 0,
      barcode: "12332443535",
      product_id: 1,
      product_sku: "APN3340 - XXA - XL",
      product_name: "Áo Polo mắt chim nam",
      inventory: 132,
      price: 500000,
      total_quantity: 4,
      total_incomplate: 6,
    },
    {
      key: 1,
      barcode: "12332443535",
      product_id: 1,
      product_sku: "APN3340 - XXA - XL",
      product_name: "Áo Polo mắt chim nam",
      inventory: 132,
      price: 500000,
      total_quantity: 4,
      total_incomplate: 6,
    },
    {
      key: 2,
      barcode: "12332443535",
      product_id: 1,
      product_sku: "APN3340 - XXA - XL",
      product_name: "Áo Polo mắt chim nam",
      inventory: 132,
      price: 500000,
      total_quantity: 4,
      total_incomplate: 6,
    },
  ]);

  const [packOrderList, setPackOrderList] = useState<GoodsReceiptsOrderListModel[]>([
    {
      key: 0,
      order_id: 1,
      order_code: "12332443535",
      customer_name: "Phạm Thị Lưu Luyến",
      product_sku: "APN3340 - XXA - XL",
      product_name: "Áo Polo mắt chim nam",
      net_weight: 132,
      total_quantity: 132,
      total_price: 500000,
      postage: 500000,
      card_number: 500000,
      status: "Chờ thu gom",
      note: "Ghi cái gì cũng được",
    },
    {
      key: 1,
      order_id: 1,
      order_code: "12332443535",
      customer_name: "Phạm Thị Lưu Luyến",
      product_sku: "APN3340 - XXA - XL",
      product_name: "Áo Polo mắt chim nam",
      net_weight: 132,
      total_quantity: 132,
      total_price: 500000,
      postage: 500000,
      card_number: 500000,
      status: "Chờ thu gom",
      note: "Ghi cái gì cũng được",
    },
  ]);

  useEffect(() => {
    if (PackId) {
      dispatch(getByIdGoodsReceipts(PackId, setPackDetail));
    } else {
      setError(true);
    }
  }, [dispatch, PackId]);
  console.log(PackId);

  const handleDownLoad = () => {};
  const handleDeleteFile = () => {};

  const handlePrintPackFull = () => {};
  const handlePrintPackCompact = () => {};
  const handleExportExcelOrderPack = () => {};
  const handleAddOrderInPack = () => {};

  const handleSearchOrder = (value: any) => {};

  const onMenuClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          // orderListResponse.forEach(function(data,index){
          //   orderListResponse.splice(index, 1);
          // })
          break;
        default:
          break;
      }
    },
    []
  );

  return (
    <ContentContainer
      title="Hỗ trợ đóng gói"
      isError={isError}
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
          name: "Hỗ trợ đóng gói",
          path: UrlConfig.PACK_SUPPORT,
        },
        {
          name: `Biên bản bàn giao: ${PackId}`,
        },
      ]}
    >
      <PackDetailInfo
        packDetail={packDetail}
        packFile={packFile}
        handleDownLoad={handleDownLoad}
        handleDeleteFile={handleDeleteFile}
      />

      <PackQuantityProduct
        packProductQuantity={packProductQuantity}
        handlePrintPackFull={handlePrintPackFull}
        handlePrintPackCompact={handlePrintPackCompact}
        handleExportExcelOrderPack={handleExportExcelOrderPack}
        handleAddOrderInPack={handleAddOrderInPack}
      />

      <PackListOrder
        packOrderList={packOrderList}
        actions={actions}
        handleSearchOrder={handleSearchOrder}
        onMenuClick={onMenuClick}
      />
    </ContentContainer>
  );
};

export default PackDetail;
