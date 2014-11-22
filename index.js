var express = require("express");
var app = express();
var path = require("path");
var fs = require("fs");

var wordList = require("./wordlist");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: false
}));

function generateWords(num) {
  var gen = [];
  for(var i = 0; i < num; i++) {
    gen.push(wordList[Math.floor(Math.random() * wordList.length)]);
  }
  return gen;
}

// Adds the text and returns 
function addPaste(text) {
  var words = generateWords(2);

  fs.writeFile(path.join(__dirname, "db", words.join("")), text);

  return words.join(" ");
}

app.use(function(req, res, next){
  if (req.is("text/*")) {
    req.text = "";
    req.setEncoding("utf8");
    req.on("data", function(chunk){ req.text += chunk });
    req.on("end", next);
  } else {
    next();
  }
});

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/", function(req, res) {
  if(req.text.substring(0, 5) == "text=")
    req.text = req.text.substring(5);

  var words = addPaste(req.text);
  res.send(words);
});

app.get("/:filename", function(req, res) {
  var fn = req.params.filename;
  fn = fn.replace(/\W/g, "");

  console.log(fn);

  var full = path.join(__dirname, "db", fn);
  if(fs.existsSync(full)) {
    res.set('Content-Type', 'text/plain');
    res.sendFile(full);
    // fs.readFile(full, function(err, data) {
    //   if(err) throw err;
    //   res.send(data);
    // });
  } else {
    res.send("no");
  }
});

var server = app.listen(5000, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Listening at http://%s:%s", host, port);
});
