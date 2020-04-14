function menuSkill(req, res) {
	
    console.log('\n<req.body 출력> ');
    console.log(req.body);

    var fs = require('fs');

    fs.readFile('./crawler/crawling_data/allCorpsMenu.txt', 'utf8', function(err, menu_data) {
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

        console.log('request_date:', request_date);
        console.log(`request_date 타입 => ${typeof request_date}`);

        var user_id = req.body.userRequest.user.id;

        var fs = require('fs');
        var user_data = fs.readFileSync('./user_data/user_data.txt', 'utf8'); //동기식 파일 읽기

        user_data = user_data.replace(/\'/gi, '"'); // '를 "로 모두 전환
        var json_user_data = JSON.parse(user_data);

        if (json_user_data[user_id] == undefined) {
            // user_data.txt에 해당 사용자의 정보가 없으면 새로 추가해서 다시 읽기
            console.log('사용자 정보가 없어 추가합니다.');

            var fs = require('fs');

            json_user_data[user_id] = {
                alias: '',
                corps: '',
                allergy_show: ''
            };

            var new_user_data = json_user_data;

            fs.writeFileSync('./user_data/user_data.txt', JSON.stringify(new_user_data), 'utf8'); // 동기적 파일 쓰기
            console.log('new user data 동기적 파일 쓰기 완료');

            var fs = require('fs');
            var user_data = fs.readFileSync('./user_data/user_data.txt', 'utf8'); //동기식 파일 읽기

            user_data = user_data.replace(/\'/gi, '"'); // '를 "로 모두 전환
            var json_user_data = JSON.parse(user_data);
        }

        var request_corps = json_user_data[user_id]['corps'];
        var allergyInfo = json_user_data[user_id]['allergy_show'];

        console.log('request_corps:', request_corps);
        console.log(`request_corps 타입 => ${typeof request_corps}`);

        console.log('allergyInfo:', allergyInfo);
        console.log(`allergyInfo 타입 => ${typeof allergyInfo}`);

        if (request_corps != '') {
            // 급양대가 등록되어있을때

            var response_menu = 'init';
            var response_date = 'init';
            var msg = 'ok';

            var weekday = new Array('일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일');
            var today_name = new Date(request_date).getDay();
            var todayLabel = weekday[today_name];

            response_date = request_date + '-' + todayLabel;
            console.log('response_date:', response_date);

            menu_data = menu_data.replace(/\'/gi, '"'); // '를 "로 모두 전환

            if (allergyInfo == 'off' || allergyInfo == '') {
                // 알러지 정보 표시가 "off"이거나 ""일때
                menu_data = menu_data.replace(/\([0-9]\)/gi, ''); // (1자리수)를 공백으로 변환
                menu_data = menu_data.replace(/\([0-9][0-9]\)/gi, ''); // (2자리수)를 공백으로 변환
            }

            var menuJson = JSON.parse(menu_data);

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

            var menu_breakfast = '[아침]\n' + listToString(response_menu, 'breakfast');
            var menu_lunch = '[점심]\n' + listToString(response_menu, 'lunch');
            var menu_dinner = '[저녁]\n' + listToString(response_menu, 'dinner');
            var menu_specialFood = '[부식]\n' + listToString(response_menu, 'specialFood');

            var request_meal_type_list = [];

            if (req.body.action.params['meal_type0'] != undefined) {
                request_meal_type_list.push(req.body.action.params['meal_type0']);
            }

            if (req.body.action.params['meal_type1'] != undefined) {
                request_meal_type_list.push(req.body.action.params['meal_type1']);
            }
            if (req.body.action.params['meal_type2'] != undefined) {
                request_meal_type_list.push(req.body.action.params['meal_type2']);
            }
            if (req.body.action.params['meal_type3'] != undefined) {
                request_meal_type_list.push(req.body.action.params['meal_type3']);
            }

            console.log('request_meal_type_list:', request_meal_type_list);
            console.log(`request_meal_type_list 타입 => ${typeof request_meal_type_list}`);
            console.log('request_meal_type_list 갯수:', request_meal_type_list.length);

            function contains(l, obj) {
                for (var i = 0; i < l.length; i++) {
                    if (l[i] === obj) {
                        return true;
                    }
                }
                return false;
            }

            var response_meal = '오류가 발생하였습니다.[errorcode: nurm0411]\n상담원과의 대화를 통해 문의 바랍니다.';

            if (JSON.stringify(request_meal_type_list) == JSON.stringify(['all'])) {
                response_meal =
                    menu_breakfast +
                    '\n\n' +
                    menu_lunch +
                    '\n\n' +
                    menu_dinner +
                    '\n\n' +
                    menu_specialFood;
            } else {
                response_meal = '';
                if (contains(request_meal_type_list, '아침')) {
                    response_meal += menu_breakfast;
                }
                if (contains(request_meal_type_list, '점심')) {
                    response_meal += '\n\n' + menu_lunch;
                }
                if (contains(request_meal_type_list, '저녁')) {
                    response_meal += '\n\n' + menu_dinner;
                }
                if (contains(request_meal_type_list, '부식')) {
                    response_meal += menu_specialFood;
                } else {
                    response_meal += '\n\n' + menu_specialFood;
                }
            }

            var response_corps;
            if (request_corps == '3foodServiceUnit') {
                response_corps = '3군수지원사령부';
            } else if (request_corps == 'ATC') {
                response_corps = '육훈소';
            } else {
                response_corps = request_corps + '부대';
            }

            // 			console.log(menu_breakfast)

            // 			console.log(menu_lunch)

            // 			console.log(menu_dinner)
            // console.log(menu_specialFood)

            // console.log(response_meal)

            const responseBody = {
                version: '2.0',
                data: {
                    meal: response_meal,

                    date: response_date,
                    corps: response_corps + ' 식단',

                    breakfast: menu_breakfast,
                    lunch: menu_lunch,
                    dinner: menu_dinner,
                    specialFood: menu_specialFood,
                    msg: msg
                }
            };
            res.status(200).send(responseBody);
        } else {
            console.log('부대 설징이 되어있지 않아 부대 설정 안내 메시지를 전송했습니다.');
            const responseBody = {
                version: '2.0',
                data: {
                    msg: '식단을 호출하기 전에 우선 부대 설정을 해주세요.'
                }
            };
            res.status(200).send(responseBody);
        }
    });
	
}
exports.menuSkill(req, res) = menuSkill(req, res);


