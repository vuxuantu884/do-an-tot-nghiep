import { SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  Popover,
  Row,
  Select,
  Table,
  Tooltip,
} from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { RefSelectProps } from "antd/lib/select";
import { ColumnType } from "antd/lib/table";
import iconDelete from "assets/icon/deleteIcon.svg";
import emptyProduct from "assets/icon/empty_products.svg";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import UrlConfig from "config/url.config";
import { CreateOrderReturnContext } from "contexts/order-return/create-order-return";
import useGetStoreIdFromLocalStorage from "hook/useGetStoreIdFromLocalStorage";
import { StoreResponse } from "model/core/store.model";
import { OrderLineItemRequest } from "model/request/order.request";
import { OrderResponse, ReturnProductModel } from "model/response/order/order.response";
import React, { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StoreReturnModel from "screens/order-online/modal/select-store-return.modal";
import {
  formatCurrency,
  getProductDiscountPerOrder,
  getProductDiscountPerProduct,
  getReturnPricePerOrder,
  getTotalQuantity,
} from "utils/AppUtils";
import { STORE_TYPE } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  isDetailPage?: boolean;
  isExchange?: boolean;
  isStepExchange?: boolean;
  isShowProductSearch?: boolean;
  OrderDetail?: OrderResponse | null;
  listReturnProducts?: ReturnProductModel[];
  searchVariantInputValue?: string;
  pointUsing?: number;
  totalAmountReturnProducts: number | undefined;
  isCheckReturnAll?: boolean;
  convertResultSearchVariant?: any[] | undefined;
  autoCompleteRef: React.RefObject<RefSelectProps>;
  onChangeProductSearchValue?: (value: string) => void;
  onSelectSearchedVariant?: (value: string) => void;
  onChangeProductQuantity?: (value: number | null, index: number) => void;
  handleChangeReturnAll?: (e: CheckboxChangeEvent) => void;
  setListReturnProducts: ((listReturnProducts: ReturnProductModel[]) => void) | undefined;
  stores: StoreResponse[];
};

function CardReturnProducts(props: PropTypes) {
  const {
    isDetailPage = false,
    isExchange = false,
    isStepExchange = false,
    isShowProductSearch = false,
    OrderDetail,
    listReturnProducts,
    pointUsing,
    searchVariantInputValue,
    convertResultSearchVariant,
    totalAmountReturnProducts = 0,
    isCheckReturnAll,
    autoCompleteRef,
    onChangeProductSearchValue,
    onSelectSearchedVariant,
    onChangeProductQuantity,
    handleChangeReturnAll,
    setListReturnProducts,
    stores,
  } = props;

  const createOrderReturnContext = useContext(CreateOrderReturnContext);
  const setReturnStore = createOrderReturnContext?.return.setReturnStore;
  const returnStore = createOrderReturnContext?.return.returnStore;

  const [isSelectReturnStoreModalVisible, setIsSelectReturnStoreModalVisible] = useState(false);

  // const discountRate = useMemo(() => {
  //   if (OrderDetail && OrderDetail.discounts) {
  //     let discountRate = 0;
  //     OrderDetail.discounts.forEach((single) => {
  //       const singleDiscountRate = single.rate || 0;
  //       discountRate += singleDiscountRate;
  //     });
  //     return discountRate;
  //   } else {
  //     return 0;
  //   }
  // }, [OrderDetail]);

  const renderCardExtra = () => {
    return (
      <React.Fragment>
        <Checkbox
          className="returnAllCheckbox"
          onChange={handleChangeReturnAll}
          checked={isCheckReturnAll}
        >
          Trả toàn bộ sản phẩm
        </Checkbox>
      </React.Fragment>
    );
  };

  const renderPopOverPriceTitle = (price: number) => {
    return (
      <StyledComponent>
        <div className="popOverPrice__title">
          <p>Đơn giá gốc: </p>
          <p className="popOverPrice__title-price">{formatCurrency(price)}</p>
        </div>
      </StyledComponent>
    );
  };

  const renderPopOverPriceContent = (discountPerProduct: number, discountPerOrder: number) => {
    return (
      <StyledComponent>
        <div className="single popOverPriceContent">
          <p>Chiết khấu/sản phẩm: </p>
          <p style={{ marginLeft: 5 }}>{formatCurrency(discountPerProduct)}</p>
        </div>
        <div className="single popOverPriceContent">
          <p>Chiết khấu/đơn hàng: </p>
          <p style={{ marginLeft: 5 }}>{formatCurrency(discountPerOrder)}</p>
        </div>
      </StyledComponent>
    );
  };

  const columns: ColumnType<any>[] = [
    {
      title: "Sản phẩm",
      dataIndex: "variant",
      key: "variant",
      width: "29%",
      render: (value, record: ReturnProductModel, index: number) => {
        return (
          <div className="d-flex align-items-center columnBody__variant">
            <div className="columnBody__variant-inner">
              <div className="yody-pos-sku">
                <Link
                  target="_blank"
                  to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}
                >
                  {record.sku}
                </Link>
              </div>
              <div className="yody-pos-varian">
                <Tooltip title={record.variant} className="yody-pos-varian-name">
                  <span>{record.variant}</span>
                </Tooltip>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: () => (
        <div className="columnHeading__quantity text-center">
          Số lượng trả ({listReturnProducts ? getTotalQuantity(listReturnProducts) : 0})
        </div>
      ),
      className: "columnQuantity",
      width: "22%",
      render: (value, record: ReturnProductModel, index: number) => {
        if (isDetailPage) {
          return record.quantity;
        } else {
          if (isExchange && isStepExchange) {
            return record.quantity;
          }
          return (
            <div className="columnBody__quantity">
              <NumberInput
                min={0}
                max={record.maxQuantityCanBeReturned}
                value={record.quantity}
                // defaultValue={0}
                onChange={(value: number | null) => {
                  if (onChangeProductQuantity) {
                    onChangeProductQuantity(value, index);
                  }
                }}
                className="hide-number-handle columnBody__quantity-numberInput"
                maxLength={4}
                minLength={0}
                isChangeAfterBlur={false}
              />{" "}
              / {record.maxQuantityCanBeReturned}
            </div>
          );
        }
      },
    },
    {
      title: () => (
        <div className="columnHeading__price">
          <span className="columnHeading__price-title">Đơn giá sau giảm giá</span>
          <span className="columnHeading__price-unit currencyUnit">₫</span>
        </div>
      ),
      dataIndex: "price",
      key: "price",
      align: "right",
      width: "16%",
      render: (value: number, record: ReturnProductModel, index: number) => {
        const discountPerProduct = getProductDiscountPerProduct(record);
        const discountPerOrder = getProductDiscountPerOrder(OrderDetail, record);
        const pricePerOrder = getReturnPricePerOrder(OrderDetail, record);
        return (
          <Popover
            content={renderPopOverPriceContent(discountPerProduct, discountPerOrder)}
            title={renderPopOverPriceTitle(record.price)}
          >
            {formatCurrency(Math.round(pricePerOrder))}
          </Popover>
        );
      },
    },
    {
      title: () => (
        <div className="columnHeading__total">
          <span className="columnHeading__total-title">Tổng tiền</span>
          <span className="columnHeading__total-unit currencyUnit">₫</span>
        </div>
      ),
      key: "total",
      align: "right",
      width: "15%",
      render: (value: OrderLineItemRequest, record: ReturnProductModel, index: number) => {
        const discountPerProduct = getProductDiscountPerProduct(record);
        const discountPerOrder = getProductDiscountPerOrder(OrderDetail, record);
        return (
          <div className="yody-pos-varian-name">
            {formatCurrency(
              Math.round((value.price - discountPerProduct - discountPerOrder) * value.quantity),
            )}
          </div>
        );
      },
    },
    {
      title: "Xóa sản phẩm",
      dataIndex: "delete_variant",
      key: "delete_variant",
      width: "18%",
      align: "right",
      render: (value, record: ReturnProductModel, index: number) => {
        return (
          <Button
            icon={<img alt="" src={iconDelete} />}
            type="text"
            className="columnBody__delete"
            onClick={() => {
              if (listReturnProducts) {
                let result = [...listReturnProducts];
                result.splice(index, 1);
                setListReturnProducts && setListReturnProducts(result);
              }
            }}
          >
            Xóa
          </Button>
        );
      },
    },
  ];

  const handleCancelStoreReturn = () => {
    setIsSelectReturnStoreModalVisible(false);
  };

  const storeIdLogin = useGetStoreIdFromLocalStorage();

  const dataCanAccess = useMemo(() => {
    //loại bỏ kho Kho dự trữ, Kho phân phối
    // let newData: Array<StoreResponse> = stores.filter(
    //   (store) =>
    //     store.type.toLocaleLowerCase() !== STORE_TYPE.DISTRIBUTION_CENTER &&
    //     store.type.toLocaleLowerCase() !== STORE_TYPE.STOCKPILE,
    // );
    let newData: Array<StoreResponse> = stores;
    // set giá trị mặc định của cửa hàng là cửa hàng có thể truy cập đầu tiên, nếu đã có ở local storage thì ưu tiên lấy, nếu chưa chọn cửa hàng (update đơn hàng không set cửa hàng đầu tiên)
    if (newData && newData[0]?.id) {
      if (!returnStore) {
        if (storeIdLogin) {
          const newStoreIndex = stores.findIndex((p) => p.id === storeIdLogin);
          if (newStoreIndex !== -1 && setReturnStore) setReturnStore(stores[newStoreIndex]);
        }
      }
    }
    return newData;
  }, [stores, setReturnStore, storeIdLogin, returnStore]);

  const onChangeStoreReturn = (value?: number) => {
    if (!value) {
      setReturnStore && setReturnStore(null);
      return;
    }
    const newStore = stores.find((p) => p.id === value);
    if (setReturnStore) {
      setReturnStore(newStore || null);
    }
  };
  return (
    <StyledComponent>
      <Card
        className="margin-top-20"
        title={"Thông tin sản phẩm trả"}
        extra={!isDetailPage && !isStepExchange ? renderCardExtra() : null}
      >
        {isShowProductSearch && (
          <Row gutter={15} className="rowSelectStoreAndProducts">
            <Col md={8}>
              <CustomSelect
                className="select-with-search"
                showSearch
                allowClear
                style={{ width: "100%" }}
                placeholder="Chọn cửa hàng"
                notFoundContent="Không tìm thấy kết quả"
                value={returnStore?.id}
                onChange={(value?: number) => {
                  onChangeStoreReturn(value);
                }}
                id="selectStoreReturn"
              >
                {dataCanAccess?.map((item, index) => (
                  <Select.Option key={index} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </CustomSelect>
            </Col>
            <Col md={16}>
              <AutoComplete
                notFoundContent={
                  searchVariantInputValue
                    ? searchVariantInputValue.length >= 1
                      ? "Không tìm thấy sản phẩm"
                      : undefined
                    : undefined
                }
                id="search_product_return"
                value={searchVariantInputValue}
                ref={autoCompleteRef}
                onSelect={onSelectSearchedVariant}
                dropdownClassName="search-layout dropdown-search-header"
                dropdownMatchSelectWidth={456}
                className="productSearchInput"
                onSearch={onChangeProductSearchValue}
                options={convertResultSearchVariant}
                maxLength={255}
                dropdownRender={(menu) => <div>{menu}</div>}
              >
                <Input
                  size="middle"
                  className="yody-search"
                  placeholder="Quét mã vạch, chọn sản phẩm"
                  prefix={<SearchOutlined />}
                />
              </AutoComplete>
            </Col>
          </Row>
        )}
        <Table
          locale={{
            emptyText: !OrderDetail ? (
              <div className="sale_order_empty_product">
                <img src={emptyProduct} alt="empty product"></img>
                <p>Chưa có sản phẩm đổi trả!</p>
                <Button
                  type="text"
                  className="tableEmpty__button"
                  onClick={() => {
                    autoCompleteRef.current?.focus();
                  }}
                >
                  Thêm sản phẩm ngay (F3)
                </Button>
              </div>
            ) : null,
          }}
          rowKey={(record: any) => record.id}
          columns={columns}
          dataSource={listReturnProducts}
          className="w-100"
          tableLayout="fixed"
          pagination={false}
          sticky
        />
        <Row className="boxPayment" gutter={24}>
          <Col xs={24} lg={11}>
            <Row className="payment-row" justify="space-between">
              (*) Chú ý: có thể tính toán lệch một hai đồng do làm tròn
            </Row>
          </Col>
          <Col xs={24} lg={2}></Col>
          <Col xs={24} lg={10}>
            <Row className="payment-row" justify="space-between">
              {isDetailPage ? (
                <React.Fragment>
                  <span className="font-size-text">Điểm hoàn: </span>
                  <span>{` ${pointUsing ? pointUsing : 0} điểm`}</span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <span className="font-size-text">Điểm hoàn:</span>
                  <span>{` ${pointUsing ? pointUsing : 0} điểm`}</span>
                </React.Fragment>
              )}
            </Row>
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Tổng tiền trả khách:</strong>
              <strong>{formatCurrency(Math.round(totalAmountReturnProducts))}</strong>
            </Row>
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Trả tại cửa hàng:</strong>
              <strong>{returnStore?.name}</strong>
            </Row>
          </Col>
          <Col xs={24} lg={1}></Col>
        </Row>
      </Card>
      <StoreReturnModel
        isModalVisible={isSelectReturnStoreModalVisible}
        setModalVisible={setIsSelectReturnStoreModalVisible}
        handleCancel={handleCancelStoreReturn}
      />
    </StyledComponent>
  );
}

export default CardReturnProducts;
