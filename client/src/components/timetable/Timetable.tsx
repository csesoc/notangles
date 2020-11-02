import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { CourseData, SelectedClasses, ClassPeriod } from '@notangles/common';
import { days, defaultEndTime, defaultStartTime } from '../../constants/timetable';
import TimetableLayout from './TimetableLayout';
import ClassDropzones from './ClassDropzones';
import DroppedClasses, { inventoryMargin } from './DroppedClasses';

export const rowHeight = 94;

const StyledTimetable = styled(Box) <{
  rows: number
}>`
  display: grid;
  height: ${({ rows }) => rows * rowHeight}px;
  margin-top: 15px;
  box-sizing: content-box;
  user-select: none;
  grid-gap: ${1 / devicePixelRatio}px;
  grid-template: auto repeat(${({ rows }) => rows}, 1fr)
               / auto repeat(${days.length}, minmax(0, 1fr)) ${inventoryMargin}px minmax(0, 1fr);
`;

interface TimetableProps {
  selectedCourses: CourseData[]
  selectedClasses: SelectedClasses
  assignedColors: Record<string, string>
  is12HourMode: boolean
  isCompactMode: boolean
  setIs12HourMode(value: boolean): void
  clashes: Array<ClassPeriod>
}

const Timetable: FunctionComponent<TimetableProps> = React.memo(({
  selectedCourses,
  selectedClasses,
  assignedColors,
  is12HourMode,
  isCompactMode,
  setIs12HourMode,
  clashes,
}) => (
  <StyledTimetable
    rows={Math.max(...selectedCourses.map(
      (course) => course.latestFinishTime,
    ), defaultEndTime) - Math.min(...selectedCourses.map(
      (course) => course.earliestStartTime,
    ), defaultStartTime)}
  >
    <TimetableLayout
      days={days}
      is12HourMode={is12HourMode}
      setIs12HourMode={setIs12HourMode}
      selectedCourses={selectedCourses}
    />
    <ClassDropzones
      selectedCourses={selectedCourses}
      assignedColors={assignedColors}
      earliestStartTime={Math.min(...selectedCourses.map(
        (course) => course.earliestStartTime,
      ), defaultStartTime)}
    />
    <DroppedClasses
      selectedCourses={selectedCourses}
      selectedClasses={selectedClasses}
      assignedColors={assignedColors}
      days={days}
      clashes={clashes}
      isCompactMode={isCompactMode}
    />
  </StyledTimetable>
), (prev, next) => !(
  prev.is12HourMode !== next.is12HourMode
  || prev.selectedClasses !== next.selectedClasses
  || prev.selectedCourses.length !== next.selectedCourses.length
  || prev.selectedCourses.some((course, i) => course.code !== next.selectedCourses[i].code)
  || JSON.stringify(prev.assignedColors) !== JSON.stringify(next.assignedColors)
));

export default Timetable;
