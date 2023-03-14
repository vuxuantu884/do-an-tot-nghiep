import { Button, Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import CustomSelect from "component/custom/select.custom";
import UrlConfig from "config/url.config";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import { useCallback, useEffect, useState } from "react";
import { ecommerceGetApi } from "service/ecommerce/ecommerce.service";
import { generateQuery } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";
import AutoReplyTab from "./AutoReplyTab";
import { StyledAutoReply } from "./styled";

type Props = {};

function AutoReply(props: Props) {
  const [shopsData, setShopsData] = useState<EcommerceResponse[]>([]);
  const [shopID, setShopID] = useState<any>(null);
  const [shopName, setShopName] = useState<any>("");
  const [activeTab, setActiveTab] = useState<string>("1");
  const [isAddAutoReply, setIsAddAutoReply] = useState(false);

  const getShopsData = useCallback(async () => {
    try {
      const res = await ecommerceGetApi(generateQuery({ ecommerce_id: 1 }));
      if (!res.errors) {
        setShopsData(res.data);
      } else {
        res.errors.forEach((error: string) => {
          showError(error);
        });
      }
    } catch (error) {
      showError("Lỗi lấy danh sách phản hồi !!!");
    }
  }, []);

  useEffect(() => {
    getShopsData();
  }, [getShopsData]);

  return (
    <StyledAutoReply>
      <ContentContainer
        title="Phản hồi tự động"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: `${UrlConfig.HOME}`,
          },
          {
            name: "Sàn TMĐT",
          },
          {
            name: " Công cụ",
          },
          {
            name: "Phản hồi tự động",
          },
        ]}
      >
        <Card>
          <p>Lựa chọn gian hàng</p>
          <CustomSelect
            style={{ width: "300px" }}
            showArrow
            maxTagCount="responsive"
            showSearch
            placeholder="Chọn gian hàng"
            notFoundContent="Không tìm thấy kết quả"
            optionFilterProp="children"
            getPopupContainer={(trigger) => trigger.parentNode}
            onSelect={(value) => {
              let shop = shopsData.find((item) => item.shop_id === value);
              setShopID(value);
              setShopName(shop?.name);
            }}
          >
            {shopsData.length &&
              shopsData.map((item, index) => (
                <CustomSelect.Option
                  style={{ width: "100%" }}
                  key={index.toString()}
                  value={item.id.toString()}
                >
                  {item.name}
                </CustomSelect.Option>
              ))}
          </CustomSelect>
          <Tabs
            defaultActiveKey="1"
            onChange={(activeKey: string) => setActiveTab(activeKey)}
            tabBarExtraContent={{
              right: (
                <Button
                  disabled={!shopID}
                  onClick={() => {
                    setIsAddAutoReply(true);
                  }}
                >
                  Thêm mới phản hồi
                </Button>
              ),
            }}
          >
            <Tabs.TabPane tab="1 Sao" key="1" disabled={!shopID}>
              <AutoReplyTab
                shopID={shopID}
                shopName={shopName}
                star={1}
                activeTab={activeTab}
                isAddAutoReply={isAddAutoReply}
                setIsAddAutoReply={() => setIsAddAutoReply(false)}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="2 Sao" key="2" disabled={!shopID}>
              <AutoReplyTab
                shopID={shopID}
                shopName={shopName}
                star={2}
                activeTab={activeTab}
                isAddAutoReply={isAddAutoReply}
                setIsAddAutoReply={() => setIsAddAutoReply(false)}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="3 Sao" key="3" disabled={!shopID}>
              <AutoReplyTab
                shopID={shopID}
                shopName={shopName}
                star={3}
                activeTab={activeTab}
                isAddAutoReply={isAddAutoReply}
                setIsAddAutoReply={() => setIsAddAutoReply(false)}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="4 Sao" key="4" disabled={!shopID}>
              <AutoReplyTab
                shopID={shopID}
                shopName={shopName}
                star={4}
                activeTab={activeTab}
                isAddAutoReply={isAddAutoReply}
                setIsAddAutoReply={() => setIsAddAutoReply(false)}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="5 Sao" key="5" disabled={!shopID}>
              <AutoReplyTab
                shopID={shopID}
                shopName={shopName}
                star={5}
                activeTab={activeTab}
                isAddAutoReply={isAddAutoReply}
                setIsAddAutoReply={() => setIsAddAutoReply(false)}
              />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </ContentContainer>
    </StyledAutoReply>
  );
}

export default AutoReply;
