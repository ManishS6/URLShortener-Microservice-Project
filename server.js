require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI,{
  useUnifiedTopology:true,
  useNewUrlParser: true
});
let Url;

const Schema = mongoose.Schema;

const newUrlSchema = new Schema({
  original_url : String,
  short_url : String
});

Url = mongoose.model('Url',newUrlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API'   
});
});

app.get("/api/shorturl/:id",(req,res)=>{
    let id = req.params.id;
    // console.log(id);
    Url.findOne({
      short_url: id
    },(err,data)=>{
      if(err) return console.error(err);
      res.redirect(data.original_url);
    });
});

app.get("/api/test/:id",(req,res)=>{
    let id = req.params.id;
    // console.log(id);
    Url.findOne({
      short_url: id
    },(err,data)=>{
      if(err) return console.error(err);
      console.log(data);
      // res.redirect(data.original_url);
    });
});

app.use(bodyParser.urlencoded({extended:false}));

// The Following Code works fine !!!

app.post("/api/shorturl/new",(req,res)=>{
  let url_posted = req.body.url;
  // testing if the url had http:// or https://
  if(/^https?:\/\//i.test(url_posted)==false){
    return res.json({
      "error": 'Invalid URL'
    });
  }
  let res1 = url_posted.replace(/^https?:\/\//i,'');
  // using the dns lookup function to check if the url requested for is valid or not
  dns.lookup(res1,(err)=>{
    if (err == null) {
      var ID = function () {
        return Math.random().toString(36).substr(2, 9);
      };
      var identifier = ID(1);
      // console.log(identifier);
      
      Url.findOne({
        original_url: url_posted
      },(err,data)=>{
        if(err) return console.error(err);
        if(data!=null){
          console.log(data);
          return res.json({
            original_url: data.original_url,
            short_url: data.short_url
          })
        } else {
          var test = new Url({
            original_url: url_posted,
            short_url: identifier
          });
          test.save()
              .then(item => {
              res.send("item saved to database");
              })
              .catch(err => {
              res.status(400).send("unable to save to database");
              });
          res.json({
            original_url: url_posted,
            short_url: identifier
          });
        }
      });
    }
    else {
      res.json({
        "error": 'Invalid URL'
      });
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});