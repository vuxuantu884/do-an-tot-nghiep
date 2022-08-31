import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Dropdown, Form, Input, Menu, Row, Select, Switch, Tag, Tooltip } from "antd";
import filterIcon from "assets/icon/filter.svg";
import rightArrow from "assets/icon/right-arrow.svg";
import settingGearIcon from "assets/icon/setting-gear-icon.svg";
import CustomNumberInput from "component/custom/customNumberInput";
import BaseFilter from "component/filter/base.filter";
import FilterDateCustomerCustom from "component/filter/FilterDateCustomerCustom";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import UrlConfig, { BASE_NAME_ROUTER } from "config/url.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
// import { departmentDetailAction } from "domain/actions/account/department.action";
import {
  CityByCountryAction,
  DistrictByCityAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import { getListAllSourceRequest } from "domain/actions/product/source.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { ProvinceModel } from "model/content/district.model";
import { StoreResponse } from "model/core/store.model";
import { CustomerSearchQuery } from "model/query/customer.query";
import { RootReducerType } from "model/reducers/RootReducerType";
import { SourceResponse } from "model/response/order/source.response";
import { ChannelResponse } from "model/response/product/channel.response";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StyledCustomerBaseFilter, StyledCustomerFilter } from "screens/customer/customerStyled";
// import { getSourcesWithParamsService } from "service/order/order.service";
import {
  formatCurrency,
  formatCurrencyNotDefaultValue,
  generateQuery,
  // handleDelayActionWhenInsertTextInSearchInput,
  isNullOrUndefined,
  replaceFormatString,
  // sortSources
} from "utils/AppUtils";
import { FILTER_CONFIG_TYPE, VietNamId } from "utils/Constants";
import { DATE_FORMAT, formatDateFilter } from "utils/DateUtils";
import { RegUtil } from "utils/RegUtils";
import { showError } from "utils/ToastUtils";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import TreeSource from "component/treeSource";
import BaseResponse from "base/base.response";
import { FilterConfig } from "model/other";
import UserCustomFilterTag from "component/filter/UserCustomFilterTag";
import FilterConfigModal from "component/modal/FilterConfigModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import useHandleFilterConfigs from "./useHandleFilterConfigs";

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
const { Item } = Form;
const today = new Date();
const THIS_YEAR = today.getFullYear();
const START_YEAR = 1900;
const START_MONTH = 1;
const END_MONTH = 12;
const START_DAY = 1;
const END_DAY = 31;
const THIS_MONTH_VALUE = today.getMonth() + 1;
const TODAY_VALUE = today.getDate();

const DATE_LIST_FORMAT = {
  todayFrom: moment().startOf("day").format("DD-MM-YYYY"),
  todayTo: moment().endOf("day").format("DD-MM-YYYY"),

  yesterdayFrom: moment().startOf("day").subtract(1, "days").format("DD-MM-YYYY"),
  yesterdayTo: moment().endOf("day").subtract(1, "days").format("DD-MM-YYYY"),

  thisWeekFrom: moment().startOf("week").format("DD-MM-YYYY"),
  thisWeekTo: moment().endOf("week").format("DD-MM-YYYY"),

  lastWeekFrom: moment().startOf("week").subtract(1, "weeks").format("DD-MM-YYYY"),
  lastWeekTo: moment().endOf("week").subtract(1, "weeks").format("DD-MM-YYYY"),

  thisMonthFrom: moment().startOf("month").format("DD-MM-YYYY"),
  thisMonthTo: moment().endOf("month").format("DD-MM-YYYY"),

  lastMonthFrom: moment().subtract(1, "months").startOf("month").format("DD-MM-YYYY"),
  lastMonthTo: moment().subtract(1, "months").endOf("month").format("DD-MM-YYYY"),
};

// select area
let tempWardList: any[] = [];
let wardListSelected: any[] = [];
let districtListSelected: any[] = [];
let provinceListSelected: any[] = [];

const CustomerListFilter: React.FC<CustomerListFilterProps> = (props: CustomerListFilterProps) => {
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
  const bootstrapReducer = useSelector((state: RootReducerType) => state.bootstrapReducer);
  const LIST_GENDER = bootstrapReducer.data?.gender;

  const [formSearchValuesToSave, setFormSearchValuesToSave] = useState({});
  const [tagActive, setTagActive] = useState<number | null>();
  const [isShowModalSaveFilter, setIsShowModalSaveFilter] = useState(false);
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);
  const [visibleUTM, setVisibleUTM] = useState<boolean>(false);

  const [initPublicAccounts, setInitPublicAccounts] = useState<Array<AccountResponse>>([]);
  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);
  const [accountDataFiltered, setAccountDataFiltered] = useState<Array<AccountResponse>>([]);

  // handle select date
  const [firstOrderDateClick, setFirstOrderDateClick] = useState("");
  const [lastOrderDateClick, setLastOrderDateClick] = useState("");
  const [firstDateStart, setFirstDateStart] = useState<any>(params.first_order_time_from);
  const [firstDateEnd, setFirstDateEnd] = useState<any>(params.first_order_time_to);
  const [lastDateStart, setLastDateStart] = useState<any>(params.last_order_time_from);
  const [lastDateEnd, setLastDateEnd] = useState<any>(params.last_order_time_to);


  // lưu bộ lọc
  const onShowSaveFilter = useCallback(() => {
    const values = formCustomerFilter.getFieldsValue();
    const saveFormValues = {
      ...values,
      responsible_staff_codes: values.responsible_staff_codes
        ? values.responsible_staff_codes.split(" - ")[0]
        : null,
      first_order_time_from: firstDateStart,
      first_order_time_to: firstDateEnd,
      last_order_time_from: lastDateStart,
      last_order_time_to: lastDateEnd,
    }
    setFormSearchValuesToSave(saveFormValues);
    setIsShowModalSaveFilter(true);
  }, [firstDateEnd, firstDateStart, formCustomerFilter, lastDateEnd, lastDateStart]);

  const onHandleFilterTagSuccessCallback = (res: BaseResponse<FilterConfig>) => {
    setTagActive(res.data.id);
  };

  const onFilterBySavedConfig = (formValue: any) => {
    setFirstDateStart(formValue.first_order_time_from);
    setFirstDateEnd(formValue.first_order_time_to);
    setLastDateStart(formValue.last_order_time_from);
    setLastDateEnd(formValue.last_order_time_to);

    formCustomerFilter.setFieldsValue(formValue);
    formCustomerFilter.submit();
  };

  const {
    filterConfigs,
    onSaveFilter,
    configId,
    setConfigId,
    handleDeleteFilter,
    onSelectFilterConfig,
  } = useHandleFilterConfigs(
    FILTER_CONFIG_TYPE.FILTER_LIST_CUSTOMER,
    formCustomerFilter,
    {
      ...formSearchValuesToSave,
    },
    setTagActive,
    onHandleFilterTagSuccessCallback,
    onFilterBySavedConfig,
  );

  const handleClearFilterConfig = useCallback(() => {
    setTagActive(undefined);
    let fields = formCustomerFilter.getFieldsValue(true);
    for (let key in fields) {
      if (fields[key] instanceof Array) {
        fields[key] = [];
      } else {
        fields[key] = null;
      }
    }
    formCustomerFilter.setFieldsValue(fields);
  }, [formCustomerFilter]);

  const onMenuDeleteConfigFilter = () => {
    handleDeleteFilter(configId);
    setIsShowConfirmDelete(false);
  };

  //---Handle Source---\\
  // const sourceInputRef = useRef()
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  // const [initListSource, setInitListSource] = useState<Array<SourceResponse>>([]);
  // const [allSources, setAllSources] = useState<Array<SourceResponse>>([]);
  // const [departmentIds, setDepartmentIds] = useState<number[]|null>(null);

  // const userReducer = useSelector(
  //   (state: RootReducerType) => state.userReducer
  // );

  // useEffect(() => {
  // 	dispatch(getListAllSourceRequest((response) => {
  // 		setAllSources(response)
  // 	}));
  // }, [dispatch]);

  // useEffect(() => {
  //   let departmentId = userReducer.account?.account_jobs[0]?.department_id;
  //   if (departmentId) {
  //     let department: number[] = [];
  //     department.push(departmentId);
  //     dispatch(
  //       departmentDetailAction(departmentId, (response) => {
  //         if (response && response.parent_id) {
  //           department.push(response.parent_id);
  //           setDepartmentIds(department);
  //         }
  //       })
  //     );
  //   }
  // }, [dispatch, userReducer.account?.account_jobs]);

  // const getOrderSources = useCallback(async() => {
  // 	let result:SourceResponse[];
  //   result= await sortSources(allSources, departmentIds)
  // 	return result
  // }, [allSources, departmentIds]);

  useEffect(() => {
    dispatch(
      getListAllSourceRequest((response) => {
        // setInitListSource(response);
        setListSource(response);
      }),
    );
  }, [dispatch]);

  const updatePublicAccounts = (data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setInitPublicAccounts(data.items);
  };

  useEffect(() => {
    dispatch(searchAccountPublicAction({ limit: 30 }, updatePublicAccounts));
  }, [dispatch]);
  //---End Handle Source---\\

  const initialValues = useMemo(() => {
    // const cityIds = formCustomerFilter.getFieldValue("city_ids");
    // const districtIds = formCustomerFilter.getFieldValue("district_ids");
    // const wardIds = formCustomerFilter.getFieldValue("ward_ids");

    return {
      ...params,
      // city_ids: cityIds,
      // district_ids: districtIds,
      // ward_ids: wardIds,

      city_ids: Array.isArray(params.city_ids)
        ? params.city_ids.map((item: any) => Number(item))
        : [Number(params.city_ids)],
      district_ids: Array.isArray(params.district_ids)
        ? params.district_ids.map((item: any) => Number(item))
        : [Number(params.district_ids)],
      ward_ids: Array.isArray(params.ward_ids)
        ? params.ward_ids.map((item: any) => Number(item))
        : [Number(params.ward_ids)],

      customer_group_ids: Array.isArray(params.customer_group_ids)
        ? params.customer_group_ids
        : [params.customer_group_ids],
      customer_level_ids: Array.isArray(params.customer_level_ids)
        ? params.customer_level_ids
        : [params.customer_level_ids],
      customer_type_ids: Array.isArray(params.customer_type_ids)
        ? params.customer_type_ids
        : [params.customer_type_ids],
      assign_store_ids: Array.isArray(params.assign_store_ids)
        ? params.assign_store_ids.map((item: any) => Number(item))
        : [Number(params.assign_store_ids)],
      channel_ids: Array.isArray(params.channel_ids) ? params.channel_ids : [params.channel_ids],
      source_ids: Array.isArray(params.source_ids) ? params.source_ids : [params.source_ids],
      source_of_first_order_online_ids: Array.isArray(params.source_of_first_order_online_ids)
        ? params.source_of_first_order_online_ids.map((i: any) => Number(i))
        : [Number(params.source_of_first_order_online_ids)],
      source_of_last_order_online_ids: Array.isArray(params.source_of_last_order_online_ids)
        ? params.source_of_last_order_online_ids.map((i: any) => Number(i))
        : [Number(params.source_of_last_order_online_ids)],
      store_ids: Array.isArray(params.store_ids)
        ? params.store_ids.map((item: any) => Number(item))
        : [Number(params.store_ids)],
      store_of_first_order_offline_ids: Array.isArray(params.store_of_first_order_offline_ids)
        ? params.store_of_first_order_offline_ids.map((item: any) => Number(item))
        : [Number(params.store_of_first_order_offline_ids)],
      store_of_last_order_offline_ids: Array.isArray(params.store_of_last_order_offline_ids)
        ? params.store_of_last_order_offline_ids.map((item: any) => Number(item))
        : [Number(params.store_of_last_order_offline_ids)],
    };
  }, [params]);

  // handle select sale staff (responsible_staff_codes) by filter param
  const updateAccountData = (data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccountData(data.items);
    setAccountDataFiltered(data.items);
  };
  const handleStaffCodesFilterParam = useCallback(
    (responsible_staff_codes: any) => {
      if (responsible_staff_codes) {
        dispatch(
          searchAccountPublicAction(
            { limit: 30, condition: responsible_staff_codes },
            updateAccountData,
          ),
        );
      }
    },
    [dispatch],
  );
  // end handle select sale staff (responsible_staff_codes) by filter param

  const convertDateStringToDate = (dateString: string) => {
    const arrDate = dateString.split("-");
    const stringDate = arrDate[2] + "-" + arrDate[1] + "-" + arrDate[0];
    return new Date(stringDate);
  }

  //handle change the first purchase date filter
  const handleFirstPurchaseDateStart = (dateString: string) => {
    setFirstOrderDateClick("");
    if (!dateString) {
      setFirstDateStart(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const startOfDate = moment(_date).utc().startOf("day");
      setFirstDateStart(startOfDate);
    }
  };

  const handleFirstPurchaseDateEnd = (dateString: string) => {
    setFirstOrderDateClick("");
    if (!dateString) {
      setFirstDateEnd(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const endOfDate = moment(_date).utc().endOf("day");
      setFirstDateEnd(endOfDate);
    }
  };
  //end handle change the first purchase date filter

  //handle change the first purchase date filter
  const handleLastPurchaseDateStart = (dateString: string) => {
    setLastOrderDateClick("");
    if (!dateString) {
      setLastDateStart(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const startOfDate = moment(_date).utc().startOf("day");
      setLastDateStart(startOfDate);
    }
  };

  const handleLastPurchaseDateEnd = (dateString: string) => {
    setLastOrderDateClick("");
    if (!dateString) {
      setLastDateEnd(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const endOfDate = moment(_date).utc().endOf("day");
      setLastDateEnd(endOfDate);
    }
  };
  //end handle change the last purchase date filter

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

  useEffect(() => {
    formCustomerFilter.setFieldsValue({
      ...initialValues,
    });

    handleStaffCodesFilterParam(initialValues.responsible_staff_codes);

    handleDateFilterParam(
      initialValues?.first_order_time_from,
      initialValues?.first_order_time_to,
      setFirstOrderDateClick,
    );
    setFirstDateStart(initialValues?.first_order_time_from);
    setFirstDateEnd(initialValues?.first_order_time_to);
    handleDateFilterParam(
      initialValues?.last_order_time_from,
      initialValues?.last_order_time_to,
      setLastOrderDateClick,
    );
    setLastDateStart(initialValues?.last_order_time_from);
    setLastDateEnd(initialValues?.last_order_time_to);

    if (
      initialValues.utm_source ||
      initialValues.utm_medium ||
      initialValues.utm_content ||
      initialValues.utm_term ||
      initialValues.utm_id ||
      initialValues.utm_campaign
    ) {
      setVisibleUTM(true);
    } else {
      setVisibleUTM(false);
    }
  }, [formCustomerFilter, handleStaffCodesFilterParam, initialValues]);

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

  const clearFirstOrderDate = () => {
    setFirstOrderDateClick("");
    setFirstDateStart(null);
    setFirstDateEnd(null);
  };

  const clearLastOrderDate = () => {
    setLastOrderDateClick("");
    setLastDateStart(null);
    setLastDateEnd(null);
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
        case "firstOrderDate":
          if (firstOrderDateClick === value) {
            clearFirstOrderDate();
          } else {
            setFirstOrderDateClick(value);
            setFirstDateStart(startDateValue);
            setFirstDateEnd(endDateValue);
          }
          break;
        case "lastOrderDate":
          if (lastOrderDateClick === value) {
            clearLastOrderDate();
          } else {
            setLastOrderDateClick(value);
            setLastDateStart(startDateValue);
            setLastDateEnd(endDateValue);
          }
          break;
        default:
          break;
      }
    },
    [firstOrderDateClick, lastOrderDateClick],
  );

  // end handle select date

  //---------------handle filter by area---------------\\
  const [provincesList, setProvincesList] = useState<ProvinceModel[]>([]);
  const [districtsList, setDistrictsList] = useState<any>([]);
  const [wardsList, setWardsList] = useState<any>([]);

  const getProvince = useCallback(() => {
    dispatch(
      CityByCountryAction(VietNamId, (response) => {
        setProvincesList(response);
      }),
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
    wardListSelected = wardListSelected?.filter((item: any) => item.id !== wardId);
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
    const newWardList = tempWardList?.filter((item: any) => item.district_id !== districtId);
    setWardsList(newWardList);
    tempWardList = newWardList;

    wardListSelected = wardListSelected?.filter((item: any) => item.district_id !== districtId);
    const wardIdListSelected: any[] = [];
    wardListSelected?.forEach((ward: any) => {
      wardIdListSelected.push(ward.id);
    });
    formCustomerFilter.setFieldsValue({ ward_ids: wardIdListSelected });
  };

  const handleDeselectDistrict = (districtId: any) => {
    districtListSelected = districtListSelected?.filter((item: any) => item.id !== districtId);
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
      }),
    );
  };

  const handleSelectDistrict = (districtId: any) => {
    const districtSelected = districtsList?.find((item: any) => item.id === districtId);
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
    const newDistrictsList = districtsList?.filter((item: any) => item.city_id !== provinceId);
    setDistrictsList(newDistrictsList);

    const districtListDeselected = districtListSelected?.filter(
      (item: any) => item.city_id === provinceId,
    );
    // update district list selected
    const newDistrictListSelected = districtListSelected?.filter(
      (item: any) => item.city_id !== provinceId,
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
    provinceListSelected = provinceListSelected?.filter((item: any) => item.id !== provinceId);
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
      }),
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
        (item) => item.value?.toString() === initialValues.gender?.toString(),
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
          (item: any) => item.id?.toString() === customer_group_id?.toString(),
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
          (item: any) => item.rank_id?.toString() === customer_level_id?.toString(),
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
      const staff = accountDataFiltered?.find(
        (item: any) => item.code?.toString() === initialValues.responsible_staff_codes?.toString(),
      );
      list.push({
        key: "responsible_staff_codes",
        name: "Nhân viên phụ trách",
        value: staff
          ? staff?.code + " - " + staff?.full_name
          : initialValues.responsible_staff_codes,
      });
    }

    if (initialValues.customer_type_ids?.length) {
      let customerTypeFiltered = "";
      initialValues.customer_type_ids.forEach((customer_type_id: any) => {
        const customerType = types?.find(
          (item: any) => item.id?.toString() === customer_type_id?.toString(),
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
          (item: any) => item.id?.toString() === assign_store_id?.toString(),
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
        const store = listStore?.find((item) => item.id?.toString() === store_id?.toString());
        storesFiltered = store ? storesFiltered + store.name + "; " : storesFiltered;
      });
      list.push({
        key: "store_ids",
        name: "Cửa hàng",
        value: storesFiltered,
      });
    }

    if (initialValues.day_of_birth_from || initialValues.day_of_birth_to) {
      let textDayOfBirth =
        (initialValues.day_of_birth_from ? initialValues.day_of_birth_from : "") +
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
        (initialValues.month_of_birth_from ? initialValues.month_of_birth_from : "") +
        " - " +
        (initialValues.month_of_birth_to ? initialValues.month_of_birth_to : "");
      list.push({
        key: "month_of_birth",
        name: "Tháng sinh",
        value: monthOfBirthFiltered,
      });
    }

    if (initialValues.year_of_birth_from || initialValues.year_of_birth_to) {
      let yearOfBirthFiltered =
        (initialValues.year_of_birth_from ? initialValues.year_of_birth_from : "") +
        " - " +
        (initialValues.year_of_birth_to ? initialValues.year_of_birth_to : "");
      list.push({
        key: "year_of_birth",
        name: "Năm sinh",
        value: yearOfBirthFiltered,
      });
    }

    if (initialValues.wedding_day_from || initialValues.wedding_day_to) {
      let textWeddingDay =
        (initialValues.wedding_day_from ? initialValues.wedding_day_from : "") +
        " - " +
        (initialValues.wedding_day_to ? initialValues.wedding_day_to : "");
      list.push({
        key: "wedding_day",
        name: "Ngày cưới",
        value: textWeddingDay,
      });
    }

    if (initialValues.wedding_month_from || initialValues.wedding_month_to) {
      let weddingMonthFiltered =
        (initialValues.wedding_month_from ? initialValues.wedding_month_from : "") +
        " - " +
        (initialValues.wedding_month_to ? initialValues.wedding_month_to : "");
      list.push({
        key: "wedding_month",
        name: "Tháng cưới",
        value: weddingMonthFiltered,
      });
    }

    if (initialValues.wedding_year_from || initialValues.wedding_year_to) {
      let weddingYearFiltered =
        (initialValues.wedding_year_from ? initialValues.wedding_year_from : "") +
        " - " +
        (initialValues.wedding_year_to ? initialValues.wedding_year_to : "");
      list.push({
        key: "wedding_year",
        name: "Năm cưới",
        value: weddingYearFiltered,
      });
    }

    if (initialValues.channel_ids?.length) {
      let channelsFiltered = "";
      initialValues.channel_ids.forEach((channel_id: any) => {
        const channel = listChannel?.find((item) => item.id?.toString() === channel_id?.toString());
        channelsFiltered = channel ? channelsFiltered + channel.name + "; " : channelsFiltered;
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
        const source = listSource?.find((item) => item.id?.toString() === source_id?.toString());
        sourcesFiltered = source ? sourcesFiltered + source.name + "; " : sourcesFiltered;
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
        const city = provincesList?.find((item) => item.id?.toString() === city_id?.toString());
        citiesFiltered = city ? citiesFiltered + city.name + "; " : citiesFiltered;
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
          (item: any) => item.id?.toString() === district_id?.toString(),
        );
        districtsFiltered = district ? districtsFiltered + district.name + "; " : districtsFiltered;
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
        const ward = wardsList?.find((item: any) => item.id?.toString() === ward_id?.toString());
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

    if (initialValues.store_of_first_order_offline_ids?.length) {
      let firstOrderStoresFiltered = "";
      initialValues.store_of_first_order_offline_ids.forEach((first_order_store_id: any) => {
        const store = listStore?.find(
          (item) => item.id?.toString() === first_order_store_id?.toString(),
        );
        firstOrderStoresFiltered = store
          ? firstOrderStoresFiltered + store.name + "; "
          : firstOrderStoresFiltered;
      });
      list.push({
        key: "store_of_first_order_offline_ids",
        name: "Cửa hàng mua đầu (offline)",
        value: firstOrderStoresFiltered,
      });
    }

    if (initialValues.store_of_last_order_offline_ids?.length) {
      let lastOrderStoresFiltered = "";
      initialValues.store_of_last_order_offline_ids.forEach((last_order_store_id: any) => {
        const store = listStore?.find(
          (item) => item.id?.toString() === last_order_store_id?.toString(),
        );
        lastOrderStoresFiltered = store
          ? lastOrderStoresFiltered + store.name + "; "
          : lastOrderStoresFiltered;
      });
      list.push({
        key: "store_of_last_order_offline_ids",
        name: "Cửa hàng mua cuối (offline)",
        value: lastOrderStoresFiltered,
      });
    }

    if (initialValues.source_of_first_order_online_ids?.length) {
      let sourcesFiltered = "";
      initialValues.source_of_first_order_online_ids.forEach((source_id: any) => {
        const source = listSource?.find((item) => item.id?.toString() === source_id?.toString());
        sourcesFiltered = source ? sourcesFiltered + source.name + "; " : sourcesFiltered;
      });
      list.push({
        key: "source_of_first_order_online_ids",
        name: "Nguồn mua đầu (online)",
        value: sourcesFiltered,
      });
    }

    if (initialValues.source_of_last_order_online_ids?.length) {
      let sourcesFiltered = "";
      initialValues.source_of_last_order_online_ids.forEach((source_id: any) => {
        const source = listSource?.find((item) => item.id?.toString() === source_id?.toString());
        sourcesFiltered = source ? sourcesFiltered + source.name + "; " : sourcesFiltered;
      });
      list.push({
        key: "source_of_last_order_online_ids",
        name: "Nguồn mua cuối (online)",
        value: sourcesFiltered,
      });
    }

    if (initialValues.first_order_type) {
      let firstOrderType;
      if (initialValues.first_order_type.toLowerCase() === "online") {
        firstOrderType = "Online";
      } else {
        firstOrderType = "Offline";
      }
      list.push({
        key: "first_order_type",
        name: "Loại mua đầu",
        value: firstOrderType,
      });
    }

    if (initialValues.last_order_type) {
      let lastOrderType;
      if (initialValues.last_order_type.toLowerCase() === "online") {
        lastOrderType = "Online";
      } else {
        lastOrderType = "Offline";
      }
      list.push({
        key: "last_order_type",
        name: "Loại mua cuối",
        value: lastOrderType,
      });
    }

    if (
      !isNullOrUndefined(initialValues.number_of_days_without_purchase_from) ||
      !isNullOrUndefined(initialValues.number_of_days_without_purchase_to)
    ) {
      let daysWithoutPurchaseFiltered =
        (isNullOrUndefined(initialValues.number_of_days_without_purchase_from)
          ? ""
          : formatCurrency(initialValues.number_of_days_without_purchase_from)) +
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

    if (initialValues.first_order_time_from || initialValues.first_order_time_to) {
      let firstOrderDateFiltered =
        (initialValues.first_order_time_from
          ? formatDateFilter(initialValues.first_order_time_from)?.format(DATE_FORMAT.DDMMYYY)
          : "") +
        " ~ " +
        (initialValues.first_order_time_to
          ? formatDateFilter(initialValues.first_order_time_to)?.format(DATE_FORMAT.DDMMYYY)
          : "");
      list.push({
        key: "first_order_date",
        name: "Ngày mua đầu",
        value: firstOrderDateFiltered,
      });
    }

    if (initialValues.last_order_time_from || initialValues.last_order_time_to) {
      let lastOrderDateFiltered =
        (initialValues.last_order_time_from
          ? formatDateFilter(initialValues.last_order_time_from)?.format(DATE_FORMAT.DDMMYYY)
          : "") +
        " ~ " +
        (initialValues.last_order_time_to
          ? formatDateFilter(initialValues.last_order_time_to)?.format(DATE_FORMAT.DDMMYYY)
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
        (isNullOrUndefined(initialValues.point_to) ? "" : formatCurrency(initialValues.point_to));
      list.push({
        key: "point",
        name: "Điểm",
        value: pointFiltered,
      });
    }

    /**
     * Web/App customer
     */
    if (initialValues.utm_source && initialValues.utm_source.length !== 0) {
      list.push({
        key: "utm_source",
        name: "UTM_Source",
        value: initialValues.utm_source,
      });
    }

    if (initialValues.utm_medium && initialValues.utm_medium.length !== 0) {
      list.push({
        key: "utm_medium",
        name: "UTM_Medium",
        value: initialValues.utm_medium,
      });
    }
    if (initialValues.utm_content && initialValues.utm_content.length !== 0) {
      list.push({
        key: "utm_content",
        name: "UTM_content",
        value: initialValues.utm_content,
      });
    }
    if (initialValues.utm_term && initialValues.utm_term.length !== 0) {
      list.push({
        key: "utm_term",
        name: "UTM_term",
        value: initialValues.utm_term,
      });
    }
    if (initialValues.utm_id && initialValues.utm_id.length !== 0) {
      list.push({
        key: "utm_id",
        name: "UTM_id",
        value: initialValues.utm_id,
      });
    }
    if (initialValues.utm_campaign && initialValues.utm_campaign.length !== 0) {
      list.push({
        key: "utm_campaign",
        name: "UTM_campagin",
        value: initialValues.utm_campaign,
      });
    }

    return list;
  }, [
    initialValues.gender,
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
    initialValues.wedding_day_from,
    initialValues.wedding_day_to,
    initialValues.wedding_month_from,
    initialValues.wedding_month_to,
    initialValues.wedding_year_from,
    initialValues.wedding_year_to,
    initialValues.channel_ids,
    initialValues.source_ids,
    initialValues.source_of_first_order_online_ids,
    initialValues.source_of_last_order_online_ids,
    initialValues.first_order_type,
    initialValues.last_order_type,
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
    initialValues.store_of_first_order_offline_ids,
    initialValues.store_of_last_order_offline_ids,
    initialValues.number_of_days_without_purchase_from,
    initialValues.number_of_days_without_purchase_to,
    initialValues.first_order_time_from,
    initialValues.first_order_time_to,
    initialValues.last_order_time_from,
    initialValues.last_order_time_to,
    initialValues.point_from,
    initialValues.point_to,
    initialValues.utm_campaign,
    initialValues.utm_content,
    initialValues.utm_id,
    initialValues.utm_medium,
    initialValues.utm_source,
    initialValues.utm_term,
    LIST_GENDER,
    groups,
    loyaltyUsageRules,
    accountDataFiltered,
    types,
    listStore,
    listChannel,
    listSource,
    provincesList,
    districtsList,
    wardsList,
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
          break;
        case "store_ids":
          onFilter && onFilter({ ...params, store_ids: [] });
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
        case "wedding_day":
          onFilter &&
            onFilter({
              ...params,
              wedding_day_from: null,
              wedding_day_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            wedding_day_from: null,
            wedding_day_to: null,
          });
          break;
        case "wedding_month":
          onFilter &&
            onFilter({
              ...params,
              wedding_month_from: null,
              wedding_month_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            wedding_month_from: null,
            wedding_month_to: null,
          });
          break;
        case "wedding_year":
          onFilter &&
            onFilter({
              ...params,
              wedding_year_from: null,
              wedding_year_to: null,
            });
          formCustomerFilter?.setFieldsValue({
            wedding_year_from: null,
            wedding_year_to: null,
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
        case "store_of_first_order_offline_ids":
          onFilter && onFilter({ ...params, store_of_first_order_offline_ids: [] });
          break;
        case "store_of_last_order_offline_ids":
          onFilter && onFilter({ ...params, store_of_last_order_offline_ids: [] });
          break;
        case "source_of_first_order_online_ids":
          onFilter && onFilter({ ...params, source_of_first_order_online_ids: [] });
          formCustomerFilter?.setFieldsValue({
            source_of_first_order_online_ids: [],
          });
          break;
        case "source_of_last_order_online_ids":
          onFilter && onFilter({ ...params, source_of_last_order_online_ids: [] });
          formCustomerFilter?.setFieldsValue({
            source_of_last_order_online_ids: [],
          });
          break;
        case "first_order_type":
          onFilter && onFilter({ ...params, first_order_type: null });
          formCustomerFilter?.setFieldsValue({ first_order_type: null });
          break;
        case "last_order_type":
          onFilter && onFilter({ ...params, last_order_type: null });
          formCustomerFilter?.setFieldsValue({ last_order_type: null });
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
          setFirstDateStart(null);
          setFirstDateEnd(null);
          onFilter &&
            onFilter({
              ...params,
              first_order_time_from: null,
              first_order_time_to: null,
            });
          break;
        case "last_order_date":
          setLastOrderDateClick("");
          setLastDateStart(null);
          setLastDateEnd(null);
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
        case "utm_source":
          onFilter && onFilter({ ...params, utm_source: null });
          break;
        case "utm_medium":
          onFilter && onFilter({ ...params, utm_medium: null });
          break;
        case "utm_content":
          onFilter && onFilter({ ...params, utm_content: null });
          break;
        case "utm_term":
          onFilter && onFilter({ ...params, utm_term: null });
          break;
        case "utm_id":
          onFilter && onFilter({ ...params, utm_id: null });
          break;
        case "utm_campaign":
          onFilter && onFilter({ ...params, utm_campaign: null });
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
    ],
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
      const year_of_birth_to = values.year_of_birth_to ? values.year_of_birth_to : THIS_YEAR;

      const startDate = new Date(
        month_of_birth_from?.toString() +
          "/" +
          day_of_birth_from?.toString() +
          "/" +
          year_of_birth_from?.toString(),
      );
      const endDate = new Date(
        month_of_birth_to?.toString() +
          "/" +
          day_of_birth_to?.toString() +
          "/" +
          year_of_birth_to?.toString(),
      );

      return startDate <= endDate;
    }
    return true;
  }, [formCustomerFilter]);

  const validateWeddingDayFilter = useCallback(() => {
    const values = formCustomerFilter.getFieldsValue();
    if (
      values.wedding_day_from > values.wedding_day_to &&
      !values.wedding_month_from &&
      !values.wedding_month_to &&
      (values.wedding_year_from || values.wedding_year_to)
    ) {
      return false;
    }

    if (
      values.wedding_day_from ||
      values.wedding_day_to ||
      values.wedding_month_from ||
      values.wedding_month_to ||
      values.wedding_year_from ||
      values.wedding_year_to
    ) {
      const wedding_day_from = values.wedding_day_from
        ? values.wedding_day_from
        : values.wedding_day_to
        ? START_DAY
        : TODAY_VALUE;
      const wedding_day_to = values.wedding_day_to
        ? values.wedding_day_to
        : values.wedding_day_from
        ? END_DAY
        : TODAY_VALUE;

      const wedding_month_from = values.wedding_month_from
        ? values.wedding_month_from
        : values.wedding_month_to
        ? START_MONTH
        : THIS_MONTH_VALUE;
      const wedding_month_to = values.wedding_month_to
        ? values.wedding_month_to
        : values.wedding_month_from
        ? END_MONTH
        : THIS_MONTH_VALUE;

      const wedding_year_from = values.wedding_year_from
        ? values.wedding_year_from
        : values.wedding_year_to
        ? START_YEAR
        : THIS_YEAR;
      const wedding_year_to = values.wedding_year_to ? values.wedding_year_to : THIS_YEAR;

      const startDate = new Date(
        wedding_month_from?.toString() +
          "/" +
          wedding_day_from?.toString() +
          "/" +
          wedding_year_from?.toString(),
      );
      const endDate = new Date(
        wedding_month_to?.toString() +
          "/" +
          wedding_day_to?.toString() +
          "/" +
          wedding_year_to?.toString(),
      );

      return startDate <= endDate;
    }
    return true;
  }, [formCustomerFilter]);

  const onFilterClick = useCallback(async () => {
    const isValidBirthday = validateBirthdayFilter();
    if (!isValidBirthday) {
      showError(
        "Trường ngày, tháng, năm sinh nhật bắt đầu lớn hơn kết thúc. Vui lòng kiểm tra lại!",
      );
      return;
    }

    if (!validateWeddingDayFilter()) {
      showError(
        "Trường ngày, tháng, năm ngày cưới bắt đầu lớn hơn kết thúc. Vui lòng kiểm tra lại!",
      );
      return;
    }

    let isValidForm = true;

    await formCustomerFilter
      .validateFields()
      .then()
      .catch(() => {
        isValidForm = false;
      });

    if (isValidForm) {
      setVisibleBaseFilter(false);
      formCustomerFilter?.submit();
    } else {
      showError("Trường dữ liệu nhập vào chưa đúng. Vui lòng kiểm tra lại!");
    }
  }, [formCustomerFilter, validateBirthdayFilter, validateWeddingDayFilter]);

  // clear advanced filter
  const onClearAdvancedFilter = useCallback(() => {
    clearFirstOrderDate();
    clearLastOrderDate();
    setAccountData(initPublicAccounts);

    setVisibleBaseFilter(false);
    formCustomerFilter.setFieldsValue(initQuery);
    onClearFilter && onClearFilter();

    handleClearFilterConfig();
  }, [formCustomerFilter, handleClearFilterConfig, initPublicAccounts, initQuery, onClearFilter]);
  // end clear advanced filter
  // end handle filter action

  // handle district_ids param: if it's filtered by wards then params will not include district_ids
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setDistrictIdParam = () => {
    let tempDistrictListSelected = [...districtListSelected];
    wardListSelected.forEach((ward) => {
      tempDistrictListSelected = tempDistrictListSelected?.filter(
        (district: any) => district.id !== ward.district_id,
      );
    });

    let districtIdParam: any[] = [];
    tempDistrictListSelected.forEach((district) => {
      districtIdParam.push(district.id);
    });
    return districtIdParam;
  };

  // handle city_ids param: if it's filtered by districts then params will not include city_ids
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setCityIdParam = () => {
    let tempProvinceListSelected = [...provinceListSelected];
    districtListSelected.forEach((district) => {
      tempProvinceListSelected = tempProvinceListSelected.filter(
        (city: any) => city.id !== district.city_id,
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
        // city_ids: setCityIdParam(),
        // district_ids: setDistrictIdParam(),
        responsible_staff_codes: values.responsible_staff_codes
          ? values.responsible_staff_codes.split(" - ")[0]
          : null,
        first_order_time_from: firstDateStart,
        first_order_time_to: firstDateEnd,
        last_order_time_from: lastDateStart,
        last_order_time_to: lastDateEnd,
      };

      onFilter && onFilter(formValues);
    },
    [firstDateEnd, firstDateStart, lastDateEnd, lastDateStart, onFilter],
  );

  const actionList = [
    {
      name: "Tặng điểm",
      type: "ADD_POINT",
    },
    {
      name: "Trừ điểm",
      type: "SUBTRACT_POINT",
    },

    {
      name: "Tặng tiền tích lũy",
      type: "ADD_MONEY",
    },
    {
      name: "Trừ tiền tích lũy",
      type: "SUBTRACT_MONEY",
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
        "_blank",
      );
    }
  };

  const dropdownMenuList = (
    <Menu>
      {actionList.map((item) => {
        return (
          <Menu.Item
            key={item.type}
            onClick={() => changeCustomerPoint(item.type)}
            disabled={selectedCustomerIds?.length < 1}
          >
            <span>{item.name}</span>
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const handleSearchOrderSources = useCallback((value:string) => {
  // 	if(value.length > 1) {
  // 	 handleDelayActionWhenInsertTextInSearchInput(sourceInputRef, () => {
  // 		 let query = {
  // 				name: value,
  //         active: true
  // 		 }
  // 		 getSourcesWithParamsService(query).then((response) => {
  // 			 setListSource(response.data.items)
  // 		 }).catch((error) => {
  // 			 console.log('getSourcesWithParamsService fail', error)
  // 		 })
  // 	 })
  // 	} else {
  // 		setListSource(initListSource)
  // 	}
  // }, [initListSource]);

  // handle scroll customer filter page
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
  // end handle scroll customer filter page

  return (
    <StyledCustomerFilter>
      <Form
        form={formCustomerFilter}
        onFinish={onFinish}
        initialValues={initialValues}
        layout="inline"
        className="inline-filter"
      >
        <Dropdown overlay={dropdownMenuList} trigger={["click"]} disabled={isLoading}>
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
          icon={<img style={{ marginBottom: 15 }} src={settingGearIcon} alt="" />}
        />
      </Form>

      <BaseFilter
        onClearFilter={onClearAdvancedFilter}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visibleBaseFilter}
        width={widthScreen()}
        allowSave
        onSaveFilter={onShowSaveFilter}
      >
        <StyledCustomerBaseFilter>
          <Form
            form={formCustomerFilter}
            onFinish={onFinish}
            initialValues={params}
            layout="vertical"
          >
            <div className="base-filter-container">
              {filterConfigs && filterConfigs.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  {filterConfigs?.map((e, index) => {
                    return (
                      <UserCustomFilterTag
                        key={index}
                        tagId={e.id}
                        name={e.name}
                        onSelectFilterConfig={(tagId) => {
                          onSelectFilterConfig(tagId);
                          setVisibleBaseFilter(false);
                        }}
                        setConfigId={setConfigId}
                        setIsShowConfirmDelete={setIsShowConfirmDelete}
                        tagActive={tagActive}
                      />
                    );
                  })}
                </div>
              )}

              <div className="base-filter-row">
                <Form.Item name="gender" label={<b>Giới tính</b>} className="left-filter">
                  <Select
                    showSearch
                    placeholder="Chọn giới tính"
                    allowClear
                    getPopupContainer={(trigger: any) => trigger.parentElement}
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
                  name="customer_group_ids"
                  label={<b>Nhóm khách hàng:</b>}
                  className="center-filter"
                >
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn nhóm khách hàng"
                    getPopupContainer={(trigger: any) => trigger.parentElement}
                    onFocus={onInputSelectFocus}
                    onBlur={onInputSelectBlur}
                    onDropdownVisibleChange={handleOnDropdownVisibleChange}
                    onPopupScroll={handleOnSelectPopupScroll}
                    onMouseLeave={handleOnMouseLeaveSelect}
                    optionFilterProp="children"
                  >
                    {groups.map((group: any) => (
                      <Option key={group.id} value={group.id?.toString()}>
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
                    getPopupContainer={(trigger: any) => trigger.parentElement}
                    onFocus={onInputSelectFocus}
                    onBlur={onInputSelectBlur}
                    onDropdownVisibleChange={handleOnDropdownVisibleChange}
                    onPopupScroll={handleOnSelectPopupScroll}
                    onMouseLeave={handleOnMouseLeaveSelect}
                    placeholder="Chọn hạng thẻ"
                  >
                    {loyaltyUsageRules?.map((loyalty: any) => (
                      <Option key={loyalty.id} value={loyalty.rank_id?.toString()}>
                        {loyalty.rank_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="base-filter-row">
                <Form.Item name="channel_ids" label={<b>Kênh mua hàng</b>} className="left-filter">
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    showArrow
                    allowClear
                    placeholder="Chọn kênh"
                    getPopupContainer={(trigger: any) => trigger.parentElement}
                    onFocus={onInputSelectFocus}
                    onBlur={onInputSelectBlur}
                    onDropdownVisibleChange={handleOnDropdownVisibleChange}
                    onPopupScroll={handleOnSelectPopupScroll}
                    onMouseLeave={handleOnMouseLeaveSelect}
                    optionFilterProp="children"
                  >
                    {listChannel?.map((item) => (
                      <Option key={item.id} value={item.id?.toString()}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="customer_type_ids"
                  label={<b>Loại khách hàng:</b>}
                  className="center-filter"
                >
                  <Select
                    mode="multiple"
                    maxTagCount="responsive"
                    showSearch
                    placeholder="Chọn loại khách hàng"
                    allowClear
                    getPopupContainer={(trigger: any) => trigger.parentElement}
                    optionFilterProp="children"
                  >
                    {types.map((type: any) => (
                      <Option key={type.id} value={type.id?.toString()}>
                        {type.name + ` - ${type.code}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="assign_store_ids"
                  label={<b>Cửa hàng cấp thẻ</b>}
                  className="right-filter"
                >
                  <TreeStore
                    name="assign_store_ids"
                    placeholder="Chọn cửa hàng"
                    listStore={listStore}
                    getPopupContainer={(trigger: any) => trigger.parentElement}
                  />
                </Form.Item>
              </div>

              <div className="base-filter-row">
                <Form.Item name="store_ids" label={<b>Kho cửa hàng</b>} className="left-filter">
                  <TreeStore
                    name="store_ids"
                    placeholder="Chọn cửa hàng"
                    listStore={listStore}
                    getPopupContainer={(trigger: any) => trigger.parentElement}
                  />
                </Form.Item>

                <Form.Item
                  name="source_ids"
                  label={<b>Nguồn mua hàng</b>}
                  className="center-filter"
                >
                  <TreeSource placeholder="Chọn nguồn" name="source_ids" listSource={listSource} />
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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Đến"
                        maxLength={15}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="base-filter-row">
                <div className="left-filter">
                  <div className="title">Ngày cưới</div>
                  <div className="select-scope">
                    <Form.Item name="wedding_day_from" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
                        placeholder="Từ ngày"
                      >
                        {INIT_FROM_DATE_LIST.map((item: any) => (
                          <Option key={item.value} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item name="wedding_day_to" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
                        placeholder="Đến ngày"
                      >
                        {INIT_TO_DATE_LIST.map((item: any) => (
                          <Option key={item.value} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                <div className="center-filter">
                  <div className="title">Tháng cưới</div>
                  <div className="select-scope">
                    <Form.Item name="wedding_month_from" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Từ tháng"
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
                      >
                        {INIT_FROM_MONTH_LIST.map((item: any) => (
                          <Option key={item.value} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <img src={rightArrow} alt="" />

                    <Form.Item name="wedding_month_to" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
                        placeholder="Đến tháng"
                      >
                        {INIT_TO_MONTH_LIST.map((item: any) => (
                          <Option key={item.value} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                {/* Lọc theo năm sinh */}
                <div className="right-filter">
                  <div className="title">Năm cưới</div>
                  <div className="select-scope">
                    <Form.Item name="wedding_year_from" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Từ năm"
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
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

                    <Form.Item name="wedding_year_to" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Đến năm"
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
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
                <div className="left-filter">
                  <div className="title">Ngày sinh</div>
                  <div className="select-scope">
                    <Form.Item name="day_of_birth_from" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
                        placeholder="Từ ngày"
                      >
                        {INIT_FROM_DATE_LIST.map((item: any) => (
                          <Option key={item.value} value={item.value} disabled={item.disable}>
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
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
                        placeholder="Đến ngày"
                      >
                        {INIT_TO_DATE_LIST.map((item: any) => (
                          <Option key={item.value} value={item.value} disabled={item.disable}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                <div className="center-filter">
                  <div className="title">Tháng sinh</div>
                  <div className="select-scope">
                    <Form.Item name="month_of_birth_from" className="select-item">
                      <Select
                        showSearch
                        allowClear
                        placeholder="Từ tháng"
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
                      >
                        {INIT_FROM_MONTH_LIST.map((item: any) => (
                          <Option key={item.value} value={item.value} disabled={item.disable}>
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
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
                        placeholder="Đến tháng"
                      >
                        {INIT_TO_MONTH_LIST.map((item: any) => (
                          <Option key={item.value} value={item.value} disabled={item.disable}>
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
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
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
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        onFocus={onInputSelectFocus}
                        onBlur={onInputSelectBlur}
                        onDropdownVisibleChange={handleOnDropdownVisibleChange}
                        onPopupScroll={handleOnSelectPopupScroll}
                        onMouseLeave={handleOnMouseLeaveSelect}
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
                      getPopupContainer={(trigger: any) => trigger.parentElement}
                      onFocus={onInputSelectFocus}
                      onBlur={onInputSelectBlur}
                      onDropdownVisibleChange={handleOnDropdownVisibleChange}
                      onPopupScroll={handleOnSelectPopupScroll}
                      onMouseLeave={handleOnMouseLeaveSelect}
                      onSelect={handleSelectProvince}
                      onDeselect={handleDeselectProvince}
                      onClear={handleClearProvince}
                    >
                      {provincesList?.map((item: any) => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item
                  name="responsible_staff_codes"
                  label="Nhân viên phụ trách"
                  className="center-filter"
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
                      getPopupContainer={(trigger: any) => trigger.parentElement}
                      onFocus={onInputSelectFocus}
                      onBlur={onInputSelectBlur}
                      onDropdownVisibleChange={handleOnDropdownVisibleChange}
                      onPopupScroll={handleOnSelectPopupScroll}
                      onMouseLeave={handleOnMouseLeaveSelect}
                      maxTagCount="responsive"
                      onSelect={handleSelectDistrict}
                      onDeselect={handleDeselectDistrict}
                      onClear={handleClearDistrict}
                    >
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
                        ]}
                      >
                        <CustomNumberInput
                          format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                        ]}
                      >
                        <CustomNumberInput
                          format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                        ]}
                      >
                        <CustomNumberInput
                          format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                        ]}
                      >
                        <CustomNumberInput
                          format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                      getPopupContainer={(trigger: any) => trigger.parentElement}
                      onFocus={onInputSelectFocus}
                      onBlur={onInputSelectBlur}
                      onDropdownVisibleChange={handleOnDropdownVisibleChange}
                      onPopupScroll={handleOnSelectPopupScroll}
                      onMouseLeave={handleOnMouseLeaveSelect}
                      maxTagCount="responsive"
                      onSelect={handleSelectWard}
                      onDeselect={handleDeselectWard}
                      onClear={handleClearWard}
                    >
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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                  name="store_of_first_order_offline_ids"
                  label={
                    <Tooltip title={"Cửa hàng mua offline đầu của KH"}>
                      <b>Cửa hàng mua đầu (offline)</b>
                    </Tooltip>
                  }
                  className="left-filter"
                >
                  <TreeStore
                    name="store_of_first_order_offline_ids"
                    placeholder="Chọn cửa hàng"
                    listStore={listStore}
                    getPopupContainer={(trigger: any) => trigger.parentElement}
                  />
                </Form.Item>

                <Form.Item
                  name="store_of_last_order_offline_ids"
                  label={
                    <Tooltip title={"Cửa hàng mua offline cuối của KH"}>
                      <b>Cửa hàng mua cuối (offline)</b>
                    </Tooltip>
                  }
                  className="center-filter"
                >
                  <TreeStore
                    name="store_of_last_order_offline_ids"
                    placeholder="Chọn cửa hàng"
                    listStore={listStore}
                    getPopupContainer={(trigger: any) => trigger.parentElement}
                  />
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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Đến"
                        maxLength={8}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="base-filter-row">
                <Form.Item
                  name="source_of_first_order_online_ids"
                  label={
                    <Tooltip title={"Nguồn mua online đầu của KH"}>
                      <b>Nguồn mua đầu (online)</b>
                    </Tooltip>
                  }
                  className="left-filter"
                >
                  <TreeSource
                    placeholder="Chọn cửa hàng"
                    name="source_of_first_order_online_ids"
                    listSource={listSource}
                  />
                </Form.Item>

                <Form.Item
                  name="source_of_last_order_online_ids"
                  label={
                    <Tooltip title={"Nguồn mua online cuối của KH"}>
                      <b>Nguồn mua cuối (online)</b>
                    </Tooltip>
                  }
                  className="center-filter"
                >
                  <TreeSource
                    placeholder="Chọn cửa hàng"
                    name="source_of_last_order_online_ids"
                    listSource={listSource}
                  />
                </Form.Item>

                <div className="right-filter">
                  <div className="select-scope">
                    <Form.Item
                      name="first_order_type"
                      label={
                        <Tooltip title={"Loại mua đầu: online hoặc offline"}>
                          <b>Loại mua đầu</b>
                        </Tooltip>
                      }
                      className="select-item"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn loại"
                        allowClear
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        optionFilterProp="children"
                      >
                        <Option key={"online"} value={"online"}>
                          Online
                        </Option>
                        <Option key={"offline"} value={"offline"}>
                          Offline
                        </Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="last_order_type"
                      label={
                        <Tooltip title={"Loại mua cuối: online hoặc offline"}>
                          <b>Loại mua cuối</b>
                        </Tooltip>
                      }
                      className="select-item"
                    >
                      <Select
                        showSearch
                        placeholder="Chọn loại"
                        allowClear
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                        optionFilterProp="children"
                      >
                        <Option key={"online"} value={"online"}>
                          Online
                        </Option>
                        <Option key={"offline"} value={"offline"}>
                          Offline
                        </Option>
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="base-filter-row">
                <div className="left-filter">
                  <div style={{ marginBottom: "8px"}}><b>Ngày mua đầu</b></div>
                  <FilterDateCustomerCustom
                    fieldNameFrom="first_order_time_from"
                    fieldNameTo="first_order_time_to"
                    dateType="firstOrderDate"
                    clickOptionDate={clickOptionDate}
                    dateSelected={firstOrderDateClick}
                    startDate={firstDateStart}
                    endDate={firstDateEnd}
                    handleSelectDateStart={handleFirstPurchaseDateStart}
                    handleSelectDateEnd={handleFirstPurchaseDateEnd}
                  />
                </div>

                <div className="center-filter">
                  <div style={{ marginBottom: "8px"}}><b>Ngày mua cuối</b></div>
                  <FilterDateCustomerCustom
                    fieldNameFrom="last_order_time_from"
                    fieldNameTo="last_order_time_to"
                    dateType="lastOrderDate"
                    clickOptionDate={clickOptionDate}
                    dateSelected={lastOrderDateClick}
                    startDate={lastDateStart}
                    endDate={lastDateEnd}
                    handleSelectDateStart={handleLastPurchaseDateStart}
                    handleSelectDateEnd={handleLastPurchaseDateEnd}
                  />
                </div>

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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
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
                      ]}
                    >
                      <CustomNumberInput
                        format={(a: string) => formatCurrencyNotDefaultValue(a)}
                        revertFormat={(a: string) => replaceFormatString(a)}
                        placeholder="Đến"
                        maxLength={6}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <React.Fragment>
                <Row
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <Switch
                    size="small"
                    onChange={(value) => {
                      setVisibleUTM(value);
                    }}
                    checked={visibleUTM}
                  />
                  <span style={{ paddingLeft: "10px", fontWeight: "bold" }}>
                    Khách hàng Web/App
                  </span>
                </Row>
                {visibleUTM && (
                  <React.Fragment>
                    <div className="base-filter-row">
                      <Item label="UTM_Source" name="utm_source" className="left-filter">
                        <Input placeholder="..." />
                      </Item>

                      <Item label="UTM_Medium" name="utm_medium" className="center-filter">
                        <Input placeholder="..." />
                      </Item>

                      <Item label="UTM_content" name="utm_content" className="right-filter">
                        <Input placeholder="..." />
                      </Item>
                    </div>

                    <div className="base-filter-row">
                      <Item label="UTM_term" name="utm_term" className="left-filter">
                        <Input placeholder="..." />
                      </Item>

                      <Item label="UTM_id" name="utm_id" className="center-filter">
                        <Input placeholder="..." />
                      </Item>

                      <Item label="UTM_campagin" name="utm_campaign" className="right-filter">
                        <Input placeholder="..." />
                      </Item>
                    </div>
                  </React.Fragment>
                )}
              </React.Fragment>
            </div>
          </Form>
        </StyledCustomerBaseFilter>
      </BaseFilter>

      <FilterConfigModal
        setVisible={setIsShowModalSaveFilter}
        visible={isShowModalSaveFilter}
        onOk={(formValues) => {
          setIsShowModalSaveFilter(false);
          onSaveFilter(formValues);
        }}
        filterConfigs={filterConfigs}
      />

      <ModalDeleteConfirm
        visible={isShowConfirmDelete}
        onOk={onMenuDeleteConfigFilter}
        onCancel={() => setIsShowConfirmDelete(false)}
        title="Xác nhận"
        subTitle={
          <span>
            Bạn có chắc muốn xóa bộ lọc{" "}
            <strong>
              "{filterConfigs.find((single) => single.id === configId)?.name || null}"
            </strong>
          </span>
        }
      />

      <div className="filter-tags">
        {filters?.map((filter: any) => {
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
