const express = require('express')
const fs = require('fs')
const path = require('path')

const host = 'localhost'
const PORT = 4500

const app = express()

// middleware
app.use(express.json())

// users API
app.get('/api/users', (req, res) => {

    let users = require('./database/users.json')
    res.status(200).json(users)
})

app.post('/api/user', (req, res) => {
    try {
        const { username, password, contact, is_admin } = req.body
        if (!username || !password || !contact || !is_admin) {
            throw 'username or password or contact or is_admin undefined'
        }
        let users = fs.readFileSync(path.join('database', 'users.json'), 'utf-8')
        users = users ? JSON.parse(users) : []
        let foundUsername = users.find(el => el.username === username)
        let foundContact = users.find(el => el.contact === contact)

        if (foundUsername) {
            throw 'username alredy exists!'
        }
        if (foundContact) {
            throw 'contact alredy exists!'
        }

        let userId = users.length ? users[users.length - 1].user_id + 1 : 1
        let newUser = {
            user_id: userId,
            username,
            password,
            contact,
            is_admin
        }
        users.push(newUser)
        fs.writeFileSync(path.join('database', 'users.json'), JSON.stringify(users, null, 4))
        res.status(201).json({ message: 'The user has been added!', body: newUser })
    } catch (error) {
        res.status(400).json({ message: error.message ? error.message : error, body: null })
    }
})

// foods API
app.get('/api/foods', (req, res) => {
    let foods = require('./database/foods.json')
    res.status(200).json(foods)
})

// orders API
app.get('/api/orders', (req, res) => {
    // orders?userId=1
    const {userId} = req.query
    let orders = require('./database/orders.json')
    console.log(userId);
    if(userId){
        return res.status(200).json(orders.filter(order => order.user_id == userId))
    }else {
        return res.status(200).json(orders)
    }
})
app.get('/api/orders/:orderId', (req, res) => {
    const {orderId} = req.params
    let orders = require('./database/orders.json')
    let order = orders.find(order => order.order_id == orderId)
    return res.status(200).json(order?order:"The order not found!")
})

app.post('/api/order', (req, res) => {
    try {
        const { user_id, food_id, count } = req.body
        if (!user_id || !food_id || !count) {
            throw 'user_id or food_id or count undefined'
        }
        let orders = fs.readFileSync(path.join('database', 'orders.json'), 'utf-8')
        orders = orders ? JSON.parse(orders) : []
        // let newOrder = {}
        // index topolmasa index -1 ga teg bo'ladi
        let index = orders.findIndex(order => order.food_id == food_id && order.user_id == user_id)
        let newOrder = orders.find(order => order.food_id == food_id && order.user_id == user_id)
        if (newOrder) {
            newOrder.count += +count
        } else {
            let orderId = orders.length ? orders[orders.length - 1].order_id + 1 : 1
            newOrder = {
                order_id: orderId,
                user_id,
                food_id,
                count
            }
            orders.push(newOrder)
        }
        fs.writeFileSync(path.join('database', 'orders.json'), JSON.stringify(orders, null, 4))
        res.status(201).json({ message: 'The order has been added!', body: index !== -1? orders[index] : newOrder })
    } catch (error) {
        res.status(400).json({ message: error.message ? error.message : error, body: null })
    }
})

app.listen(PORT, () => console.log('Server is running on http://' + host + ":" + PORT))