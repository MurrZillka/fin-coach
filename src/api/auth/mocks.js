export const mockAuth = {
    getUsers: async () => ({
        users: [{ id: 1, user_name: 'mot', login: 'mot' }],
    }),
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