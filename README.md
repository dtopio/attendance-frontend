# Attendance Frontend — Training (Day 2 & Day 3)

This is the frontend half of your training. You'll build a Vue 3 app that talks to the Laravel API you built on Day 1.

**Important:** This guide tells you *what* to build and gives you hints. It does **not** give you the code. Read the Vue docs, search when stuck, and ask when truly blocked.

You'll use:

- **Vue 3** with the Composition API (`<script setup>` style)
- **Vite** as the build tool (comes from the Vue scaffold)
- **Tailwind CSS** for styling
- **Axios** for HTTP requests

## A note on UI

**Don't spend time making it pretty.** We're evaluating your understanding of the structure (how Vue components manage state, how they talk to an API, how data flows in and out) — not your visual design skills. A plain table with default-styled buttons is fine. If it works and the code is clean, you've done the job.

That said, if you want to skip writing form/button styling from scratch, you can use **shadcn-vue** — a component library that gives you pre-built buttons, inputs, tables, dialogs, etc. that look professional out of the box. It's optional. Don't get stuck installing it if you're already comfortable with plain Tailwind.

- shadcn-vue docs: <https://www.shadcn-vue.com/>
- If you use it, the install steps are on their site. It works on top of Tailwind, so do the Tailwind step first.

---

## Prerequisites

- Day 1 is complete and your Laravel API is working
- `node -v` shows Node 20 or higher
- `npm -v` works
- You have the empty `attendance-frontend` repo cloned

---

## What you're building

A single-page web app with:

- A **table** showing all attendance records loaded from the API
- A **form** to create new records
- An **Edit** button on each row that loads the record into the form
- A **Delete** button on each row that asks for confirmation, then deletes
- Validation error messages shown next to fields when the API rejects input

It will run on `http://localhost:5173` and call your API at `http://127.0.0.1:8000/api`.

---

# Day 2 — Set up the project and display records

## Step 1 — Scaffold Vue into your empty repo

You're inside your empty cloned folder. Use Vite's create command to scaffold a Vue project **into the current directory** (the same `.` trick as the Laravel side).

Hints:

- The command is `npm create vite@latest`. Search for its arguments
- When it asks about the non-empty directory, choose "Ignore files and continue" so your `.git` folder is preserved
- Pick the Vue template (not Vue + TypeScript — keep it simple for now)
- Don't forget `npm install` afterward

**Checkpoint:** `npm run dev` starts a server and you see the default Vite + Vue page in your browser.

**Commit:** `git add . && git commit -m "Scaffold Vue project"`

---

## Step 2 — Install Tailwind CSS

We're using Tailwind v4, which is much simpler to set up than older versions.

Hints:

- Install two packages: `tailwindcss` and `@tailwindcss/vite` (use `npm install`)
- Open `vite.config.js`. You need to import `tailwindcss` from `@tailwindcss/vite` and add it to the `plugins` array
- Open `src/style.css`. Delete everything in it and add a single line: `@import "tailwindcss";`
- Search the Tailwind docs for "install with Vite" if you get stuck

To verify it works, edit `src/App.vue`. Replace the contents with a tiny test: an `h1` with Tailwind classes like `text-3xl font-bold text-blue-600`. If the heading shows up big, bold, and blue, Tailwind is working.

**Checkpoint:** A heading in `App.vue` renders with Tailwind styling.

---

## Step 3 — Install Axios

Axios is an HTTP client. It's friendlier than the built-in `fetch()` and gives you better error handling.

Hints:

- One `npm install` command. You know the package name.

---

## Step 4 — Create an API helper file

You don't want to type `http://127.0.0.1:8000/api/attendance` everywhere. Create one file that configures axios with a base URL, then import that file wherever you need it.

Hints:

- Create a new file at `src/api.js`
- Look up `axios.create({ baseURL: ... })` in the axios docs
- Set the base URL to `http://127.0.0.1:8000/api`
- Set the default headers to `Accept: application/json` and `Content-Type: application/json`
- Export the configured instance as the default export

Now from any component you can write `import api from './api.js'` and then `api.get('/attendance')`.

**Checkpoint:** The file exists and exports a configured axios instance.

---

## Step 5 — Build the table that displays records

Replace the contents of `src/App.vue`. You're building a component that:

1. On mount, calls the API to load all records
2. Stores the records in a reactive variable
3. Renders them in a table

### State you need

Think about what reactive state the component needs. Hints:

- A list of records (start as an empty array)
- A loading flag (to show a "Loading..." state while the API call is in flight)
- Later, you'll add a form state and an "editing ID" — but you don't need those today

Look up Vue's `ref()` from the Composition API.

### Fetching on mount

You need to run an HTTP request when the component first appears. Look up Vue's `onMounted()` lifecycle hook.

Inside the function you pass to `onMounted`, do an async call to `api.get('/attendance')`. Wrap it in a `try` / `catch` / `finally` so you can:

- Set loading to true before the request
- Save `response.data` to your records list on success
- Show an error (a simple `alert()` is fine for now) on failure
- Set loading to false in the finally block

### The template

Render three states:

- If loading, show a "Loading..." message
- Else if the records array is empty, show an empty-state message ("No records yet")
- Else, render a table with columns: Employee, Date, Check-in, Check-out, Actions

For the rows, use `v-for` to iterate over records. Remember to include a `:key` (the record's `id` is perfect).

For now, the action buttons (Edit, Delete) can exist but be `disabled` — you'll wire them up on Day 3.

Style the table with Tailwind. Some classes that work well:
- `bg-white`, `rounded-lg`, `shadow` on the container
- `w-full` on the table
- `px-4 py-3` for cell padding
- `text-left` for headers, `text-sm font-semibold` for header text
- `divide-y divide-slate-100` on the tbody for row dividers

### Run both servers

You need **both** servers running. Two terminals:

- Terminal 1: backend `php artisan serve`
- Terminal 2: frontend `npm run dev`

Open `http://localhost:5173`. If you created sample records in Postman on Day 1, they should appear in the table.

**Checkpoint:** Records from the database show up in your table.

### If you see a CORS error

Open the browser DevTools (F12), go to the Console tab. If you see something like *"blocked by CORS policy"*, that means your Day 1 CORS config wasn't done correctly. Go back to Day 1, Step 9, and verify it. Restart `php artisan serve` after any change.

**Commit:** `git add . && git commit -m "Display records from API in table"`

---

## End of Day 2

You should have:

- A Vue project styled with Tailwind
- Axios configured with a base URL
- A table that fetches and displays records from the backend
- Both servers running together

---

# Day 3 — Create, Edit, Delete

Today you add the interactive parts.

## Step 6 — Add the form

Add a form section to your page. It can sit below the table as a plain section, **or** you can put it inside a modal dialog that opens when the user clicks a "New Record" button — if you installed shadcn-vue, their `Dialog` component is perfect for this and looks much cleaner than a form always sitting on the page. Pick whichever you prefer; functionality is the same either way.

The form needs four inputs:

- Text input for employee name
- Date input (`<input type="date">`)
- Time input for check-in (`<input type="time">`)
- Time input for check-out (`<input type="time">`)
- A submit button (don't use `<form>` and don't use type="submit" — use a regular button with an `@click`. Forms in single-page apps can be annoying)
- Error message areas under each field for showing validation errors from the API

You'll need new reactive state:

- A form object containing the four field values (use `ref({ employee_name: '', date: '', ... })`)
- An `editingId` ref — `null` when creating, the record's ID when editing
- An `errors` ref — an empty object that you'll fill with API validation errors
- A `submitting` flag so you can disable the button while the request is in flight

Bind each input to the form state with `v-model`. For example: `<input v-model="form.employee_name">`.

### Conditional heading

The form's heading should say "New Record" when `editingId` is null, and "Edit Record" otherwise. Use a Vue expression in the template: `{{ editingId ? 'Edit Record' : 'New Record' }}`.

---

## Step 7 — Wire up Create

When the user clicks the submit button:

1. Set `submitting` to true and clear the previous errors
2. Send a POST request to `/attendance` with the form data
3. On success:
   - Add the returned record to your records list (think: `unshift` vs `push`)
   - Reset the form fields back to empty
4. On failure with status 422:
   - The API returned validation errors. Look at the response shape — Laravel returns `{ errors: { field_name: ["message"] } }`
   - Store those errors in your `errors` ref so the template can display them
5. Set `submitting` back to false (use `finally`)

For each form field, in the template, show the corresponding error message if it exists:

```vue
<p v-if="errors.employee_name" class="text-red-600 text-sm">
  {{ errors.employee_name[0] }}
</p>
```

(The `[0]` is because Laravel returns each field's errors as an array — you usually just want the first message.)

### Test it

- Submit with all fields filled in → record appears in the table
- Submit with the name empty → red error message appears under the name field
- Refresh the page → new record is still there (because it's in the database)

---

## Step 8 — Wire up Edit

When the user clicks the Edit button on a row:

1. Set `editingId` to that record's ID
2. Copy the record's data into the form fields
3. (Nice touch) scroll the page down to the form so the user sees it

Now, the submit button should do *either* create or update depending on whether `editingId` is null:

- If `editingId` is null → POST request to create (you already have this)
- If `editingId` is set → PUT request to `/attendance/{editingId}` to update
- On a successful update, find the record in your list and replace it with the new data
- After update, reset the form and set `editingId` back to null

Also add a **Cancel** button that only appears when editing. It just resets the form.

### Test it

- Click Edit on a row → form fills with that row's data, heading changes
- Change a value, click Update → table updates with the new data
- Click Edit on a row, then click Cancel → form clears, you're back to "New Record"

---

## Step 9 — Wire up Delete

When the user clicks the Delete button on a row:

1. Show a confirmation dialog. The browser's built-in `confirm("Are you sure?")` is fine for now.
2. If confirmed, send a DELETE request to `/attendance/{id}`
3. On success, remove that record from your list (look up array `filter`)
4. On failure, show an alert

### Test it

- Click Delete → confirmation appears
- Click Cancel on the confirmation → nothing happens
- Click OK → record disappears from the table
- Refresh → record is gone for real

---

## Step 10 — Final review

Walk through every flow:

- Create a record
- Edit it (change something)
- Delete it
- Try to create a record with no employee name → see the validation error
- Refresh the page → data persists
- Stop the backend server, try to load records → you see your error message (no white screen of death)

**Commit:** `git add . && git commit -m "Complete CRUD with validation" && git push`

---

## End of Day 3

You have a working full-stack CRUD app. Well done.

---

# Optional Stretch Goals

If you finish early, in order of difficulty:

1. **Search box** — an input above the table that filters records by employee name. Look up Vue's `computed()`.
2. **Sort by date** — clickable column headers that toggle ascending/descending.
3. **Duration column** — calculate hours worked from check-in and check-out times. What do you show when there's no check-out yet?
4. **Loading skeleton** — instead of "Loading..." text, show empty placeholder rows with a Tailwind animation.
5. **Better confirmation dialog** — replace `confirm()` with a styled modal.

---

# Common Problems

**Blank page**
Open DevTools console (F12). Read the error. Usually a typo or missing import.

**"Network Error" in console**
Backend isn't running. Start it with `php artisan serve`.

**CORS error in console**
Day 1 CORS config not done or backend not restarted after editing. Go fix that.

**Form submits but the record doesn't appear**
Open DevTools → Network tab. Find your POST request. What status came back? What's in the response? Common cause: you forgot to add the returned record to the records list, or you're calling the wrong URL.

**`v-model` not working on time/date inputs**
The format Laravel returns (`"09:00:00"`) may not be what the time input expects (`"09:00"`). You might need to trim the seconds when loading a record into the form.

**Validation errors don't show**
Check `error.response.data.errors` in your catch block. Are you checking for status 422 first? Are you assigning to `errors.value` (not `errors`)?

**Edit fills the form but Update creates a new record**
Your submit handler isn't checking `editingId`. The same handler needs different behavior depending on whether `editingId` is null.

---

# What to read

- Vue 3 docs (Composition API): <https://vuejs.org/guide/introduction.html>
- Axios docs: <https://axios-http.com/docs/intro>
- Tailwind CSS docs: <https://tailwindcss.com/docs>

Focus on: Vue's `ref`, `onMounted`, `v-for`, `v-if`, `v-model`, `@click`.

Don't try to read everything — search for what you need when you need it.

Ask when stuck. Good luck.
