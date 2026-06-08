function renderTeacherPerformance(classRows) {
    const grid = document.getElementById('teacher-performance-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const teacherMap = {};
    classRows.forEach(row => {
function updateRoleTaskMetrics(roleName, prefix, monthStr, prevMonthStr) {
    if (!globalLeaderRows || globalLeaderRows.length === 0) return;

    // 1. Current Month Data
    const currentTasks = globalLeaderRows.filter(row => {
        if (!row || !row.c || getShortName(getVal(row.c[4])) !== roleName || getVal(row.c[2]) !== 'Task') return false;
        const deadline = getVal(row.c[9]) || '';
        const parts = deadline.split('/');
        return parts.length >= 2 && parts[1] === monthStr;
    });

    let currentPending = 0;
    let currentCompleted = 0;
    currentTasks.forEach(t => {
        if (!(getVal(t.c[1]) || '').includes('Completed')) currentPending++;
        else currentCompleted++;
    });
    const currentCompletion = currentTasks.length > 0 ? Math.round((currentCompleted / currentTasks.length) * 100) : 0;

    // 2. Previous Month Data
    let prevPending = 0;
    let prevCompleted = 0;
    let prevCompletion = 0;

    if (prevMonthStr) {
        const prevTasks = globalLeaderRows.filter(row => {
            if (!row || !row.c || getShortName(getVal(row.c[4])) !== roleName || getVal(row.c[2]) !== 'Task') return false;
            const deadline = getVal(row.c[9]) || '';
            const parts = deadline.split('/');
            return parts.length >= 2 && parts[1] === prevMonthStr;
        });
        
        prevTasks.forEach(t => {
            if (!(getVal(t.c[1]) || '').includes('Completed')) prevPending++;
            else prevCompleted++;
        });
        prevCompletion = prevTasks.length > 0 ? Math.round((prevCompleted / prevTasks.length) * 100) : 0;
    }

    // Update DOM
    const pendEl = document.getElementById(`${prefix}-task-pending`);
    if(pendEl) pendEl.innerText = currentPending;
    
    const compEl = document.getElementById(`${prefix}-task-completion`);
    if(compEl) compEl.innerText = currentTasks.length > 0 ? currentCompletion + '%' : 'N/A';

    const formatTrend = (current, prev) => {
        if (!prevMonthStr) return `<i class="fa-solid fa-minus"></i> No previous data`;
        if (prev === 0) return current > 0 ? `<i class="fa-solid fa-arrow-up"></i> +100% vs last month` : `<i class="fa-solid fa-minus"></i> 0% vs last month`;
        const diff = current - prev;
        const pct = Math.round((diff / prev) * 100);
        if (pct > 0) return `<i class="fa-solid fa-arrow-up"></i> +${pct}% vs last month`;
        if (pct < 0) return `<i class="fa-solid fa-arrow-down"></i> ${pct}% vs last month`;
        return `<i class="fa-solid fa-minus"></i> 0% vs last month`;
    };

    const getTrendEl = (id) => {
        const el = document.getElementById(id);
        if (el) return el.nextElementSibling;
        return null;
    };

    const trendPend = getTrendEl(`${prefix}-task-pending`);
    if (trendPend) {
        trendPend.innerHTML = formatTrend(currentPending, prevPending);
        trendPend.className = 'trend ' + (currentPending <= prevPending ? 'positive' : 'negative');
    }

    const trendComp = getTrendEl(`${prefix}-task-completion`);
    if (trendComp) {
        const diff = currentCompletion - prevCompletion;
        let trendText = `<i class="fa-solid fa-minus"></i> 0% vs last month`;
        if (!prevMonthStr) trendText = `<i class="fa-solid fa-minus"></i> No previous data`;
        else if (diff > 0) trendText = `<i class="fa-solid fa-arrow-up"></i> +${diff}% vs last month`;
        else if (diff < 0) trendText = `<i class="fa-solid fa-arrow-down"></i> ${diff}% vs last month`;
        trendComp.innerHTML = trendText;
        trendComp.className = 'trend ' + (diff >= 0 ? 'positive' : 'negative');
    }
}

function updateAllRolesTasksMetrics() {
    const monthVal = typeof currentMonthIndex !== 'undefined' ? currentMonthIndex + 3 : 3;
    const monthStr = String(monthVal).padStart(2, '0');
    const prevMonthStr = (typeof currentMonthIndex !== 'undefined' && currentMonthIndex > 0) ? String(monthVal - 1).padStart(2, '0') : null;

    // Use specific task logic for each role's name
    updateRoleTaskMetrics('Ms. Đào', 'head', monthStr, prevMonthStr);
    updateRoleTaskMetrics('Mr. Khôi', 'teacher', monthStr, prevMonthStr);
    updateRoleTaskMetrics('Ms. Khanh', 'academic', monthStr, prevMonthStr);
    updateRoleTaskMetrics('Mr. Đạt', 'operation', monthStr, prevMonthStr);
    updateRoleTaskMetrics('Mr. Trí', 'coo', monthStr, prevMonthStr);
}

function renderTeacherPerformance(classRows) {
    const grid = document.getElementById('teacher-performance-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const teacherMap = {};
    classRows.forEach(row => {
        const c = row.c;
        const teacher = getShortName(getVal(c[8])) || 'Unknown';
        if (!teacherMap[teacher]) {
            teacherMap[teacher] = { rows: [], count: 0 };
        }
        teacherMap[teacher].rows.push(row);
        teacherMap[teacher].count++;
    });

    const teachers = Object.keys(teacherMap).sort((a, b) => teacherMap[b].count - teacherMap[a].count);
    if (teachers.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted);">No classes available.</p>';
        return;
    }

    teachers.forEach(teacher => {
        const card = document.createElement('div');
        card.className = 'modern-card panel';
        card.style.margin = '0';
        card.innerHTML = `
            <div class="modern-card-header" style="justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.05); margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 1.1rem; color: var(--primary-dark); display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-chalkboard-user"></i> ${teacher}
                </h3>
                <span class="status-badge" style="background: rgba(99, 102, 241, 0.1); color: var(--primary);">${teacherMap[teacher].count} Classes</span>
            </div>
            <div class="modern-card-body" style="padding: 0;">
                <div style="overflow-x: auto;">
                    <table class="modern-table" style="width: 100%; font-size: 0.85rem; min-width: 400px;">
                        <thead>
                            <tr>
                                <th style="padding: 8px;">Class</th>
                                <th style="padding: 8px; text-align: center;">Absence</th>
                                <th style="padding: 8px; text-align: center;">Progress</th>
                                <th style="padding: 8px; text-align: center;">Exam Date</th>
                                <th style="padding: 8px; text-align: center;">Teacher</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${teacherMap[teacher].rows.map(row => {
                                const c = row.c;
                                const className = getVal(c[6]) || getVal(c[1]);
                                const absence = getVal(c[32]) || '-';
                                const progress = getVal(c[33]) || getVal(c[11]) || '-';
                                const examDate = getVal(c[38]) || '-';
                                const achievement = getVal(c[29]) || '-';
                                const redFlag = getVal(c[30]) || '-';
                                const action = getVal(c[31]) || '-';
                                
                                let safeHTML = '';
                                const hasDetails = (achievement !== '-' || redFlag !== '-' || action !== '-');
                                if (hasDetails) {
                                    let modalContent = `
                                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-top: 10px; border-left: 4px solid var(--primary);">
                                            <h4 style="color: var(--primary); margin-bottom: 8px;">Teacher Achievement</h4>
                                            <p style="color: var(--text-color); margin-bottom: 16px; line-height: 1.6;">${achievement.replace(/\n/g, '<br>')}</p>
                                        </div>
                                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-top: 10px; border-left: 4px solid var(--danger);">
                                            <h4 style="color: var(--danger); margin-bottom: 8px;">Red Flag</h4>
                                            <p style="color: var(--text-color); margin-bottom: 16px; line-height: 1.6;">${redFlag.replace(/\n/g, '<br>')}</p>
                                            <h4 style="color: var(--primary); margin-bottom: 8px;">Action</h4>
                                            <p style="color: var(--text-color); line-height: 1.6;">${action.replace(/\n/g, '<br>')}</p>
                                        </div>
                                    `;
                                    safeHTML = modalContent.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\n/g, '').replace(/\r/g, ' ');
                                }
                                    
                                let icon = hasDetails
                                    ? `<i class="fa-solid fa-chalkboard-user" style="color: var(--primary); cursor: pointer; font-size: 1.2rem;" onclick="openClassDetail('', \`${safeHTML}\`)"></i>`
                                    : '-';

                                return `
                                    <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                                        <td style="padding: 12px 8px; font-weight: 500;">${className.split(' - ')[0]}</td>
                                        <td style="padding: 12px 8px; text-align: center;">${absence}</td>
                                        <td style="padding: 12px 8px; text-align: center;"><span class="badge ${progress !== '-' ? 'success' : ''}">${progress}</span></td>
                                        <td style="padding: 12px 8px; text-align: center;">${examDate}</td>
                                        <td style="padding: 12px 8px; text-align: center;">${icon}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderAcademicPerformance(classRows) {
    const grid = document.getElementById('academic-performance-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const teacherMap = {};
    classRows.forEach(row => {
        const c = row.c;
        const teacher = getShortName(getVal(c[8])) || 'Unknown';
        if (!teacherMap[teacher]) {
            teacherMap[teacher] = { rows: [], count: 0 };
        }
        teacherMap[teacher].rows.push(row);
        teacherMap[teacher].count++;
    });

    const teachers = Object.keys(teacherMap).sort((a, b) => teacherMap[b].count - teacherMap[a].count);
    if (teachers.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted);">No classes available.</p>';
        return;
    }

    teachers.forEach(teacher => {
        const card = document.createElement('div');
        card.className = 'modern-card panel';
        card.style.margin = '0';
        card.innerHTML = `
            <div class="modern-card-header" style="justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.05); margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 1.1rem; color: var(--primary-dark); display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-chalkboard-user"></i> ${teacher}
                </h3>
                <span class="status-badge" style="background: rgba(99, 102, 241, 0.1); color: var(--primary);">${teacherMap[teacher].count} Classes</span>
            </div>
            <div class="modern-card-body" style="padding: 0;">
                <div style="overflow-x: auto;">
                    <table class="modern-table" style="width: 100%; font-size: 0.85rem; min-width: 400px;">
                        <thead>
                            <tr>
                                <th style="padding: 8px;">Class</th>
                                <th style="padding: 8px; text-align: center;">Material</th>
                                <th style="padding: 8px; text-align: center;">Aid</th>
                                <th style="padding: 8px; text-align: center;">Roadmap</th>
                                <th style="padding: 8px; text-align: center;">Exam</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${teacherMap[teacher].rows.map(row => {
                                const c = row.c;
                                const className = getVal(c[6]) || getVal(c[1]);
                                const material = getVal(c[34]) || '-';
                                const aid = getVal(c[35]) || '-';
                                const roadmap = getVal(c[36]) || '-';
                                const exam = getVal(c[37]) || '-';
                                
                                return `
                                    <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                                        <td style="padding: 12px 8px; font-weight: 500;">${className.split(' - ')[0]}</td>
                                        <td style="padding: 12px 8px; text-align: center;">${material}</td>
                                        <td style="padding: 12px 8px; text-align: center;">${aid}</td>
                                        <td style="padding: 12px 8px; text-align: center;">${roadmap}</td>
                                        <td style="padding: 12px 8px; text-align: center;"><span class="badge ${exam !== '-' ? 'primary' : ''}">${exam}</span></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}
