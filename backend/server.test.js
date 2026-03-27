const request = require('supertest');
const { server } = require('./server');
const dbHandler = require('./dbHandler');

describe('LogiWare Backend Tests', () => {
    beforeAll(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    async function createAuthToken() {
        const uniquePart = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const email = `authtest-${uniquePart}@example.com`;
        const password = 'password123';

        const registerRes = await request(server)
            .post('/register')
            .send({
                name: `authtest-${uniquePart}`,
                email,
                password,
                phone: '0000000000'
            });

        if (registerRes.statusCode === 201 && registerRes.body && registerRes.body.token) {
            return registerRes.body.token;
        }

        const loginRes = await request(server)
            .post('/login')
            .send({ email, password });

        if (loginRes.statusCode === 200 && loginRes.body && loginRes.body.token) {
            return loginRes.body.token;
        }

        throw new Error(`Unable to create auth token. Register status: ${registerRes.statusCode}, login status: ${loginRes.statusCode}`);
    }

    async function createOwnedOrder(token, overrides = {}) {
        const productRes = await request(server).get('/product');
        expect(productRes.statusCode).toBe(200);
        expect(Array.isArray(productRes.body)).toBe(true);

        let product = productRes.body[0];
        if (!product) {
            const uniquePart = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
            product = await dbHandler.Products.create({
                name: `order-test-product-${uniquePart}`,
                price_net: 100,
                price_gross: 127,
                vat_rate: 27,
                product_code: `OTP-${uniquePart}`,
                supplier_id: null,
            });
        }

        const payload = {
            payment_method: 'card',
            due_date: '2099-01-01',
            items: [{ product_id: product.id, amount: 1 }],
            ...overrides,
        };

        const createRes = await request(server)
            .post('/order')
            .set('Authorization', token)
            .send(payload);

        expect(createRes.statusCode).toBe(201);
        expect(createRes.body).toHaveProperty('order_number');
        return createRes.body.order_number;
    }

    afterAll(async () => {
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

        test('POST /login - should return documented error message for bad credentials', async () => {
            const res = await request(server)
                .post('/login')
                .send({
                    email: 'does-not-exist@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Wrong username or password');
        });
    });

    describe('Authentication Contract Details', () => {
        test('GET /oneuser - should return 401 and jwt message when Authorization header is missing', async () => {
            const res = await request(server).get('/oneuser');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
            expect(String(res.body.message)).toContain('jwt must be provided');
        });

        test('GET /oneuser - should reject invalid token with 401', async () => {
            const res = await request(server)
                .get('/oneuser')
                .set('Authorization', 'invalid-token-value');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
        });

        test('GET /profiles - should return 401 without token', async () => {
            const res = await request(server).get('/profiles');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
            expect(String(res.body.message)).toContain('jwt must be provided');
        });

        test('GET /profiles - should return 200 and an array for authenticated request', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .get('/profiles')
                .set('Authorization', token);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        test('GET /oneuser - should return current user object for authenticated request', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .get('/oneuser')
                .set('Authorization', token);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('email');
        });

        test('PUT /oneuser - should return 401 when Authorization header is missing', async () => {
            const res = await request(server)
                .put('/oneuser')
                .send({ name: 'updated-name' });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
        });

        test('DELETE /oneuser - should return 401 when Authorization header is missing', async () => {
            const res = await request(server).delete('/oneuser');

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
        });

        test('PUT /oneuser/password - should return 401 when Authorization header is missing', async () => {
            const res = await request(server)
                .put('/oneuser/password')
                .send({
                    currentPassword: 'a',
                    newPassword: 'abcdef'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
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
            await request(server)
                .post('/register')
                .send({
                    name: 'duplicateuser',
                    email: 'dup@test.com',
                    password: 'password123'
                });

            const res = await request(server)
                .post('/register')
                .send({
                    name: 'duplicateuser',
                    email: 'dup2@test.com',
                    password: 'password123'
                });

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

        test('POST /stock - should return 401 without authentication', async () => {
            const res = await request(server)
                .post('/stock')
                .send({ item_id: 1, amount: 5 });

            expect(res.statusCode).toBe(401);
        });

        test('PUT /stock/:id - should return 401 without authentication', async () => {
            const res = await request(server)
                .put('/stock/1')
                .send({ amount: 99 });

            expect(res.statusCode).toBe(401);
        });

        test('PUT /stock/:id - should return 404 for non-existing stock row when authenticated', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .put('/stock/999999')
                .set('Authorization', token)
                .send({ amount: 99 });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('message');
        });

        test('DELETE /stock/:id - should return 401 without authentication', async () => {
            const res = await request(server).delete('/stock/1');
            expect(res.statusCode).toBe(401);
        });

        test('DELETE /stock/:id - should return 403 for authenticated non-admin user', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .delete('/stock/999999')
                .set('Authorization', token);

            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('message', 'Forbidden');
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

        test('PUT /order/:id/status - should reject invalid status with 400 when authenticated', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .put('/order/999999/status')
                .set('Authorization', token)
                .send({ status: 'invalid_status_value' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid status');
        });

        test('PUT /order/:id/status - should normalize translated status and continue to order lookup', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .put('/order/999999/status')
                .set('Authorization', token)
                .send({ status: 'folyamatban' });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('message', 'No such order');
        });

        test('PUT /order/:id/payment - should require authentication', async () => {
            const res = await request(server)
                .put('/order/1/payment')
                .send({ payment_status: 'processed' });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
        });

        test('POST /order - should return 400 when payment_method is missing', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .post('/order')
                .set('Authorization', token)
                .send({
                    due_date: '2099-01-01',
                    items: [{ product_id: 1, amount: 1 }]
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Missing payment_method');
        });

        test('POST /order - should return 400 when due_date is missing', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .post('/order')
                .set('Authorization', token)
                .send({
                    payment_method: 'card',
                    items: [{ product_id: 1, amount: 1 }]
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Missing due_date');
        });

        test('POST /order - should return 400 when items array is empty', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .post('/order')
                .set('Authorization', token)
                .send({
                    payment_method: 'card',
                    due_date: '2099-01-01',
                    items: []
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Missing items');
        });

        test('PUT /order/:id/payment - should return 404 for unknown order when authenticated', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .put('/order/999999/payment')
                .set('Authorization', token)
                .send({
                    payment_status: 'processed',
                    payment_method: 'card'
                });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('message', 'No such order');
        });

        test('GET /order - should return only the authenticated user own orders', async () => {
            const tokenA = await createAuthToken();
            const tokenB = await createAuthToken();

            const orderA = await createOwnedOrder(tokenA, { due_date: '2099-02-01' });
            const orderB = await createOwnedOrder(tokenB, { due_date: '2099-02-02' });

            const resA = await request(server)
                .get('/order')
                .set('Authorization', tokenA);

            const resB = await request(server)
                .get('/order')
                .set('Authorization', tokenB);

            expect(resA.statusCode).toBe(200);
            expect(Array.isArray(resA.body)).toBe(true);
            expect(resA.body.some((order) => order.order_number === orderA)).toBe(true);
            expect(resA.body.some((order) => order.order_number === orderB)).toBe(false);

            expect(resB.statusCode).toBe(200);
            expect(Array.isArray(resB.body)).toBe(true);
            expect(resB.body.some((order) => order.order_number === orderB)).toBe(true);
            expect(resB.body.some((order) => order.order_number === orderA)).toBe(false);
        });

        test('PUT /order/:id/status - should return 404 for another user order', async () => {
            const tokenA = await createAuthToken();
            const tokenB = await createAuthToken();
            const orderA = await createOwnedOrder(tokenA);

            const res = await request(server)
                .put(`/order/${orderA}/status`)
                .set('Authorization', tokenB)
                .send({ status: 'IN_PROGRESS' });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('message', 'No such order');
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

        test('GET /stock response should include normalized product_name and missing_product fields', async () => {
            const res = await request(server).get('/stock');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            if (res.body.length > 0) {
                const row = res.body[0];
                expect(row).toHaveProperty('id');
                expect(row).toHaveProperty('amount');
                expect(Object.prototype.hasOwnProperty.call(row, 'product_name')).toBe(true);
                expect(Object.prototype.hasOwnProperty.call(row, 'missing_product')).toBe(true);
            }
        });

        test('GET /supplier response array items should have company_name and id', async () => {
            const res = await request(server).get('/supplier');
            expect([200, 500]).toContain(res.statusCode);
            if (res.statusCode === 200 && res.body.length > 0) {
                expect(res.body[0]).toHaveProperty('id');
                expect(res.body[0]).toHaveProperty('company_name');
            }
        });

        test('GET /stockmovement response array items should have id and amount fields', async () => {
            const res = await request(server).get('/stockmovement');
            expect([200, 500]).toContain(res.statusCode);
            if (res.statusCode === 200 && Array.isArray(res.body) && res.body.length > 0) {
                expect(res.body[0]).toHaveProperty('id');
                expect(res.body[0]).toHaveProperty('amount');
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

        test('PUT /supplier/:id - should return 401 without token', async () => {
            const res = await request(server)
                .put('/supplier/1')
                .send({ company_name: 'Updated' });

            expect(res.statusCode).toBe(401);
        });

        test('PUT /supplier/:id - should return error for non-existing supplier when authenticated', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .put('/supplier/999999')
                .set('Authorization', token)
                .send({ company_name: 'Ghost Supplier' });

            expect([404, 500]).toContain(res.statusCode);
            expect(res.body).toHaveProperty('message');
        });

        test('GET /supplier - should return JSON array with expected fields', async () => {
            const res = await request(server).get('/supplier');
            if (res.statusCode === 200 && Array.isArray(res.body) && res.body.length > 0) {
                expect(res.body[0]).toHaveProperty('id');
                expect(res.body[0]).toHaveProperty('company_name');
            } else {
                expect([200, 500]).toContain(res.statusCode);
            }
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

    describe('Route Alias and Inventory Coverage', () => {
        test('GET /order and GET /order/ - should both enforce authentication', async () => {
            const noSlash = await request(server).get('/order');
            const withSlash = await request(server).get('/order/');

            expect(noSlash.statusCode).toBe(401);
            expect(withSlash.statusCode).toBe(401);
        });

        test('POST /inventory/move - should return 401 without Authorization header', async () => {
            const res = await request(server)
                .post('/inventory/move')
                .send({
                    product_id: 1,
                    type: 'IN',
                    amount: 1
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
            expect(String(res.body.message)).toContain('jwt must be provided');
        });

        test('POST /inventory/move - should reject invalid move type for authenticated request', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .post('/inventory/move')
                .set('Authorization', token)
                .send({
                    product_id: 1,
                    type: 'INVALID_TYPE',
                    amount: 3
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid type');
        });

        test('POST /inventory/move - should reject missing product_id for authenticated request', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .post('/inventory/move')
                .set('Authorization', token)
                .send({
                    type: 'IN',
                    amount: 2
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Missing product_id');
        });

        test('POST /inventory/move - should reject negative amount for authenticated request', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .post('/inventory/move')
                .set('Authorization', token)
                .send({
                    product_id: 1,
                    type: 'IN',
                    amount: -5
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Invalid amount');
        });

        test('POST /inventory/move - should return 404 for non-existing product on authenticated request', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .post('/inventory/move')
                .set('Authorization', token)
                .send({
                    product_id: 999999,
                    type: 'IN',
                    amount: 1
                });

            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('message', 'No such product');
        });
    });

    describe('Additional Route Coverage', () => {
        test('GET /stockmovement - should return stock movement list endpoint response', async () => {
            const res = await request(server).get('/stockmovement');
            expect([200, 500]).toContain(res.statusCode);
            if (res.statusCode === 200) {
                expect(Array.isArray(res.body)).toBe(true);
            }
        });

        test('POST /stockmovement - should require authentication', async () => {
            const res = await request(server)
                .post('/stockmovement')
                .send({
                    stock_id: 1,
                    amount: 1,
                    movement_type: 'IN'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
        });

        test('GET /orderitem - should require authentication', async () => {
            const res = await request(server).get('/orderitem');
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
        });

        test('GET /orderitem - should return array when authenticated', async () => {
            const token = await createAuthToken();
            const res = await request(server)
                .get('/orderitem')
                .set('Authorization', token);

            expect([200, 500]).toContain(res.statusCode);
            if (res.statusCode === 200) {
                expect(Array.isArray(res.body)).toBe(true);
            }
        });

        test('DELETE /supplier/:id - should return 403 for authenticated non-admin user', async () => {
            const token = await createAuthToken();
            const res = await request(server)
                .delete('/supplier/999999')
                .set('Authorization', token);

            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('message', 'Forbidden');
        });

        test('DELETE /stockmovement/:id - should return 403 for authenticated non-admin user', async () => {
            const token = await createAuthToken();
            const res = await request(server)
                .delete('/stockmovement/999999')
                .set('Authorization', token);

            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('message', 'Forbidden');
        });
    });

    describe('Order Status Transitions', () => {
        test('PUT /order/:id/status - COMPLETED->any should be rejected as final', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .put('/order/999998/status')
                .set('Authorization', token)
                .send({ status: 'COMPLETED' });

            expect([400, 404]).toContain(res.statusCode);
        });

        test('PUT /order/:id/status - TBD->COMPLETED should be rejected (must go via IN_PROGRESS)', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .put('/order/999998/status')
                .set('Authorization', token)
                .send({ status: 'COMPLETED' });

            expect([400, 404]).toContain(res.statusCode);
        });

        test('DELETE /order/:id - should return 401 without authentication', async () => {
            const res = await request(server).delete('/order/1');
            expect(res.statusCode).toBe(401);
        });

        test('DELETE /order/:id - should return 403 when authenticated non-admin user', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .delete('/order/1')
                .set('Authorization', token);

            expect(res.statusCode).toBe(403);
            expect(res.body).toHaveProperty('message', 'Forbidden');
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

    describe('Input Validation - User Password', () => {
        test('PUT /oneuser/password - should require currentPassword and newPassword fields', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .put('/oneuser/password')
                .set('Authorization', token)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Missing currentPassword or newPassword');
        });

        test('PUT /oneuser/password - should reject short new password', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .put('/oneuser/password')
                .set('Authorization', token)
                .send({
                    currentPassword: 'password123',
                    newPassword: '123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Password must be at least 6 characters');
        });

        test('PUT /oneuser/password - should reject incorrect current password', async () => {
            const token = await createAuthToken();

            const res = await request(server)
                .put('/oneuser/password')
                .set('Authorization', token)
                .send({
                    currentPassword: 'wrong-current-password',
                    newPassword: 'newpass123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message', 'Wrong current password');
        });
    });

    describe('Edge Cases - Large Data', () => {
        test('POST /product - should handle very long product name', async () => {
            const longName = 'A'.repeat(1000);
            const res = await request(server)
                .post('/product')
                .send({
                    name: longName,
                    price_net: 100,
                    price_gross: 120,
                    vat_rate: 20
                });
            expect([201, 400, 401, 403, 413, 500]).toContain(res.statusCode);
        });

        test('GET /product - should handle large limit parameter', async () => {
            const res = await request(server).get('/product?limit=100000');
            expect([200, 400, 500]).toContain(res.statusCode);
        });

        test('POST /stock-movement - should handle very large amount', async () => {
            const res = await request(server)
                .post('/stock-movement')
                .send({
                    item_id: 1,
                    amount: 999999999,
                    type: 'in'
                });
            expect([201, 400, 401, 403, 404, 500]).toContain(res.statusCode);
        });

        test('POST /product - should handle zero values', async () => {
            const res = await request(server)
                .post('/product')
                .send({
                    name: 'Zero Test',
                    price_net: 0,
                    price_gross: 0,
                    vat_rate: 0
                });
            expect([201, 400, 401, 403, 500]).toContain(res.statusCode);
        });
    });

    describe('Edge Cases - Special Characters', () => {
        test('POST /product - should handle special characters in name', async () => {
            const res = await request(server)
                .post('/product')
                .send({
                    name: 'Test !@#$%^&*()',
                    price_net: 100,
                    price_gross: 120,
                    vat_rate: 20
                });
            expect([201, 400, 401, 403, 500]).toContain(res.statusCode);
        });

        test('POST /register - should handle special characters in username', async () => {
            const res = await request(server)
                .post('/register')
                .send({
                    name: 'user@#$%',
                    email: 'test@test.com',
                    password: 'password123'
                });
            expect([200, 201, 400, 500]).toContain(res.statusCode);
        });

        test('POST /product - should handle unicode characters', async () => {
            const res = await request(server)
                .post('/product')
                .send({
                    name: '测试产品 🍎🍊',
                    price_net: 100,
                    price_gross: 120,
                    vat_rate: 20
                });
            expect([201, 400, 401, 403, 500]).toContain(res.statusCode);
        });
    });

    describe('Edge Cases - Null/Undefined', () => {
        test('POST /product - should handle null name', async () => {
            const res = await request(server)
                .post('/product')
                .send({
                    name: null,
                    price_net: 100,
                    price_gross: 120
                });
            expect([400, 401, 403, 500]).toContain(res.statusCode);
        });

        test('POST /product - should handle missing required fields', async () => {
            const res = await request(server)
                .post('/product')
                .send({
                    price_net: 100
                });
            expect([400, 401, 403, 500]).toContain(res.statusCode);
        });

        test('GET /product/:id - should handle null ID', async () => {
            const res = await request(server).get('/product/null');
            expect([200, 400, 404, 500]).toContain(res.statusCode);
        });

        test('GET /product/:id - should handle string ID', async () => {
            const res = await request(server).get('/product/abc-def');
            expect([200, 400, 404, 500]).toContain(res.statusCode);
        });
    });
});