import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Form, Input, DatePicker, Tag, Select } from "antd";
import moment from "moment";
import { DATE_FORMAT, formatDateFilter } from "utils/DateUtils";
import { CampaignListFilterStyled } from "screens/promotion/campaign/campaign.style";
import { PromotionCampaignQuery } from "model/promotion/campaign.model";
import { RangePickerProps } from "antd/es/date-picker";
import search from "assets/img/search.svg";
import rightArrow from "assets/icon/right-arrow.svg";
import { CAMPAIGN_STATUS } from "screens/promotion/constants";
import { convertItemToArray } from "utils/AppUtils";

const { Item } = Form;

type PromotionCampaignListFilterProps = {
  params: PromotionCampaignQuery;
  onFilter?: (value: PromotionCampaignQuery | Object) => void;
};

const PromotionCampaignListFilter: React.FC<PromotionCampaignListFilterProps> = (
  props: PromotionCampaignListFilterProps,
) => {
  const { params, onFilter } = props;
  const [form] = Form.useForm();

  const [startsDate, setStartsDate] = useState<any>(params.starts_date);
  const [endsDate, setEndsDate] = useState<any>(params.ends_date);

  /** handle form value */
  const initialValues = useMemo(() => {
    return {
      ...params,
      states: convertItemToArray(params.states),
    };
  }, [params]);

  useEffect(() => {
    setStartsDate(initialValues?.starts_date);
    setEndsDate(initialValues?.ends_date);
    form.setFieldsValue({
      ...initialValues,
    });
  }, [form, initialValues]);
  /** end handle form value */

  /** handle apply date filter */
  const startDateValue = useMemo(() => {
    return startsDate ? formatDateFilter(startsDate) : undefined;
  }, [startsDate]);

  const endDateValue = useMemo(() => {
    return endsDate ? formatDateFilter(endsDate) : undefined;
  }, [endsDate]);

  const disabledDateStart: RangePickerProps["disabledDate"] = (current) => {
    if (current && endDateValue) {
      return current > endDateValue;
    } else {
      return false;
    }
  };
  const handleSelectStartDate = (date: any) => {
    if (!date) {
      setStartsDate(null);
    } else {
      const startOfDate = moment(date).utc().startOf("day");
      setStartsDate(startOfDate);
    }
  };

  const disabledDateEnd: RangePickerProps["disabledDate"] = (current) => {
    if (current && startDateValue) {
      return current < startDateValue;
    } else {
      return false;
    }
  };
  const handleSelectEndDate = (date: any) => {
    if (!date) {
      setEndsDate(null);
    } else {
      const endOfDate = moment(date).utc().endOf("day");
      setEndsDate(endOfDate);
    }
  };
  /** end handle apply date filter */

  // on submit filter
  const onFinish = useCallback(
    (values: PromotionCampaignQuery) => {
      const formValues = {
        ...values,
        starts_date: startsDate,
        ends_date: endsDate,
        request: values.request?.trim(),
      };
      onFilter && onFilter(formValues);
    },
    [startsDate, endsDate, onFilter],
  );

  /** handle tag filter */
  const filters = useMemo(() => {
    let list = [];

    if (initialValues.request) {
      list.push({
        key: "request",
        name: "Chương trình KM",
        value: initialValues.request,
      });
    }

    if (initialValues.states?.length) {
      let statesFiltered = "";
      initialValues.states.forEach((stateValue: string) => {
        const state = CAMPAIGN_STATUS.find((item: any) => item.code === stateValue?.toUpperCase());
        statesFiltered = state
          ? statesFiltered + state.value + "; "
          : statesFiltered + stateValue + "; ";
      });
      list.push({
        key: "states",
        name: "Trạng thái",
        value: statesFiltered,
      });
    }

    if (initialValues.starts_date) {
      let startsDateFilter = formatDateFilter(initialValues.starts_date)?.format(
        DATE_FORMAT.DDMMYYY,
      );
      list.push({
        key: "starts_date",
        name: "Từ ngày",
        value: startsDateFilter,
      });
    }

    if (initialValues.ends_date) {
      let endsDateFilter = formatDateFilter(initialValues.ends_date)?.format(DATE_FORMAT.DDMMYYY);
      list.push({
        key: "ends_date",
        name: "Đến ngày",
        value: endsDateFilter,
      });
    }

    return list;
  }, [
    initialValues.request,
    initialValues.states,
    initialValues.starts_date,
    initialValues.ends_date,
  ]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "request":
          onFilter && onFilter({ ...params, request: null });
          break;
        case "states":
          onFilter && onFilter({ ...params, states: [] });
          break;
        case "starts_date":
          setStartsDate(null);
          onFilter && onFilter({ ...params, starts_date: null });
          break;
        case "ends_date":
          setEndsDate(null);
          onFilter && onFilter({ ...params, ends_date: null });
          break;
        default:
          break;
      }
    },
    [onFilter, params],
  );
  /** end handle tag filter */

  return (
    <CampaignListFilterStyled>
      <div className="campaign-list-filter">
        <Form onFinish={onFinish} initialValues={initialValues} layout="inline" form={form}>
          <Item name="request" className="search-input">
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo mã, tên chương trình KM"
              allowClear
              onBlur={(e) => {
                form.setFieldsValue({ query: e.target.value?.trim() || "" });
              }}
              style={{ minWidth: "150px" }}
            />
          </Item>

          <Item name="states" className="select-state">
            <Select
              showArrow
              allowClear
              mode="multiple"
              maxTagCount="responsive"
              optionFilterProp="children"
              placeholder="Chọn trạng thái"
            >
              {CAMPAIGN_STATUS?.map((item) => (
                <Select.Option key={item.code} value={item.code}>
                  {item.value}
                </Select.Option>
              ))}
            </Select>
          </Item>

          <div className="filter-description">Thời gian áp dụng: </div>
          {/** Thời gian bắt đầu */}
          <Item className="select-date">
            <DatePicker
              placeholder="Ngày bắt đầu"
              format={DATE_FORMAT.DDMMYYY}
              value={startDateValue}
              onChange={handleSelectStartDate}
              disabledDate={disabledDateStart}
              getPopupContainer={(trigger: any) => trigger.parentElement}
            />
          </Item>

          <img src={rightArrow} alt="" className="arrow-icon" />

          {/** Thời gian kết thúc */}
          <Item className="select-date">
            <DatePicker
              placeholder="Ngày kết thúc"
              format={DATE_FORMAT.DDMMYYY}
              value={endDateValue}
              onChange={handleSelectEndDate}
              disabledDate={disabledDateEnd}
              getPopupContainer={(trigger: any) => trigger.parentElement}
            />
          </Item>

          <Button type="primary" htmlType="submit">
            Lọc
          </Button>
        </Form>
      </div>

      <div className="filter-tags">
        {filters?.map((filter: any) => {
          return (
            <Tag key={filter.key} className="tag" closable onClose={(e) => onCloseTag(e, filter)}>
              {filter.name}: {filter.value}
            </Tag>
          );
        })}
      </div>
    </CampaignListFilterStyled>
  );
};

export default PromotionCampaignListFilter;
