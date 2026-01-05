import React, { useState } from "react";
import { ChromePicker } from "react-color";
import { TextField, IconButton, InputAdornment, Popover } from "@mui/material";
import ColorLensIcon from "@mui/icons-material/ColorLens";

const ColorPickerField = ({ label, value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const open = Boolean(anchorEl);

  // Handle manual input
  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  // Handle color picker selection
  const handleColorChange = (color) => {
    onChange(color.hex);
  };

  return (
    <>
      <TextField
        label={label}
        value={value}
        onChange={handleInputChange}
        variant="outlined"
        className="form-field"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "2px solid #ccc",
                  backgroundColor: value,
                  cursor: "pointer",
                }}
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleClick} edge="end">
                {/* Fixed black color for icon */}
                <ColorLensIcon style={{ color: "#000" }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Popover for Color Picker */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <ChromePicker color={value} onChange={handleColorChange} />
      </Popover>
    </>
  );
};

export default ColorPickerField;