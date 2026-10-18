# Draft requests and role journey verification

## Source and journeys

The journeys were derived from the requested draft workflow and the repository acceptance criteria:

- An employee can save a valid request as a private draft and submit it later.
- A manager cannot read or act on a draft and receives no draft notification.
- After submission, the assigned manager can process the request and the employee sees the result.
- Employees cannot read another employee's protected data, managers remain limited to direct reports, and HR retains company scope.

## RED and GREEN evidence

| Guarantee | Test | RED evidence | GREEN evidence |
| --- | --- | --- | --- |
| Draft stays private until submission | `tests/requests.test.ts` | Draft was returned as `submitted` | Targeted test passes |
| Only the owner can submit a draft | `tests/requests.test.ts` | `submit` was rejected as an unknown action | Targeted test passes |
| Cancelling a draft does not expose it | `tests/requests.test.ts` | Cancelled draft appeared in manager approvals | Targeted test passes |
| Employee, manager, and HR scopes hold through the leave journey | `tests/user-journey.test.ts` | Existing behavior passed before draft implementation | Full suite passes |

## Commands and results

- `node --import tsx --test tests/requests.test.ts tests/user-journey.test.ts`: RED with two expected draft failures, then GREEN.
- `node --import tsx --test tests/requests.test.ts`: RED for cancelled-draft visibility, then GREEN.
- `npm test`: PASS, 183 tests.
- `npm run typecheck`: PASS.
- Changed-file ESLint check: PASS with no errors.
- `npx next build --webpack`: PASS. The default Turbopack build hit an internal child-process failure while processing `app/globals.css`.

## Coverage and known gaps

The repository has no coverage script or browser E2E runner. The added checks exercise the same service layer used by API routes and cover the requested authorization boundaries. Browser interaction remains covered by type checking, linting of changed files, and the production build.
