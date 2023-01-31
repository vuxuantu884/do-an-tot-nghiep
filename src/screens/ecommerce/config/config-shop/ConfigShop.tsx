import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showError, showSuccess } from "utils/ToastUtils";
import { useHistory } from "react-router-dom";
import CustomSelect from "component/custom/select.custom";
import { Button, Col, Form, Modal, Row, Select, Spin, Table } from "antd";

import { StoreResponse } from "model/core/store.model";
import { AccountResponse } from "model/account/account.model";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import { EcommerceRequest, EcommerceShopInventoryDto } from "model/request/ecommerce.request";
import {
  ecommerceConfigUpdateAction,
  ecommerceConfigCreateAction,
  exitEcommerceJobsAction,
} from "domain/actions/ecommerce/ecommerce.actions";
import CustomInput from "screens/customer/common/customInput";

import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { EcommerceConfigPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import disconnectIcon from "assets/icon/e-disconnect.svg";
import saveIcon from "assets/icon/e-save-config.svg";
import { ECOMMERCE_ICON, ECOMMERCE_ID } from "screens/ecommerce/common/commonAction";
import { StyledConfig } from "screens/ecommerce/config/config-shop/StyledConfigShop";
import _, { debounce } from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { actionFetchListOrderSources } from "domain/actions/settings/order-sources.action";
import { SourceResponse } from "model/response/order/source.response";
import { SourceSearchQuery } from "model/request/source.request";
import { getSourcesWithParamsService } from "service/order/order.service";
import { handleFetchApiError, isFetchApiSuccessful, isNullOrUndefined } from "utils/AppUtils";
import { searchAccountPublicApi } from "service/accounts/account.service";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import BaseResponse from "base/base.response";
import { getEcommerceJobsApi } from "service/ecommerce/ecommerce.service";
import { HttpStatus } from "config/http-status.config";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import ProgressConfigMultipleInventoryModal from "./ProgressConfigMultipleInventoryModal";

const { Option } = Select;

const INVENTORY_STORE_TYPE = {
  stores: "stores",
  inventories: "inventories",
};

const INVENTORY_SYNC_TYPE = {
  auto: "auto",
  manual: "manual",
};

const shopsReadPermission = [EcommerceConfigPermission.shops_read];
const shopsUpdatePermission = [EcommerceConfigPermission.shops_update];
const shopsDeletePermission = [EcommerceConfigPermission.shops_delete];

type ConfigShopProps = {
  listStores: Array<StoreResponse>;
  storeChangeSearch: (value: string) => void;
  form: any;
  configData: Array<EcommerceResponse>;
  configToView: EcommerceResponse | undefined;
  reloadConfigData: () => void;
  setConfigToView: (value: any) => void;
  configFromEcommerce: any | undefined;
  setConfigFromEcommerce: (value: any) => void;
  showDeleteModal: (value: EcommerceResponse) => void;
};

const ConfigShop: React.FC<ConfigShopProps> = (props: ConfigShopProps) => {
  const {
    listStores,
    form,
    configToView,
    configData,
    reloadConfigData,
    setConfigToView,
    configFromEcommerce,
    setConfigFromEcommerce,
    showDeleteModal,
    storeChangeSearch,
  } = props;

  const dispatch = useDispatch();
  const history = useHistory();
  const [configDetail, setConfigDetail] = useState<EcommerceResponse | undefined>(undefined);
  const [inventories, setInventories] = React.useState<Array<EcommerceShopInventoryDto>>([]);
  const [isConfigExist, setIsConfigExist] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allowShopsUpdate] = useAuthorization({
    acceptPermissions: shopsUpdatePermission,
    not: false,
  });

  const [allowShopsDelete] = useAuthorization({
    acceptPermissions: shopsDeletePermission,
    not: false,
  });

  // handle account
  const [initAssigneeAccountData, setInitAssigneeAccountData] = useState<Array<AccountResponse>>(
    [],
  );
  const [initValueAssigneeCode, setInitValueAssigneeCode] = useState("");
  const [assigneeAccountData, setAssigneeAccountData] = useState<Array<AccountResponse>>([]);

  useEffect(() => {
    if (!configDetail?.store_id) {
      return;
    }

    const pushCurrentValueToDataAccount = (
      fieldName: string,
      fieldNameValue: any,
      storeAccountData: AccountResponse[],
    ) => {
      if (fieldNameValue) {
        switch (fieldName) {
          case "assign_account_code":
            setInitValueAssigneeCode(fieldNameValue);
            break;
          default:
            break;
        }
        if (storeAccountData.some((single) => single.code === fieldNameValue)) {
          setAssigneeAccountData(storeAccountData);
        } else {
          searchAccountPublicApi({ condition: fieldNameValue })
            .then((response) => {
              if (isFetchApiSuccessful(response)) {
                if (response.data.items.length === 0) {
                  return;
                }
                const result = response.data.items.concat([...storeAccountData]);
                switch (fieldName) {
                  case "assign_account_code":
                    setInitAssigneeAccountData(result);
                    setAssigneeAccountData(result);
                    break;
                  default:
                    break;
                }
              } else {
                handleFetchApiError(response, "Danh sách tài khoản", dispatch);
              }
            })
            .catch((error) => {
              console.log("error", error);
            });
        }
      }
    };

    searchAccountPublicApi({ store_ids: [configDetail?.store_id] })
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          setInitAssigneeAccountData(response.data.items);
          pushCurrentValueToDataAccount(
            "assign_account_code",
            configDetail.assign_account_code,
            response.data.items,
          );
        } else {
          handleFetchApiError(response, "Danh sách tài khoản", dispatch);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  }, [configDetail?.assign_account_code, configDetail?.store_id, dispatch]);
  // end handle search account

  // handle source
  const [initSourceList, setInitSourceList] = useState<SourceResponse[]>([]);
  const [sourceList, setSourceList] = useState<SourceResponse[]>([]);
  const [sourceSearching, setSourceSearching] = React.useState<boolean>(false);

  //handle inventory
  const [isChangeInventory, setChangeInventory] = useState(false);
  const [isChangeTypeInventory, setChangeTypeInventory] = useState("");
  const [isShowProcessConfigMultipleInventoryModal, setIsShowProcessConfigMultipleInventoryModal] =
    useState(false);
  const [isShowConfirmCancelProcess, setIsShowConfirmCancelProcess] = useState(false);
  const [syncStockProcessId, setSyncStockProcessId] = useState<number | null>(null);
  const [progressData, setProgressData] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [listWareHouse, setListWareHouse] = useState<Array<any>>([]);

  useEffect(() => {
    if (
      configDetail &&
      (configDetail.ecommerce_id === ECOMMERCE_ID.TIKI ||
        configDetail.ecommerce_id === ECOMMERCE_ID.TIKTOK)
    ) {
      let _listWareHouse: Array<any> = [];
      /** Lọc inventories deleted !== true và store_id !== null */
      const inventoriesAndStoresValid = configDetail.inventories?.filter(
        (item) => !item.deleted && item.store_id,
      );
      const inventoriesList = inventoriesAndStoresValid.filter(
        (item) => item.type === INVENTORY_STORE_TYPE.inventories,
      );
      const storesList = inventoriesAndStoresValid.filter(
        (item) => item.type === INVENTORY_STORE_TYPE.stores,
      );

      inventoriesList?.forEach((inventory) => {
        const indexItem = _listWareHouse.findIndex(
          (_item) => _item.warehouse_id === inventory.warehouse_id,
        );
        if (indexItem === -1) {
          _listWareHouse.push({
            warehouse: inventory.warehouse,
            warehouse_id: inventory.warehouse_id,
            store: null,
            store_id: null,
            inventories: [
              {
                store: inventory.store,
                store_id: inventory.store_id,
                warehouse_id: inventory.warehouse_id,
              },
            ],
          });
        } else {
          _listWareHouse[indexItem].inventories?.push({
            store: inventory.store,
            store_id: inventory.store_id,
            warehouse_id: inventory.warehouse_id,
          });
        }
      });

      storesList?.forEach((storeItem) => {
        const indexItem = _listWareHouse.findIndex(
          (_item) => _item.warehouse_id === storeItem.warehouse_id,
        );
        if (indexItem === -1) {
          _listWareHouse.push({
            warehouse: storeItem.warehouse,
            warehouse_id: storeItem.warehouse_id,
            store: storeItem.store,
            store_id: storeItem.store_id,
            inventories: [],
          });
        } else {
          _listWareHouse[indexItem].store = storeItem.store;
          _listWareHouse[indexItem].store_id = storeItem.store_id;
          _listWareHouse[indexItem].warehouse_id = storeItem.warehouse_id;
        }
      });

      _listWareHouse.sort((a, b) => {
        return b.warehouse_id < a.warehouse_id ? -1 : b.warehouse_id > a.warehouse_id ? 1 : 0;
      });

      const _listWareHouseValid = _listWareHouse.filter((item) => !!item.warehouse_id);
      setListWareHouse(_listWareHouseValid);
    }
  }, [configDetail]);

  const handleSetInitSourceList = useCallback(() => {
    setSourceList(initSourceList);
  }, [initSourceList]);

  const updateSourceData = useCallback((response: PageResponse<any>) => {
    setSourceSearching(false);
    if (response) {
      setSourceList(response.items);
    }
  }, []);

  const handleChangeTypeInventories = (value: string) => {
    setChangeTypeInventory(value);
  };

  const handleSearchingSource = useCallback(
    (searchValue: string) => {
      if (searchValue) {
        setSourceSearching(true);
        dispatch(actionFetchListOrderSources({ name: searchValue }, updateSourceData));
      } else {
        handleSetInitSourceList();
      }
    },
    [dispatch, handleSetInitSourceList, updateSourceData],
  );

  const onSearchSource = debounce((value: string) => {
    handleSearchingSource(value);
  }, 800);

  /** select single store */
  const handleSelectSingleWareHouse = (value: number, option: any, item: any) => {
    const _listWareHouse = _.cloneDeep(listWareHouse);
    const indexItem = _listWareHouse.findIndex((_item) => _item.warehouse_id === item.warehouse_id);
    _listWareHouse[indexItem].store = option.children;
    _listWareHouse[indexItem].store_id = option.value;
    _listWareHouse[indexItem].warehouse_id = item.warehouse_id;
    setListWareHouse(_listWareHouse);
  };

  const handleClearSingleWareHouse = (item: any) => {
    const _listWareHouse = _.cloneDeep(listWareHouse);
    const indexItem = _listWareHouse.findIndex((_item) => _item.warehouse_id === item.warehouse_id);
    _listWareHouse[indexItem].store = null;
    _listWareHouse[indexItem].store_id = null;
    _listWareHouse[indexItem].warehouse_id = null;
    setListWareHouse(_listWareHouse);
  };
  /** end select single store */

  /** select multiple store */
  const handleSelectMultipleWareHouse = useCallback(
    (value: number, option: any, item: any) => {
      const _listWareHouse = _.cloneDeep(listWareHouse);
      const indexItem = _listWareHouse.findIndex(
        (_item) => _item.warehouse_id === item.warehouse_id,
      );
      _listWareHouse[indexItem].inventories?.push({
        store: option.children,
        store_id: value,
        warehouse_id: item.warehouse_id,
      });

      setListWareHouse(_listWareHouse);
    },
    [listWareHouse],
  );

  const handleDeselectMultipleWareHouse = (value: number, option: any, item: any) => {
    const _listWareHouse = _.cloneDeep(listWareHouse);
    const indexItem = _listWareHouse.findIndex((_item) => _item.warehouse_id === item.warehouse_id);
    const indexItemDeselect = _listWareHouse[indexItem].inventories?.findIndex(
      (_item: any) => _item.store_id === value,
    );
    _listWareHouse[indexItem].inventories?.splice(indexItemDeselect, 1);
    setListWareHouse(_listWareHouse);
  };

  const handleClearMultipleWareHouse = (item: any) => {
    const _listWareHouse = _.cloneDeep(listWareHouse);
    const indexItem = _listWareHouse.findIndex((_item) => _item.warehouse_id === item.warehouse_id);
    _listWareHouse[indexItem].inventories = [];
    setListWareHouse(_listWareHouse);
  };
  /** end select multiple store */

  //get init source
  useEffect(() => {
    const getInitSourceList = async () => {
      let sourceList: SourceResponse[] = [];
      const query: SourceSearchQuery = {
        page: 1,
        limit: 1000,
        active: true,
      };
      await getSourcesWithParamsService(query).then((responseSource) => {
        if (isFetchApiSuccessful(responseSource)) {
          sourceList = responseSource.data.items;
        } else {
          handleFetchApiError(responseSource, "Nguồn đơn hàng", dispatch);
        }
      });
      return sourceList;
    };

    const addSourceIntoInitSourceList = async (sourceList: any) => {
      let newInitSourceList: SourceResponse[] = sourceList;

      if (
        configDetail?.source_id &&
        sourceList?.length &&
        !sourceList.find((item: any) => item.id === configDetail?.source_id)
      ) {
        const query: SourceSearchQuery = {
          ids: [configDetail?.source_id],
        };
        await getSourcesWithParamsService(query).then((responseSource) => {
          if (isFetchApiSuccessful(responseSource)) {
            newInitSourceList = responseSource.data.items.concat(sourceList);
          } else {
            handleFetchApiError(responseSource, "Nguồn đơn hàng", dispatch);
          }
        });
      }
      return newInitSourceList;
    };

    const handleGetInitSource = async () => {
      let sourceList: SourceResponse[];
      sourceList = await getInitSourceList();
      sourceList = await addSourceIntoInitSourceList(sourceList);
      setInitSourceList(sourceList);
      setSourceList(sourceList);
    };
    if (configDetail?.source_id) {
      handleGetInitSource();
    }
  }, [configDetail?.source_id, dispatch]);
  // end handle source

  useEffect(() => {
    if (configFromEcommerce) {
      const _existConfig = configData?.find((item) => item.id === configFromEcommerce.id);
      if (_existConfig) {
        setConfigDetail(_existConfig);
      } else {
        setConfigDetail(configFromEcommerce);
      }
    } else {
      setConfigDetail(configToView);
    }
  }, [configToView, setConfigDetail, configFromEcommerce, configData]);

  useEffect(() => {
    const id = configDetail?.id;
    const _isExist = configData && configData?.some((item) => item.id === id);
    if (_isExist) {
      setIsConfigExist(true);
    } else {
      setIsConfigExist(false);
    }
  }, [configDetail, configData]);

  useEffect(() => {
    const inventoriesAndStoresValid = configDetail?.inventories?.filter(
      (item) => !item.deleted && item.store_id,
    );

    switch (configDetail?.ecommerce_id) {
      case ECOMMERCE_ID.SHOPEE:
      case ECOMMERCE_ID.LAZADA:
        if (_.isEqual(inventoriesAndStoresValid, inventories)) {
          setChangeInventory(false);
        } else {
          setChangeInventory(true);
        }
        break;
      case ECOMMERCE_ID.TIKI:
      case ECOMMERCE_ID.TIKTOK:
        const initialInventories: any[] = [];

        inventoriesAndStoresValid?.map(
          (item) =>
            item.type === INVENTORY_STORE_TYPE.inventories &&
            initialInventories.push({
              store: item.store,
              store_id: item.store_id,
              warehouse_id: item.warehouse_id,
            }),
        );

        const afterChangeInventories = listWareHouse.map((item) => item.inventories).flat(Infinity);

        if (_.isEqual(initialInventories, afterChangeInventories)) {
          setChangeInventory(false);
        } else {
          setChangeInventory(true);
        }
        break;
      default:
        break;
    }
  }, [configDetail, form, inventories, listWareHouse]);

  const handleConfigCallback = React.useCallback(
    (value: EcommerceResponse) => {
      setIsLoading(false);
      if (value) {
        switch (value.inventory_sync) {
          case INVENTORY_SYNC_TYPE.auto:
            if (
              isChangeTypeInventory === INVENTORY_SYNC_TYPE.auto ||
              (configDetail?.inventory_sync === INVENTORY_SYNC_TYPE.auto && isChangeInventory)
            ) {
              setIsProcessing(true);
              setIsShowProcessConfigMultipleInventoryModal(true);
              setSyncStockProcessId(value.sync_stock_process_id);
            } else {
              setConfigToView(null);
              setConfigDetail(undefined);
              setConfigFromEcommerce(undefined);
              setChangeTypeInventory("");
              history.replace(`${history.location.pathname}#sync`);
              showSuccess("Đồng bộ cấu hình thành công");
            }

            break;
          case INVENTORY_SYNC_TYPE.manual:
            setConfigToView(null);
            setConfigDetail(undefined);
            setConfigFromEcommerce(undefined);
            setChangeTypeInventory("");
            history.replace(`${history.location.pathname}#sync`);
            showSuccess("Đồng bộ cấu hình thành công");
            reloadConfigData();
            break;
          default:
            break;
        }
      }
    },
    [
      isChangeTypeInventory,
      configDetail?.inventory_sync,
      isChangeInventory,
      setConfigToView,
      setConfigFromEcommerce,
      history,
      reloadConfigData,
    ],
  );

  const handleCreateConfigCallback = React.useCallback(
    (value: EcommerceResponse) => {
      setIsLoading(false);
      if (value) {
        switch (value.inventory_sync) {
          case INVENTORY_SYNC_TYPE.auto:
            setIsProcessing(true);
            setIsShowProcessConfigMultipleInventoryModal(true);
            setSyncStockProcessId(value.sync_stock_process_id);
            break;
          case INVENTORY_SYNC_TYPE.manual:
            setConfigToView(null);
            setConfigDetail(undefined);
            setConfigFromEcommerce(undefined);
            history.replace(`${history.location.pathname}#sync`);
            showSuccess("Đồng bộ cấu hình thành công");
            break;
          default:
            break;
        }
      }
    },
    [history, setConfigToView, setConfigFromEcommerce],
  );

  //Render config multiple store for ecommerce
  const handleRenderConfigMultipleStore = useCallback((config: number) => {
    switch (config) {
      case ECOMMERCE_ID.TIKI:
        return "Tiki";
      case ECOMMERCE_ID.TIKTOK:
        return "Tiktok";
      default:
        return "";
    }
  }, []);

  const handleConfigSetting = React.useCallback(
    (value: EcommerceRequest) => {
      if (configDetail) {
        const id = configDetail?.id;
        const _isExist = configData && configData?.some((item) => item.id === id);
        let request = {
          ...configDetail,
          ...value,
          inventories: inventories,
          assign_account:
            assigneeAccountData?.find((item) => item.code === value.assign_account_code)
              ?.full_name || "",
          source: sourceList?.find((item) => item.id === value.source_id)?.name || "",
          store: listStores?.find((item) => item.id === value.store_id)?.name || "",
        };

        if (
          configDetail?.ecommerce_id === ECOMMERCE_ID.TIKI ||
          configDetail?.ecommerce_id === ECOMMERCE_ID.TIKTOK
        ) {
          const invalidWarehouseConfig = listWareHouse.find((item) => !item.store_id);
          if (invalidWarehouseConfig) {
            showError(
              `Kho ${handleRenderConfigMultipleStore(configDetail?.ecommerce_id)} "${
                invalidWarehouseConfig.warehouse
              }" chưa chọn kho đồng bộ đơn hàng.`,
            );
            return;
          }

          let inventoriesQuery: Array<any> = [];
          listWareHouse?.forEach((item) => {
            inventoriesQuery.push({
              store: item.store,
              store_id: item.store_id,
              warehouse: item.warehouse,
              warehouse_id: item.warehouse_id,
              type: INVENTORY_STORE_TYPE.stores,
            });

            item.inventories?.forEach((inventoryItem: any) => {
              inventoriesQuery.push({
                store: inventoryItem.store,
                store_id: inventoryItem.store_id,
                warehouse: item.warehouse,
                warehouse_id: item.warehouse_id,
                type: INVENTORY_STORE_TYPE.inventories,
              });
            });
          });

          request.inventories = inventoriesQuery;
        }

        setIsLoading(true);
        if (_isExist) {
          dispatch(ecommerceConfigUpdateAction(id, request, handleConfigCallback));
        } else {
          dispatch(ecommerceConfigCreateAction(request, handleCreateConfigCallback));
        }
      }
    },
    [
      configDetail,
      configData,
      inventories,
      assigneeAccountData,
      sourceList,
      listStores,
      listWareHouse,
      handleRenderConfigMultipleStore,
      dispatch,
      handleConfigCallback,
      handleCreateConfigCallback,
    ],
  );
  const handleDisconnectEcommerce = () => {
    if (configDetail) showDeleteModal(configDetail);
  };

  const handleStoreChange = (event: any) => {
    let _inventories = [];
    for (let id of event) {
      const _store = listStores.find((store) => store.id === id);
      if (_store) {
        _inventories.push({
          store: _store.name,
          store_id: id,
          type: INVENTORY_STORE_TYPE.inventories,
        });
      }
    }
    setInventories(_inventories);
  };

  useEffect(() => {
    if (configDetail) {
      const _inventories = configDetail.inventories?.filter((item: any) => !item.deleted);
      setInventories(_inventories);
      form.setFieldsValue({
        id: configDetail.id,
        name: configDetail.name,
        store_id: configDetail.store_id,
        assign_account_code: configDetail.assign_account_code,
        order_sync: configDetail.order_sync,
        product_sync: configDetail.product_sync,
        inventory_sync: configDetail.inventory_sync,
        store: configDetail.store,
        source_id: configDetail.source_id,
        inventories: _inventories?.map((item: any) => item.store_id),
      });
    } else {
      form.resetFields();
      setInventories([]);
    }
  }, [configDetail, form, setInventories]);

  const handleCancelProcess = useCallback(() => {
    setIsShowConfirmCancelProcess(true);
  }, []);

  const handleProcessSuccess = useCallback(() => {
    setConfigToView(null);
    setConfigDetail(undefined);
    setConfigFromEcommerce(undefined);
    setChangeTypeInventory("");
    setIsShowProcessConfigMultipleInventoryModal(false);
    showSuccess("Đồng bộ cấu hình thành công");
    reloadConfigData();
    resetProgress();
    history.replace(`${history.location.pathname}#sync`);
  }, [history, reloadConfigData, setConfigFromEcommerce, setConfigToView]);

  const resetProgress = () => {
    setSyncStockProcessId(null);
    setProgressPercent(0);
    setProgressData(null);
  };

  //handle confirm cancel process
  const handleConfirmCancelProcess = useCallback(() => {
    resetProgress();
    setIsShowConfirmCancelProcess(false);
    setIsShowProcessConfigMultipleInventoryModal(false);
    if (syncStockProcessId) {
      dispatch(
        exitEcommerceJobsAction(syncStockProcessId, (responseData) => {
          if (responseData) {
            showSuccess(responseData);
          }
        }),
      );
    }
    setConfigToView(null);
    setConfigDetail(undefined);
    setConfigFromEcommerce(undefined);
    history.replace(`${history.location.pathname}#sync`);
  }, [dispatch, history, setConfigFromEcommerce, setConfigToView, syncStockProcessId]);

  useEffect(() => {
    if (!syncStockProcessId) return;

    const configMultipleInvetoryInterval = setInterval(getProcessConfigMulipleInventory, 3000);

    return () => clearInterval(configMultipleInvetoryInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncStockProcessId]);

  //config multiple inventory
  const getProcessConfigMulipleInventory = () => {
    let getProgressPromises: Promise<BaseResponse<any>> = getEcommerceJobsApi(syncStockProcessId);
    Promise.all([getProgressPromises]).then((responses) => {
      responses.forEach((response) => {
        const processData = response.data;
        if (
          response.code === HttpStatus.SUCCESS &&
          response.data &&
          !isNullOrUndefined(processData.total)
        ) {
          setProgressData(response.data);
          const progressCount =
            processData.total_created +
            processData.total_updated +
            processData.total_success +
            processData.total_error;
          if (processData.finish) {
            setProgressPercent(100);
            setSyncStockProcessId(null);
            setIsProcessing(false);
            if (processData.api_error) {
              resetProgress();
              setIsShowProcessConfigMultipleInventoryModal(false);
              showError(processData.api_error);
            }
          } else {
            const percent = Math.floor((progressCount / response.data.total) * 100);
            setProgressPercent(percent);
          }
        }
      });
    });
  };

  const handleShopChange = React.useCallback(
    (id: any) => {
      let _configData = [...configData];
      const data = _configData?.find((item) => item.id === id);
      setConfigToView(data);
    },
    [configData, setConfigToView],
  );

  const convertToCapitalizedString = () => {
    if (configDetail) {
      return configDetail.ecommerce?.charAt(0).toUpperCase() + configDetail.ecommerce?.slice(1);
    }
  };

  const handleCheckShowStoreConfig = () => {
    if (
      configDetail?.ecommerce_id === ECOMMERCE_ID.TIKI ||
      configDetail?.ecommerce_id === ECOMMERCE_ID.TIKTOK
    )
      return;

    return (
      <Form.Item
        label={<span>Cửa hàng</span>}
        name="store_id"
        rules={[
          {
            required: true,
            message: "Vui lòng chọn cửa hàng",
          },
        ]}
      >
        <Select
          showSearch
          placeholder="Chọn cửa hàng"
          disabled={!configDetail || !allowShopsUpdate}
          allowClear
          optionFilterProp="children"
          onSearch={(value) => storeChangeSearch(value)}
        >
          {listStores &&
            listStores?.map((item, index) => (
              <Option style={{ width: "100%" }} key={index.toString()} value={item.id}>
                {item.name}
              </Option>
            ))}
        </Select>
      </Form.Item>
    );
  };

  const handleCheckWareHouseConfig = () => {
    if (
      configDetail?.ecommerce_id === ECOMMERCE_ID.TIKI ||
      configDetail?.ecommerce_id === ECOMMERCE_ID.TIKTOK
    )
      return;

    return (
      <Form.Item
        name="inventories"
        label={<span>Kho đồng bộ tồn</span>}
        rules={[
          {
            required: true,
            message: "Vui lòng chọn kho đồng bộ tồn",
          },
        ]}
      >
        <CustomSelect
          disabled={!configDetail || !allowShopsUpdate}
          onChange={handleStoreChange}
          mode="multiple"
          maxTagCount="responsive"
          className="dropdown-rule"
          showArrow
          showSearch
          placeholder="Chọn kho đồng bộ tồn"
          notFoundContent="Không tìm thấy kết quả"
          style={{
            width: "100%",
          }}
          optionFilterProp="children"
          getPopupContainer={(trigger) => trigger.parentNode}
        >
          {listStores?.map((item) => (
            <CustomSelect.Option key={item.id} value={item.id}>
              {item.name}
            </CustomSelect.Option>
          ))}
        </CustomSelect>
      </Form.Item>
    );
  };

  const renderComponent = () => {
    return (
      <StyledConfig className="padding-20">
        <Form form={form} layout="vertical" onFinish={(value) => handleConfigSetting(value)}>
          <Row>
            <Col span={8}>
              <Form.Item
                name="id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn cửa hàng",
                  },
                ]}
              >
                <CustomSelect
                  onChange={handleShopChange}
                  showArrow
                  showSearch
                  placeholder="Chọn cửa hàng"
                  notFoundContent="Không tìm thấy kết quả"
                  disabled={!allowShopsUpdate}
                  filterOption={(input, option) => {
                    if (option) {
                      return option.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0;
                    }
                    return false;
                  }}
                >
                  {configFromEcommerce ? (
                    <CustomSelect.Option
                      style={{ width: "100%" }}
                      key={configFromEcommerce.id}
                      value={configFromEcommerce.id}
                    >
                      {
                        <img
                          style={{ marginRight: 8, paddingBottom: 4 }}
                          src={ECOMMERCE_ICON[configFromEcommerce.ecommerce.toLowerCase()]}
                          alt=""
                        />
                      }
                      {configFromEcommerce.name}
                    </CustomSelect.Option>
                  ) : (
                    configData &&
                    configData?.map((item: any) => (
                      <CustomSelect.Option style={{ width: "100%" }} key={item.id} value={item.id}>
                        {
                          <img
                            style={{ marginRight: 8, paddingBottom: 4 }}
                            src={ECOMMERCE_ICON[item.ecommerce.toLowerCase()]}
                            alt=""
                          />
                        }
                        {item.name}
                      </CustomSelect.Option>
                    ))
                  )}
                </CustomSelect>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={10}>
              <span className="description-name">{`Thông tin của shop trên ${
                convertToCapitalizedString() || "sàn"
              }`}</span>
            </Col>
            <Col span={14}>
              <div className="ecommerce-user-detail">
                <Row>
                  <Col span={5}>Tên Shop</Col>
                  <Col span={19}>
                    <span className="fw-500">: {configDetail?.ecommerce_shop || "---"}</span>
                  </Col>
                </Row>
                <Row>
                  <Col span={5}>ID Shop</Col>
                  <Col span={19}>
                    <span className="fw-500">: {configDetail?.id || "---"}</span>
                  </Col>
                </Row>
                {configDetail?.email && (
                  <Row>
                    <Col span={5}>Email</Col>
                    <Col span={19}>
                      <span className="fw-500">: {configDetail.email}</span>
                    </Col>
                  </Row>
                )}
              </div>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={10}>
              <span className="description-name">Đặt tên gian hàng</span>
              <ul className="description">
                <li>
                  <span style={{ padding: "0 10px" }}>
                    Tên viết tắt của gian hàng trên Yody giúp nhận biết và phân biệt các gian hàng
                    với nhau
                  </span>
                </li>
              </ul>
            </Col>
            <Col span={14}>
              <CustomInput
                name="name"
                label={<span>Tên gian hàng</span>}
                form={form}
                message="Vui lòng chọn gian hàng"
                placeholder="Nhập tên gian hàng"
                maxLength={255}
                isRequired={true}
                disabled={true}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={10}>
              <span className="description-name">Cấu hình nhân viên, cửa hàng</span>
              <ul className="description">
                <li>
                  <span>Chọn cửa hàng để ghi nhận doanh số và trừ tốn kho tại cửa hàng.</span>
                </li>
                <li>
                  <span>Chọn nhân viên bán hàng để ghi nhận doanh số và nhân viên phụ trách.</span>
                </li>
                <li>
                  <span>Chọn nguồn đơn hàng để ghi nhận nguồn cho đơn hàng khi tải đơn về.</span>
                </li>
              </ul>
            </Col>
            <Col span={14}>
              {handleCheckShowStoreConfig()}

              <Form.Item label="Nhân viên bán hàng" name="assign_account_code">
                <AccountCustomSearchSelect
                  disabled={!configDetail || !allowShopsUpdate}
                  placeholder="Tìm theo họ tên hoặc mã nhân viên"
                  initValue={initValueAssigneeCode}
                  dataToSelect={assigneeAccountData}
                  setDataToSelect={setAssigneeAccountData}
                  initDataToSelect={initAssigneeAccountData}
                />
              </Form.Item>

              <Form.Item
                label={<span>Nguồn đơn hàng</span>}
                name="source_id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn nguồn đơn hàng",
                  },
                ]}
              >
                <Select
                  disabled={!configDetail || !allowShopsUpdate}
                  showSearch
                  placeholder="Chọn nguồn đơn hàng"
                  allowClear
                  optionFilterProp="children"
                  onSearch={(value) => onSearchSource(value.trim())}
                  loading={sourceSearching}
                  onClear={handleSetInitSourceList}
                  notFoundContent={sourceSearching ? <Spin size="small" /> : "Không có dữ liệu"}
                >
                  {sourceList?.map((source: any) => (
                    <Option key={source.id} value={source.id}>
                      {`${source.name}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={10}>
              <span className="description-name">Cấu hình tồn kho</span>
              <ul className="description">
                <li>
                  <span>
                    Chọn kho để đồng bộ tồn từ admin lên shop của bạn, có thể chọn nhiều kho, tồn sẽ
                    là tổng các kho.{" "}
                  </span>
                </li>
                <li>
                  <span>
                    Chọn kiểu đồng bộ tồn kho tự động nghĩa là khi có bất kỳ thay đổi tồn từ các kho
                    đã chọn thì sẽ được đồng bộ realtime lên shop (trừ các trường hợp lỗi hoặc
                    flashsale).
                  </span>
                </li>
              </ul>
            </Col>
            <Col span={14}>
              {handleCheckWareHouseConfig()}

              <Form.Item
                label={<span>Kiểu đồng bộ tồn kho</span>}
                name="inventory_sync"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn kiểu đồng bộ tồn kho",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn kiểu đồng bộ tồn kho"
                  disabled={!configDetail || !allowShopsUpdate}
                  onChange={handleChangeTypeInventories}
                >
                  <Option value={INVENTORY_SYNC_TYPE.auto}>Tự động</Option>
                  <Option value={INVENTORY_SYNC_TYPE.manual}>Thủ công</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={10}>
              <span className="description-name">Cấu hình đơn hàng</span>
              <ul className="description">
                <li>
                  <span>
                    Kiểu đồng bộ đơn hàng để xác định khi có đơn hàng mới sẽ được tải về "Tự động"
                    hay "Thủ công".{" "}
                  </span>
                </li>
                <li>
                  <span>
                    Kiểu đồng bộ sản phẩm khi tải đơn là hệ thống sẽ đợi người dùng ghép nối hết sản
                    phẩm mới trong đơn hàng rồi mới tạo đơn hàng trên hệ thống.
                  </span>
                </li>
              </ul>
            </Col>
            <Col span={14}>
              <Form.Item
                label={<span>Kiểu đồng bộ đơn hàng</span>}
                name="order_sync"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn kiểu đồng bộ đơn hàng",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn kiểu đồng bộ đơn hàng"
                  disabled={!configDetail || !allowShopsUpdate}
                >
                  <Option value={INVENTORY_SYNC_TYPE.auto}>Tự động</Option>
                  <Option value={INVENTORY_SYNC_TYPE.manual}>Thủ công</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label={<span>Kiểu đồng bộ sản phẩm khi tải đơn về</span>}
                name="product_sync"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn kiểu đồng bộ sản phẩm",
                  },
                ]}
              >
                <Select
                  placeholder="Chọn kiểu đồng bộ sản phẩm"
                  disabled={!configDetail || !allowShopsUpdate}
                >
                  <Option value={INVENTORY_SYNC_TYPE.manual}>
                    <span>Đợi ghép nối</span>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {configDetail?.ecommerce_id === ECOMMERCE_ID.TIKI ||
          configDetail?.ecommerce_id === ECOMMERCE_ID.TIKTOK ? (
            <Row gutter={24} style={{ padding: "24px 0" }}>
              <Col span={10}>
                <span className="description-name">Cấu hình đa kho</span>
                <ul className="description">
                  <li>
                    <span>{`Kho ${handleRenderConfigMultipleStore(
                      configDetail?.ecommerce_id,
                    )}: là kho hàng của ${handleRenderConfigMultipleStore(
                      configDetail?.ecommerce_id,
                    )}.`}</span>
                  </li>
                  <li>
                    <span>
                      {`Kho đồng bộ đơn hàng: là kho hàng của Unicorn để ghi nhận kho trừ tồn khi có
                      đơn hàng phát sinh từ kho ${handleRenderConfigMultipleStore(
                        configDetail?.ecommerce_id,
                      )} tương ứng.`}
                    </span>
                  </li>
                  <li>
                    <span>
                      {` Kho đồng bộ tồn: là kho để lấy dữ liệu tồn ở Unicorn đồng bộ lên kho ${handleRenderConfigMultipleStore(
                        configDetail?.ecommerce_id,
                      )}
                      tương ứng, có thể chọn được nhiều kho và hệ thống sẽ cộng tồn các kho bạn chọn
                      để đồng bộ.`}
                    </span>
                  </li>
                </ul>
              </Col>

              <Col span={14}>
                <Table
                  columns={[
                    {
                      title: `Kho ${handleRenderConfigMultipleStore(configDetail?.ecommerce_id)}`,
                      width: "30%",
                      render: (item: any) =>
                        item.warehouse ? (
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ color: "#2A2A86" }}>{item.warehouse}</span>
                            <span>{`ID: ${item.warehouse_id}`}</span>
                          </div>
                        ) : (
                          <span></span>
                        ),
                    },
                    {
                      title: (
                        <span>
                          Kho đồng bộ đơn hàng <span style={{ color: "red" }}>*</span>
                        </span>
                      ),
                      width: "35%",
                      render: (item: any) =>
                        item.warehouse ? (
                          <Select
                            style={{ width: "100%" }}
                            showSearch
                            placeholder="Chọn kho đơn hàng"
                            allowClear
                            optionFilterProp="children"
                            onSearch={(value) => onSearchSource(value.trim())}
                            value={item.store_id !== -1 ? item.store_id : null}
                            onSelect={(value, option) => {
                              handleSelectSingleWareHouse(value, option, item);
                            }}
                            onClear={() => {
                              handleClearSingleWareHouse(item);
                            }}
                            loading={sourceSearching}
                            notFoundContent={
                              sourceSearching ? <Spin size="small" /> : "Không có dữ liệu"
                            }
                          >
                            {listStores?.map((store: any, index: number) => (
                              <Option key={index} value={store.id}>
                                {store.name}
                              </Option>
                            ))}
                          </Select>
                        ) : (
                          <span></span>
                        ),
                    },

                    {
                      title: "Kho đồng bộ tồn",
                      width: "35%",
                      render: (item: any) =>
                        item.warehouse ? (
                          <CustomSelect
                            allowClear
                            mode="multiple"
                            maxTagCount="responsive"
                            className="dropdown-rule"
                            showArrow
                            showSearch
                            placeholder="Chọn kho tồn"
                            notFoundContent="Không tìm thấy kết quả"
                            style={{
                              width: "100%",
                            }}
                            optionFilterProp="children"
                            getPopupContainer={(trigger) => trigger.parentNode}
                            onSelect={function (value, option) {
                              handleSelectMultipleWareHouse(value, option, item);
                            }}
                            onDeselect={function (value, option) {
                              handleDeselectMultipleWareHouse(value, option, item);
                            }}
                            onClear={() => {
                              handleClearMultipleWareHouse(item);
                            }}
                            value={item.inventories?.map((item: any) => item.store_id)}
                          >
                            {listStores?.map((item, index: number) => (
                              <CustomSelect.Option key={index} value={item.id}>
                                {item.name}
                              </CustomSelect.Option>
                            ))}
                          </CustomSelect>
                        ) : (
                          <span></span>
                        ),
                    },
                  ]}
                  dataSource={listWareHouse}
                  pagination={false}
                  rowKey={(item: any) => item.warehouse_id}
                />
              </Col>
            </Row>
          ) : (
            <span></span>
          )}

          <div className="config-setting-footer">
            {isConfigExist && allowShopsDelete ? (
              <Button
                className="delete-shop-btn"
                icon={<img src={disconnectIcon} alt="" />}
                type="ghost"
                onClick={() => handleDisconnectEcommerce()}
                disabled={isLoading}
              >
                Xóa gian hàng
              </Button>
            ) : (
              <div />
            )}

            {allowShopsUpdate && (
              <Button
                type="primary"
                htmlType="submit"
                disabled={!configDetail || isLoading}
                icon={<img src={saveIcon} alt="" />}
              >
                {isConfigExist ? "Lưu cấu hình" : "Tạo cấu hình"}
              </Button>
            )}
          </div>
        </Form>
        {isShowProcessConfigMultipleInventoryModal && (
          <ProgressConfigMultipleInventoryModal
            visible={isShowProcessConfigMultipleInventoryModal}
            onCancel={handleCancelProcess}
            onOk={handleProcessSuccess}
            progressData={progressData}
            progressPercent={progressPercent}
            isLoading={isProcessing}
          />
        )}
        <Modal
          width="600px"
          centered
          visible={isShowConfirmCancelProcess}
          title=""
          okText="Xác nhận"
          cancelText="Hủy"
          onCancel={() => setIsShowConfirmCancelProcess(false)}
          onOk={handleConfirmCancelProcess}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={DeleteIcon} alt="" />
            <div style={{ marginLeft: 15 }}>
              <strong style={{ fontSize: 16 }}>
                Bạn có chắc chắn muốn hủy cấu hình đa kho không?
              </strong>
              <div style={{ fontSize: 14 }}>
                Hệ thống sẽ dừng việc cấu hình đa kho, bạn vẫn có thể cấu hình sau nếu muốn.
              </div>
            </div>
          </div>
        </Modal>
      </StyledConfig>
    );
  };

  return (
    <AuthWrapper acceptPermissions={shopsReadPermission} passThrough>
      {(allowed: boolean) => (allowed ? renderComponent() : <NoPermission />)}
    </AuthWrapper>
  );
};

export default ConfigShop;
