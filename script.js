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
        }

        // Update DOM boards safely
        const boards = document.querySelectorAll('.weekly-board');
        if(boards.length >= 3) {
            boards.forEach(b => {
                b.style.transition = 'opacity 0.2s';
                b.style.opacity = '0.3';
            });

            setTimeout(() => {
                updateBoard(boards[0], data.teacher);
                updateBoard(boards[1], data.academic);
                updateBoard(boards[2], data.operation);
                boards.forEach(b => b.style.opacity = '1');
            }, 200);
        }
    }
}

function updateBoard(boardNode, deptData) {
    const focusEl = boardNode.querySelector('.focus-one-thing h3');
    const planEl = boardNode.querySelector('.plan-col ul');
    const resultEl = boardNode.querySelector('.result-col ul');
    const actionEl = boardNode.querySelector('.action-col ul');

    if(focusEl) focusEl.innerText = deptData.focus;
    if(planEl) planEl.innerHTML = deptData.plan.map(p => `<li>${p}</li>`).join('');
    if(resultEl) resultEl.innerHTML = deptData.result.map(p => `<li>${p}</li>`).join('');
    if(actionEl) actionEl.innerHTML = deptData.action.map(p => `<li>${p}</li>`).join('');
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
            renderLeaderTable(leaderRows);
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

    classRows.forEach((row) => {
        const c = row.c;
        const className = getVal(c[6]);
        const students = getVal(c[7]);
        const teacher = getShortName(getVal(c[8]));
        const lesson = getVal(c[27]);
        const evaluation = getVal(c[24]);

        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        tr.innerHTML = `
            <td class="sticky-col"><strong>${className.split(' - ')[0]}</strong></td>
            <td>${teacher}</td>
            <td>-</td>
            <td>${students}</td>
            <td><span class="trend neutral">90%</span></td>
            <td><span class="trend positive">95%</span></td>
            <td>${lesson || 'Updating'}</td>
            <td>${evaluation ? 'Reported' : 'None'}</td>
            <td>Good</td>
        `;
        tbody.appendChild(tr);
    });
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

function renderLeaderTable(rows) {
    const tbody = document.getElementById('leader-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const validRows = rows.filter(row => row && row.c && (getVal(row.c[4]) !== '' || getVal(row.c[6]) !== ''));
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    validRows.forEach(row => {
        const c = row.c;
        const status = getVal(c[1]);
        const type = getVal(c[2]); // Task, Report
        const pic = getShortName(getVal(c[4])); // Name only
        const category = getVal(c[5]) || getVal(c[15]);
        const plan = getVal(c[6]) || getVal(c[11]); // Support report descriptions
        const result = getVal(c[7]) || getVal(c[12]);
        const deadline = getVal(c[9]);
        
        if (type === 'Task') {
            totalTasks++;
            if (status.includes('Completed')) completedTasks++;
        }
        
        // Status styling
        let statusBadge = 'neutral';
        if (status.includes('Completed')) statusBadge = 'positive';
        else if (status.includes('Processing')) statusBadge = 'warning';
        else if (status.includes('New')) statusBadge = 'neutral';
        
        const tr = document.createElement('tr');
        tr.className = 'clickable-row';
        tr.innerHTML = `
            <td class="sticky-col"><strong>${pic || 'N/A'}</strong></td>
            <td><span class="stat-badge ${type === 'Task' ? 'neutral' : 'success'}">${type || 'N/A'}</span></td>
            <td>${category || 'N/A'}</td>
            <td><div style="white-space: pre-wrap; font-size: 0.9em; max-width: 400px;">${plan}</div></td>
            <td><div style="white-space: pre-wrap; font-size: 0.9em; max-width: 400px;">${result}</div></td>
            <td>${deadline || 'N/A'}</td>
            <td><span class="trend ${statusBadge}">${status || 'N/A'}</span></td>
        `;
        tbody.appendChild(tr);
    });
    
    // Render Leader Metrics
    const metricsGrid = document.getElementById('leader-metrics');
    if (metricsGrid) {
        metricsGrid.innerHTML = `
            <div class="metric-card card-blue panel">
                <div class="metric-data">
                    <h3>Total Tasks</h3>
                    <p class="value">${totalTasks}</p>
                </div>
                <div class="metric-top">
                    <div class="metric-icon"><i class="fa-solid fa-list-check"></i></div>
                </div>
            </div>
            <div class="metric-card card-green panel">
                <div class="metric-data">
                    <h3>Completed Tasks</h3>
                    <p class="value">${completedTasks}</p>
                </div>
                <div class="metric-top">
                    <div class="metric-icon highlight"><i class="fa-solid fa-check-double"></i></div>
                </div>
            </div>
            <div class="metric-card card-orange panel">
                <div class="metric-data">
                    <h3>Completion Rate</h3>
                    <p class="value">${totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}%</p>
                </div>
                <div class="metric-top">
                    <div class="metric-icon alert"><i class="fa-solid fa-chart-pie"></i></div>
                </div>
            </div>
        `;
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
    document.getElementById('selected-date-display').innerText = `Classes on ${monthNames[month]} ${day}, ${year}`;
    
    const listEl = document.getElementById('daily-classes-list');
    
    const dayEvents = globalCalendarEvents.filter(e => e.date.getFullYear() === year && e.date.getMonth() === month && e.date.getDate() === day);
    
    // Sort events by time (morning -> afternoon) then by branch
    dayEvents.sort((a, b) => {
        const timeA = a.time ? a.time.split(' - ')[0].trim() : '24:00';
        const timeB = b.time ? b.time.split(' - ')[0].trim() : '24:00';
        if (timeA !== timeB) return timeA.localeCompare(timeB);
        return (a.className || '').localeCompare(b.className || '');
    });
    
    if (dayEvents.length === 0) {
        listEl.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No classes scheduled for this date.</p>`;
        return;
    }
    
    const grouped = new Map();
    dayEvents.forEach(e => {
        const timeKey = e.time || 'Time not set';
        if (!grouped.has(timeKey)) grouped.set(timeKey, []);
        grouped.get(timeKey).push(e);
    });

    let html = '';
    for (let [time, events] of grouped) {
        // Group Header
        html += `
            <div style="margin-top: 8px; margin-bottom: 8px; border-bottom: 1px dashed rgba(0,0,0,0.1); padding-bottom: 4px;">
                <span style="color: var(--primary-color); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">
                    <i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${time}
                </span>
            </div>
        `;
        
        events.forEach(e => {
            const parts = e.className.split(' - ')[0].split(' | ');
            const branch = parts.length > 1 ? parts[0].trim() : '';
            const cName = parts.length > 1 ? parts.slice(1).join(' | ').trim() : parts[0].trim();
            
            // Highlight color based on branch
            let branchBg = 'var(--primary-light)'; // Default
            let branchText = 'var(--primary-dark)';
            if (branch.includes('NQ')) { branchBg = 'rgba(14, 165, 233, 0.15)'; branchText = '#0284c7'; } // Blue
            if (branch.includes('HD')) { branchBg = 'rgba(16, 185, 129, 0.15)'; branchText = '#059669'; } // Green
            
            const branchBadge = branch ? `<span style="background: ${branchBg}; color: ${branchText}; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: bold; margin-right: 8px;">${branch}</span>` : '';
            const leftBorder = branch ? branchText : 'var(--primary-color)';

            html += `
            <div class="daily-class-card" style="background: white; border-left: 3px solid ${leftBorder}; border-radius: 6px; padding: 12px; margin-bottom: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 6px; transition: transform 0.2s;">
                <div style="display: flex; align-items: center;">
                    ${branchBadge}
                    <span style="font-weight: 600; color: var(--text-dark); font-size: 0.9rem;">${cName}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                    <i class="fa-solid fa-chalkboard-user"></i> <span>${getShortName(e.teacher)}</span>
                </div>
            </div>
            `;
        });
    }
    
    listEl.innerHTML = html;
}
