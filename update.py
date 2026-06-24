import re

path = 'D:/3. Project/App/Potato English Center/Dashboard/script.js'
with open(path, 'r', encoding='utf8') as f:
    content = f.read()

filterReplace = """let rowsToRender = window.currentMonthFilteredRows || [];
    
    if (selectedTeacher !== 'all') {
        rowsToRender = rowsToRender.filter(row => 
            getShortName(getVal(row.c[8])) === selectedTeacher || 
            getShortName(getVal(row.c[9])) === selectedTeacher
        );
    }
    
    const bSelect = document.getElementById('teacherBranchFilter');
    let selectedBranch = 'all';
    if (bSelect) selectedBranch = bSelect.value;
    
    if (selectedBranch !== 'all') {
        rowsToRender = rowsToRender.filter(row => {
            let rawBranch = getVal(row.c[3]) || '';
            if (selectedBranch === 'HD') return rawBranch.includes('HD') || rawBranch.includes('Hưng Định');
            if (selectedBranch === 'NQ') return !rawBranch.includes('HD') && !rawBranch.includes('Hưng Định');
            return true;
        });
    }
    
    const monthVal = typeof currentMonthIndex !== 'undefined' ? currentMonthIndex + 3 : 3;
    const monthStr = String(monthVal).padStart(2, '0');
    renderTeacherPerformance(rowsToRender, monthStr);"""

content = re.sub(r'let rowsToRender = window\.currentMonthFilteredRows \|\| \[\];[\s\S]*?renderTeacherPerformance\(rowsToRender, monthStr\);', filterReplace, content)

visReplace = """if (!isAdmin && !isLeader && currentUser) {
        // Teacher user: force selection to their title (e.g. 'Mr. Khôi')
        selectedTeacher = currentUser.title || getShortName(currentUser.name);
        if (tSelect) tSelect.style.display = 'none';
        const bSelect = document.getElementById('teacherBranchFilter');
        if (bSelect) bSelect.style.display = 'none';
    } else {
        // Admin/Leader user: use the dropdown
        if (tSelect) {
            tSelect.style.display = 'inline-block';
            selectedTeacher = tSelect.value;
        }
        const bSelect = document.getElementById('teacherBranchFilter');
        if (bSelect) bSelect.style.display = 'inline-block';
    }"""

content = re.sub(r'if \(!isAdmin && !isLeader && currentUser\) \{[\s\S]*?selectedTeacher = tSelect\.value;\n        \}\n    \}', visReplace, content)

oldRenderFuncStart = content.find('function renderTeacherPerformance(classRows, currentMonthStr) {')
nextFuncStart = content.find('function renderAcademicPerformance(classRows) {')

if oldRenderFuncStart != -1 and nextFuncStart != -1:
    before = content[:oldRenderFuncStart]
    after = content[nextFuncStart:]
    
    newRenderFunc = """function renderTeacherPerformance(classRows, currentMonthStr) {
    const grid = document.getElementById('teacher-performance-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const departmentMap = {};

    classRows.forEach(row => {
        const c = row.c;
        const department = getVal(c[5]) || 'Unknown Department';
        if (!departmentMap[department]) {
            departmentMap[department] = { rows: [], count: 0 };
        }
        departmentMap[department].rows.push(row);
        departmentMap[department].count++;
    });

    const departments = Object.keys(departmentMap).sort((a, b) => a.localeCompare(b));
    let hasAnyData = departments.length > 0;

    if (!hasAnyData) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; padding: 48px; text-align: center; color: var(--text-muted); background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);"><i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 16px; color: #cbd5e1;"></i><p style="font-size: 1.1rem; margin: 0;">No classes available for this teacher in the selected month.</p></div>';
        return;
    }

    departments.forEach(department => {
        const data = departmentMap[department];
        const sortedRows = data.rows.sort((a, b) => {
            const classA = String(getVal(a.c[6]) || '');
            const classB = String(getVal(b.c[6]) || '');
            return classA.localeCompare(classB, undefined, { numeric: true, sensitivity: 'base' });
        });

        const deptTotalStudents = data.rows.reduce((sum, row) => sum + parseInt(getVal(row.c[7]) || 0), 0);
        let colorStr = '#3498db';
        let bgStr = 'rgba(52, 152, 219, 0.1)';

        const card = document.createElement('div');
        card.className = 'modern-card panel';
        card.style.margin = '0';
        card.innerHTML = `
            <div class="modern-card-header" style="justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.05); margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 1.1rem; color: var(--primary-dark); display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-layer-group"></i> ${department}
                </h3>
                <div style="display: flex; gap: 8px;">
                    <span class="status-badge" style="background: ${bgStr}; color: ${colorStr}; margin: 0;">${data.count} Classes</span>
                    <span class="status-badge" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; margin: 0;">${deptTotalStudents} Students</span>
                </div>
            </div>
            <div class="modern-card-body" style="padding: 0;">
                <div style="overflow-x: auto;">
                    <table class="modern-table" style="width: 100%; font-size: 0.85rem; min-width: 450px; table-layout: fixed;">
                        <thead>
                            <tr>
                                <th style="padding: 8px; width: 40%;">Class</th>
                                <th style="padding: 8px; width: 20%; text-align: left;">Teacher</th>
                                <th style="padding: 8px; width: 10%; text-align: center;">Absence</th>
                                <th style="padding: 8px; width: 15%; text-align: center;">Progress</th>
                                <th style="padding: 8px; width: 15%; text-align: center;">Exam Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedRows.map(row => {
                                const c = row.c;
                                const className = formatClassName(getVal(c[6]) || getVal(c[1]));
                                const teacherName = getShortName(getVal(c[9])) || '-';
                                const studentCount = parseInt(getVal(c[7]) || 0);
                                const schedule = getVal(c[12]) || '-';
                                const absence = getVal(c[33]) || '-';
                                const progress = getVal(c[34]) || getVal(c[11]) || '-';
                                const examDate = getVal(c[39]) || '-';
                                const achievement = getVal(c[30]) || '-';
                                const redFlag = getVal(c[31]) || '-';
                                const action = getVal(c[32]) || '-';
                                
                                let formattedExamDate = examDate;
                                if (examDate && examDate !== '-') {
                                    if (examDate.includes('Date(')) {
                                        const parts = examDate.replace('Date(', '').replace(')', '').split(',');
                                        if (parts.length >= 3) {
                                            formattedExamDate = \\`${String(parts[2]).padStart(2, '0')}/${String(parseInt(parts[1])+1).padStart(2, '0')}/${parts[0]}\\`;
                                        }
                                    }
                                }

                                const rowId = \\`class-row-${Math.random().toString(36).substr(2, 9)}\\`;
                                
                                let trHtml = \\`<tr style="cursor: pointer;" onclick="openClassDetail(this)" 
                                    data-class="${escapeHtml(className)}"
                                    data-teacher="${escapeHtml(teacherName)}"
                                    data-students="${studentCount}"
                                    data-schedule="${escapeHtml(schedule)}"
                                    data-absence="${escapeHtml(absence)}"
                                    data-progress="${escapeHtml(progress)}"
                                    data-exam="${escapeHtml(formattedExamDate)}"
                                    data-achievement="${escapeHtml(achievement)}"
                                    data-redflag="${escapeHtml(redFlag)}"
                                    data-action="${escapeHtml(action)}"
                                    data-raw="${escapeHtml(JSON.stringify(row))}"
                                >\\`;
                                trHtml += \\`<td style="padding: 8px;">
                                    <div style="font-weight: 600; color: var(--primary-color);">${className}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;"><i class="fa-regular fa-clock"></i> ${schedule}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-users"></i> ${studentCount} students</div>
                                </td>\\`;
                                trHtml += \\`<td style="padding: 8px; text-align: left; vertical-align: middle;">${teacherName}</td>\\`;
                                trHtml += \\`<td style="padding: 8px; text-align: center; vertical-align: middle;"><span class="status-badge ${absence !== '-' ? 'alert' : ''}" style="display:inline-block;">${absence}</span></td>\\`;
                                trHtml += \\`<td style="padding: 8px; text-align: center; vertical-align: middle;">${progress}</td>\\`;
                                trHtml += \\`<td style="padding: 8px; text-align: center; vertical-align: middle;">${formattedExamDate}</td>\\`;
                                trHtml += \\`</tr>\\`;
                                return trHtml;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}
"""
    content = before + newRenderFunc + '\n' + after

with open(path, 'w', encoding='utf8') as f:
    f.write(content)
print("Done")
