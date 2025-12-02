// lib/cognito.ts
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
};

let _userPool: CognitoUserPool | null = null;

function getUserPool() {
  if (typeof window === "undefined") return null;
  if (!_userPool) {
    _userPool = new CognitoUserPool(poolData);
  }
  return _userPool;
}

export async function signUp(email: string, password: string) {
  const userPool = getUserPool();
  if (!userPool) throw new Error("UserPool not available");

  const attributeList = [
    new CognitoUserAttribute({ Name: "email", Value: email }),
  ];

  return new Promise<void>((resolve, reject) => {
    userPool.signUp(email, password, attributeList, [], (err, _result) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function signIn(
  email: string,
  password: string
): Promise<CognitoUserSession> {
  const userPool = getUserPool();
  if (!userPool) throw new Error("UserPool not available");

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve(session);
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

export async function getCurrentUser() {
  const userPool = getUserPool();
  if (!userPool) return null;

  const user = userPool.getCurrentUser();
  if (!user) return null;

  return new Promise<{ userId: string; email?: string } | null>(
    (resolve, _reject) => {
      user.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          resolve(null);
        } else {
          const idToken = session.getIdToken();
          const payload = idToken.payload as any;
          resolve({
            userId: payload.sub as string,
            email: payload.email as string | undefined,
          });
        }
      });
    }
  );
}

export async function signOut() {
  const userPool = getUserPool();
  const user = userPool?.getCurrentUser();
  user?.signOut();
}
