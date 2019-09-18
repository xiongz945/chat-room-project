// A self-implemented program based router
const router = (routeName) => {
  const route = {
    login: '/pages/login/login.html',
    chatroom: '/pages/chatroom/chatroom.html',
    settings: '/pages/settings/settings.html',
    '404': '/pages/errors/404.html',
  };

  for (let key in route) {
    if (key == routeName) {
      window.location.replace(route[routeName]);
      return;
    }
  }
  window.location.replace(route['404']);
};

export default router;
