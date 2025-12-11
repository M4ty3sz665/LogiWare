const Server = require("./server")
const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

server.get('/clientcompany', async (req,res)=>{
    res.json(await dbHandler.ClientCompanies.findAll()).end()
})

Server.server.post("/clientcompany",middlewares.Auth(), async (req, res) => {
    const onecomp = await dbHandler.ClientCompanies.findOne({
        where:{
            company_name: req.body.company_name,
            registration_number: req.body.registration_number
        }
    })
    if(onecomp){
        res.json({"message":"A client company with this name already exists"})
        res.status(400).end()
    }
    else{
        await dbHandler.ClientCompanies.create({
            admitted_at: req.body.admitted_at,
            company_name: req.body.company_name,
            tax_number:req.body.tax_number,
            registration_number:req.body.registration_number,
            address:req.body.address,
            billing_address:req.body.billing_address,
            email:req.body.email,
            phone:req.body.phone
        })
        res.json({"message":"client company successfully added"})
        res.status(201).end()
    }
    res.end()
})

Server.server.put("/clientcompany/:id",middlewares.Auth(), async (req, res) => {
    const onecomp = await dbHandler.ClientCompanies.findByPk(req.params.id)
    if(onecomp){
        await dbHandler.ClientCompanies.update({
            admitted_at: req.body.admitted_at,
            company_name: req.body.company_name,
            tax_number:req.body.tax_number,
            registration_number:req.body.registration_number,
            address:req.body.address,
            billing_address:req.body.billing_address,
            email:req.body.email,
            phone:req.body.phone
        })
        res.json({"message":"client company successfully updated"})
        res.status(201).end()
    }
    else{
        res.json({"message":"No such client company exists"})
        res.status(404).end()
    }
    res.end()
})

Server.server.delete('/clientcompany/:id',middlewares.Auth(), async (req,res)=> {
    if(req.admin){
        const orderitem = await dbHandler.ClientCompanies.findByPk(req.params.id)
        if(orderitem){
            await dbHandler.ClientCompanies.destroy(orderitem)
            res.status(200).json({message:"client company deleted"}).end()
        }
        else{
            des.status(404).json({message:"No such client company"}).end()
        }
    }
})
