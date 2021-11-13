import React, {
  createRef,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyledWrapper } from "./index.style";
import UrlConfig from "config/url.config";
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
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import imgDefIcon from "assets/img/img-def.svg";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { UploadOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/lib/table/interface";
import NumberInput from "component/custom/number-input.custom";
import { AiOutlineClose } from "react-icons/ai";
import TextArea from "antd/es/input/TextArea";
import PlusOutline from "assets/icon/plus-outline.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import arrowLeft from "assets/icon/arrow-back.svg";
import WarningRedIcon from "assets/icon/ydWarningRedIcon.svg";
import { useDispatch } from "react-redux";
import {
  creatInventoryTransferAction,
  deleteInventoryTransferAction,
  getCopyDetailInventoryTransferAction,
  getDetailInventoryTransferAction,
  inventoryGetDetailVariantIdsAction,
  inventoryGetSenderStoreAction,
  inventoryGetVariantByStoreAction,
  inventoryUploadFileAction,
  updateInventoryTransferAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import {
  FileUrl,
  InventoryTransferDetailItem,
  LineItem,
  StockTransferSubmit,
  Store,
} from "model/inventory/transfer";

import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse } from "model/product/product.model";
import PickManyProductModal from "../../purchase-order/modal/pick-many-product.modal";
import ProductItem from "../../purchase-order/component/product-item";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { UploadFile } from "antd/es/upload/interface";
import { findAvatar } from "utils/AppUtils";
import RowDetail from "screens/products/product/component/RowDetail";
import { useHistory, useLocation, useParams } from "react-router";
import { InventoryParams } from "../DetailTicket";
import _ from "lodash";
import DeleteTicketModal from "../common/DeleteTicketPopup";
import { Link } from "react-router-dom";
import ModalConfirm, { ModalConfirmProps } from "component/modal/ModalConfirm";
import { InventoryResponse } from "model/inventory";
import { getQueryParams, useQuery } from "utils/useQuery";
import { ConvertFullAddress } from "utils/ConvertAddress";

const { Option } = Select;

const VARIANTS_FIELD = "line_items";

const UpdateTicket: FC = () => {
  const [form] = Form.useForm();
  const [dataTable, setDataTable] = useState<Array<VariantResponse> | any>(
    [] as Array<VariantResponse>
  );

  const history = useHistory();
  const productSearchRef = createRef<CustomAutoComplete>();
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);

  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [fromStoreData, setFormStoreData] = useState<Store>();
  const [toStoreData, setToStoreData] = useState<Store>();
  const [isDeleteTicket, setIsDeleteTicket] = useState<boolean>(false);
  

  const [isVisibleModalWarning, setIsVisibleModalWarning] =
    useState<boolean>(false);
  const [initDataForm, setInitDataForm] =
    useState<InventoryTransferDetailItem | null>(null);
  const [modalConfirm, setModalConfirm] = useState<ModalConfirmProps>({
    visible: false,
  });

  const location = useLocation();
  const stateImport: any = location.state;
  
  
  const query = useQuery();
  const queryParam: any = getQueryParams(query);
  
  const CopyId = queryParam?.cloneId;

  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);

  const dispatch = useDispatch();

  const onResult = useCallback(
    (result: InventoryTransferDetailItem | false) => {
      if (!result) {
        return;
      } else {
        form.setFieldsValue(result);
        setInitDataForm(result);
        setDataTable(result.line_items);
        const listFile: any = result.attached_files?.map((item: string ) => {
          return {
            name: item,
            url: item,
          }
        });
        setFileList(listFile);
        const fileCurrent = listFile.map((item: any) => item.url);
        form.setFieldsValue({ attached_files: fileCurrent });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function onQuantityChange(quantity: number | null, index: number) {
    const dataTableClone = _.cloneDeep(dataTable);
    dataTableClone[index].transfer_quantity = quantity;

    const amountNumber = dataTableClone[index].transfer_quantity * dataTableClone[index].price;
    dataTableClone[index].amount = amountNumber;
    setDataTable(dataTableClone);
  }

  function getTotalQuantity() {
    let total = 0;
    dataTable.forEach((element: LineItem) => {
      total += element.transfer_quantity;
    });

    return total;
  }

  function onDeleteItem(index: number) {
    // delete row
    const temps = [...dataTable];
    temps.splice(index, 1);
    setDataTable(temps);
  }

  // get store
  useEffect(() => {
    if ( CopyId ) {
      dispatch(getCopyDetailInventoryTransferAction(CopyId, onResult));
    } else if (stateImport) {
      
      if (stateImport) {
        form.setFieldsValue(stateImport);
        setInitDataForm(stateImport);
        setDataTable(stateImport.line_items);
      }
    } else {
      dispatch(getDetailInventoryTransferAction(idNumber, onResult));
    }

    dispatch(
      inventoryGetSenderStoreAction(
        { status: "active", simple: true },
        setStores
      )
    );
  }, [CopyId, stateImport, dispatch, idNumber, onResult, form]);

  // validate
  const validateStore = (rule: any, value: any, callback: any): void => {
    if (value) {
      const from_store_id = form.getFieldValue("from_store_id");
      const to_store_id = form.getFieldValue("to_store_id");
      if (from_store_id === to_store_id) {
        callback(`Kho gửi không được trùng với kho nhận`);
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  const [resultSearch, setResultSearch] = useState<
    PageResponse<VariantResponse> | any
  >();

  const onSearchProduct = (value: string) => {
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
  };

  const renderResult = useMemo(() => {
    let options: any[] = [];
    resultSearch?.items?.forEach((item: VariantResponse, index: number) => {
      options.push({
        label: <ProductItem data={item} key={item.id.toString()} />,
        value: item.id.toString(),
      });
    });
    return options;
  }, [resultSearch]);

  const onSelectProduct = (value: string) => {
    const dataTemp = [...dataTable];
    const selectedItem = resultSearch?.items?.find(
      (variant: VariantResponse) => variant.id.toString() === value
    );
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
      available: selectedItem.available,
      amount: 0,
      price: variantPrice,
      transfer_quantity: 0,
      weight: selectedItem?.weight ? selectedItem?.weight : 0,
      weight_unit: selectedItem?.weight_unit ? selectedItem?.weight_unit : "",
    };

    if (
      !dataTemp.some(
        (variant: VariantResponse) => variant.variant_id === newResult.variant_id
      )
    ) {
      setDataTable((prev: any) => prev.concat([newResult]));
    }
  };

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
      let fileCurrent: Array<FileUrl> = form.getFieldValue("attached_files");
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
        showSuccess("Đổi dữ liệu thành công");
        history.push(`${UrlConfig.INVENTORY_TRANSFER}/${result.id}`);
      }
      else {
        setIsLoading(false);

      }
    },
    [history]
  );  

  const onChangeFromStore = useCallback(
    (storeData: Store) => {
      setModalConfirm({
        visible: true,
        okText: "Đồng ý",
        title: "Bạn có chắc thay đổi Kho gửi?",
        cancelText: "Hủy",
        subTitle: `Thay đổi kho gửi sẽ tính toán lại tồn kho ${fromStoreData?.name ? fromStoreData?.name : initDataForm?.from_store_name}.`,
        onCancel: () => {
          setModalConfirm({ visible: false });
          form.setFieldsValue({ from_store_id: fromStoreData ? fromStoreData.id : initDataForm?.from_store_id });
        },
        onOk: () => {
          setFormStoreData(storeData);
          const variants_id = dataTable?.map((item: VariantResponse) => {
            return item.id ? item.id : item.variant_id;
          });
      
          if (variants_id?.length > 0) {
            setIsLoadingTable(true);
            dispatch(
              inventoryGetDetailVariantIdsAction(variants_id, storeData.id, (result: Array<InventoryResponse> | null) => {
                if (result && result.length > 0) {
                  
                  setModalConfirm({ visible: false });
                  setIsLoadingTable(false);
                  const newDataTable = dataTable.map((itemOld: VariantResponse) => {
                    let newAvailable;
                    result?.forEach((itemNew) => {
                      if (itemNew.variant_id === itemOld.id) {
                        newAvailable = itemNew.available;
                      }
                    });
                    return {
                      ...itemOld,
                      available: newAvailable,
                    };
                  });
                  setDataTable(newDataTable);
                } else {
                  setModalConfirm({ visible: false });
                  setIsLoadingTable(false);
                  setDataTable([]);
                }
              })
            );
          } else {
            setModalConfirm({ visible: false })
          }
        },
      });
    }, [dataTable, dispatch, form, fromStoreData, initDataForm]
  );

  const onFinish = useCallback((data: StockTransferSubmit) => {
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
      setHasError(true);
      return;
    } 
  
    if (CopyId || stateImport) {
      const dataCreate: any= {}
      stores.forEach((store) => {
        if (store.id === Number(data.from_store_id)) {
          dataCreate.store_transfer = {
            store_id: store.id,
            hotline: store.hotline,
            address: store.address,
            name: store.name,
            code: store.code,
          };
        }
        if (store.id === Number(data.to_store_id)) {
          dataCreate.store_receive = {
            store_id: store.id,
            hotline: store.hotline,
            address: store.address,
            name: store.name,
            code: store.code,
          };
        }
      });
      
      if (dataTable.length === 0) {
        showError("Vui lòng chọn sản phẩm");
        return;
      }
      
      dataCreate.line_items = dataTable.map((item: any) => {
        return {
          sku: item.sku,
          barcode: item.barcode,
          variant_name: item.variant_name,
          variant_id: item.variant_id,
          variant_image: item.variant_image,
          product_name: item.product_name,
          product_id: item.product_id,
          available: item.available,
          transfer_quantity: item.transfer_quantity,
          amount: item.price * item.transfer_quantity,
          price: item.price,
          weight: item.weight,
          weight_unit: item.weight_unit
        };
      }); 

      dataCreate.note = data.note;
      dataCreate.attached_files = data.attached_files;
      setIsLoading(true);
      dispatch(creatInventoryTransferAction(dataCreate, createCallback));
    }
    else {
      if (stores) {
        stores.forEach((store) => {
          if (store.id === Number(data.from_store_id)) {
            data.store_transfer = {
              id: initDataForm?.store_transfer?.id,
              store_id: store.id,
              hotline: store.hotline,
              address: store.address,
              name: store.name,
              code: store.code,
            };
          }
          if (store.id === Number(data.to_store_id)) {
            data.store_receive = {
              id: initDataForm?.store_receive?.id,
              store_id: store.id,
              hotline: store.hotline,
              address: store.address,
              name: store.name,
              code: store.code,
            };
          }
        });
      }
      
      if (dataTable.length === 0) {
        showError("Vui lòng chọn sản phẩm");
        return;
      }
      data.line_items = dataTable;
      delete data.from_store_id;
      delete data.to_store_id;
      if (initDataForm) {
        setIsLoading(true);
        dispatch(updateInventoryTransferAction(initDataForm.id, data, createCallback));
      }
    }
  },[CopyId, createCallback, dataTable, dispatch, initDataForm, stateImport, stores]);

  const checkError = (index: number) => {
    const thisInput = document.getElementById(`item-quantity-${index}`);

    if (dataTable[index].transfer_quantity === 0) {
      showError("Số lượng phải lớn hơn 0");
      if (thisInput) thisInput.style.borderColor = "red";
      setHasError(true);
    } else if (
      dataTable[index].transfer_quantity >
      (dataTable[index].available ? dataTable[index].available : 0)
    ) {
      showError("Không đủ tồn kho gửi");
      if (thisInput) thisInput.style.borderColor = "red";
      setHasError(true);
    } else {
      if (thisInput) thisInput.style.borderColor = "unset";
      setHasError(false);
    }
    let countError = 0;

    dataTable?.forEach((element: VariantResponse, index: number) => {
      const thisInput = document.getElementById(`item-quantity-${index}`);
      if (!element.transfer_quantity) {
        if (thisInput) thisInput.style.borderColor = "red";
        countError++;
        setHasError(true);
      } else if (element.transfer_quantity === 0) {
        if (thisInput) thisInput.style.borderColor = "red";
        countError++;
        setHasError(true);
      } else if (
        element.transfer_quantity > (element.available ? element.available : 0)
      ) {
        if (thisInput) thisInput.style.borderColor = "red";
        countError++;
        setHasError(true);
      } else {
        if (thisInput) thisInput.style.borderColor = "unset";
        setHasError(false);
      }
    }, () => {
      if (countError > 0) {
        
        setHasError(true);
      }
    });
    
  };
  
  const onDeleteTicket = (value: string | undefined) => {
    dispatch(
      deleteInventoryTransferAction(
        idNumber,
        {note: value ? value : ""},
        (result: InventoryTransferDetailItem | false) => {
          if (!result) {
            return;
          } else {
            history.push(`${UrlConfig.INVENTORY_TRANSFER}`);
          }
        }
      )
    );
  };

  useEffect(() => {
    if (dataTable.length === 0) {
      setHasError(true);
    }

    let countError = 0;
    dataTable?.forEach((element: VariantResponse, index: number) => {
      const thisInput = document.getElementById(`item-quantity-${index}`);
      if (!element.transfer_quantity) {
        if (thisInput) thisInput.style.borderColor = "red";
        countError++;
      } else if (element.transfer_quantity === 0) {
        if (thisInput) thisInput.style.borderColor = "red";
        countError++;
      } else if (
        element.transfer_quantity > (element.available ? element.available : 0)
      ) {
        countError++;
        if (thisInput) thisInput.style.borderColor = "red";
      } else {
        if (thisInput) thisInput.style.borderColor = "unset";
        setHasError(false);
      }
    }, () => {
      if (countError > 0) {
        setHasError(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataTable, hasError]);

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
      render: (_: string, row, index) => (
        <Button
          onClick={() => onDeleteItem(index)}
          className="product-item-delete"
          icon={<AiOutlineClose />}
        />
      ),
    },
  ];

  return (
    <StyledWrapper>
      <ContentContainer
        title={ (CopyId || stateImport) ? 'Thêm mới Phiếu chuyển hàng' : `Sửa phiếu chuyển hàng ${initDataForm? initDataForm.code : ''}`}
        breadcrumb={(CopyId || stateImport) ? [] : [
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          { 
            name: "Chuyển hàng",
            path: `${UrlConfig.INVENTORY_TRANSFER}`,
          },
          {
            name: `${initDataForm? initDataForm.code : ''}`,
          },
        ]}
      >
        {initDataForm && (
          <Form form={form} onFinish={onFinish} scrollToFirstError={true}>
            <Form.Item noStyle hidden name="version">
              <Input />
            </Form.Item>  
            <Form.Item noStyle hidden name="store_transfer">
              <Input />
            </Form.Item>
            <Form.Item noStyle hidden name="store_receive">
              <Input />
            </Form.Item>
            <Row gutter={24}>
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
                          showSearch
                          optionFilterProp="children"
                          onChange={(value: number) => {
                            stores.forEach((element) => {
                              if (element.id === value) {                                
                                onChangeFromStore(element);
                              }
                            });
                          }}
                        >
                          {Array.isArray(stores) &&
                            stores.length > 0 &&
                            stores.map((item, index) => (
                              <Option
                                key={"from_store_id" + index}
                                value={item.id}
                              >
                                {item.name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      {fromStoreData ? (
                        <>
                          <RowDetail title="Mã CH" value={fromStoreData.code} />
                          <RowDetail
                            title="SĐT"
                            value={fromStoreData.hotline}
                          />
                          <RowDetail
                            title="Địa chỉ"
                            value={ConvertFullAddress(fromStoreData)}
                          />
                        </>
                      ) : (
                        <>
                          <RowDetail
                            title="Mã CH"
                            value={initDataForm.from_store_code?.toString()}
                          />
                          <RowDetail
                            title="SĐT"
                            value={initDataForm.from_store_phone?.toString()}
                          />
                          <RowDetail
                            title="Địa chỉ"
                            value={ConvertFullAddress(initDataForm.store_transfer)}
                          />
                        </>
                      )}
                    </Col>{" "}
                    <Col span={12}>
                      <Form.Item
                        name="to_store_id"
                        label={<b>Kho nhận</b>}
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
                          showSearch
                          optionFilterProp="children"
                          onChange={(value: number) => {
                            stores.forEach((element) => {
                              if (element.id === value) {
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
                                value={item.id}
                              >
                                {item.name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                      {toStoreData ? (
                        <>
                          <RowDetail title="Mã CH" value={toStoreData.code} />
                          <RowDetail title="SĐT" value={toStoreData.hotline} />
                          <RowDetail
                            title="Địa chỉ"
                            value={ConvertFullAddress(toStoreData)}
                          />
                        </>
                      ) : (
                        <>
                          <RowDetail
                            title="Mã CH"
                            value={initDataForm.to_store_code?.toString()}
                          />
                          <RowDetail
                            title="SĐT"
                            value={initDataForm.to_store_phone?.toString()}
                          />
                          <RowDetail
                            title="Địa chỉ"
                            value={ConvertFullAddress(initDataForm.store_receive)}
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
                      <CustomAutoComplete
                        id="#product_search_variant"
                        dropdownClassName="product"
                        placeholder="Tìm kiếm Mã vạch, Mã sản phẩm, Tên sản phẩm"
                        onSearch={onSearchProduct}
                        dropdownMatchSelectWidth={456}
                        style={{ width: "100%" }}
                        showAdd={true}
                        textAdd="Thêm mới sản phẩm"
                        onSelect={onSelectProduct}
                        options={renderResult}
                        ref={productSearchRef}
                      />
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
                      placeholder=" "
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
                  
                  {(!CopyId || !stateImport) && <Button onClick={() => setIsDeleteTicket(true)}>Huỷ phiếu</Button>}
                  
                  <Button
                    disabled={hasError || isLoading}
                    htmlType={"submit"}
                    type="primary"
                    loading={isLoading}
                  >
                    {(CopyId || stateImport) ? 'Tạo' : 'Lưu'}
                  </Button>
                </Space>
              }
            />
            {visibleManyProduct && (
              <PickManyProductModal
                isTransfer
                storeID={form.getFieldValue("from_store_id")}
                selected={[]}
                onSave={onPickManyProduct}
                onCancel={() => setVisibleManyProduct(false)}
                visible={visibleManyProduct}
              />
            )}
          </Form>
        )}
        <ModalConfirm {...modalConfirm} />
        {
          isDeleteTicket &&
          <DeleteTicketModal
            onOk={onDeleteTicket}
            onCancel={() => setIsDeleteTicket(false)}
            visible={isDeleteTicket}
            icon={WarningRedIcon}
            textStore={initDataForm?.from_store_name}
            okText="Đồng ý"
            cancelText="Thoát"
            title={`Bạn chắc chắn Hủy phiếu chuyển hàng ${initDataForm?.code}`}
          />
        }
        {
          isVisibleModalWarning && 
          <ModalConfirm
            onCancel={() => {
              setIsVisibleModalWarning(false);
            }}
            onOk={() => history.push(`${UrlConfig.INVENTORY_TRANSFER}/${idNumber}`)}
            okText="Đồng ý"
            cancelText="Tiếp tục"
            title={`Bạn có muốn rời khỏi trang?`}
            subTitle="Thông tin trên trang này sẽ không được lưu."
            visible={isVisibleModalWarning}
          />
        }
      </ContentContainer>
    </StyledWrapper>
  );
};

export default UpdateTicket;
