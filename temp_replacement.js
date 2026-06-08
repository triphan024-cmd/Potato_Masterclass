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
