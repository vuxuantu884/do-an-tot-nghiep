import React, { ChangeEvent, createRef, FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyledWrapper } from "./styles";
import UrlConfig from "config/url.config";
import { Button, Card, Col, Row, Space, Table, Tag, Input, AutoComplete, Form } from "antd";
import arrowLeft from "assets/icon/arrow-back.svg";
import purify from "dompurify";
import imgDefIcon from "assets/img/img-def.svg";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import PlusOutline from "assets/icon/plus-outline.svg";
import WarningRedIcon from "assets/icon/ydWarningRedIcon.svg";
import {
  CloseCircleOutlined,
  EditOutlined,
  PaperClipOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/lib/table/interface";
import BottomBarContainer from "component/container/bottom-bar.container";
import RowDetail from "screens/products/product/component/RowDetail";
import { useHistory, useParams } from "react-router";
import { useDispatch } from "react-redux";
import {
  deleteInventoryTransferAction,
  getDetailInventoryTransferAction,
  inventoryGetSenderStoreAction,
  inventoryGetVariantByStoreAction,
  receivedInventoryTransferAction,
  getFeesAction,
  cancelShipmentInventoryTransferAction,
  exportInventoryAction, updateInventoryTransferAction,
  // createInventoryTransferShipmentAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { InventoryTransferDetailItem, LineItem, Store } from "model/inventory/transfer";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { ConvertFullAddress } from "utils/ConvertAddress";
import DeleteTicketModal from "../common/DeleteTicketPopup";
import InventoryShipment  from "../common/ChosesShipment";
import {
  findAvatar,
  handleDelayActionWhenInsertTextInSearchInput,
  SumWeightInventory,
  // SumWeightLineItems,
} from "utils/AppUtils";
import NumberFormat from "react-number-format";
import { Link } from "react-router-dom";
import ContentContainer from "component/container/content.container";
import InventoryStep from "./components/InventoryTransferStep";
import { STATUS_INVENTORY_TRANSFER } from "../ListTicket/constants";
import NumberInput from "component/custom/number-input.custom";
import { VariantResponse } from "model/product/product.model";
import { showSuccess } from "utils/ToastUtils";
import ProductItem from "screens/purchase-order/component/product-item";
import { PageResponse } from "model/base/base-metadata.response";
import PickManyProductModal from "screens/purchase-order/modal/pick-many-product.modal";
import _, { debounce } from "lodash";
import { AiOutlineClose } from "react-icons/ai";
import InventoryTransferBalanceModal from "./components/InventoryTransferBalance";
import ModalConfirm from "component/modal/ModalConfirm";
import { actionFetchPrintFormByInventoryTransferIds } from "domain/actions/printer/printer.action";
import { useReactToPrint } from "react-to-print";
import { PrinterInventoryTransferResponseModel } from "model/response/printer.response";
import AuthWrapper from "component/authorization/AuthWrapper";
import { InventoryTransferPermission, ShipmentInventoryTransferPermission } from "config/permissions/inventory-transfer.permission";
import { RefSelectProps } from "antd/lib/select";
import { RegUtil } from "utils/RegUtils";
import { callApiNative } from "utils/ApiUtils";
import { getVariantByBarcode } from "service/product/variant.service";
import { inventoryTransferGetDetailVariantIdsApi } from "service/inventory/transfer/index.service";
import { InventoryResponse } from "model/inventory";
import TextArea from "antd/es/input/TextArea";
// import { checkUserPermission } from "../../../utils/AuthUtil";
// import { RootReducerType } from "../../../model/reducers/RootReducerType";
import { getAccountDetail } from "../../../service/accounts/account.service";
// import moment from "moment";
export interface InventoryParams {
  id: string;
}

let barCode = "";

// const ShipmentStatus = {
//   CONFIRMED: "confirmed",
//   TRANSFERRING: "transferring",
//   RECEIVED: "received",
//   CANCELED: "canceled"
// }

let version = 0;

const DetailTicket: FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [data, setData] = useState<InventoryTransferDetailItem | null>(null);
  // const [dataShipment, setDataShipment] = useState<ShipmentItem | undefined>();
  const [isDeleteTicket, setIsDeleteTicket] = useState<boolean>(false);
  const [isVisibleInventoryShipment, setIsVisibleInventoryShipment] = useState<boolean>(false);
  const [isBalanceTransfer, setIsBalanceTransfer] = useState<boolean>(false);
  const [isDisableEditNote, setIsDisableEditNote] = useState<boolean>(false);

  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isVisibleModalReceiveWarning, setIsVisibleModalReceiveWarning] = useState<boolean>(false);
  const [isVisibleModalWarning, setIsVisibleModalWarning] =
    useState<boolean>(false);

  const [keySearch, setKeySearch] = useState<string>("");
  const productAutoCompleteRef = createRef<RefSelectProps>();

  const [infoFees, setInfoFees] = useState<Array<any>>([]);
  const productSearchRef = React.useRef<any>(null);

  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);
  const [dataTable, setDataTable] = useState<Array<VariantResponse> | any>(
    [] as Array<VariantResponse>
  );
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [isHavePermissionQuickBalance, setIsHavePermissionQuickBalance] = useState<boolean>(false);

  const [form] = Form.useForm();
  const printElementRef = useRef(null);

  // const currentPermissions: string[] = useSelector(
  //   (state: RootReducerType) => state.permissionReducer.permissions
  // );
  //
  // const currentStores = useSelector(
  //   (state: RootReducerType) => state.userReducer.account?.account_stores
  // );

  const [printContent, setPrintContent] = useState<string>("");
  const pageBreak = "<div class='pageBreak'></div>";
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });
  const printContentCallback = useCallback(
    (printContent: Array<PrinterInventoryTransferResponseModel>) => {
      if (!printContent || printContent.length === 0) return;
      const textResponse = printContent.map((single) => {
        return (
          "<div class='singleOrderPrint'>" +
          single.html_content +
          "</div>"
        );
      });
      let textResponseFormatted = textResponse.join(pageBreak);
      //xóa thẻ p thừa
      let result = textResponseFormatted.replaceAll("<p></p>", "");
      setPrintContent(result);
      handlePrint && handlePrint();
    },
    [handlePrint]
  );
  const onResult = useCallback(
    (result: InventoryTransferDetailItem | false) => {
      setLoading(false);
      setIsDisableEditNote(false);
      if (!result) {
        setError(true);
        return;
      } else {
        let dataLineItems = sessionStorage.getItem(`dataItems${result.id}`);
        let dataId = sessionStorage.getItem(`id${result.id}`);
        if (dataLineItems) {
        }

        if (dataLineItems && dataId === `${result.id}`) {
          setDataTable(JSON.parse(dataLineItems));
        }
        else {
          setDataTable(result.line_items);
        }
        setData(result);
        version = result.version;
        form.setFieldsValue({ note: result.note });
        // setDataShipment(result.shipment);
        setIsVisibleInventoryShipment(false);

        callApiNative({isShowLoading: false},dispatch,getAccountDetail).then((res) => {
          if (res) {
            setIsHavePermissionQuickBalance(res.user_name === result.created_name);
            return;
          }

          setIsHavePermissionQuickBalance(true);
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  function onRealQuantityChange(quantity: number | null, index: number) {
    const dataTableClone = _.cloneDeep(dataTable);
    dataTableClone[index].real_quantity = quantity;

    setDataTable(dataTableClone);
  }

  const [resultSearch, setResultSearch] = useState<
    PageResponse<VariantResponse> | any
  >();

  const onSearch = useCallback((value: string)=>{
    setKeySearch(value);
  },[setKeySearch]);

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
            setResultSearch
          )
        );
    }
  },[dispatch,setResultSearch, data]);

  let textTag: string;
  let classTag: string;
  switch (data?.status) {
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

  const onSelectProduct = useCallback((value: string, item?: VariantResponse) => {
    const dataTemp = [...dataTable];
    let selectedItem = resultSearch?.items?.find(
      (variant: VariantResponse) => variant.id.toString() === value
    );

    if (item)
    selectedItem = item;

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

    if (
      !dataTemp.some(
        (variant: VariantResponse) => variant.sku === newResult.sku
      )
    )  {
      setDataTable((prev: any) => prev.concat([{...newResult}]));
    }else{
      dataTemp?.forEach((e: VariantResponse) => {
        if (e.sku === selectedItem.sku) {
          if (!e.real_quantity) {
            e.real_quantity = 0
          }
          e.real_quantity += 1;
        }
      })
      setDataTable(dataTemp);
    }
    setKeySearch("");
    barCode="";
    setResultSearch([]);
  },[resultSearch, dataTable]);

  function getTotalRealQuantity() {
    let total = 0;
    dataTable.forEach((element: LineItem) => {
      total += element.real_quantity;
    });

    return total;
  }

  function onDeleteItem(index: number) {
    // delete row
    const temps = [...dataTable];
    temps.splice(index, 1);
    setDataTable(temps);
  }

  const onPickManyProduct = (result: Array<VariantResponse>) => {

    const newResult = result?.map((item) => {
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
        price: variantPrice,
        transfer_quantity: 0,
        real_quantity: 0,
        weight: item.weight,
        weight_unit: item.weight_unit
      };
    });

    newResult.forEach((item, index) => {
      let isFindIndex = dataTable.findIndex(
        (itemOld: VariantResponse) => itemOld.variant_id === item.variant_id
      );
      if (isFindIndex !== -1) {
        newResult.splice(index, 1);
      }
    });

    const dataTemp = [...dataTable, ...newResult];

    setDataTable(dataTemp);
    setVisibleManyProduct(false);
  };

  const createCallback = useCallback(
    (result: InventoryTransferDetailItem) => {
      if (result) {
        showSuccess("Nhập hàng thành công");
        setDataTable(result.line_items);
        setData(result);
        history.push(`${UrlConfig.INVENTORY_TRANSFERS}/${result.id}`);
      }
    },
    [history]
  );

  const updateCallback = useCallback(
    (result: InventoryTransferDetailItem) => {
      setIsDisableEditNote(false);
      if (!result) return;
      showSuccess("Đổi dữ liệu thành công");
      onReload();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const updateNoteApi = (key: string) => {
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
      })
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
      })
      dataUpdate.from_store_id = data?.from_store_id;
      dataUpdate.to_store_id = data?.to_store_id;
      dataUpdate.attached_files = data?.attached_files;
      dataUpdate.line_items = data?.line_items;
      dataUpdate.exception_items = data?.exception_items;
      dataUpdate.note = data?.note;
      dataUpdate.version = data?.version;
      dispatch(receivedInventoryTransferAction(data.id, dataUpdate, createCallback));
    }
  }, [createCallback, data, dataTable, dispatch, stores]);

  const handleSearchProduct = useCallback(async (keyCode: string, code: string) => {
      if (keyCode === "Enter" && code){
        barCode ="";
        setKeySearch("");

        if (RegUtil.BARCODE_NUMBER.test(code)) {
          const item: VariantResponse  = await callApiNative({isShowLoading: false}, dispatch, getVariantByBarcode,code);

          if (item && item.id) {
           const variant: PageResponse<InventoryResponse> = await callApiNative({isShowLoading: false}, dispatch, inventoryTransferGetDetailVariantIdsApi,[item.id],data?.from_store_id ?? null);
           if (variant && variant.items && variant.items.length > 0) {
             item.available = variant.items[variant.items.length-1].available;
             item.on_hand = variant.items[variant.items.length-1].on_hand;
           }
           onSelectProduct(item.id.toString(),item);
          }
        }
      }
      else{
        const txtSearchProductElement: any =
          document.getElementById("product_search_variant");

        onSearchProduct(txtSearchProductElement?.value);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[dispatch,onSelectProduct, onSearchProduct]);

  const eventKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.target instanceof HTMLBodyElement) {
        if (event.key !== "Enter") {
          barCode = barCode + event.key;
        } else if (event.key === "Enter") {
          if (barCode !== "" && event) {
            handleSearchProduct(event.key,barCode);
            barCode = "";
          }
        }
        return;
      }
    },
    [handleSearchProduct]
  );

  const eventKeydown = useCallback(
    (event: KeyboardEvent) => {

     if (event.target instanceof HTMLInputElement) {
       if (event.target.id === "product_search_variant") {
         if (event.key !== "Enter" && event.key !== "Shift")
           barCode = barCode + event.key;

         handleDelayActionWhenInsertTextInSearchInput(
           productAutoCompleteRef,
           () => handleSearchProduct(event.key, barCode),
           500
         );
         return;
       }
     }

   },
   // eslint-disable-next-line react-hooks/exhaustive-deps
   [handleSearchProduct]
 );

  const onSelect = useCallback((o)=>{
    onSelectProduct(o);
  },[onSelectProduct])

  useEffect(() => {
    window.addEventListener("keydown", eventKeydown);
    window.addEventListener("keypress", eventKeyPress);
    return () => {
      window.removeEventListener("keydown", eventKeydown);
      window.addEventListener("keypress", eventKeyPress);
    };
}, [eventKeyPress, eventKeydown]);

  const columns: ColumnsType<any> = [
    {
      title: "STT",
      align: "center",
      width: "70px",
      render: (value: string, record: PurchaseOrderLineItem, index: number) =>
        index + 1,
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
      title: <div>
        <div>SL</div>
        <div className="text-center">
          {data?.total_quantity}
        </div>
      </div>,
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
        return <NumberFormat
          value={value}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      },
    },
    {
      title: "Thành tiền",
      dataIndex: "amount",
      align: "center",
      width: 100,
      render: (value, row: LineItem) => {
        return <NumberFormat
          value={row.price * row.transfer_quantity}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      },
    },
  ];

  const columnsTransfer: ColumnsType<any> = [
    {
      title: "STT",
      align: "center",
      width: "50px",
      render: (value: string, record: PurchaseOrderLineItem, index: number) =>
        index + 1,
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
        return <NumberFormat
          value={value}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      },
    },
    {
      title: <div>
        <div>SL</div>
        <div className="text-center">
          {data?.total_quantity}
        </div>
      </div>,
      width: 40,
      align: "center",
      dataIndex: "transfer_quantity",
    },
    {
      title: "Thành tiền",
      dataIndex: "amount",
      align: "center",
      width: 120,
      render: (value, row: LineItem) => {
        return <NumberFormat
          value={row.price * row.transfer_quantity}
          className="foo"
          displayType={"text"}
          thousandSeparator={true}
        />
      },
    },
    {
      title: <div>
        <div>Thực nhận</div>
        <div className="text-center">
          {getTotalRealQuantity()}
        </div>
      </div>,
      dataIndex: "real_quantity",
      align: "center",
      width: 70,
      render: (value, row, index: number) => {
        if (data?.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status) {
          return <NumberInput
            // disabled={!checkUserPermission([InventoryTransferPermission.receive], currentPermissions, [data.to_store_id], currentStores)}
            isFloat={false}
            id={`item-quantity-${index}`}
            min={0}
            value={value ? value : 0}
            onChange={(quantity) => {
              onRealQuantityChange(quantity, index);
            }}
            className={value && value < row.transfer_quantity
              ? 'border-red'
              : value && value > row.transfer_quantity
                ? 'border-red'
                : ''}
          />
        }
        else {
          return value ? value : 0;
        }
      },
    },
    {
      title: "Lệch",
      align: "center",
      width: 100,
      render: (item, row: LineItem) => {
        const totalDifference = ( row.real_quantity - row.transfer_quantity ) * row.price;
        if (totalDifference) {
          return <NumberFormat
            value={totalDifference}
            className="foo"
            displayType={"text"}
            thousandSeparator={true}
          />
        }
        return 0;
      },
    },
    {
      title: "",
      fixed: dataTable?.length !== 0 && "right",
      width: 40,
      dataIndex: "transfer_quantity",
      render: (value: string, row, index) => {
        if (
          (parseInt(value) !== 0 &&
            (data?.status === STATUS_INVENTORY_TRANSFER.RECEIVED.status
            || data?.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status)
          )
          || data?.status === STATUS_INVENTORY_TRANSFER.PENDING.status) {
          return false;
        }
        return <Button
          onClick={() => onDeleteItem(index)}
          className="product-item-delete"
          icon={<AiOutlineClose />}
        />
      },
    },
  ];

  const deleteTicketResult = useCallback(result => {
    if (!result) {
      setError(true);
      return;
    } else {
      setIsDeleteTicket(false);
      showSuccess("Huỷ phiếu thành công");
      setData(result);
    }
  }, [])

  const onDeleteTicket = (value: string | undefined) => {
    dispatch(
      deleteInventoryTransferAction(
        idNumber,
        {note: value ? value : ""},
        deleteTicketResult
      )
    );
  };

  const saveSessionStorage = () => {
    if (data) {
      sessionStorage.setItem(`dataItems${data.id}`, JSON.stringify(dataTable));
      sessionStorage.setItem(`id${data.id}`, data.id.toString());
      showSuccess('Đã lưu')
    }
  }

  const onPrintAction = (type: string) => {
    if (data) {
      dispatch(actionFetchPrintFormByInventoryTransferIds([data.id], type, printContentCallback));
    }
  }

  const onReload = useCallback(()=>{
    dispatch(getDetailInventoryTransferAction(idNumber, onResult));
  },[dispatch,idNumber,onResult])

  useEffect(() => {
    if (!stores || !data) return;
    else {
      const fromStoreData = stores.find(item => item.id === data?.from_store_id);
      const toStoreData = stores.find(item => item.id === data?.to_store_id);

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
    dispatch(
      inventoryGetSenderStoreAction(
        { status: "active", simple: true },
        setStores
      )
    );

    dispatch(getDetailInventoryTransferAction(idNumber, onResult));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateNote = (key: string) => {
    updateNoteApi(key);
  };

  const updateNoteDebounce = debounce((key: string) => {
    updateNote(key);
  }, 500);

  const changeNote = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateNoteDebounce(e.target.value);
  };

  return (
    <StyledWrapper>
      <ContentContainer
        isError={isError}
        isLoading={isLoading}
        title={`Chuyển hàng ${data? data.code : ''}`}
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
            name: `${data? data.code : ''}`,
          },
        ]}
        extra={
          <InventoryStep
            status={data?.status}
            inventoryTransferDetail={data}
          />
        }
      >
        {data && (
          <>
            <Row gutter={24}>
              <Col span={18}>
                <Card
                  title="KHO HÀNG"
                  bordered={false}
                  className={"inventory-selectors"}
                >
                  <Row gutter={24}>
                    <Col span={12}>
                      <RowDetail title="Kho gửi" value={data.from_store_name} />
                      <RowDetail
                        title="Mã CH"
                        value={data.from_store_code?.toString()}
                      />
                      <RowDetail
                        title="SĐT"
                        value={data.from_store_phone?.toString()}
                      />
                      <RowDetail
                        title="Địa chỉ"
                        value={ConvertFullAddress(data.store_transfer)}
                      />
                    </Col>
                    <Col span={12}>
                      <RowDetail title="Kho nhận" value={data.to_store_name} />
                      <RowDetail
                        title="Mã CH"
                        value={data.to_store_code?.toString()}
                      />
                      <RowDetail
                        title="SĐT"
                        value={data.to_store_phone?.toString()}
                      />
                      <RowDetail
                        title="Địa chỉ"
                        value={ConvertFullAddress(data.store_receive)}
                      />
                    </Col>
                  </Row>
                </Card>

                    {
                     (data.status === STATUS_INVENTORY_TRANSFER.CONFIRM.status ||
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
                                  <Table.Summary.Cell index={4}>
                                  </Table.Summary.Cell>
                                  <Table.Summary.Cell align={"center"} index={5}>
                                    <b><NumberFormat
                                        value={data.total_amount}
                                        className="foo"
                                        displayType={"text"}
                                        thousandSeparator={true}
                                      /></b>
                                  </Table.Summary.Cell>
                                </Table.Summary.Row>
                              </Table.Summary>
                            )}
                          />
                        </Card>
                      )
                    }
                {
                  (data.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status
                    || data.status === STATUS_INVENTORY_TRANSFER.PENDING.status
                    || data.status === STATUS_INVENTORY_TRANSFER.RECEIVED.status) && (
                  <Card
                    title="Danh sách sản phẩm"
                    bordered={false}
                    extra={<Tag className={classTag}>{textTag}</Tag>}
                    className={"inventory-transfer-table"}
                  >
                    <div>
                      {
                        data.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status && (
                        <Input.Group className="display-flex">
                          <AutoComplete
                            notFoundContent={
                              keySearch.length >= 3
                                ? "Không tìm thấy sản phẩm"
                                : undefined
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
                              placeholder="Tìm kiếm Mã vạch, Mã sản phẩm, Tên sản phẩm"
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
                        )
                      }

                      <Table
                        className="inventory-table"
                        rowClassName="product-table-row"
                        tableLayout="fixed"
                        scroll={{ x: "max-content" }}
                        pagination={false}
                        columns={columnsTransfer}
                        dataSource={dataTable}
                        summary={() => {
                          let totalQuantity = 0;
                          let totalAmount = 0;
                          let totalDifferenceAmount = 0;
                          dataTable.forEach((element: LineItem) => {
                            totalDifferenceAmount += (element.real_quantity - element.transfer_quantity) * element.price;
                            totalQuantity += element.transfer_quantity;
                            totalAmount += element.transfer_quantity * element.price;
                          });
                          return (
                          <Table.Summary fixed>
                            <Table.Summary.Row>
                              <Table.Summary.Cell align={"right"} index={1} colSpan={3}>
                                <b>Tổng số lượng:</b>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={2} >
                              </Table.Summary.Cell>

                              <Table.Summary.Cell align={"center"} index={3} >
                                <b>{totalQuantity}</b>
                              </Table.Summary.Cell>

                              <Table.Summary.Cell align={"center"} index={4}>
                                <b><NumberFormat
                                  value={totalAmount}
                                  className="foo"
                                  displayType={"text"}
                                  thousandSeparator={true}
                                /></b>
                              </Table.Summary.Cell>

                              <Table.Summary.Cell align={"center"} index={5}>
                                <b>{getTotalRealQuantity()}</b>
                              </Table.Summary.Cell>

                              <Table.Summary.Cell align={"center"} index={6}>
                                <b>
                                  <NumberFormat
                                    value={totalDifferenceAmount}
                                    className="foo"
                                    displayType={"text"}
                                    thousandSeparator={true}
                                  />
                                </b>
                              </Table.Summary.Cell>
                            </Table.Summary.Row>
                          </Table.Summary>
                        )}}
                      />
                      {
                         data?.status === STATUS_INVENTORY_TRANSFER.TRANSFERRING.status && (
                          <div className="inventory-transfer-action">
                            <AuthWrapper
                              acceptPermissions={[InventoryTransferPermission.receive]}
                              acceptStoreIds={[data.to_store_id]}
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
                                onClick={() => setIsVisibleModalReceiveWarning(true)}
                              >
                                Nhận hàng
                              </Button>
                            </AuthWrapper>

                          </div>
                       )
                      }
                    </div>
                  </Card>
                  )
                }
                <div className="inventory-transfer-action">
                  {
                    (data.status === STATUS_INVENTORY_TRANSFER.CONFIRM.status) && (
                      <AuthWrapper
                        acceptPermissions={[ShipmentInventoryTransferPermission.export]}
                        acceptStoreIds={[data.from_store_id]}
                      >
                        <Button
                          className="export-button"
                          type="primary"
                          onClick={() => {
                            if(data) dispatch(exportInventoryAction(data?.id,
                              onReload
                            ));
                          }}
                        >
                          Xuất kho
                        </Button>
                      </AuthWrapper>
                    )
                  }
                </div>
              </Col>
              <Col span={6}>
                <Card
                  title={"THÔNG TIN PHIẾU"}
                  bordered={false}
                  className={"inventory-info"}
                  extra={<Tag className={classTag}>{textTag}</Tag>}
                >
                  <Col>
                    <RowDetail title="ID Phiếu" value={data.code} />
                    <RowDetail title="Người tạo" value={data.created_by} />
                    <RowDetail
                      title="Ngày tạo"
                      value={ConvertUtcToLocalDate(
                        data.created_date,
                        "DD/MM/YYYY"
                      )}
                    />
                    <RowDetail
                      title="Ngày chuyển"
                      value={
                        data.transfer_date
                          ? ConvertUtcToLocalDate(
                              data.transfer_date,
                              "DD/MM/YYYY"
                            )
                          : " ---"
                      }
                    />
                    <RowDetail
                      title="Ngày nhận"
                      value={
                        data.receive_date
                          ? ConvertUtcToLocalDate(
                              data.receive_date,
                              "DD/MM/YYYY"
                            )
                          : " ---"
                      }
                    />
                  </Col>
                </Card>
                <Card
                  title={"GHI CHÚ"}
                  bordered={false}
                  className={"inventory-note"}
                >
                  <Row
                    className=""
                    gutter={5}
                    style={{ flexDirection: "column" }}
                  >
                    <Col span={24} style={{ marginBottom: 6 }}>
                      <b>Ghi chú nội bộ:</b>
                    </Col>
                    <Col span={24}>
                      <Form form={form}>
                        <Form.Item name="note">
                          <TextArea
                            disabled={isDisableEditNote}
                            onChange={changeNote}
                            maxLength={250}
                            placeholder="Nhập ghi chú nội bộ"
                            autoSize={{ minRows: 4, maxRows: 6 }}
                          />
                        </Form.Item>
                      </Form>
                    </Col>
                  </Row>

                  <Row
                    className="margin-top-10"
                    gutter={5}
                    style={{ flexDirection: "column" }}
                  >
                    <Col span={24} style={{ marginBottom: 6 }}>
                      <b>File đính kèm:</b>
                    </Col>
                    <Col span={24}>
                      <span className="text-focus">
                        {data.attached_files?.map(
                          (link: string, index: number) => {
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
                          }
                        )}
                      </span>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
            <BottomBarContainer
              leftComponent = {
                <div onClick={() => history.push(`${UrlConfig.INVENTORY_TRANSFERS}`)} style={{ cursor: "pointer" }}>
                  <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
                  {"Quay lại danh sách"}
                </div>
              }
              rightComponent={
                <Space>
                  <AuthWrapper
                    acceptPermissions={[InventoryTransferPermission.print]}
                  >
                    <Button onClick={() => onPrintAction('inventory_transfer_bill')}>
                      <PrinterOutlined />
                      {" In vận đơn"}
                    </Button>
                  </AuthWrapper>
                  <AuthWrapper
                    acceptPermissions={[InventoryTransferPermission.print]}
                  >
                    <Button onClick={() => onPrintAction('inventory_transfer')}>
                      <PrinterOutlined />
                      {" In phiếu chuyển"}
                    </Button>
                  </AuthWrapper>
                  {
                   (data.status === STATUS_INVENTORY_TRANSFER.CONFIRM.status && data.shipment === null) &&
                    <AuthWrapper
                      acceptPermissions={[InventoryTransferPermission.cancel]}
                    >
                      <Button danger onClick={() => setIsDeleteTicket(true)}>
                        <CloseCircleOutlined style={{ color: '#E24343' }} /> Hủy phiếu
                      </Button>
                    </AuthWrapper>
                  }
                  {
                    (data.status === STATUS_INVENTORY_TRANSFER.PENDING.status ) && (
                      <>
                        <AuthWrapper
                          acceptPermissions={[InventoryTransferPermission.balance]}
                        >
                          <Button onClick={() => {}}>
                            Kiểm kho theo sản phẩm
                          </Button>
                        </AuthWrapper>
                        {isHavePermissionQuickBalance && (
                          <AuthWrapper
                            acceptPermissions={[InventoryTransferPermission.balance]}
                          >
                            <Button type="primary" onClick={() => setIsBalanceTransfer(true)}>
                              Cân bằng nhanh
                            </Button>
                          </AuthWrapper>
                        )}
                      </>
                    )
                  }
                  {
                    (data.status === STATUS_INVENTORY_TRANSFER.CONFIRM.status) &&
                    <AuthWrapper
                      acceptPermissions={[InventoryTransferPermission.update]}
                      acceptStoreIds={[data.from_store_id]}
                    >
                      <Button
                        onClick={() => {
                          history.push(
                            `${UrlConfig.INVENTORY_TRANSFERS}/${data?.id}/update`
                          );
                        }}
                      >
                        <EditOutlined /> Sửa thông tin
                      </Button>
                    </AuthWrapper>
                  }
                  {
                    (data.status === STATUS_INVENTORY_TRANSFER.CANCELED.status) &&
                    <AuthWrapper
                      acceptPermissions={[InventoryTransferPermission.clone]}
                    >
                      <Button
                        onClick={() => history.push(`${UrlConfig.INVENTORY_TRANSFERS}/${data.id}/update?cloneId=${data.id}`)}
                      >
                        Tạo bản sao
                      </Button>
                    </AuthWrapper>
                  }
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
        {
          isVisibleModalWarning &&
          <ModalConfirm
            onCancel={() => {
              setIsVisibleModalWarning(false);
            }}
            onOk={() => {
              if (data) {
                setIsVisibleModalWarning(false);
                dispatch(cancelShipmentInventoryTransferAction(data?.id, onReload));
              }
            }}
            okText="Đồng ý"
            cancelText="Huỷ"
            title={`Bạn có muốn huỷ giao hàng?`}
            subTitle={'Sau khi nhận hàng sẽ không thể thay đổi số thực nhận.'}
            visible={isVisibleModalWarning}
          />
        }
        {
          isVisibleModalReceiveWarning &&
          <ModalConfirm
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
            subTitle={'Sau khi nhận hàng sẽ không thể thay đổi số thực nhận.'}
            visible={isVisibleModalReceiveWarning}
          />
        }
        {
          isDeleteTicket &&
          <DeleteTicketModal
            onOk={onDeleteTicket}
            onCancel={() => setIsDeleteTicket(false)}
            visible={isDeleteTicket}
            icon={WarningRedIcon}
            textStore={data?.from_store_name}
            okText="Đồng ý"
            cancelText="Thoát"
            title={`Bạn chắc chắn Hủy phiếu chuyển hàng ${data?.code}`}
          />
        }
        {
          isBalanceTransfer &&
          <InventoryTransferBalanceModal
            onOk={(result) => {
              if (result) {
                setIsBalanceTransfer(false);
                showSuccess("Cân bằng kho thành công");
                setData(result);
              }
            }}
            onCancel={() => setIsBalanceTransfer(false)}
            visible={isBalanceTransfer}
            data={data}
          />
        }
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
        {
          isVisibleInventoryShipment &&
          <InventoryShipment
            visible={isVisibleInventoryShipment}
            dataTicket={data}
            onCancel={() => setIsVisibleInventoryShipment(false)}
            onOk={item => {
              if (item){
                onReload()
              }
            }}
            infoFees={infoFees}
          />
        }
      </ContentContainer>
    </StyledWrapper>
  );
};

export default DetailTicket;
