import { ClassPeriod } from '@notangles/common';

export const minDaysScore = (timetable: ClassPeriod []) => {
   let times : number[] = []
   timetable.forEach(period => {
      if (!times.includes(period.time.day)) {
         times.push(period.time.day)
      }
   })

   return (11 - times.length)
}