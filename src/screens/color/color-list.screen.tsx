import { Button, Card, Form, Input, Image, Select  } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import search from 'assets/img/search.svg';
import ButtonSetting from "component/table/ButtonSetting";
import { getQueryParams, useQuery } from "utils/useQuery";
import { generateQuery } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import { PageResponse } from "model/response/base-metadata.response";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import {showWarning} from 'utils/ToastUtils';
import CustomTable from "component/table/CustomTable";
import { ColorResponse } from "model/response/products/color.response";
import { ColorSearchQuery } from "model/query/color.search.query";
import imgDefault from 'assets/icon/img-default.svg'
import { colorDeleteAction, colorDeleteManyAction, getColorAction } from "domain/actions/product/color.action";
import {isUndefinedOrNull} from 'utils/AppUtils'

const action: Array<MenuAction> = [
  {
    id: 1,
    name: "Xóa"
  },
  {
    id: 1,
    name: "Export"
  },
]

const {Option} = Select;
const ColorListScreen: React.FC = () => {
  const [selected, setSelected] = useState<Array<ColorResponse>>([])
  const [data, setData] = useState<PageResponse<ColorResponse>>({
    metadata: {
      limit: 0,
      page: 0,
      total: 0,
    },
    items: [],
  });
  const [selector, setSelector] = useState<PageResponse<ColorResponse>>({
    metadata: {
      limit: 0,
      page: 0,
      total: 0,
    },
    items: [],
  });
  const history = useHistory();
  const dispatch = useDispatch();
  const query = useQuery();
  let [params, setPrams] = useState<ColorSearchQuery>(getQueryParams(query));
  const columns = [
    {
      title: 'Mã màu',
      dataIndex: 'code',
      render: (value: string, item: ColorResponse) => {
        return <Link to={`colors/${item.id}`}>{value}</Link>
      }
    },
    {
      title: 'Tên màu',
      dataIndex: 'name',
    },
    {
      title: 'Màu chủ đạo',
      dataIndex: 'parent_id',
    },
    {
      title: 'Màu hex',
      dataIndex: 'hex_code',
      render: (value: string) => value!== null ? `#${value}` : ''
    },
    {
      title: 'Ảnh màu',
      dataIndex: 'image',
      render: (value: string) => {
        return  !isUndefinedOrNull(value) && value !== '' ? <Image width={40} src={value} placeholder={<img alt="" src={imgDefault} />}  /> : ''
      }
    },
    {
      title: 'Người tạo',
      dataIndex: 'created_name',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'description',
    },
    {
      title: () => <ButtonSetting />,
      width: 70
    },
  ];
  const onDeleteSuccess = useCallback(() => {
    selected.splice(0, selected.length);
    dispatch(getColorAction(params, setData));
  }, [dispatch, params, selected])
  const onDelete = useCallback(() => {
    if(selected.length === 0) {
      showWarning('Vui lòng chọn phần từ cần xóa');
      return;
    }
    if(selected.length === 1) {
      let id = selected[0].id;
      dispatch(colorDeleteAction(id, onDeleteSuccess))
      return;
    }
    let ids: Array<number> = [];
    selected.forEach((a) => ids.push(a.id));
    dispatch(colorDeleteManyAction(ids, onDeleteSuccess))
  }, [dispatch, onDeleteSuccess, selected]);
  const onSelect = useCallback((selectedRow: Array<ColorResponse>) => {
    setSelected(selectedRow);
  }, []);
  const onFinish = useCallback((values) => {
    let newPrams = { ...params, ...values, page: 0 };
    setPrams(newPrams);
    let queryParam = generateQuery(newPrams);
    history.push(`/colors?${queryParam}`);
  }, [history, params]);
  const onPageChange = useCallback((size, page) => {
    params.page = page - 1;
    params.limit = size
    let queryParam = generateQuery(params);
    setPrams({ ...params });
    history.replace(`/colors?${queryParam}`);
  }, [history, params]);
  const onMenuClick = useCallback((index: number) => {
    switch (index) {
      case 0:
        onDelete();
        break;
    }
  }, [onDelete]);
  useEffect(() => {
    dispatch(getColorAction(params, setData));
    dispatch(getColorAction({is_main_color: 1}, setSelector));
    return () => {}
  }, [dispatch, params])
  return (
    <div>
      <Card className="contain">
        <Card
          className="view-control"
          style={{ display: 'flex' }}
          bordered={false}
        >
          <Form
            className="form-search"
            size="middle"
            onFinish={onFinish}
            initialValues={params}
            layout="inline"
          >
            <ActionButton onMenuClick={onMenuClick} menu={action} />
            <div className="right-form">
              <Form.Item className="form-group form-group-with-search" name="info">
                <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Tên/Mã màu sắc" />
              </Form.Item>
              <Form.Item className="form-group form-group-with-search" name="parent_id">
                <Select placeholder="Chọn màu chủ đạo" className="select-with-search"  style={{width: 250}}>
                  <Option value="">Chọn màu chủ đạo</Option>
                  {selector.items.map((item) => <Option key={item.id} value={item.id}>{item.name}</Option>)}
                </Select>
              </Form.Item>
              <Form.Item className="form-group form-group-with-search" name="hex_code">
                <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Mã hex" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" className="yody-search-button">Lọc</Button>
              </Form.Item>
            </div>
          </Form>
        </Card>
        <CustomTable
          onSelectedChange={onSelect}
          onChange={onPageChange}
          className="yody-table"
          pagination={data.metadata}
          dataSource={data.items}
          columns={columns}
          rowKey={(item: ColorResponse) => item.id}
        />
      </Card>
    </div>
  )
}

export default ColorListScreen;
