import { Button, Input, Modal, Radio, Select, Space } from "antd";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { generateQuery } from "utils/AppUtils";
import { getSaveSearchLocalStorage, setSaveSearchhLocalStorage } from "utils/LocalStorageUtils";
import { showError } from "utils/ToastUtils";

type SaveSearchModalProps = {
    visible: boolean;
    type?: string;
    params?: any;
    onCancel?: () => void;
    onOK?: () => void;
}

const SaveSearchModal = (props: SaveSearchModalProps) => {
    const {visible,type,params,onCancel,onOK} = props;
    const { Option } = Select;
    const [saveSearchListState,setSaveSearchListState] = useState<Array<any>>([]);
    const [saveSearchType,setSaveSearchType] = useState("create_save_search");
    const [saveSearchValue,setSaveSearchValue] = useState("");
    const [saveSearchSelected,setSaveSearchSelected] = useState("");
    const user = useSelector((state: RootReducerType) => state.userReducer.account);

    useEffect(() => {
        setSaveSearchType("create_save_search");
        setSaveSearchValue("");
    },[visible])
    
    const getAllSaveSearchList = () => {
        let key = "savesearch";
        let value = getSaveSearchLocalStorage(key);
        let result: Array<any> = [];
        if(value){
            result = JSON.parse(value);
        }
        return result;
    }
    const getSaveSearchByUserId = () => {
        let saveSearchList = getAllSaveSearchList();
        let result = saveSearchList.filter((a) => {
            return a.userId === user?.id && a.type === type
        });
        return result;
    }
    useEffect(() => {
        setSaveSearchListState(getSaveSearchByUserId());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[visible])
    const handleSaveSearch = () => {
        let saveSearchList = getAllSaveSearchList();
        if(saveSearchType === "create_save_search"){
            if(saveSearchValue === ""){
                showError("Vui lòng nhập tên bộ lọc");
                return;
            }
            let item: any = {};
            item.name = saveSearchValue;
            item.type = type;
            item.value = generateQuery(params);
            item.userId = user?.id;
            if(saveSearchList && saveSearchList.length === 0){
                item.id = 1;
            }
            else{
                let saveSearch = saveSearchList[saveSearchList.length - 1];
                item.id = saveSearch.id + 1;
            }
            saveSearchList.push(item);
            setSaveSearchhLocalStorage("savesearch",JSON.stringify(saveSearchList));
        }
        else{
            if(!saveSearchSelected){
                if(saveSearchValue === ""){
                    showError("Vui lòng chọn bộ lọc đã lưu");
                    return;
                }
            }
            let index = saveSearchList.findIndex((a) => a.id === parseInt(saveSearchSelected));
            if(index !== -1){
                saveSearchList[index].value = generateQuery(params);
                setSaveSearchhLocalStorage("savesearch",JSON.stringify(saveSearchList));
            }
        }
        if(onOK){
            onOK();
        }
    }
    return (
        <Modal 
            visible={visible}
            width={500}
            title="Bạn muốn lưu lại kết quả tìm kiếm?"
            onCancel={onCancel}
            footer={[
                <Button
                  key="cancel"
                  className="create-button-custom ant-btn-outline fixed-button"
                  onClick={onCancel}
                  >
                  Thoát
                </Button>,
                <Button key="ok"
                  type="primary"
                  onClick={() => handleSaveSearch()}
                  disabled={false}
                >
                  Lưu
                </Button>,
                
              ]}
        >
            <div>
                <Radio.Group name="radiogroup" defaultValue="create_save_search" onChange={(e) => setSaveSearchType(e.target.value)}>
                    <Space direction="vertical">
                        <Radio value="create_save_search">Lưu kết quả tìm kiếm</Radio>
                        <Radio value="update_save_search">Lưu đè vào kết quả tìm kiếm đã lưu</Radio>
                    </Space>
                </Radio.Group>
                <p style={{fontWeight:"500",marginTop:"10px"}}>Tên kết quả tìm kiếm</p>
                {saveSearchType === "create_save_search" ? (
                    <Input value={saveSearchValue} onChange={(e) => setSaveSearchValue(e.target.value)} />
                ):(
                    <Select
                        showSearch
                        placeholder=""
                        allowClear
                        optionFilterProp="children"
                        value={saveSearchSelected}
                        onChange={(e) => setSaveSearchSelected(e)}
                        onClear={() => {}}
                        notFoundContent= "Không có dữ liệu"
                        style={{width:"100%"}}
                        >
                        {saveSearchListState?.map((item: any) => (
                            <Option key={item.id} value={item.id}>
                                {`${item.name}`}
                            </Option>
                        ))}
                    </Select>
                )}
            </div>
        </Modal>
    )
}
export default SaveSearchModal;