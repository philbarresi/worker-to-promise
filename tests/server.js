var express = require("express"),
    path = require('path');

var app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(3000, function () {
    console.log("go to http://localhost:3000");
})