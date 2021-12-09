import {Card} from "antd";
import {AccountSearchAction} from "domain/actions/account/account.action";
import {CustomerGroups} from "domain/actions/customer/customer.action";
import {LoyaltyRankSearch} from "domain/actions/loyalty/rank/loyalty-rank.action";
import {AccountResponse} from "model/account/account.model";
import {PageResponse} from "model/base/base-metadata.response";
import {CustomerGroupModel} from "model/response/customer/customer-group.response";
import {LoyaltyRankResponse} from "model/response/loyalty/ranking/loyalty-rank.response";
import {
  CustomerSelectionOption,
  DiscountResponse,
  Gender,
} from "model/response/promotion/discount/list-discount.response";
import React, {ReactElement, useEffect} from "react";
import {useDispatch} from "react-redux";
import { getDateFormDuration } from "utils/PromotionUtils";
import {CustomerContitionDetailStyle} from "./condition.style";

export default function CustomerConditionDetail(props: DiscountResponse): ReactElement {
  const {
    customer_selection,
    prerequisite_genders,
    prerequisite_birthday_duration,
    prerequisite_wedding_duration,
    prerequisite_customer_group_ids,
    prerequisite_customer_loyalty_level_ids,
    prerequisite_assignee_codes,
  } = props;

  const dispatch = useDispatch();
  const [groups, setGroups] = React.useState<Map<number, CustomerGroupModel>>();
  const [rankingList, setRankingList] =
    React.useState<Map<number, LoyaltyRankResponse>>();
  const [accountList, setAccountList] = React.useState<Map<string, AccountResponse>>();


  const getCustomerGroupName = () => {
    const temps: string[] = [];
    if (
      !prerequisite_customer_group_ids ||
      prerequisite_customer_group_ids.length === 0
    ) {
      return "--";
    } else {
      prerequisite_customer_group_ids?.forEach((id: number) => {
        const name = groups?.get(id)?.name;
        if (name) {
          temps.push(name);
        }
      });
      return temps.join(", ");
    }
  };

  const getCustomerRankName = () => {
    const temps: string[] = [];
    if (
      !prerequisite_customer_loyalty_level_ids ||
      prerequisite_customer_loyalty_level_ids.length === 0
    ) {
      return "--";
    } else
      prerequisite_customer_loyalty_level_ids?.forEach((id: number) => {
        const name = rankingList?.get(id)?.name;
        if (name) {
          temps.push(name);
        }
      });
    return temps.join(", ");
  };

  const getAssignerName = () => {
    const temps: string[] = [];
    if (!prerequisite_assignee_codes || prerequisite_assignee_codes.length === 0) {
      return "--";
    } else
      prerequisite_assignee_codes?.forEach((code: string) => {
        const name = accountList?.get(code)?.full_name;
        if (name) {
          temps.push(name);
        }
      });
    return temps.join(", ");
  };

  const customerDatas = [
    {
      title: "Giới tính",
      info:
        prerequisite_genders && prerequisite_genders?.length > 0
          ? prerequisite_genders
              ?.map((item: string) => {
                if (item.toLocaleLowerCase() === Gender.MALE.toLocaleLowerCase()) {
                  return "Nam";
                }
                if (item.toLocaleLowerCase() === Gender.FEMALE.toLocaleLowerCase()) {
                  return "Nữ";
                } else {
                  return "Khác";
                }
              })
              .join(", ")
          : "--",
    },
    {
      title: "Ngày sinh",
      info: (
        <>
          {getDateFormDuration(prerequisite_birthday_duration?.starts_mmdd_key || 0)}
          &nbsp; -&nbsp; 
          {getDateFormDuration(prerequisite_birthday_duration?.ends_mmdd_key || 0)}
        </>
      ),
    },
    {
      title: "Ngày cưới",
      info: (
        <>
          {getDateFormDuration(prerequisite_wedding_duration?.starts_mmdd_key || 0)}
          &nbsp; -&nbsp; 
          {getDateFormDuration(prerequisite_wedding_duration?.ends_mmdd_key || 0)}
        </>
      ),
    },
    {
      title: "Nhóm khách hàng",
      info: getCustomerGroupName(),
    },
    {
      title: "Hạng khách hàng",
      info: getCustomerRankName(),
    },
    {
      title: "Nhân viên phụ trách",
      info: getAssignerName(),
    },
  ];
  useEffect(() => {
    dispatch(
      CustomerGroups((result) => {
        const temps = new Map<number, CustomerGroupModel>();
        result.forEach((item: CustomerGroupModel) => {
          temps.set(item.id, item);
        });
        setGroups(temps);
      })
    );
    dispatch(
      LoyaltyRankSearch({}, (result: PageResponse<LoyaltyRankResponse>) => {
        const temps = new Map<number, LoyaltyRankResponse>();
        result.items.forEach((item: LoyaltyRankResponse) => {
          temps.set(item.id, item);
        });
        setRankingList(temps);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      AccountSearchAction(
        {codes: prerequisite_assignee_codes},
        (result: PageResponse<AccountResponse> | false) => {
          if (result) {
            const temps = new Map<string, AccountResponse>();
            result.items.forEach((item: AccountResponse) => {
              temps.set(item.code, item);
            });
            setAccountList(temps);
          }
        }
      )
    );
  }, [dispatch, prerequisite_assignee_codes]);

  return (
    <CustomerContitionDetailStyle>
      <Card className="card" title="Khách hàng áp dụng">
        {customer_selection === CustomerSelectionOption.ALL && (
          <span>Tất cả khách hàng</span>
        )}
        {customer_selection === CustomerSelectionOption.PREREQUISITE && (
          <div className="customer-condition">
            {customerDatas.map((data) => (
              <div className="item" key={data.title}>
                <span className="title">
                  {data.title}: &nbsp; <b> {data.info}</b>
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </CustomerContitionDetailStyle>
  );
}
