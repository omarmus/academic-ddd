# Protección de la rama main (Branch Protection / Ruleset)

Guía para configurar la rama `main` en GitHub de modo que **solo se pueda hacer merge** cuando pasen los tests (unitarios y e2e) y, opcionalmente, cuando haya code review. Así se evitan merges con código roto y se alinea con el uso del CI en este proyecto.

---

## 1. Dónde configurarlo

- **Rulesets (recomendado):** Repo → **Settings** → **Rules** → **Rulesets** → **New ruleset** (o editar uno existente).
- **Reglas clásicas:** Repo → **Settings** → **Branches** → **Add branch protection rule** (o **Add rule** si usas Rulesets en modo “Branch rules”).

En ambos casos el objetivo es: aplicar reglas a la rama `main` (o al patrón que elijas).

---

## 2. Información básica del rule / ruleset

| Campo | Valor |
|-------|--------|
| **Rule name** | Protect main branch (o el nombre que prefieras) |
| **Target branches** | `main` (o patrón, ej. `main`) |
| **Enforcement** | **Active** (no Disabled) |

Opcional: **Bypass list** — si quieres que solo los administradores puedan hacer merge sin esperar checks, añádelos como bypass actors.

---

## 3. Reglas a habilitar

### A. Require status checks to pass before merging

Obliga a que los workflows de GitHub Actions pasen antes de poder hacer merge.

1. Activa **Require status checks to pass before merging** (o “Require status checks to pass”).
2. En **Status checks** / **Required status checks**, busca y marca los que corresponden al workflow **CI** de este repo:
   - **Tests unitarios** (job `test-unit`, name: "Tests unitarios")
   - **Tests e2e (Playwright)** (job `test-e2e`, name: "Tests e2e (Playwright)")

Los nombres que ves en GitHub son los `name:` de cada job en [.github/workflows/ci.yml](../.github/workflows/ci.yml). Si no aparecen en el desplegable, haz un push o un PR a `main` y espera a que el workflow se ejecute al menos una vez; después se listarán.

### B. Require branches to be up to date before merging

Exige que la rama del PR esté actualizada con `main` antes del merge (vuelve a ejecutar el CI con el último `main`).

- Activa **Require branches to be up to date before merging**.

Recomendado para evitar merges con base desactualizada y asegurar que los tests corran contra el estado actual de `main`.

### C. Require a pull request before merging (recomendado)

Evita pushes directos a `main` y obliga a usar pull requests.

- Activa **Require a pull request before merging**.
- Opcional: **Required approvals** — ej. 1 (o 2) para exigir code review.

### D. Dismiss stale pull request approvals when new commits are pushed

Si exiges aprobaciones, conviene activar esta opción para que, al hacer push de nuevos commits en el PR, las aprobaciones previas se descarten y haya que volver a aprobar.

- Activa **Dismiss stale pull request approvals when new commits are pushed**.

---

## 4. Resumen visual (referencia)

```
Rule name:     Protect main branch
Target:        main
Enforcement:  Active

Pull request:
  ☑ Require a pull request before merging
  ☑ Require approvals: 1 (o 2)
  ☑ Dismiss stale pull request approvals when new commits are pushed

Status checks:
  ☑ Require status checks to pass before merging
  ☑ Require branches to be up to date before merging

Required status checks (seleccionar en el desplegable):
  • Tests unitarios
  • Tests e2e (Playwright)
```

---

## 5. Cómo se usa en este proyecto

- **Workflow CI:** [.github/workflows/ci.yml](../.github/workflows/ci.yml)  
  Se ejecuta en **push** y en **pull requests** hacia `main`.

- **Jobs:**
  1. **Tests unitarios** — tests de `packages/backend` y `packages/frontend`.
  2. **Tests e2e (Playwright)** — arranca backend + frontend + PostgreSQL en el runner, ejecuta Playwright (Chromium). Solo corre si “Tests unitarios” pasa.

- **Flujo típico:**
  1. Creas una rama, haces cambios y abres un **Pull Request** a `main`.
  2. GitHub ejecuta el workflow **CI** y muestra el estado de “Tests unitarios” y “Tests e2e (Playwright)” en el PR.
  3. Con la protección activa, **no podrás hacer merge** hasta que ambos checks estén en verde (y, si lo configuraste, hasta que haya aprobaciones y la rama esté actualizada).
  4. Cuando todo pasa y se cumple la regla, se hace merge a `main`. Los despliegues (Vercel, App Platform, etc.) suelen dispararse desde `main`, así que solo se despliega código que pasó los tests.

---

## 6. Solución de problemas

- **No aparecen “Tests unitarios” ni “Tests e2e (Playwright)” en Required status checks:**  
  Ejecuta el CI al menos una vez (por ejemplo abriendo un PR o haciendo push a una rama con PR abierto a `main`). Después deberían listarse.

- **Merge bloqueado aunque el CI pasó:**  
  Comprueba que hayas seleccionado exactamente esos dos checks como requeridos y que la rama esté actualizada con `main` (botón “Update branch” si aplica).

- **Quieres hacer merge de emergencia sin esperar CI:**  
  Solo podrás si tienes permisos de bypass (p. ej. administrador y configurado en la regla). En ese caso úsalo con criterio.

---

## 7. Enlaces

- [About branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/managing-a-branch-protection-rule) (documentación clásica).
- [Using rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) (Rulesets).
- Workflow de CI de este repo: [.github/workflows/ci.yml](../.github/workflows/ci.yml).
