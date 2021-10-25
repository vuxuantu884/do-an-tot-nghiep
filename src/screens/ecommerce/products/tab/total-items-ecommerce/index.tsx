import React, { useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Form,
  Select,
  Input,
  Modal,
  Tooltip,
  Checkbox,
  DatePicker,
} from "antd";
import { SearchOutlined, SettingOutlined } from "@ant-design/icons";
import moment from "moment";

import CustomTable from "component/table/CustomTable";
import BaseFilter from "component/filter/base.filter";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import { formatCurrency } from "utils/AppUtils";
import TotalItemActionColumn from "./TotalItemActionColumn";

import { RootReducerType } from "model/reducers/RootReducerType";
import { ProductEcommerceQuery } from "model/query/ecommerce.query";
import {
  getShopEcommerceList,
  deleteEcommerceItem,
  disconnectEcommerceItem,
  postSyncStockEcommerceProduct,
} from "domain/actions/ecommerce/ecommerce.actions";

import disconnectIcon from "assets/icon/disconnect.svg";
import warningCircleIcon from "assets/icon/warning-circle.svg";
import filterIcon from "assets/icon/filter.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import circleDeleteIcon from "assets/icon/circle-delete.svg";
import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";

import {
  StyledBaseFilter,
} from "screens/ecommerce/products/tab/total-items-ecommerce/styles";
import { StyledProductConnectStatus, StyledProductFilter, StyledProductLink } from "screens/ecommerce/products/styles";


type TotalItemsEcommerceProps = {
  categoryList?: Array<any>;
  variantData: any;
  getProductUpdated: any;
  tableLoading: any;
};

const TotalItemsEcommerce: React.FC<TotalItemsEcommerceProps> = (
  props: TotalItemsEcommerceProps
) => {
  const { categoryList, variantData, getProductUpdated, tableLoading } = props;
  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;

  const [visibleFilter, setVisibleFilter] = useState<boolean>(false);
  const [isShowModalDisconnect, setIsShowModalDisconnect] = useState(false);
  const [idDisconnectItem, setIdDisconnectItem] = useState(null);
  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
  const [idDeleteItem, setIdDeleteItem] = useState(null);

  const [isEcommerceSelected, setIsEcommerceSelected] = useState(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState<Array<any>>([]);

  const params: ProductEcommerceQuery = useMemo(
    () => ({
      page: 1,
      limit: 30,
      ecommerce_id: null,
      shop_ids: [],
      category_id: null,
      connect_status: null,
      update_stock_status: null,
      sku_or_name_core: "",
      sku_or_name_ecommerce: "",
      connection_start_date: null,
    }),
    []
  );

  const [query, setQuery] = useState<ProductEcommerceQuery>({
    page: 1,
    limit: 30,
    ecommerce_id: null,
    shop_ids: [],
    category_id: null,
    connect_status: null,
    update_stock_status: null,
    sku_or_name_core: "",
    sku_or_name_ecommerce: "",
    connection_start_date: null,
  });

  const updateEcommerceShopList = React.useCallback((result) => {
    const shopList: any[] = [];
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        shopList.push({
          id: item.id,
          name: item.name,
          isSelected: false,
          ecommerce: item.ecommerce,
        });
      });
    }
    setEcommerceShopList(shopList);
  }, []);

  const reloadPage = () => {
    getProductUpdated(query);
  };

  //handle sync stock
  const handleSyncStock = (item: any) => {
    const requestSyncStock = {
      variant_ids: [item.id],
      all: false,
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

  const convertDateTimeFormat = (dateTimeData: any) => {
    const formatDateTime = "DD/MM/YYYY HH:mm:ss";
    return ConvertUtcToLocalDate(dateTimeData, formatDateTime);
  };

  const [columns] = useState<any>([
    {
      title: "Ảnh",
      visible: true,
      align: "center",
      width: "70px",
      render: (l: any, v: any, i: any) => {
        return (
          <img
            src={l.ecommerce_image_url}
            style={{ height: "40px" }}
            alt=""
          ></img>
        );
      },
    },
    {
      title: "Sku/ itemID (Sàn)",
      visible: true,
      width: "150px",
      render: (l: any, v: any, i: any) => {
        return (
          <div>
            <div>{l.ecommerce_sku}</div>
            <div style={{ color: "#737373" }}>{l.ecommerce_product_id}</div>
            <div style={{ color: "#2a2a86" }}>({l.shop})</div>
          </div>
        );
      },
    },
    {
      title: "Sản phẩm (Sàn)",
      visible: true,
      width: "300px",
      render: (l: any, v: any, i: any) => {
        return <div>{l.ecommerce_variant}</div>;
      },
    },
    {
      title: "Giá bán (Sàn)",
      visible: true,
      align: "center",
      width: "100px",
      render: (l: any, v: any, i: any) => {
        return (
          <span>
            {l.ecommerce_price ? formatCurrency(l.ecommerce_price) : "-"}
          </span>
        );
      },
    },
    {
      title: "Sản phẩm (Yody)",
      visible: true,
      render: (l: any, v: any, i: any) => {
        const link = `https://dev.yody.io/unicorn/admin/products/${l.core_product_id}/variants/${l.core_variant_id}`;
        return (
          <StyledProductLink>
            <a href={link} rel="noreferrer" target="_blank">{l.core_variant}</a>
            <div>{l.core_sku}</div>
          </StyledProductLink>
        );
      },
    },
    {
      title: "Giá bán (Yody)",
      visible: true,
      align: "center",
      width: "100px",
      render: (l: any, v: any, i: any) => {
        return <span>{formatCurrency(l.core_price)}</span>;
      },
    },
    {
      title: "Tồn",
      visible: true,
      align: "center",
      width: "60px",
      render: (l: any, v: any, i: any) => {
        return <span>{l.stock}</span>;
      },
    },
    {
      title: "Ghép nối",
      visible: true,
      align: "center",
      width: "150px",
      render: (l: any, v: any, i: any) => {
        return (
          <StyledProductConnectStatus>
            {l.connect_status === "connected" && (
              <span className="success-status">Thành công</span>
            )}
            {l.connect_status === "waiting" && (
              <span className="not-connect-status">Chưa ghép nối</span>
            )}
          </StyledProductConnectStatus>
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
              trigger="click"
              color="blue"
            >
              <img
                src={warningCircleIcon}
                style={{ marginLeft: 5, cursor: "pointer" }}
                alt=""
              />
            </Tooltip>
          </div>
        );
      },
      visible: true,
      align: "center",
      width: "150px",
      render: (l: any, v: any, i: any) => {
        return (
          <StyledProductConnectStatus>
            {l.sync_stock_status === "done" && (
              <Tooltip title={convertDateTimeFormat(l.updated_date)}>
                <span className="success-status">Thành công</span>
              </Tooltip>
            )}

            {l.sync_stock_status === "error" && (
              <Tooltip title="error">
                <span className="error-status">Thất bại</span>
              </Tooltip>
            )}

            {l.sync_stock_status === "in_progress" && (
              <span className="warning-status">Đang xử lý</span>
            )}
          </StyledProductConnectStatus>
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
      value.shop_ids = shopIdSelected;

      query.ecommerce_id = value.ecommerce_id;
      query.shop_ids = value.shop_ids;
      query.category_id = value.category_id;
      query.connect_status = value.connect_status;
      query.update_stock_status = value.update_stock_status;
      query.sku_or_name_ecommerce = value.sku_or_name_ecommerce;
      query.sku_or_name_core = value.sku_or_name_core;
      query.connection_start_date = value.connection_start_date;
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
    },
    [query, getProductUpdated]
  );

  const getShopEcommerce = (ecommerceId: any) => {
    setIsEcommerceSelected(true);
    setShopIdSelected([]);
    dispatch(
      getShopEcommerceList(
        { ecommerce_id: ecommerceId },
        updateEcommerceShopList
      )
    );
  };

  const removeEcommerce = () => {
    setIsEcommerceSelected(false);
    setShopIdSelected([]);
    dispatch(getShopEcommerceList({}, updateEcommerceShopList));
  };

  const ECOMMERCE_LIST = [
    {
      title: "Sàn Shopee",
      icon: shopeeIcon,
      id: "shopee",
      ecommerce_id: 1,
    },
    {
      title: "Sàn Tiki",
      icon: tikiIcon,
      id: "tiki",
      ecommerce_id: 2,
    },
    {
      title: "Sàn Lazada",
      icon: lazadaIcon,
      id: "lazada",
      ecommerce_id: 3,
    },
    {
      title: "Sàn Sendo",
      icon: sendoIcon,
      id: "sendo",
      isActive: false,
      ecommerce_id: 4,
    },
  ];

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );

  const STOCK_STATUS = bootstrapReducer.data?.stock_sync_status;
  const CONNECT_STATUS = bootstrapReducer.data?.connect_product_status;

  const onFilterClick = React.useCallback(() => {
    setVisibleFilter(false);
    formAdvance.submit();
  }, [formAdvance]);

  const onClearFilterAdvanceClick = React.useCallback(() => {
    formAdvance.setFieldsValue(params);
    setVisibleFilter(false);
    formAdvance.submit();
  }, [formAdvance, params]);

  const openFilter = React.useCallback(() => {
    setVisibleFilter(true);
  }, []);

  const onCancelFilter = React.useCallback(() => {
    setVisibleFilter(false);
  }, []);

  const getPlaceholderSelectShop = () => {
    if (shopIdSelected && shopIdSelected.length > 0) {
      return `Đã chọn: ${shopIdSelected.length} gian hàng`;
    } else {
      return "Chọn gian hàng";
    }
  };

  const onCheckedChange = (shop: any, e: any) => {
    if (e.target.checked) {
      shop.isSelected = true;
      const shopSelected = [...shopIdSelected];
      shopSelected.push(shop.id);
      setShopIdSelected(shopSelected);
    } else {
      shop.isSelected = false;
      const shopSelected =
        shopIdSelected &&
        shopIdSelected.filter((item: any) => {
          return item !== shop.id;
        });
      setShopIdSelected(shopSelected);
    }
  };

  const getEcommerceIcon = (shop: any) => {
    switch (shop) {
      case "shopee":
        return shopeeIcon;
      case "lazada":
        return lazadaIcon;
      case "tiki":
        return tikiIcon;
      case "sendo":
        return sendoIcon;
      default:
        break;
    }
  };

  const renderShopList = (isNewFilter: any) => {
    return (
      <StyledProductFilter>
        <div className="render-shop-list">
          {ecommerceShopList.map((item: any) => (
            <div key={item.id} className="shop-name">
              <Checkbox
                onChange={(e) => onCheckedChange(item, e)}
                checked={item.isSelected}
              >
                <span className="check-box-name">
                  <span>
                    <img
                      src={getEcommerceIcon(item.ecommerce)}
                      alt={item.id}
                      style={{ marginRight: "5px", height: "16px" }}
                    />
                  </span>
                  <Tooltip title={item.name} color="#1890ff" placement="right">
                    <span
                      className="name"
                      style={isNewFilter ? { width: 270 } : { width: 120 }}
                    >
                      {item.name}
                    </span>
                  </Tooltip>
                </span>
              </Checkbox>
            </div>
          ))}

          {ecommerceShopList.length === 0 && (
            <div style={{ color: "#737373", padding: 10 }}>
              Không có dữ liệu
            </div>
          )}
        </div>
      </StyledProductFilter>
    );
  };

  const removeSelectedShop = () => {
    const copyEcommerceShopList = [...ecommerceShopList];
    copyEcommerceShopList.forEach((item: any) => {
      item.isSelected = false;
    });

    setEcommerceShopList(copyEcommerceShopList);
    setShopIdSelected([]);
  };

  //handle select connection date

  //todo thai: need update
  const [connectionStartDate, setConnectionStartDate] = useState(
    params.connection_start_date
      ? moment(params.connection_start_date, "DD-MM-YYYY")
      : null
  );
  const [connectionEndDate, setConnectionEndDate] = useState(
    params.connection_start_date
      ? moment(params.connection_start_date, "DD-MM-YYYY")
      : null
  );

  const [dateButtonSelected, setDateButtonSelected] = useState("");

  const onSelectDate = useCallback(
    (value) => {
      let startDateValue = null;
      let endDateValue = null;

      switch (value) {
        case "today":
          startDateValue = moment().startOf("day").format("DD-MM-YYYY");
          endDateValue = moment().endOf("day").format("DD-MM-YYYY");
          break;
        case "yesterday":
          startDateValue = moment()
            .startOf("day")
            .subtract(1, "days")
            .format("DD-MM-YYYY");
          endDateValue = moment()
            .endOf("day")
            .subtract(1, "days")
            .format("DD-MM-YYYY");
          break;
        case "thisweek":
          startDateValue = moment().startOf("week").format("DD-MM-YYYY");
          endDateValue = moment().endOf("week").format("DD-MM-YYYY");
          break;
        case "lastweek":
          startDateValue = moment()
            .startOf("week")
            .subtract(1, "weeks")
            .format("DD-MM-YYYY");
          endDateValue = moment()
            .endOf("week")
            .subtract(1, "weeks")
            .format("DD-MM-YYYY");
          break;
        case "thismonth":
          startDateValue = moment().startOf("month").format("DD-MM-YYYY");
          endDateValue = moment().endOf("month").format("DD-MM-YYYY");
          break;
        case "lastmonth":
          startDateValue = moment()
            .startOf("month")
            .subtract(1, "months")
            .format("DD-MM-YYYY");
          endDateValue = moment()
            .endOf("month")
            .subtract(1, "months")
            .format("DD-MM-YYYY");
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
        setConnectionStartDate(moment(startDateValue, "DD-MM-YYYY"));
        setConnectionEndDate(moment(endDateValue, "DD-MM-YYYY"));
      }
    },
    [dateButtonSelected]
  );

  const onChangeRangeDate = useCallback((dates, dateString) => {
    setDateButtonSelected("");
    setConnectionStartDate(dateString[0]);
    setConnectionEndDate(dateString[1]);
  }, []);
  //end handle select connection date

  return (
    <div>
      <StyledProductFilter>
        <div className="filter">
          <Form form={formAdvance} onFinish={onSearch} initialValues={params}>
            <Form.Item name="ecommerce_id" className="select-channel-dropdown">
              <Select
                showSearch
                disabled={tableLoading}
                placeholder="Chọn sàn"
                allowClear
                onSelect={(value) => getShopEcommerce(value)}
                onClear={removeEcommerce}
              >
                {ECOMMERCE_LIST &&
                  ECOMMERCE_LIST.map((item: any) => (
                    <Option key={item.ecommerce_id} value={item.ecommerce_id}>
                      <div>
                        <img
                          src={item.icon}
                          alt={item.id}
                          style={{ marginRight: "10px" }}
                        />
                        <span>{item.title}</span>
                      </div>
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item className="select-store-dropdown">
              {isEcommerceSelected && (
                <Select
                  showSearch
                  disabled={tableLoading || !isEcommerceSelected}
                  placeholder={getPlaceholderSelectShop()}
                  allowClear={shopIdSelected && shopIdSelected.length > 0}
                  dropdownRender={() => renderShopList(false)}
                  onClear={removeSelectedShop}
                />
              )}

              {!isEcommerceSelected && (
                <Tooltip title="Yêu cầu chọn sàn" color={"blue"}>
                  <Select
                    showSearch
                    disabled={true}
                    placeholder={getPlaceholderSelectShop()}
                    allowClear={shopIdSelected && shopIdSelected.length > 0}
                    dropdownRender={() => renderShopList(false)}
                    onClear={removeSelectedShop}
                  />
                </Tooltip>
              )}
            </Form.Item>

            <Form.Item name="sku_or_name_ecommerce" className="shoppe-search">
              <Input
                disabled={tableLoading}
                prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                placeholder="SKU, tên sản phẩm sàn"
              />
            </Form.Item>

            <Form.Item name="sku_or_name_core" className="yody-search">
              <Input
                disabled={tableLoading}
                prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                placeholder="SKU, Sản phẩm Yody"
              />
            </Form.Item>

            <Form.Item className="filter-item">
              <Button type="primary" htmlType="submit" disabled={tableLoading}>
                Lọc
              </Button>
            </Form.Item>

            <Form.Item className="filter-item">
              <Button onClick={openFilter} disabled={tableLoading}>
                <img src={filterIcon} style={{ marginRight: 10 }} alt="" />
                <span>Thêm bộ lọc</span>
              </Button>
            </Form.Item>
          </Form>
        </div>
      </StyledProductFilter>

      <CustomTable
        isLoading={tableLoading}
        columns={columns}
        dataSource={variantData.items}
        scroll={{ x: 1500 }}
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

      <BaseFilter
        onClearFilter={onClearFilterAdvanceClick}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visibleFilter}
        width={400}
        footerStyle={{
          display: "flex",
          flexDirection: "row-reverse",
          justifyContent: "space-between",
        }}
        confirmButtonTitle="Áp dụng bộ lọc"
        deleteButtonTitle={
          <div>
            <img src={deleteIcon} style={{ marginRight: 10 }} alt="" />
            <span style={{ color: "red" }}>Xóa bộ lọc</span>
          </div>
        }
      >
        <StyledBaseFilter>
          <Form
            form={formAdvance}
            onFinish={onSearch}
            //ref={formRef}
            initialValues={params}
            layout="vertical"
          >
            <Form.Item name="ecommerce_id" label={<b>CHỌN SÀN</b>}>
              <Select
                showSearch
                placeholder="Chọn sàn"
                allowClear
                onSelect={(value) => getShopEcommerce(value)}
                onClear={removeEcommerce}
              >
                {ECOMMERCE_LIST &&
                  ECOMMERCE_LIST.map((item: any) => (
                    <Option key={item.ecommerce_id} value={item.ecommerce_id}>
                      <div>
                        <img
                          src={item.icon}
                          alt={item.id}
                          style={{ marginRight: "10px" }}
                        />
                        <span>{item.title}</span>
                      </div>
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item label={<b>CHỌN GIAN HÀNG</b>}>
              {isEcommerceSelected && (
                <Select
                  showSearch
                  disabled={tableLoading || !isEcommerceSelected}
                  placeholder={getPlaceholderSelectShop()}
                  allowClear={shopIdSelected && shopIdSelected.length > 0}
                  dropdownRender={() => renderShopList(true)}
                  onClear={removeSelectedShop}
                />
              )}

              {!isEcommerceSelected && (
                <Tooltip title="Yêu cầu chọn sàn" color={"blue"}>
                  <Select
                    showSearch
                    disabled={true}
                    placeholder={getPlaceholderSelectShop()}
                    allowClear={shopIdSelected && shopIdSelected.length > 0}
                    dropdownRender={() => renderShopList(true)}
                    onClear={removeSelectedShop}
                  />
                </Tooltip>
              )}
            </Form.Item>

            <Form.Item name="category_id" label={<b>DANH MỤC</b>}>
              <Select showSearch placeholder="Chọn danh mục" allowClear>
                {categoryList &&
                  categoryList.map((item: any) => (
                    <Option key={item.category_id} value={item.category_id}>
                      {item.display_category_name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="connect_status"
              label={<b>TRẠNG THÁI GHÉP NỐI</b>}
            >
              <Select
                showSearch
                placeholder="Chọn trạng thái ghép nối"
                allowClear
              >
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
              label={<b>TRẠNG THÁI ĐỒNG BỘ TỒN KHO</b>}
            >
              <Select
                showSearch
                placeholder="Chọn trạng thái đồng bộ tồn kho"
                allowClear
              >
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
                    }
                  >
                    Hôm qua
                  </Button>
                  <Button
                    onClick={() => onSelectDate("today")}
                    className={
                      dateButtonSelected === "today" ? "active-btn" : ""
                    }
                  >
                    Hôm nay
                  </Button>
                  <Button
                    onClick={() => onSelectDate("thisweek")}
                    className={
                      dateButtonSelected === "thisweek" ? "active-btn" : ""
                    }
                  >
                    Tuần này
                  </Button>
                </div>
                <div className="date-option">
                  <Button
                    onClick={() => onSelectDate("lastweek")}
                    className={
                      dateButtonSelected === "lastweek" ? "active-btn" : ""
                    }
                  >
                    Tuần trước
                  </Button>
                  <Button
                    onClick={() => onSelectDate("thismonth")}
                    className={
                      dateButtonSelected === "thismonth" ? "active-btn" : ""
                    }
                  >
                    Tháng này
                  </Button>
                  <Button
                    onClick={() => onSelectDate("lastmonth")}
                    className={
                      dateButtonSelected === "lastmonth" ? "active-btn" : ""
                    }
                  >
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
                      ? moment(connectionStartDate, "DD-MM-YYYY")
                      : null,
                    connectionEndDate
                      ? moment(connectionEndDate, "DD-MM-YYYY")
                      : null,
                  ]}
                  onChange={(date, dateString) =>
                    onChangeRangeDate(date, dateString)
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
        onOk={okDisconnectModal}
      >
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
        onOk={okDeleteItemModal}
      >
        <div style={{ margin: "20px 0" }}>
          <img src={circleDeleteIcon} style={{ marginRight: 20 }} alt="" />
          <span>Bạn có chắc chắn muốn xóa sản phẩm tải về không?</span>
        </div>
      </Modal>
    </div>
  );
};

export default TotalItemsEcommerce;
