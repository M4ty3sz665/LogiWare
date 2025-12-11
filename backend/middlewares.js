require("dotenv").config()
const JWT = require("jsonwebtoken")

function Auth(){
    return (req,res,next)=>{
        const auth = req.headers.authorization

            const encToken = auth
            try {
                const token = JWT.verify(encToken, process.env.SECRETKEY)
                req.uid = token.uid
                next()
            } catch (error) {
                console.log(error)
                res.json({"message":error})
                res.end();
            }
        }
    
}

module.exports = {Auth, JWT}