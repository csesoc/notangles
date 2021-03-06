import React, { FunctionComponent } from 'react';
import styled, { css } from 'styled-components';
import { Box } from '@material-ui/core';
import { CourseData } from '@notangles/common';
import { defaultStartTime, defaultEndTime } from '../../constants/timetable';

const headerPadding = 15;

const BaseCell = styled.div<{
  x: number
  y: number
  yTo?: number
  isEndX?: boolean
  isEndY?: boolean
}>`
  grid-column: ${({ x }) => x};
  grid-row: ${({ y }) => y} / ${({ y, yTo }) => (yTo || y)};
  box-shadow: 0 0 0 ${1 / devicePixelRatio}px ${({ theme }) => theme.palette.secondary.main};
  background-color: ${({ theme }) => theme.palette.background.default};
  z-index: 10;
  transition: background-color 0.2s, box-shadow 0.2s;

  border-top-left-radius: ${({ theme, x, y }) => (
    x === 1 && y === 1 ? theme.shape.borderRadius : 0
  )}px;
  border-bottom-left-radius: ${({ theme, x, isEndY }) => (
    x === 1 && isEndY ? theme.shape.borderRadius : 0
  )}px;
  border-top-right-radius: ${({ theme, isEndX, y }) => (
    isEndX && y === 1 ? theme.shape.borderRadius : 0
  )}px;
  border-bottom-right-radius: ${({ theme, isEndX, isEndY }) => (
    isEndX && isEndY ? theme.shape.borderRadius : 0
  )}px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const DayCell = styled(BaseCell)`
  padding: ${headerPadding}px 0;
`;

const InventoryCell = styled(DayCell)<{
  y: number
}>`
  border-top-left-radius:     ${({ theme, y }) => (y === 1 ? theme.shape.borderRadius : 0)}px;
  border-top-right-radius:    ${({ theme, y }) => (y === 1 ? theme.shape.borderRadius : 0)}px;
  border-bottom-left-radius:  ${({ theme, y }) => (y !== 1 ? theme.shape.borderRadius : 0)}px;
  border-bottom-right-radius: ${({ theme, y }) => (y !== 1 ? theme.shape.borderRadius : 0)}px;
`;

const paddingStyle = css`
  padding: 0 ${headerPadding}px;
`;

const HourCell = styled(BaseCell) <{
  is12HourMode: boolean
}>`
  ${paddingStyle}
  display: grid;
  justify-content: ${({ is12HourMode }) => (is12HourMode ? 'end' : 'center')};
`;

const ToggleCell = styled(BaseCell)`
  ${paddingStyle}
  display: grid;
  justify-content: center;

  & span {
    grid-column: 1;
    grid-row: 1;
  }
`;

const Is12HourModeToggle = styled(Box)`
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: color 0.1s;
  color: ${({ theme }) => theme.palette.primary.main};

  &:hover {
    color: ${({ theme }) => theme.palette.primary.dark};
  }
`;

const ColumnWidthGuide = styled.span`
  opacity: 0;
  pointer-events: none;
`;

const generateHour = (n: number, is12HourMode: boolean): string => {
  if (is12HourMode) {
    const period = n < 12 ? 'AM' : 'PM';
    if (n > 12) n -= 12;
    return `${n} ${period}`;
  }
  return `${String(n).padStart(2, '0')}:00`;
};

const generateHours = (range: number[], is12HourMode: boolean): string[] => {
  const [min, max] = range;
  // Fill an array with hour strings according to the range
  return Array(max - min + 1).fill(0).map((_, i) => generateHour(i + min, is12HourMode));
};

interface TimetableLayoutProps {
  days: string[]
  is12HourMode: boolean
  setIs12HourMode(value: boolean): void
  selectedCourses: CourseData[]
}

const TimetableLayout: FunctionComponent<TimetableLayoutProps> = React.memo(({
  days,
  is12HourMode,
  setIs12HourMode,
  selectedCourses,
}) => {
  const latestClassFinishTime = Math.max(...selectedCourses.map(
    (course) => course.latestFinishTime,
  ));
  const earliestClassStartTime = Math.min(...selectedCourses.map(
    (course) => course.earliestStartTime,
  ));
  const hoursRange = [
    Math.min(earliestClassStartTime, defaultStartTime),
    Math.max(latestClassFinishTime, defaultEndTime) - 1,
  ];
  const hours: string[] = generateHours(hoursRange, is12HourMode);

  const dayCells = days.map((day, i) => (
    <DayCell key={day} x={i + 2} y={1} isEndX={i === days.length - 1}>
      {day}
    </DayCell>
  ));

  dayCells.push(
    <InventoryCell key="unscheduled" x={days.length + 3} y={1} isEndX>
      Unscheduled
    </InventoryCell>,
  );

  const hourCells = hours.map((hour, i) => (
    <HourCell
      key={hour}
      x={1}
      y={i + 2}
      is12HourMode={is12HourMode}
      isEndY={i === hours.length - 1}
    >
      {hour}
    </HourCell>
  ));

  const otherCells = hours.flatMap(
    (_, y) => days.flatMap(
      (_, x) => (
        <BaseCell
          key={x * 1000 + y}
          x={x + 2}
          y={y + 2}
          isEndX={x === days.length - 1}
          isEndY={y === hours.length - 1}
          id={x === 0 && y === 0 ? 'origin' : undefined}
        />
      ),
    ),
  );

  otherCells.push(
    <InventoryCell key={-1} x={days.length + 3} y={2} yTo={-1} isEndX isEndY />,
  );

  return (
    <>
      <ToggleCell key={0} x={1} y={1}>
        <Is12HourModeToggle component="span" onClick={() => setIs12HourMode(!is12HourMode)}>
          {`${is12HourMode ? '12' : '24'} h`}
        </Is12HourModeToggle>
        {
          // Invisible guide for the column width for
          // consistency between 24 and 12 hour time.
          // Content is something like '10 AM'.
        }
        <ColumnWidthGuide>{generateHour(10, true)}</ColumnWidthGuide>
      </ToggleCell>
      {dayCells}
      {hourCells}
      {otherCells}
    </>
  );
}, (prev, next) => !(
  prev.is12HourMode !== next.is12HourMode
  || JSON.stringify(prev.days) !== JSON.stringify(next.days)
  || prev.selectedCourses.length !== next.selectedCourses.length
  || prev.selectedCourses.some((course, i) => course.code !== next.selectedCourses[i].code)
));

export default TimetableLayout;
