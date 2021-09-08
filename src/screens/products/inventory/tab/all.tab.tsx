import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import InventoryFilter from "../filter/inventory.filter";
import { inventoryGetListAction } from "domain/actions/inventory/inventory.action";
import { getQueryParams, useQuery } from "utils/useQuery";
import { AllInventoryResponse, InventoryQuery, InventoryResponse } from "model/inventory";
import { PageResponse } from "model/base/base-metadata.response";
import { Link, useHistory } from "react-router-dom";
import { formatCurrency, generateQuery } from "utils/AppUtils";
import UrlConfig from "config/url.config";
import { TabProps } from "./tab.props";
import { HiChevronDoubleRight, HiOutlineChevronDoubleDown } from "react-icons/hi";

const AllTab: React.FC<TabProps> = (props: TabProps) => {
  const history = useHistory();
  const query = useQuery();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  let initQuery: InventoryQuery = {};

  let dataQuery: InventoryQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<InventoryQuery>(dataQuery);
  const [data, setData] = useState<PageResponse<AllInventoryResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const onResult = useCallback(
    (result: PageResponse<AllInventoryResponse> | false) => {
      setLoading(false);
      if (result) {
        console.log(result);
        setData(result);
      }
    },
    []
  );
  const onPageChange = useCallback(
    (page, size) => {
      params.page = page;
      params.limit = size;
      let queryParam = generateQuery(params);
      setPrams({ ...params });
      history.replace(
        `${UrlConfig.INVENTORY}${history.location.hash}?${queryParam}`
      );
    },
    [history, params]
  );

 

  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.replace(
        `${UrlConfig.INVENTORY}#1?${queryParam}`
      );
    },
    [history, params]
  );

  // const storeColumns = useMemo(() => {
  //   let stores = props.stores;
  //   if(params.store_id instanceof Array) {
  //     let arr = params.store_id;
  //     stores = props.stores.filter((value) => arr.findIndex(item1 => item1 === value.id) !== -1);
  //   }
  //   let arrCoulmns: Array<ICustomTableColumType<InventoryResponse>> = []
  //   stores.forEach((item) => {
  //     arrCoulmns.push({
  //       width: 100,
  //       title: item.name,
  //       visible: true,
  //       align: 'right',
  //       dataIndex: 'inventories',
  //       render: (value, record, index) => {
  //         let index1 = value.findIndex((item1: any) => item1.store_id === item.id);
  //         if(index1 === -1) {
  //           return '';
  //         }
  //         return value[index1].on_hand;
  //       }
  //     });
  //   })
  //   return arrCoulmns;
  // }, [params.store_id, props.stores]);

  const columnFinal = useMemo(() => {
    let columns: Array<ICustomTableColumType<InventoryResponse>> = [
      {
        width: 100,
        title: 'Ảnh',
        visible: true,
        align: 'center',
        dataIndex: '',
      },
      {
        title: 'Barcode',
        visible: true,
        dataIndex: 'barcode',
      },
      {
        title: 'Mã sản phẩm',
        visible: true,
        dataIndex: 'sku',
        align: 'center',
        render: (value, record, index) => (
          <div>
            <Link to="">{value}</Link>
          </div>
        )
      },
      {
        width: 300,
        title: 'Tên sản phẩm',
        visible: true,
        dataIndex: 'name',
        align: 'center',
      },
      {
        title: 'Giá nhập',
        visible: false,
        align: 'right',
        dataIndex: 'import_price',
        render: (value, record, index) => formatCurrency(value)
  
      },
      {
        title: 'Giá bán',
        visible: true,
        dataIndex: 'retail_price',
        align: 'right',
        render: (value, record, index) => formatCurrency(value)
      },
      {
        title: 'Tồn theo trạng thái',
        visible: true,
        dataIndex: 'total_on_hand',
        align: 'right',
        render: (value, record, index) => formatCurrency(value)
      },
    ];
    return columns;
  }, [])

  useEffect(() => {
    setLoading(true);
    dispatch(inventoryGetListAction(params, onResult));
  }, [dispatch, onResult, params]);
  return (
    <div className="padding-20">
      <InventoryFilter
        openColumn={() => {}}
        id="all"
        isMulti={true}
        onFilter={onFilter}
        params={params}
        actions={[]}
        onClearFilter={() => {}}
        listStore={props.stores}
      />
      <CustomTable
        isLoading={loading}
        dataSource={data.items}
        scroll={{ x: 900}}
        sticky={{ offsetScroll: 5, }}
        pagination={{
          pageSize: data.metadata.limit,
          total: data.metadata.total,
          current: data.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        expandable={{
          expandIcon: (props) => {
            let icon = <HiChevronDoubleRight size={12} />;
            if (props.expanded) {
              icon = (
                <HiOutlineChevronDoubleDown size={12} color="#2A2A86" />
              );
            }
            return (
              <div
                style={{ cursor: "pointer" }}
                onClick={(event) => props.onExpand(props.record, event)}
              >
                {icon}
              </div>
            );
          },
          expandedRowRender: (record: AllInventoryResponse) => (
            <CustomTable
              dataSource={record.inventories}
              rowKey={item => item.id}
              scroll={{y: 250}}
              pagination={false}
              columns={[
                {
                  title: "Kho hàng",
                  dataIndex: "store"
                },
                {
                  align: 'right',
                  title: "Tồn trong kho",
                  dataIndex: "on_hand"
                },
                {
                  align: 'right',
                  title: "Có thể bán",
                  dataIndex: "available"
                },
                {
                  align: 'right',
                  title: "Hàng tạm giữ",
                  dataIndex: "on_hold"
                },
                {
                  align: 'right',
                  title: "Hàng lỗi",
                  dataIndex: "defect"
                },
                {
                  align: 'right',
                  title: "Chờ nhập",
                  dataIndex: "in_coming"
                },
                {
                  align: 'right',
                  title: "Hàng đang chuyển đến",
                  dataIndex: "transferring"
                },
                {
                  align: 'right',
                  title: "Hàng đang chuyển đi",
                  dataIndex: "on_way"
                }
              ]}
            />
          ),
        }}
        columns={columnFinal}
        rowKey={(data) => data.id}
      />
    </div>
  );
};

export default AllTab;
