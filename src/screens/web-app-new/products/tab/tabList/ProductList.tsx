import { Card, Modal, Tooltip } from "antd";
import { useDispatch } from "react-redux";
import queryString from "query-string";
import moment from "moment";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import CustomTable from "component/table/CustomTable";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import UrlConfig from "config/url.config";
import useAuthorization from "hook/useAuthorization";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import { StyledProductLink } from "../../styles";
import ProductFilter from "./ProductFilter";
import { StyledStatus } from "screens/web-app/common/commonStyle";
import { ConvertUtcToLocalDate, formatDateTimeFilter } from "utils/DateUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { WebAppProductQuery, WebAppRequestSyncStockQuery } from "model/query/web-app.query";
import {
  deleteWebAppProductAction,
  disconnectWebAppProductAction,
  getWebAppProductAction,
  syncWebAppStockProductAction,
} from "domain/actions/web-app/web-app.actions";
import disconnectIcon from "assets/icon/disconnect.svg";
import circleDeleteIcon from "assets/icon/circle-delete.svg";
import { getParamsFromQuery } from "utils/useQuery";
import { FileExcelOutlined } from "@ant-design/icons";
import { showSuccess } from "utils/ToastUtils";
import ActionColumn from "./ActionColumn";
import SyncProductModal from "../../SyncProductModal";

import warningCircleIcon from "assets/icon/warning-circle.svg";

type ProductListprops = {
  type: string;
  exportFileProduct: (selectedRows: any, params: any) => void;
  syncSingleStock?: (x: any) => void;
  syncMultiStock?: (x: any) => void;
  getVariantData?: (variantData: any) => void;
  isReloadData?: boolean;
};

const ProductList = (props: ProductListprops) => {
  const { type, exportFileProduct, syncSingleStock, syncMultiStock, getVariantData, isReloadData } =
    props;

  //permission
  const productsDownloadPermission = [EcommerceProductPermission.products_download];
  const productsDeletePermission = [EcommerceProductPermission.products_delete];
  const productsUpdateStockPermission = [EcommerceProductPermission.products_update_stock];
  const productsDisconnectPermission = [EcommerceProductPermission.products_disconnect];

  const [allowProductExcel] = useAuthorization({
    acceptPermissions: productsDownloadPermission,
    not: false,
  });
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

  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  //state modal
  const [isLoading, setIsLoading] = useState(false);
  const [isShowSyncStockModal, setIsShowSyncStockModal] = useState(false);
  const [isShowDeleteProductModal, setIsShowDeleteProductModal] = useState(false);
  const [isShowDisconnectModal, setIsShowDisconnectModal] = useState(false);

  //state data
  const [selectedRows, setSelectedRows] = useState<Array<any>>([]);
  const [actionList, setActionList] = useState<Array<any>>([]);
  const [productIds, setProductIds] = useState<Array<any>>([]);
  const [variantData, setVariantData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  //init params
  const initParams: WebAppProductQuery = {
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
  };
  const queryParamsParsed: any = queryString.parse(location.search);
  let dataParams: WebAppProductQuery = {
    ...initParams,
    ...getParamsFromQuery(queryParamsParsed, initParams),
  };
  const [params, setParams] = useState<WebAppProductQuery>(dataParams);

  //handle table
  const handleSelectRowTable = (rows: any) => {
    rows = rows.filter((row: any) => {
      return row !== undefined;
    });
    setSelectedRows(rows);
  };

  //handle filter
  const handleFilter = (value: any) => {
    let newParams = { ...params, ...value, page: 1 };
    if (newParams.connected_date_from != null) {
      newParams.connected_date_from = moment(newParams.connected_date_from, "DD-MM-YYYY").format(
        "DD-MM-YYYY",
      );
    }
    if (newParams.connected_date_to != null) {
      newParams.connected_date_to = moment(newParams.connected_date_to, "DD-MM-YYYY").format(
        "DD-MM-YYYY",
      );
    }
    let queryParam = generateQuery(params);
    let newQueryParam = generateQuery(newParams);
    if (newQueryParam !== queryParam) {
      setParams(newParams);
      history.push(`${location.pathname}?${newQueryParam}`);
    }
  };

  //handle change page
  const handleChangePage = (page: any, limit: any) => {
    const newPrams = { ...params, page: page, limit: limit };
    const queryParam = generateQuery(newPrams);
    setParams(newPrams);
    window.scrollTo(0, 0);
    history.push(`${location.pathname}?${queryParam}`);
  };

  //handle convert date time
  const convertDateTimeFormat = (dateTimeData: any) => {
    const formatDateTime = "DD/MM/YYYY HH:mm:ss";
    return ConvertUtcToLocalDate(dateTimeData, formatDateTime);
  };

  //action list
  useEffect(() => {
    let list: Array<any> = [];
    if (type === "all") {
      list = [
        {
          id: 1,
          icon: <FileExcelOutlined />,
          name: "Xuất excel",
          onClick: () => exportFileProduct(selectedRows, params),
        },
      ];
    } else {
      list = [
        {
          id: 1,
          name: "Xuất excel",
          onClick: () => exportFileProduct(selectedRows, params),
        },
      ];
      if (allowProductsUpdateStock) {
        list.push({
          id: 2,
          name: "Đồng bộ tồn kho lên sàn",
          onClick: () => setIsShowSyncStockModal(true),
          disabled: false,
        });
      }
      if (allowProductsDelete) {
        list.push({
          id: 3,
          name: "Xoá sản phẩm lấy về",
          onClick: () => handleDeleteMultiItem(),
          disabled: !selectedRows || selectedRows.length === 0,
        });
      }
      if (allowProductsDisconnect) {
        list.push({
          id: 4,
          name: "Huỷ liên kết",
          onClick: () => handleDisconnectMultiItem(),
          disabled: !selectedRows || selectedRows.length === 0,
        });
      }
    }
    setActionList(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    type,
    selectedRows,
    variantData,
    allowProductsUpdateStock,
    allowProductsDelete,
    allowProductsDisconnect,
  ]);

  //hande delete item product
  const handleDeleteItem = (item: any) => {
    setIsShowDeleteProductModal(true);
    setProductIds([item.id]);
  };

  const handleDeleteMultiItem = () => {
    setIsShowDeleteProductModal(true);
    let ids = selectedRows.map((a: any) => {
      return a.id;
    });
    setProductIds(ids);
  };

  const handleConfirmDeleteProduct = () => {
    setIsShowDeleteProductModal(false);
    if (productIds) {
      dispatch(
        deleteWebAppProductAction(productIds, (result) => {
          if (result) {
            showSuccess("Xóa sản phẩm thành công");
            getVarinantData();
            let rows = [...selectedRows];
            rows = rows.filter((a) => {
              return !productIds.includes(a.id);
            });
            setSelectedRows(rows);
          }
        }),
      );
    }
  };

  //handle sync stock
  const handleSubmitSyncStock = (item: any, shopIds: any) => {
    let ids = selectedRows.map((a: any) => {
      return a.id;
    });
    setIsShowSyncStockModal(false);
    let requestSyncStock: WebAppRequestSyncStockQuery = {
      sync_type: null,
      shop_ids: null,
      variant_ids: null,
    };
    if (item === "selected") {
      requestSyncStock.sync_type = "selected";
      requestSyncStock.variant_ids = ids;
      requestSyncStock.shop_ids = null;
    } else {
      requestSyncStock.sync_type = "shop";
      requestSyncStock.variant_ids = null;
      requestSyncStock.shop_ids = shopIds;
    }
    dispatch(
      syncWebAppStockProductAction(requestSyncStock, (result) => {
        if (result) {
          syncMultiStock && syncMultiStock(result.process_id);
        }
      }),
    );
  };

  //handle disconnect product
  const handleDisconnectItem = (item: any) => {
    setIsShowDisconnectModal(true);
    setProductIds([item.id]);
  };

  const handleDisconnectMultiItem = () => {
    setIsShowDisconnectModal(true);
    let ids = selectedRows.map((a: any) => {
      return a.id;
    });
    setProductIds(ids);
  };

  const handleConfirmDisconnectProduct = () => {
    if (productIds) {
      dispatch(
        disconnectWebAppProductAction({ ids: productIds }, (result) => {
          if (result) {
            showSuccess("Ngắt kết nối sản phẩm thành công");
            getVarinantData();
          }
          setIsShowDisconnectModal(false);
        }),
      );
    }
  };

  //get variant data
  const getVarinantData = () => {
    setIsLoading(true);
    let newParams = { ...params };
    newParams.connected_date_from = newParams.connected_date_from
      ? moment(newParams.connected_date_from, "DD-MM-YYYY").utc(true).format()
      : null;
    newParams.connected_date_to = newParams.connected_date_to
      ? moment(newParams.connected_date_to, "DD-MM-YYYY").utc(true).format()
      : null;
    if (type === "connected") newParams.connect_status = "connected";
    dispatch(
      getWebAppProductAction(newParams, (result: PageResponse<any> | false) => {
        setIsLoading(false);
        if (!!result) {
          setVariantData(result);
          getVariantData && getVariantData(result);
        }
      }),
    );
  };
  useEffect(() => {
    getVarinantData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, type, isReloadData]);

  //column
  const [columns] = useState<any>([
    {
      title: "Ảnh",
      visible: true,
      align: "center",
      width: "100px",
      render: (item: any) => {
        return <img src={item.ecommerce_image_url} style={{ height: "40px" }} alt="" />;
      },
    },
    {
      title: "Sku/ itemID (Sàn)",
      visible: true,
      width: "150px",
      align: "center",
      render: (item: any) => {
        return (
          <div>
            <div style={{ textAlign: "left" }}>{item.ecommerce_sku}</div>
            <div style={{ color: "#737373", textAlign: "left" }}>{item.ecommerce_product_id}</div>
            <div style={{ color: "#2a2a86", textAlign: "left" }}>({item.shop})</div>
          </div>
        );
      },
    },
    {
      title: "Sản phẩm (Sàn)",
      visible: true,
      align: "center",
      width: "300px",
      render: (item: any) => {
        return <div style={{ textAlign: "left" }}>{item.ecommerce_variant}</div>;
      },
    },
    {
      title: "Giá bán (Sàn)",
      visible: true,
      align: "center",
      width: "120px",
      render: (item: any) => {
        return (
          <div style={{ textAlign: "right" }}>
            {item.ecommerce_price ? formatCurrency(item.ecommerce_price) : "-"}
          </div>
        );
      },
    },
    {
      title: "Sản phẩm (Unicorn)",
      visible: true,
      align: "center",
      width: "300px",
      render: (item: any) => {
        return (
          <>
            {item.connect_status === "connected" && (
              <StyledProductLink>
                <Link
                  target="_blank"
                  to={`${UrlConfig.PRODUCT}/${item.core_product_id}/variants/${item.core_variant_id}`}
                >
                  {item.core_variant}
                </Link>
                <div style={{ textAlign: "left" }}>{item.core_sku}</div>
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
      width: "120px",
      render: (item: any) => {
        return (
          <>
            {item.connect_status === "connected" && (
              <div style={{ textAlign: "right" }}>{formatCurrency(item.core_price)}</div>
            )}
          </>
        );
      },
    },
    {
      title: "Tồn",
      visible: true,
      align: "center",
      width: "80px",
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
            {item.connect_status === "connected" && (
              <div className="green-status" style={{ width: 120 }}>
                Thành công
              </div>
            )}

            {item.connect_status === "waiting" && (
              <div className="blue-status" style={{ width: 120 }}>
                Chưa ghép nối
              </div>
            )}
          </StyledStatus>
        );
      },
    },
    {
      title: "Ngày ghép nối",
      dataIndex: "connected_date_from",
      key: "connected_date",
      align: "center",
      width: "100px",
      render: (value: any, item: any) => (
        <div style={{ textAlign: "center" }}>
          <div>{convertDateTimeFormat(item.connected_date)}</div>
        </div>
      ),
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
          <>
            {item.connect_status === "connected" && (
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
    {
      title: "ngày đồng bộ tồn",
      key: "sync_stock_date",
      align: "center",
      width: "150px",
      render: (value: any, item: any) => (
        <div>
          <div>{ConvertUtcToLocalDate(item.sync_stock_date, "DD/MM/YYYY HH:mm:ss")}</div>
        </div>
      ),
    },
    {
      title: "Log đồng bộ tồn",
      key: "sync_stock_log",
      align: "center",
      width: "10%",
      render: (value: any, item: any) => (
        <div>
          <div>{item.sync_stock_log}</div>
        </div>
      ),
    },
    ActionColumn(handleDeleteItem, syncSingleStock, handleDisconnectItem),
  ]);

  return (
    <>
      <Card>
        <ProductFilter
          params={params}
          onFilter={handleFilter}
          actionList={actionList}
          type={type}
        />
        <CustomTable
          bordered
          isRowSelection={allowProductExcel}
          isLoading={isLoading}
          onSelectedChange={handleSelectRowTable}
          columns={columns}
          dataSource={variantData.items}
          scroll={{ x: 2000 }}
          sticky={{ offsetScroll: 10, offsetHeader: 55 }}
          pagination={{
            pageSize: variantData.metadata && variantData.metadata.limit,
            total: variantData.metadata && variantData.metadata.total,
            current: variantData.metadata && variantData.metadata.page,
            showSizeChanger: true,
            onChange: handleChangePage,
            onShowSizeChange: handleChangePage,
          }}
          rowKey={(data) => data.id}
        />

        {isShowSyncStockModal && (
          <SyncProductModal
            width="600px"
            visible={isShowSyncStockModal}
            title="Đồng bộ tồn kho"
            okText="Đồng bộ"
            cancelText="Hủy"
            isDisabled={!selectedRows || selectedRows.length === 0}
            onCancel={() => setIsShowSyncStockModal(false)}
            onOk={(item, shop_ids) => handleSubmitSyncStock(item, shop_ids)}
          />
        )}
        {isShowDeleteProductModal && (
          <Modal
            width="600px"
            visible={isShowDeleteProductModal}
            okText="Đồng ý"
            cancelText="Hủy"
            onCancel={() => setIsShowDeleteProductModal(false)}
            onOk={handleConfirmDeleteProduct}
          >
            <div>
              <img src={circleDeleteIcon} style={{ marginRight: 20 }} alt="" />
              <span>Bạn có chắc chắn muốn xóa sản phẩm tải về không?</span>
            </div>
          </Modal>
        )}
        {isShowDisconnectModal && (
          <Modal
            width="600px"
            visible={isShowDisconnectModal}
            okText="Đồng ý"
            cancelText="Hủy"
            onCancel={() => setIsShowDisconnectModal(false)}
            onOk={handleConfirmDisconnectProduct}
          >
            <div>
              <img src={disconnectIcon} style={{ marginRight: 20 }} alt="" />
              <span>Bạn có chắc chắn muốn hủy liên kết sản phẩm không?</span>
            </div>
          </Modal>
        )}
      </Card>
    </>
  );
};
export default ProductList;
