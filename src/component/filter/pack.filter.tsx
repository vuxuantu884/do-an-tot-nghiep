import { Button, Col, Form, FormInstance, Input, Row, Tag, Space, Menu, Dropdown } from "antd";

import { MenuAction } from "component/table/ActionButton";
import React, {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { SettingOutlined, FilterOutlined, DownOutlined } from "@ant-design/icons";
import "./order.filter.scss";
import CustomSelect from "component/custom/select.custom";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { GoodsReceiptsSearchQuery } from "model/query/goods-receipts.query";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import NumberInput from "component/custom/number-input.custom";
import { StoreResponse } from "model/core/store.model";
import { haveAccess } from "utils/AppUtils";
import { useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";

type ReturnFilterProps = {
  params: GoodsReceiptsSearchQuery;
  actions: Array<MenuAction>;
  isLoading?: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: GoodsReceiptsSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
  deliveryServices: DeliveryServiceResponse[];
};

const { Item } = Form;

const PackFilter: React.FC<ReturnFilterProps> = (props: ReturnFilterProps) => {
  const {
    params,
    actions,
    //isLoading,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
    deliveryServices,
  } = props;

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const orderPackContextData = useContext(OrderPackContext);
  const listStores = orderPackContextData.listStores;
  const listChannels = orderPackContextData.listChannels;
  const listThirdPartyLogistics = deliveryServices;
  const listGoodsReceiptsType = orderPackContextData.listGoodsReceiptsType;

  const [visible, setVisible] = useState(false);
  const [rerender, setRerender] = useState(false);
  const [listStoresDataCanAccess, setListStoresDataCanAccess] = useState<Array<StoreResponse>>([]);

  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const onFilterClick = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  const openFilter = useCallback(() => {
    setVisible(true);
    setRerender(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
    // setRerender(false);
  }, []);

  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick],
  );

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      setRerender(false);
      switch (tag.key) {
        case "store":
          onFilter && onFilter({ ...params, store_ids: undefined });
          break;

        case "delivery_service_ids":
          onFilter && onFilter({ ...params, delivery_service_ids: undefined });
          break;
        case "ecommerce_ids":
          onFilter && onFilter({ ...params, ecommerce_ids: undefined });
          break;
        case "good_receipt_type_ids":
          onFilter && onFilter({ ...params, good_receipt_type_ids: undefined });
          break;
        case "created":
          setCreatedClick("");
          onFilter && onFilter({ ...params, from_date: null, to_date: null });
          break;

        default:
          break;
      }
    },
    [onFilter, params],
  );

  const [createdClick, setCreatedClick] = useState("");

  const initialValues = useMemo(() => {
    return {
      ...params,
      ecommerce_ids: params.ecommerce_ids
        ? Array.isArray(params.ecommerce_ids)
          ? params.ecommerce_ids
          : [params.ecommerce_ids]
        : [],
      delivery_service_ids: params.delivery_service_ids
        ? Array.isArray(params.delivery_service_ids)
          ? params.delivery_service_ids
          : [params.delivery_service_ids]
        : [],
      good_receipt_type_ids: params.good_receipt_type_ids
        ? Array.isArray(params.good_receipt_type_ids)
          ? params.good_receipt_type_ids
          : [params.good_receipt_type_ids]
        : [],
      store_ids: params.store_ids
        ? Array.isArray(params.store_ids)
          ? params.store_ids
          : [params.store_ids]
        : [],
    };
  }, [params]);

  const onFinish = useCallback(
    (values) => {
      let error = false;
      formRef?.current?.getFieldsError(["from_date", "to_date"]).forEach((field) => {
        if (field.errors.length) {
          error = true;
        }
      });
      if (!error) {
        setVisible(false);
        // const valuesForm = {
        //   ...params,
        //   store_id: values.store_id,
        //   delivery_service_id: values.delivery_service_id,
        //   ecommerce_id: values.ecommerce_id,
        //   good_receipt_type_id: values.good_receipt_type_id,
        //   good_receipt_id: values.good_receipt_id,
        //   order_id: values.order_id,
        //   from_date: values.from_date,
        //   to_date: values.to_date,
        // };
        onFilter && onFilter(values);
        setRerender(false);
      }
    },
    [formRef, onFilter],
  );

  let filters = useMemo(() => {
    let list = [];
    const splitCharacter = ", ";
    const renderSplitCharacter = (index: number, mappedArray: any[]) => {
      let result = null;
      if (index !== mappedArray.length - 1) {
        result = <React.Fragment>{splitCharacter}</React.Fragment>;
      }
      return result;
    };

    if (initialValues.store_ids && initialValues.store_ids.length > 0) {
      let mappedStores = listStores?.filter((store) =>
        initialValues.store_ids?.some((single) => single?.toString() === store.id.toString()),
      );

      let textStores = mappedStores.map((single, index) => {
        return (
          <Link to={`${UrlConfig.STORE}/${single.code}`} target="_blank" key={single.code}>
            {single.code} - {single.name}
            {renderSplitCharacter(index, mappedStores)}
          </Link>
        );
      });

      list.push({
        key: "store",
        name: "Cửa hàng",
        value: textStores,
      });
    }

    if (initialValues.delivery_service_ids && initialValues.delivery_service_ids?.length > 0) {
      let mappeDeliveryService = listThirdPartyLogistics?.filter((store) =>
        initialValues.delivery_service_ids?.some(
          (single) => single?.toString() === store.id.toString(),
        ),
      );

      let textStores = mappeDeliveryService.map((single, index) => {
        return (
          <span key={single.code}>
            {single.code} - {single.name}
            {renderSplitCharacter(index, mappeDeliveryService)}
          </span>
        );
      });

      list.push({
        key: "delivery_service_ids",
        name: "Hãng vận chuyển",
        value: textStores,
      });
    }

    if (initialValues.ecommerce_ids?.length) {
      let mappeEcomerceId = listChannels?.filter((change) =>
        initialValues.ecommerce_ids?.some((single) => single?.toString() === change.id.toString()),
      );

      let textStores = mappeEcomerceId.map((single, index) => {
        return (
          <span key={single.code}>
            {single.code} - {single.name}
            {renderSplitCharacter(index, mappeEcomerceId)}
          </span>
        );
      });

      list.push({
        key: "ecommerce_ids",
        name: "Kiểu biên bản",
        value: textStores,
      });
    }

    if (initialValues.good_receipt_type_ids?.length) {
      let mappeGoodReceiptTypeId = listGoodsReceiptsType?.filter((change) =>
        initialValues.good_receipt_type_ids?.some(
          (single) => single?.toString() === change.id.toString(),
        ),
      );

      let textStores = mappeGoodReceiptTypeId?.map((single, index) => {
        return (
          <span key={single.code}>
            {single.code} - {single.name}
            {renderSplitCharacter(index, mappeGoodReceiptTypeId || [])}
          </span>
        );
      });

      list.push({
        key: "good_receipt_type_ids",
        name: "Loại biên bản",
        value: textStores,
      });
    }

    if (initialValues.from_date || initialValues.to_date) {
      let textOrderCreatedDate =
        (initialValues.from_date ? initialValues.from_date : "??") +
        " ~ " +
        (initialValues.to_date ? initialValues.to_date : "??");
      list.push({
        key: "created",
        name: "Thời gian",
        value: textOrderCreatedDate,
      });
    }

    return list;
  }, [initialValues, listChannels, listGoodsReceiptsType, listStores, listThirdPartyLogistics]);

  const widthScreen = () => {
    if (window.innerWidth >= 1600) {
      return 400;
    } else if (window.innerWidth < 1600 && window.innerWidth >= 1200) {
      return 350;
    } else {
      return 400;
    }
  };
  const clearFilter = () => {
    onClearFilter && onClearFilter();
    setCreatedClick("");

    setVisible(false);
    setRerender(false);
  };
  useLayoutEffect(() => {
    window.addEventListener("resize", () => setVisible(false));
  }, []);

  useEffect(() => {
    let newData: Array<StoreResponse> = [];
    if (listStores && listStores.length > 0) {
      if (userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0) {
        newData = listStores.filter((store) =>
          haveAccess(store.id, userReducer.account ? userReducer.account.account_stores : []),
        );
        setListStoresDataCanAccess(newData);
      } else {
        // trường hợp sửa đơn hàng mà account ko có quyền với cửa hàng đã chọn, thì vẫn hiển thị
        setListStoresDataCanAccess(listStores);
      }
    }
  }, [listStores, userReducer.account]);

  return (
    <div>
      <div className="order-filter">
        <div className="page-filter" style={{ paddingTop: 0 }}>
          <div className="page-filter-heading">
            <div className="page-filter-left" style={{ width: "10%" }}>
              <Space size={12}>
                <Dropdown
                  overlayStyle={{ minWidth: "10rem" }}
                  overlay={
                    <Menu>
                      {actions &&
                        actions.map((item) => (
                          <Menu.Item
                            disabled={item.disabled}
                            key={item.id}
                            onClick={() => onActionClick && onActionClick(item.id)}
                            icon={item.icon}
                            style={{ color: item.color }}
                          >
                            {item.name}
                          </Menu.Item>
                        ))}
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button value="small" className="action-button">
                    <div style={{ marginRight: 10 }}>Thao tác </div>
                    <DownOutlined />
                  </Button>
                </Dropdown>
              </Space>
            </div>
            <div className="page-filter-right" style={{ width: "90%" }}>
              <Space size={12}>
                <Form
                  onFinish={onFinish}
                  ref={formSearchRef}
                  initialValues={initialValues}
                  layout="inline"
                >
                  <Item name="ids" style={{ width: "32%" }}>
                    <NumberInput
                      prefix={<img src={search} alt="" />}
                      placeholder="ID Biên bản bàn giao"
                      // onBlur={(e) => {
                      //   formSearchRef?.current?.setFieldsValue({
                      //     search_term: e.target.value.trim(),
                      //   });
                      // }}
                    />
                  </Item>

                  <Item name="order_codes" style={{ width: "32%" }}>
                    <Input
                      prefix={<img src={search} alt="" />}
                      placeholder="ID đơn hàng/Mã vận đơn"
                      onBlur={(e) => {
                        formSearchRef?.current?.setFieldsValue({
                          search_term: e.target.value.trim(),
                        });
                      }}
                    />
                  </Item>

                  <Item>
                    <Button type="primary" htmlType="submit">
                      Lọc
                    </Button>
                  </Item>
                  <Item>
                    <Button icon={<FilterOutlined />} onClick={openFilter}>
                      Thêm bộ lọc
                    </Button>
                  </Item>
                  <Button icon={<SettingOutlined />} onClick={onShowColumnSetting}></Button>
                </Form>
              </Space>
            </div>
          </div>
        </div>

        <BaseFilter
          onClearFilter={() => clearFilter()}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          className="order-filter-drawer"
          width={widthScreen()}
        >
          {rerender && (
            <Form onFinish={onFinish} ref={formRef} initialValues={initialValues} layout="vertical">
              <Row gutter={20}>
                <Col span={24}>
                  <p>Kho cửa hàng</p>
                  <Item name="store_ids">
                    <CustomSelect
                      mode="multiple"
                      allowClear
                      showArrow
                      placeholder="Cửa hàng"
                      optionFilterProp="children"
                      style={{
                        width: "100%",
                      }}
                      notFoundContent="Không tìm thấy kết quả"
                      maxTagCount="responsive"
                      // value={[226,227]}
                    >
                      {listStoresDataCanAccess?.map((item) => (
                        <CustomSelect.Option key={item.id} value={item.id.toString()}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                  <p>Thời gian</p>
                  <Item>
                    <CustomFilterDatePicker
                      fieldNameFrom="from_date"
                      fieldNameTo="to_date"
                      activeButton={createdClick}
                      setActiveButton={setCreatedClick}
                      format="DD-MM-YYYY"
                      formRef={formRef}
                    />
                  </Item>
                  <p>Hãng vận chuyển</p>
                  <Item name="delivery_service_ids">
                    <CustomSelect
                      mode="multiple"
                      showSearch
                      placeholder="Chọn hãng vận chuyển"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      maxTagCount="responsive"
                      showArrow
                      getPopupContainer={(trigger) => trigger.parentNode}
                      allowClear
                    >
                      {listThirdPartyLogistics.map((reason) => (
                        <CustomSelect.Option
                          key={reason.id.toString()}
                          value={reason.id.toString()}
                        >
                          {reason.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                  <p>Loại biên bản</p>
                  <Item name="good_receipt_type_ids">
                    <CustomSelect
                      mode="multiple"
                      showSearch
                      placeholder="Chọn loại biên bản"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      maxTagCount="responsive"
                      showArrow
                      getPopupContainer={(trigger) => trigger.parentNode}
                      allowClear
                    >
                      {listGoodsReceiptsType?.map((reason) => (
                        <CustomSelect.Option
                          key={reason.id.toString()}
                          value={reason.id.toString()}
                        >
                          {reason.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                  <p>Kiểu biên bản</p>
                  <Item name="ecommerce_ids">
                    <CustomSelect
                      mode="multiple"
                      showSearch
                      placeholder="Chọn kiểu biên bản"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      maxTagCount="responsive"
                      showArrow
                      getPopupContainer={(trigger) => trigger.parentNode}
                      allowClear
                    >
                      {listChannels.map((reason) => (
                        <CustomSelect.Option
                          key={reason.id.toString()}
                          value={reason.id.toString()}
                        >
                          {reason.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
              </Row>
            </Form>
          )}
        </BaseFilter>
      </div>
      <div className="order-filter-tags">
        {filters &&
          filters.map((filter: any, index) => {
            return (
              <Tag className="tag" closable onClose={(e) => onCloseTag(e, filter)} key={index}>
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </div>
  );
};

export default PackFilter;
