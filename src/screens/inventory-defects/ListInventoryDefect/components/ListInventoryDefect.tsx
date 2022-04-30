import { Button, Card, Form, Image, Input } from "antd";
import ButtonSetting from "component/table/ButtonSetting";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { DataRequestDefectItems, InventoryDefectFields, InventoryDefectResponse, LineItemDefect } from "model/inventory-defects";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import ImageProduct from "screens/products/product/component/image-product.component";
import search from "assets/img/search.svg";
import { primaryColor } from "utils/global-styles/variables";
import { callApiNative } from "utils/ApiUtils";
import { useDispatch } from "react-redux";
import { getStoreApi } from "service/inventory/transfer/index.service";
import EditNote from "screens/order-online/component/edit-note";
import { createInventoryDefect, deleteInventoryDefect, getListInventoryDefect } from "service/inventory/defect/index.service";
import CustomPagination from "component/table/CustomPagination";
import { PageResponse } from "model/base/base-metadata.response";
import UrlConfig from "config/url.config";
import { generateQuery, formatFieldTag, transformParamsToObject, splitEllipsis } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { showError, showSuccess } from "utils/ToastUtils";
import { cloneDeep, debounce, isArray, isEmpty } from "lodash";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import TextEllipsis from "component/table/TextEllipsis";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { StoreResponse } from "model/core/store.model";
import { DefectFilterBasicEnum, DefectFilterBasicName } from "model/inventory-defects/filter"
import { useArray } from "hook/useArray";
import BaseFilterResult from "component/base/BaseFilterResult";
import { DeleteOutlined } from "@ant-design/icons";
import EditPopover from "./EditPopover";
import { hideLoading, showLoading } from "domain/actions/loading.action";

const ListInventoryDefect: React.FC = () => {
  const dispatch = useDispatch()
  const { Item } = Form;
  const [showSettingColumn, setShowSettingColumn] = useState<boolean>(false)
  const [stores, setStores] = useState<Array<StoreResponse>>([])
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false)
  const query = useQuery();

  let dataQuery: any = useMemo(() => {
    return { ...getQueryParams(query) }
  }, [query]);

  let [params, setParams] = useState<any>(dataQuery);
  const [loadingTable, setLoadingTable] = useState<boolean>(false)
  const [itemDelete, setItemDelete] = useState<InventoryDefectResponse>()
  const { array: paramsArray, set: setParamsArray, remove, prevArray } = useArray([])
  const [data, setData] = useState<PageResponse<InventoryDefectResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  })
  const [form] = Form.useForm()
  const history = useHistory()

  const getInventoryDefects = useCallback(async () => {
    const queryString = generateQuery(params)
    const res = await callApiNative({ isShowError: true, isShowLoading: true }, dispatch, getListInventoryDefect, queryString)
    if (res) {
      setData(res);
      setLoadingTable(false)
    }
  }, [dispatch, params])

  const getStores = useCallback(async () => {
    const response = await callApiNative({ isShowError: true }, dispatch, getStoreApi, { status: "active", simple: true });
    if (response) {
      setStores(response)
    }
  }, [dispatch])

  useEffect(() => {
    getInventoryDefects()
  }, [getInventoryDefects, params])

  useEffect(() => {
    getStores()
  }, [getStores])

  const isNumeric = (value: any) => {
    return /^-?\d+$/.test(value);
  }
  const editItemDefect = useCallback(async (value: any, field: string, id: number) => {
    const listDefect = cloneDeep(data.items) ?? [];
    const itemObject = listDefect.find((el: InventoryDefectResponse) => el.id === id)
    let itemEdit: any = {}
    if (itemObject && !isEmpty(itemObject)) {
      if (InventoryDefectFields.defect === field) {
        if (!isNumeric(value)) {
          showError('Bạn cần nhập số');
          return
        }
        if (value <= 0) {
          showError('Số lỗi không được nhỏ hơn 1');
          return
        }
        if (itemObject.defect === value) {
          value = 0
        } else {
          value = value - itemObject.defect
        }
        itemEdit = { ...itemObject, [field]: value }
      } else {
        itemEdit = { ...itemObject, [field]: value, [InventoryDefectFields.defect]: 0 }
      }
      const itemSubmit: DataRequestDefectItems = {
        store: itemObject.store,
        store_id: itemObject.store_id,
        items: [itemEdit]
      }
      // phía BE viết chức năng update và create chung 1 api
      dispatch(showLoading())
      const res = await callApiNative({ isShowError: true }, dispatch, createInventoryDefect, itemSubmit)
      if (res) {
        // BE yêu cầu chờ 3s để đồng bộ ES
        setTimeout(() => {
          getInventoryDefects()
          showSuccess('Sửa sản phẩm thành công')
        }, 3000)
      } else {
        dispatch(hideLoading())
      }
    }
  }, [dispatch, data, getInventoryDefects])

  const handleDelete = useCallback(async (id: number) => {
    dispatch(showLoading())
    const response = await callApiNative({ isShowError: true }, dispatch, deleteInventoryDefect, id);
    if (response) {
      // BE yêu cầu chờ 3s để đồng bộ ES
      setTimeout(() => {
        getInventoryDefects()
        showSuccess('Xóa sản phẩm thành công')
        // dispatch(hideLoading())
      }, 3000)
    } else {
      dispatch(hideLoading())
    }
  }, [dispatch, getInventoryDefects]);

  const initColumns: Array<ICustomTableColumType<InventoryDefectResponse>> = useMemo(() => {
    return [
      {
        title: "Ảnh",
        align: "center",
        dataIndex: "variant_image",
        width: 70,
        render: (value: string) => {
          // let url = null;
          // value.variant_images?.forEach((item) => {
          //     if (item.product_avatar) {
          //       url = item.url;
          //     }
          //   });
          return (
            <>
              {value ? <Image width={40} height={40} placeholder="Xem" src={value ?? ""} /> : <ImageProduct disabled={true} onClick={undefined} path={value} />}
            </>
          );
        },
        visible: true,
      },
      {
        title: "Sản phẩm",
        width: 200,
        dataIndex: "sku",
        align: 'left',
        fixed: "left",
        visible: true,
        render: (value: string, item: InventoryDefectResponse) => {
          let strName = (item.name.trim());
          strName = window.screen.width >= 1920 ? splitEllipsis(strName, 100, 30)
            : window.screen.width >= 1600 ? strName = splitEllipsis(strName, 60, 30)
              : window.screen.width >= 1366 ? strName = splitEllipsis(strName, 47, 30) : strName;
          return (
            <>
              <div>
                <Link className="yody-text-ellipsis" to={`${UrlConfig.PRODUCT}/${item.product_id}${UrlConfig.VARIANTS}/${item.variant_id}`}>
                  {value}
                </Link>
              </div>
              <TextEllipsis value={strName ?? ""} line={1}></TextEllipsis>
            </>
          )
        },
      },
      {
        title: "Cửa hàng",
        dataIndex: "store",
        align: "center",
        visible: true,
        width: 200,
        render: (text: string, item: InventoryDefectResponse) => {
          return <span>{text}</span>
        },
      },
      {
        title: "Số lỗi ",
        dataIndex: "defect",
        width: 100,
        align: "center",
        visible: true,
        render: (value, item: InventoryDefectResponse) => {
          return (
            <div className="single">
              <EditPopover
                content={item.defect}
                title="Sửa số lỗi: "
                label="Số lỗi: "
                color={primaryColor}
                onOk={(newNote) => {
                  editItemDefect(newNote, InventoryDefectFields.defect, item.id);
                }}
              />
            </div>
          )
        }
      },
      {
        title: "Số tồn",
        dataIndex: "on_hand",
        width: 100,
        align: "center",
        visible: true,
        render: (text: string, item: InventoryDefectResponse) => {
          return <span>{text ?? ""}</span>
        },
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        width: 200,
        visible: true,
        render: (value: string, item: InventoryDefectResponse) => {
          return (
            <div className="single">
              <EditNote
                note={item.note}
                title="Ghi chú: "
                color={primaryColor}
                onOk={(newNote) => {
                  editItemDefect(newNote, InventoryDefectFields.note, item.id);
                }}
              />
            </div>
          );
        },
      },
      {
        title: "Thời gian",
        width: 120,
        dataIndex: "created_date",
        visible: true,
        align: "center",
        render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
      },
      {
        key: "action",
        render: (value: any, item: InventoryDefectResponse, index: number) => {
          return (
            <Button
              type="text"
              className=""
              style={{
                background: "transparent",
                border: "solid 1px red",
                padding: 0,
                width: '40px'
              }}
              onClick={() => {
                setItemDelete(item)
                setConfirmDelete(true)
              }}
            >
              <DeleteOutlined style={{fontSize: 18, color: 'red'}}/>
            </Button>
          )
        },
        visible: true,
        width: 60,
        align: "center",
      },
    ];
  }, [editItemDefect, setItemDelete])

  const [columns, setColumns] = useState<Array<ICustomTableColumType<InventoryDefectResponse>>>(initColumns);

  useEffect(() => {
    setColumns(initColumns);
  }, [initColumns, setColumns]);

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setParams({ ...params });
      let queryParam = generateQuery(params);
      history.replace(`${UrlConfig.INVENTORY_DEFECTS}?${queryParam}`);
    },
    [params, history]
  );

  const onFinish = useCallback((data) => {
    const newParam = { ...params, ...data }
    setParams(newParam)
    const queryParam = generateQuery(newParam)
    history.replace(`${UrlConfig.INVENTORY_DEFECTS}?${queryParam}`);
  }, [history, params])

  const onSearch = debounce((value) => {
    const newParam = { ...params, [DefectFilterBasicEnum.condition]: value }
    setParams(newParam)
    const queryParam = generateQuery(newParam)
    history.replace(`${UrlConfig.INVENTORY_DEFECTS}?${queryParam}`);
  }, 300)

  useEffect(() => {
    form.setFieldsValue({
      [DefectFilterBasicEnum.condition]: params.condition?.toString()?.split(','),
      [DefectFilterBasicEnum.store_ids]: params.store_ids?.toString()?.split(',').map((x: string) => parseInt(x)),
    })
  }, [form, params]);

  useEffect(() => {
    (async () => {
      if (paramsArray.length < (prevArray?.length || 0)) {
        let newParams = transformParamsToObject(paramsArray)
        setParams(newParams)
        await history.replace(`${history.location.pathname}?${generateQuery(newParams)}`)
      }
    })();
  }, [paramsArray, history, prevArray])

  useEffect(() => {
    const newParams = { ...params }

    const formatted = formatFieldTag(newParams, { ...DefectFilterBasicName })
    const transformParams = formatted.map((item) => {
      switch (item.keyId) {
        case DefectFilterBasicEnum.store_ids:
          if (isArray(item.valueId)) {
            const filterStore = stores?.filter((elem) => item.valueId.find((id: number) => +elem.id === +id));
            if (filterStore)
              return { ...item, valueName: filterStore?.map((item: any) => item.name).toString() }
          }
          const findStore = stores?.find(store => +store.id === +item.valueId)
          return { ...item, valueName: findStore?.name }
        case DefectFilterBasicEnum.condition:
          return { ...item, valueName: item.valueId.toString() }
        default:
          return item
      }
    })
    setParamsArray(transformParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, JSON.stringify(stores), setParamsArray])

  const onRemoveStatus = useCallback((index: number) => {
    remove(index)
  }, [remove])

  return (
    <Card>
      <Form onFinish={onFinish} layout="inline" initialValues={{}} form={form}>
        <Item style={{ flex: 1 }} name={DefectFilterBasicEnum.condition} className="input-search">
          <Input
            allowClear
            prefix={<img src={search} alt="" />}
            placeholder="Tìm kiếm theo mã vạch, sku, tên sản phẩm"
            onChange={(e) => {
              const value: string = e.target.value
              onSearch(value)
            }}
          />
        </Item>
        <Item name={DefectFilterBasicEnum.store_ids} style={{ minWidth: 250 }}>
          <TreeStore
            form={form}
            name={DefectFilterBasicEnum.store_ids}
            placeholder="Chọn cửa hàng"
            listStore={stores}
          />
        </Item>
        <Item>
          <Button htmlType="submit" type="primary">
            Lọc
          </Button>
        </Item>
        <Item>
          <ButtonSetting onClick={() => setShowSettingColumn(true)} />
        </Item>
      </Form>
      <div style={{ marginTop: paramsArray.length > 0 ? 10 : 20 }}>
        <BaseFilterResult data={paramsArray} onClose={onRemoveStatus} />
      </div>
      <CustomTable
        className="small-padding"
        bordered
        isLoading={loadingTable}
        pagination={false}
        dataSource={data.items}
        scroll={{x: "max-content"}}
        sticky={{offsetScroll: 5, offsetHeader: 55}}
        columns={columnFinal}
        rowKey={(item: LineItemDefect) => item.id}
      />
      <ModalSettingColumn
        visible={showSettingColumn}
        onCancel={() => setShowSettingColumn(false)}
        onOk={(data) => {
          setShowSettingColumn(false);
          setColumns(data);
        }}
        data={columns}
      />
      <CustomPagination
        pagination={{
          showSizeChanger: true,
          pageSize: data.metadata.limit,
          current: data.metadata.page,
          total: data.metadata.total,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
      />
      {itemDelete && <ModalDeleteConfirm
        onCancel={() => setConfirmDelete(false)}
        onOk={() => {
          handleDelete(itemDelete.id)
          setConfirmDelete(false);
        }}
        title={<div>Bạn chắc chắn xóa sản phẩm <span style={{color: '#11006f'}}>{itemDelete.name}</span> ?</div>}
        visible={isConfirmDelete}
      />}
    </Card>)
}

export default ListInventoryDefect