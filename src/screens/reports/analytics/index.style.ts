import Color from "assets/css/export-variable.module.scss";
import styled from "styled-components";
export const AnalyticsStyle = styled.div`
padding-top: 20px;
.ant-table-summary {
      display: table-header-group;
}
 
.group-report-type{
    display: flex;
    align-items: flex-end;
    justify-content: start;
    gap: 20px;
}
.input-width{
    width: 250px;
}

.filter-btn{
    margin-left: auto;
}

.link {
    color: ${Color.linkCorlor};
    cursor: pointer;
}
.link:hover {
    color: ${Color.linkCorlorHover};
    text-decoration: underline;
}

.external-link {
    display:none;
}

.detail-link:hover {
    .external-link {
        display: inline-block;
        margin-left: 0.25rem;
    }
}

`;

export const AddPropertiesModalStyle = styled.div`
.w-100 {
    width: 100%;
}
`;

export const FilterResultStyle = styled.div`
 
    .divider-filter {
        display: flex;
        margin-bottom: 20px;
        margin-bottom: 20px;
        justify-content: center;
        border-bottom: 1px solid #d9d9d9;
        &__name{
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
        }
    }
    
`;

export const ListAnalyticsStyle = styled.div`
    .template-report{
        .pointer{
            cursor: pointer;
        }
        &__card{
            border-radius: 8px;
            padding: 20px;
            height: 140px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            background: ${Color.white};
            box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);    
        }
        &__icon{
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
            img {
                width: 40px;
                height: 40px;
            }
        }
        &__type{
            color: ${Color.labelColor};     
        }
        &__name{
            font-size: 16px;
            font-weight: bold;
            color: ${Color.textBodyColor};
            text-align: center;
        }
    }
    .card-custom-report {
        background-color: ${Color.gray};
        .ant-card-head-wrapper {
            flex-wrap: wrap;
            gap: 20px;
        }
        .btn-group {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
            .search {
                width: 320px;
            }
        }
    }
    .ana-list {
        &__link{
            display: flex;
            flex: 1 1;
        }
        &__item{
            .ant-table-cell{
                padding: 6px 20px;
            }
            &--name{
                cursor: pointer;
            }
        }
        &__action{
            display: flex;
            align-items: center;
            column-gap: 10px;
            justify-content: center;
            button{
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0;
            }
        }
    }
`;

export const AnalyticsDatePickerStyle = styled.div`
padding:10px ;
    .picker-panel{        
         
            display: grid;
            flex-wrap: wrap;
            gap: 10px;
            grid-template-columns: repeat( 4, minmax(80px, 1fr) );
        }
    }
`;

export const ActiveFiltersStyle = styled.div`
.active-filters {
    display: flex;
    padding: 0;
}
.filter-item {
    display: flex;
    align-items: center;
    margin: 0 5px 5px 0;
    padding: 0.25rem;
    border: 1px solid #cbdbee;
    background: #e9f3ff;
    line-height: 1.42857rem;
    font-weight: 400;
    text-transform: none;
    letter-spacing: normal;
    color: #707070;
    border-radius: 2px;
    user-select: none;
    list-style-type: none;
    .button-action {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

`;
