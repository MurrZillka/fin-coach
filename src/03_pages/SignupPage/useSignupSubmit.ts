// src/03_pages/SignupPage/useSignupSubmit.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../02_stores/authStore/authStore';

interface SignupData {
    user_name: string;
    login: string;
    password: string;
}

interface UseSignupSubmitReturn {
    signupSuccess: boolean;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>, formData: SignupData, validateForm: () => boolean) => Promise<void>;
}

export const useSignupSubmit = (): UseSignupSubmitReturn => {
    const navigate = useNavigate();
    const { signup, error } = useAuthStore();
    const [signupSuccess, setSignupSuccess] = useState(false);

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
        formData: SignupData,
        validateForm: () => boolean
    ): Promise<void> => {
        e.preventDefault();

        if (error) {
            useAuthStore.getState().clearError();
        }

        if (validateForm()) {
            try {
                await signup({
                    user_name: formData.user_name,
                    login: formData.login,
                    password: formData.password,
                });

                setSignupSuccess(true);
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            fromSignup: true,
                            login: formData.login
                        }
                    });
                }, 2000);
            } catch (error) {
                console.error(error);
            }
        }
    };

    return {
        signupSuccess,
        handleSubmit,
    };
};
