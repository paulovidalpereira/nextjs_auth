import { createContext, useEffect, useState } from "react";
import { recoverUserInformation, signInRequest } from "../services/auth";
import { setCookie, parseCookies } from 'nookies';
import Router from "next/router";

type AuthContextType = {
    isAuthtenticate: boolean;
    user: User;
    signIn: (data: SignInData) => Promise<void>;
}

type SignInData = {
    email: string;
    password: string;
}

type User = {
    name: string;
    email: string;
    avatar_url: string;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }) {

    const [user, setUser] = useState<User | null>(null)

    const isAuthtenticate = !!user;

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies();

        if (token) {
            recoverUserInformation().then(response => {
                setUser(response.user);
            })
        }
    }, [])

    async function signIn({email, password}: SignInData) {
        const {token, user} = await signInRequest({
            email,
            password,
        });

        setCookie(undefined, 'nextauth.token', token, {
            maxAge: 60 * 60 * 1, // 1 hour
        })

        setUser(user)

        Router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthtenticate, signIn }}>
            {children}
        </AuthContext.Provider>
    )
}