const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

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
            res.json({"token": token, "message":"Successful login"}).end()
        }
        else{
            res.status(400).json({"message":"Wrong username or password"}).end()
        }
    })

    server.post("/register", async (req, res) => {
    const user = await dbHandler.Users.findOne({
        where:{
            name: req.body.name
        }
    })
    if(user){
        res.status(400).json({"message":"A user with this username already exists"}).end()
    }
    else{
        const newUser = await dbHandler.Users.create({
            name: req.body.name,
            password: req.body.password,
            phone:req.body.phone,
            role:req.body.role,
            email:req.body.email,
            admin:req.body.admin
        })
        const token = middlewares.JWT.sign({"uid":newUser.id , "admin":newUser.admin}, process.env.SECRETKEY, {expiresIn: "6h"})
        res.status(201).json({"message":"Successful registration", "token": token}).end()
    }
    res.end()
})

    server.get('/oneuser', middlewares.Auth(), async (req,res)=>{
    console.log(req.uid)
    res.status(200).json(await dbHandler.Users.findByPk(req.uid)).end()
})
    server.delete('/oneuser',middlewares.Auth(), async (req,res)=> {
    if(req.admin){
        try{
            await dbHandler.Users.destroy({where:{id:req.uid}})
            res.status(200).json({message:"user deleted"}).end()
        }
        catch(err){
            console.log(err)
            res.status(404).json({message:err}).end()
        }
    }
 })

    server.put('/oneuser', middlewares.Auth(), async (req, res) => {
    if(req.admin){
    try {
        const updated = await dbHandler.Users.update(req.body, {where:{id:req.uid }})
        if (updated[0] === 0) {
            return res.status(404).json({ message: 'user not found' }).end()
        }
        else{
            res.json({ message: 'user updated' }).end()
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Server error' }).end()
    }
    }
})

}