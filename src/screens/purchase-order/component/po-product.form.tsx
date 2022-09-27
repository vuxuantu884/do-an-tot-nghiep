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
  Tooltip,
} from "antd";
import emptyProduct from "assets/icon/empty_products.svg";
import imgDefIcon from "assets/img/img-def.svg";
import classNames from "classnames";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import NumberInput from "component/custom/number-input.custom";
import { AppConfig } from "config/app.config";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { searchVariantsRequestAction } from "domain/actions/product/products.action";
import { debounce, groupBy } from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { ProcurementLineItemField } from "model/procurement/field";
import { VariantResponse } from "model/product/product.model";
import { POField } from "model/purchase-order/po-field";
import {
  POLineItemType,
  POLoadType,
  PurchaseOrderLineItem,
  Vat,
} from "model/purchase-order/purchase-item.model";
import { PODataSourceGrid } from "model/purchase-order/purchase-order.model";
import { PurchaseProcument } from "model/purchase-order/purchase-procument";
import React, { createRef, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import useKeyboardJs from "react-use/lib/useKeyboardJs";
import { formatCurrency, parseLocaleNumber, replaceFormatString } from "utils/AppUtils";
import { POStatus, ProcumentStatus } from "utils/Constants";
import {
  getTotalAmountByLineItemType,
  getUntaxedAmountByLineItemType,
  POUtils,
  summaryContentByLineItemType,
} from "utils/POUtils";
import { showError } from "utils/ToastUtils";
import BaseButton from "../../../component/base/BaseButton";
import { IconAddMultiple } from "../../../component/icon/IconAddMultiple";
import PickManyProductModal from "../modal/pick-many-product.modal";
import { PurchaseOrderCreateContext } from "../provider/purchase-order.provider";
import ProductItem from "./product-item";
type POProductProps = {
  formMain: FormInstance;
  isEdit: boolean;
  poLineItemType: POLineItemType;
  isEditPrice?: boolean;
};
var position = 0;
const POProductForm: React.FC<POProductProps> = (props: POProductProps) => {
  const dispatch = useDispatch();
  const { formMain, isEdit, poLineItemType, isEditPrice } = props;
  const productSearchRef = createRef<CustomAutoComplete>();
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [resultSearch, setResultSearch] = useState<Array<VariantResponse>>([]);
  const [isPressed] = useKeyboardJs("f3");
  const [isSortSku, setIsSortSku] = useState(false);

  //context
  const {
    setProcurementTableData,
    procurementTableData,
    expectedDate,
    handleChangeProcument,
    procurementTable,
    setProcurementTable,
  } = useContext(PurchaseOrderCreateContext);

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
  const handleSelectProduct = (variantId: string) => {
    const lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
    if (
      poLineItemType === POLineItemType.SUPPLEMENT &&
      lineItems.find((item) => item.variant_id === +variantId && item.id)
    ) {
      showError("Sản phẩm bổ sung đã tồn tại trong đơn hàng");
      return;
    }

    const index = resultSearch.findIndex((item) => item.id.toString() === variantId);
    if (index !== -1) {
      const variants: Array<VariantResponse> = [resultSearch[index]];
      const newItems: Array<PurchaseOrderLineItem> = [
        ...POUtils.convertVariantToLineitem(variants, position, poLineItemType),
      ];
      position = position + newItems.length;
      const newLineItems = POUtils.addProduct(lineItems, newItems, false);
      const newLineItemsFilter = [
        ...newLineItems.filter((item) => item.id),
        ...newLineItems.filter((item) => !item.id),
      ];

      const dataSourceGrid: Array<PODataSourceGrid | any> = newLineItemsFilter.map((item) => {
        const retailPrice =
          item.variant_prices?.length > 0 ? item.variant_prices[0]?.retail_price : null;
        const expectedDateClone = expectedDate.map((itemDate) => {
          return {
            ...itemDate,
          };
        });
        return {
          variantId: item.variant_id,
          productId: item?.product_id,
          sku: item.sku,
          quantity: item.quantity,
          expectedDate: [...expectedDateClone],
          retail_price: retailPrice,
          price: item?.variant_prices?.length ? item?.variant_prices[0].import_price : 0,
          barcode: item.barcode,
          variant_images: item.variant_image,
          product_name: item.product,
          variant: item.variant,
          variant_image: item?.variant_image,
          // line_item_id: item.id,
          note: "",
        };
      });
      setProcurementTableData(dataSourceGrid);
      const currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(
        POField.procurements,
      );
      const newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
        currentProcument,
        newLineItems,
        poLineItemType,
      );
      formMain.setFieldsValue({
        line_items: newLineItemsFilter,
      });
      formMain.setFieldsValue({
        procurements: newProcument,
      });
      handleChangeProcument(formMain);
    }
  };
  const handleDeleteLineItem = (lineItemDelete: PurchaseOrderLineItem) => {
    let lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
    const index = lineItems.findIndex((item) => item.variant_id === lineItemDelete.variant_id);
    const indexProcurementTable = procurementTable.findIndex(
      (item) => item.variant_id === lineItemDelete.variant_id,
    );
    if (indexProcurementTable >= 0) {
      procurementTable.splice(indexProcurementTable, 1);
      setProcurementTable([...procurementTable]);
    }
    const lineItem = lineItems[index];
    lineItems.splice(index, 1);
    procurementTableData.splice(index, 1);
    setProcurementTableData([...procurementTableData]);
    formMain.setFieldsValue({
      line_items: [...lineItems],
    });

    let oldLineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items_old);
    if (oldLineItems) {
      const indexOld = oldLineItems.findIndex((a) => a.sku === lineItem.sku);
      if (indexOld !== -1) {
        oldLineItems.splice(indexOld, 1);
        formMain.setFieldsValue({
          line_items_old: [...oldLineItems],
        });
      }
    }
    let currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(POField.procurements);
    let newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
      currentProcument,
      lineItems,
      poLineItemType,
    );
    formMain.setFieldsValue({
      procurements: newProcument,
    });
  };
  const handleChangePriceLineItem = (price: number, item: PurchaseOrderLineItem) => {
    let lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
    const indexOfItem = lineItems.findIndex((a) => a.sku === item.sku);

    if (lineItems[indexOfItem]) {
      lineItems[indexOfItem] = POUtils.updateLineItemByPrice(lineItems[indexOfItem], price);
      updateOldLineItem(lineItems[indexOfItem]);
      formMain.setFieldsValue({
        line_items: [...lineItems],
      });

      const currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(
        POField.procurements,
      );
      const newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
        currentProcument,
        lineItems,
        poLineItemType,
      );
      formMain.setFieldsValue({
        procurements: newProcument,
      });
    }
  };
  const handleChangeAllPriceLineItem = (price: number) => {
    const lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
    if (lineItems.length > 0) {
      lineItems.forEach((lineItem: PurchaseOrderLineItem, index: number) => {
        if (poLineItemType === POLineItemType.SUPPLEMENT && lineItem.id) {
          return;
        } else if (
          poLineItemType === POLineItemType.SUPPLEMENT &&
          lineItem.type === POLineItemType.SUPPLEMENT &&
          !lineItem.id
        ) {
          const newItem = POUtils.updateLineItemByPrice(lineItem, price);
          updateOldLineItem(newItem);
          lineItems[index] = newItem;
          return;
        } else if (
          poLineItemType !== POLineItemType.SUPPLEMENT &&
          lineItem.type !== POLineItemType.SUPPLEMENT
        ) {
          const newItem = POUtils.updateLineItemByPrice(lineItem, price);
          updateOldLineItem(newItem);
          lineItems[index] = newItem;
          return;
        }
      });

      formMain.setFieldsValue({
        line_items: [...lineItems],
      });

      const currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(
        POField.procurements,
      );
      const newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
        currentProcument,
        lineItems,
        poLineItemType,
      );
      formMain.setFieldsValue({
        procurements: newProcument,
      });
    }
  };

  const handleChangeQuantityLineItem = (quantity: number, item: PurchaseOrderLineItem) => {
    const lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
    const indexOfItem = lineItems.findIndex((a) => a.sku === item.sku);

    if (lineItems[indexOfItem]) {
      lineItems[indexOfItem] = POUtils.updateLineItemByQuantity(lineItems[indexOfItem], quantity);
      updateOldLineItem(lineItems[indexOfItem]);
      if (procurementTableData[indexOfItem]) {
        procurementTableData[indexOfItem]["quantity"] = quantity || 0;
      }
      formMain.setFieldsValue({
        line_items: [...lineItems],
      });
      const currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(
        POField.procurements,
      );
      const newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
        currentProcument,
        lineItems,
        poLineItemType,
      );
      formMain.setFieldsValue({
        [POField.procurements]: newProcument,
        // [POField.line_items]: lineItems,
      });
      setProcurementTableData([...procurementTableData]);
    }
  };

  const handleChangeTax = (taxRate: number, item: PurchaseOrderLineItem) => {
    let lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
    const indexOfItem = lineItems.findIndex((a) => a.sku === item.sku);
    if (lineItems[indexOfItem]) {
      lineItems[indexOfItem] = POUtils.updateLineItemByVat(lineItems[indexOfItem], taxRate);
      updateOldLineItem(lineItems[indexOfItem]);
      formMain.setFieldsValue({
        line_items: [...lineItems],
      });

      let currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(POField.procurements);
      let newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
        currentProcument,
        lineItems,
        poLineItemType,
      );
      formMain.setFieldsValue({
        procurements: newProcument,
      });
    }
  };

  const handleChangeAllTax = (taxRate: number) => {
    let lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
    if (lineItems.length > 0) {
      lineItems.forEach((lineItem) => {
        if (poLineItemType === POLineItemType.SUPPLEMENT && lineItem.id) {
          return;
        } else if (
          poLineItemType === POLineItemType.SUPPLEMENT &&
          lineItem.type === POLineItemType.SUPPLEMENT &&
          !lineItem.id
        ) {
          const newItem = POUtils.updateLineItemByVat(lineItem, taxRate);
          updateOldLineItem(newItem);
          return;
        } else if (
          poLineItemType !== POLineItemType.SUPPLEMENT &&
          lineItem.type !== POLineItemType.SUPPLEMENT
        ) {
          const newItem = POUtils.updateLineItemByVat(lineItem, taxRate);
          updateOldLineItem(newItem);
          return;
        }
      });

      formMain.setFieldsValue({
        line_items: [...lineItems],
      });
      let currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(POField.procurements);
      let newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
        currentProcument,
        lineItems,
        poLineItemType,
      );
      formMain.setFieldsValue({
        procurements: newProcument,
      });
    }
  };
  const updateOldLineItem = (lineItem: PurchaseOrderLineItem) => {
    let oldLineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items_old);
    if (oldLineItems && oldLineItems.length > 0) {
      const index = oldLineItems.findIndex((a) => a.sku === lineItem.sku);
      if (index !== -1) {
        oldLineItems[index] = lineItem;
        formMain.setFieldsValue({
          line_items_old: oldLineItems,
        });
      }
    }
  };
  const handlePickManyProduct = (items: Array<VariantResponse>) => {
    let numberOfExistItem = 0;
    const variantsSelected = [...items];
    const lineItems: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
    if (poLineItemType === POLineItemType.SUPPLEMENT) {
      items.forEach((item) => {
        if (lineItems.find((line) => line.variant_id === item.id && line.id)) {
          variantsSelected.splice(
            variantsSelected.findIndex((a) => a.id === item.id),
            1,
          );
          numberOfExistItem++;
        }
      });
      numberOfExistItem &&
        showError(`${numberOfExistItem} Sản phẩm bổ sung đã tồn tại trong đơn hàng`);
    }
    setVisibleManyProduct(false);

    const newItems: Array<PurchaseOrderLineItem> = [
      ...POUtils.convertVariantToLineitem(variantsSelected, position, poLineItemType),
    ];
    position = position + newItems.length;
    let newLineItems = POUtils.addProduct(lineItems, newItems, false);
    const dataSourceGrid: Array<PODataSourceGrid | any> = newLineItems.map((item) => {
      const retailPrice =
        item?.variant_prices?.length > 0 ? item.variant_prices[0]?.retail_price : null;
      const expectedDateClone = expectedDate.map((item) => {
        return {
          ...item,
        };
      });
      return {
        variantId: item.variant_id,
        productId: item?.product_id,
        sku: item.sku,
        quantity: item.quantity,
        expectedDate: [...expectedDateClone],
        retail_price: retailPrice,
        price: item?.variant_prices?.length ? item?.variant_prices[0].import_price : 0,
        barcode: item.barcode,
        variant_images: item.variant_image,
        product_name: item.product,
        variant: item.variant,
        variant_image: item.variant_image,
        note: "",
      };
    });
    setProcurementTableData(dataSourceGrid);
    if (isSortSku) {
      newLineItems = handleSortLineItems(newLineItems);
    }
    formMain.setFieldsValue({
      line_items: newLineItems,
    });

    const oldLineItems = formMain.getFieldValue(POField.line_items_old);
    if (oldLineItems) {
      const newOldLineItems = POUtils.addProduct(oldLineItems, newItems, false);
      formMain.setFieldsValue({
        line_items_old: newOldLineItems,
      });
    }

    const currentProcument: Array<PurchaseProcument> = formMain.getFieldValue(POField.procurements);
    const newProcument: Array<PurchaseProcument> = POUtils.getNewProcument(
      currentProcument,
      newLineItems,
      poLineItemType,
    );
    formMain.setFieldsValue({
      procurements: newProcument,
    });
    handleChangeProcument(formMain);
  };
  const onNoteChange = useCallback(
    (value: string, index: number) => {
      let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
      data[index].note = value;
      formMain.setFieldsValue({
        line_items: [...data],
      });
    },
    [formMain],
  );
  const onToggleNote = useCallback(
    (id: string, value: boolean, index: number) => {
      let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(POField.line_items);
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
    [formMain],
  );
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
  const onSearchProduct = () => {
    let element: any = document.getElementById("#product_search");
    element?.focus();
    const y = element?.getBoundingClientRect()?.top + window.pageYOffset - 250;
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  const sizeIndex = [
    {
      size: "XS",
      index: 1,
    },
    {
      size: "S",
      index: 2,
    },
    {
      size: "M",
      index: 3,
    },
    {
      size: "L",
      index: 4,
    },
    {
      size: "XL",
      index: 5,
    },
    {
      size: "2XL",
      index: 6,
    },
    {
      size: "3XL",
      index: 7,
    },
    {
      size: "4XL",
      index: 8,
    },
  ];
  const handleSortLineItems = (items: Array<any>) => {
    if (items.length === 0) return items;
    let result: Array<any> = [];
    let newItems = items.map((item: any) => {
      let sku = item.sku;
      if (sku) {
        let arrSku = sku.split("-");
        item.sku_sku = arrSku[0] ? arrSku[0] : "";
        item.sku_color = arrSku[1] ? arrSku[1] : "";
        item.sku_size = arrSku[2] ? arrSku[2] : "";
      } else {
        item.sku_sku = "";
        item.sku_color = "";
        item.sku_size = "";
      }
      return item;
    });
    newItems.sort((a, b) => (a.sku_sku > b.sku_sku ? 1 : -1));
    let itemsAfter = groupByProperty(newItems, "sku_sku");
    for (let i = 0; i < itemsAfter.length; i++) {
      let subItem: Array<any> = itemsAfter[i];
      subItem.sort((a, b) => (a.sku_color > b.sku_color ? 1 : -1));
      let subItemAfter = groupByProperty(subItem, "sku_color");
      let itemsSortSize = [];
      for (let k = 0; k < subItemAfter.length; k++) {
        itemsSortSize.push(sortBySize(subItemAfter[k]));
        itemsAfter[i] = itemsSortSize;
      }
    }
    for (let i = 0; i < itemsAfter.length; i++) {
      for (let j = 0; j < itemsAfter[i].length; j++) {
        for (let k = 0; k < itemsAfter[i][j].length; k++) {
          if (Array.isArray(itemsAfter[i][j][k])) {
            for (let h = 0; h < itemsAfter[i][j][k].length; h++) {
              result.push(itemsAfter[i][j][k][h]);
            }
          } else {
            result.push(itemsAfter[i][j][k]);
          }
        }
      }
    }
    return result;
  };
  const groupByProperty = (collection: Array<any>, property: string) => {
    let val,
      index,
      values = [],
      result = [];
    for (let i = 0; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) result[index].push(collection[i]);
      else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  };
  const sortBySize = (collection: Array<any>) => {
    for (let i = 0; i < collection.length; i++) {
      for (let j = i + 1; j < collection.length; j++) {
        if (
          isNaN(parseFloat(collection[i].sku_size)) &&
          isNaN(parseFloat(collection[j].sku_size))
        ) {
          let sku_size1 = collection[i].sku_size ? collection[i].sku_size.split("/")[0] : "";
          let sku_size2 = collection[j].sku_size ? collection[j].sku_size.split("/")[0] : "";
          let size1 = sizeIndex.find((item) => item.size === sku_size1);
          let size2 = sizeIndex.find((item) => item.size === sku_size2);
          if (size1 !== undefined && size2 !== undefined) {
            if (size2.index < size1.index) {
              [collection[i], collection[j]] = swapItem(collection[i], collection[j]);
            }
          } else if (size2 === undefined) {
            [collection[i], collection[j]] = swapItem(collection[i], collection[j]);
          }
        } else if (
          !isNaN(parseFloat(collection[i].sku_size)) &&
          isNaN(parseFloat(collection[j].sku_size))
        ) {
          [collection[i], collection[j]] = swapItem(collection[i], collection[j]);
        } else if (
          !isNaN(parseFloat(collection[i].sku_size)) &&
          !isNaN(parseFloat(collection[j].sku_size))
        ) {
          if (parseFloat(collection[i].sku_size) > parseFloat(collection[j].sku_size)) {
            [collection[i], collection[j]] = swapItem(collection[i], collection[j]);
          }
        }
      }
    }
    return collection;
  };
  const swapItem = (a: any, b: any) => {
    let temp = a;
    a = { ...b };
    b = { ...temp };
    return [a, b];
  };

  const isEditFormByType = () => {
    const stt = formMain.getFieldValue(POField.status);
    if (!isEdit) {
      return false;
    }
    if (stt && (stt === POStatus.DRAFT || stt === POStatus.WAITING_APPROVAL) && isEdit) {
      return true;
    }
    if (poLineItemType === POLineItemType.NORMAL && (!stt || stt === POStatus.DRAFT)) {
      return true;
    }
    const receive_status = formMain.getFieldValue(POField.receive_status);
    if (
      poLineItemType === POLineItemType.SUPPLEMENT &&
      [POStatus.FINALIZED, POStatus.STORED].includes(stt) &&
      receive_status !== ProcumentStatus.FINISHED
    ) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (isPressed) {
      onSearchProduct();
    }
    return () => {
      setResultSearch([]);
    };
  }, [isPressed]);

  return (
    <React.Fragment>
      <div>
        <Form.Item noStyle shouldUpdate={(prev, current) => prev.status !== current.status}>
          {() => {
            return (
              isEditFormByType() && (
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
              )
            );
          }}
        </Form.Item>
        <Form.Item
          style={{ padding: 0 }}
          shouldUpdate={(prevValues, curValues) =>
            prevValues[POField.line_items] !== curValues[POField.line_items]
          }
        >
          {({ getFieldValue }) => {
            const lineItems: Array<PurchaseOrderLineItem> = getFieldValue(POField.line_items) || [];
            const items = lineItems.filter((item: PurchaseOrderLineItem) =>
              poLineItemType === POLineItemType.SUPPLEMENT
                ? item.type === POLineItemType.SUPPLEMENT
                : item.type !== POLineItemType.SUPPLEMENT,
            );
            return isEditFormByType() ? (
              <Table
                className="product-table"
                locale={{
                  emptyText: (
                    <Empty
                      description="Đơn hàng của bạn chưa có sản phẩm"
                      image={<img src={emptyProduct} alt="" />}
                    >
                      <Button
                        htmlType="button"
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
                sortDirections={["descend", null]}
                onChange={(pagination: TablePaginationConfig, filters: any, sorter: any) => {
                  if (sorter) {
                    if (sorter.order == null) {
                      setIsSortSku(false);
                      let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
                        POField.line_items_old,
                      );
                      formMain.setFieldsValue({
                        line_items: [...data],
                      });
                    } else {
                      setIsSortSku(true);
                      let data: Array<PurchaseOrderLineItem> = formMain.getFieldValue(
                        POField.line_items,
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
                rowKey={(record: PurchaseOrderLineItem) => record.sku}
                rowClassName="product-table-row"
                columns={[
                  {
                    title: "STT",
                    align: "center",
                    width: 60,
                    render: (value, record, index: number) => index + 1,
                  },
                  {
                    title: "Ảnh",
                    width: 60,
                    dataIndex: "variant_image",
                    render: (value) => (
                      <div className="product-item-image">
                        <img src={value === null ? imgDefIcon : value} alt="" className="" />
                      </div>
                    ),
                  },
                  {
                    title: "Sản phẩm",
                    width: "99%",
                    sorter: true,
                    className: "ant-col-info",
                    dataIndex: "variant",
                    render: (value: string, item: PurchaseOrderLineItem, index: number) => {
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
                              <div className="product-item-name-detail">{value}</div>
                              {!item.showNote && (
                                <Button
                                  htmlType="button"
                                  onClick={() => {
                                    onToggleNote(`note_${item.temp_id}`, true, index);
                                  }}
                                  className={classNames(
                                    "product-item-name-note",
                                    item.note === "" && "product-item-note",
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
                                  onToggleNote(`note_${item.temp_id}`, false, index);
                                }
                              }}
                              addonBefore={<EditOutlined />}
                              placeholder="Nhập ghi chú"
                              value={item.note}
                              className="product-item-note-input"
                              onChange={(e) => onNoteChange(e.target.value, index)}
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
                        <div style={{ color: "#2A2A86", fontWeight: "normal" }}>
                          ({formatCurrency(POUtils.totalQuantity(items), ".")})
                        </div>
                      </div>
                    ),
                    width: 100,
                    dataIndex: "quantity",
                    render: (value, item: PurchaseOrderLineItem, index) => {
                      const disabled = Boolean(item.type === POLineItemType.SUPPLEMENT && item.id);
                      return (
                        <NumberInput
                          isFloat={false}
                          value={value}
                          min={0}
                          default={1}
                          maxLength={6}
                          onChange={(quantity) => {
                            handleChangeQuantityLineItem(quantity || 0, item);
                          }}
                          disabled={disabled}
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
                          format={(a: string) => formatCurrency(a ? a : 0, "")}
                          replace={(value?: string) => {
                            let parseValue = 0;
                            if (value) {
                              parseValue = parseLocaleNumber(value);
                            }
                            return parseValue + "";
                          }}
                          onPressEnter={(e) => {
                            const value = parseLocaleNumber(e.target.value);
                            handleChangeAllPriceLineItem(value);
                          }}
                        />
                      </div>
                    ),
                    width: 175,
                    dataIndex: "price",
                    render: (value, item, index) => {
                      const disabled = Boolean(item.type === POLineItemType.SUPPLEMENT && item.id);
                      return (
                        <NumberInput
                          className="hide-number-handle"
                          min={0}
                          format={(a: string) => formatCurrency(a ? a : 0)}
                          replace={(a: string) => replaceFormatString(a)}
                          value={item.price > 0 ? item.price : value}
                          onChange={(inputValue) => {
                            handleChangePriceLineItem(inputValue || 0, item);
                          }}
                          disabled={disabled}
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
                          min={0}
                          maxLength={3}
                          max={100}
                          onPressEnter={(e) => {
                            let value = e.target.value ? Number(e.target.value) : 0;
                            value = value > 100 ? 100 : value;
                            value = value < 0 ? 0 : value;
                            handleChangeAllTax(value);
                          }}
                        />
                      </div>
                    ),
                    width: 100,
                    dataIndex: "tax_rate",
                    render: (value, item) => {
                      const disabled = Boolean(item.type === POLineItemType.SUPPLEMENT && item.id);
                      return (
                        <NumberInput
                          className="product-item-vat"
                          value={item.tax_rate > 0 ? item.tax_rate : value}
                          prefix={<div>%</div>}
                          isFloat
                          onChange={(inputValue) => {
                            handleChangeTax(inputValue || 0, item);
                          }}
                          min={0}
                          maxLength={3}
                          max={100}
                          disabled={disabled}
                        />
                      );
                    },
                  },
                  {
                    title: "Giá bán",
                    width: 100,
                    align: "center",
                    dataIndex: "retail_price",
                    render: (price) => formatCurrency(price) || 0,
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
                    width: 110,
                    render: (value: number) => (
                      <div
                        style={{
                          width: "100%",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(Math.round(value || 0)) || 0}
                      </div>
                    ),
                  },
                  {
                    title: "",
                    fixed: items.length !== 0 && "right",
                    width: 40,
                    render: (value: string, item, index: number) => {
                      const disabled = Boolean(item.type === POLineItemType.SUPPLEMENT && item.id);
                      return (
                        <Button
                          htmlType="button"
                          onClick={() => handleDeleteLineItem(item)}
                          className="product-item-delete"
                          icon={<AiOutlineClose />}
                          disabled={disabled}
                        />
                      );
                    },
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
                rowKey={(record: PurchaseOrderLineItem) => record.sku}
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
                        <img src={value === null ? imgDefIcon : value} alt="" className="" />
                      </div>
                    ),
                  },
                  {
                    title: "Sản phẩm",
                    className: "ant-col-info",
                    width: 250,
                    fixed: "left",
                    dataIndex: "variant",
                    render: (value: string, item: PurchaseOrderLineItem, index: number) => {
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
                              <div className="product-item-name-detail">{value}</div>
                            </div>
                            <div className="product-item-name text-truncate-1">
                              <div className="product-item-name-detail">{item.note}</div>
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
                        <div style={{ color: "#2A2A86", fontWeight: "normal" }}>
                          ({formatCurrency(POUtils.totalQuantity(items), ".")})
                        </div>
                      </div>
                    ),
                    width: 100,
                    dataIndex: "quantity",
                    render: (value, item, index) => (
                      <div style={{ textAlign: "right" }}>{formatCurrency(value, ".")}</div>
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
                      if (isEdit && isEditPrice) {
                        return (
                          <NumberInput
                            className="hide-number-handle"
                            min={0}
                            format={(a: string) => formatCurrency(a ? a : 0)}
                            replace={(a: string) => replaceFormatString(a)}
                            value={item.price > 0 ? item.price : value}
                            onChange={(inputValue) => {
                              handleChangePriceLineItem(inputValue || 0, item);
                            }}
                          />
                        );
                      }

                      return (
                        <div
                          style={{
                            width: "100%",
                            textAlign: "right",
                          }}
                        >
                          {formatCurrency(
                            Math.round(
                              POUtils.caculatePrice(value, item.discount_rate, item.discount_value),
                            ),
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
                    title: "Giá bán",
                    width: 100,
                    align: "center",
                    dataIndex: "retail_price",
                    render: (price) => formatCurrency(price) || 0,
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
                    width: 110,
                    render: (value: number) => (
                      <div
                        style={{
                          width: "100%",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(Math.round(value)) || 0}
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
                prevValues[POField.line_items] !== curValues[POField.line_items]
              }
              noStyle
            >
              {({ getFieldValue }) => {
                const line_items = getFieldValue(POField.line_items);
                const untaxedAmountSupplement = getUntaxedAmountByLineItemType(
                  line_items,
                  POLoadType.SUPPLEMENT,
                );
                const untaxedAmountNotSupplement = getUntaxedAmountByLineItemType(
                  line_items,
                  POLoadType.NOT_SUPPLEMENT,
                );
                const totalNotSupplement = getTotalAmountByLineItemType(
                  line_items,
                  POLoadType.NOT_SUPPLEMENT,
                );

                return (
                  <div>
                    {poLineItemType === POLineItemType.SUPPLEMENT && (
                      <div className="po-payment-row">
                        <div>(1):</div>
                        <div className="po-payment-row-sub">
                          {totalNotSupplement === 0
                            ? "-"
                            : formatCurrency(Math.round(totalNotSupplement || 0))}
                        </div>
                      </div>
                    )}

                    {poLineItemType === POLineItemType.NORMAL ? (
                      <div className="po-payment-row">
                        <div>Tổng tiền:</div>
                        <div className="po-payment-row-result">
                          {untaxedAmountNotSupplement === 0
                            ? "-"
                            : formatCurrency(Math.round(untaxedAmountNotSupplement || 0))}
                        </div>
                      </div>
                    ) : (
                      <div className="po-payment-row">
                        <div>Tiền bổ sung:</div>
                        <div className="po-payment-row-result">
                          {untaxedAmountSupplement === 0
                            ? "-"
                            : formatCurrency(Math.round(untaxedAmountSupplement || 0))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            </Form.Item>
            <Form.Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues[POField.line_items] !== curValues[POField.line_items]
              }
              noStyle
            >
              {() => {
                const taxLines: Vat[] = POUtils.getVatList(
                  formMain,
                  poLineItemType === POLineItemType.SUPPLEMENT,
                );
                return taxLines
                  .filter((tax: Vat) => tax.rate !== 0)
                  .map((item: Vat, index: number) => (
                    <div className="po-payment-row" key={index}>
                      <div>
                        VAT<span className="po-payment-row-error">{`(${item.rate}%)`}:</span>
                      </div>
                      <div className="po-payment-row-result">
                        {formatCurrency(Math.round(item.amount))}
                      </div>
                    </div>
                  ));
              }}
            </Form.Item>
            <Divider style={{ marginTop: 5, marginBottom: 10 }} />
            <Form.Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues[POField.line_items] !== curValues[POField.line_items]
              }
              noStyle
            >
              {() => {
                const line_items = formMain.getFieldValue(POField.line_items);
                const totalNotSupplement = getTotalAmountByLineItemType(
                  line_items,
                  POLoadType.NOT_SUPPLEMENT,
                );
                const total = getTotalAmountByLineItemType(line_items, POLoadType.ALL);
                return (
                  <div className="po-payment-row">
                    <strong className="po-payment-row-title">
                      {summaryContentByLineItemType(formMain, poLineItemType)}
                    </strong>
                    {poLineItemType === POLineItemType.NORMAL ? (
                      <strong className="po-payment-row-success">
                        {formatCurrency(Math.round(totalNotSupplement || 0))}
                      </strong>
                    ) : (
                      <strong className="po-payment-row-success">
                        {formatCurrency(Math.round(total || 0))}
                      </strong>
                    )}
                  </div>
                );
              }}
            </Form.Item>
            <Form.Item noStyle name={POField.line_items} hidden>
              <Input />
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
          </Col>
        </Row>
      </div>
      <PickManyProductModal
        onSave={handlePickManyProduct}
        selected={[]}
        onCancel={() => setVisibleManyProduct(false)}
        visible={visibleManyProduct}
      />
    </React.Fragment>
  );
};
export default POProductForm;
