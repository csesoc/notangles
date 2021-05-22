export interface AutoCourse {
  code: string,
  exclude: string[],
}

export interface Criteria {
  daysAtUni?: number,
  breaks?: number,
  walkingDistance?: number,
  friends?: number,
  starFriends?: number,
  earlyStart?: number,
  earlyFinish?: number,
  variety?: number,
}

export interface AutoRequest {
  courses: AutoCourse[],
  year: number,
  term: string,
  criteria: Criteria,
}
