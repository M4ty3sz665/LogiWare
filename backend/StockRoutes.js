const Server = require("./server")
const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

server.get('/stock', async (req,res)=>{
    res.json(await dbHandler.Stock.findAll()).end()
})

Server.server.post("/stock",middlewares.Auth(), async (req, res) => {
    await dbHandler.Stock.create({
        item_id: req.body.item_id,
        amount: req.body.amount,
        created_at:req.body.created_at
    })
    res.json({"message":"stock successfully added"})
    res.status(201).end()  
})

Server.server.put("/stock/:id",middlewares.Auth(), async (req, res) => {
    const onestock = await dbHandler.Stock.findByPk(req.params.id)
    if(onestock){
        await dbHandler.Stock.update({
        item_id: req.body.item_id,
        amount: req.body.amount,
        created_at:req.body.created_at
        })
        res.json({"message":"stock successfully updated"})
        res.status(201).end()
    }
    else{
        res.json({"message":"No such stock exists"})
        res.status(404).end()
    }
    res.end()
})

Server.server.delete('/stock/:id',middlewares.Auth(), async (req,res)=> {
    if(req.admin){
        const onestock = await dbHandler.Stock.findByPk(req.params.id)
        if(onestock){
            await dbHandler.Stock.destroy(onestock)
            res.status(200).json({message:"stock deleted"}).end()
        }
        else{
            des.status(404).json({message:"No such stock"}).end()
        }
    }
})
