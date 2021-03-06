var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); //viewsまでのパスを指定
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var methodOverride = require('method-override');
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

//ORマッパー(ObjectRerationMapper)---sequelizeなど
//ER図(エンティティー・リレーション図)を簡単に実現
const db = require('./models/index');

//一覧表示
app.get('/',(req,res)=>{
  db.todo.findAll({}).then((results) => {
    res.render('index.ejs',{todos: results});
  });
});

//追加
app.post('/',(req,res)=>{
  const params = {
    content:req.body.todoContent
  };
  db.todo.create(params).then((results) => {
    res.redirect('/');
  });
});

//削除
app.delete('/:id',(req,res)=>{
  const filter = {
    where:{
      id: req.params.id
    }
  };
  db.todo.destroy(filter).then((results) => {
    res.redirect('/');
  });
});

//編集
app.get('/edit/:id',(req,res)=>{
  db.todo.findByPk(req.params.id).then((results) =>{
    res.render('edit.ejs',{todo:results});
  });
  //urlに含まれたidを持つ要素を探索し、それをedit.ejsでレンダリングする
});

//更新
app.put('/update/:id',(req,res)=>{
  const params = {
    content:req.body.todoContent
  };
  const filter = {
    where:{
      id:req.params.id
    }
  };
  db.todo.update(params,filter).then((results)=>{
    res.redirect('/categories');
  });
  //idを探索する
  //一致するidの要素に対し、edit.ejsで入力された値にアップデートする
});

//一覧表示
app.get('/categories',(req,res)=>{
  db.category.findAll().then ((results)=>{
    res.render('categories/index.ejs',{categories:results});
  });
});

//作成
app.post('/categories',(req,res) =>{
  const params = {
    name: req.body.categoryName
  };
  db.category.create(params).then((results)=>{
    res.redirect('/categories');
  });
});

//削除
app.delete('/categories/:id',(req,res)=>{
  const filter = {
    where:{
      id: req.params.id
    }
  };
  db.category.destroy(filter).then((results) => {
    res.redirect('/categories');
  });
});

//編集
app.get('/categories/edit/:id',(req,res)=>{
  db.category.findByPk(req.params.id).then((results) =>{
    res.render('categories/edit.ejs',{category:results});
  });
  //urlに含まれたidを持つ要素を探索し、それをedit.ejsでレンダリングする
});

//更新
app.put('/categories/update/:id',(req,res)=>{
  const params = {
    name:req.body.categoryName
  };
  const filter = {
    where:{
      id:req.params.id
    }
  };
  db.category.update(params,filter).then((results)=>{
    res.redirect('/categories');
  });
  //idを探索する
  //一致するidの要素に対し、edit.ejsで入力された値にアップデートする
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
