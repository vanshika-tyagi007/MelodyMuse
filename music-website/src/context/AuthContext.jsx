import { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../firebase';
import {
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    updatePassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await createUserDocument(user);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const signUpWithEmail = async (email, password, name) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;
            // Update profile with name
            await updateProfile(user, { displayName: name });
            // Create user doc
            await createUserDocument(user, { displayName: name }); // Pass name explicitly as user.displayName might not be updated in object yet
        } catch (error) {
            console.error("Error signing up with email", error);
            throw error;
        }
    };

    const signInWithEmail = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error signing in with email", error);
            throw error;
        }
    };

    const updateUserPassword = async (newPassword) => {
        try {
            if (user) {
                await updatePassword(user, newPassword);
            }
        } catch (error) {
            console.error("Error updating password", error);
            throw error;
        }
    };

    const resetUserPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error("Error sending password reset email", error);
            throw error;
        }
    };

    const verifyEmailWithCode = async (code) => {
        // Mock verification logic
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (code === "123456") {
                    resolve(true);
                } else {
                    reject(new Error("Invalid verification code"));
                }
            }, 1000);
        });
    };

    const mockSendPasswordResetCode = async (email) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`[Mock Auth] Password Reset Code for ${email}: 123456`);
                resolve(true);
            }, 1000);
        });
    };

    const mockConfirmPasswordReset = async (code, newPassword) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (code === "123456") {
                    resolve(true);
                } else {
                    reject(new Error("Invalid verification code"));
                }
            }, 1000);
        });
    };

    const createUserDocument = async (user, additionalData = {}) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || additionalData.displayName || 'User',
                photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${(user.email || 'User').charAt(0).toUpperCase()}&background=random&color=fff`,
                createdAt: serverTimestamp(),
                ...additionalData
            });
        }
    };

    const logout = () => {
        return firebaseSignOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        user,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        updateUserPassword,
        verifyEmailWithCode,
        resetUserPassword,
        mockSendPasswordResetCode,
        mockConfirmPasswordReset,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
