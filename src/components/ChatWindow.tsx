'use client'

import { useState, useRef, useEffect, useMemo } from 'react';
import {
    Send, Paperclip, Calendar, Mail, FileText,
    HardDrive, Search, Globe, Database, Cpu,
    Lock, CheckCircle, AlertCircle, RefreshCw, X, Loader2,
    Settings, Shield, ChevronRight, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

type ToolType = 'default' | 'web' | 'rag' | 'gmail' | 'calendar' | 'drive' | 'docs';

interface ServicePermissions {
    gmail: { enabled: boolean; writeAccess: boolean };
    calendar: { enabled: boolean; writeAccess: boolean };
    drive: { enabled: boolean; writeAccess: boolean };
    docs: { enabled: boolean; writeAccess: boolean };
}

interface ServiceStatus {
    gmail: boolean;
    calendar: boolean;
    drive: boolean;
    docs: boolean;
    permissions?: {
        gmail: string;
        calendar: string;
        drive: string;
        docs: string;
    };
    isGlobalConnected: boolean;
}

export default function ChatWindow({ conversationId, onConversationCreated }: any) {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTool, setActiveTool] = useState<ToolType>('default');
    const [status, setStatus] = useState<ServiceStatus>({
        gmail: false,
        calendar: false,
        drive: false,
        docs: false,
        isGlobalConnected: false
    });
    const [documents, setDocuments] = useState<any[]>([]);
    const [showRagSelector, setShowRagSelector] = useState(false);
    const [showMcpSettings, setShowMcpSettings] = useState(false);
    const [mcpPermissions, setMcpPermissions] = useState<ServicePermissions>({
        gmail: { enabled: true, writeAccess: false },
        calendar: { enabled: true, writeAccess: false },
        drive: { enabled: true, writeAccess: false },
        docs: { enabled: true, writeAccess: false }
    });

    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();
    const loadedConvId = useRef<string | null>(null);

    // Color mapping for tools
    const toolConfig = {
        default: { color: '#58a6ff', label: 'Ask anything...', icon: <Cpu size={16} /> },
        web: { color: '#3fb950', label: 'Search the web...', icon: <Globe size={16} /> },
        rag: { color: '#bc8cff', label: 'Ask your documents...', icon: <Database size={16} /> },
        gmail: { color: '#ff7b72', label: 'Manage emails...', icon: <Mail size={16} />, service: 'gmail' },
        calendar: { color: '#3fb950', label: 'Check calendar...', icon: <Calendar size={16} />, service: 'calendar' },
        drive: { color: '#d29922', label: 'Search Drive...', icon: <HardDrive size={16} />, service: 'drive' },
        docs: { color: '#1f6feb', label: 'Read documents...', icon: <FileText size={16} />, service: 'docs' },
    };

    const [selectedRagFiles, setSelectedRagFiles] = useState<string[]>([]);

    const fetchStatus = async () => {
        const res = await fetch('/api/google/status');
        if (res.ok) {
            const data = await res.json();
            setStatus(data);
        }
    };

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/documents');
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            }
        } catch (err) {
            console.error('Failed to fetch documents');
        }
    };

    const fetchSelectedRagFiles = () => {
        const saved = localStorage.getItem('selected_rag_files');
        if (saved) {
            try {
                setSelectedRagFiles(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load selected files');
            }
        } else {
            setSelectedRagFiles([]);
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchSelectedRagFiles();
        fetchDocuments();
        const interval = setInterval(fetchStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    // Also refresh selected files when tool changes to RAG or when window gains focus
    useEffect(() => {
        if (activeTool === 'rag') {
            fetchSelectedRagFiles();
            fetchDocuments();
        }
    }, [activeTool]);

    useEffect(() => {
        const handleFocus = () => {
            fetchSelectedRagFiles();
            fetchDocuments();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const toggleRagFile = (fileName: string) => {
        setSelectedRagFiles(prev => {
            const newSelection = prev.includes(fileName)
                ? prev.filter(f => f !== fileName)
                : [...prev, fileName];
            localStorage.setItem('selected_rag_files', JSON.stringify(newSelection));
            return newSelection;
        });
    };

    const toggleAllRagFiles = () => {
        const allFileNames = documents.map(d => d.file_name);
        if (selectedRagFiles.length === allFileNames.length) {
            setSelectedRagFiles([]);
            localStorage.setItem('selected_rag_files', JSON.stringify([]));
        } else {
            setSelectedRagFiles(allFileNames);
            localStorage.setItem('selected_rag_files', JSON.stringify(allFileNames));
        }
    };

    const loadMcpPermissions = () => {
        const saved = localStorage.getItem('mcp_permissions');
        if (saved) {
            try {
                setMcpPermissions(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load MCP permissions');
            }
        }
    };

    const saveMcpPermissions = (newPerms: ServicePermissions) => {
        setMcpPermissions(newPerms);
        localStorage.setItem('mcp_permissions', JSON.stringify(newPerms));
    };

    useEffect(() => {
        loadMcpPermissions();
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--active-accent', toolConfig[activeTool].color);
    }, [activeTool]);

    useEffect(() => {
        if (conversationId && conversationId !== loadedConvId.current) {
            fetchMessages();
            loadedConvId.current = conversationId;
        } else if (!conversationId) {
            setMessages([]);
            loadedConvId.current = null;
        }
    }, [conversationId]);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        if (!error) setMessages(data || []);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async (customInput?: string) => {
        const textToSend = customInput || input;
        if (!textToSend.trim() || loading) return;

        const userMessage = { role: 'user', content: textToSend };
        setMessages((prev) => [...prev, userMessage]);
        if (!customInput) setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    conversationId,
                    toolPreference: activeTool,
                    activeFileNames: activeTool === 'rag' ? selectedRagFiles : [],
                    mcpConfig: mcpPermissions // Pass MCP permissions to backend
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Chat failed');
            }

            const newId = response.headers.get('x-conversation-id');
            if (newId && newId !== conversationId) {
                loadedConvId.current = newId;
                onConversationCreated(newId);
            }

            const reader = response.body?.getReader();
            if (!reader) return;

            const decoder = new TextDecoder();
            let assistantContent = '';
            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                assistantContent += decoder.decode(value);
                setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    return [...prev.slice(0, -1), { ...last, content: assistantContent }];
                });
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setNotification({ message: "File too large (Max 10MB)", type: 'error' });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (res.ok) {
                setNotification({ message: `File "${file.name}" indexed successfully!`, type: 'success' });
            } else {
                setNotification({ message: `Failed: ${data.error || 'Unknown error'}`, type: 'error' });
            }
        } catch (err: any) {
            setNotification({ message: `Upload error: ${err.message}`, type: 'error' });
        } finally {
            setUploading(false);
            if (e.target) e.target.value = ''; // Reset file input
            setTimeout(() => setNotification(null), 5000);
        }
    };

    const connectService = (service?: string) => {
        window.location.href = `/api/google/connect${service ? `?service=${service}` : ''}`;
    };

    const suggestedPrompts = [
        { label: "Analyze my recent emails", icon: <Mail size={16} />, tool: 'gmail' },
        { label: "Schedule a meeting for tomorrow", icon: <Calendar size={16} />, tool: 'calendar' },
        { label: "Quick-search my docs", icon: <Database size={16} />, tool: 'rag' },
        { label: "What's in my recent Drive files?", icon: <HardDrive size={16} />, tool: 'drive' }
    ];

    const toggleServicePermission = (service: keyof ServicePermissions) => {
        const newPerms = { ...mcpPermissions, [service]: { ...mcpPermissions[service], enabled: !mcpPermissions[service].enabled } };
        saveMcpPermissions(newPerms);
    };

    const toggleServiceWriteAccess = (service: keyof ServicePermissions) => {
        const newPerms = { ...mcpPermissions, [service]: { ...mcpPermissions[service], writeAccess: !mcpPermissions[service].writeAccess } };
        saveMcpPermissions(newPerms);
    };

    return (
        <div className="chat-interface-wrapper">
            <div className={`chat-container glass-container ${showMcpSettings ? 'with-sidebar' : ''}`}>
                {/* Header / Monitor Bar */}
                <div className="chat-header-bar">
                    <div className="ai-status">
                        <div className={`ai-orb ${loading ? 'thinking' : ''}`} />
                        <span className="ai-name">MCP Assistant</span>

                        <div className="service-monitor-glass flex items-center ml-4 gap-2 border-l border-white/5 pl-4">
                            <button
                                className={`header-tool-btn ${showMcpSettings ? 'active' : ''}`}
                                onClick={() => setShowMcpSettings(!showMcpSettings)}
                                title="MCP Controls"
                            >
                                <Shield size={16} />
                            </button>
                            <div className="h-4 w-[1px] bg-white/10 mx-1" />
                            <ServiceIcon icon={<Mail size={14} />} label="Gmail" connected={status.gmail} permission={status.permissions?.gmail} service="gmail" onClick={connectService} />
                            <ServiceIcon icon={<Calendar size={14} />} label="Calendar" connected={status.calendar} permission={status.permissions?.calendar} service="calendar" onClick={connectService} />
                            <ServiceIcon icon={<HardDrive size={14} />} label="Drive" connected={status.drive} permission={status.permissions?.drive} service="drive" onClick={connectService} />
                            <ServiceIcon icon={<FileText size={14} />} label="Docs" connected={status.docs} permission={status.permissions?.docs} service="docs" onClick={connectService} />
                        </div>
                    </div>

                    <div className="header-actions">
                        {/* Right side kept for potential future persistent actions */}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="messages-list-refactored" ref={scrollRef}>
                    <div className="cyber-grid-overlay" />
                    <AnimatePresence mode="popLayout">
                        {messages.length === 0 && (
                            <motion.div
                                key="welcome-section"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="welcome-section"
                            >
                                <motion.h1
                                    className="mesh-text"
                                    animate={{ scale: [1, 1.02, 1] }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    How can I help you?
                                </motion.h1>
                                <p className="welcome-subtitle">Connect your Google services or query your docs to get started.</p>

                                {/* Bento Grid Suggested Prompts */}
                                <div className="bento-grid">
                                    {suggestedPrompts.map((p, idx) => (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.05, rotate: 1, boxShadow: "0 0 20px rgba(88, 166, 255, 0.2)" }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bento-tile"
                                            onClick={() => {
                                                setActiveTool(p.tool as ToolType);
                                                handleSend(p.label);
                                            }}
                                        >
                                            <div className="bento-icon">{p.icon}</div>
                                            <span className="bento-label">{p.label}</span>
                                            <div className="bento-glow" />
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <LayoutGroup>
                            {messages.map((m, i) => (
                                <motion.div
                                    key={`msg-${i}`}
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    className={`message-v2 ${m.role}`}
                                >
                                    <div className="message-content">
                                        <ReactMarkdown>{m.content}</ReactMarkdown>
                                    </div>
                                    <div className="message-time">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </motion.div>
                            ))}
                        </LayoutGroup>

                        {loading && (
                            <motion.div
                                key="thinking-indicator"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="thinking-indicator-v2"
                            >
                                <div className="orb-small thinking" />
                                <span>Assistant is thinking...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input Area */}
                <div className="input-area-glass">
                    <div className="input-container-astral">
                        {/* RAG File Selector Dropdown Integration */}
                        {activeTool === 'rag' && (
                            <div className="rag-selector-compact">
                                <button className="rag-compact-toggle" onClick={() => setShowRagSelector(!showRagSelector)}>
                                    <Database size={12} />
                                    <span>{selectedRagFiles.length || 'No'} docs</span>
                                    <ChevronRight size={12} className={showRagSelector ? 'rotate-90' : ''} />
                                </button>
                                <AnimatePresence>
                                    {showRagSelector && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="rag-dropdown-glass"
                                        >
                                            <div className="rag-dropdown-header">
                                                <button onClick={toggleAllRagFiles} className="text-xs text-indigo-400 hover:text-indigo-300">
                                                    {selectedRagFiles.length === documents.length ? 'Unselect All' : 'Select All'}
                                                </button>
                                            </div>
                                            {documents.map((doc, dIdx) => (
                                                <div key={`${doc.id}-${dIdx}`} className="rag-item-glass" onClick={() => toggleRagFile(doc.file_name)}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRagFiles.includes(doc.file_name)}
                                                        onChange={() => { }} /* Handled by parent div for better mobile/hitbox support */
                                                        readOnly
                                                    />
                                                    <span className="text-truncate">{doc.file_name}</span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="tool-chips-bar">
                            {(Object.keys(toolConfig) as Array<keyof typeof toolConfig>).map((t, tIdx) => (
                                <button
                                    key={`tool-${tIdx}`}
                                    className={`tool-chip ${activeTool === t ? 'active' : ''}`}
                                    onClick={() => setActiveTool(t as ToolType)}
                                    style={{
                                        '--tool-color': toolConfig[t].color,
                                        boxShadow: activeTool === t ? `0 0 10px ${toolConfig[t].color}` : 'none',
                                        borderColor: activeTool === t ? toolConfig[t].color : 'var(--border-color)'
                                    } as any}
                                >
                                    {t === 'default' ? 'AI' : toolConfig[t].label.split(' ')[0]}
                                </button>
                            ))}
                        </div>

                        <div className="input-row">
                            <button className="action-btn-glass" onClick={() => fileInputRef.current?.click()} title="Attach File">
                                {uploading ? <Loader2 className="animate-spin" size={18} /> : <Paperclip size={18} />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileUpload}
                            />

                            <div className="textarea-container-glass">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    placeholder="Message MCP Assistant..."
                                    rows={1}
                                />
                            </div>

                            <motion.button
                                className="liquid-send-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleSend()}
                            >
                                <Send size={18} />
                            </motion.button>
                        </div>
                    </div>
                    <div className="input-footer-text">
                    </div>
                </div>
            </div>

            {/* Sidebar Settings Integration */}
            <AnimatePresence>
                {showMcpSettings && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="chat-settings-sidebar glass-container"
                    >
                        <div className="sidebar-header">
                            <Shield size={20} />
                            <h3>MCP Controls</h3>
                            <button onClick={() => setShowMcpSettings(false)} className="close-btn">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="settings-list">
                            {(Object.keys(mcpPermissions) as Array<keyof ServicePermissions>).map(service => (
                                <div key={service} className="setting-item-glass">
                                    <div className="setting-info">
                                        <div className="setting-icon" style={{ color: (toolConfig as any)[service].color }}>
                                            {(toolConfig as any)[service].icon}
                                        </div>
                                        <span>{service.charAt(0).toUpperCase() + service.slice(1)}</span>
                                    </div>
                                    <div className="setting-controls">
                                        <button
                                            className={`write-toggle-btn ${mcpPermissions[service].writeAccess ? 'active' : ''}`}
                                            onClick={() => toggleServiceWriteAccess(service)}
                                            title={mcpPermissions[service].writeAccess ? "Write Access Enabled" : "Enable Write Access"}
                                        >
                                            <Zap size={14} fill={mcpPermissions[service].writeAccess ? "currentColor" : "none"} />
                                        </button>
                                        <label className="toggle-glass" title="Enable Service">
                                            <input
                                                type="checkbox"
                                                checked={mcpPermissions[service].enabled}
                                                onChange={() => toggleServicePermission(service)}
                                            />
                                            <span className="slider" style={{
                                                '--active-color': (toolConfig as any)[service].color
                                            } as any} />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="sidebar-footer">
                            <p>Enabled: AI can read data from this service.</p>
                            <p>Zap: AI can create/delete data in this service.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`toast-notification ${notification.type}`}
                    >
                        {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span>{notification.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ServiceIcon({ icon, label, connected, permission, service, onClick }: any) {
    const handleToggle = async (e: React.MouseEvent) => {
        if (connected) {
            e.preventDefault();
            if (confirm(`Disconnect ${label}?`)) {
                await fetch(`/api/google/disconnect?service=${service}`, { method: 'POST' });
                window.location.reload();
            }
        } else {
            onClick(service);
        }
    };

    return (
        <button
            className={`service-icon ${connected ? 'connected' : ''}`}
            onClick={handleToggle}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            title={`${label}: ${connected ? `Connected (${permission})` : 'Disconnected'}`}
        >
            {icon}
            <div className="tooltip">
                {label}: {connected ? (
                    <span style={{ color: permission === 'Read-Write' ? '#3fb950' : '#d29922' }}>
                        {permission}
                    </span>
                ) : 'Click to connect'}
            </div>
        </button>
    );
}

function ToolButton({ type, active, icon, label, connected, onClick, config }: any) {
    const isLocked = connected === false;

    // Convert hex color to RGB for the CSS variable
    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    };

    return (
        <button
            className={`tool-btn ${active ? 'active' : ''} ${isLocked ? 'disabled' : ''}`}
            onClick={onClick}
            style={{ '--accent-rgb': hexToRgb(config?.color || '#58a6ff') } as any}
        >
            {isLocked ? <Lock size={12} /> : icon}
            <span>{label}</span>
            {connected && <div className="status-dot connected" style={{ width: 4, height: 4 }} />}
        </button>
    );
}
