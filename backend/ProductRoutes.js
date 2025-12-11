const Server = require("./server")
const middlewares = require("./middlewares")
const dbHandler = require('./dbHandler')

server.get('/product', async (req,res)=>{
    res.json(await dbHandler.Products.findAll()).end()
})

Server.server.post("/product",middlewares.Auth(), async (req, res) => {
    const user = await dbHandler.Products.findOne({
        where:{
            name: req.body.name
        }
    })
    if(user){
        res.json({"message":"A product with this name already exists"})
        res.status(400).end()
    }
    else{
        await dbHandler.Users.create({
            name: req.body.name,
            price_net: req.body.price_net,
            price_gross:req.body.price_gross,
            vat_rate:req.body.vat_rate,
            product_code:req.body.product_code
        })
        res.json({"message":"Product successfully added"})
        res.status(201).end()
    }
    res.end()
})

Server.server.put("/product",middlewares.Auth(), async (req, res) => {
    const user = await dbHandler.Products.findOne({
        where:{
            name: req.body.name
        }
    })
    if(user){
        await dbHandler.Products.update({
            name: req.body.name,
            price_net: req.body.price_net,
            price_gross:req.body.price_gross,
            vat_rate:req.body.vat_rate,
            product_code:req.body.product_code
        })
        res.json({"message":"Product successfully updated"})
        res.status(201).end()
    }
    else{
        res.json({"message":"No product with this name exists"})
        res.status(404).end()
    }
    res.end()
})

Server.server.delete('/product/:id',middlewares.Auth(), async (req,res)=> {
    if(req.admin){
        const oneProduct = await dbHandler.Products.findByPk(req.params.id)
        if(oneProduct){
            await dbHandler.Products.destroy(oneProduct)
            res.status(200).json({message:"product deleted"}).end()
        }
        else{
            des.status(404).json({message:"No such product"}).end()
        }
    }
})
