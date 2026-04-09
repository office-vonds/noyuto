"""
Claude Code実行スクリプト
依頼データをもとにClaude Codeをヘッドレス実行し、結果を返す
"""

import json
import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

CONFIG_PATH = Path(__file__).parent / "config.json"
TIMEOUT_SECONDS = 600  # 10分


def load_config():
    """config.jsonを読み込み"""
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def build_prompt(request_data):
    """Claude Code用のプロンプトを組み立て"""
    return f"""対象サイト: {request_data['site_name']}
改修依頼: {request_data['request_content']}
対象ページ: {request_data['target_url']}

上記の改修を実施してください。

【重要】依頼内容の情報が不足していて改修を実行できない場合は、改修を行わず、以下のフォーマットで報告してください：

## ステータス
情報不足

## 不足情報
（改修に必要だが依頼に含まれていない情報を具体的に列挙）

## 確認事項
（クライアントへの質問事項）

改修を実行できる場合は、実施後に以下のフォーマットで報告してください：

## ステータス
完了

## 実施内容サマリ
（何をどう変更したか）

## 変更ファイル一覧
（ファイルパスのリスト）

## 確認事項
（あれば）
"""


def parse_result(stdout):
    """Claude Codeの出力から結果を構造化"""
    result = {
        "status": "",
        "summary": "",
        "changed_files": "",
        "missing_info": "",
        "notes": "",
        "raw_output": stdout,
    }

    sections = {
        "## ステータス": "status",
        "## 実施内容サマリ": "summary",
        "## 変更ファイル一覧": "changed_files",
        "## 不足情報": "missing_info",
        "## 確認事項": "notes",
    }

    current_key = None
    current_lines = []

    for line in stdout.split("\n"):
        matched = False
        for header, key in sections.items():
            if line.strip().startswith(header):
                if current_key:
                    result[current_key] = "\n".join(current_lines).strip()
                current_key = key
                current_lines = []
                matched = True
                break
        if not matched and current_key is not None:
            current_lines.append(line)

    if current_key:
        result[current_key] = "\n".join(current_lines).strip()

    # パースできなかった場合はraw全体をサマリにする
    if not result["summary"]:
        result["summary"] = stdout[:2000]

    return result


def run(request_data):
    """Claude Codeを実行して結果を返す"""
    config = load_config()
    site_name = request_data["site_name"]

    # サイト設定取得
    site_config = config.get("sites", {}).get(site_name)
    if not site_config:
        logger.warning(f"サイト設定なし: {site_name}、デフォルトディレクトリで実行")
        work_dir = Path.home() / "projects" / "vonds"
    else:
        work_dir = Path(site_config["repo_path"]).expanduser()

    if not work_dir.exists():
        error_msg = f"作業ディレクトリが存在しません: {work_dir}"
        logger.error(error_msg)
        return {"summary": error_msg, "changed_files": "", "notes": "", "raw_output": ""}

    prompt = build_prompt(request_data)
    logger.info(f"Claude Code実行開始: {site_name}")

    try:
        proc = subprocess.run(
            ["claude", "--print", "--dangerously-skip-permissions", "-p", prompt],
            cwd=str(work_dir),
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
        )

        stdout = proc.stdout or ""
        stderr = proc.stderr or ""

        if proc.returncode != 0:
            logger.error(f"Claude Code異常終了 (code={proc.returncode}): {stderr[:500]}")

        logger.info(f"Claude Code実行完了: {site_name} (exit={proc.returncode})")
        result = parse_result(stdout)
        return result

    except subprocess.TimeoutExpired:
        error_msg = f"Claude Codeタイムアウト ({TIMEOUT_SECONDS}秒)"
        logger.error(error_msg)
        return {"summary": error_msg, "changed_files": "", "notes": "", "raw_output": ""}
    except FileNotFoundError:
        error_msg = "claudeコマンドが見つかりません。Claude Codeのインストールを確認してください。"
        logger.error(error_msg)
        return {"summary": error_msg, "changed_files": "", "notes": "", "raw_output": ""}
    except Exception as e:
        error_msg = f"Claude Code実行エラー: {e}"
        logger.error(error_msg)
        return {"summary": error_msg, "changed_files": "", "notes": "", "raw_output": ""}


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        data = json.loads(sys.argv[1])
        result = run(data)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print("使用法: python execute.py '{JSON依頼データ}'")
