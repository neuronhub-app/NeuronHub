The Task MD file you need to handle: $ARGUMENTS

Read the task-template:
```markdown
@./docs/private/project-management/task-template.md
```

You MUST create the Checklist with the **at least** the 14 items list below. You can only add more items - you can't remove them.

You MUST keep the Checklist below as the single source of truth.

.var {review_and_update_checklists} {review and update the Task MD file checklists}

You MUST always {review_and_update_checklists} to keep it up-to-date.

### Checklist

1. [ ] Use a subagent to think ultra hard about the architecture and {review_and_update_checklists} [#Architecture] - understand domain, grep codebase, identify affected models, services, UI components, etc.
2. [ ] Use a subagent to think ultra hard re how to fully implement it and {review_and_update_checklists} [#Execution Plan].
3. [ ] Prep - run test, document failures (if any)
4. [ ] Prep - add TDD tests, confirm they fail.
5. [ ] Prep - use a subagent to review your tests.
6. [ ] Prep - {review_and_update_checklists} to document the implementation in testable units.
7. [ ] Implement - start writing code to make your tests pass, {review_and_update_checklists} as you do it.
8. [ ] Implement - 25% Checklist progress- use a subagent to {review_and_update_checklists}.
9. [ ] Implement - 50% Checklist progress- use a subagent to {review_and_update_checklists}.
10. [ ] Implement - 75% Checklist progress- use a subagent to {review_and_update_checklists}.
11. [ ] Implement - 100% progress - use a subagent to review your code and think ultra hard whether it meets the Task requirements, {review_and_update_checklists}. Implement fixes if needed.
12. [ ] Use a subagent again, to review your changes and {review_and_update_checklists}.
13. [ ] Think hard about the tradeoffs you made and {review_and_update_checklists}.
14. [ ] Once everything is done - cleanup and minimize the Task file: drop stale notes, redundant info, etc. Writing is for reading, no writing-only shit specs.
