import { Box, Typography } from "@mui/material";
import { GridOverlay } from "@mui/x-data-grid";

export function CustomNoRowsOverlay() {
  return (
    <GridOverlay>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'gray',
        }}
      >
        <Typography variant="h6">No Data Available</Typography>
        <Typography variant="body2">Please Check Again.</Typography>
      </Box>
    </GridOverlay>
  )
}