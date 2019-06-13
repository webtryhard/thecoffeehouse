var express = require('express');
var exphbs  = require('express-handlebars');
var hbs_sections = require('express-handlebars-sections');
var dateFormat = require('dateformat');
var homeModel = require('./models/home.model');
var path=require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var port = 3000;

var app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded());

require('./middlewares/view-engine')(app);
require('./middlewares/session')(app);
require('./middlewares/passport')(app);

app.use(require('./middlewares/general.mdw'));

app.use(express.static(path.join(__dirname, '/public')));


dateFormat.i18n = {
    dayNames: [
        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
        'Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'
    ],
    monthNames: [],
    timeNames: []
};


app.engine('.hbs', exphbs({
    extname: '.hbs',
    layoutsDir: 'views/layouts',
    partialsDir: 'views/pieces',
    helpers:{
        TimeFormat: val =>{
            return dateFormat(val,'HH:MM');
        },
        DateFormat: val =>{
            return dateFormat(val,'dddd, dd/mm/yyyy');
        },
        DateCmtFormat: val =>{
            return dateFormat(val,'dd/mm/yyyy');
        },
        section: hbs_sections()
    },
    
}));


app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({ extended: true }));
 
app.get('/', function (req, res) {

    var p2 = homeModel.getLatestNews();
    var p3 = homeModel.getTop10Cat();
    var p4 = homeModel.getNewsTop10Cat();
    var p5 = homeModel.getNewsInWeek();

    Promise.all([p2, p3, p4, p5]).then(([rows2, rows3, rows4, rows5]) => {

        var latestNews1 = [rows2[0], rows2[1]];
        var latestNews2 = [];
        
        for(i = 2; i <= 10; i++)
        {
            if(rows2[i])
            latestNews2.push(rows2[i]);
        }
        
        var topCat = [];
        
        for(i = 0; i < 10; i+=2)
        {
            var obj = [];
            obj.push(rows3[i]);
            obj.push(rows3[i + 1])
            var new1 = [];
            var new2 = [];
            for(j = 0; j < rows4.length; j++)
            {
                if(rows4[j].CatID === rows3[i].CatID)
                {
                    new1.push(rows4[j]);
                }

                if(rows4[j].CatID === rows3[i + 1].CatID)
                {
                    new2.push(rows4[j]);
                }
            }
            
            obj.push(new1);
            obj.push(new2);
            topCat.push(obj);
        }

        var newsHotWeek1 = rows5[0] , newsHotWeek2 = [];
        for(i = 1; i < 5; i++)
        {
            if(rows5[i])
            newsHotWeek2.push(rows5[i]);
        }
        
        res.render('home', {
            layout: 'TrangChu.hbs',
            title: 'Trang chủ',
            newsHot : res.newsHot,
            categories : res.categories,
            menu: res.menu,
            latestNews1, latestNews2, topCat, newsHotWeek1, newsHotWeek2, 
            style: ['style1.css', 'style2.css', 'login.css', 'signup.css', 'login-register.css'],
            js: ['jQuery.js', 'js.js', 'login-register.js'],
            logo: 'logo.png'
        });
    })
});

var list=require('./controllers/list.controller');
app.use('/list', list);

var Admin=require('./controllers/admin.controller');
app.use('/Admin', Admin);

var account=require('./controllers/admin/account.controller');
app.use('/account', account);

app.listen(port);
console.log('http://localhost:' + port);

