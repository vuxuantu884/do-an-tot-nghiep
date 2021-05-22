const ACCESS_TOKEN = 'access_token';

const setToken = (token: any) => {
  localStorage.setItem(ACCESS_TOKEN, token);
};


const getToken = (): String | null => {
  return localStorage.getItem(ACCESS_TOKEN);
};

export {setToken, getToken};
