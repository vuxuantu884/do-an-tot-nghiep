import { EditOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Empty,
  Form,
  FormInstance,
  Input,
  Row,
  Table,
  TablePaginationConfig,
  Tooltip
} from "antd";
import emptyProduct from "assets/icon/empty_products.svg";
import imgDefIcon from "assets/img/img-def.svg";
import classNames from "classnames";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import NumberInput from "component/custom/number-input.custom";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import {  POField } from "model/purchase-order/po-field";
import {
  PurchaseOrderLineItem,
  Vat
} from "model/purchase-order/purchase-item.model";
import React, { createRef, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import useKeyboardJs from 'react-use/lib/useKeyboardJs';
import { formatCurrency, replaceFormatString } from "utils/AppUtils";
import { POStatus } from "utils/Constants";
import { POUtils } from "utils/POUtils";
import BaseButton from "../../../component/base/BaseButton";
import { IconAddMultiple } from "../../../component/icon/IconAddMultiple";
import ProductItem from "./product-item";

const PickManyProductModal = lazy(() => import("../modal/pick-many-product.modal"))
type POProductProps = {
  formMain: FormInstance;
  isEdit: boolean;
  isCodeSeven?: boolean;
};
var position = 0;
const POProductForm: React.FC<POProductProps> = (props: POProductProps) => {
  const dispatch = useDispatch();
  const { formMain, isEdit, isCodeSeven } = props;
  const productSearchRef = createRef<CustomAutoComplete>();
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [data, setData] = useState<Array<VariantResponse>>([]);
  const [isPressed] = useKeyboardJs('f3');
  const [isSortSku,setIsSortSku] = useState(false);

  const renderResult = useMemo(() => {
    let options: any[] = [];
    data.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [data]);
  const onResultSearch = useCallback(
    (result: PageResponse<VariantResponse> | false) => {
      setLoadingSearch(false);
      if (!result) {
        setData([]);
      } else {
        setData(result.items);
      }
    },
    []
  );
  const handleSelectProduct = (variantId: string) => {
    const index = data.findIndex((item) => item.id.toString() === variantId);
    if(index !== -1){
      let lineItems = formMain.getFieldValue(POField.line_items);
      let variants: Array<VariantResponse> = [data[index]];
      let newItems: Array<PurchaseOrderLineItem> = [...POUtils.convertVariantToLineitem(variants, position)];
      position = position + newItems.length;
      let newLineItems = POUtils.addProduct(lineItems,newItems,false);
      formMain.setFieldsValue({
        line_items:newLineItems
      });
      const taxLines = POUtils.getVatList(formMain);
      const untaxedAmount = POUtils.totalAmount(formMain);
      formMain.setFieldsValue({
        tax_lines: taxLines,
        untaxed_amount: untaxedAmount
      });
      const total = POUtils.getTotalPayment(formMain);
      formMain.setFieldsValue({
        total: total,
      });
      //let oldLineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items_old);
    }
  } 
  const handleDeleteLineItem = (index: number) => {
      let lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
      const lineItem = lineItems[index];
      lineItems.splice(index,1);
      formMain.setFieldsValue({
        line_items: [...lineItems]
      });
      const taxLines = POUtils.getVatList(formMain);
      const untaxedAmount = POUtils.totalAmount(formMain);
      formMain.setFieldsValue({
        tax_lines: taxLines,
        untaxed_amount: untaxedAmount
      });
      const total = POUtils.getTotalPayment(formMain);
      formMain.setFieldsValue({
        total: total,
      });
      let oldLineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items_old);
      if(oldLineItems){
        const indexOld = oldLineItems.findIndex((a) => a.sku === lineItem.sku);
        if(indexOld !== -1){
          oldLineItems.splice(indexOld,1);
          formMain.setFieldsValue({
            line_items_old: [...oldLineItems]
          });
        }
      }
  }
  const handleChangePriceLineItem = (price: number, index : number) => {
    let lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
      POField.line_items
    );
    if(lineItems[index]){
      lineItems[index] = POUtils.updateLineItemByPrice(lineItems[index],price);
      updateOldLineItem(lineItems[index]);
      let untaxed_amount = POUtils.totalAmount(formMain);
      formMain.setFieldsValue({
        line_items : [...lineItems],
        untaxed_amount: untaxed_amount
      })
      let total = POUtils.getTotalPayment(formMain);
      let taxLines = POUtils.getVatList(formMain);
      formMain.setFieldsValue({
        total: total,
        tax_lines: taxLines
      })
    }
  }
  const handleChangeAllPriceLineItem = (price: number) => {
    let lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
      POField.line_items
    );
    if(lineItems.length > 0){
      lineItems = lineItems.map((lineItem) => {
        let newItem = POUtils.updateLineItemByPrice(lineItem,price);
        updateOldLineItem(newItem);
        return newItem;
      })
      formMain.setFieldsValue({
        line_items : [...lineItems]
      })
      let untaxed_amount = POUtils.totalAmount(formMain);
      formMain.setFieldsValue({
        untaxed_amount: untaxed_amount
      })
      let total = POUtils.getTotalPayment(formMain);
      let taxLines = POUtils.getVatList(formMain);
      formMain.setFieldsValue({
        total: total,
        tax_lines: taxLines
      })
    }
  }
  const handleChangeQuantityLineItem = (quantity: number,index: number) => {
    let lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
      POField.line_items
    );
    if(lineItems[index]){
      lineItems[index] = POUtils.updateLineItemByQuantity(lineItems[index],quantity);
      updateOldLineItem(lineItems[index]);
      let untaxed_amount = POUtils.totalAmount(formMain);
      formMain.setFieldsValue({
        line_items : [...lineItems],
        untaxed_amount: untaxed_amount
      })
      let total = POUtils.getTotalPayment(formMain);
      let taxLines = POUtils.getVatList(formMain);
      formMain.setFieldsValue({
        total: total,
        tax_lines: taxLines
      })
    }
  }
  const handleChangeTax = (taxRate: number,index: number) => {
    let lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
      POField.line_items
    );
    if(lineItems[index]){
      lineItems[index] = POUtils.updateLineItemByVat(formMain,lineItems[index],taxRate);
      updateOldLineItem(lineItems[index]);
      formMain.setFieldsValue({
        line_items : [...lineItems],
      })
      let taxLines = POUtils.getVatList(formMain);
      formMain.setFieldsValue({
        tax_lines: taxLines
      })
      let total = POUtils.getTotalPayment(formMain);
      formMain.setFieldsValue({
        total: total,
      })
    }
  }
  const handleChangeAllTax = (taxRate: number) => {
    let lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
      POField.line_items
    );
    if(lineItems.length > 0){
      lineItems = lineItems.map((lineItem) => {
        let newItem = POUtils.updateLineItemByVat(formMain,lineItem,taxRate);
        updateOldLineItem(newItem);
        return newItem;
      })
      formMain.setFieldsValue({
        line_items : [...lineItems],
      })
      let taxLines = POUtils.getVatList(formMain);
      formMain.setFieldsValue({
        tax_lines: taxLines
      })
      let total = POUtils.getTotalPayment(formMain);
      formMain.setFieldsValue({
        total: total,
      })
    }
  }
  const updateOldLineItem = (lineItem: PurchaseOrderLineItem) =>{
    let oldLineItems : Array<PurchaseOrderLineItem> = formMain.getFieldValue(
      POField.line_items_old
    );
    if(oldLineItems && oldLineItems.length > 0){
      const index = oldLineItems.findIndex((a) => a.sku === lineItem.sku);
      if(index !== -1){
        oldLineItems[index] = lineItem;
        formMain.setFieldsValue({
          line_items_old : oldLineItems,
        })
      }
    }
  }
  const handlePickManyProduct = (items: Array<VariantResponse>) => {
    setVisibleManyProduct(false);
    const lineItems = formMain.getFieldValue(POField.line_items);
    const newItems: Array<PurchaseOrderLineItem> = [...POUtils.convertVariantToLineitem(items,position)];
    position = position +  newItems.length;
    let newLineItems = POUtils.addProduct(lineItems,newItems,false);
    if(isSortSku){
      newLineItems = handleSortLineItems(newLineItems);
    }
    formMain.setFieldsValue({
      line_items: newLineItems
    });
    formMain.setFieldsValue({
      untaxed_amount: POUtils.totalAmount(formMain)
    });
    formMain.setFieldsValue({
      tax_lines: POUtils.getVatList(formMain)
    });
    formMain.setFieldsValue({
      total: POUtils.getTotalPayment(formMain)
    });
    const oldLineItems = formMain.getFieldValue(POField.line_items_old);
    if(oldLineItems){
      const newOldLineItems =  POUtils.addProduct(oldLineItems,newItems,false);
      formMain.setFieldsValue({
        line_items_old: newOldLineItems
      })
    }
  }
  const onNoteChange = useCallback(
    (value: string, index: number) => {
      let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
        POField.line_items
      );
      data[index].note = value;
      formMain.setFieldsValue({
        line_items: [...data],
      });
    },
    [formMain]
  );
  const onToggleNote = useCallback(
    (id: string, value: boolean, index: number) => {
      let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
        POField.line_items
      );
      data[index].showNote = value;
      formMain.setFieldsValue({
        line_items: [...data],
      });
      if (value) {
        setTimeout(() => {
          let element: any = document.getElementById(id);
          element?.focus();
        }, 100);
      }
    },
    [formMain]
  );
  const onSearch = useCallback(
    (value: string) => {
      if (value.trim() !== "" && value.length >= 3) {
        setLoadingSearch(true);
        dispatch(
          searchVariantsRequestAction(
            {
              status: "active",
              limit: 10,
              page: 1,
              info: value.trim(),
            },
            onResultSearch
          )
        );
      } else {
        setData([]);
      }
    },
    [dispatch, onResultSearch]
  );
  const onSearchProduct = () => {
    let element: any = document.getElementById("#product_search");
    element?.focus();
    const y = element?.getBoundingClientRect()?.top + window.pageYOffset - 250;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
  const sizeIndex = [
    {
      size: "XS",
      index: 1
    },
    {
      size: "S",
      index: 2
    },
    {
      size: "M",
      index: 3
    },
    {
      size: "L",
      index: 4
    },
    {
      size: "XL",
      index: 5
    },
    {
      size: "2XL",
      index: 6
    },
    {
      size: "3XL",
      index: 7
    },
    {
      size: "4XL",
      index: 8
    }
  ]
 const handleSortLineItems = (items : Array<any> ) => {
    if(items.length === 0)
      return items;
    let result: Array<any> = [];
    let newItems = items.map((item : any) => {
        let sku = item.sku;
        if(sku){
          let arrSku = sku.split('-');
          item.sku_sku = arrSku[0] ? arrSku[0] : "";
          item.sku_color = arrSku[1] ? arrSku[1] : "";
          item.sku_size = arrSku[2] ? arrSku[2] : "";
        }
        else{
          item.sku_sku = "";
          item.sku_color = "";
          item.sku_size = "";
        }
        return item;
    })
    newItems.sort((a,b) => (a.sku_sku > b.sku_sku) ? 1 : -1);
    let itemsAfter = groupByProperty(newItems,"sku_sku");
    console.log(itemsAfter);
    for(let i = 0; i < itemsAfter.length; i++){
      let subItem : Array<any> = itemsAfter[i];
        subItem.sort((a,b) => (a.sku_color > b.sku_color) ? 1 : -1)
        let subItemAfter = groupByProperty(subItem,"sku_color");
        let itemsSortSize = [];
        for(let k =0; k < subItemAfter.length; k++){
          itemsSortSize.push(sortBySize(subItemAfter[k]));
          console.log("itemsSortSize",itemsSortSize);
          itemsAfter[i] = itemsSortSize;
      }
    }
    console.log(itemsAfter);
    for(let i = 0; i < itemsAfter.length; i++){
      for(let j = 0; j < itemsAfter[i].length; j++){
        for(let k = 0; k < itemsAfter[i][j].length; k++){
          if(Array.isArray(itemsAfter[i][j][k])){
            for(let h = 0; h < itemsAfter[i][j][k].length; h++){
              result.push(itemsAfter[i][j][k][h]);
            }
          }
          else{
            result.push(itemsAfter[i][j][k]);
          }
        }
      }
    }
    console.log(result);
    return result;
  }
  const groupByProperty = (collection: Array<any>,property: string) => {
    let  val, index, values = [], result = [];
    for (let i = 0; i < collection.length; i++) {
        val = collection[i][property];
        index = values.indexOf(val);
        if (index > -1)
            result[index].push(collection[i]);
        else {
            values.push(val);
            result.push([collection[i]]);
        }
    }
    return result;
  }
  const sortBySize = (collection : Array<any>) => {
    for(let i = 0; i < collection.length; i++){
      for(let j = i+1; j < collection.length; j++){
        if(isNaN(parseFloat(collection[i].sku_size)) && isNaN(parseFloat(collection[j].sku_size))){
          let sku_size1 = collection[i].sku_size ? collection[i].sku_size.split('/')[0] : "";
          let sku_size2 = collection[j].sku_size ? collection[j].sku_size.split('/')[0] : "";
          let size1 = sizeIndex.find(item => item.size === sku_size1);
          let size2 = sizeIndex.find(item => item.size === sku_size2);
          if(size1 !== undefined && size2 !== undefined){
            if(size2.index < size1.index){
              console.log("1",collection[i],collection[j]);
              [collection[i],collection[j]] = swapItem(collection[i],collection[j]);
              console.log("2",collection[i],collection[j]);
            }
          }
          else if(size1 === undefined){
            [collection[i],collection[j]] = swapItem(collection[i],collection[j]);
          }
        }
        else if(!isNaN(parseFloat(collection[i].sku_size)) && isNaN(parseFloat(collection[j].sku_size))){
          [collection[i],collection[j]] = swapItem(collection[i],collection[j]);
        }
        else if(!isNaN(parseFloat(collection[i].sku_size)) && !isNaN(parseFloat(collection[j].sku_size))){
          if(parseFloat(collection[i].sku_size) > parseFloat(collection[j].sku_size)){
            console.log("1",collection[i],collection[j]);
            [collection[i],collection[j]] = swapItem(collection[i],collection[j]);
            console.log("2",collection[i],collection[j]);
          }
        }
      }
    }
    console.log("col:",collection);
    return collection;
  }
  const swapItem = (a: any,b: any) => {
    let temp = a;
    a = {...b};
    b = {...temp};
    return [a,b]
  }
  useEffect(() => {
    if(isPressed) {
      onSearchProduct()
    }
  }, [isPressed])

  return (
    <React.Fragment>
      <>
        <div>
          <Form.Item
            noStyle
            shouldUpdate={(prev, current) => prev.status !== current.status}
          >
            {({ getFieldValue }) => {
              let status = getFieldValue("status");
              return (
                !isEdit && (!status || status === POStatus.DRAFT) && (
                  <Input.Group className="display-flex">
                    <CustomAutoComplete
                      loading={loadingSearch}
                      id="#product_search"
                      disabled={!isCodeSeven}
                      dropdownClassName="product"
                      placeholder="Tìm kiếm sản phẩm theo tên, mã SKU, mã vạch ... (F3)"
                      onSearch={onSearch}
                      dropdownMatchSelectWidth={456}
                      style={{ width: "100%" }}
                      showAdd={true}
                      textAdd="Thêm mới sản phẩm"
                      onSelect={handleSelectProduct}
                      options={renderResult}
                      ref={productSearchRef}
                      onClickAddNew={() => {
                        window.open(
                          `${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`,
                          "_blank"
                        );
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
                )
              );
            }}
          </Form.Item>
          {}

          <Form.Item noStyle name={POField.line_items} hidden>
            <Input />
          </Form.Item>
          <Form.Item
            style={{ padding: 0 }}
            className="margin-top-20"
            shouldUpdate={(prevValues, curValues) =>
              prevValues[POField.line_items] !== curValues[POField.line_items]
            }
          >
            {({ getFieldValue }) => {
              let items = getFieldValue(POField.line_items)
                ? getFieldValue(POField.line_items)
                : [];
              let status = getFieldValue(POField.status);
              return !isEdit && (!status || status === POStatus.DRAFT) ? (
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
                  sortDirections={[ "descend", null]}
                  onChange={(pagination: TablePaginationConfig, filters: any, sorter: any) => {
                    if(sorter){
                      if(sorter.order == null){
                        setIsSortSku(false)
                        let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
                          POField.line_items_old
                        );
                        formMain.setFieldsValue({
                          line_items: [...data],
                        });
                      }
                      else{
                        setIsSortSku(true)
                        let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
                          POField.line_items
                        );
                        formMain.setFieldsValue({
                          line_items_old: [...data],
                        });
                        data = handleSortLineItems(data);
                        formMain.setFieldsValue({
                          line_items: [...data],
                        });
                      }
                    }
                  }}
                  rowKey={(record: PurchaseOrderLineItem) => record.temp_id}
                  rowClassName="product-table-row"
                  columns={[
                    {
                      title: "STT",
                      align: "center",
                      width: 60,
                      render: (value, record, index) => index + 1,
                    },
                    {
                      title: "Ảnh",
                      width: 60,
                      dataIndex: "variant_image",
                      render: (value) => (
                        <div className="product-item-image">
                          <img
                            src={value === null ? imgDefIcon : value}
                            alt=""
                            className=""
                          />
                        </div>
                      ),
                    },
                    {
                      title: "Sản phẩm",
                      width: "99%",
                      sorter: true,
                      className: "ant-col-info",
                      dataIndex: "variant",
                      render: (
                        value: string,
                        item: PurchaseOrderLineItem,
                        index: number
                      ) => {
                        return (
                          <div>
                            <div>
                              <div className="product-item-sku">
                                <Link
                                  target="_blank"
                                  to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                                  className="text-truncate-1"
                                >
                                  {item.sku}
                                </Link>
                              </div>
                              <div className="product-item-name text-truncate-1">
                                <div className="product-item-name-detail">
                                  {value}
                                </div>
                                {!item.showNote && (
                                  <Button
                                    onClick={() => {
                                      onToggleNote(
                                        `note_${item.temp_id}`,
                                        true,
                                        index
                                      );
                                    }}
                                    className={classNames(
                                      "product-item-name-note",
                                      item.note === "" && "product-item-note"
                                    )}
                                    type="link"
                                  >
                                    <i> Thêm ghi chú</i>
                                  </Button>
                                )}
                              </div>
                            </div>
                            {item.showNote && (
                              <Input
                                id={`note_${item.temp_id}`}
                                onBlur={(e) => {
                                  if (e.target.value === "") {
                                    onToggleNote(
                                      `note_${item.temp_id}`,
                                      false,
                                      index
                                    );
                                  }
                                }}
                                addonBefore={<EditOutlined />}
                                placeholder="Nhập ghi chú"
                                value={item.note}
                                className="product-item-note-input"
                                onChange={(e) =>
                                  onNoteChange(e.target.value, index)
                                }
                              />
                            )}
                          </div>
                        );
                      },
                    },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                            flexDirection: "column",
                            display: "flex",
                            padding: "7px 14px",
                          }}
                        >
                          SL
                          <div
                            style={{ color: "#2A2A86", fontWeight: "normal" }}
                          >
                            ({formatCurrency(POUtils.totalQuantity(items),".")})
                          </div>
                        </div>
                      ),
                      width: 100,
                      dataIndex: "quantity",
                      render: (value, item, index) => (
                        <NumberInput
                          isFloat={false}
                          value={value}
                          min={1}
                          default={1}
                          maxLength={6}
                          onChange={(quantity) => {
                            handleChangeQuantityLineItem(quantity || 0, index);
                            // applyChangeQtyForProcurement(quantity||0, item.variant_id);
                          }}
                        />
                      ),
                    },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          <div>
                            Giá nhập
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
                          <NumberInput
                            style={{ width: "80%" }}
                            min={0}
                            format={(a: string) => formatCurrency(a ? a : 0, '')}
                            replace={(a: string) => replaceFormatString(a)}
                            onPressEnter={(e) => {
                              handleChangeAllPriceLineItem(e.target.value || 0)
                            }}
                          />
                        </div>
                      ),
                      width: 175,
                      dataIndex: "price",
                      render: (value, item, index) => {
                        return (
                          <NumberInput
                            className="hide-number-handle"
                            min={0}
                            format={(a: string) => formatCurrency(a ? a : 0)}
                            replace={(a: string) => replaceFormatString(a)}
                            value={item.price > 0 ? item.price : value}
                            onChange={(inputValue) => {
                              handleChangePriceLineItem(inputValue || 0,index);
                            }}
                          />
                        );
                      },
                    },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          <div>VAT</div>
                          <NumberInput
                            style={{ width: "100%" }}
                            className="product-item-vat"
                            prefix={<div>%</div>}
                            isFloat
                            onPressEnter={(e) => {
                              handleChangeAllTax(e.target.value || 0);
                            }}
                          />
                        </div>
                      ),
                      width: 100,
                      dataIndex: "tax_rate",
                      render: (value, item, index) => {
                        return (
                          <NumberInput
                            className="product-item-vat"
                            value={ item.tax_rate > 0 ? item.tax_rate : value}
                            prefix={<div>%</div>}
                            isFloat
                            onChange={(inputValue) => {
                              handleChangeTax(inputValue || 0,index);
                            }}
                            min={0}
                            maxLength={3}
                            max={100}
                          />
                        );
                      },
                    },
                    {
                      dataIndex: "line_amount_after_line_discount",
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
                      width: 130,
                      render: (value: number) => (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          {formatCurrency(Math.round(value||0))}
                        </div>
                      ),
                    },
                    {
                      title: "",
                      fixed: items.length !== 0 && "right",
                      width: 40,
                      render: (value: string, item, index: number) => (
                        <Button
                          onClick={() => handleDeleteLineItem(index)}
                          className="product-item-delete"
                          icon={<AiOutlineClose />}
                        />
                      ),
                    },
                  ]}
                  dataSource={items}
                  tableLayout="fixed"
                  pagination={false}
                  scroll={{ y: 515, x: 950 }}
                />
              ) : (
                <Table
                  className="product-table"
                  rowKey={(record: PurchaseOrderLineItem) =>
                    record.id ? record.id : record.temp_id
                  }
                  rowClassName="product-table-row"
                  dataSource={items}
                  tableLayout="fixed"
                  scroll={{ y: 515, x: 1000 }}
                  pagination={false}
                  columns={[
                    {
                      title: "STT",
                      align: "center",
                      fixed: "left",
                      width: 60,
                      render: (value, record, index) => index + 1,
                    },
                    {
                      title: "Ảnh",
                      width: 60,
                      fixed: "left",
                      dataIndex: "variant_image",
                      render: (value) => (
                        <div className="product-item-image">
                          <img
                            src={value === null ? imgDefIcon : value}
                            alt=""
                            className=""
                          />
                        </div>
                      ),
                    },
                    {
                      title: "Sản phẩm",
                      className: "ant-col-info",
                      width: 250,
                      fixed: "left",
                      dataIndex: "variant",
                      render: (
                        value: string,
                        item: PurchaseOrderLineItem,
                        index: number
                      ) => {
                        return (
                          <div>
                            <div>
                              <div className="product-item-sku">
                                <Link
                                  target="_blank"
                                  to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                                >
                                  {item.sku}
                                </Link>
                              </div>
                              <div className="product-item-name text-truncate-1">
                                <div className="product-item-name-detail">
                                  {value}
                                </div>
                              </div>
                              <div className="product-item-name text-truncate-1">
                                <div className="product-item-name-detail">
                                  {item.note}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    },
                    {
                      title: "Đơn vị",
                      align: "center",
                      width: 100,
                      render: () => "Cái",
                    },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                            flexDirection: "column",
                            display: "flex",
                          }}
                        >
                          SL
                          <div
                            style={{ color: "#2A2A86", fontWeight: "normal" }}
                          >
                            ({formatCurrency(POUtils.totalQuantity(items),".")})
                          </div>
                        </div>
                      ),
                      width: 100,
                      dataIndex: "quantity",
                      render: (value, item, index) => (
                        <div style={{ textAlign: "right" }}>{formatCurrency(value,".")}</div>
                      ),
                    },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          Giá nhập
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
                      ),
                      width: 140,
                      dataIndex: "price",
                      render: (value, item, index) => {
                        return (
                          <div
                            style={{
                              width: "100%",
                              textAlign: "right",
                            }}
                          >
                            {formatCurrency(
                              Math.round(
                                POUtils.caculatePrice(
                                  value,
                                  item.discount_rate,
                                  item.discount_value
                                )
                              )
                            )}
                          </div>
                        );
                      },
                    },
                    {
                      title: (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          VAT (%)
                        </div>
                      ),
                      width: 120,
                      dataIndex: "tax_rate",
                      render: (value, item, index) => {
                        return (
                          <div
                            style={{
                              width: "100%",
                              textAlign: "right",
                            }}
                          >
                            {value} %
                          </div>
                        );
                      },
                    },
                    {
                      dataIndex: "line_amount_after_line_discount",
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
                      width: 130,
                      render: (value: number) => (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          {formatCurrency(Math.round(value))}
                        </div>
                      ),
                    },
                    {
                      title: "",
                      width: 40,
                      render: (value: string, item, index: number) => "",
                    },
                  ]}
                />
              );
            }}
          </Form.Item>
          <Row gutter={24}>
            <Col span={12} />
            <Col span={12}>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues[POField.untaxed_amount] !==
                  curValues[POField.untaxed_amount]
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let untaxed_amount = getFieldValue(POField.untaxed_amount);
                  return (
                    <div className="po-payment-row">
                      <div>Tổng tiền</div>
                      <div className="po-payment-row-result">
                        {untaxed_amount === 0
                          ? "-"
                          : formatCurrency(Math.round(untaxed_amount||0))}
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
              <Form.Item name={POField.untaxed_amount} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.trade_discount_amount} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.trade_discount_rate} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.trade_discount_value} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.payment_discount_amount} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.payment_discount_rate} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.payment_discount_value} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues.tax_lines !== curValues.tax_lines
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let tax_lines = getFieldValue("tax_lines");
                  return tax_lines.map((item: Vat) => (
                    <div className="po-payment-row">
                      <div>{`VAT (${item.rate}%)`}</div>
                      <div className="po-payment-row-result">
                        {formatCurrency(Math.round(item.amount))}
                      </div>
                    </div>
                  ));
                }}
              </Form.Item>
              <Divider style={{marginTop: 5, marginBottom: 10}} />
              <Form.Item name={POField.cost_lines} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.total_cost_line} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.total} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item name={POField.tax_lines} hidden noStyle>
                <Input />
              </Form.Item>
              <Form.Item
                shouldUpdate={(prevValues, curValues) =>
                  prevValues[POField.total] !== curValues[POField.total]
                }
                noStyle
              >
                {({ getFieldValue }) => {
                  let total = getFieldValue(POField.total);
                  return (
                    <div className="po-payment-row">
                      <strong className="po-payment-row-title">
                        Tiền cần trả
                      </strong>
                      <strong className="po-payment-row-success">
                        {formatCurrency(Math.round(total||0))}
                      </strong>
                    </div>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>
        </div>
      </>
      {
        visibleManyProduct && (
          <PickManyProductModal
            onSave={handlePickManyProduct}
            selected={[]}
            onCancel={() => setVisibleManyProduct(false)}
            visible={visibleManyProduct}
          />
        )
      }
    </React.Fragment>
  );
};

export default POProductForm;
