import React, { createRef, FC, useCallback, useEffect, useMemo, useState } from "react";
import "./index.scss";
import UrlConfig, { BASE_NAME_ROUTER, InventoryTabUrl } from "config/url.config";
import ContentContainer from "component/container/content.container";
import { Button, Card, Col, Empty, Form, Input, Row, Select, Space } from "antd";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import arrowLeft from "assets/icon/arrow-back.svg";
import imgDefIcon from "assets/img/img-def.svg";
import { SearchOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import PlusOutline from "assets/icon/plus-outline.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import { useDispatch, useSelector } from "react-redux";
import {
  inventoryGetSenderStoreAction,
  inventoryGetVariantByStoreAction
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { Store } from "model/inventory/transfer";
import { InventoryAdjustmentDetailItem, LineItemAdjustment } from "model/inventoryadjustment";

import { PageResponse } from "model/base/base-metadata.response";
import { VariantImage, VariantResponse } from "model/product/product.model";
import PickManyProductModal from "../../purchase-order/modal/pick-many-product.modal";
import ProductItem from "../../purchase-order/component/product-item";
import { showError, showSuccess } from "utils/ToastUtils";
import { findAvatar, formatCurrency, replaceFormatString } from "utils/AppUtils";
import { useHistory } from "react-router";
import ModalConfirm from "component/modal/ModalConfirm";
import { ConvertFullAddress } from "utils/ConvertAddress";
import CustomSelect from "component/custom/select.custom";
import NumberInput from "component/custom/number-input.custom";
import _, { parseInt } from "lodash";
import { createInventoryAdjustmentAction } from "domain/actions/inventory/inventory-adjustment.action";
import { Link } from "react-router-dom";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import CustomDatePicker from "component/custom/date-picker.custom";
import { INVENTORY_AUDIT_TYPE_CONSTANTS } from "../constants";
import { AiOutlineClose } from "react-icons/ai";
import InventoryAdjustmentTimeLine from "../DetailInvetoryAdjustment/conponents/InventoryAdjustmentTimeLine";
import { DATE_FORMAT } from "utils/DateUtils";
import moment from "moment";
import TextEllipsis from "component/table/TextEllipsis";
import debounce from "lodash/debounce";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { RootReducerType } from "model/reducers/RootReducerType";
import { fullTextSearch } from "utils/StringUtils";
import { AccountStoreResponse } from "model/account/account.model";

const { Option } = Select;

const VARIANTS_FIELD = "line_items";

type SearchQueryVariant = {
  status: string;
  limit: number;
  page: number;
  store_ids: number | 0;
};

export interface Summary {
  TotalStock: number | 0;
  TotalShipping: number | 0;
  TotalOnWay: number | 0;
  TotalExcess: number | 0;
  TotalMiss: number | 0;
  TotalOnHand: number | 0;
  TotalRealOnHand: number | 0;
}

const CreateInventoryAdjustment: FC = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [dataTable, setDataTable] = useState<Array<LineItemAdjustment> | any>(
    [] as Array<LineItemAdjustment>,
  );
  const [searchVariant, setSearchVariant] = useState<Array<LineItemAdjustment>>(
    [] as Array<LineItemAdjustment>,
  );
  const [, setData] = useState<PageResponse<VariantResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [keySearch, setKeySearch] = useState<string>("");
  const [keySearchProduct, setKeySearchProduct] = useState<string>("");
  const history = useHistory();
  const productSearchRef = createRef<CustomAutoComplete>();
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);
  const [auditType, setAuditType] = useState<string>(INVENTORY_AUDIT_TYPE_CONSTANTS.PARTLY);
  const [adjustStoreIdBak, setAdjustStoreIdBak] = useState<number | null>(null);

  const [formStoreData, setFormStoreData] = useState<Store | null>();
  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);
  const [isShowModalChangeStore, setIsShowModalChangeStore] = useState<boolean>(false);

  const [objSummaryTable, setObjSummaryTable] = useState<Summary>({
    TotalStock: 0,
    TotalShipping: 0,
    TotalOnWay: 0,
    TotalExcess: 0,
    TotalMiss: 0,
    TotalOnHand: 0,
    TotalRealOnHand: 0,
  });

  const myStores: AccountStoreResponse[] | undefined = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  const lstAudiTypes = [
    {
      key: "partly",
      name: "Một phần",
    },
    {
      key: "total",
      name: "Toàn bộ",
    },
  ];

  const [query, setQuery] = useState<SearchQueryVariant>({
    status: "active",
    page: 1,
    limit: 10,
    store_ids: 0,
  });

  const onFinish = (data: InventoryAdjustmentDetailItem) => {
    const storeCurr = stores.find((e) => e.id.toString() === data.adjusted_store_id.toString());
    data.audited_bys = data.audited_bys ?? [];

    data.adjusted_store_name = storeCurr ? storeCurr.name : null;
    if (auditType === INVENTORY_AUDIT_TYPE_CONSTANTS.PARTLY) {
      data.line_items = dataTable.map((item: LineItemAdjustment) => {
        const variantPrice =
          item &&
          item.variant_prices &&
          item.variant_prices[0] &&
          item.variant_prices[0].retail_price;
        return {
          sku: item.sku,
          barcode: item.barcode,
          variant_name: item.name,
          variant_id: item.id,
          variant_image: findAvatar(item.variant_images),
          product_name: item.product.name,
          product_id: item.product_id,
          price: variantPrice,
          weight: item.weight,
          weight_unit: item.weight_unit,
          on_hand: item.on_hand ?? 0,
          real_on_hand: item.real_on_hand,
          on_hand_adj: item.on_hand_adj,
          shipping: item.shipping ?? 0,
          total_stock: item.total_stock ?? 0,
          on_way: item.on_way ?? 0,
        };
      });
    }

    setIsLoading(true);
    dispatch(createInventoryAdjustmentAction(data, createCallback));
  };

  const onResultGetVariant = useCallback((res: PageResponse<VariantResponse>) => {
    if (res) {
      setData(res);
    }
  }, []);

  const onChangeAuditType = useCallback((auditType: string) => {
    setAuditType(auditType);
  }, []);

  // get store
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  useEffect(() => {
    form.setFieldsValue({
      audited_date: new Date(),
      audited_bys: userReducer && userReducer.account ? [userReducer.account.code] : [],
    });
    dispatch(inventoryGetSenderStoreAction({ status: "active", simple: true }, setStores));
  }, [dispatch, auditType, query, form, userReducer]);

  const [resultSearch, setResultSearch] = useState<PageResponse<VariantResponse> | any>();

  const onSearchProductDebounce = debounce((key: string) => {
    setKeySearchProduct(key);
    onSearchProduct(key);
  }, 300);

  const onSearchProduct = (value: string) => {
    const storeId = form.getFieldValue("adjusted_store_id");
    if (!storeId) {
      showError("Vui lòng chọn kho kiểm");
      return;
    } else if (value.trim() !== "" && value.length >= 3) {
      dispatch(
        inventoryGetVariantByStoreAction(
          {
            status: "active",
            limit: 10,
            page: 1,
            store_ids: storeId ?? 0,
            info: value.trim(),
          },
          setResultSearch,
        ),
      );
    } else if (value.trim() === "") {
      dispatch(
        inventoryGetVariantByStoreAction(
          {
            status: "active",
            limit: 10,
            page: 1,
            store_ids: storeId ?? 0,
          },
          setResultSearch,
        ),
      );
    }
  };

  const renderResult = useMemo(() => {
    let options: any[] = [];
    resultSearch?.items?.forEach((item: VariantResponse) => {
      options.push({
        label: <ProductItem isTransfer data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [resultSearch]);

  const drawColumns = useCallback((data: Array<LineItemAdjustment>) => {
    let totalStock = 0,
      totalShipping = 0,
      totalOnWay = 0,
      totalExcess = 0,
      totalMiss = 0,
      totalQuantity = 0,
      totalReal = 0;
    data?.forEach((element: LineItemAdjustment) => {
      totalStock += element.total_stock;
      totalShipping += element.shipping;
      totalOnWay += element.on_way;
      totalQuantity += element.on_hand;
      totalReal += parseInt(element.real_on_hand?.toString()) ?? 0;
      let on_hand_adj = element.on_hand_adj ?? 0;
      if (on_hand_adj > 0) {
        totalExcess += on_hand_adj;
      }
      if (on_hand_adj < 0) {
        totalMiss += -on_hand_adj;
      }
    });

    setObjSummaryTable({
      TotalStock: totalStock,
      TotalShipping: totalShipping,
      TotalOnWay: totalOnWay,
      TotalOnHand: totalQuantity,
      TotalExcess: totalExcess,
      TotalMiss: totalMiss,
      TotalRealOnHand: totalReal,
    });
  }, []);

  const onSelectProduct = useCallback(
    (value: string) => {
      const dataTemp = [...dataTable];
      const selectedItem = resultSearch?.items?.find(
        (variant: VariantResponse) => variant.id.toString() === value,
      );

      const variantPrice =
        selectedItem &&
        selectedItem.variant_prices &&
        selectedItem.variant_prices[0] &&
        selectedItem.variant_prices[0].retail_price;

      const item = {
        ...selectedItem,
        variant_name: selectedItem.name ?? selectedItem.variant_name,
        real_on_hand: 0,
        on_way: selectedItem.on_way ?? 0,
        shipping: selectedItem.shipping ?? 0,
        total_stock: selectedItem.total_stock ?? 0,
        on_hand: selectedItem.on_hand ?? 0,
        price: variantPrice ?? 0,
      };

      if (!dataTemp.some((variant: VariantResponse) => variant.id === selectedItem.id)) {
        drawColumns(dataTable.concat([{ ...item }]));

        setDataTable((prev: Array<LineItemAdjustment>) => prev.concat([{ ...item }]));
        setSearchVariant((prev: Array<LineItemAdjustment>) => prev.concat([{ ...item }]));
      }
    },
    [dataTable, resultSearch, drawColumns],
  );

  const onPickManyProduct = (result: Array<VariantResponse>) => {
    const newResult: any = result?.map((item) => {
      const variantPrice =
        item &&
        item.variant_prices &&
        item.variant_prices[0] &&
        item.variant_prices[0].retail_price;

      return {
        ...item,
        variant_id: item.id,
        variant_name: item.variant_name ?? item.name,
        real_on_hand: 0,
        on_hand_adj: 0 - (item.on_hand ?? 0),
        on_hand_adj_dis: (0 - (item.on_hand ?? 0)).toString(),
        on_hand: item.on_hand ?? 0,
        price: variantPrice ?? 0,
        shipping: item.shipping ?? 0,
        total_stock: item.total_stock ?? 0,
        on_way: item.on_way ?? 0,
      };
    });

    form.setFieldsValue({ [VARIANTS_FIELD]: newResult });
    setIsLoadingTable(true);
    setDataTable(newResult);
    setSearchVariant(newResult);
    setIsLoadingTable(false);
    setVisibleManyProduct(false);
    drawColumns(newResult);
  };

  const createCallback = useCallback(
    (result: InventoryAdjustmentDetailItem) => {
      if (result) {
        setIsLoading(false);
        if (result) {
          showSuccess("Tạo phiếu kiểm thành công");
          history.push(`${UrlConfig.INVENTORY_ADJUSTMENTS}/${result.id}`);
        }
      } else {
        setIsLoading(false);
      }
    },
    [history],
  );

  const ColumnProductName = useMemo(() => {
    const data =
      searchVariant && (searchVariant.length > 0 || keySearch !== "") ? searchVariant : dataTable;

    let Compoment = () => <span>Sản phẩm</span>;
    if (data?.length > 0) {
      Compoment = () => <div>{`Sản phẩm ${data ? `(${formatCurrency(data.length)})` : ""}`}</div>;
    }
    return <Compoment />;
  }, [dataTable, searchVariant, keySearch]);

  const defaultColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "Ảnh",
      width: "60px",
      dataIndex: "variant_images",
      render: (value: Array<VariantImage>) => {
        let avatar = undefined;
        if (value) {
          avatar = findAvatar(value);
        }
        return (
          <div className="product-item-image">
            <img src={!avatar ? imgDefIcon : avatar} alt="" className="" />
          </div>
        );
      },
    },
    {
      title: ColumnProductName,
      width: "200px",
      className: "ant-col-info",
      dataIndex: "variant_name",
      render: (value: string, record: VariantResponse) => {
        const storeId = form.getFieldValue("adjusted_store_id");
        return (
          <div>
            <div>
              <div className="product-item-sku">
                <Link
                  target="_blank"
                  to={`${UrlConfig.PRODUCT}/${InventoryTabUrl.HISTORIES}?condition=${record.sku}&store_ids${storeId?.adjusted_store_id}&page=1`}
                >
                  {record.sku}
                </Link>
              </div>
              <div className="product-item-name">
                <span>
                  <TextEllipsis line={1} value={value ?? record.name} />
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Tổng tồn</div>
            <div>
              ({objSummaryTable.TotalStock ? formatCurrency(objSummaryTable.TotalStock) : 0})
            </div>
          </>
        );
      },
      width: 80,
      align: "center",
      dataIndex: "total_stock",
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Đang giao</div>
            <div>
              ({objSummaryTable.TotalShipping ? formatCurrency(objSummaryTable.TotalShipping) : 0})
            </div>
          </>
        );
      },
      width: 80,
      align: "center",
      dataIndex: "shipping",
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Đang chuyển đi</div>
            <div>
              ({objSummaryTable.TotalOnWay ? formatCurrency(objSummaryTable.TotalOnWay) : 0})
            </div>
          </>
        );
      },
      width: 80,
      align: "center",
      dataIndex: "on_way",
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Tồn trong kho</div>
            <div>({formatCurrency(objSummaryTable.TotalOnHand)})</div>
          </>
        );
      },
      dataIndex: "on_hand",
      align: "center",
      width: 120,
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Số kiểm</div>
            <div>({formatCurrency(objSummaryTable.TotalRealOnHand)})</div>
          </>
        );
      },
      dataIndex: "real_on_hand",
      align: "center",
      width: 120,
      render: (value, row: LineItemAdjustment, index: number) => {
        return (
          <>
            {auditType === INVENTORY_AUDIT_TYPE_CONSTANTS.PARTLY && (
              <NumberInput
                isFloat={false}
                id={`item-real-${index}`}
                min={0}
                maxLength={12}
                value={value}
                format={(a: string) => formatCurrency(a)}
                replace={(a: string) => replaceFormatString(a)}
                onChange={(quantity) => {
                  onRealQuantityChange(quantity, row);
                }}
              />
            )}
          </>
        );
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Thừa/Thiếu</div>
            <Row align="middle" justify="center">
              {objSummaryTable.TotalExcess === 0 || !objSummaryTable.TotalExcess ? (
                ""
              ) : (
                <div style={{ color: "#27AE60" }}>
                  +{formatCurrency(objSummaryTable.TotalExcess)}
                </div>
              )}
              {objSummaryTable.TotalExcess && objSummaryTable.TotalMiss ? (
                <Space>/</Space>
              ) : objSummaryTable.TotalMiss === 0 && objSummaryTable.TotalExcess === 0 ? (
                0
              ) : (
                ""
              )}
              {objSummaryTable.TotalMiss === 0 ? (
                ""
              ) : (
                <div style={{ color: "red" }}>-{formatCurrency(objSummaryTable.TotalMiss)}</div>
              )}
            </Row>
          </>
        );
      },
      align: "center",
      width: 200,
      render: (value, item) => {
        if (!item.on_hand_adj && item.on_hand_adj === 0) {
          return null;
        }
        if (item.on_hand_adj && item.on_hand_adj < 0) {
          return <div style={{ color: "red" }}>{formatCurrency(item.on_hand_adj_dis)}</div>;
        } else {
          return <div style={{ color: "green" }}>{formatCurrency(item.on_hand_adj_dis)}</div>;
        }
      },
    },
    {
      title: "",
      width: 30,
      render: (value: string, row) => {
        return (
          <>
            {auditType === INVENTORY_AUDIT_TYPE_CONSTANTS.PARTLY && (
              <Button
                onClick={() => onDeleteItem(row.id)}
                className="product-item-delete"
                icon={<AiOutlineClose color="red" />}
              />
            )}
          </>
        );
      },
    },
  ];

  const onEnterFilterVariant = useCallback(
    (lst: Array<LineItemAdjustment> | null) => {
      let temps = lst ? [...lst] : [...dataTable];
      let key = keySearch.toLocaleLowerCase();
      let dataSearch = [
        ...temps.filter((e: LineItemAdjustment) => {
          return (
            e.on_hand === parseInt(key) ||
            e.variant_name?.toLocaleLowerCase().includes(key) ||
            e.sku?.toLocaleLowerCase().includes(key) ||
            e.code?.toLocaleLowerCase().includes(key) ||
            e.barcode?.toLocaleLowerCase().includes(key)
          );
        }),
      ];

      setSearchVariant(dataSearch);
      drawColumns(dataSearch);
    },
    [keySearch, dataTable, drawColumns],
  );

  const onDeleteItem = useCallback(
    (variantId: number) => {
      // delete row
      const temps = [...dataTable];
      temps.forEach((row, index, array) => {
        if (row.id === variantId) {
          array.splice(index, 1);
        }
      });

      setDataTable(temps);
      onEnterFilterVariant(temps);
      drawColumns(temps);
      //delete row in form data
      let variantField = form.getFieldValue(VARIANTS_FIELD);
      variantField?.forEach((row: VariantResponse, index: number, array: VariantResponse[]) => {
        if (row.id === variantId) {
          array.splice(index, 1);
        }
      });
    },
    [dataTable, onEnterFilterVariant, drawColumns, form],
  );

  const onRealQuantityChange = useCallback(
    (quantity: number | null, row: LineItemAdjustment) => {
      const dataTableClone: Array<LineItemAdjustment> = _.cloneDeep(dataTable);

      dataTableClone.forEach((item) => {
        quantity = quantity ?? 0;

        if (item.id === row.id) {
          item.real_on_hand = quantity;
          item.variant_id = item.id;
          item.variant_name = item.name;
          let totalDiff: number;
          totalDiff = quantity - item.on_hand;
          if (totalDiff === 0) {
            item.on_hand_adj = null;
            item.on_hand_adj_dis = null;
          } else if (item.on_hand < quantity) {
            item.on_hand_adj = totalDiff;
            item.on_hand_adj_dis = `+${totalDiff}`;
          } else if (item.on_hand > quantity) {
            item.on_hand_adj = totalDiff;
            item.on_hand_adj_dis = `${totalDiff}`;
          }
        }
      });

      //for tìm sp sửa tồn thực tế
      form.setFieldsValue({ [VARIANTS_FIELD]: dataTableClone });
      setDataTable(dataTableClone);
      setSearchVariant(dataTableClone);

      let dataEdit =
        (searchVariant && searchVariant.length > 0) || keySearch !== ""
          ? [...dataTableClone]
          : null;

      onEnterFilterVariant(dataEdit);
    },
    [dataTable, keySearch, form, searchVariant, onEnterFilterVariant],
  );

  const onSearchVariant = (key: string) => {
    let temps = [...dataTable];
    const keyLowerCase = key ? key.toLocaleLowerCase() : key;

    let dataSearch = [
      ...temps.filter((e: LineItemAdjustment) => {
        return (
          e.on_hand === parseInt(keyLowerCase) ||
          fullTextSearch(keyLowerCase, e.variant_name?.toLocaleLowerCase()) ||
          fullTextSearch(keyLowerCase, e.sku?.toLocaleLowerCase()) ||
          fullTextSearch(keyLowerCase, e.name?.toLocaleLowerCase()) ||
          fullTextSearch(keyLowerCase, e.code?.toLocaleLowerCase()) ||
          fullTextSearch(keyLowerCase, e.barcode?.toLocaleLowerCase())
        );
      }),
    ];

    drawColumns(dataSearch);
    setSearchVariant(dataSearch);
  };

  const onChangeKeySearch = (key: string) => {
    onSearchVariant(key);
  };

  const clickSearch = () => {
    onSearchVariant(keySearch);
  };

  const onChangeStore = useCallback(() => {
    const storeId = form.getFieldValue("adjusted_store_id");

    setAdjustStoreIdBak(storeId);
    setIsShowModalChangeStore(false);
    setQuery({ ...query, store_ids: storeId });

    if (auditType === INVENTORY_AUDIT_TYPE_CONSTANTS.PARTLY) {
      setDataTable([]);
      drawColumns([]);
      setSearchVariant([]);
      onSearchProduct(keySearchProduct);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, query, auditType, drawColumns, keySearchProduct, dispatch, onResultGetVariant]);

  return (
    <ContentContainer
      title="Thêm mới phiếu kiểm kho"
      breadcrumb={[
        {
          name: "Kho hàng",
          // path: UrlConfig.HOME,
        },
        {
          name: "Kiểm kho",
          path: `${UrlConfig.INVENTORY_ADJUSTMENTS}`,
        },
        {
          name: "Thêm mới",
        },
      ]}
      extra={<InventoryAdjustmentTimeLine status={"daft"} inventoryAdjustmentDetail={null} />}
    >
      <Form form={form} onFinish={onFinish} scrollToFirstError={true}>
        <Row gutter={24}>
          <Col span={18}>
            <Card
              title="KHO HÀNG"
              extra={
                <Form.Item noStyle>
                  <Space size={20}>
                    <span>
                      <b>
                        Loại kiểm <span style={{ color: "red" }}>*</span>
                      </b>
                    </span>
                    <Form.Item
                      style={{ margin: "0px" }}
                      name="audit_type"
                      initialValue={INVENTORY_AUDIT_TYPE_CONSTANTS.PARTLY}
                      label=""
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn loại kiểm",
                        },
                      ]}
                      labelCol={{ span: 24, offset: 0 }}
                    >
                      <CustomSelect
                        style={{ width: 150 }}
                        placeholder="Chọn loại kiểm"
                        showArrow
                        optionFilterProp="children"
                        showSearch={false}
                        value={auditType}
                        onChange={(value: string) => {
                          onChangeAuditType(value);
                        }}
                      >
                        {Array.isArray(lstAudiTypes) &&
                          lstAudiTypes.length > 0 &&
                          lstAudiTypes.map((item) => (
                            <Option key={item.key} value={item.key}>
                              {item.name}
                            </Option>
                          ))}
                      </CustomSelect>
                    </Form.Item>
                  </Space>
                </Form.Item>
              }
            >
              <Row gutter={24}>
                <Col span={3} className="pt8">
                  <b>
                    Kho kiểm <span style={{ color: "red" }}>*</span>
                  </b>
                </Col>
                <Col span={21}>
                  <Form.Item
                    name="adjusted_store_id"
                    label=""
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn kho kiểm",
                      },
                    ]}
                    labelCol={{ span: 24, offset: 0 }}
                  >
                    <CustomSelect
                      autoClearSearchValue={false}
                      notFoundContent="Không tìm thấy kết quả tìm kiếm"
                      placeholder="Chọn kho kiểm"
                      showArrow
                      optionFilterProp="children"
                      showSearch
                      allowClear={true}
                      onChange={(value: number) => {
                        if (adjustStoreIdBak && value !== adjustStoreIdBak) {
                          setIsShowModalChangeStore(true);
                        } else {
                          setAdjustStoreIdBak(value);
                        }

                        const store = stores.find((e) => e.id.toString() === value?.toString());
                        store ? setFormStoreData(store) : setFormStoreData(null);
                      }}
                    >
                      {Array.isArray(myStores) && myStores.length > 0
                        ? myStores.map((item, index) => (
                            <Option
                              key={"adjusted_store_id" + index}
                              value={item.store_id ? item.store_id.toString() : ""}
                            >
                              {item.store}
                            </Option>
                          ))
                        : Array.isArray(stores) &&
                          stores.length > 0 &&
                          stores.map((item, index) => (
                            <Option key={"adjusted_store_id" + index} value={item.id.toString()}>
                              {item.name}
                            </Option>
                          ))}
                    </CustomSelect>
                  </Form.Item>
                </Col>
              </Row>
              {formStoreData && (
                <Row gutter={24}>
                  <Col span={3} />
                  <Col span={21}>
                    <div style={{ wordBreak: "break-word" }}>
                      <strong>{formStoreData.name}: </strong>
                      <span>
                        {formStoreData.code} - {formStoreData.hotline} -{" "}
                        {ConvertFullAddress(formStoreData)}
                      </span>
                    </div>
                  </Col>
                </Row>
              )}
            </Card>

            <Card title="THÔNG TIN SẢN PHẨM" bordered={false} className={"product-detail"}>
              <>
                {auditType === INVENTORY_AUDIT_TYPE_CONSTANTS.PARTLY ? (
                  <>
                    <Input.Group>
                      <Row gutter={12}>
                        <Col flex="auto">
                          <CustomAutoComplete
                            id="#product_search_variant"
                            dropdownClassName="product"
                            placeholder="Thêm sản phẩm vào phiếu kiểm"
                            onSearch={(key: string) => onSearchProductDebounce(key)}
                            dropdownMatchSelectWidth={456}
                            style={{ width: "100%" }}
                            showAdd={true}
                            textAdd="+ Thêm mới sản phẩm"
                            onSelect={onSelectProduct}
                            options={renderResult}
                            ref={productSearchRef}
                            onClickAddNew={() => {
                              window.open(
                                `${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`,
                                "_blank",
                              );
                            }}
                          />
                        </Col>
                        <Col flex="120px">
                          <Button
                            onClick={() => {
                              if (!form.getFieldValue("adjusted_store_id")) {
                                showError("Vui lòng chọn kho kiểm");
                                return;
                              }
                              setVisibleManyProduct(true);
                            }}
                            style={{ width: "100%" }}
                            icon={<img src={PlusOutline} alt="" />}
                          >
                            &nbsp;&nbsp; Chọn nhiều
                          </Button>
                        </Col>
                        <Col flex="auto">
                          <Input
                            name="key_search"
                            value={keySearch}
                            onChange={(e) => {
                              setKeySearch(e.target.value);
                              onChangeKeySearch(e.target.value);
                            }}
                            placeholder="Tìm kiếm sản phẩm trong phiếu"
                            addonAfter={
                              <SearchOutlined onClick={clickSearch} style={{ color: "#2A2A86" }} />
                            }
                          />
                        </Col>
                      </Row>
                    </Input.Group>
                    <CustomTable
                      className="product-table"
                      rowClassName="product-table-row"
                      tableLayout="fixed"
                      columns={defaultColumns}
                      pagination={false}
                      loading={isLoadingTable}
                      sticky
                      scroll={{
                        x: 1500,
                      }}
                      dataSource={
                        searchVariant && (searchVariant.length > 0 || keySearch !== "")
                          ? searchVariant
                          : dataTable
                      }
                    />
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      Thông tin sản phẩm sẽ được hiển thị khi tạo xong phiếu
                    </div>
                  </>
                )}
              </>
              {!auditType ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Trống" />
              ) : null}
            </Card>
          </Col>
          <Col span={6}>
            {/* Thông tin phiếu */}
            <Card title={"Thông tin phiếu"} bordered={false}>
              <Form.Item
                labelCol={{ span: 24, offset: 0 }}
                name="audited_date"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ngày kiểm",
                  },
                  {
                    validator: async (_, value) => {
                      const today = new Date(new Date().setHours(0, 0, 0, 0));
                      const adjustDate = new Date(new Date(value).setHours(0, 0, 0, 0));
                      if (adjustDate && adjustDate < today) {
                        return Promise.reject(
                          new Error("Ngày kiểm không được nhỏ hơn ngày hiện tại"),
                        );
                      }
                    },
                  },
                ]}
                label={<b>Ngày kiểm</b>}
                colon={false}
              >
                <CustomDatePicker
                  disableDate={(date) => date < moment().startOf("days")}
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày kiểm"
                  format={DATE_FORMAT.DDMMYYY}
                />
              </Form.Item>

              <Form.Item
                name="audited_bys"
                label={<b>Người kiểm</b>}
                labelCol={{ span: 24, offset: 0 }}
                colon={false}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn người kiểm",
                  },
                ]}
              >
                <AccountSearchPaging
                  mode="multiple"
                  placeholder="Chọn người kiểm"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Card>
            <Card title={"GHI CHÚ"} bordered={false} className={"note"}>
              <Form.Item
                name={"note"}
                label={<b>Ghi chú nội bộ</b>}
                colon={false}
                labelCol={{ span: 24, offset: 0 }}
                rules={[{ max: 500, message: "Không được nhập quá 500 ký tự" }]}
              >
                <TextArea placeholder="Nhập ghi chú nội bộ" autoSize={{ minRows: 4, maxRows: 6 }} />
              </Form.Item>
            </Card>
          </Col>
        </Row>
        <BottomBarContainer
          leftComponent={
            <div onClick={() => setIsVisibleModalWarning(true)} style={{ cursor: "pointer" }}>
              <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
              {"Quay lại danh sách"}
            </div>
          }
          rightComponent={
            <Space>
              <Button loading={isLoading} disabled={isLoading} htmlType={"submit"} type="primary">
                Tạo phiếu
              </Button>
            </Space>
          }
        />
        {visibleManyProduct && (
          <PickManyProductModal
            storeID={form.getFieldValue("adjusted_store_id")}
            selected={dataTable}
            isTransfer
            onSave={onPickManyProduct}
            onCancel={() => setVisibleManyProduct(false)}
            visible={visibleManyProduct}
          />
        )}
        {isVisibleModalWarning && (
          <ModalConfirm
            onCancel={() => {
              setIsVisibleModalWarning(false);
            }}
            onOk={() => history.push(`${UrlConfig.INVENTORY_ADJUSTMENTS}`)}
            okText="Đồng ý"
            cancelText="Tiếp tục"
            title={`Bạn có muốn rời khỏi trang?`}
            subTitle="Thông tin trên trang này sẽ không được lưu."
            visible={isVisibleModalWarning}
          />
        )}
        {isShowModalChangeStore && (
          <ModalConfirm
            onCancel={() => {
              setIsShowModalChangeStore(false);
              form.setFieldsValue({ adjusted_store_id: adjustStoreIdBak });
              const store = stores.find((e) => e.id.toString() === adjustStoreIdBak?.toString());
              store ? setFormStoreData(store) : setFormStoreData(null);

              setQuery({ ...query, store_ids: adjustStoreIdBak ?? 0 });
            }}
            onOk={onChangeStore}
            okText="Đồng ý"
            cancelText="Hủy"
            title={`Bạn có chắc chắn đổi kho kiểm?`}
            subTitle="Thông tin sản phẩm trong phiếu sẽ không được lưu."
            visible={isShowModalChangeStore}
          />
        )}
      </Form>
    </ContentContainer>
  );
};

export default CreateInventoryAdjustment;
