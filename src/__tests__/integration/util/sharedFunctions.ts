import axios from "axios";
import { API_URL, headers } from "./sharedVariables";

export const userSignIn = async (login: string, password: string) => {
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