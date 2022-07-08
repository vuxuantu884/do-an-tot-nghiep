import { showError } from 'utils/ToastUtils';
import { callApiNative } from './../../../../utils/ApiUtils';
import { PageResponse } from "model/base/base-metadata.response"
import { useCallback, useEffect, useState } from "react"
import { useDispatch } from 'react-redux';
import { getPurchaseOrderReturnList } from 'service/purchase-order/purchase-order.service';
import { PurchaseOrderReturn, PurchaseOrderReturnQuery } from 'model/purchase-order/purchase-order.model';
import { PurchaseOrderLineReturnItem } from 'model/purchase-order/purchase-item.model';
import { formatCurrency } from 'utils/AppUtils';

export const useFetchPOReturn = (params: PurchaseOrderReturnQuery) => {
  const [data, setData] = useState<PageResponse<PurchaseOrderReturn>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  })
  const [loading, setLoading] = useState<boolean>(false)
  const dispatch = useDispatch()

  const getPOReturnList = useCallback(async (params: PurchaseOrderReturnQuery) => {
    setLoading(true)
    try{
      const response = await callApiNative({ isShowError: true }, dispatch, getPurchaseOrderReturnList, params)
      if (response) {
        setData(response)
      }
    } catch (error: any) {
      showError(error)
    } finally {
      setLoading(false)
    }
    
  }, [dispatch])

  useEffect(() => {
    getPOReturnList(params)
  }, [getPOReturnList, params])

  return { data, setData, loading, setLoading }
}

export const getTotalQuantityReturn = (poReturnList: Array<PurchaseOrderReturn>) => {
  let total = 0
  poReturnList.forEach((item: PurchaseOrderReturn) => {
    item.line_return_items.forEach((el: PurchaseOrderLineReturnItem) => {
      total += el.quantity_return
    })
  })
  return formatCurrency(total)
}