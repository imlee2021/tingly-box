import {
    Box,
    Button,
    Stack,
    Typography,
} from '@mui/material';

interface ServerConfigurationProps {
    serverStatus: any;
    onRefreshStatus: () => void;
    onGenerateToken: () => void;
}

const ServerConfiguration = ({
    serverStatus,
    onRefreshStatus,
    onGenerateToken,
}: ServerConfigurationProps) => {
    return (
        <Stack spacing={3}>
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Server Port
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {serverStatus.port}
                </Typography>
            </Box>
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Enabled Providers
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {serverStatus.providers_enabled} of {serverStatus.providers_total}
                </Typography>
            </Box>
            {serverStatus.action_stats && (
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Actions
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {String(Object.values(serverStatus.action_stats).reduce((a: any, b: any) => a + b, 0))}
                    </Typography>
                </Box>
            )}
            <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={onRefreshStatus}>
                    Refresh Status
                </Button>
                <Button variant="contained" onClick={onGenerateToken}>
                    Generate Token
                </Button>
            </Stack>
        </Stack>
    );
};

export default ServerConfiguration;