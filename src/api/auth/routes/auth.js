module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/login',
      handler: 'auth.login',
      config: { auth: false }, 
    },
    {
      method: 'POST',
      path: '/auth/register/adoptant',
      handler: 'auth.registerAdoptant',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/auth/register/volunteer',
      handler: 'auth.registerVolunteer',
      config: { auth: false },
    },
  ],
};