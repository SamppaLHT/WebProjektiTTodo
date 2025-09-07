import { pool } from '../helper/db.js'


const selectAllTasks = async () => {
    return await pool.query('SELECT * FROM tasks')
}

const insertTask = async (description) => {
    return await pool.query(
        'INSERT INTO tasks (description) VALUES ($1) RETURNING *', 
        [description]
    )
}

export { selectAllTasks, insertTask }