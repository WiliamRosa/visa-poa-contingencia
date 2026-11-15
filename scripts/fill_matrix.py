"""Fill the 'Vigilância Sanitária' tab of the SES/SP matrix by editing the sheet XML in place.

Editing the XML directly (instead of openpyxl) keeps the workbook's drawings, tables and
data validations intact. Usage: python fill_matrix.py <template.xlsx> <output.xlsx>
"""
import math
import re
import sys
import zipfile
from xml.sax.saxutils import escape

from matrix_actions import ACTIONS

SHEET_NAME = "Vigilância Sanitária"
FIRST_ROW = 7
COLS = "BCDEFGHIKL"  # J (Situação) keeps the template's "Não iniciada"
COL_WIDTH = {"B": 21.75, "C": 58, "D": 31, "E": 37, "F": 32, "G": 34, "H": 20, "I": 12, "K": 28, "L": 38}


def sheet_path(z: zipfile.ZipFile) -> str:
    wb = z.read("xl/workbook.xml").decode("utf-8")
    rid = re.search(rf'<sheet name="{SHEET_NAME}"[^>]*r:id="(rId\d+)"', wb).group(1)
    rels = z.read("xl/_rels/workbook.xml.rels").decode("utf-8")
    target = re.search(rf'Id="{rid}"[^>]*Target="([^"]+)"', rels) or re.search(rf'Target="([^"]+)"[^>]*Id="{rid}"', rels)
    return "xl/" + target.group(1).lstrip("/").removeprefix("xl/")


def set_cell(xml: str, ref: str, text: str) -> str:
    pattern = re.compile(rf'<c r="{ref}"( s="\d+")?[^>]*?(?:/>|>.*?</c>)', re.S)
    m = pattern.search(xml)
    assert m, f"cell {ref} not found"
    style = m.group(1) or ""
    new = f'<c r="{ref}"{style} t="inlineStr"><is><t xml:space="preserve">{escape(text)}</t></is></c>'
    return xml[: m.start()] + new + xml[m.end():]


def row_height(values: dict) -> float:
    lines = max(math.ceil(len(v) / max(COL_WIDTH[c] * 0.95, 8)) for c, v in values.items() if v)
    return max(30.95, lines * 15 + 8)


def main(src: str, dst: str) -> None:
    with zipfile.ZipFile(src) as zin:
        path = sheet_path(zin)
        xml = zin.read(path).decode("utf-8")
        for i, action in enumerate(ACTIONS):
            row = FIRST_ROW + i
            cen, acao, r, c, inf, prod, prazo, freq, _sit, focal, obs = action
            values = dict(zip(COLS, (cen, acao, r, c, inf, prod, prazo, freq, focal, obs)))
            for col, val in values.items():
                if val:
                    xml = set_cell(xml, f"{col}{row}", val)
            xml = re.sub(rf'(<row r="{row}"[^>]*?) ht="[\d.]+"', rf'\1 ht="{row_height(values):.2f}"', xml, count=1)
        with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = xml.encode("utf-8") if item.filename == path else zin.read(item.filename)
                zout.writestr(item, data)
    print(f"filled {len(ACTIONS)} rows in {path} -> {dst}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
