import styled, { CSSProperties } from "styled-components";

interface IProps {
  style?: CSSProperties;
  onClick?: () => void;
}

const ButtonRemove = (props: IProps) => {
  const { style, onClick } = props;
  return (
    <StyledSvg
      onClick={onClick}
      style={style}
      width="40"
      height="32"
      viewBox="0 0 40 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 2C0 0.895431 0.895431 0 2 0H38C39.1046 0 40 0.895431 40 2V30C40 31.1046 39.1046 32 38 32H2C0.895431 32 0 31.1046 0 30V2Z"
        fill="white"
      />
      <path
        d="M26.4277 15.3203H13.5706C13.492 15.3203 13.4277 15.3846 13.4277 15.4632V16.5346C13.4277 16.6132 13.492 16.6775 13.5706 16.6775H26.4277C26.5063 16.6775 26.5706 16.6132 26.5706 16.5346V15.4632C26.5706 15.3846 26.5063 15.3203 26.4277 15.3203Z"
        fill="#2A2A86"
      />
      <path
        d="M2 1H38V-1H2V1ZM39 2V30H41V2H39ZM38 31H2V33H38V31ZM1 30V2H-1V30H1ZM2 31C1.44772 31 1 30.5523 1 30H-1C-1 31.6569 0.343147 33 2 33V31ZM39 30C39 30.5523 38.5523 31 38 31V33C39.6569 33 41 31.6569 41 30H39ZM38 1C38.5523 1 39 1.44772 39 2H41C41 0.343145 39.6569 -1 38 -1V1ZM2 -1C0.343146 -1 -1 0.343146 -1 2H1C1 1.44772 1.44772 1 2 1V-1Z"
        fill="#2A2A86"
      />
    </StyledSvg>
  );
};

const StyledSvg = styled.svg`
  cursor: pointer;
`;

export default ButtonRemove;
