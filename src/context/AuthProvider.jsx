import React, { useEffect, useState } from 'react';
import { auth } from '../firebase/firebase.init';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { AuthContext } from './AuthContext';

const AuthProvider = ({children}) => {
    const provider = new GoogleAuthProvider();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    

    const createUser = (email, password) => {
        setLoading(true);
       return createUserWithEmailAndPassword(auth, email, password)
       .finally(() => setLoading(false))
    };

    const logInUser = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password)
        .finally(() => setLoading(false))
    };

    const googleLogin = () => {
        setLoading(true);
        return signInWithPopup(auth, provider)
        .finally(() => setLoading(false))
    };

    const logOutUser = () => {
        setLoading(true);
        signOut(auth)
        .finally(() => setLoading(false))
    };

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            setLoading(false);
        })
            
        return () => {
            unSubscribe();
        }
    }, [])


    const userInfo = {
        user,
        loading,
        createUser,
        logInUser,
        logOutUser,
        googleLogin,
    } 

    return (
        
        <AuthContext value={userInfo}>
            { children }
        </AuthContext>

    );
};

export default AuthProvider;