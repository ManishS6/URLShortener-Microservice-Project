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

const newUrlSchema = new Schema({
  original_url : String,
  short_url : String
});

Url = mongoose.model('Url',newUrlSchema);

const form = (uri,identifier,done)=>{
  var test = new Url({
    complete_url: uri,
    short_url: identifier
  });
  test.save((err,data)=>{
    if(err) return console.error(err);
    console.log(data);
    res.json({
      "complete_url":uri,
      "short_url":identifier
    })
    // done(null,data);
  });
};
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
  res.json({ greeting: 'hello API'   
});
});

// app.get('/api/shorturl/:id',(req,res)=>{
//   let id = req.params.id;
//   console.log(id);
//   (id,done)=>{
//     Url.findOne({short_url: id},
//       (err,data)=>{
//         console.log(data);
//         if(err) return console.error(err);
//         res.json({
//           complete_url: data.complete_url,
//           short_url: id
//         });
//         done(null,data);
//       }
//       )
//   };
// });

app.use(bodyParser.urlencoded({extended:false}));

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
      console.log(identifier);
      // res.redirect(url_posted);
      form(url_posted,identifier);
      /*
        Code to upload the complete_url and the short_url to MongoDB
      */
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

