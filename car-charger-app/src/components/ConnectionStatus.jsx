import React from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const getBackgroundColor = ({ attemptMade, connected }) => {
    if (connected) {
        return '#60A05B';
    }

    return '#FF5047';
};

const getContent = ({ attemptMade, connected }) => {
    if (!attemptMade) {
        return <LinearProgress sx={{ width: '100%' }} />;
    }

    if (connected) {
        return <CheckRoundedIcon />;
    }

    return <CloseRoundedIcon />
};

const ConnectionStatus = () => {
    const connection = useSelector(state => state.connection);

    return (
        <Box
            sx={{
                top: 0,
                left: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                backgroundColor: getBackgroundColor(connection),
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {getContent(connection)}
        </Box>
    );
}

export default ConnectionStatus;
