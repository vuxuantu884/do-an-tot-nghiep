import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tooltip,
} from "antd";
import BaseButton from "component/base/BaseButton";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import { IconAddMultiple } from "component/icon/IconAddMultiple";
import { AppConfig } from "config/app.config";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { debounce, isEmpty } from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
// import { POField } from "model/purchase-order/po-field";
import { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import useKeyboardJs from "react-use/lib/useKeyboardJs";
import ProductItem from "screens/purchase-order/component/product-item";
import PickManyProductModal from "screens/purchase-order/modal/pick-many-product.modal";
import emptyProduct from "assets/icon/empty_products.svg";
import imgDefIcon from "assets/img/img-def.svg";
import { Link } from "react-router-dom";
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import NumberInput from "component/custom/number-input.custom";
import { AiOutlineClose } from "react-icons/ai";
import {
  StockOutPolicyPriceField,
  StockOutPolicyPriceMapping,
  StockInPolicyPrice,
  StockInOutPolicyPriceField,
  StockInOutPolicyPriceMapping,
  StockInOutField,
  StockInOutType,
} from "../constant";
import StockInOutProductUtils from "../util/StockInOutProductUtils";
import { StockInOutItemsOther } from "model/stock-in-out-other";
import { showError } from "utils/ToastUtils";

interface IEProductFormProps {
  formMain: FormInstance;
  inventoryType: string;
  title: string;
}
const IEProductForm: React.FC<IEProductFormProps> = (props: IEProductFormProps) => {
  const { formMain, inventoryType, title } = props;
  const [loadingSearch, setLoadingSearch] = useState(false);
  const productSearchRef = createRef<CustomAutoComplete>();
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [isPressed] = useKeyboardJs("f3");
  const [resultSearch, setResultSearch] = useState<Array<VariantResponse>>([]);
  // const [isSortSku, setIsSortSku] = useState(false);
  const [typePrice, setTypePrice] = useState<string>(StockInOutPolicyPriceField.import_price);
  const dispatch = useDispatch();

  // const sizeIndex = [
  //   {
  //     size: "XS",
  //     index: 1
  //   },
  //   {
  //     size: "S",
  //     index: 2
  //   },
  //   {
  //     size: "M",
  //     index: 3
  //   },
  //   {
  //     size: "L",
  //     index: 4
  //   },
  //   {
  //     size: "XL",
  //     index: 5
  //   },
  //   {
  //     size: "2XL",
  //     index: 6
  //   },
  //   {
  //     size: "3XL",
  //     index: 7
  //   },
  //   {
  //     size: "4XL",
  //     index: 8
  //   }
  // ]

  const renderResult = useMemo(() => {
    let options: any[] = [];
    resultSearch.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [resultSearch]);

  const onResultSearch = useCallback((result: PageResponse<VariantResponse> | false) => {
    setLoadingSearch(false);
    if (!result) {
      setResultSearch([]);
    } else {
      setResultSearch(result.items);
    }
  }, []);

  const onSearch = useCallback(
    (value: string) => {
      if (value.trim() !== "") {
        setLoadingSearch(true);
        dispatch(
          searchVariantsRequestAction(
            {
              status: "active",
              limit: 10,
              page: 1,
              info: value.trim(),
            },
            onResultSearch,
          ),
        );
      } else {
        setResultSearch([]);
      }
    },
    [dispatch, onResultSearch],
  );

  // const swapItem = (a: any, b: any) => {
  //   let temp = a;
  //   a = { ...b };
  //   b = { ...temp };
  //   return [a, b]
  // }

  // const sortBySize = (collection: Array<any>) => {
  //   for (let i = 0; i < collection.length; i++) {
  //     for (let j = i + 1; j < collection.length; j++) {
  //       if (isNaN(parseFloat(collection[i].sku_size)) && isNaN(parseFloat(collection[j].sku_size))) {
  //         let sku_size1 = collection[i].sku_size ? collection[i].sku_size.split('/')[0] : "";
  //         let sku_size2 = collection[j].sku_size ? collection[j].sku_size.split('/')[0] : "";
  //         let size1 = sizeIndex.find(item => item.size === sku_size1);
  //         let size2 = sizeIndex.find(item => item.size === sku_size2);
  //         if (size1 !== undefined && size2 !== undefined) {
  //           if (size2.index < size1.index) {
  //             [collection[i], collection[j]] = swapItem(collection[i], collection[j]);
  //           }
  //         }
  //         else if (size2 === undefined) {
  //           [collection[i], collection[j]] = swapItem(collection[i], collection[j]);
  //         }
  //       }
  //       else if (!isNaN(parseFloat(collection[i].sku_size)) && isNaN(parseFloat(collection[j].sku_size))) {
  //         [collection[i], collection[j]] = swapItem(collection[i], collection[j]);
  //       }
  //       else if (!isNaN(parseFloat(collection[i].sku_size)) && !isNaN(parseFloat(collection[j].sku_size))) {
  //         if (parseFloat(collection[i].sku_size) > parseFloat(collection[j].sku_size)) {
  //           [collection[i], collection[j]] = swapItem(collection[i], collection[j]);
  //         }
  //       }
  //     }
  //   }
  //   return collection;
  // }

  // const groupByProperty = (collection: Array<any>, property: string) => {
  //   let val, index, values = [], result = [];
  //   for (let i = 0; i < collection.length; i++) {
  //     val = collection[i][property];
  //     index = values.indexOf(val);
  //     if (index > -1)
  //       result[index].push(collection[i]);
  //     else {
  //       values.push(val);
  //       result.push([collection[i]]);
  //     }
  //   }
  //   return result;
  // }

  // const handleSortLineItems = (items: Array<any>) => {
  //   if (items.length === 0)
  //     return items;
  //   let result: Array<any> = [];
  //   let newItems = items.map((item: any) => {
  //     let sku = item.sku;
  //     if (sku) {
  //       let arrSku = sku.split('-');
  //       item.sku_sku = arrSku[0] ? arrSku[0] : "";
  //       item.sku_color = arrSku[1] ? arrSku[1] : "";
  //       item.sku_size = arrSku[2] ? arrSku[2] : "";
  //     }
  //     else {
  //       item.sku_sku = "";
  //       item.sku_color = "";
  //       item.sku_size = "";
  //     }
  //     return item;
  //   })
  //   newItems.sort((a, b) => (a.sku_sku > b.sku_sku) ? 1 : -1);
  //   let itemsAfter = groupByProperty(newItems, "sku_sku");
  //   for (let i = 0; i < itemsAfter.length; i++) {
  //     let subItem: Array<any> = itemsAfter[i];
  //     subItem.sort((a, b) => (a.sku_color > b.sku_color) ? 1 : -1)
  //     let subItemAfter = groupByProperty(subItem, "sku_color");
  //     let itemsSortSize = [];
  //     for (let k = 0; k < subItemAfter.length; k++) {
  //       itemsSortSize.push(sortBySize(subItemAfter[k]));
  //       itemsAfter[i] = itemsSortSize;
  //     }
  //   }
  //   for (let i = 0; i < itemsAfter.length; i++) {
  //     for (let j = 0; j < itemsAfter[i].length; j++) {
  //       for (let k = 0; k < itemsAfter[i][j].length; k++) {
  //         if (Array.isArray(itemsAfter[i][j][k])) {
  //           for (let h = 0; h < itemsAfter[i][j][k].length; h++) {
  //             result.push(itemsAfter[i][j][k][h]);
  //           }
  //         }
  //         else {
  //           result.push(itemsAfter[i][j][k]);
  //         }
  //       }
  //     }
  //   }
  //   return result;
  // }

  const handleSelectProduct = (variantId: string) => {
    const stockInOutOtherItems: Array<StockInOutItemsOther> =
      formMain.getFieldValue(StockInOutField.stock_in_out_other_items) ?? [];

    const index = resultSearch.findIndex((item) => item.id.toString() === variantId);
    if (index !== -1) {
      if (resultSearch[index].status === "inactive") {
        showError("Sản phẩm đã ngừng hoạt động");
        return;
      }
      let variants: Array<VariantResponse> = [resultSearch[index]];
      let newItems: Array<StockInOutItemsOther> = [
        ...StockInOutProductUtils.convertVariantToStockInOutItem(variants, typePrice),
      ];
      let newStockInOutOtherItems = StockInOutProductUtils.addProduct(
        stockInOutOtherItems,
        newItems,
        typePrice,
      );
      formMain.setFieldsValue({
        stock_in_out_other_items: newStockInOutOtherItems,
      });
    }
  };

  const handlePickManyProduct = (items: Array<VariantResponse>) => {
    const variantsSelected = [...items];
    const stockInOutOtherItems: Array<StockInOutItemsOther> =
      formMain.getFieldValue(StockInOutField.stock_in_out_other_items) ?? [];

    setVisibleManyProduct(false);
    const newItems: Array<StockInOutItemsOther> = [
      ...StockInOutProductUtils.convertVariantToStockInOutItem(variantsSelected, typePrice),
    ];
    let newStockInOutOtherItems = StockInOutProductUtils.addProduct(
      stockInOutOtherItems,
      newItems,
      typePrice,
    );
    // if (isSortSku) {
    //   newStockInOutOtherItems = handleSortLineItems(newStockInOutOtherItems);
    // }
    formMain.setFieldsValue({
      stock_in_out_other_items: newStockInOutOtherItems,
    });

    // const oldStockInOutOtherItems = formMain.getFieldValue(StockInOutField.stock_in_out_other_items_old) || [];
    // if (oldStockInOutOtherItems) {
    //   const newOldStockInOutItems = StockInOutProductUtils.addProduct(oldStockInOutOtherItems, newItems, typePrice);
    //   formMain.setFieldsValue({
    //     stock_in_out_other_items_old: newOldStockInOutItems
    //   })
    // }
  };

  // const updateOldStockInOutItem = (StockInOutItem: StockInOutItemsOther) => {
  //   let oldStockInOutOtherItems: Array<StockInOutItemsOther> = formMain.getFieldValue(
  //     StockInOutField.stock_in_out_other_items_old
  //   );
  //   if (oldStockInOutOtherItems && oldStockInOutOtherItems.length > 0) {
  //     const index = oldStockInOutOtherItems.findIndex((a) => a.sku === StockInOutItem.sku);
  //     if (index !== -1) {
  //       oldStockInOutOtherItems[index] = StockInOutItem;
  //       formMain.setFieldsValue({
  //         stock_in_out_other_items_old: oldStockInOutOtherItems,
  //       })
  //     }
  //   }
  // }

  const handleChangeQuantityStockInOutItem = (
    quantity: number,
    item: StockInOutItemsOther,
    typePrice: string,
  ) => {
    const stockInOutOtherItems: Array<StockInOutItemsOther> = formMain.getFieldValue(
      StockInOutField.stock_in_out_other_items,
    );
    const indexOfItem = stockInOutOtherItems.findIndex((a) => a.sku === item.sku);

    if (stockInOutOtherItems[indexOfItem]) {
      stockInOutOtherItems[indexOfItem] = StockInOutProductUtils.updateStockInOutItemByQuantity(
        stockInOutOtherItems[indexOfItem],
        quantity,
        typePrice,
      );
      // updateOldStockInOutItem(stockInOutOtherItems[indexOfItem]);
      formMain.setFieldsValue({
        stock_in_out_other_items: [...stockInOutOtherItems],
      });
    }
  };

  const handleDeleteLineItem = (index: number) => {
    let stockInOutOtherItems: Array<StockInOutItemsOther> = formMain.getFieldValue(
      StockInOutField.stock_in_out_other_items,
    );
    // const lineItem = stockInOutOtherItems[index];
    stockInOutOtherItems.splice(index, 1);
    formMain.setFieldsValue({
      stock_in_out_other_items: [...stockInOutOtherItems],
    });

    // let oldStockInOutItemsOther: Array<StockInOutItemsOther> = formMain.getFieldValue(StockInOutField.stock_in_out_other_items_old);
    // if (oldStockInOutItemsOther) {
    //   const indexOld = oldStockInOutItemsOther.findIndex((a) => a.sku === lineItem.sku);
    //   if (indexOld !== -1) {
    //     oldStockInOutItemsOther.splice(indexOld, 1);
    //     formMain.setFieldsValue({
    //       stock_in_out_other_items_old: [...oldStockInOutItemsOther]
    //     });
    //   }
    // }
  };

  const onSearchProduct = () => {
    let element: any = document.getElementById("#product_search");
    element?.focus();
    const y = element?.getBoundingClientRect()?.top + window.pageYOffset - 250;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  useEffect(() => {
    if (isPressed) {
      onSearchProduct();
    }
  }, [isPressed]);

  const onChangePolicyPrice = (value: string) => {
    setTypePrice(value);
    const procurementItemsOther: StockInOutItemsOther[] =
      formMain.getFieldValue(StockInOutField.stock_in_out_other_items) ?? [];
    const newProcurementItemsOther: StockInOutItemsOther[] = procurementItemsOther?.map(
      (item: StockInOutItemsOther) => {
        const amount = item.quantity * item[value];
        return { ...item, policy_price: value, amount };
      },
    );
    formMain.setFieldsValue({
      [StockInOutField.stock_in_out_other_items]: newProcurementItemsOther,
    });
    // if (isSortSku) {
    //   formMain.setFieldsValue({ [StockInOutField.stock_in_out_other_items_old]: newProcurementItemsOther })
    // }
  };

  return (
    <Card
      title={title}
      extra={
        <>
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) => prev.policy_price !== current.policy_price}
          >
            {({ getFieldValue }) => {
              const policy_price = getFieldValue(StockInOutField.policy_price);
              if (!policy_price) {
                if (inventoryType === StockInOutType.stock_in) {
                  formMain.setFieldsValue({
                    [StockInOutField.policy_price]: StockInOutPolicyPriceField.import_price,
                  });
                } else {
                  formMain.setFieldsValue({
                    [StockInOutField.policy_price]: StockOutPolicyPriceField.cost_price,
                  });
                  setTypePrice(StockOutPolicyPriceField.cost_price);
                }
              }
              return (
                <Space size={20}>
                  <span>Chính sách giá:</span>
                  {inventoryType === StockInOutType.stock_in ? (
                    <Form.Item name={[StockInOutField.policy_price]} style={{ margin: "0px" }}>
                      <Select
                        style={{ minWidth: 145, height: 38 }}
                        placeholder="Chính sách giá"
                        onChange={onChangePolicyPrice}
                      >
                        {StockInPolicyPrice.map((item, i) => {
                          return (
                            <Select.Option value={item.key} color="#222222">
                              {StockInOutPolicyPriceMapping[item.key]}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  ) : (
                    <Form.Item name={StockInOutField.policy_price} style={{ margin: "0px" }}>
                      <Select style={{ minWidth: 145, height: 38 }} placeholder="Chính sách giá">
                        <Select.Option value={StockOutPolicyPriceField.cost_price} color="#222222">
                          {StockOutPolicyPriceMapping[StockOutPolicyPriceField.cost_price]}
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                </Space>
              );
            }}
          </Form.Item>
        </>
      }
    >
      <Form.Item noStyle>
        <Input.Group className="display-flex margin-bottom-20">
          <CustomAutoComplete
            loading={loadingSearch}
            id="#product_search"
            dropdownClassName="product"
            placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch ... (F3)"
            onSearch={debounce(onSearch, AppConfig.TYPING_TIME_REQUEST)}
            dropdownMatchSelectWidth={456}
            style={{ width: "100%" }}
            showAdd={true}
            textAdd="Thêm mới sản phẩm"
            onSelect={handleSelectProduct}
            options={renderResult}
            ref={productSearchRef}
            onClickAddNew={() => {
              window.open(`${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`, "_blank");
            }}
          />
          <BaseButton
            style={{ marginLeft: 10 }}
            onClick={() => setVisibleManyProduct(true)}
            icon={<IconAddMultiple width={12} height={12} />}
          >
            Chọn nhiều
          </BaseButton>
        </Input.Group>
      </Form.Item>
      <Form.Item
        style={{ padding: 0 }}
        shouldUpdate={(prevValues, curValues) =>
          prevValues[StockInOutField.stock_in_out_other_items] !==
            curValues[StockInOutField.stock_in_out_other_items] ||
          prevValues[StockInOutField.policy_price] !== curValues[StockInOutField.policy_price]
        }
      >
        {({ getFieldValue }) => {
          const procurementItemsOther: Array<StockInOutItemsOther> =
            getFieldValue(StockInOutField.stock_in_out_other_items) || [];

          return (
            <Table
              className="product-table"
              locale={{
                emptyText: (
                  <Empty
                    description="Đơn hàng của bạn chưa có sản phẩm"
                    image={<img src={emptyProduct} alt="" />}
                  >
                    <Button
                      type="text"
                      className="font-weight-500"
                      style={{
                        background: "rgba(42,42,134,0.05)",
                      }}
                      onClick={onSearchProduct}
                    >
                      Thêm sản phẩm ngay (F3)
                    </Button>
                  </Empty>
                ),
              }}
              // sortDirections={["descend", null]}
              // onChange={(pagination: TablePaginationConfig, filters: any, sorter: any) => {
              //   if (sorter) {
              //     if (sorter.order == null) {
              //       setIsSortSku(false)
              //       let data: Array<StockInOutItemsOther> = formMain.getFieldValue(
              //         StockInOutField.stock_in_out_other_items_old
              //       ) ?? [];
              //       formMain.setFieldsValue({
              //         stock_in_out_other_items: [...data],
              //       });
              //     }
              //     else {
              //       setIsSortSku(true)
              //       let data: Array<StockInOutItemsOther> = formMain.getFieldValue(
              //         StockInOutField.stock_in_out_other_items
              //       ) ?? [];
              //       formMain.setFieldsValue({
              //         stock_in_out_other_items_old: [...data],
              //       });
              //       data = handleSortLineItems(data);
              //       formMain.setFieldsValue({
              //         stock_in_out_other_items: [...data],
              //       });
              //     }
              //   }
              // }}
              rowKey={(record: StockInOutItemsOther) => record.sku}
              rowClassName="product-table-row"
              columns={[
                {
                  title: "STT",
                  align: "center",
                  width: "5%",
                  render: (value, record, index) => index + 1,
                },
                {
                  title: "Ảnh",
                  width: "5%",
                  dataIndex: "variant_image",
                  render: (value) => (
                    <div className="product-item-image">
                      <img src={value === null ? imgDefIcon : value} alt="" className="" />
                    </div>
                  ),
                },
                {
                  title: "Sản phẩm",
                  width: "35%",
                  // sorter: true,
                  className: "ant-col-info",
                  dataIndex: "variant_name",
                  render: (value: string, item: StockInOutItemsOther, index: number) => {
                    return (
                      <div>
                        <div>
                          <div className="product-item-sku">
                            <Link
                              target="_blank"
                              to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.id}`}
                            >
                              {item.sku}
                            </Link>
                          </div>
                          <div className="product-item-name">
                            <span>{value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  },
                },
                {
                  title: (
                    <div
                      style={{
                        textAlign: "right",
                        padding: "7px 14px",
                      }}
                    >
                      <div>Số Lượng</div>
                      <div
                        style={{
                          color: "#2A2A86",
                          fontWeight: "normal",
                          marginLeft: 5,
                        }}
                      >
                        (
                        {formatCurrency(
                          StockInOutProductUtils.totalQuantity(procurementItemsOther),
                          ".",
                        )}
                        )
                      </div>
                    </div>
                  ),
                  width: "15%",
                  dataIndex: "quantity",
                  render: (value, item: StockInOutItemsOther, index) => {
                    return (
                      <NumberInput
                        isFloat={false}
                        value={value}
                        min={1}
                        default={1}
                        maxLength={9}
                        onChange={(quantity) => {
                          handleChangeQuantityStockInOutItem(quantity || 0, item, typePrice);
                        }}
                      />
                    );
                  },
                },
                // {
                //   title: "Chính sách giá",
                //   align: "center",
                //   dataIndex: "policy_price",
                //   width: "15%",
                //   render: (value, item) => {
                //     return (StockInOutPolicyPriceMapping[value])
                //   }
                // },
                {
                  title: (
                    <div
                      style={{
                        width: "100%",
                        textAlign: "center",
                      }}
                    >
                      <div>
                        Giá
                        <span
                          style={{
                            color: "#737373",
                            fontSize: "12px",
                            fontWeight: "normal",
                          }}
                        >
                          {" "}
                          ₫
                        </span>
                      </div>
                    </div>
                  ),
                  width: "15%",
                  dataIndex: typePrice,
                  render: (value, item, index) => {
                    return (
                      <NumberInput
                        className="hide-number-handle"
                        min={0}
                        format={(a: string) => formatCurrency(a ? a : 0, ".")}
                        replace={(a: string) => replaceFormatString(a)}
                        value={value ?? 0}
                        disabled={true}
                      />
                    );
                  },
                },
                {
                  dataIndex: "amount",
                  title: (
                    <Tooltip title="Thành tiền không bao gồm thuế VAT">
                      <div
                        style={{
                          width: "100%",
                          textAlign: "right",
                        }}
                      >
                        Thành tiền
                        <span
                          style={{
                            color: "#737373",
                            fontSize: "12px",
                            fontWeight: "normal",
                          }}
                        >
                          {" "}
                          ₫
                        </span>
                      </div>
                    </Tooltip>
                  ),
                  align: "center",
                  width: "20%",
                  render: (value, item) => (
                    <div
                      style={{
                        width: "100%",
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(Math.round(value || 0), ".")}
                    </div>
                  ),
                },
                {
                  title: "",
                  fixed: procurementItemsOther.length !== 0 && "right",
                  width: 60,
                  render: (value: string, item, index: number) => {
                    return (
                      <Button
                        onClick={() => handleDeleteLineItem(index)}
                        className="product-item-delete"
                        style={{ textAlign: "right", width: "100%" }}
                        icon={<AiOutlineClose />}
                      />
                    );
                  },
                },
              ]}
              dataSource={procurementItemsOther}
              tableLayout="fixed"
              pagination={false}
            />
          );
        }}
      </Form.Item>
      <Row gutter={24}>
        <Col span={12} />
        <Col span={12}>
          <Form.Item
            shouldUpdate={(prevValues, curValues) =>
              prevValues[StockInOutField.stock_in_out_other_items] !==
              curValues[StockInOutField.stock_in_out_other_items]
            }
            noStyle
          >
            {({ getFieldValue }) => {
              const stock_in_out_other_items =
                getFieldValue(StockInOutField.stock_in_out_other_items) ?? [];
              const totalAmount =
                StockInOutProductUtils.getTotalAmountByStockInOutItems(stock_in_out_other_items);
              return (
                !isEmpty(stock_in_out_other_items) && (
                  <div>
                    <div className="ie-payment-row ">
                      <div>
                        <b>Tổng tiền:</b>
                      </div>
                      <div className="ie-payment-row-result">
                        {totalAmount === 0
                          ? "-"
                          : formatCurrency(Math.round(totalAmount || 0), ".")}
                      </div>
                    </div>
                  </div>
                )
              );
            }}
          </Form.Item>
        </Col>
      </Row>
      <Form.Item noStyle name={StockInOutField.stock_in_out_other_items} hidden>
        <Input />
      </Form.Item>
      <PickManyProductModal
        onSave={handlePickManyProduct}
        selected={[]}
        onCancel={() => setVisibleManyProduct(false)}
        visible={visibleManyProduct}
      />
    </Card>
  );
};

export default IEProductForm;
