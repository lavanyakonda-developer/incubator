export const authenticate = (data, next) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt', JSON.stringify(data));
  }
};

export const signout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
  }
};

export const isAuthenticated = () => {
  if (typeof window == 'undefined') {
    return false;
  }

  if (localStorage.getItem('jwt')) {
    return JSON.parse(localStorage.getItem('jwt'));
  } else {
    return false;
  }
};

// const logout = async () => {
//   try {
//     const response = await makeRequest.post('api/auth/logout');
//     signout();
//     console.log('response', response);

//     if (response.status == 200) {
//       console.log('logged out');
//     } else {
//       console.log('unkno9w error');
//     }
//   } catch (error) {
//     console.log('Errorrr', error);
//   }
// };
