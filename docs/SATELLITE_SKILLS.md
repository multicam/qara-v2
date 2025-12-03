# Satellite Skills - Future Ideas

**Date:** December 3, 2025  
**Status:** Reference Only - Do Not Build Yet

---

## ⚠️ Critical Review Notes

### Stop. Don't Build These Yet.

**Current state:** Qara v2 has ~30 lines of code and ~6,500 lines of documentation.

**Before adding ANY skill from this list:**
1. ✅ Phase 1 complete (Router + CLI works)
2. ✅ Phase 2 complete (Research skill works end-to-end)
3. ✅ Used Qara for 10+ real tasks
4. ✅ Identified a SPECIFIC need not met by existing tools

### Most of These Exist Elsewhere

| Skill Idea | Existing Tool | Why Build in Qara? |
|------------|---------------|-------------------|
| Code Generation | Cursor, Windsurf, Claude | ❓ Unclear |
| Git Commits | `git commit -m "$(claude)"` | ❓ Unclear |
| Writing | Claude, ChatGPT | ❓ Unclear |
| Data Analysis | Claude Code Interpreter | ❓ Unclear |
| Meeting Notes | Otter.ai, Claude | ❓ Unclear |

**The question for each skill:** What does Qara add that you can't get by just asking Claude?

---

Based on the original Qara design docs and common AI assistant use cases, here are skills you may have forgotten:

## High-Value Missing Skills

### 1. **Code Generation / Review** 🔥
Already mentioned in registry but no dedicated doc.
```
- GenerateCode → From spec/description
- ReviewCode → Quality, bugs, improvements
- RefactorCode → Improve existing code
- ExplainCode → Documentation/explanation
- GenerateTests → Unit/integration tests
```

### 2. **Git / Commit Messages** 🔥
From original Qara design.
```
- GenerateCommitMessage → From diff
- GenerateChangelog → From commits
- ReviewPR → PR description + review
```

### 3. **Writing / Content** ✍️
Beyond Fabric's summarize.
```
- WriteBlog → Full blog posts
- WriteEmail → Professional emails
- WriteDocumentation → Technical docs
- EditContent → Improve existing writing
- TranslateContent → Multi-language
```

### 4. **Data / Analysis** 📊
```
- AnalyzeData → Insights from CSV/JSON
- GenerateSQL → Natural language to SQL
- ExplainData → Describe dataset
- VisualizationSpec → Chart recommendations
```

### 5. **Meeting / Communication** 📅
```
- ExtractActionItems → From meeting notes
- GenerateAgenda → Meeting prep
- SummarizeMeeting → Meeting recap
- WriteStatusUpdate → Weekly updates
```

### 6. **Learning / Explanation** 🎓
```
- ExplainConcept → ELI5 to expert levels
- CreateStudyGuide → Learning materials
- GenerateQuiz → Test knowledge
- AnalogizeComplex → Explain via analogies
```

### 7. **Planning / Strategy** 🎯
```
- CreateProjectPlan → Tasks, timeline, dependencies
- AnalyzeRisks → Risk assessment
- GenerateRoadmap → Product/feature roadmap
- PrioritizeBacklog → Stack ranking
```

## Already Covered

| Skill | Document |
|-------|----------|
| Research | `RESEARCH_SKILL_*.md` |
| Fabric (summarize, wisdom, claims) | [FABRIC_SKILL_INTEGRATION.md](cci:7://file:///Users/jmbook/qara-v2/docs/FABRIC_SKILL_INTEGRATION.md:0:0-0:0) |
| Prompting | [PROMPTING_SKILL_INTEGRATION.md](cci:7://file:///Users/jmbook/qara-v2/docs/PROMPTING_SKILL_INTEGRATION.md:0:0-0:0) |
| Sales/Pitch | [HORMOZI_PITCH_SKILL_INTEGRATION.md](cci:7://file:///Users/jmbook/qara-v2/docs/HORMOZI_PITCH_SKILL_INTEGRATION.md:0:0-0:0) |
| Frontend Design | [FRONTEND_DESIGN_SKILL_INTEGRATION.md](cci:7://file:///Users/jmbook/qara-v2/docs/FRONTEND_DESIGN_SKILL_INTEGRATION.md:0:0-0:0) |

## Recommendation

**Priority order for new docs:**

| Priority | Skill | Why |
|----------|-------|-----|
| **1** | Code Gen/Review | Core developer use case |
| **2** | Git/Commits | High frequency, easy win |
| **3** | Writing/Content | Broad applicability |
| **4** | Meeting/Action Items | Business productivity |
| **5** | Data Analysis | Technical users |

Want me to create integration documents for any of these? I'd suggest starting with **Code Generation** since it's a core developer skill and pairs well with the Frontend Design skill.
