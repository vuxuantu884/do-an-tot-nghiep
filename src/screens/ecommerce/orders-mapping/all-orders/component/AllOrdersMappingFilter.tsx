import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Tag,
  Dropdown,
  Menu,
} from "antd";
import { FilterOutlined, DownOutlined } from "@ant-design/icons";
import moment from "moment";

import BaseFilter from "component/filter/base.filter";
import SelectDateFilter from "screens/ecommerce/common/SelectDateFilter";

import search from "assets/img/search.svg";
import {
  StyledEcommerceOrderBaseFilter,
} from "screens/ecommerce/orders/orderStyles";
import { AllOrdersMappingFilterStyled } from "screens/ecommerce/orders-mapping/all-orders/AllOrdersMappingStyled";
import { GetOrdersMappingQuery } from "model/query/ecommerce.query";

type AllOrdersMappingFilterProps = {
  params: GetOrdersMappingQuery;
  selectedRowKeys?: Array<any> | undefined;
  initQuery: GetOrdersMappingQuery;
  isLoading: boolean;
  onClearFilter?: () => void;
  onFilter?: (values: GetOrdersMappingQuery | Object) => void;
};

const { Item } = Form;
const { Option } = Select;

const CONNECT_STATUS = [
  {
    title: "Thành công",
    value: "success",
  },
  {
    title: "Thất bại",
    value: "fail",
  },
]

const AllOrdersMappingFilter: React.FC<AllOrdersMappingFilterProps> = (
  props: AllOrdersMappingFilterProps
) => {
  const {
    params,
    selectedRowKeys,
    initQuery,
    isLoading,
    onClearFilter,
    onFilter,
  } = props;

  const [formFilter] = Form.useForm();

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);


  let initialValues = useMemo(() => {
    return {
      ...params,
      ecommerce_order_status: Array.isArray(params.ecommerce_order_status)
        ? params.ecommerce_order_status
        : [params.ecommerce_order_status],
      
    };
  }, [params]);


  const onMenuClick = useCallback(
    (index: number) => {
      console.log("selectedRowKeys: ", selectedRowKeys);
    },
    [selectedRowKeys]
  );

  const actionList = (
    <Menu>
      <Menu.Item key="1">
        <span onClick={() => onMenuClick(1)}>ACTION 1</span>
      </Menu.Item>
    </Menu>
  );

  const status = useMemo(
    () => [
      { name: "Nháp", value: "draft" },
      { name: "Đóng gói", value: "packed" },
      { name: "Xuất kho", value: "shipping" },
      { name: "Đã xác nhận", value: "finalized" },
      { name: "Hoàn thành", value: "completed" },
      { name: "Kết thúc", value: "finished" },
      { name: "Đã huỷ", value: "cancelled" },
      { name: "Đã hết hạn", value: "expired" },
    ],
    []
  );

  // handle filter action
  const onFilterClick = useCallback(() => {
    setVisibleBaseFilter(false);
    formFilter?.submit();
  }, [formFilter]);

  const openBaseFilter = useCallback(() => {
    setVisibleBaseFilter(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisibleBaseFilter(false);
  }, []);

  //clear base filter
  const onClearCreatedDate = () => {
    setIssuedClick("");
    setIssuedOnMin(null);
    setIssuedOnMax(null);
  };

  const onClearBaseFilter = useCallback(() => {
    onClearCreatedDate();

    setVisibleBaseFilter(false);
    formFilter.setFieldsValue(initQuery);
    onClearFilter && onClearFilter();
  }, [formFilter, initQuery, onClearFilter]);
  // end handle filter action

  // handle select date
  const [issuedClick, setIssuedClick] = useState("");

  const [issuedOnMin, setIssuedOnMin] = useState(
    initialValues.created_date_from
      ? moment(initialValues.created_date_from, "DD-MM-YYYY")
      : null
  );

  const [issuedOnMax, setIssuedOnMax] = useState(
    initialValues.created_date_to
      ? moment(initialValues.created_date_to, "DD-MM-YYYY")
      : null
  );

  const clickOptionDate = useCallback(
    (type, value) => {
      let minValue = null;
      let maxValue = null;

      switch (value) {
        case "today":
          minValue = moment().startOf("day").format("DD-MM-YYYY");
          maxValue = moment().endOf("day").format("DD-MM-YYYY");
          break;
        case "yesterday":
          minValue = moment()
            .startOf("day")
            .subtract(1, "days")
            .format("DD-MM-YYYY");
          maxValue = moment()
            .endOf("day")
            .subtract(1, "days")
            .format("DD-MM-YYYY");
          break;
        case "thisweek":
          minValue = moment().startOf("week").format("DD-MM-YYYY");
          maxValue = moment().endOf("week").format("DD-MM-YYYY");
          break;
        case "lastweek":
          minValue = moment()
            .startOf("week")
            .subtract(1, "weeks")
            .format("DD-MM-YYYY");
          maxValue = moment()
            .endOf("week")
            .subtract(1, "weeks")
            .format("DD-MM-YYYY");
          break;
        case "thismonth":
          minValue = moment().startOf("month").format("DD-MM-YYYY");
          maxValue = moment().endOf("month").format("DD-MM-YYYY");
          break;
        case "lastmonth":
          minValue = moment()
            .startOf("month")
            .subtract(1, "months")
            .format("DD-MM-YYYY");
          maxValue = moment()
            .endOf("month")
            .subtract(1, "months")
            .format("DD-MM-YYYY");
          break;
        default:
          break;
      }

      switch (type) {
        case "issued":
          if (issuedClick === value) {
            setIssuedClick("");
            setIssuedOnMin(null);
            setIssuedOnMax(null);
          } else {
            setIssuedClick(value);
            setIssuedOnMin(moment(minValue, "DD-MM-YYYY"));
            setIssuedOnMax(moment(maxValue, "DD-MM-YYYY"));
          }
          break;
        default:
          break;
      }
    },
    [issuedClick]
  );

  const onChangeRangeDate = useCallback((dates, dateString, type) => {
    switch (type) {
      case "issued":
        setIssuedClick("");
        setIssuedOnMin(dateString[0]);
        setIssuedOnMax(dateString[1]);
        break;
      default:
        break;
    }
  }, []);
  // end handle select date

  const onFinish = useCallback(
    (values) => {
      const formValues = {
        ...values,
        created_date_from: issuedOnMin
          ? moment(issuedOnMin, "DD-MM-YYYY")?.format("DD-MM-YYYY")
          : null,
        created_date_to: issuedOnMax
          ? moment(issuedOnMax, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
      };
      
      onFilter && onFilter(formValues);
    },
    [issuedOnMax, issuedOnMin, onFilter]
  );

  // handle tag filter
  let filters = useMemo(() => {
    let list = [];

    if (initialValues.connected_status) {
      const connectStatus = CONNECT_STATUS.find((item) => item.value === initialValues.connected_status);
      
      list.push({
        key: "connected_status",
        name: "Trạng thái liên kết",
        value: connectStatus?.title,
      });
    }

    if (initialValues.created_date_from || initialValues.created_date_to) {
      let textOrderCreateDate =
        (initialValues.created_date_from ? initialValues.created_date_from : "??") +
        " ~ " +
        (initialValues.created_date_to ? initialValues.created_date_to : "??");
      list.push({
        key: "issued",
        name: "Ngày tạo đơn",
        value: textOrderCreateDate,
      });
    }
    
    if (initialValues.ecommerce_order_status.length) {
      let textStatus = "";
      initialValues.ecommerce_order_status.forEach((i) => {
        const findStatus = status?.find((item) => item.value === i);
        textStatus = findStatus
          ? textStatus + findStatus.name + ";"
          : textStatus;
      });
      list.push({
        key: "ecommerce_order_status",
        name: "Trạng thái đơn hàng",
        value: textStatus,
      });
    }

    return list;
  }, [initialValues.connected_status, initialValues.created_date_to, initialValues.created_date_from, initialValues.ecommerce_order_status, status]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "connected_status":
          onFilter && onFilter({ ...params, connected_status: null });
          formFilter?.setFieldsValue({ connected_status: null });
          break;
        case "issued":
          setIssuedClick("");
          setIssuedOnMin(null);
          setIssuedOnMax(null);
          onFilter && onFilter({ ...params, created_date_from: null, created_date_to: null });
          break;
        case "ecommerce_order_status":
          onFilter && onFilter({ ...params, ecommerce_order_status: [] });
          formFilter?.setFieldsValue({ ecommerce_order_status: [] });
          break;
        default:
          break;
      }
    },
    [formFilter, onFilter, params]
  );
  // end handle tag filter

  return (
    <AllOrdersMappingFilterStyled>
      <div className="order-filter">
        <Form
          form={formFilter}
          onFinish={onFinish}
          initialValues={initialValues}
          className="default-filter"
        >
          <Form.Item className="action-dropdown">
            <Dropdown
              overlay={actionList}
              trigger={["click"]}
              disabled={isLoading || true}
            >
              <Button className="action-button">
                <div style={{ marginRight: 10 }}>Thao tác</div>
                <DownOutlined />
              </Button>
            </Dropdown>
          </Form.Item>

          <Item name="search_term" className="search-term-input">
            <Input
              disabled={isLoading}
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm đơn hàng"
              onBlur={(e) => {
                formFilter?.setFieldsValue({
                  search_term: e.target.value.trim(),
                });
              }}
            />
          </Item>

          <Item className="filter-item">
            <Button
              type="primary"
              // onClick={onBasicFilter}
              htmlType="submit" 
              disabled={isLoading}
            >
              Lọc
            </Button>
          </Item>

          <Item className="filter-item">
            <Button
              icon={<FilterOutlined />}
              onClick={openBaseFilter}
              disabled={isLoading}
            >
              Thêm bộ lọc
            </Button>
          </Item>
        </Form>

        <BaseFilter
          onClearFilter={onClearBaseFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visibleBaseFilter}
          width={500}
        >
          <StyledEcommerceOrderBaseFilter>
            <Form
              form={formFilter}
              onFinish={onFinish}
              initialValues={params}
              layout="vertical"
            >
              <Form.Item label={<b>Trạng thái liên kết</b>} name="connected_status">
                <Select
                  placeholder="Chọn trạng thái"
                  allowClear
                >
                  {CONNECT_STATUS.map((item: any) => (
                    <Option key={item.value} value={item.value}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label={<b>NGÀY TẠO ĐƠN</b>}>
                <SelectDateFilter
                  clickOptionDate={clickOptionDate}
                  onChangeRangeDate={onChangeRangeDate}
                  dateType="issued"
                  dateSelected={issuedClick}
                  startDate={issuedOnMin}
                  endDate={issuedOnMax}
                />
              </Form.Item>

              <Form.Item
                label={<b>TRẠNG THÁI ĐƠN HÀNG</b>}
                name="ecommerce_order_status"
              >
                <Select
                  mode="multiple"
                  showArrow
                  allowClear
                  placeholder="Chọn trạng thái đơn hàng"
                  notFoundContent="Không tìm thấy kết quả"
                  optionFilterProp="children"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {status?.map((item, index) => (
                    <Option key={item.value} value={item.value.toString()}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </StyledEcommerceOrderBaseFilter>
        </BaseFilter>
      </div>

      <div className="filter-tags">
        {filters?.map((filter: any, index) => {
          return (
            <Tag
              key={filter.key}
              className="tag"
              closable={!isLoading}
              onClose={(e) => onCloseTag(e, filter)}
            >
              {filter.name}: {filter.value}
            </Tag>
          );
        })}
      </div>
    </AllOrdersMappingFilterStyled>
  );
};

export default AllOrdersMappingFilter;
