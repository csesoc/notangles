import React, { useEffect, FunctionComponent, useState } from 'react'
import Select from 'react-select'
import styled from 'styled-components'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import { Timetable } from './components/timetable/Timetable'
import Navbar from './components/Navbar'
import Inventory from './components/inventory/Inventory'
import { CourseData } from './interfaces/CourseData'

import { getCourseInfo } from './api/getCourseInfo'
import { getCoursesList } from './api/getCoursesList'
import { CoursesList } from './interfaces/CourseOverview'
import { useColorMapper } from './hooks/useColorMapper'

interface CourseOption {
  value: string
  label: string
}

const StyledApp = styled.div`
  height: 85vh;
  padding: 10px 20%;

  display: grid;
  grid-template-rows: 1fr 1fr 90% 
  grid-template-columns: auto;

  text-align: center;
  background-color: white;
`

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 30px;
`

const StyledSelect = styled(Select)`
  width: 100%;
  text-align: left;
`

const App: FunctionComponent = () => {
  const [coursesList, setCoursesList] = useState<CoursesList>([])
  const [selectedCourses, setSelectedCourses] = useState<CourseData[]>([])
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])
  const assignedColors = useColorMapper(
    selectedCourses.map(course => course.courseCode)
  )

  useEffect(() => {
    fetchClassesList()
  }, [])

  const handleSelectCourse = async (e: CourseOption) => {
    const selectedCourseClasses = await getCourseInfo('2020', 'T3', e.value)

    if (selectedCourseClasses) {
      setSelectedCourses([...selectedCourses, selectedCourseClasses])
    }
  }

  const handleRemoveCourse = (courseCode: string) => {
    const newSelectedCourses = selectedCourses.filter(
      course => course.courseCode !== courseCode
    )
    setSelectedCourses(newSelectedCourses)
    setSelectedClassIds(
      selectedClassIds.filter(id => id.split('-')[0] !== courseCode)
    )
  }

  const handleRemoveClass = (activityId: string) => {
    const newSelectedClassIds = selectedClassIds.filter(
      id => !id.startsWith(activityId)
    )
    console.log(activityId)
    setSelectedClassIds(newSelectedClassIds)
  }

  const handleSelectClass = (classId: string) => {
    const [courseCode, activity] = classId.split('-')
    const newSelectedClassIds = selectedClassIds.filter(
      id => !id.startsWith(`${courseCode}-${activity}`)
    )
    newSelectedClassIds.push(classId)
    setSelectedClassIds(newSelectedClassIds)
  }

  const fetchClassesList = async () => {
    const coursesList = await getCoursesList('2020', 'T3')
    if (coursesList) {
      setCoursesList(coursesList)
    }
  }

  const courseSelectOptions: CourseOption[] = coursesList.map(course => ({
    value: course.courseCode,
    label: `${course.courseCode} - ${course.name}`,
  }))

  return (
    <div className="App">
      <Navbar />
      <StyledApp>
        <SelectWrapper>
          <StyledSelect
            options={courseSelectOptions}
            value={null}
            onChange={handleSelectCourse}
            placeholder="Select a Course"
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
            onSelectClass={handleSelectClass}
          />
        </DndProvider>
      </StyledApp>
    </div>
  )
}

export default App
