import { DownOutlined, SearchOutlined, SettingOutlined } from "@ant-design/icons";
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
  Tag,
} from "antd";
import circleDeleteIcon from "assets/icon/circle-delete.svg";
import disconnectIcon from "assets/icon/disconnect.svg";
import filterIcon from "assets/icon/filter.svg";
import warningCircleIcon from "assets/icon/warning-circle.svg";
import BaseResponse from "base/base.response";
import BaseFilter from "component/filter/base.filter";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { HttpStatus } from "config/http-status.config";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import UrlConfig, { WebAppProductTabUrl } from "config/url.config";
import {
  deleteWebAppProductAction,
  disconnectWebAppProductAction,
  getWebAppProductAction,
  syncWebAppStockProductAction,
  exitWebAppJobsAction,
} from "domain/actions/web-app/web-app.actions";
import useAuthorization from "hook/useAuthorization";
import { PageResponse } from "model/base/base-metadata.response";
import {
  WebAppProductQuery,
  WebAppRequestExportExcelQuery,
  WebAppRequestSyncStockQuery,
} from "model/query/web-app.query";
import { RootReducerType } from "model/reducers/RootReducerType";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { StyledStatus } from "screens/web-app/common/commonStyle";
import { StyledProductFilter, StyledProductLink } from "screens/web-app/products/styles";
import ConnectedItemActionColumn from "screens/web-app/products/tab/connected-items/ConnectedItemActionColumn";
import { StyledComponent } from "screens/web-app/products/tab/connected-items/styles";
import { StyledBaseFilter } from "screens/web-app/products/tab/total-items-ecommerce/styles";
import { webAppExportFileProduct, webAppGetFileProduct } from "service/other/export.service";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { ConvertDateToUtc, ConvertUtcToLocalDate } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import SyncProductModal from "./SyncProductModal";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import queryString from "query-string";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";

const productsDeletePermission = [EcommerceProductPermission.products_delete];
const productsUpdateStockPermission = [EcommerceProductPermission.products_update_stock];
const productsDisconnectPermission = [EcommerceProductPermission.products_disconnect];

type ConnectedItemsProps = {
  handleSyncStockJob: (x: number) => void;
  isReloadPage: boolean;
};

const EXPORT_PRODUCT_OPTION = {
  SELECTED: "selected",
  FILTERED: "filtered",
};

const ConnectedItems: React.FC<ConnectedItemsProps> = (props) => {
  const { isReloadPage, handleSyncStockJob } = props;
  const history = useHistory();
  const location = useLocation();
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

  const isShowAction = allowProductsDelete || allowProductsUpdateStock || allowProductsDisconnect;

  const [isLoading, setIsLoading] = useState(false);

  const [visibleFilter, setVisibleFilter] = useState<boolean>(false);
  const [isShowModalDisconnect, setIsShowModalDisconnect] = useState(false);
  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
  const [isShowSyncStockModal, setIsShowSyncStockModal] = useState(false);
  const [idsItemSelected, setIdsItemSelected] = useState<Array<any>>([]);

  //export file excel
  const [isShowExportExcelModal, setIsShowExportExcelModal] = useState(false);
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState(false);
  const [exportProcessPercent, setExportProcessPercent] = useState<number>(0);

  const [exportProductType, setExportProductType] = useState<string>("");
  const [exportProcessId, setExportProcessId] = useState<any>(null);

  const [selectedRow, setSelectedRow] = useState<Array<any>>([]);

  const [variantData, setVariantData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const initialFormValues: WebAppProductQuery = useMemo(
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
    [],
  );

  const [query, setQuery] = useState<WebAppProductQuery>(initialFormValues);

  const queryParamsParsed: {
    [key: string]: string | (string | null)[] | null;
  } = queryString.parse(location.search);

  const updateVariantData = useCallback((result: PageResponse<any> | false) => {
    setIsLoading(false);
    if (!!result) {
      setVariantData(result);
    }
  }, []);

  const getProductUpdated = useCallback(
    (queryRequest: any) => {
      setIsLoading(true);
      dispatch(getWebAppProductAction(queryRequest, updateVariantData));
    },
    [dispatch, updateVariantData],
  );

  useEffect(() => {
    if (isReloadPage) {
      window.scrollTo(0, 0);
      getProductUpdated(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProductUpdated, isReloadPage]);

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
      syncWebAppStockProductAction(requestSyncStock, (result) => {
        if (result) {
          handleSyncStockJob(result.process_id);
        }
      }),
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

    const requestSyncStock: WebAppRequestSyncStockQuery = {
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
      syncWebAppStockProductAction(requestSyncStock, (result) => {
        if (result) {
          handleSyncStockJob(result.process_id);
        }
      }),
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
        deleteWebAppProductAction(idsItemSelected, (result) => {
          if (result) {
            showSuccess("Xóa sản phẩm thành công");
            reloadPage();
          }
        }),
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
        disconnectWebAppProductAction({ ids: idsItemSelected }, (result) => {
          if (result) {
            showSuccess("Ngắt kết nối sản phẩm thành công");
            history.replace(WebAppProductTabUrl.NOT_CONNECTED);
          }
        }),
      );
    }
  };

  //handle export file
  const resetExportProductProcess = () => {
    setExportProcessId(null);
    setExportProcessPercent(0);
  };

  const handleExportExcelProduct = () => {
    const itemSelected: any[] = [];
    if (selectedRow && selectedRow.length > 0) {
      selectedRow.forEach((item) => {
        itemSelected.push(item.id);
      });
    }

    setIdsItemSelected(itemSelected);
    setIsShowExportExcelModal(true);
  };

  const cancelExportExcelProductModal = () => {
    setIsShowExportExcelModal(false);
    setExportProductType("");
  };

  const onCancelProgressModal = () => {
    setIsVisibleExitProcessModal(true);
  };

  const okExportExcelProduct = () => {
    const RequestExportExcel: WebAppRequestExportExcelQuery = {
      ...query,
      category_id: null,
      core_variant_id: null,
      variant_ids: exportProductType === EXPORT_PRODUCT_OPTION.SELECTED ? idsItemSelected : [],
    };

    if (exportProductType === EXPORT_PRODUCT_OPTION.FILTERED) {
      const queryParam = { ...query };
      delete queryParam.page;
      delete queryParam.limit;
      const generateQueryParam = generateQuery(queryParam);
      if (!generateQueryParam) {
        showError("Chưa áp dụng bộ lọc sản phẩm. Vui lòng kiểm tra lại.");
        cancelExportExcelProductModal();
        return;
      }
    }

    webAppExportFileProduct(RequestExportExcel)
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProcessId(response.data.process_id);
          setIsVisibleProgressModal(true);
          cancelExportExcelProductModal();
        }
      })
      .catch(() => {
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });

    setExportProcessPercent(0);
  };

  const checkExportFile = useCallback(() => {
    let getProgressPromises: Promise<BaseResponse<any>> = webAppGetFileProduct(exportProcessId);

    Promise.all([getProgressPromises])
      .then((responses) => {
        responses.forEach((response) => {
          if (response.code === HttpStatus.SUCCESS) {
            if (response.data && response.data.finish) {
              if (response.data.api_error) {
                setExportProcessPercent(0);
                showError(`${response.data.api_error}`);
              } else {
                if (response.data.url) {
                  setExportProcessPercent(100);
                  showSuccess("Xuất file dữ liệu sản phẩm thành công!");
                  window.open(response.data.url);
                }
              }
              setExportProcessId(null);
              setIsVisibleProgressModal(false);
            } else {
              if (response.data.total > 0) {
                const percent = Math.floor(
                  (response.data.total_success / response.data.total) * 100,
                );
                setExportProcessPercent(percent >= 100 ? 99 : percent);
              }
            }
          }
        });
      })
      .catch(() => {
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });
  }, [exportProcessId]);

  useEffect(() => {
    if (exportProcessPercent === 100 || !exportProcessId) return;

    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkExportFile, exportProcessId]);

  const onChangeExportProductOption = (e: any) => {
    setExportProductType(e.target.value);
  };
  //end handle export file

  // handle exit export product
  const [isVisibleExitProcessModal, setIsVisibleExitProcessModal] = useState<boolean>(false);

  const onCancelExitProcessModal = () => {
    setIsVisibleExitProcessModal(false);
  };

  const onOkExitProcessModal = () => {
    resetExportProductProcess();
    setIsVisibleExitProcessModal(false);
    setIsVisibleProgressModal(false);
    if (exportProcessId) {
      dispatch(
        exitWebAppJobsAction(exportProcessId, (responseData) => {
          if (responseData) {
            showSuccess(responseData);
          }
        }),
      );
    }
  };
  // end handle exit process modal

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
        return <img src={item.ecommerce_image_url} style={{ height: "40px" }} alt="" />;
      },
    },
    {
      title: "Sku/ itemID (Sapo)",
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
      title: "Sản phẩm (Sapo)",
      visible: true,
      width: "300px",
      render: (item: any) => {
        return <div>{item.ecommerce_variant}</div>;
      },
    },
    {
      title: "Giá bán (Sapo)",
      visible: true,
      align: "center",
      width: "100px",
      render: (item: any) => {
        return <span>{item.ecommerce_price ? formatCurrency(item.ecommerce_price) : "-"}</span>;
      },
    },
    {
      title: "Sản phẩm (Unicorn)",
      visible: true,
      render: (item: any) => {
        return (
          <StyledProductLink>
            <Link
              target="_blank"
              to={`${UrlConfig.PRODUCT}/${item.core_product_id}/variants/${item.core_variant_id}`}
            >
              {item.core_variant}
            </Link>
            <div>{item.core_sku}</div>
          </StyledProductLink>
        );
      },
    },
    {
      title: "Giá bán (Unicorn)",
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
            <Tooltip overlay="Kết quả đồng bộ tồn kho lần gần nhất" placement="top" color="blue">
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

    ConnectedItemActionColumn(handleDeleteItem, handleSyncStock, handleDisconnectItem),
  ]);

  const onSearch = (value: WebAppProductQuery) => {
    if (value) {
      value.connected_date_from = connectionStartDate;
      value.connected_date_to = connectionEndDate;

      let queryParam = generateQuery(value);
      history.push(`${location.pathname}?${queryParam}`);
    }
  };

  useEffect(() => {
    let dataQuery: WebAppProductQuery = {
      ...initialFormValues,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
    setFilterValueByQueryParam(dataQuery);
    setQuery(dataQuery);
    getProductUpdated(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search]);

  const setFilterValueByQueryParam = (dataquery: WebAppProductQuery) => {
    formAdvance.setFieldsValue(dataquery);
    const connected_date_from = dataquery.connected_date_from;
    const connected_date_to = dataquery.connected_date_to;
    if (connected_date_from === null) {
      setConnectionStartDate(null);
    } else {
      setConnectionStartDate(ConvertDateToUtc(connected_date_from));
    }

    if (connected_date_to === null) {
      setConnectionEndDate(null);
    } else {
      setConnectionEndDate(ConvertDateToUtc(connected_date_to));
    }

    if (connected_date_from !== null && connected_date_to !== null) {
      const startDateValueToDay = ConvertUtcToDate(ConvertDateToUtc(moment()));
      const endDateValueToDay = ConvertUtcToDate(ConvertDateToUtc(moment()));
      const startDateValueYesterday = ConvertUtcToDate(
        ConvertDateToUtc(moment().subtract(1, "days")),
      );
      const endDateValueYesterday = ConvertUtcToDate(
        ConvertDateToUtc(moment().subtract(1, "days")),
      );
      const startDateValueThisWeek = ConvertUtcToDate(
        ConvertDateToUtc(moment().startOf("week").add(7, "h")),
      );
      const endDateValueThisWeek = ConvertUtcToDate(ConvertDateToUtc(moment().endOf("week")));
      const startDateValueLastWeek = ConvertUtcToDate(
        ConvertDateToUtc(moment().startOf("week").subtract(1, "weeks").add(7, "h")),
      );
      const endDateValueLastWeek = ConvertUtcToDate(
        ConvertDateToUtc(moment().endOf("week").subtract(1, "weeks")),
      );
      const startDateValueThisMonth = ConvertUtcToDate(
        ConvertDateToUtc(moment().startOf("month").add(7, "h")),
      );
      const endDateValueThisMonth = ConvertUtcToDate(ConvertDateToUtc(moment().endOf("month")));
      const startDateValueLastMonth = ConvertUtcToDate(
        ConvertDateToUtc(moment().startOf("month").subtract(1, "months").add(7, "h")),
      );
      const endDateValueLastMonth = ConvertUtcToDate(
        ConvertDateToUtc(moment().endOf("month").subtract(1, "months")),
      );

      const date_from = ConvertUtcToDate(connected_date_from);
      const date_to = ConvertUtcToDate(connected_date_to);

      if (date_from === startDateValueToDay && date_to === endDateValueToDay) {
        setDateButtonSelected("today");
      } else if (date_from === startDateValueYesterday && date_to === endDateValueYesterday) {
        setDateButtonSelected("yesterday");
      } else if (date_from === startDateValueThisWeek && date_to === endDateValueThisWeek) {
        setDateButtonSelected("thisweek");
      } else if (date_from === startDateValueLastWeek && date_to === endDateValueLastWeek) {
        setDateButtonSelected("lastweek");
      } else if (date_from === startDateValueThisMonth && date_to === endDateValueThisMonth) {
        setDateButtonSelected("thismonth");
      } else if (date_from === startDateValueLastMonth && date_to === endDateValueLastMonth) {
        setDateButtonSelected("lastmonth");
      }
    } else {
      setDateButtonSelected("");
    }
  };

  const ConvertUtcToDate = (date?: Date | string | number | null, format?: string) => {
    if (date != null) {
      let localDate = moment.utc(date).toDate();
      let dateFormat = moment(localDate).format(format ? format : "DD/MM/YYYY");
      return dateFormat;
    }
    return "";
  };

  const onPageChange = React.useCallback(
    (page, limit) => {
      const newPrams = { ...query, page: page, limit: limit };
      const queryParam = generateQuery(newPrams);
      setQuery(newPrams);
      window.scrollTo(0, 0);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [query, history, location.pathname],
  );

  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);

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
        <Menu.Item key="1" onClick={handleSyncStockItemsSelected}>
          <span>Đồng bộ tồn kho lên sàn</span>
        </Menu.Item>
      )}

      {allowProductsDelete && (
        <Menu.Item key="2" onClick={handleDeleteItemsSelected} disabled={isDisableAction()}>
          <span>Xóa sản phẩm lấy về</span>
        </Menu.Item>
      )}

      {allowProductsDisconnect && (
        <Menu.Item key="3" onClick={handleDisconnectItemsSelected} disabled={isDisableAction()}>
          <span>Hủy liên kết</span>
        </Menu.Item>
      )}

      <Menu.Item
        key="export"
        onClick={handleExportExcelProduct}
        disabled={!variantData.metadata || !variantData.metadata.total}
      >
        <span>Xuất excel</span>
      </Menu.Item>
    </Menu>
  );

  const [connectionStartDate, setConnectionStartDate] = useState(
    initialFormValues.connected_date_from || null,
  );
  const [connectionEndDate, setConnectionEndDate] = useState(
    initialFormValues.connected_date_to || null,
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
          startDateValue = ConvertDateToUtc(moment().startOf("week").add(7, "h"));
          endDateValue = ConvertDateToUtc(moment().endOf("week"));
          break;
        case "lastweek":
          startDateValue = ConvertDateToUtc(
            moment().startOf("week").subtract(1, "weeks").add(7, "h"),
          );
          endDateValue = ConvertDateToUtc(moment().endOf("week").subtract(1, "weeks"));
          break;
        case "thismonth":
          startDateValue = ConvertDateToUtc(moment().startOf("month").add(7, "h"));
          endDateValue = ConvertDateToUtc(moment().endOf("month"));
          break;
        case "lastmonth":
          startDateValue = ConvertDateToUtc(
            moment().startOf("month").subtract(1, "months").add(7, "h"),
          );
          endDateValue = ConvertDateToUtc(moment().endOf("month").subtract(1, "months"));
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
    [dateButtonSelected],
  );

  const onChangeRangeDate = useCallback((dates) => {
    setDateButtonSelected("");
    const startDateUtc = dates[0].utc().format();
    const endDateUtc = dates[1].utc().format();
    setConnectionStartDate(startDateUtc);
    setConnectionEndDate(endDateUtc);
  }, []);
  //end handle select connection date

  // handle tag filter
  let initialValues = useMemo(() => {
    return {
      ...query,
    };
  }, [query]);

  let filters = useMemo(() => {
    let list = [];

    if (initialValues.sku_or_name_ecommerce) {
      list.push({
        key: "sku_or_name_ecommerce",
        name: "Sku, tên sản phẩm (Sapo)",
        value: initialValues.sku_or_name_ecommerce,
      });
    }

    if (initialValues.sku_or_name_core) {
      list.push({
        key: "sku_or_name_core",
        name: "Sku, tên sản phẩm (Unicorn)",
        value: initialValues.sku_or_name_core,
      });
    }

    if (initialValues.update_stock_status) {
      let value_update_stock_status = "";
      switch (initialValues.update_stock_status) {
        case "done":
          value_update_stock_status = "Thành công";
          break;
        case "in_progress":
          value_update_stock_status = "Đang xử lý";
          break;
        case "error":
          value_update_stock_status = "Thất bại";
          break;
      }
      list.push({
        key: "update_stock_status",
        name: "Trạng thái đồng bộ tồn kho",
        value: value_update_stock_status,
      });
    }

    if (initialValues.connected_date_from || initialValues.connected_date_to) {
      let textOrderCreateDate =
        (initialValues.connected_date_from
          ? ConvertUtcToLocalDate(initialValues.connected_date_from, "DD/MM/YYYY")
          : "??") +
        " ~ " +
        (initialValues.connected_date_to
          ? ConvertUtcToLocalDate(initialValues.connected_date_to, "DD/MM/YYYY")
          : "??");
      list.push({
        key: "created_date",
        name: "Ngày tạo đơn",
        value: textOrderCreateDate,
      });
    }

    return list;
  }, [
    initialValues.sku_or_name_ecommerce,
    initialValues.sku_or_name_core,
    initialValues.update_stock_status,
    initialValues.connected_date_from,
    initialValues.connected_date_to,
  ]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      let dataQuery: any;
      switch (tag.key) {
        case "created_date":
          dataQuery = {
            ...getQueryParamsFromQueryString(queryParamsParsed),
            ...{ connected_date_from: null, connected_date_to: null },
          };
          break;
        default:
          dataQuery = {
            ...getQueryParamsFromQueryString(queryParamsParsed),
            ...{ [tag.key]: null },
          };
          break;
      }

      const queryParam = generateQuery(dataQuery);
      history.push(`${location.pathname}?${queryParam}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, location.search],
  );

  return (
    <StyledComponent>
      <Card>
        <StyledProductFilter>
          <div className="filter">
            <Form form={formAdvance} onFinish={onSearch} initialValues={initialFormValues}>
              {isShowAction && (
                <div className="action-dropdown">
                  <Dropdown overlay={actionList} trigger={["click"]} disabled={isLoading}>
                    <Button className="action-button">
                      <div style={{ marginRight: 10 }}>Thao tác</div>
                      <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
              )}
              <Form.Item name="sku_or_name_ecommerce" className="search-ecommerce-product">
                <Input
                  disabled={isLoading}
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="SKU, tên sản phẩm sàn"
                />
              </Form.Item>

              <Form.Item name="sku_or_name_core" className="search-yody-product">
                <Input
                  disabled={isLoading}
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="SKU, Sản phẩm Yody"
                />
              </Form.Item>

              <Form.Item style={{ marginRight: 10 }}>
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

            {/*tags filter*/}
            <div className="order-filter-tags">
              {filters &&
                filters.map((filter: any, index: any) => {
                  return (
                    <Tag
                      key={index}
                      className="tag"
                      closable
                      onClose={(e) => onCloseTag(e, filter)}
                    >
                      {filter.name}: {filter.value}
                    </Tag>
                  );
                })}
            </div>
          </div>
        </StyledProductFilter>

        <CustomTable
          bordered
          isRowSelection={isShowAction}
          isLoading={isLoading}
          onSelectedChange={onSelectTableRow}
          columns={columns}
          dataSource={variantData.items}
          scroll={{ x: 1400 }}
          sticky={{ offsetScroll: 10, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
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
        width={400}
      >
        <StyledBaseFilter>
          <Form
            form={formAdvance}
            onFinish={onSearch}
            initialValues={initialFormValues}
            layout="vertical"
          >
            <Form.Item name="update_stock_status" label={<b>TRẠNG THÁI ĐỒNG BỘ TỒN KHO</b>}>
              <Select showSearch placeholder="Chọn trạng thái đồng bộ tồn kho" allowClear>
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
                    className={dateButtonSelected === "yesterday" ? "active-btn" : ""}
                  >
                    Hôm qua
                  </Button>

                  <Button
                    onClick={() => onSelectDate("today")}
                    className={dateButtonSelected === "today" ? "active-btn" : ""}
                  >
                    Hôm nay
                  </Button>

                  <Button
                    onClick={() => onSelectDate("thisweek")}
                    className={dateButtonSelected === "thisweek" ? "active-btn" : ""}
                  >
                    Tuần này
                  </Button>
                </div>

                <div className="date-option">
                  <Button
                    onClick={() => onSelectDate("lastweek")}
                    className={dateButtonSelected === "lastweek" ? "active-btn" : ""}
                  >
                    Tuần trước
                  </Button>

                  <Button
                    onClick={() => onSelectDate("thismonth")}
                    className={dateButtonSelected === "thismonth" ? "active-btn" : ""}
                  >
                    Tháng này
                  </Button>

                  <Button
                    onClick={() => onSelectDate("lastmonth")}
                    className={dateButtonSelected === "lastmonth" ? "active-btn" : ""}
                  >
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
                    connectionEndDate ? moment(new Date(connectionEndDate), "DD-MM-YYYY") : null,
                  ]}
                  onChange={(date) => onChangeRangeDate(date)}
                />
              </div>
            </Form.Item>
          </Form>
        </StyledBaseFilter>
      </BaseFilter>

      {isShowModalDisconnect && (
        <Modal
          width="600px"
          visible={isShowModalDisconnect}
          okText="Đồng ý"
          cancelText="Hủy"
          onCancel={cancelDisconnectModal}
          onOk={okDisconnectModal}
        >
          <div>
            <img src={disconnectIcon} style={{ marginRight: 20 }} alt="" />
            <span>Bạn có chắc chắn muốn hủy liên kết sản phẩm không?</span>
          </div>
        </Modal>
      )}

      {isShowDeleteItemModal && (
        <Modal
          width="600px"
          visible={isShowDeleteItemModal}
          okText="Đồng ý"
          cancelText="Hủy"
          onCancel={cancelDeleteItemModal}
          onOk={okDeleteItemModal}
        >
          <div>
            <img src={circleDeleteIcon} style={{ marginRight: 20 }} alt="" />
            <span>Bạn có chắc chắn muốn xóa sản phẩm tải về không?</span>
          </div>
        </Modal>
      )}

      {isShowSyncStockModal && (
        <SyncProductModal
          width="600px"
          visible={isShowSyncStockModal}
          title="Đồng bộ tồn kho"
          okText="Đồng bộ"
          cancelText="Hủy"
          onCancel={() => cancelSyncStockModal()}
          onOk={(item, shop_ids) => okSyncStockModal(item, shop_ids)}
        />
      )}

      {/*Export product modal*/}
      {isShowExportExcelModal && (
        <Modal
          width="600px"
          visible={isShowExportExcelModal}
          title="Xuất excel sản phẩm"
          okText="Tải về"
          cancelText="Hủy"
          onCancel={cancelExportExcelProductModal}
          onOk={okExportExcelProduct}
          okButtonProps={{ disabled: !exportProductType }}
        >
          <Radio.Group onChange={onChangeExportProductOption} value={exportProductType}>
            <Space direction="vertical">
              <Radio value={EXPORT_PRODUCT_OPTION.SELECTED} disabled={selectedRow.length <= 0}>
                Tải sản phẩm đã chọn
              </Radio>
              <Radio value={EXPORT_PRODUCT_OPTION.FILTERED}>
                Tải toàn bộ sản phẩm(toàn bộ sản phẩm trong các trang được lọc)
              </Radio>
            </Space>
          </Radio.Group>
        </Modal>
      )}

      {/*Process export product modal*/}
      {isVisibleProgressModal && (
        <Modal
          onCancel={onCancelProgressModal}
          visible={isVisibleProgressModal}
          title="Xuất file"
          centered
          width={600}
          footer={[
            <Button key="cancel" danger onClick={onCancelProgressModal}>
              Thoát
            </Button>,
          ]}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: 15 }}>Đang tạo file, vui lòng đợi trong giây lát</div>
            <Progress
              type="circle"
              strokeColor={{
                "0%": "#108ee9",
                "100%": "#87d068",
              }}
              percent={exportProcessPercent}
            />
          </div>
        </Modal>
      )}

      {/*Exit export product process modal*/}
      {isVisibleExitProcessModal && (
        <Modal
          width="600px"
          centered
          visible={isVisibleExitProcessModal}
          title=""
          okText="Xác nhận"
          cancelText="Hủy"
          onCancel={onCancelExitProcessModal}
          onOk={onOkExitProcessModal}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={DeleteIcon} alt="" />
            <div style={{ marginLeft: 15 }}>
              <strong style={{ fontSize: 16 }}>
                Bạn có chắc chắn muốn hủy tải sản phẩm không?
              </strong>
              <div style={{ fontSize: 14 }}>
                Hệ thống sẽ dừng việc tải sản phẩm, bạn vẫn có thể tải lại sau nếu muốn.
              </div>
            </div>
          </div>
        </Modal>
      )}
    </StyledComponent>
  );
};

export default ConnectedItems;
