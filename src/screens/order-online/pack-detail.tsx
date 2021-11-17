import {
  FileExcelOutlined,
  PrinterOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";
import ContentContainer from "component/container/content.container";
import {MenuAction} from "component/table/ActionButton";
import UrlConfig from "config/url.config";
import {getByIdGoodsReceipts} from "domain/actions/goods-receipts/goods-receipts.action";
import {
  GoodsReceiptsFileModel,
  GoodsReceiptsOrderListModel,
  GoodsReceiptsTotalProductModel,
} from "model/pack/pack.model";
import {GoodsReceiptsResponse} from "model/response/pack/pack.response";
import {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useHistory, useParams} from "react-router";
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
  const history = useHistory();

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
      dispatch(
        getByIdGoodsReceipts(PackId, (data: GoodsReceiptsResponse) => {
          setPackDetail(data);

          //PackQuantityProduct
          let keyProduct = 0;
          let resultListProduct: GoodsReceiptsTotalProductModel[] = [];

          let keyOrder = 0;
          let resultListOrder:GoodsReceiptsOrderListModel[]=[];

          data.orders?.forEach(function (itemOrder) {
            itemOrder.fulfillments?.forEach(function (itemFFM) {
              itemFFM.items.forEach(function (itemProduct, index) {
                resultListProduct.push({
                  key: keyProduct++,
                  barcode: itemProduct.variant_barcode,
                  product_id: itemProduct.product_id,
                  product_sku: itemProduct.sku,
                  product_name: itemProduct.product,
                  inventory: itemProduct.available?itemProduct.available:0,
                  price: itemProduct.price,
                  total_quantity: itemProduct.quantity,
                  total_incomplate: 0,
                });

                ///
                resultListOrder.push({
                  key:keyOrder++,
                  order_id:itemOrder.id?itemOrder.id:0,
                  order_code:itemOrder.code?itemOrder.code:"n/a",
                  customer_name:itemOrder.customer?itemOrder.customer:"n/a",
                  product_sku:itemProduct.sku,
                  product_name:itemProduct.product,
                  net_weight:0,
                  total_quantity:itemProduct.quantity,
                  total_price:itemProduct.price,
                  postage:0,
                  card_number:0,
                  status:"",
                  note:"",
                })
              });
            });
          });
          setPackProductQuantity(resultListProduct);
          setPackOrderList(resultListOrder);
          //
          //PackListOrder

          // data.orders?.forEach(function (itemOrder) {
          //   let _item:GoodsReceiptsOrderListModel={
          //     key:keyOrder++,
          //     order_id:itemOrder.order_id?itemOrder.order_id:0,
          //     order_code:itemOrder.order_code?itemOrder.order_code:"n/a",
          //     customer_name:itemOrder.customer?itemOrder.customer:"n/a",
          //     product_sku:itemOrder.
          //     product_name:string;
          //     net_weight:number;
          //     total_quantity:number;
          //     total_price:number;
          //     postage:number;
          //     card_number:number;
          //     status:string;
          //     note:string;
          //   }
          // });
          //
        })
      );
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

  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 1:
        // orderListResponse.forEach(function(data,index){
        //   orderListResponse.splice(index, 1);
        // })
        break;
      case 4:
        history.push(`${UrlConfig.PACK_SUPPORT}/report-hand-over-update/${PackId}`);
        break;
      default:
        break;
    }
  }, [history,PackId]);

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
