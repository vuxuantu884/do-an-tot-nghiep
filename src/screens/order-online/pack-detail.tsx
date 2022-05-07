import {
  FileExcelOutlined,
  PrinterOutlined,
  ReconciliationOutlined,
} from "@ant-design/icons";
import ContentContainer from "component/container/content.container";
import { MenuAction } from "component/table/ActionButton";
import { HttpStatus } from "config/http-status.config";
import UrlConfig from "config/url.config";
import { getByIdGoodsReceipts, getPrintGoodsReceipts } from "domain/actions/goods-receipts/goods-receipts.action";
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
import { exportFile, getFile } from "service/other/export.service";
import { generateQuery } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import PackDetailInfo from "./pack/detail/pack-detail-info";
import PackListOrder from "./pack/detail/pack-list-order";
import PackQuantityProduct from "./pack/detail/pack-quantity-product";
import './pack/styles.scss';

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
    name: "Thêm/xoá đơn hàng vào biên bản",
    icon: <ReconciliationOutlined />,
  }
];

const typePrint = {
  simple: "simple",
  detail: "detail"
}

interface GoodReceiptPrint {
  good_receipt_id: number;
  html_content: string;
  size: string;
}

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
    // {
    //   file_name: "Nhanh.vn_Shipping_Hanover_1124699_20210927_134025.xlsx",
    //   create_name: "le van long",
    //   create_time: "17-11-2021",
    // },
    // {
    //   file_name: "Nhanh.vn_Shipping_Hanover_1124699_20210927_134025.xlsx",
    //   create_name: "le van long",
    //   create_time: "17-11-2021",
    // },
  ]);

  const [packProductQuantity, setPackProductQuantity] = useState<GoodsReceiptsTotalProductModel[]>([]);

  const [packOrderList, setPackOrderList] = useState<GoodsReceiptsOrderListModel[]>([]);

  const [htmlContent, setHtmlContent] = useState("");
  useEffect(() => {
    if (PackId) {
      dispatch(
        getByIdGoodsReceipts(PackId, (data: GoodsReceiptsResponse) => {
          setPackDetail(data);

          //PackQuantityProduct
          let keyProduct = 0;
          let resultListProduct: any[] = [];

          let keyOrder = 0;
          let resultListOrder: GoodsReceiptsOrderListModel[] = [];

          data.orders?.forEach(function (itemOrder) {
            itemOrder.fulfillments?.forEach(function (itemFFM) {
              if (data.receipt_type_id === 1) {
                if (itemFFM.status === "packed") {
                  itemFFM.items.forEach(function (itemProduct, index) {
                    ////
                    const productOnHand = data.variant?.find(i => i.sku === itemProduct.sku)
                    resultListProduct.push({
                      key: keyProduct++,
                      barcode: itemProduct.variant_barcode,
                      product_id: itemProduct.product_id,
                      product_sku: itemProduct.sku,
                      product_name: itemProduct.product,
                      variant_id: itemProduct.variant_id,
                      // inventory: itemProduct.available ? itemProduct.available : 0,
                      price: itemProduct.price,
                      total_quantity: itemProduct.quantity,
                      total_incomplate: 0,
                      on_hand: productOnHand ? productOnHand.on_hand : undefined,
                    });

                    ///
                  });
                }
              } else if (data.receipt_type_id === 2) {
                if (itemFFM.status === "cancelled") {
                  itemFFM.items.forEach(function (itemProduct, index) {
                    ////
                    const productOnHand = data.variant?.find(i => i.sku === itemProduct.sku)
                    resultListProduct.push({
                      key: keyProduct++,
                      barcode: itemProduct.variant_barcode,
                      product_id: itemProduct.product_id,
                      product_sku: itemProduct.sku,
                      product_name: itemProduct.product,
                      variant_id: itemProduct.variant_id,
                      // inventory: itemProduct.available ? itemProduct.available : 0,
                      price: itemProduct.price,
                      total_quantity: itemProduct.quantity,
                      total_incomplate: 0,
                      on_hand: productOnHand ? productOnHand.on_hand : undefined,
                    });


                    ///
                  });
                }
              }

            });
          });



          data.orders?.forEach(function (itemOrder) {
            let total_quantity = 0;
            let total_price = 0;
            let postage = 0;
            let card_number = 0;
            let ffrmCode = null;
            let trackingCode = null;

            let _itemProduct: FulfillmentsItemModel[] = [];
            const ffms = itemOrder.fulfillments?.filter(ffm => {
              if (data.receipt_type_id === 1) {
                return ffm.status === 'packed'
              }
              return ffm.status === 'cancelled'
            });
            ffms?.forEach(function (itemFFM) {

              total_quantity += itemFFM.total_quantity ? itemFFM.total_quantity : 0;
              total_price += itemFFM.total ? itemFFM.total : 0;
              postage += itemFFM?.shipment?.shipping_fee_informed_to_customer ? itemFFM.shipment.shipping_fee_informed_to_customer : 0;
              ffrmCode = itemFFM.code;
              trackingCode = itemFFM.shipment?.tracking_code;
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
              ffm_code: ffrmCode || "",
              tracking_code: trackingCode || "",
              customer_name: itemOrder.customer ? itemOrder.customer : "n/a",
              total_quantity: total_quantity,
              total_price: total_price,
              postage: postage,
              card_number: card_number,//tong thanh toan
              sub_status: itemOrder.sub_status,
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

  const handlePrintPack = useCallback((type: string) => {
    dispatch(getPrintGoodsReceipts([PackId], type, (data: GoodReceiptPrint[]) => {
      if (data && data.length > 0) {
        setHtmlContent(data[0].html_content);
        setTimeout(() => {
          if (handlePrint) {
            handlePrint();
          }
        }, 500);
      }
    }))
  }, [dispatch, PackId, handlePrint]);

  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [statusExport, setStatusExport] = useState<number>(1);
  // const [exportError, setExportError] = useState<string>("");
  // const [exportProgress, setExportProgress] = useState<number>(0);
  
  const handleExportExcelOrderPack = useCallback(() => {
    let codes: any[] = [];
    packDetail && packDetail.orders && packDetail.orders.forEach((p) => codes.push(p.code));
    let queryParams = generateQuery({ code: codes });
    console.log("queryParams", queryParams)
    exportFile({
      conditions: queryParams,
      type: "EXPORT_ORDER"
      //hidden_fields: hiddenFieldsExport,
    })
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          showSuccess("Đã gửi yêu cầu xuất file");
          if (response.data && response.data.status === "FINISH") {
            window.open(response.data.url);
            setStatusExport(3);
          }
        }
      })
      .catch((error) => {
        console.log("orders export file error", error);
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [packDetail]);

  const checkExportFile = useCallback(() => {

    let getFilePromises = listExportFile.map((code) => {
      return getFile(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.status === "FINISH") {
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            window.open(response.data.url);
            setListExportFile(newListExportFile);
            setStatusExport(3);
          }
          if (response.data && response.data.status === "ERROR") {
            setStatusExport(4);
            showError("Có lỗi xảy ra, vui lòng thử lại sau");
            // setExportError(response.data.message);
          }
        } else {
          setStatusExport(4);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        }
      });
    });
  }, [listExportFile]);

  const handleAddOrderInPack = () => { };


  const handleSearchOrder = (value: any) => { };

  const onMenuListOrderClick = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          handlePrintPack(typePrint.detail);
          break;
        case 2:
          handlePrintPack(typePrint.simple);
          break;
        case 3:
          handleExportExcelOrderPack();
          break;
        case 4:
          history.push(`${UrlConfig.DELIVERY_RECORDS}/${PackId}/update`);
          break;
        default:
          break;
      }
    },
    [handlePrintPack, handleExportExcelOrderPack, history, PackId]
  );

  useEffect(() => {
    if (listExportFile.length === 0 || statusExport === 3 || statusExport === 4) return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [listExportFile, checkExportFile, statusExport]);

  return (
    <ContentContainer
      title={`Biên bản bàn giao: ${PackId}`}
      isError={isError}
      breadcrumb={[
        {
          name: "Đơn hàng",
          path: UrlConfig.ORDER,
        },
        {
          name: "Biên bản bàn giao",
          path: UrlConfig.DELIVERY_RECORDS,
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
      />

      <React.Fragment>
        <div style={{ display: "none" }}>
          <div className="printContent" ref={printElementRef}>
            <div
              dangerouslySetInnerHTML={{
                __html: htmlContent,
              }}
            >
            </div>
          </div>
        </div>
      </React.Fragment>
    </ContentContainer>
  );
};

export default PackDetail;
