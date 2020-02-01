import { Response, Request } from 'express'
import * as util from 'util'

import Database from '../src/database'

interface IGetCourseParams {
  termId: string
  courseId: string
}

/**
 * GET /api/terms/:termId/courses/:courseId/
 * termId expected in yyyy-term format
 */
export const getCourse = async (req: Request, res: Response) => {
  const params: IGetCourseParams = req.params
  const [year, term] = params.termId.split('-')
  const course = await Database.dbRead(year, term, params.courseId)
  if (course) {
    res.send(JSON.stringify(course))
  } else {
    console.error(
      'dbRead returned null course. params: ' + util.inspect(params)
    )
    res.status(400).send('Invalid termId/courseId param')
  }
}

/**
 * GET /api/terms/:termId/courses
 * termId expected in yyyy-term format
 */
export const getCourseList = async (req: Request, res: Response) => {
  const params: IGetCourseParams = req.params
  const [year, term] = params.termId.split('-')
  if (!(year && term)) {
    res.status(400).send('Invalid year and term: should be <year>-<term>')
    return
  }
  const list = await Database.dbFetchAll(year, term)
  if (list) {
    res.send(JSON.stringify(list))
  } else {
    console.error('Db fetch returned null ' + util.inspect(params))
    res.status(400).send('Could not find the required data')
  }
  return list
}