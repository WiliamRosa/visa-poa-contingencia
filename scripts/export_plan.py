"""Export the public part of the matrix actions to site/data/plano.json.

Single source of truth: matrix_actions.py feeds both the SES/SP spreadsheet and the public site.
Internal fields (deadline, focal point, status, notes) are not published.
"""
import json
from pathlib import Path

from matrix_actions import ACTIONS

OUT = Path(__file__).resolve().parent.parent / "site" / "data" / "plano.json"

SCENARIOS = [
    ("Mobilização", "Preparação antes das chuvas: cadastros, vistorias prévias, capacitação e materiais."),
    ("Alerta", "Risco de impacto aumentando: equipes de prontidão e orientação reforçada."),
    ("Emergência", "Há danos: inspeções nos abrigos, água, alimentos, doações e serviços atingidos."),
    ("Desmobilização/Recuperação", "Risco em queda: liberação de estabelecimentos, desativação de abrigos e avaliação."),
]


def main() -> None:
    plan = []
    for name, description in SCENARIOS:
        actions = [
            {"acao": a[1], "parceiros": a[3], "frequencia": a[7]}
            for a in ACTIONS
            if a[0] == name
        ]
        plan.append({"cenario": name, "descricao": description, "acoes": actions})
    OUT.write_text(json.dumps({"responsavel": "Vigilância Sanitária de Poá", "cenarios": plan},
                              ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {sum(len(s['acoes']) for s in plan)} actions to {OUT}")


if __name__ == "__main__":
    main()
