import React from 'react';
import { useSelector } from 'react-redux';
import { addSeconds, format } from 'date-fns';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const createLoadingIndicator = (variant, value, topLabel, mainLabel, bottomLabel) => {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
                variant={variant}
                size={300}
                value={value}
            />
            <Stack
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {topLabel && <Typography variant='subtitle'>{topLabel}</Typography>}
                <Typography variant='h2'>{mainLabel}</Typography>
                {bottomLabel && <Typography variant='subtitle'>{bottomLabel}</Typography>}
            </Stack>
        </Box>
    );
};

const ChargingStatus = () => {
    const status = useSelector(state => state.status);

    if (status.status === 0) {
        return <Typography variant='h6'>No previous charging session found</Typography>;
    }

    if (status.status === 1) {
        const timeToStart = addSeconds(new Date(0), status.timeToStart);
        return createLoadingIndicator('indeterminate', undefined, 'Charging is going to start in', format(timeToStart, 'mm:ss'), undefined);
    }

    if (status.status === 2) {
        return createLoadingIndicator('determinate', 75, undefined, '75.00%', 'Time left: 02:21');
    }

    if (status.status === 3) {
        return createLoadingIndicator('determinate', 100, undefined, '100.00%', 'Completed');
    }

    if (status.status === 4) {
        return createLoadingIndicator('determinate', 90.2, undefined, '90.20%', 'Stopped');
    }

        /* <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
                variant="determinate"
                value={100}
                size={300}
            />
            <Stack
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography variant='h2'>100.00%</Typography>
                <Typography variant='subtitle'>Completed</Typography>
            </Stack>
        </Box> */
        /* <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
                variant="determinate"
                value={90}
                size={300}
            />
            <Stack
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography variant='h2'>{`25.00%`}</Typography>
                <Typography variant='subtitle'></Typography>
            </Stack>
        </Box> */
};

export default ChargingStatus;