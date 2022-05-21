import React from 'react';

import Box from '@mui/material/Box';

import ConnectionStatus from './components/ConnectionStatus';
import ChargingStatus from './components/ChargingStatus';
import Controls from './components/Controls';
import NewSessionDialog from './components/NewSessionDialog';

const App = () => {
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
            <ConnectionStatus />
            <ChargingStatus />
            <Controls />
            <NewSessionDialog />
        </Box>
    );
};

export default App;
