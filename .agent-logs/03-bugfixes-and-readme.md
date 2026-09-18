# 03 - Bugfixes & Documentation Pass

## Context
After the final UI polish pass, several rapid iterations and bug fixes were required to finalize the user experience in the generation studio. In the speed of addressing these issues, we momentarily neglected updating the `.agent-logs`. This log serves to document those rapid fixes and the final documentation step.

## Changes Implemented

### 1. Model Selection & Mode Filtering Fixes
- **Issue**: The model dropdown CSS was accidentally removed, and the list was improperly hardcoded, preventing users from selecting image models.
- **Fix**: Restored the `.model-dropdown` CSS styling. Re-added the `Video` and `Image` mode toggle buttons at the top of the sidebar. Selecting a mode now correctly filters the dropdown list, and switching modes intelligently auto-selects the first available model in that category.

### 2. Layout & Scroll Fixes
- **Issue**: The sidebar was too cramped and overlapping, and the user could not scroll down to view their generation history due to `overflow: hidden` on the main page wrapper.
- **Fix**: 
  - Restored Flexbox styling and spacing to the `.mode-toggle` to un-cramp the buttons.
  - Constrained the `.gen-sidebar` to the viewport height using `max-height` and `overflow-y: auto`.
  - Removed global scroll locks and applied `overflow-y: auto` exclusively to the `.gen-main-area` so users can scroll through their history without losing sight of the sidebar controls.

### 3. Generation Engine Robustness (Pollinations AI)
- **Issue**: All image models were producing the same result (or failing) because they were all routing to the generic Pollinations API without a specific model parameter, causing timeouts and credit miscalculations.
- **Fix**: 
  - Mapped our internal image model IDs to distinct Pollinations models (e.g., `gpt-image-2` -> `flux`, `nano-banana-pro` -> `flux-realism`).
  - Increased the timeout ceiling from 60 seconds to 90 seconds to improve reliability under heavy API load.
  - Replaced the placeholder "checkerboard" thumbnail on the model card with a dynamic, lime-accented square featuring the model's initial (e.g., "G" for GPT Image).

### 4. Documentation
- Completely rewrote `README.md` to accurately reflect the completed project scope, features, tech stack, and setup instructions.
