import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';

import DownloadingRoundedIcon from '@mui/icons-material/DownloadingRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import DoDisturbAltRoundedIcon from '@mui/icons-material/DoDisturbAltRounded';

const getBackgroundColor = ({ attemptMade, connected }) => {
    if (!attemptMade) {
        return '#CCCCCC';
    }

    if (connected) {
        return '#60A05B';
    }

    return '#FF5047';
};

const getIcon = ({ attemptMade, connected }) => {
    if (!attemptMade) {
        return <DownloadingRoundedIcon />;
    }

    if (connected) {
        return <CheckCircleOutlineRoundedIcon />;
    }

    return <DoDisturbAltRoundedIcon />
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
            {getIcon(connection)}
        </Box>
    );
}

export default ConnectionStatus;
