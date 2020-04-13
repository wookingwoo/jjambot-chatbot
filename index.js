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
		var allergyInfo = json_user_data[user_id]['allergy_show'];
		var request_corps = json_user_data[user_id]['corps'];

		console.log('allergyInfo:', allergyInfo);
		console.log(`allergyInfo 타입 => ${typeof allergyInfo}`);

		console.log('request_corps:', request_corps);
		console.log(`request_corps 타입 => ${typeof request_corps}`);

		var response_menu = 'init';
		var response_date = 'init';
		var msg = 'ok';

		var weekday = new Array('일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일');
		var today_name = new Date(request_date).getDay();
		var todayLabel = weekday[today_name];

		response_date = request_date + '-' + todayLabel;
		console.log('response_date:', response_date);

		menu_data = menu_data.replace(/\'/gi, '"'); // '를 "로 모두 전환

		if (allergyInfo == 'off') {
			// 알러지 정보 표시가 "off" 일때
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

		const responseBody = {
			version: '2.0',
			data: {
				meal: response_meal,

				date: response_date,
				corps: response_corps,

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

apiRouter.post('/allergy/onoff', function(req, res) {
	console.log(req.body);

	var user_id = req.body.userRequest.user.id;
	console.log('user_id:', user_id);
	console.log(`user_id 타입 => ${typeof user_id}`);

	var allergy_show = req.body.action.params['onoff'];

	console.log('allergy_show:', allergy_show);
	console.log(`allergy_show 타입 => ${typeof allergy_show}`);

	var fs = require('fs');
	fs.readFile('./user_data/user_data.txt', 'utf8', function(err, data) {
		data = data.replace(/\'/gi, '"'); // '를 "로 모두 전환

		var json_data = JSON.parse(data);

		json_data[user_id]['allergy_show'] = allergy_show;
		console.log('(변경한 사용자 셋팅):', json_data[user_id]);

		var fs = require('fs');
		fs.writeFile('./user_data/user_data.txt', JSON.stringify(json_data), 'utf8', function(err) {
			console.log('user_data.txt 비동기적 파일 쓰기 완료');
		});
	});

	// 	사용자 정보에 알러지 셋팅 값을 allergy_show로 저장/갱신

	if (allergy_show == 'on') {
		var title = '알러지 정보를 나타냈습니다.';
		var description = '이제부터 메뉴에 알러지 정보가 표시됩니다.';
		var imageUrl = 'https://cdn.pixabay.com/photo/2015/03/22/17/45/on-684987_960_720.jpg';
	} else if (allergy_show == 'off') {
		var title = '알러지 정보를 숨겼습니다.';
		var description = '메뉴에 더 이상 알러지 정보가 표시되지 않습니다.';
		var imageUrl = 'https://cdn.pixabay.com/photo/2016/06/26/18/00/icon-1480925_960_720.png';
	}

	var responseBody = {
		version: '2.0',
		template: {
			outputs: [
				{
					carousel: {
						type: 'basicCard',
						items: [
							{
								title: title,
								description: description,
								thumbnail: {
									imageUrl: imageUrl
								},
								buttons: [
									{
										action: 'message',
										label: '알러지 정보 보기',
										messageText: '알러지 정보 보기'
									}
								]
							}
						]
					}
				}
			]
		}
	};

	res.status(200).send(responseBody);
});

app.listen(3000, function() {
	console.log('jjambot menu skill server listening on port 3000!');
});