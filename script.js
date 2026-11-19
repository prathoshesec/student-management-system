/* Author: [YOUR NAME], Reg No: [YOUR REG NO] */

/**
 * ============================================================================
 * STUDENT MANAGEMENT SYSTEM (CRUD APPLICATION)
 * ============================================================================
 * Technologies: HTML5, CSS3, Vanilla JavaScript (ES6+)
 * Storage: Persistent Browser LocalStorage
 * Architectural Pattern: Event-Driven MVC (Model-View-Controller) Style
 */

// ============================================================================
// 1. CONSTANTS & CONFIGURATION
// ============================================================================

/** LocalStorage key for student data */
const STORAGE_KEY_STUDENTS = 'sms_students_data';

/** LocalStorage key for user theme preference */
const STORAGE_KEY_THEME = 'sms_theme';

/** Standard predefined departments */
const STANDARD_DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering'
];

/** Number of student records displayed per page */
const RECORDS_PER_PAGE = 10;

/** Default seed data loaded when local storage is empty */
const SEED_STUDENTS = [
  {
    id: 'seed-001',
    rollNo: 'CS-2024-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '9876543210',
    department: 'Computer Science',
    cgpa: 9.15,
    admissionDate: '2024-08-01'
  },
  {
    id: 'seed-002',
    rollNo: 'IT-2024-015',
    name: 'Sneha Patel',
    email: 'sneha.patel@example.com',
    phone: '9812345678',
    department: 'Information Technology',
    cgpa: 8.80,
    admissionDate: '2024-08-03'
  },
  {
    id: 'seed-003',
    rollNo: 'EC-2024-042',
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    phone: '9789012345',
    department: 'Electronics & Communication',
    cgpa: 7.95,
    admissionDate: '2024-08-05'
  },
  {
    id: 'seed-004',
    rollNo: 'ME-2024-018',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@example.com',
    phone: '9654321098',
    department: 'Mechanical Engineering',
    cgpa: 8.40,
    admissionDate: '2024-08-10'
  },
  {
    id: 'seed-005',
    rollNo: 'CE-2024-009',
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@example.com',
    phone: '9543210987',
    department: 'Civil Engineering',
    cgpa: 7.50,
    admissionDate: '2024-08-12'
  },
  {
    id: 'seed-006',
    rollNo: 'CS-2024-088',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '9432109876',
    department: 'Computer Science',
    cgpa: 9.60,
    admissionDate: '2024-08-15'
  }
];

// ============================================================================
// 2. APPLICATION STATE
// ============================================================================

/** Main array containing all student records */
let students = [];

/** ID of student currently being edited (null when in Create mode) */
let editingStudentId = null;

/** ID of student pending deletion confirmation */
let deleteTargetId = null;

/** Current search keyword entered in search box */
let searchFilter = '';

/** Currently selected department filter */
let departmentFilter = '';

/** Column key currently used for sorting */
let sortColumn = 'rollNo';

/** Current sort order: 'asc' or 'desc' */
let sortDirection = 'asc';

/** Current active page number in pagination */
let currentPage = 1;

// ============================================================================
// 3. DOM ELEMENT REFERENCES
// ============================================================================

// Form Elements
const studentForm = document.getElementById('studentForm');
const formHeading = document.getElementById('formHeading');
const studentIdInput = document.getElementById('studentId');
const rollNoInput = document.getElementById('rollNo');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const departmentSelect = document.getElementById('department');
const customDeptGroup = document.getElementById('customDeptGroup');
const customDeptNameInput = document.getElementById('customDeptName');
const cgpaInput = document.getElementById('cgpa');
const admissionDateInput = document.getElementById('admissionDate');
const submitBtn = document.getElementById('submitBtn');
const submitBtnText = document.getElementById('submitBtnText');
const cancelBtn = document.getElementById('cancelBtn');
const resetBtn = document.getElementById('resetBtn');

// Error Display Containers
const rollNoError = document.getElementById('rollNoError');
const fullNameError = document.getElementById('fullNameError');
const emailError = document.getElementById('emailError');
const phoneError = document.getElementById('phoneError');
const departmentError = document.getElementById('departmentError');
const customDeptError = document.getElementById('customDeptError');
const cgpaError = document.getElementById('cgpaError');
const admissionDateError = document.getElementById('admissionDateError');

// Summary Cards
const totalStudentsCountEl = document.getElementById('totalStudentsCount');
const activeDepartmentsCountEl = document.getElementById('activeDepartmentsCount');
const averageCgpaValueEl = document.getElementById('averageCgpaValue');
const recordsBadgeEl = document.getElementById('recordsBadge');

// Table & Toolbar
const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const deptFilterSelect = document.getElementById('deptFilterSelect');

// Pagination Elements
const paginationInfo = document.getElementById('paginationInfo');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageNumbersContainer = document.getElementById('pageNumbersContainer');

// Modal Elements
const deleteModal = document.getElementById('deleteModal');
const deleteStudentNameEl = document.getElementById('deleteStudentName');
const deleteStudentRollEl = document.getElementById('deleteStudentRoll');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Header Actions
const exportCsvBtn = document.getElementById('exportCsvBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeText = document.getElementById('themeText');
const toastContainer = document.getElementById('toastContainer');

// ============================================================================
// 4. UTILITY FUNCTIONS
// ============================================================================

/**
 * Escapes special HTML characters to prevent Cross-Site Scripting (XSS)
 * @param {string|number} str - Raw string or value
 * @returns {string} Sanitized string safe for innerHTML insertion
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formats a raw YYYY-MM-DD date string to a readable format (e.g. "01 Aug 2024")
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, monthIndex, day);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Generates a unique identifier for student records
 * @returns {string} Unique ID string
 */
function generateId() {
  return 'stu_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
}

// ============================================================================
// 5. TOAST NOTIFICATION SYSTEM
// ============================================================================

/**
 * Displays a toast notification on the top right
 * @param {string} message - Notification text
 * @param {'success'|'danger'|'info'} type - Toast aesthetic type
 * @param {string} title - Optional title header
 */
function showToast(message, type = 'success', title = '') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Default titles based on type
  if (!title) {
    if (type === 'success') title = 'Success';
    else if (type === 'danger') title = 'Deleted';
    else title = 'Notification';
  }

  // Icons based on type
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>`;
  } else if (type === 'danger') {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>`;
  } else {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="toast-content">
      <div class="toast-title">${escapeHTML(title)}</div>
      <div class="toast-message">${escapeHTML(message)}</div>
    </div>
    <button type="button" class="toast-close-btn" aria-label="Close notification">&times;</button>
  `;

  // Attach manual dismiss listener
  const closeBtn = toast.querySelector('.toast-close-btn');
  closeBtn.addEventListener('click', () => {
    dismissToast(toast);
  });

  toastContainer.appendChild(toast);

  // Auto dismiss after 3.2 seconds
  setTimeout(() => {
    dismissToast(toast);
  }, 3200);
}

/**
 * Animates and removes a toast notification from DOM
 * @param {HTMLElement} toast - Toast element
 */
function dismissToast(toast) {
  if (!toast || toast.classList.contains('toast-hiding')) return;
  toast.classList.add('toast-hiding');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// ============================================================================
// 6. LOCAL STORAGE PERSISTENCE
// ============================================================================

/**
 * Loads student records from localStorage, seeding default records if none exist
 */
function loadStudentsFromStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        students = parsed;
        return;
      }
    }
  } catch (err) {
    console.error('Error reading students from localStorage:', err);
  }

  // Fallback: seed initial data if storage was empty
  students = [...SEED_STUDENTS];
  saveStudentsToStorage();
}

/**
 * Serializes and saves the current students array to browser localStorage
 */
function saveStudentsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Error saving students to localStorage:', err);
    showToast('Failed to save to local storage. Storage quota may be exceeded.', 'danger', 'Storage Error');
  }
}

// ============================================================================
// 7. THEME TOGGLING SYSTEM (LIGHT / DARK)
// ============================================================================

/**
 * Initializes the visual theme from localStorage or system preference
 */
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
  if (savedTheme === 'dark') {
    applyTheme('dark');
  } else if (savedTheme === 'light') {
    applyTheme('light');
  } else {
    // Detect system dark mode preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
}

/**
 * Applies the given theme to document element and updates toggle button label
 * @param {'light'|'dark'} theme - Theme to apply
 */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeText.textContent = 'Light Mode';
    localStorage.setItem(STORAGE_KEY_THEME, 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeText.textContent = 'Dark Mode';
    localStorage.setItem(STORAGE_KEY_THEME, 'light');
  }
}

/**
 * Toggles between light and dark themes
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    applyTheme('light');
  } else {
    applyTheme('dark');
  }
}

// ============================================================================
// 8. FORM VALIDATION
// ============================================================================

/**
 * Shows inline red error message under a specific field
 * @param {HTMLElement} inputEl - Form input element
 * @param {HTMLElement} errorEl - Error container element
 * @param {string} message - Validation error description
 */
function setFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('input-error');
  errorEl.textContent = message;
  errorEl.classList.add('visible');
}

/**
 * Clears inline error styling and message for a specific field
 * @param {HTMLElement} inputEl - Form input element
 * @param {HTMLElement} errorEl - Error container element
 */
function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove('input-error');
  errorEl.textContent = '';
  errorEl.classList.remove('visible');
}

/**
 * Clears all form error messages and input highlight borders
 */
function clearAllErrors() {
  clearFieldError(rollNoInput, rollNoError);
  clearFieldError(fullNameInput, fullNameError);
  clearFieldError(emailInput, emailError);
  clearFieldError(phoneInput, phoneError);
  clearFieldError(departmentSelect, departmentError);
  clearFieldError(customDeptNameInput, customDeptError);
  clearFieldError(cgpaInput, cgpaError);
  clearFieldError(admissionDateInput, admissionDateError);
}

/**
 * Validates all form inputs according to business rules
 * @returns {boolean} True if all fields are valid, false otherwise
 */
function validateForm() {
  let isValid = true;
  clearAllErrors();

  // 1. Roll Number Validation
  const rollVal = rollNoInput.value.trim();
  if (!rollVal) {
    setFieldError(rollNoInput, rollNoError, 'Roll number is required.');
    isValid = false;
  } else {
    // Check for duplicate roll numbers (ignoring current student in edit mode)
    const isDuplicate = students.some(s => {
      if (editingStudentId && s.id === editingStudentId) return false;
      return s.rollNo.trim().toLowerCase() === rollVal.toLowerCase();
    });

    if (isDuplicate) {
      setFieldError(rollNoInput, rollNoError, `Roll number "${rollVal}" is already registered.`);
      isValid = false;
    }
  }

  // 2. Full Name Validation
  const nameVal = fullNameInput.value.trim();
  if (!nameVal) {
    setFieldError(fullNameInput, fullNameError, 'Full name is required.');
    isValid = false;
  } else if (nameVal.length < 2) {
    setFieldError(fullNameInput, fullNameError, 'Full name must be at least 2 characters.');
    isValid = false;
  }

  // 3. Email Address Validation
  const emailVal = emailInput.value.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailVal) {
    setFieldError(emailInput, emailError, 'Email address is required.');
    isValid = false;
  } else if (!emailRegex.test(emailVal)) {
    setFieldError(emailInput, emailError, 'Please enter a valid email address.');
    isValid = false;
  }

  // 4. Phone Number Validation (10 digits)
  const phoneVal = phoneInput.value.trim();
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneVal) {
    setFieldError(phoneInput, phoneError, 'Phone number is required.');
    isValid = false;
  } else if (!phoneRegex.test(phoneVal)) {
    setFieldError(phoneInput, phoneError, 'Phone number must be exactly 10 digits.');
    isValid = false;
  }

  // 5. Department Validation (and "Other" custom name check)
  const deptVal = departmentSelect.value;
  if (!deptVal) {
    setFieldError(departmentSelect, departmentError, 'Please select a department.');
    isValid = false;
  } else if (deptVal === 'Other') {
    const customDeptVal = customDeptNameInput.value.trim();
    if (!customDeptVal) {
      setFieldError(customDeptNameInput, customDeptError, 'Please enter department name.');
      isValid = false;
    } else if (customDeptVal.length < 2) {
      setFieldError(customDeptNameInput, customDeptError, 'Department name must be at least 2 characters.');
      isValid = false;
    }
  }

  // 6. CGPA Validation (0.0 to 10.0)
  const cgpaRaw = cgpaInput.value.trim();
  if (!cgpaRaw) {
    setFieldError(cgpaInput, cgpaError, 'CGPA is required.');
    isValid = false;
  } else {
    const cgpaNum = parseFloat(cgpaRaw);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      setFieldError(cgpaInput, cgpaError, 'CGPA must be a number between 0.00 and 10.00.');
      isValid = false;
    }
  }

  // 7. Admission Date Validation
  const dateVal = admissionDateInput.value.trim();
  if (!dateVal) {
    setFieldError(admissionDateInput, admissionDateError, 'Admission date is required.');
    isValid = false;
  }

  return isValid;
}

// ============================================================================
// 9. SUMMARY CARDS & FILTERS UPDATE
// ============================================================================

/**
 * Updates the summary metrics cards (Total Students, Active Departments, Average CGPA)
 */
function updateSummaryCards() {
  const totalCount = students.length;
  totalStudentsCountEl.textContent = totalCount;
  recordsBadgeEl.textContent = `${totalCount} Record${totalCount === 1 ? '' : 's'}`;

  // Unique active departments among enrolled students
  const activeDepartmentsSet = new Set(
    students
      .map(s => s.department ? s.department.trim() : '')
      .filter(dept => dept.length > 0)
  );
  activeDepartmentsCountEl.textContent = activeDepartmentsSet.size;

  // Average CGPA calculation
  if (totalCount === 0) {
    averageCgpaValueEl.textContent = '0.00';
  } else {
    const sumCgpa = students.reduce((acc, s) => acc + (parseFloat(s.cgpa) || 0), 0);
    const avgCgpa = (sumCgpa / totalCount).toFixed(2);
    averageCgpaValueEl.textContent = avgCgpa;
  }
}

/**
 * Dynamically rebuilds the department filter dropdown to include
 * standard departments plus any active custom departments present in student records
 */
function updateDepartmentFilterOptions() {
  const selectedBefore = departmentFilter;

  // Collect all unique departments currently assigned to students
  const studentDepartments = new Set(
    students
      .map(s => s.department ? s.department.trim() : '')
      .filter(dept => dept.length > 0)
  );

  // Combine standard departments with custom departments found in student records
  const allDepartmentsList = [...STANDARD_DEPARTMENTS];
  studentDepartments.forEach(dept => {
    if (!allDepartmentsList.includes(dept)) {
      allDepartmentsList.push(dept);
    }
  });

  // Rebuild the filter dropdown options
  deptFilterSelect.innerHTML = '<option value="">All Departments</option>';
  allDepartmentsList.forEach(dept => {
    // Only include in dropdown if at least one student currently belongs to it or if it's standard
    // Requirement 6: "the custom department disappears from the filter when no student uses it"
    const isStandard = STANDARD_DEPARTMENTS.includes(dept);
    const hasStudents = studentDepartments.has(dept);

    if (isStandard || hasStudents) {
      const opt = document.createElement('option');
      opt.value = dept;
      opt.textContent = dept;
      deptFilterSelect.appendChild(opt);
    }
  });

  // Restore previous selection if it is still valid
  if (selectedBefore && Array.from(deptFilterSelect.options).some(o => o.value === selectedBefore)) {
    deptFilterSelect.value = selectedBefore;
    departmentFilter = selectedBefore;
  } else {
    deptFilterSelect.value = '';
    departmentFilter = '';
  }
}

// ============================================================================
// 10. CRUD OPERATIONS (CREATE, READ, UPDATE, DELETE)
// ============================================================================

/**
 * CREATE: Adds a new student record to local storage
 * @param {Object} studentData - Validated student object
 */
function createStudent(studentData) {
  const newStudent = {
    id: generateId(),
    rollNo: studentData.rollNo.trim(),
    name: studentData.name.trim(),
    email: studentData.email.trim(),
    phone: studentData.phone.trim(),
    department: studentData.department.trim(),
    cgpa: parseFloat(parseFloat(studentData.cgpa).toFixed(2)),
    admissionDate: studentData.admissionDate
  };

  // Add to beginning of array so newest shows first or follows sort
  students.unshift(newStudent);
  saveStudentsToStorage();

  resetForm();
  renderApp();
  showToast(`Student "${newStudent.name}" added successfully!`, 'success', 'Student Enrolled');
}

/**
 * READ / RENDER: Filters, sorts, paginates, and renders the students table
 */
function renderStudentsTable() {
  // Step 1: Filter students based on search keywords and department filter
  let filtered = students.filter(student => {
    // Search query matches rollNo, name, or email
    const query = searchFilter.toLowerCase();
    const matchesSearch = !query ||
      student.rollNo.toLowerCase().includes(query) ||
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query);

    // Department filter
    const matchesDept = !departmentFilter || student.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  // Step 2: Sort filtered students
  filtered.sort((a, b) => {
    let valA = a[sortColumn];
    let valB = b[sortColumn];

    if (sortColumn === 'cgpa') {
      valA = parseFloat(valA) || 0;
      valB = parseFloat(valB) || 0;
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    } else {
      valA = (valA || '').toString().toLowerCase();
      valB = (valB || '').toString().toLowerCase();
      const comp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      return sortDirection === 'asc' ? comp : -comp;
    }
  });

  // Step 3: Handle Pagination math
  const totalFilteredRecords = filtered.length;
  const totalPages = Math.ceil(totalFilteredRecords / RECORDS_PER_PAGE) || 1;

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  if (currentPage < 1) {
    currentPage = 1;
  }

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = Math.min(startIndex + RECORDS_PER_PAGE, totalFilteredRecords);
  const pageRecords = filtered.slice(startIndex, endIndex);

  // Step 4: Render Table Body
  studentTableBody.innerHTML = '';

  if (pageRecords.length === 0) {
    // "No records found" empty state
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'empty-table-row';
    emptyRow.innerHTML = `
      <td colspan="8">
        <div class="empty-state-wrapper">
          <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <div class="empty-state-title">No student records found</div>
          <p class="empty-state-text">No entries match your current search or filter criteria. Try clearing filters or adding a new record.</p>
        </div>
      </td>
    `;
    studentTableBody.appendChild(emptyRow);
  } else {
    pageRecords.forEach(student => {
      const row = document.createElement('tr');

      // CGPA Color styling class
      let cgpaClass = 'cgpa-med';
      const numCgpa = parseFloat(student.cgpa) || 0;
      if (numCgpa >= 8.5) cgpaClass = 'cgpa-high';
      else if (numCgpa < 7.0) cgpaClass = 'cgpa-low';

      row.innerHTML = `
        <td class="table-roll-no">${escapeHTML(student.rollNo)}</td>
        <td class="table-name">${escapeHTML(student.name)}</td>
        <td>${escapeHTML(student.email)}</td>
        <td>${escapeHTML(student.phone)}</td>
        <td><span class="badge badge-dept">${escapeHTML(student.department)}</span></td>
        <td class="table-cgpa ${cgpaClass}">${escapeHTML(numCgpa.toFixed(2))}</td>
        <td>${escapeHTML(formatDate(student.admissionDate))}</td>
        <td>
          <div class="actions-cell">
            <button 
              type="button" 
              class="btn-action-edit" 
              data-id="${escapeHTML(student.id)}"
              title="Edit student"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Edit</span>
            </button>
            <button 
              type="button" 
              class="btn-action-delete" 
              data-id="${escapeHTML(student.id)}"
              title="Delete student"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </td>
      `;
      studentTableBody.appendChild(row);
    });
  }

  // Step 5: Update Pagination UI
  renderPaginationControls(totalFilteredRecords, totalPages, startIndex, endIndex);

  // Step 6: Update Sort Column Indicators
  updateSortIndicators();
}

/**
 * Renders the pagination controls and info message
 * @param {number} totalFiltered - Total records matching filter
 * @param {number} totalPages - Total computed pages
 * @param {number} startIndex - Starting slice index
 * @param {number} endIndex - Ending slice index
 */
function renderPaginationControls(totalFiltered, totalPages, startIndex, endIndex) {
  if (totalFiltered === 0) {
    paginationInfo.textContent = 'Showing 0 to 0 of 0 entries';
  } else {
    paginationInfo.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalFiltered} entries`;
  }

  prevPageBtn.disabled = (currentPage <= 1);
  nextPageBtn.disabled = (currentPage >= totalPages || totalFiltered === 0);

  // Render individual page numbers
  pageNumbersContainer.innerHTML = '';
  for (let p = 1; p <= totalPages; p++) {
    const pageBtn = document.createElement('button');
    pageBtn.type = 'button';
    pageBtn.className = `page-num-btn ${p === currentPage ? 'active' : ''}`;
    pageBtn.textContent = p;
    pageBtn.addEventListener('click', () => {
      currentPage = p;
      renderStudentsTable();
    });
    pageNumbersContainer.appendChild(pageBtn);
  }
}

/**
 * Updates visual arrow indicators (↑ / ↓ / ↕) on sortable table headers
 */
function updateSortIndicators() {
  const sortColumns = ['rollNo', 'name', 'department', 'cgpa'];
  sortColumns.forEach(col => {
    const indicatorEl = document.getElementById(`indicator-${col}`);
    const thEl = document.querySelector(`.sortable-th[data-sort="${col}"]`);
    if (indicatorEl && thEl) {
      if (sortColumn === col) {
        thEl.classList.add('active-sort');
        indicatorEl.textContent = sortDirection === 'asc' ? '↑' : '↓';
      } else {
        thEl.classList.remove('active-sort');
        indicatorEl.textContent = '↕';
      }
    }
  });
}

/**
 * UPDATE (Stage 1): Loads a student record into the form for editing
 * @param {string} studentId - Unique ID of the student to edit
 */
function startEditStudent(studentId) {
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  editingStudentId = student.id;
  studentIdInput.value = student.id;

  // Pre-fill inputs
  rollNoInput.value = student.rollNo;
  fullNameInput.value = student.name;
  emailInput.value = student.email;
  phoneInput.value = student.phone;
  cgpaInput.value = student.cgpa;
  admissionDateInput.value = student.admissionDate;

  // Department handling: standard vs custom
  if (STANDARD_DEPARTMENTS.includes(student.department)) {
    departmentSelect.value = student.department;
    customDeptGroup.style.display = 'none';
    customDeptNameInput.value = '';
  } else {
    // Custom department -> Select "Other" and prefill text input
    departmentSelect.value = 'Other';
    customDeptGroup.style.display = 'block';
    customDeptNameInput.value = student.department;
  }

  // Update form UI to Edit mode
  formHeading.textContent = 'Edit Student Details';
  submitBtnText.textContent = 'Update Student';
  cancelBtn.style.display = 'inline-flex';
  clearAllErrors();

  // Smooth scroll form into view
  studentForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * UPDATE (Stage 2): Saves modifications to an existing student
 * @param {Object} studentData - Validated student object
 */
function updateStudent(studentData) {
  const index = students.findIndex(s => s.id === editingStudentId);
  if (index === -1) return;

  students[index] = {
    ...students[index],
    rollNo: studentData.rollNo.trim(),
    name: studentData.name.trim(),
    email: studentData.email.trim(),
    phone: studentData.phone.trim(),
    department: studentData.department.trim(),
    cgpa: parseFloat(parseFloat(studentData.cgpa).toFixed(2)),
    admissionDate: studentData.admissionDate
  };

  saveStudentsToStorage();
  resetForm();
  renderApp();
  showToast(`Student "${students[index].name}" updated successfully!`, 'success', 'Changes Saved');
}

/**
 * Leaves Edit mode, clears inputs, and resets form heading and buttons to default
 */
function resetForm() {
  editingStudentId = null;
  studentIdInput.value = '';
  studentForm.reset();
  customDeptGroup.style.display = 'none';
  customDeptNameInput.value = '';

  formHeading.textContent = 'Add New Student';
  submitBtnText.textContent = 'Add Student';
  cancelBtn.style.display = 'none';
  clearAllErrors();
}

/**
 * DELETE (Stage 1): Opens delete confirmation modal
 * @param {string} studentId - Unique ID of the student to delete
 */
function openDeleteModal(studentId) {
  const student = students.find(s => s.id === studentId);
  if (!student) return;

  deleteTargetId = student.id;
  deleteStudentNameEl.textContent = student.name;
  deleteStudentRollEl.textContent = student.rollNo;

  deleteModal.classList.add('show');
  deleteModal.setAttribute('aria-hidden', 'false');
}

/**
 * Closes delete confirmation modal
 */
function closeDeleteModal() {
  deleteTargetId = null;
  deleteModal.classList.remove('show');
  deleteModal.setAttribute('aria-hidden', 'true');
}

/**
 * DELETE (Stage 2): Removes the student from data array and updates storage & UI
 */
function confirmDeleteStudent() {
  if (!deleteTargetId) return;

  const target = students.find(s => s.id === deleteTargetId);
  const studentName = target ? target.name : 'Record';

  students = students.filter(s => s.id !== deleteTargetId);
  saveStudentsToStorage();

  // If the student currently being deleted was in edit mode, reset the form
  if (editingStudentId === deleteTargetId) {
    resetForm();
  }

  closeDeleteModal();
  renderApp();
  showToast(`Student "${studentName}" was permanently deleted.`, 'danger', 'Record Removed');
}

// ============================================================================
// 11. EXPORT TO CSV
// ============================================================================

/**
 * Exports all students in storage to a CSV file named student_records_YYYY-MM-DD.csv
 */
function exportAllStudentsToCsv() {
  if (students.length === 0) {
    showToast('No student records available to export.', 'info', 'Empty Export');
    return;
  }

  // Header columns as requested
  const headers = [
    'Roll Number',
    'Full Name',
    'Email Address',
    'Phone Number',
    'Department',
    'CGPA',
    'Admission Date'
  ];

  // Map every student from full localStorage data (not just visible rows)
  const rows = students.map(student => [
    student.rollNo,
    student.name,
    student.email,
    student.phone,
    student.department,
    (parseFloat(student.cgpa) || 0).toFixed(2),
    student.admissionDate
  ]);

  // Construct properly escaped CSV string
  const escapeCsvCell = cell => {
    const val = (cell === null || cell === undefined) ? '' : String(cell);
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(','))
  ].join('\r\n');

  // Generate current date formatted as YYYY-MM-DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const fileName = `student_records_${year}-${month}-${day}.csv`;

  // Trigger browser download via Blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', url);
  downloadLink.setAttribute('download', fileName);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);

  showToast(`Exported ${students.length} student records to ${fileName}`, 'success', 'Export Complete');
}

// ============================================================================
// 12. MASTER RENDER CONTROLLER
// ============================================================================

/**
 * Re-computes metrics, department filter list, and renders the data table
 */
function renderApp() {
  updateSummaryCards();
  updateDepartmentFilterOptions();
  renderStudentsTable();
}

// ============================================================================
// 13. EVENT LISTENERS SETUP
// ============================================================================

/**
 * Registers all DOM event listeners for buttons, inputs, modals, and sorting
 */
function setupEventListeners() {
  // 1. Department dropdown change: toggle "Other" custom input
  departmentSelect.addEventListener('change', () => {
    if (departmentSelect.value === 'Other') {
      customDeptGroup.style.display = 'block';
      customDeptNameInput.focus();
    } else {
      customDeptGroup.style.display = 'none';
      clearFieldError(customDeptNameInput, customDeptError);
    }
    clearFieldError(departmentSelect, departmentError);
  });

  // 2. Real-time validation clearing on input
  rollNoInput.addEventListener('input', () => clearFieldError(rollNoInput, rollNoError));
  fullNameInput.addEventListener('input', () => clearFieldError(fullNameInput, fullNameError));
  emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
  phoneInput.addEventListener('input', () => clearFieldError(phoneInput, phoneError));
  customDeptNameInput.addEventListener('input', () => clearFieldError(customDeptNameInput, customDeptError));
  cgpaInput.addEventListener('input', () => clearFieldError(cgpaInput, cgpaError));
  admissionDateInput.addEventListener('change', () => clearFieldError(admissionDateInput, admissionDateError));

  // 3. Form Submit (Handles both CREATE and UPDATE)
  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Determine resolved department name
    let resolvedDepartment = departmentSelect.value;
    if (resolvedDepartment === 'Other') {
      resolvedDepartment = customDeptNameInput.value.trim();
    }

    const formData = {
      rollNo: rollNoInput.value,
      name: fullNameInput.value,
      email: emailInput.value,
      phone: phoneInput.value,
      department: resolvedDepartment,
      cgpa: cgpaInput.value,
      admissionDate: admissionDateInput.value
    };

    if (editingStudentId) {
      updateStudent(formData);
    } else {
      createStudent(formData);
    }
  });

  // 4. Cancel Edit Button
  cancelBtn.addEventListener('click', () => {
    resetForm();
    showToast('Editing cancelled.', 'info', 'Cancelled');
  });

  // 5. Reset Form Button
  resetBtn.addEventListener('click', () => {
    resetForm();
  });

  // 6. Table Actions Delegation (Edit & Delete buttons)
  studentTableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-action-edit');
    if (editBtn) {
      const studentId = editBtn.dataset.id;
      startEditStudent(studentId);
      return;
    }

    const deleteBtn = e.target.closest('.btn-action-delete');
    if (deleteBtn) {
      const studentId = deleteBtn.dataset.id;
      openDeleteModal(studentId);
      return;
    }
  });

  // 7. Delete Modal Actions
  confirmDeleteBtn.addEventListener('click', confirmDeleteStudent);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && deleteModal.classList.contains('show')) {
      closeDeleteModal();
    }
  });

  // 8. Live Search
  searchInput.addEventListener('input', (e) => {
    searchFilter = e.target.value.trim();
    clearSearchBtn.style.display = searchFilter ? 'block' : 'none';
    currentPage = 1;
    renderStudentsTable();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchFilter = '';
    clearSearchBtn.style.display = 'none';
    currentPage = 1;
    renderStudentsTable();
  });

  // 9. Department Filter Dropdown
  deptFilterSelect.addEventListener('change', (e) => {
    departmentFilter = e.target.value;
    currentPage = 1;
    renderStudentsTable();
  });

  // 10. Clickable Table Headers for Sorting
  const sortableHeaders = document.querySelectorAll('.sortable-th');
  sortableHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const column = th.dataset.sort;
      if (sortColumn === column) {
        // Toggle direction
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn = column;
        sortDirection = 'asc';
      }
      renderStudentsTable();
    });
  });

  // 11. Pagination Prev & Next Buttons
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderStudentsTable();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    currentPage++;
    renderStudentsTable();
  });

  // 12. Export to CSV Button
  exportCsvBtn.addEventListener('click', exportAllStudentsToCsv);

  // 13. Theme Toggle Button
  themeToggleBtn.addEventListener('click', toggleTheme);
}

// ============================================================================
// 14. APPLICATION INITIALIZATION
// ============================================================================

/**
 * Main initialization entry point triggered when DOM is fully loaded
 */
function init() {
  initTheme();
  loadStudentsFromStorage();
  setupEventListeners();
  renderApp();
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', init);
