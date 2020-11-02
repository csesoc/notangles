import React, { useEffect, FunctionComponent, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { MuiThemeProvider, Box, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import {
  CourseData, ClassData, SelectedClasses, ClassTime, ClassPeriod,
} from '@notangles/common';
import { useDrag } from './utils/Drag';
import Timetable from './components/timetable/Timetable';
import Navbar from './components/Navbar';
import Autotimetabler from './components/Autotimetabler';
import CourseSelect from './components/CourseSelect';
import getCourseInfo from './api/getCourseInfo';
import useColorMapper from './hooks/useColorMapper';
import storage from './utils/storage';
import { darkTheme, lightTheme } from './constants/theme';
import NetworkError from './interfaces/NetworkError';

const StyledApp = styled(Box)`
  height: 100%;
`;

const ContentWrapper = styled(Box)`
  text-align: center;
  padding-top: 64px; // for nav bar
  padding-left: 30px;
  padding-right: 30px;
  transition: background-color 0.2s, color 0.2s;
  min-height: 100vh;
  box-sizing: border-box;

  background-color: ${({ theme }) => theme.palette.background.default};
  color: ${({ theme }) => theme.palette.text.primary};
`;

const Content = styled(Box)`
  width: 1400px;
  min-width: 1100px;
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
  grid-column: 1 / -1;
  grid-row: 1;
  padding-top: 20px;
`;

const Footer = styled(Box)`
  text-align: center;
  font-size: 12px;
  margin: 40px;
`;

const App: FunctionComponent = () => {
  const [selectedCourses, setSelectedCourses] = useState<CourseData[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<SelectedClasses>({});
  const [is12HourMode, setIs12HourMode] = useState<boolean>(storage.get('is12HourMode'));
  const [isDarkMode, setIsDarkMode] = useState<boolean>(storage.get('isDarkMode'));
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<String>('');
  const [errorVisibility, setErrorVisibility] = useState<boolean>(false);

  const assignedColors = useColorMapper(
    selectedCourses.map((course) => course.code),
  );

  useEffect(() => {
    storage.set('is12HourMode', is12HourMode);
  }, [is12HourMode]);

  useEffect(() => {
    storage.set('isDarkMode', isDarkMode);
  }, [isDarkMode]);

  const handleSelectClass = (classData: ClassData) => {
    setSelectedClasses((prev) => {
      prev = { ...prev };
      prev[classData.course.code][classData.activity] = classData;
      return prev;
    });
  };

  const handleRemoveClass = (classData: ClassData) => {
    setSelectedClasses((prev) => {
      prev = { ...prev };
      prev[classData.course.code][classData.activity] = null;
      return prev;
    });
  };

  useDrag(handleSelectClass, handleRemoveClass);

  const initCourse = (course: CourseData) => {
    setSelectedClasses((prev) => {
      prev[course.code] = {};

      Object.keys(course.activities).forEach((activity) => {
        // temp until auto timetabling works
        [prev[course.code][activity]] = course.activities[activity];
      });

      return prev;
    });
  };

  const hasTimeOverlap = (period1: ClassTime, period2: ClassTime) => (
    period1.day === period2.day && ((
      period1.end > period2.start
      && period1.start < period2.end
    ) || (
      period2.end > period1.start
      && period2.start < period1.end
    ))
  );

  const checkClashes = () => {
    const newClashes: ClassPeriod[] = [];

    const flatPeriods = Object.values(selectedClasses).flatMap(
      (activities) => Object.values(activities),
    ).flatMap(
      (classData) => (classData ? classData.periods : []),
    );

    flatPeriods.forEach((period1) => {
      flatPeriods.forEach((period2) => {
        if (period1 !== period2 && hasTimeOverlap(period1.time, period2.time)) {
          if (!newClashes.includes(period1)) {
            newClashes.push(period1);
          }
          if (!newClashes.includes(period2)) {
            newClashes.push(period2);
          }
        }
      });
    });

    return newClashes;
  };

  const handleSelectCourse = async (courseCode: string) => {
    try {
      const newCourse = await getCourseInfo('2020', 'T3', courseCode);
      const newSelectedCourses = [...selectedCourses, newCourse];
      setSelectedCourses(newSelectedCourses);
      initCourse(newCourse);
    } catch (e) {
      if (e instanceof NetworkError) {
        setErrorMsg(e.message);
        setErrorVisibility(true);
      }
    }
  };

  const handleRemoveCourse = (courseCode: string) => {
    const newSelectedCourses = selectedCourses.filter(
      (course) => course.code !== courseCode,
    );
    setSelectedCourses(newSelectedCourses);
    setSelectedClasses((prev) => {
      prev = { ...prev };
      delete prev[courseCode];
      return prev;
    });
  };

  const handleErrorClose = () => {
    setErrorVisibility(false);
  };

  return (
    <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <StyledApp>
          <Navbar
            setIsDarkMode={setIsDarkMode}
            isDarkMode={isDarkMode}
            is12HourMode={is12HourMode}
            setIs12HourMode={setIs12HourMode}
            isCompactMode={isCompactMode}
            setIsCompactMode={setIsCompactMode}
          />
          <ContentWrapper>
            <Content>
              <Grid container spacing={2}>
                <Grid item xs={12} md={9}>
                  <SelectWrapper>
                    <CourseSelect
                      selectedCourses={selectedCourses}
                      assignedColors={assignedColors}
                      handleSelect={handleSelectCourse}
                      handleRemove={handleRemoveCourse}
                      setErrorMsg={setErrorMsg}
                      setErrorVisibility={setErrorVisibility}
                    />
                  </SelectWrapper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Autotimetabler isDarkMode={isDarkMode} />
                </Grid>
              </Grid>
              <Timetable
                selectedCourses={selectedCourses}
                selectedClasses={selectedClasses}
                assignedColors={assignedColors}
                is12HourMode={is12HourMode}
                setIs12HourMode={setIs12HourMode}
                isCompactMode={isCompactMode}
                clashes={checkClashes()}
              />
              <Footer>
                DISCLAIMER: While we try our best, Notangles is not an
                official UNSW site, and cannot guarantee data accuracy or
                reliability.
                <br />
                <br />
                Made by &gt;_ CSESoc UNSW&nbsp;&nbsp;•&nbsp;&nbsp;
                <Link target="_blank" href="mailto:projects@csesoc.org.au">
                  Email
                </Link>
                &nbsp;&nbsp;•&nbsp;&nbsp;
                <Link target="_blank" href="https://github.com/csesoc/notangles">
                  GitHub
                </Link>
              </Footer>
              <Snackbar open={errorVisibility} autoHideDuration={6000} onClose={handleErrorClose}>
                <Alert severity="error" onClose={handleErrorClose} variant="filled">
                  {errorMsg}
                </Alert>
              </Snackbar>
            </Content>
          </ContentWrapper>
        </StyledApp>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};
export default App;
