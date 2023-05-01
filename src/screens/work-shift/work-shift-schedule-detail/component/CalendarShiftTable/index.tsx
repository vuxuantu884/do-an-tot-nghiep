import React from "react";
import { StyledComponent } from "./styled";

interface ShiftModel {
  ca?: number;
  tu_gio?: number;
  den_gio?: number;
}

interface ShiftTableDataModel {
  doanh_thu: number;
  doanh_thu_can_dat: number;
  tong_thoi_gian: number;
  so_thoi_su_dung: number;
  tong_nhan_vien: number;
  so_nhan_vien_da_su_dung: number;
  cht: number;
  cgtv: number;
  cntn: number;
  kho: number;
  cgtd: number;
  vm: number;
}
interface ShiftTableModel {
  shift: ShiftModel;

  data: ShiftTableDataModel[];
}
type Props = {};
const CalendarShiftTable: React.FC<Props> = (props: Props) => {
  const getShift = () => {
    let result: ShiftModel[] = [];
    let ca: number = 8;
    for (let i = 1; i <= 14; i++) {
      const item: ShiftModel = {
        ca: i,
        tu_gio: ca,
        den_gio: ca + 1,
      };

      ca += 1;
      result.push(item);
    }
    return result;
  };

  const shifts = getShift();

  const shiftDataDetails = () => {
    let shiftDataDetails: ShiftTableDataModel[] = [];
    for (let i = 0; i < 10; i++) {
      shiftDataDetails.push({
        doanh_thu: 0,
        doanh_thu_can_dat: 0,
        tong_thoi_gian: 0,
        so_thoi_su_dung: 0,
        tong_nhan_vien: 0,
        so_nhan_vien_da_su_dung: 0,
        cht: 0,
        cgtv: 0,
        cntn: 0,
        kho: 0,
        cgtd: 0,
        vm: 0,
      });
    }

    return shiftDataDetails;
  };

  const getShiftData = () => {
    let shiftTableModel: ShiftTableModel[] = [];
    shifts.forEach((value, index) => {
      const item: ShiftTableModel = {
        shift: value,
        data: shiftDataDetails(),
      };
      shiftTableModel.push(item);
    });
    return shiftTableModel;
  };

  const shiftData = getShiftData();
  console.log("shiftData", shifts);
  //const shifts: ShiftTableModel = [{}];
  return (
    <StyledComponent>
      <div className="calendar-table">
        <table className="rules rules-sticky" style={{ width: 300 * shiftDataDetails().length }}>
          <thead>
            <tr>
              <th className="condition">title 1 </th>

              {shiftDataDetails().map((value1) => (
                <>
                  <th className="condition" colSpan={2}>
                    title 2
                  </th>
                  <th className="condition" hidden>
                    title 3
                  </th>
                </>
              ))}
            </tr>
            <tr>
              <th className="condition" rowSpan={2}>
                title 4{" "}
              </th>
              {shiftDataDetails().map((value1) => (
                <>
                  <th className="condition" colSpan={2}>
                    title 5
                  </th>
                  <th className="condition" hidden>
                    title 3
                  </th>
                </>
              ))}
            </tr>
            <tr>
              {shiftDataDetails().map((value1) => (
                <>
                  <th className="condition" hidden>
                    title 6{" "}
                  </th>
                  <th className="condition">title 7</th>
                  <th className="condition">title 8</th>
                </>
              ))}
            </tr>
          </thead>
        </table>

        <table className="rules" style={{ width: 300 * shiftDataDetails().length }}>
          <tbody>
            {shiftData.map((value, index) => (
              <>
                <tr key={`${index}1`}>
                  <td className="condition" rowSpan={3}>
                    {value.shift.ca}
                    <br />
                    {value.shift.tu_gio}-{value.shift.den_gio}
                  </td>

                  {value.data.map((value1) => (
                    <>
                      <td className="condition" colSpan={2}>
                        body 2
                      </td>
                      <td className="condition" hidden>
                        body 3
                      </td>
                    </>
                  ))}
                </tr>
                <tr key={`${index}2`}>
                  {value.data.map((value1) => (
                    <>
                      <td className="condition" hidden>
                        body 4
                      </td>
                      <td className="condition">body 5</td>
                      <td className="condition">body 6</td>
                    </>
                  ))}
                </tr>
                <tr key={`${index}3`}>
                  {value.data.map((value1) => (
                    <>
                      <td className="condition" hidden>
                        body 4
                      </td>
                      <td className="condition" colSpan={2}>
                        body 5
                      </td>
                      <td className="condition" hidden>
                        body 6
                      </td>
                    </>
                  ))}
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </StyledComponent>
  );
};

export default CalendarShiftTable;
