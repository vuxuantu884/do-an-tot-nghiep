import {
  FileExcelOutlined,
  PrinterOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";
import ContentContainer from "component/container/content.container";
import { MenuAction } from "component/table/ActionButton";
import UrlConfig from "config/url.config";
import { getByIdGoodsReceipts } from "domain/actions/goods-receipts/goods-receipts.action";
import {
  FulfillmentsItemModel,
  GoodsReceiptsFileModel,
  GoodsReceiptsOrderListModel,
  GoodsReceiptsTotalProductModel,
} from "model/pack/pack.model";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import { useReactToPrint } from "react-to-print";
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

  //useRef
  const printElementRef = React.useRef(null);
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  let { id } = useParams<PackParam>();
  let PackId = parseInt(id);

  const [isError, setError] = useState<boolean>(false);
  const [packDetail, setPackDetail] = useState<GoodsReceiptsResponse>();
  const [packFile] = useState<GoodsReceiptsFileModel[]>([
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

  const [packProductQuantity, setPackProductQuantity] = useState<GoodsReceiptsTotalProductModel[]>([]);

  const [packOrderList, setPackOrderList] = useState<GoodsReceiptsOrderListModel[]>([]);

  const [htmlContent, setHtmlContent] = useState("");
  const [selectedOrderList,setSelectedOrderList]=useState<GoodsReceiptsOrderListModel[]>([]);

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
                  variant_id: itemProduct.variant_id,
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

            let total_quantity = 0;
            let total_price = 0;
            let postage = 0;
            let card_number = 0;

            let _itemProduct: FulfillmentsItemModel[] = [];

            itemOrder.fulfillments?.forEach(function (itemFFM) {

              total_quantity += itemFFM.total_quantity ? itemFFM.total_quantity : 0;
              total_price += itemFFM.total ? itemFFM.total : 0;
              postage += itemFFM?.shipment?.shipping_fee_informed_to_customer ? itemFFM.shipment.shipping_fee_informed_to_customer : 0;

              itemFFM.items.forEach(function (itemProduct) {
                _itemProduct.push({
                  sku: itemProduct.sku,
                  product_id: itemProduct.product_id,
                  variant_id: itemProduct.variant_id,
                  variant: itemProduct.variant,
                  variant_barcode: itemProduct.variant_barcode,
                  net_weight: itemProduct.weight,
                  quantity: itemProduct.quantity,
                  price: itemProduct.price
                })
              });
            });

            itemOrder.payments?.forEach(function (itemPayment) {
              card_number += itemPayment.amount;
            })

            resultListOrder.push({
              key: keyOrder++,
              order_id: itemOrder.id,
              order_code: itemOrder.code,
              customer_name: itemOrder.customer ? itemOrder.customer : "n/a",
              total_quantity: total_quantity,
              total_price: total_price,
              postage: postage,
              card_number: card_number,//tong thanh toan
              status: "",
              note: itemOrder.note,
              items: _itemProduct
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

  const handleDownLoad = () => { };
  const handleDeleteFile = () => { };

  const handlePrintPackFull = useCallback(() => { 
    console.log("selectedOrderList",selectedOrderList);
    setHtmlContent("Biên bản bàn giao đẩy đủ");
    setTimeout(() => {
      if (handlePrint) {
        handlePrint();
      }
    }, 500);
  },[selectedOrderList,handlePrint]);

  const handlePrintPackCompact =useCallback( () => { 
    console.log("selectedOrderList",selectedOrderList);
    setHtmlContent("Biên bản bàn giao rút gọn");
    setTimeout(() => {
      if (handlePrint) {
        handlePrint();
      }
    }, 500);
    
  },[selectedOrderList,handlePrint]);

  const handleExportExcelOrderPack = useCallback(() => {
    console.log("ok")
  },[]);

  const handleAddOrderInPack = () => { };

  const handleSearchOrder = (value: any) => { };

  const onMenuListOrderClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          handlePrintPackFull();
          break;
        case 2:
          handlePrintPackCompact();
          break;
        case 3:
          handleExportExcelOrderPack();
          break;
        case 4:
          history.push(`${UrlConfig.PACK_SUPPORT}/report-hand-over-update/${PackId}`);
          break;
        default:
          break;
      }
    },
    [history, PackId,handleExportExcelOrderPack,handlePrintPackFull,handlePrintPackCompact]
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
        handleAddOrderInPack={handleAddOrderInPack}
      />

      <PackListOrder
        packOrderList={packOrderList}
        actions={actions}
        handleSearchOrder={handleSearchOrder}
        onMenuClick={onMenuListOrderClick}
        setSelectedOrderList={setSelectedOrderList}
      />
			
			<React.Fragment>
				<div style={{ display: "none" }}>
					<div className="printContent" ref={printElementRef}>
						<div
							dangerouslySetInnerHTML={{
								__html: htmlContent,
							}}
						>
							{/* {renderHtml(fake_printer_content())} */}
						</div>
					</div>
				</div>
			</React.Fragment>
    </ContentContainer>
  );
};

export default PackDetail;
