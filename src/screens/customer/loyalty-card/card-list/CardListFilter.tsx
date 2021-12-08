import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Tag,
} from "antd";
import { FilterOutlined } from "@ant-design/icons";
import moment from "moment";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

import BaseFilter from "component/filter/base.filter";
import SelectDateFilter from "component/filter/SelectDateFilter";
import { CustomerCardListRequest } from "model/request/customer.request";
import { GetOrdersMappingQuery } from "model/query/ecommerce.query";

import search from "assets/img/search.svg";
import { StyledCardList } from "screens/customer/loyalty-card/card-list/StyledCardList";


type CardListFilterProps = {
  params: CustomerCardListRequest;
  initParams: any;
  isLoading: boolean;
  cardReleaseList: any;
  onClearFilter?: () => void;
  onFilter?: (values: GetOrdersMappingQuery | Object) => void;
};

const { Item } = Form;
const { Option } = Select;

const CARD_STATUS_LIST = [
  {
    title: 'Đã được gán',
    value: 'ASSIGNED'
  },
  {
    title: 'Kích hoạt',
    value: 'ACTIVE'
  },
  {
    title: 'Đã khóa',
    value: 'INACTIVE'
  }
];

const CardListFilter: React.FC<CardListFilterProps> = (
  props: CardListFilterProps
) => {
  const {
    params,
    initParams,
    isLoading,
    cardReleaseList,
    onClearFilter,
    onFilter,
  } = props;

  const [formFilter] = Form.useForm();

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);

  let initialValues = useMemo(() => {
    return {
      ...params,
      release_ids: Array.isArray(params.release_ids)
        ? params.release_ids
        : [params.release_ids],
      statuses: Array.isArray(params.statuses)
        ? params.statuses
        : [params.statuses],
      
    };
  }, [params]);

  // handle select date
  const [assignedDateClick, setAssignedDateClick] = useState("");
  const [fromAssignedDate , setFromAssignedDate ] = useState<any>(initialValues.from_assigned_date );
  const [toAssignedDate , setToAssignedDate ] = useState<any>(initialValues.to_assigned_date);

  const clickOptionDate = useCallback(
    (type, value) => {
      let startDateValue = null;
      let endDateValue = null;

      switch (value) {
        case "today":
          startDateValue = moment().startOf("day");
          endDateValue = moment().endOf("day");
          break;
        case "yesterday":
          startDateValue = moment().startOf("day").subtract(1, "days");
          endDateValue = moment().endOf("day").subtract(1, "days");
          break;
        case "thisWeek":
          startDateValue = moment().startOf("week");
          endDateValue = moment().endOf("week");
          break;
        case "lastWeek":
          startDateValue = moment().startOf("week").subtract(1, "weeks");
          endDateValue = moment().endOf("week").subtract(1, "weeks");
          break;
        case "thisMonth":
          startDateValue = moment().startOf("month");
          endDateValue = moment().endOf("month");
          break;
        case "lastMonth":
          startDateValue = moment().startOf("month").subtract(1, "months");
          endDateValue = moment().endOf("month").subtract(1, "months");
          break;
        default:
          break;
      }

      switch (type) {
        case "assigned_date":
          if (assignedDateClick === value) {
            setAssignedDateClick("");
            setFromAssignedDate (null);
            setToAssignedDate (null);
          } else {
            setAssignedDateClick(value);
            setFromAssignedDate (startDateValue);
            setToAssignedDate (endDateValue);
          }
          break;
        default:
          break;
      }
    },
    [assignedDateClick]
  );

  // handle select RangPicker
  const setLocalStartDate = (dateString: string) => {
    if (!dateString) {
      return null;
    }
    const dateArray = dateString.split("-");
    const day = dateArray[0];
    const month = dateArray[1];
    const year = dateArray[2];
    const newDate = new Date(month + '-' + day + '-' + year);
    return moment(newDate).startOf("day");
  }

  const setLocalEndDate = (dateString: string) => {
    if (!dateString) {
      return null;
    }
    const dateArray = dateString.split("-");
    const day = dateArray[0];
    const month = dateArray[1];
    const year = dateArray[2];
    const newDate = new Date(month + '-' + day + '-' + year);
    return moment(newDate).endOf("day");
  }

  const onChangeRangeDate = useCallback((dates, dateString, type) => {
    switch (type) {
      case "assigned_date":
        setAssignedDateClick("");
        const startDate = setLocalStartDate(dateString[0]);
        const endDate = setLocalEndDate(dateString[1]);
        setFromAssignedDate (startDate);
        setToAssignedDate (endDate);
        break;
      default:
        break;
    }
  }, []);
  // end handle select RangPicker
  // end handle select date


  // handle tag filter
  let filters = useMemo(() => {
    let list = [];

    if (initialValues.from_assigned_date || initialValues.to_assigned_date) {
      let textAssignedDate =
        (initialValues.from_assigned_date ? ConvertUtcToLocalDate(initialValues.from_assigned_date, "DD/MM/YYYY") : "??") +
        " ~ " +
        (initialValues.to_assigned_date ? ConvertUtcToLocalDate(initialValues.to_assigned_date, "DD/MM/YYYY") : "??");
      list.push({
        key: "assigned_date",
        name: "Ngày gán",
        value: textAssignedDate,
      });
    }

    if (initialValues.statuses.length) {
      let cardStatusList = "";
      initialValues.statuses.forEach((statusValue: any) => {
        const foundItem = CARD_STATUS_LIST?.find((item) => item.value === statusValue);
        cardStatusList = foundItem
          ? cardStatusList + foundItem.title + "; "
          : cardStatusList;
      });
      list.push({
        key: "statuses",
        name: "Trạng thái",
        value: cardStatusList,
      });
    }
    
    if (initialValues.release_ids.length) {
      let cardReleaseFilter = "";
      initialValues.release_ids.forEach((releaseId) => {
        const foundItem = cardReleaseList?.find((item: any) => item.id === releaseId);
        cardReleaseFilter = foundItem
          ? cardReleaseFilter + foundItem.name + "; "
          : cardReleaseFilter;
      });
      list.push({
        key: "release_ids",
        name: "Đợt phát hành",
        value: cardReleaseFilter,
      });
    }

    return list;
  }, [cardReleaseList, initialValues.from_assigned_date, initialValues.release_ids, initialValues.statuses, initialValues.to_assigned_date]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "assigned_date":
          setAssignedDateClick("");
          setFromAssignedDate (null);
          setToAssignedDate (null);
          onFilter && onFilter({ ...params, from_assigned_date: null, to_assigned_date: null });
          break;
        case "statuses":
          onFilter && onFilter({ ...params, statuses: [] });
          formFilter?.setFieldsValue({ statuses: [] });
          break;
        case "release_ids":
          onFilter && onFilter({ ...params, release_ids: [] });
          formFilter?.setFieldsValue({ release_ids: [] });
          break;
        default:
          break;
      }
    },
    [formFilter, onFilter, params]
  );
  // end handle tag filter

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
  const onClearAssignedDate = () => {
    setAssignedDateClick("");
    setFromAssignedDate (null);
    setToAssignedDate (null);
  };

  const onClearBaseFilter = useCallback(() => {
    onClearAssignedDate();
    setVisibleBaseFilter(false);
    formFilter.setFieldsValue(initParams);
    onClearFilter && onClearFilter();
  }, [formFilter, initParams, onClearFilter]);
  // end handle filter action

  const onFinish = useCallback(
    (values) => {
      const formValues = {
        ...values,
        from_assigned_date: fromAssignedDate ,
        to_assigned_date: toAssignedDate ,
      };
      
      onFilter && onFilter(formValues);
    },
    [fromAssignedDate, toAssignedDate, onFilter]
  );


  return (
    <StyledCardList>
      <div>
        <Form
          form={formFilter}
          onFinish={onFinish}
          initialValues={initialValues}
          className="basic-filter"
        >
          <Item name="request" className="search-input">
            <Input
              disabled={isLoading}
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm mã thẻ, tên khách hàng"
              onBlur={(e) => {
                formFilter?.setFieldsValue({
                  request: e.target.value.trim(),
                });
              }}
            />
          </Item>

          <Item>
            <Button
              type="primary"
              htmlType="submit" 
              disabled={isLoading}
            >
              Lọc
            </Button>
          </Item>

          <Item>
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
          <Form
            form={formFilter}
            onFinish={onFinish}
            initialValues={params}
            layout="vertical"
          >
            <Form.Item label={<b>Ngày gán</b>}>
              <SelectDateFilter
                clickOptionDate={clickOptionDate}
                onChangeRangeDate={onChangeRangeDate}
                dateType="assigned_date"
                dateSelected={assignedDateClick}
                startDate={fromAssignedDate}
                endDate={toAssignedDate}
              />
            </Form.Item>

            <Form.Item
              label={<b>Trạng thái</b>}
              name="statuses"
            >
              <Select
                mode="multiple"
                maxTagCount='responsive'
                showArrow
                allowClear
                placeholder="Chọn trạng thái"
                notFoundContent="Không tìm thấy kết quả"
                optionFilterProp="children"
              >
                {CARD_STATUS_LIST?.map((item: any, index: number) => (
                  <Option key={item.value} value={item.value.toString()}>
                    {item.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<b>Đợt phát hành</b>}
              name="release_ids"
            >
              <Select
                mode="multiple"
                maxTagCount='responsive'
                showArrow
                allowClear
                placeholder="Chọn đợt phát hành"
                notFoundContent="Không tìm thấy kết quả"
                optionFilterProp="children"
              >
                {cardReleaseList?.map((item: any, index: number) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
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
    </StyledCardList>
  );
};

export default CardListFilter;
