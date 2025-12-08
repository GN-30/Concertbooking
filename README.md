# To-do List (React)

Simple To-do List app built with Create React App. Add tasks, mark them as done, and they will be removed after a short visual confirmation.

**Description:**

- This small app stores a list of tasks in component state and renders them under `src/components`.
- The previous `Delete` action has been replaced by a `Done` button which applies a line-through decoration and then removes the item.

**Behavior note:** Clicking the `Done` button applies a `text-decoration: line-through` to the item and after ~600ms the item is removed from the list. That delay is implemented in `src/components/TodoItem.jsx` (change the timeout there to adjust how long the line-through is visible).

**Prerequisites**

- Node.js (v14+ recommended)
- npm (bundled with Node) or Yarn

**Install**
Run from the project root:

```powershell
npm install
```

**Run (development)**

```powershell
npm start
```

Open `http://localhost:3000` in your browser. This project was scaffolded with Create React App, so the standard CRA scripts are available (see `package.json`).

**Project structure (important files)**

- `src/App.js` — main app component, holds task list state and delete handler.
- `src/components/TodoInput.jsx` — input field and add button.
- `src/components/TodoList.jsx` — renders the list and passes delete callbacks.
- `src/components/TodoItem.jsx` — updated so the `Done` button applies a `.done` class and calls the parent delete handler after a short delay.
- `src/styles.css` — styles including `.todo-text.done { text-decoration: line-through; }` and the `.done-btn` styles.

**How the Done -> Remove flow works**

1. User clicks the `Done` button rendered by `TodoItem`.
2. `TodoItem` sets local `done` state to `true` (adds `.done` class so the line-through is visible).
3. After 600ms `TodoItem` calls the `onDelete` callback passed from the parent (`App`) to remove the item from the list.

If you prefer instant removal without the visual confirmation, change the `setTimeout` delay in `src/components/TodoItem.jsx` or call `onDelete` immediately.

**Development notes**

- To change the delay: edit `src/components/TodoItem.jsx` and update the `setTimeout` value.
- To add a separate Delete button instead of replacing it, restore the original `delete` button and keep `Done` as a separate action.

**Testing**

- Run unit or integration tests with:

```powershell
npm test
```

**Contributing**

- Small, focused PRs are welcome. Describe changes and include a short test case if relevant.

**License**

- This repository does not include a license file. Add one if you plan to share publicly.
