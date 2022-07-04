
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
import { GoodsReceiptsOrder, GoodsReceiptsResponse } from "model/response/pack/pack.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { flattenArray } from "utils/AppUtils";
import PackDetailInfo from "./detail/pack-detail-info";
import PackListOrder from "./detail/pack-list-order";
import PackQuantityProduct from "./detail/pack-quantity-product";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import './styles.scss';
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import PackDetailBottomBar from "./detail/pack-detail-bottom-bar";
import { getFulfillmentActive } from "utils/OrderUtils";

type PackParam = {
  id: string;
};

const PackDetail: React.FC = () => {
  const dispatch = useDispatch();


  let { id } = useParams<PackParam>();
  let packId = parseInt(id);

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

  const fetchProductData = useCallback((storeId:number, order : GoodsReceiptsOrder[])=>{
    let listVariant :OrderLineItemResponse[] =flattenArray(order.map((p)=>{
      return getFulfillmentActive(p.fulfillments)?.items
    }));
    
    let uniqueListVariant : OrderLineItemResponse[]=[];

    listVariant.forEach((itemVariant, i)=>{
      let isVariant= uniqueListVariant.some(p1=>p1.variant_id===itemVariant.variant_id);
      if(!isVariant){
        uniqueListVariant.push({...itemVariant,quantity:itemVariant.quantity})
      }else{
        let quantity= itemVariant.quantity;
        let index= uniqueListVariant.findIndex(p1=>p1.variant_id===itemVariant.variant_id);
        
        uniqueListVariant[index].quantity=uniqueListVariant[index].quantity + quantity;
      }
    })

    let variantIds=uniqueListVariant.map(p=>p.variant_id)

    const query:any ={
      store_ids:[storeId],
      variant_ids:variantIds,
      limit: 1000
    }

    dispatch(searchVariantsRequestAction(query,(data: PageResponse<VariantResponse>|false)=>{
      if(data && data.items && data.items.length>0)
      {
        
        const getLineItemProduct = (key:number,itemProduct: VariantResponse) => {
          let quantity = uniqueListVariant.find(p=>p.variant_id===itemProduct.id)?.quantity
          let price = uniqueListVariant.find(p=>p.variant_id===itemProduct.id)?.price

          /**
           *  Tổng số lượng -Tồn trong kho > 0 thì là thiếu, 
           *  Tổng số lượng-Tồn trong kho <=0 là đủ
              
           */
          let totalIncomplate= (quantity||0) - itemProduct.on_hand;
          totalIncomplate = totalIncomplate > 0 ? totalIncomplate : 0; 
          return {
            key: key,
            barcode: itemProduct.barcode,
            product_id: itemProduct.product_id,
            product_sku: itemProduct.sku,
            product_name: itemProduct.name,
            variant_id: itemProduct.id,
            inventory: 0,
            price: price||0,
            total_quantity: quantity||0,
            total_incomplate: totalIncomplate,
            on_hand: itemProduct.on_hand,
          }
        }

        let resultListProduct: GoodsReceiptsTotalProductModel[] = [];

        data.items.forEach((value, index)=>{
          resultListProduct.push(getLineItemProduct(index,value));
        })
        setPackProductQuantity([...resultListProduct]);
      }
    }))

  },[dispatch])

  useEffect(() => {
    if (packId) {
      dispatch(
        getByIdGoodsReceipts(packId, (data: GoodsReceiptsResponse) => {
          setPackDetail(data);
          if(data && data.orders){
            fetchProductData(data.store_id,data.orders);
          }

          let keyOrder = 0;
          let resultListOrder: GoodsReceiptsOrderListModel[] = [];

          data.orders?.forEach((itemOrder) => {
            let total_quantity = 0;
            let total_price = 0;
            let postage = 0;
            let card_number = 0;
            let ffrmCode = null;
            let trackingCode = null;

            let _itemProduct: FulfillmentsItemModel[] = [];
            
            let fulfillments = getFulfillmentActive(itemOrder.fulfillments);
            if (fulfillments) {
              total_quantity += fulfillments.total_quantity ? fulfillments.total_quantity : 0;
              total_price += fulfillments.total ? fulfillments.total : 0;
              postage += itemOrder?.shipping_fee_informed_to_customer ? itemOrder.shipping_fee_informed_to_customer : 0;
              ffrmCode = fulfillments.code;
              trackingCode = fulfillments.shipment?.tracking_code;
              fulfillments.items.forEach((itemProduct) => {
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

            itemOrder.payments?.forEach((itemPayment) => {
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
          
          setPackOrderList(resultListOrder);
        })
      );
    } else {
      setError(true);
    }
  }, [dispatch, packId, fetchProductData]);

  const handleDownLoad = () => { };
  const handleDeleteFile = () => { };

  const handleAddOrderInPack = () => { };

  return (
    <ContentContainer
      title={`Biên bản bàn giao ${packId}`}
      isError={isError}
      breadcrumb={[
        {
          name: "Đơn hàng online",
          path: UrlConfig.ORDER,
        },
        {
          name: "Biên bản bàn giao",
          path: UrlConfig.DELIVERY_RECORDS,
        },
        {
          name: `Biên bản bàn giao ${packId}`,
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
      />
      
      <PackDetailBottomBar
        packDetail={packDetail}
      />
      
    </ContentContainer>
  );
};

export default PackDetail;
