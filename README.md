# Student Management System (CRUD Web Application)

**Author:** PRATHOSH  
**Registration Number:** [YOUR REG NO]  
**Department:** AI&DS  
**Institution:** ERODE SENGUNTHAR ENGINEERING COLLEGE  
**Academic Year:** 2026  

---

## 1. Project Overview & Features

I developed this Student Management System as a responsive single-page web application to perform full Create, Read, Update, and Delete (CRUD) operations on student records with persistent client-side storage. The project eliminates the complexity of external backend servers or third-party frameworks by utilizing native web standards: HTML5, CSS3, and modern vanilla JavaScript (ES6+), with browser `localStorage` as the persistent data engine.

### Core Features

1. **Create (Enrollment)**
   - Form inputs: Roll Number, Full Name, Email Address, Phone Number, Department, CGPA, and Admission Date.
   - Comprehensive client-side validation:
     - Mandatory field enforcement.
     - Email pattern check (`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`).
     - Phone validation (strictly 10 digits).
     - CGPA validation (numeric range between 0.00 and 10.00).
     - Uniqueness check for Roll Numbers (prevents duplicates).
   - Real-time inline red error messages directly below invalid fields.
   - Dynamic Department Selector: Standard departments (*Computer Science, Information Technology, Electronics & Communication, Mechanical Engineering, Civil Engineering*) plus an **"Other"** option that unveils a custom department text input with minimum 2-character validation.
   - Instant feedback with animated success toast notifications.

2. **Read (Data Presentation & Retrieval)**
   - Responsive, clean table displaying all enrolled student records.
   - Pre-populated with 6 realistic student seed records on first launch.
   - Real-time search by student name, roll number, or email address with an instant clear button.
   - Dynamic department filter dropdown that automatically detects and includes custom departments typed via the "Other" option.
   - Multi-column two-way sorting (Roll No, Name, Department, CGPA) with directional indicators (`↑`, `↓`, `↕`).
   - Clean client-side pagination (10 records per page) with page numbers, Previous/Next navigation, and dynamic record counters.
   - Instant summary metric cards: *Total Students*, *Active Departments*, and *Average CGPA* that update automatically on every data change.
   - Friendly empty state when no matching records are found.

3. **Update (Editing Records)**
   - Seamless inline edit trigger: Clicking "Edit" populates the student's data into the form.
   - Dynamic mode switching: Form title updates to "Edit Student Details", action button transforms to "Update Student", and a "Cancel" button appears.
   - Smart custom department prefill: If a student belongs to a custom department, the dropdown automatically selects "Other" and pre-fills the custom input field.
   - Reusable validation: Duplicate roll number check ignores the student currently being edited.
   - Smooth auto-scroll brings the form into focus.

4. **Delete (Safe Removal)**
   - Safe deletion via an accessible confirmation modal dialog displaying the target student's name and roll number.
   - Instant UI synchronization: updates table rows, summary metric cards, pagination, and department filter.
   - Automatic cleanup: If a deleted student was the only record in a custom department, that custom department is automatically removed from the filter dropdown.

5. **Additional Utilities**
   - **Export to CSV**: Exports the complete student database from `localStorage` into a timestamped file (`student_records_YYYY-MM-DD.csv`), with CSV escaping for special characters.
   - **Dark / Light Theme Toggle**: Seamless visual theme switching with persistence in `localStorage`.
   - **Cross-Site Scripting (XSS) Prevention**: All user inputs are sanitized with HTML entity escaping before rendering to the DOM.
   - **Toast Notification Engine**: Animated floating notifications for add, edit, delete, and export operations.

---

## 2. Folder Structure & How to Run

### Project Directory Structure

```text
student-management-system/
│
├── index.html          # Semantic HTML5 markup, accessible forms, tables, and modal
├── style.css           # Modern CSS3 styles, CSS variables, light/dark theme, responsive grid
├── script.js           # Vanilla ES6+ application logic, CRUD handlers, validation, storage
├── README.md           # Documentation, viva questions, and academic project report
└── screenshots/        # Test execution verification screenshots (10 test steps)
    ├── step-01-validation-errors.png
    ├── step-02-add-student.png
    ├── step-03-custom-department-data-science.png
    ├── step-04-search-filter-sorting.png
    ├── step-05-edit-prefill-update.png
    ├── step-06-delete-confirmation.png
    ├── step-07-export-csv.png
    ├── step-08-dark-mode-persisted.png
    ├── step-09-data-persistence-refresh.png
    └── step-10-pagination.png
```

### How to Run the Application

#### Method 1: Local HTTP Server (Recommended)
Running through an HTTP server ensures optimal browser security compatibility for Blob downloads, local storage, and media:
1. Open a terminal or command prompt inside the project folder:
   ```bash
   cd student-management-system
   ```
2. Start Python's built-in HTTP server:
   ```bash
   python -m http.server 8000
   ```
3. Open your web browser and navigate to:
   ```text
   http://localhost:8000
   ```

#### Method 2: Direct File Execution
You can also launch the application directly without installing any web server:
- Double-click `index.html` in your file explorer, or right-click `index.html` and select **Open with -> Google Chrome / Microsoft Edge / Mozilla Firefox**.

---

## 3. How Each CRUD Operation Works in Code

The codebase is organized into small, well-named functions to make viva explanation straightforward:

### 1. Create Operation
- **Form Submission Listener:** Attached in `setupEventListeners()`. When the user clicks "Add Student", it intercepts the `submit` event, calls `preventDefault()`, and triggers `validateForm()`.
- **Validation Logic (`validateForm()`):** Inspects input fields against validation rules. If an error is detected, `setFieldError()` is called with an inline error message and `.input-error` class, returning `false`.
- **Creation Handler (`createStudent(studentData)`):**
  1. Generates a unique record identifier via `generateId()`.
  2. Creates a new student object, trimming string fields and parsing CGPA to a float.
  3. Prepend the record to the `students` array using `students.unshift(newStudent)`.
  4. Persists the updated array to browser storage via `saveStudentsToStorage()`.
  5. Clears the form via `resetForm()`.
  6. Re-renders the entire application view via `renderApp()`.
  7. Displays a green success toast via `showToast()`.

### 2. Read Operation
- **Storage Retrieval (`loadStudentsFromStorage()`):** Reads `localStorage.getItem('sms_students_data')`. If empty or null, it seeds the initial 6 sample students (`SEED_STUDENTS`) and saves them.
- **Master Render Controller (`renderApp()`):** Calls `updateSummaryCards()`, `updateDepartmentFilterOptions()`, and `renderStudentsTable()`.
- **Summary Metrics Calculation (`updateSummaryCards()`):**
  - Total Students: `students.length`.
  - Active Departments: Calculated using `new Set(students.map(s => s.department)).size`.
  - Average CGPA: Sums CGPAs using `Array.prototype.reduce()` and divides by total count, formatted to 2 decimals via `.toFixed(2)`.
- **Dynamic Filter Rebuilding (`updateDepartmentFilterOptions()`):** Gathers standard departments and unique custom departments present in student records, rebuilding `<option>` tags in `#deptFilterSelect`.
- **Data Filtering & Sorting (`renderStudentsTable()`):**
  1. Filters records matching `searchFilter` against `rollNo`, `name`, and `email`.
  2. Applies `departmentFilter`.
  3. Sorts records by `sortColumn` and `sortDirection` (numeric sort for CGPA, `localeCompare` for text fields).
  4. Slices the array for the active page based on `RECORDS_PER_PAGE = 10`.
  5. Dynamically constructs `<tr>` and `<td>` elements, escaping all content with `escapeHTML()`.
  6. Updates pagination buttons and indicators via `renderPaginationControls()`.

### 3. Update Operation
- **Edit Trigger (`startEditStudent(studentId)`):**
  1. Finds the student in `students` by ID.
  2. Sets `editingStudentId = student.id`.
  3. Pre-fills form fields with the student's existing values.
  4. Checks if the department is standard. If custom, selects "Other", reveals the custom department container, and pre-fills `#customDeptName`.
  5. Updates UI headings to "Edit Student Details", changes button text to "Update Student", and displays the "Cancel" button.
- **Saving Updates (`updateStudent(studentData)`):**
  1. Locates the index of `editingStudentId` in the `students` array.
  2. Updates the object attributes in place.
  3. Saves changes via `saveStudentsToStorage()`.
  4. Resets form back to create mode via `resetForm()`.
  5. Re-renders the application and displays a toast notification.
- **Cancellation (`resetForm()`):** Reverts `editingStudentId` to `null`, hides custom inputs, clears error messages, and restores the "Add New Student" heading.

### 4. Delete Operation
- **Modal Opening (`openDeleteModal(studentId)`):** Stores target student ID in `deleteTargetId`, injects the student's name and roll number into modal confirmation text, and adds the `.show` class to `#deleteModal`.
- **Confirmation (`confirmDeleteStudent()`):**
  1. Filters out the student whose `id === deleteTargetId`.
  2. Saves updated array to storage via `saveStudentsToStorage()`.
  3. If the student being deleted was currently loaded in the form for editing, calls `resetForm()`.
  4. Closes the modal via `closeDeleteModal()`.
  5. Re-renders the application via `renderApp()` (which automatically prunes unused custom departments from the filter dropdown).
  6. Emits a danger toast notification informing the user of successful deletion.

---

## 4. 15 Viva Questions with Detailed Answers

### Q1. What does CRUD stand for, and how is it implemented in this project?
**Answer:** CRUD stands for **Create, Read, Update, and Delete**. In this project:
- **Create:** Implemented via the HTML input form and JavaScript `createStudent()` function.
- **Read:** Implemented by `renderStudentsTable()`, live search filtering, and summary cards.
- **Update:** Implemented by `startEditStudent()` (pre-filling data) and `updateStudent()` (saving edits).
- **Delete:** Implemented via `openDeleteModal()` and `confirmDeleteStudent()`.

### Q2. How is data persisted without a backend server or database?
**Answer:** Data persistence is achieved using the browser's native `localStorage` API under the key `'sms_students_data'`. JavaScript converts the in-memory array of student objects into a JSON string using `JSON.stringify()` when saving, and parses it back into an array using `JSON.parse()` when the application loads.

### Q3. What is the difference between `localStorage` and `sessionStorage`?
**Answer:** Both are Web Storage APIs that store key-value pairs in the browser:
- `localStorage` has no expiration date; data persists even after closing the browser window or restarting the computer.
- `sessionStorage` persists only for the duration of the page session (as long as the browser tab remains open); closing the tab deletes all stored data.

### Q4. How does the application handle duplicate Roll Numbers?
**Answer:** Inside `validateForm()`, the code queries the `students` array using `Array.prototype.some()`. In Create mode, it checks if any student already possesses the typed roll number (case-insensitive). In Update mode, it ignores the student currently being edited by comparing IDs (`s.id !== editingStudentId`).

### Q5. How does the dynamic "Other" Department feature work?
**Answer:** When the department dropdown changes to "Other", an event listener sets `#customDeptGroup.style.display = 'block'`. During validation, if "Other" is chosen, the system validates the custom text input (minimum 2 characters). The custom string is stored as the student's department. Whenever `updateDepartmentFilterOptions()` runs, it checks all distinct departments present in the students array and adds them to the filter dropdown. When no student uses that department anymore, it automatically disappears from the filter dropdown.

### Q6. How is Cross-Site Scripting (XSS) prevented in this application?
**Answer:** By using the custom utility function `escapeHTML()`. Before any user-provided string is rendered inside an HTML template literal, `escapeHTML()` converts characters like `&`, `<`, `>`, `"`, and `'` into their respective HTML entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#039;`). This prevents attackers from injecting and executing malicious `<script>` tags or inline JavaScript.

### Q7. How does live search filtering work in real time?
**Answer:** An `input` event listener is attached to `#searchInput`. Every time the user types or deletes a character, the handler updates `searchFilter`, resets `currentPage = 1`, and calls `renderStudentsTable()`. The table filtering logic runs `Array.prototype.filter()` matching the query against `rollNo`, `name`, and `email` using `.toLowerCase().includes()`.

### Q8. How does multi-column sorting work?
**Answer:** Each sortable table header has a `data-sort` attribute (e.g., `rollNo`, `name`, `department`, `cgpa`). When clicked:
1. If clicking the currently active sort column, `sortDirection` toggles between `'asc'` and `'desc'`.
2. If clicking a new column, `sortColumn` changes to that column and `sortDirection` defaults to `'asc'`.
3. For numeric values like CGPA, it compares numbers using subtraction (`a - b`). For text fields, it uses `String.prototype.localeCompare()` with numeric sensitivity.

### Q9. How is pagination calculated in JavaScript?
**Answer:**
- Total pages: `Math.ceil(totalFilteredRecords / RECORDS_PER_PAGE)` (where `RECORDS_PER_PAGE = 10`).
- Start Index: `(currentPage - 1) * RECORDS_PER_PAGE`.
- End Index: `Math.min(startIndex + RECORDS_PER_PAGE, totalFilteredRecords)`.
- Sliced records for display: `filtered.slice(startIndex, endIndex)`.
- If filtered records shrink (e.g. after search or deletion) such that `currentPage > totalPages`, `currentPage` is automatically clamped to `totalPages`.

### Q10. How does the CSV Export feature generate a downloadable file without a server?
**Answer:**
1. It reads all student records from `students` (the complete `localStorage` dataset).
2. It constructs a CSV string containing headers and comma-separated rows, enclosing values containing commas or quotes in quotation marks.
3. It creates an in-memory binary object using `new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })`.
4. It creates a temporary URL via `URL.createObjectURL(blob)`.
5. It creates a virtual `<a>` element, sets its `href` to the blob URL and `download` to `student_records_YYYY-MM-DD.csv`, programmatically clicks it, and cleans up the memory using `URL.revokeObjectURL(url)`.

### Q11. How is the Light / Dark theme toggling implemented?
**Answer:** The root colors are defined using CSS custom properties (`var(--...)`) in `:root` and overridden inside `[data-theme="dark"]`. When the user clicks the theme button, JavaScript toggles the `data-theme="dark"` attribute on `document.documentElement` and stores `'dark'` or `'light'` in `localStorage.setItem('sms_theme', ...)`. On page load, `initTheme()` restores the preference.

### Q12. Why do you use event delegation for table edit and delete buttons?
**Answer:** Because table rows are dynamically created and destroyed whenever the user searches, sorts, paginates, or alters records. Instead of adding individual event listeners to every edit and delete button on every render (which causes memory leaks and performance overhead), a single listener is placed on the parent `<tbody>` (`#studentTableBody`). When a click occurs, `e.target.closest('.btn-action-edit')` or `e.target.closest('.btn-action-delete')` efficiently identifies the target action.

### Q13. What is the difference between inline validation and browser default validation?
**Answer:** The form has the `novalidate` attribute to suppress native browser validation popups. Instead, custom JavaScript validation evaluates inputs against specific business constraints, displays styled inline red error messages directly below each input, adds red border outlines (`.input-error`), and clears them in real time as the user types.

### Q14. What are CSS Custom Properties (Variables) and why are they advantageous here?
**Answer:** CSS Variables (`--primary-color`, `--bg-surface`, etc.) allow centralizing design tokens. By redefining these variables within the `[data-theme="dark"]` selector, the entire color palette of the application (backgrounds, text, borders, shadows) switches dynamically without writing duplicate CSS component classes.

### Q15. How are the Summary Metric cards calculated?
**Answer:**
- **Total Students:** `students.length`.
- **Active Departments:** `new Set(students.map(s => s.department)).size`. The JavaScript `Set` data structure stores only unique elements, giving an instant count of unique active departments.
- **Average CGPA:** `students.reduce((acc, s) => acc + parseFloat(s.cgpa), 0) / students.length`, formatted using `.toFixed(2)`.

---

## 5. Academic Project Report

### 5.1 Abstract
The Student Management System is an interactive, responsive single-page web application engineered to manage student academic and personal credentials efficiently. Designed as a client-side solution using HTML5, CSS3, and ES6+ JavaScript, the application implements full persistent CRUD functionality without relying on heavy external libraries or server-side databases. Data persistence is managed through browser `localStorage`, providing instant data retrieval, real-time live search, dynamic multi-column sorting, pagination, and data export capabilities. The system incorporates modern UI/UX design patterns, comprehensive inline field validation, dual-theme support (light and dark modes), and complete sanitization for client-side security.

### 5.2 Introduction
In academic institutions, managing student records accurately is fundamental to day-to-day administration. Traditional manual record-keeping methods or overly complex desktop software often create unnecessary overhead. This project demonstrates how modern browser technologies can be leveraged to build a lightweight, fast, self-contained student information portal. The application runs locally in any modern web browser, requires zero installation or backend configuration, and delivers a clean administrative dashboard.

### 5.3 Objectives
- To develop an intuitive user interface for managing student information.
- To implement all four CRUD operations (Create, Read, Update, Delete) with persistent client-side storage.
- To enforce rigorous data validation with inline feedback to ensure data integrity.
- To provide flexible department management by supporting both predefined standard disciplines and user-defined custom departments.
- To implement real-time live search, dynamic department filtering, multi-column sorting, and pagination.
- To support data portability via dynamic CSV export.
- To deliver an accessible and responsive user experience featuring both Light and Dark themes.

### 5.4 Technologies Used & Justification
- **HTML5:** Used for semantic page structure, accessible forms, tables, dialog modals, and native date pickers.
- **CSS3:** Used for visual design, CSS Grid and Flexbox for responsive layouts, CSS Custom Properties (variables) for theme toggling, and keyframe animations for toast and modal transitions.
- **Vanilla JavaScript (ES6+):** Used for DOM manipulation, state management, regular expression validation, array manipulation (`filter`, `sort`, `reduce`, `map`), Blob API generation for CSV downloads, and event handling.
- **Browser LocalStorage API:** Provides persistent client-side key-value storage, ensuring data remains intact across page reloads and browser sessions.

### 5.5 System Design
```text
+---------------------------------------------------------------------------------+
|                                 USER INTERFACE                                  |
|   +--------------------------+  +--------------------------------------------+  |
|   |   Student Input Form     |  |       Search, Filter & Sort Controls       |  |
|   +--------------------------+  +--------------------------------------------+  |
|                 |                                      |                        |
|                 v                                      v                        |
|   +--------------------------+  +--------------------------------------------+  |
|   |   Validation Engine      |  |         Dynamic Table & Pagination         |  |
|   +--------------------------+  +--------------------------------------------+  |
|                 |                                      ^                        |
|                 +----------------+  +------------------+                        |
|                                  v  |                                           |
|                     +-----------------------------+                             |
|                     |     Controller (script.js)  |                             |
|                     +-----------------------------+                             |
|                                  ^                                              |
|                                  v                                              |
|                     +-----------------------------+                             |
|                     |    Browser LocalStorage     |                             |
|                     +-----------------------------+                             |
+---------------------------------------------------------------------------------+
```

#### Data Model Schema (JSON)
Each student record is stored as an object structured as follows:
```json
{
  "id": "stu_1795014500000_a1b2c3",
  "rollNo": "CS-2024-001",
  "name": "Aarav Sharma",
  "email": "aarav.sharma@example.com",
  "phone": "9876543210",
  "department": "Computer Science",
  "cgpa": 9.15,
  "admissionDate": "2024-08-01"
}
```

### 5.6 Implementation Details

1. **Form Validation Module:**
   The `validateForm()` function enforces required field checks, regular expression matching for emails and 10-digit telephone numbers, floating-point range checks for CGPA ($0.00 \leq \text{CGPA} \leq 10.00$), and duplicate roll number detection using `students.some()`.

2. **Conditional Custom Department Logic:**
   Selecting "Other" triggers `#customDeptGroup` visibility. The entered custom department is validated and stored seamlessly. The filter dropdown dynamically populates all active departments, automatically removing custom departments when no student records utilize them.

3. **Persistent State Management:**
   All mutations (create, update, delete) synchronize immediately with `localStorage` via `saveStudentsToStorage()`. State changes trigger `renderApp()` to update metric cards, dropdowns, and table pagination in a single cycle.

4. **CSV Generation & File Streaming:**
   The `exportAllStudentsToCsv()` function iterates over all stored records, handles CSV special-character quoting, generates a timestamped `text/csv` Blob, and triggers an automated browser download.

---

### 5.7 Testing & Verification

The application was tested through an automated headless Chrome testing pipeline covering all 10 core functional verification steps. All test assertions succeeded, and verification screenshots were captured into the `screenshots/` directory:

#### Test 1: Validation Errors & Constraint Enforcement
- **Description:** Verifies that submitting an empty form triggers inline error messages for all mandatory fields. Verifies that entering invalid email patterns, non-10-digit phone numbers, out-of-range CGPA values, and duplicate roll numbers displays specific red inline warnings.
- **Result:** Passed.
- **Screenshot:**  
  ![Validation Errors](screenshots/step-01-validation-errors.png)

---

#### Test 2: Student Enrollment (Create Operation)
- **Description:** Verifies that filling valid student details and clicking "Add Student" appends the student to the table, displays a success toast notification, and increments the "Total Students" summary metric card.
- **Result:** Passed.
- **Screenshot:**  
  ![Add Student](screenshots/step-02-add-student.png)

---

#### Test 3: Custom Department ("Other" -> "Data Science")
- **Description:** Verifies that selecting "Other" displays the custom department input. Entering "Data Science" enrolls the student with the custom department, increments "Active Departments" count to 6, and dynamically adds "Data Science" to the department filter dropdown.
- **Result:** Passed.
- **Screenshot:**  
  ![Custom Department](screenshots/step-03-custom-department-data-science.png)

---

#### Test 4: Live Search, Department Filtering & Multi-Column Sorting
- **Description:** Verifies real-time search by student name/roll/email, single-department filtering, and bidirectional sorting (`asc` / `desc`) on Name, CGPA, Roll No, and Department columns with sort indicators.
- **Result:** Passed.
- **Screenshot:**  
  ![Search, Filter, Sorting](screenshots/step-04-search-filter-sorting.png)

---

#### Test 5: Edit Mode & Custom Department Prefill (Update Operation)
- **Description:** Verifies that clicking "Edit" populates the form, changes the heading to "Edit Student Details", and updates the button to "Update Student". For custom-department students, verifies that the dropdown selects "Other" and pre-fills the custom input. Saving changes updates the table and summary metrics instantly.
- **Result:** Passed.
- **Screenshot:**  
  ![Edit and Update](screenshots/step-05-edit-prefill-update.png)

---

#### Test 6: Delete Confirmation Modal & Department Pruning (Delete Operation)
- **Description:** Verifies that clicking "Delete" opens a modal dialog prompting the user for confirmation with the student's name and roll number. Confirming deletion removes the student permanently, updates summary cards, and automatically removes the custom department from the filter dropdown when no students belong to it.
- **Result:** Passed.
- **Screenshot:**  
  ![Delete Confirmation](screenshots/step-06-delete-confirmation.png)

---

#### Test 7: Full Dataset Export to CSV
- **Description:** Verifies that clicking "Export CSV" generates and downloads a properly structured file named `student_records_YYYY-MM-DD.csv` containing all enrolled students from `localStorage`.
- **Result:** Passed.
- **Screenshot:**  
  ![Export CSV](screenshots/step-07-export-csv.png)

---

#### Test 8: Dark / Light Mode Toggle & Theme Persistence
- **Description:** Verifies that toggling the theme switches the application to Dark Mode with adjusted CSS custom properties, and verifies that the theme persists across page reloads (F5 refresh).
- **Result:** Passed.
- **Screenshot:**  
  ![Dark Mode Persisted](screenshots/step-08-dark-mode-persisted.png)

---

#### Test 9: Data Persistence Across Page Refreshes
- **Description:** Verifies that all newly added, updated, and existing student records in `localStorage` persist intact after a full browser refresh.
- **Result:** Passed.
- **Screenshot:**  
  ![Data Persistence](screenshots/step-09-data-persistence-refresh.png)

---

#### Test 10: Client-Side Pagination (> 10 Records)
- **Description:** Verifies that when student records exceed 10 entries, the table divides them into 10 records per page. Verifies that Previous and Next buttons, numeric page buttons, and record counter indicators ("Showing 1 to 10 of 12 entries") function smoothly.
- **Result:** Passed.
- **Screenshot:**  
  ![Pagination](screenshots/step-10-pagination.png)

---

### 5.8 Conclusion
The Student Management System successfully achieves all project objectives. It delivers a fast, responsive, and persistent web application built strictly with vanilla web technologies. By combining semantic HTML5, modern CSS3 custom properties, and modular ES6+ JavaScript with browser `localStorage`, the project proves that robust CRUD systems can be built without external libraries or backend complexity.

### 5.9 Future Scope & Enhancements
- **Student Profile Pictures:** Enabling base64 image uploads to display student avatar photographs.
- **Multi-Field Sorting:** Allowing simultaneous secondary sorting (e.g., Department followed by CGPA).
- **Batch Operations:** Implementing bulk selection checkboxes to delete or export selected student subsets.
- **JSON Import / Export:** Providing JSON backup and restore capabilities alongside CSV export.
- **Backend API Integration:** Adding RESTful API or GraphQL connectors to sync client records with a remote cloud database such as PostgreSQL or MongoDB.
