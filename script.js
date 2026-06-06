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
    }
};

let currentMonthIndex = 1;

function changeMonth(diff) {
    let newIndex = currentMonthIndex + diff;
    if(mockMonthlyData[newIndex]) {
        currentMonthIndex = newIndex;
        const data = mockMonthlyData[currentMonthIndex];
        
        // Update Label
        document.getElementById('currentMonthDisplay').innerText = data.label;
        document.getElementById('prevMonthBtn').style.opacity = currentMonthIndex === 0 ? '0.3' : '1';
        document.getElementById('nextMonthBtn').style.opacity = currentMonthIndex === 2 ? '0.3' : '1';

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

const getVal = (cell) => {
    if (!cell) return '';
    const val = cell.f !== undefined ? cell.f : (cell.v !== undefined ? cell.v : '');
    return String(val);
};

async function fetchDashboardData() {
    try {
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

        const metricsRow = rows[0].c; 
        const classRows = rows.slice(2).filter(row => row && row.c && row.c[1] && row.c[1].v);
        console.log(`Retrieved ${classRows.length} classes.`);
        
        updateMetricsCards(classRows, metricsRow);
        renderDashboardTable(classRows);
        renderTeacherTable(classRows);
        renderAcademicTable(classRows);
        renderOperationTable(classRows);
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
        const title = div.querySelector('h3').innerText;
        const valEl = div.querySelector('.value');
        if (!valEl) return;
        
        if (title === 'Total Students') valEl.innerText = totalStudents.toLocaleString();
        if (title === 'Total Classes') valEl.innerText = totalClasses.toLocaleString();
        if (title === 'Total Teachers') valEl.innerText = totalTeachers.toLocaleString();
        if (title === 'Active Courses') valEl.innerText = totalClasses.toLocaleString();
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
        const teacher = (getVal(c[8]) || '').split('-')[0].trim();
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
        const teacher = (getVal(c[8]) || '').split('-')[0].trim();
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
        const pic = (getVal(c[4]) || '').split('-')[0].trim(); // Name only
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
