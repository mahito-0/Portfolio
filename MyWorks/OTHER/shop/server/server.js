const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/sneakerstore');

// Product Model
const Product = mongoose.model('Product', {
  name: String,
  price: Number,
  image: String,
  brand: String,
  category: String,
  stock: Number,
  featured: Boolean
});

// API Endpoints
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).send(product);
});

app.listen(3001, () => console.log('Server running on port 3001'));