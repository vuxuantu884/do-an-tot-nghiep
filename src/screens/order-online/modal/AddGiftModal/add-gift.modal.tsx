import {
  AutoComplete,
  Badge,
  Button,
  Input,
  Modal,
  Table,
  Pagination,
  Row,
  Col,
  Radio,
  Space,
  RadioChangeEvent,
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import imgdefault from "assets/icon/img-default.svg";
import searchGift from "assets/icon/search.svg";
import XCloseBtn from "assets/icon/X_close.svg";
import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderDiscountModel, OrderItemModel } from "model/other/order/order-model";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { DiscountValueType } from "model/promotion/price-rules.model";
import { OrderItemDiscountRequest, OrderLineItemRequest } from "model/request/order.request";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { findAvatar, findPrice, findPriceInVariant, findTaxInVariant } from "utils/AppUtils";
import { showLoading } from "../../../../domain/actions/loading.action";
import { PromotionGetList } from "../../../../domain/actions/order/order.action";
import { ListDataModel } from "../../../../model/order/ListDataModel";
import { PromotionResponse } from "../../../../model/response/order/order.response";
import { ColAddGift, RadioGroup } from "./AddGiftModalStyle";

type AddGiftModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: () => void;
  items: Array<OrderLineItemRequest>;
  onUpdateData: (items: Array<OrderLineItemRequest>) => void;
  storeId?: number | null;
};

const initQuery: VariantSearchQuery = {
  limit: 10,
  page: 1,
  saleable: true,
  active: true,
};
export interface AddGiftRef {
  setGifts: (items: Array<OrderLineItemRequest>) => void;
}

const renderSearch = (item: VariantResponse) => {
  let avatar = findAvatar(item.variant_images);
  return (
    <div
      className="row-search w-100"
      style={{ justifyContent: "space-between", padding: "10px 20px" }}
    >
      <div className="rs-left w-100">
        <img
          src={avatar === "" ? imgdefault : avatar}
          alt="anh"
          placeholder={imgdefault}
          style={{ width: 42, height: 42, marginTop: 10 }}
        />
        <div className="rs-info w-100">
          <span style={{ color: "#37394D" }} className="text">
            {item.name}
          </span>
          <span style={{ color: "#95A1AC" }} className="text p-4">
            {item.sku}
          </span>
        </div>
      </div>
      <div className="rs-right">
        <span style={{ color: "#37394D" }} className="text t-right">
          {findPrice(item.variant_prices, AppConfig.currency)}
        </span>
        <span style={{ color: "#95A1AC" }} className="text t-right p-4">
          Có thể bán:
          <span
            style={{
              color:
                (item.available === null ? 0 : item.available) > 0
                  ? "#2A2A86"
                  : "rgba(226, 67, 67, 1)",
            }}
          >
            {` ${item.available === null ? 0 : item.available}`}
          </span>
        </span>
      </div>
    </div>
  );
};

interface CurrentPromotionModel {
  promotion_id: number;
  promotion_title: string;
  promotion_value: string;
  taxable: boolean;
}

const AddGiftModal: React.FC<AddGiftModalProps> = (props: AddGiftModalProps) => {
  const { visible, onCancel, onOk, storeId } = props;
  const dispatch = useDispatch();
  const [keysearch, setKeysearch] = useState("");
  const [data, setData] = useState({
    items: [],
    metadata: {},
  } as unknown as ListDataModel<PromotionResponse>);
  // const [currentPromotionId, setCurrentPromotionId] = useState<number | null>(null);
  // const [currentPromotionValue, setCurrentPromotionValue] = useState<string | null>(null);
  // const [currentPromotionTitle, setCurrentPromotionTitle] = useState<string | null>(null);
  const [currentPromotion, setCurrentPromotion] = useState<CurrentPromotionModel | null>();
  const [resultSearch, setResultSearch] = useState<PageResponse<VariantResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const autoCompleteRef = createRef<RefSelectProps>();

  useEffect(() => {
    if (visible) {
      if (
        props.items.length > 0 &&
        props.items[0]?.discount_items.length > 0 &&
        props.items[0]?.discount_items[0].promotion_id
      ) {
        let { promotion_title, promotion_id, taxable } = props.items[0]?.discount_items[0];
        // setCurrentPromotionValue(`${promotion_id}-${promotion_title}`)
        // setCurrentPromotionTitle(promotion_title||null)
        // setCurrentPromotionId(promotion_id)
        setCurrentPromotion({
          promotion_id: promotion_id,
          promotion_title: promotion_title || "",
          taxable: taxable || false,
          promotion_value: `${promotion_id}-${promotion_title}-${taxable}`,
        });
      }
      dispatch(showLoading());
      dispatch(
        PromotionGetList(
          (response: ListDataModel<PromotionResponse>) => {
            setData(response);
          },
          { states: "ACTIVE", page: 1 },
        ),
      );
    }
  }, [dispatch, visible]);
  const deleteItem = useCallback(
    (index) => {
      console.log("INDEX", index);
      console.log("INDEX", props.items);
      props.items.splice(index, 1);
      props.onUpdateData(props.items);
    },
    [props],
  );
  const update = useCallback(
    (index: number, value: number) => {
      props.items[index].quantity = value;
      props.onUpdateData(props.items);
    },
    [props],
  );

  const columns = [
    {
      title: "Sản phẩm",
      render: (a: OrderItemModel, item: any, index: number) => (
        <div>
          <div className="yody-pos-sku">
            <Link
              target="_blank"
              to={`${UrlConfig.PRODUCT}/${a.product_id}/variants/${a.variant_id}`}
            >
              {a.sku}
            </Link>
          </div>
          <Badge status="default" text={a.variant} style={{ marginLeft: 7 }} />
        </div>
      ),
    },
    {
      title: "Số lượng",
      width: 70,
      render: (a: OrderItemModel, b: any, index: number) => (
        <div>
          <Input
            onChange={(e) => {
              const re = /^[0-9\b]+$/;
              if (e.target.value === "" || re.test(e.target.value)) {
                if (e.target.value === "") {
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
            style={{ textAlign: "right" }}
          />
        </div>
      ),
    },
    // {
    //   title: "Đơn giá",
    //   render: (a: OrderItemModel) => formatCurrency(a.price),
    // },
    {
      title: "",
      width: 60,
      render: (a: any, b: any, index: number) => {
        return (
          <div style={{ textAlign: "right" }}>
            <Button
              type="text"
              onClick={() => deleteItem(index)}
              className="yody-pos-delete-item ant-btn-custom"
              style={{ padding: "0 15px" }}
            >
              <img src={XCloseBtn} alt="" />
            </Button>
          </div>
        );
      },
    },
  ];

  const onChangeProductSearch = useCallback(
    (value) => {
      setKeysearch(value);
      initQuery.info = value;
      initQuery.store_ids = storeId;
      dispatch(searchVariantsOrderRequestAction(initQuery, setResultSearch));
    },
    [dispatch, storeId],
  );

  const convertResultSearch = useMemo(() => {
    let options: any[] = [];
    resultSearch.items.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: renderSearch(item),
        value: item.id ? item.id.toString() : "",
      });
    });
    return options;
  }, [resultSearch]);

  const createItem = useCallback((variant: VariantResponse) => {
    let price = findPriceInVariant(variant.variant_prices, AppConfig.currency);
    let taxRate = findTaxInVariant(variant.variant_prices, AppConfig.currency);
    let avatar = findAvatar(variant.variant_images);
    let orderLine: OrderLineItemRequest = {
      id: new Date().getTime(),
      sku: variant.sku,
      variant_id: variant.id,
      product_id: variant.product.id,
      variant: variant.name,
      variant_barcode: variant.barcode,
      product_type: variant.product.product_type,
      product_code: variant.product_code || "",
      quantity: 1,
      price: price,
      amount: price,
      note: "",
      type: Type.NORMAL,
      variant_image: avatar,
      unit: variant.product.unit,
      weight: variant.weight,
      weight_unit: variant.weight_unit,
      warranty: variant.product.care_labels,
      discount_items: [],
      discount_amount: 0,
      discount_rate: 0,
      composite: variant.composite,
      is_composite: variant.composite,
      discount_value: 0,
      line_amount_after_line_discount: price,
      product: variant.product.name,
      tax_include: true,
      tax_rate: taxRate,
      show_note: false,
      gifts: [],
      position: undefined,
      available: variant.available,
      taxable: variant.taxable,
    };
    return orderLine;
  }, []);

  const onVariantSelect = useCallback(
    (v, o) => {
      let newV = parseInt(v);
      let orderDiscountModel: OrderItemDiscountRequest = {
        rate: 100,
        value: 0,
        amount: 0,
        promotion_id: currentPromotion?.promotion_id || null,
        promotion_title: currentPromotion?.promotion_title || null,
        order_id: 0,
        discount_code: "",
        reason: "",
        source: "",
        type: DiscountValueType.PERCENTAGE,
        sub_type: DiscountValueType.PERCENTAGE,
        taxable: false,
      };
      let _items = [...props.items];
      let indexSearch = resultSearch.items.findIndex((i) => i.id === newV);
      let index = _items.findIndex((i) => i.variant_id === newV);
      let r: VariantResponse = resultSearch.items[indexSearch];
      const item: OrderLineItemRequest = createItem(r);
      if (r.id === newV) {
        if (index === -1) {
          item.type = Type.GIFT;
          item.discount_items = [{ ...orderDiscountModel, taxable: item.taxable || false }];
          _items.push(item);
        } else {
          let lastIndex = index;
          _items.forEach((value, _index) => {
            if (_index > lastIndex) {
              lastIndex = _index;
            }
          });
          _items[lastIndex].quantity += 1;
        }
      }
      props.onUpdateData(_items);
      setKeysearch("");
    },
    [
      currentPromotion?.promotion_id,
      currentPromotion?.promotion_title,
      props,
      resultSearch.items,
      createItem,
    ],
  );

  const onOkPress = useCallback(() => {
    onOk();
    // setCurrentPromotionValue(null)
    // setCurrentPromotionTitle(null)
    // setCurrentPromotionId(null)
    setCurrentPromotion(null);
  }, [onOk]);
  const onCancelPress = useCallback(
    (e) => {
      onCancel(e);
      // setCurrentPromotionValue(null)
      // setCurrentPromotionTitle(null)
      // setCurrentPromotionId(null)
      setCurrentPromotion(null);
    },
    [onCancel],
  );
  const onChangePaginationPromotion = (page: number) => {
    dispatch(showLoading());
    dispatch(
      PromotionGetList(
        (response: ListDataModel<PromotionResponse>) => {
          setData(response);
        },
        { states: "ACTIVE", page },
      ),
    );
  };

  const onChangePromotionRadio = (e: RadioChangeEvent) => {
    let idPromotion = e.target.value.split("-")[0];
    let titlePromotion = e.target.value.split("-")[1];
    let taxablePromotion = e.target.value.split("-")[2];
    let orderDiscountModel: OrderItemDiscountRequest = {
      rate: 100,
      value: 0,
      amount: 0,
      promotion_id: idPromotion || null,
      promotion_title: titlePromotion || null,
      order_id: 0,
      discount_code: "",
      reason: "",
      source: "",
      sub_type: DiscountValueType.PERCENTAGE,
      type: DiscountValueType.PERCENTAGE,
      taxable: false,
    };
    let itemsGift = [...props.items];

    itemsGift.forEach(
      (element: OrderLineItemRequest) => (element.discount_items = [{ ...orderDiscountModel }]),
    );
    props.onUpdateData(itemsGift);

    // setCurrentPromotionValue(e.target.value);
    // setCurrentPromotionId(idPromotion);
    // setCurrentPromotionTitle(titlePromotion);
    setCurrentPromotion({
      promotion_id: idPromotion,
      promotion_title: titlePromotion,
      promotion_value: e.target.value,
      taxable: taxablePromotion,
    });
  };
  return (
    <Modal
      centered
      title="Chọn quà khuyến mãi"
      width={800}
      onCancel={onCancelPress}
      onOk={onOkPress}
      visible={visible}
      cancelText="Hủy"
      okText="Lưu"
      className="saleorder-product-modal"
    >
      <Row>
        <Col span={10}>
          <h4>Chương trình quà tặng</h4>
          <RadioGroup value={currentPromotion?.promotion_value} onChange={onChangePromotionRadio}>
            <Space direction="vertical">
              {data &&
                data?.items.map((item: PromotionResponse, idx: number) => {
                  return (
                    <Radio key={item.id} value={`${item.id}-${item.title}-${item.is_registered}`}>
                      {item.title}
                    </Radio>
                  );
                })}
            </Space>
          </RadioGroup>
          <Pagination
            defaultCurrent={1}
            onChange={onChangePaginationPromotion}
            pageSize={20}
            total={data?.metadata.total}
          />
        </Col>
        <ColAddGift span={14}>
          <h4>Thêm quà tặng</h4>
          <AutoComplete
            notFoundContent={keysearch.length >= 3 ? "Không tìm thấy sản phẩm" : undefined}
            value={keysearch}
            ref={autoCompleteRef}
            onSelect={onVariantSelect}
            dropdownClassName="search-layout"
            className="w-100"
            onSearch={onChangeProductSearch}
            options={convertResultSearch}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <Input
              className="yody-pos-gift-modal-input"
              placeholder="Tìm kiếm và chọn quà tặng"
              prefix={<img src={searchGift} alt="" />}
            />
          </AutoComplete>
          <Table
            locale={{
              emptyText: "Quà tặng trống",
            }}
            pagination={false}
            dataSource={props.items}
            columns={columns}
            rowKey={(record) => record.id}
          />
        </ColAddGift>
      </Row>
    </Modal>
  );
};

export default AddGiftModal;
