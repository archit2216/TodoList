const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const url="mongodb+srv://architsharma:archit2216@cluster0.apcb9v2.mongodb.net/todolistDB"
const url2="mongodb+srv://architsharma:archit%40c32@cluster0.pmjk5.mongodb.net/todolistDB";
mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
const itemsSchema=new mongoose.Schema({
  name:String
});

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todoList"
});
const item2=new Item({
  name:"Hit the + button to add a new item"
});

const item3=new Item({
  name:"<-- Hit this to delete an item"
});

const defaultitems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List=mongoose.model("List", listSchema);
app.get("/", function(req, res) {
  Item.find({},function(err,founditems){
    if(founditems.length === 0){
      Item.insertMany(defaultitems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Inserted successfully");
        }
      });
      res.redirect("/");
    }
    else{
    res.render("list", {listTitle: "Today", newListItems: founditems});
    }
  });
});
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Deleted item with id: "+checkedItemId);
        res.redirect("/");
      }
    });  
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
 
});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listname=req.body.list;
  const theItem=new Item({
    name: itemName
  });

  if(listname==="Today"){
    theItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listname},function(err,found){
      found.items.push(theItem);
      found.save();
      res.redirect("/"+listname);
    });
  }
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  const list=new List({
    name:customListName,
    items:defaultitems
  });

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultitems
        });

        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  });
  list.save();
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started successfully");
});
