const Server = require("./server")
const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

server.get('/stockmovement', async (req,res)=>{
    res.json(await dbHandler.stockMovements.findAll()).end()
})

Server.server.post("/stockmovement",middlewares.Auth(), async (req, res) => {
    const onesupp = await dbHandler.stockMovements.findOne({
        where:{
            order_id: req.body.order_id,
            stock_id: req.body.stock_id
        }
    })
    if(onesupp){
        res.json({"message":"movement already exists"})
        res.status(400).end()
    }
    else{
        await dbHandler.stockMovements.create({
            stock_id: req.body.stock_id,
            amount: req.body.amount,
            order_id:req.body.order_id,
            time_of_movement:req.body.time_of_movement,
            movement_type:req.body.movement_type
        })
        res.json({"message":"movement successfully added"})
        res.status(201).end()
    }
    res.end()
})

Server.server.put("/stockmovement/:id",middlewares.Auth(), async (req, res) => {
    const onesupp = await dbHandler.stockMovements.findByPk(req.params.id)
    if(onesupp){
        await dbHandler.stockMovements.update({
            stock_id: req.body.stock_id,
            amount: req.body.amount,
            order_id:req.body.order_id,
            time_of_movement:req.body.time_of_movement,
            movement_type:req.body.movement_type
        })
        res.json({"message":"movement successfully updated"})
        res.status(201).end()
    }
    else{
        res.json({"message":"No such movement exists"})
        res.status(404).end()
    }
    res.end()
})

Server.server.delete('/stockmovement/:id',middlewares.Auth(), async (req,res)=> {
    if(req.admin){
        const orderitem = await dbHandler.stockMovements.findByPk(req.params.id)
        if(orderitem){
            await dbHandler.stockMovements.destroy(orderitem)
            res.status(200).json({message:"movement deleted"}).end()
        }
        else{
            des.status(404).json({message:"No such movement"}).end()
        }
    }
})
