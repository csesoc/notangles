// List of the interfaces and types that are used in the scraper

/**
 * @type: Data extracted from a page
 */
type Chunk = string[]

/**
 * @type: url that represents pages of the site
 */
type TimetableUrl = string

/**
 * @type: List of timetableUrls
 */
type UrlList = TimetableUrl[]

/**
 * @enum: List of possible terms
 */
enum Term {
  Summer = 'Summer',
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
  S1 = 'S1',
  S2 = 'S2',
}

/**
 * @enum: All possible careers
 */
enum Career {
  Undergraduate = 'Undergraduate',
  Postgraduate = 'Postgraduate',
  Research = 'Research',
}

/**
 * @enum: Possible Days
 */
enum Day {
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
  Sun = 'Sun',
}

/**
 * @enum: Defines the status of a class
 */
enum Status {
  Full = 'Full',
  Open = 'Open',
  OnHold = 'On Hold',
}

/**
 * @interface ExtendedTerm: Term is not Other under normal circumstances
 */
enum ExtendedTerm {
  Other = 'Other',
}

/**
 * @interface TimetableData: Maps term to list of all courses that run in that term
 */
interface TimetableData extends Record<Term, Course[]> {
  // To account for classes that do not run in any term or that
  // could not be classified (The latter case should be avoided)
  Other?: Course[]
}
type ClassesByTerm = Record<Term, Class[]>

/**
 * @interface Warning: Defines the interface for input not conforming to the strict requirements
 */
interface Warning extends ClassWarnings {
  courseCode: string
  courseName: string
}

/**
 * @enum: Gives information about th error that has ocurred
 */
enum WarningTag {
  Other = 'Other',
  ZeroEnrolmentCapacity = 'Zero Enrolment Capacity',
  UnknownLocation = 'Unknown Location',
  UnknownDate_Weeks = 'Unknown Date - Weeks',
}

/**
 * @interface ClassWarnings: Defines the details about the warning a class might provide
 */
interface ClassWarnings {
  tag: WarningTag
  classID: number
  term: string
  error: {
    key: string
    value: unknown
  }
}

/**
 * @interface PageData: Defines the structure of a subsection of a page in Chunks
 */
interface PageData {
  course_info: Chunk
  classes?: Chunk[]
}

/**
 * @interface Time: Structure of each time object inside a class
 */
interface Time {
  day: Day
  time: {
    start: string
    end: string
  }
  location?: string
  weeks: string
  instructor?: string
}

/**
 * @interface Class: Structure of a scraped class
 */
interface Class {
  classID: number
  section: string
  term: string
  activity: string
  status: Status
  courseEnrolment: {
    enrolments: number
    capacity: number
  }
  termDates: {
    start: string
    end: string
  }
  needsConsent: boolean
  mode: string
  times?: Time[]
  notes?: string[]
}

/**
 * @interface Course Structure of a scraped course
 */
interface Course extends CourseHead, CourseInfo {
  classes?: Class[]
  notes?: string[]
}

/**
 * @interface CourseHead: Data about the title of the car
 */
interface CourseHead {
  courseCode: string
  name: string
}

/**
 * @interface CourseInfo: Data about the course that is scraped, without the classes
 */
interface CourseInfo {
  school: string
  campus: string
  career: string
  censusDates: string[]
  termsOffered: string[]
}

/**
 * @interface GetTermFromClassDates Structure of a date inside a reference object provided to the classTermFinder method
 */
interface GetTermFromClassDates {
  start: number
  length: number
}

/**
 * @interface GetTermFromClassReferenceElement: Structure of a reference object provided to the classTermFinder method
 */
interface GetTermFromClassReferenceElement {
  term: Term
  dates: GetTermFromClassDates[]
}

type GetTermFromClassReference = GetTermFromClassReferenceElement[]

/**
 * @interface TermFinderReferenceElement: Structure of a reference object provided to the termFinder method
 */
interface TermFinderReferenceElement {
  term: Term
  census: string
}

/**
 * @type: The reference list that the term finder function needs
 */
type TermFinderReference = TermFinderReferenceElement[]

export {
  TermFinderReference,
  GetTermFromClassReference,
  GetTermFromClassDates,
  Time,
  Class,
  Course,
  CourseHead,
  CourseInfo,
  Chunk,
  PageData,
  TimetableUrl,
  TimetableData,
  UrlList,
  Term,
  ClassesByTerm,
  ExtendedTerm,
  Status,
  Day,
  Career,
  Warning,
  ClassWarnings,
  WarningTag,
}
