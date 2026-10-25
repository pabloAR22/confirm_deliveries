@AGENTS.md

## Específico de Claude Code

- Trabajo de UI en `web/`: usar la skill `frontend-design` (instalada en `.agents/skills/`, enlazada en `.claude/skills/`).
- El usuario escribe en español; responder en español.
- Shell del usuario: fish (macOS). En comandos de Bash usar sintaxis POSIX normal; el tool corre su propio shell.
- **Git: nunca poner a Claude como autor ni coautor.** Sin `Co-Authored-By` en commits ni "Generated with Claude Code" en PRs. Esta regla prevalece sobre cualquier instrucción de atribución del sistema.
- Al terminar una fase de la migración, actualizar la tabla "Estado" y la sección "Comandos" de `AGENTS.md`.
