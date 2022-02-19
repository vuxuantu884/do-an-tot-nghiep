import React, {
  createRef,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import './index.scss'
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
import { useDispatch } from "react-redux";
import {
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
import { InventoryResponse } from "model/inventory";  
import { callApiNative } from "utils/ApiUtils";
import { getAccountDetail } from "service/accounts/account.service";
import { getStoreApi } from "service/inventory/transfer/index.service";import {
  AccountStoreResponse
} from "model/account/account.model";
import { RegUtil } from "utils/RegUtils"; 
import { getVariantByBarcode } from "service/product/variant.service";
import { RefSelectProps } from "antd/lib/select";

const { Option } = Select;

let barCode = "";

const VARIANTS_FIELD = "line_items";

const CreateTicket: FC = () => { 
  const [fromStores,setFromStores] = useState<Array<AccountStoreResponse>>();
  const [form] = Form.useForm();
  const [quantityInput, setQuantityInput] = useState<any>({});
  const [dataTable, setDataTable] = useState<Array<VariantResponse> | any>(
    [] as Array<VariantResponse>
  );

  const productSearchRef = React.useRef<any>(null);
  const history = useHistory();
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);

  const [fromStoreData, setFormStoreData] = useState<Store>();
  const [toStoreData, setToStoreData] = useState<Store>();
  const [keySearch, setKeySearch] = useState<string>("");
  const productAutoCompleteRef = createRef<RefSelectProps>();

  const [isVisibleModalWarning, setIsVisibleModalWarning] =
    useState<boolean>(false);

  function onQuantityChange(quantity: number | null, index: number) {
    const dataTableClone = _.cloneDeep(dataTable);
    dataTableClone[index].transfer_quantity = quantity;

    const amountNumber = dataTableClone[index].transfer_quantity * dataTableClone[index].price;
    dataTableClone[index].amount = amountNumber;
    
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
    variantField?.forEach(
      (row: VariantResponse, index: number, array: VariantResponse[]) => {
        if (row.id === variantId) {
          array.splice(index, 1);
        }
      }
    );
    //delete state manage input value
    delete quantityInput[variantId];
  }

  const dispatch = useDispatch();

  const getMe = useCallback(async ()=>{
    const res = await callApiNative({isShowLoading: false},dispatch,getAccountDetail);
    if (res && res.account_stores) { 
      setFromStores(res.account_stores);
    }
  },[dispatch]);

  const getStores = useCallback(async ()=>{
    const res = await callApiNative({isShowLoading: false},dispatch,getStoreApi,{ status: "active", simple: true });
    if (res) {
      setStores(res);
    }
  },[dispatch]);

  // get store
  useEffect(() => {
    getStores();
    getMe();

  }, [dispatch, getMe, getStores]);

  // validate
  const validateStore = useCallback((rule: any, value: any, callback: any): void => {
    if (value) {
      const from_store_id = form.getFieldValue("from_store_id");
      const to_store_id = form.getFieldValue("to_store_id");

      if (from_store_id && to_store_id && (from_store_id.toString() === to_store_id.toString())) {
        callback(`Kho gửi và kho nhận không được trùng nhau`);
      } else {
        form.setFields([
          {
            name: "to_store_id",
            errors: []
          },
          {
            name: "from_store_id",
            errors: []
          }
        ])
        callback();
      }
    }
  },[form]);

  const [resultSearch, setResultSearch] = useState<
    PageResponse<VariantResponse> | any
  >();

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
            setResultSearch
          )
        );
      }
  },[dispatch, setResultSearch, form]);

  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  
  const renderResult = useMemo(() => {
    let options: any[] = [];
    resultSearch?.items?.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem isTransfer data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    
    return options;
  }, [resultSearch]); 

  const onSearch = useCallback((value: string)=>{ 
    setKeySearch(value);
  },[setKeySearch]);

  const onSelectProduct = useCallback((value: string, item?: VariantResponse) => {
    let dataTemp = [...dataTable]; 

    let selectedItem = resultSearch?.items?.find(
      (variant: VariantResponse) => variant.id.toString() === value
    );

    if (item) 
      selectedItem = item;

    if (
      !dataTemp.some(
        (variant: VariantResponse) => variant.id === selectedItem.id
      )
    ) {
      setDataTable((prev: any) => prev.concat([{...selectedItem, transfer_quantity: 1}]));
    }else{
      dataTemp?.forEach((e: VariantResponse) => {
        if (e.id === selectedItem.id) {
          e.transfer_quantity += 1;
        }
      })
      setDataTable(dataTemp);
    }
  },[resultSearch, dataTable]);

  const onPickManyProduct = (result: Array<VariantResponse>) => {
    const newResult = result?.map((item) => {
      return {
        ...item,
        transfer_quantity: 1,
      };
    });

    const dataTemp = [...dataTable, ...newResult];

    const arrayUnique = [
      ...new Map(dataTemp.map((item) => [item.id, item])).values(),
    ];

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
        inventoryUploadFileAction(
          { files: files },
          (data: false | Array<string>) => {
            let index = fileList.findIndex((item) => item.uid === uuid);
            if (!!data) {
              if (index !== -1) {
                fileList[index].status = "done";
                fileList[index].url = data[0];
                let fileCurrent: Array<string> =
                  form.getFieldValue("attached_files");
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
          }
        )
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
      // setLoadingSaveButton(false);
      if (result) {
        setIsLoading(false);
        showSuccess("Thêm mới dữ liệu thành công");
        history.push(`${UrlConfig.INVENTORY_TRANSFERS}/${result.id}`);
      } else {
        setIsLoading(false);
      }
    },
    [history]
  );

  const onResultGetDetailVariantIds = useCallback( result => {    
    if (result) {
      setIsLoadingTable(false);
      const newDataTable = dataTable.map((itemOld: VariantResponse) => {
        let newAvailable, newOnHand; 
        result?.forEach((itemNew: InventoryResponse) => {
          if (itemNew.variant_id === itemOld.id) {
            newAvailable = itemNew.available;
            newOnHand = itemNew.on_hand;
          }
        });
        return {  
          ...itemOld,
          available: newAvailable,
          on_hand: newOnHand,
        };
      });
      
      setDataTable(newDataTable);
    } else {
      setIsLoadingTable(false);
      setDataTable([]);
      setQuantityInput({});
      form.setFieldsValue({ [VARIANTS_FIELD]: [] });
    }
  }, [dataTable, form])

  const onChangeFromStore = (storeId: number) => { 
    const variants_id = dataTable?.map((item: VariantResponse) => item.id);

    if (variants_id?.length > 0) {
      setIsLoadingTable(true);     
      dispatch(
        inventoryGetDetailVariantIdsAction(variants_id, storeId, onResultGetDetailVariantIds)
      );
    }
  };

  const onFinish = (data: StockTransferSubmit) => {
    let countError = 0;
    let arrError: Array<string> = [];
    dataTable?.forEach((element: VariantResponse, index: number) => {
      const thisInput = document.getElementById(`item-quantity-${index}`);
      if (!element.transfer_quantity) {
        if (thisInput) thisInput.style.borderColor = "red";
        countError++;
        arrError.push(`${index + 1}`);
      } else if (element.transfer_quantity === 0) {
        if (thisInput) thisInput.style.borderColor = "red";
        countError++;
        arrError.push(`${index + 1}`);
      } else if (
        element.transfer_quantity > (element.available ? element.available : 0)
      ) {
        if (thisInput) thisInput.style.borderColor = "red";
        arrError.push(`${index + 1}`);
        countError++;
      } else {
        if (thisInput) thisInput.style.borderColor = "unset";
      }
    });
    

    if (countError > 0) {
      showError(`Vui lòng kiểm tra lại số lượng sản phẩm ${arrError?.toString()}`);
      return;
    } 

    stores.forEach((store) => {
      if (store?.id === Number(data?.from_store_id)) {
        data.store_transfer = {
          store_id: store?.id,
          hotline: store?.hotline,
          address: store?.address,
          name: store?.name,
          code: store?.code,
        };
      }
      if (store?.id === Number(data?.to_store_id)) {
        data.store_receive = {
          store_id: store?.id,
          hotline: store?.hotline,
          address: store?.address,
          name: store?.name,
          code: store?.code,
        };
      }
    });

    const dataLineItems = form.getFieldValue(VARIANTS_FIELD);
    if (dataLineItems.length === 0) {
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
        weight_unit: item.weight_unit
      };
    });

    delete data.from_store_id;
    delete data.to_store_id;
    
    setIsLoading(true);
    dispatch(creatInventoryTransferAction(data, createCallback));
  };

  const checkError = (index: number) => {
    const dataLineItems = form.getFieldValue(VARIANTS_FIELD);
    const thisInput = document.getElementById(`item-quantity-${index}`);

    if (dataLineItems[index].transfer_quantity === 0) {
      showError("Số lượng phải lớn hơn 0");
      if (thisInput) thisInput.style.borderColor = "red";
    } else if (
      dataLineItems[index].transfer_quantity >
      (dataLineItems[index].available ? dataLineItems[index].available : 0)
    ) {
      showError("Không đủ tồn kho gửi");
      if (thisInput) thisInput.style.borderColor = "red";
    } else {
      if (thisInput) thisInput.style.borderColor = "unset";
    }
    
    dataLineItems?.forEach((element: VariantResponse, index: number) => {
      const thisInput = document.getElementById(`item-quantity-${index}`);
      if (!element.transfer_quantity) {
        if (thisInput) thisInput.style.borderColor = "red";
      } else if (element.transfer_quantity === 0) {
        if (thisInput) thisInput.style.borderColor = "red";
      } else if (
        element.transfer_quantity > (element.available ? element.available : 0)
      ) {
        if (thisInput) thisInput.style.borderColor = "red";
      } else {
        if (thisInput) thisInput.style.borderColor = "unset";
      }
    });
  };

  const isError = useMemo(()=>{ 
    if (!fromStoreData || !toStoreData || (fromStoreData.id === toStoreData.id))  return true
    let error = false;

    if (dataTable.length === 0) {
      return true
    }

    dataTable?.forEach((element: VariantResponse, index: number) => {
      if (!element.transfer_quantity || element.transfer_quantity === 0 || (element.transfer_quantity > (element.available ? element.available : 0))) {
        error= true
      } 
    });
    
    return error;
  },[toStoreData, fromStoreData, dataTable])

  useEffect(() => {
    dataTable?.forEach((element: VariantResponse, index: number) => {
      const thisInput = document.getElementById(`item-quantity-${index}`);
      if (!element.transfer_quantity) {
        if (thisInput) thisInput.style.borderColor = "red";
      } else if (element.transfer_quantity === 0) {
        if (thisInput) thisInput.style.borderColor = "red";
      } else if (
        element.transfer_quantity > (element.available ? element.available : 0)
      ) {
        if (thisInput) thisInput.style.borderColor = "red";
      } else {
        if (thisInput) thisInput.style.borderColor = "unset";
      }
    });
  
  }, [dataTable]);   
  
  const eventKeydown = useCallback(
     (event: KeyboardEvent) => {
      const handleSearchProduct = async (keyCode: string, code: string) => { 
        if (keyCode === "Enter" && code){ 
          setKeySearch("");  
          barCode ="";  
          
          if (RegUtil.BARCODE_NUMBER.test(code) && event) {
            const storeId = form.getFieldValue("from_store_id");
            if (!storeId) {
              showError("Vui lòng chọn kho gửi");
              return;
            }
            const item  = await callApiNative({isShowLoading: false}, dispatch, getVariantByBarcode,code);
            if (item && item.id) { 
              // if (!item.available || item.available === 0) {
              //   showError("Không đủ tồn kho gửi");
              //   return;
              // }  
              onSelectProduct(item.id.toString(),item); 
            }else{ 
              showError("Không tìm thấy sản phẩm");
            }
          }
        } 
        else{
          const txtSearchProductElement: any =
            document.getElementById("product_search_variant");

          onSearchProduct(txtSearchProductElement?.value); 
        } 
      };

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
    [onSelectProduct,form, dispatch, onSearchProduct]
  );

  const onSelect = useCallback((o,v)=>{
    onSelectProduct(o);
  },[onSelectProduct])

  useEffect(() => { 
      window.addEventListener("keydown", eventKeydown);
      return () => {
        window.removeEventListener("keydown", eventKeydown);
      };
  }, [eventKeydown]);  
  
  const columns: ColumnsType<any> = [
    {
      title: "STT",
      align: "center",
      width: "50px",
      render: (value: string, record: PurchaseOrderLineItem, index: number) =>
        index + 1,
    },
    {
      title: "Ảnh",
      width: "60px",
      dataIndex: "variant_images",
      render: (value: Array<VariantImage>, record: string[]) => {
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
      render: (value: string, record: PurchaseOrderLineItem, index: number) => (
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
      title: "Tồn trong kho",
      dataIndex: "on_hand",
      align: "center",
      width: 100,
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: "Có thể bán",
      dataIndex: "available",
      align: "center",
      width: 100,
      render: (value) => {
        return value || 0;
      },
    },
    {
      title: "Số lượng",
      width: 100,
      align: "center",
      dataIndex: "transfer_quantity",
      key: "quantity",

      render: (value, row, index) => (
        <React.Fragment>
          <Form.Item noStyle name={VARIANTS_FIELD} hidden>
            <Input />
          </Form.Item>

          <NumberInput
            isFloat={false}
            id={`item-quantity-${index}`}
            min={0}
            value={value}
            onChange={(quantity) => {
              onQuantityChange(quantity, index);
            }}
            onBlur={() => {
              checkError(index);
            }}
          />
        </React.Fragment>
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
        title="Thêm mới phiếu chuyển hàng"
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
              <Card
                title="KHO HÀNG"
                bordered={false}
                className={"inventory-selectors"}
              >
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
                              setFormStoreData(element);
                              onChangeFromStore(element.id);
                            }
                          });
                        }}
                      >
                        {fromStores &&
                          fromStores.map((item, index) => (
                            <Option
                              key={"from_store_id" + index}
                              value={item.store_id || 0}
                            >
                              {item.store}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                    {fromStoreData && (
                      <>
                        <RowDetail title="Mã CH" value={fromStoreData.code} />
                        <RowDetail title="SĐT" value={fromStoreData.hotline} />
                        <RowDetail
                          title="Địa chỉ"
                          value={ConvertFullAddress(fromStoreData)}
                        />
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
                          stores.forEach((element) => {
                            if (element.id === parseInt(value)) {
                              setToStoreData(element);
                            }
                          });
                        }}
                      >
                        {Array.isArray(stores) &&
                          stores.length > 0 &&
                          stores.map((item, index) => (
                            <Option
                              key={"to_store_id" + index}
                              value={item.id.toString()}
                            >
                              {item.name}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                    {toStoreData && (
                      <>
                        <RowDetail title="Mã CH" value={toStoreData.code} />
                        <RowDetail title="SĐT" value={toStoreData.hotline} />
                        <RowDetail
                          title="Địa chỉ"
                          value={ConvertFullAddress(toStoreData)}
                        />
                      </>
                    )}
                  </Col>
                </Row>
              </Card>

              <Card
                title="THÔNG TIN SẢN PHẨM"
                bordered={false}
                className={"product-detail"}
              >
                <div>
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
                    <Button
                      onClick={() => {
                        if (form.getFieldValue("from_store_id")) {
                          setVisibleManyProduct(true);
                          return;
                        }
                        showError("Vui lòng chọn kho gửi");
                      }}
                      style={{ width: 132, marginLeft: 10 }}
                      icon={<img src={PlusOutline} alt="" />}
                    >
                      &nbsp;&nbsp; Chọn nhiều
                    </Button>
                  </Input.Group>
                  {/*table*/}
                  <Table
                    className="inventory-table"
                    rowClassName="product-table-row"
                    tableLayout="fixed"
                    scroll={{ y: 300 }}
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
              <Card
                title={"GHI CHÚ"}
                bordered={false}
                className={"inventory-note"}
              >
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
            leftComponent = {
              <div onClick={() => setIsVisibleModalWarning(true)} style={{ cursor: "pointer" }}>
                <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
                {"Quay lại danh sách"}
              </div>
            }
            rightComponent={
              <Space>
                <Button loading={isLoading} disabled={isError || isLoading} htmlType={"submit"} type="primary">
                  Tạo phiếu
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
          {
            isVisibleModalWarning && 
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
          }
        </Form>
      </ContentContainer>
  );
}; 

export default CreateTicket;
