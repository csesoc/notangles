import React from 'react';
import styled from 'styled-components';

// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
// import DragIndicatorIcon from '@material-ui/icons/DragIndicator';

import FlashOnIcon from '@material-ui/icons/FlashOn';

const DropdownButton = styled(Button)`
    width: 100%;
    height: 55px;
    text-align: left;
    margin-right:10px;
    text-transform: none;
`;

const ExecuteButton = styled(Button)`
    width: 100%;
    border-radius: 0px 0px 5px 5px;
`;

interface DropdownOptionProps {
  optionName: string
  isChecked: boolean
  setIsChecked(value: boolean): void
  opposite?: boolean
  setOpposite?(value: boolean): void
}
const DropdownOption: React.FC<DropdownOptionProps> = ({
  optionName,
  isChecked,
  setIsChecked,
  opposite,
  setOpposite,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
    if (!(setOpposite === undefined) && opposite) {
      setOpposite(!event.target.checked);
    }
  };

  return (

    <ListItem>
      <Checkbox
        checked={isChecked}
        color="primary"
        onChange={handleChange}
        inputProps={{ 'aria-label': 'primary checkbox' }}
      />
      <ListItemText
        primary={optionName}
      />
    </ListItem>
  );
};

interface AutotimetablerProps {
  isDarkMode: boolean
}
const Autotimetable: React.FC<AutotimetablerProps> = ({ isDarkMode }) => {
  const [isChecked1, setIsChecked1] = React.useState(false);
  const [isChecked2, setIsChecked2] = React.useState(false);
  const [isChecked3, setIsChecked3] = React.useState(false);
  const [isChecked4, setIsChecked4] = React.useState(false);


  // for opening popover
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <DropdownButton disableElevation aria-describedby={id} variant="contained" color={isDarkMode ? 'secondary' : 'default'} onClick={handleClick}>
        <Box ml="10px" flexGrow={1}>Auto-timetable Options</Box>
        {open ? (
          <ArrowDropUpIcon />
        ) : <ArrowDropDownIcon />}
      </DropdownButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <List dense>
          <DropdownOption
            optionName="Least days at uni"
            isChecked={isChecked1}
            setIsChecked={setIsChecked1}
          />
          <DropdownOption
            optionName="Least distance between classes"
            isChecked={isChecked2}
            setIsChecked={setIsChecked2}
          />

          <DropdownOption
            optionName="Least early starts"
            isChecked={isChecked3}
            setIsChecked={setIsChecked3}
            opposite={isChecked4}
            setOpposite={setIsChecked4}
          />
          <DropdownOption
            optionName="Most early starts"
            isChecked={isChecked4}
            setIsChecked={setIsChecked4}
            opposite={isChecked3}
            setOpposite={setIsChecked3}
          />

        </List>
        <ExecuteButton variant="contained" color="primary" disableElevation onClick={handleClose}>
          GO
          <FlashOnIcon />
        </ExecuteButton>
      </Popover>
    </div>
  );
};
export default Autotimetable;
