import {
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
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

const History = () => {
    const [allHistory, setAllHistory] = useState<any[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        success: 0,
        error: 0,
        today: 0,
    });

    useEffect(() => {
        loadHistory();
        const interval = setInterval(loadHistory, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterType, filterStatus, allHistory]);

    const loadHistory = async () => {
        setLoading(true);
        const result = await api.getHistory(200);
        if (result.success) {
            setAllHistory(result.data);
            updateStats(result.data);
            applyFilters();
        }
        setLoading(false);
    };

    const updateStats = (data: any[]) => {
        const total = data.length;
        const success = data.filter(entry => entry.success).length;
        const error = total - success;
        const today = new Date().toDateString();
        const todayCount = data.filter(entry =>
            new Date(entry.timestamp).toDateString() === today
        ).length;

        setStats({
            total,
            success,
            error,
            today: todayCount,
        });
    };

    const applyFilters = () => {
        let filtered = allHistory.filter(entry => {
            // Search filter
            if (searchTerm && !entry.action.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !entry.message.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            // Type filter
            if (filterType !== 'all' && entry.action !== filterType) {
                return false;
            }

            // Status filter
            if (filterStatus !== 'all' && entry.success.toString() !== filterStatus) {
                return false;
            }

            return true;
        });

        setFilteredHistory(filtered);
    };

    const formatAction = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDetails = (details: any) => {
        if (!details) return 'N/A';
        if (typeof details === 'string') return details;
        return Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(', ');
    };

    const handleExportJSON = () => {
        const dataStr = JSON.stringify(filteredHistory, null, 2);
        downloadFile('history.json', dataStr, 'application/json');
    };

    const handleExportCSV = () => {
        const headers = ['Timestamp', 'Action', 'Success', 'Message', 'Details'];
        const csvContent = [
            headers.join(','),
            ...filteredHistory.map(entry => [
                new Date(entry.timestamp).toISOString(),
                entry.action,
                entry.success,
                `"${entry.message.replace(/"/g, '""')}"`,
                `"${formatDetails(entry.details).replace(/"/g, '""')}"`
            ].join(','))
        ].join('\n');

        downloadFile('history.csv', csvContent, 'text/csv');
    };

    const handleExportTXT = () => {
        const txtContent = filteredHistory.map(entry =>
            `[${new Date(entry.timestamp).toLocaleString()}] ${entry.success ? '✅' : '❌'} ${entry.action}: ${entry.message}`
        ).join('\n');

        downloadFile('history.txt', txtContent, 'text/plain');
    };

    const downloadFile = (filename: string, content: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    {/* Controls */}
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Search history..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={2.67}>
                            <FormControl fullWidth>
                                <InputLabel>Filter by Action</InputLabel>
                                <Select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    label="Filter by Action"
                                >
                                    <MenuItem value="all">All Actions</MenuItem>
                                    <MenuItem value="start_server">Start Server</MenuItem>
                                    <MenuItem value="stop_server">Stop Server</MenuItem>
                                    <MenuItem value="restart_server">Restart Server</MenuItem>
                                    <MenuItem value="add_provider">Add Provider</MenuItem>
                                    <MenuItem value="delete_provider">Delete Provider</MenuItem>
                                    <MenuItem value="generate_token">Generate Token</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2.67}>
                            <FormControl fullWidth>
                                <InputLabel>Filter by Status</InputLabel>
                                <Select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    label="Filter by Status"
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="true">Success</MenuItem>
                                    <MenuItem value="false">Error</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2.67}>
                            <Stack direction="row" spacing={1}>
                                <Button variant="outlined" onClick={loadHistory}>
                                    Refresh
                                </Button>
                                <Button variant="contained" onClick={handleExportJSON}>
                                    Export
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>

                    {/* Stats */}
                    <Grid container spacing={2} mb={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: 'grey.100',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h3" color="primary" gutterBottom>
                                    {stats.total}
                                </Typography>
                                <Typography color="text.secondary">Total Actions</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: 'success.light',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h3" color="success.dark" gutterBottom>
                                    {stats.success}
                                </Typography>
                                <Typography color="text.secondary">Successful</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: 'error.light',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h3" color="error.dark" gutterBottom>
                                    {stats.error}
                                </Typography>
                                <Typography color="text.secondary">Failed</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: 'info.light',
                                    borderRadius: 2,
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h3" color="info.dark" gutterBottom>
                                    {stats.today}
                                </Typography>
                                <Typography color="text.secondary">Today</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* History Table */}
                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Message</TableCell>
                                    <TableCell>Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((entry, index) => (
                                        <TableRow key={index}>
                                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                {new Date(entry.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{formatAction(entry.action)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={entry.success ? 'Success' : 'Error'}
                                                    color={entry.success ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {entry.message}
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {formatDetails(entry.details)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Typography color="text.secondary" py={3}>
                                                No history found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Export Menu */}
                    <Stack direction="row" spacing={2} mt={2}>
                        <Button variant="outlined" onClick={handleExportJSON}>
                            Export JSON
                        </Button>
                        <Button variant="outlined" onClick={handleExportCSV}>
                            Export CSV
                        </Button>
                        <Button variant="outlined" onClick={handleExportTXT}>
                            Export TXT
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default History;
