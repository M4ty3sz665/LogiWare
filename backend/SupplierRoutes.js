const Server = require("./server")
const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

server.get('/supplier', async (req,res)=>{
    res.json(await dbHandler.Suppliers.findAll()).end()
})

Server.server.post("/supplier",middlewares.Auth(), async (req, res) => {
    const onesupp = await dbHandler.Suppliers.findOne({
        where:{
            contact_name: req.body.contact_name,
            registration_number: req.body.registration_number
        }
    })
    if(onesupp){
        res.json({"message":"A supplier with this name already exists"})
        res.status(400).end()
    }
    else{
        await dbHandler.Suppliers.create({
            title: req.body.title,
            status: req.body.status,
            tax_number:req.body.tax_number,
            registration_number:req.body.registration_number,
            address:req.body.address,
            contact_name:req.body.contact_name,
            email:req.body.email,
            phone:req.body.phone
        })
        res.json({"message":"supplier successfully added"})
        res.status(201).end()
    }
    res.end()
})

Server.server.put("/supplier/:id",middlewares.Auth(), async (req, res) => {
    const onesupp = await dbHandler.Suppliers.findByPk(req.params.id)
    if(onesupp){
        await dbHandler.Suppliers.update({
            title: req.body.title,
            status: req.body.status,
            tax_number:req.body.tax_number,
            registration_number:req.body.registration_number,
            address:req.body.address,
            contact_name:req.body.contact_name,
            email:req.body.email,
            phone:req.body.phone
        })
        res.json({"message":"supplier successfully updated"})
        res.status(201).end()
    }
    else{
        res.json({"message":"No such supplier exists"})
        res.status(404).end()
    }
    res.end()
})

Server.server.delete('/supplier/:id',middlewares.Auth(), async (req,res)=> {
    if(req.admin){
        const orderitem = await dbHandler.Suppliers.findByPk(req.params.id)
        if(orderitem){
            await dbHandler.Suppliers.destroy(orderitem)
            res.status(200).json({message:"supplier deleted"}).end()
        }
        else{
            des.status(404).json({message:"No such supplier"}).end()
        }
    }
})
