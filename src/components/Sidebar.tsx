'use client'

import { Plus, MessageSquare, LogOut, Database, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Sidebar({ conversations, currentConvId, onSelect, view, onViewChange }: any) {
    const supabase = createClient();
    const router = useRouter();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <button className="new-chat-btn" onClick={() => {
                    onSelect(null);
                    onViewChange('chat');
                }}>
                    <Plus size={18} /> New chat
                </button>
            </div>

            <div className="sidebar-nav">
                <button
                    className={`nav-item ${view === 'rag' ? 'active' : ''}`}
                    onClick={() => onViewChange('rag')}
                >
                    <Database size={18} /> Knowledge Base
                </button>
            </div>

            <div className="conv-list">
                <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0 1rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>Recent Tool Chats</h3>
                {conversations.map((conv: any) => (
                    <div
                        key={conv.id}
                        className={`conv-item ${currentConvId === conv.id && view === 'chat' ? 'active' : ''}`}
                        onClick={() => onSelect(conv.id)}
                    >
                        <MessageSquare size={16} />
                        <span>{conv.title}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'auto', padding: '10px 0', borderTop: '1px solid var(--border-color)' }}>
                <button
                    onClick={handleSignOut}
                    className="sign-out-btn"
                >
                    <LogOut size={18} /> Sign out
                </button>
            </div>
        </aside>
    );
}
