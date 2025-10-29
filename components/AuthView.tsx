import React, { useState } from 'react';
import { ModelIcon } from './icons';
import { loginUser, registerUser } from '../services/api';
import { User } from '../types';

interface AuthViewProps {
    onLoginSuccess: (user: User) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            let response;
            if (isLoginView) {
                response = await loginUser(email, password);
            } else {
                response = await registerUser(name, email, password);
            }
            
            const userWithToken: User = {
                id: response.user.id,
                name: response.user.name,
                email: response.user.email,
                avatar: response.user.avatar,
                token: response.token
            };

            onLoginSuccess(userWithToken);

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-background-main">
            <div className="w-full max-w-md p-8 space-y-8 bg-background-panel rounded-2xl shadow-lg border border-border-color">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                           <ModelIcon className="w-7 h-7 text-white"/>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-text-primary">
                        {isLoginView ? 'Welcome Back!' : 'Create an Account'}
                    </h1>
                    <p className="text-text-secondary mt-2">
                        {isLoginView ? 'Sign in to continue to Whooper' : 'Join the Whooper community'}
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {!isLoginView && (
                         <div>
                            <label htmlFor="name" className="text-sm font-medium text-text-secondary block mb-2">Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent"
                            />
                        </div>
                    )}
                     <div>
                        <label htmlFor="email" className="text-sm font-medium text-text-secondary block mb-2">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent"
                        />
                    </div>
                     <div>
                        <label htmlFor="password" className="text-sm font-medium text-text-secondary block mb-2">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-input-field border border-border-color rounded-lg focus:ring-accent focus:border-accent"
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-status-red text-center p-2 bg-status-red-soft rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-500"
                        >
                            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isLoginView ? 'Sign in' : 'Create Account')}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="text-sm text-accent hover:underline">
                        {isLoginView ? 'Don\'t have an account? Sign up' : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthView;