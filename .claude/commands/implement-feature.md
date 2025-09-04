
This command helps you add new features to this codebase

$ARGUMENTS

## What this command does

1. **Analyzes the feature request** and determines if it affects frontend, backend, or both
2. **Creates implementation plan** breaking down the feature into manageable tasks
3. **Implements the feature** following Toyota Kata principles
4. **Updates documentation** in the appropriate change log files

## Change Documentation

When implementing features, changes will be automatically documented in:

- **Frontend changes**: Add details to `frontend.md` for any UI/UX updates, component changes, or client-side logic
- **Backend changes**: Add details to `backend.md` for any API updates, data model changes, or server-side logic

## Instructions for Change Documentation

### Frontend Changes (`frontend.md`)
Document any changes that affect:
- React components
- UI/UX updates
- Client-side state management
- Routing changes
- Styling updates
- Frontend dependencies

### Backend Changes (`backend.md`)
Document any changes that affect:
- API endpoints
- Data models/schemas
- Database operations
- Server configuration
- Business logic
- Backend dependencies

## Examples

```bash
/implement-feature "Add user authentication system"
/implement-feature "Create search page to check the store availabilty on the todo date"
/implement-feature "Add ai agent to connect to tavily search to get grounded information"
```