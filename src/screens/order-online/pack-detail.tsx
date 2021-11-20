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
  FulfillmentsItemModel,
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

  const [packOrderList, setPackOrderList] = useState<GoodsReceiptsOrderListModel[]>([]);

  useEffect(() => {
    if (PackId) {
      dispatch(
        getByIdGoodsReceipts(PackId, (data: GoodsReceiptsResponse) => {
          setPackDetail(data);

          //PackQuantityProduct
          let keyProduct = 0;
          let resultListProduct: GoodsReceiptsTotalProductModel[] = [];

          let keyOrder = 0;
          let resultListOrder: GoodsReceiptsOrderListModel[] = [];

          data.orders?.forEach(function (itemOrder) {
            itemOrder.fulfillments?.forEach(function (itemFFM) {
              itemFFM.items.forEach(function (itemProduct, index) {
                ////
                resultListProduct.push({
                  key: keyProduct++,
                  barcode: itemProduct.variant_barcode,
                  product_id: itemProduct.product_id,
                  product_sku: itemProduct.sku,
                  product_name: itemProduct.product,
                  inventory: itemProduct.available ? itemProduct.available : 0,
                  price: itemProduct.price,
                  total_quantity: itemProduct.quantity,
                  total_incomplate: 0,
                });
                
                ///
              });
            });
          });

          

          data.orders?.forEach(function (itemOrder) {

            let total_quantity=0;
            let total_price=0;
            let postage=0;
            let card_number=0;

            let _itemProduct:FulfillmentsItemModel[]=[];

            itemOrder.fulfillments?.forEach(function (itemFFM) {

              total_quantity+=itemFFM.total_quantity?itemFFM.total_quantity:0;
              total_price+=itemFFM.total?itemFFM.total:0;
              postage+=itemFFM?.shipment?.shipping_fee_informed_to_customer?itemFFM.shipment.shipping_fee_informed_to_customer:0;

              itemFFM.items.forEach(function (itemProduct) {
                _itemProduct.push({
                  sku: itemProduct.sku,
                  product_id:itemProduct.product_id,
                  variant_id: itemProduct.variant_id,
                  variant: itemProduct.variant,
                  variant_barcode:itemProduct.variant_barcode,
                  net_weight:itemProduct.weight,
                  quantity:itemProduct.quantity,
                  price:itemProduct.price
                })
              });
            });

            itemOrder.payments?.forEach(function(itemPayment){
              card_number+=itemPayment.amount;
            })

            resultListOrder.push({
              key:keyOrder++,
              order_id:itemOrder.id,
              order_code:itemOrder.code,
              customer_name:itemOrder.customer?itemOrder.customer:"n/a",
              total_quantity:total_quantity,
              total_price:total_price,
              postage:postage,
              card_number:card_number,//tong thanh toan
              status:"",
              note:itemOrder.note,
              items:_itemProduct
            })
          });
          setPackProductQuantity(resultListProduct);
          setPackOrderList(resultListOrder);
        })
      );
    } else {
      setError(true);
    }
  }, [dispatch, PackId]);
  console.log("resultListOrder",packOrderList)

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
        case 4:
          history.push(`${UrlConfig.PACK_SUPPORT}/report-hand-over-update/${PackId}`);
          break;
        default:
          break;
      }
    },
    [history, PackId]
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
