import {Button, Card, Form, Input, Select, Tooltip} from 'antd';
import {Link, useHistory} from 'react-router-dom';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  categoryDeleteAction,
  getCategoryRequestAction,
} from 'domain/actions/product/category.action';
import {RootReducerType} from 'model/reducers/RootReducerType';
import {getQueryParams, useQuery} from 'utils/useQuery';
import search from 'assets/img/search.svg';
import {CategoryParent, CategoryView} from 'model/product/category.model';
import {MenuAction} from 'component/table/ActionButton';
import {CategoryResponse, CategoryQuery} from 'model/product/category.model';
import {convertCategory, generateQuery} from 'utils/AppUtils';
import CustomTable from 'component/table/CustomTable';
import UrlConfig from 'config/UrlConfig';
import CustomFilter from 'component/table/custom.filter';
import {StarOutlined} from '@ant-design/icons';
import ContentContainer from 'component/container/content.container';
import ButtonCreate from 'component/header/ButtonCreate';
import { showSuccess, showWarning } from 'utils/ToastUtils';
import { hideLoading, showLoading } from 'domain/actions/loading.action';
import ModalConfirm from 'component/modal/ModalConfirm';
import {RiDeleteBin5Line} from 'react-icons/ri'

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: 'Chỉnh sửa',
  },
  {
    id: 2,
    name: 'Xóa',
  },
  {
    id: 3,
    name: 'Export',
  },
];

const {Item} = Form;

var idDelete = -1;
const Category = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  let getParams: CategoryQuery = getQueryParams(query);
  if (!getParams.goods) {
    getParams.goods = '';
  }
  const [params, setPrams] = useState<CategoryQuery>(getParams);
  const [data, setData] = useState<Array<CategoryView>>([]);
  const [selected, setSelected] = useState<Array<CategoryView>>([]);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const goods = useMemo(() => {
    if (bootstrapReducer.data && bootstrapReducer.data.goods) {
      return bootstrapReducer.data.goods;
    }
    return [];
  }, [bootstrapReducer]);
  const columns = [
    {
      title: "Mã danh mục",
      dataIndex: "code",
      render: (text: string, item: CategoryView) => {
        return <Link to={`${UrlConfig.CATEGORIES}/${item.id}`}>{text}</Link>;
      },
    },
    {
      title: "Ngành hàng",
      dataIndex: "goods_name",
    },

    {
      title: "Danh mục",
      dataIndex: "name",
      render: (value: string, item: CategoryView) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          {item.level > 0 && (
            <div
              style={{
                borderRadius: 2,
                width: 20 * item.level,
                height: 3,
                background: "rgba(42, 42, 134, 0.2)",
                marginRight: 8,
              }}
            />
          )}
          <span>{value}</span>
        </div>
      ),
    },
    {
      title: "Thuộc danh mục",
      dataIndex: "parent",
      render: (item: CategoryParent) => (item != null ? item.name : ""),
    },
    {
      title: "Người tạo",
      dataIndex: "created_name",
    },
  ];
  const onFinish = useCallback(
    (values: CategoryQuery) => {
      let query = generateQuery(values);
      setPrams({ ...values });
      return history.replace(`${UrlConfig.CATEGORIES}?${query}`);
    },
    [history]
  );
  const onGetSuccess = useCallback((results: Array<CategoryResponse>) => {
    let newData: Array<CategoryView> = convertCategory(results);
    setData(newData);
    setLoading(false);
  }, []);
  const onDeleteSuccess = useCallback(() => {
    setSelected([]);
    dispatch(hideLoading());
    showSuccess('Xóa danh mục thành công');
    dispatch(getCategoryRequestAction(params, onGetSuccess));
  }, [dispatch, onGetSuccess, params]);
  const onMenuClick = useCallback(
    (index: number) => {
      if (selected.length > 0) {
        let id = selected[0].id;
        switch (index) {
          case 1:
            history.push(`${UrlConfig.CATEGORIES}/${id}`);
            break;
          case 2:
            idDelete = id;
            setConfirmDelete(true);
            break;
          case 3:
            break;
        }
      } else {
        if(index !== 3) {
          showWarning('Vui lòng chọn ít nhất 1 danh mục để thao tác')
        }
      }
    },
    [selected, history]
  );

  const menuFilter = useMemo(() => {
    return actions.filter((item) => {
      if (selected.length > 1) {
        return item.id !== 1 && item.id !== 2;
      }
      return true;
    });
  }, [selected]);
  const onSelect = useCallback((selectedRow: Array<CategoryView>) => {
    setSelected(selectedRow);
  }, []);
  useEffect(() => {
    setLoading(true);
    dispatch(getCategoryRequestAction(params, onGetSuccess));
  }, [dispatch, onGetSuccess, params]);
  return (
    <ContentContainer
      title="Quản lý danh mục"
      breadcrumb={[
        {
          name: 'Tổng quản',
          path: UrlConfig.HOME,
        },
        {
          name: 'Sản phẩm',
          path: `${UrlConfig.PRODUCT}`,
        },
        {
          name: 'Danh mục',
          path: `${UrlConfig.CATEGORIES}`,
        },
      ]}
      extra={<ButtonCreate path={`${UrlConfig.CATEGORIES}/create`} />}
    >
      <Card>
        <CustomFilter menu={menuFilter} onMenuClick={onMenuClick}>
          <Form onFinish={onFinish} layout="inline" initialValues={params}>
            <Item name="query">
              <Input
                prefix={<img src={search} alt="" />}
                style={{width: 200}}
                placeholder="Tên/Mã danh mục"
              />
            </Item>
            <Item name="goods">
              <Select
                style={{
                  width: 200,
                }}
              >
                <Select.Option value="">Ngành hàng</Select.Option>
                {goods.map((item, index) => (
                  <Select.Option key={index} value={item.value}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Item>
            <Item>
              <Button htmlType="submit" type="primary">
                Lọc
              </Button>
            </Item>
            <Item>
              <Tooltip overlay="Lưu bộ lọc" placement="top">
                <Button icon={<StarOutlined />} />
              </Tooltip>
            </Item>
          </Form>
        </CustomFilter>
        <CustomTable
          isLoading={loading}
          onSelectedChange={onSelect}
          pagination={false}
          dataSource={data}
          columns={columns}
          rowKey={(item: CategoryResponse) => item.id}
        />
      </Card>
      <ModalConfirm 
        cancelText="Không" 
        okText="Có" 
        onCancel={() => setConfirmDelete(false)} 
        onOk={() => {
          setConfirmDelete(false);
          dispatch(showLoading());
          dispatch(categoryDeleteAction(idDelete, onDeleteSuccess));
        }}
        icon={<RiDeleteBin5Line />} 
        title="Bạn chắc chắn xóa danh mục ?"
        subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
        visible={isConfirmDelete} 
        colorIcon="#FFFFFF"
        bgIcon="#EB5757"
      />
    </ContentContainer>
  );
};

export default Category;
