import { Button, Card, Form, Input, Select } from "antd";
import { Link, useHistory } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { categoryDeleteAction, getCategoryRequestAction } from "domain/actions/product/category.action";
import { RootReducerType } from "model/reducers/RootReducerType";
import { getQueryParams, useQuery } from "utils/useQuery";
import search from "assets/img/search.svg";
import {
  CategoryParent,
  CategoryView,
} from "model/other/Product/category-view";
import ButtonSetting from "component/table/ButtonSetting";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import { CategoryResponse } from "model/response/product/category.response";
import { convertCategory, generateQuery } from "utils/AppUtils";
import { CategoryQuery } from "model/query/category.query";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";

const actions: Array<MenuAction> = [
  {
    id: 1,
    name: "Chỉnh sửa",
  },
  {
    id: 2,
    name: "Xóa",
  },
  {
    id: 3,
    name: "Export",
  },
];

const Category = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  let getParams: CategoryQuery = getQueryParams(query);
  if (!getParams.goods) {
    getParams.goods = "";
  }
  const [params, setPrams] = useState<CategoryQuery>(getParams);
  const [data, setData] = useState<Array<CategoryView>>([]);
  const [selected, setSelected] = useState<Array<CategoryView>>([]);
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
      title: "Ngành hàng",
      dataIndex: "goods_name",
    },
    {
      title: "Người tạo",
      dataIndex: "created_name",
    },
    {
      title: () => <ButtonSetting />,
      width: 70,
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
  }, []);
  const onDeleteSuccess = useCallback(
    () => {
      setSelected([]);
      dispatch(getCategoryRequestAction(params, onGetSuccess));
    },
    [dispatch, onGetSuccess, params]
  );
  const onMenuClick = useCallback((index: number) => {
    if(selected.length > 0) {
      let id = selected[0].id
      switch (index) {
        case 1:
          history.push(`${UrlConfig.CATEGORIES}/${id}`)
          break;
        case 2:
          dispatch(categoryDeleteAction(id, onDeleteSuccess))
          break;
        case 3:
          break;
      }
    }
  }, [selected, history, dispatch, onDeleteSuccess]);

  
  const menuFilter = useMemo(() => {
    return actions.filter((item) => {
      if (selected.length > 1) {
        return item.id !== 1 && item.id !== 2;
      }
      return true;
    });
  }, [selected]);
  const onSelect = useCallback(
    (selectedRow: Array<CategoryView>) => {
      setSelected(selectedRow);
    },
    []
  );
  useEffect(() => {
    dispatch(getCategoryRequestAction(params, onGetSuccess));
  }, [dispatch, onGetSuccess, params]);
  return (
    <div>
      <Card className="contain">
        <Card className="view-control" bordered={false}>
          <Form
            className="form-search"
            onFinish={onFinish}
            initialValues={params}
            layout="inline"
          >
            <ActionButton disabled={selected.length === 0} onMenuClick={onMenuClick} menu={menuFilter} />
            <div className="right-form">
              <Form.Item
                className="form-group form-group-with-search"
                name="name"
              >
                <Input
                  prefix={<img src={search} alt="" />}
                  style={{ width: 250 }}
                  placeholder="Tên/Mã danh mục"
                />
              </Form.Item>
              <Form.Item
                className="form-group form-group-with-search"
                name="goods"
              >
                <Select
                  className="select-with-search"
                  style={{
                    width: 250,
                  }}
                >
                  <Select.Option value="">Ngành hàng</Select.Option>
                  {goods.map((item, index) => (
                    <Select.Option key={index} value={item.value}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="yody-search-button"
                >
                  Lọc
                </Button>
              </Form.Item>
            </div>
          </Form>
        </Card>
        <CustomTable
          onSelectedChange={onSelect}
          className="yody-table"
          pagination={false}
          dataSource={data}
          columns={columns}
          rowKey={(item: CategoryResponse) => item.id}
        />
      </Card>
    </div>
  );
};

export default Category;
