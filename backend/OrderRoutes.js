const Server = require("./server")
const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

server.get('/order', async (req,res)=>{
    res.json(await dbHandler.Orders.findAll()).end()
})

Server.server.post("/order",middlewares.Auth(), async (req, res) => {
    const order = await dbHandler.Orders.findOne({
        where:{
            product_id: req.body.product_id,
            order_id: req.body.order_id
        }
    })
    if(order){
        res.json({"message":"An order with this name already exists"})
        res.status(400).end()
    }
    else{
        await dbHandler.Orders.create({
            item_id: req.body.item_id,
            company_id: req.body.company_id,
            suppllier_id:req.body.suppllier_id,
            created_at:req.body.created_at,
            order_number:req.body.order_number,
            payment_status:req.body.payment_status,
            payment_method:req.body.payment_method,
            due_date:req.body.due_date
        })
        res.json({"message":"order successfully added"})
        res.status(201).end()
    }
    res.end()
})

Server.server.put("/order",middlewares.Auth(), async (req, res) => {
    const order = await dbHandler.Orders.findOne({
        where:{
            product_id: req.body.product_id,
            order_id: req.body.order_id
        }
    })
    if(order){
        await dbHandler.Orders.update({
            item_id: req.body.item_id,
            company_id: req.body.company_id,
            suppllier_id:req.body.suppllier_id,
            created_at:req.body.created_at,
            order_number:req.body.order_number,
            payment_status:req.body.payment_status,
            payment_method:req.body.payment_method,
            due_date:req.body.due_date
        })
        res.json({"message":"order successfully updated"})
        res.status(201).end()
    }
    else{
        res.json({"message":"No such order exists"})
        res.status(404).end()
    }
    res.end()
})

Server.server.delete('/order/:id',middlewares.Auth(), async (req,res)=> {
    if(req.admin){
        const order = await dbHandler.Orders.findByPk(req.params.id)
        if(order){
            await dbHandler.Orders.destroy(orderitem)
            res.status(200).json({message:"order deleted"}).end()
        }
        else{
            des.status(404).json({message:"No such order"}).end()
        }
    }
})
