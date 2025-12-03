import {
    Button,
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

interface HistoryTableProps {
    filteredHistory: any[];
    onExportJSON: () => void;
    onExportCSV: () => void;
    onExportTXT: () => void;
}

const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatDetails = (details: any) => {
    if (!details) return 'N/A';
    if (typeof details === 'string') return details;
    return Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(', ');
};

const HistoryTable = ({
    filteredHistory,
    onExportJSON,
    onExportCSV,
    onExportTXT,
}: HistoryTableProps) => {
    return (
        <Stack spacing={1}>
            <TableContainer component={Paper} sx={{ maxHeight: 280 }}>
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

            <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={onExportJSON}>
                    Export JSON
                </Button>
                <Button variant="outlined" onClick={onExportCSV}>
                    Export CSV
                </Button>
                <Button variant="outlined" onClick={onExportTXT}>
                    Export TXT
                </Button>
            </Stack>
        </Stack>
    );
};

export default HistoryTable;