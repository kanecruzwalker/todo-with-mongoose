//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose= require("mongoose");
const _ = require("lodash");
require("dotenv").config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


// need to replace connection to connect to atlas mongoDB
// line for local work mongodb://localhost:27017/todolistDB

mongoose.connect("mongodb+srv://admin-kane:" + process.env.CLUSTER_PASSWORD + "@cluster0-eaqaq.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const Schema = mongoose.Schema;

const itemsSchema = {
  name: {
    type: String,
    required: true
  }
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to todolist"
})
const item2 = new Item({
  name: "Hit the + button to add a new item"
})
const item3 = new Item({
  name: "Hit this to delete and item."
})

const defaultItems= [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems, function (err){
        if (err){
           console.log(err);
        }else{
          console.log("Success, Items added to db");
        }
        });
        res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    });

// const day = date.getDate();
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  })

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }


});


app.post("/delete", function(req,res){

  const checkedItemID = req.body.deletedItem
  console.log(checkedItemID);
  const listName = req.body.listName
  console.log(listName);

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("success item deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name : listName},{$pull: {items : {_id:checkedItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }

});

app.get("/:newList", function (req,res){
  const listName = _.capitalize(req.params.newList);

  List.findOne({name: listName}, function(err, foundList){
    if (!err){
      if (!foundList){
        const list = new List({
          name: listName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ listName);
      }else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });


});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}


app.listen(port, function() {
  console.log("Server has starter successfully");
});
