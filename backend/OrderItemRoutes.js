const Server = require("./server")
const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

server.get('/orderitem', async (req,res)=>{
    res.json(await dbHandler.OrderItems.findAll()).end()
})

Server.server.post("/orderitem",middlewares.Auth(), async (req, res) => {
    const orderitem = await dbHandler.OrderItems.findOne({
        where:{
            product_id: req.body.product_id,
            order_id: req.body.order_id
        }
    })
    if(orderitem){
        res.json({"message":"An order item with this name already exists"})
        res.status(400).end()
    }
    else{
        await dbHandler.OrderItems.create({
            product_id: req.body.product_id,
            order_id: req.body.order_id,
            amount:req.body.amount,
            image_name:req.body.image_name,
            unit_price_net:req.body.unit_price_net,
            unit_price_gross:req.body.unit_price_gross,
            vat_rate:req.body.vat_rate
        })
        res.json({"message":"order item successfully added"})
        res.status(201).end()
    }
    res.end()
})

Server.server.put("/orderitem",middlewares.Auth(), async (req, res) => {
    const user = await dbHandler.OrderItems.findOne({
        where:{
            product_id: req.body.product_id,
            order_id: req.body.order_id
        }
    })
    if(user){
        await dbHandler.OrderItems.update({
            product_id: req.body.product_id,
            order_id: req.body.order_id,
            amount:req.body.amount,
            image_name:req.body.image_name,
            unit_price_net:req.body.unit_price_net,
            unit_price_gross:req.body.unit_price_gross,
            vat_rate:req.body.vat_rate
        })
        res.json({"message":"order item successfully updated"})
        res.status(201).end()
    }
    else{
        res.json({"message":"No order item with this name exists"})
        res.status(404).end()
    }
    res.end()
})

Server.server.delete('/orderitem/:id',middlewares.Auth(), async (req,res)=> {
    if(req.admin){
        const orderitem = await dbHandler.OrderItems.findByPk(req.params.id)
        if(orderitem){
            await dbHandler.OrderItems.destroy(orderitem)
            res.status(200).json({message:"order item deleted"}).end()
        }
        else{
            des.status(404).json({message:"No such order item"}).end()
        }
    }
})
