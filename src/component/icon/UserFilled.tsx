import Icon from "@ant-design/icons";

const UserFilled = () => {
  const svg = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_3288_223482)">
        <path
          d="M7 0C4.96456 0 3.30859 1.65596 3.30859 3.69141C3.30859 5.72685 4.96456 7.38281 7 7.38281C9.03544 7.38281 10.6914 5.72685 10.6914 3.69141C10.6914 1.65596 9.03544 0 7 0Z"
          fill="#2A2A86"
        />
        <path
          d="M11.5928 9.79439C10.5822 8.76824 9.24243 8.20312 7.82031 8.20312H6.17969C4.75759 8.20312 3.4178 8.76824 2.40718 9.79439C1.4015 10.8155 0.847656 12.1634 0.847656 13.5898C0.847656 13.8164 1.0313 14 1.25781 14H12.7422C12.9687 14 13.1523 13.8164 13.1523 13.5898C13.1523 12.1634 12.5985 10.8155 11.5928 9.79439Z"
          fill="#2A2A86"
        />
      </g>
      <defs>
        <clipPath id="clip0_3288_223482">
          <rect width="14" height="14" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );

  return <Icon component={svg}></Icon>;
};

export default UserFilled;
