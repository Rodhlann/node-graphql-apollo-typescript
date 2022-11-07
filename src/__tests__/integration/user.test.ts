import axios from 'axios';

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

    test('confirm users are returned with messages', async () => {
        const result = await axios.post(API_URL,
            { query: '{users{messages{id}}}' },
            { headers }
        );
        const { users } = result.data.data;
        expect(users[0].messages).toHaveLength(2);
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

    test('user sign up', async () => {
        const variables = {
            username: "orzo",
            email: "orzo.stinkinz@email.com",
            password: "stinker1"
        };

        const tokenResponse = await axios.post(API_URL, {
                query: `
                    mutation($username: String!, $email: String!, $password: String!) {
                        signUp(username: $username, email: $email, password: $password) {
                            token
                        }
                    }
                `,
                variables
            }, 
            { headers }
        );

        const { token } = tokenResponse.data.data.signUp;
        expect(token).toBeTruthy();

        const me = await getMe(token);
        expect (me.username).toBe(variables.username);

        // Delete user to make test repeatable (could be resolved by using in memory db for tests)
        const adminToken = await userSignIn("rodhlann", "pass123");
        deleteUser(me.id, adminToken)
    });

    test('sign in and confirm user is me', async () => {
        const login = 'rodhlann';
        const password = 'pass123';

        const token = await userSignIn(login, password);

        const me = await getMe(token);
        expect (me.username).toBe(login);
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

const getMe = async (token: string) => {
    const meResponse = await axios.post(API_URL, {
        query: `
            {
                me {
                    id
                    username
                }
            }
        `,
        },
        { headers: { 'x-token': token, ...headers } }
    );

    const { me } = meResponse.data.data;
    expect(me).toBeTruthy();
    return me;
}

const userSignIn = async (login: string, password: string) => {
    const variables = {
        username: login,
        password
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
    return token;
}

const deleteUser = async (id: string, token: string) => {
    const deleteResponse = await axios.post(API_URL, {
        query: `
            mutation($id: ID!) {
                deleteUser(id: $id)
            }
        `,
        variables: { id }
        },
        { headers: { 'x-token': token, ...headers } }
    );

    const isDeleted = deleteResponse.data.data.deleteUser;
    expect(isDeleted).toBeTruthy();
}