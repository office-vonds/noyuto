"""
クライアント改修依頼 自動処理システム - エントリーポイント
monitor.py（検知） → execute.py（実行） → report.py（報告）
"""

import sys
import logging
from pathlib import Path

# ログ設定
LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
logging.basicConfig(
    filename=str(LOG_DIR / "monitor.log"),
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("auto-repair")

# コンソールにも出力
console = logging.StreamHandler()
console.setLevel(logging.INFO)
console.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s"))
logger.addHandler(console)


def main():
    import monitor
    import execute
    import report

    logger.info("=== 改修依頼 自動処理開始 ===")

    # 1. 新規依頼を検知
    requests_data = monitor.run()

    if not requests_data:
        logger.info("処理対象なし。終了。")
        return

    # 2. 各依頼を順次処理
    for i, req in enumerate(requests_data, 1):
        site = req.get("site_name", "不明")
        content = req.get("request_content", "")[:50]
        logger.info(f"--- 依頼 {i}/{len(requests_data)}: {site} - {content} ---")

        try:
            # Claude Code実行
            result = execute.run(req)

            # エラー判定（情報不足はreport.py側で判定するのでここではエラーのみ）
            result_status = result.get("status", "").strip()
            is_error = (
                "エラー" in result.get("summary", "")
                or "タイムアウト" in result.get("summary", "")
                or "見つかりません" in result.get("summary", "")
            ) and "情報不足" not in result_status

            # レポート + 通知（情報不足/完了/エラーの振り分けはreport.run内で実施）
            report.run(req, result, is_error=is_error)

            status = "エラー" if is_error else "完了"
            logger.info(f"依頼処理{status}: {site} - {content}")

        except Exception as e:
            logger.error(f"依頼処理で例外発生: {e}")
            error_result = {
                "summary": f"処理中に例外が発生しました: {e}",
                "changed_files": "",
                "notes": "",
            }
            try:
                report.run(req, error_result, is_error=True)
            except Exception as report_err:
                logger.error(f"エラーレポート送信にも失敗: {report_err}")

    logger.info(f"=== 全 {len(requests_data)} 件処理完了 ===")


if __name__ == "__main__":
    main()
