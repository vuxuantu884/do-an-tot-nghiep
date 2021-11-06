import {createRef, FC, useCallback, useEffect, useMemo, useState} from "react";
import {StyledWrapper} from "./styles";
import UrlConfig, {BASE_NAME_ROUTER} from "config/url.config";
import ContentContainer from "component/container/content.container";
import {Button, Card, Col, Form, Input, Row, Select, Space, Upload, Empty} from "antd";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import arrowLeft from "assets/icon/arrow-back.svg";
import imgDefIcon from "assets/img/img-def.svg";
import {SearchOutlined, UploadOutlined} from "@ant-design/icons";
import {ColumnsType} from "antd/lib/table/interface";
import TextArea from "antd/es/input/TextArea";
import PlusOutline from "assets/icon/plus-outline.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import {useDispatch} from "react-redux";
import {
  inventoryGetSenderStoreAction,
  inventoryGetVariantByStoreAction,
  inventoryUploadFileAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import {Store} from "model/inventory/transfer";
import {
  InventoryAdjustmentDetailItem,
  LineItemAdjustment,
} from "model/inventoryadjustment";

import {PageResponse} from "model/base/base-metadata.response";
import {VariantImage, VariantResponse} from "model/product/product.model";
import PickManyProductModal from "../../purchase-order/modal/pick-many-product.modal";
import ProductItem from "../../purchase-order/component/product-item";
import {showError, showSuccess, showWarning} from "utils/ToastUtils";
import {UploadRequestOption} from "rc-upload/lib/interface";
import {UploadFile} from "antd/es/upload/interface";
import {findAvatar} from "utils/AppUtils";
import {useHistory} from "react-router";
import ModalConfirm from "component/modal/ModalConfirm";
import {ConvertFullAddress} from "utils/ConvertAddress";
import CustomSelect from "component/custom/select.custom";
import {AccountSearchAction} from "domain/actions/account/account.action";
import {AccountResponse} from "model/account/account.model";
import NumberInput from "component/custom/number-input.custom";
import _, {parseInt} from "lodash";
import {createInventoryAdjustmentAction} from "domain/actions/inventory/inventory-adjustment.action";
import {Link} from "react-router-dom";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import CustomDatePicker from "component/custom/date-picker.custom";
import {INVENTORY_AUDIT_TYPE_CONSTANTS} from "../constants";
import CustomPagination from "component/table/CustomPagination";
import {AiOutlineClose} from "react-icons/ai";
import InventoryAdjustmentTimeLine from "../DetailInvetoryAdjustment/conponents/InventoryAdjustmentTimeLine";
import {DATE_FORMAT} from "utils/DateUtils";

const {Option} = Select;

const VARIANTS_FIELD = "line_items";

type SearchQueryVariant = {
  status: string;
  limit: number;
  page: number;
  store_ids: number | 0;
};

export interface Summary {
  TotalExcess: number | 0;
  TotalMiss: number | 0;
  TotalOnHand: number | 0;
  TotalRealOnHand: number | 0;
}

const CreateInventoryAdjustment: FC = () => {
  const [form] = Form.useForm();
  const [dataTable, setDataTable] = useState<Array<LineItemAdjustment> | any>(
    [] as Array<LineItemAdjustment>
  );
  const [searchVariant, setSearchVariant] = useState<Array<LineItemAdjustment>>(
    [] as Array<LineItemAdjustment>
  );
  const [keySearch, setKeySearch] = useState<string>("");
  const history = useHistory();
  const productSearchRef = createRef<CustomAutoComplete>();
  const [visibleManyProduct, setVisibleManyProduct] = useState<boolean>(false);
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [auditType, setAuditType] = useState<string>("");
  const [adjustStoreIdBak, setAdjustStoreIdBak] = useState<number | null>(null);

  const [formStoreData, setFormStoreData] = useState<Store | null>();
  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);
  const [isShowModalChangeStore, setIsShowModalChangeStore] = useState<boolean>(false);

  const [objSummaryTable, setObjSummaryTable] = useState<Summary>({
    TotalExcess: 0,
    TotalMiss: 0,
    TotalOnHand: 0,
    TotalRealOnHand: 0,
  });

  const lstAudiTypes = [
    {
      key: "total",
      name: "Toàn bộ",
    },
    {
      key: "partly",
      name: "Một phần",
    },
  ];

  const [dataVariantByStoreId, setVariantByStoreId] =
    useState<PageResponse<VariantResponse> | null>(null);
  const [query, setQuery] = useState<SearchQueryVariant>({
    status: "active",
    page: 1,
    limit: 10,
    store_ids: 0,
  });

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  }, []);

  const dispatch = useDispatch();

  const onFinish = (data: InventoryAdjustmentDetailItem) => {
    const storeCurr = stores.find(
      (e) => e.id.toString() === data.adjusted_store_id.toString()
    );
    data.adjusted_store_name = storeCurr ? storeCurr.name : null;
    const dataLineItems = form.getFieldValue(VARIANTS_FIELD);

    if (dataLineItems.length === 0) {
      showError("Vui lòng chọn sản phẩm");
      return;
    }
    data.line_items = dataLineItems.map((item: LineItemAdjustment) => {
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
      };
    });

    setIsLoading(true);
    dispatch(createInventoryAdjustmentAction(data, createCallback));
  };

  const onChangeAuditType = useCallback(
    (auditType: string) => {
      if (!form.getFieldValue("adjusted_store_id")) {
        showError("Vui lòng chọn kho kiểm");
        form.setFieldsValue({audit_type: null});
        return false;
      }

      setAuditType(auditType);
    },
    [form]
  );

  // get store
  useEffect(() => {
    if (form.getFieldValue("adjusted_store_id")) {
      dispatch(
        inventoryGetVariantByStoreAction(query, (res) => {
          setVariantByStoreId(res);
        })
      );
    }
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(inventoryGetSenderStoreAction({status: "active", simple: true}, setStores));
  }, [dispatch, auditType, setDataAccounts, query, form]);

  const [resultSearch, setResultSearch] = useState<PageResponse<VariantResponse> | any>();

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
          setResultSearch
        )
      );
    }
  };

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

  const drawColumns = useCallback((data: Array<LineItemAdjustment>) => {
    let totalExcess = 0,
      totalMiss = 0,
      totalQuantity = 0,
      totalReal = 0;
    data?.forEach((element: LineItemAdjustment) => {
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
      TotalOnHand: totalQuantity,
      TotalExcess: totalExcess,
      TotalMiss: totalMiss,
      TotalRealOnHand: totalReal,
    });
  }, []);

  const onSelectProduct = useCallback((value: string) => {
    const dataTemp = [...dataTable];
    const selectedItem = resultSearch?.items?.find(
      (variant: VariantResponse) => variant.id.toString() === value
    );

    if (!dataTemp.some((variant: VariantResponse) => variant.id === selectedItem.id)) {
      drawColumns(dataTable.concat([{...selectedItem, variant_name: selectedItem.name, real_on_hand: 0}]));

      setDataTable((prev: Array<LineItemAdjustment>) =>
        prev.concat([{...selectedItem, variant_name: selectedItem.name,real_on_hand: 0}])
      );
      setSearchVariant((prev: Array<LineItemAdjustment>) =>
        prev.concat([{...selectedItem, variant_name: selectedItem.name,real_on_hand: 0}])
      );
      setHasError(false); 
    } 
  },[dataTable,resultSearch,drawColumns]);

  const onPickManyProduct = (result: Array<VariantResponse>) => {
    const newResult = result?.map((item) => {
      return {
        ...item,
        variant_id: item.id,
        variant_name: item.name,
        real_on_hand: 0,
        on_hand_adj: 0 - (item.on_hand ?? 0),
        on_hand_adj_dis: (0 - (item.on_hand ?? 0)).toString(),
      };
    });
    const dataTemp = [...dataTable, ...newResult];

    const arrayUnique = [...new Map(dataTemp.map((item) => [item.id, item])).values()];

    form.setFieldsValue({[VARIANTS_FIELD]: arrayUnique});
    setIsLoadingTable(true);
    setDataTable(arrayUnique);
    setSearchVariant(arrayUnique);
    setIsLoadingTable(false);
    setHasError(false);
    setVisibleManyProduct(false);
    drawColumns(arrayUnique);
  };

  const onBeforeUpload = useCallback((file) => {
    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      showWarning("Cần chọn ảnh nhỏ hơn 10mb");
    }
    return isLt2M ? true : Upload.LIST_IGNORE;
  }, []);

  const onCustomRequest = (options: UploadRequestOption<any>) => {
    const {file} = options;
    let files: Array<File> = [];
    if (file instanceof File) {
      let uuid = file.uid;
      files.push(file);
      dispatch(
        inventoryUploadFileAction({files: files}, (data: false | Array<string>) => {
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
              form.setFieldsValue({attached_files: newFileCurrent});
            }
          } else {
            fileList.splice(index, 1);
            showError("Upload ảnh không thành công");
          }
          setFileList([...fileList]);
        })
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
      form.setFieldsValue({attached_files: newFileCurrent});
    }
    setFileList([...fileList]);
  };

  const createCallback = useCallback(
    (result: InventoryAdjustmentDetailItem) => {
      if (result) {
        setIsLoading(false);
        if (result) {
          showSuccess("Thêm mới dữ liệu thành công");
          history.push(`${UrlConfig.INVENTORY_ADJUSTMENT}/${result.id}`);
        }
      } else {
        setIsLoading(false);
      }
    },
    [history]
  );

  const onPageChange = useCallback(
    (page, size) => {
      setQuery({...query, page: page, limit: size});
    },
    [query]
  );

  // useEffect(() => {
  //   if (dataTable?.length === 0) {
  //     setHasError(true);
  //   }

  // }, [dataTable, hasError]);

  const defaultColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      align: "center",
      width: "50px",
      render: (value: string, record: VariantResponse, index: number) => index + 1,
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
      dataIndex: "variant_name",
      render: (value: string, record: VariantResponse, index: number) => {
        const storeId = form.getFieldValue("adjusted_store_id");
        return (
          <div>
            <div>
              <div className="product-item-sku">
                <Link
                  target="_blank"
                  to={`${UrlConfig.PRODUCT}/inventory#3?condition=${record.sku}&store_ids${storeId?.adjusted_store_id}&page=1`}
                >
                  {record.sku}
                </Link>
              </div>
              <div className="product-item-name">
                <span className="product-item-name-detail">{value}</span>
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
            <div>Tồn trong kho</div>
            <div>{objSummaryTable.TotalOnHand}</div>
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
            <div>Tồn thực tế</div>
            <div>{objSummaryTable.TotalRealOnHand}</div>
          </>
        );
      },
      dataIndex: "real_on_hand",
      align: "center",
      width: 120,
      render: (value, row: LineItemAdjustment, index: number) => {
        return (
          <NumberInput
            isFloat={false}
            id={`item-real-${index}`}
            min={0}
            maxLength={12}
            value={value}
            onChange={(quantity) => {
              onRealQuantityChange(quantity, row, index);
            }}
          />
        );
      },
    },
    {
      title: () => {
        return (
          <>
            <div>Thừa/Thiếu</div>
            <Row align="middle" justify="center">
              {objSummaryTable.TotalExcess === 0 ? (
                ""
              ) : (
                <div style={{color: "#27AE60"}}>+{objSummaryTable.TotalExcess}</div>
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
                <div style={{color: "red"}}>-{objSummaryTable.TotalMiss}</div>
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
          return <div style={{color: "red"}}>{item.on_hand_adj_dis}</div>;
        } else {
          return <div style={{color: "green"}}>{item.on_hand_adj_dis}</div>;
        }
      },
    },
    {
      title: "",
      fixed: dataTable?.length !== 0 && "right",
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
    [keySearch, dataTable, drawColumns]
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
      variantField?.forEach(
        (row: VariantResponse, index: number, array: VariantResponse[]) => {
          if (row.id === variantId) {
            array.splice(index, 1);
          }
        }
      );
    },
    [dataTable, onEnterFilterVariant, drawColumns, form]
  );

  const onRealQuantityChange = useCallback(
    (quantity: number | null, row: LineItemAdjustment, index: number) => { 
      const dataTableClone: Array<LineItemAdjustment> = _.cloneDeep(dataTable);

      dataTableClone.forEach((item) => {
        quantity = quantity ?? 0;

        if (item.id === row.id) {
          item.real_on_hand = quantity;
          item.variant_id = item.id;
          item.variant_name = item.name;
          let totalDiff = 0;
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
      form.setFieldsValue({[VARIANTS_FIELD]: dataTableClone});
      setDataTable(dataTableClone);
      setSearchVariant(dataTableClone);

      let dataEdit =
        (searchVariant && searchVariant.length > 0) || keySearch !== ""
          ? [...dataTableClone]
          : null;

      onEnterFilterVariant(dataEdit);
    },
    [dataTable, keySearch, form, searchVariant, onEnterFilterVariant]
  );

  useEffect(() => {
    if (dataTable?.length === 0) {
      setHasError(true);
    }
  }, [dataTable, objSummaryTable]);

  const columnsAuditTotal: ColumnsType<any> = [
    {
      title: "STT",
      align: "center",
      width: "50px",
      render: (value: string, record: VariantResponse, index: number) => index + 1,
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
      render: (value: string, record: VariantResponse, index: number) => {
        const storeId = form.getFieldValue("adjusted_store_id");
        return (
          <div>
            <div>
              <div className="product-item-sku">
                <Link
                  target="_blank"
                  to={`${UrlConfig.PRODUCT}/inventory#3?condition=${record.sku}&store_ids${storeId?.adjusted_store_id}&page=1`}
                >
                  {record.sku}
                </Link>
              </div>
              <div className="product-item-name">
                <span className="product-item-name-detail">{value}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Tồn trong kho",
      dataIndex: "on_hand",
      align: "right",
      width: 120,
      render: (value) => {
        return value || 0;
      },
    },
  ];

  return (
    <StyledWrapper>
      <ContentContainer
        title="Thêm mới phiếu kiểm kho"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Kiểm kho",
            path: `${UrlConfig.INVENTORY_ADJUSTMENT}`,
          },
          {
            name: "Thêm mới",
          },
        ]}
        extra={
          <InventoryAdjustmentTimeLine status={"daft"} inventoryAdjustmentDetail={null} />
        }
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
                          Loại kiểm <span style={{color: "red"}}>*</span>
                        </b>
                      </span>
                      <Form.Item
                        style={{margin: "0px"}}
                        name="audit_type"
                        label=""
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn loại kiểm",
                          },
                        ]}
                        labelCol={{span: 24, offset: 0}}
                      >
                        <CustomSelect
                          placeholder="Chọn loại kiểm"
                          showArrow
                          optionFilterProp="children"
                          showSearch={false}
                          allowClear={true}
                          onChange={(value: string) => {
                            onChangeAuditType(value);
                          }}
                        >
                          {Array.isArray(lstAudiTypes) &&
                            lstAudiTypes.length > 0 &&
                            lstAudiTypes.map((item, index) => (
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
                      Kho kiểm <span style={{color: "red"}}>*</span>
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
                      labelCol={{span: 24, offset: 0}}
                    >
                      <CustomSelect
                        placeholder="Chọn kho kiểm"
                        showArrow
                        optionFilterProp="children"
                        showSearch
                        allowClear={true}
                        onChange={(value: number, option) => {
                          if (adjustStoreIdBak && value !== adjustStoreIdBak) {
                            setIsShowModalChangeStore(true);
                          } else {
                            setAdjustStoreIdBak(value);
                          }

                          const store = stores.find(
                            (e) => e.id.toString() === value?.toString()
                          );
                          store && store !== null
                            ? setFormStoreData(store)
                            : setFormStoreData(null);
                        }}
                      >
                        {Array.isArray(stores) &&
                          stores.length > 0 &&
                          stores.map((item, index) => (
                            <Option
                              key={"adjusted_store_id" + index}
                              value={item.id.toString()}
                            >
                              {item.name}
                            </Option>
                          ))}
                      </CustomSelect>
                    </Form.Item>
                  </Col>
                </Row>
                {formStoreData && (
                  <Row>
                    <Col span={3}></Col>
                    <Col span={31}>
                      <>
                        <span>
                          <b>{formStoreData.name}:</b>
                        </span>{" "}
                        {formStoreData.code} - {formStoreData.hotline} -{" "}
                        {ConvertFullAddress(formStoreData)}
                      </>
                    </Col>
                  </Row>
                )}
              </Card>

              <Card
                title="THÔNG TIN SẢN PHẨM"
                bordered={false}
                className={"product-detail"}
              >
                {auditType === INVENTORY_AUDIT_TYPE_CONSTANTS.PARTLY ? (
                  <>
                    <Input.Group className="display-flex">
                      <CustomAutoComplete
                        id="#product_search_variant"
                        dropdownClassName="product"
                        placeholder="Thêm sản phẩm vào phiếu kiểm"
                        onSearch={onSearchProduct}
                        dropdownMatchSelectWidth={456}
                        style={{width: "100%"}}
                        showAdd={true}
                        textAdd="Thêm mới sản phẩm"
                        onSelect={onSelectProduct}
                        options={renderResult}
                        ref={productSearchRef}
                        onClickAddNew={() => {
                          window.open(
                            `${BASE_NAME_ROUTER}${UrlConfig.PRODUCT}/create`,
                            "_blank"
                          );
                        }}
                      />
                      <Button
                        onClick={() => {
                          if (!form.getFieldValue("adjusted_store_id")) {
                            showError("Vui lòng chọn kho kiểm");
                            return;
                          }
                          setVisibleManyProduct(true);
                        }}
                        style={{width: 132, marginLeft: 10}}
                        icon={<img src={PlusOutline} alt="" />}
                      >
                        &nbsp;&nbsp; Chọn nhiều
                      </Button>
                      <Input
                        name="key_search"
                        value={keySearch}
                        onChange={(e) => {
                          setKeySearch(e.target.value);
                        }}
                        onKeyPress={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            onEnterFilterVariant(null);
                          }
                        }}
                        style={{marginLeft: 8}}
                        placeholder="Tìm kiếm sản phẩm trong phiếu"
                        addonAfter={
                          <SearchOutlined
                            onClick={() => {
                              onEnterFilterVariant(null);
                            }}
                            style={{color: "#2A2A86"}}
                          />
                        }
                      />
                    </Input.Group>
                    {/*table*/}
                    <CustomTable
                      className="product-table"
                      rowClassName="product-table-row"
                      tableLayout="fixed"
                      scroll={{y: 300}}
                      columns={defaultColumns}
                      pagination={false}
                      loading={isLoadingTable}
                      dataSource={
                        searchVariant && (searchVariant.length > 0 || keySearch !== "")
                          ? searchVariant
                          : dataTable
                      }
                    />
                  </>
                ) : null}
                {auditType === INVENTORY_AUDIT_TYPE_CONSTANTS.TOTAL ? (
                  <>
                    {" "}
                    {dataVariantByStoreId ? (
                      <>
                        <CustomTable
                          className="product-table"
                          rowClassName="product-table-row"
                          tableLayout="fixed"
                          scroll={{y: 300}}
                          columns={columnsAuditTotal}
                          pagination={false}
                          loading={isLoadingTable}
                          dataSource={dataVariantByStoreId.items}
                        />
                        <CustomPagination
                          pagination={{
                            showSizeChanger: false,
                            pageSize: dataVariantByStoreId.metadata.limit,
                            current: dataVariantByStoreId.metadata.page,
                            total: dataVariantByStoreId.metadata.total,
                            onChange: onPageChange,
                          }}
                        />
                      </>
                    ) : (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Trống" />
                    )}
                  </>
                ) : null}
                {!auditType ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Trống" />
                ) : null}
              </Card>
            </Col>
            <Col span={6}>
              {/* Thông tin phiếu */}
              <Card title={"Thông tin phiếu"} bordered={false}>
                <Form.Item
                  labelCol={{span: 24, offset: 0}}
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
                            new Error("Ngày kiểm không được nhỏ hơn ngày hiện tại")
                          );
                        }
                      },
                    },
                  ]}
                  label={<b>Ngày kiểm</b>}
                  colon={false}
                >
                  <CustomDatePicker
                    style={{width: "100%"}}
                    placeholder="Chọn ngày kiểm"
                    format={DATE_FORMAT.DDMMYYY}
                  />
                </Form.Item>

                <Form.Item
                  name="audited_by"
                  label={<b>Người kiểm</b>}
                  labelCol={{span: 24, offset: 0}}
                  colon={false}
                >
                  <CustomSelect
                    mode="multiple"
                    showSearch
                    placeholder="Chọn người kiểm"
                    notFoundContent="Không tìm thấy kết quả"
                    style={{width: "100%"}}
                    optionFilterProp="children"
                    maxTagCount="responsive"
                    getPopupContainer={(trigger) => trigger.parentNode}
                  >
                    {accounts.map((item, index) => (
                      <Option
                        style={{width: "100%"}}
                        key={index.toString()}
                        value={item.code.toString()}
                      >
                        {`${item.full_name}`}
                      </Option>
                    ))}
                  </CustomSelect>
                </Form.Item>
              </Card>
              <Card title={"GHI CHÚ"} bordered={false} className={"note"}>
                <Form.Item
                  name={"note"}
                  label={<b>Ghi chú nội bộ</b>}
                  colon={false}
                  labelCol={{span: 24, offset: 0}}
                  rules={[{max: 500, message: "Không được nhập quá 500 ký tự"}]}
                >
                  <TextArea placeholder=" " autoSize={{minRows: 4, maxRows: 6}} />
                </Form.Item>

                <Form.Item
                  labelCol={{span: 24, offset: 0}}
                  label={<b>File đính kèm</b>}
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
              <div
                onClick={() => setIsVisibleModalWarning(true)}
                style={{cursor: "pointer"}}
              >
                <img style={{marginRight: "10px"}} src={arrowLeft} alt="" />
                {"Quay lại danh sách"}
              </div>
            }
            rightComponent={
              <Space>
                <Button
                  loading={isLoading}
                  disabled={hasError || isLoading}
                  htmlType={"submit"}
                  type="primary"
                >
                  Tạo phiếu
                </Button>
              </Space>
            }
          />
          {visibleManyProduct && (
            <PickManyProductModal
              storeID={form.getFieldValue("adjusted_store_id")}
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
              onOk={() => history.push(`${UrlConfig.INVENTORY_ADJUSTMENT}`)}
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
                form.setFieldsValue({adjusted_store_id: adjustStoreIdBak});
                const store = stores.find(
                  (e) => e.id.toString() === adjustStoreIdBak?.toString()
                );
                store && store !== null
                  ? setFormStoreData(store)
                  : setFormStoreData(null);

                setQuery({...query, store_ids: adjustStoreIdBak ?? 0});
              }}
              onOk={() => {
                setDataTable([]);
                drawColumns([]);
                setSearchVariant([]);
                setAdjustStoreIdBak(form.getFieldValue("adjusted_store_id"));
                setIsShowModalChangeStore(false);
                setVariantByStoreId(null);
                setQuery({...query, store_ids: form.getFieldValue("adjusted_store_id")});
              }}
              okText="Đồng ý"
              cancelText="Hủy"
              title={`Bạn có chắc chắn đổi kho kiểm?`}
              subTitle="Thông tin sản phẩm trong phiếu sẽ không được lưu."
              visible={isShowModalChangeStore}
            />
          )}
        </Form>
      </ContentContainer>
    </StyledWrapper>
  );
};

export default CreateInventoryAdjustment;
