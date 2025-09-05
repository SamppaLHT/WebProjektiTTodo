import { expect } from "chai";
import { initializeTestDb, getToken, insertTestUser } from "./helper/test.js";

describe("Testing basic database functionality", () => {
    let token = null
    let taskId
    const testUser = { email: "foo@foo.com", password: "password123"}
    before( async () => {
        await initializeTestDb()
        await insertTestUser(testUser)
        token = getToken(testUser.email)
    })

    it("Should get all tasks", async () => {
        const response = await fetch("http://localhost:3001/")
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.be.an("array").that.is.not.empty
        expect(data[0]).to.include.all.keys(["id", "description"])
    })

    it("should create a new task", async () => {
        const newTask = { description: "Test task"}
        const response = await fetch("http://localhost:3001/create", {
            method: "post",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            body: JSON.stringify({ task: newTask })
        })
        const data = await response.json()
        taskId = data.id
        expect(response.status).to.equal(201)
        expect(data).to.include.all.keys(["id", "description"])
        expect(data.description).to.equal(newTask.description)
    })

    it("should delete task", async () => {
        const response = await fetch(`http://localhost:3001/delete/${taskId}`, {
            method: "delete",
            headers: {"Authorization": `Bearer ${token}`}
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.include.all.keys("id")
        expect(Number(data.id)).to.equal(taskId) 
    })

    it("should not create a new task without description", async () => {
        const response = await fetch("http://localhost:3001/create", {
            method: "post",
            headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            body: JSON.stringify({task: null})
        })
        const data = await response.json()
        expect(response.status).to.equal(400)
        expect(data).to.include.all.keys("error")
    })
})

describe("Testing user management", () => {
    
    const user = { email: "foo_login@test.com", password: "password123" }

    before(async () => {
        await insertTestUser(user)
    })
    
    it("Should sign up", async () => {

        const uniqueEmail = `test_${Date.now()}@test.com`
        const signupUser = {
            email: uniqueEmail, password: "password123"
        }
        const response = await fetch("http://localhost:3001/user/signup", {
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ user: signupUser })
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data).to.include.all.keys(["id", "email"])
        expect(data.email).to.equal(signupUser.email)
    })

    it('should log in', async () => {
        const response = await fetch('http://localhost:3001/user/signin',{
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ user })
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.include.all.keys(["id", "email", "token"])
        expect(data.email).to.equal(user.email)
    })
})
