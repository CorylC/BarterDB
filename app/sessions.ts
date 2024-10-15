import { createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  userId: string;
  username: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    // a Cookie from `createCookie` or the CookieOptions to create one
    cookie: {
      name: "__session",

      maxAge: 6000,
      secure: true,
    },
  });

export { getSession, commitSession, destroySession };
