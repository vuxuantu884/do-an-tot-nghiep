import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Dropdown, Form,
  Input, Menu, Select,
  Tag
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import filterIcon from "assets/icon/filter.svg";
import rightArrow from "assets/icon/right-arrow.svg";
import settingGearIcon from "assets/icon/setting-gear-icon.svg";
import CustomNumberInput from "component/custom/customNumberInput";
import BaseFilter from "component/filter/base.filter";
import SelectDateFilter from "component/filter/SelectDateFilter";
import TreeStore from "component/tree-node/tree-store";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { departmentDetailAction } from "domain/actions/account/department.action";
import {
  CityByCountryAction,
  DistrictByCityAction,
  WardGetByDistrictAction
} from "domain/actions/content/content.action";
import { getListSourceRequest } from "domain/actions/product/source.action";
import {
  AccountResponse,
  AccountSearchQuery
} from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { ProvinceModel } from "model/content/district.model";
import { StoreResponse } from "model/core/store.model";
import { CustomerSearchQuery } from "model/query/customer.query";
import { RootReducerType } from "model/reducers/RootReducerType";
import { SourceResponse } from "model/response/order/source.response";
import { ChannelResponse } from "model/response/product/channel.response";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  StyledCustomerBaseFilter,
  StyledCustomerFilter
} from "screens/customer/customerStyled";
import { getSourcesWithParamsService } from "service/order/order.service";
import {
  formatCurrency,
  generateQuery,
  handleDelayActionWhenInsertTextInSearchInput,
  isNullOrUndefined,
  replaceFormatString,
  sortSources
} from "utils/AppUtils";
import { VietNamId } from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { RegUtil } from "utils/RegUtils";
import { showError } from "utils/ToastUtils";

type CustomerListFilterProps = {
  isLoading?: boolean;
  params: any;
  initQuery: any;
  selectedCustomerIds: any;
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
const START_YEAR = 1900;
const START_MONTH = 1;
const END_MONTH = 12;
const START_DAY = 1;
const END_DAY = 31;
const THIS_MONTH_VALUE = today.getMonth() + 1;
const TODAY_VALUE = today.getDate();

// select area
let tempWardList: any[] = [];
let wardListSelected: any[] = [];
let districtListSelected: any[] = [];
let provinceListSelected: any[] = [];

const CustomerListFilter: React.FC<CustomerListFilterProps> = (
  props: CustomerListFilterProps
) => {
  const {
    isLoading,
    params,
    initQuery,
    selectedCustomerIds,
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

  //---Handle Source---\\
  
  const sourceInputRef = useRef()
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [initListSource, setInitListSource] = useState<Array<SourceResponse>>([]);
  const [allSources, setAllSources] = useState<Array<SourceResponse>>([]);
  const [departmentIds, setDepartmentIds] = useState<number[]|null>(null);

  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  useEffect(() => {
		dispatch(getListSourceRequest((response) => {
			setAllSources(response)
		}));
  }, [dispatch]);

  useEffect(() => {
    let departmentId = userReducer.account?.account_jobs[0]?.department_id;
    if (departmentId) {
      let department: number[] = [];
      department.push(departmentId);
      dispatch(
        departmentDetailAction(departmentId, (response) => {
          if (response && response.parent_id) {
            department.push(response.parent_id);
            setDepartmentIds(department);
          }
        })
      );
    }
  }, [dispatch, userReducer.account?.account_jobs]);

  const getOrderSources = useCallback(async() => {
		let result:SourceResponse[]  = []
		result= await sortSources(allSources, departmentIds)
		return result
	}, [allSources, departmentIds]);

  useEffect(() => {
		getOrderSources().then((response) => {
			const sortedSources =  response;
			setInitListSource(sortedSources)
			setListSource(sortedSources)
		});
  }, [getOrderSources]);

  //---End Handle Source---\\

  const initQueryAccount: AccountSearchQuery = useMemo(
    () => ({
      info: "",
    }),
    []
  );

  const initialValues = useMemo(() => {
    const cityIds = formCustomerFilter.getFieldValue("city_ids");
    const districtIds = formCustomerFilter.getFieldValue("district_ids");
    const wardIds = formCustomerFilter.getFieldValue("ward_ids");

    return {
      ...params,
      city_ids: cityIds,
      district_ids: districtIds,
      ward_ids: wardIds,
    };
  }, [formCustomerFilter, params]);

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

  // initialization birth day
  const initDateList = () => {
    const dateList: Array<any> = [];
    for (let i = 1; i < 32; i++) {
      dateList.push({
        value: i,
        name: i,
        disable: false,
      });
    }
    return dateList;
  };

  const INIT_FROM_DATE_LIST = [
    {
      value: 0,
      name: "- Từ ngày -",
      disable: true,
    },
  ].concat(initDateList());

  const INIT_TO_DATE_LIST = [
    {
      value: 0,
      name: "- Đến ngày -",
      disable: true,
    },
  ].concat(initDateList());
  // end initialization birth day

  // initialization birth month
  const initMonthList = () => {
    const monthList: Array<any> = [];
    for (let i = 1; i <= 12; i++) {
      monthList.push({
        value: i,
        name: i,
        disable: false,
      });
    }
    return monthList;
  };

  const INIT_FROM_MONTH_LIST = [
    {
      value: 0,
      name: "- Từ tháng -",
      disable: true,
    },
  ].concat(initMonthList());

  const INIT_TO_MONTH_LIST = [
    {
      value: 0,
      name: "- Đến tháng -",
      disable: true,
    },
  ].concat(initMonthList());
  // end initialization birth month

  // handle select birth year
  const initYearList = () => {
    const yearList: Array<any> = [];
    for (let i = THIS_YEAR; i >= START_YEAR; i--) {
      yearList.push({
        key: i,
        value: i,
        name: i,
        disable: false,
      });
    }
    return yearList;
  };

  const INIT_FROM_YEAR_LIST = [
    {
      key: 0,
      value: 0,
      name: "- Từ năm -",
      disable: true,
    },
  ].concat(initYearList());

  const INIT_TO_YEAR_LIST = [
    {
      key: 0,
      value: 0,
      name: "- Đến năm -",
      disable: true,
    },
  ].concat(initYearList());

  const [fromYearList, setFromYearList] = useState<any>(INIT_FROM_YEAR_LIST);
  const [toYearList, setToYearList] = useState<any>(INIT_TO_YEAR_LIST);

  const onSelectFromYear = (value: any) => {
    const newToYearList = [...toYearList];
    newToYearList.forEach((item: any) => {
      item.disable = item.value < value;
    });
    setToYearList(newToYearList);
  };

  const onClearFromYear = () => {
    setToYearList(INIT_TO_YEAR_LIST);
  };

  const onSelectToYear = (value: any) => {
    const newFromYearList = [...fromYearList];
    newFromYearList.forEach((item: any) => {
      item.disable = item.value > value || item.value === 0;
    });
    setFromYearList(newFromYearList);
  };

  const onClearToYear = () => {
    setFromYearList(INIT_FROM_YEAR_LIST);
  };
  // end handle select birth year

  // handle select date
  const [firstOrderDateClick, setFirstOrderDateClick] = useState("");
  const [lastOrderDateClick, setLastOrderDateClick] = useState("");

  const [firstOrderDateFrom, setFirstOrderDateFrom] = useState<any>(
    initialValues.first_order_time_from
  );
  const [firstOrderDateTo, setFirstOrderDateTo] = useState<any>(
    initialValues.first_order_time_to
  );

  const [lastOrderDateFrom, setLastOrderDateFrom] = useState<any>(
    initialValues.last_order_time_from
  );
  const [lastOrderDateTo, setLastOrderDateTo] = useState<any>(
    initialValues.last_order_time_to
  );

  const clearFirstOrderDate = () => {
    setFirstOrderDateClick("");
    setFirstOrderDateFrom(null);
    setFirstOrderDateTo(null);
  };

  const clearLastOrderDate = () => {
    setLastOrderDateClick("");
    setLastOrderDateFrom(null);
    setLastOrderDateTo(null);
  };
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
            clearFirstOrderDate();
          } else {
            setFirstOrderDateClick(value);
            setFirstOrderDateFrom(startDateValue);
            setFirstOrderDateTo(endDateValue);
          }
          break;
        case "lastOrderDate":
          if (lastOrderDateClick === value) {
            clearLastOrderDate();
          } else {
            setLastOrderDateClick(value);
            setLastOrderDateFrom(startDateValue);
            setLastOrderDateTo(endDateValue);
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
    const newDate = new Date(month + "-" + day + "-" + year);
    return moment(newDate).startOf("day");
  };

  const setLocalEndDate = (dateString: string) => {
    if (!dateString) {
      return null;
    }
    const dateArray = dateString.split("-");
    const day = dateArray[0];
    const month = dateArray[1];
    const year = dateArray[2];
    const newDate = new Date(month + "-" + day + "-" + year);
    return moment(newDate).endOf("day");
  };

  const onChangeRangeDate = useCallback((dates, dateString, type) => {
    switch (type) {
      case "firstOrderDate":
        setFirstOrderDateClick("");
        const firstOrderStartDate = setLocalStartDate(dateString[0]);
        const firstOrderEndDate = setLocalEndDate(dateString[1]);
        setFirstOrderDateFrom(firstOrderStartDate);
        setFirstOrderDateTo(firstOrderEndDate);
        break;
      case "lastOrderDate":
        setLastOrderDateClick("");
        const lastOrderStartDate = setLocalStartDate(dateString[0]);
        const lastOrderEndDate = setLocalEndDate(dateString[1]);
        setLastOrderDateFrom(lastOrderStartDate);
        setLastOrderDateTo(lastOrderEndDate);
        break;
      default:
        break;
    }
  }, []);
  // end handle select RangPicker
  // end handle select date

  //---------------handle filter by area---------------\\
  const [provincesList, setProvincesList] = useState<ProvinceModel[]>([]);
  const [districtsList, setDistrictsList] = useState<any>([]);
  const [wardsList, setWardsList] = useState<any>([]);

  const getProvince = useCallback(() => {
    dispatch(
      CityByCountryAction(VietNamId, (response) => {
        setProvincesList(response);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    getProvince();
  }, [getProvince]);

  //---handle Ward---\\
  const handleClearWard = useCallback(() => {
    wardListSelected = [];
    formCustomerFilter?.setFieldsValue({ ward_ids: [] });
  }, [formCustomerFilter]);

  const handleDeselectWard = (wardId: any) => {
    wardListSelected = wardListSelected?.filter(
      (item: any) => item.id !== wardId
    );
  };

  const handleSelectWard = (wardId: any) => {
    const wardSelected = wardsList?.find((item: any) => item.id === wardId);
    if (wardSelected) {
      wardListSelected.push(wardSelected);
    }
  };
  //---end handle Ward---\\

  //---handle District---\\
  // clear district
  const handleClearDistrict = useCallback(() => {
    formCustomerFilter?.setFieldsValue({ district_ids: [], ward_ids: [] });
    setWardsList([]);
    tempWardList = [];
    wardListSelected = [];
    districtListSelected = [];
  }, [formCustomerFilter]);
  // end clear district

  // deselect district
  const removeWardByDistrict = (districtId: number) => {
    const newWardList = tempWardList?.filter(
      (item: any) => item.district_id !== districtId
    );
    setWardsList(newWardList);
    tempWardList = newWardList;

    wardListSelected = wardListSelected?.filter(
      (item: any) => item.district_id !== districtId
    );
    const wardIdListSelected: any[] = [];
    wardListSelected?.forEach((ward: any) => {
      wardIdListSelected.push(ward.id);
    });
    formCustomerFilter.setFieldsValue({ ward_ids: wardIdListSelected });
  };

  const handleDeselectDistrict = (districtId: any) => {
    districtListSelected = districtListSelected?.filter(
      (item: any) => item.id !== districtId
    );
    removeWardByDistrict(districtId);
  };
  // end deselect district

  // handle select District
  const updateWardsList = (response: any) => {
    const newWardsList = [...wardsList].concat(response);
    setWardsList(newWardsList);
    tempWardList = newWardsList;
  };

  const getWardByDistrict = (districtId: any) => {
    dispatch(
      WardGetByDistrictAction(districtId, (response) => {
        updateWardsList(response);
      })
    );
  };

  const handleSelectDistrict = (districtId: any) => {
    const districtSelected = districtsList?.find(
      (item: any) => item.id === districtId
    );
    if (districtSelected) {
      districtListSelected.push(districtSelected);
    }

    getWardByDistrict(districtId);
  };
  // end handle select District
  //---end District---\\

  //------Province------\\
  // handle clear province
  const handleClearProvince = useCallback(() => {
    formCustomerFilter.setFieldsValue({ city_ids: [], district_ids: [] });
    setDistrictsList([]);
    provinceListSelected = [];
    districtListSelected = [];

    handleClearDistrict();
  }, [formCustomerFilter, handleClearDistrict, setDistrictsList]);
  // end handle clear province

  // handle deselect province
  const removeDistrictByProvince = (provinceId: number) => {
    // update district list
    const newDistrictsList = districtsList?.filter(
      (item: any) => item.city_id !== provinceId
    );
    setDistrictsList(newDistrictsList);

    const districtListDeselected = districtListSelected?.filter(
      (item: any) => item.city_id === provinceId
    );
    // update district list selected
    const newDistrictListSelected = districtListSelected?.filter(
      (item: any) => item.city_id !== provinceId
    );
    districtListSelected = newDistrictListSelected;

    // update district_ids in form values
    const districtIdListSelected: any[] = [];
    newDistrictListSelected?.forEach((district: any) => {
      districtIdListSelected.push(district.id);
    });
    formCustomerFilter.setFieldsValue({ district_ids: districtIdListSelected });

    // remove wards by district
    districtListDeselected?.forEach((district: any) => {
      removeWardByDistrict(district.id);
    });
  };

  const handleDeselectProvince = (provinceId: any) => {
    provinceListSelected = provinceListSelected?.filter(
      (item: any) => item.id !== provinceId
    );
    removeDistrictByProvince(provinceId);
  };
  // end handle deselect province

  // handle select province
  const updateDistrictsList = (response: any) => {
    const newDistrictsList = [...districtsList].concat(response);
    setDistrictsList(newDistrictsList);
  };

  const getDistrictByProvince = (provinceId: any) => {
    dispatch(
      DistrictByCityAction(provinceId, (response) => {
        updateDistrictsList(response);
      })
    );
  };

  const handleSelectProvince = (provinceId: any) => {
    const province = provincesList?.find((item: any) => item.id === provinceId);
    if (province) {
      provinceListSelected.push(province);
    }

    getDistrictByProvince(provinceId);
  };
  // end handle select province
  //---------------end handle filter by area---------------//

  // handle tag filter
  let filters = useMemo(() => {
    let list = [];

    if (initialValues.gender) {
      const gender = LIST_GENDER?.find(
        (item) => item.value.toString() === initialValues.gender.toString()
      );
      list.push({
        key: "gender",
        name: "Giới tính",
        value: gender?.name,
      });
    }

    if (initialValues.customer_group_ids?.length) {
      let customerGroupFiltered = "";
      initialValues.customer_group_ids.forEach((customer_group_id: any) => {
        const customerGroup = groups?.find(
          (item: any) => item.id.toString() === customer_group_id.toString()
        );
        customerGroupFiltered = customerGroup
          ? customerGroupFiltered + customerGroup.name + "; "
          : customerGroupFiltered;
      });
      list.push({
        key: "customer_group_ids",
        name: "Nhóm khách hàng",
        value: customerGroupFiltered,
      });
    }

    if (initialValues.customer_level_ids?.length) {
      let customerLevelFiltered = "";
      initialValues.customer_level_ids.forEach((customer_level_id: any) => {
        const customerLevel = loyaltyUsageRules?.find(
          (item: any) =>
            item.rank_id.toString() === customer_level_id.toString()
        );
        customerLevelFiltered = customerLevel
          ? customerLevelFiltered + customerLevel.rank_name + "; "
          : customerLevelFiltered;
      });
      list.push({
        key: "customer_level_ids",
        name: "Hạng thẻ",
        value: customerLevelFiltered,
      });
    }

    if (initialValues.responsible_staff_codes) {
      const staff = AccountConvertResultSearch?.find(
        (item: any) =>
          item.value.split(" - ")[0] === initialValues.responsible_staff_codes
      );
      list.push({
        key: "responsible_staff_codes",
        name: "Nhân viên phụ trách",
        value: staff?.label,
      });
    }

    if (initialValues.customer_type_ids?.length) {
      let customerTypeFiltered = "";
      initialValues.customer_type_ids.forEach((customer_type_id: any) => {
        const customerType = types?.find(
          (item: any) => item.id.toString() === customer_type_id.toString()
        );
        customerTypeFiltered = customerType
          ? customerTypeFiltered + customerType.name + "; "
          : customerTypeFiltered;
      });
      list.push({
        key: "customer_type_ids",
        name: "Loại khách hàng",
        value: customerTypeFiltered,
      });
    }

    if (initialValues.assign_store_ids?.length) {
      let assignedCardStoreFiltered = "";
      initialValues.assign_store_ids.forEach((assign_store_id: any) => {
        const assignedCardStore = listStore?.find(
          (item: any) => item.id.toString() === assign_store_id.toString()
        );
        assignedCardStoreFiltered = assignedCardStore
          ? assignedCardStoreFiltered + assignedCardStore.name + "; "
          : assignedCardStoreFiltered;
      });
      list.push({
        key: "assign_store_ids",
        name: "Cửa hàng cấp thẻ",
        value: assignedCardStoreFiltered,
      });
    }

    if (initialValues.store_ids?.length) {
      let storesFiltered = "";
      initialValues.store_ids.forEach((store_id: any) => {
        const store = listStore?.find(
          (item) => item.id.toString() === store_id.toString()
        );
        storesFiltered = store
          ? storesFiltered + store.name + "; "
          : storesFiltered;
      });
      list.push({
        key: "store_ids",
        name: "Cửa hàng",
        value: storesFiltered,
      });
    }

    if (initialValues.day_of_birth_from || initialValues.day_of_birth_to) {
      let textDayOfBirth =
        (initialValues.day_of_birth_from
          ? initialValues.day_of_birth_from
          : "") +
        " - " +
        (initialValues.day_of_birth_to ? initialValues.day_of_birth_to : "");
      list.push({
        key: "day_of_birth",
        name: "Ngày sinh",
        value: textDayOfBirth,
      });
    }

    if (initialValues.month_of_birth_from || initialValues.month_of_birth_to) {
      let monthOfBirthFiltered =
        (initialValues.month_of_birth_from
          ? initialValues.month_of_birth_from
          : "") +
        " - " +
        (initialValues.month_of_birth_to
          ? initialValues.month_of_birth_to
          : "");
      list.push({
        key: "month_of_birth",
        name: "Tháng sinh",
        value: monthOfBirthFiltered,
      });
    }

    if (initialValues.year_of_birth_from || initialValues.year_of_birth_to) {
      let yearOfBirthFiltered =
        (initialValues.year_of_birth_from
          ? initialValues.year_of_birth_from
          : "") +
        " - " +
        (initialValues.year_of_birth_to ? initialValues.year_of_birth_to : "");
      list.push({
        key: "year_of_birth",
        name: "Năm sinh",
        value: yearOfBirthFiltered,
      });
    }

    if (initialValues.channel_ids?.length) {
      let channelsFiltered = "";
      initialValues.channel_ids.forEach((channel_id: any) => {
        const channel = listChannel?.find(
          (item) => item.id.toString() === channel_id.toString()
        );
        channelsFiltered = channel
          ? channelsFiltered + channel.name + "; "
          : channelsFiltered;
      });
      list.push({
        key: "channel_ids",
        name: "Kênh mua hàng",
        value: channelsFiltered,
      });
    }

    if (initialValues.source_ids?.length) {
      let sourcesFiltered = "";
      initialValues.source_ids.forEach((source_id: any) => {
        const source = listSource?.find(
          (item) => item.id.toString() === source_id.toString()
        );
        sourcesFiltered = source
          ? sourcesFiltered + source.name + "; "
          : sourcesFiltered;
      });
      list.push({
        key: "source_ids",
        name: "Nguồn mua hàng",
        value: sourcesFiltered,
      });
    }

    if (initialValues.age_from || initialValues.age_to) {
      let ageFiltered =
        (initialValues.age_from ? initialValues.age_from : "") +
        " - " +
        (initialValues.age_to ? initialValues.age_to : "");
      list.push({
        key: "age",
        name: "Độ tuổi",
        value: ageFiltered,
      });
    }

    if (initialValues.city_ids?.length) {
      let citiesFiltered = "";
      initialValues.city_ids.forEach((city_id: any) => {
        const city = provincesList?.find(
          (item) => item.id.toString() === city_id.toString()
        );
        citiesFiltered = city
          ? citiesFiltered + city.name + "; "
          : citiesFiltered;
      });
      list.push({
        key: "city_ids",
        name: "Tỉnh/Thành phố",
        value: citiesFiltered,
      });
    }

    if (initialValues.district_ids?.length) {
      let districtsFiltered = "";
      initialValues.district_ids.forEach((district_id: any) => {
        const district = districtsList?.find(
          (item: any) => item.id.toString() === district_id.toString()
        );
        districtsFiltered = district
          ? districtsFiltered + district.name + "; "
          : districtsFiltered;
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
        const ward = wardsList?.find(
          (item: any) => item.id.toString() === ward_id.toString()
        );
        wardsFiltered = ward ? wardsFiltered + ward.name + "; " : wardsFiltered;
      });
      list.push({
        key: "ward_ids",
        name: "Phường/Xã",
        value: wardsFiltered,
      });
    }

    if (
      !isNullOrUndefined(initialValues.total_finished_order_from) ||
      !isNullOrUndefined(initialValues.total_finished_order_to)
    ) {
      let totalOrderFiltered =
        (isNullOrUndefined(initialValues.total_finished_order_from)
          ? ""
          : formatCurrency(initialValues.total_finished_order_from)) +
        " - " +
        (isNullOrUndefined(initialValues.total_finished_order_to)
          ? ""
          : formatCurrency(initialValues.total_finished_order_to));
      list.push({
        key: "total_order",
        name: "Tổng đơn hàng",
        value: totalOrderFiltered,
      });
    }

    if (
      !isNullOrUndefined(initialValues.total_paid_amount_from) ||
      !isNullOrUndefined(initialValues.total_paid_amount_to)
    ) {
      let accumulatedAmountFiltered =
        (isNullOrUndefined(initialValues.total_paid_amount_from)
          ? ""
          : formatCurrency(initialValues.total_paid_amount_from)) +
        " - " +
        (isNullOrUndefined(initialValues.total_paid_amount_to)
          ? ""
          : formatCurrency(initialValues.total_paid_amount_to));
      list.push({
        key: "accumulated_amount",
        name: "Tiền tích lũy",
        value: accumulatedAmountFiltered,
      });
    }

    if (
      !isNullOrUndefined(initialValues.total_returned_order_from) ||
      !isNullOrUndefined(initialValues.total_returned_order_to)
    ) {
      let totalRefundedOrderFiltered =
        (isNullOrUndefined(initialValues.total_returned_order_from)
          ? ""
          : formatCurrency(initialValues.total_returned_order_from)) +
        " - " +
        (isNullOrUndefined(initialValues.total_returned_order_to)
          ? ""
          : formatCurrency(initialValues.total_returned_order_to));
      list.push({
        key: "total_refunded_order",
        name: "Số đơn trả hàng",
        value: totalRefundedOrderFiltered,
      });
    }

    if (
      !isNullOrUndefined(initialValues.remain_amount_to_level_up_from) ||
      !isNullOrUndefined(initialValues.remain_amount_to_level_up_to)
    ) {
      let remainAmountFiltered =
        (isNullOrUndefined(initialValues.remain_amount_to_level_up_from)
          ? ""
          : formatCurrency(initialValues.remain_amount_to_level_up_from)) +
        " - " +
        (isNullOrUndefined(initialValues.remain_amount_to_level_up_to)
          ? ""
          : formatCurrency(initialValues.remain_amount_to_level_up_to));
      list.push({
        key: "remain_amount",
        name: "Số tiền còn thiếu để nâng hạng",
        value: remainAmountFiltered,
      });
    }

    if (
      !isNullOrUndefined(initialValues.average_order_amount_from) ||
      !isNullOrUndefined(initialValues.average_order_amount_to)
    ) {
      let averageOrderAmountFiltered =
        (isNullOrUndefined(initialValues.average_order_amount_from)
          ? ""
          : formatCurrency(initialValues.average_order_amount_from)) +
        " - " +
        (isNullOrUndefined(initialValues.average_order_amount_to)
          ? ""
          : formatCurrency(initialValues.average_order_amount_to));
      list.push({
        key: "average_order_amount",
        name: "Giá trị trung bình",
        value: averageOrderAmountFiltered,
      });
    }

    if (
      !isNullOrUndefined(initialValues.total_returned_amount_from) ||
      !isNullOrUndefined(initialValues.total_returned_amount_to)
    ) {
      let totalRefundedAmountFiltered =
        (isNullOrUndefined(initialValues.total_returned_amount_from)
          ? ""
          : formatCurrency(initialValues.total_returned_amount_from)) +
        " - " +
        (isNullOrUndefined(initialValues.total_returned_amount_to)
          ? ""
          : formatCurrency(initialValues.total_returned_amount_to));
      list.push({
        key: "total_refunded_amount",
        name: "Tổng giá trị đơn trả",
        value: totalRefundedAmountFiltered,
      });
    }

    if (initialValues.store_of_first_order_ids?.length) {
      let firstOrderStoresFiltered = "";
      initialValues.store_of_first_order_ids.forEach(
        (first_order_store_id: any) => {
          const store = listStore?.find(
            (item) => item.id.toString() === first_order_store_id.toString()
          );
          firstOrderStoresFiltered = store
            ? firstOrderStoresFiltered + store.name + "; "
            : firstOrderStoresFiltered;
        }
      );
      list.push({
        key: "store_of_first_order_ids",
        name: "Cửa hàng mua đầu",
        value: firstOrderStoresFiltered,
      });
    }

    if (initialValues.store_of_last_order_ids?.length) {
      let lastOrderStoresFiltered = "";
      initialValues.store_of_last_order_ids.forEach(
        (last_order_store_id: any) => {
          const store = listStore?.find(
            (item) => item.id.toString() === last_order_store_id.toString()
          );
          lastOrderStoresFiltered = store
            ? lastOrderStoresFiltered + store.name + "; "
            : lastOrderStoresFiltered;
        }
      );
      list.push({
        key: "store_of_last_order_ids",
        name: "Cửa hàng mua cuối",
        value: lastOrderStoresFiltered,
      });
    }

    if (
      !isNullOrUndefined(initialValues.number_of_days_without_purchase_from) ||
      !isNullOrUndefined(initialValues.number_of_days_without_purchase_to)
    ) {
      let daysWithoutPurchaseFiltered =
        (isNullOrUndefined(initialValues.number_of_days_without_purchase_from)
          ? ""
          : formatCurrency(
              initialValues.number_of_days_without_purchase_from
            )) +
        " - " +
        (isNullOrUndefined(initialValues.number_of_days_without_purchase_to)
          ? ""
          : formatCurrency(initialValues.number_of_days_without_purchase_to));
      list.push({
        key: "days_without_purchase",
        name: "Số ngày chưa mua hàng",
        value: daysWithoutPurchaseFiltered,
      });
    }

    if (
      initialValues.first_order_time_from ||
      initialValues.first_order_time_to
    ) {
      let firstOrderDateFiltered =
        (initialValues.first_order_time_from
          ? ConvertUtcToLocalDate(
              initialValues.first_order_time_from,
              "DD-MM-YYYY"
            )
          : "") +
        " - " +
        (initialValues.first_order_time_to
          ? ConvertUtcToLocalDate(
              initialValues.first_order_time_to,
              "DD-MM-YYYY"
            )
          : "");
      list.push({
        key: "first_order_date",
        name: "Ngày mua đầu",
        value: firstOrderDateFiltered,
      });
    }

    if (
      initialValues.last_order_time_from ||
      initialValues.last_order_time_to
    ) {
      let lastOrderDateFiltered =
        (initialValues.last_order_time_from
          ? ConvertUtcToLocalDate(
              initialValues.last_order_time_from,
              "DD-MM-YYYY"
            )
          : "") +
        " - " +
        (initialValues.last_order_time_to
          ? ConvertUtcToLocalDate(
              initialValues.last_order_time_to,
              "DD-MM-YYYY"
            )
          : "");
      list.push({
        key: "last_order_date",
        name: "Ngày mua cuối",
        value: lastOrderDateFiltered,
      });
    }

    if (
      !isNullOrUndefined(initialValues.point_from) ||
      !isNullOrUndefined(initialValues.point_to)
    ) {
      let pointFiltered =
        (isNullOrUndefined(initialValues.point_from)
          ? ""
          : formatCurrency(initialValues.point_from)) +
        " - " +
        (isNullOrUndefined(initialValues.point_to)
          ? ""
          : formatCurrency(initialValues.point_to));
      list.push({
        key: "point",
        name: "Điểm",
        value: pointFiltered,
      });
    }

    return list;
  }, [initialValues.gender,
    initialValues.customer_group_ids,
    initialValues.customer_level_ids,
    initialValues.responsible_staff_codes,
    initialValues.customer_type_ids,
    initialValues.assign_store_ids,
    initialValues.store_ids,
    initialValues.day_of_birth_from,
    initialValues.day_of_birth_to,
    initialValues.month_of_birth_from,
    initialValues.month_of_birth_to,
    initialValues.year_of_birth_from,
    initialValues.year_of_birth_to,
    initialValues.channel_ids,
    initialValues.source_ids,
    initialValues.age_from,
    initialValues.age_to,
    initialValues.city_ids,
    initialValues.district_ids,
    initialValues.ward_ids,
    initialValues.total_finished_order_from,
    initialValues.total_finished_order_to,
    initialValues.total_paid_amount_from,
    initialValues.total_paid_amount_to,
    initialValues.total_returned_order_from,
    initialValues.total_returned_order_to,
    initialValues.remain_amount_to_level_up_from,
    initialValues.remain_amount_to_level_up_to,
    initialValues.average_order_amount_from,
    initialValues.average_order_amount_to,
    initialValues.total_returned_amount_from,
    initialValues.total_returned_amount_to,
    initialValues.store_of_first_order_ids,
    initialValues.store_of_last_order_ids,
    initialValues.number_of_days_without_purchase_from,
    initialValues.number_of_days_without_purchase_to,
    initialValues.first_order_time_from,
    initialValues.first_order_time_to,
    initialValues.last_order_time_from,
    initialValues.last_order_time_to,
    initialValues.point_from,
    initialValues.point_to,
    LIST_GENDER,
    groups,
    loyaltyUsageRules,
    AccountConvertResultSearch,
    types,
    listStore,
    listChannel,
    listSource,
    provincesList,
    districtsList, wardsList
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
        case "customer_group_ids":
          onFilter && onFilter({ ...params, customer_group_ids: [] });
          formCustomerFilter?.setFieldsValue({ customer_group_ids: [] });
          break;
        case "customer_level_ids":
          onFilter && onFilter({ ...params, customer_level_ids: [] });
          formCustomerFilter?.setFieldsValue({ customer_level_ids: [] });
          break;
        case "responsible_staff_codes":
          onFilter && onFilter({ ...params, responsible_staff_codes: null });
          formCustomerFilter?.setFieldsValue({ responsible_staff_codes: null });
          break;
        case "customer_type_ids":
          onFilter && onFilter({ ...params, customer_type_ids: [] });
          formCustomerFilter?.setFieldsValue({ customer_type_ids: [] });
          break;
        case "assign_store_ids":
          onFilter && onFilter({ ...params, assign_store_ids: [] });
          formCustomerFilter?.setFieldsValue({ assign_store_ids: [] });
          break;
        case "store_ids":
          onFilter && onFilter({ ...params, store_ids: [] });
          formCustomerFilter?.setFieldsValue({ store_ids: [] });
          break;
        case "day_of_birth":
          onFilter &&
            onFilter({
              ...params,
              day_of_birth_from: null,
              day_of_birth_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            day_of_birth_from: null,
            day_of_birth_to: null,
          });
          break;
        case "month_of_birth":
          onFilter &&
            onFilter({
              ...params,
              month_of_birth_from: null,
              month_of_birth_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            month_of_birth_from: null,
            month_of_birth_to: null,
          });
          break;
        case "year_of_birth":
          onFilter &&
            onFilter({
              ...params,
              year_of_birth_from: null,
              year_of_birth_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            year_of_birth_from: null,
            year_of_birth_to: null,
          });
          break;
        case "channel_ids":
          onFilter && onFilter({ ...params, channel_ids: [] });
          formCustomerFilter?.setFieldsValue({ channel_ids: [] });
          break;
        case "source_ids":
          onFilter && onFilter({ ...params, source_ids: [] });
          formCustomerFilter?.setFieldsValue({ source_ids: [] });
          break;
        case "age":
          onFilter && onFilter({ ...params, age_from: null, age_to: null });
          formCustomerFilter?.setFieldsValue({ age_from: null, age_to: null });
          break;
        case "city_ids":
          handleClearProvince();
          formCustomerFilter.submit();
          break;
        case "district_ids":
          handleClearDistrict();
          formCustomerFilter.submit();
          break;
        case "ward_ids":
          handleClearWard();
          formCustomerFilter.submit();
          break;
        case "total_order":
          onFilter &&
            onFilter({
              ...params,
              total_finished_order_from: null,
              total_finished_order_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            total_finished_order_from: null,
            total_finished_order_to: null,
          });
          break;
        case "accumulated_amount":
          onFilter &&
            onFilter({
              ...params,
              total_paid_amount_from: null,
              total_paid_amount_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            total_paid_amount_from: null,
            total_paid_amount_to: null,
          });
          break;
        case "total_refunded_order":
          onFilter &&
            onFilter({
              ...params,
              total_returned_order_from: null,
              total_returned_order_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            total_returned_order_from: null,
            total_returned_order_to: null,
          });
          break;
        case "remain_amount":
          onFilter &&
            onFilter({
              ...params,
              remain_amount_to_level_up_from: null,
              remain_amount_to_level_up_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            remain_amount_to_level_up_from: null,
            remain_amount_to_level_up_to: null,
          });
          break;
        case "average_order_amount":
          onFilter &&
            onFilter({
              ...params,
              average_order_amount_from: null,
              average_order_amount_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            average_order_amount_from: null,
            average_order_amount_to: null,
          });
          break;
        case "total_refunded_amount":
          onFilter &&
            onFilter({
              ...params,
              total_returned_amount_from: null,
              total_returned_amount_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            total_returned_amount_from: null,
            total_returned_amount_to: null,
          });
          break;
        case "store_of_first_order_ids":
          onFilter && onFilter({ ...params, store_of_first_order_ids: [] });
          formCustomerFilter?.setFieldsValue({ store_of_first_order_ids: [] });
          break;
        case "store_of_last_order_ids":
          onFilter && onFilter({ ...params, store_of_last_order_ids: [] });
          formCustomerFilter?.setFieldsValue({ store_of_last_order_ids: [] });
          break;
        case "days_without_purchase":
          onFilter &&
            onFilter({
              ...params,
              number_of_days_without_purchase_from: null,
              number_of_days_without_purchase_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            number_of_days_without_purchase_from: null,
            number_of_days_without_purchase_to: null,
          });
          break;
        case "first_order_date":
          setFirstOrderDateClick("");
          setFirstOrderDateFrom(null);
          setFirstOrderDateTo(null);
          onFilter &&
            onFilter({
              ...params,
              first_order_time_from: null,
              first_order_time_to: null,
            });
          break;
        case "last_order_date":
          setLastOrderDateClick("");
          setLastOrderDateFrom(null);
          setLastOrderDateTo(null);
          onFilter &&
            onFilter({
              ...params,
              last_order_time_from: null,
              last_order_time_to: null,
            });
          break;
        case "point":
          onFilter && onFilter({ ...params, point_from: null, point_to: null });
          formCustomerFilter?.setFieldsValue({
            point_from: null,
            point_to: null,
          });
          break;

        default:
          break;
      }
    },
    [
      formCustomerFilter,
      handleClearDistrict,
      handleClearProvince,
      handleClearWard,
      onFilter,
      params,
    ]
  );
  // end handle tag filter

  // handle filter action
  const openBaseFilter = useCallback(() => {
    setVisibleBaseFilter(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisibleBaseFilter(false);
  }, []);

  const validateBirthdayFilter = useCallback(() => {
    const values = formCustomerFilter.getFieldsValue();
    if (
      values.day_of_birth_from > values.day_of_birth_to &&
      !values.month_of_birth_from &&
      !values.month_of_birth_to &&
      (values.year_of_birth_from || values.year_of_birth_to)
    ) {
      return false;
    }

    if (
      values.day_of_birth_from ||
      values.day_of_birth_to ||
      values.month_of_birth_from ||
      values.month_of_birth_to ||
      values.year_of_birth_from ||
      values.year_of_birth_to
    ) {
      const day_of_birth_from = values.day_of_birth_from
        ? values.day_of_birth_from
        : values.day_of_birth_to
        ? START_DAY
        : TODAY_VALUE;
      const day_of_birth_to = values.day_of_birth_to
        ? values.day_of_birth_to
        : values.day_of_birth_from
        ? END_DAY
        : TODAY_VALUE;

      const month_of_birth_from = values.month_of_birth_from
        ? values.month_of_birth_from
        : values.month_of_birth_to
        ? START_MONTH
        : THIS_MONTH_VALUE;
      const month_of_birth_to = values.month_of_birth_to
        ? values.month_of_birth_to
        : values.month_of_birth_from
        ? END_MONTH
        : THIS_MONTH_VALUE;

      const year_of_birth_from = values.year_of_birth_from
        ? values.year_of_birth_from
        : values.year_of_birth_to
        ? START_YEAR
        : THIS_YEAR;
      const year_of_birth_to = values.year_of_birth_to
        ? values.year_of_birth_to
        : THIS_YEAR;

      const startDate = new Date(
        month_of_birth_from.toString() +
          "/" +
          day_of_birth_from.toString() +
          "/" +
          year_of_birth_from.toString()
      );
      const endDate = new Date(
        month_of_birth_to.toString() +
          "/" +
          day_of_birth_to.toString() +
          "/" +
          year_of_birth_to.toString()
      );

      return startDate <= endDate;
    }
    return true;
  }, [formCustomerFilter]);

  const onFilterClick = useCallback(async () => {
    const isValidBirthday = validateBirthdayFilter();
    if (!isValidBirthday) {
      showError(
        "Trường ngày, tháng, năm sinh nhật bắt đầu lớn hơn kết thúc. Vui lòng kiểm tra lại!"
      );
      return;
    }

    let isValidForm = true;

    await formCustomerFilter
      .validateFields()
      .then()
      .catch((error: any) => {
        isValidForm = false;
      });

    if (isValidForm) {
      setVisibleBaseFilter(false);
      formCustomerFilter?.submit();
    } else {
      showError("Trường dữ liệu nhập vào chưa đúng. Vui lòng kiểm tra lại!");
    }
  }, [formCustomerFilter, validateBirthdayFilter]);

  // clear advanced filter
  const onClearAdvancedFilter = useCallback(() => {
    clearFirstOrderDate();
    clearLastOrderDate();

    setVisibleBaseFilter(false);
    formCustomerFilter.setFieldsValue(initQuery);
    onClearFilter && onClearFilter();
  }, [formCustomerFilter, initQuery, onClearFilter]);
  // end clear advanced filter
  // end handle filter action

  // handle district_ids param: if it's filtered by wards then params will not include district_ids
  const setDistrictIdParam = () => {
    let tempDistrictListSelected = [...districtListSelected];
    wardListSelected.forEach((ward) => {
      tempDistrictListSelected = tempDistrictListSelected?.filter(
        (district: any) => district.id !== ward.district_id
      );
    });

    let districtIdParam: any[] = [];
    tempDistrictListSelected.forEach((district) => {
      districtIdParam.push(district.id);
    });
    return districtIdParam;
  };

  // handle city_ids param: if it's filtered by districts then params will not include city_ids
  const setCityIdParam = () => {
    let tempProvinceListSelected = [...provinceListSelected];
    districtListSelected.forEach((district) => {
      tempProvinceListSelected = tempProvinceListSelected.filter(
        (city: any) => city.id !== district.city_id
      );
    });

    let cityIdParam: any[] = [];
    tempProvinceListSelected.forEach((city) => {
      cityIdParam.push(city.id);
    });
    return cityIdParam;
  };

  const onFinish = useCallback(
    (values) => {
      const formValues = {
        ...values,
        city_ids: setCityIdParam(),
        district_ids: setDistrictIdParam(),
        responsible_staff_codes: values.responsible_staff_codes
          ? values.responsible_staff_codes.split(" - ")[0]
          : null,
        first_order_time_from: firstOrderDateFrom,
        first_order_time_to: firstOrderDateTo,
        last_order_time_from: lastOrderDateFrom,
        last_order_time_to: lastOrderDateTo,
      };

      onFilter && onFilter(formValues);
    },
    [
      firstOrderDateFrom,
      firstOrderDateTo,
      lastOrderDateFrom,
      lastOrderDateTo,
      onFilter,
    ]
  );

  const actionList = [
    {
      name: "Tặng điểm",
      type: "ADD",
    },
    {
      name: "Trừ điểm",
      type: "SUBTRACT",
    },
  ];

  const changeCustomerPoint = (changeType: string) => {
    if (selectedCustomerIds && selectedCustomerIds.length) {
      const params = {
        type: changeType,
        customer_ids: selectedCustomerIds,
      };

      let queryParams = generateQuery(params);
      window.open(
        `${BASE_NAME_ROUTER}${UrlConfig.CUSTOMER2}-adjustments/create?${queryParams}`,
        "_blank"
      );
    }
  };

  const dropdownMenuList = (
    <Menu>
      {actionList.map((item, index) => {
        return (
          <Menu.Item key={item.type} disabled={selectedCustomerIds?.length < 1}>
            <span onClick={() => changeCustomerPoint(item.type)}>
              {item.name}
            </span>
          </Menu.Item>
        );
      })}
    </Menu>
  );
  // end handle action button

  const widthScreen = () => {
    if (window.innerWidth >= 1600) {
      return 1400;
    } else if (window.innerWidth < 1600 && window.innerWidth >= 1200) {
      return 1000;
    } else {
      return 800;
    }
  };

  const handleSearchOrderSources = useCallback((value:string) => {
		if(value.length > 1) {
		 handleDelayActionWhenInsertTextInSearchInput(sourceInputRef, () => {
			 let query = {
					name: value,
          active: true
			 }
			 getSourcesWithParamsService(query).then((response) => {
				 setListSource(response.data.items)
			 }).catch((error) => {
				 console.log('error', error)
			 })
		 })
		} else {
			setListSource(initListSource)
		}
	}, [initListSource]);

  return (
    <StyledCustomerFilter>
      <Form
        form={formCustomerFilter}
        onFinish={onFinish}
        initialValues={params}
        layout="inline"
        className="inline-filter">
        <Dropdown
          overlay={dropdownMenuList}
          trigger={["click"]}
          disabled={isLoading}>
          <Button style={{ marginRight: 15 }}>
            <span style={{ marginRight: 10 }}>Thao tác</span>
            <DownOutlined />
          </Button>
        </Dropdown>

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
          icon={
            <img style={{ marginBottom: 15 }} src={settingGearIcon} alt="" />
          }
        />
      </Form>

      <BaseFilter
        onClearFilter={onClearAdvancedFilter}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visibleBaseFilter}
        width={widthScreen()}>
        <StyledCustomerBaseFilter>
          <Form
            form={formCustomerFilter}
            onFinish={onFinish}
            initialValues={params}
            layout="vertical">
            <div className="base-filter-container">
              <div className="base-filter-row">
                <Form.Item
                  name="gender"
                  label={<b>Giới tính</b>}
                  className="left-filter">
                  <Select
                    showSearch
                    placeholder="Chọn giới tính"
                    allowClear
                    optionFilterProp="children">
                    {LIST_GENDER &&
                      LIST_GENDER.map((c: any) => (
                        <Option key={c.value} value={c.value}>
                          {c.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="customer_group_ids"
                  label={<b>Nhóm khách hàng:</b>}
                  className="center-filter">
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn nhóm khách hàng"
                    optionFilterProp="children">
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
                  className="right-filter">
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn hạng thẻ">
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
                  name="responsible_staff_codes"
                  label={<b>Nhân viên phụ trách</b>}
                  className="left-filter">
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
                    options={AccountConvertResultSearch}>
                    <Input
                      placeholder="Chọn nhân viên phụ trách"
                      suffix={<DownOutlined style={{ color: "#ABB4BD" }} />}
                    />
                  </AutoComplete>
                </Form.Item>

                <Form.Item
                  name="customer_type_ids"
                  label={<b>Loại khách hàng:</b>}
                  className="center-filter">
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    placeholder="Chọn loại khách hàng"
                    allowClear
                    optionFilterProp="children">
                    {types.map((type: any) => (
                      <Option key={type.id} value={type.id}>
                        {type.name + ` - ${type.code}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="assign_store_ids"
                  label={<b>Cửa hàng cấp thẻ</b>}
                  className="right-filter">
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children"
                    defaultValue={undefined}>
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
                  name="channel_ids"
                  label={<b>Kênh mua hàng</b>}
                  className="left-filter">
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn kênh"
                    optionFilterProp="children">
                    {listChannel?.map((item, index) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="source_ids"
                  label={<b>Nguồn mua hàng</b>}
                  className="center-filter">
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    onSearch={handleSearchOrderSources}
                    showArrow
                    allowClear
                    placeholder="Chọn nguồn"
                    optionFilterProp="children">
                    {listSource?.map((item, index) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="right-filter">
                  <div className="title">Điểm</div>
                  <div className="select-scope">
                    <Form.Item
                      className="select-item"
                      name="point_from"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Điểm chỉ được phép nhập số",
                        },
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Từ"
                        maxLength={15}
                      />
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item
                      className="select-item"
                      name="point_to"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Điểm chỉ được phép nhập số",
                        },
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Đến"
                        maxLength={15}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="base-filter-row">
                <Form.Item
                  name="store_ids"
                  label={<b>Cửa hàng</b>}
                  className="left-filter">
                  {/* <Select
                    mode="multiple"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children"
                    maxTagCount="responsive">
                    {listStore?.map((item) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select> */}
                   <TreeStore listStore={listStore}  placeholder="Chọn cửa hàng"/>
                </Form.Item>

                <div className="center-filter">
                  <div className="title">Ngày sinh</div>
                  <div className="select-scope">
                    <Form.Item name="day_of_birth_from" className="select-item">
                      <Select showSearch allowClear placeholder="Từ ngày">
                        {INIT_FROM_DATE_LIST.map((item: any) => (
                          <Option
                            key={item.value}
                            value={item.value}
                            disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item name="day_of_birth_to" className="select-item">
                      <Select showSearch allowClear placeholder="Đến ngày">
                        {INIT_TO_DATE_LIST.map((item: any) => (
                          <Option
                            key={item.value}
                            value={item.value}
                            disabled={item.disable}>
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
                    <Form.Item
                      name="year_of_birth_from"
                      className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Từ năm"
                        onSelect={onSelectFromYear}
                        onClear={onClearFromYear}>
                        {fromYearList.map((item: any) => (
                          <Option
                            key={item.key}
                            value={item.value}
                            disabled={item.disable}>
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
                        onClear={onClearToYear}>
                        {toYearList.map((item: any) => (
                          <Option
                            key={item.key}
                            value={item.value}
                            disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="base-filter-row">
                {/* Filter by City */}
                <div className="left-filter">
                  <Form.Item name="city_ids" label={<b>Tỉnh/Thành phố</b>}>
                    <Select
                      mode="multiple"
                      maxTagCount="responsive"
                      showArrow
                      allowClear
                      showSearch
                      placeholder="Chọn Tỉnh/Thành phố"
                      notFoundContent="Không tìm thấy Tỉnh/Thành phố"
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      onSelect={handleSelectProvince}
                      onDeselect={handleDeselectProvince}
                      onClear={handleClearProvince}>
                      {provincesList?.map((item: any) => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <div className="center-filter">
                  <div className="title">Tháng sinh</div>
                  <div className="select-scope">
                    <Form.Item
                      name="month_of_birth_from"
                      className="select-item">
                      <Select showSearch allowClear placeholder="Từ tháng">
                        {INIT_FROM_MONTH_LIST.map((item: any) => (
                          <Option
                            key={item.value}
                            value={item.value}
                            disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item name="month_of_birth_to" className="select-item">
                      <Select showSearch allowClear placeholder="Đến tháng">
                        {INIT_TO_MONTH_LIST.map((item: any) => (
                          <Option
                            key={item.value}
                            value={item.value}
                            disabled={item.disable}>
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
                      ]}>
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
                      ]}>
                      <Input placeholder="Đến" />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="base-filter-row">
                {/* Filter by Huyện */}
                <div className="left-filter">
                  <Form.Item name="district_ids" label={<b>Quận/Huyện</b>}>
                    <Select
                      mode="multiple"
                      showArrow
                      allowClear
                      showSearch
                      placeholder="Chọn Quận/Huyện"
                      notFoundContent="Không tìm thấy Quận/Huyện"
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      maxTagCount="responsive"
                      onSelect={handleSelectDistrict}
                      onDeselect={handleDeselectDistrict}
                      onClear={handleClearDistrict}>
                      {districtsList?.map((item: any) => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <div className="center-filter">
                  <div>
                    <div className="title">Tổng đơn hàng</div>
                    <div className="select-scope">
                      <Form.Item
                        className="select-item"
                        name="total_finished_order_from"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số đơn hàng chỉ được phép nhập số",
                          },
                        ]}>
                        <CustomNumberInput
                          format={(a: string) => formatCurrency(a)}
                          revertFormat={(a: string) => replaceFormatString(a)}
                          placeholder="Từ"
                          maxLength={8}
                        />
                      </Form.Item>

                      <img src={rightArrow} alt="" />

                      <Form.Item
                        className="select-item"
                        name="total_finished_order_to"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số đơn hàng chỉ được phép nhập số",
                          },
                        ]}>
                        <CustomNumberInput
                          format={(a: string) => formatCurrency(a)}
                          revertFormat={(a: string) => replaceFormatString(a)}
                          placeholder="Đến"
                          maxLength={8}
                        />
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
                        name="remain_amount_to_level_up_from"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số tiền chỉ được phép nhập số",
                          },
                        ]}>
                        <CustomNumberInput
                          format={(a: string) => formatCurrency(a)}
                          revertFormat={(a: string) => replaceFormatString(a)}
                          placeholder="Từ"
                          maxLength={15}
                        />
                      </Form.Item>

                      <img src={rightArrow} alt="" />

                      <Form.Item
                        className="select-item"
                        name="remain_amount_to_level_up_to"
                        rules={[
                          {
                            pattern: RegUtil.NUMBERREG,
                            message: "Số tiền chỉ được phép nhập số",
                          },
                        ]}>
                        <CustomNumberInput
                          format={(a: string) => formatCurrency(a)}
                          revertFormat={(a: string) => replaceFormatString(a)}
                          placeholder="Đến"
                          maxLength={15}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>

              <div className="base-filter-row">
                {/* Filter by Xã */}
                <div className="left-filter">
                  <Form.Item name="ward_ids" label={<b>Phường/Xã</b>}>
                    <Select
                      mode="multiple"
                      showArrow
                      allowClear
                      showSearch
                      placeholder="Chọn Phường/Xã"
                      notFoundContent="Không tìm thấy Phường/Xã"
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      maxTagCount="responsive"
                      onSelect={handleSelectWard}
                      onDeselect={handleDeselectWard}
                      onClear={handleClearWard}>
                      {wardsList?.map((item: any) => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <div className="center-filter">
                  <div className="title">Tiền tích lũy</div>
                  <div className="select-scope">
                    <Form.Item
                      className="select-item"
                      name="total_paid_amount_from"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Tiền tích lũy chỉ được phép nhập số",
                        },
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Từ"
                        maxLength={15}
                      />
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item
                      className="select-item"
                      name="total_paid_amount_to"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Tiền tích lũy chỉ được phép nhập số",
                        },
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Đến"
                        maxLength={15}
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="right-filter">
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
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Từ"
                        maxLength={15}
                      />
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
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Đến"
                        maxLength={15}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="base-filter-row">
                <Form.Item
                  name="store_of_first_order_ids"
                  label={<b>Cửa hàng mua đầu</b>}
                  className="left-filter">
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children">
                    {listStore?.map((item) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="store_of_last_order_ids"
                  label={<b>Cửa hàng mua cuối</b>}
                  className="center-filter">
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn cửa hàng"
                    optionFilterProp="children">
                    {listStore?.map((item) => (
                      <Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <div className="right-filter">
                  <div className="title">Số đơn trả hàng</div>
                  <div className="select-scope">
                    <Form.Item
                      className="select-item"
                      name="total_returned_order_from"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Số đơn trả hàng chỉ được phép nhập số",
                        },
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Từ"
                        maxLength={8}
                      />
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item
                      className="select-item"
                      name="total_returned_order_to"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Số đơn trả hàng chỉ được phép nhập số",
                        },
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Đến"
                        maxLength={8}
                      />
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

                <Form.Item
                  label={<b>Ngày mua cuối</b>}
                  className="center-filter">
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
                  <div className="title">Tổng giá trị đơn trả</div>
                  <div className="select-scope">
                    <Form.Item
                      className="select-item"
                      name="total_returned_amount_from"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Số tiền chỉ được phép nhập số",
                        },
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Từ"
                        maxLength={15}
                      />
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item
                      className="select-item"
                      name="total_returned_amount_to"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Số tiền chỉ được phép nhập số",
                        },
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Đến"
                        maxLength={15}
                      />
                    </Form.Item>
                  </div>

                  <div className="title">Số ngày chưa mua hàng</div>
                  <div className="select-scope">
                    <Form.Item
                      className="select-item"
                      name="number_of_days_without_purchase_from"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Số ngày chỉ được phép nhập số",
                        },
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Từ"
                        maxLength={6}
                      />
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item
                      className="select-item"
                      name="number_of_days_without_purchase_to"
                      rules={[
                        {
                          pattern: RegUtil.NUMBERREG,
                          message: "Số ngày chỉ được phép nhập số",
                        },
                      ]}>
                      <CustomNumberInput
                        format={(a: string) => formatCurrency(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Đến"
                        maxLength={6}
                      />
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
              onClose={(e) => onCloseTag(e, filter)}>
              {filter.name}: {filter.value}
            </Tag>
          );
        })}
      </div>
    </StyledCustomerFilter>
  );
};

export default CustomerListFilter;
