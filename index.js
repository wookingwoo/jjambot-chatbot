const express = require('express');
const app = express();
const logger = require('morgan');
const bodyParser = require('body-parser');

const apiRouter = express.Router();

app.use(logger('dev', {}));
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use('/api', apiRouter);

apiRouter.post('/sayHello', function(req, res) {
    const responseBody = {
        version: '2.0',
        template: {
            outputs: [
                {
                    simpleText: {
                        text: "hello I'm Ryan"
                    }
                }
            ]
        }
    };

    res.status(200).send(responseBody);
});

apiRouter.post('/showHello', function(req, res) {
    console.log(req.body);

    const responseBody = {
        version: '2.0',
        template: {
            outputs: [
                {
                    simpleImage: {
                        imageUrl:
                            'https://t1.daumcdn.net/friends/prod/category/M001_friends_ryan2.jpg',
                        altText: "hello I'm Ryan"
                    }
                }
            ]
        }
    };

    res.status(200).send(responseBody);
});

apiRouter.post('/datatest', function(req, res) {
    const responseBody = {
        version: '2.0',
        data: {
            msg: 'HI',
            name: 'Ryan',
            position: 'Senior Managing Director'
        }
    };

    res.status(200).send(responseBody);
});

apiRouter.post('/crawling_test', function(req, res) {
    console.log(req.body);

    const convert = require('xml-js'); // npm install xml-js request

    const request = require('request');

    var module_api_key = require('./api_key');
    const HOST = module_api_key.HOST;
    const KEY = module_api_key.KEY;
    const TYPE = module_api_key.TYPE;
    const SERVICE = module_api_key.SERVICE;
    const START_INDEX = module_api_key.START_INDEX;
    const END_INDEX = module_api_key.END_INDEX;

    var requestUrl = `${HOST}/${KEY}/${TYPE}/${SERVICE}/${START_INDEX}/${END_INDEX}`;

    var xmlToJson;
    var response_menu = 'init';
    var jsonData;
    var isCrawlingFinished = false;

    request.get(requestUrl, (err, res, body) => {
        if (err) {
            console.log(`err => ${err}`);
        } else {
            if (res.statusCode == 200) {
                var result = body;

                // console.log(`body data => ${result}`)

                xmlToJson = convert.xml2json(result, { compact: true, spaces: 4 }); // compact(데이터 간소화 여부), spaces(들여쓰기 포인트)

                console.log(`xmlToJson 타입 => ${typeof xmlToJson}`);

                // console.log(`xml to json => ${xmlToJson}`)

                jsonData = JSON.parse(xmlToJson);
                console.log(`jsonData 타입 => ${typeof jsonData}`);

                response_menu = jsonData.DS_TB_MNDT_DATEBYMLSVC_5322.row[0];
                console.log(`response_menu 타입 => ${typeof response_menu}`);

                console.log(`json 출력값 => ${JSON.stringify(response_menu)}`);

                isCrawlingFinished = true;
            }
        }
    });
    console.log('1');
    while (true) {
        console.log('2');

        if ((isCrawlingFinished = true)) {
            console.log('3');

            console.log('===========');
            console.log(`json 출력값 => ${JSON.stringify(response_menu)}`);
            console.log('===========');

            const responseBody = {
                version: '2.0',
                data: {
                    msg: 'HI',
                    name: 'Ryan',
                    position: 'Senior Managing Director',
                    menu: response_menu
                }
            };

            res.status(200).send(responseBody);
            console.log('4');

            break;
            console.log('5');
        }
    }

    console.log('***********끝끝끝끝끝끝끝끝끝끝끝끝끝');

    // setTimeout(function() {

    // }, 1000);
});

apiRouter.post('/menu', function(req, res) {
    console.log('\n<req.body 출력> ');
    console.log(req.body);

    var fs = require('fs');

    fs.readFile('./crawler/crawling_data/allCorpsMenu.txt', 'utf8', function(err, data) {
        var today_date = new Date();
        var dd = today_date.getDate();
        var mm = today_date.getMonth() + 1; //January is 0!
        var yyyy = today_date.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        today_date = yyyy + '-' + mm + '-' + dd;
        console.log('today_date:', today_date);

        var request_date = JSON.parse(req.body.action.params.sys_date).date;

        if (request_date == 'null') {
            request_date = today_date;
        }


        console.log('>>>>>>>>>>>>', request_date);
        console.log(`request_date 타입 => ${typeof request_date}`);

        var request_corps = '5322';
        var allergyInfo = false;

        var response_menu = 'init';
        var response_date = 'init';
        var msg = 'ok';

        var weekday = new Array('일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일');
        var today_name = new Date(request_date).getDay();
        var todayLabel = weekday[today_name];

        response_date = request_date + '-' + todayLabel;
        console.log('response_date:', response_date);

        data = data.replace(/\'/gi, '"'); // '를 "로 모두 전환

        if (allergyInfo == false) {
            // 알러지 정보 표시가 false일때
            data = data.replace(/\([0-9]\)/gi, ''); // (1자리수)를 공백으로 변환
            data = data.replace(/\([0-9][0-9]\)/gi, ''); // (2자리수)를 공백으로 변환
        }

        var menuJson = JSON.parse(data);

        var date_code = request_date.replace(/-/gi, '');
        console.log('date_code:', date_code);

        response_menu = menuJson[request_corps][date_code];

        // console.log(response_menu);

        function listToString(dic, key) {
            var str = '';

            for (var i = 0; i < dic[key].length; i++) {
                str += dic[key][i].trim(); //trim()을 이용해 앞뒤 공백 제거

                if (i < dic[key].length - 1) {
                    str += ', \n';
                }
            }
            return str;
        }

        var menu_breakfast = listToString(response_menu, 'breakfast');
        var menu_lunch = listToString(response_menu, 'lunch');
        var menu_dinner = listToString(response_menu, 'dinner');
        var menu_specialFood = listToString(response_menu, 'specialFood');

        const responseBody = {
            version: '2.0',
            data: {
                date: response_date,
                breakfast: menu_breakfast,
                lunch: menu_lunch,
                dinner: menu_dinner,
                specialFood: menu_specialFood,
                msg: msg
            }
        };
        res.status(200).send(responseBody);
    });
});

app.listen(3000, function() {
    console.log('jjambot menu skill server listening on port 3000!');
});