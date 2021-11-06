import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Form,
  Input,
  Select,
  AutoComplete,
  Button,
} from "antd";

import BaseFilter from "component/filter/base.filter";
import { RefSelectProps } from "antd/lib/select";

import { RootReducerType } from "model/reducers/RootReducerType";
import { AccountResponse, AccountSearchQuery } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { AccountSearchAction } from "domain/actions/account/account.action";

import rightArrow from "assets/icon/right-arrow.svg";
import { StyledCustomerBaseFilter } from "screens/customer/customerStyled";
import { CustomerSearchQuery } from "model/query/customer.query";
import CustomFilter from "component/table/custom.filter";
import { SearchOutlined } from "@ant-design/icons";
import settingGearIcon from "assets/icon/setting-gear-icon.svg";


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
  const [formAdvance] = Form.useForm();
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

  // handle filter action
  const openBaseFilter = useCallback(() => {
    setVisibleBaseFilter(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisibleBaseFilter(false);
  }, []);

  const onFilterClick = useCallback(() => {
    setVisibleBaseFilter(false);
    formAdvance?.submit();
  }, [formAdvance]);

  //clear base filter
  const onClearBaseFilter = useCallback(() => {
    setVisibleBaseFilter(false);
    formAdvance.setFieldsValue(initQuery);
    onClearFilter && onClearFilter();
  }, [formAdvance, initQuery, onClearFilter]);
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
            form={formAdvance}
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
                  label={<b>Kênh tạo KH</b>}
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
                        placeholder="Từ ngày"
                        allowClear
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
                        placeholder="Đến ngày"
                        allowClear
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
                
                

              </div>

              <div className="right-filter">
                <Form.Item
                  name="customer_level_id"
                  label={<b>Hạng khách hàng:</b>}
                >
                  <Select
                    showSearch
                    placeholder="Hạng khách hàng"
                    allowClear
                    optionFilterProp="children"
                  >
                    {loyaltyUsageRules.map((loyalty: any) => (
                      <Option key={loyalty.id} value={loyalty.rank_id}>
                        {loyalty.rank_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>


              </div>
            </div>
            
            
          </Form>
        </StyledCustomerBaseFilter>
      </BaseFilter>
    </div>
  );
};

export default CustomerListFilter;
