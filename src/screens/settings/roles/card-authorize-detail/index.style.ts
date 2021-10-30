import Styled from "styled-components";

export const RoleStyled = Styled.div`
// style for card collapse
.site-collapse-custom-collapse{ 
background-color: white;
}
// style for collapse item
.site-collapse-custom-panel{
.ant-collapse-content-box{
    padding-left: 40px;
}
}

.ant-card-body{
    padding-top:1px;
}
.panel-header{
    display:flex;
    align-items: center;
}
.panel-content{
    display: grid;
    grid-template-columns: repeat( auto-fill, minmax(200px, 1fr) );
    &-item{
    }
    .ant-checkbox-wrapper{
        margin-left: 8px;
    }
}
`;
