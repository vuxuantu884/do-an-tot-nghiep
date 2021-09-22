import {
  Button,
  Col,
  Collapse,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Tag,
} from "antd";
import { MenuAction } from "component/table/ActionButton";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import {
  createRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import { ProductWrapperSearchQuery } from "model/product/product.model";
import CustomFilter from "component/table/custom.filter";
import { FilterOutlined, SettingOutlined } from "@ant-design/icons";
import BaseFilter from "../../../../../component/filter/base.filter";
import moment from "moment";
import { ProductWrapperStyled, PWFormFilter } from "./styled";
import { MaterialResponse } from "model/product/material.model";
import { CategoryView } from "model/product/category.model";
import ButtonSetting from "component/table/ButtonSetting";

const { Panel } = Collapse;

type ProductFilterProps = {
  params: ProductWrapperSearchQuery;
  listMerchandisers?: Array<AccountResponse>;
  listMaterial?: Array<MaterialResponse>;
  listCategory?: Array<CategoryView>;
  goods?: Array<BaseBootstrapResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: ProductWrapperSearchQuery) => void;
  onClearFilter?: () => void;
  initValue?: ProductWrapperSearchQuery;
  openColumn: () => void;
};

const { Item } = Form;
const { Option } = Select;

const ProductWrapperFilter: React.FC<ProductFilterProps> = (
  props: ProductFilterProps
) => {
  const {
    params,
    actions,
    listMerchandisers,
    listMaterial,
    listCategory,
    goods,
    initValue,
    onMenuClick,
    onFilter,
    openColumn,
  } = props;
  const [visible, setVisible] = useState(false);

  const formRef = createRef<FormInstance>();

  const initialValues = useMemo(() => {
    return {
      ...params,
    };
  }, [params]);

  const [createTimeOnMin, setCreateTimeOnMin] = useState(
    initialValues.from_create_date
      ? moment(initialValues.from_create_date, "YYYY-MM-DD")
      : null
  );
  const [createTimeOnMax, setCreateTimeOnMax] = useState(
    initialValues.to_create_date
      ? moment(initialValues.to_create_date, "YYYY-MM-DD")
      : null
  );
  const [createTimeClick, setCreateTimeClick] = useState("");

  const onFinish = useCallback(
    (values) => {
      const valuesForm = {
        ...values,
        from_create_date: createTimeOnMin
          ? moment(createTimeOnMin, "YYYY-MM-DD")?.format("YYYY-MM-DD")
          : null,
        to_create_date: createTimeOnMax
          ? moment(createTimeOnMax, "YYYY-MM-DD").format("YYYY-MM-DD")
          : null,
      };
      onFilter && onFilter(valuesForm);
    },
    [onFilter, createTimeOnMin, createTimeOnMax]
  );

  const clickOptionDate = useCallback(
    (type, value) => {
      let minValue = null;
      let maxValue = null;

      switch (value) {
        case "today":
          minValue = moment().startOf("day").format("YYYY-MM-DD");
          maxValue = moment().endOf("day").format("YYYY-MM-DD");
          break;
        case "yesterday":
          minValue = moment()
            .startOf("day")
            .subtract(1, "days")
            .format("YYYY-MM-DD");
          maxValue = moment()
            .endOf("day")
            .subtract(1, "days")
            .format("YYYY-MM-DD");
          break;
        case "thisweek":
          minValue = moment().startOf("week").format("YYYY-MM-DD");
          maxValue = moment().endOf("week").format("YYYY-MM-DD");
          break;
        case "lastweek":
          minValue = moment()
            .startOf("week")
            .subtract(1, "weeks")
            .format("YYYY-MM-DD");
          maxValue = moment()
            .endOf("week")
            .subtract(1, "weeks")
            .format("YYYY-MM-DD");
          break;
        case "thismonth":
          minValue = moment().startOf("month").format("YYYY-MM-DD");
          maxValue = moment().endOf("month").format("YYYY-MM-DD");
          break;
        case "lastmonth":
          minValue = moment()
            .startOf("month")
            .subtract(1, "months")
            .format("YYYY-MM-DD");
          maxValue = moment()
            .endOf("month")
            .subtract(1, "months")
            .format("YYYY-MM-DD");
          break;
        default:
          break;
      }

      switch (type) {
        case "create_time":
          if (createTimeClick === value) {
            setCreateTimeClick("");
            setCreateTimeOnMin(null);
            setCreateTimeOnMax(null);
          } else {
            setCreateTimeClick(value);
            setCreateTimeOnMin(moment(minValue, "YYYY-MM-DD"));
            setCreateTimeOnMax(moment(maxValue, "YYYY-MM-DD"));
          }
          break;
        default:
          break;
      }
    },
    [createTimeClick]
  );

  const onChangeRangeDate = useCallback((dates, dateString, type) => {
    switch (type) {
      case "create_time":
        setCreateTimeOnMin(dateString[0]);
        setCreateTimeOnMax(dateString[1]);
        break;
      default:
        break;
    }
  }, []);

  let filters = useMemo(() => {
    let list = [];
    if (initialValues.from_create_date || initialValues.to_create_date) {
      let textOrderCreateDate =
        (initialValues.from_create_date
          ? moment(initialValues.from_create_date).format("DD/MM/YYYY")
          : "??") +
        " ~ " +
        (initialValues.to_create_date
          ? moment(initialValues.to_create_date).format("DD/MM/YYYY")
          : "??");

      list.push({
        key: "create_time",
        name: "Ngày khởi tạo",
        value: textOrderCreateDate,
      });
    }
    if (initialValues.info) {
      let textOrderName = initialValues.info ? initialValues.info : "";
      list.push({
        key: "info",
        name: "",
        value: textOrderName,
      });
    }
    return list;
  }, [initialValues]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "create_time":
          setCreateTimeClick("");
          setCreateTimeOnMin(null);
          setCreateTimeOnMax(null);
          onFilter &&
            onFilter({
              ...params,
              from_create_date: undefined,
              to_create_date: undefined,
            });
          break;
        default:
          break;
      }
      // const tags = filters.filter((tag: any) => tag.key !== key);
      // filters = tags
    },
    [onFilter, params]
  );

  const onResetFilter = useCallback(() => {
    formRef.current?.setFieldsValue(initValue);
    setVisible(false);
    setCreateTimeClick("");
    setCreateTimeOnMin(null);
    setCreateTimeOnMax(null);
    formRef.current?.submit();
  }, [formRef, initValue]);

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef.current?.submit();
  }, [formRef]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );

  useLayoutEffect(() => {
    if (visible) {
      formRef.current?.resetFields();
    }
  }, [formRef, visible]);

  return (
    <ProductWrapperStyled>
      <div className="product-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onFinish} initialValues={params} layout="inline">
            <Item name="info" className="search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo Mã vạch, Mã sản phẩm, Tên sản phẩm"
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
            <Item>
              <ButtonSetting onClick={openColumn} />
            </Item>
          </Form>
        </CustomFilter>

        <BaseFilter
          onClearFilter={onResetFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={500}
        >
          <PWFormFilter>
            <Form
              onFinish={onFinish}
              ref={formRef}
              initialValues={params}
              layout="vertical"
            >
              <Row className="create-date" gutter={12}>
                <Col span={24}>
                  <Collapse
                    defaultActiveKey={
                      initialValues.from_create_date &&
                      initialValues.to_create_date
                        ? ["1"]
                        : []
                    }
                  >
                    <Panel
                      header="NGÀY KHỞI TẠO"
                      key="1"
                      className="header-filter"
                    >
                      <div className="date-option">
                        <Button
                          onClick={() =>
                            clickOptionDate("create_time", "yesterday")
                          }
                          className={
                            createTimeClick === "yesterday"
                              ? "active"
                              : "deactive"
                          }
                        >
                          Hôm qua
                        </Button>
                        <Button
                          onClick={() =>
                            clickOptionDate("create_time", "today")
                          }
                          className={
                            createTimeClick === "today" ? "active" : "deactive"
                          }
                        >
                          Hôm nay
                        </Button>
                        <Button
                          onClick={() =>
                            clickOptionDate("create_time", "thisweek")
                          }
                          className={
                            createTimeClick === "thisweek"
                              ? "active"
                              : "deactive"
                          }
                        >
                          Tuần này
                        </Button>
                      </div>
                      <div className="date-option">
                        <Button
                          onClick={() =>
                            clickOptionDate("create_time", "lastweek")
                          }
                          className={
                            createTimeClick === "lastweek"
                              ? "active"
                              : "deactive"
                          }
                        >
                          Tuần trước
                        </Button>
                        <Button
                          onClick={() =>
                            clickOptionDate("create_time", "thismonth")
                          }
                          className={
                            createTimeClick === "thismonth"
                              ? "active"
                              : "deactive"
                          }
                        >
                          Tháng này
                        </Button>
                        <Button
                          onClick={() =>
                            clickOptionDate("create_time", "lastmonth")
                          }
                          className={
                            createTimeClick === "lastmonth"
                              ? "active"
                              : "deactive"
                          }
                        >
                          Tháng trước
                        </Button>
                      </div>
                      <p>
                        <SettingOutlined style={{ marginRight: "10px" }} />
                        Tuỳ chọn khoảng thời gian:
                      </p>
                      <DatePicker.RangePicker
                        format="YYYY-MM-DD"
                        style={{ width: "100%" }}
                        value={[
                          createTimeOnMin
                            ? moment(createTimeOnMin, "YYYY-MM-DD")
                            : null,
                          createTimeOnMax
                            ? moment(createTimeOnMax, "YYYY-MM-DD")
                            : null,
                        ]}
                        onChange={(date, dateString) =>
                          onChangeRangeDate(date, dateString, "issued")
                        }
                      />
                    </Panel>
                  </Collapse>
                </Col>
              </Row>

              <Row gutter={12}>
                <Col span={24}>
                  <Item name="designer_code" label="NHÀ THIẾT KẾ">
                    <Select>
                      <Option value="">NHÀ THIẾT KẾ</Option>
                      {listMerchandisers?.map((item) => (
                        <Option key={item.code} value={item.code}>
                          {item.code} - {item.full_name}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={24}>
                  <Item name="merchandiser_code" label="MERCHANDISER">
                    <Select>
                      <Option value="">MERCHANDISER</Option>
                      {listMerchandisers?.map((item) => (
                        <Option key={item.code} value={item.code}>
                          {item.code} - {item.full_name}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={24}>
                  <Item name="status" label="TRẠNG THÁI">
                    <Select>
                      <Option value="">TRẠNG THÁI</Option>
                      <Option value="inactive">Ngừng hoạt động</Option>
                      <Option value="active">Đang hoạt động</Option>
                    </Select>
                  </Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={24}>
                  <Item name="category_id" label="DANH MỤC">
                    <Select>
                      <Option value="">DANH MỤC</Option>
                      {listCategory?.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {`${item.name}`}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={24}>
                  <Item name="goods" label="NGÀNH HÀNG">
                    <Select>
                      <Option value="">NGÀNH HÀNG</Option>
                      {goods?.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={24}>
                  <Item name="material_id" label="CHẤT LIỆU">
                    <Select>
                      <Option value="">CHẤT LIỆU</Option>
                      {listMaterial?.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Item>
                </Col>
              </Row>
            </Form>
          </PWFormFilter>
        </BaseFilter>
      </div>
      <div className="order-filter-tags">
        {filters &&
          filters.map((filter: any) => {
            return (
              <Tag
                className="tag"
                closable
                onClose={(e) => onCloseTag(e, filter)}
              >
                {filter.name
                  ? `${filter.name}: ${filter.value}`
                  : `${filter.value}`}
              </Tag>
            );
          })}
      </div>
    </ProductWrapperStyled>
  );
};

export default ProductWrapperFilter;
