import { Modal, Input, Table, Button, AutoComplete } from 'antd';
import deleteIcon from 'assets/icon/delete.svg';
import arrowDown from 'assets/icon/arrow-down.svg';
import React, { createRef, useCallback, useMemo, useState } from "react";
import { RefSelectProps } from 'antd/lib/select';
import { useDispatch } from 'react-redux';
import { VariantModel } from 'model/other/Product/product-model';
import { findAvatar, findPrice, findPriceInVariant, findTaxInVariant, formatCurrency } from 'utils/AppUtils';
import { AppConfig } from 'config/AppConfig';
import imgdefault from 'assets/icon/img-default.svg';
import { OrderItemModel } from 'model/other/Order/order-item-model';
import { Type } from 'config/TypeConfig';
import { Link } from 'react-router-dom';
import { OnSearchChange } from "domain/actions/search.action";
import { OrderItemDiscountModel } from "model/other/Order/order-item-discount-model";

type AddGiftModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: () => void;
  items: Array<OrderItemModel>;
  onUpdateData: (items: Array<OrderItemModel>) => void;
}

export interface AddGiftRef {
  setGifts: (items: Array<OrderItemModel>) => void
}

const renderSearch = (item: VariantModel) => {
  let avatar = findAvatar(item.variant_images);
  return (
    <div className="row-search w-100">
      <div className="rs-left w-100">
        <img src={avatar === '' ? imgdefault : avatar} alt="anh" placeholder={imgdefault} />
        <div className="rs-info w-100">
          <span style={{ color: '#37394D' }} className="text">
            {item.name}
          </span>
          <span style={{ color: '#95A1AC' }} className="text p-4">
            {item.sku}
          </span>
        </div>
      </div>
      <div className="rs-right">
        <span style={{ color: '#37394D' }} className="text t-right">
          {findPrice(item.variant_prices, AppConfig.currency)}
        </span>
        <span style={{ color: '#95A1AC' }} className="text t-right p-4">
          Có thể bán <span style={{ color: item.inventory > 0 ? 'rgba(0, 128, 255, 1)' : 'rgba(226, 67, 67, 1)' }}>{item.inventory}</span>
        </span>
      </div>
    </div>
  )
}

var timeTextChange: NodeJS.Timeout;
const AddGiftModal: React.FC<AddGiftModalProps> = (props: AddGiftModalProps) => {
  const { visible, onCancel, onOk } = props

  const dispatch = useDispatch();
  const [keysearch, setKeysearch] = useState('');
  const [resultSearch, setResultSearch] = useState<Array<VariantModel>>([]);
  const autoCompleteRef = createRef<RefSelectProps>();
  const deleteItem = useCallback((index) => {
    props.items.splice(index, 1);
    props.onUpdateData(props.items);
  }, [props]);
  const update = useCallback((index: number, value: number) => {
    props.items[index].quantity = value;
    props.onUpdateData(props.items);
  }, [props]);

  const columns = [
    {
      title: 'Sản phẩm',
      render: (a: OrderItemModel, item: any, index: number) => (
        <div>
          <div className="yody-pos-sku"><Link to="">{a.sku}</Link></div>
          <span>{a.variant}</span>
        </div>
      )
    },
    {
      title: 'Số lượng',
      render: (a: OrderItemModel, b: any, index: number) => (
        <div>
          <Input
            onChange={(e) => {
              const re = /^[0-9\b]+$/;
              if (e.target.value === '' || re.test(e.target.value)) {
                if (e.target.value === '') {
                  update(index, 0);
                } else {
                  update(index, parseInt(e.target.value));
                }
              }
            }}
            value={a.quantity}
            minLength={1}
            maxLength={4}
            onFocus={(e) => e.target.select()}
            style={{ width: 60, textAlign: "right" }} />
        </div>
      )
    },
    {
      title: 'Đơn giá',
      render: (a: OrderItemModel) => formatCurrency(a.price)
    },
    {
      title: 'Thao tác',
      render: (a: any, b: any, index: number) => {
        return (
          <Button type="text" onClick={() => deleteItem(index)}
                  className="yody-pos-delete-item"><img src={deleteIcon} alt="" /></Button>
        )
      }
    },
  ];

  const onChangeSearch = useCallback(
    (v) => {
      setKeysearch(v);
      timeTextChange && clearTimeout(timeTextChange);
      timeTextChange = setTimeout(() => {
        dispatch(OnSearchChange(v, setResultSearch));
      }, 500);
    },
    [dispatch]
  );

  const convertResultSearch = useMemo(() => {
    let options: any[] = [];
    resultSearch.forEach((item: VariantModel, index: number) => {
      options.push({
        label: renderSearch(item),
        value: item.id ? item.id.toString() : '',
      })
    })
    return options;
  }, [resultSearch]);

  const onSearchSelect = useCallback(
    (v, o) => {
      console.log(o);
      let _items = [...props.items];
        let indexSearch = resultSearch.findIndex(s => s.id === v)
        let index = _items.findIndex(i => i.variant_id === v)
        let r:VariantModel=resultSearch[indexSearch]
        if(r.id === v){
          if(index === -1){
            const item:OrderItemModel = createItem(r);
            _items.push(item);
          }
          else{
            let lastIndex = index;
            _items.forEach( (value, _index) => {
              if(_index > lastIndex){
                lastIndex = _index;
              }
            })
            _items[lastIndex].quantity += 1
          }
        }
        props.onUpdateData(_items);
      },
    [resultSearch, props]
    // autoCompleteRef, dispatch, resultSearch
  );

  const createItem = (variant: VariantModel) => {
    let price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
    let taxRate = findTaxInVariant(variant.variant_prices, AppConfig.currency);
    let avatar = findAvatar(variant.variant_images);
    const discountItem:OrderItemDiscountModel  = createNewDiscountItem()
    let orderLine: OrderItemModel = {
      id: new Date().getTime(),
      sku: variant.sku,
      variant_id: variant.id,
      product_id: variant.product.id,
      variant: variant.name,
      variant_barcode: variant.barcode,
      product_type: variant.product.product_type,
      quantity: 1,
      price: price,
      amount: price,
      note: "",
      type: Type.NORMAL,
      variant_image: avatar,
      unit: variant.product.unit,
      warranty: variant.product.preservation,
      discount_items: [discountItem],
      discount_amount: 0,
      discount_rate: 0,
      is_composite: variant.composite,
      discount_value: 0,
      line_amount_after_line_discount: price,
      product: variant.product.name,
      tax_include: true,
      tax_rate: taxRate,
      show_note: false,
      gifts: [],
    };
    return orderLine;
  };

  const createNewDiscountItem = () => {
    const newDiscountItem: OrderItemDiscountModel = {
      amount: 0,
      rate: 0,
      reason: "",
      value: 0,
    };
    return newDiscountItem;
  };

  
  const onOkPress = useCallback(() => {
    onOk();
  }, [onOk]);
  return (
    <Modal title="" onCancel={onCancel} onOk={onOkPress} visible={visible} centered cancelText="Hủy" okText="Lưu" className="yody-pos-gift-modal modal-hide-header">
      <div style={{ fontSize: 13, color: '#4F687D', marginBottom: 6 }}>Quà tặng</div>
      <AutoComplete notFoundContent={keysearch.length >= 3 ? "Không tìm thấy sản phẩm" : undefined} value={keysearch} ref={autoCompleteRef} onSelect={onSearchSelect} dropdownClassName="search-layout" className="w-100" onSearch={onChangeSearch} options={convertResultSearch}>
        <Input
          className="yody-pos-gift-modal-input"
          placeholder="Chọn quà tặng"
          suffix={<img src={arrowDown} alt="" />}
        />
      </AutoComplete>
      <Table
         locale={{
          emptyText: 'Quà tặng trống'
        }}
        pagination={false}
        dataSource={props.items}
        columns={columns}
        rowKey={(record) => record.id}
      />
    </Modal>
  )
}

export default AddGiftModal;
