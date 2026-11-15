# VISA Poá – Climate contingency (Alto Tietê)

Support material for the sanitary surveillance team (Vigilância Sanitária) of Poá, SP, for the regional
contingency plan for heavy rain, floods and inundations coordinated by GVE VIII / GVS Mogi das Cruzes.

## Contents

| Path | What it is |
|---|---|
| `scripts/matrix_actions.py` | The 30 sanitary surveillance actions (single source of truth) |
| `scripts/fill_matrix.py` | Fills the SES/SP spreadsheet tab by editing its XML, keeping drawings and validations |
| `scripts/export_plan.py` | Exports the public part of the actions to `site/data/plano.json` |
| `site/` | Static public site (Portuguese): emergency numbers, Q&A chat, FAQ and plan summary |
| `site/data/kb.json` | Knowledge base used by the chat; every answer cites its source |
| `docs/roteiro-vistoria-abrigos.md` | Shelter inspection checklist for the team (Portuguese) |
| `docs/referencias.md` | Sources and experiences from other regions |
| `tests/search.test.js` | Chat search tests |
| `matriz/` | Filled spreadsheet (internal, not committed) |

## The chat

The chat does not use a language model. It ranks the curated Q&A entries in `kb.json` by keyword match
(accent-insensitive, light stemming) and returns the approved answer with its source, or suggests related
questions. This keeps public health guidance limited to validated content and needs no server or API key.

To add or change an answer, edit `site/data/kb.json` and run the tests.

## Commands

```bash
# Fill the matrix (template path from the GVE e-mail)
python scripts/fill_matrix.py "<template>.xlsx" "matriz/<output>.xlsx"

# Refresh the public plan data
python scripts/export_plan.py

# Test the chat search
node tests/search.test.js

# Preview the site locally (fetch() needs an HTTP server)
python -m http.server 8000 --directory site
```

## Publishing

`.github/workflows/pages.yml` deploys `site/` to GitHub Pages on push to `main`. The site shows a draft
banner until the content is validated by the municipal sanitary surveillance team; publishing it as an
official municipal channel requires the municipality's approval.
