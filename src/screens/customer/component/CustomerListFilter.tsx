import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Form,
  Input,
  Select,
  AutoComplete,
  Button,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";

import BaseFilter from "component/filter/base.filter";
import CustomFilter from "component/table/custom.filter";
import { RefSelectProps } from "antd/lib/select";

import { RootReducerType } from "model/reducers/RootReducerType";
import { AccountResponse, AccountSearchQuery } from "model/account/account.model";
import { CustomerSearchQuery } from "model/query/customer.query";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";

import SelectAreaFilter from "screens/customer/component/SelectAreaFilter";

import rightArrow from "assets/icon/right-arrow.svg";
import settingGearIcon from "assets/icon/setting-gear-icon.svg";
import { StyledCustomerBaseFilter } from "screens/customer/customerStyled";


type CustomerListFilterProps = {
  actions?: any;
  params: any;
  initQuery: any;
  onFilter?: (values: CustomerSearchQuery) => void;
  setShowSettingColumn?: () => void;
  onClearFilter?: () => void;
  groups?: any;
  loyaltyUsageRules?: any;
  types?: any;
};

const { Option } = Select;
const today = new Date();
const THIS_YEAR = today.getFullYear();

const CustomerListFilter: React.FC<CustomerListFilterProps> = (
  props: CustomerListFilterProps
) => {
  const {
    actions,

    params,
    initQuery,
    onClearFilter,
    onFilter,
    setShowSettingColumn,
    groups,
    loyaltyUsageRules,
    types,
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

// handle select age
const initAgeList = () => {
  const ageList: Array<any> = [];
  for (let i = 1; i <= 120; i++) {
    ageList.push({
      key: i,
      value: i,
      name: i,
      disable: false,
    })
  }
  return ageList;
}

const INIT_FROM_AGE_LIST = [
  {
    key: 0,
    value: 0,
    name: "- Từ tuổi -",
    disable: true,
  }
].concat(initAgeList());

const INIT_TO_AGE_LIST = [
  {
    key: 0,
    value: 0,
    name: "- Đến tuổi -",
    disable: true,
  }
].concat(initAgeList());

const [fromAgeList, setFromAgeList] = useState<any>(INIT_FROM_AGE_LIST);
const [toAgeList, setToAgeList] = useState<any>(INIT_TO_AGE_LIST);


const onSelectFromAge = (value: any) => {
  const newToAgeList = [ ...toAgeList ];
  newToAgeList.forEach((item: any) => {
    item.disable = (item.value < value);
  })
  setToAgeList(newToAgeList);
}

const onClearFromAge = () => {
  setToAgeList(INIT_TO_AGE_LIST);
}

const onSelectToAge = (value: any) => {
  const newFromAgeList = [ ...fromAgeList ];
  newFromAgeList.forEach((item: any) => {
    item.disable = (item.value > value || item.value === 0);
  })
  setFromAgeList(newFromAgeList);
}

const onClearToAge = () => {
  setFromAgeList(INIT_FROM_AGE_LIST);
}
// end handle select age
  


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
      values.responsible_staff_code = values.responsible_staff_code
      ? values.responsible_staff_code.split(" - ")[0]
      : null;
      onFilter && onFilter(values);
    },
    [onFilter]
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
    <div>
      <CustomFilter menu={actions}>
        <Form onFinish={onFinish} initialValues={params} layout="inline">
          <Form.Item name="request">
            <Input
              prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
              placeholder="Tên khách hàng, mã khách hàng , số điện thoại, email"
            />
          </Form.Item>
          {/* style={{ display: "flex", justifyContent: "flex-end" }}> */}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lọc
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={openBaseFilter}>Thêm bộ lọc</Button>
          </Form.Item>
          
          <Button
            onClick={setShowSettingColumn}
            icon={<img
              style={{ marginBottom: 15 }}
              src={settingGearIcon}
              alt=""
            />}
            // disabled={tableLoading}
          />
        </Form>
      </CustomFilter>

      
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
              <div className="left-filter">
                <Form.Item name="gender" label={<b>Giới tính</b>}>
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
                  name="responsible_staff_code"
                  label={<b>Nhân viên phụ trách</b>}
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
                      // prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                    />
                  </AutoComplete>
                </Form.Item>
                
                <Form.Item
                  name="customer_group_id"   // todo thai need update
                  label={<b>Cửa hàng</b>}
                >
                  <Select
                    showSearch
                    placeholder="Chọn cửa hàng"
                    allowClear
                    optionFilterProp="children"
                  >
                    {/* // todo thai need update */}
                    <Option key={1} value={1}>
                      Sẽ update chọn cửa hàng
                    </Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="customer_group_id"   // todo thai need update
                  label={<b>Kênh mua hàng</b>}
                >
                  <Select
                    showSearch
                    placeholder="Chọn kênh"
                    allowClear
                    optionFilterProp="children"
                  >
                    <Option key={1} value={1}>
                      Sẽ update chọn kênh
                    </Option>
                  </Select>
                </Form.Item>

                {/* Tìm kiếm theo khu vực */}
                <SelectAreaFilter formCustomerFilter={formCustomerFilter} />
                
              </div>

              <div className="center-filter">
                <Form.Item
                  name="customer_group_id"
                  label={<b>Nhóm khách hàng:</b>}
                >
                  <Select
                    showSearch
                    placeholder="Chọn nhóm khách hàng"
                    allowClear
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
                  name="customer_type_id"
                  label={<b>Loại khách hàng:</b>}
                >
                  <Select
                    showSearch
                    placeholder="Loại khách hàng"
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

                <div>
                  <div className="title">Ngày sinh</div>
                  <div className="select-scope">
                    <Form.Item name="from_birthday" className="select-item">
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

                    <Form.Item name="to_birthday" className="select-item">
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

                <div>
                  <div className="title">Tháng sinh</div>
                  <div className="select-scope">
                    <Form.Item name="from_birthMonth" className="select-item">
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

                    <Form.Item name="to_birthMonth" className="select-item">
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
                
                

              </div>

              <div className="right-filter">
                <Form.Item
                  name="customer_level_id"
                  label={<b>Hạng thẻ</b>}
                >
                  <Select
                    mode="multiple"
                    showSearch
                    allowClear
                    placeholder="Chọn hạng thẻ"
                  >
                    {loyaltyUsageRules?.map((loyalty: any) => (
                      <Option key={loyalty.id} value={loyalty.rank_id}>
                        {loyalty.rank_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="store"
                  label={<b>Cửa hàng cấp thẻ</b>}
                >
                  <Select
                    mode="multiple"
                    showSearch
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children"
                    defaultValue={undefined}
                  >
                    {/* {loyaltyUsageRules.map((loyalty: any) => (
                      <Option key={loyalty.id} value={loyalty.rank_id}>
                        {loyalty.rank_name}
                      </Option>
                    ))} */}
                    <Option key={1} value={2}>
                      chọn cửa hàng sau nhé
                    </Option>
                  </Select>
                </Form.Item>

                {/* Lọc theo năm sinh */}
                <div>
                  <div className="title">Năm sinh</div>
                  <div className="select-scope">
                    <Form.Item name="from_birthYear" className="select-item">
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

                    <Form.Item name="to_birthYear" className="select-item">
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

                {/* Lọc theo độ tuổi */}
                <div>
                  <div className="title">Độ tuổi</div>
                  <div className="select-scope">
                    <Form.Item name="from_age" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Từ"
                        onSelect={onSelectFromAge}
                        onClear={onClearFromAge}
                      >
                        {fromAgeList.map((item: any) => (
                          <Option key={item.key} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item name="to_age" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Đến"
                        onSelect={onSelectToAge}
                        onClear={onClearToAge}
                      >
                        {toAgeList.map((item: any) => (
                          <Option key={item.key} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>




              </div>
            </div>
            
            
          </Form>
        </StyledCustomerBaseFilter>
      </BaseFilter>
    </div>
  );
};

export default CustomerListFilter;
