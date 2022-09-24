import { Button, Col, Form, FormInstance, Input, Row, Tag } from "antd";
import React from "react";

import { FilterOutlined, SettingOutlined } from "@ant-design/icons";
import search from "assets/img/search.svg";
import BaseResponse from "base/base.response";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import CustomSelect from "component/custom/select.custom";
import FilterConfigModal from "component/modal/FilterConfigModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import TreeStore from "component/tree-node/tree-store";
import TreeSource from "component/treeSource";
import UrlConfig from "config/url.config";
import { getListChannelRequest } from "domain/actions/order/order.action";
import useHandleFilterConfigs from "hook/useHandleFilterConfigs";
import { AccountResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { OrderTypeModel } from "model/order/order.model";
import { ReturnSearchQuery } from "model/order/return.model";
import { FilterConfig } from "model/other";
import { SourceResponse } from "model/response/order/source.response";
import { ChannelResponse } from "model/response/product/channel.response";
import { createRef, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { getSourcesWithParamsService } from "service/order/order.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { FILTER_CONFIG_TYPE, POS } from "utils/Constants";
import { DATE_FORMAT, formatDateFilter } from "utils/DateUtils";
import { ORDER_TYPES } from "utils/Order.constants";
import { formatDateTimeOrderFilter, getTimeFormatOrderFilterTag } from "utils/OrderUtils";
import BaseFilter from "./base.filter";
import "./order.filter.scss";
import UserCustomFilterTag from "./UserCustomFilterTag";
import SearchProductComponent from "component/search-product";
import { VariantResponse } from "model/product/product.model";

type ReturnFilterProps = {
  params: ReturnSearchQuery;
  actions: Array<MenuAction>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse> | undefined;
  accounts: Array<AccountResponse>;
  reasons: Array<{ id: number; name: string }>;
  isLoading?: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: ReturnSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
  setListSource?: (values: SourceResponse[]) => void;
  orderType: OrderTypeModel;
};

const { Item } = Form;
var initialValueExchange = {};

const ReturnFilter: React.FC<ReturnFilterProps> = (props: ReturnFilterProps) => {
  const {
    params,
    actions,
    listStore,
    listSource,
    reasons,
    isLoading,
    accounts,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
    setListSource,
    orderType,
  } = props;
  const [visible, setVisible] = useState(false);
  const [rerender, setRerender] = useState(false);

  const loadingFilter = useMemo(() => {
    return isLoading ? true : false;
  }, [isLoading]);

  const dateFormat = DATE_FORMAT.DD_MM_YY_HHmmss;
  const timeFormat = DATE_FORMAT.HH_mm;

  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const [keySearchVariant, setKeySearchVariant] = useState("");

  const onFilterClick = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  const openFilter = useCallback(() => {
    setVisible(true);
    setRerender(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
    // setRerender(false);
  }, []);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick],
  );

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      setRerender(false);
      switch (tag.key) {
        case "store":
          onFilter && onFilter({ ...params, store_ids: [] });
          break;

        case "created":
          setCreatedClick("");
          onFilter && onFilter({ ...params, created_on_min: null, created_on_max: null });
          break;
        case "received":
          setReceivedClick("");
          onFilter &&
            onFilter({
              ...params,
              received_on_min: null,
              received_on_max: null,
            });
          break;
        case "reason_ids":
          onFilter && onFilter({ ...params, reason_ids: [] });
          break;
        case "is_received":
          onFilter && onFilter({ ...params, is_received: [] });
          break;
        case "payment_status":
          onFilter && onFilter({ ...params, payment_status: [] });
          break;
        case "source":
          onFilter && onFilter({ ...params, source_ids: [] });
          break;
        case "channel_codes":
          onFilter && onFilter({ ...params, channel_codes: [] });
          break;
        case "assignee_codes":
          onFilter && onFilter({ ...params, assignee_codes: [] });
          break;
        case "marketer_codes":
          onFilter && onFilter({ ...params, marketer_codes: [] });
          break;
        case "account_codes":
          onFilter && onFilter({ ...params, account_codes: [] });
          break;
        case "searched_product":
          onFilter && onFilter({ ...params, searched_product: null });
          setKeySearchVariant("");
          break;
        case "coordinator_codes":
          onFilter && onFilter({ ...params, coordinator_codes: [] });
          break;

        default:
          break;
      }
      // const tags = filters.filter((tag: any) => tag.key !== key);
      // filters = tags
    },
    [onFilter, params],
  );
  const [createdClick, setCreatedClick] = useState("");
  const [receivedClick, setReceivedClick] = useState("");

  const initialValues = useMemo(() => {
    return {
      ...params,
      store_ids: Array.isArray(params.store_ids)
        ? params.store_ids.map((i) => Number(i))
        : [Number(params.store_ids)],
      is_received: Array.isArray(params.is_received) ? params.is_received : [params.is_received],
      payment_status: Array.isArray(params.payment_status)
        ? params.payment_status
        : [params.payment_status],
      reason_ids: Array.isArray(params.reason_ids) ? params.reason_ids : [params.reason_ids],
      source_ids: Array.isArray(params.source_ids)
        ? params.source_ids.map((i) => Number(i))
        : [Number(params.source_ids)],
      channel_codes: Array.isArray(params.channel_codes)
        ? params.channel_codes
        : [params.channel_codes],
      assignee_codes: Array.isArray(params.assignee_codes)
        ? params.assignee_codes
        : [params.assignee_codes],
      marketer_codes: Array.isArray(params.marketer_codes)
        ? params.marketer_codes
        : [params.marketer_codes],
      account_codes: Array.isArray(params.account_codes)
        ? params.account_codes
        : [params.account_codes],
      coordinator_codes: Array.isArray(params.coordinator_codes)
        ? params.coordinator_codes
        : [params.coordinator_codes],

      created_on_min: formatDateFilter(params.created_on_min || undefined),
      created_on_max: formatDateFilter(params.created_on_max || undefined),
      received_on_min: formatDateFilter(params.received_on_min || undefined),
      received_on_max: formatDateFilter(params.received_on_max || undefined),
    };
  }, [params]);

  // console.log('initialValues', initialValues)

  const sourcesResult = useMemo(() => {
    if (orderType === ORDER_TYPES.online) {
      return listSource.filter((item) => item.id !== POS.source_id);
    } else {
      return listSource.filter((item) => item.id === POS.source_id);
    }
  }, [listSource, orderType]);

  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);

  const [isReceived, setIsReceived] = useState<any[]>(initialValues.is_received);
  const [paymentStatus, setPaymentStatus] = useState<any[]>(initialValues.payment_status);

  // lưu bộ lọc
  const onShowSaveFilter = useCallback(() => {
    // setModalAction("create");
    let values = formRef.current?.getFieldsValue();
    setFormSearchValuesToSave(values);
    setIsShowModalSaveFilter(true);
  }, [formRef]);

  const onHandleFilterTagSuccessCallback = (res: BaseResponse<FilterConfig>) => {
    setTagActive(res.data.id);
  };

  const filterConfigType =
    orderType === ORDER_TYPES.offline
      ? FILTER_CONFIG_TYPE.orderReturnOffline
      : FILTER_CONFIG_TYPE.orderReturnOnline;

  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);

  const [formSearchValuesToSave, setFormSearchValuesToSave] = useState({});

  const [isShowModalSaveFilter, setIsShowModalSaveFilter] = useState(false);

  const [tagActive, setTagActive] = useState<number | null>();

  const {
    filterConfigs,
    onSaveFilter,
    configId,
    setConfigId,
    handleDeleteFilter,
    onSelectFilterConfig,
  } = useHandleFilterConfigs(
    filterConfigType,
    formRef,
    {
      ...formSearchValuesToSave,
    },
    setTagActive,
    onHandleFilterTagSuccessCallback,
  );

  const onMenuDeleteConfigFilter = () => {
    handleDeleteFilter(configId);
    setIsShowConfirmDelete(false);
  };

  const changeIsReceived = useCallback(
    (status) => {
      let newIsReceived = [...isReceived];
      switch (status) {
        case "true":
          const index1 = newIsReceived.indexOf("true");
          if (index1 > -1) {
            newIsReceived.splice(index1, 1);
          } else {
            newIsReceived.push("true");
          }
          break;
        case "false":
          const index2 = newIsReceived.indexOf("false");
          if (index2 > -1) {
            newIsReceived.splice(index2, 1);
          } else {
            newIsReceived.push("false");
          }
          break;

        default:
          break;
      }
      setIsReceived(newIsReceived);
    },
    [isReceived],
  );

  const changePaymentStatus = useCallback(
    (status) => {
      let newPaymentStatus = [...paymentStatus];

      switch (status) {
        case "unpaid":
          const index1 = newPaymentStatus.indexOf("unpaid");
          if (index1 > -1) {
            newPaymentStatus.splice(index1, 1);
          } else {
            newPaymentStatus.push("unpaid");
          }
          break;
        case "partial_paid":
          const index2 = newPaymentStatus.indexOf("partial_paid");
          if (index2 > -1) {
            newPaymentStatus.splice(index2, 1);
          } else {
            newPaymentStatus.push("partial_paid");
          }
          break;
        case "paid":
          const index = newPaymentStatus.indexOf("paid");
          if (index > -1) {
            newPaymentStatus.splice(index, 1);
          } else {
            newPaymentStatus.push("paid");
          }
          break;
        default:
          break;
      }
      setPaymentStatus(newPaymentStatus);
    },
    [paymentStatus],
  );
  const onFinish = useCallback(
    (values) => {
      let error = false;
      formRef?.current
        ?.getFieldsError(["created_on_min", "created_on_max", "received_on_min", "received_on_max"])
        .forEach((field) => {
          if (field.errors.length) {
            error = true;
          }
        });
      if (!error) {
        setVisible(false);
        const handleTime = (fieldName: keyof ReturnSearchQuery) => {
          return values[fieldName]
            ? values[fieldName]
            : formRefValues
            ? formRefValues[fieldName]
            : params[fieldName];
        };
        const formRefValues = formRef.current?.getFieldsValue();
        const valuesForm = {
          ...values,
          is_received: isReceived,
          payment_status: paymentStatus,
          created_on_min: formatDateTimeOrderFilter(handleTime("created_on_min"), dateFormat),
          created_on_max: formatDateTimeOrderFilter(handleTime("created_on_max"), dateFormat),
          received_on_min: formatDateTimeOrderFilter(handleTime("received_on_min"), dateFormat),
          received_on_max: formatDateTimeOrderFilter(handleTime("received_on_max"), dateFormat),
          searched_product: keySearchVariant,
        };
        onFilter && onFilter(valuesForm);
        setRerender(false);
      }
    },
    [formRef, isReceived, paymentStatus, dateFormat, keySearchVariant, onFilter, params],
  );

  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);
  const [assigneeFound, setAssigneeFound] = useState<Array<AccountResponse>>([]);
  const [accountFound, setAccountFound] = useState<Array<AccountResponse>>([]);
  const [coordinatorFound, setCoordinatorFound] = useState<Array<AccountResponse>>([]);

  useEffect(() => {
    if (params.assignee_codes && params.assignee_codes?.length > 0) {
      searchAccountPublicApi({
        codes: params.assignee_codes,
      }).then((response) => {
        setAssigneeFound(response.data.items);
      });
    }
    if (params.marketer_codes && params.marketer_codes?.length > 0) {
      searchAccountPublicApi({
        codes: params.marketer_codes,
      }).then((response) => {
        setAssigneeFound(response.data.items);
      });
    }
    if (params.account_codes && params.account_codes?.length > 0) {
      searchAccountPublicApi({
        codes: params.account_codes,
      }).then((response) => {
        setAccountFound(response.data.items);
      });
    }

    if (params.coordinator_codes && params.coordinator_codes?.length > 0) {
      searchAccountPublicApi({
        codes: params.coordinator_codes,
      }).then((response) => {
        setCoordinatorFound(response.data.items);
      });
    }
  }, [
    params.assignee_codes,
    params.marketer_codes,
    params.account_codes,
    params.coordinator_codes,
  ]);
  let filters = useMemo(() => {
    const splitCharacter = ", ";

    const renderSplitCharacter = (index: number, mappedArray: any[]) => {
      let result = null;
      if (index !== mappedArray.length - 1) {
        result = <React.Fragment>{splitCharacter}</React.Fragment>;
      }
      return result;
    };

    const getFilterString = (
      mappedArray: any[] | undefined,
      keyValue: string,
      endPoint?: string,
      objectLink?: string,
      type?: string,
    ) => {
      let result = null;
      if (!mappedArray) {
        return null;
      }
      if (type === "account_codes" || type === "assignee_codes" || type === "marketer_codes") {
        result = mappedArray.map((single, index) => {
          return (
            <Link to={`${UrlConfig.ACCOUNTS}/${single.code}`} target="_blank" key={single.code}>
              {single.code} - {single.full_name}
              {renderSplitCharacter(index, mappedArray)}
            </Link>
          );
        });
      } else {
        result = mappedArray.map((single, index) => {
          if (objectLink && endPoint && single[objectLink]) {
            return (
              <Link to={`${endPoint}/${single[objectLink]}`} target="_blank" key={single[keyValue]}>
                {single[keyValue]}
                {renderSplitCharacter(index, mappedArray)}
              </Link>
            );
          }
          return (
            <React.Fragment>
              {single[keyValue]}
              {renderSplitCharacter(index, mappedArray)}
            </React.Fragment>
          );
        });
      }
      return <React.Fragment>{result}</React.Fragment>;
    };
    let list = [];
    if (initialValues.store_ids.length) {
      let mappedStores = listStore?.filter((store) =>
        initialValues.store_ids?.some((single) => single.toString() === store.id.toString()),
      );
      let text = getFilterString(mappedStores, "name", UrlConfig.STORE, "id");
      list.push({
        key: "store",
        name: "Cửa hàng",
        value: text,
      });
    }
    if (initialValues.reason_ids.length) {
      let textReason = "";
      initialValues.reason_ids.forEach((reason_id) => {
        const reason = reasons?.find((reason) => reason.id.toString() === reason_id);
        textReason = reason
          ? textReason + `${initialValues.reason_ids.length > 1 ? reason.name + ";" : reason.name}`
          : textReason;
      });
      list.push({
        key: "reason_ids",
        name: "Lý do trả hàng",
        value: textReason,
      });
    }
    if (initialValues.is_received.length) {
      let textReceived = "";
      initialValues.is_received.forEach((received) => {
        const text = received === "true" ? "Đã nhận hàng;" : "Chưa nhận hàng;";
        textReceived = textReceived + text;
      });
      list.push({
        key: "is_received",
        name: "Trạng thái nhận hàng",
        value: textReceived,
      });
    }
    if (initialValues.payment_status.length) {
      let paymentStt = "";
      const payments = [
        { name: "Chưa hoàn tiền", value: "unpaid" },
        { name: "Hoàn tiền một phần", value: "partial_paid" },
        { name: "Đã hoàn tiền", value: "paid" },
      ];
      initialValues.payment_status.forEach((status) => {
        const findStatus = payments.find((item) => item.value === status);
        paymentStt = findStatus ? paymentStt + findStatus.name + "; " : paymentStt;
      });
      list.push({
        key: "payment_status",
        name: "Trạng thái hoàn tiền",
        value: paymentStt,
      });
    }
    if (initialValues.created_on_min || initialValues.created_on_max) {
      let textOrderCreatedDate =
        (initialValues.created_on_min
          ? getTimeFormatOrderFilterTag(initialValues.created_on_min, dateFormat)
          : "??") +
        " ~ " +
        (initialValues.created_on_max
          ? getTimeFormatOrderFilterTag(initialValues.created_on_max, dateFormat)
          : "??");
      list.push({
        key: "created",
        name: "Ngày tạo đơn",
        value: textOrderCreatedDate,
      });
    }

    if (initialValues.received_on_min || initialValues.received_on_max) {
      let textOrderReceivedDate =
        (initialValues.received_on_min
          ? getTimeFormatOrderFilterTag(initialValues.received_on_min, dateFormat)
          : "??") +
        " ~ " +
        (initialValues.received_on_max
          ? getTimeFormatOrderFilterTag(initialValues.received_on_max, dateFormat)
          : "??");
      list.push({
        key: "received",
        name: "Ngày nhận hàng",
        value: textOrderReceivedDate,
      });
    }

    if (initialValues.source_ids.length) {
      let textSource = "";
      initialValues.source_ids.forEach((source_id) => {
        const channel = listSource?.find((source) => source.id.toString() === source_id.toString());
        textSource = channel ? textSource + channel.name + "; " : textSource;
      });
      list.push({
        key: "source",
        name: "Nguồn",
        value: textSource,
      });
    }
    if (initialValues.channel_codes.length) {
      let textChannel = "";
      initialValues.channel_codes.forEach((channel_code) => {
        const channel = listChannel?.find((channel) => channel.code.toString() === channel_code);
        textChannel = channel ? textChannel + channel.name + "; " : textChannel;
      });
      list.push({
        key: "channel_codes",
        name: "Kênh bán hàng",
        value: textChannel,
      });
    }

    if (initialValues.assignee_codes.length) {
      let text = getFilterString(
        assigneeFound,
        "full_name",
        UrlConfig.ACCOUNTS,
        "code",
        "assignee_codes",
      );
      list.push({
        key: "assignee_codes",
        name: "Nhân viên bán hàng",
        value: text,
      });
    }
    if (initialValues.marketer_codes.length) {
      let text = getFilterString(
        assigneeFound,
        "full_name",
        UrlConfig.ACCOUNTS,
        "code",
        "marketer_codes",
      );
      list.push({
        key: "marketer_codes",
        name: "Nhân viên marketing",
        value: text,
      });
    }
    if (initialValues.account_codes.length) {
      let text = getFilterString(
        accountFound,
        "full_name",
        UrlConfig.ACCOUNTS,
        "code",
        "account_codes",
      );
      list.push({
        key: "account_codes",
        name: "Nhân viên tạo đơn",
        value: text,
      });
    }
    if (initialValues?.searched_product && initialValues?.searched_product.length > 0) {
      list.push({
        key: "searched_product",
        name: "Mã sản phẩm",
        value: initialValues?.searched_product,
      });
    }

    if (initialValues.coordinator_codes && initialValues.coordinator_codes.length > 0) {
      let text = getFilterString(
        coordinatorFound,
        "full_name",
        UrlConfig.ACCOUNTS,
        "code",
        "coordinator_codes",
      );
      list.push({
        key: "coordinator_codes",
        name: "Nhân viên điều phối",
        value: text,
      });
    }

    return list;
  }, [
    initialValues.store_ids,
    initialValues.reason_ids,
    initialValues.is_received,
    initialValues.payment_status,
    initialValues.created_on_min,
    initialValues.created_on_max,
    initialValues.received_on_min,
    initialValues.received_on_max,
    initialValues.source_ids,
    initialValues.channel_codes,
    initialValues.assignee_codes.length,
    initialValues.marketer_codes.length,
    initialValues.account_codes.length,
    initialValues?.searched_product,
    initialValues.coordinator_codes,
    listStore,
    reasons,
    dateFormat,
    listSource,
    listChannel,
    assigneeFound,
    accountFound,
    coordinatorFound,
  ]);
  const widthScreen = () => {
    if (window.innerWidth >= 1600) {
      return 1400;
    } else if (window.innerWidth < 1600 && window.innerWidth >= 1200) {
      return 1000;
    } else {
      return 800;
    }
  };

  const handleClearFilterConfig = () => {
    setTagActive(undefined);
    // formRef.current?.resetFields(initialValues)
    let fields = formRef.current?.getFieldsValue(true);
    for (let key in fields) {
      if (fields[key] instanceof Array) {
        fields[key] = [];
      } else {
        fields[key] = null;
      }
    }
    formRef.current?.setFieldsValue(fields);
  };

  const clearFilter = () => {
    onClearFilter && onClearFilter();
    setCreatedClick("");
    setReceivedClick("");

    setVisible(false);
    setRerender(false);

    handleClearFilterConfig();
  };

  const handleSelectProduct = useCallback(
    (v?: VariantResponse) => {
      if (v) {
        onFilter && onFilter({ ...initialValueExchange, searched_product: v.sku });
      }
    },
    [onFilter],
  );

  useLayoutEffect(() => {
    window.addEventListener("resize", () => setVisible(false));
  }, []);

  useEffect(() => {
    setIsReceived(Array.isArray(params.is_received) ? params.is_received : [params.is_received]);
    setPaymentStatus(
      Array.isArray(params.payment_status) ? params.payment_status : [params.payment_status],
    );
    dispatch(getListChannelRequest(setListChannel));
  }, [dispatch, params.is_received, params.payment_status]);

  useEffect(() => {
    if (initialValues.source_ids) {
      const params = {
        ids: initialValues.source_ids,
      };
      getSourcesWithParamsService(params).then((response) => {
        if (isFetchApiSuccessful(response)) {
          setListSource && setListSource([...response.data.items]);
        } else {
          handleFetchApiError(response, "Tìm nguồn đơn hàng", dispatch);
        }
      });
    }
  }, [dispatch, initialValues.source_ids, setListSource]);

  useEffect(() => {
    initialValueExchange = params;
    setKeySearchVariant(params.searched_product || "");
  }, [params]);

  return (
    <div>
      <div className="order-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form
            onFinish={onFinish}
            ref={formSearchRef}
            initialValues={initialValues}
            layout="inline"
          >
            <Item
              name="search_term"
              className="input-search"
              style={{ width: "calc(100% - 615px)" }}
            >
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã đơn trả hàng, tên, sđt khách hàng"
                onBlur={(e) => {
                  formSearchRef?.current?.setFieldsValue({
                    search_term: e.target.value.trim(),
                  });
                }}
              />
            </Item>

            <Item className="input-search" style={{ width: "300px" }}>
              <SearchProductComponent
                keySearch={keySearchVariant}
                setKeySearch={setKeySearchVariant}
                onSelect={handleSelectProduct}
                // ref={autoCompleteRef}
                id="search_product"
              />
            </Item>

            <Item>
              <Button type="primary" loading={loadingFilter} htmlType="submit">
                Lọc
              </Button>
            </Item>
            {/* <Item>
              <Tooltip overlay="Lưu bộ lọc" placement="top">
                <Button icon={<StarOutlined />} />
              </Tooltip>
            </Item> */}
            <Item>
              <Button icon={<FilterOutlined />} onClick={openFilter}>
                Thêm bộ lọc
              </Button>
            </Item>
            <Button icon={<SettingOutlined />} onClick={onShowColumnSetting}></Button>
          </Form>
        </CustomFilter>

        <BaseFilter
          onClearFilter={() => clearFilter()}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          className="order-filter-drawer"
          width={widthScreen()}
          allowSave
          onSaveFilter={onShowSaveFilter}
        >
          {rerender && (
            <Form onFinish={onFinish} ref={formRef} initialValues={initialValues} layout="vertical">
              {filterConfigs && filterConfigs.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  {filterConfigs?.map((e, index) => {
                    return (
                      <UserCustomFilterTag
                        key={index}
                        tagId={e.id}
                        name={e.name}
                        onSelectFilterConfig={onSelectFilterConfig}
                        setConfigId={setConfigId}
                        setIsShowConfirmDelete={setIsShowConfirmDelete}
                        tagActive={tagActive}
                      />
                    );
                  })}
                </div>
              )}
              <Row gutter={20}>
                <Col span={12}>
                  <p>Kho cửa hàng</p>
                  <Item name="store_ids">
                    {/* <CustomSelect
                    mode="multiple"
                    allowClear
                    showArrow
                    placeholder="Cửa hàng"
                    optionFilterProp="children"
                    style={{
                      width: '100%'
                    }}
                    notFoundContent="Không tìm thấy kết quả"
                    maxTagCount="responsive"
                  >
                    {listStore?.map((item) => (
                      <CustomSelect.Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect> */}
                    <TreeStore
                      listStore={listStore}
                      placeholder="Cửa hàng"
                      autoClearSearchValue={false}
                    />
                  </Item>
                  <p>Lý do trả hàng</p>
                  <Item name="reason_ids">
                    <CustomSelect
                      mode="multiple"
                      showSearch
                      placeholder="Chọn lý do trả hàng"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      maxTagCount="responsive"
                      showArrow
                      getPopupContainer={(trigger) => trigger.parentNode}
                      allowClear
                    >
                      {reasons.map((reason) => (
                        <CustomSelect.Option
                          key={reason.id.toString()}
                          value={reason.id.toString()}
                        >
                          {reason.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
                <Col span={12}>
                  <p>Trạng thái nhận hàng</p>
                  <div className="button-option-1" style={{ marginBottom: "20px" }}>
                    <Button
                      onClick={() => changeIsReceived("true")}
                      className={isReceived.includes("true") ? "active" : "deactive"}
                    >
                      Đã nhận hàng
                    </Button>

                    <Button
                      onClick={() => changeIsReceived("false")}
                      className={isReceived.includes("false") ? "active" : "deactive"}
                    >
                      Chưa nhận hàng
                    </Button>
                  </div>
                  <p>Trạng thái hoàn tiền</p>
                  <div className="button-option-2">
                    <Button
                      onClick={() => changePaymentStatus("unpaid")}
                      className={paymentStatus.includes("unpaid") ? "active" : "deactive"}
                    >
                      Chưa hoàn tiền
                    </Button>
                    <Button
                      onClick={() => changePaymentStatus("partial_paid")}
                      className={paymentStatus.includes("partial_paid") ? "active" : "deactive"}
                    >
                      Hoàn tiền một phần
                    </Button>
                    <Button
                      onClick={() => changePaymentStatus("paid")}
                      className={paymentStatus.includes("paid") ? "active" : "deactive"}
                    >
                      Hoàn tiền toàn bộ
                    </Button>
                  </div>
                </Col>
                <Col span={12} style={{ marginBottom: 20 }}>
                  <p>Ngày tạo đơn</p>
                  <CustomFilterDatePicker
                    fieldNameFrom="created_on_min"
                    fieldNameTo="created_on_max"
                    activeButton={createdClick}
                    setActiveButton={setCreatedClick}
                    format={dateFormat}
                    formRef={formRef}
                    showTime={{ format: timeFormat }}
                  />
                </Col>

                <Col span={12} style={{ marginBottom: 20 }}>
                  <p>Ngày nhận hàng</p>
                  <CustomFilterDatePicker
                    fieldNameFrom="received_on_min"
                    fieldNameTo="received_on_max"
                    activeButton={receivedClick}
                    setActiveButton={setReceivedClick}
                    format={dateFormat}
                    formRef={formRef}
                    showTime={{ format: timeFormat }}
                  />
                </Col>
                <Col span={8}>
                  <Item name="source_ids" label="Nguồn đơn hàng">
                    <TreeSource
                      placeholder="Nguồn đơn hàng"
                      name="source_ids"
                      listSource={sourcesResult}
                    />
                  </Item>
                </Col>
                <Col span={8}>
                  <Item name="channel_codes" label="Kênh bán hàng">
                    <CustomSelect
                      mode="multiple"
                      showSearch
                      allowClear
                      showArrow
                      placeholder="Chọn kênh bán hàng"
                      notFoundContent="Không tìm thấy kết quả"
                      style={{ width: "100%" }}
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                      maxTagCount="responsive"
                    >
                      {listChannel &&
                        listChannel.map((channel) => (
                          <CustomSelect.Option key={channel.code} value={channel.code}>
                            {channel.code} - {channel.name}
                          </CustomSelect.Option>
                        ))}
                    </CustomSelect>
                  </Item>
                </Col>
                <Col span={8}>
                  <Item name="account_codes" label="Nhân viên tạo đơn">
                    <AccountCustomSearchSelect
                      placeholder="Tìm theo họ tên hoặc mã nhân viên"
                      dataToSelect={accountData}
                      setDataToSelect={setAccountData}
                      initDataToSelect={accounts}
                      mode="multiple"
                      getPopupContainer={(trigger: any) => trigger.parentNode}
                      maxTagCount="responsive"
                    />
                  </Item>
                </Col>
                <Col span={8}>
                  <Item name="assignee_codes" label="Nhân viên bán hàng">
                    <AccountCustomSearchSelect
                      placeholder="Tìm theo họ tên hoặc mã nhân viên"
                      dataToSelect={accountData}
                      setDataToSelect={setAccountData}
                      initDataToSelect={accounts}
                      mode="multiple"
                      getPopupContainer={(trigger: any) => trigger.parentNode}
                      maxTagCount="responsive"
                    />
                  </Item>
                </Col>
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <Item name="marketer_codes" label="Nhân viên marketing">
                      <AccountCustomSearchSelect
                        placeholder="Tìm theo họ tên hoặc mã nhân viên"
                        dataToSelect={accountData}
                        setDataToSelect={setAccountData}
                        initDataToSelect={accounts}
                        mode="multiple"
                        getPopupContainer={(trigger: any) => trigger.parentNode}
                        maxTagCount="responsive"
                      />
                    </Item>
                  </Col>
                )}
                {orderType === ORDER_TYPES.online && (
                  <Col span={8} xxl={8}>
                    <Item name="coordinator_codes" label="Nhân viên điều phối">
                      <AccountCustomSearchSelect
                        placeholder="Tìm theo họ tên hoặc mã nhân viên"
                        dataToSelect={accountData}
                        setDataToSelect={setAccountData}
                        initDataToSelect={accounts}
                        mode="multiple"
                        getPopupContainer={(trigger: any) => trigger.parentNode}
                        maxTagCount="responsive"
                      />
                    </Item>
                  </Col>
                )}
              </Row>
            </Form>
          )}
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
      </div>
      <div className="order-filter-tags">
        {filters &&
          filters.map((filter: any, index) => {
            return (
              <Tag className="tag" closable onClose={(e) => onCloseTag(e, filter)}>
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </div>
  );
};

export default ReturnFilter;
