import { Button, Card, Form, Image, Input, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import ButtonSetting from "component/table/ButtonSetting";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import ModalSettingColumn from "component/table/ModalSettingColumn";
import { InventoryDefectFields, InventoryDefectResponse, InventoryItemsDefectedDetail, InventorySearchItem, LineItemDefect } from "model/inventory-defects";
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
import { deleteInventoryDefect, editInventoryDefect, getListInventoryDefect } from "service/inventory/defect/index.service";
import CustomPagination from "component/table/CustomPagination";
import { PageResponse } from "model/base/base-metadata.response";
import UrlConfig from "config/url.config";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";
import { showError } from "utils/ToastUtils";
import { cloneDeep, isEmpty } from "lodash";

const initQuery: InventorySearchItem = {
  page: 1,
  limit: 30,
  // store_id: null
}



const ListInventoryDefect: React.FC = () => {
  const dispatch = useDispatch()
  const { Option } = Select;
  const { Item } = Form;
  const [showSettingColumn, setShowSettingColumn] = useState<boolean>(false)
  const [stores, setStores] = useState<Array<Store>>([])
  const query = useQuery();

  let dataQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<any>(dataQuery);
  const [loadingTable, setLoadingTable] = useState<boolean>(false)
  const [data, setData] = useState<PageResponse<InventoryDefectResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  })

  const [dataTable,setDataTable] = useState<Array<InventoryDefectResponse>>();
  const [form] = Form.useForm()
  const history = useHistory()

  const editItemDefect = useCallback(async (value: any, field: string, id: number) => {
    const listDefect = cloneDeep(dataTable) ?? [];
    console.log("dataTable",dataTable);
    
    const itemObject = listDefect.find((el: InventoryDefectResponse) => el.id === id)
    if (itemObject && !isEmpty(itemObject)) {
      const itemEdit: InventoryDefectResponse = {
        ...itemObject,
        [field]: value,
      }
      await callApiNative({ isShowError: true }, dispatch, editInventoryDefect, itemEdit)
    }
  }, [dispatch, dataTable])

  const handleDelete = useCallback(async (id: number) => {
   const res = await callApiNative({isShowError: true}, dispatch, deleteInventoryDefect, id);

  }, [dispatch]);

  // useEffect(() => {
  //   setColumn(defaultColumns);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps

  // }, [selected]);

  const onEdit  = useCallback((type: string, value: any,id: number)=>{
    if (type === "error") {
      if (isNaN(parseFloat(value))) {
        showError('Bạn cần nhập số');
        return
      }
      const numbDefect = parseInt(value)
      editItemDefect(numbDefect, InventoryDefectFields.defect, id);
    }else{
      editItemDefect(value, InventoryDefectFields.defect, id);
    }
  
  },[editItemDefect]);

  const onOk = useCallback((newDefect) => { 
    console.log("dataTable",dataTable);
    
  },[dataTable])

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
        // render: (text: string, item: InventoryDefectResponse) => {
        //   return <span>{text}</span>
        // },
        visible: true,
        render: (text: string, item: InventoryDefectResponse) => {
          return <Link to={`${UrlConfig.VARIANTS}/${item.variant_id}`}>{text}</Link>;
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
                onOk={onOk}
              // isDisable={record.status === OrderStatus.FINISHED}
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
              // isDisable={record.status === OrderStatus.FINISHED}
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
        //   render: (value: string) => <div>{ConvertUtcToLocalDate(value, DATE_FORMAT.DDMMYYY)}</div>,
      },
      {
        title: "Action",
        key: "action",
        align: "center",
        render: (value: any, item: InventoryDefectResponse, index: number) => {
          // console.log(value, item, index, '======')
          return (
            // <div style={{border: "1px solid #E24343", display: 'flex', justifyContent: "center", alignItems: "center"}}>
            <Button
              icon={
                <img style={{ marginRight: 12 }} alt="" src={deleteIcon} />
              }
              type="text"
              className=""
              style={{
                paddingLeft: 24,
                background: "transparent",
                border: "none",
                color: "red",
              }}
              onClick={() => {
                debugger
                handleDelete(item.id)
              }}
            >
              {/* Xóa */}
            </Button>
            // </div>
          )
        },
        visible: true,
        width: 60,
        // align: "center",
      },
      // {
      //     title: "",
      //     visible: true,
      //     width: "5%",
      //     className: "saleorder-product-card-action ",
      //       render: (value, row, index) => RenderActionColumn(value, row, index)
      // },
    ];
  }, [editItemDefect, handleDelete, onEdit])



  // const defaultColumns: Array<ICustomTableColumType<InventoryDefectResponse>> = 
  const [columns, setColumns] = useState<Array<ICustomTableColumType<InventoryDefectResponse>>>(initColumns);

  useEffect(() => {
    if (columns.length === 0) {
      setColumns(initColumns);
    }
  }, [columns, initColumns, setColumns]);


  const getInventoryDefects = useCallback(async () => {
    const queryString = generateQuery(params)
    const res = await callApiNative({ isShowError: true, isShowLoading: true }, dispatch, getListInventoryDefect, queryString)
    if (res) {
      setData(res);
      console.log("res.items",res.items);
      setDataTable(res.items);
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
    getStores()
    getInventoryDefects()

  }, [getStores, getInventoryDefects, params])


  // const onSelectedChange = useCallback(
  //   (selectedRow: Array<LineItemDefect>) => {
  //     const selectedRowKeys = selectedRow.map((row) => row.id);
  //     setSelectedRowKeys(selectedRowKeys);

  //     setSelected(
  //       selectedRow.filter(function (el) {
  //         return el !== undefined;
  //       })
  //     );
  //   },
  //   []
  // );

  const columnFinal = useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      setPrams({ ...params });
      let queryParam = generateQuery(params);
      history.push(`${UrlConfig.INVENTORY_DEFECTS}?${queryParam}`);
    },
    [params, history]
  );

  const onFinish = useCallback(() => {
    getInventoryDefects();
  }, [getInventoryDefects])
  return (
    <Card>
      <div className="custom-filter" style={{ paddingBottom: 20 }}>
        <Form onFinish={onFinish} layout="inline" initialValues={{}}>
          <Item style={{ flex: 1 }} name="sku" className="input-search">
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
              
            // onClear={() => formSearchRef?.current?.submit()}
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
        // isRowSelection={true}
        isLoading={loadingTable}
        pagination={false}
        dataSource={data.items}
        scroll={{ x: 1200 }}
        sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
        // onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
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
    </Card>)
}

export default ListInventoryDefect