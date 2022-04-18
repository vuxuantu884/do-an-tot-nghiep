import { Checkbox, Popover, Radio, RadioChangeEvent } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { STAFF_POSITION_LIST } from 'config/dashboard/filter-config'
import { RootReducerType } from 'model/reducers/RootReducerType'
import React, { useContext } from 'react'
import { useSelector } from 'react-redux'
import { ShowMyDataStyle } from '../index.style'
import { DashboardContext } from '../provider/dashboard-provider'

type Props = {

}

type GroupPositionProps = {
    setIsVisiblePopover: React.Dispatch<React.SetStateAction<boolean>>
}

const PopoverContent = ({ setIsVisiblePopover }: GroupPositionProps) => {
    const { setShowMyData, showMyData } = useContext(DashboardContext);
    const myCode = useSelector((state: RootReducerType)=> state.userReducer.account?.code);

    const handleChangeRadio = (e: RadioChangeEvent) => {
        const { checked, value } = e.target;
        setIsVisiblePopover?.(false);

        setShowMyData({
            isSeeMyData: checked,
            condition: value,
            myCode
        })
    }
    return (
        <ShowMyDataStyle>
            <Radio.Group value={showMyData.condition} onChange={handleChangeRadio}>
                {STAFF_POSITION_LIST.map((item, index) => {
                    return (
                        <Radio key={index} value={item.value}>{item.label}</Radio>
                    )
                })}
            </Radio.Group>
        </ShowMyDataStyle>
    )
}

function MyDataCheckbox(props: Props) {
    const { showMyData, setShowMyData } = useContext(DashboardContext);
    const [isVisiblePopover, setIsVisiblePopover] = React.useState(false);
    const handleChangeSeeMyData = (e: CheckboxChangeEvent) => {
        const { checked } = e.target;
        if (!checked) {
            setShowMyData({
                isSeeMyData: checked
            })
        }
    }

    const handleChangePopover = (visible: boolean) => {
        console.log("handleChangePopover", visible);
        setIsVisiblePopover(visible && !showMyData.isSeeMyData);

    }
    return (
        <>
            <Popover placement="bottomLeft"
                title="Chọn vị trí làm việc của bạn"
                content={<PopoverContent setIsVisiblePopover={setIsVisiblePopover} />}
                trigger="click"
                visible={isVisiblePopover && !showMyData.isSeeMyData}
                onVisibleChange={(visible) => {
                    handleChangePopover(visible);              
                }}
            >
                <Checkbox
                    checked={showMyData.isSeeMyData}
                    onChange={handleChangeSeeMyData}
                >
                    Xem dữ liệu của tôi
                </Checkbox>
            </Popover>

        </>

    )
}

export default MyDataCheckbox