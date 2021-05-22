import * as express from 'express'
import * as indexController from './index'
import { getCourse, getCourseList } from './controllers/index'
import { autoTimetable } from './controllers/autoTimetable'

const app = express()
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

/**
 * Express configuration
 */
app.set('port', process.env.PORT || 3001)

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*') // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

/**
 * Express routes
 */
app.get('/', indexController.index)
app.get('/api/terms/:termId/courses/:courseId', getCourse)
app.get('/api/terms/:termId/courses', getCourseList)
app.post('/api/auto', autoTimetable)

export default app
