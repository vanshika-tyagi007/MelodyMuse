import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
    const { user, signInWithGoogle, signUpWithEmail, signInWithEmail, updateUserPassword, verifyEmailWithCode, resetUserPassword, mockSendPasswordResetCode, mockConfirmPasswordReset, logout, loading } = useAuthContext();
    return {
        user,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        updateUserPassword,
        verifyEmailWithCode,
        resetUserPassword,
        mockSendPasswordResetCode,
        mockConfirmPasswordReset,
        signOut: logout,
        loading
    };
};
