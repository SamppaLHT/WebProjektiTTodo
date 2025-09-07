import { pool } from '../helper/db.js'
import { Router } from 'express'
import { auth } from '../helper/auth.js'
import { getTasks, postTask } from '../controllers/TaskController.js'

const router = Router()

router.get('/', getTasks)
router.post('/create', auth, postTask)

router.delete('/delete/:id', (req, res, next) => {
    const { id } = req.params
    
    pool.query('DELETE FROM tasks WHERE id = $1',
        [id],
        (err, result) => {
        if (err) {
            return next(err)
        }
        if (result.rowCount === 0) {
            const error = new Error('Task not found')
            error.status = 404
            return next(error)
        }
        return res.status(200).json({id:id})
    })
})

export default router