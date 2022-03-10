import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Button,
  Form,
  Select,
  Input,
  Modal,
  Tooltip,
  DatePicker,
  Card,
  Dropdown,
  Menu,
  Radio,
  Space,
  Progress,
  TreeSelect,
} from "antd";
import { DownOutlined, SearchOutlined, SettingOutlined } from "@ant-design/icons";
import moment from "moment";

import CustomTable from "component/table/CustomTable";
import BaseFilter from "component/filter/base.filter";
import { ConvertDateToUtc, ConvertUtcToLocalDate } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { formatCurrency } from "utils/AppUtils";
import {fullTextSearch} from "utils/StringUtils";
import UrlConfig from "config/url.config";
import TotalItemActionColumn from "screens/ecommerce/products/tab/total-items-ecommerce/TotalItemActionColumn";

import { RootReducerType } from "model/reducers/RootReducerType";
import { ProductEcommerceQuery, RequestExportExcelQuery } from "model/query/ecommerce.query";
import { PageResponse } from "model/base/base-metadata.response";
import {
  getShopEcommerceList,
  deleteEcommerceItem,
  disconnectEcommerceItem,
  postSyncStockEcommerceProduct,
  getProductEcommerceList,
} from "domain/actions/ecommerce/ecommerce.actions";

import disconnectIcon from "assets/icon/disconnect.svg";
import warningCircleIcon from "assets/icon/warning-circle.svg";
import filterIcon from "assets/icon/filter.svg";
import circleDeleteIcon from "assets/icon/circle-delete.svg";

import { StyledBaseFilter, StyledComponent } from "screens/ecommerce/products/tab/total-items-ecommerce/styles";
import {
  StyledProductFilter,
  StyledProductLink,
} from "screens/ecommerce/products/styles";
import {
  ECOMMERCE_LIST,
  getEcommerceIcon,
} from "screens/ecommerce/common/commonAction";
import { StyledStatus } from "screens/ecommerce/common/commonStyle";
import useAuthorization from "hook/useAuthorization";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import {
  exportFileProduct,
  getFileProduct
} from "service/other/export.service";
import { HttpStatus } from "config/http-status.config";
import BaseResponse from "base/base.response";

const STATUS = {
  WAITING: "waiting",
  CONNECTED: "connected",
};

type TotalItemsEcommercePropsType = {
  isReloadPage: boolean;
};

const TotalItemsEcommerce: React.FC<TotalItemsEcommercePropsType> = (
  props: TotalItemsEcommercePropsType
) => {
  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;

  const { isReloadPage } = props;

  const productsDownloadPermission = [
    EcommerceProductPermission.products_download
  ]

  const [allowProductExcel] = useAuthorization({
    acceptPermissions: productsDownloadPermission,
    not: false,
  })

  const isShowAction = allowProductExcel

  const [isLoading, setIsLoading] = useState(false);

  const [visibleFilter, setVisibleFilter] = useState<boolean>(false);
  const [isShowModalDisconnect, setIsShowModalDisconnect] = useState(false);
  const [idDisconnectItem, setIdDisconnectItem] = useState(null);
  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
  const [isShowExportExcelModal, setIsShowExportExcelModal] = useState(false);
  const [idDeleteItem, setIdDeleteItem] = useState(null);
  const [idsItemSelected, setIdsItemSelected] = useState<Array<any>>([]);

  // export product
  const [isShowBtnExportProduct, setShowBtnExportProduct] = useState(true)
  const [isTypeExportProduct, setTypeExportProduct] = useState(false)

  const [exportProcessId, setExportProcessId] = useState<any>(null);

  // process export modal
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const [ecommerceIdSelected, setEcommerceIdSelected] = useState(null);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);

  const [selectedRow, setSelectedRow] = useState<Array<any>>([]);
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
      connect_status: null,
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
    connect_status: null,
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
  }, [getProductUpdated, query, isReloadPage]);

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
          showSuccess("Đồng bộ tồn kho sản phẩm thành công");
          reloadPage();
        }
      })
    );
  };
  //end handle sync stock

  //handle delete item
  const handleDeleteItem = (item: any) => {
    setIsShowDeleteItemModal(true);
    setIdDeleteItem(item.id);
  };

  const cancelDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);
  };

  const okDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);

    if (idDeleteItem) {
      dispatch(
        deleteEcommerceItem([idDeleteItem], (result) => {
          if (result) {
            showSuccess("Xóa sản phẩm thành công");
            reloadPage();
          }
        })
      );
    }
  };
  //end handle delete item

  //handle disconnect item
  const handleDisconnectItem = (item: any) => {
    setIsShowModalDisconnect(true);
    setIdDisconnectItem(item.id);
  };

  const cancelDisconnectModal = () => {
    setIsShowModalDisconnect(false);
  };

  const okDisconnectModal = () => {
    setIsShowModalDisconnect(false);

    dispatch(
      disconnectEcommerceItem({ ids: [idDisconnectItem] }, (result) => {
        if (result) {
          showSuccess("Ngắt kết nối sản phẩm thành công");
          reloadPage();
        }
      })
    );
  };
  //end handle disconnect item

  //handle convert date time
  const convertDateTimeFormat = (dateTimeData: any) => {
    const formatDateTime = "DD/MM/YYYY HH:mm:ss";
    return ConvertUtcToLocalDate(dateTimeData, formatDateTime);
  };
  //end handle convert date time

  const [columns] = useState<any>([
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
          <>
            {item.connect_status === STATUS.CONNECTED && (
              <StyledProductLink>
                <Link
                  target="_blank"
                  to={`${UrlConfig.PRODUCT}/${item.core_product_id}/variants/${item.core_variant_id}`}>
                  {item.core_variant}
                </Link>
                <div>{item.core_sku}</div>
              </StyledProductLink>
            )}
          </>
        );
      },
    },
    {
      title: "Giá bán (Yody)",
      visible: true,
      align: "center",
      width: "100px",
      render: (item: any) => {
        return (
          <>
            {item.connect_status === STATUS.CONNECTED && (
              <span>{formatCurrency(item.core_price)}</span>
            )}
          </>
        );
      },
    },
    {
      title: "Tồn",
      visible: true,
      align: "center",
      width: "60px",
      render: (l: any) => {
        return <span>{l.stock}</span>;
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
            {item.connect_status === STATUS.CONNECTED && (
              <div className="green-status" style={{ width: 120 }}>
                Thành công
              </div>
            )}

            {item.connect_status === STATUS.WAITING && (
              <div className="blue-status" style={{ width: 120 }}>
                Chưa ghép nối
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
          <>
            {item.connect_status === STATUS.CONNECTED && (
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
            )}
          </>
        );
      },
    },

    TotalItemActionColumn(
      handleSyncStock,
      handleDeleteItem,
      handleDisconnectItem
    ),
  ]);

  const onSearch = (value: ProductEcommerceQuery) => {
    if (value) {
      value.connected_date_from = connectionStartDate;
      value.connected_date_to = connectionEndDate;

      query.ecommerce_id = value.ecommerce_id;
      query.shop_ids = value.shop_ids;
      query.connect_status = value.connect_status;
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

  // get ecommerce shop list
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
  // end get ecommerce shop list

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
  const CONNECT_STATUS = bootstrapReducer.data?.connect_product_status;

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

  //handle select connection date
  const [connectionStartDate, setConnectionStartDate] = useState(
    initialFormValues.connected_date_from || null
  );
  const [connectionEndDate, setConnectionEndDate] = useState(
    initialFormValues.connected_date_to || null
  );

  const [dateButtonSelected, setDateButtonSelected] = useState("");

  const onSelectDate = useCallback(
    (value) => {
      let startDateValue = null;
      let endDateValue = null;

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

  const onSelectTableRow = React.useCallback((selectedRow: Array<any>) => {
    const newSelectedRow = selectedRow.filter((row: any) => {
      return row !== undefined;
    });
    setSelectedRow(newSelectedRow);
  }, []);



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

  // end handle export file

  const actionList = (
    <Menu>
      <Menu.Item key="1">
        <span onClick={handleExportExcelProduct}>
          Xuất excel
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
  <StyledComponent>
    <div>
      <Card>
        <StyledProductFilter>
          <div className="filter">
            <Form
              form={formAdvance}
              onFinish={onSearch}
              initialValues={initialFormValues}>
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

              <Form.Item className="filter-item">
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
        width={400}
        className="order-filter-drawer2">
        <StyledBaseFilter>
          <Form
            form={formAdvance}
            onFinish={onSearch}
            initialValues={initialFormValues}
            layout="vertical">
            <Form.Item name="connect_status" label={<b>TRẠNG THÁI GHÉP NỐI</b>}>
              <Select
                showSearch
                placeholder="Chọn trạng thái ghép nối"
                allowClear>
                {CONNECT_STATUS &&
                  CONNECT_STATUS.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

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

                <span style={{ margin: "10px 0" }}>
                  <SettingOutlined style={{ marginRight: "5px" }} />
                  Tùy chọn khoảng thời gian tạo:
                </span>
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
                  onChange={(date) =>
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
        <div style={{ margin: "20px 0" }}>
          <img src={circleDeleteIcon} style={{ marginRight: 20 }} alt="" />
          <span>Bạn có chắc chắn muốn xóa sản phẩm tải về không?</span>
        </div>
      </Modal>
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
    </div>
  </StyledComponent>
  );
};

export default TotalItemsEcommerce;
