const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    response.status(404).send({ error: "User not found" });
    return;
  }

  request.user = user;
  next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const newUser = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  };

  const user = users.find((user) => user.username === username);

  if (user) {
    response.status(400).send({ error: "Username already exists" });
    return;
  }

  users.push(newUser);

  response.send(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const currentTodoIndex = user.todos.findIndex((todo) => todo.id == id);

  if (currentTodoIndex === -1) {
    response.status(404).send({ error: "Todo not found" });
    return;
  }

  user.todos[currentTodoIndex].title = title;
  user.todos[currentTodoIndex].deadline = deadline;

  response.send(user.todos[currentTodoIndex]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const currentTodoIndex = user.todos.findIndex((todo) => todo.id == id);

  if (currentTodoIndex === -1) {
    response.status(404).send({ error: "Todo not found" });
    return;
  }

  user.todos[currentTodoIndex].done = true;

  response.send(user.todos[currentTodoIndex]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const currentTodoIndex = user.todos.findIndex((todo) => todo.id == id);

  if (currentTodoIndex === -1) {
    response.status(404).send({ error: "Todo not found" });
    return;
  }

  user.todos.splice(currentTodoIndex, 1);

  response.status(204).send();
});

module.exports = app;
