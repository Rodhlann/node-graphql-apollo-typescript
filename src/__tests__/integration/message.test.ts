import axios from "axios";
import { API_URL, headers } from "./util/sharedVariables";
import { userSignIn } from "./util/sharedFunctions";

describe('message int tests', () => {
  
  test('get all messages', async () => {
    const result = await axios.post(API_URL,
      { query: `#graphql
        {
          messages {
            edges {
                id
            }
          }
        }`
      },
      { headers }
    );
    const { messages } = result.data.data;
    expect(messages.edges).toHaveLength(3);
  });

  test('get message user', async () => {
    const result = await axios.post(API_URL,
      { query: `#graphql
        {
          messages {
            edges {
              user {
                username
              }
            }
          }
        }`
      },
      { headers }
    );
    const { messages } = result.data.data;
    const user = messages.edges[0].user;
    expect(user.username).toEqual('rodhlann');
  });

  test('paginate messages', async () => {
    const messagesPage1 = await getPaginatedMessages(null, 2);
    expect(messagesPage1.edges).toHaveLength(2);
    expect(messagesPage1.pageInfo.hasNextPage).toBeTruthy();

    const cursor = messagesPage1.pageInfo.endCursor;
    const messagesPage2 = await getPaginatedMessages(cursor, 2);
    expect(messagesPage2.edges).toHaveLength(1);
    expect(messagesPage2.pageInfo.hasNextPage).toBeFalsy();
  });

  test('get message by id', async () => {
    const index = 0;

    const messagesResponse = await axios.post(API_URL,
        { query: `{messages{edges{id}}}` },
        { headers }
    );

    const { messages } = messagesResponse.data.data;
    const variables = { id: messages.edges[index].id };
    const messageResponse = await axios.post(API_URL,
        {
            query: `#graphql
                query ($id: ID!) {
                    message(id: $id) {
                        id
                    }
                }
            `,
            variables
        },
        { headers }
    );

    const { message } = messageResponse.data.data;
    expect(message).toStrictEqual(messages.edges[index]);
  });

  test('create message', async () => {
    const token = await userSignIn("rodhlann", "pass123");
    const variables = {
      text: "This is a cool test message"
    };

    const createResponse = await axios.post(API_URL,
      {
        query: `#graphql
          mutation ($text: String!) {
            createMessage (text: $text) {
              id
              text
              user {
                username
              }
            }
          }
        `,
        variables
      },
      { headers: { 'x-token': token, ...headers } }
    );

    const { text, user, id } = createResponse.data.data.createMessage;
    expect(text).toEqual(variables.text);
    expect(user.username).toEqual('rodhlann');

    await deleteMessage(id, token);
  });
});

const getPaginatedMessages = async (cursor: string | null, limit: number) => {
  const result = await axios.post(API_URL,
    { query: `#graphql
      query ($cursor: String, $limit: Int!) {
        messages (cursor: $cursor, limit: $limit) {
          edges {
            id
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }`,
      variables: {
        cursor,
        limit
      }
    },
    { headers },
  );

  const { messages } = result.data.data;
  expect(messages).toBeTruthy();
  return messages;
};

const deleteMessage = async (id: string, token: string) => {
  const deleteResponse = await axios.post(API_URL, {
        query: `
            mutation($id: ID!) {
                deleteMessage(id: $id)
            }
        `,
        variables: { id }
      },
      { headers: { 'x-token': token, ...headers } }
  );

  const isDeleted = deleteResponse.data.data.deleteMessage;
  expect(isDeleted).toBeTruthy();
}