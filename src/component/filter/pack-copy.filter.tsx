import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Tag,
  Space,
  Menu,
  Dropdown,
} from "antd";

import {MenuAction} from "component/table/ActionButton";
import {
  createRef,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import {SettingOutlined, FilterOutlined, DownOutlined} from "@ant-design/icons";
import "./order.filter.scss";
import CustomSelect from "component/custom/select.custom";
import CustomRangeDatePicker from "component/custom/new-date-range-picker";
import {OrderPackContext} from "contexts/order-pack/order-pack-context";
import {GoodsReceiptsSearchQuery} from "model/query/goods-receipts.query";
import ButtonCreate from "component/header/ButtonCreate";
import UrlConfig from "config/url.config";

type ReturnFilterProps = {
  params: GoodsReceiptsSearchQuery;
  actions: Array<MenuAction>;
  isLoading?: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: GoodsReceiptsSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
};

const {Item} = Form;

const PackCopyFilter: React.FC<ReturnFilterProps> = (props: ReturnFilterProps) => {
  const {
    params,
    actions,
    //isLoading,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
  } = props;

  const orderPackContextData = useContext(OrderPackContext);
  const listStores = orderPackContextData.listStores;
  const listChannels = orderPackContextData.listChannels;
  const listThirdPartyLogistics = orderPackContextData.listThirdPartyLogistics;
  const listGoodsReceiptsType = orderPackContextData.listGoodsReceiptsType;

  const [visible, setVisible] = useState(false);
  const [rerender, setRerender] = useState(false);

  // const loadingFilter = useMemo(() => {
  //   return isLoading ? true : false;
  // }, [isLoading]);

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
    [onMenuClick]
  );

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      setRerender(false);
      // console.log("key", tag.key);
      // console.log("params", params);
      switch (tag.key) {
        case "store":
          onFilter && onFilter({...params, store_id: undefined});
          break;

        case "delivery_service_id":
          onFilter && onFilter({...params, delivery_service_id: undefined});
          break;
        case "ecommerce_id":
          onFilter && onFilter({...params, ecommerce_id: undefined});
          break;
        case "good_receipt_type_id":
          onFilter && onFilter({...params, good_receipt_type_id: undefined});
          break;
        case "created":
          setCreatedClick("");
          onFilter && onFilter({...params, from_date: null, to_date: null});
          break;

        default:
          break;
      }
      // const tags = filters.filter((tag: any) => tag.key !== key);
      // filters = tags
    },
    [onFilter, params]
  );
  const [createdClick, setCreatedClick] = useState("");

  const initialValues = useMemo(() => {
    return {
      ...params,
      // ecommerce_ids: Array.isArray(params.ecommerce_id) ? params.ecommerce_id : [params.ecommerce_id],
      // delivery_service_ids: Array.isArray(params.delivery_service_id) ? params.delivery_service_id : [params.delivery_service_id],
      // good_receipt_type_ids: Array.isArray(params.good_receipt_type_id) ? params.good_receipt_type_id : [params.good_receipt_type_id],
      // store_ids: Array.isArray(params.store_id) ? params.store_id : [params.store_id],
    };
  }, [params]);

  console.log("params", params);
  console.log("initialValues", initialValues);

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
        const valuesForm = {
          ...params,
          store_id: values.store_id,
          delivery_service_id: values.delivery_service_id,
          ecommerce_id: values.ecommerce_id,
          good_receipt_type_id: values.good_receipt_type_id,
          good_receipt_id: values.good_receipt_id,
          order_id: values.order_id,
          from_date: values.from_date,
          to_date: values.to_date,
        };

        onFilter && onFilter(valuesForm);
        setRerender(false);
      }
    },
    [formRef, onFilter, params]
  );

  let filters = useMemo(() => {
    let list = [];

    if (initialValues.store_id) {
      let textStores = listStores.find(
        (x) => x.id === Number(initialValues.store_id)
      )?.name;
      list.push({
        key: "store",
        name: "Cửa hàng",
        value: textStores,
      });
    }

    if (initialValues.delivery_service_id) {
      let textDeliveryService = listThirdPartyLogistics.find(
        (x) => x.id === Number(initialValues.delivery_service_id)
      )?.name;
      list.push({
        key: "delivery_service_id",
        name: "Hãng vận chuyển",
        value: textDeliveryService,
      });
    }

    if (initialValues.ecommerce_id) {
      let text = listChannels.find(
        (x) => x.id === Number(initialValues.ecommerce_id)
      )?.name;
      list.push({
        key: "ecommerce_id",
        name: "Biên bản sàn",
        value: text,
      });
    }

    if (initialValues.good_receipt_type_id) {
      let text = listGoodsReceiptsType.find(
        (x) => x.id === Number(initialValues.good_receipt_type_id)
      )?.name;
      list.push({
        key: "good_receipt_type_id",
        name: "Loại biên bản",
        value: text,
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
  }, [
    initialValues.store_id,
    initialValues.delivery_service_id,
    initialValues.ecommerce_id,
    initialValues.good_receipt_type_id,
    initialValues.from_date,
    initialValues.to_date,
    listStores,
    listChannels,
    listGoodsReceiptsType,
    listThirdPartyLogistics,
  ]);

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

  return (
    <div>
      <div className="order-filter">
        <div className="page-filter">
          <div className="page-filter-heading">
            <div className="page-filter-left" style={{width: "35%"}}>
              <Space size={12}>
                <Dropdown
                  overlayStyle={{minWidth: "10rem"}}
                  overlay={
                    <Menu>
                      {actions &&
                        actions.map((item) => (
                          <Menu.Item
                            disabled={item.disabled}
                            key={item.id}
                            onClick={() => onActionClick && onActionClick(item.id)}
                            icon={item.icon}
                            style={{color: item.color}}
                          >
                            {item.name}
                          </Menu.Item>
                        ))}
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button className="action-button">
                    <div style={{marginRight: 10}}>Thao tác </div>
                    <DownOutlined />
                  </Button>
                </Dropdown>
              </Space>
              <Space size={12} style={{marginLeft: "10px"}}>
                <ButtonCreate
                  path={`${UrlConfig.PACK_SUPPORT}/report-hand-over-create`}
                />
              </Space>
            </div>
            <div className="page-filter-right" style={{width: "65%"}}>
              <Space size={12}>
                <Form
                  onFinish={onFinish}
                  ref={formSearchRef}
                  initialValues={initialValues}
                  layout="inline"
                >
                  <Item name="good_receipt_id" style={{width: "30%"}}>
                    <Input
                      prefix={<img src={search} alt="" />}
                      placeholder="ID Biên bản bàn giao"
                      onBlur={(e) => {
                        formSearchRef?.current?.setFieldsValue({
                          search_term: e.target.value.trim(),
                        });
                      }}
                    />
                  </Item>

                  <Item name="order_id" style={{width: "30%"}}>
                    <Input
                      prefix={<img src={search} alt="" />}
                      placeholder="Mã đơn hàng"
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
                  <Button
                    icon={<SettingOutlined />}
                    onClick={onShowColumnSetting}
                  ></Button>
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
            <Form
              onFinish={onFinish}
              ref={formRef}
              initialValues={initialValues}
              layout="vertical"
            >
              <Row gutter={20}>
                <Col span={24}>
                  <p>Kho cửa hàng</p>
                  <Item name="store_id">
                    <CustomSelect
                      //mode="multiple"
                      allowClear
                      showArrow
                      placeholder="Cửa hàng"
                      optionFilterProp="children"
                      style={{
                        width: "100%",
                      }}
                      notFoundContent="Không tìm thấy kết quả"
                      maxTagCount="responsive"
                    >
                      {listStores?.map((item) => (
                        <CustomSelect.Option key={item.id} value={item.id.toString()}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                  <p>Hãng vẫn chuyển</p>
                  <Item name="delivery_service_id">
                    <CustomSelect
                      //mode="multiple"
                      showSearch
                      placeholder="Chọn hãng vận chuyển"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{width: "100%"}}
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
                  <Item name="good_receipt_type_id">
                    <CustomSelect
                      //mode="multiple"
                      showSearch
                      placeholder="Chọn loại biên bản"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{width: "100%"}}
                      optionFilterProp="children"
                      maxTagCount="responsive"
                      showArrow
                      getPopupContainer={(trigger) => trigger.parentNode}
                      allowClear
                    >
                      {listGoodsReceiptsType.map((reason) => (
                        <CustomSelect.Option
                          key={reason.id.toString()}
                          value={reason.id.toString()}
                        >
                          {reason.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                  <p>Biên bản sàn</p>
                  <Item name="ecommerce_id">
                    <CustomSelect
                      //mode="multiple"
                      showSearch
                      placeholder="Chọn biên bản sàn"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{width: "100%"}}
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
                <Col span={24}>
                  <p>Ngày tạo đơn</p>
                  <CustomRangeDatePicker
                    fieldNameFrom="from_date"
                    fieldNameTo="to_date"
                    activeButton={createdClick}
                    setActiveButton={setCreatedClick}
                    format="DD-MM-YYYY"
                    formRef={formRef}
                  />
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
              <Tag className="tag" closable onClose={(e) => onCloseTag(e, filter)}>
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </div>
  );
};

export default PackCopyFilter;
