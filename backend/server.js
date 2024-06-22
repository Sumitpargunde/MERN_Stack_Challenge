const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/mern_stack_challenge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
});

const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String,
  dateOfSale: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return !isNaN(Date.parse(value));
      },
      message: props => `${props.value} is not a valid date!`
    }
  },
  sold: Boolean,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.get('/api/transactions', async (req, res) => {
  try {
    const { month, page = 1, search = '' } = req.query;
    const query = {
      ...(month && { dateOfSale: { $gte: new Date(`${month}-01`), $lt: new Date(`${+month + 1}-01`) } }),
      ...(search && { title: new RegExp(search, 'i') })
    };
    const transactions = await Transaction.find(query)
      .skip((page - 1) * 10)
      .limit(10);
    const total = await Transaction.countDocuments(query);
    res.json({ transactions, total });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'An error occurred while fetching transactions' });
  }
});

// Handle errors globally
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
