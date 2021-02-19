require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongodb = require('mongodb');
const dns = require('dns');
const bodyParser = require('body-parser');
const uri = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
var mongoose = require('mongoose');
const { RSA_NO_PADDING } = require('constants');
mongoose.connect(uri,{
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

app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API'   
});
});

app.get("/api/shorturl/:id",async (req,res)=>{
    let id = req.params.id;
    try {
      const urlParams = await Url.findOne({
        short_url: id
      })
      if (urlParams){
        return res.redirect(data.original_url);
      } else {
        return res.status(404).json('No URL found');
      }
      
    } catch (err) {
      console.log(err);
      res.status(500).json('Server error');
    }
});

// The Following Code works fine !!!

app.post("/api/shorturl/new",async (req,res)=>{
  let url_posted = req.body.url;
  // testing if the url had http:// or https://
  if(/^https?:\/\//i.test(url_posted)==false){
    return res.json({
      "error": 'Invalid URL'
    });
  }
  let res1 = url_posted.replace(/^https?:\/\//i,'');
  // using the dns lookup function to check if the url requested for is valid or not
  if(res1){
    dns.lookup(res1,async (err,address,family)=>{
      if(err){
        res.json({error: 'invalid URL'});
      } else {
        try {
          let findOne = await Url.findOne({
            original_url: url_posted
          });
          if(findOne){
            res.json({
              original_url: findOne.original_url,
              short_url: findOne.short_url
            })
          } else {
            var identifier = ID(1);
            findOne = new Url({
              original_url: url_posted,
              short_url: identifier
            });
            await findOne.save();
            res.json({
              original_url: findOne.original_url,
              short_url: findOne.short_url
            })
          }
        } catch (err) {
          console.error(err);
          res.status(500).json('Server error...');
        }
      }
    });
  } else {
    res.json({error: 'invalid URL'});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});