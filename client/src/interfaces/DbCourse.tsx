import { CourseData, ClassData, ClassPeriod } from '@notangles/common';

// List of the interfaces and types that are used in the scraper

export interface DbCourse {
  courseCode: string
  name: string
  classes: DbClass[]
}

export interface DbClass {
  activity: string
  times: DbTimes[]
  courseEnrolment: DbCourseEnrolment
  classID: number
}

export interface DbCourseEnrolment {
  enrolments: number
  capacity: number
}

export interface DbTimes {
  time: DbTime
  day: string
  location: string
  weeks: string
}

export interface DbTime {
  start: string
  end: string
}

const locationShorten = (location: string): string => location.split(' (')[0];

const weekdayToNumber = (weekDay: string) => {
  const conversionTable: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
  };
  return conversionTable[weekDay];
};

const timeToNumber = (time: string) => {
  const [hour, minute] = time.split(':').map((part) => Number(part));
  return hour + minute / 60;
};

const range = (a: number, b: number) => (
  Array.from({ length: (b - a + 1) }, (_, i) => i + a)
);

const enumerateWeeks = (weeks: string): number[] => (
  weeks.split(',').flatMap((rangeString) => {
    const stops = rangeString.split('-').map((string) => Number(string));
    return stops.length === 2 ? range(stops[0], stops[1]) : stops[0];
  })
);

/**
 * An adapter that formats a DBTimes object to a Period object
 *
 * @param dbTimes A DBTimes object
 * @return A Period object which is converted from the DBTimes object
 *
 * @example
 * const periods = dbClass.times.map(dbTimesToPeriod)
 */
const dbTimesToPeriod = (dbTimes: DbTimes, classData: ClassData): ClassPeriod => ({
  class: classData,
  location: dbTimes.location,
  locationShort: locationShorten(dbTimes.location),
  time: {
    day: weekdayToNumber(dbTimes.day),
    start: timeToNumber(dbTimes.time.start),
    end: timeToNumber(dbTimes.time.end),
    weeks: enumerateWeeks(dbTimes.weeks),
    weeksString: dbTimes.weeks.replace(/,/g, ', '),
  },
});

/**
 * An adapter that formats a DBCourse object to a CourseData object
 *
 * @param dbCourse A DBCourse object
 * @return A CourseData object
 *
 * @example
 * const data = await fetch(`${baseURL}/courses/${courseCode}/`)
 * const json: DBCourse = await data.json()
 * const courseInfo = dbCourseToCourseData(json)
 */
export const dbCourseToCourseData = (dbCourse: DbCourse): CourseData => {
  const courseData: CourseData = {
    code: dbCourse.courseCode,
    name: dbCourse.name,
    activities: {},
    inventoryData: {},
    earliestStartTime: 24,
    latestFinishTime: 0,
  };

  dbCourse.classes.forEach((dbClass, index) => {
    const classData: ClassData = {
      id: `${dbCourse.courseCode}-${dbClass.activity}-${index}`,
      classId: dbClass.classID,
      course: courseData,
      activity: dbClass.activity,
      periods: [],
      enrolments: dbClass.courseEnrolment.enrolments,
      capacity: dbClass.courseEnrolment.capacity,
    };

    classData.periods = dbClass.times.map((dbTime) => (
      dbTimesToPeriod(dbTime, classData)
    ));

    // temporary deduplication (TODO: remove when the equivalent backend feature has been merged)
    classData.periods = classData.periods.filter((period) => (
      period === classData.periods.find((x) => (
        x.time.day === period.time.day
        && x.time.start === period.time.start
        && x.time.end === period.time.end
      ))
    ));

    classData.periods.forEach((period) => {
      if (period.time.end > courseData.latestFinishTime) {
        courseData.latestFinishTime = period.time.end;
      }

      if (period.time.start < courseData.earliestStartTime) {
        courseData.earliestStartTime = period.time.start;
      }
    });

    if (!(dbClass.activity in courseData.activities)) {
      courseData.activities[dbClass.activity] = [];
    }

    courseData.activities[dbClass.activity].push(classData);
  });

  Object.keys(courseData.activities).forEach((activity) => {
    courseData.inventoryData[activity] = {
      class: {
        course: courseData,
        activity,
      },
    };
  });

  return courseData;
};
