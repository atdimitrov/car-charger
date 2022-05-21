import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { addSeconds, format } from 'date-fns';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const zeroDate = new Date(0);

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

const asPercent = progress => {
    const formatted = progress.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return `${formatted}%`;
}

const formatTime = time => format(time, 'mm:ss');

const getBottomLabelForState = ({ status, time }) => {
    if (status === 2) {
        return `Time left: ${formatTime(time)}`;
    } else if (status === 3) {
        return 'Completed';
    } else if (status === 4) {
        return 'Stopped';
    } else {
        console.log('Unknown status');
    }
}

const ChargingStatus = () => {
    const [state, setState] = useState();
    const session = useSelector(state => state.session);

    useEffect(() => {
        if (session.status === 0) {
            setState(undefined);
            return;
        }

        const newState = {
            status: session.status,
            progress: session.progress * 100
        };

        if (session.status === 1) {
            newState.time = addSeconds(zeroDate, session.timeToStart);
        } else if (session.status === 2) {
            newState.time = addSeconds(zeroDate, session.timeToEnd);
        }

        setState(newState);

        if (session.status === 1 || session.status === 2) {
            const timer = setInterval(() => {
                setState(oldState => {
                    const newState = { ...oldState };
                    if (oldState.time > zeroDate) {
                        newState.time = addSeconds(oldState.time, -1);
                    }
                    return newState;
                });
            }, 1000);
    
            return () => clearInterval(timer);
        }
    }, [session]);

    if (!state) {
        return <Typography variant='h6'>No previous charging session found</Typography>;
    }

    if (state.status === 1) {
        return createLoadingIndicator('indeterminate', undefined, 'Charging is going to start in', formatTime(state.time), undefined);
    }

    const bottomLabel = getBottomLabelForState(state);
    return createLoadingIndicator('determinate', state.progress, undefined, asPercent(state.progress), bottomLabel);
};

export default ChargingStatus;