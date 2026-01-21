'use client'

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        console.log('Attempting auth...', { email, isSignUp });

        try {
            const { data, error } = isSignUp
                ? await supabase.auth.signUp({ email, password })
                : await supabase.auth.signInWithPassword({ email, password });

            console.log('Auth result:', { data, error });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                if (isSignUp && !data.session) {
                    setError('Please check your email for a confirmation link.');
                    setLoading(false);
                } else {
                    console.log('Redirecting...');
                    router.refresh();
                    router.push('/');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'An unexpected error occurred');
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/');
            }
        };
        checkUser();
    }, [supabase, router]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: '1rem',
            backgroundColor: '#0d1117',
            color: '#c9d1d9',
            fontFamily: 'Inter, sans-serif'
        }}>
            <h1 style={{ marginBottom: '1rem' }}>GCP AI Assistant</h1>

            <form onSubmit={handleAuth} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                width: '100%',
                maxWidth: '320px',
                padding: '2rem',
                backgroundColor: '#161b22',
                borderRadius: '8px',
                border: '1px solid #30363d'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>

                {error && <p style={{ color: '#f85149', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #30363d',
                            backgroundColor: '#0d1117',
                            color: 'white'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #30363d',
                            backgroundColor: '#0d1117',
                            color: 'white'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '0.75rem',
                        marginTop: '1rem',
                        backgroundColor: '#238636',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '1rem' }}>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#58a6ff',
                            cursor: 'pointer',
                            marginLeft: '5px'
                        }}
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </form>
        </div>
    );
}
