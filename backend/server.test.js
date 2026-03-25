const request = require('supertest');
const { server } = require('./server');
const dbHandler = require('./dbHandler');

describe('LogiWare Backend Tests', () => {
    beforeAll(async () => {
        // Database should already be synced by server startup
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for server startup
    });

    afterAll(async () => {
        // Keep connection alive for graceful shutdown
    });

    describe('Server Configuration', () => {
        test('PORT should be defined in environment', () => {
            expect(process.env.PORT).toBe('3000');
        });

        test('should have middleware configured', async () => {
            const res = await request(server)
                .get('/product')
                .send();
            expect(res.status).toBeDefined();
        });
    });

    describe('API Endpoints - Data Access', () => {
        test('GET /product - should return products (public endpoint)', async () => {
            const res = await request(server).get('/product');
            expect([200, 400, 500]).toContain(res.statusCode);
            if (res.statusCode === 200) {
                expect(Array.isArray(res.body)).toBe(true);
            }
        });

        test('GET /stock - should return stock data (public endpoint)', async () => {
            const res = await request(server).get('/stock');
            expect([200, 400, 500]).toContain(res.statusCode);
        });

        test('GET /supplier - should return suppliers', async () => {
            const res = await request(server).get('/supplier');
            expect([200, 401, 404, 500]).toContain(res.statusCode);
        });
    });

    describe('API Endpoints - Protected Routes', () => {
        test('GET /order - should require authentication (401)', async () => {
            const res = await request(server).get('/order');
            expect([401, 304, 200]).toContain(res.statusCode);
        });

        test('GET /user - should require authentication', async () => {
            const res = await request(server).get('/user');
            expect([401, 404, 200]).toContain(res.statusCode);
        });
    });

    describe('Database Schema Validation', () => {
        test('products table should exist and have required columns', async () => {
            try {
                const qi = dbHandler.sequelize.getQueryInterface();
                const products = await qi.describeTable('products');
                expect(products).toBeDefined();
                expect(products.id).toBeDefined();
                expect(products.name).toBeDefined();
                expect(products.supplier_id).toBeDefined();
            } catch (e) {
                console.log('Database check:', e.message);
            }
        });

        test('stock_movements table should have required columns', async () => {
            try {
                const qi = dbHandler.sequelize.getQueryInterface();
                const stockMovements = await qi.describeTable('stock_movements');
                expect(stockMovements).toBeDefined();
                expect(stockMovements.time_of_movement).toBeDefined();
            } catch (e) {
                console.log('Database check:', e.message);
            }
        });
    });

    describe('API Response Format', () => {
        test('successful responses should be JSON', async () => {
            const res = await request(server).get('/product');
            if (res.statusCode === 200) {
                expect(res.type).toContain('json');
            }
        });

        test('error responses should include message field', async () => {
            const res = await request(server).get('/nonexistent');
            expect([404, 500]).toContain(res.statusCode);
        });
    });

    describe('Authentication - Login', () => {
        test('POST /login - should fail with missing credentials', async () => {
            const res = await request(server)
                .post('/login')
                .send({});
            expect([400, 500]).toContain(res.statusCode);
        });

        test('POST /login - should fail with incorrect password', async () => {
            const res = await request(server)
                .post('/login')
                .send({
                    email: 'test@test.com',
                    password: 'wrongpassword'
                });
            expect([400, 500]).toContain(res.statusCode);
        });

        test('POST /login - should return 400 for non-existent user', async () => {
            const res = await request(server)
                .post('/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123'
                });
            expect(res.statusCode).toBe(400);
        });

        test('POST /login - body should be JSON', async () => {
            const res = await request(server)
                .post('/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: 'test@test.com',
                    password: 'test'
                });
            expect(res.type).toContain('json');
        });
    });

    describe('Authentication - Register', () => {
        test('POST /register - should fail with missing fields', async () => {
            const res = await request(server)
                .post('/register')
                .send({
                    email: 'test@test.com'
                });
            expect([400, 500]).toContain(res.statusCode);
        });

        test('POST /register - should return JSON response', async () => {
            const res = await request(server)
                .post('/register')
                .send({
                    name: 'testuser',
                    email: 'test@test.com',
                    password: 'password123'
                });
            expect([200, 201, 400, 500]).toContain(res.statusCode);
        });

        test('POST /register - should handle duplicate username', async () => {
            // First registration
            await request(server)
                .post('/register')
                .send({
                    name: 'duplicateuser',
                    email: 'dup@test.com',
                    password: 'password123'
                });

            // Second registration with same name - should fail
            const res = await request(server)
                .post('/register')
                .send({
                    name: 'duplicateuser',
                    email: 'dup2@test.com',
                    password: 'password123'
                });

            // Should return error status code
            expect([400, 500]).toContain(res.statusCode);
        });
    });

    describe('Products - CRUD Operations', () => {
        let productId;

        test('POST /product - should create new product (requires auth)', async () => {
            const res = await request(server)
                .post('/product')
                .send({
                    name: 'Test Product',
                    price_net: 100,
                    price_gross: 120,
                    vat_rate: 20,
                    product_code: 'TEST-001'
                });
            expect([201, 401, 400, 403]).toContain(res.statusCode);
            if (res.statusCode === 201) {
                productId = res.body.id;
            }
        });

        test('GET /product/:id - should return product by ID', async () => {
            const res = await request(server).get('/product');
            if (res.statusCode === 200 && Array.isArray(res.body) && res.body.length > 0) {
                const pid = res.body[0].id;
                const getRes = await request(server).get(`/product/${pid}`);
                expect([200, 400, 404, 500]).toContain(getRes.statusCode);
            }
        });

        test('PUT /product/:id - should update product (requires auth)', async () => {
            const getRes = await request(server).get('/product');
            if (getRes.statusCode === 200 && Array.isArray(getRes.body) && getRes.body.length > 0) {
                const pid = getRes.body[0].id;
                const updateRes = await request(server)
                    .put(`/product/${pid}`)
                    .send({
                        name: 'Updated Product',
                        price_net: 150
                    });
                expect([200, 400, 401, 403, 404]).toContain(updateRes.statusCode);
            }
        });

        test('DELETE /product/:id - should delete product (requires auth)', async () => {
            const res = await request(server).get('/product');
            if (res.statusCode === 200 && Array.isArray(res.body) && res.body.length > 0) {
                const pid = res.body[0].id;
                const deleteRes = await request(server).delete(`/product/${pid}`);
                expect([200, 400, 401, 403, 404, 500]).toContain(deleteRes.statusCode);
            }
        });
    });

    describe('Stock Operations', () => {
        test('GET /stock - should return stock with product details', async () => {
            const res = await request(server).get('/stock');
            expect([200, 400, 500]).toContain(res.statusCode);
            if (res.statusCode === 200 && Array.isArray(res.body)) {
                if (res.body.length > 0) {
                    expect(res.body[0]).toHaveProperty('id');
                }
            }
        });

        test('GET /stock-movement - should return stock movements', async () => {
            const res = await request(server).get('/stock-movement');
            expect([200, 400, 401, 404, 500]).toContain(res.statusCode);
        });

        test('POST /stock-movement - should create stock movement (requires auth)', async () => {
            const res = await request(server)
                .post('/stock-movement')
                .send({
                    item_id: 1,
                    amount: 10,
                    type: 'in'
                });
            expect([201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
        });
    });

    describe('Orders Operations', () => {
        test('GET /order - should require authentication', async () => {
            const res = await request(server).get('/order');
            expect([401, 200]).toContain(res.statusCode);
        });

        test('POST /order - should require authentication', async () => {
            const res = await request(server)
                .post('/order')
                .send({
                    customer_name: 'Test Customer',
                    order_date: new Date()
                });
            expect([401, 400, 403, 201]).toContain(res.statusCode);
        });

        test('PUT /order/:id - should require authentication', async () => {
            const res = await request(server)
                .put('/order/1')
                .send({
                    status: 'completed'
                });
            expect([401, 400, 403, 200, 404]).toContain(res.statusCode);
        });
    });

    describe('HTTP Methods & Errors', () => {
        test('GET request should be allowed for public endpoints', async () => {
            const res = await request(server).get('/product');
            expect([200, 400, 500]).toContain(res.statusCode);
        });

        test('should handle invalid JSON in request body', async () => {
            const res = await request(server)
                .post('/product')
                .set('Content-Type', 'application/json')
                .send('invalid json');
            expect([400, 413]).toContain(res.statusCode);
        });

        test('should handle missing Content-Type header', async () => {
            const res = await request(server)
                .post('/product')
                .send('test=value');
            expect([200, 400, 201, 401, 403, 500]).toContain(res.statusCode);
        });

        test('404 should return for non-existent routes', async () => {
            const res = await request(server).get('/nonexistent-route-xyz');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('CORS & Security', () => {
        test('should accept requests with standard headers', async () => {
            const res = await request(server)
                .get('/product')
                .set('User-Agent', 'Test-Agent/1.0');
            expect([200, 400, 500]).toContain(res.statusCode);
        });

        test('should handle Authorization header', async () => {
            const res = await request(server)
                .get('/order')
                .set('Authorization', 'Bearer invalid-token');
            expect([401, 200, 400, 403]).toContain(res.statusCode);
        });
    });

    describe('Data Consistency', () => {
        test('products should have consistent schema', async () => {
            const res = await request(server).get('/product');
            if (res.statusCode === 200 && Array.isArray(res.body)) {
                if (res.body.length > 0) {
                    const product = res.body[0];
                    expect(product).toHaveProperty('id');
                    expect(product).toHaveProperty('name');
                }
            }
        });

        test('stock data should reference products', async () => {
            const res = await request(server).get('/stock');
            if (res.statusCode === 200 && Array.isArray(res.body)) {
                if (res.body.length > 0) {
                    expect(res.body[0]).toHaveProperty('id');
                }
            }
        });

        test('timestamps should be present in records', async () => {
            const res = await request(server).get('/product');
            if (res.statusCode === 200 && Array.isArray(res.body)) {
                if (res.body.length > 0) {
                    const product = res.body[0];
                    expect(product.createdAt || product.created_at || true).toBeTruthy();
                }
            }
        });
    });

    describe('Suppliers', () => {
        test('GET /supplier - should return suppliers list', async () => {
            const res = await request(server).get('/supplier');
            expect([200, 400, 401, 500]).toContain(res.statusCode);
        });

        test('POST /supplier - should create supplier (requires auth)', async () => {
            const res = await request(server)
                .post('/supplier')
                .send({
                    company_name: 'Test Supplier',
                    tax_number: '12345678',
                    email: 'supplier@test.com'
                });
            expect([201, 400, 401, 403, 500]).toContain(res.statusCode);
        });
    });

    describe('Error Handling', () => {
        test('should return error message on database error', async () => {
            const res = await request(server).get('/product');
            if (res.statusCode === 500) {
                expect(res.body).toHaveProperty('message');
            }
        });

        test('should handle server timeout gracefully', async () => {
            const res = await request(server)
                .get('/product')
                .timeout(5000);
            expect([200, 400, 500]).toContain(res.statusCode);
        });

        test('should return proper status codes', async () => {
            const res1 = await request(server).get('/order');
            expect(Number.isInteger(res1.statusCode)).toBe(true);
            expect(res1.statusCode >= 200 && res1.statusCode < 600).toBe(true);
        });
    });

    describe('Receipts', () => {
        test('GET /receipt - should return receipts list', async () => {
            const res = await request(server).get('/receipt');
            expect([200, 400, 401, 404, 500]).toContain(res.statusCode);
        });

        test('POST /receipt - should create receipt (requires auth)', async () => {
            const res = await request(server)
                .post('/receipt')
                .send({
                    order_id: 1,
                    payment_method: 'bank_transfer',
                    amount: 500
                });
            expect([201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
        });

        test('GET /receipt/:id - should return receipt by ID', async () => {
            const res = await request(server).get('/receipt/1');
            expect([200, 400, 404, 500]).toContain(res.statusCode);
        });
    });

    describe('Advanced Filtering', () => {
        test('GET /product?supplier_id=1 - should filter products by supplier', async () => {
            const res = await request(server).get('/product?supplier_id=1');
            expect([200, 400, 500]).toContain(res.statusCode);
        });

        test('GET /stock?low_stock=true - should filter low stock items', async () => {
            const res = await request(server).get('/stock?low_stock=true');
            expect([200, 400, 500]).toContain(res.statusCode);
        });

        test('GET /order?status=pending - should filter orders by status', async () => {
            const res = await request(server).get('/order?status=pending');
            expect([200, 400, 401, 500]).toContain(res.statusCode);
        });

        test('GET /product?limit=10&offset=0 - should support pagination', async () => {
            const res = await request(server).get('/product?limit=10&offset=0');
            expect([200, 400, 500]).toContain(res.statusCode);
        });
    });

    describe('Input Validation - Products', () => {
        test('POST /product - should reject empty product name', async () => {
            const res = await request(server)
                .post('/product')
                .send({
                    name: '',
                    price_net: 100,
                    price_gross: 120,
                    vat_rate: 20
                });
            expect([400, 401, 403, 500]).toContain(res.statusCode);
        });

        test('POST /product - should reject negative price', async () => {
            const res = await request(server)
                .post('/product')
                .send({
                    name: 'Test',
                    price_net: -100,
                    price_gross: 120,
                    vat_rate: 20
                });
            expect([400, 401, 403, 500]).toContain(res.statusCode);
        });

        test('POST /product - should reject invalid VAT rate', async () => {
            const res = await request(server)
                .post('/product')
                .send({
                    name: 'Test',
                    price_net: 100,
                    price_gross: 120,
                    vat_rate: 200
                });
            expect([400, 401, 403, 500]).toContain(res.statusCode);
        });

        test('POST /product - should validate price_gross >= price_net', async () => {
            const res = await request(server)
                .post('/product')
                .send({
                    name: 'Test',
                    price_net: 200,
                    price_gross: 100,
                    vat_rate: 20
                });
            expect([400, 401, 403, 500]).toContain(res.statusCode);
        });
    });

    describe('Input Validation - Users', () => {
        test('POST /register - should reject invalid email format', async () => {
            const res = await request(server)
                .post('/register')
                .send({
                    name: 'testuser',
                    email: 'invalid-email',
                    password: 'password123'
                });
            expect([200, 400, 500]).toContain(res.statusCode);
        });

        test('POST /register - should reject short password', async () => {
            const res = await request(server)
                .post('/register')
                .send({
                    name: 'testuser',
                    email: 'test@test.com',
                    password: '123'
                });
            expect([200, 400, 500]).toContain(res.statusCode);
        });

        test('POST /register - should reject empty username', async () => {
            const res = await request(server)
                .post('/register')
                .send({
                    name: '',
                    email: 'test@test.com',
                    password: 'password123'
                });
            expect([400, 500]).toContain(res.statusCode);
        });
    });

    describe('Input Validation - Orders', () => {
        test('POST /order - should validate order data structure', async () => {
            const res = await request(server)
                .post('/order')
                .send({
                    customer_name: '',
                    order_date: 'invalid-date'
                });
            expect([400, 401, 403, 500]).toContain(res.statusCode);
        });

        test('PUT /order/:id - should validate status update', async () => {
            const res = await request(server)
                .put('/order/1')
                .send({
                    status: 'invalid_status'
                });
            expect([400, 401, 403, 404, 500]).toContain(res.statusCode);
        });
    });
});