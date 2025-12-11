const { Sequelize, DataTypes } = require("sequelize")

const sequelize = new Sequelize("LogiWare", "root", "", {
	dialect: "mysql",
	host: "localhost"
})

const user = sequelize.define('user', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false
	},
	phone: {
		type: DataTypes.STRING,
		allowNull: false
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false
	},
    role:{
        type:DataTypes.STRING,
        allowNull:false
    },
    joined_at:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    }
})

const product = sequelize.define('product', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	price_net: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	price_gross: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	vat_rate: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
    product_code:{
        type:DataTypes.STRING,
        allowNull:false
    },
    recieved_at:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    }
})

const orderItem = sequelize.define('order_item', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	product_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	order_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	amount: {
		type: DataTypes.INTEGER,
        default:1
	},
	image_name: {
		type: DataTypes.STRING
	},
    unit_price_net:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    unit_price_gross:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    vat_rate:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
})

const order = sequelize.define('order', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	item_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	company_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	suppllier_id: {
		type: DataTypes.INTEGER,
        default:1
	},
	created_at: {
		type: DataTypes.DATE,
        defaultValue:DataTypes.NOW
	},
    order_number:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    status:{
        type:DataTypes.STRING,
        defaultValue:"TBD"
    },
    payment_status:{
        type:DataTypes.STRING,
        defaultValue:"not processed"
    },
    payment_method:{
        type:DataTypes.STRING,
        allowNull:false
    },
    due_date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    }
})

const client_company = sequelize.define('client_company', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	admitted_at: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	company_name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	tax_number: {
		type: DataTypes.STRING
	},
	registration_number: {
		type: DataTypes.STRING
	},
    address:{
        type:DataTypes.STRING,
        allowNull:false
    },
    billing_address:{
        type:DataTypes.STRING
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

const supplier = sequelize.define('client_company', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	title: {
		type: DataTypes.STRING
	},
	status: {
		type: DataTypes.STRING,
	},
	tax_number: {
		type: DataTypes.STRING
	},
	registration_number: {
		type: DataTypes.STRING
	},
    address:{
        type:DataTypes.STRING,
        allowNull:false
    },
    contact_name:{
        type:DataTypes.STRING
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

const stock_movement = sequelize.define('stock_movement', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	stock_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	amount: {
		type: DataTypes.INTEGER,
		defaultValue: 1
	},
	order_id: {
		type: DataTypes.INTEGER,
        allowNull:false
	},
	time_of_movement: {
		type: DataTypes.DATE,
        defaultValue:DataTypes.NOW
	},
    movement_type:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

const stock = sequelize.define('stock_movement', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	item_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	amount: {
		type: DataTypes.INTEGER,
		defaultValue: 1
	},
	created_at:{
    type:DataTypes.DATE,
    defaultValue:DataTypes.NOW
    }
	
})

const receipt = sequelize.define('client_company', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	title: {
		type: DataTypes.STRING,
	},
	body: {
		type: DataTypes.STRING,
	},
	company_id: {
		type: DataTypes.INTEGER,
        allowNull:false
	},
	order_id: {
		type: DataTypes.INTEGER
	},
    status:{
        type:DataTypes.STRING,
        allowNull:false
    },
    created_at:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
    },
    total_net:{
        type:DataTypes.INTEGER
    },
    total_vat:{
        type:DataTypes.INTEGER
    },
    total_gross:{
        type:DataTypes.INTEGER
    }
})

product.belongsTo(orderItem,{foreignKey:'product_id',sourceKey:'id'})
orderItem.hasMany(product,{foreignKey:'product_id',targetKey:'id'})

exports.Users = user
exports.Products = product
exports.OrderItems = orderItem
exports.Orders = order
exports.ClientCompanies = client_company
exports.Suppliers = supplier
exports.stockMovements = stock_movement
exports.Stock = stock
exports.Receipts = receipt
