import React, { createRef, FC, useCallback, useEffect, useMemo, useState } from "react";
import "./index.scss";
import UrlConfig, {BASE_NAME_ROUTER} from "config/url.config";
import ContentContainer from "component/container/content.container";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Upload,
} from "antd";
import arrowLeft from "assets/icon/arrow-back.svg";
import imgDefIcon from "assets/img/img-def.svg";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { UploadOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/lib/table/interface";
import NumberInput from "component/custom/number-input.custom";
import { AiOutlineClose } from "react-icons/ai";
import TextArea from "antd/es/input/TextArea";
import PlusOutline from "assets/icon/plus-outline.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import { useDispatch, useSelector } from "react-redux";
import {
  creatInventoryTransferRequestAction,
  inventoryGetVariantByStoreAction,
  inventoryUploadFileAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import {
  InventoryTransferDetailItem,
  LineItem,
  StockTransferSubmit,
  Store,
} from "model/inventory/transfer";
import _ from "lodash";

import { PageResponse } from "model/base/base-metadata.response";
import { VariantImage, VariantResponse } from "model/product/product.model";
import PickManyProductModal from "../../purchase-order/modal/pick-many-product.modal";
import ProductItem from "../../purchase-order/component/product-item";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { UploadFile } from "antd/es/upload/interface";
import { findAvatar, handleDelayActionWhenInsertTextInSearchInput } from "utils/AppUtils";
import RowDetail from "screens/products/product/component/RowDetail";
import { useHistory } from "react-router";
import ModalConfirm from "component/modal/ModalConfirm";
import { ConvertFullAddress } from "utils/ConvertAddress";
import { Link } from "react-router-dom";
import { callApiNative } from "utils/ApiUtils";
import { getAccountDetail } from "service/accounts/account.service";
import { getStoreApi } from "service/inventory/transfer/index.service";
import { AccountStoreResponse } from "model/account/account.model";
import { RefSelectProps } from "antd/lib/select";
import { strForSearch } from "utils/StringUtils";
import { searchVariantsApi } from "service/product/product.service";
import { RootReducerType } from "model/reducers/RootReducerType";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import debounce from "lodash/debounce";
import { MAXIMUM_QUANTITY_LENGTH, MINIMUM_QUANTITY } from "../helper";

const { Option } = Select;

let barCode = "";

const VARIANTS_FIELD = "line_items";

const RequestTicket: FC = () => {
  const myStores: any = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );
  const [fromStores, setFromStores] = useState<Array<AccountStoreResponse>>();
  const [form] = Form.useForm();
  const [quantityInput, setQuantityInput] = useState<any>({});
  const [dataTable, setDataTable] = useState<Array<VariantResponse> | any>(
    [] as Array<VariantResponse>,
  );

  const productSearchRef = React.useRef<any>(null);
  const history = useHistory();
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);

  const [fromStoreData, setFormStoreData] = useState<Store>();
  const [toStoreData, setToStoreData] = useState<Store>();
  const productAutoCompleteRef = createRef<RefSelectProps>();

  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);

  function onQuantityChange(quantity: number | null, index: number) {
    const dataTableClone = _.cloneDeep(dataTable);
    dataTableClone[index].transfer_quantity = quantity;

    dataTableClone[index].amount =
      dataTableClone[index].transfer_quantity * dataTableClone[index].price;

    setDataTable(dataTableClone);

    form.setFieldsValue({ [VARIANTS_FIELD]: dataTableClone });
  }

  function getTotalQuantity(): number {
    let total = 0;
    dataTable.forEach((element: LineItem) => {
      total += element.transfer_quantity;
    });

    return total;
  }

  function onDeleteItem(variantId: number) {
    // delete row
    const temps = [...dataTable];
    temps.forEach((row, index, array) => {
      if (row.id === variantId) {
        array.splice(index, 1);
      }
    });
    setDataTable(temps);
    //delete row in form data
    let variantField = form.getFieldValue(VARIANTS_FIELD);
    variantField?.forEach((row: VariantResponse, index: number, array: VariantResponse[]) => {
      if (row.id === variantId) {
        array.splice(index, 1);
      }
    });
    //delete state manage input value
    delete quantityInput[variantId];
  }

  const dispatch = useDispatch();

  const getMe = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getAccountDetail);
    if (res && res.account_stores) {
      setFromStores(res.account_stores);
    }
  }, [dispatch]);

  const getStores = useCallback(async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getStoreApi, {
      status: "active",
      simple: true,
    });
    if (res) {
      setStores(res);
    }
  }, [dispatch]);

  // get store
  useEffect(() => {
    getStores();
    getMe();
  }, [dispatch, getMe, getStores]);

  // validate
  const validateStore = useCallback(
    (rule: any, value: any, callback: any): void => {
      if (value) {
        const from_store_id = form.getFieldValue("from_store_id");
        const to_store_id = form.getFieldValue("to_store_id");

        if (from_store_id && to_store_id && from_store_id.toString() === to_store_id.toString()) {
          callback(`Kho gửi và kho nhận không được trùng nhau`);
        } else {
          form.setFields([
            {
              name: "to_store_id",
              errors: [],
            },
            {
              name: "from_store_id",
              errors: [],
            },
          ]);
          callback();
        }

        return;
      }

      callback();
    },
    [form],
  );

  const [resultSearch, setResultSearch] = useState<PageResponse<VariantResponse> | any>();

  const onSearchProductDebounce = debounce((key: string) => {
    onSearchProduct(key);
  }, 300);

  const onSearchProduct = useCallback(
    (value: string) => {
      if (value.trim() !== "" && value.length >= 3) {
        dispatch(
          inventoryGetVariantByStoreAction(
            {
              status: "active",
              limit: 10,
              page: 1,
              info: value.trim(),
              store_ids: form.getFieldValue("from_store_id"),
            },
            setResultSearch,
          ),
        );
      }
    },
    [dispatch, form],
  );

  const [fileList, setFileList] = useState<Array<UploadFile>>([]);

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

  const selectProduct = useCallback(
    (value: string) => {
      let dataTemp = [...dataTable];
      const selectedItem = resultSearch?.items?.find(
          (variant: VariantResponse) => variant.id.toString() === value,
      );

      if (!dataTemp.some((variant: VariantResponse) => variant.sku === selectedItem?.sku)) {
        setDataTable((prev: any) => prev.concat([{ ...selectedItem, transfer_quantity: 1 }]));
        dataTemp = [...[{ ...selectedItem, transfer_quantity: 1 }], ...dataTemp];
      } else {
        const indexItem = dataTemp.findIndex((e) => e.id.toString() === value);

        dataTemp[indexItem].transfer_quantity += 1;
      }
      setDataTable([...dataTemp]);
      setResultSearch([]);

      form.setFieldsValue({ [VARIANTS_FIELD]: dataTemp });
    },
    [dataTable, form, resultSearch],
  );

  const onPickManyProduct = (result: Array<VariantResponse>) => {
    const newResult = result?.map((item) => {
      return {
        ...item,
        transfer_quantity: 1,
      };
    });

    const dataTemp = [...dataTable, ...newResult];

    const arrayUnique = [...new Map(dataTemp.map((item) => [item.id, item])).values()];

    setDataTable(arrayUnique);
    form.setFieldsValue({ [VARIANTS_FIELD]: arrayUnique });
    setVisibleManyProduct(false);
  };

  const onBeforeUpload = useCallback((file) => {
    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      showWarning("Cần chọn ảnh nhỏ hơn 10mb");
    }
    return isLt2M ? true : Upload.LIST_IGNORE;
  }, []);

  const onCustomRequest = (options: UploadRequestOption<any>) => {
    const { file } = options;
    let files: Array<File> = [];
    if (file instanceof File) {
      let uuid = file.uid;
      files.push(file);
      dispatch(
        inventoryUploadFileAction({ files: files }, (data: false | Array<string>) => {
          let index = fileList.findIndex((item) => item.uid === uuid);
          if (!!data) {
            if (index !== -1) {
              fileList[index].status = "done";
              fileList[index].url = data[0];
              let fileCurrent: Array<string> = form.getFieldValue("attached_files");
              if (!fileCurrent) {
                fileCurrent = [];
              }
              fileCurrent.push(data[0]);
              let newFileCurrent = [...fileCurrent];
              form.setFieldsValue({ attached_files: newFileCurrent });
            }
          } else {
            fileList.splice(index, 1);
            showError("Upload ảnh không thành công");
          }
          setFileList([...fileList]);
        }),
      );
    }
  };

  const onChangeFile = useCallback((info) => {
    setFileList(info.fileList);
  }, []);
  const onRemoveFile = (data: UploadFile<any>) => {
    let index = fileList.findIndex((item) => item.uid === data.uid);
    if (index !== -1) {
      fileList.splice(index, 1);
      let fileCurrent: Array<string> = form.getFieldValue("attached_files");
      if (!fileCurrent) {
        fileCurrent = [];
      } else {
        fileCurrent.splice(index, 1);
      }
      let newFileCurrent = [...fileCurrent];
      form.setFieldsValue({ attached_files: newFileCurrent });
    }
    setFileList([...fileList]);
  };

  const createCallback = useCallback(
    (result: InventoryTransferDetailItem) => {
      setIsLoading(false);
      dispatch(hideLoading());
      if (result) {
        showSuccess("Thêm mới dữ liệu thành công");
        history.push(`${UrlConfig.INVENTORY_TRANSFERS}/${result.id}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history],
  );

  const onResultGetDetailVariantIds = useCallback(
    (result) => {
      if (result) {
        setIsLoadingTable(false);

        let newDataTable = [...dataTable];

        if (newDataTable.length === 0) return;

        for (let i = 0; i < newDataTable.length; i++) {
          newDataTable[i].available = result.items[i].available;
          newDataTable[i].on_hand = result.items[i].on_hand;
        }

        setDataTable(newDataTable);
      } else {
        setIsLoadingTable(false);
        setDataTable([]);
        setQuantityInput({});
        form.setFieldsValue({ [VARIANTS_FIELD]: [] });
      }
    },
    [dataTable, form],
  );

  const onChangeFromStore = async (storeId: number) => {
    const variants_id = dataTable?.map((item: VariantResponse) => item.id);

    if (variants_id?.length > 0) {
      setIsLoadingTable(true);
      const response = await callApiNative({ isShowError: true }, dispatch, searchVariantsApi, {
        status: "active",
        store_ids: storeId,
        variant_ids: variants_id.join(","),
        page: 1,
        limit: 1000,
      });
      if (response) {
        onResultGetDetailVariantIds(response);
      }
    }
  };

  useEffect(() => {
    if (stores.length === 0) return;

    if (fromStores?.length === 1) {
      stores.forEach((element) => {
        if (element.id === fromStores[0].store_id) {
          form.setFieldsValue({
            from_store_id: element.id,
          });
          setFormStoreData(element);
          onChangeFromStore(element.id);
        }
      });
    }

    if (fromStores?.length === 0) {
      const newStore = stores.map((i) => {
        return {
          store_id: i.id,
          store: i.name,
        };
      });
      setFromStores(newStore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores, fromStores]);

  const onFinish = (data: StockTransferSubmit) => {
    stores.forEach((store) => {
      if (store?.id === Number(data?.from_store_id)) {
        data.from_store_id = store?.id;
        data.from_store_phone = store?.hotline;
        data.from_store_address = store?.address;
        data.from_store_code = store?.code;
        data.from_store_name = store?.name;
      }
      if (store?.id === Number(data?.to_store_id)) {
        data.to_store_id = store?.id;
        data.to_store_phone = store?.hotline;
        data.to_store_address = store?.address;
        data.to_store_code = store?.code;
        data.to_store_name = store?.name;
      }
    });

    const dataLineItems = form.getFieldValue(VARIANTS_FIELD);
    if (!dataLineItems || dataLineItems.length === 0) {
      showError("Vui lòng chọn sản phẩm");
      return;
    }
    data.line_items = dataLineItems.map((item: VariantResponse) => {
      const variantPrice =
        item &&
        item.variant_prices &&
        item.variant_prices[0] &&
        item.variant_prices[0].retail_price;
      return {
        sku: item.sku,
        on_hand: item.on_hand,
        total_stock: item.total_stock,
        barcode: item.barcode,
        variant_name: item.name,
        variant_id: item.id,
        variant_image: findAvatar(item.variant_images),
        product_name: item.product.name,
        product_id: item.product.id,
        available: item.available,
        transfer_quantity: item.transfer_quantity,
        amount: variantPrice * item.transfer_quantity,
        price: variantPrice,
        weight: item.weight,
        weight_unit: item.weight_unit,
      };
    });

    delete data.from_store_id;
    delete data.to_store_id;

    setIsLoading(true);
    dispatch(showLoading());
    dispatch(creatInventoryTransferRequestAction(data, createCallback));
  };

  useEffect(() => {
    dataTable?.forEach((element: VariantResponse, index: number) => {
      const thisInput = document.getElementById(`item-quantity-${index}`);
      if (!element.transfer_quantity) {
        if (thisInput) thisInput.style.borderColor = "red";
      } else if (element.transfer_quantity === 0) {
        if (thisInput) thisInput.style.borderColor = "red";
      } else if (element.transfer_quantity > (element.available ? element.available : 0)) {
        if (thisInput) thisInput.style.borderColor = "red";
      } else {
        if (thisInput) thisInput.style.borderColor = "#d9d9d9";
      }
    });
  }, [dataTable]);

  const handleSearchProduct = useCallback(
    async (keyCode: string, code: string) => {
      barCode = "";

      if (keyCode === "Enter" && code) {
        let res = await callApiNative({ isShowLoading: false }, dispatch, searchVariantsApi, {
          barcode: code,
        });
        if (res && res.items && Array.isArray(res.items) && res.items.length > 0) {
          selectProduct(res.items[0].id.toString());
        }
      } else {
        const txtSearchProductElement = document.getElementById("product_search_variant") as HTMLInputElement;

        onSearchProduct(txtSearchProductElement?.value);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, selectProduct, onSearchProduct, form],
  );

  const eventKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLBodyElement) {
        if (event.key !== "Enter") {
          barCode = barCode + event.key;
        } else if (event && event.key === "Enter") {
          handleSearchProduct(event.key, barCode);
        }
        return;
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, handleSearchProduct],
  );

  const eventKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        if (event.target.id === "product_search_variant") {
          if (event.key !== "Enter") {
            barCode = barCode + event.key;
          }

          handleDelayActionWhenInsertTextInSearchInput(
            productAutoCompleteRef,
            () => handleSearchProduct(event.key, barCode),
            400,
          );
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleSearchProduct],
  );

  useEffect(() => {
    window.addEventListener("keydown", eventKeydown);
    window.addEventListener("keypress", eventKeyPress);
    return () => {
      window.removeEventListener("keydown", eventKeydown);
      window.removeEventListener("keypress", eventKeyPress);
    };
  }, [eventKeyPress, eventKeydown]);

  const columns: ColumnsType<any> = [
    {
      title: "STT",
      align: "center",
      width: "50px",
      render: (value: string, record: PurchaseOrderLineItem, index: number) => index + 1,
    },
    {
      title: "Ảnh",
      width: "60px",
      dataIndex: "variant_images",
      render: (value: Array<VariantImage>) => {
        const avatar = findAvatar(value);
        return (
          <div className="product-item-image">
            <img src={!avatar ? imgDefIcon : avatar} alt="" className="" />
          </div>
        );
      },
    },
    {
      title: "Sản phẩm",
      width: "200px",
      className: "ant-col-info",

      dataIndex: "name",
      render: (value: string, record: PurchaseOrderLineItem) => (
        <div>
          <div>
            <div className="product-item-sku">
              <Link
                target="_blank"
                to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.id}`}
              >
                {record.sku}
              </Link>
            </div>
            <div className="product-item-name">
              <span className="product-item-name-detail">{value}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Tồn trong kho",
      dataIndex: "on_hand",
      align: "center",
      width: 100,
      render: (value) => {
        return form.getFieldValue("from_store_id") ? value || 0 : "";
      },
    },
    {
      title: "Có thể bán",
      dataIndex: "available",
      align: "center",
      width: 100,
      render: (value) => {
        return form.getFieldValue("from_store_id") ? value || 0 : "";
      },
    },
    {
      title: (
        <div>
          <div>Số lượng</div>
          <div className="text-center">{getTotalQuantity()}</div>
        </div>
      ),
      width: 100,
      align: "center",
      dataIndex: "transfer_quantity",
      render: (value, row, index) => (
        <NumberInput
          isFloat={false}
          id={`item-quantity-${index}`}
          min={MINIMUM_QUANTITY}
          maxLength={MAXIMUM_QUANTITY_LENGTH}
          value={value}
          className="border-input"
          onChange={(quantity) => {
            onQuantityChange(quantity, index);
          }}
        />
      ),
    },
    {
      title: "",
      fixed: dataTable.length !== 0 && "right",
      width: 50,
      render: (_: string, row) => (
        <Button
          onClick={() => onDeleteItem(row.id)}
          className="product-item-delete"
          icon={<AiOutlineClose />}
        />
      ),
    },
  ];

  return (
    <ContentContainer
      title="Yêu cầu phiếu chuyển hàng"
      breadcrumb={[
        {
          name: "Kho hàng",
          path: UrlConfig.HOME,
        },
        {
          name: "Chuyển hàng",
          path: `${UrlConfig.INVENTORY_TRANSFERS}`,
        },
        {
          name: "Yêu cầu",
        },
      ]}
    >
      <Form form={form} onFinish={onFinish} scrollToFirstError={true}>
        <Row gutter={24}>
          <Form.Item noStyle hidden name="store_transfer">
            <Input />
          </Form.Item>
          <Form.Item noStyle hidden name="store_receive">
            <Input />
          </Form.Item>
          <Col span={18}>
            <Card title="KHO HÀNG" bordered={false} className={"inventory-selectors"}>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="from_store_id"
                    label={<b>Kho gửi</b>}
                    validateFirst
                    rules={[
                      {
                        validator: validateStore,
                      },
                    ]}
                    labelCol={{ span: 24, offset: 0 }}
                  >
                    <Select
                      placeholder="Chọn kho gửi"
                      showArrow
                      optionFilterProp="children"
                      showSearch
                      onChange={(value: string) => {
                        stores.forEach((element) => {
                          if (element.id === parseInt(value)) {
                            setFormStoreData(element);
                            onChangeFromStore(element.id);
                          }
                        });
                      }}
                      filterOption={(input: String, option: any) => {
                        if (option.props.value) {
                          return strForSearch(option.props.children).includes(strForSearch(input));
                        }

                        return false;
                      }}
                    >
                      {stores.map((item, index) => (
                        <Option key={"store_id" + index} value={item.id.toString()}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {fromStoreData && (
                    <>
                      <RowDetail title="Mã CH" value={fromStoreData.code} />
                      <RowDetail title="SĐT" value={fromStoreData.hotline} />
                      <RowDetail title="Địa chỉ" value={ConvertFullAddress(fromStoreData)} />
                    </>
                  )}
                </Col>{" "}
                <Col span={12}>
                  <Form.Item
                    name="to_store_id"
                    label={<b>Kho nhận</b>}
                    validateFirst
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn kho nhận",
                      },
                      {
                        validator: validateStore,
                      },
                    ]}
                    labelCol={{ span: 24, offset: 0 }}
                  >
                    <Select
                      placeholder="Chọn kho nhận"
                      showArrow
                      optionFilterProp="children"
                      showSearch
                      onChange={(value: string) => {
                        myStores.forEach((element: any) => {
                          if (element.store_id === parseInt(value)) {
                            const storeFiltered = stores.filter(
                              (item) => item.id === element.store_id,
                            );
                            setToStoreData(storeFiltered[0]);
                          }
                        });
                      }}
                      filterOption={(input: String, option: any) => {
                        if (option.props.value) {
                          return strForSearch(option.props.children).includes(strForSearch(input));
                        }

                        return false;
                      }}
                    >
                      {Array.isArray(myStores) &&
                      myStores.length > 0 ?
                        myStores.map((item, index) => (
                          <Option key={"to_store_id" + index} value={item.store_id ? item.store_id.toString() : ''}>
                            {item.store}
                          </Option>
                        )) : Array.isArray(stores) &&
                        stores.length > 0 &&
                        stores.map((item, index) => (
                          <Option key={"to_store_id" + index} value={item.id.toString()}>
                            {item.name}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                  {toStoreData && (
                    <>
                      <RowDetail title="Mã CH" value={toStoreData.code} />
                      <RowDetail title="SĐT" value={toStoreData.hotline} />
                      <RowDetail title="Địa chỉ" value={ConvertFullAddress(toStoreData)} />
                    </>
                  )}
                </Col>
              </Row>
            </Card>

            <Card title="THÔNG TIN SẢN PHẨM" bordered={false}>
              <div>
                <Input.Group className="display-flex">
                  <CustomAutoComplete
                    id="#product_search_variant"
                    dropdownClassName="product"
                    placeholder="Tìm kiếm Mã vạch, Mã sản phẩm, Tên sản phẩm"
                    onSearch={(key: string) => onSearchProductDebounce(key)}
                    dropdownMatchSelectWidth={456}
                    style={{ width: "100%" }}
                    showAdd={true}
                    textAdd="Thêm mới sản phẩm"
                    onSelect={selectProduct}
                    options={renderResult}
                    ref={productSearchRef}
                    onClickAddNew={() => {
                      window.open(`${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`, "_blank");
                    }}
                  />
                  <Button
                    onClick={() => {
                      setVisibleManyProduct(true);
                    }}
                    style={{ width: 132, marginLeft: 10 }}
                    icon={<img src={PlusOutline} alt="" />}
                  >
                    &nbsp;&nbsp; Chọn nhiều
                  </Button>
                </Input.Group>
                <Table
                  scroll={{ x: "max-content" }}
                  className="inventory-table"
                  rowClassName="product-table-row"
                  tableLayout="fixed"
                  pagination={false}
                  columns={columns}
                  loading={isLoadingTable}
                  dataSource={dataTable}
                />
                <div className={"sum-qty"}>
                  <span>Tổng số lượng:</span> <b>{getTotalQuantity()}</b>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card title={"GHI CHÚ"} bordered={false} className={"inventory-note"}>
              <Form.Item
                name={"note"}
                label={<b>Ghi chú nội bộ:</b>}
                colon={false}
                labelCol={{ span: 24, offset: 0 }}
              >
                <TextArea
                  maxLength={250}
                  placeholder="Nhập ghi chú nội bộ"
                  autoSize={{ minRows: 4, maxRows: 6 }}
                />
              </Form.Item>

              <Form.Item
                labelCol={{ span: 24, offset: 0 }}
                label={<b>File đính kèm:</b>}
                colon={false}
              >
                <Upload
                  beforeUpload={onBeforeUpload}
                  multiple={true}
                  fileList={fileList}
                  onChange={onChangeFile}
                  customRequest={onCustomRequest}
                  onRemove={onRemoveFile}
                >
                  <Button icon={<UploadOutlined />}>Chọn file</Button>
                </Upload>
              </Form.Item>
              <Form.Item noStyle hidden name="attached_files">
                <Input />
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
              <Button onKeyDown={(e)=> e.key === "Enter" ? e.preventDefault(): ''} loading={isLoading} disabled={isLoading} htmlType={"submit"} type="primary">
                Tạo yêu cầu
              </Button>
            </Space>
          }
        />
        {visibleManyProduct && (
          <PickManyProductModal
            storeID={form.getFieldValue("from_store_id")}
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
            onOk={() => history.push(`${UrlConfig.INVENTORY_TRANSFERS}`)}
            okText="Đồng ý"
            cancelText="Tiếp tục"
            title={`Bạn có muốn rời khỏi trang?`}
            subTitle="Thông tin trên trang này sẽ không được lưu."
            visible={isVisibleModalWarning}
          />
        )}
      </Form>
    </ContentContainer>
  );
};

export default RequestTicket;
