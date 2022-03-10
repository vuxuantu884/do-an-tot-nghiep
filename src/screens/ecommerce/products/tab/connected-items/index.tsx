import {
  DownOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Radio,
  Space,
  Select,
  Tooltip,
  Progress,
  TreeSelect,
} from "antd";
import circleDeleteIcon from "assets/icon/circle-delete.svg";
import disconnectIcon from "assets/icon/disconnect.svg";
import filterIcon from "assets/icon/filter.svg";
import warningCircleIcon from "assets/icon/warning-circle.svg";
import BaseResponse from "base/base.response";
import BaseFilter from "component/filter/base.filter";
import CustomTable, {
  ICustomTableColumType,
} from "component/table/CustomTable";
import { HttpStatus } from "config/http-status.config";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import UrlConfig from "config/url.config";
import {
  deleteEcommerceItem,
  disconnectEcommerceItem,
  getProductEcommerceList,
  getShopEcommerceList,
  postSyncStockEcommerceProduct,
} from "domain/actions/ecommerce/ecommerce.actions";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import {
  ProductEcommerceQuery,
  RequestExportExcelQuery,
  RequestSyncStockQuery,
} from "model/query/ecommerce.query";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import {
  ECOMMERCE_LIST,
  getEcommerceIcon,
} from "screens/ecommerce/common/commonAction";
import { StyledStatus } from "screens/ecommerce/common/commonStyle";
import {
  StyledProductFilter,
  StyledProductLink,
} from "screens/ecommerce/products/styles";
import ConnectedItemActionColumn from "screens/ecommerce/products/tab/connected-items/ConnectedItemActionColumn";
import { StyledComponent } from "screens/ecommerce/products/tab/connected-items/styles";
import { StyledBaseFilter } from "screens/ecommerce/products/tab/total-items-ecommerce/styles";
import { exportFileProduct, getFileProduct } from "service/other/export.service";
import { formatCurrency } from "utils/AppUtils";
import { ConvertDateToUtc, ConvertUtcToLocalDate } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import {fullTextSearch} from "utils/StringUtils";
import SyncProductModal from "./SyncProductModal";
import { EcommerceProductTabUrl } from "config/url.config";

const productsDeletePermission = [EcommerceProductPermission.products_delete];
const productsUpdateStockPermission = [
  EcommerceProductPermission.products_update_stock,
];
const productsDisconnectPermission = [
  EcommerceProductPermission.products_disconnect,
];

type ConnectedItemsProps = {
  handleSyncStockJob: (x: number) => void;
}

const ConnectedItems: React.FC<ConnectedItemsProps> = (props) => {
  const {handleSyncStockJob} = props;
  const history = useHistory();
  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;

  const [allowProductsDelete] = useAuthorization({
    acceptPermissions: productsDeletePermission,
    not: false,
  });

  const [allowProductsUpdateStock] = useAuthorization({
    acceptPermissions: productsUpdateStockPermission,
    not: false,
  });

  const [allowProductsDisconnect] = useAuthorization({
    acceptPermissions: productsDisconnectPermission,
    not: false,
  });

  const isShowAction =
    allowProductsDelete || allowProductsUpdateStock || allowProductsDisconnect;

  const [isLoading, setIsLoading] = useState(false);

  const [visibleFilter, setVisibleFilter] = useState<boolean>(false);
  const [isShowModalDisconnect, setIsShowModalDisconnect] = useState(false);
  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
  const [isShowSyncStockModal, setIsShowSyncStockModal] = useState(false);
  const [idsItemSelected, setIdsItemSelected] = useState<Array<any>>([]);

  //export file excel
  const [isShowExportExcelModal, setIsShowExportExcelModal] = useState(false);
  const [isShowBtnExportProduct, setShowBtnExportProduct] = useState(true)
  const [isTypeExportProduct, setTypeExportProduct] = useState(false)
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState(false);
  const [exportProcessId, setExportProcessId] = useState<any>(null);

  

  const [selectedRow, setSelectedRow] = useState<Array<any>>([]);

  const [ecommerceIdSelected, setEcommerceIdSelected] = useState(null);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);

  const [variantData, setVariantData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const initialFormValues: ProductEcommerceQuery = useMemo(
    () => ({
      page: 1,
      limit: 30,
      ecommerce_id: null,
      shop_ids: [],
      connect_status: "connected",
      update_stock_status: null,
      sku_or_name_core: null,
      sku_or_name_ecommerce: null,
      connected_date_from: null,
      connected_date_to: null,
    }),
    []
  );

  const [query, setQuery] = useState<ProductEcommerceQuery>({
    page: 1,
    limit: 30,
    ecommerce_id: null,
    shop_ids: [],
    connect_status: "connected",
    update_stock_status: null,
    sku_or_name_core: null,
    sku_or_name_ecommerce: null,
    connected_date_from: null,
    connected_date_to: null,
  });

  const updateVariantData = useCallback((result: PageResponse<any> | false) => {
    setIsLoading(false);
    if (!!result) {
      setVariantData(result);
    }
  }, []);

  const getProductUpdated = useCallback(
    (queryRequest: any) => {
      setIsLoading(true);
      dispatch(getProductEcommerceList(queryRequest, updateVariantData));
    },
    [dispatch, updateVariantData]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    getProductUpdated(query);
  }, [getProductUpdated, query]);

  const reloadPage = () => {
    getProductUpdated(query);
  };

  //handle sync stock
  const handleSyncStock = (item: any) => {
    const requestSyncStock = {
      sync_type: "selected",
      variant_ids: [item.id],
      shop_ids: null,
    };

    dispatch(
      postSyncStockEcommerceProduct(requestSyncStock, (result) => {
        if (result) {
          handleSyncStockJob(result.process_id)
        }
      })
    );
  };

  const handleSyncStockItemsSelected = () => {
    const itemSelected: any[] = [];
    if (selectedRow && selectedRow.length > 0) {
      selectedRow.forEach((item) => {
        itemSelected.push(item.id);
      });
    }
    setIdsItemSelected(itemSelected);
    setIsShowSyncStockModal(true);
  };

  const cancelSyncStockModal = () => {
    setIsShowSyncStockModal(false);
  };

  const okSyncStockModal = (item: any, shop_ids: any) => {
    setIsShowSyncStockModal(false);

    const requestSyncStock: RequestSyncStockQuery = {
      sync_type: null,
      shop_ids: null,
      variant_ids: null,
    };

    switch (item) {
      case "selected":
        requestSyncStock.sync_type = "selected";
        requestSyncStock.variant_ids = idsItemSelected;
        requestSyncStock.shop_ids = null;
        break;
      case "shop":
        requestSyncStock.sync_type = "shop";
        requestSyncStock.variant_ids = null;
        requestSyncStock.shop_ids = shop_ids;
        break;
      default:
        throw new Error("Not field invalid");
    }

    dispatch(
      postSyncStockEcommerceProduct(requestSyncStock, (result) => {
        if (result) {
          console.log(result)
          handleSyncStockJob(result.process_id)
        }
      })
    );
  };

  //handle delete item
  const handleDeleteItem = (item: any) => {
    setIsShowDeleteItemModal(true);
    setIdsItemSelected([item.id]);
  };

  const handleDeleteItemsSelected = () => {
    if (isDisableAction()) {
      return;
    }

    const itemSelected: any[] = [];
    if (selectedRow) {
      selectedRow.forEach((item) => {
        itemSelected.push(item.id);
      });
    }
    setIdsItemSelected(itemSelected);
    setIsShowDeleteItemModal(true);
  };

  const cancelDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);
  };

  const okDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);

    if (idsItemSelected) {
      dispatch(
        deleteEcommerceItem(idsItemSelected, (result) => {
          if (result) {
            showSuccess("Xóa sản phẩm thành công");
            reloadPage();
          }
        })
      );
    }
  };

  //handle disconnect item
  const handleDisconnectItem = (item: any) => {
    setIsShowModalDisconnect(true);
    setIdsItemSelected([item.id]);
  };

  const handleDisconnectItemsSelected = () => {
    if (isDisableAction()) {
      return;
    }

    const itemSelected: any[] = [];
    if (selectedRow) {
      selectedRow.forEach((item) => {
        itemSelected.push(item.id);
      });
    }
    setIdsItemSelected(itemSelected);
    setIsShowModalDisconnect(true);
  };

  const cancelDisconnectModal = () => {
    setIsShowModalDisconnect(false);
  };

  const okDisconnectModal = () => {
    setIsShowModalDisconnect(false);

    if (idsItemSelected) {
      dispatch(
        disconnectEcommerceItem({ ids: idsItemSelected }, (result) => {
          if (result) {
            showSuccess("Ngắt kết nối sản phẩm thành công");
            history.replace(EcommerceProductTabUrl.NOT_CONNECTED);
          }
        })
      );
    }
  };

  //handle export file
  const handleExportExcelProduct = () => {
    const itemSelected: any[] = [];
    if (selectedRow && selectedRow.length > 0) {
      selectedRow.forEach((item) => {
        itemSelected.push(item.id);
      });
    }

    setIdsItemSelected(itemSelected);
    setIsShowExportExcelModal(true)
  }

  const cancelExportExcelProductModal = () => {
    setIsShowExportExcelModal(false)
  }

  const onCancelProgressModal = () => {
    setIsVisibleProgressModal(false);
  }

  const okExportExcelProduct = () => {
    const RequestExportExcel: RequestExportExcelQuery = {
      ...query,
      category_id: null,
      core_variant_id: null,
      variant_ids: isTypeExportProduct ? idsItemSelected : [],
    }

    exportFileProduct(RequestExportExcel)
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProcessId(response.data.process_id)
          setIsVisibleProgressModal(true);
          setIsShowExportExcelModal(false)
        }
      })
      .catch(() => {
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });

      setExportProgress(0)
  }

  const checkExportFile = useCallback(() => {
    let getProgressPromises: Promise<BaseResponse<any>> = getFileProduct(exportProcessId);

    Promise.all([getProgressPromises]).then((responses) => {
      responses.forEach((response) => {
        if (
          response.code === HttpStatus.SUCCESS &&
          response.data &&
          response.data.total !== null
        ) {
          if (!!response.data.url) {
            setExportProgress(100);
            setIsVisibleProgressModal(false);
            showSuccess("Xuất file dữ liệu sản phẩm thành công!");
            window.open(response.data.url);
            setExportProcessId(null)
          } else {
            if (response.data.total !== 0) {
              const percent = Math.floor(response.data.total_success / response.data.total * 100);
              setExportProgress(percent);
            }
          }
        }
      });
    });
  }, [exportProcessId]);

  useEffect(() => {
    if (exportProgress === 100 || exportProcessId === null) return;

    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [checkExportFile, exportProcessId, exportProgress]);

  const handleCheckedExportProductSelected = () => {
    setShowBtnExportProduct(false)
    setTypeExportProduct(true)
  }

  const handleCheckedExportAllProductFilter = () => {
    setShowBtnExportProduct(false)
    setTypeExportProduct(false)
  }

  //end handle export file

  const convertDateTimeFormat = (dateTimeData: any) => {
    const formatDateTime = "DD/MM/YYYY HH:mm:ss";
    return ConvertUtcToLocalDate(dateTimeData, formatDateTime);
  };

  const [columns] = React.useState<Array<ICustomTableColumType<any>>>([
    {
      title: "Ảnh",
      visible: true,
      align: "center",
      width: "70px",
      render: (item: any) => {
        return (
          <img
            src={item.ecommerce_image_url}
            style={{height: "40px"}}
            alt=""
          />
        );
      },
    },
    {
      title: "Sku/ itemID (Sàn)",
      visible: true,
      width: "150px",
      render: (item: any) => {
        return (
          <div>
            <div>{item.ecommerce_sku}</div>
            <div style={{ color: "#737373" }}>{item.ecommerce_product_id}</div>
            <div style={{ color: "#2a2a86" }}>({item.shop})</div>
          </div>
        );
      },
    },
    {
      title: "Sản phẩm (Sàn)",
      visible: true,
      width: "300px",
      render: (item: any) => {
        return <div>{item.ecommerce_variant}</div>;
      },
    },
    {
      title: "Giá bán (Sàn)",
      visible: true,
      align: "center",
      width: "100px",
      render: (item: any) => {
        return (
          <span>
            {item.ecommerce_price ? formatCurrency(item.ecommerce_price) : "-"}
          </span>
        );
      },
    },
    {
      title: "Sản phẩm (Yody)",
      visible: true,
      render: (item: any) => {
        return (
          <StyledProductLink>
            <Link
              target="_blank"
              to={`${UrlConfig.PRODUCT}/${item.core_product_id}/variants/${item.core_variant_id}`}>
              {item.core_variant}
            </Link>
            <div>{item.core_sku}</div>
          </StyledProductLink>
        );
      },
    },
    {
      title: "Giá bán (Yody)",
      visible: true,
      align: "center",
      width: "100px",
      render: (item: any) => {
        return <span>{formatCurrency(item.core_price)}</span>;
      },
    },
    {
      title: "Tồn",
      visible: true,
      align: "center",
      width: "60px",
      render: (item: any) => {
        return <span>{item.stock}</span>;
      },
    },
    {
      title: "Ghép nối",
      visible: true,
      align: "center",
      width: "150px",
      render: (item: any) => {
        return (
          <StyledStatus>
            {item.connect_status === "connected" && (
              <div className="green-status" style={{ width: 120 }}>
                Thành công
              </div>
            )}
          </StyledStatus>
        );
      },
    },
    {
      title: () => {
        return (
          <div>
            <span>Đồng bộ tồn</span>
            <Tooltip
              overlay="Kết quả đồng bộ tồn kho lần gần nhất"
              placement="top"
              color="blue">
              <img src={warningCircleIcon} style={{ marginLeft: 5 }} alt="" />
            </Tooltip>
          </div>
        );
      },
      visible: true,
      align: "center",
      width: "150px",
      render: (item: any) => {
        return (
          <StyledStatus>
            {item.sync_stock_status === "done" && (
              <Tooltip title={convertDateTimeFormat(item.updated_date)}>
                <div className="green-status" style={{ width: 120 }}>
                  Thành công
                </div>
              </Tooltip>
            )}

            {item.sync_stock_status === "error" && (
              <Tooltip title="error">
                <div className="red-status" style={{ width: 120 }}>
                  Thất bại
                </div>
              </Tooltip>
            )}

            {item.sync_stock_status === "in_progress" && (
              <div className="yellow-status" style={{ width: 120 }}>
                Đang xử lý
              </div>
            )}
          </StyledStatus>
        );
      },
    },

    ConnectedItemActionColumn(
      handleDeleteItem,
      handleSyncStock,
      handleDisconnectItem
    ),
  ]);

  const onSearch = (value: ProductEcommerceQuery) => {
    if (value) {
      value.connected_date_from = connectionStartDate;
      value.connected_date_to = connectionEndDate;

      query.ecommerce_id = value.ecommerce_id;
      query.shop_ids = value.shop_ids;
      query.connect_status = "connected";
      query.update_stock_status = value.update_stock_status;
      query.sku_or_name_ecommerce = value.sku_or_name_ecommerce;
      query.sku_or_name_core = value.sku_or_name_core;
      query.connected_date_from = value.connected_date_from;
      query.connected_date_to = value.connected_date_to;
    }

    const querySearch: ProductEcommerceQuery = { ...query };
    getProductUpdated(querySearch);
  };

  const onPageChange = React.useCallback(
    (page, limit) => {
      query.page = page;
      query.limit = limit;
      setQuery({ ...query, page, limit });
      getProductUpdated({ ...query });
      window.scrollTo(0, 0);
    },
    [query, getProductUpdated]
  );

  //handle select ecommerce
  const updateEcommerceShopList = React.useCallback((result) => {
    const shopList: any[] = [];
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        shopList.push({
          id: item.id,
          name: item.name,
          ecommerce: item.ecommerce,
        });
      });
    }
    setEcommerceShopList(shopList);
  }, []);

  const getEcommerceShop = (ecommerceId: any) => {
    dispatch(
      getShopEcommerceList(
        { ecommerce_id: ecommerceId },
        updateEcommerceShopList
      )
    );
  };

  //end handle select ecommerce

  //handle select ecommerce
  const handleSelectEcommerce = (ecommerceId: any) => {
    if (ecommerceId !== ecommerceIdSelected) {
      formAdvance?.setFieldsValue({
        shop_ids: []
      });

      setEcommerceIdSelected(ecommerceId);
      getEcommerceShop(ecommerceId);
    }
  };

  const removeEcommerce = () => {
    setEcommerceIdSelected(null);
    formAdvance?.setFieldsValue({ shop_ids: [] });
  };
  //end handle select ecommerce

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );

  const STOCK_STATUS = bootstrapReducer.data?.stock_sync_status;

  const onFilterClick = React.useCallback(() => {
    setVisibleFilter(false);
    formAdvance.submit();
  }, [formAdvance]);

  const onClearConnectionDate = () => {
    setDateButtonSelected("");
    setConnectionStartDate(null);
    setConnectionEndDate(null);
  };

  const onClearBaseFilter = React.useCallback(() => {
    removeEcommerce();
    onClearConnectionDate();
    setVisibleFilter(false);

    formAdvance.setFieldsValue(initialFormValues);
    formAdvance.submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formAdvance, initialFormValues]);

  const openFilter = React.useCallback(() => {
    setVisibleFilter(true);
  }, []);

  const onCancelFilter = React.useCallback(() => {
    setVisibleFilter(false);
  }, []);

  const onSelectTableRow = React.useCallback((selectedRow: Array<any>) => {
    const newSelectedRow = selectedRow.filter((row: any) => {
      return row !== undefined;
    });
    setSelectedRow(newSelectedRow);
  }, []);

  const isDisableAction = () => {
    return !selectedRow || selectedRow.length === 0;
  };

  const actionList = (
    <Menu>
      {allowProductsUpdateStock && (
        <Menu.Item key="1">
          <span onClick={handleSyncStockItemsSelected}>
            Đồng bộ tồn kho lên sàn
          </span>
        </Menu.Item>
      )}

      {allowProductsDelete && (
        <Menu.Item key="2" disabled={isDisableAction()}>
          <span onClick={handleDeleteItemsSelected}>Xóa sản phẩm lấy về</span>
        </Menu.Item>
      )}

      {allowProductsDisconnect && (
        <Menu.Item key="3" disabled={isDisableAction()}>
          <span onClick={handleDisconnectItemsSelected}>Hủy liên kết</span>
        </Menu.Item>
      )}

      <Menu.Item key="1">
        <span onClick={handleExportExcelProduct}>
          Xuất excel
        </span>
      </Menu.Item>
    </Menu>
  );

  const [connectionStartDate, setConnectionStartDate] = useState(
    initialFormValues.connected_date_from || null
  );
  const [connectionEndDate, setConnectionEndDate] = useState(
    initialFormValues.connected_date_to || null
  );

  const [dateButtonSelected, setDateButtonSelected] = useState("");

  const onSelectDate = useCallback(
    (value) => {
      let startDateValue;
      let endDateValue;

      switch (value) {
        case "today":
          startDateValue = ConvertDateToUtc(moment());
          endDateValue = ConvertDateToUtc(moment());
          break;
        case "yesterday":
          startDateValue = ConvertDateToUtc(moment().subtract(1, "days"));
          endDateValue = ConvertDateToUtc(moment().subtract(1, "days"));
          break;
        case "thisweek":
          startDateValue = ConvertDateToUtc(
            moment().startOf("week").add(7, "h")
          );
          endDateValue = ConvertDateToUtc(moment().endOf("week"));
          break;
        case "lastweek":
          startDateValue = ConvertDateToUtc(
            moment().startOf("week").subtract(1, "weeks").add(7, "h")
          );
          endDateValue = ConvertDateToUtc(
            moment().endOf("week").subtract(1, "weeks")
          );
          break;
        case "thismonth":
          startDateValue = ConvertDateToUtc(
            moment().startOf("month").add(7, "h")
          );
          endDateValue = ConvertDateToUtc(moment().endOf("month"));
          break;
        case "lastmonth":
          startDateValue = ConvertDateToUtc(
            moment().startOf("month").subtract(1, "months").add(7, "h")
          );
          endDateValue = ConvertDateToUtc(
            moment().endOf("month").subtract(1, "months")
          );
          break;
        default:
          break;
      }

      if (dateButtonSelected === value) {
        setDateButtonSelected("");
        setConnectionStartDate(null);
        setConnectionEndDate(null);
      } else {
        setDateButtonSelected(value);
        setConnectionStartDate(startDateValue);
        setConnectionEndDate(endDateValue);
      }
    },
    [dateButtonSelected]
  );

  const onChangeRangeDate = useCallback((dates) => {
    setDateButtonSelected("");
    const startDateUtc = dates[0].utc().format();
    const endDateUtc = dates[1].utc().format();
    setConnectionStartDate(startDateUtc);
    setConnectionEndDate(endDateUtc);
  }, []);
  //end handle select connection date

  return (
    <StyledComponent>
      <Card>
        <StyledProductFilter>
          <div className="filter">
            <Form
              form={formAdvance}
              onFinish={onSearch}
              initialValues={initialFormValues}>
              {isShowAction && (
                <div className="action-dropdown">
                  <Dropdown
                    overlay={actionList}
                    trigger={["click"]}
                    disabled={isLoading}>
                    <Button className="action-button">
                      <div style={{ marginRight: 10 }}>Thao tác</div>
                      <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
              )}

              <Form.Item
                name="ecommerce_id"
                className="select-channel-dropdown">
                <Select
                  disabled={isLoading}
                  placeholder="Chọn sàn"
                  allowClear
                  onSelect={(value) => handleSelectEcommerce(value)}
                  onClear={removeEcommerce}>
                  {ECOMMERCE_LIST?.map((item: any) => (
                    <Select.Option key={item.ecommerce_id} value={item.ecommerce_id}>
                      <div>
                        <img
                          src={item.icon}
                          alt={item.id}
                          style={{ marginRight: "10px" }}
                        />
                        <span>{item.title}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                className="select-store-dropdown"
                name="shop_ids"
              >
                {ecommerceIdSelected ?
                  <TreeSelect
                    placeholder="Chọn gian hàng"
                    treeDefaultExpandAll
                    className="selector"
                    allowClear
                    showArrow
                    showSearch
                    multiple
                    treeCheckable
                    treeNodeFilterProp="title"
                    maxTagCount="responsive"
                    filterTreeNode={(textSearch: any, item: any) => {
                      const treeNodeTitle = item?.title?.props?.children[1];
                      return fullTextSearch(textSearch, treeNodeTitle);
                    }}
                  >
                    {ecommerceShopList?.map((shopItem: any) => (
                      <TreeSelect.TreeNode
                        key={shopItem.id}
                        value={shopItem.id}
                        title={
                          <span>
                      <img
                        src={getEcommerceIcon(shopItem.ecommerce)}
                        alt={shopItem.id}
                        style={{ marginRight: "5px", height: "16px" }}
                      />
                            {shopItem.name}
                    </span>
                        }
                      />
                    ))}
                  </TreeSelect>
                  :
                  <Tooltip title="Yêu cầu chọn sàn" color={"gold"}>
                    <Select
                      showSearch
                      disabled={true}
                      placeholder="Chọn gian hàng"
                    />
                  </Tooltip>
                }
              </Form.Item>

              <Form.Item name="sku_or_name_ecommerce" className="shoppe-search">
                <Input
                  disabled={isLoading}
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="SKU, tên sản phẩm sàn"
                />
              </Form.Item>

              <Form.Item name="sku_or_name_core" className="yody-search">
                <Input
                  disabled={isLoading}
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="SKU, Sản phẩm Yody"
                />
              </Form.Item>

              <Form.Item className="filter-item">
                <Button type="primary" htmlType="submit" disabled={isLoading}>
                  Lọc
                </Button>
              </Form.Item>

              <Form.Item>
                <Button onClick={openFilter} disabled={isLoading}>
                  <img src={filterIcon} style={{ marginRight: 10 }} alt="" />
                  <span>Thêm bộ lọc</span>
                </Button>
              </Form.Item>
            </Form>
          </div>
        </StyledProductFilter>

        <CustomTable
          bordered
          isRowSelection={isShowAction}
          isLoading={isLoading}
          onSelectedChange={onSelectTableRow}
          columns={columns}
          dataSource={variantData.items}
          scroll={{ x: 1500 }}
          sticky={{ offsetScroll: 10, offsetHeader: 55 }}
          pagination={{
            pageSize: variantData.metadata && variantData.metadata.limit,
            total: variantData.metadata && variantData.metadata.total,
            current: variantData.metadata && variantData.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          rowKey={(data) => data.id}
        />
      </Card>

      <BaseFilter
        onClearFilter={onClearBaseFilter}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visibleFilter}
        width={400}>
        <StyledBaseFilter>
          <Form
            form={formAdvance}
            onFinish={onSearch}
            initialValues={initialFormValues}
            layout="vertical">
            <Form.Item
              name="update_stock_status"
              label={<b>TRẠNG THÁI ĐỒNG BỘ TỒN KHO</b>}>
              <Select
                showSearch
                placeholder="Chọn trạng thái đồng bộ tồn kho"
                allowClear>
                {STOCK_STATUS &&
                  STOCK_STATUS.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item label={<b>NGÀY GHÉP NỐI</b>}>
              <div className="select-connection-date">
                <div className="date-option">
                  <Button
                    onClick={() => onSelectDate("yesterday")}
                    className={
                      dateButtonSelected === "yesterday" ? "active-btn" : ""
                    }>
                    Hôm qua
                  </Button>

                  <Button
                    onClick={() => onSelectDate("today")}
                    className={
                      dateButtonSelected === "today" ? "active-btn" : ""
                    }>
                    Hôm nay
                  </Button>

                  <Button
                    onClick={() => onSelectDate("thisweek")}
                    className={
                      dateButtonSelected === "thisweek" ? "active-btn" : ""
                    }>
                    Tuần này
                  </Button>
                </div>

                <div className="date-option">
                  <Button
                    onClick={() => onSelectDate("lastweek")}
                    className={
                      dateButtonSelected === "lastweek" ? "active-btn" : ""
                    }>
                    Tuần trước
                  </Button>

                  <Button
                    onClick={() => onSelectDate("thismonth")}
                    className={
                      dateButtonSelected === "thismonth" ? "active-btn" : ""
                    }>
                    Tháng này
                  </Button>

                  <Button
                    onClick={() => onSelectDate("lastmonth")}
                    className={
                      dateButtonSelected === "lastmonth" ? "active-btn" : ""
                    }>
                    Tháng trước
                  </Button>
                </div>

                <div style={{ margin: "10px 0" }}>
                  <SettingOutlined style={{ marginRight: "5px" }} />
                  <span>Tùy chọn khoảng thời gian tạo:</span>
                </div>

                <DatePicker.RangePicker
                  format="DD-MM-YYYY"
                  style={{ width: "100%" }}
                  value={[
                    connectionStartDate
                      ? moment(new Date(connectionStartDate), "DD-MM-YYYY")
                      : null,
                    connectionEndDate
                      ? moment(new Date(connectionEndDate), "DD-MM-YYYY")
                      : null,
                  ]}
                  onChange={(date, dateString) =>
                    onChangeRangeDate(date)
                  }
                />
              </div>
            </Form.Item>
          </Form>
        </StyledBaseFilter>
      </BaseFilter>

      <Modal
        width="600px"
        visible={isShowModalDisconnect}
        okText="Đồng ý"
        cancelText="Hủy"
        onCancel={cancelDisconnectModal}
        onOk={okDisconnectModal}>
        <div>
          <img src={disconnectIcon} style={{ marginRight: 20 }} alt="" />
          <span>Bạn có chắc chắn muốn hủy liên kết sản phẩm không?</span>
        </div>
      </Modal>

      <Modal
        width="600px"
        visible={isShowDeleteItemModal}
        okText="Đồng ý"
        cancelText="Hủy"
        onCancel={cancelDeleteItemModal}
        onOk={okDeleteItemModal}>
        <div>
          <img src={circleDeleteIcon} style={{ marginRight: 20 }} alt="" />
          <span>Bạn có chắc chắn muốn xóa sản phẩm tải về không?</span>
        </div>
      </Modal>

      <SyncProductModal
        width="600px"
        visible={isShowSyncStockModal}
        title="Đồng bộ tồn kho"
        okText="Đồng bộ"
        cancelText="Hủy"
        onCancel={() => cancelSyncStockModal()}
        onOk={(item, shop_ids) => okSyncStockModal(item, shop_ids)}
      />

      <Modal
          width="600px"
          visible={isShowExportExcelModal}
          title="Xuất excel sản phẩm"
          okText="Tải về"
          cancelText="Hủy"
          onCancel={cancelExportExcelProductModal}
          onOk={okExportExcelProduct}
          okButtonProps={{
            disabled: isShowBtnExportProduct
          }}>
          <Radio.Group>
            <Space direction="vertical">
            <Radio
                value="1"
                disabled={selectedRow.length <= 0}
                onClick={handleCheckedExportProductSelected}
              >
                Tải sản phẩm đã chọn
              </Radio>
              <Radio
                value="2"
                onClick={handleCheckedExportAllProductFilter}
              >
                Tải toàn bộ sản phẩm(toàn bộ sản phẩm trong các trang được lọc)
              </Radio>

            </Space>
          </Radio.Group>
        </Modal>

        {/* Progress export customer data */}
        <Modal
          onCancel={onCancelProgressModal}
          visible={isVisibleProgressModal}
          title="Xuất file"
          centered
          width={600}
          footer={[
            <Button key="cancel" type="primary" onClick={onCancelProgressModal}>
              Thoát
            </Button>,
          ]}>
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 15 }}>
              Đang tạo file, vui lòng đợi trong giây lát
            </div>
            <Progress
              type="circle"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              percent={exportProgress}
            />
          </div>
        </Modal>
    </StyledComponent>
  );
};

export default ConnectedItems;
