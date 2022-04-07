import { Modal, Radio, Space } from 'antd';
import { EcommerceOrderSearchQuery } from 'model/order/order.model';
import { OrderResponse } from 'model/response/order/order.response';
import React from 'react';

export interface BatchShippingType {
  SELECTED: string;
  FILTERED: string
}

export interface ReportPreparationShopeeProductModalProps {
    title: string;
    visible: boolean;
    onOk: any;
    onCancel: any;
    okText: string;
    cancelText: string;
    params: EcommerceOrderSearchQuery;
    total: number;
    showButtonConfirm: boolean;
    isReportShopeeSelected: boolean;
    isReportShopeeFilter: boolean;
    setIsShowButtonConfirm: (item: any) => void;
    selectedRow: Array<OrderResponse>;
    BATCHING_SHIPPING_TYPE: BatchShippingType;
    batchShippingType: string;
    setBatchShippingType: (item: any) => void;

}

function ReportPreparationShopeeProductModal (props: ReportPreparationShopeeProductModalProps) {

  const {
    title,
    visible,
    onOk,
    onCancel,
    okText,
    cancelText,
    params,
    total,
    showButtonConfirm,
    isReportShopeeSelected,
    isReportShopeeFilter,
    setIsShowButtonConfirm,
    selectedRow,
    BATCHING_SHIPPING_TYPE,
    batchShippingType,
    setBatchShippingType
  } = props

  const handleShowButtonConfirm = () => {
    setIsShowButtonConfirm(false)
  }

  const onChangeBatchShippingOption = (e: any) => {
    setBatchShippingType(e.target.value)
  }
  
  return (
    <Modal
       title={title}
       visible={visible}
       onOk={onOk}
       onCancel={onCancel}
       okText={okText}
       cancelText={cancelText}
       okButtonProps={{ disabled: (showButtonConfirm) && (!selectedRow.length || !params.ecommerce_shop_ids.length)}}
    >
        <Radio.Group onChange={onChangeBatchShippingOption} value ={batchShippingType}>
        <Space direction="vertical">
          <Radio disabled={isReportShopeeSelected} value={BATCHING_SHIPPING_TYPE.SELECTED} onClick={handleShowButtonConfirm}>Báo các đơn hàng đã chọn</Radio>
          <Radio disabled={isReportShopeeFilter || !params.ecommerce_shop_ids.length || total === 0} value={BATCHING_SHIPPING_TYPE.FILTERED} onClick={handleShowButtonConfirm}>
            Báo đơn <span style={{ fontWeight: 600 }}>{total}</span> hàng phù hợp với điều kiện lọc
          </Radio>
        </Space>
      </Radio.Group>
    </Modal>
  );
}

export default ReportPreparationShopeeProductModal
