import { CardGrid, CardGridItem } from './CardGrid';
import UnifiedCard from './UnifiedCard';
import { Typography } from '@mui/material';

interface HistoryStatsProps {
    stats: {
        total: number;
        success: number;
        error: number;
        today: number;
    };
}

const HistoryStats = ({ stats }: HistoryStatsProps) => {
    return (
        <>
            <CardGridItem xs={12} sm={6} md={3}>
                <UnifiedCard
                    title="Total Actions"
                    subtitle={`${stats.total} total entries`}
                    size="small"
                >
                    <Typography variant="h3" color="primary" sx={{ textAlign: 'center' }}>
                        {stats.total}
                    </Typography>
                </UnifiedCard>
            </CardGridItem>

            <CardGridItem xs={12} sm={6} md={3}>
                <UnifiedCard
                    title="Successful"
                    subtitle={`${stats.success} successful actions`}
                    size="small"
                >
                    <Typography variant="h3" color="success.main" sx={{ textAlign: 'center' }}>
                        {stats.success}
                    </Typography>
                </UnifiedCard>
            </CardGridItem>

            <CardGridItem xs={12} sm={6} md={3}>
                <UnifiedCard
                    title="Failed"
                    subtitle={`${stats.error} failed actions`}
                    size="small"
                >
                    <Typography variant="h3" color="error.main" sx={{ textAlign: 'center' }}>
                        {stats.error}
                    </Typography>
                </UnifiedCard>
            </CardGridItem>

            <CardGridItem xs={12} sm={6} md={3}>
                <UnifiedCard
                    title="Today"
                    subtitle={`${stats.today} actions today`}
                    size="small"
                >
                    <Typography variant="h3" color="info.main" sx={{ textAlign: 'center' }}>
                        {stats.today}
                    </Typography>
                </UnifiedCard>
            </CardGridItem>
        </>
    );
};

export default HistoryStats;