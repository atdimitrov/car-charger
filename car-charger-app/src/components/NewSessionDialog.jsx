import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startOfToday, addHours, differenceInSeconds } from 'date-fns'

import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/material/styles/useTheme';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';

import { close } from '../store/slices/newSessionDialogSlice';
import { startSession } from '../store/actions';

const batteryCapacityKWh = 27.7;
const chargingSpeedKW = 2.1;

const now = 'Now';
const eco = 'Eco';
const predefinedStartTimes = [now, eco];
const predefinedTargetPercentages = [80, 90, 100];

const parseBatteryPercentage = (str) => {
    const number = Number(str);
    if (isNaN(number)) return undefined;
    if (number < 0) return 0;
    if (number > 100) return 100;
    return number;
};

const NewSessionDialog = () => {
    const { isOpen } = useSelector(state => state.newSessionDialog);
    const dispatch = useDispatch();

    const ecoTime = useMemo(() => {
        return addHours(startOfToday(), 23);
    }, []);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [startTime, setStartTime] = useState(null);
    const [selectedPredefinedStartTime, setSelectedPredefinedStartTime] = useState(eco);
    const [startBatteryPercentage, setStartBatteryPercentage] = useState(20);
    const [targetBatteryPercentage, setTargetBatteryPercentage] = useState(80);

    useEffect(() => {
        if (selectedPredefinedStartTime === now) {
            setStartTime(new Date());

            const timer = setInterval(() => {
                setStartTime(new Date());
            }, 1000);

            return () => clearInterval(timer);
        } else if (selectedPredefinedStartTime === eco) {
            setStartTime(ecoTime);
        }
    }, [ecoTime, selectedPredefinedStartTime]);

    return (
        <Dialog
            fullScreen={fullScreen}
            open={isOpen}
            onClose={() => dispatch(close())}
        >
            <DialogTitle>
                Start charging session
            </DialogTitle>
            <DialogContent>
                <Stack spacing={5} sx={{ p: 1 }}>
                    <Stack spacing={2}>
                        <TimePicker
                            label='Start time'
                            value={startTime}
                            onChange={(newStartTime) => {
                                setSelectedPredefinedStartTime(undefined);
                                setStartTime(newStartTime);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <Stack direction='row' spacing={1}>
                            {predefinedStartTimes.map(predefinedStartTime =>
                                <Chip
                                    key={predefinedStartTime}
                                    label={predefinedStartTime}
                                    icon={selectedPredefinedStartTime === predefinedStartTime ? <CheckRoundedIcon /> : undefined}
                                    color={selectedPredefinedStartTime === predefinedStartTime ? 'primary' : 'default'}
                                    variant={selectedPredefinedStartTime === predefinedStartTime ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedPredefinedStartTime(predefinedStartTime)}
                                />
                            )}
                        </Stack>
                    </Stack>
                    <TextField
                        label='Current battery percentage'
                        value={startBatteryPercentage}
                        inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9]*'
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <PercentRoundedIcon />
                                </InputAdornment>
                            )
                        }}
                        onChange={event => {
                            const parsed = parseBatteryPercentage(event.target.value);
                            if (parsed !== undefined) setStartBatteryPercentage(parsed);
                        }}
                    />
                    <Stack spacing={2}>
                        <TextField
                            label='Target battery percentage'
                            value={targetBatteryPercentage}
                            inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*'
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <PercentRoundedIcon />
                                    </InputAdornment>
                                )
                            }}
                            onChange={event => {
                                const parsed = parseBatteryPercentage(event.target.value);
                                if (parsed !== undefined) setTargetBatteryPercentage(parsed);
                            }}
                        />
                        <Stack direction='row' spacing={1}>
                            {predefinedTargetPercentages.map(percentage =>
                                <Chip
                                    key={percentage}
                                    label={`${percentage}%`}
                                    icon={targetBatteryPercentage === percentage ? <CheckRoundedIcon /> : undefined}
                                    color={targetBatteryPercentage === percentage ? 'primary' : 'default'}
                                    variant={targetBatteryPercentage === percentage ? 'contained' : 'outlined'}
                                    onClick={() => setTargetBatteryPercentage(percentage)}
                                />
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button
                    variant='outlined'
                    onClick={() => dispatch(close())}
                >
                    Close
                </Button>
                <Button
                    autoFocus
                    variant='contained'
                    endIcon={<PlayArrowRoundedIcon />}
                    onClick={() => {
                        const capacityToCharge = batteryCapacityKWh * ((targetBatteryPercentage - startBatteryPercentage) / 100);
                        const hoursToCharge = capacityToCharge / chargingSpeedKW;
                        
                        dispatch(startSession({
                            offset: differenceInSeconds(startTime, new Date()),
                            duration: Math.ceil(hoursToCharge * 60 * 60)
                        }));
                        dispatch(close());
                    }}
                >
                    Start
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewSessionDialog;
