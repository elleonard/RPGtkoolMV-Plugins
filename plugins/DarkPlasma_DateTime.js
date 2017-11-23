// DarkPlasma_DateTime
// Copyright (c) 2016 DarkPlasma
// This software is released under the MIT license.
// http://opensource.org/licenses/mit-license.php


/*:
 * @plugindesc スクリプト呼び出しで日時を簡単に扱う
 * @author DarkPlasma
 * @license MIT
 *
 * @help
 * このスクリプトにパラメータ設定はありません
 * MVのイベントエディタ上の条件分岐などで、日時を扱いやすくするためのプラグインです
 * 例えば、isTodaysDate('12/25') とすれば、クリスマスのみ入る分岐を作れます
 * 詳細はコードを読んでいただければわかりますが、使いやすい例を挙げておきます
 *  DarkPlasma.DateTime.betweenDate('01/01', '01/03') : 01/01～01/03の間のみtrue
 *  DarkPlasma.DateTime.isTodaysMonth(8)              : 8月の間のみtrue
 *  DarkPlasma.DateTime.isTodaysDate('12/25')         : 12/25の間のみtrue
 *  DarkPlasma.DateTime.isTodaysDay('水')             : 水曜日のみtrue
 */

 var Imported = Imported || {};
Imported.DarkPlasma_DateTime = true;

var DarkPlasma = DarkPlasma || {};
DarkPlasma.DateTime = DarkPlasma.DateTime || {};

// 現在時刻がdateString1とdateString2の間かどうか
// 引数はjsが日時としてパースできる形式
// yyyy-MM-dd や、 yyyy-MM-dd hh:mm:ss を推奨
DarkPlasma.DateTime.between = function(dateString1, dateString2) {
  var date1 = new Date(dateString1);
  var date2 = new Date(dateString2);
  // 不正な日時が渡されたら問答無用でfalse
  if (isNaN(date1) || isNaN(date2)) {
    return false;
  }
  var dateTime1 = date1.getTime();
  var dateTime2 = date2.getTime();
  var now = new Date().getTime();
  if (dateTime1 > dateTime2) {
    return dateTime2 <= now && now <= dateTime1;
  } else {
    return dateTime1 <= now && now <= dateTime2;
  }
};

// 今日がdateString1とdateString2で指定された日付の間かどうか
// betweenと異なり、入力には MM/dd しか受け付けません（例： 12/25）
DarkPlasma.DateTime.betweenDate = function(dateString1, dateString2) {
  var reg = /([0-1][0-9])\/([0-3][0-9])/g;
  var date1 = reg.exec(dateString1);
  reg = /([0-1][0-9])\/([0-3][0-9])/g;
  var date2 = reg.exec(dateString2);
  // 不正な日付は問答無用でfalse
  if (date1.length != 3 || date2.length != 3) {
    return false;
  }
  var parsed1 = [parseInt(date1[1], 10), parseInt(date1[2], 10)];
  var parsed2 = [parseInt(date2[1], 10), parseInt(date2[2], 10)];
  var today = new Date();
  if (parsed1[0] >= parsed2[0] && parsed1[1] >= parsed2[1]) {
    return parsed2[0] <= today.getMonth()+1 && parsed2[1] <= today.getDate() &&
            today.getMonth()+1 <= parsed1[0] && today.getDate() <= parsed1[1];
  }
  return parsed1[0] <= today.getMonth()+1 && parsed1[1] <= today.getDate() &&
          today.getMonth()+1 <= parsed2[0] && today.getDate() <= parsed2[1];
};

// 現在の日時がdateString以降かどうか
DarkPlasma.DateTime.after = function(dateString) {
  var date = new Date(dateString);
  // 不正な日時が渡されたら問答無用でfalse
  if (isNaN(date)) {
    return false;
  }
  var now = new Date().getTime();
  var dateTime = date.getTime();
  return dateTime <= now;
};

// 現在の日時がdateString以前かどうか
DarkPlasma.DateTime.before = function(dateString) {
  var date = new Date(dateString);
  // 不正な日時が渡されたら問答無用でfalse
  if (isNaN(date)) {
    return false;
  }
  var now = new Date().getTime();
  var dateTime = date.getTime();
  return now <= dateTime;
};

// 今日がdateStringで与えられた日時と同じ日付であるかどうか
// 引数の日付以降の部分は無視される
DarkPlasma.DateTime.isToday = function(dateString) {
  var date = new Date(dateString);
  // 不正な日時が渡されたら問答無用でfalse
  if (isNaN(date)) {
    return false;
  }
  var dateTime = date.setHours(0,0,0,0).getTime();
  var today = new Date().setHours(0,0,0,0).getTime();
  return dateTime === today;
};

// 今日がmonthで指定された月かどうか
DarkPlasma.DateTime.isTodaysMonth = function(month) {
  if (isNaN(month)) {
    return false;
  }
  return month === new Date().getMonth()+1;
};

// 今日がdateStringで指定された日付かどうか
// isTodayと異なり、入力には MM/dd しか受け付けません（例： 12/25）
DarkPlasma.DateTime.isTodaysDate = function(dateString) {
  var reg = /([0-1][0-9])\/([0-3][0-9])/g;
  var date1 = reg.exec(dateString);
  // 不正な日付は問答無用でfalse
  if (date1.length != 3) {
    return false;
  }
  var today = new Date();
  return parseInt(date1[1], 10) === today.getMonth()+1 && 
          parseInt(date1[2], 10) === today.getDate();
};

// 今日がdayで与えられた曜日と同じ曜日であるかどうか
// 曜日には日本語１文字表現または英字3文字表現（先頭のみ大文字）が指定できる
DarkPlasma.DateTime.isTodaysDay = function(day) {
  var weekDayNum = {
    "日": 0, "月": 1, "火": 2, "水": 3, "木": 4, "金": 5, "土": 6,
    "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6
  };
  var dayNum = weekDayNum[day];
  // 不正な曜日が渡されたら問答無用でfalse
  if (!dayNum) {
    return false;
  }
  return new Date().getDay() === dayNum;
};

// 今日の曜日を日本語で取得する
DarkPlasma.DateTime.getDay = function() {
  var weekDay = ["日", "月", "火", "水", "木", "金", "土"];
  return weekDay[new Date().getDay()];
};
