import React from 'react';
import { Alert, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAlert = styled(Alert)(({ theme }) => ({
  fontFamily: '"Oswald", sans-serif',
  width: '100%',
  borderRadius: "10px",
  fontSize: '16px',
  '& .MuiAlert-message': {
    fontFamily: '"Oswald", sans-serif',
  },
}));

const CustomAlert = ({ severity = 'info', message = '', ...props }) => {
  return (
    <Stack sx={{ width: '100%' }} spacing={2}>
      <StyledAlert severity={severity} {...props}>
        {message}
      </StyledAlert>
    </Stack>
  );
};

export default CustomAlert;