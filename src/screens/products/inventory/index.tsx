import { Button, Card, Row, Space, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import RenderTabBar from "component/table/StickyTabBar";
import UrlConfig, { InventoryTabUrl } from "config/url.config";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useRouteMatch} from "react-router";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams } from "utils/useQuery";
import AllTab from "./tab/all.tab";
import HistoryTab from "./tab/history.tab";
import exportIcon from "assets/icon/export.svg";

const { TabPane } = Tabs;

const InventoryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(InventoryTabUrl.ALL);
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState<boolean>(true);
  const [stores, setStores] = useState<Array<StoreResponse>>([]);
  const {path} = useRouteMatch();
  const [vExportProduct,setVExportProduct] = useState(false);
  const [showExportModal,setShowExportModal] = useState(false);
  const [vExportInventory,setVExportInventory] = useState(false);

  useEffect(() => {
    let redirectUrl = path;
    if (redirectUrl) {
      const search = new URLSearchParams(history.location.search);
      const newPrams = {...getQueryParams(search)};
      if (newPrams) redirectUrl += `?${generateQuery(newPrams)}`;

      switch (path) {
        case  InventoryTabUrl.ALL:
          history.replace(redirectUrl);
          setActiveTab(InventoryTabUrl.ALL);
          break;
        case InventoryTabUrl.HISTORIES:
          history.replace(redirectUrl);
          setActiveTab(InventoryTabUrl.HISTORIES);
          break;
      }
    }
  }, [history, path]);

  useEffect(() => {
    setLoading(false)
    dispatch(StoreGetListAction(setStores));
  }, [dispatch]);
  return (
    <ContentContainer
      isLoading={loading}
      title="Danh sách tồn kho"
      breadcrumb={[
        {
          name: "Kho hàng",
          path: `${UrlConfig.INVENTORY}`,
        },
        {
          name: "Danh sách tồn kho",
        },
      ]}
      extra={
        activeTab === InventoryTabUrl.HISTORIES ?
        <Row>
          <Space>
              <Button
                  className="light"
                  size="large"
                  icon={<img src={exportIcon} style={{marginRight: 8}} alt="" />}
                  onClick={() => {setVExportProduct(true)}}
                >
                  Xuất file
              </Button>
          </Space>
        </Row> :
        <Row>
        <Space>
            <Button
                className="light"
                size="large"
                icon={<img src={exportIcon} style={{marginRight: 8}} alt="" />}
                onClick={() => {setShowExportModal(true)}}
              >
                Xuất tồn CH
            </Button>
            <Button
                className="light"
                size="large"
                icon={<img src={exportIcon} style={{marginRight: 8}} alt="" />}
                onClick={() => {setVExportInventory(true)}}
              >
                Xuất tồn chi tiết
            </Button>
        </Space>
      </Row>
      }
    >
      <Card style={{ padding: 0 }} className="card-tab">
        <Tabs
          style={{ overflow: "initial" }}
          activeKey={activeTab}
          onChange={(active) => history.replace(active)}
          renderTabBar={RenderTabBar}
        >
          <TabPane tab="Tồn kho" key={InventoryTabUrl.ALL}>
            <AllTab
             showExportModal={showExportModal} 
             setShowExportModal={setShowExportModal} 
             vExportInventory={vExportInventory}
             setVExportInventory={setVExportInventory}
             stores={stores} current={activeTab} />
          </TabPane>
          <TabPane tab="Lịch sử tồn kho" key={InventoryTabUrl.HISTORIES}>
            <HistoryTab vExportProduct={vExportProduct} setVExportProduct={setVExportProduct} stores={stores} current={activeTab} />
          </TabPane>
        </Tabs>
      </Card>
    </ContentContainer>
  );
};

export default InventoryScreen;
