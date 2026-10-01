import json
import os
import re
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def iter_files(*suffixes: str):
    normalized = {suffix.lower() for suffix in suffixes}
    for directory, _, filenames in os.walk(ROOT):
        for filename in filenames:
            path = Path(directory) / filename
            if not normalized or path.suffix.lower() in normalized:
                yield path


def read_text_retry(path: Path, attempts: int = 5) -> str:
    target = str(path.resolve())
    if os.name == "nt" and not target.startswith("\\\\?\\"):
        target = f"\\\\?\\{target}"
    for attempt in range(attempts):
        try:
            with open(target, "r", encoding="utf-8") as handle:
                return handle.read()
        except FileNotFoundError:
            if attempt == attempts - 1:
                raise
            time.sleep(0.25)
    raise RuntimeError(f"Unable to read {path}")


def validate_notebooks() -> None:
    notebooks = sorted((ROOT / "notebooks").glob("*.ipynb"))
    assert len(notebooks) == 5, f"Expected 5 notebooks, found {len(notebooks)}"
    for notebook_path in notebooks:
        notebook = json.loads(read_text_retry(notebook_path))
        assert notebook["nbformat"] == 4
        for index, cell in enumerate(notebook["cells"], start=1):
            if cell["cell_type"] == "code":
                compile(
                    "".join(cell["source"]),
                    f"{notebook_path.name}:cell-{index}",
                    "exec",
                )


def validate_json() -> None:
    for path in iter_files(".json"):
        json.loads(read_text_retry(path))


def validate_required_files() -> None:
    required = [
        ROOT / "README.md",
        ROOT / "LICENSE",
        ROOT / "solution" / "Admin Monitoring Governance & Adoption.pbip",
        ROOT
        / "solution"
        / "Admin Monitoring Governance & Adoption.Report"
        / "definition.pbir",
        ROOT
        / "solution"
        / "Admin Monitoring Historical Analytics.SemanticModel"
        / "definition.pbism",
    ]
    for path in required:
        assert path.exists(), f"Missing required file: {path}"


def validate_no_private_markers() -> None:
    patterns = [
        re.compile(r"(?i)(gho_|github_pat_|authorization:\s*bearer\s+[a-z0-9._-]+)"),
        re.compile(
            r"(?i)https://app\.powerbi\.com/groups/[0-9a-f]{8}-[0-9a-f-]{27}"
        ),
        re.compile(
            r"(?i)https://onelake\.dfs\.fabric\.microsoft\.com/"
            r"[0-9a-f]{8}-[0-9a-f-]{27}/[0-9a-f]{8}-[0-9a-f-]{27}"
        ),
        re.compile(
            r"(?i)(tenant|workspace|lakehouse|semanticmodel|report|capacity)"
            r"(?:_?id)?\s*[=:]\s*[\"']?[0-9a-f]{8}-[0-9a-f-]{27}"
        ),
        re.compile(
            r"(?i)\b(?!admin@example\.onmicrosoft\.com\b)"
            r"[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b"
        ),
    ]
    suffixes = {".md", ".json", ".tmdl", ".js", ".ipynb", ".pbip", ".pbism", ".py"}
    for path in iter_files(*suffixes):
        if path.resolve() == Path(__file__).resolve():
            continue
        text = read_text_retry(path)
        for pattern in patterns:
            match = pattern.search(text)
            assert match is None, f"Potential private value found in {path}: {match.group(0)}"


if __name__ == "__main__":
    validate_required_files()
    validate_json()
    validate_notebooks()
    validate_no_private_markers()
    print("Solution validation passed.")
