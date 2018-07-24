const express = require("express"),
  bodyParser = require("body-parser"),
  morgan = require("morgan"),
  cors = require("cors"),
  mongoose = require("mongoose"),
  port = process.env.PORT || 3000;

app = express();

app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/vue_todos");

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Mongo DB connection successfull");
  let todoSchema = mongoose.Schema({
    name: String,
    start: Date,
    end: Date,
    venue: String,
    created: Date,
    due: Boolean
  });
  let Todo = mongoose.model("Todo", todoSchema);
  // todo = new Todo();

  app.post("/todo", (req, res) => {
    let data = req.body;
    let todo = new Todo({
      name: data.name,
      venue: data.venue,
      start: data.due[0],
      end: data.due[1],
      created: new Date().toUTCString(),
      updated: new Date().toUTCString(),
      due: false
    });
    todo.save((err) => {
      if (err) {
        res.send({
          'status': 'error',
          'message': 'Error! Please try again'
        });
      }
      res.send({
        'status': 'success',
        'todo': todo
      });
    });
  });

  app.get("/todos", (req, res) => {
    Todo.find((err, todos) => {
      if (err) res.send({
        'status': 'error',
        'message': "Error while fetching todos"
      });
      res.send(todos);
    });
  });
  app.post("/todo/update/:id", (req, res) => {
    let id = req.params.id;
    let data = req.body;
    Todo.findByIdAndUpdate(id, {
      name: data.name,
      venue: data.venue,
      start: data.due[0],
      end: data.due[1],
      updated: new Date().toUTCString()
    }, (err, info) => {
      if (err) {
        res.send({
          status: 'error',
          message: 'Error occured while updating todo'
        });
      }
      Todo.findById(id, (err, todo) => {
        res.send({
          status: 'success',
          message: 'Todo updated successfully',
          todo: todo
        });
      });
      
    });
  });
  app.post("/todo/done/:id", (req, res) => {
    let id = req.params.id;
    let data = req.body;
    Todo.findByIdAndUpdate(id, {due: true}, (err, info) => {
      if (err) {
        res.send({
          status: 'error',
          message: 'Error occured while updating todo'
        });
      }
      Todo.findById(id, (err, todo) => {
        res.send({
          status: 'success',
          message: 'Todo successfully marked as done!',
          todo: todo
        });
      });
      
    });
  });
  app.post("/todo/delete", (req, res) => {
    console.log(res.body);
    let id = req.body.id;
    if (id) {
      Todo.findByIdAndDelete(id, (err, data) => {
        if (err) throw err;
        res.send({
          'status': 'success',
          'message': "Entry deleted successfully!",
          'data': data
        });
      });
    } else {
      res.send({
        'status': 'error',
        'message': "Error searching api"
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server started: 127.0.0.1:${port}`);
});