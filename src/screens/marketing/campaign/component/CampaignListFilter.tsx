import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Form, Input, Select, Tag, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { showError } from "utils/ToastUtils";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { AccountResponse } from "model/account/account.model";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import { PageResponse } from "model/base/base-metadata.response";
import {
  MESSAGE_STATUS_LIST,
  CHANNEL_LIST,
  DATE_LIST_FORMAT,
  CAMPAIGN_STATUS_LIST,
} from "screens/marketing/campaign/campaign-helper";
import { AdvanceFilterStyled, CampaignListFilterStyled } from "screens/marketing/campaign/campaign-styled";
import filterIcon from "assets/icon/filter.svg";
import { convertItemToArray } from "utils/AppUtils";
import { CampaignSearchQuery } from "model/marketing/marketing.model";
import FilterDateCustomerCustom from "component/filter/FilterDateCustomerCustom";
import BaseFilter from "component/filter/base.filter";
import moment from "moment";
import { DATE_FORMAT, formatDateFilter } from "utils/DateUtils";


const { Option } = Select;

type CampaignListFilterProps = {
  isLoading?: boolean;
  params: CampaignSearchQuery;
  initQuery: CampaignSearchQuery;
  initPublicAccounts: any;
  onFilter?: (values: any) => void;
  onClearFilter?: () => void;
};

const CampaignListFilter: React.FC<CampaignListFilterProps> = (props: CampaignListFilterProps) => {
  const {
    isLoading,
    params,
    initQuery,
    initPublicAccounts,
    onFilter,
    onClearFilter,
  } = props;

  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);
  const [accountDataFiltered, setAccountDataFiltered] = useState<Array<AccountResponse>>([]);

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);
  // handle select date
  const [createdDateClick, setCreatedDateClick] = useState("");
  const [sendDateClick, setSendDateClick] = useState("");

  /** handle filter param */
  const initialValues: any = useMemo(() => {
    return {
      ...params,
      statuses: convertItemToArray(params.statuses),
      channels: convertItemToArray(params.channels),
    };
  }, [params]);

  /** handle select sender by filter param */
  const updateAccountData = (accountResponse: PageResponse<AccountResponse> | false) => {
    if (accountResponse) {
      setAccountData(accountResponse.items);
      setAccountDataFiltered(accountResponse.items);
    }
  };
  const handleSenderFilterParam = useCallback(
    (senderParam: any) => {
      if (senderParam) {
        dispatch(
          searchAccountPublicAction(
            { limit: 30, condition: senderParam },
            updateAccountData,
          ),
        );
      }
    },
    [dispatch],
  );
  /** end handle select sender by filter param*/

  useEffect(() => {
    form.setFieldsValue({
      ...initialValues,
    });

    handleSenderFilterParam(initialValues.sender_code);

    handleDateFilterParam(
      initialValues?.created_date_from,
      initialValues?.created_date_to,
      setCreatedDateClick,
    );
    setCreatedDateFrom(initialValues?.created_date_from);
    setCreatedDateTo(initialValues?.created_date_to);

    handleDateFilterParam(
      initialValues?.send_date_from,
      initialValues?.send_date_to,
      setSendDateClick,
    );
    setSendDateFrom(initialValues?.send_date_from);
    setSendDateTo(initialValues?.send_date_to);

  }, [form, handleSenderFilterParam, initialValues]);
  /** end handle filter param */

  /** handle tag filter */
  let tagFilterList = useMemo(() => {
    let list: Array<any>;
    const getItemArrayFilter = (value: string, originalList: Array<any>) => {
      let arrayFilterValue = "";
      if (Array.isArray(initialValues[value]) && initialValues[value].length > 0) {
        initialValues[value].forEach((itemInitial: any) => {
          const itemFilter = originalList.find(
            (_item: any) => _item.value?.toString().toUpperCase() === itemInitial?.toString().toUpperCase(),
          );
          arrayFilterValue = itemFilter ? arrayFilterValue + itemFilter.name + "; " : arrayFilterValue;
        });
      }
      return arrayFilterValue;
    };

    list = Object.keys(initialValues)
      .map((value) => {
        let nameTag: string;
        let filterValue: string;

        switch (value) {
          case "name_or_code":
            filterValue = initialValues[value]?.toString();
            nameTag = "Mã, tên chiến dịch";
            break;
          case "sender_code":
            const account = accountDataFiltered?.find(
              (item: any) => item.code?.toString() === initialValues[value]?.toString(),
            );
            filterValue = account ? (account.code + " - " + account?.full_name)
              : initialValues[value]?.toString();
            nameTag = "Người gửi";
            break;
          case "statuses":
            filterValue = getItemArrayFilter(value, CAMPAIGN_STATUS_LIST) || initialValues[value]?.toString();
            nameTag = "Trạng thái chiến dịch";
            break;
          case "message_statuses":
            filterValue = getItemArrayFilter(value, MESSAGE_STATUS_LIST) || initialValues[value]?.toString();
            nameTag = "Trạng thái gửi tin";
            break;
          case "channels":
            filterValue = getItemArrayFilter(value, CHANNEL_LIST) || initialValues[value]?.toString();
            nameTag = "Kênh gửi";
            break;
          default:
            filterValue = "";
            nameTag = "";
        }
        return {
          key: value,
          name: nameTag,
          value: filterValue,
        };
      });

    if (initialValues.created_date_from || initialValues.created_date_to) {
      let createdDateFiltered =
        (initialValues.created_date_from
          ? formatDateFilter(initialValues.created_date_from)?.format(DATE_FORMAT.DDMMYYY)
          : "") +
        " ~ " +
        (initialValues.created_date_to
          ? formatDateFilter(initialValues.created_date_to)?.format(DATE_FORMAT.DDMMYYY)
          : "");
      list.push({
        key: "createdDate",
        name: "Thời gian tạo",
        value: createdDateFiltered,
      });
    }

    if (initialValues.send_date_from || initialValues.send_date_to) {
      let sendDateFiltered =
        (initialValues.send_date_from
          ? formatDateFilter(initialValues.send_date_from)?.format(DATE_FORMAT.DDMMYYY)
          : "") +
        " ~ " +
        (initialValues.send_date_to
          ? formatDateFilter(initialValues.send_date_to)?.format(DATE_FORMAT.DDMMYYY)
          : "");
      list.push({
        key: "sendDate",
        name: "Thời gian gửi",
        value: sendDateFiltered,
      });
    }
    
    return list.filter(item => item.value);
  }, [accountDataFiltered, initialValues]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "createdDate":
          setCreatedDateClick("");
          setCreatedDateFrom(null);
          setCreatedDateTo(null);
          onFilter &&
          onFilter({
            ...params,
            created_date_from: null,
            created_date_to: null,
          });
          break;
        case "sendDate":
          setSendDateClick("");
          setSendDateFrom(null);
          setSendDateTo(null);
          onFilter &&
          onFilter({
            ...params,
            send_date_from: null,
            send_date_to: null,
          });
          break;
        default:
          onFilter && onFilter({
            ...params,
            [tag.key]: undefined,
          });
          break;
      }
    }, [onFilter, params]);
  /** end handle tag filter */

  /** handle select date */
  const convertDateStringToDate = (dateString: string) => {
    const arrDate = dateString.split("-");
    const stringDate = arrDate[2] + "-" + arrDate[1] + "-" + arrDate[0];
    return new Date(stringDate);
  }

  //created date
  const [createdDateFrom, setCreatedDateFrom] = useState<any>(params.created_date_from);
  const [createdDateTo, setCreatedDateTo] = useState<any>(params.created_date_to);

  const handleCreatedDateFrom = (dateString: string) => {
    setCreatedDateClick("");
    if (!dateString) {
      setCreatedDateFrom(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const startOfDate = moment(_date).utc().startOf("day");
      setCreatedDateFrom(startOfDate);
    }
  };

  const handleCreatedDateTo = (dateString: string) => {
    setCreatedDateClick("");
    if (!dateString) {
      setCreatedDateTo(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const endOfDate = moment(_date).utc().endOf("day");
      setCreatedDateTo(endOfDate);
    }
  };
  //end created date

  //send date
  const [sendDateFrom, setSendDateFrom] = useState<any>(params.send_date_from);
  const [sendDateTo, setSendDateTo] = useState<any>(params.send_date_to);

  const handleSendDateFrom = (dateString: string) => {
    setSendDateClick("");
    if (!dateString) {
      setSendDateFrom(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const startOfDate = moment(_date).utc().startOf("day");
      setSendDateFrom(startOfDate);
    }
  };

  const handleSendDateTo = (dateString: string) => {
    setSendDateClick("");
    if (!dateString) {
      setSendDateTo(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const endOfDate = moment(_date).utc().endOf("day");
      setSendDateTo(endOfDate);
    }
  };
  //end send date

  // handle select date by filter param
  const handleDateFilterParam = (date_from: any, date_to: any, setDate: any) => {
    const dateFrom = formatDateFilter(date_from)?.format(DATE_FORMAT.DD_MM_YYYY);
    const dateTo = formatDateFilter(date_to)?.format(DATE_FORMAT.DD_MM_YYYY);

    if (dateFrom === DATE_LIST_FORMAT.todayFrom && dateTo === DATE_LIST_FORMAT.todayTo) {
      setDate("today");
    } else if (
      dateFrom === DATE_LIST_FORMAT.yesterdayFrom &&
      dateTo === DATE_LIST_FORMAT.yesterdayTo
    ) {
      setDate("yesterday");
    } else if (
      dateFrom === DATE_LIST_FORMAT.thisWeekFrom &&
      dateTo === DATE_LIST_FORMAT.thisWeekTo
    ) {
      setDate("thisWeek");
    } else if (
      dateFrom === DATE_LIST_FORMAT.lastWeekFrom &&
      dateTo === DATE_LIST_FORMAT.lastWeekTo
    ) {
      setDate("lastWeek");
    } else if (
      dateFrom === DATE_LIST_FORMAT.thisMonthFrom &&
      dateTo === DATE_LIST_FORMAT.thisMonthTo
    ) {
      setDate("thisMonth");
    } else if (
      dateFrom === DATE_LIST_FORMAT.lastMonthFrom &&
      dateTo === DATE_LIST_FORMAT.lastMonthTo
    ) {
      setDate("lastMonth");
    } else {
      setDate("");
    }
  };
  
  const clearCreatedDate = () => {
    setCreatedDateClick("");
    setCreatedDateFrom(null);
    setCreatedDateTo(null);
  };

  const clearSendDate = () => {
    setSendDateClick("");
    setSendDateFrom(null);
    setSendDateTo(null);
  };
  const clickOptionDate = useCallback(
    (type, value) => {
      let startDateValue = null;
      let endDateValue = null;

      switch (value) {
        case "today":
          startDateValue = moment().utc().startOf("day");
          endDateValue = moment().utc().endOf("day");
          break;
        case "yesterday":
          startDateValue = moment().utc().startOf("day").subtract(1, "days");
          endDateValue = moment().utc().endOf("day").subtract(1, "days");
          break;
        case "thisWeek":
          startDateValue = moment().utc().startOf("week");
          endDateValue = moment().utc().endOf("week");
          break;
        case "lastWeek":
          startDateValue = moment().utc().startOf("week").subtract(1, "weeks");
          endDateValue = moment().utc().endOf("week").subtract(1, "weeks");
          break;
        case "thisMonth":
          startDateValue = moment().utc().startOf("month");
          endDateValue = moment().utc().endOf("month");
          break;
        case "lastMonth":
          startDateValue = moment().utc().subtract(1, "months").startOf("month");
          endDateValue = moment().utc().subtract(1, "months").endOf("month");
          break;
        default:
          break;
      }

      switch (type) {
        case "createdDate":
          if (createdDateClick === value) {
            clearCreatedDate();
          } else {
            setCreatedDateClick(value);
            setCreatedDateFrom(startDateValue);
            setCreatedDateTo(endDateValue);
          }
          break;
        case "sendDate":
          if (sendDateClick === value) {
            clearSendDate();
          } else {
            setSendDateClick(value);
            setSendDateFrom(startDateValue);
            setSendDateTo(endDateValue);
          }
          break;
        default:
          break;
      }
    },
    [createdDateClick, sendDateClick],
  );
  /** end handle select date */

  /** advance filter */
  const openBaseFilter = useCallback(() => {
    setVisibleBaseFilter(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisibleBaseFilter(false);
  }, []);

  const onFilterClick = useCallback(async () => {
    let isValidForm = true;
    await form
      .validateFields()
      .then()
      .catch(() => {
        isValidForm = false;
      });

    if (isValidForm) {
      setVisibleBaseFilter(false);
      form?.submit();
    } else {
      showError("Vui lòng kiểm tra lại bộ lọc!");
    }
  }, [form]);

  const onClearAdvancedFilter = useCallback(() => {
    clearCreatedDate();
    clearSendDate();
    setAccountData(initPublicAccounts);

    setVisibleBaseFilter(false);
    form.setFieldsValue(initQuery);
    onClearFilter && onClearFilter();
  }, [form, initPublicAccounts, initQuery, onClearFilter]);

  /** end advance filter */


  /** on filter */
  const onFinish = useCallback(
    (values) => {
      const formValues = {
        ...values,
        created_date_from: createdDateFrom,
        created_date_to: createdDateTo,
        send_date_from: sendDateFrom,
        send_date_to: sendDateTo,
      };
      onFilter && onFilter(formValues);
    },
    [createdDateFrom, createdDateTo, onFilter, sendDateFrom, sendDateTo],
  );


  /** handle scroll customer filter page */
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const setPageScroll = (overflowType: string) => {
    let filterContainerSelector: any = document.querySelector(".body-container");
    if (filterContainerSelector && filterContainerSelector.children?.length > 0) {
      filterContainerSelector.children[0].style.overflow = overflowType;
    }
  };

  // if the popup dropdown is scrolling then page scroll is hidden
  const handleOnSelectPopupScroll = () => {
    if (isDropdownVisible) {
      setPageScroll("hidden");
    }
  };

  const handleOnMouseLeaveSelect = () => {
    setPageScroll("scroll");
  };

  const handleOnDropdownVisibleChange = (open: boolean) => {
    setIsDropdownVisible(open);
  };

  const onInputSelectFocus = () => {
    setIsDropdownVisible(true);
  };

  const onInputSelectBlur = () => {
    setIsDropdownVisible(false);
  };

  useEffect(() => {
    if (!isDropdownVisible) {
      setPageScroll("scroll");
    }
  }, [isDropdownVisible]);
  /** end handle scroll customer filter page */

  return (
    <CampaignListFilterStyled>
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={initialValues}
        layout="inline"
        className="inline-filter"
      >
        <Form.Item name="name_or_code" className="input-search">
          <Input
            disabled={isLoading}
            allowClear
            prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
            placeholder="Tên kiếm theo mã, tên chiến dịch"
          />
        </Form.Item>

        <Form.Item
          name="statuses"
          className="statuses"
        >
          <Select
            mode="multiple"
            maxTagCount="responsive"
            showArrow
            showSearch
            placeholder="Trạng thái chiến dịch"
            allowClear
            getPopupContainer={(trigger: any) => trigger.parentElement}
            optionFilterProp="children"
          >
            {CAMPAIGN_STATUS_LIST?.map((item: any) => (
              <Option key={item.value} value={item.value}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="channels"
          className="channels"
        >
          <Select
            mode="multiple"
            maxTagCount="responsive"
            showArrow
            showSearch
            placeholder="Kênh gửi"
            allowClear
            getPopupContainer={(trigger: any) => trigger.parentElement}
            optionFilterProp="children"
          >
            {CHANNEL_LIST?.map((item: any) => (
              <Option key={item.value} value={item.value}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={isLoading}>
            Lọc
          </Button>
        </Form.Item>

        <Button onClick={openBaseFilter} disabled={isLoading}>
          <img src={filterIcon} style={{ marginRight: 10 }} alt="" />
          <span>Thêm bộ lọc</span>
        </Button>
      </Form>

      {/*thêm bộ lọc*/}
      <BaseFilter
        onClearFilter={onClearAdvancedFilter}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visibleBaseFilter}
        width={900}
      >
        <AdvanceFilterStyled>
          <Form
            form={form}
            onFinish={onFinish}
            initialValues={params}
            layout="vertical"
          >
            <Row gutter={24} className={"advance-filter"}>
              <Col xs={24} lg={12} className={"col-advance-filter"}>
                <div style={{ marginBottom: "8px"}}><b>Thời gian tạo</b></div>
                <FilterDateCustomerCustom
                  fieldNameFrom="created_date_from"
                  fieldNameTo="created_date_to"
                  dateType="createdDate"
                  clickOptionDate={clickOptionDate}
                  dateSelected={createdDateClick}
                  startDate={createdDateFrom}
                  endDate={createdDateTo}
                  handleSelectDateStart={handleCreatedDateFrom}
                  handleSelectDateEnd={handleCreatedDateTo}
                />
              </Col>

              <Col xs={24} lg={12} className={"col-advance-filter"}>
                <div style={{ marginBottom: "8px"}}><b>Thời gian gửi</b></div>
                <FilterDateCustomerCustom
                  fieldNameFrom="send_date_from"
                  fieldNameTo="send_date_to"
                  dateType="sendDate"
                  clickOptionDate={clickOptionDate}
                  dateSelected={sendDateClick}
                  startDate={sendDateFrom}
                  endDate={sendDateTo}
                  handleSelectDateStart={handleSendDateFrom}
                  handleSelectDateEnd={handleSendDateTo}
                />
              </Col>

              <Col xs={24} lg={12} className={"col-advance-filter"}>
                <Form.Item
                  name="sender_code"
                  className="sender"
                  label={<b>Người gửi</b>}
                >
                  <AccountCustomSearchSelect
                    placeholder="Tìm theo họ tên hoặc mã nhân viên"
                    dataToSelect={accountData}
                    setDataToSelect={setAccountData}
                    initDataToSelect={initPublicAccounts}
                    getPopupContainer={(trigger: any) => trigger.parentNode}
                    onFocus={onInputSelectFocus}
                    onBlur={onInputSelectBlur}
                    onDropdownVisibleChange={handleOnDropdownVisibleChange}
                    onPopupScroll={handleOnSelectPopupScroll}
                    onMouseLeave={handleOnMouseLeaveSelect}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} lg={12} className={"col-advance-filter"}>
                <Form.Item
                  name="message_statuses"
                  className="status"
                  label={<b>Trạng thái gửi tin</b>}
                >
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showArrow
                    showSearch
                    placeholder="Chọn trạng thái gửi tin"
                    allowClear
                    getPopupContainer={(trigger: any) => trigger.parentElement}
                    optionFilterProp="children"
                  >
                    {MESSAGE_STATUS_LIST?.map((item: any) => (
                      <Option key={item.value} value={item.value}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </AdvanceFilterStyled>
      </BaseFilter>

      {/*tags filter*/}
      <div className="filter-tags">
        {tagFilterList?.map((tagFilter: any) => {
          return (
            <Tag
              key={tagFilter.key}
              className="tag"
              closable={!isLoading}
              onClose={(e) => onCloseTag(e, tagFilter)}
            >
              {tagFilter.name}: {tagFilter.value}
            </Tag>
          );
        })}
      </div>
    </CampaignListFilterStyled>
  );
};

export default CampaignListFilter;
