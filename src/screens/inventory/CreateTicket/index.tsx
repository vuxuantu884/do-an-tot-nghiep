import React, { createRef, FC, useCallback, useEffect, useMemo, useState } from "react";
import "./index.scss";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import {
  AutoComplete,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Upload,
} from "antd";
import arrowLeft from "assets/icon/arrow-back.svg";
import imgDefIcon from "assets/img/img-def.svg";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { UploadOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/lib/table/interface";
import NumberInput from "component/custom/number-input.custom";
import { AiOutlineClose } from "react-icons/ai";
import PlusOutline from "assets/icon/plus-outline.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import { useDispatch } from "react-redux";
import {
  checkDuplicateInventoryTransferAction,
  creatInventoryTransferAction,
  inventoryGetDetailVariantIdsAction,
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
import { hideLoading, showLoading } from "domain/actions/loading.action";

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
import { getStoreApi, getTopReceivedStoreApi } from "service/inventory/transfer/index.service";
import { AccountStoreResponse } from "model/account/account.model";
import { RefSelectProps } from "antd/lib/select";
import { strForSearch } from "utils/StringUtils";
import { searchVariantsApi } from "service/product/product.service";
import { HttpStatus } from "config/http-status.config";
import ModalShowError from "../common/ModalShowError";
import { KeyEvent, MAXIMUM_QUANTITY_LENGTH, MINIMUM_QUANTITY, VARIANT_STATUS } from "../helper";
import EditPopover from "../../inventory-defects/ListInventoryDefect/components/EditPopover";
import { primaryColor } from "utils/global-styles/variables";

const { Option } = Select;

let barCode = "";
let isBarCode = false;

const VARIANTS_FIELD = "line_items";

const CreateTicket: FC = () => {
  const [fromStores, setFromStores] = useState<Array<AccountStoreResponse>>();
  const [newNote, setNewNote] = useState<string>();
  const [form] = Form.useForm();
  const [quantityInput, setQuantityInput] = useState<any>({});
  const [dataTable, setDataTable] = useState<Array<VariantResponse> | any>(
    [] as Array<VariantResponse>,
  );

  const productSearchRef = React.useRef<any>(null);
  const history = useHistory();
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [storesReceived, setStoresReceived] = useState<Array<Store>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);

  const [fromStoreData, setFormStoreData] = useState<Store>();
  const [toStoreData, setToStoreData] = useState<Store | null>(null);
  const [keySearch, setKeySearch] = useState<string>("");
  const productAutoCompleteRef = createRef<RefSelectProps>();

  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);
  const [isOpenModalErrors, setIsOpenModalErrors] = useState<boolean>(false);
  const [continueData, setContinueData] = useState(null);
  const [errorData, setErrorData] = useState([]);

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

  function onDeleteItem(variantId: number, index: number) {
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

    const collection: any = document.getElementsByClassName("product-item-delete");
    collection[index]?.blur();
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
      }
    },
    [form],
  );

  const [resultSearch, setResultSearch] = useState<PageResponse<VariantResponse> | any>();

  const onSearchProduct = useCallback(
    (value: string) => {
      const storeId = form.getFieldValue("from_store_id");
      if (!storeId) {
        showError("Vui lòng chọn kho gửi");
        return;
      } else if (value.trim() !== "" && value.length >= 3) {
        dispatch(
          inventoryGetVariantByStoreAction(
            {
              status: "active",
              limit: 10,
              page: 1,
              store_ids: storeId,
              info: value.trim(),
            },
            setResultSearch,
          ),
        );
      }
    },
    [dispatch, setResultSearch, form],
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

  const onSearch = useCallback(
    (value: string) => {
      setKeySearch(value);
    },
    [setKeySearch],
  );

  const onSelectProduct = useCallback(
    (value: string, item: VariantResponse) => {
      let dataTemp = [...dataTable];
      let selectedItem = item;

      if (!dataTemp.some((variant: VariantResponse) => variant.sku === selectedItem?.sku)) {
        setDataTable((prev: any) => prev.concat([{ ...selectedItem, transfer_quantity: 1 }]));
        dataTemp = [...[{ ...selectedItem, transfer_quantity: 1 }], ...dataTemp];
      } else {
        const indexItem = dataTemp.findIndex((e) => e.sku === item.sku);

        dataTemp[indexItem].transfer_quantity += 1;
      }
      setDataTable([...dataTemp]);
      setResultSearch([]);
      isBarCode = false;

      form.setFieldsValue({ [VARIANTS_FIELD]: dataTemp });
    },
    [dataTable, form],
  );

  const onPickManyProduct = (result: Array<VariantResponse>) => {
    setVisibleManyProduct(false);
    const cloneResult = [...result];
    const newDataTable = [...dataTable];

    if (dataTable.length === 0) {
      const newResult = cloneResult?.map((item) => {
        return {
          ...item,
          transfer_quantity: 1,
        };
      });
      setDataTable([...newResult]);
      form.setFieldsValue({ [VARIANTS_FIELD]: [...newResult] });
      return;
    }

    newDataTable.forEach((i: any, idx) => {
      const findIndex = cloneResult.findIndex((e) => e.id === i.id);

      if (findIndex >= 0) {
        newDataTable[idx].transfer_quantity = newDataTable[idx].transfer_quantity + 1;
        cloneResult.splice(findIndex, 1);
      }
    });

    const newResult = cloneResult?.map((item) => {
      return {
        ...item,
        transfer_quantity: 1,
      };
    });

    const dataTemp = [...newDataTable, ...newResult];

    setDataTable(dataTemp);
    form.setFieldsValue({ [VARIANTS_FIELD]: dataTemp });
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

  const checkCallback = useCallback(
    (result: any) => {
      setIsLoading(false);
      if (result.responseData.code === HttpStatus.SUCCESS) {
        dispatch(creatInventoryTransferAction(result.data, createCallback));
      } else if (result.responseData.code === HttpStatus.BAD_REQUEST) {
        dispatch(hideLoading());
        setIsOpenModalErrors(true);
        setErrorData(result.responseData.data);
        setContinueData(result.data);
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

        const storeId = form.getFieldValue("from_store_id");

        for (let i = 0; i < newDataTable.length; i++) {
          for (let j = 0; j < result.length; j++) {
            if (
              storeId === result[j].store_id &&
              newDataTable[i].variant_id === result[j].variant_id
            ) {
              newDataTable[i].available = result[j].available;
              newDataTable[i].on_hand = result[j].on_hand;
              break;
            }

            if (j === result.length - 1 && i === newDataTable.length - 1) {
              newDataTable = [];
            }
          }
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

  const onChangeFromStore = (storeId: number) => {
    const variants_id = dataTable?.map((item: VariantResponse) => item.id);

    if (variants_id?.length > 0) {
      setIsLoadingTable(true);
      dispatch(
        inventoryGetDetailVariantIdsAction(variants_id, storeId, onResultGetDetailVariantIds),
      );
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

    setIsLoading(true);
    dispatch(showLoading());
    dispatch(checkDuplicateInventoryTransferAction(data, checkCallback));
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
      if (keyCode !== "2") {
        barCode = "";
      }

      if (keyCode === KeyEvent.ENTER && code) {
        setKeySearch("");

        const storeId = form.getFieldValue("from_store_id");
        if (!storeId) {
          showError("Vui lòng chọn kho gửi");
          return;
        }
        isBarCode = true;
        let res = await callApiNative({ isShowLoading: false }, dispatch, searchVariantsApi, {
          barcode: code,
          store_ids: storeId ?? null,
          status: VARIANT_STATUS.ACTIVE,
        });
        if (res && res.items && res.items.length > 0) {
          onSelectProduct(res.items[0].id.toString(), res.items[0]);
        }
      } else {
        const txtSearchProductElement: any = document.getElementById("product_search_variant");

        onSearchProduct(txtSearchProductElement?.value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [dispatch, onSelectProduct, onSearchProduct, form],
  );

  const eventKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLBodyElement) {
        if (event.key !== KeyEvent.ENTER) {
          barCode = barCode + event.key;
          barCode = barCode.replaceAll(KeyEvent.CONTROL, "").trim();
        } else if (event && event.key === KeyEvent.ENTER) {
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
          if (event.key !== KeyEvent.ENTER) {
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

  const onSelect = useCallback(
    (o, obj) => {
      setTimeout(() => {
        if (isBarCode) return;
        onSelectProduct(o, obj.label.props.data);
      }, 0);
    },
    [onSelectProduct],
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
      align: "right",
      width: 100,
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: "Có thể bán",
      dataIndex: "available",
      align: "right",
      width: 100,
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: (
        <div>
          <div>Số lượng</div>
          <div style={{ textAlign: "right" }}>{getTotalQuantity()}</div>
        </div>
      ),
      width: 100,
      align: "right",
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
      render: (_: string, row, i) => (
        <div className="text-center">
          <AiOutlineClose style={{ cursor: "pointer" }} onClick={() => onDeleteItem(row.id, i)} />
        </div>
      ),
    },
  ];

  const continuesCreateData = (continueData: any) => {
    dispatch(showLoading());
    dispatch(creatInventoryTransferAction(continueData, createCallback));
  };

  const getTopReceivedStore = async (store: Store) => {
    const response = await callApiNative({ isShowError: true }, dispatch, getTopReceivedStoreApi, {
      from_store_id: store.id,
      limit: 5,
    });

    if (response.store_ids.length === 0) {
      setStoresReceived([]);
      return;
    }

    const receivedStores = response.store_ids.map((toStoreId: number) => {
      const storeFiltered = stores.filter((store) => store.id === toStoreId);
      return storeFiltered[0];
    });

    const receivedStoresSorted = receivedStores.sort((a: Store, b: Store) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
    );

    setStoresReceived(receivedStoresSorted);
  };

  const handleSelectSuggestStore = (store: Store) => {
    setToStoreData(store);
    form.setFieldsValue({
      to_store_id: store?.id.toString(),
    });
  };

  return (
    <ContentContainer
      title="Thêm mới phiếu chuyển hàng"
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
          name: "Thêm mới",
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
                        required: true,
                        message: "Vui lòng chọn kho gửi",
                      },
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
                      onChange={(value: number) => {
                        stores.forEach((element) => {
                          if (element.id === value) {
                            getTopReceivedStore(element).then();
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
                      {fromStores &&
                        fromStores.map((item, index) => (
                          <Option key={"from_store_id" + index} value={item.store_id || 0}>
                            {item.store}
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
                      allowClear
                      onChange={(value: string) => {
                        if (!value) {
                          setToStoreData(null);
                        }
                        stores.forEach((element) => {
                          if (element.id === parseInt(value)) {
                            setToStoreData(element);
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
                      {Array.isArray(stores) &&
                        stores.length > 0 &&
                        stores.map((item, index) => (
                          <Option key={"to_store_id" + index} value={item.id.toString()}>
                            {item.name}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                  {storesReceived.length > 0 && !toStoreData && (
                    <div className="font-weight-500">Chọn nhanh kho nhận:</div>
                  )}
                  {storesReceived.length > 0 &&
                    !toStoreData &&
                    storesReceived.map((store) => {
                      return (
                        <Tag
                          color="processing"
                          className="mr-15 mb-10"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleSelectSuggestStore(store)}
                        >
                          {store?.name}
                        </Tag>
                      );
                    })}
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
                <Row gutter={12}>
                  <Col flex="auto">
                    <AutoComplete
                      notFoundContent={
                        keySearch.length >= 3 ? "Không tìm thấy sản phẩm" : undefined
                      }
                      value={keySearch}
                      ref={productAutoCompleteRef}
                      onSelect={onSelect}
                      style={{ width: "100%" }}
                      dropdownClassName="product dropdown-search-header"
                      dropdownMatchSelectWidth={635}
                      className="w-100 searchProductId"
                      onSearch={onSearch}
                      options={renderResult}
                      defaultActiveFirstOption
                      id="product_search_variant"
                    >
                      <Input
                        size="middle"
                        className="yody-search"
                        placeholder="Tìm kiếm Mã vạch, Mã sản phẩm, Tên sản phẩm"
                        prefix={<i className="icon-search icon" />}
                        ref={productSearchRef}
                      />
                    </AutoComplete>
                  </Col>
                  <Col flex="120px">
                    <Button
                      onClick={() => {
                        if (form.getFieldValue("from_store_id")) {
                          setVisibleManyProduct(true);
                          return;
                        }
                        showError("Vui lòng chọn kho gửi");
                      }}
                      icon={<img src={PlusOutline} alt="" />}
                      style={{ width: "100%" }}
                    >
                      &nbsp;&nbsp; Chọn nhiều
                    </Button>
                  </Col>
                </Row>
                {/*table*/}
                <Table
                  scroll={{ x: "max-content" }}
                  className="inventory-table"
                  rowClassName="product-table-row"
                  tableLayout="fixed"
                  pagination={false}
                  columns={columns}
                  loading={isLoadingTable}
                  dataSource={dataTable}
                  summary={() => {
                    return (
                      <Table.Summary>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0} align="right" colSpan={5}>
                            <b>Tổng số lượng:</b>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <b>{getTotalQuantity()}</b>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    );
                  }}
                />
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card title={"GHI CHÚ"} bordered={false} className={"inventory-note"}>
              <Form.Item name={"note"} hidden></Form.Item>
              <div style={{ display: "flex" }}>
                <EditPopover
                  maxLength={255}
                  content={form.getFieldValue("note")}
                  isHideContent
                  title={`Sửa ghi chú nội bộ`}
                  color={primaryColor}
                  onOk={(newNote) => {
                    form.setFieldsValue({
                      note: newNote,
                    });

                    setNewNote(newNote);
                  }}
                />
                <div style={{ color: "#262626", fontWeight: 400, fontSize: 14, marginLeft: 5 }}>
                  Ghi chú nội bộ
                </div>
              </div>
              <div>
                {newNote !== "" ? newNote : <span className="no-note">Không có ghi chú!</span>}
              </div>

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
              <Button loading={isLoading} disabled={isLoading} htmlType={"submit"} type="primary">
                Tạo phiếu
              </Button>
            </Space>
          }
        />
        {visibleManyProduct && (
          <PickManyProductModal
            storeID={form.getFieldValue("from_store_id")}
            selected={[]}
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
        {isOpenModalErrors && (
          <ModalShowError
            onCancel={() => {
              setIsLoading(false);
              setIsOpenModalErrors(false);
            }}
            loading={isLoading}
            errorData={errorData}
            onOk={() => continueData && continuesCreateData(continueData)}
            title={
              "Có một số phiếu chuyển tương tự được tạo trong 1 tháng trở lại đây. Tiếp tục thực hiện?"
            }
            visible={isOpenModalErrors}
          />
        )}
      </Form>
    </ContentContainer>
  );
};

export default CreateTicket;
