import { useEffect, useState, useMemo } from 'react';
import { startOfToday, addHours } from 'date-fns'

import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import EvStationRoundedIcon from '@mui/icons-material/EvStationRounded';
import PowerRoundedIcon from '@mui/icons-material/PowerRounded';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import Stack from '@mui/material/Stack';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';

import ChargingStatus from './components/ChargingStatus';

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

const App = () => {
    const ecoTime = useMemo(() => {
        return addHours(startOfToday(), 23);
    }, []);

    const [isOpen, setIsOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [startTime, setStartTime] = useState(null);
    const [selectedPredefinedStartTime, setSelectedPredefinedStartTime] = useState(eco);
    const [startBatteryPercentage, setStartBatteryPercentage] = useState(20);
    const [targetBatteryPercentage, setTargetBatteryPercentage] = useState(80);

    const actions = [
        { icon: <PowerRoundedIcon />, name: 'Socket', action: () => console.log('socket click') }
    ];

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
        <Box
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
            <ChargingStatus />
            <SpeedDial
                ariaLabel="Car charger SpeedDial"
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                icon={
                    <SpeedDialIcon
                        icon={<PlayArrowRoundedIcon />}
                        openIcon={<EvStationRoundedIcon />}
                    />
                }
                FabProps={{
                    onClick: () => {
                        if (isOpen) {
                            setDialogOpen(true);
                        }
                    }
                }}
                open={isOpen}
                onOpen={() => setIsOpen(true)}
                onClose={() => setIsOpen(false)}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={action.action}
                    />
                ))}
            </SpeedDial>

            <Dialog
                fullScreen={fullScreen}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
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
                        onClick={() => setDialogOpen(false)}
                    >
                        Close
                    </Button>
                    <Button
                        autoFocus
                        variant='contained'
                        onClick={() => setDialogOpen(false)}
                        endIcon={<PlayArrowRoundedIcon />}
                    >
                        Start
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default App;
