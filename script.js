// Function to open the detailed view of a class
function openClassDetail(className) {
    const modal = document.getElementById('classModal');
    const title = document.getElementById('modalClassTitle');
    
    title.innerText = `Class Details: ${className}`;
    modal.classList.add('show');
}

// Function to close the detailed view modal
function closeClassDetail() {
    const modal = document.getElementById('classModal');
    modal.classList.remove('show');
}

// Function to open Issues
function openIssues(dept, className, issueCount) {
    // Stop event propagation so row click isn't triggered
    if (event) {
        event.stopPropagation();
    }
    
    const modal = document.getElementById('issuesModal');
    const title = document.getElementById('modalIssuesTitle');
    const list = document.getElementById('issuesList');
    
    title.innerText = `Issues: ${dept} - Class ${className}`;
    
    if (issueCount === 0 || !issueCount) {
        list.innerHTML = '<li>No issues recorded. Good!</li>';
    } else {
        // mock some specific issues based on department
        let mockIssues = [];
        if (dept === 'Teacher') {
            mockIssues = [
                'Student A absent without permission.',
                'Teacher forgot to enter weekly attendance.',
                'Homework submitted late.'
            ];
        } else if (dept === 'Academic') {
            mockIssues = [
                'Periodic test scores delayed.',
                '2 students below average score.'
            ];
        } else if (dept === 'Operation') {
            mockIssues = [
                'Parents complained about facilities.',
                'Installment 2 not fully collected.'
            ];
        }
        
        list.innerHTML = '';
        for (let i = 0; i < issueCount; i++) {
            list.innerHTML += `<li><i class="fa-solid fa-circle-exclamation" style="color: var(--danger); margin-right: 8px;"></i>${mockIssues[i % mockIssues.length]}</li>`;
        }
    }
    
    modal.classList.add('show');
}

// Function to close Issues modal
function closeIssues() {
    const modal = document.getElementById('issuesModal');
    modal.classList.remove('show');
}

// Close the modal if clicking outside the content
window.addEventListener('click', function(event) {
    const classModal = document.getElementById('classModal');
    const issuesModal = document.getElementById('issuesModal');
    
    if (event.target === classModal) {
        closeClassDetail();
    }
    if (event.target === issuesModal) {
        closeIssues();
    }
});

// Navigation Routing Logic
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-menu .nav-item[data-target]');
    const pageViews = document.querySelectorAll('.page-view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked nav
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');

            // Hide all views
            pageViews.forEach(view => {
                view.style.display = 'none';
                view.classList.remove('active');
            });

            // Show target view
            const targetView = document.getElementById(targetId);
            if(targetView) {
                targetView.style.display = 'block';
                // Small delay to allow CSS transitions to grab on
                setTimeout(() => {
                    targetView.classList.add('active');
                }, 10);
            }
        });
    });

    // Khởi động lấy dữ liệu Dashboard
    fetchDashboardData();

    // Sync button logic
    const syncBtn = document.getElementById('syncDataBtn');
    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
            const icon = syncBtn.querySelector('i');
            icon.classList.add('fa-spin');
            await fetchDashboardData();
            icon.classList.remove('fa-spin');
        });
    }

    // Initialize calendar
    renderCalendar();

    // Initialize month selector
    changeMonth(0);
});


// Mock Monthly Data & Logic
const mockMonthlyData = {
    0: {
        label: "March 2026",
        teacher: { focus: "Resolve quality complaints", plan: ["Private meeting with Teacher A", "Surprise class observation"], result: ["Internal disciplinary action taken", "Reputation restored"], action: ["Issue new rules notice"] },
        academic: { focus: "Review Kid 4 curriculum", plan: ["Recheck Unit 1-5", "Review spelling errors"], result: ["100% completed"], action: ["Print and publish"] },
        operation: { focus: "Set up new District 3 facility", plan: ["Receive 50 sets of tables/chairs", "Paint room lines"], result: ["3/5 rooms completed"], action: ["Call for additional curtains"] }
    },
    1: {
        label: "April 2026",
        teacher: { focus: "Improve Student Engagement", plan: ["Conduct 2 workshops on interactive teaching.", "Review low engagement classes."], result: ["Workshop 1 completed.", "Engagement up 5% in target classes."], action: ["Schedule Workshop 2 next month."] },
        academic: { focus: "Finalize new IELTS Curriculum", plan: ["Draft remaining 4 modules."], result: ["3/4 modules drafted."], action: ["Review with senior teachers."] },
        operation: { focus: "Complete month-end fee collection", plan: ["Contact 15 overdue students.", "Issue receipt batch #4."], result: ["10 paid. 5 pending response."], action: ["Call parents of 5 pending students directly."] }
    },
    2: {
        label: "May 2026",
        teacher: { focus: "Analyze Mid-term Test Results", plan: ["Aggregate scores", "Professional review meeting"], result: ["Not yet taken place"], action: ["Waiting for Academic dept"] },
        academic: { focus: "Organize Mid-term Exam Board", plan: ["Print 100% test papers", "Divide proctoring shifts"], result: ["Tests are sealed"], action: ["Open box on 08/04"] },
        operation: { focus: "Finalize salary & Enrollment bonus", plan: ["Review TA working hours", "Export Excel file to Director"], result: ["Draft created"], action: ["Needs approval on 10/04"] }
    },
    3: {
        label: "June 2026",
        teacher: { focus: "Evaluate Mid-term Performance", plan: ["Review June feedback forms", "Hold 1-on-1 with teachers"], result: ["Pending"], action: ["Finalize teacher grading"] },
        academic: { focus: "Finalize Summer Camp Material", plan: ["Print all materials", "Double check activities"], result: ["Material printed"], action: ["Send to branches"] },
        operation: { focus: "Summer facility prep", plan: ["Check all ACs", "Restock water and snacks"], result: ["AC checked"], action: ["Order snacks next week"] }
    }
};

let currentMonthIndex = 3;
let globalClassRows = [];
let globalMetricsRow = [];
let globalLeaderRows = [];

function changeMonth(diff) {
    let newIndex = currentMonthIndex + diff;
    if(mockMonthlyData[newIndex]) {
        currentMonthIndex = newIndex;
        const data = mockMonthlyData[currentMonthIndex];
        
        // Update Label
        document.getElementById('currentMonthDisplay').innerText = data.label;
        document.getElementById('prevMonthBtn').style.opacity = currentMonthIndex === 0 ? '0.3' : '1';
        document.getElementById('nextMonthBtn').style.opacity = currentMonthIndex === Object.keys(mockMonthlyData).length - 1 ? '0.3' : '1';

        // Filter data by month (0 = "03", 1 = "04", 2 = "05", 3 = "06")
        const monthVal = currentMonthIndex + 3;
        const monthStr = String(monthVal).padStart(2, '0');
        if (globalClassRows.length > 0) {
            const filteredRows = globalClassRows.filter(row => {
                // The user clarified that the Month column (c[56]) correctly represents the month's snapshot data.
                return row.c[56] && String(row.c[56].v).padStart(2, '0') === monthStr;
            });
            updateMetricsCards(filteredRows, globalMetricsRow);
            renderDashboardTable(filteredRows);
            renderHeadTable(filteredRows);
        }

        // Re-render role tasks when month changes
        if (globalLeaderRows.length > 0) {
            renderRoleTasks(globalLeaderRows, 'Ms. Đào', 'head-report-grid', monthStr);
            renderRoleTasks(globalLeaderRows, 'Mr. Khôi', 'teacher-report-grid', monthStr);
            renderRoleTasks(globalLeaderRows, 'Ms. Khanh', 'academic-report-grid', monthStr);
            renderRoleTasks(globalLeaderRows, 'Mr. Đạt', 'operation-report-grid', monthStr);
            renderRoleTasks(globalLeaderRows, 'Mr. Trí', 'coo-report-grid', monthStr);
            renderWeeklyReports(globalLeaderRows, 'weekly-report-grid', monthStr);
        }
    }
}

// ==========================================
// GOOGLE SHEET DATA FETCHING AND RENDERING
// ==========================================
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dTcxPgSS2olUtgjjk2ZUvUo8e53Vi6J5Kk4bynKL0OE/gviz/tq?tqx=out:json&gid=1019913137';
const LEADER_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dTcxPgSS2olUtgjjk2ZUvUo8e53Vi6J5Kk4bynKL0OE/gviz/tq?tqx=out:json&gid=1739187215';
const HR_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dTcxPgSS2olUtgjjk2ZUvUo8e53Vi6J5Kk4bynKL0OE/gviz/tq?tqx=out:json&gid=790611745';
const CALENDAR_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dTcxPgSS2olUtgjjk2ZUvUo8e53Vi6J5Kk4bynKL0OE/gviz/tq?tqx=out:json&gid=37609988';

let hrMap = {};
let globalCalendarEvents = [];

function getShortName(fullName) {
    if (!fullName) return '';
    if (hrMap[fullName]) return hrMap[fullName];
    return fullName.split('-')[0].trim();
}

const getVal = (cell) => {
    if (!cell) return '';
    const val = cell.f !== undefined ? cell.f : (cell.v !== undefined ? cell.v : '');
    return String(val);
};

async function fetchDashboardData() {
    try {
        console.log("Loading HR data...");
        try {
            const hrRes = await fetch(HR_SHEET_URL);
            const hrText = await hrRes.text();
            const hrJsonString = hrText.substring(hrText.indexOf('{'), hrText.lastIndexOf('}') + 1);
            const hrJson = JSON.parse(hrJsonString);
            hrJson.table.rows.forEach(row => {
                if(row && row.c && row.c[0] && row.c[5]) {
                    hrMap[row.c[0].v] = row.c[5].v;
                }
            });
            console.log("HR map built.");
        } catch(e) { console.error("Error fetching HR:", e); }

        console.log("Loading data from Google Sheet...");
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const json = JSON.parse(jsonString);
        
        const rows = json.table.rows;
        if (!rows || rows.length < 3) {
            console.warn("Not enough data in Sheet (less than 3 rows).");
            return;
        }

        globalMetricsRow = rows[0].c; 
        globalClassRows = rows.slice(2).filter(row => row && row.c && row.c[1] && row.c[1].v);
        console.log(`Retrieved ${globalClassRows.length} classes.`);
        
        // Initial render based on selected month
        changeMonth(0);
        
        renderTeacherTable(globalClassRows);
        renderAcademicTable(globalClassRows);
        renderOperationTable(globalClassRows);
        console.log("Finished rendering all tables.");
        
        // Fetch Leader Data
        try {
            console.log("Loading leader data...");
            const leaderRes = await fetch(LEADER_SHEET_URL);
            const leaderText = await leaderRes.text();
            const leaderJsonString = leaderText.substring(leaderText.indexOf('{'), leaderText.lastIndexOf('}') + 1);
            const leaderJson = JSON.parse(leaderJsonString);
            const leaderRows = leaderJson.table.rows;
            globalLeaderRows = leaderRows;
            
            const currentMonthVal = currentMonthIndex + 3;
            const currentMonthStr = String(currentMonthVal).padStart(2, '0');
            
            // Render for each role
            renderRoleTasks(globalLeaderRows, 'Ms. Đào', 'head-report-grid', currentMonthStr);
            renderRoleTasks(globalLeaderRows, 'Mr. Khôi', 'teacher-report-grid', currentMonthStr);
            renderRoleTasks(globalLeaderRows, 'Ms. Khanh', 'academic-report-grid', currentMonthStr);
            renderRoleTasks(globalLeaderRows, 'Mr. Đạt', 'operation-report-grid', currentMonthStr);
            renderRoleTasks(globalLeaderRows, 'Mr. Trí', 'coo-report-grid', currentMonthStr);
            
            renderWeeklyReports(globalLeaderRows, 'weekly-report-grid', currentMonthStr);
            
            console.log(`Retrieved leader data.`);
        } catch (err) {
            console.error("Error fetching leader data:", err);
        }
        
        // Fetch Calendar Data
        try {
            console.log("Loading calendar data...");
            const calRes = await fetch(CALENDAR_SHEET_URL);
            const calText = await calRes.text();
            const calJsonString = calText.substring(calText.indexOf('{'), calText.lastIndexOf('}') + 1);
            const calJson = JSON.parse(calJsonString);
            const calRows = calJson.table.rows;
            
            globalCalendarEvents = [];
            calRows.forEach(row => {
                if(!row || !row.c || !row.c[10] || !row.c[10].f) return;
                const dateStr = row.c[10].f; // "dd/mm/yyyy"
                const parts = dateStr.split('/');
                if(parts.length === 3) {
                    const d = new Date(parts[2], parts[1] - 1, parts[0]);
                    globalCalendarEvents.push({
                        date: d,
                        className: getVal(row.c[3]),
                        time: getVal(row.c[14]),
                        teacher: getVal(row.c[6])
                    });
                }
            });
            console.log(`Retrieved ${globalCalendarEvents.length} calendar events.`);
            renderCalendar(0); // Re-render with data
        } catch (err) {
            console.error("Error fetching calendar data:", err);
        }
        
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
}

function updateMetricsCards(classRows, metricsRow) {
    const totalStudents = classRows.reduce((sum, row) => sum + parseInt(getVal(row.c[7]) || 0), 0);
    const totalTeachers = new Set(classRows.map(row => getVal(row.c[8]))).size;
    const totalClasses = classRows.length;
    
    // Tìm thẻ dựa trên text của h3
    document.querySelectorAll('.metric-data').forEach(div => {
        const title = div.querySelector('h3').textContent.trim().toLowerCase();
        const valEl = div.querySelector('.value');
        if (!valEl) return;
        
        if (title === 'total students') valEl.innerText = totalStudents.toLocaleString();
        if (title === 'total classes') valEl.innerText = totalClasses.toLocaleString();
        if (title === 'total teachers') valEl.innerText = totalTeachers.toLocaleString();
        if (title === 'active courses') valEl.innerText = totalClasses.toLocaleString();
    });
}

function renderDashboardTable(classRows) {
    const tbody = document.getElementById('dashboard-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    classRows.slice(0, 10).forEach((row, i) => { 
        const c = row.c;
        const className = getVal(c[6]) || getVal(c[1]);
        const students = getVal(c[7]);
        const teacher = getShortName(getVal(c[8]));
        const testDate = getVal(c[38]);
        const score = getVal(c[39]) || 'N/A';
        const progress = getVal(c[11]);
        const behavior = getVal(c[28]) || 'Good';

        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        tr.innerHTML = `
            <td class="sticky-col"><strong>${className.split(' - ')[0]}</strong></td>
            <td class="text-center font-bold">${students}</td>
            <td>${teacher}</td>
            <td><span class="stat-badge success">95%</span></td>
            <td><span class="stat-badge success">90%</span></td>
            <td>${behavior.length > 15 ? behavior.substring(0,15)+'...' : behavior || 'Good'}</td>
            <td><button class="issue-badge" onclick="openIssues('Teacher', '${className}', 0)">0</button></td>
            <td><div class="test-date"><strong>${testDate || 'None'}</strong></div></td>
            <td><strong>${score}</strong></td>
            <td><span class="trend neutral">${progress || 'On track'}</span></td>
            <td><button class="issue-badge" onclick="openIssues('Academic', '${className}', 0)">0</button></td>
            <td><span class="trend positive">On time</span></td>
            <td>0</td>
            <td><span class="status active">Reported</span></td>
            <td><button class="issue-badge" onclick="openIssues('Operation', '${className}', 0)">0</button></td>
            <td><button class="icon-btn" onclick="openClassDetail('${className}')"><i class="fa-solid fa-arrow-right"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTeacherTable(classRows) {
    const tbody = document.getElementById('teacher-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Group by teacher
    const groupedByTeacher = new Map();
    classRows.forEach(row => {
        const c = row.c;
        const teacherName = getShortName(getVal(c[8])) || 'Unknown';
        if (!groupedByTeacher.has(teacherName)) {
            groupedByTeacher.set(teacherName, []);
        }
        groupedByTeacher.get(teacherName).push(row);
    });

    for (let [teacher, rows] of groupedByTeacher) {
        // Teacher Group Header
        const headerTr = document.createElement('tr');
        headerTr.style.background = 'var(--bg-color)';
        headerTr.innerHTML = `
            <td colspan="8" style="padding: 16px; border-bottom: 2px solid rgba(0,0,0,0.05); position: sticky; left: 0; z-index: 2;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-light); color: var(--primary-dark); display: flex; justify-content: center; align-items: center; font-weight: bold;">
                        <i class="fa-solid fa-chalkboard-user"></i>
                    </div>
                    <span style="font-size: 1.05rem; font-weight: 700; color: var(--primary-dark); text-transform: uppercase;">Teacher: ${teacher}</span>
                    <span class="stat-badge neutral" style="margin-left: auto;">${rows.length} Classes</span>
                </div>
            </td>
        `;
        tbody.appendChild(headerTr);

        // Render Classes for this teacher
        rows.forEach((row) => {
            const c = row.c;
            const className = getVal(c[6]);
            const students = getVal(c[7]);
            const lesson = getVal(c[27]);
            const evaluation = getVal(c[24]);

            const tr = document.createElement('tr');
            tr.className = 'clickable-row';
            tr.innerHTML = `
                <td class="sticky-col" style="padding-left: 24px;"><strong>${className.split(' - ')[0]}</strong></td>
                <td>-</td>
                <td class="text-center font-bold">${students}</td>
                <td><span class="trend neutral">90%</span></td>
                <td><span class="trend positive">95%</span></td>
                <td>${lesson || 'Updating'}</td>
                <td><span class="status ${evaluation ? 'active' : 'pending'}">${evaluation ? 'Reported' : 'None'}</span></td>
                <td>Good</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function renderAcademicTable(classRows) {
    const tbody = document.getElementById('academic-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    classRows.forEach((row) => {
        const c = row.c;
        const className = getVal(c[6]);
        const start = getVal(c[9]);
        const end = getVal(c[10]);
        const status = getVal(c[2]) || '';
        const course = getVal(c[4]);
        const testDate = getVal(c[38]);

        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        tr.innerHTML = `
            <td class="sticky-col"><strong>${className.split(' - ')[0]}</strong></td>
            <td>${start}</td>
            <td>${end}</td>
            <td><span class="trend ${status.includes('Teaching') ? 'positive' : 'neutral'}">${status}</span></td>
            <td><span class="trend neutral">On track</span></td>
            <td>${course}</td>
            <td>${testDate || 'N/A'}</td>
            <td><strong>N/A</strong></td>
            <td><span class="trend neutral">N/A</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderOperationTable(classRows) {
    const tbody = document.getElementById('operation-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    classRows.forEach((row) => {
        const c = row.c;
        const className = getVal(c[6]);
        const students = getVal(c[7]);
        const doanhThu = getVal(c[42]);
        const daThu = getVal(c[43]);
        const congNo = getVal(c[44]);

        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        tr.innerHTML = `
            <td class="sticky-col"><strong>${className.split(' - ')[0]}</strong></td>
            <td>${students}</td>
            <td>${doanhThu || '0'}</td>
            <td><span class="trend positive">${daThu || '0'}</span></td>
            <td><span class="trend ${congNo && congNo !== '0' ? 'negative' : 'positive'}">${congNo || '0'}</span></td>
            <td>0</td>
            <td><span class="status active">Reported</span></td>
            <td>Normal</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderRoleTasks(rows, picName, containerId, monthStr) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const validRows = rows.filter(row => {
        if(!row || !row.c) return false;
        const type = getVal(row.c[2]);
        const pic = getShortName(getVal(row.c[4]));
        const rowMonth = getVal(row.c[20]);
        let rMonthStr = rowMonth;
        if (rowMonth && rowMonth.length === 1) rMonthStr = '0' + rowMonth;
        
        const monthMatches = !monthStr || rMonthStr === monthStr;
        return type === 'Task' && pic === picName && monthMatches;
    });

    if (validRows.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px; background: #fff; border-radius: 12px; border: 1px dashed rgba(0,0,0,0.1);">No tasks found for ${picName} this month.</div>`;
        return;
    }

    let roleTitle = `Weekly Planner - ${picName}`;
    const headerElement = container.previousElementSibling;
    if (headerElement && headerElement.classList.contains('weekly-header')) {
        headerElement.style.display = 'none';
    }

    container.innerHTML = '';
    
    // Split layout wrapper
    const splitWrapper = document.createElement('div');
    splitWrapper.className = 'task-split-container';
    
    // Left: Calendar Board
    const leftDiv = document.createElement('div');
    leftDiv.className = 'task-split-left';
    leftDiv.innerHTML = `<h3 style="margin-top: 0; margin-bottom: 16px; color: var(--text-dark);">${roleTitle}</h3>`;
    
    const board = document.createElement('div');
    board.className = 'planner-board';
    board.style.padding = '0';
    
    // Right: Detail Panel
    const rightDiv = document.createElement('div');
    rightDiv.className = 'task-split-right';
    rightDiv.id = `${containerId}-detail-panel`;
    rightDiv.innerHTML = `<h3 style="color: var(--primary-color); margin-top: 0; margin-bottom: 16px;"><i class="fa-solid fa-inbox"></i> Tasks Overview</h3><p style="color: var(--text-muted); font-size: 0.9rem;">Select a date on the calendar to view tasks.</p>`;

    const parseDateStr = (dateStr) => {
        if (!dateStr) return null;
        const dStr = dateStr.split(' ')[0];
        const parts = dStr.split('/');
        if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        return null;
    };

    let refDate = new Date();
    for (let row of validRows) {
        let d = parseDateStr(getVal(row.c[9]));
        if (d && !isNaN(d)) {
            refDate = d;
            break;
        }
    }
    
    const year = refDate.getFullYear();
    const month = refDate.getMonth();
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // All button top-left
    const blankHeader = document.createElement('div');
    blankHeader.className = 'planner-day-header';
    blankHeader.style.padding = '8px 4px';
    const allBtn = document.createElement('div');
    allBtn.className = 'week-btn';
    allBtn.innerText = 'All';
    allBtn.title = 'View All Month Tasks';
    allBtn.onclick = () => {
        document.querySelectorAll(`#${containerId} .week-btn`).forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        document.querySelectorAll(`#${containerId} .cal-day-active`).forEach(el => {
            el.style.backgroundColor = '';
            el.style.color = 'var(--primary-color)';
        });
        showTaskDetails(picName, year, month, {type: 'all'}, rightDiv.id, validRows);
    };
    blankHeader.appendChild(allBtn);
    board.appendChild(blankHeader);
    
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'planner-day-header';
        header.innerText = day;
        board.appendChild(header);
    });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    
    let firstTuesdayDate = 1;
    for (let day = 1; day <= 7; day++) {
        let d = new Date(year, month, day);
        if (d.getDay() === 2) {
            firstTuesdayDate = day;
            break;
        }
    }
    
    let w1RowIndex = 0;
    for (let r = 0; r < totalCells / 7; r++) {
        let rowStartCell = r * 7;
        let rowEndCell = rowStartCell + 6;
        let indexOfFirstTue = firstDayOfMonth + firstTuesdayDate - 1;
        if (indexOfFirstTue >= rowStartCell && indexOfFirstTue <= rowEndCell) {
            w1RowIndex = r;
            break;
        }
    }
    
    const dayMap = {};
    validRows.forEach(row => {
        const d = parseDateStr(getVal(row.c[9]));
        if (d && !isNaN(d) && d.getMonth() === month && d.getFullYear() === year) {
            const dayNum = d.getDate();
            if (!dayMap[dayNum]) dayMap[dayNum] = [];
            dayMap[dayNum].push(row);
        } else if (!d || isNaN(d)) {
            if (!dayMap['unscheduled']) dayMap['unscheduled'] = [];
            dayMap['unscheduled'].push(row);
        }
    });

    let currentDate = 1;
    window[`tmpValidRows_${containerId}`] = validRows;

    for (let i = 0; i < totalCells; i++) {
        // Start of a week row: inject week button
        if (i % 7 === 0) {
            let rowIdx = i / 7;
            const btnCell = document.createElement('div');
            btnCell.className = 'planner-day-column';
            
            let wStart = new Date(year, month, currentDate - (i >= firstDayOfMonth ? 0 : firstDayOfMonth));
            let wEnd = new Date(wStart);
            wEnd.setDate(wStart.getDate() + 6);
            
            if (rowIdx >= w1RowIndex) {
                let currentW = rowIdx - w1RowIndex + 1;
                const wBtn = document.createElement('div');
                wBtn.className = 'week-btn';
                wBtn.innerText = 'W' + currentW;
                wBtn.title = `View Week ${currentW} Tasks`;
                wBtn.onclick = () => {
                    document.querySelectorAll(`#${containerId} .week-btn`).forEach(b => b.classList.remove('active'));
                    wBtn.classList.add('active');
                    document.querySelectorAll(`#${containerId} .cal-day-active`).forEach(el => {
                        el.style.backgroundColor = '';
                        el.style.color = 'var(--primary-color)';
                    });
                    showTaskDetails(picName, year, month, {type: 'week', start: wStart, end: wEnd, index: currentW}, rightDiv.id, validRows);
                };
                btnCell.appendChild(wBtn);
            }
            board.appendChild(btnCell);
        }
        
        const cell = document.createElement('div');
        cell.className = 'planner-day-column';
        
        if (i >= firstDayOfMonth && currentDate <= daysInMonth) {
            const today = new Date();
            const isToday = currentDate === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            
            let style = `width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto; border-radius: 50%;`;
            if (isToday) {
                style += ` background: var(--primary-color); color: white; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);`;
            }
            
            if (dayMap[currentDate]) {
                if (!isToday) {
                    style += ` border: 2px solid var(--primary-light); color: var(--primary-color); font-weight: 600;`;
                }
                style += ` cursor: pointer; position: relative;`;
                const dateNum = currentDate;
                const tooltip = dayMap[currentDate].map(r => getVal(r.c[6]) || getVal(r.c[11])).join('&#10;');
                cell.innerHTML = `<div style="padding: 4px;" title="${tooltip}"><div style="${style}" class="cal-day-active" id="${containerId}-day-${dateNum}" onclick="
                    document.querySelectorAll('#${containerId} .week-btn').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('#${containerId} .cal-day-active').forEach(el => { el.style.backgroundColor=''; el.style.color='var(--primary-color)'; });
                    this.style.backgroundColor='var(--primary-light)'; this.style.color='var(--primary-dark)';
                    showTaskDetails('${picName}', ${year}, ${month}, ${dateNum}, '${rightDiv.id}', window['tmpValidRows_${containerId}'])
                ">${dateNum}</div></div>`;
            } else {
                cell.innerHTML = `<div style="padding: 4px;"><div style="${style}">${currentDate}</div></div>`;
            }
            currentDate++;
        }
        board.appendChild(cell);
    }
    
    leftDiv.appendChild(board);
    
    if (dayMap['unscheduled'] && dayMap['unscheduled'].length > 0) {
        const unscheduledBtn = document.createElement('button');
        unscheduledBtn.className = 'icon-btn';
        unscheduledBtn.style.cssText = 'margin-top: 16px; background: #f8fafc; color: var(--primary-color); border: 1px dashed rgba(0,0,0,0.1); border-radius: 6px; padding: 12px; width: 100%; font-weight: bold; cursor: pointer; transition: all 0.2s;';
        unscheduledBtn.innerText = `View ${dayMap['unscheduled'].length} Unscheduled Tasks`;
        unscheduledBtn.onclick = () => showTaskDetails(picName, null, null, null, rightDiv.id, validRows);
        leftDiv.appendChild(unscheduledBtn);
    }
    
    splitWrapper.appendChild(leftDiv);
    splitWrapper.appendChild(rightDiv);
    container.appendChild(splitWrapper);
    
    const today = new Date();
    if (today.getMonth() === month && today.getFullYear() === year) {
        let firstDayOfMonth = new Date(year, month, 1).getDay();
        let firstTuesdayDate = 1;
        for (let day = 1; day <= 7; day++) {
            let d = new Date(year, month, day);
            if (d.getDay() === 2) {
                firstTuesdayDate = day;
                break;
            }
        }
        
        let indexOfFirstTue = firstDayOfMonth + firstTuesdayDate - 1;
        let w1RowIndex = Math.floor(indexOfFirstTue / 7);
        
        let todayCellIndex = firstDayOfMonth + today.getDate() - 1;
        let todayRowIndex = Math.floor(todayCellIndex / 7);
        
        if (todayRowIndex < w1RowIndex) {
            const allBtn = Array.from(document.querySelectorAll(`#${containerId} .week-btn`)).find(b => b.innerText === 'All');
            if (allBtn) allBtn.click();
            else showTaskDetails(picName, year, month, {type: 'all'}, rightDiv.id, validRows);
        } else {
            let currentWeek = todayRowIndex - w1RowIndex + 1;
            const weekBtns = Array.from(document.querySelectorAll(`#${containerId} .week-btn`));
            const targetBtn = weekBtns.find(b => b.innerText === 'W' + currentWeek);
            if (targetBtn) {
                targetBtn.click();
            } else {
                // Determine start and end to pass
                let startCell = todayRowIndex * 7;
                let wStart = new Date(year, month, 1 - firstDayOfMonth + startCell);
                let wEnd = new Date(wStart);
                wEnd.setDate(wStart.getDate() + 6);
                showTaskDetails(picName, year, month, {type: 'week', index: currentWeek, start: wStart, end: wEnd}, rightDiv.id, validRows);
            }
        }
    } else if (dayMap['unscheduled'] && dayMap['unscheduled'].length > 0) {
        showTaskDetails(picName, null, null, null, rightDiv.id, validRows);
    } else {
        showTaskDetails(picName, year, month, {type: 'all'}, rightDiv.id, validRows);
    }
}

function showTaskDetails(picName, year, month, date, containerId, validRows) {
    const detailPanel = document.getElementById(containerId);
    if (!detailPanel) return;
    
    let titleHtml = '';
    let targetRows = [];

    const parseDateStr = (dateStr) => {
        if (!dateStr) return null;
        const dStr = dateStr.split(' ')[0];
        const parts = dStr.split('/');
        if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        return null;
    };
    
    if (date && typeof date === 'object') {
        const { type, index } = date;
        if (type === 'week') {
            titleHtml = `<h3 style="color: var(--primary-color); margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-list-check"></i> Week ${index} Tasks</h3>`;
            const { start, end } = date;
            const weekStart = new Date(start);
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(end);
            weekEnd.setHours(23, 59, 59, 999);
            
            targetRows = validRows.filter(row => {
                const d = parseDateStr(getVal(row.c[9]));
                return d && !isNaN(d) && d >= weekStart && d <= weekEnd;
            }).sort((a, b) => {
                const dA = parseDateStr(getVal(a.c[9]));
                const dB = parseDateStr(getVal(b.c[9]));
                if (!dA) return 1;
                if (!dB) return -1;
                return dA - dB;
            });
        } else if (type === 'all') {
            titleHtml = `<h3 style="color: var(--primary-color); margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-border-all"></i> All Month Tasks</h3>`;
            targetRows = validRows.filter(row => {
                const d = parseDateStr(getVal(row.c[9]));
                return d && !isNaN(d);
            }).sort((a, b) => {
                const dA = parseDateStr(getVal(a.c[9]));
                const dB = parseDateStr(getVal(b.c[9]));
                if (!dA) return 1;
                if (!dB) return -1;
                return dA - dB;
            });
        }
    } else if (date) {
        titleHtml = `<h3 style="color: var(--primary-color); margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="fa-regular fa-calendar"></i> ${date}/${month + 1}/${year} Tasks</h3>`;
        targetRows = validRows.filter(row => {
            const d = parseDateStr(getVal(row.c[9]));
            return d && !isNaN(d) && d.getDate() === date && d.getMonth() === month && d.getFullYear() === year;
        });
    } else {
        titleHtml = `<h3 style="color: var(--primary-color); margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-inbox"></i> Unscheduled Tasks</h3>`;
        targetRows = validRows.filter(row => {
            const d = parseDateStr(getVal(row.c[9]));
            return !d || isNaN(d);
        });
    }

    let listHtml = '';
    if (targetRows.length === 0) {
        listHtml = '<p style="color: var(--text-muted);">No tasks found.</p>';
    } else {
        targetRows.forEach(row => {
            const c = row.c;
            const status = getVal(c[1]) || 'New';
            
            let statusBg = 'var(--bg-color)';
            let statusColor = 'var(--text-muted)';
            
            if (status.includes('Completed')) {
                statusBg = 'rgba(46, 204, 113, 0.1)';
                statusColor = 'var(--success)';
            } else if (status.includes('Processing')) {
                statusBg = 'rgba(243, 156, 18, 0.1)';
                statusColor = 'var(--warning)';
            } else if (status.includes('New')) {
                statusBg = 'rgba(231, 76, 60, 0.1)';
                statusColor = 'var(--danger)'; // Red for new
            }

            const category = getVal(c[5]) || getVal(c[15]);
            const plan = getVal(c[6]) || getVal(c[11]);
            const deadline = getVal(c[9]);
            
            listHtml += `
                <div class="modern-card" style="border-left: 4px solid ${statusColor}; margin-bottom: 0;">
                    <div class="modern-card-header">
                        <span class="status-badge" style="background: ${statusBg}; color: ${statusColor};">${status}</span>
                        <span class="category-badge"><i class="fa-solid fa-tag"></i> ${category || 'Task'}</span>
                        <span class="deadline-badge"><i class="fa-regular fa-clock"></i> ${deadline || 'No Deadline'}</span>
                    </div>
                    <div class="modern-card-body">
                        ${plan || 'No details provided'}
                    </div>
                </div>
            `;
        });
    }

    if (targetRows.length > 0) {
        detailPanel.innerHTML = titleHtml + `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;">${listHtml}</div>`;
    } else {
        detailPanel.innerHTML = titleHtml + listHtml;
    }
}

function renderWeeklyReports(rows, containerId, monthStr) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    // Filter rows by Type === 'Report' and Month
    const reportRows = rows.filter(row => {
        if(!row || !row.c) return false;
        const type = getVal(row.c[2]);
        const rowMonth = getVal(row.c[20]);
        let rMonthStr = rowMonth;
        if (rowMonth && rowMonth.length === 1) rMonthStr = '0' + rowMonth;
        
        const monthMatches = !monthStr || rMonthStr === monthStr;
        return type === 'Report' && monthMatches && (getVal(row.c[4]) !== '' || getVal(row.c[6]) !== '');
    });
    
    if (reportRows.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px; background: #fff; border-radius: 12px; border: 1px dashed rgba(0,0,0,0.1);">No reports found this month.</div>`;
        return;
    }
    
    // Group by PIC and Week
    const dataMap = {};
    const weeksSet = new Set();
    const picsSet = new Set();
    
    reportRows.forEach(row => {
        const pic = getShortName(getVal(row.c[4])) || 'Unknown';
        let week = getVal(row.c[19]) || 'W1';
        // Normalize week name (e.g. "1" -> "Week 1")
        if (!week.toLowerCase().includes('week') && !week.toLowerCase().includes('w')) {
            week = 'Week ' + week;
        } else if (week.toLowerCase().startsWith('w') && week.length === 2) {
            week = 'Week ' + week.substring(1);
        }
        
        picsSet.add(pic);
        weeksSet.add(week);
        
        if (!dataMap[pic]) dataMap[pic] = {};
        if (!dataMap[pic][week]) dataMap[pic][week] = [];
        dataMap[pic][week].push(row);
    });

    const pics = Array.from(picsSet).sort();
    const weeks = Array.from(weeksSet).sort();

    const tableWrapper = document.createElement('div');
    tableWrapper.style.overflowX = 'auto';
    
    const table = document.createElement('table');
    table.className = 'report-table';
    
    let thead = '<thead><tr><th style="min-width: 120px;">PIC</th>';
    weeks.forEach(w => {
        thead += `<th style="min-width: 250px;">${w}</th>`;
    });
    thead += '</tr></thead>';
    table.innerHTML = thead;
    
    const tbody = document.createElement('tbody');
    pics.forEach(pic => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td style="font-weight: 600; color: var(--primary-color); vertical-align: middle; text-align: center;">${pic}</td>`;
        
        weeks.forEach(week => {
            const cell = document.createElement('td');
            if (dataMap[pic][week]) {
                const contentDiv = document.createElement('div');
                contentDiv.className = 'report-table-cell-content';
                
                dataMap[pic][week].forEach(row => {
                    const c = row.c;
                    const win = getVal(c[12]);
                    const redFlag = getVal(c[13]);
                    const top5 = getVal(c[14]);
                    
                    let html = '';
                    if (win) html += `<div class="report-item"><strong>Win:</strong> ${win}</div>`;
                    if (redFlag) html += `<div class="report-item" style="color: var(--danger);"><strong>Red Flag:</strong> ${redFlag}</div>`;
                    if (top5) html += `<div class="report-item"><strong>Top 5 Things:</strong> ${top5}</div>`;
                    
                    if (!html) {
                        html = `<div class="report-item" style="color: var(--text-muted); font-style: italic;">No specific highlights.</div>`;
                    }
                    
                    const block = document.createElement('div');
                    block.style.background = '#fafafa';
                    block.style.padding = '8px';
                    block.style.borderRadius = '6px';
                    block.style.border = '1px solid rgba(0,0,0,0.05)';
                    block.innerHTML = html;
                    contentDiv.appendChild(block);
                });
                
                cell.appendChild(contentDiv);
            } else {
                cell.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">No report</span>';
                cell.style.textAlign = 'center';
                cell.style.verticalAlign = 'middle';
            }
            tr.appendChild(cell);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

function renderHeadTable(classRows) {
    const tbody = document.getElementById('head-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // Calculate Head metrics based on globalLeaderRows and classRows
    let totalClasses = classRows.length;
    let totalStudents = 0;
    classRows.forEach(row => {
        const studentsStr = getVal(row.c[7]);
        if(studentsStr) totalStudents += parseInt(studentsStr) || 0;
        
        const c = row.c;
        const className = getVal(c[6]);
        const teacher = getShortName(getVal(c[12]));
        const ta = getShortName(getVal(c[16]));
        const course = getVal(c[4]);
        const status = getVal(c[2]) || '';
        const start = getVal(c[9]);
        const end = getVal(c[10]);

        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        tr.innerHTML = `
            <td class="sticky-col"><strong>${className.split(' - ')[0]}</strong></td>
            <td>${teacher}</td>
            <td>${ta}</td>
            <td>${course}</td>
            <td>${getVal(c[7]) || '0'}</td>
            <td><span class="trend ${status.includes('Teaching') ? 'positive' : 'neutral'}">${status}</span></td>
            <td>${start}</td>
            <td>${end}</td>
        `;
        tbody.appendChild(tr);
    });
    
    // Update Head Metrics DOM
    const tsEl = document.getElementById('head-total-students');
    if(tsEl) tsEl.innerText = totalStudents;
    const tcEl = document.getElementById('head-total-classes');
    if(tcEl) tcEl.innerText = totalClasses;
    
    // Calculate Completion Rate for Ms. Đào
    const headTasks = globalLeaderRows.filter(row => row && row.c && getShortName(getVal(row.c[4])) === 'Ms. Đào' && getVal(row.c[2]) === 'Task');
    let completedHeadTasks = 0;
    headTasks.forEach(t => {
        if(getVal(t.c[1]).includes('Completed')) completedHeadTasks++;
    });
    const completionEl = document.getElementById('head-task-completion');
    if(completionEl) {
        if(headTasks.length > 0) {
            completionEl.innerText = Math.round((completedHeadTasks / headTasks.length) * 100) + '%';
        } else {
            completionEl.innerText = 'N/A';
        }
    }
}

let currentCalDate = new Date();

function renderCalendar(monthOffset = 0) {
    currentCalDate.setMonth(currentCalDate.getMonth() + monthOffset);
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthYearEl = document.getElementById('cal-month-year');
    if (monthYearEl) {
        monthYearEl.innerText = `${monthNames[month]} ${year}`;
    }
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    
    let html = `
        <div style="font-weight:bold; color:var(--text-muted); font-size:0.85rem;">Sun</div>
        <div style="font-weight:bold; color:var(--text-muted); font-size:0.85rem;">Mon</div>
        <div style="font-weight:bold; color:var(--text-muted); font-size:0.85rem;">Tue</div>
        <div style="font-weight:bold; color:var(--text-muted); font-size:0.85rem;">Wed</div>
        <div style="font-weight:bold; color:var(--text-muted); font-size:0.85rem;">Thu</div>
        <div style="font-weight:bold; color:var(--text-muted); font-size:0.85rem;">Fri</div>
        <div style="font-weight:bold; color:var(--text-muted); font-size:0.85rem;">Sat</div>
    `;
    
    for(let i=0; i<firstDay; i++) {
        html += `<div></div>`;
    }
    
    const today = new Date();
    
    // Map events for this month
    const monthEvents = globalCalendarEvents.filter(e => e.date.getFullYear() === year && e.date.getMonth() === month);
    const dayMap = {};
    monthEvents.forEach(e => {
        const d = e.date.getDate();
        if(!dayMap[d]) dayMap[d] = [];
        dayMap[d].push(e);
    });

    for(let i=1; i<=daysInMonth; i++) {
        const isToday = today.getDate() === i && today.getMonth() === month && today.getFullYear() === year;
        
        let style = `width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto; border-radius: 50%;`;
        let tooltip = '';
        
        if (isToday) {
            style += ` background: var(--primary-color); color: white; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);`;
        }
        
        if (dayMap[i]) {
            // Day has events
            if (!isToday) {
                style += ` border: 2px solid var(--primary-light); color: var(--primary-color); font-weight: 600;`;
            }
            tooltip = dayMap[i].map(e => `${e.time} - ${e.className.split(' - ')[0]}`).join('&#10;');
            style += ` cursor: pointer; position: relative;`;
            html += `<div style="padding: 4px;" title="${tooltip}" onclick="selectCalendarDate(${year}, ${month}, ${i})"><div style="${style}" class="cal-day-active" id="cal-day-${year}-${month}-${i}">${i}</div></div>`;
        } else {
            html += `<div style="padding: 4px;"><div style="${style}">${i}</div></div>`;
        }
    }
    grid.innerHTML = html;
}

function selectCalendarDate(year, month, day) {
    // Reset all day styles to remove active selection
    document.querySelectorAll('.cal-day-active').forEach(el => {
        el.style.backgroundColor = '';
        el.style.color = '';
        if (el.style.border) el.style.color = 'var(--primary-color)'; // restore text color
    });
    
    // Highlight selected day
    const selectedEl = document.getElementById(`cal-day-${year}-${month}-${day}`);
    if (selectedEl) {
        selectedEl.style.backgroundColor = 'var(--primary-light)';
        selectedEl.style.color = 'var(--primary-dark)';
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('selected-date-display').innerText = `${monthNames[month]} ${day}, ${year}`;
    
    const listEl = document.getElementById('daily-classes-list');
    const nqHeaderEl = document.getElementById('header-nq');
    const hdHeaderEl = document.getElementById('header-hd');
    
    const dayEvents = globalCalendarEvents.filter(e => e.date.getFullYear() === year && e.date.getMonth() === month && e.date.getDate() === day);
    
    // Sort events by time (morning -> afternoon) then by branch
    dayEvents.sort((a, b) => {
        const timeA = a.time ? a.time.split(' - ')[0].trim() : '24:00';
        const timeB = b.time ? b.time.split(' - ')[0].trim() : '24:00';
        if (timeA !== timeB) return timeA.localeCompare(timeB);
        return (a.className || '').localeCompare(b.className || '');
    });
    
    if (dayEvents.length === 0) {
        listEl.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding-top: 24px;">No classes scheduled for this date.</p>`;
        if (nqHeaderEl) nqHeaderEl.style.display = 'none';
        if (hdHeaderEl) hdHeaderEl.style.display = 'none';
        return;
    } else {
        if (nqHeaderEl) nqHeaderEl.style.display = 'block';
        if (hdHeaderEl) hdHeaderEl.style.display = 'block';
    }
    
    // Group events within 15 minutes of start time
    const groups = [];
    dayEvents.forEach(e => {
        const timeKey = e.time || '24:00 - 24:00';
        const startStr = timeKey.split(' - ')[0].trim();
        const parts = startStr.split(':');
        const minutes = parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : Number.MAX_SAFE_INTEGER;
        e._startMins = minutes;

        if (groups.length === 0) {
            groups.push([e]);
        } else {
            const currentGroup = groups[groups.length - 1];
            const groupStartMins = currentGroup[0]._startMins;
            if (Math.abs(minutes - groupStartMins) <= 15) {
                currentGroup.push(e);
            } else {
                groups.push([e]);
            }
        }
    });

    let html = '';
    
    const renderEventCard = (e, showTime) => {
        const parts = e.className.split(' - ')[0].split(' | ');
        const branch = parts.length > 1 ? parts[0].trim() : '';
        const cName = parts.length > 1 ? parts.slice(1).join(' | ').trim() : parts[0].trim();
        
        let branchText = 'var(--primary-dark)';
        if (branch.includes('NQ')) branchText = '#0284c7'; // Blue
        if (branch.includes('HD')) branchText = '#059669'; // Green
        
        const leftBorder = branch ? branchText : 'var(--primary-color)';
        const timeHtml = showTime ? `<span style="background: var(--bg-color); padding: 1px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: normal; flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; color: var(--text-muted);"><i class="fa-regular fa-clock"></i> ${e.time}</span>` : '';

        return `
        <div class="daily-class-card" style="background: white; border-left: 3px solid ${leftBorder}; border-radius: 6px; padding: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 4px; transition: transform 0.2s; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <div style="font-weight: 600; color: var(--text-dark); font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cName}">${cName}</div>
                ${timeHtml}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${e.time} - ${getShortName(e.teacher)}">
                <i class="fa-solid fa-chalkboard-user" style="margin-right: 4px;"></i> <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${getShortName(e.teacher)}</span>
            </div>
        </div>
        `;
    };

    for (let events of groups) {
        const validTimes = events.map(e => e.time).filter(Boolean);
        const uniqueTimes = new Set(validTimes);
        const hasSameTime = uniqueTimes.size <= 1;
        
        let groupBadgeTime = '';
        if (validTimes.length > 0) {
            if (hasSameTime) {
                groupBadgeTime = validTimes[0];
            } else {
                const startTimes = [];
                const endTimes = [];
                validTimes.forEach(t => {
                    const parts = t.split(' - ');
                    if (parts.length === 2) {
                        startTimes.push(parts[0].trim());
                        endTimes.push(parts[1].trim());
                    } else {
                        startTimes.push(t.trim());
                        endTimes.push(t.trim());
                    }
                });
                startTimes.sort();
                endTimes.sort();
                groupBadgeTime = `${startTimes[0]} - ${endTimes[endTimes.length - 1]}`;
            }
        }
        
        const nqEvents = events.filter(e => e.className.includes('NQ'));
        const hdEvents = events.filter(e => e.className.includes('HD'));
        const otherEvents = events.filter(e => !e.className.includes('NQ') && !e.className.includes('HD'));
        nqEvents.push(...otherEvents); // Fallback for other classes

        if (groupBadgeTime) {
            // Always Central Badge
            html += `
                <div style="margin-top: 16px; margin-bottom: 16px; position: relative; height: 24px; display: flex; justify-content: center; align-items: center;">
                    <div style="position: absolute; top: 50%; left: 0; right: 0; border-top: 1px dashed rgba(0,0,0,0.1); z-index: 1;"></div>
                    <span style="position: relative; z-index: 2; background: white; padding: 2px 16px; color: var(--primary-color); font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 20px; border: 1px solid rgba(0,0,0,0.05);">
                        <i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${groupBadgeTime}
                    </span>
                </div>
            `;
        }

        const showTimeInCard = !hasSameTime;

        html += `
            <div style="display: flex; gap: 20px; margin-bottom: 24px;">
                <!-- NQ Column -->
                <div style="flex: 1; border-right: 1px dashed rgba(0,0,0,0.1); padding-right: 20px; min-width: 0;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        ${nqEvents.map(e => renderEventCard(e, showTimeInCard)).join('')}
                    </div>
                </div>
                
                <!-- HD Column -->
                <div style="flex: 1; min-width: 0;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        ${hdEvents.map(e => renderEventCard(e, showTimeInCard)).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    listEl.innerHTML = html;
}
