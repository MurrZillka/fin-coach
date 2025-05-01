export const mockAuth = {
    getUsers: async () => ([
        {id: 1, user_name: 'mot', login: 'mot'},
        {id: 2, user_name: 'alice', login: 'alice'},
        {id: 3, user_name: 'bob', login: 'bob'},
        {id: 4, user_name: 'clara', login: 'clara'},
        {id: 5, user_name: 'dave', login: 'dave'},
    ]),

    signup: async () => ({
        ok: true,
    }),
    login: async (data) => ({
        expires_in: 36000000000000,
        access_token: 'mock_jwt_token',
        token_type: 'Bearer',
        role: 0,
        userName: data.login,
        userid: 0,
    }),
    logout: async () => ({
        status: 200,
    }),
};