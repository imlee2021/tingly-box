import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CardGrid, { CardGridItem } from '../components/CardGrid';
import UnifiedCard from '../components/UnifiedCard';
import ProviderCard from '../components/ProviderCard';
import { api } from '../services/api';

const Providers = () => {
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Add provider form
    const [providerName, setProviderName] = useState('');
    const [providerApiBase, setProviderApiBase] = useState('');
    const [providerToken, setProviderToken] = useState('');

    // Edit dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<any>(null);
    const [editName, setEditName] = useState('');
    const [editApiBase, setEditApiBase] = useState('');
    const [editToken, setEditToken] = useState('');
    const [editEnabled, setEditEnabled] = useState(true);

    useEffect(() => {
        loadProviders();
    }, []);

    const loadProviders = async () => {
        setLoading(true);
        const result = await api.getProviders();
        if (result.success) {
            setProviders(result.data);
        } else {
            setMessage({ type: 'error', text: `Failed to load providers: ${result.error}` });
        }
        setLoading(false);
    };

    const handleAddProvider = async (e: React.FormEvent) => {
        e.preventDefault();

        const providerData = {
            name: providerName,
            api_base: providerApiBase,
            token: providerToken,
        };

        const result = await fetch('/api/providers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(providerData),
        }).then(res => res.json());

        if (result.success) {
            setMessage({ type: 'success', text: 'Provider added successfully!' });
            setProviderName('');
            setProviderApiBase('');
            setProviderToken('');
            loadProviders();
        } else {
            setMessage({ type: 'error', text: `Failed to add provider: ${result.error}` });
        }
    };

    const handleDeleteProvider = async (name: string) => {
        if (!confirm(`Are you sure you want to delete provider "${name}"?`)) {
            return;
        }

        const result = await fetch(`/api/providers/${name}`, {
            method: 'DELETE',
        }).then(res => res.json());

        if (result.success) {
            setMessage({ type: 'success', text: 'Provider deleted successfully!' });
            loadProviders();
        } else {
            setMessage({ type: 'error', text: `Failed to delete provider: ${result.error}` });
        }
    };

    const handleToggleProvider = async (name: string) => {
        const result = await fetch(`/api/providers/${name}/toggle`, {
            method: 'POST',
        }).then(res => res.json());

        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            loadProviders();
        } else {
            setMessage({ type: 'error', text: `Failed to toggle provider: ${result.error}` });
        }
    };

    const handleEditProvider = async (name: string) => {
        const result = await fetch(`/api/providers/${name}`).then(res => res.json());

        if (result.success) {
            const provider = result.data;
            setEditingProvider(provider);
            setEditName(provider.name);
            setEditApiBase(provider.api_base);
            setEditToken('');
            setEditEnabled(provider.enabled);
            setEditDialogOpen(true);
        } else {
            setMessage({ type: 'error', text: `Failed to load provider details: ${result.error}` });
        }
    };

    const handleUpdateProvider = async (e: React.FormEvent) => {
        e.preventDefault();

        // If token is empty, don't update it
        const providerData: any = {
            name: editName,
            api_base: editApiBase,
            enabled: editEnabled,
        };

        if (editToken.trim() !== '') {
            providerData.token = editToken;
        }

        const result = await fetch(`/api/providers/${editingProvider.name}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(providerData),
        }).then(res => res.json());

        if (result.success) {
            setMessage({ type: 'success', text: 'Provider updated successfully!' });
            setEditDialogOpen(false);
            setEditingProvider(null);
            loadProviders();
        } else {
            setMessage({ type: 'error', text: `Failed to update provider: ${result.error}` });
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

            <CardGrid>
                <CardGridItem xs={12}>
                    <UnifiedCard
                        title="Current Providers"
                        subtitle={providers.length > 0 ? `Managing ${providers.length} provider(s)` : "No providers configured yet"}
                        size="fullw"
                    >
                        {providers.length > 0 ? (
                            <Box sx={{ flex: 1 }}>
                                <CardGrid>
                                    {providers.map((provider) => (
                                        <CardGridItem xs={12} sm={6} md={4} lg={3} key={provider.name}>
                                            <ProviderCard
                                                provider={provider}
                                                variant="detailed"
                                                onEdit={handleEditProvider}
                                                onToggle={handleToggleProvider}
                                                onDelete={handleDeleteProvider}
                                            />
                                        </CardGridItem>
                                    ))}
                                </CardGrid>
                            </Box>
                        ) : (
                            <Box textAlign="center" py={5}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No Providers Configured
                                </Typography>
                                <Typography color="text.secondary">
                                    Add your first AI provider using the form below to get started.
                                </Typography>
                            </Box>
                        )}
                    </UnifiedCard>
                </CardGridItem>

                <CardGridItem xs={12}>
                    <UnifiedCard
                        title="Add New Provider"
                        subtitle="Configure a new AI provider for your proxy"
                        size="large"
                    >
                        <form onSubmit={handleAddProvider}>
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Provider Name"
                                    value={providerName}
                                    onChange={(e) => setProviderName(e.target.value)}
                                    required
                                    placeholder="e.g., openai, anthropic"
                                />
                                <TextField
                                    fullWidth
                                    label="API Base URL"
                                    value={providerApiBase}
                                    onChange={(e) => setProviderApiBase(e.target.value)}
                                    required
                                    placeholder="e.g., https://api.openai.com/v1"
                                />
                                <TextField
                                    fullWidth
                                    label="API Token"
                                    type="password"
                                    value={providerToken}
                                    onChange={(e) => setProviderToken(e.target.value)}
                                    required
                                    placeholder="Your API token"
                                />
                                <Stack direction="row" spacing={2}>
                                    <Button type="submit" variant="contained">
                                        Add Provider
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setProviderName('');
                                            setProviderApiBase('');
                                            setProviderToken('');
                                        }}
                                    >
                                        Clear Form
                                    </Button>
                                </Stack>
                            </Stack>
                        </form>
                    </UnifiedCard>
                </CardGridItem>
            </CardGrid>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Provider</DialogTitle>
                <form onSubmit={handleUpdateProvider}>
                    <DialogContent>
                        <Stack spacing={2} mt={1}>
                            <TextField
                                fullWidth
                                label="Provider Name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                required
                            />
                            <TextField
                                fullWidth
                                label="API Base URL"
                                value={editApiBase}
                                onChange={(e) => setEditApiBase(e.target.value)}
                                required
                            />
                            <TextField
                                fullWidth
                                label="API Token"
                                type="password"
                                value={editToken}
                                onChange={(e) => setEditToken(e.target.value)}
                                helperText="Leave empty to keep current token"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editEnabled}
                                        onChange={(e) => setEditEnabled(e.target.checked)}
                                    />
                                }
                                label="Enabled"
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save Changes</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Providers;
