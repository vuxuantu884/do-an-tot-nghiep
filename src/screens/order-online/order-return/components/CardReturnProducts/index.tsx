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
	Table,
	Tooltip,
  Select
} from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { RefSelectProps } from "antd/lib/select";
import { ColumnType } from "antd/lib/table";
import emptyProduct from "assets/icon/empty_products.svg";
import NumberInput from "component/custom/number-input.custom";
import UrlConfig from "config/url.config";
import { CreateOrderReturnContext } from "contexts/order-return/create-order-return";
import { OrderLineItemRequest } from "model/request/order.request";
import { OrderResponse, ReturnProductModel } from "model/response/order/order.response";
import React, { useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StoreReturnModel from "screens/order-online/modal/store-return.modal";
import iconDelete from "assets/icon/deleteIcon.svg";
import { formatCurrency, getProductDiscountPerOrder, getProductDiscountPerProduct, getTotalQuantity } from "utils/AppUtils";
import { StyledComponent } from "./styles";
import CustomSelect from "component/custom/select.custom";
import { StoreResponse } from "model/core/store.model";
import useGetStoreIdFromLocalStorage from "hook/useGetStoreIdFromLocalStorage";

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
  setListReturnProducts: ((listReturnProducts: ReturnProductModel[]) => void) | undefined
  listStores: StoreResponse[];
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
    listStores
  } = props;

  const createOrderReturnContext = useContext(CreateOrderReturnContext);
  const setStoreReturn= createOrderReturnContext?.return.setStoreReturn;
  const storeReturn= createOrderReturnContext?.return.storeReturn;

  const [isStoreReturnModalVisible,setStoreReturnModalVisible]=useState(false);

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
          style={{marginLeft: 20}}
          onChange={handleChangeReturnAll}
          checked={isCheckReturnAll}
        >
          Trả toàn bộ sản phẩm
        </Checkbox>
        {/* <Button type="primary" id="selectStoreReturn" ghost onClick={() => {setStoreReturnModalVisible(true)}} style={{marginLeft: 20}}>Chọn cửa hàng trả</Button> */}
      </React.Fragment>
    );
  };

  const renderPopOverPriceTitle = (price: number) => {
    return (
      <div>
        <div
          className="single"
          style={{display: "flex", justifyContent: "space-between"}}
        >
          <p style={{margin: 0}}>Đơn giá gốc: </p>
          <p style={{margin: "0 0 0 20px"}}>{formatCurrency(price)}</p>
        </div>
      </div>
    );
  };

  const renderPopOverPriceContent = (
    discountPerProduct: number,
    discountPerOrder: number
  ) => {
    return (
      <div>
        <div
          className="single"
          style={{display: "flex", justifyContent: "space-between"}}
        >
          <p>Chiết khấu/sản phẩm: </p>
          <p style={{marginLeft: 20}}>{formatCurrency(discountPerProduct)}</p>
        </div>
        <div
          className="single"
          style={{display: "flex", justifyContent: "space-between"}}
        >
          <p style={{marginBottom: 0}}>Chiết khấu/đơn hàng: </p>
          <p style={{marginLeft: 20, marginBottom: 0}}>{formatCurrency(discountPerOrder)}</p>
        </div>
      </div>
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
          <div className="d-flex align-items-center">
            <div
              style={{
                width: "calc(100% - 32px)",
                float: "left",
              }}
            >
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
        <div className="text-center">
          <div style={{textAlign: "center"}}>Số lượng trả ({listReturnProducts ? getTotalQuantity(listReturnProducts) : 0})</div>
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
            <div>
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
                className="hide-number-handle"
                maxLength={4}
                minLength={0}
                style={{width: 100}}
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
        <div>
          <span style={{color: "#222222", textAlign: "right"}}>Đơn giá sau giảm giá</span>
          <span style={{color: "#808080", marginLeft: "6px", fontWeight: 400}}>₫</span>
        </div>
      ),
      dataIndex: "price",
      key: "price",
      align: "right",
      width: "16%",
      render: (value: number, record: ReturnProductModel, index: number) => {
        const discountPerProduct = getProductDiscountPerProduct(record);
        const discountPerOrder = getProductDiscountPerOrder(OrderDetail, record);
        const pricePerOrder = record.price - discountPerProduct - discountPerOrder;
        return (
          <Popover
            content={renderPopOverPriceContent(discountPerProduct, discountPerOrder)}
            title={renderPopOverPriceTitle(record.price)}
          >
            {formatCurrency(pricePerOrder)}
          </Popover>
        );
      },
    },
    {
      title: () => (
        <div>
          <span style={{color: "#222222"}}>Tổng tiền</span>
          <span style={{color: "#808080", marginLeft: "6px", fontWeight: 400}}>₫</span>
        </div>
      ),
      key: "total",
      align: "right",
      width: "15%",
      render: (
        value: OrderLineItemRequest,
        record: ReturnProductModel,
        index: number
      ) => {
        const discountPerProduct = getProductDiscountPerProduct(record);
        const discountPerOrder = getProductDiscountPerOrder(OrderDetail, record);
        return (
          <div className="yody-pos-varian-name">
            {formatCurrency(
              Math.round(value.price - discountPerProduct - discountPerOrder) *
                value.quantity
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
            icon={<img alt="" style={{ marginRight: 5 }} src={iconDelete} />}
            type="text"
            className=""
            style={{
              paddingLeft: 24,
              background: "transparent",
              border: "none",
              color: "red",
            }}
            onClick={() => {
              if(listReturnProducts) {
                let result = [...listReturnProducts];
                result.splice(index, 1);
                setListReturnProducts && setListReturnProducts(result)
              }
            }}
          >
            Xóa
          </Button>
        );
      },
    },
  ];

  const handleCancelStoreReturn=()=>{
    setStoreReturnModalVisible(false);
  }

  const storeIdLogin = useGetStoreIdFromLocalStorage()

  const dataCanAccess = useMemo(() => {
		let newData: Array<StoreResponse> = listStores;
		// set giá trị mặc định của cửa hàng là cửa hàng có thể truy cập đầu tiên, nếu đã có ở local storage thì ưu tiên lấy, nếu chưa chọn cửa hàng (update đơn hàng không set cửa hàng đầu tiên)
		if (newData && newData[0]?.id) {
			if (!storeReturn) {
				if(storeIdLogin) {
          const newStoreIndex = listStores.findIndex((p)=>p.id===storeIdLogin);
          if(newStoreIndex!==-1 && setStoreReturn)
					  setStoreReturn(listStores[newStoreIndex]);
				}
			}
		}
		return newData;
	}, [listStores, setStoreReturn, storeIdLogin, storeReturn]);

  const onChangeStoreReturrn=(value:number)=>{
    const newStoreIndex = listStores.findIndex((p)=>p.id===value);
    if(newStoreIndex!==-1 && setStoreReturn)
      setStoreReturn(listStores[newStoreIndex]);
  }
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
                        value={storeReturn?.id}
                        onChange={(value?: number) => {
                          if (value)
                            onChangeStoreReturrn(value)
                        }}
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
              options={
                convertResultSearchVariant
              }
              maxLength={255}
              dropdownRender={(menu) => <div>{menu}</div>}
                      >
                                <Input
                size="middle"
                className="yody-search"
                placeholder="Chọn sản phẩm"
                prefix={<SearchOutlined style={{color: "#ABB4BD"}} />}
              />
                      </AutoComplete>
                  </Col>
                </Row>
          // <div>
          //   <AutoComplete
          //     notFoundContent={
          //       searchVariantInputValue
          //         ? searchVariantInputValue.length >= 0
          //           ? "Không tìm thấy sản phẩm"
          //           : undefined
          //         : undefined
          //     }
          //     id="search_product"
          //     value={searchVariantInputValue}
          //     ref={autoCompleteRef}
          //     onSelect={onSelectSearchedVariant}
          //     dropdownClassName="search-layout dropdown-search-header"
          //     dropdownMatchSelectWidth={456}
          //     className="productSearchInput"
          //     onSearch={onChangeProductSearchValue}
          //     options={convertResultSearchVariant}
          //     maxLength={255}
          //     dropdownRender={(menu) => <div>{menu}</div>}
          //   >
          //     <Input
          //       size="middle"
          //       className="yody-search"
          //       placeholder="Chọn sản phẩm"
          //       prefix={<SearchOutlined style={{color: "#ABB4BD"}} />}
          //     />
          //   </AutoComplete>
          // </div>
        )}
        <Table
          locale={{
            emptyText: (
              <div className="sale_order_empty_product">
                <img src={emptyProduct} alt="empty product"></img>
                <p>Chưa có sản phẩm đổi trả!</p>
                <Button
                  type="text"
                  className="font-weight-500"
                  style={{
                    background: "rgba(42,42,134,0.05)",
                  }}
                  onClick={() => {
                    autoCompleteRef.current?.focus();
                  }}
                >
                  Thêm sản phẩm ngay (F3)
                </Button>
              </div>
            ),
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
          <Col xs={24} lg={11}></Col>
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
              <strong>
                {formatCurrency(totalAmountReturnProducts)}
              </strong>
            </Row>
            <Row className="payment-row" justify="space-between">
              <strong className="font-size-text">Trả tại cửa hàng:</strong>
              <strong>
                {storeReturn?.name}
              </strong>
            </Row>
          </Col>
          <Col xs={24} lg={1}></Col>
        </Row>
      </Card>
      <StoreReturnModel
         isModalVisible={isStoreReturnModalVisible}
         setModalVisible={setStoreReturnModalVisible}
         handleCancel={handleCancelStoreReturn}
      />
    </StyledComponent>
  );
}

export default CardReturnProducts;
