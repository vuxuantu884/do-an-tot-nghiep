import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button, Form,
  Input,
  Select,
  Tag
} from "antd";
import { RefSelectProps } from "antd/lib/select";

import moment from "moment";
import { RegUtil } from "utils/RegUtils";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import BaseFilter from "component/filter/base.filter";
import SelectDateFilter from "component/filter/SelectDateFilter";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { AccountResponse, AccountSearchQuery } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { CustomerSearchQuery } from "model/query/customer.query";
import { RootReducerType } from "model/reducers/RootReducerType";
import { ChannelResponse } from "model/response/product/channel.response";
import { ProvinceModel } from "model/content/district.model";

import SelectAreaFilter from "screens/customer/component/SelectAreaFilter";

import filterIcon from "assets/icon/filter.svg";
import rightArrow from "assets/icon/right-arrow.svg";
import settingGearIcon from "assets/icon/setting-gear-icon.svg";
import { StyledCustomerBaseFilter, StyledCustomerFilter } from "screens/customer/customerStyled";


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

  // area filter
  const [provincesListProps, setProvincesListProps] = useState<ProvinceModel[]>([]);
  const [districtsListProps, setDistrictsListProps] = useState<any>([]);
  const [wardsListProps, setWardsListProps] = useState<any>([]);


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

  const [firstOrderDateFrom , setFirstOrderDateFrom ] = useState<any>(initialValues.first_order_date_from );
  const [firstOrderDateTo, setFirstOrderDateTo ] = useState<any>(initialValues.first_order_date_to);

  const [lastOrderDateFrom, setLastOrderDateFrom ] = useState<any>(initialValues.last_order_date_from );
  const [lastOrderDateTo, setLastOrderDateTo] = useState<any>(initialValues.last_order_date_to);
  
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
        case "firstOrderDate":
          if (firstOrderDateClick === value) {
            setFirstOrderDateClick("");
            setFirstOrderDateFrom(null);
            setFirstOrderDateTo(null);
          } else {
            setFirstOrderDateClick(value);
            setFirstOrderDateFrom (startDateValue);
            setFirstOrderDateTo (endDateValue);
          }
          break;
        case "lastOrderDate":
          if (lastOrderDateClick === value) {
            setLastOrderDateClick("");
            setLastOrderDateFrom(null);
            setLastOrderDateTo(null);
          } else {
            setLastOrderDateClick(value);
            setLastOrderDateFrom (startDateValue);
            setLastOrderDateTo (endDateValue);
          }
          break;
        default:
          break;
      }
    },
    [firstOrderDateClick, lastOrderDateClick]
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
      case "firstOrderDate":
        setFirstOrderDateClick("");
        const firstOrderStartDate = setLocalStartDate(dateString[0]);
        const firstOrderEndDate = setLocalEndDate(dateString[1]);
        setFirstOrderDateFrom (firstOrderStartDate);
        setFirstOrderDateTo (firstOrderEndDate);
        break;
      case "lastOrderDate":
        setLastOrderDateClick("");
        const lastOrderStartDate = setLocalStartDate(dateString[0]);
        const lastOrderEndDate = setLocalEndDate(dateString[1]);
        setLastOrderDateFrom (lastOrderStartDate);
        setLastOrderDateTo (lastOrderEndDate);
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

    if (initialValues.customer_level_ids?.length) {
      let customerLevelFiltered = "";
      initialValues.customer_level_ids.forEach((customer_level_id: any) => {
        const customerLevel = loyaltyUsageRules?.find((item: any) => item.rank_id.toString() === customer_level_id.toString());
        customerLevelFiltered = customerLevel ? (customerLevelFiltered + customerLevel.rank_name + "; ") : customerLevelFiltered;
      });
      list.push({
        key: "customer_level_ids",
        name: "Hạng thẻ",
        value: customerLevelFiltered,
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
      let storesFiltered = "";
      initialValues.store_ids.forEach((store_id: any) => {
        const store = listStore?.find((item) => item.id.toString() === store_id.toString());
        storesFiltered = store ? (storesFiltered + store.name + "; ") : storesFiltered;
      });
      list.push({
        key: "store_ids",
        name: "Cửa hàng",
        value: storesFiltered,
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
    
    if (initialValues.year_of_birth_from || initialValues.year_of_birth_to) {
      let yearOfBirthFiltered =
        (initialValues.year_of_birth_from ? initialValues.year_of_birth_from : "??") +
        " ~ " +
        (initialValues.year_of_birth_to ? initialValues.year_of_birth_to : "??");
      list.push({
        key: "year_of_birth",
        name: "Năm sinh",
        value: yearOfBirthFiltered,
      });
    }

    if (initialValues.channel_ids?.length) {
      let channelsFiltered = "";
      initialValues.channel_ids.forEach((channel_id: any) => {
        const channel = listChannel?.find((item) => item.id.toString() === channel_id.toString());
        channelsFiltered = channel ? (channelsFiltered + channel.name + "; ") : channelsFiltered;
      });
      list.push({
        key: "channel_ids",
        name: "Kênh mua hàng",
        value: channelsFiltered,
      });
    }

    if (initialValues.month_of_birth_from || initialValues.month_of_birth_to) {
      let monthOfBirthFiltered =
        (initialValues.month_of_birth_from ? initialValues.month_of_birth_from : "??") +
        " ~ " +
        (initialValues.month_of_birth_to ? initialValues.month_of_birth_to : "??");
      list.push({
        key: "month_of_birth",
        name: "Tháng sinh",
        value: monthOfBirthFiltered,
      });
    }

    if (initialValues.age_from || initialValues.age_to) {
      let ageFiltered =
        (initialValues.age_from ? initialValues.age_from : "??") +
        " ~ " +
        (initialValues.age_to ? initialValues.age_to : "??");
      list.push({
        key: "age",
        name: "Độ tuổi",
        value: ageFiltered,
      });
    }

    if (initialValues.city_ids?.length) {
      let citysFiltered = "";
      initialValues.city_ids.forEach((city_id: any) => {
        const city = provincesListProps?.find((item) => item.id.toString() === city_id.toString());
        citysFiltered = city ? (citysFiltered + city.name + "; ") : citysFiltered;
      });
      list.push({
        key: "city_ids",
        name: "Tỉnh/Thành phố",
        value: citysFiltered,
      });
    }

    if (initialValues.district_ids?.length) {
      let districtsFiltered = "";
      initialValues.district_ids.forEach((district_id: any) => {
        const district = districtsListProps?.find((item: any) => item.id.toString() === district_id.toString());
        districtsFiltered = district ? (districtsFiltered + district.name + "; ") : districtsFiltered;
      });
      list.push({
        key: "district_ids",
        name: "Quận/Huyện",
        value: districtsFiltered,
      });
    }

    if (initialValues.ward_ids?.length) {
      let wardsFiltered = "";
      initialValues.ward_ids.forEach((ward_id: any) => {
        const ward = wardsListProps?.find((item: any) => item.id.toString() === ward_id.toString());
        wardsFiltered = ward ? (wardsFiltered + ward.name + "; ") : wardsFiltered;
      });
      list.push({
        key: "ward_ids",
        name: "Phường/Xã",
        value: wardsFiltered,
      });
    }
    
    if (initialValues.total_order_from || initialValues.total_order_to) {
      let totalOrderFiltered =
        (initialValues.total_order_from ? initialValues.total_order_from : "??") +
        " ~ " +
        (initialValues.total_order_to ? initialValues.total_order_to : "??");
      list.push({
        key: "total_order",
        name: "Tổng đơn hàng",
        value: totalOrderFiltered,
      });
    }

    if (initialValues.accumulated_amount_from || initialValues.accumulated_amount_to) {
      let accumulatedAmountFiltered =
        (initialValues.accumulated_amount_from ? initialValues.accumulated_amount_from : "??") +
        " ~ " +
        (initialValues.accumulated_amount_to ? initialValues.accumulated_amount_to : "??");
      list.push({
        key: "accumulated_amount",
        name: "Tiền tích luỹ",
        value: accumulatedAmountFiltered,
      });
    }

    if (initialValues.total_refunded_order_from || initialValues.total_refunded_order_to) {
      let totalRefundedOrderFiltered =
        (initialValues.total_refunded_order_from ? initialValues.total_refunded_order_from : "??") +
        " ~ " +
        (initialValues.total_refunded_order_to ? initialValues.total_refunded_order_to : "??");
      list.push({
        key: "total_refunded_order",
        name: "Số đơn trả hàng",
        value: totalRefundedOrderFiltered,
      });
    }

    if (initialValues.remain_amount_from || initialValues.remain_amount_to) {
      let remainAmountFiltered =
        (initialValues.remain_amount_from ? initialValues.remain_amount_from : "??") +
        " ~ " +
        (initialValues.remain_amount_to ? initialValues.remain_amount_to : "??");
      list.push({
        key: "remain_amount",
        name: "Số tiền còn thiếu để nâng hạng",
        value: remainAmountFiltered,
      });
    }

    if (initialValues.average_order_amount_from || initialValues.average_order_amount_to) {
      let averageOrderAmountFiltered =
        (initialValues.average_order_amount_from ? initialValues.average_order_amount_from : "??") +
        " ~ " +
        (initialValues.average_order_amount_to ? initialValues.average_order_amount_to : "??");
      list.push({
        key: "average_order_amount",
        name: "Giá trị trung bình",
        value: averageOrderAmountFiltered,
      });
    }

    if (initialValues.total_refunded_amount_from || initialValues.total_refunded_amount_to) {
      let totalRefundedAmountFiltered =
        (initialValues.total_refunded_amount_from ? initialValues.total_refunded_amount_from : "??") +
        " ~ " +
        (initialValues.total_refunded_amount_to ? initialValues.total_refunded_amount_to : "??");
      list.push({
        key: "total_refunded_amount",
        name: "Tổng giá trị đơn trả",
        value: totalRefundedAmountFiltered,
      });
    }
    
    if (initialValues.first_order_store_ids?.length) {
      let firstOrderStoresFiltered = "";
      initialValues.first_order_store_ids.forEach((first_order_store_id: any) => {
        const store = listStore?.find((item) => item.id.toString() === first_order_store_id.toString());
        firstOrderStoresFiltered = store ? (firstOrderStoresFiltered + store.name + "; ") : firstOrderStoresFiltered;
      });
      list.push({
        key: "first_order_store_ids",
        name: "Cửa hàng mua đầu",
        value: firstOrderStoresFiltered,
      });
    }
   
    if (initialValues.last_order_store_ids?.length) {
      let lastOrderStoresFiltered = "";
      initialValues.last_order_store_ids.forEach((last_order_store_id: any) => {
        const store = listStore?.find((item) => item.id.toString() === last_order_store_id.toString());
        lastOrderStoresFiltered = store ? (lastOrderStoresFiltered + store.name + "; ") : lastOrderStoresFiltered;
      });
      list.push({
        key: "last_order_store_ids",
        name: "Cửa hàng mua cuối",
        value: lastOrderStoresFiltered,
      });
    }

    if (initialValues.days_without_purchase_from || initialValues.days_without_purchase_to) {
      let daysWithoutPurchaseFiltered =
        (initialValues.days_without_purchase_from ? initialValues.days_without_purchase_from : "??") +
        " ~ " +
        (initialValues.days_without_purchase_to ? initialValues.days_without_purchase_to : "??");
      list.push({
        key: "days_without_purchase",
        name: "Số ngày chưa mua hàng",
        value: daysWithoutPurchaseFiltered,
      });
    }

    if (initialValues.first_order_date_from || initialValues.first_order_date_to) {
      let firstOrderDateFiltered =
        (initialValues.first_order_date_from ? ConvertUtcToLocalDate(initialValues.first_order_date_from, "DD-MM-YYYY") : "??") +
        " ~ " +
        (initialValues.first_order_date_to ? ConvertUtcToLocalDate(initialValues.first_order_date_to, "DD-MM-YYYY") : "??");
      list.push({
        key: "first_order_date",
        name: "Ngày mua đầu",
        value: firstOrderDateFiltered,
      });
    }

    if (initialValues.last_order_date_from || initialValues.last_order_date_to) {
      let lastOrderDateFiltered =
        (initialValues.last_order_date_from ? ConvertUtcToLocalDate(initialValues.last_order_date_from, "DD-MM-YYYY") : "??") +
        " ~ " +
        (initialValues.last_order_date_to ? ConvertUtcToLocalDate(initialValues.last_order_date_to, "DD-MM-YYYY") : "??");
      list.push({
        key: "last_order_date",
        name: "Ngày mua cuối",
        value: lastOrderDateFiltered,
      });
    }

    return list;
  },
    [
      initialValues.gender,
      initialValues.customer_group_id,
      initialValues.customer_level_ids,
      initialValues.responsible_staff_code,
      initialValues.customer_type_id,
      initialValues.card_issuer,
      initialValues.store_ids,
      initialValues.day_of_birth_from,
      initialValues.day_of_birth_to,
      initialValues.year_of_birth_from,
      initialValues.year_of_birth_to,
      initialValues.month_of_birth_from,
      initialValues.month_of_birth_to,
      initialValues.age_from,
      initialValues.age_to,
      initialValues.city_ids,
      initialValues.district_ids,
      initialValues.ward_ids,
      initialValues.total_order_from,
      initialValues.total_order_to,
      initialValues.accumulated_amount_from,
      initialValues.accumulated_amount_to,
      initialValues.total_refunded_order_from,
      initialValues.total_refunded_order_to,
      initialValues.remain_amount_from,
      initialValues.remain_amount_to,
      initialValues.average_order_amount_from,
      initialValues.average_order_amount_to,
      initialValues.total_refunded_amount_from,
      initialValues.total_refunded_amount_to,
      initialValues.first_order_store_ids,
      initialValues.last_order_store_ids,
      initialValues.days_without_purchase_from,
      initialValues.days_without_purchase_to,
      initialValues.first_order_date_from,
      initialValues.first_order_date_to,
      initialValues.last_order_date_from,
      initialValues.last_order_date_to,
      initialValues.channel_ids,
      LIST_GENDER,
      groups,
      loyaltyUsageRules,
      AccountConvertResultSearch,
      types,
      listStore,
      listChannel,
      provincesListProps,
      districtsListProps,
      wardsListProps
    ]);
    
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
        case "customer_level_ids":
          onFilter && onFilter({ ...params, customer_level_ids: [] });
          formCustomerFilter?.setFieldsValue({ customer_level_ids: [] });
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
        case "year_of_birth":
          onFilter && onFilter({ ...params, year_of_birth_from: null, year_of_birth_to: null });
          formCustomerFilter?.setFieldsValue({ year_of_birth_from: null, year_of_birth_to: null });
          break;
        case "channel_ids":
          onFilter && onFilter({ ...params, channel_ids: [] });
          formCustomerFilter?.setFieldsValue({ channel_ids: [] });
          break;
        case "month_of_birth":
          onFilter && onFilter({ ...params, month_of_birth_from: null, month_of_birth_to: null });
          formCustomerFilter?.setFieldsValue({ month_of_birth_from: null, month_of_birth_to: null });
          break;
        case "age":
          onFilter && onFilter({ ...params, age_from: null, age_to: null });
          formCustomerFilter?.setFieldsValue({ age_from: null, age_to: null });
          break;
        case "city_ids":
          onFilter && onFilter({ ...params, city_ids: [] });
          formCustomerFilter?.setFieldsValue({ city_ids: [] });
          break;
        case "district_ids":
          onFilter && onFilter({ ...params, district_ids: [] });
          formCustomerFilter?.setFieldsValue({ district_ids: [] });
          break;
        case "ward_ids":
          onFilter && onFilter({ ...params, ward_ids: [] });
          formCustomerFilter?.setFieldsValue({ ward_ids: [] });
          break;
        case "total_order":
          onFilter && onFilter({ ...params, total_order_from: null, total_order_to: null });
          formCustomerFilter?.setFieldsValue({ total_order_from: null, total_order_to: null });
          break;
        case "accumulated_amount":
          onFilter && onFilter({ ...params, accumulated_amount_from: null, accumulated_amount_to: null });
          formCustomerFilter?.setFieldsValue({ accumulated_amount_from: null, accumulated_amount_to: null });
          break;
        case "total_refunded_order":
          onFilter && onFilter({ ...params, total_refunded_order_from: null, total_refunded_order_to: null });
          formCustomerFilter?.setFieldsValue({ total_refunded_order_from: null, total_refunded_order_to: null });
          break;
        case "remain_amount":
          onFilter && onFilter({ ...params, remain_amount_from: null, remain_amount_to: null });
          formCustomerFilter?.setFieldsValue({ remain_amount_from: null, remain_amount_to: null });
          break;
        case "average_order_amount":
          onFilter && onFilter({ ...params, average_order_amount_from: null, average_order_amount_to: null });
          formCustomerFilter?.setFieldsValue({ average_order_amount_from: null, average_order_amount_to: null });
          break;
        case "total_refunded_amount":
          onFilter && onFilter({ ...params, total_refunded_amount_from: null, total_refunded_amount_to: null });
          formCustomerFilter?.setFieldsValue({ total_refunded_amount_from: null, total_refunded_amount_to: null });
          break;
        case "first_order_store_ids":
          onFilter && onFilter({ ...params, first_order_store_ids: [] });
          formCustomerFilter?.setFieldsValue({ first_order_store_ids: [] });
          break;
        case "last_order_store_ids":
          onFilter && onFilter({ ...params, last_order_store_ids: [] });
          formCustomerFilter?.setFieldsValue({ last_order_store_ids: [] });
          break;
        case "days_without_purchase":
          onFilter && onFilter({ ...params, days_without_purchase_from: null, days_without_purchase_to: null });
          formCustomerFilter?.setFieldsValue({ days_without_purchase_from: null, days_without_purchase_to: null });
          break;
        case "first_order_date":
          setFirstOrderDateClick("");
          setFirstOrderDateFrom (null);
          setFirstOrderDateTo (null);
          onFilter && onFilter({ ...params, first_order_date_from: null, first_order_date_to: null });
          break;
        case "last_order_date":
          setLastOrderDateClick("");
          setLastOrderDateFrom (null);
          setLastOrderDateTo (null);
          onFilter && onFilter({ ...params, last_order_date_from: null, last_order_date_to: null });
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
        first_order_date_from: firstOrderDateFrom,
        first_order_date_to: firstOrderDateTo,
        last_order_date_from: lastOrderDateFrom,
        last_order_date_to: lastOrderDateTo,
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
                  name="customer_level_ids"
                  label={<b>Hạng thẻ</b>}
                  className="right-filter"
                >
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
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
                    // maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children"
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
                  <SelectAreaFilter
                    formCustomerFilter={formCustomerFilter}
                    setProvincesListProps={setProvincesListProps}
                    setDistrictsListProps={setDistrictsListProps}
                    setWardsListProps={setWardsListProps}
                  />
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
                  name="first_order_store_ids"
                  label={<b>Cửa hàng mua đầu</b>}
                  className="left-filter"
                >
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children"
                  >
                    {listStore?.map((item) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="last_order_store_ids"
                  label={<b>Cửa hàng mua cuối</b>}
                  className="center-filter"
                >
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children"
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
