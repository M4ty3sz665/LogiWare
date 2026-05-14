const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

function isValidEmail(email) {
    if (typeof email !== 'string') return false
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,10}$/.test(email.trim())
}

function isValidPhone(phone) {
    if (typeof phone !== 'string') return false

    const trimmed = phone.trim()
    const allowedCharacters = /^\+?[0-9\s()-]+$/

    if (!trimmed || !allowedCharacters.test(trimmed)) {
        return false
    }

    if ((trimmed.match(/\+/g) || []).length > 1) {
        return false
    }

    if (trimmed.includes('+') && !trimmed.startsWith('+')) {
        return false
    }

    const digitsOnly = trimmed.replace(/\D/g, '')
    return digitsOnly.length >= 8 && digitsOnly.length <= 15
}

module.exports = function(server) {
    server.post("/login", async (req, res) => {
        const user = await dbHandler.Users.findOne({
            where:{
                email: req.body.email,
                password: req.body.password
            }
        })
        if(user){
            const token = middlewares.JWT.sign({"uid":user.id , "admin":user.admin}, process.env.SECRETKEY, {expiresIn: "6h"})
            console.log(token)
            res.json({"token": token, "message":"Successful login", admin:user.admin}).end()
        }
        else{
            res.status(400).json({"message":"Wrong username or password"}).end()
        }
    })

    server.post("/register", async (req, res) => {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : ''
    const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : ''
    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (!name || !email || !phone || !password) {
        res.status(400).json({"message":"Missing required fields"}).end()
        return
    }

    if (!isValidEmail(email)) {
        res.status(400).json({"message":"Invalid email format"}).end()
        return
    }

    if (!isValidPhone(phone)) {
        res.status(400).json({"message":"Invalid phone number format"}).end()
        return
    }

    if (password.length < 6) {
        res.status(400).json({"message":"Password must be at least 6 characters"}).end()
        return
    }

    const userByEmail = await dbHandler.Users.findOne({
        where:{
            email
        }
    })
    if(userByEmail){
        res.status(400).json({"message":"A user with this email already exists"}).end()
    }
    else{
        const newUser = await dbHandler.Users.create({
            name,
            password,
            phone,
            role:'user',
            email,
            admin:false
        })
        const token = middlewares.JWT.sign({"uid":newUser.id , "admin":newUser.admin}, process.env.SECRETKEY, {expiresIn: "6h"})
        res.status(201).json({"message":"Successful registration", "token": token}).end()
    }
})

    server.get('/oneuser', middlewares.Auth(), async (req,res)=>{
    console.log(req.uid)
    res.status(200).json(await dbHandler.Users.findByPk(req.uid)).end()
})
    server.get('/profiles', middlewares.Auth(), async (req,res)=>{
    res.status(200).json(await dbHandler.Users.findAll()).end()
})
    
    server.delete('/oneuser',middlewares.Auth(), async (req,res)=> {
        try{
            const deleted = await dbHandler.Users.destroy({where:{id:req.uid}})
            if(deleted === 0){
                res.status(404).json({message:"user not found"}).end()
                return
            }
            res.status(200).json({message:"user deleted"}).end()
        }
        catch(err){
            console.log(err)
            res.status(500).json({message:"Server error"}).end()
        }
 })

    
    server.put('/oneuser', middlewares.Auth(), async (req, res) => {
        try {
            const payload = {}
            if(typeof req.body.name === 'string') payload.name = req.body.name
            if(typeof req.body.email === 'string') payload.email = req.body.email
            if(typeof req.body.phone === 'string') payload.phone = req.body.phone

            
            if(req.admin){
                if(typeof req.body.role === 'string') payload.role = req.body.role
                if(typeof req.body.admin === 'boolean') payload.admin = req.body.admin
            }

            const updated = await dbHandler.Users.update(payload, {where:{id:req.uid }})
            if (updated[0] === 0) {
                res.status(404).json({ message: 'user not found' }).end()
                return
            }
            res.status(200).json({ message: 'user updated' }).end()
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Server error' }).end()
        }
    })

    
    server.put('/oneuser/password', middlewares.Auth(), async (req, res) => {
        try{
            const currentPassword = req.body.currentPassword
            const newPassword = req.body.newPassword

            if(!currentPassword || !newPassword){
                res.status(400).json({message:"Missing currentPassword or newPassword"}).end()
                return
            }

            if(typeof newPassword !== 'string' || newPassword.length < 6){
                res.status(400).json({message:"Password must be at least 6 characters"}).end()
                return
            }

            const user = await dbHandler.Users.findByPk(req.uid)
            if(!user){
                res.status(404).json({message:"user not found"}).end()
                return
            }

            if(user.password !== currentPassword){
                res.status(400).json({message:"Wrong current password"}).end()
                return
            }

            await user.update({password:newPassword})
            res.status(200).json({message:"password updated"}).end()
        }
        catch(err){
            console.log(err)
            res.status(500).json({message:"Server error"}).end()
        }
    })

}