import { Cancel, CheckCircle } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
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

            <Grid container spacing={3}>
                {/* Server Status */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h2" gutterBottom>
                                📊 Server Status
                            </Typography>
                            {serverStatus ? (
                                <Box>
                                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                        {serverStatus.server_running ? (
                                            <CheckCircle color="success" />
                                        ) : (
                                            <Cancel color="error" />
                                        )}
                                        <Typography variant="h6">
                                            Status: {serverStatus.server_running ? 'Running' : 'Stopped'}
                                        </Typography>
                                    </Stack>
                                    <Box mb={1}>
                                        <Typography variant="body2">
                                            <strong>Port:</strong> {serverStatus.port}
                                        </Typography>
                                    </Box>
                                    <Box mb={1}>
                                        <Typography variant="body2">
                                            <strong>Providers:</strong> {serverStatus.providers_enabled}/{serverStatus.providers_total}
                                        </Typography>
                                    </Box>
                                    {serverStatus.uptime && (
                                        <Box mb={1}>
                                            <Typography variant="body2">
                                                <strong>Uptime:</strong> {serverStatus.uptime}
                                            </Typography>
                                        </Box>
                                    )}
                                    {serverStatus.last_updated && (
                                        <Box mb={1}>
                                            <Typography variant="body2">
                                                <strong>Last Updated:</strong> {serverStatus.last_updated}
                                            </Typography>
                                        </Box>
                                    )}
                                    {serverStatus.request_count !== undefined && (
                                        <Box mb={1}>
                                            <Typography variant="body2">
                                                <strong>Request Count:</strong> {serverStatus.request_count}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Stack direction="row" spacing={2} mt={3}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={handleStartServer}
                                            disabled={serverStatus.server_running}
                                        >
                                            Start
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={handleStopServer}
                                            disabled={!serverStatus.server_running}
                                        >
                                            Stop
                                        </Button>
                                        <Button variant="contained" onClick={handleRestartServer}>
                                            Restart
                                        </Button>
                                    </Stack>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">Loading...</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Configuration */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h2" gutterBottom>
                                ⚙️ Configuration
                            </Typography>
                            {serverStatus ? (
                                <Box>
                                    <Box mb={2} p={2} bgcolor="grey.100" borderRadius={1}>
                                        <Typography variant="body2" gutterBottom>
                                            <strong>Server Port</strong>
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {serverStatus.port}
                                        </Typography>
                                    </Box>
                                    <Box mb={2} p={2} bgcolor="grey.100" borderRadius={1}>
                                        <Typography variant="body2" gutterBottom>
                                            <strong>Enabled Providers</strong>
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {serverStatus.providers_enabled} of {serverStatus.providers_total}
                                        </Typography>
                                    </Box>
                                    {serverStatus.action_stats && (
                                        <Box mb={2} p={2} bgcolor="grey.100" borderRadius={1}>
                                            <Typography variant="body2" gutterBottom>
                                                <strong>Total Actions</strong>
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                {String(Object.values(serverStatus.action_stats).reduce((a: any, b: any) => a + b, 0))}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Stack direction="row" spacing={2} mt={3}>
                                        <Button variant="outlined" onClick={loadServerStatus}>
                                            Refresh
                                        </Button>
                                        <Button variant="contained" onClick={handleGenerateToken}>
                                            Generate Token
                                        </Button>
                                    </Stack>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">Loading...</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Activity Log */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h2" gutterBottom>
                                📜 Recent Activity
                            </Typography>
                            <Stack direction="row" spacing={2} mb={2}>
                                <Button variant="outlined" onClick={loadActivityLog}>
                                    Refresh Log
                                </Button>
                                <Button variant="outlined" onClick={clearLog}>
                                    Clear Log
                                </Button>
                            </Stack>
                            <Box
                                sx={{
                                    bgcolor: 'grey.900',
                                    color: 'grey.100',
                                    p: 2,
                                    borderRadius: 1,
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    maxHeight: 400,
                                    overflowY: 'auto',
                                }}
                            >
                                {activityLog.length > 0 ? (
                                    activityLog.map((entry, index) => {
                                        const timestamp = new Date(entry.timestamp).toLocaleString();
                                        const isSuccess = entry.success;
                                        return (
                                            <Box key={index} mb={0.5}>
                                                <Typography
                                                    component="span"
                                                    sx={{ color: 'grey.500', fontSize: '0.85rem' }}
                                                >
                                                    [{timestamp}]
                                                </Typography>{' '}
                                                <Typography component="span" color={isSuccess ? 'success.light' : 'error.light'}>
                                                    {isSuccess ? '✅' : '❌'}
                                                </Typography>{' '}
                                                <Typography component="span">
                                                    {entry.action}: {entry.message}
                                                </Typography>
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <Typography color="grey.500">No recent activity</Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Server;
