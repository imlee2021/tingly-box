import {
    Box,
    Button,
    Stack,
    Typography,
} from '@mui/material';

interface ActivityLogProps {
    activityLog: any[];
    onLoadActivityLog: () => void;
    onClearLog: () => void;
}

const ActivityLog = ({
    activityLog,
    onLoadActivityLog,
    onClearLog,
}: ActivityLogProps) => {
    return (
        <Stack spacing={1}>
            <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={onLoadActivityLog}>
                    Refresh Log
                </Button>
                <Button variant="outlined" onClick={onClearLog}>
                    Clear Log
                </Button>
            </Stack>
            <Box
                sx={{
                    flex: 1,
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    p: 2,
                    borderRadius: 2,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    overflowY: 'auto',
                    border: '1px solid',
                    borderColor: 'divider',
                    minHeight: 320,
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
                                    sx={{ color: '#64748b', fontSize: '0.75rem' }}
                                >
                                    [{timestamp}]
                                </Typography>{' '}
                                <Typography component="span" sx={{ color: isSuccess ? '#059669' : '#dc2626' }}>
                                    {isSuccess ? 'Success' : 'Failed'}
                                </Typography>{' '}
                                <Typography component="span">
                                    {entry.action}: {entry.message}
                                </Typography>
                            </Box>
                        );
                    })
                ) : (
                    <Typography color="#64748b">No recent activity</Typography>
                )}
            </Box>
        </Stack>
    );
};

export default ActivityLog;