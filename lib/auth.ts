/* eslint-disable @typescript-eslint/no-explicit-any */

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
// import { signIn } from "next-auth/react";
import { prisma } from "./db";
import { Provider } from "@prisma/client";


export const NEXT_AUTH_CONFIG = {
  providers: [
    CredentialsProvider({

      name: 'email',

      credentials: {
        username: { label: "email", type: "email", placeholder: "enter your email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {

        const res = await fetch("/signup", {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        })
        const user = await res.json()

        if (res.ok && user) {
          return user
        }

        return null
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || ""
    })
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  callbacks: {
    async session({ session, token }: any) {
      session.user.id = token.id; // Attach the ID to the session object
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser) {
          token.id = dbUser.id; // attach your internal user ID to token
        }

      }
      return token;
    },


    async signIn(params: any) {
      console.log("params signin:", params);

      if (!params.user?.email) {
        console.log("Email is required for sign-in.");
        return false;
      }

      let provider = params?.account?.provider;
      if (provider === 'google') {
        provider = Provider.Google;
      } else if (provider === 'github') {
        provider = Provider.Github;
      } else {
        console.log("Invalid provider:", provider);
        return false;
      }

      try {
        // Check if the user already exists by email
        const existingUser = await prisma.user.findFirst({
          where: { email: params.user.email },
        });

        if (existingUser) {
          console.log("User with the given email already exists.");
          return true; // User exists, proceed with sign-in
        }

        // Create a new user
        await prisma.user.create({
          data: {
            email: params.user.email,
            provider,
          },
        });

        console.log("New user created successfully.");
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log("Unique constraint failed: Email already exists.");
        } else {
          console.error("Error while signing in:", error);
        }
        return false;
      }

      return true; // Sign-in successful
    }


  },
}