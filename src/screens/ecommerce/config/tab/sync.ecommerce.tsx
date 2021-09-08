import CustomTable from "component/table/CustomTable";
import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { inventoryGetListAction } from "domain/actions/inventory/inventory.action";
// import { getQueryParams, useQuery } from "utils/useQuery";
// import { InventoryQuery, InventoryResponse } from "model/inventory";
// import { PageResponse } from "model/base/base-metadata.response";
// import { useHistory } from "react-router-dom";
// import { generateQuery } from "utils/AppUtils";
// import UrlConfig from "config/url.config";
import actionColumn from "../actions/action.column";
import { StyledHeader } from "./styles";
import { Button } from "antd";
import lazadaIcon from "assets/icon/lazada.png";
import shopeeIcon from "assets/icon/shopee.png";
import tikiIcon from "assets/icon/tiki.png";

const SyncEcommerce: React.FC<any> = (props: any) => {
  // const history = useHistory();
  // const query = useQuery();
  // // const dispatch = useDispatch();
  // let initQuery: InventoryQuery = {};

  // let dataQuery: InventoryQuery = {
  //   ...initQuery,
  //   ...getQueryParams(query),
  // };
  // let [params, setPrams] = useState<InventoryQuery>(dataQuery);
  // const [data, setData] = useState<PageResponse<InventoryResponse>>({
  //   metadata: {
  //     limit: 30,
  //     page: 1,
  //     total: 0,
  //   },
  //   items: [],
  // });
  // const onResult = useCallback(
  //   (result: PageResponse<InventoryResponse> | false) => {
  //     if (result) {
  //       setData(result);
  //     }
  //   },
  //   []
  // );
  // const onPageChange = useCallback(
  //   (page, size) => {
  //     params.page = page;
  //     params.limit = size;
  //     let queryParam = generateQuery(params);
  //     setPrams({ ...params });
  //     history.replace(
  //       `${UrlConfig.INVENTORY}${history.location.hash}?${queryParam}`
  //     );
  //   },
  //   [history, params]
  // );
  // useEffect(() => {
  //   if (props.current === "1") {
  //     dispatch(inventoryGetListAction(params, onResult));
  //   }
  // }, [dispatch, onResult, params, props]);

  //mock data
  const handleEdit = () => {};
  const handleDisconnect = () => {};

  const [columns] = useState<any>([
    { title: "STT", visible: true, dataIndex: "index" },
    { title: "Sàn TMĐT", visible: true, dataIndex: "img" },
    { title: "Shop ID | Tên shop", visible: true, dataIndex: "shop_id" },
    { title: "Tên gian hàng", visible: true, dataIndex: "shop_name" },
    { title: "Cửa hàng", visible: true, dataIndex: "branch_name" },
    { title: "Cập nhật tồn kho", visible: true, dataIndex: "instock_update" },
    { title: "Đồng bộ sản phẩm", visible: true, dataIndex: "product_sync" },
    { title: "Đồng bộ đơn hàng", visible: true, dataIndex: "orders_sync" },
    { title: "Nhân viên bán hàng", visible: true, dataIndex: "seller" },
    actionColumn(handleEdit, handleDisconnect),
  ]);

  const [dataMock] = useState<any>([
    {
      img: "Link Img",
      shop_id: "YD6969",
      shop_name: "YODY OFFICAL",
      branch_name: "The Sun",
      instock_update: "Tự động",
      product_sync: "Đợi ghép nối",
      orders_sync: "Tự động",
      seller: "Lê Văn Duy",
    },
  ]);
  return (
    <div className="padding-20">
      <StyledHeader>
        <Button>
          Tất cả gian hàng
        </Button>
        <Button>
          <div>
            <img src={shopeeIcon} alt="shopee" />
          </div>
          Shopee
        </Button>
        <Button>
          <div>
            <img src={tikiIcon} alt="tiki" />
          </div>
          Tiki
        </Button>
        <Button>
          <div>
            <img src={lazadaIcon} alt="lazada" />
          </div>
          Lazada
        </Button>
      </StyledHeader>
      <CustomTable
        columns={columns}
        dataSource={dataMock}
        // pagination={{
        //   pageSize: data.metadata.limit,
        //   total: data.metadata.total,
        //   current: data.metadata.page,
        //   showSizeChanger: true,
        //   onChange: onPageChange,
        //   onShowSizeChange: onPageChange,
        // }}
        rowKey={(data) => data.id}
      />
    </div>
  );
};

export default SyncEcommerce;
