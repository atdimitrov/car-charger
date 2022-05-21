import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMinutes, addSeconds, format, isEqual } from 'date-fns';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { refreshSessionStatus } from '../store/actions';

const zeroDate = addMinutes(new Date(0), new Date(0).getTimezoneOffset());

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
                <Typography variant='h3'>{mainLabel}</Typography>
                {bottomLabel && <Typography variant='subtitle'>{bottomLabel}</Typography>}
            </Stack>
        </Box>
    );
};

const asPercent = progress => {
    const formatted = progress.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return `${formatted}%`;
}

const formatTime = time => format(time, 'HH:mm:ss');

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
    const dispatch = useDispatch();
    const session = useSelector(state => state.session);

    const [state, setState] = useState();

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
    }, [session]);

    useEffect(() => {
        if (!state) return;

        if (state.status === 1 || state.status === 2) {

            if (isEqual(state.time, zeroDate)) {
                dispatch(refreshSessionStatus());
            } else {
                const timer = setTimeout(() => {
                    setState(oldState => {
                        const newState = { ...oldState };
                        if (oldState.time > zeroDate) {
                            newState.time = addSeconds(oldState.time, -1);
                        }
                        return newState;
                    });
                }, 1000);
        
                return () => clearTimeout(timer);
            }
        }
    }, [state, dispatch]);

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