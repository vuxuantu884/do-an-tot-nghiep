import { Button, Card, Form, Image, Input, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import ButtonSetting from "component/table/ButtonSetting";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { DataRequestDefectItems, InventoryDefectFields, InventoryDefectResponse, InventorySearchItem, LineItemDefect } from "model/inventory-defects";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import ImageProduct from "screens/products/product/component/image-product.component";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import search from "assets/img/search.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import { primaryColor } from "utils/global-styles/variables";
import { callApiNative } from "utils/ApiUtils";
import { useDispatch } from "react-redux";
import { getStoreApi } from "service/inventory/transfer/index.service";
import { Store } from "antd/lib/form/interface";
import EditNote from "screens/order-online/component/edit-note";
import { createInventoryDefect, deleteInventoryDefect, getListInventoryDefect } from "service/inventory/defect/index.service";
import CustomPagination from "component/table/CustomPagination";
import { PageResponse } from "model/base/base-metadata.response";
import UrlConfig from "config/url.config";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { showError, showSuccess } from "utils/ToastUtils";
import { cloneDeep, isEmpty } from "lodash";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";

const initQuery: InventorySearchItem = {
  page: 1,
  limit: 30,
  store_id: null,
  condition: null,
}

const ListInventoryDefect: React.FC = () => {
  const dispatch = useDispatch()
  const { Option } = Select;
  const { Item } = Form;
  const [showSettingColumn, setShowSettingColumn] = useState<boolean>(false)
  const [stores, setStores] = useState<Array<Store>>([])
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false)
  const query = useQuery();

  let dataQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setParams] = useState<any>(dataQuery);
  const [loadingTable, setLoadingTable] = useState<boolean>(false)
  const [itemDeleteId, setItemDeleteId] = useState<number>(0)
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
      const res = await callApiNative({ isShowError: true }, dispatch, createInventoryDefect, itemSubmit)
      if (res) {
        getInventoryDefects()
        showSuccess('Sửa sản phẩm thành công')
      } else {
        showError('Sửa sản phẩm không thành công')
      }
    }
  }, [dispatch, data, getInventoryDefects])

  const handleDelete = useCallback(async (id: number) => {
    await callApiNative({ isShowError: true }, dispatch, deleteInventoryDefect, id);
    showSuccess('Xóa sản phẩm thành công')
    getInventoryDefects()
  }, [dispatch, getInventoryDefects]);

  const initColumns: Array<ICustomTableColumType<InventoryDefectResponse>> = useMemo(() => {
    return [
      {
        title: "Ảnh",
        align: "center",
        width: 70,
        fixed: "left",
        render: (value, item: InventoryDefectResponse) => {
          return (
            <>
              {item.image_url ? <Image width={40} height={40} placeholder="Xem" src={item.image_url ?? ""} /> : <ImageProduct disabled={true} onClick={undefined} path={item.image_url} />}
            </>
          );
        },
        visible: true,
      },
      {
        title: "Sản phẩm",
        width: 200,
        dataIndex: "sku",
        align: 'center',
        fixed: "left",
        visible: true,
        render: (text: string, item: InventoryDefectResponse) => {
          return (
            <>
            <div>
              (<Link to={`${UrlConfig.PRODUCT}/${item.product_id}${UrlConfig.VARIANTS}/${item.variant_id}`}>{text}</Link>);
            </div>
            <div>{item.variant_name}</div>
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
              <EditNote
                note={item.defect}
                title="Số lỗi: "
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
        width: 100,
        dataIndex: "created_date",
        visible: true,
        render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>,
      },
      {
        key: "action",
        render: (value: any, item: InventoryDefectResponse, index: number) => {
          return (
            <Button
              icon={
                <img alt="" src={deleteIcon} />
              }
              type="text"
              className=""
              style={{
                background: "transparent",
                border: "none",
                color: "red",
              }}
              onClick={() => {
                setItemDeleteId(item.id)
                setConfirmDelete(true)
              }}
            >
            </Button>
          )
        },
        visible: true,
        width: 70,
        align: "center",
      },
    ];
  }, [editItemDefect, setItemDeleteId])

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
      history.push(`${UrlConfig.INVENTORY_DEFECTS}?${queryParam}`);
    },
    [params, history]
  );

  const onFinish = useCallback(async (value) => {
    const newParam = { ...params, store_id: value.store_id, condition: value.condition }
    setParams(newParam)
    const queryParam = generateQuery(newParam)
    history.push(`${UrlConfig.INVENTORY_DEFECTS}?${queryParam}`);
  }, [history, params])

  return (
    <Card>
      <div className="custom-filter" style={{ paddingBottom: 20 }}>
        <Form onFinish={onFinish} layout="inline" initialValues={{}} form={form}>
          <Item style={{ flex: 1 }} name="condition" className="input-search">
            <Input

              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo mã vạch, sku, tên sản phẩm"
            // onBlur={(e) => {
            //   formSearchRef?.current?.setFieldsValue({
            //     code: e.target.value.trim(),
            //   });
            // }}
            />
          </Item>
          <Item name="store_id">
            <CustomSelect
              style={{
                width: 150,
              }}
              allowClear={true}
              placeholder="Chọn cửa hàng"
              showArrow
              showSearch
              optionFilterProp="children"
            >
              {Array.isArray(stores) &&
                stores.length > 0 &&
                stores.map((item, index) => (
                  <Option key={"defects_store_id" + index} value={item.id.toString()}>
                    {item.name}
                  </Option>
                ))}
            </CustomSelect>
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
      </div>
      <CustomTable
        bordered
        isLoading={loadingTable}
        pagination={false}
        dataSource={data.items}
        scroll={{ x: 1200 }}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
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
      <ModalDeleteConfirm
        onCancel={() => setConfirmDelete(false)}
        onOk={() => {
          handleDelete(itemDeleteId)
          setConfirmDelete(false);
        }}
        title="Bạn chắc chắn xóa sản phẩm này?"
        visible={isConfirmDelete}
      />
    </Card>)
}

export default ListInventoryDefect