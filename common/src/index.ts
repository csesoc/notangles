export type CourseCode = string;
export type Activity = string;
export type InInventory = null;

export type SelectedClasses = (
  Record<CourseCode, Record<Activity, ClassData | InInventory>>
);

export interface CourseData {
  code: CourseCode
  name: string
  earliestStartTime: number
  latestFinishTime: number
  activities: Record<Activity, ClassData[]>
  inventoryData: Record<Activity, InventoryPeriod>
}

export interface ClassData {
  id: string
  classId: number
  course: CourseData
  activity: string
  enrolments: number
  capacity: number
  periods: ClassPeriod[]
}

export interface InventoryPeriod {
  class: {
    course: CourseData
    activity: string
  }
}

export interface ClassPeriod {
  class: ClassData
  time: ClassTime
  location: string
  locationShort: string
}

export interface ClassTime {
  day: number
  start: number
  end: number
  weeks: number[]
  weeksString: string
}
