require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI,{
  useUnifiedTopology:true,
  useNewUrlParser: true
});
let Url;

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url : String,
  short_url : Number
});

Url = mongoose.model('Url',urlSchema);

var bodyParser = require('body-parser');
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(bodyParser.urlencoded({extended:false}));

app.post("/api/shorturl/new",(req,res)=>{
  let url_posted = req.body.url;
  // console.log(url_posted);
  let res1 = url_posted.replace(/^https?:\/\//i,'');
  dns.lookup(res1,(err)=>{
    console.log(err);
    if (err == null) {
      res.redirect(url_posted);
    }
    else {
      res.json({
        "error": 'invalid url'
      });
    }
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

