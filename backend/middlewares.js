require("dotenv").config()
const JWT = require("jsonwebtoken")

function Auth(){
    return (req,res,next)=>{
        const auth = req.headers.authorization
        if(!auth){
            res.status(401).json({message:"jwt must be provided"}).end()
            return
        }

        const encToken = auth
        try {
            const token = JWT.verify(encToken, process.env.SECRETKEY)
            req.uid = token.uid
            req.admin = !!token.admin
            next()
        } catch (error) {
            console.log(error)
            res.status(401).json({message:error}).end()
        }
        }
    
}

module.exports = {Auth, JWT}