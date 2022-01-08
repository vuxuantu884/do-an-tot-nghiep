import { Card, Col, Row } from 'antd';
import AfternoonSVG from "assets/img/afternoon.svg";
import MorningSVG from "assets/img/morning.svg";
import NightSVG from "assets/img/night.svg";
import { RootReducerType } from 'model/reducers/RootReducerType';
import moment from 'moment';
import React, { ReactElement, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface Props {

}
enum TimeOfDay {
    MORNING = "MORNING",
    AFTERNOON = "AFTERNOON",
    NIGHT = "NIGHT",
    HELLO = "HELLO"
}

const timeOfDayVietnamese = {
    [TimeOfDay.MORNING]: "Chào buổi sáng",
    [TimeOfDay.AFTERNOON]: "Chào buổi chiều",
    [TimeOfDay.NIGHT]: "Chào buổi tối",
    [TimeOfDay.HELLO]: "Xin chào"
}

function generateGreetings() {
    const currentHour = moment().hours();
    if (currentHour >= 5 && currentHour < 12) {
        return TimeOfDay.MORNING;
    } else if (currentHour >= 12 && currentHour < 18) {
        return TimeOfDay.AFTERNOON;
    } else if (currentHour >= 18 && currentHour < 3) {
        return TimeOfDay.NIGHT;
    } else {
        return TimeOfDay.HELLO;
    }

}
function Greeting(props: Props): ReactElement {
    const userName = useSelector((state: RootReducerType) => state.userReducer.account?.full_name)
    const [greetingImg, setGreetingImg] = useState<string>(MorningSVG);
    const timeOfDay: TimeOfDay = generateGreetings();
    useEffect(() => {
        switch (timeOfDay) {
            case TimeOfDay.MORNING:
                setGreetingImg(MorningSVG);
                break;
            case TimeOfDay.AFTERNOON:
                setGreetingImg(AfternoonSVG);
                break;
            case TimeOfDay.NIGHT:
                setGreetingImg(NightSVG);
                break;
            default:
                setGreetingImg(MorningSVG);
                break;
        }
    }, [timeOfDay]);
    return (
        <div>
            <Card >
                <Row>
                    <h1 className='greeting__title'>Tổng quan</h1>
                </Row>
                <Row gutter={16}>
                    <Col span={18} className="greeting">
                        <img src={greetingImg} alt={timeOfDay} className="greeting__img" />
                        <div className="greeting__content">
                            <span className="name">{timeOfDayVietnamese[timeOfDay]} {userName}!</span>
                            <p className="quote">“Luôn đặt sự hài lòng của khách hàng là ưu tiên số 1 trong mọi suy nghĩ và hành động của mình.
                                Luôn Chủ động, Cười, Chào, Cảm ơn.”</p>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    )
}

export default Greeting
