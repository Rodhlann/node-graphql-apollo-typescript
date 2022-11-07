import axios from "axios";
import { API_URL, headers } from "./sharedVariables";

describe('message int tests', () => {
  
  test('get all messages', async () => {
    const result = await axios.post(API_URL,
      { query: '{messages{edges{id}}}' },
      { headers }
    );
    const { messages } = result.data.data;
    expect(messages.edges).toHaveLength(3);
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
            query: `
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
});

const getPaginatedMessages = async (cursor: string | null, limit: number) => {
  const result = await axios.post(API_URL,
    { query: `
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