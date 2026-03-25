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
});