import { Alert, Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import CardGrid, { CardGridItem } from '../components/CardGrid';
import UnifiedCard from '../components/UnifiedCard';
import ServerStatusControl from '../components/ServerStatusControl';
import ServerConfiguration from '../components/ServerConfiguration';
import ActivityLog from '../components/ActivityLog';
import { api } from '../services/api';

const Server = () => {
    const [serverStatus, setServerStatus] = useState<any>(null);
    const [activityLog, setActivityLog] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllData();

        const statusInterval = setInterval(() => {
            loadServerStatus();
        }, 30000);

        const logInterval = setInterval(() => {
            loadActivityLog();
        }, 10000);

        return () => {
            clearInterval(statusInterval);
            clearInterval(logInterval);
        };
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([loadServerStatus(), loadActivityLog()]);
        setLoading(false);
    };

    const loadServerStatus = async () => {
        const result = await api.getStatus();
        if (result.success) {
            setServerStatus(result.data);
        }
    };

    const loadActivityLog = async () => {
        const result = await api.getHistory(50);
        if (result.success) {
            setActivityLog(result.data);
        }
    };

    const handleStartServer = async () => {
        const port = prompt('Enter port for server (8080):', '8080');
        if (port) {
            const result = await api.startServer(parseInt(port));
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setTimeout(() => {
                    loadServerStatus();
                    loadActivityLog();
                }, 1000);
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        }
    };

    const handleStopServer = async () => {
        if (confirm('Are you sure you want to stop the server?')) {
            const result = await api.stopServer();
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setTimeout(() => {
                    loadServerStatus();
                    loadActivityLog();
                }, 1000);
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        }
    };

    const handleRestartServer = async () => {
        const port = prompt('Enter port for server (8080):', '8080');
        if (port) {
            const result = await api.restartServer(parseInt(port));
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setTimeout(() => {
                    loadServerStatus();
                    loadActivityLog();
                }, 1000);
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        }
    };

    const handleGenerateToken = async () => {
        const clientId = prompt('Enter client ID (web):', 'web');
        if (clientId) {
            const result = await api.generateToken(clientId);
            if (result.success) {
                navigator.clipboard.writeText(result.data.token);
                setMessage({ type: 'success', text: 'Token copied to clipboard!' });
                loadActivityLog();
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        }
    };

    const clearLog = () => {
        setActivityLog([]);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {message && (
                <Alert
                    severity={message.type}
                    sx={{ mb: 2 }}
                    onClose={() => setMessage(null)}
                >
                    {message.text}
                </Alert>
            )}

            <CardGrid>
                {/* Server Status */}
                <CardGridItem xs={12} md={6}>
                    <UnifiedCard
                        title="Server Status"
                        subtitle={serverStatus ? (serverStatus.server_running ? "Server is running" : "Server is stopped") : "Loading..."}
                        size="large"
                    >
                        {serverStatus ? (
                            <ServerStatusControl
                                serverStatus={serverStatus}
                                onStartServer={handleStartServer}
                                onStopServer={handleStopServer}
                                onRestartServer={handleRestartServer}
                            />
                        ) : (
                            <div>Loading...</div>
                        )}
                    </UnifiedCard>
                </CardGridItem>

                {/* Configuration */}
                <CardGridItem xs={12} md={6}>
                    <UnifiedCard
                        title="Configuration"
                        subtitle="Server configuration and management"
                        size="large"
                    >
                        {serverStatus ? (
                            <ServerConfiguration
                                serverStatus={serverStatus}
                                onRefreshStatus={loadServerStatus}
                                onGenerateToken={handleGenerateToken}
                            />
                        ) : (
                            <div>Loading...</div>
                        )}
                    </UnifiedCard>
                </CardGridItem>

                {/* Activity Log */}
                <CardGridItem xs={12}>
                    <UnifiedCard
                        title="Activity Log"
                        subtitle={`${activityLog.length} recent activity entries`}
                        size="large"
                    >
                        <ActivityLog
                            activityLog={activityLog}
                            onLoadActivityLog={loadActivityLog}
                            onClearLog={clearLog}
                        />
                    </UnifiedCard>
                </CardGridItem>
            </CardGrid>
        </Box>
    );
};

export default Server;
