import React, { createRef, FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyledWrapper } from "./styles";
import UrlConfig from "config/url.config";
import { AutoComplete, Button, Card, Checkbox, Col, Form, Input, Row, Space, Table, Tag } from "antd";
import arrowLeft from "assets/icon/arrow-back.svg";
import purify from "dompurify";
import imgDefIcon from "assets/img/img-def.svg";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import PlusOutline from "assets/icon/plus-outline.svg";
import WarningRedIcon from "assets/icon/ydWarningRedIcon.svg";
import {
  CloseCircleOutlined,
  CopyOutlined,
  EditOutlined,
  ExportOutlined,
  ImportOutlined,
  PaperClipOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/lib/table/interface";
import BottomBarContainer from "component/container/bottom-bar.container";
import RowDetail from "screens/products/product/component/RowDetail";
import { useHistory, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptInventoryAction,
  cancelShipmentInventoryTransferAction,
  checkDuplicateInventoryTransferAction,
  deleteInventoryTransferAction,
  exportInventoryAction,
  getDetailInventoryTransferAction,
  getFeesAction,
  inventoryGetSenderStoreAction,
  inventoryGetVariantByStoreAction,
  receivedInventoryTransferAction,
  updateInventoryTransferAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { InventoryTransferDetailItem, LineItem, Store } from "model/inventory/transfer";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { ConvertFullAddress } from "utils/ConvertAddress";
import DeleteTicketModal from "../common/DeleteTicketPopup";
import InventoryShipment from "../common/ChosesShipment";
import {
  findAvatar,
  formatCurrency,
  handleDelayActionWhenInsertTextInSearchInput,
  SumWeightInventory,
} from "utils/AppUtils";
import { Link } from "react-router-dom";
import ContentContainer from "component/container/content.container";
import InventoryStep from "./components/InventoryTransferStep";
import { STATUS_INVENTORY_TRANSFER, STATUS_INVENTORY_TRANSFER_ARRAY } from "../constants";
import NumberInput from "component/custom/number-input.custom";
import { VariantResponse } from "model/product/product.model";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import ProductItem from "screens/purchase-order/component/product-item";
import { PageResponse } from "model/base/base-metadata.response";
import PickManyProductModal from "screens/purchase-order/modal/pick-many-product.modal";
import _ from "lodash";
import { AiOutlineClose } from "react-icons/ai";
import InventoryTransferBalanceModal from "./components/InventoryTransferBalance";
import ModalConfirm from "component/modal/ModalConfirm";
import { actionFetchPrintFormByInventoryTransferIds } from "domain/actions/printer/printer.action";
import { useReactToPrint } from "react-to-print";
import { PrinterInventoryTransferResponseModel } from "model/response/printer.response";
import AuthWrapper from "component/authorization/AuthWrapper";
import {
  InventoryTransferPermission,
  ShipmentInventoryTransferPermission,
} from "config/permissions/inventory-transfer.permission";
import { RefSelectProps } from "antd/lib/select";
import { callApiNative } from "utils/ApiUtils";
import TextArea from "antd/es/input/TextArea";
import { checkUserPermission } from "utils/AuthUtil";
import { RootReducerType } from "model/reducers/RootReducerType";
import { searchVariantsApi } from "service/product/product.service";
import ImportExcel from "./components/ImportExcel";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import useAuthorization from "hook/useAuthorization";
import { TransferExportField, TransferExportLineItemField } from "model/inventory/field";
import * as XLSX from "xlsx";
import moment from "moment";
import { InventoryType } from "domain/types/inventory.type";
import { HttpStatus } from "config/http-status.config";
import ModalShowError from "../common/ModalShowError";
import TagStatus from "component/tag/tag-status";
import { hideLoading, showLoading } from "domain/actions/loading.action";

export interface InventoryParams {
  id: string;
}

let barCode = "";

let version = 0;

const DetailTicket: FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const myStores: any = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );
  const [data, setData] = useState<InventoryTransferDetailItem | null>(null);
  // const [dataShipment, setDataShipment] = useState<ShipmentItem | undefined>();
  const [isDeleteTicket, setIsDeleteTicket] = useState<boolean>(false);
  const [isVisibleInventoryShipment, setIsVisibleInventoryShipment] = useState<boolean>(false);
  const [isBalanceTransfer, setIsBalanceTransfer] = useState<boolean>(false);
  const [isDisableEditNote, setIsDisableEditNote] = useState<boolean>(false);
  const [isReceiveAllProducts, setIsReceiveAllProducts] = useState<boolean>(false);

  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [isError, setError] = useState(false);
  const [isLoadingBtn, setLoadingBtn] = useState<boolean>(false);
  const [isLoadingBtnSave, setIsLoadingBtnSave] = useState<boolean>(false);
  const [isVisibleModalReceiveWarning, setIsVisibleModalReceiveWarning] = useState<boolean>(false);
  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);

  const [keySearch, setKeySearch] = useState<string>("");
  const productAutoCompleteRef = createRef<RefSelectProps>();

  const [infoFees, setInfoFees] = useState<Array<any>>([]);
  const productSearchRef = React.useRef<any>(null);

  const [isOpenModalErrors, setIsOpenModalErrors] = useState<boolean>(false);
  const [errorData, setErrorData] = useState([]);

  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);
  const [dataTable, setDataTable] = useState<Array<VariantResponse> | any>(
    [] as Array<VariantResponse>,
  );
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);

  const [form] = Form.useForm();
  const printElementRef = useRef(null);

  const currentPermissions: string[] = useSelector(
    (state: RootReducerType) => state.permissionReducer.permissions,
  );

  const currentStores = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );
  const [isImport, setIsImport] = useState<boolean>(false);

  const [printContent, setPrintContent] = useState<string>("");
  const pageBreak = "<div class='pageBreak'></div>";
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const printContentCallback = useCallback(
    (printContent: Array<PrinterInventoryTransferResponseModel>) => {
      if (!printContent || printContent.length === 0) return;
      const textResponse = printContent.map((single) => {
        return "<div class='singleOrderPrint'>" + single.html_content + "</div>";
      });
      let textResponseFormatted = textResponse.join(pageBreak);
      //xóa thẻ p thừa
      let result = textResponseFormatted.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint],
  );

  const onResult = useCallback(
    (result: InventoryTransferDetailItem | false) => {
      dispatch(hideLoading());
      setLoadingBtn(false);
      setIsLoadingBtnSave(false);
      setIsDisableEditNote(false);
      if (!result) {
        setError(true);
        return;
      } else {
        let dataLineItems = sessionStorage.getItem(`dataItems${result.id}`);
        let dataId = sessionStorage.getItem(`id${result.id}`);

        let newDataTable =
          dataLineItems && dataId === `${result.id}`
            ? JSON.parse(dataLineItems)
            : result.line_items;

        if (newDataTable.length > 0) {
          newDataTable = newDataTable.map((item: any) => {
            return {
              ...item,
              status: result.status,
              to_store_id: result.to_store_id,
            };
          });
        }
        setDataTable(newDataTable);

        setData(result);
        version = result.version;
        form.setFieldsValue({ note: result.note });
        // setDataShipment(result.shipment);
        setIsVisibleInventoryShipment(false);
        setIsReceiveAllProducts(result.received_method === 'received_all');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch],
  );

  function onRealQuantityChange(quantity: number | null, index: number) {
    const dataTableClone = _.cloneDeep(dataTable);
    dataTableClone[index].real_quantity = quantity;

    setDataTable(dataTableClone);
  }

  const [resultSearch, setResultSearch] = useState<PageResponse<VariantResponse> | any>();

  const onSearch = useCallback(
    (value: string) => {
      setKeySearch(value);
    },
    [setKeySearch],
  );

  const onSearchProduct = useCallback(
    (value: string) => {
      const storeId = data?.from_store_id;
      if (value.trim() !== "" && value.length >= 3) {
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
    [dispatch, setResultSearch, data],
  );

  //phân quyền
  const [allowCancel] = useAuthorization({
    acceptPermissions: [InventoryTransferPermission.cancel],
  });
  const [allowClone] = useAuthorization({
    acceptPermissions: [InventoryTransferPermission.clone],
  });

  const actions: Array<MenuAction> = [
    {
      id: 1,
      name: "Hủy phiếu",
      icon: <CloseCircleOutlined />,
      color: "#E24343",
      disabled:
        !(
          (data?.status === STATUS_INVENTORY_TRANSFER.CONFIRM.status ||
            data?.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status) &&
          data?.shipment === null
        ) || !allowCancel,
    },
    {
      id: 2,
      name: "Tạo bản sao",
      icon: <CopyOutlined />,
      disabled: !allowClone,
    },
    {
      id: 3,
      name: "Xuất file",
      icon: <ExportOutlined />,
    },
  ];

  let textTag: string;
  let classTag: string;
  switch (data?.status) {
    case STATUS_INVENTORY_TRANSFER.REQUESTED.status:
      textTag = STATUS_INVENTORY_TRANSFER.REQUESTED.name;
      classTag = STATUS_INVENTORY_TRANSFER.CONFIRM.status;
      break;
    case STATUS_INVENTORY_TRANSFER.TRANSFERRING.status:
      textTag = STATUS_INVENTORY_TRANSFER.TRANSFERRING.name;
      classTag = STATUS_INVENTORY_TRANSFER.TRANSFERRING.status;
      break;
    case STATUS_INVENTORY_TRANSFER.PENDING.status:
      textTag = STATUS_INVENTORY_TRANSFER.PENDING.name;
      classTag = STATUS_INVENTORY_TRANSFER.PENDING.status;
      break;
    case STATUS_INVENTORY_TRANSFER.RECEIVED.status:
      textTag = STATUS_INVENTORY_TRANSFER.RECEIVED.name;
      classTag = STATUS_INVENTORY_TRANSFER.RECEIVED.status;
      break;
    case STATUS_INVENTORY_TRANSFER.CANCELED.status:
      textTag = STATUS_INVENTORY_TRANSFER.CANCELED.name;
      classTag = STATUS_INVENTORY_TRANSFER.CANCELED.status;
      break;
    default:
      textTag = STATUS_INVENTORY_TRANSFER.CONFIRM.name;
      classTag = STATUS_INVENTORY_TRANSFER.CONFIRM.status;
      break;
  }

  const renderResult = useMemo(() => {
    let options: any[] = [];
    resultSearch?.items?.forEach((item: VariantResponse) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [resultSearch]);

  const convertArrItem = (arr: Array<VariantResponse>) => {
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
      const element = arr[i];

      if (element.id !== null) {
        newArr.push(arr[i]);
        continue;
      }
      const variantPrice =
        element &&
        element.variant_prices &&
        element.variant_prices[0] &&
        element.variant_prices[0].retail_price;

      const newResult = {
        sku: element.sku,
        barcode: element.barcode,
        variant_name: element.name,
        variant_id: element.variant_id,
        variant_image: findAvatar(element.variant_images ?? []),
        product_name: element.product.name,
        product_id: element.product.id,
        available: element.available ?? 0,
        amount: variantPrice,
        price: variantPrice,
        transfer_quantity: 0,
        real_quantity: element.real_quantity,
        weight: element?.weight ? element?.weight : 0,
        weight_unit: element?.weight_unit ? element?.weight_unit : "",
      };
      newArr.push(newResult);
    }
    return newArr;
  };

  const onSelectProduct = useCallback(
    (value: string, item: VariantResponse) => {
      let dataTemp = [...dataTable];
      let selectedItem = item;

      if (data?.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status) {
        if (dataTable.length > 0) {
          const findIndex = dataTemp.findIndex((i) => i.product_id === item.product_id);

          if (findIndex === -1) {
            showError("Sản Phẩm không có trong phiếu chuyển");
          }
        } else {
          showError("Sản Phẩm không có trong phiếu chuyển");
        }
      }

      const variantPrice =
        selectedItem &&
        selectedItem.variant_prices &&
        selectedItem.variant_prices[0] &&
        selectedItem.variant_prices[0].retail_price;

      const newResult = {
        sku: selectedItem.sku,
        barcode: selectedItem.barcode,
        variant_name: selectedItem.name,
        variant_id: selectedItem.id,
        variant_image: findAvatar(selectedItem.variant_images),
        product_name: selectedItem.product.name,
        product_id: selectedItem.product.id,
        available: selectedItem.available ?? 0,
        amount: variantPrice,
        price: variantPrice,
        transfer_quantity: 0,
        real_quantity: 1,
        weight: selectedItem?.weight ? selectedItem?.weight : 0,
        weight_unit: selectedItem?.weight_unit ? selectedItem?.weight_unit : "",
      };

      if (!dataTemp.some((variant: VariantResponse) => variant.sku === newResult?.sku)) {
        setDataTable((prev: any) => {
          return [
            {
              ...newResult,
              transfer_quantity: 0,
              real_quantity: 1,
              status: data?.status,
              to_store_id: data?.to_store_id,
            },
            ...prev,
          ];
        });
      } else {
        const indexItem = dataTemp.findIndex((e) => e.sku === item.sku);

        dataTemp[indexItem].real_quantity += 1;
        dataTemp[indexItem].status = data?.status;
        dataTemp[indexItem].to_store_id = data?.to_store_id;
        const dataSelected = dataTemp[indexItem];
        dataTemp.splice(indexItem, 1);
        setDataTable([dataSelected, ...dataTemp]);
      }
      setResultSearch([]);
    },
    [data?.status, data?.to_store_id, dataTable],
  );

  function getTotalRealQuantity() {
    let total = 0;
    dataTable.forEach((element: LineItem) => {
      total += element.real_quantity;
    });

    return formatCurrency(total, ".");
  }

  function onDeleteItem(index: number) {
    // delete row
    const temps = [...dataTable];
    temps.splice(index, 1);
    setDataTable(temps);
  }

  const onPickManyProduct = (result: Array<VariantResponse>) => {
    setVisibleManyProduct(false);
    const cloneResult = [...result];
    const newDataTable = [...dataTable];

    if (dataTable.length === 0) {
      const newResult = cloneResult?.map((item) => {
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
          product_id: item.product.id,
          available: item.available,
          amount: 0,
          status: data?.status,
          to_store_id: data?.to_store_id,
          price: variantPrice,
          transfer_quantity: 0,
          real_quantity: 1,
          weight: item.weight,
          weight_unit: item.weight_unit,
        };
      });
      setDataTable([...newResult]);
      return;
    }

    newDataTable.forEach((i: any, idx) => {
      const findIndex = cloneResult.findIndex((e) => e.id === i.variant_id);

      if (findIndex >= 0) {
        newDataTable[idx].real_quantity = newDataTable[idx].real_quantity + 1;
        cloneResult.splice(findIndex, 1);
      }
    });

    const newResult = cloneResult?.map((item) => {
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
        product_id: item.product.id,
        available: item.available,
        amount: 0,
        status: data?.status,
        to_store_id: data?.to_store_id,
        price: variantPrice,
        transfer_quantity: 0,
        real_quantity: 1,
        weight: item.weight,
        weight_unit: item.weight_unit,
      };
    });

    const dataTemp = [...newDataTable, ...newResult];

    setDataTable(dataTemp);
  };

  const createCallback = useCallback(
    (result: InventoryTransferDetailItem) => {
      setLoadingBtn(false);
      if (result) {
        showSuccess("Nhập hàng thành công");
        setDataTable(result.line_items);
        dispatch(getDetailInventoryTransferAction(idNumber, onResult));
      } else {
        dispatch(showLoading())
      }
    },
    [dispatch, idNumber, onResult],
  );

  const updateCallback = useCallback(
    (result: InventoryTransferDetailItem) => {
      setIsDisableEditNote(false);
      dispatch(hideLoading())
      if (!result) return;
      showSuccess("Đổi dữ liệu thành công");
      onReload();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const updateNoteApi = (key: string) => {
    setIsLoadingBtnSave(true);
    dispatch(showLoading())
    if (data && dataTable) {
      setIsDisableEditNote(true);
      data.line_items = dataTable;
      let dataUpdate: any = {};

      stores.forEach((store) => {
        if (store.id === Number(data?.from_store_id)) {
          dataUpdate.store_transfer = {
            id: data?.store_transfer?.id,
            store_id: store.id,
            hotline: store.hotline,
            address: store.address,
            name: store.name,
            code: store.code,
          };
        }
        if (store.id === Number(data?.to_store_id)) {
          dataUpdate.store_receive = {
            id: data?.store_receive?.id,
            store_id: store.id,
            hotline: store.hotline,
            address: store.address,
            name: store.name,
            code: store.code,
          };
        }
      });
      dataUpdate.from_store_id = data?.from_store_id;
      dataUpdate.to_store_id = data?.to_store_id;
      dataUpdate.attached_files = data?.attached_files;
      dataUpdate.line_items = data?.line_items;
      dataUpdate.exception_items = data?.exception_items;
      dataUpdate.note = key;
      dataUpdate.version = version;
      version = version + 1;

      dispatch(updateInventoryTransferAction(data.id, dataUpdate, updateCallback));
    }
  };

  const onReceive = useCallback(() => {
    if (data && dataTable) {
      setLoadingBtn(true);
      dispatch(showLoading())
      data.line_items = dataTable;
      let dataUpdate: any = {};

      stores.forEach((store) => {
        if (store.id === Number(data?.from_store_id)) {
          dataUpdate.store_transfer = {
            id: data?.store_transfer?.id,
            store_id: store.id,
            hotline: store.hotline,
            address: store.address,
            name: store.name,
            code: store.code,
          };
        }
        if (store.id === Number(data?.to_store_id)) {
          dataUpdate.store_receive = {
            id: data?.store_receive?.id,
            store_id: store.id,
            hotline: store.hotline,
            address: store.address,
            name: store.name,
            code: store.code,
          };
        }
      });
      dataUpdate.from_store_id = data?.from_store_id;
      dataUpdate.to_store_id = data?.to_store_id;
      dataUpdate.attached_files = data?.attached_files;
      dataUpdate.line_items = data?.line_items;
      dataUpdate.exception_items = data?.exception_items;
      dataUpdate.note = data?.note;
      dataUpdate.version = data?.version;
      dataUpdate.received_method = isReceiveAllProducts ? 'received_all' : 'other';
      dispatch(receivedInventoryTransferAction(data.id, dataUpdate, createCallback));
    }
  }, [createCallback, data, dataTable, dispatch, isReceiveAllProducts, stores]);

  const checkCallback = useCallback(
    (result: any) => {
      dispatch(hideLoading());
      if (result.responseData.code === HttpStatus.SUCCESS) {
        dispatch(acceptInventoryAction(Number(data?.id), onReload));
      } else if (result.responseData.code === HttpStatus.BAD_REQUEST) {
        setIsOpenModalErrors(true);
        setErrorData(result.responseData.data);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, data],
  );

  const checkDuplicateRecord = () => {
    if (data) {
      let dataCheck: any = {};

      stores.forEach((store) => {
        if (store.id === Number(data?.from_store_id)) {
          dataCheck.store_transfer = {
            id: data?.store_transfer?.id,
            store_id: store.id,
            hotline: store.hotline,
            address: store.address,
            name: store.name,
            code: store.code,
          };
        }
        if (store.id === Number(data?.to_store_id)) {
          dataCheck.store_receive = {
            id: data?.store_receive?.id,
            store_id: store.id,
            hotline: store.hotline,
            address: store.address,
            name: store.name,
            code: store.code,
          };
        }

        dataCheck.line_items = dataTable;
        dataCheck.ignore_id = data.id;
      });
      dispatch(showLoading());
      dispatch(checkDuplicateInventoryTransferAction(dataCheck, checkCallback));
    }
  };

  const handleSearchProduct = useCallback(
    async (keyCode: string, code: string) => {
      barCode = "";
      if (keyCode === "Enter" && code) {
        setKeySearch("");

        let res = await callApiNative({ isShowLoading: false }, dispatch, searchVariantsApi, {
          barcode: code,
          store_ids: data?.from_store_id ?? null,
        });
        if (res && res.items && res.items.length > 0) {
          onSelectProduct(res.items[0].id.toString(), res.items[0]);
        }
      } else {
        const txtSearchProductElement: any = document.getElementById("product_search_variant");

        onSearchProduct(txtSearchProductElement?.value);
      }
    },
    [dispatch, data?.from_store_id, onSelectProduct, onSearchProduct],
  );

  const eventKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLBodyElement) {
        if (event.key !== "Enter") {
          barCode = barCode + event.key;
        } else if (event && event.key === "Enter") {
          if (data?.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status) {
            handleSearchProduct(event.key, barCode);
          }
        }
        return;
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, handleSearchProduct, data?.status],
  );

  const eventKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        if (event.target.id === "product_search_variant") {
          if (event.key !== "Enter" && event.key !== "Shift") barCode = barCode + event.key;

          handleDelayActionWhenInsertTextInSearchInput(
            productAutoCompleteRef,
            () => handleSearchProduct(event.key, barCode),
            500,
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
      onSelectProduct(o, obj.label.props.data);
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
      dataIndex: "variant_image",
      render: (value: string) => {
        return (
          <div className="product-item-image">
            <img src={value ? value : imgDefIcon} alt="" className="" />
          </div>
        );
      },
    },
    {
      title: "Sản phẩm",
      width: "200px",
      className: "ant-col-info",
      dataIndex: "variant_name",
      render: (value: string, record: PurchaseOrderLineItem) => (
        <div>
          <div>
            <div className="product-item-sku">
              <Link
                target="_blank"
                to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}
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
      title: (
        <div>
          <div>SL Gửi</div>
          <div className="text-center">{data && formatCurrency(data.total_quantity, ".")}</div>
        </div>
      ),
      width: 100,
      align: "center",
      dataIndex: "transfer_quantity",
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      align: "center",
      width: 100,
      render: (value) => {
        return formatCurrency(value, ".");
      },
    },
  ];

  const columnsTransfer: ColumnsType<any> = [
    {
      title: "STT",
      align: "center",
      width: "50px",
      render: (value: string, record: PurchaseOrderLineItem, index: number) => index + 1,
    },
    {
      title: "Ảnh",
      width: "50px",
      dataIndex: "variant_image",
      render: (value: string) => {
        return (
          <div className="product-item-image">
            <img src={value ? value : imgDefIcon} alt="" className="" />
          </div>
        );
      },
    },
    {
      title: "Sản phẩm",
      width: "150px",
      className: "ant-col-info",
      dataIndex: "variant_name",
      render: (value: string, record: PurchaseOrderLineItem) => (
        <div>
          <div>
            <div className="product-item-sku">
              <Link
                target="_blank"
                to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}
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
      title: "Giá bán",
      dataIndex: "price",
      align: "center",
      width: 100,
      render: (value) => {
        return formatCurrency(value, ".");
      },
    },
    {
      title: (
        <div>
          <div>SL Gửi</div>
          <div className="text-center">{data && formatCurrency(data.total_quantity, ".")}</div>
        </div>
      ),
      width: 70,
      align: "center",
      dataIndex: "transfer_quantity",
      render: (value: any) => {
        return formatCurrency(value, ".");
      },
    },
    {
      title: (
        <div>
          <div>SL Nhận</div>
          <div className="text-center">{getTotalRealQuantity()}</div>
        </div>
      ),
      dataIndex: "real_quantity",
      align: "center",
      width: 70,
      render: (value: any, row: any, index: number) => {
        if (row.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status) {
          return (
            <NumberInput
              disabled={
                !checkUserPermission(
                  [InventoryTransferPermission.receive],
                  currentPermissions,
                  myStores.length > 0 ? [row.to_store_id] : [],
                  currentStores,
                )
              }
              isFloat={false}
              id={`item-quantity-${index}`}
              min={0}
              value={value ? value : 0}
              onChange={(quantity) => {
                onRealQuantityChange(quantity, index);
              }}
              className={value !== row.transfer_quantity || value === 0 ? "border-red" : ""}
            />
          );
        } else {
          return value ? formatCurrency(value, ".") : 0;
        }
      },
    },
    {
      title: "Lệch",
      align: "center",
      width: 100,
      render: (item, row: LineItem) => {
        const totalDifference = (row.real_quantity - row.transfer_quantity) * row.price;
        if (totalDifference) {
          return formatCurrency(totalDifference, ".");
        }
        return 0;
      },
    },
    {
      title: "Tồn kho nhận",
      align: "center",
      width: 80,
      dataIndex: "receive_on_hand",
      render: (value: any) => {
        return formatCurrency(value, ".");
      },
    },
    {
      title: "",
      fixed: dataTable?.length !== 0 && "right",
      width: 40,
      dataIndex: "transfer_quantity",
      render: (value: string, row: any, index: number) => {
        if (
          (parseInt(value) !== 0 && row.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status)
            || row.status === STATUS_INVENTORY_TRANSFER.RECEIVED.status
          || row?.status === STATUS_INVENTORY_TRANSFER.PENDING.status
        ) {
          return false;
        }
        return (
          <Button
            onClick={() => onDeleteItem(index)}
            className="product-item-delete"
            icon={<AiOutlineClose />}
          />
        );
      },
    },
  ];

  const deleteTicketResult = useCallback((result) => {
    setLoadingBtn(false);
    dispatch(hideLoading());
    if (!result) {
      setError(true);
      return;
    } else {
      setIsDeleteTicket(false);
      showSuccess("Huỷ phiếu thành công");
      setData(result);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDeleteTicket = (value: string | undefined) => {
    setLoadingBtn(true);
    dispatch(showLoading());
    dispatch(
      deleteInventoryTransferAction(idNumber, { note: value ? value : "" }, deleteTicketResult),
    );
  };

  const saveSessionStorage = () => {
    if (data) {
      sessionStorage.setItem(`dataItems${data.id}`, JSON.stringify(dataTable));
      sessionStorage.setItem(`id${data.id}`, data.id.toString());
      showSuccess("Đã lưu");
    }
  };

  const onPrintAction = (type: string) => {
    if (data) {
      dispatch(actionFetchPrintFormByInventoryTransferIds([data.id], type, printContentCallback));
    }
  };

  const onReload = useCallback(() => {
    setLoadingBtn(true);
    dispatch(showLoading())
    dispatch(getDetailInventoryTransferAction(idNumber, onResult));
  }, [dispatch, idNumber, onResult]);

  const changeReceiveAllProducts = (e: any) => {
    setIsReceiveAllProducts(e.target.checked);
    let newDataTable = [...dataTable];

    newDataTable = newDataTable.map((i) => {
      return {
        ...i,
        real_quantity: e.target.checked ? i.transfer_quantity : 0,
      };
    });

    setDataTable(newDataTable);
  };

  const importRealQuantity = (data: Array<VariantResponse>) => {
    const newArr = convertArrItem(data);
    setDataTable([...newArr]);
    setIsImport(false);
  };

  useEffect(() => {
    if (!stores || !data) return;
    else {
      const fromStoreData = stores.find((item) => item.id === data?.from_store_id);
      const toStoreData = stores.find((item) => item.id === data?.to_store_id);

      let request = {
        from_city_id: fromStoreData?.city_id,
        from_city: fromStoreData?.city_name,
        from_district_id: fromStoreData?.district_id,
        from_district: fromStoreData?.district_name,
        from_ward_id: fromStoreData?.ward_id,
        to_country_id: toStoreData?.country_id,
        to_city_id: toStoreData?.city_id,
        to_city: toStoreData?.city_name,
        to_district_id: toStoreData?.district_id,
        to_district: toStoreData?.district_name,
        to_ward_id: toStoreData?.ward_id,
        from_address: fromStoreData?.address,
        to_address: toStoreData?.full_address,
        price: data?.total_amount,
        quantity: 1,
        weight: SumWeightInventory(data?.line_items),
        length: 0,
        height: 0,
        width: 0,
        service_id: 0,
        service: "",
        option: "",
        insurance: 0,
        coupon: "",
        cod: 0,
      };
      dispatch(getFeesAction(request, setInfoFees));
    }
  }, [data, dispatch, stores]);

  useEffect(() => {
    dispatch(inventoryGetSenderStoreAction({ status: "active", simple: true }, setStores));

    dispatch(getDetailInventoryTransferAction(idNumber, onResult));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const convertTransferDetailExport = (
    transfer: InventoryTransferDetailItem,
    arrItem: Array<LineItem>,
  ) => {
    let arr = [];
    for (let i = 0; i < arrItem.length; i++) {
      const item = arrItem[i];

      arr.push({
        [TransferExportLineItemField.code]: transfer.code,
        [TransferExportLineItemField.from_store]: `${transfer.from_store_name}`,
        [TransferExportLineItemField.to_store]: `${transfer.to_store_name}`,
        [TransferExportLineItemField.status]: STATUS_INVENTORY_TRANSFER_ARRAY.find(
          (e) => e.value === transfer.status,
        )?.name,
        [TransferExportLineItemField.sku]: item.sku,
        [TransferExportLineItemField.variant_name]: item.variant_name,
        [TransferExportLineItemField.barcode]: item.barcode,
        [TransferExportLineItemField.price]: item.price,
        [TransferExportLineItemField.transfer_quantity]: item.transfer_quantity,
        [TransferExportLineItemField.total_amount]:
          (item.transfer_quantity ?? 0) * (item.price ?? 0),
        [TransferExportLineItemField.real_quantity]:
          item.real_quantity === 0 ? null : item.real_quantity,
        [TransferExportField.created_date]: ConvertUtcToLocalDate(
          item.created_date,
          DATE_FORMAT.DDMMYY_HHmm,
        ),
        [TransferExportField.created_name]: `${item.created_by} - ${item.created_name}`,
        [TransferExportField.transfer_date]: ConvertUtcToLocalDate(
          transfer.transfer_date,
          DATE_FORMAT.DDMMYY_HHmm,
        ),
        [TransferExportField.receive_date]: ConvertUtcToLocalDate(
          transfer.receive_date,
          DATE_FORMAT.DDMMYY_HHmm,
        ),
        [TransferExportField.receive_by]: transfer.receive_date
          ? `${item.updated_by} - ${item.updated_name}`
          : null,
        [TransferExportField.note]: transfer.note,
      });
    }
    return arr;
  };

  const exportTransfer = (transfer: InventoryTransferDetailItem | null) => {
    dispatch(showLoading());
    if (transfer == null || transfer.line_items == null || transfer.line_items.length === 0) {
      showWarning("Không có dữ liệu để xuất file");
      dispatch(hideLoading());
      return;
    }

    const workbook = XLSX.utils.book_new();
    const item = convertTransferDetailExport(transfer, transfer.line_items);
    const ws = XLSX.utils.json_to_sheet(item);

    XLSX.utils.book_append_sheet(workbook, ws, "data");
    const today = moment(new Date(), "YYYY/MM/DD");
    const month = today.format("M");
    const day = today.format("D");
    const year = today.format("YYYY");
    XLSX.writeFile(workbook, `${transfer.code}_${day}_${month}_${year}.xlsx`);
    dispatch(hideLoading());
  };

  const onMenuClick = React.useCallback(
    (menuId: number) => {
      switch (menuId) {
        case 1:
          setIsDeleteTicket(true);
          break;
        case 2:
          history.push(`${UrlConfig.INVENTORY_TRANSFERS}/${data?.id}/update?cloneId=${data?.id}`);
          break;
        case 3:
          exportTransfer(data);
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, history],
  );

  const receive = () => {
    const dataTableFiltered = dataTable.filter(
      (i: any) => i.real_quantity !== 0 && i.real_quantity !== null,
    );
    if (dataTableFiltered.length === 0) {
      showError("Vui lòng nhập ít nhất 1 sản phẩm số lượng thực nhận khác 0");
      return;
    }

    setIsVisibleModalReceiveWarning(true);
  };

  useEffect(() => {
    window.addEventListener("popstate", () => {
      dispatch({
        type: InventoryType.CHANGE_IS_CONTINUE_CREATE_IMPORT,
        payload: {
          isContinueCreateImport: false,
        },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledWrapper>
      <ContentContainer
        isError={isError}
        title={`Chuyển hàng ${data ? data.code : ""}`}
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Chuyển hàng",
            path: `${UrlConfig.INVENTORY_TRANSFERS}`,
          },
          {
            name: `${data ? data.code : ""}`,
          },
        ]}
        extra={<InventoryStep status={data?.status} inventoryTransferDetail={data} />}
      >
        {data && (
          <>
            <Row gutter={24}>
              <Col span={18}>
                <Card title="KHO HÀNG" bordered={false} className={"inventory-selectors"}>
                  <Row gutter={24}>
                    <Col span={12}>
                      <RowDetail title="Kho gửi" value={data.from_store_name} />
                      <RowDetail title="Mã CH" value={data.from_store_code?.toString()} />
                      <RowDetail title="SĐT" value={data.from_store_phone?.toString()} />
                      <RowDetail title="Địa chỉ" value={ConvertFullAddress(data.store_transfer)} />
                    </Col>
                    <Col span={12}>
                      <RowDetail title="Kho nhận" value={data.to_store_name} />
                      <RowDetail title="Mã CH" value={data.to_store_code?.toString()} />
                      <RowDetail title="SĐT" value={data.to_store_phone?.toString()} />
                      <RowDetail title="Địa chỉ" value={ConvertFullAddress(data.store_receive)} />
                    </Col>
                  </Row>
                </Card>

                {(data.status === STATUS_INVENTORY_TRANSFER.CONFIRM.status ||
                  data.status === STATUS_INVENTORY_TRANSFER.REQUESTED.status ||
                  data.status === STATUS_INVENTORY_TRANSFER.CANCELED.status) && (
                  <Card
                    title="DANH SÁCH SẢN PHẨM"
                    bordered={false}
                    extra={<Tag className={classTag}>{textTag}</Tag>}
                    className={"inventory-transfer-table"}
                  >
                    <Table
                      rowClassName="product-table-row"
                      tableLayout="fixed"
                      scroll={{ x: "max-content" }}
                      pagination={false}
                      columns={columns}
                      dataSource={data.line_items}
                      summary={() => (
                        <Table.Summary>
                          <Table.Summary.Row>
                            <Table.Summary.Cell align={"right"} index={2} colSpan={3}>
                              <b>Tổng số lượng:</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell align={"center"} index={3}>
                              <b>{data.total_quantity}</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={4} />
                          </Table.Summary.Row>
                        </Table.Summary>
                      )}
                    />
                  </Card>
                )}
                {(data.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status ||
                  data.status === STATUS_INVENTORY_TRANSFER.PENDING.status ||
                  data.status === STATUS_INVENTORY_TRANSFER.RECEIVED.status) && (
                  <Card
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div>Danh sách sản phẩm</div>
                        <div className="tag-receive-all">
                          {isReceiveAllProducts && data.status === STATUS_INVENTORY_TRANSFER.RECEIVED.status && (
                            <TagStatus type="success">Nhận tất cả</TagStatus>
                          )}
                        </div>
                      </div>
                    }
                    bordered={false}
                    extra={
                      <>

                        {data.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status && (
                          <>
                            <Checkbox
                              className="checkbox"
                              checked={isReceiveAllProducts}
                              onChange={changeReceiveAllProducts}
                            >
                              Nhận tất cả sản phẩm
                            </Checkbox>
                          </>
                        )}
                        <Tag className={classTag}>{textTag}</Tag>
                      </>
                    }
                    className={"inventory-transfer-table"}
                  >
                    <div>
                      {data.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status && (
                        <Input.Group className="display-flex">
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
                            id="product_search_variant"
                          >
                            <Input
                              size="middle"
                              className="yody-search"
                              placeholder=" Tìm kiếm Mã vạch, Mã sản phẩm, Tên sản phẩm"
                              prefix={<i className="icon-search icon" />}
                              ref={productSearchRef}
                            />
                          </AutoComplete>
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
                      )}

                      <Table
                        className="inventory-table"
                        rowClassName="product-table-row"
                        tableLayout="fixed"
                        scroll={{ x: "max-content" }}
                        pagination={false}
                        columns={columnsTransfer}
                        dataSource={dataTable}
                        summary={() => {
                          return (
                            <Table.Summary fixed>
                              <Table.Summary.Row>
                                <Table.Summary.Cell align={"right"} index={1} colSpan={3}>
                                  <b>Tổng số lượng:</b>
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={2} />

                                <Table.Summary.Cell align={"center"} index={3}>
                                  <b>{formatCurrency(data.total_quantity, ".")}</b>
                                </Table.Summary.Cell>

                                <Table.Summary.Cell align={"center"} index={5}>
                                  <b>{getTotalRealQuantity()}</b>
                                </Table.Summary.Cell>
                              </Table.Summary.Row>
                            </Table.Summary>
                          );
                        }}
                      />
                      {data?.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status && (
                        <div className="inventory-transfer-action">
                          <AuthWrapper
                            acceptPermissions={[InventoryTransferPermission.receive]}
                            acceptStoreIds={myStores.length > 0 ? [data.to_store_id] : []}
                          >
                            <Button
                              type="default"
                              className="button-draft"
                              size="large"
                              onClick={saveSessionStorage}
                            >
                              Lưu
                            </Button>
                            <Button
                              type="primary"
                              className="ant-btn-primary"
                              size="large"
                              loading={isLoadingBtn}
                              onClick={receive}
                            >
                              Nhận hàng
                            </Button>
                          </AuthWrapper>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </Col>
              <Col span={6}>
                <Card
                  title={"THÔNG TIN PHIẾU"}
                  bordered={false}
                  className={"inventory-info"}
                  extra={<Tag className={classTag}>{textTag}</Tag>}
                >
                  <Col>
                    <div className="row-detail">
                      <div className="row-detail-left title" style={{ width: "50%" }}>
                        Mã phiếu
                      </div>
                      <div className="dot data">:</div>
                      <div className="row-detail-right data" style={{ width: "50%" }}>
                        <span>{data.code}</span>
                      </div>
                    </div>
                    <div className="row-detail">
                      <div className="row-detail-left title" style={{ width: "50%" }}>
                        Người tạo
                      </div>
                      <div className="dot data">:</div>
                      <div className="row-detail-right data" style={{ width: "50%" }}>
                        <Link to={`${UrlConfig.ACCOUNTS}/${data.created_by}`}>
                          <span>
                            {data.created_by} {data.created_by && "-"} {data.created_name}
                          </span>
                        </Link>
                      </div>
                    </div>
                    <div className="row-detail">
                      <div className="row-detail-left title" style={{ width: "50%" }}>
                        Người chuyển
                      </div>
                      <div className="dot data">:</div>
                      <div className="row-detail-right data" style={{ width: "50%" }}>
                        <Link to={`${UrlConfig.ACCOUNTS}/${data.transfer_by}`}>
                          <span>
                            {data.transfer_by} {data.transfer_by && "-"} {data.transfer_name}
                          </span>
                        </Link>
                      </div>
                    </div>
                    <div className="row-detail">
                      <div className="row-detail-left title" style={{ width: "50%" }}>
                        Người nhận
                      </div>
                      <div className="dot data">:</div>
                      <div className="row-detail-right data" style={{ width: "50%" }}>
                        <Link to={`${UrlConfig.ACCOUNTS}/${data.received_by}`}>
                          <span>
                            {data.received_by} {data.received_by && "-"} {data.received_name}
                          </span>
                        </Link>
                      </div>
                    </div>
                    <div className="row-detail">
                      <div className="row-detail-left title" style={{ width: "50%" }}>
                        Người hủy
                      </div>
                      <div className="dot data">:</div>
                      <div className="row-detail-right data" style={{ width: "50%" }}>
                        <Link to={`${UrlConfig.ACCOUNTS}/${data.cancel_by}`}>
                          <span>
                            {data.cancel_by} {data.cancel_by && "-"} {data.cancel_name}
                          </span>
                        </Link>
                      </div>
                    </div>
                  </Col>
                </Card>
                <Card title={"GHI CHÚ"} bordered={false} className={"inventory-note"}>
                  <Row gutter={5} style={{ flexDirection: "column" }}>
                    <Col span={24} style={{ marginBottom: 6 }}>
                      <b>Ghi chú nội bộ:</b>
                    </Col>
                    <Col span={24}>
                      <Form form={form}>
                        <Form.Item name="note">
                          <TextArea
                            disabled={isDisableEditNote}
                            maxLength={250}
                            placeholder="Nhập ghi chú nội bộ"
                            autoSize={{ minRows: 4, maxRows: 6 }}
                          />
                        </Form.Item>
                        <div className="button-save">
                          <Button
                            disabled={isDisableEditNote}
                            loading={isLoadingBtnSave}
                            onClick={() => updateNoteApi(form.getFieldValue("note"))}
                            size="small"
                            type="primary"
                          >
                            Lưu
                          </Button>
                        </div>
                      </Form>
                    </Col>
                  </Row>

                  <Row className="margin-top-10" gutter={5} style={{ flexDirection: "column" }}>
                    <Col span={24} style={{ marginBottom: 6 }}>
                      <b>File đính kèm:</b>
                    </Col>
                    <Col span={24}>
                      <span className="text-focus">
                        {Array.isArray(data.attached_files) &&
                          data.attached_files.length > 0 &&
                          data.attached_files?.map((link: string, index: number) => {
                            return (
                              <a
                                key={index}
                                className="file-pin"
                                target="_blank"
                                rel="noreferrer"
                                href={link}
                              >
                                <PaperClipOutlined /> {link}
                              </a>
                            );
                          })}
                      </span>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
            <BottomBarContainer
              leftComponent={
                <div
                  onClick={() => history.push(`${UrlConfig.INVENTORY_TRANSFERS}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
                  {"Quay lại danh sách"}
                </div>
              }
              rightComponent={
                <Space>
                  {data.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status && (
                    <AuthWrapper acceptPermissions={[InventoryTransferPermission.receive]}>
                      <Button
                        icon={<ImportOutlined />}
                        onClick={() => {
                          setIsImport(true);
                        }}
                      >
                        Import Excel
                      </Button>
                    </AuthWrapper>
                  )}
                  <AuthWrapper acceptPermissions={[InventoryTransferPermission.print]}>
                    <Button onClick={() => onPrintAction("inventory_transfer_bill")}>
                      <PrinterOutlined />
                      {" In vận đơn"}
                    </Button>
                  </AuthWrapper>
                  <AuthWrapper acceptPermissions={[InventoryTransferPermission.print]}>
                    <Button onClick={() => onPrintAction("inventory_transfer")}>
                      <PrinterOutlined />
                      {" In phiếu chuyển"}
                    </Button>
                  </AuthWrapper>
                  <ActionButton
                    type="text"
                    placement="topLeft"
                    menu={actions}
                    onMenuClick={onMenuClick}
                  />
                  {data.status === STATUS_INVENTORY_TRANSFER.PENDING.status && (
                    <>
                      <AuthWrapper acceptPermissions={[InventoryTransferPermission.balance]}>
                        <Button onClick={() => {}}>Kiểm kho theo sản phẩm</Button>
                      </AuthWrapper>
                      <AuthWrapper acceptPermissions={[InventoryTransferPermission.balance]}>
                        <Button type="primary" onClick={() => setIsBalanceTransfer(true)}>
                          Nhận lại tồn chênh lệch
                        </Button>
                      </AuthWrapper>
                    </>
                  )}
                  {data.status === STATUS_INVENTORY_TRANSFER.CONFIRM.status && (
                    <AuthWrapper
                      acceptPermissions={[InventoryTransferPermission.update]}
                      acceptStoreIds={myStores.length > 0 ? [data.from_store_id] : []}
                    >
                      <Button
                        onClick={() => {
                          history.push(`${UrlConfig.INVENTORY_TRANSFERS}/${data?.id}/update`);
                        }}
                      >
                        <EditOutlined /> Sửa thông tin
                      </Button>
                    </AuthWrapper>
                  )}
                  {data.status === STATUS_INVENTORY_TRANSFER.REQUESTED.status && (
                    <AuthWrapper acceptPermissions={[InventoryTransferPermission.update]}>
                      <Button
                        onClick={() => {
                          history.push(`${UrlConfig.INVENTORY_TRANSFERS}/${data?.id}/update`);
                        }}
                      >
                        <EditOutlined /> Sửa thông tin
                      </Button>
                    </AuthWrapper>
                  )}
                  {data.status === STATUS_INVENTORY_TRANSFER.REQUESTED.status && (
                    <AuthWrapper
                      acceptPermissions={[InventoryTransferPermission.create]}
                      acceptStoreIds={myStores.length > 0 ? [data.from_store_id] : []}
                    >
                      <Button
                        className="export-button"
                        type="primary"
                        loading={isLoadingBtn}
                        onClick={() => {
                          if (data) {
                            dispatch(showLoading());
                            checkDuplicateRecord();
                          }
                        }}
                      >
                        Xác nhận
                      </Button>
                    </AuthWrapper>
                  )}
                  {data.status === STATUS_INVENTORY_TRANSFER.CONFIRM.status && (
                    <AuthWrapper
                      acceptPermissions={[ShipmentInventoryTransferPermission.export]}
                      acceptStoreIds={myStores.length > 0 ? [data.from_store_id] : []}
                    >
                      <Button
                        className="export-button"
                        type="primary"
                        loading={isLoadingBtn}
                        onClick={() => {
                          if (data) {
                            let isValid: boolean = true;
                            for (let i = 0; i < data.line_items.length; i++) {
                              if (data.line_items[i].transfer_quantity > data.line_items[i].available) {
                                isValid = false;
                                break;
                              }
                            }
                            if (!isValid) {
                              showError("Không đủ tồn kho gửi.");
                              return;
                            }
                            dispatch(exportInventoryAction(data?.id, onReload));
                          }
                        }}
                      >
                        Xuất kho
                      </Button>
                    </AuthWrapper>
                  )}
                </Space>
              }
            />
          </>
        )}
        <div style={{ display: "none" }}>
          <div className="printContent" ref={printElementRef}>
            <div
              dangerouslySetInnerHTML={{
                __html: purify.sanitize(printContent),
              }}
            />
          </div>
        </div>
        {isVisibleModalWarning && (
          <ModalConfirm
            loading={isLoadingBtn}
            onCancel={() => {
              setIsVisibleModalWarning(false);
            }}
            onOk={() => {
              if (data) {
                setIsVisibleModalWarning(false);
                setLoadingBtn(true);
                dispatch(cancelShipmentInventoryTransferAction(data?.id, onReload));
              }
            }}
            okText="Đồng ý"
            cancelText="Huỷ"
            title={`Bạn có muốn huỷ giao hàng?`}
            subTitle={"Sau khi nhận hàng sẽ không thể thay đổi số thực nhận."}
            visible={isVisibleModalWarning}
          />
        )}
        {isVisibleModalReceiveWarning && (
          <ModalConfirm
            loading={isLoadingBtn}
            onCancel={() => {
              setIsVisibleModalReceiveWarning(false);
            }}
            onOk={() => {
              sessionStorage.removeItem(`dataItems${data?.id}`);
              sessionStorage.removeItem(`id${data?.id}`);
              setIsVisibleModalReceiveWarning(false);
              onReceive();
            }}
            okText="Đồng ý"
            cancelText="Huỷ"
            title={`Bạn có chắc muốn nhận hàng?`}
            subTitle={"Sau khi nhận hàng sẽ không thể thay đổi số thực nhận."}
            visible={isVisibleModalReceiveWarning}
          />
        )}
        {isDeleteTicket && (
          <DeleteTicketModal
            onOk={onDeleteTicket}
            onCancel={() => setIsDeleteTicket(false)}
            visible={isDeleteTicket}
            icon={WarningRedIcon}
            textStore={data?.from_store_name}
            loading={isLoadingBtn}
            okText="Đồng ý"
            cancelText="Thoát"
            title={`Bạn chắc chắn Hủy phiếu chuyển hàng ${data?.code}`}
          />
        )}
        {isBalanceTransfer && (
          <InventoryTransferBalanceModal
            onOk={(result) => {
              if (result) {
                setIsBalanceTransfer(false);
                showSuccess("Cân bằng kho thành công");
                onReload();
              }
            }}
            onCancel={() => setIsBalanceTransfer(false)}
            visible={isBalanceTransfer}
            data={data}
          />
        )}
        {visibleManyProduct && (
          <PickManyProductModal
            isTransfer
            storeID={data?.from_store_id}
            selected={[]}
            onSave={onPickManyProduct}
            onCancel={() => setVisibleManyProduct(false)}
            visible={visibleManyProduct}
          />
        )}
        {isVisibleInventoryShipment && (
          <InventoryShipment
            visible={isVisibleInventoryShipment}
            dataTicket={data}
            onCancel={() => setIsVisibleInventoryShipment(false)}
            onOk={(item) => {
              if (item) {
                onReload();
              }
            }}
            infoFees={infoFees}
          />
        )}
        <ImportExcel
          onCancel={() => {
            setIsImport(false);
          }}
          onOk={(data: Array<VariantResponse>) => {
            importRealQuantity(data);
          }}
          title="Import số lượng thực nhận"
          visible={isImport}
          dataTable={dataTable}
        />
        {isOpenModalErrors && (
          <ModalShowError
            onCancel={() => {
              setIsOpenModalErrors(false);
              setLoadingBtn(false)
            }}
            loading={isLoadingBtn}
            errorData={errorData}
            onOk={() => dispatch(acceptInventoryAction(Number(data?.id), onReload))}
            title={"Có một số phiếu chuyển tương tự được tạo trong 1 tháng trở lại đây. Tiếp tục thực hiện?"}
            visible={isOpenModalErrors}
          />
        )}
      </ContentContainer>
    </StyledWrapper>
  );
};

export default DetailTicket;
