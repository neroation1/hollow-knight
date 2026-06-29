const { httpServerHandler } = require('cloudflare:node');
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get("/items", async (req, res) => {
    const result = await pool.query("SELECT * FROM items");
    res.json(result.rows);
}); 
app.get("/vendors", async (req, res) => {
    const result = await pool.query("SELECT * FROM vendors");
    res.json(result.rows);
});

app.get("/locations", async (req, res) => {
    const result = await pool.query("SELECT * FROM locations");
    res.json(result.rows);
});

app.get("/vendor_items", async (req, res) => {
    const result = await pool.query("SELECT * FROM vendor_items");
    res.json(result.rows);
});

app.get("/shop_items", async (req, res) => {
    const result = await pool.query(`
        SELECT
            vendors.name AS vendor,
            items.name AS item,
            vendor_items.price,
            vendor_items.currency,
            vendor_items.action_type
        FROM vendor_items
        JOIN vendors
            ON vendor_items.vendor_id = vendors.id
        JOIN items
            ON vendor_items.item_id = items.id;
    `);

    res.json(result.rows);
});

app.get("/shop_items/search", async (req, res) => {
    try {
        const { vendor } = req.query;
        const result = await pool.query(`
            SELECT vendors.name AS vendor, items.name AS item, vendor_items.price
            FROM vendor_items
            JOIN vendors ON vendor_items.vendor_id = vendors.id
            JOIN items ON vendor_items.item_id = items.id
            WHERE vendors.name ILIKE $1
        `, [`%${vendor}%`]);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get("/items/search", async (req, res) => {
    try {
        const { name } = req.query;
        const result = await pool.query(`
            SELECT 
                items.name AS item,
                vendors.name AS vendor,
                locations.name AS location,
                vendor_items.price,
                vendor_items.currency
            FROM vendor_items
            JOIN items ON vendor_items.item_id = items.id
            JOIN vendors ON vendor_items.vendor_id = vendors.id
            JOIN locations ON vendors.location_id = locations.id
            WHERE items.name ILIKE $1
        `, [`%${name}%`]);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:DcEydCuZLXpEFLHaBgsRLJzixsphpOQN@hopper.proxy.rlwy.net:31987/railway'
});
run().catch(console.error);
async function run() {
  await pool.connect();
  const res = await pool.query('SELECT * FROM Items;');
  console.log(res.rows);
}

run_noah().catch(console.error);
async function run_noah() {
  await pool.connect();
  const res = await pool.query('SELECT * FROM vendor_items;');
  console.log(res.rows);
}
run_eurduino().catch(console.error);
async function run_eurduino() {
  await pool.connect();
  const res = await pool.query('SELECT * FROM vendors;');
  console.log(res.rows);
}
run_nero().catch(console.error);
async function run_nero() {
  await pool.connect();
  const res = await pool.query('SELECT * FROM locations;');
  console.log(res.rows);
}
const handler = httpServerHandler({ port: 3000 });

// Cloudflare Module Worker expects a default export
exports.default = handler;
