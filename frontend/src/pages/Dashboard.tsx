import { Cancel, CheckCircle } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

const Dashboard = () => {
    const [serverStatus, setServerStatus] = useState<any>(null);
    const [providersStatus, setProvidersStatus] = useState<any>(null);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [defaults, setDefaults] = useState<any>({});
    const [providers, setProviders] = useState<any[]>([]);
    const [providerModels, setProviderModels] = useState<any>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [requestModelName, setRequestModelName] = useState('tingly');
    const [responseModelName, setResponseModelName] = useState('');
    const [defaultProvider, setDefaultProvider] = useState('');
    const [defaultModel, setDefaultModel] = useState('');

    useEffect(() => {
        loadAllData();
        const interval = setInterval(() => {
            loadServerStatus();
            loadProvidersStatus();
            loadRecentActivity();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([
            loadServerStatus(),
            loadProvidersStatus(),
            loadRecentActivity(),
            loadDefaults(),
            loadProviderSelectionPanel(),
        ]);
        setLoading(false);
    };

    const loadServerStatus = async () => {
        const result = await api.getStatus();
        if (result.success) {
            setServerStatus(result.data);
        }
    };

    const loadProvidersStatus = async () => {
        const result = await api.getProviders();
        if (result.success) {
            setProvidersStatus(result.data);
        }
    };

    const loadRecentActivity = async () => {
        const result = await api.getHistory(5);
        if (result.success) {
            setRecentActivity(result.data);
        }
    };

    const loadDefaults = async () => {
        const result = await api.getDefaults();
        if (result.success) {
            const data = result.data;
            setDefaults(data);
            setRequestModelName(data.requestModel || 'tingly');
            setResponseModelName(data.responseModel || '');
            setDefaultProvider(data.defaultProvider || '');
            setDefaultModel(data.defaultModel || '');
        }
    };

    const loadProviderSelectionPanel = async () => {
        const [providersResult, modelsResult, defaultsResult] = await Promise.all([
            api.getProviders(),
            api.getProviderModels(),
            api.getDefaults(),
        ]);

        if (providersResult.success && modelsResult.success) {
            setProviders(providersResult.data);
            setProviderModels(modelsResult.data);
            if (defaultsResult.success) {
                setDefaults(defaultsResult.data);
            }
        }
    };

    const handleProviderChange = async (provider: string) => {
        setDefaultProvider(provider);
        if (provider) {
            const providerData = providerModels[provider];
            const models = providerData ? providerData.models : [];
            if (models.length > 0) {
                setDefaultModel(models[0]);
            }
        } else {
            setDefaultModel('');
        }
    };

    const handleSaveDefaults = async () => {
        if (!requestModelName) {
            setMessage({ type: 'error', text: 'Request model name is required' });
            return;
        }

        if (defaultProvider && !defaultModel) {
            setMessage({ type: 'error', text: 'Please select a model when setting a default provider' });
            return;
        }

        const result = await api.setDefaults({
            requestModel: requestModelName,
            responseModel: responseModelName,
            defaultProvider,
            defaultModel,
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Defaults saved successfully' });
            await loadProviderSelectionPanel();
        } else {
            setMessage({ type: 'error', text: result.error });
        }
    };

    const handleStartServer = async () => {
        const port = prompt('Enter port (8080):', '8080');
        if (port) {
            const result = await api.startServer(parseInt(port));
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setTimeout(loadServerStatus, 1000);
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
                setTimeout(loadServerStatus, 1000);
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        }
    };

    const handleRestartServer = async () => {
        const port = prompt('Enter port (8080):', '8080');
        if (port) {
            const result = await api.restartServer(parseInt(port));
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                setTimeout(loadServerStatus, 1000);
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
                setMessage({ type: 'success', text: 'Token generated and copied to clipboard!' });
            } else {
                setMessage({ type: 'error', text: result.error });
            }
        }
    };

    const setDefaultProviderHandler = async (providerName: string) => {
        const currentDefaults = await api.getDefaults();
        if (!currentDefaults.success) {
            setMessage({ type: 'error', text: 'Failed to get current defaults' });
            return;
        }

        const payload = {
            defaultProvider: providerName,
            defaultModel: currentDefaults.data.defaultModel || '',
            requestModel: currentDefaults.data.requestModel || 'tingly',
            responseModel: currentDefaults.data.responseModel || '',
        };

        const result = await api.setDefaults(payload);
        if (result.success) {
            setMessage({ type: 'success', text: `Set ${providerName} as default provider` });
            await loadProviderSelectionPanel();
            await loadDefaults();
        } else {
            setMessage({ type: 'error', text: result.error });
        }
    };

    const fetchProviderModels = async (providerName: string) => {
        const result = await api.getProviderModelsByName(providerName);
        if (result.success) {
            setMessage({ type: 'success', text: `Successfully fetched models for ${providerName}` });
            await loadProviderSelectionPanel();
            const defaultProviderSelect = defaultProvider;
            if (defaultProviderSelect === providerName) {
                await loadDefaults();
            }
        } else {
            setMessage({ type: 'error', text: `Failed to fetch models: ${result.error}` });
        }
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
                {/* Default Model Configuration */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h2" gutterBottom>
                                🎯 Default Model Configuration
                            </Typography>

                            <TextField
                                fullWidth
                                label="Request Model Name"
                                value={requestModelName}
                                onChange={(e) => setRequestModelName(e.target.value)}
                                margin="normal"
                                helperText="When requests use this model name, the default provider and model will be used"
                            />

                            <TextField
                                fullWidth
                                label="Response Model"
                                value={responseModelName}
                                onChange={(e) => setResponseModelName(e.target.value)}
                                margin="normal"
                                helperText="Model to use for response processing (optional - leave empty for default behavior)"
                            />

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Default Provider</InputLabel>
                                <Select
                                    value={defaultProvider}
                                    onChange={(e) => handleProviderChange(e.target.value)}
                                    label="Default Provider"
                                >
                                    <MenuItem value="">Select a provider</MenuItem>
                                    {providers.map((provider) => (
                                        <MenuItem key={provider.name} value={provider.name}>
                                            {provider.name} ({provider.enabled ? 'enabled' : 'disabled'})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal" disabled={!defaultProvider}>
                                <InputLabel>Default Model</InputLabel>
                                <Select
                                    value={defaultModel}
                                    onChange={(e) => setDefaultModel(e.target.value)}
                                    label="Default Model"
                                >
                                    <MenuItem value="">Select a model</MenuItem>
                                    {providerModels[defaultProvider]?.models.map((model: string) => (
                                        <MenuItem key={model} value={model}>
                                            {model}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Stack direction="row" spacing={2} mt={2}>
                                <Button variant="contained" onClick={handleSaveDefaults}>
                                    Save Defaults
                                </Button>
                                <Button variant="outlined" onClick={loadDefaults}>
                                    Refresh Models
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Provider Selection */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h2" gutterBottom>
                                ⚡ Quick Provider Selection
                            </Typography>
                            <Grid container spacing={2}>
                                {providers.map((provider) => {
                                    const providerData = providerModels[provider.name];
                                    const models = providerData ? providerData.models : [];
                                    const isDefault = defaults.defaultProvider === provider.name;

                                    return (
                                        <Grid item xs={12} key={provider.name}>
                                            <Box
                                                sx={{
                                                    border: 2,
                                                    borderColor: isDefault
                                                        ? 'warning.main'
                                                        : provider.enabled
                                                            ? 'success.main'
                                                            : 'error.main',
                                                    borderRadius: 2,
                                                    p: 2,
                                                    bgcolor: isDefault
                                                        ? 'warning.light'
                                                        : provider.enabled
                                                            ? 'success.light'
                                                            : 'error.light',
                                                    opacity: provider.enabled ? 1 : 0.7,
                                                }}
                                            >
                                                <Stack spacing={1}>
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="h6">{provider.name}</Typography>
                                                        <Chip
                                                            label={provider.enabled ? 'Enabled' : 'Disabled'}
                                                            color={provider.enabled ? 'success' : 'error'}
                                                            size="small"
                                                        />
                                                    </Stack>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {models.length > 0 ? `${models.length} models` : 'No models loaded'}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1}>
                                                        {!isDefault ? (
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="warning"
                                                                onClick={() => setDefaultProviderHandler(provider.name)}
                                                            >
                                                                Set Default
                                                            </Button>
                                                        ) : (
                                                            <Chip label="Default Provider" color="warning" size="small" />
                                                        )}
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => fetchProviderModels(provider.name)}
                                                        >
                                                            Fetch Models
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

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
                                        <Typography>
                                            <strong>Status:</strong> {serverStatus.server_running ? 'Running' : 'Stopped'}
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
                                    <Stack direction="row" spacing={2} mt={2}>
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

                {/* Providers Summary */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h2" gutterBottom>
                                👥 Providers
                            </Typography>
                            {providersStatus ? (
                                <Box>
                                    <Box mb={1}>
                                        <Typography variant="body2">
                                            <strong>Total Providers:</strong> {providersStatus.length}
                                        </Typography>
                                    </Box>
                                    <Box mb={1}>
                                        <Typography variant="body2">
                                            <strong>Enabled:</strong> {providersStatus.filter((p: any) => p.enabled).length}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        sx={{ mt: 2 }}
                                        onClick={() => window.location.href = '/providers'}
                                    >
                                        Manage Providers
                                    </Button>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">Loading...</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Authentication */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h2" gutterBottom>
                                🔑 Authentication
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Generate JWT token for API access
                            </Typography>
                            <Button variant="contained" onClick={handleGenerateToken}>
                                Generate Token
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h2" gutterBottom>
                                📜 Recent Activity
                            </Typography>
                            <Box
                                sx={{
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    p: 1,
                                }}
                            >
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((entry, index) => (
                                        <Box key={index} mb={1}>
                                            <Typography variant="body2">
                                                {new Date(entry.timestamp).toLocaleTimeString()}{' '}
                                                {entry.success ? '✅' : '❌'} {entry.action}
                                            </Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography color="text.secondary">No recent activity</Typography>
                                )}
                            </Box>
                            <Button
                                variant="outlined"
                                sx={{ mt: 2 }}
                                onClick={() => window.location.href = '/history'}
                            >
                                View Full History
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;
