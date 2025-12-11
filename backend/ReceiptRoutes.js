const Server = require("./server")
const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

server.get('/receipt', async (req,res)=>{
    res.json(await dbHandler.Receipts.findAll()).end()
})

Server.server.post("/receipt",middlewares.Auth(), async (req, res) => {
    const onesupp = await dbHandler.Receipts.findOne({
        where:{
            title: req.body.title,
            company_id: req.body.company_id,
            body:req.body.body
        }
    })
    if(onesupp){
        res.json({"message":"A receipt with this title already exists"})
        res.status(400).end()
    }
    else{
        await dbHandler.Receipts.create({
            title: req.body.title,
            body: req.body.body,
            company_id:req.body.company_id,
            order_id:req.body.order_id,
            status:req.body.status,
            created_at:req.body.created_at,
            total_net:req.body.total_net,
            total_vat:req.body.total_vat,
            total_gross:req.body.total_gross
        })
        res.json({"message":"receipt successfully added"})
        res.status(201).end()
    }
    res.end()
})

Server.server.put("/receipt/:id",middlewares.Auth(), async (req, res) => {
    const onesupp = await dbHandler.Receipts.findByPk(req.params.id)
    if(onesupp){
        await dbHandler.Receipts.update({
            title: req.body.title,
            body: req.body.body,
            company_id:req.body.company_id,
            order_id:req.body.order_id,
            status:req.body.status,
            created_at:req.body.created_at,
            total_net:req.body.total_net,
            total_vat:req.body.total_vat,
            total_gross:req.body.total_gross
        })
        res.json({"message":"receipt successfully updated"})
        res.status(201).end()
    }
    else{
        res.json({"message":"No such receipt exists"})
        res.status(404).end()
    }
    res.end()
})

Server.server.delete('/receipt/:id',middlewares.Auth(), async (req,res)=> {
    if(req.admin){
        const orderitem = await dbHandler.Receipts.findByPk(req.params.id)
        if(orderitem){
            await dbHandler.Receipts.destroy(orderitem)
            res.status(200).json({message:"receipt deleted"}).end()
        }
        else{
            des.status(404).json({message:"No such receipt"}).end()
        }
    }
})
