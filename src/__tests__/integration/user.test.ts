import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:8000/graphql';
const headers = { 'Content-Type': 'application/json' };

describe('user tests', () => {

    test('get all users', async () => {
        const result = await axios.post(API_URL,
            { query: '{users{id}}' },
            { headers }
        );
        const { users } = result.data.data;
        expect(users).toHaveLength(2);
    });

    test('get user by id', async () => {
        const userIndex = 0;

        const usersResponse = await axios.post(API_URL,
            { query: `{users{id}}` },
            { headers }
        );

        const { users } = usersResponse.data.data;
        const variables = { id: users[userIndex].id };
        const userResponse = await axios.post(API_URL,
            {
                query: `
                    query ($id: ID!) {
                        user(id: $id) {
                            id
                        }
                    }
                `,
                variables
            },
            { headers }
        );

        const { user } = userResponse.data.data;
        expect(user).toStrictEqual(users[userIndex]);
    })

    test('sign in and confirm user is me', async () => {
        const variables = {
            username: 'rodhlann',
            password: 'pass123'
        };

        const tokenResponse = await axios.post(API_URL, {
            query: `
                    mutation ($username: String!, $password: String!) {
                        signIn(login: $username, password: $password) {
                            token
                        }
                    }
                `,
                variables
            },
            { headers }
        );
        const { token } = tokenResponse.data.data.signIn;
        expect(token).toBeTruthy();

        const meResponse = await axios.post(API_URL, {
            query: `
                {
                    me {
                        username
                    }
                }
            `,
            },
            { headers: { 'x-token': token, ...headers } }
        );

        const { me } = meResponse.data.data;
        expect (me.username).toBe(variables.username);
    });

    test('fail to authorize me request when passing null token', async () => {
        const meResponse = await axios.post(API_URL, {
            query: `
                {
                    me {
                        username
                    }
                }
            `,
            },
            { headers }
        );

        const { message } = meResponse.data.errors[0];
        expect(message).toEqual("No authenticated user.");
    });

    test('fail to authorize me request when passing expired token', async () => {
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsImVtYWlsIjoicm9kaGxhbm5AZ21haWwuY29tIiwidXNlcm5hbWUiOiJyb2RobGFubiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTY2NzUwNjQ5NSwiZXhwIjoxNjY3NTA4Mjk1fQ.SDkgyg4Dk_Je4zmgFQ8Cx7i6WD4tzWKggpHPmRzyt8E';
        try {
            const meResponse = await axios.post(API_URL, {
                query: `
                    {
                        me {
                            username
                        }
                    }
                `,
                },
                { headers: { 'x-token': expiredToken, ...headers }}
            );
        } catch(e: any) {
            const { message } = e.response.data.errors[0];
            expect(message).toEqual("Context creation failed: Your session has expired.");
        }
    });

    test('fail to authorize me request when passing invalid token', async () => {
        const invalidToken = 'badtokenisbad';
        try {
            const meResponse = await axios.post(API_URL, {
                query: `
                    {
                        me {
                            username
                        }
                    }
                `,
                },
                { headers: { 'x-token': invalidToken, ...headers }}
            );
        } catch(e: any) {
            const { message } = e.response.data.errors[0];
            expect(message).toEqual("Context creation failed: Your session has expired.");
        }
    });
});