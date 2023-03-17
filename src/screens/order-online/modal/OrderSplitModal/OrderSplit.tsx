import React, { useState, useCallback, useEffect, useMemo } from "react";
import { ICustomTableColumType } from "component/table/CustomTable";
import { StyledComponent } from "./styled";
import { LineItemOrderSplitModel, OrderSplitModel } from "./_model";
import NumberInput from "component/custom/number-input.custom";
import { CloseCircleOutlined } from "@ant-design/icons";
import { Button, Card, Table } from "antd";
import SuggestInventoryModal from "screens/order-online/modal/InventoryModal/suggest-inventory.modal";
import { InventoryResponse } from "model/inventory";
import { StoreResponse } from "model/core/store.model";
import discountCouponSuccess from "assets/icon/discount-coupon-success.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { flattenArray, getCustomerShippingAddress } from "utils/AppUtils";
import _ from "lodash";
import { getSuggestStoreInventory } from "service/core/store.service";

type Props = {
  index: number;
  orderSplit: OrderSplitModel;
  storeArrayResponse: StoreResponse[] | null;
  handleChangeOrderSplit?: (order: OrderSplitModel) => void;
  handleRemoveOrderSplit?: () => void;
};

const OrderSplit: React.FC<Props> = (props: Props) => {
  const dispatch = useDispatch();
  const { index, orderSplit, handleChangeOrderSplit, handleRemoveOrderSplit } = props;
  const [randomKeyTable, setRandomKeyTable] = useState(0);
  const [isInventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [data, setData] = useState<LineItemOrderSplitModel[]>([]);
  const [inventoryResponse, setInventoryResponse] = useState<Array<InventoryResponse> | null>(null);

  const orderCustomer = useSelector(
    (state: RootReducerType) => state.orderReducer.orderDetail.orderCustomer,
  );
  const [isLoadingInventory, setLoadingInventory] = useState(false);

  const items = useMemo(() => {
    console.log("orderSplit.items", orderSplit.items);
    if (!orderSplit.items) return [];
    const _variant = _.cloneDeep(orderSplit.items);
    const _variantGifts = orderSplit.items.map((p) => p.gifts);
    const _variantGiftsIdConvertArray = flattenArray(_variantGifts);
    const _variants: any[] = [..._variant, ..._variantGiftsIdConvertArray];
    return _variants;
  }, [orderSplit.items]);

  const getInventory = useCallback(() => {
    setLoadingInventory(true);
    const shippingAddress = orderCustomer ? getCustomerShippingAddress(orderCustomer) : null;

    (async () => {
      const body = {
        address: {
          city_id: shippingAddress?.city_id,
        },
        line_item: items.map((p) => {
          return {
            variant_id: p.variant_id,
            quantity: p.quantity,
          };
        }),
      };
      try {
        const inventorySuggest = await getSuggestStoreInventory(body);
        setInventoryResponse(inventorySuggest.data);
        setLoadingInventory(false);
      } catch (error) {}
    })();
  }, [items, orderCustomer]);
  useEffect(() => {
    if (items.length > 0 && isInventoryModalVisible) {
      getInventory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isInventoryModalVisible]);

  const orderStoreId = useMemo(() => orderSplit?.store_id || null, [orderSplit]);

  const columns: ICustomTableColumType<LineItemOrderSplitModel>[] = [
    {
      title: "Tên sản phẩm",
      dataIndex: "sku",
      key: "sku",
      visible: true,
      align: "left",
      width: "30%",
      className: "product-name",
      render: (value: any, record: LineItemOrderSplitModel, index: number) => {
        return (
          <React.Fragment>
            <div className="sku">{record.sku}</div>
            <div className="variant">{record.variant}</div>
            {record.discount_items && (
              <div className="discount-item">
                {record.discount_items?.discount_code && (
                  <span className="coupon">{record.discount_items.discount_code} - </span>
                )}
                <img src={discountCouponSuccess} alt="" width={12} />{" "}
                {record.discount_items?.promotion_title || record.discount_items?.reason}
              </div>
            )}
          </React.Fragment>
        );
      },
    },
    {
      title: "Quà tặng",
      dataIndex: "gifts",
      key: "gifts",
      visible: true,
      align: "left",
      width: "20%",
      className: "product-name",
      render: (value: any, record: LineItemOrderSplitModel, index: number) => {
        return record?.gifts?.map((p) => (
          <React.Fragment>
            <div className="sku">{p.sku}</div>
            <div className="variant">{p.variant}</div>
          </React.Fragment>
        ));
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      visible: true,
      align: "left",
      width: "15%",
      render: (value: any, record: LineItemOrderSplitModel, index: number) => {
        return (
          <NumberInput
            value={record.quantity}
            onChange={(value) => handleChangeQuantity(value, index)}
            onBlur={(e) => {
              console.log(e.target.value);
              //   if (!orderSplitCheckQuantityOriginalOrder(data, items, record.index)) {
              //     showError("Số lượng sản phẩm tách, không được vượt quá sản phẩm gốc");
              //     handleChangeQuantityItems(record.quantity, index);
              //   }
            }}
          />
        );
      },
    },
    {
      title: "Tồn",
      dataIndex: "available",
      key: "available",
      visible: true,
      align: "center",
      width: "7%",
      render: (value: any, record: LineItemOrderSplitModel, index: number) => (
        <div>{value || 0}</div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      key: "price",
      visible: true,
      align: "left",
      width: "10%",
      render: (value: any, record: LineItemOrderSplitModel, index: number) => <div>{value}</div>,
    },

    {
      key: "btn_remove",
      visible: true,
      align: "center",
      width: "7%",
      render: (value: any, record: LineItemOrderSplitModel, i: number) => {
        return (
          <React.Fragment>
            <CloseCircleOutlined onClick={() => handleDeleteItem(i)} />
          </React.Fragment>
        );
      },
    },
  ];

  const handleDeleteItem = useCallback(
    (_index: number) => {
      let _data = [...data];
      _data.splice(_index, 1);
      setData(_data);
      let _orderSplit = { ...orderSplit };
      _orderSplit.items.splice(_index, 1);
      handleChangeOrderSplit && handleChangeOrderSplit(_orderSplit);
      setRandomKeyTable(randomKeyTable + 1);
    },
    [data, handleChangeOrderSplit, orderSplit, randomKeyTable],
  );

  const handleChangeStore = useCallback(
    (storeId) => {
      const _store = props.storeArrayResponse?.find((p) => p.id === storeId);
      let _orderSplit = { ...orderSplit };
      _orderSplit.store_id = storeId;
      _orderSplit.store = _store?.name ?? null;
      handleChangeOrderSplit && handleChangeOrderSplit(_orderSplit);
    },
    [handleChangeOrderSplit, orderSplit, props.storeArrayResponse],
  );

  const handleChangeQuantity = useCallback(
    (value, index) => {
      let _data = [...data];
      _data[index].quantity = value;
      setData(_data);

      let _orderSplit = { ...orderSplit };
      _orderSplit.items[index].quantity = value;
      handleChangeOrderSplit && handleChangeOrderSplit(_orderSplit);
    },
    [data, handleChangeOrderSplit, orderSplit],
  );

  useEffect(() => {
    const _data = items.map((item, index) => {
      const _gifts = item.gifts.map((p: any) => ({
        sku: p.sku,
        variant: p.variant,
        available: p.available,
      }));
      return {
        index: index,
        sku: item.sku,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        amount: item.amount,
        available: item.available || 0,
        store_id: null,
        store_name: null,
        discount_items: item.discount_items[0] || null,
        distributed_order_discount: item.distributed_order_discount ?? 0,
        gifts: _gifts,
      };
    });

    console.log("LineItemOrderSplitModel data", _data);
    setData(_data);
  }, [items]);

  return (
    <StyledComponent>
      <Card
        title={`Đơn tách ${index + 1}`}
        extra={
          <React.Fragment>
            <Button onClick={() => setInventoryModalVisible(true)}>
              {orderSplit?.store || "Chọn Kho CH"}
            </Button>
            <Button danger onClick={() => handleRemoveOrderSplit && handleRemoveOrderSplit()}>
              Xóa đơn
            </Button>
          </React.Fragment>
        }
      >
        <Table
          className="table-order-split"
          columns={columns}
          dataSource={data}
          pagination={false}
          tableLayout="fixed"
          key={randomKeyTable}
        />
      </Card>
      {isInventoryModalVisible && (
        <SuggestInventoryModal
          visible={isInventoryModalVisible}
          setVisible={setInventoryModalVisible}
          storeId={orderStoreId}
          onChangeStore={(storeId) => handleChangeStore(storeId)}
          columnsItem={data}
          inventoryArray={inventoryResponse}
          storeArrayResponse={props.storeArrayResponse}
          handleCancel={() => setInventoryModalVisible(false)}
          isLoading={isLoadingInventory}
        />
      )}
    </StyledComponent>
  );
};

export default OrderSplit;
