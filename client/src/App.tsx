import React, { useEffect, FunctionComponent, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import { StylesProvider } from '@material-ui/styles'; // make styled components styling have priority
import HTML5Backend from 'react-dnd-html5-backend';

import { MuiThemeProvider, Box } from '@material-ui/core';
import Timetable from './components/timetable/Timetable';
import Navbar from './components/Navbar';
import Inventory from './components/inventory/Inventory';
import { CourseData } from './interfaces/CourseData';
import CourseSelect from './components/CourseSelect';

import getCourseInfo from './api/getCourseInfo';
import useColorMapper from './hooks/useColorMapper';

import storage from './utils/storage';

import { darkTheme, lightTheme } from './constants/theme';

const StyledApp = styled(Box)`
  height: 100%;
`;

const ContentWrapper = styled(Box)`
  text-align: center;
  padding-top: 94px; // 64px for nav bar + 30px padding
  padding-left: 30px;
  padding-right: 30px;
  transition: background-color 0.25s, color 0.25s;
  min-height: 100vh;
  box-sizing: border-box;

  background-color: ${(props) => props.theme.palette.secondary.dark};
  color: ${(props) => props.theme.palette.text.primary};
`;

const Content = styled(Box)`
  width: 1200px;
  min-width: 600px;
  max-width: 100%;
  margin: auto;

  display: grid;
  grid-template-rows: min-content min-content auto;
  grid-template-columns: auto;

  text-align: center;
`;

const SelectWrapper = styled(Box)`
  display: flex;
  flex-direction: row;
  height: 30px;
`;

const App: FunctionComponent = () => {
  let [selectedCourses, setSelectedCourses] = useState<CourseData[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));

  const assignedColors = useColorMapper(
    selectedCourses.map((course) => course.courseCode),
  );

  useEffect(() => {
    storage.set('is12HourMode', is12HourMode);
  }, [is12HourMode]);

  useEffect(() => {
    storage.set('isDarkMode', isDarkMode);
  }, [isDarkMode]);

  const handleSelectCourse = async (courseCode: string) => {
    const selectedCourseClasses = await getCourseInfo('2020', 'T2', courseCode);
    if (selectedCourseClasses) {
      selectedCourses = [...selectedCourses, selectedCourseClasses]
      setSelectedCourses(selectedCourses);
    }
  };

  const handleRemoveCourse = (courseCode: string) => {
    selectedCourses = selectedCourses.filter(
      (course) => course.courseCode !== courseCode
    );
    setSelectedCourses(selectedCourses);
    setSelectedClassIds(
      selectedClassIds.filter((id) => id.split('-')[0] !== courseCode),
    );
  };

  const handleRemoveClass = (activityId: string) => {
    const newSelectedClassIds = selectedClassIds.filter(
      (id) => !id.startsWith(activityId),
    );
    setSelectedClassIds(newSelectedClassIds);
  };

  const handleSelectClass = (classId: string) => {
    const [courseCode, activity] = classId.split('-');
    const newSelectedClassIds = selectedClassIds.filter(
      (id) => !id.startsWith(`${courseCode}-${activity}`),
    );
    newSelectedClassIds.push(classId);
    setSelectedClassIds(newSelectedClassIds);
  };

  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
          <StyledApp>
            <Navbar
              setIsDarkMode={setIsDarkMode}
              isDarkMode={isDarkMode}
            />
            <ContentWrapper>
              <Content>
                <SelectWrapper>
                  <CourseSelect
                    selectedCourses={selectedCourses}
                    handleSelect={handleSelectCourse}
                    handleRemove={handleRemoveCourse}
                  />
                </SelectWrapper>
                <DndProvider backend={HTML5Backend}>
                  <Inventory
                    selectedCourses={selectedCourses}
                    selectedClassIds={selectedClassIds}
                    assignedColors={assignedColors}
                    removeCourse={handleRemoveCourse}
                    removeClass={handleRemoveClass}
                  />
                  <Timetable
                    selectedCourses={selectedCourses}
                    selectedClassIds={selectedClassIds}
                    assignedColors={assignedColors}
                    is12HourMode={is12HourMode}
                    setIs12HourMode={setIs12HourMode}
                    onSelectClass={handleSelectClass}
                  />
                </DndProvider>
              </Content>
            </ContentWrapper>
          </StyledApp>
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  );
};

export default App;
