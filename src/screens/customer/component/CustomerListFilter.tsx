import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button, Form,
  Input,
  Select,
  Tag
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import filterIcon from "assets/icon/filter.svg";
import rightArrow from "assets/icon/right-arrow.svg";
import settingGearIcon from "assets/icon/setting-gear-icon.svg";
import BaseFilter from "component/filter/base.filter";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { AccountResponse, AccountSearchQuery } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { CustomerSearchQuery } from "model/query/customer.query";
import { RootReducerType } from "model/reducers/RootReducerType";
import { ChannelResponse } from "model/response/product/channel.response";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SelectAreaFilter from "screens/customer/component/SelectAreaFilter";
import { StyledCustomerBaseFilter, StyledCustomerFilter } from "screens/customer/customerStyled";
import SelectDateFilter from "screens/ecommerce/common/SelectDateFilter";
import { RegUtil } from "utils/RegUtils";








type CustomerListFilterProps = {
  isLoading?: boolean;
  params: any;
  initQuery: any;
  onFilter?: (values: CustomerSearchQuery) => void;
  setShowSettingColumn?: () => void;
  onClearFilter?: () => void;
  types?: any;
  groups?: any;
  loyaltyUsageRules?: any;
  listStore?: Array<StoreResponse>;
  listChannel?: Array<ChannelResponse>;
};

const { Option } = Select;
const today = new Date();
const THIS_YEAR = today.getFullYear();

const CustomerListFilter: React.FC<CustomerListFilterProps> = (
  props: CustomerListFilterProps
) => {
  const {
    isLoading,
    params,
    initQuery,
    onClearFilter,
    onFilter,
    setShowSettingColumn,
    types,
    groups,
    loyaltyUsageRules,
    listStore,
    listChannel,
  } = props;

  const dispatch = useDispatch();
  const [formCustomerFilter] = Form.useForm();
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const LIST_GENDER = bootstrapReducer.data?.gender;
  const autoCompleteRef = React.createRef<RefSelectProps>();

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);
  

  const [keySearchAccount, setKeySearchAccount] = useState("");
  const [resultSearch, setResultSearch] = React.useState<
    PageResponse<AccountResponse> | false
    >(false);
  
  const initQueryAccount: AccountSearchQuery = useMemo(
    () => ({
      info: "",
    }),
    []
  );

  const initialValues = useMemo(() => {
    return {
      ...params,
    };
  }, [params]);

  const AccountConvertResultSearch = React.useMemo(() => {
    let options: any[] = [];
    if (resultSearch)
      resultSearch.items.forEach((item: AccountResponse, index: number) => {
        options.push({
          label: item.code + " - " + item.full_name,
          value: item.code + " - " + item.full_name,
        });
      });
    return options;
  }, [resultSearch]);

  const AccountChangeSearch = React.useCallback(
    (value) => {
      setKeySearchAccount(value);
      initQueryAccount.info = value;
      dispatch(AccountSearchAction(initQueryAccount, setResultSearch));
    },
    [dispatch, initQueryAccount]
  );

  const SearchAccountSelect = React.useCallback(
    (value, o) => {
      let index: number = -1;
      if (resultSearch) {
        index = resultSearch.items.findIndex(
          (accountResponse: AccountResponse) =>
            accountResponse.id && accountResponse.id.toString() === value
        );
        if (index !== -1) {
          setKeySearchAccount(
            resultSearch.items[index].code +
              "-" +
              resultSearch.items[index].full_name
          );
          autoCompleteRef.current?.blur();
        }
      }
    },
    [autoCompleteRef, resultSearch]
  );

  const setDataAccounts = React.useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setResultSearch(data);
    },
    []
  );
  
  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);


  // handle select birth day
  const initDateList = () => {
    const dateList: Array<any> = [];
    for (let i = 1; i < 32; i++) {
      dateList.push({
        key: i,
        value: i,
        name: i,
        disable: false,
      })
    }
    return dateList;
  }

  const INIT_FROM_DATE_LIST = [
    {
      key: 0,
      value: 0,
      name: "- Từ ngày -",
      disable: true,
    }
  ].concat(initDateList());

  const INIT_TO_DATE_LIST = [
    {
      key: 0,
      value: 0,
      name: "- Đến ngày -",
      disable: true,
    }
  ].concat(initDateList());

  const [fromDateList, setFromDateList] = useState<any>(INIT_FROM_DATE_LIST);
  const [toDateList, setToDateList] = useState<any>(INIT_TO_DATE_LIST);


  const onSelectFromDate = (value: any) => {
    const newToDateList = [ ...toDateList ];
    newToDateList.forEach((item: any) => {
      item.disable = (item.value < value);
    })
    setToDateList(newToDateList);
  }

  const onClearFromDate = () => {
    setToDateList(INIT_TO_DATE_LIST);
  }

  const onSelectToDate = (value: any) => {
    const newFromDateList = [ ...fromDateList ];
    newFromDateList.forEach((item: any) => {
      item.disable = (item.value > value || item.value === 0);
    })
    setFromDateList(newFromDateList);
  }

  const onClearToDate = () => {
    setFromDateList(INIT_FROM_DATE_LIST);
  }
  // end handle select birth day

  // handle select birth month
  const initMonthList = () => {
    const monthList: Array<any> = [];
    for (let i = 1; i <= 12; i++) {
      monthList.push({
        key: i,
        value: i,
        name: i,
        disable: false,
      })
    }
    return monthList;
  }

  const INIT_FROM_MONTH_LIST = [
    {
      key: 0,
      value: 0,
      name: "- Từ tháng -",
      disable: true,
    }
  ].concat(initMonthList());

  const INIT_TO_MONTH_LIST = [
    {
      key: 0,
      value: 0,
      name: "- Đến tháng -",
      disable: true,
    }
  ].concat(initMonthList());

  const [fromMonthList, setFromMonthList] = useState<any>(INIT_FROM_MONTH_LIST);
  const [toMonthList, setToMonthList] = useState<any>(INIT_TO_MONTH_LIST);


  const onSelectFromMonth = (value: any) => {
    const newToMonthList = [ ...toMonthList ];
    newToMonthList.forEach((item: any) => {
      item.disable = (item.value < value);
    })
    setToMonthList(newToMonthList);
  }

  const onClearFromMonth = () => {
    setToMonthList(INIT_TO_MONTH_LIST);
  }

  const onSelectToMonth = (value: any) => {
    const newFromMonthList = [ ...fromMonthList ];
    newFromMonthList.forEach((item: any) => {
      item.disable = (item.value > value || item.value === 0);
    })
    setFromMonthList(newFromMonthList);
  }

  const onClearToMonth = () => {
    setFromMonthList(INIT_FROM_MONTH_LIST);
  }
  // end handle select birth month

  // handle select birth year
  const initYearList = () => {
    const yearList: Array<any> = [];
    for (let i = 1900; i <= THIS_YEAR; i++) {
      yearList.push({
        key: i,
        value: i,
        name: i,
        disable: false,
      })
    }
    return yearList;
  }

  const INIT_FROM_YEAR_LIST = [
    {
      key: 0,
      value: 0,
      name: "- Từ năm -",
      disable: true,
    }
  ].concat(initYearList());

  const INIT_TO_YEAR_LIST = [
    {
      key: 0,
      value: 0,
      name: "- Đến năm -",
      disable: true,
    }
  ].concat(initYearList());

  const [fromYearList, setFromYearList] = useState<any>(INIT_FROM_YEAR_LIST);
  const [toYearList, setToYearList] = useState<any>(INIT_TO_YEAR_LIST);


  const onSelectFromYear = (value: any) => {
    const newToYearList = [ ...toYearList ];
    newToYearList.forEach((item: any) => {
      item.disable = (item.value < value);
    })
    setToYearList(newToYearList);
  }

  const onClearFromYear = () => {
    setToYearList(INIT_TO_YEAR_LIST);
  }

  const onSelectToYear = (value: any) => {
    const newFromYearList = [ ...fromYearList ];
    newFromYearList.forEach((item: any) => {
      item.disable = (item.value > value || item.value === 0);
    })
    setFromYearList(newFromYearList);
  }

  const onClearToYear = () => {
    setFromYearList(INIT_FROM_YEAR_LIST);
  }
  // end handle select birth year

  // handle select date
  const [firstOrderDateClick, setFirstOrderDateClick] = useState("");
  const [lastOrderDateClick, setLastOrderDateClick] = useState("");

  const [firstOrderDateFrom, setFirstOrderDateFrom] = useState(
    params.date_of_first_order
      ? moment(params.date_of_first_order, "DD-MM-YYYY")
      : null
  );
  const [firstOrderDateTo, setFirstOrderDateTo] = useState(
    params.date_of_first_order
      ? moment(params.date_of_first_order, "DD-MM-YYYY")
      : null
  );

  const [lastOrderDateFrom, setLastOrderDateFrom] = useState(
    params.date_of_last_order
      ? moment(params.date_of_last_order, "DD-MM-YYYY")
      : null
  );
  const [lastOrderDateTo, setLastOrderDateTo] = useState(
    params.date_of_last_order
      ? moment(params.date_of_last_order, "DD-MM-YYYY")
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
        case "firstOrderDate":
          if (firstOrderDateClick === value) {
            setFirstOrderDateClick("");
            setFirstOrderDateFrom(null);
            setFirstOrderDateTo(null);
          } else {
            setFirstOrderDateClick(value);
            setFirstOrderDateFrom(moment(minValue, "DD-MM-YYYY"));
            setFirstOrderDateTo(moment(maxValue, "DD-MM-YYYY"));
          }
          break;
        case "lastOrderDate":
          if (lastOrderDateClick === value) {
            setLastOrderDateClick("");
            setLastOrderDateFrom(null);
            setLastOrderDateTo(null);
          } else {
            setLastOrderDateClick(value);
            setLastOrderDateFrom(moment(minValue, "DD-MM-YYYY"));
            setLastOrderDateTo(moment(maxValue, "DD-MM-YYYY"));
          }
          break;
        default:
          break;
      }
    },
    [firstOrderDateClick, lastOrderDateClick]
  );

  const onChangeRangeDate = useCallback((dates, dateString, type) => {
    switch (type) {
      case "firstOrderDate":
        setFirstOrderDateClick("");
        setFirstOrderDateFrom(dateString[0]);
        setFirstOrderDateTo(dateString[1]);
        break;
      case "lastOrderDate":
        setLastOrderDateClick("");
        setLastOrderDateFrom(dateString[0]);
        setLastOrderDateTo(dateString[1]);
        break;
      default:
        break;
    }
  }, []);
  // end handle select date

  // handle tag filter
  let filters = useMemo(() => {
    let list = [];

    if (initialValues.gender) {
      const gender = LIST_GENDER?.find((item) => item.value.toString() === initialValues.gender.toString());
      list.push({
        key: "gender",
        name: "Giới tính",
        value: gender?.name,
      });
    }

    if (initialValues.customer_group_id) {
      const group = groups?.find((item: any) => item.id.toString() === initialValues.customer_group_id.toString());
      list.push({
        key: "customer_group_id",
        name: "Nhóm khách hàng",
        value: group?.name,
      });
    }

    if (initialValues.customer_level_id) {
      const loyaltyUsageRule = loyaltyUsageRules?.find((item: any) => item.rank_id.toString() === initialValues.customer_level_id.toString());
      list.push({
        key: "customer_level_id",
        name: "Hạng thẻ",
        value: loyaltyUsageRule?.rank_name,
      });
    }

    if (initialValues.responsible_staff_code) {
      const staff = AccountConvertResultSearch?.find((item: any) => item.value.split(" - ")[0] === initialValues.responsible_staff_code);
      list.push({
        key: "responsible_staff_code",
        name: "Nhân viên phụ trách",
        value: staff?.label,
      });
    }

    if (initialValues.customer_type_id) {
      const customer_type = types?.find((item: any) => item.id.toString() === initialValues.customer_type_id.toString());
      list.push({
        key: "customer_type_id",
        name: "Loại khách hàng",
        value: customer_type?.name,
      });
    }

    if (initialValues.card_issuer) {
      const store = listStore?.find((item: any) => item.id.toString() === initialValues.card_issuer.toString());
      list.push({
        key: "card_issuer",
        name: "Cửa hàng cấp thẻ",
        value: store?.name,
      });
    }

    if (initialValues.store_ids?.length) {
      let stores = "";
      initialValues.store_ids.forEach((store_id: any) => {
        const findStatus = listStore?.find((item) => item.id.toString() === store_id.toString());
        stores = findStatus ? (stores + findStatus.name + "; ") : stores;
      });
      list.push({
        key: "store_ids",
        name: "Cửa hàng",
        value: stores,
      });
    }

    if (initialValues.day_of_birth_from || initialValues.day_of_birth_to) {
      let textDayOfBirth =
        (initialValues.day_of_birth_from ? initialValues.day_of_birth_from : "??") +
        " ~ " +
        (initialValues.day_of_birth_to ? initialValues.day_of_birth_to : "??");
      list.push({
        key: "day_of_birth",
        name: "Ngày sinh",
        value: textDayOfBirth,
      });
    }
    

    return list;
  },
    [initialValues.gender, initialValues.customer_group_id, initialValues.customer_level_id, initialValues.responsible_staff_code, initialValues.customer_type_id, initialValues.card_issuer, initialValues.store_ids, initialValues.day_of_birth_from, initialValues.day_of_birth_to, LIST_GENDER, groups, loyaltyUsageRules, AccountConvertResultSearch, types, listStore]);
    
  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "gender":
          onFilter && onFilter({ ...params, gender: null });
          formCustomerFilter?.setFieldsValue({ gender: null });
          break;
        case "customer_group_id":
          onFilter && onFilter({ ...params, customer_group_id: null });
          formCustomerFilter?.setFieldsValue({ customer_group_id: null });
          break;
        case "customer_level_id":
          onFilter && onFilter({ ...params, customer_level_id: null });
          formCustomerFilter?.setFieldsValue({ customer_level_id: null });
          break;
        case "responsible_staff_code":
          onFilter && onFilter({ ...params, responsible_staff_code: null });
          formCustomerFilter?.setFieldsValue({ responsible_staff_code: null });
          break;
        case "customer_type_id":
          onFilter && onFilter({ ...params, customer_type_id: null });
          formCustomerFilter?.setFieldsValue({ customer_type_id: null });
          break;
        case "card_issuer":
          onFilter && onFilter({ ...params, card_issuer: null });
          formCustomerFilter?.setFieldsValue({ card_issuer: null });
          break;
        case "store_ids":
          onFilter && onFilter({ ...params, store_ids: [] });
          formCustomerFilter?.setFieldsValue({ store_ids: [] });
          break;
        case "day_of_birth":
          onFilter && onFilter({ ...params, day_of_birth_from: null, day_of_birth_to: null });
          formCustomerFilter?.setFieldsValue({ day_of_birth_from: null, day_of_birth_to: null });
          break;
        
        default:
          break;
      }
    },
    [formCustomerFilter, onFilter, params]
  );
  // end handle tag filter

  // handle filter action
  const openBaseFilter = useCallback(() => {
    setVisibleBaseFilter(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisibleBaseFilter(false);
  }, []);

  const onFilterClick = useCallback(() => {
    setVisibleBaseFilter(false);
    formCustomerFilter?.submit();
  }, [formCustomerFilter]);

  //clear base filter
  const onClearBaseFilter = useCallback(() => {
    setVisibleBaseFilter(false);
    formCustomerFilter.setFieldsValue(initQuery);
    onClearFilter && onClearFilter();
  }, [formCustomerFilter, initQuery, onClearFilter]);
  // end handle filter action

  const onFinish = useCallback(
    (values) => {
      const formValues = {
        ...values,
        responsible_staff_code: values.responsible_staff_code
          ? values.responsible_staff_code.split(" - ")[0]
          : null,
        first_order_date_from: firstOrderDateFrom
          ? moment(firstOrderDateFrom, "DD-MM-YYYY")?.format("DD-MM-YYYY")
          : null,
        first_order_date_to: firstOrderDateTo
          ? moment(firstOrderDateTo, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
        last_order_date_from: lastOrderDateFrom
          ? moment(lastOrderDateFrom, "DD-MM-YYYY")?.format("DD-MM-YYYY")
          : null,
        last_order_date_to: lastOrderDateTo
          ? moment(lastOrderDateTo, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
      };
        
      onFilter && onFilter(formValues);
    },
    [firstOrderDateTo, firstOrderDateFrom, lastOrderDateTo, lastOrderDateFrom, onFilter]
  );

  
  const widthScreen = () => {
    if (window.innerWidth >= 1600) {
      return 1400;
    } else if (window.innerWidth < 1600 && window.innerWidth >= 1200) {
      return 1000;
    } else {
      return 800;
    }
  };


  return (
    <StyledCustomerFilter>
      <Form
        form={formCustomerFilter}
        onFinish={onFinish}
        initialValues={params}
        layout="inline"
        className="inline-filter"
      >
        <Form.Item name="request" className="input-search">
          <Input
            disabled={isLoading}
            allowClear
            prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
            placeholder="Tên khách hàng, mã khách hàng , số điện thoại, email"
          />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={isLoading}>
            Lọc
          </Button>
        </Form.Item>

        <Form.Item>
          <Button onClick={openBaseFilter} disabled={isLoading}>
            <img src={filterIcon} style={{ marginRight: 10 }} alt="" />
            <span>Thêm bộ lọc</span>
          </Button>
        </Form.Item>
        
        <Button
          disabled={isLoading}
          onClick={setShowSettingColumn}
          icon={<img style={{ marginBottom: 15 }} src={settingGearIcon} alt="" />}
        />
      </Form>
      
      <BaseFilter
        onClearFilter={onClearBaseFilter}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visibleBaseFilter}
        width={widthScreen()}
      >
        <StyledCustomerBaseFilter>
          <Form
            form={formCustomerFilter}
            onFinish={onFinish}
            initialValues={params}
            layout="vertical"
          >
            <div className="base-filter-container">
              <div className="base-filter-row">
                <Form.Item
                  name="gender"
                  label={<b>Giới tính</b>}
                  className="left-filter"
                >
                  <Select
                    showSearch
                    placeholder="Chọn giới tính"
                    allowClear
                    optionFilterProp="children"
                  >
                    {LIST_GENDER &&
                      LIST_GENDER.map((c: any) => (
                        <Option key={c.value} value={c.value}>
                          {c.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="customer_group_id"
                  label={<b>Nhóm khách hàng:</b>}
                  className="center-filter"
                >
                  <Select
                    // mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn nhóm khách hàng"
                    optionFilterProp="children"
                  >
                    {groups.map((group: any) => (
                      <Option key={group.id} value={group.id}>
                        {group.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="customer_level_id"
                  label={<b>Hạng thẻ</b>}
                  className="right-filter"
                >
                  <Select
                    // mode="multiple"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn hạng thẻ"
                    maxTagCount="responsive"
                  >
                    {loyaltyUsageRules?.map((loyalty: any) => (
                      <Option key={loyalty.id} value={loyalty.rank_id}>
                        {loyalty.rank_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="base-filter-row">
                <Form.Item
                  name="responsible_staff_code"
                  label={<b>Nhân viên phụ trách</b>}
                  className="left-filter"
                >
                  <AutoComplete
                    notFoundContent={
                      keySearchAccount.length >= 3
                        ? "Không có bản ghi nào"
                        : undefined
                    }
                    id="search_account"
                    value={keySearchAccount}
                    ref={autoCompleteRef}
                    onSelect={SearchAccountSelect}
                    onSearch={AccountChangeSearch}
                    options={AccountConvertResultSearch}
                  >
                    <Input
                      placeholder="Chọn nhân viên phụ trách"
                      suffix={<DownOutlined style={{ color: "#ABB4BD" }} />}
                    />
                  </AutoComplete>
                </Form.Item>

                <Form.Item
                  name="customer_type_id"
                  label={<b>Loại khách hàng:</b>}
                  className="center-filter"
                >
                  <Select
                    // mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    placeholder="Chọn loại khách hàng"
                    allowClear
                    optionFilterProp="children"
                  >
                    {types.map((type: any) => (
                      <Option key={type.id} value={type.id}>
                        {type.name + ` - ${type.code}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="card_issuer"
                  label={<b>Cửa hàng cấp thẻ</b>}
                  className="right-filter"
                >
                  <Select
                    // mode="multiple"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children"
                    maxTagCount="responsive"
                    defaultValue={undefined}
                  >
                    {listStore?.map((item) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="base-filter-row">
                <Form.Item
                  name="store_ids"
                  label={<b>Cửa hàng</b>}
                  className="left-filter"
                >
                  <Select
                    mode="multiple"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children"
                    maxTagCount="responsive"
                  >
                    {listStore?.map((item) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="center-filter">
                  <div className="title">Ngày sinh</div>
                  <div className="select-scope">
                    <Form.Item name="day_of_birth_from" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Từ ngày"
                        onSelect={onSelectFromDate}
                        onClear={onClearFromDate}
                      >
                        {fromDateList.map((item: any) => (
                          <Option key={item.key} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item name="day_of_birth_to" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Đến ngày"
                        onSelect={onSelectToDate}
                        onClear={onClearToDate}
                      >
                        {toDateList.map((item: any) => (
                          <Option key={item.key} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                {/* Lọc theo năm sinh */}
                <div className="right-filter">
                  <div className="title">Năm sinh</div>
                  <div className="select-scope">
                    <Form.Item name="year_of_birth_from" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Từ năm"
                        onSelect={onSelectFromYear}
                        onClear={onClearFromYear}
                      >
                        {fromYearList.map((item: any) => (
                          <Option key={item.key} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item name="year_of_birth_to" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Đến năm"
                        onSelect={onSelectToYear}
                        onClear={onClearToYear}
                      >
                        {toYearList.map((item: any) => (
                          <Option key={item.key} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="base-filter-row">
                <Form.Item
                  name="channel_ids"
                  label={<b>Kênh mua hàng</b>}
                  className="left-filter"
                >
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn kênh"
                    optionFilterProp="children"
                  >
                    {listChannel?.map((item, index) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="center-filter">
                  <div className="title">Tháng sinh</div>
                  <div className="select-scope">
                    <Form.Item name="month_of_birth_from" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Từ tháng"
                        onSelect={onSelectFromMonth}
                        onClear={onClearFromMonth}
                      >
                        {fromMonthList.map((item: any) => (
                          <Option key={item.key} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item name="month_of_birth_to" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Đến tháng"
                        onSelect={onSelectToMonth}
                        onClear={onClearToMonth}
                      >
                        {toMonthList.map((item: any) => (
                          <Option key={item.key} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                {/* Lọc theo độ tuổi */}
                <div className="right-filter">
                  <div className="title">Độ tuổi</div>
                  <div className="select-scope">
                    <Form.Item
                      className="select-item"
                      name="age_from"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Số tuổi chỉ được phép nhập số",
                        },
                      ]}
                    >
                      <Input placeholder="Từ" />
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item
                      className="select-item"
                      name="age_to"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Số tuổi chỉ được phép nhập số",
                        },
                      ]}
                    >
                      <Input placeholder="Đến" />
                    </Form.Item>
                  </div>
                </div>
              </div>
              
              <div className="base-filter-row">
                {/* Tìm kiếm theo khu vực */}
                <div className="left-filter">
                  <SelectAreaFilter formCustomerFilter={formCustomerFilter} />
                </div>

                <div className="center-filter">
                  <div>
                    <div className="title">Tổng đơn hàng</div>
                    <div className="select-scope">
                      <Form.Item
                        className="select-item"
                        name="total_order_from"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số đơn hàng chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Từ" />
                      </Form.Item>

                      <img src={rightArrow} alt="" />

                      <Form.Item
                        className="select-item"
                        name="total_order_to"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số đơn hàng chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Đến" />
                      </Form.Item>
                    </div>
                  </div>

                  <div>
                    <div className="title">Tiền tích luỹ</div>
                    <div className="select-scope">
                      <Form.Item
                        className="select-item"
                        name="accumulated_amount_from"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Tiền tích luỹ chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Từ" />
                      </Form.Item>

                      <img src={rightArrow} alt="" />

                      <Form.Item
                        className="select-item"
                        name="accumulated_amount_to"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Tiền tích luỹ chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Đến" />
                      </Form.Item>
                    </div>
                  </div>

                  <div>
                    <div className="title">Số đơn trả hàng</div>
                    <div className="select-scope">
                      <Form.Item
                        className="select-item"
                        name="total_refunded_order_from"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số đơn trả hàng chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Từ" />
                      </Form.Item>

                      <img src={rightArrow} alt="" />

                      <Form.Item
                        className="select-item"
                        name="total_refunded_order_to"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số đơn trả hàng chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Đến" />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className="right-filter">
                  <div>
                    <div className="title">Số tiền còn thiếu để nâng hạng</div>
                    <div className="select-scope">
                      <Form.Item
                        className="select-item"
                        name="remain_amount_from"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số tiền chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Từ" />
                      </Form.Item>

                      <img src={rightArrow} alt="" />

                      <Form.Item
                        className="select-item"
                        name="remain_amount_to"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số tiền chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Đến" />
                      </Form.Item>
                    </div>
                  </div>

                  <div>
                    <div className="title">Giá trị trung bình</div>
                    <div className="select-scope">
                      <Form.Item
                        className="select-item"
                        name="average_order_amount_from"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số tiền chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Từ" />
                      </Form.Item>

                      <img src={rightArrow} alt="" />

                      <Form.Item
                        className="select-item"
                        name="average_order_amount_to"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số tiền chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Đến" />
                      </Form.Item>
                    </div>
                  </div>

                  <div>
                    <div className="title">Tổng giá trị đơn trả</div>
                    <div className="select-scope">
                      <Form.Item
                        className="select-item"
                        name="total_refunded_amount_from"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số tiền chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Từ" />
                      </Form.Item>

                      <img src={rightArrow} alt="" />

                      <Form.Item
                        className="select-item"
                        name="total_refunded_amount_to"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số tiền chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Đến" />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>

              <div className="base-filter-row">
                <Form.Item
                  name="first_order_store_id"
                  label={<b>Cửa hàng mua đầu</b>}
                  className="left-filter"
                >
                  <Select
                    mode="multiple"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children"
                    maxTagCount="responsive"
                  >
                    {listStore?.map((item) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="last_order_store_id"
                  label={<b>Cửa hàng mua cuối</b>}
                  className="center-filter"
                >
                  <Select
                    mode="multiple"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children"
                    maxTagCount="responsive"
                  >
                    {listStore?.map((item) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="right-filter">
                    <div className="title">Số ngày chưa mua hàng</div>
                    <div className="select-scope">
                      <Form.Item
                        className="select-item"
                        name="days_without_purchase_from"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số ngày chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Từ" />
                      </Form.Item>

                      <img src={rightArrow} alt="" />

                      <Form.Item
                        className="select-item"
                        name="days_without_purchase_to"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số ngày chỉ được phép nhập số",
                          },
                        ]}
                      >
                        <Input placeholder="Đến" />
                      </Form.Item>
                    </div>
                </div>
              </div>

              <div className="base-filter-row">
                <Form.Item className="left-filter" label={<b>Ngày mua đầu</b>}>
                  <SelectDateFilter
                    clickOptionDate={clickOptionDate}
                    onChangeRangeDate={onChangeRangeDate}
                    dateType="firstOrderDate"
                    dateSelected={firstOrderDateClick}
                    startDate={firstOrderDateFrom}
                    endDate={firstOrderDateTo}
                  />
                </Form.Item>

                <Form.Item label={<b>Ngày mua cuối</b>} className="center-filter">
                  <SelectDateFilter
                    clickOptionDate={clickOptionDate}
                    onChangeRangeDate={onChangeRangeDate}
                    dateType="lastOrderDate"
                    dateSelected={lastOrderDateClick}
                    startDate={lastOrderDateFrom}
                    endDate={lastOrderDateTo}
                  />
                </Form.Item>

                <div className="right-filter">
                  <div className="title">Điểm</div>
                  <div className="select-scope">
                    <Form.Item
                      className="select-item"
                      name="accumulated_amount_from"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Điểm chỉ được phép nhập số",
                        },
                      ]}
                    >
                      <Input placeholder="Từ" />
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item
                      className="select-item"
                      name="accumulated_amount_to"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Điểm chỉ được phép nhập số",
                        },
                      ]}
                    >
                      <Input placeholder="Đến" />
                    </Form.Item>
                  </div>
                </div>
              </div>

            </div>
          </Form>
        </StyledCustomerBaseFilter>
      </BaseFilter>

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
    </StyledCustomerFilter>
  );
};

export default CustomerListFilter;
