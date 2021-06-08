import { Button, Card, Form, Input, Select } from "antd";
import ActionButton from "component/table/ActionButton";
import search from 'assets/img/search.svg';
import CustomTable from "component/table/CustomTable";
import { SizeResponse } from "model/response/products/size.response";
import { Link, useHistory } from "react-router-dom";
import ButtonSetting from "component/table/ButtonSetting";
import { useCallback, useEffect, useState } from "react";
import { PageResponse } from "model/response/base-metadata.response";
import { SizeQuery } from "model/query/size.query";
import { getQueryParams, useQuery } from "utils/useQuery";
import { generateQuery } from "utils/AppUtils";
import { useDispatch } from "react-redux";
import { sizeSearchAction } from "domain/actions/product/size.action";

const {Option} = Select;
const selected: Array<SizeResponse> = [];
const SizeListScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  let [params, setPrams] = useState<SizeQuery>(getQueryParams(query));
  const [data, setData] = useState<PageResponse<SizeResponse>>({
    metadata: {
      limit: 0,
      page: 0,
      total: 0,
    },
    items: [],
  })
  const columns = [
    {
      title: 'Kích cỡ',
      dataIndex: 'code',
      render: (value: string, item: SizeResponse) => {
        return <Link to={`sizes/${item.id}`}>{value}</Link>
      }
    },
    {
      title: 'Danh mục',
      dataIndex: 'categories',
    },
    {
      title: 'Người tạo',
      dataIndex: 'created_name',
    },
    {
      title: () => <ButtonSetting />,
      width: 70
    },
  ];
  const onPageChange = useCallback((size, page) => {
    params.page = page - 1;
    params.limit = size
    let queryParam = generateQuery(params);
    setPrams({ ...params });
    history.replace(`/colors?${queryParam}`);
  }, [history, params]);
  const onSelect = useCallback((record: SizeResponse) => {
    let index = selected.findIndex((item) => item.id === record.id);
    if(index === -1) {
      selected.push(record);
      return;
    }
    selected.splice(index, 1);
  }, []);
  useEffect(() => {
    dispatch(sizeSearchAction(params,setData));
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
            layout="inline"
          >
            <ActionButton />
            <div className="right-form">
              <Form.Item className="form-group form-group-with-search" name="info">
                <Input prefix={<img src={search} alt="" />} style={{ width: 250 }} placeholder="Tên/Mã màu sắc" />
              </Form.Item> 
              <Form.Item className="form-group form-group-with-search" name="parent_id">
                <Select placeholder="Chọn màu chủ đạo" className="select-with-search"  style={{width: 250}}>
                  <Option value="">Chọn màu chủ đạo</Option>
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
          onSelect={onSelect}
          onChange={onPageChange}
          className="yody-table"
          pagination={data.metadata}
          dataSource={data.items}
          columns={columns}
          rowKey={(item: SizeResponse) => item.id}
        />
       </Card>
    </div>
  )
}

export default SizeListScreen;