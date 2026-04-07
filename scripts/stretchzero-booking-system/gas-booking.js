/**
 * ストレッチゼロ 予約管理 Google Apps Script
 *
 * 【セットアップ手順】
 * 1. Googleスプレッドシートを新規作成
 * 2. 拡張機能 → Apps Script を開く
 * 3. このコードを貼り付けて保存
 * 4. initialSetup() を実行（シート構造を自動作成）
 * 5. デプロイ → ウェブアプリ → 全員アクセス可 で公開
 * 6. デプロイURLをWordPress管理画面の「SZ予約連携」に設定
 */

// ===== 定数 =====
const SHEET_NAMES = {
  BOOKINGS: '予約一覧',
  STAFF: '施術者マスタ',
  SCHEDULE: 'スケジュール',
  PAYROLL: '報酬計算',
  SETTINGS: '設定',
};

const STORES = ['甲府上石田店', '甲斐響が丘店', '南アルプス店', '韮崎店'];
const COURSES = ['60分コース', '75分コース', '90分コース', '120分コース', '当日相談する'];
const STATUSES = ['仮予約', '確定', 'キャンセル', '完了', 'ノーショー'];

// ===== Web App エンドポイント =====

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAMES.BOOKINGS);

    // 予約IDを生成（SZ-YYYYMMDD-連番）
    const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd');
    const lastRow = sheet.getLastRow();
    let seq = 1;
    if (lastRow > 1) {
      const lastId = sheet.getRange(lastRow, 1).getValue();
      const match = String(lastId).match(/SZ-\d{8}-(\d+)/);
      if (match && String(lastId).includes(today)) {
        seq = parseInt(match[1]) + 1;
      }
    }
    const bookingId = `SZ-${today}-${String(seq).padStart(3, '0')}`;

    // 行を追加
    sheet.appendRow([
      bookingId,                              // A: 予約ID
      data.timestamp || new Date(),           // B: 受付日時
      data.name || '',                        // C: お名前
      data.furigana || '',                    // D: フリガナ
      data.tel || '',                         // E: 電話番号
      data.email || '',                       // F: メール
      data.store || '',                       // G: 希望店舗
      data.course || '',                      // H: コース
      data.date1 || '', data.time1 || '',     // I,J: 第1希望
      data.date2 || '', data.time2 || '',     // K,L: 第2希望
      data.date3 || '', data.time3 || '',     // M,N: 第3希望
      data.message || '',                     // O: 備考
      data.status || '仮予約',                // P: ステータス
      '',                                     // Q: 担当施術者
      '',                                     // R: 確定日時
      data.source || '自社サイト',            // S: 流入元
      '',                                     // T: メモ
    ]);

    // Slack/LINE通知（オプション）
    // notifyNewBooking(bookingId, data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', bookingId: bookingId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'StretchZero Booking API' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== 初期セットアップ =====

function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- 予約一覧シート ---
  let bookings = ss.getSheetByName(SHEET_NAMES.BOOKINGS) || ss.insertSheet(SHEET_NAMES.BOOKINGS);
  const bookingHeaders = [
    '予約ID', '受付日時', 'お名前', 'フリガナ', '電話番号', 'メール',
    '希望店舗', 'コース', '第1希望日', '第1希望時間', '第2希望日', '第2希望時間',
    '第3希望日', '第3希望時間', '備考', 'ステータス', '担当施術者', '確定日時',
    '流入元', 'メモ'
  ];
  bookings.getRange(1, 1, 1, bookingHeaders.length).setValues([bookingHeaders]);
  bookings.getRange(1, 1, 1, bookingHeaders.length)
    .setBackground('#10394b').setFontColor('#fff').setFontWeight('bold');
  bookings.setFrozenRows(1);

  // ステータス列にドロップダウン
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STATUSES, true).build();
  bookings.getRange('P2:P1000').setDataValidation(statusRule);

  // 店舗列にドロップダウン
  const storeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(STORES, true).build();
  bookings.getRange('G2:G1000').setDataValidation(storeRule);

  // 列幅調整
  bookings.setColumnWidth(1, 140);  // 予約ID
  bookings.setColumnWidth(2, 150);  // 受付日時
  bookings.setColumnWidth(3, 100);  // 名前
  bookings.setColumnWidth(15, 200); // 備考

  // --- 施術者マスタシート ---
  let staff = ss.getSheetByName(SHEET_NAMES.STAFF) || ss.insertSheet(SHEET_NAMES.STAFF);
  const staffHeaders = [
    '施術者ID', '氏名', 'フリガナ', '所属店舗', '雇用形態', '資格',
    '基本報酬（時給/回）', '指名料', '交通費/回', '稼働開始日', 'ステータス', '備考'
  ];
  staff.getRange(1, 1, 1, staffHeaders.length).setValues([staffHeaders]);
  staff.getRange(1, 1, 1, staffHeaders.length)
    .setBackground('#F8742D').setFontColor('#fff').setFontWeight('bold');
  staff.setFrozenRows(1);

  // 雇用形態ドロップダウン
  const typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['正社員', '業務委託', 'パート', 'アルバイト'], true).build();
  staff.getRange('E2:E100').setDataValidation(typeRule);

  // --- スケジュールシート ---
  let schedule = ss.getSheetByName(SHEET_NAMES.SCHEDULE) || ss.insertSheet(SHEET_NAMES.SCHEDULE);
  const schedHeaders = [
    '日付', '施術者', '店舗', '開始時間', '終了時間',
    '予約ID', 'コース', 'ステータス', '備考'
  ];
  schedule.getRange(1, 1, 1, schedHeaders.length).setValues([schedHeaders]);
  schedule.getRange(1, 1, 1, schedHeaders.length)
    .setBackground('#10394b').setFontColor('#fff').setFontWeight('bold');
  schedule.setFrozenRows(1);

  // --- 報酬計算シート ---
  let payroll = ss.getSheetByName(SHEET_NAMES.PAYROLL) || ss.insertSheet(SHEET_NAMES.PAYROLL);
  const payHeaders = [
    '集計月', '施術者ID', '施術者名', '所属店舗', '雇用形態',
    '施術回数', '施術時間（分）', '基本報酬', '指名料合計', '交通費合計',
    '報酬合計', '支払日', '支払済', '備考'
  ];
  payroll.getRange(1, 1, 1, payHeaders.length).setValues([payHeaders]);
  payroll.getRange(1, 1, 1, payHeaders.length)
    .setBackground('#F8742D').setFontColor('#fff').setFontWeight('bold');
  payroll.setFrozenRows(1);

  // --- 設定シート ---
  let settings = ss.getSheetByName(SHEET_NAMES.SETTINGS) || ss.insertSheet(SHEET_NAMES.SETTINGS);
  const settingsData = [
    ['設定項目', '値', '説明'],
    ['営業開始時間', '09:00', '全店舗共通'],
    ['営業終了時間', '22:00', '全店舗共通'],
    ['予約枠間隔（分）', '30', '30分刻み'],
    ['同時予約上限', '1', '施術者1人あたり'],
    ['自動リマインドメール', 'ON', '前日18:00に送信'],
    ['管理者メール', 'info@stretch-zero.com', '通知先'],
    ['転送先メール', 'yuki.nakagomi@sanken-gr.com', 'CC先'],
  ];
  settings.getRange(1, 1, settingsData.length, 3).setValues(settingsData);
  settings.getRange(1, 1, 1, 3)
    .setBackground('#10394b').setFontColor('#fff').setFontWeight('bold');

  // デフォルトシート（Sheet1）を削除
  const defaultSheet = ss.getSheetByName('シート1') || ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  SpreadsheetApp.getUi().alert('初期セットアップ完了！\n\n5つのシートが作成されました。');
}

// ===== 報酬自動計算 =====

function calculatePayroll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const schedule = ss.getSheetByName(SHEET_NAMES.SCHEDULE);
  const staffSheet = ss.getSheetByName(SHEET_NAMES.STAFF);
  const payroll = ss.getSheetByName(SHEET_NAMES.PAYROLL);

  // 対象月を取得（前月）
  const now = new Date();
  const targetMonth = Utilities.formatDate(
    new Date(now.getFullYear(), now.getMonth() - 1, 1), 'Asia/Tokyo', 'yyyy-MM'
  );

  // 施術者マスタを読み込み
  const staffData = staffSheet.getDataRange().getValues();
  const staffMap = {};
  for (let i = 1; i < staffData.length; i++) {
    const row = staffData[i];
    staffMap[row[0]] = { // 施術者ID
      name: row[1],
      store: row[3],
      type: row[4],
      baseRate: row[6] || 0,
      nominationFee: row[7] || 0,
      transportFee: row[8] || 0,
    };
  }

  // スケジュールから対象月の施術を集計
  const schedData = schedule.getDataRange().getValues();
  const summary = {};

  for (let i = 1; i < schedData.length; i++) {
    const row = schedData[i];
    const date = row[0];
    const staffId = row[1];
    const status = row[7];

    if (!date || !staffId) continue;
    const dateStr = Utilities.formatDate(new Date(date), 'Asia/Tokyo', 'yyyy-MM');
    if (dateStr !== targetMonth) continue;
    if (status !== '完了') continue;

    if (!summary[staffId]) {
      summary[staffId] = { count: 0, minutes: 0 };
    }

    summary[staffId].count++;
    // コースから時間を抽出
    const course = String(row[6]);
    const minMatch = course.match(/(\d+)分/);
    if (minMatch) {
      summary[staffId].minutes += parseInt(minMatch[1]);
    }
  }

  // 報酬計算シートに書き込み
  for (const [staffId, data] of Object.entries(summary)) {
    const staff = staffMap[staffId];
    if (!staff) continue;

    const basePayment = data.count * staff.baseRate;
    const nominationTotal = 0; // 指名データは別途管理
    const transportTotal = data.count * staff.transportFee;
    const total = basePayment + nominationTotal + transportTotal;

    payroll.appendRow([
      targetMonth,
      staffId,
      staff.name,
      staff.store,
      staff.type,
      data.count,
      data.minutes,
      basePayment,
      nominationTotal,
      transportTotal,
      total,
      '',  // 支払日
      '',  // 支払済
      '',  // 備考
    ]);
  }

  SpreadsheetApp.getUi().alert(`${targetMonth}の報酬計算が完了しました。`);
}

// ===== 月次トリガー設定 =====

function createMonthlyTrigger() {
  // 毎月1日 9:00 に報酬計算を自動実行
  ScriptApp.newTrigger('calculatePayroll')
    .timeBased()
    .onMonthDay(1)
    .atHour(9)
    .create();

  SpreadsheetApp.getUi().alert('月次報酬計算トリガーを設定しました（毎月1日 9:00）');
}

// ===== ダッシュボード集計 =====

function getDashboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const bookings = ss.getSheetByName(SHEET_NAMES.BOOKINGS);
  const data = bookings.getDataRange().getValues();

  const now = new Date();
  const thisMonth = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy-MM');

  let total = 0, pending = 0, confirmed = 0, completed = 0, cancelled = 0;
  const byStore = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const date = Utilities.formatDate(new Date(row[1]), 'Asia/Tokyo', 'yyyy-MM');
    if (date !== thisMonth) continue;

    total++;
    const status = row[15];
    if (status === '仮予約') pending++;
    else if (status === '確定') confirmed++;
    else if (status === '完了') completed++;
    else if (status === 'キャンセル') cancelled++;

    const store = row[6];
    byStore[store] = (byStore[store] || 0) + 1;
  }

  return { thisMonth, total, pending, confirmed, completed, cancelled, byStore };
}
