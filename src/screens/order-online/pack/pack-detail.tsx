
import ContentContainer from "component/container/content.container";

import UrlConfig from "config/url.config";
import { getByIdGoodsReceipts } from "domain/actions/goods-receipts/goods-receipts.action";
import {
  FulfillmentsItemModel,
  GoodsReceiptsFileModel,
  GoodsReceiptsOrderListModel,
  GoodsReceiptsTotalProductModel,
} from "model/pack/pack.model";
import { OrderLineItemResponse } from "model/response/order/order.response";
import { GoodsReceiptsResponse } from "model/response/pack/pack.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import PackDetailInfo from "./detail/pack-detail-info";
import PackListOrder from "./detail/pack-list-order";
import PackQuantityProduct from "./detail/pack-quantity-product";
import './styles.scss';

type PackParam = {
  id: string;
};

const PackDetail: React.FC = () => {
  const dispatch = useDispatch();

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
            const setLineItemProduct: any = (key:number,itemProduct: OrderLineItemResponse) => {
              const productOnHand = data.variant?.find(i => i.sku === itemProduct.sku)
              return {
                key: key,
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
              }
            }

            if (itemOrder.fulfillments && itemOrder.fulfillments.length !== 0){
              let indexFFM = itemOrder.fulfillments?.length - 1;// xác định fulfillments cuối cùng. xử dụng cho case hiện tại-> 1 đơn hàng có 1 fulfillments
              let itemFFM = itemOrder.fulfillments[indexFFM];
              itemFFM.items?.forEach((itemProduct, index)=>{
                let key= keyProduct++;
                resultListProduct.push(setLineItemProduct(key,itemProduct));
              })
            }
          });

          data.orders?.forEach(function (itemOrder) {
            let total_quantity = 0;
            let total_price = 0;
            let postage = 0;
            let card_number = 0;
            let ffrmCode = null;
            let trackingCode = null;

            let _itemProduct: FulfillmentsItemModel[] = [];
            
            if (itemOrder.fulfillments && itemOrder.fulfillments.length !== 0) {
              let indexFFM = itemOrder.fulfillments?.length - 1;// xác định fulfillments cuối cùng. xử dụng cho case hiện tại-> 1 đơn hàng có 1 fulfillments
              let itemFFM = itemOrder.fulfillments[indexFFM];

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
            }

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

  const handleAddOrderInPack = () => { };

  const handleSearchOrder = (value: any) => { };

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
       packDetail={packDetail}
        packOrderList={packOrderList}
        handleSearchOrder={handleSearchOrder}
      />
    </ContentContainer>
  );
};

export default PackDetail;
