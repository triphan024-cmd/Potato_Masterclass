// Google Apps Script Web App URL for updating tasks
window.GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyUpPBhYBLvwyKhTk-7bNAC2rr5PE0dnN7T4lizrNNcIyJkDM_Z5PPw1v75-zWG0DQPCg/exec';

// Function to open the detailed view of a class
function openClassDetail(titleStr, contentStr, hideHeader = false, modalWidth = null) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('classModal');
    const title = document.getElementById('modalClassTitle');
    const content = document.getElementById('modalClassContent');
    const header = modal.querySelector('.modal-header');
    const modalContent = modal.querySelector('.modal-content');
    
    if (hideHeader) {
        if (header) header.style.display = 'none';
        if (content) content.style.padding = '0'; // Remove default padding when header is hidden
    } else {
        if (header) header.style.display = '';
        if (content) content.style.padding = ''; // Restore default
    }

    if (modalContent) {
        if (modalWidth) {
            modalContent.dataset.origMaxWidth = modalContent.style.maxWidth || '';
            modalContent.style.maxWidth = modalWidth;
            modalContent.style.width = '100%';
        } else {
            if (modalContent.dataset.origMaxWidth !== undefined) {
                modalContent.style.maxWidth = modalContent.dataset.origMaxWidth;
                modalContent.style.width = '';
            }
        }
    }
    
    title.innerHTML = titleStr;
    content.innerHTML = contentStr || 'No details available.';
    modal.classList.add('show');
}

// Function to close the detailed view modal
function closeClassDetail() {
    const modal = document.getElementById('classModal');
    modal.classList.remove('show');
}

window.openRoadmapDetail = function(courseName) {
    if (event) event.stopPropagation();
    
    let rows = [];
    if (window.globalCourseRoadmapRows) {
        rows = window.globalCourseRoadmapRows.filter(row => {
            if (!row || !row.c) return false;
            let found = false;
            for(let i=0; i<10; i++) {
                if (row.c[i] && getVal(row.c[i]).toLowerCase().trim() === courseName.toLowerCase().trim()) {
                    found = true;
                    break;
                }
            }
            return found;
        });
    }

    let contentHtml = '';
    if (rows.length === 0) {
        contentHtml = `<div style="padding: 32px; text-align: center; color: #64748b; background: white; border-radius: 12px; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <button class="close-btn" onclick="closeClassDetail()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8;"><i class="fa-solid fa-xmark"></i></button>
            <h3 style="margin-top: 0; margin-bottom: 16px; color: var(--primary-dark); font-size: 1.4rem; text-align: left;"><i class="fa-solid fa-map"></i> Roadmap: ${courseName}</h3>
            No roadmap details found for course: <strong>${courseName}</strong>
        </div>`;
    } else {
        const cols = window.globalCourseRoadmapCols || [];
        const allowedLabels = ["Status", "Course", "Lesson Order", "Lesson Name", "Lesson Content", "Suggestion"];
        const colIndices = [];
        
        cols.forEach((col, i) => {
            const label = col && col.label ? col.label.trim() : `Col ${i+1}`;
            if (allowedLabels.some(allowed => label.toLowerCase().includes(allowed.toLowerCase()))) {
                colIndices.push({ index: i, label: label });
            }
        });
        
        if (colIndices.length === 0) {
            cols.slice(0, 8).forEach((col, i) => colIndices.push({ index: i, label: col && col.label ? col.label : `Col ${i+1}` }));
        }

        contentHtml += `<div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.12); position: relative; display: flex; flex-direction: column;">
            <button class="close-btn" onclick="closeClassDetail()" style="position: absolute; top: 20px; right: 24px; background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #64748b; transition: color 0.2s;" onmouseover="this.style.color='#0f172a'" onmouseout="this.style.color='#64748b'"><i class="fa-solid fa-xmark"></i></button>
            <h3 style="margin-top: 0; margin-bottom: 20px; color: var(--primary-dark); font-size: 1.5rem; display: flex; align-items: center; gap: 12px;"><i class="fa-solid fa-map"></i> Roadmap: ${courseName}</h3>
            <div style="overflow-x: auto; max-height: 70vh; border: 1px solid #e2e8f0; border-radius: 8px;">
            <table class="modern-table" style="width: 100%; font-size: 0.9rem; border-collapse: collapse; table-layout: auto;">
            <thead style="position: sticky; top: 0; background: #f8fafc; z-index: 1; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><tr>`;
        
        colIndices.forEach((colObj) => {
            const isLongCol = ['lesson name', 'lesson content', 'suggestion'].some(c => colObj.label.toLowerCase().includes(c));
            const thStyle = `padding: 14px 16px; text-align: left; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1; white-space: nowrap; ${isLongCol ? 'min-width: 250px;' : 'min-width: 100px;'}`;
            contentHtml += `<th style="${thStyle}">${colObj.label}</th>`;
        });
        contentHtml += `</tr></thead><tbody>`;
        
        rows.forEach((row, rowIndex) => {
            const bgStr = rowIndex % 2 === 0 ? 'background: #ffffff;' : 'background: #f8fafc;';
            contentHtml += `<tr style="${bgStr} border-bottom: 1px solid #e2e8f0; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f1f5f9'" onmouseout="this.style.backgroundColor='${rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc'}'">`;
            colIndices.forEach((colObj) => {
                const val = (row.c && row.c[colObj.index]) ? getVal(row.c[colObj.index]) : '-';
                const isLongCol = ['lesson name', 'lesson content', 'suggestion'].some(c => colObj.label.toLowerCase().includes(c));
                const tdStyle = `padding: 14px 16px; line-height: 1.5; color: #1e293b; ${isLongCol ? 'white-space: normal;' : 'white-space: nowrap;'}`;
                contentHtml += `<td style="${tdStyle}">${val.replace(/\n/g, '<br>')}</td>`;
            });
            contentHtml += `</tr>`;
        });
        contentHtml += `</tbody></table></div></div>`;
    }
    
    openClassDetail('', contentHtml, true, '90vw');
};

window.openFeesDetail = function(classId, className, filterPending = false) {
    if (event) event.stopPropagation();
    
    let rows = [];
    if (window.globalFeesRows) {
        rows = window.globalFeesRows.filter(row => {
            if (!row || !row.c) return false;
            let found = false;
            for(let i=0; i<10; i++) {
                if (row.c[i] && getVal(row.c[i]).toLowerCase().trim() === classId.toLowerCase().trim()) {
                    found = true;
                    break;
                }
            }
            return found;
        });
    }

    let contentHtml = '';
    const safeTitle = (className || classId).replace(/"/g, '&quot;');
    if (rows.length === 0) {
        contentHtml = `<div style="padding: 32px; text-align: center; color: #64748b; background: white; border-radius: 12px; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <button class="close-btn" onclick="closeClassDetail()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #94a3b8;"><i class="fa-solid fa-xmark"></i></button>
            <h3 style="margin-top: 0; margin-bottom: 16px; color: var(--primary-dark); font-size: 1.4rem; text-align: left;"><i class="fa-solid fa-file-invoice-dollar"></i> Fees: ${safeTitle}</h3>
            No fee details found for class: <strong>${safeTitle}</strong>
        </div>`;
    } else {
        const originalLabels = window.globalFeesCols || [];
        let colsToKeep = [];
        
        originalLabels.forEach((col, idx) => {
            if (!col) return;
            const l = (col.label || '').toLowerCase().trim();
            let newLabel = null;
            if (l === 'student name') newLabel = 'Student Name';
            else if (l === 'status') newLabel = 'Status';
            else if (l === 'month') newLabel = 'Stage';
            else if (l === 'start date') newLabel = 'Start Date';
            else if (l === 'end date') newLabel = 'End Date';
            else if (l === 'division') newLabel = 'Division';
            else if (l === 'bill') newLabel = 'Bill';
            else if (l === 'fees amount' || l === 'standard') newLabel = 'Standard';
            else if (l === 'sib discount') newLabel = 'Sib Discount';
            else if (l === 'total discount') newLabel = 'Total Discount';
            else if (l === 'final amount') newLabel = 'Final Amount';
            else if (l === 'paid amount') newLabel = 'Paid Amount';
            else if (l === 'paid date') newLabel = 'Paid Date';
            else if (l === 'pending amount' || l === 'pending') newLabel = 'Pending';
            else if (l === 'payment method' || l === 'method') newLabel = 'Method';
            else if (l === 'remark') newLabel = 'Remark';
            
            if (newLabel && !colsToKeep.find(c => c.newLabel === newLabel)) {
                colsToKeep.push({ index: idx, newLabel: newLabel });
            }
        });

        const requestedOrder = [
            'Student Name', 'Status', 'Stage', 'Start Date', 'End Date', 
            'Division', 'Bill', 'Standard', 'Sib Discount', 'Total Discount', 
            'Final Amount', 'Paid Amount', 'Paid Date', 'Pending', 'Method', 'Remark'
        ];
        colsToKeep.sort((a, b) => requestedOrder.indexOf(a.newLabel) - requestedOrder.indexOf(b.newLabel));

        const pendingColIdx = colsToKeep.find(c => c.newLabel === 'Pending')?.index;
        if (filterPending && pendingColIdx !== undefined) {
            rows = rows.filter(r => {
                const pdVal = (r.c && r.c[pendingColIdx]) ? getVal(r.c[pendingColIdx]).replace(/,/g, '') : 0;
                return parseFloat(pdVal) > 0;
            });
        }

        // Ensure we group by Stage
        const stageColObj = colsToKeep.find(c => c.newLabel === 'Stage');
        const stageIdx = stageColObj ? stageColObj.index : -1;
        
        let groupedRows = {};
        rows.forEach(row => {
            let stageVal = (stageIdx !== -1 && row.c && row.c[stageIdx]) ? getVal(row.c[stageIdx]) : 'Book';
            if (!stageVal || stageVal.trim() === '-' || stageVal.trim() === '' || stageVal.trim() === 'Unknown Stage') stageVal = 'Book';
            if (!groupedRows[stageVal]) groupedRows[stageVal] = [];
            groupedRows[stageVal].push(row);
        });

        const safeJsId = classId.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const safeJsName = className.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const toggleBtnStyle = filterPending ? 'background: #ef4444; color: white;' : 'background: #f1f5f9; color: #475569;';

        contentHtml += `<div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.12); position: relative; display: flex; flex-direction: column;">
            <button class="close-btn" onclick="closeClassDetail()" style="position: absolute; top: 20px; right: 24px; background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #64748b; transition: color 0.2s;" onmouseover="this.style.color='#0f172a'" onmouseout="this.style.color='#64748b'"><i class="fa-solid fa-xmark"></i></button>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-right: 40px;">
                <h3 style="margin: 0; color: var(--primary-dark); font-size: 1.5rem; display: flex; align-items: center; gap: 12px;"><i class="fa-solid fa-file-invoice-dollar"></i> Fees: ${safeTitle}</h3>
                <button onclick="window.openFeesDetail('${safeJsId}', '${safeJsName}', ${!filterPending})" class="btn" style="${toggleBtnStyle} border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.85rem;"><i class="fa-solid fa-filter" style="margin-right: 6px;"></i> Pending Only</button>
            </div>
            <div style="overflow-y: auto; max-height: 75vh; padding-right: 8px;">`;

        const sortedStages = Object.keys(groupedRows).sort((a, b) => {
            if (a === 'Book') return -1;
            if (b === 'Book') return 1;
            return a.localeCompare(b, undefined, { numeric: true });
        });
        sortedStages.forEach(stage => {
            const finalColIdx = colsToKeep.find(c => c.newLabel === 'Final Amount')?.index;
            const paidColIdx = colsToKeep.find(c => c.newLabel === 'Paid Amount')?.index;
            const pendingColIdx = colsToKeep.find(c => c.newLabel === 'Pending')?.index;

            let sumFinal = 0, sumPaid = 0, sumPending = 0;
            groupedRows[stage].forEach(row => {
                const fVal = finalColIdx !== undefined && row.c && row.c[finalColIdx] ? getVal(row.c[finalColIdx]).replace(/,/g, '') : 0;
                const pVal = paidColIdx !== undefined && row.c && row.c[paidColIdx] ? getVal(row.c[paidColIdx]).replace(/,/g, '') : 0;
                const pdVal = pendingColIdx !== undefined && row.c && row.c[pendingColIdx] ? getVal(row.c[pendingColIdx]).replace(/,/g, '') : 0;
                if (!isNaN(parseFloat(fVal))) sumFinal += parseFloat(fVal);
                if (!isNaN(parseFloat(pVal))) sumPaid += parseFloat(pVal);
                if (!isNaN(parseFloat(pdVal))) sumPending += parseFloat(pdVal);
            });

            contentHtml += `<div style="margin-bottom: 28px;">
                <div style="overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                <table class="modern-table" style="width: 100%; font-size: 0.85rem; border-collapse: collapse; table-layout: auto;">
                <thead style="background: #f8fafc;"><tr>`;
            
            const renderCols = colsToKeep.filter(c => c.newLabel !== 'Stage');
            
            renderCols.forEach(colObj => {
                const isLongCol = ['remark', 'student name'].includes(colObj.newLabel.toLowerCase());
                const thStyle = `padding: 12px 14px; text-align: left; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1; white-space: nowrap; ${isLongCol ? 'min-width: 150px;' : 'min-width: 80px;'}`;
                contentHtml += `<th style="${thStyle}">${colObj.newLabel}</th>`;
            });
            contentHtml += `</tr></thead><tbody>`;
            
            contentHtml += `<tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">`;
            renderCols.forEach((colObj, i) => {
                let val = '';
                let align = 'left';
                let color = '#0f172a';
                if (i === 0) {
                    const labelStr = stage === 'Book' ? 'Book' : `Stage: ${stage}`;
                    val = `<span style="color: var(--primary); font-size: 1.05rem;"><i class="fa-solid fa-layer-group" style="margin-right: 6px;"></i> ${labelStr}</span>`;
                } else if (colObj.newLabel === 'Status') {
                    val = `<i class="fa-solid fa-user" style="margin-right: 4px; color: #64748b;"></i>${groupedRows[stage].length}`;
                } else if (colObj.newLabel === 'Final Amount') {
                    val = sumFinal.toLocaleString();
                    align = 'right';
                } else if (colObj.newLabel === 'Paid Amount') {
                    val = sumPaid.toLocaleString();
                    align = 'right';
                    color = '#16a34a'; // green
                } else if (colObj.newLabel === 'Pending') {
                    val = sumPending.toLocaleString();
                    align = 'right';
                    color = '#dc2626'; // red
                }
                contentHtml += `<td style="padding: 12px 14px; text-align: ${align}; color: ${color}; font-weight: 700;">${val}</td>`;
            });
            contentHtml += `</tr>`;

            groupedRows[stage].forEach((row, rowIndex) => {
                const bgStr = rowIndex % 2 === 0 ? 'background: #ffffff;' : 'background: #f8fafc;';
                contentHtml += `<tr style="${bgStr} border-bottom: 1px solid #e2e8f0; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f1f5f9'" onmouseout="this.style.backgroundColor='${rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc'}'">`;
                renderCols.forEach(colObj => {
                    let val = (row.c && row.c[colObj.index]) ? getVal(row.c[colObj.index]) : '-';
                    if (val === 'null' && colObj.newLabel === 'Bill') val = '-';
                    if (colObj.newLabel === 'Student Name') val = val.replace(/\s*\(/g, '<br>(');

                    const isLongCol = ['remark', 'student name'].includes(colObj.newLabel.toLowerCase());
                    let align = 'left';
                    if (['bill', 'standard', 'sib discount', 'total discount', 'final amount', 'paid amount', 'pending'].includes(colObj.newLabel.toLowerCase()) || (!isNaN(val.replace(/,/g, '')) && val.trim() !== '-')) {
                        align = 'right';
                    }
                    if (align === 'right' && !isNaN(val.replace(/,/g, '')) && val.trim() !== '-' && val.trim() !== '') {
                        if (val.indexOf(',') === -1 && val.indexOf('.') === -1) {
                             val = Number(val).toLocaleString();
                        }
                    }
                    let colorStr = '#1e293b';
                    let fw = 'normal';
                    if (colObj.newLabel === 'Pending' && val !== '-' && val !== '0' && val !== '0.00') {
                        colorStr = '#dc2626';
                        fw = '600';
                    }
                    
                    if (colObj.newLabel === 'Status') {
                        const statusLower = val.toLowerCase();
                        let bg = '#f1f5f9', col = '#475569', tdDeco = 'none';
                        if (statusLower.includes('pending')) {
                            bg = '#fee2e2'; col = '#ef4444';
                        } else if (statusLower.includes('notice')) {
                            bg = '#fef9c3'; col = '#eab308';
                        } else if (statusLower.includes('paid')) {
                            bg = '#dbeafe'; col = '#3b82f6';
                        } else if (statusLower.includes('misa')) {
                            bg = '#ccfbf1'; col = '#14b8a6';
                        } else if (statusLower.includes('completed')) {
                            bg = '#dcfce3'; col = '#22c55e';
                        }
                        if (statusLower.includes('cancel')) {
                            tdDeco = 'line-through';
                            col = '#94a3b8';
                            bg = 'transparent';
                        }
                        if (tdDeco !== 'none' || col !== '#475569') {
                            val = `<span style="background: ${bg}; color: ${col}; padding: 2px 8px; border-radius: 12px; font-weight: 600; font-size: 0.75rem; text-decoration: ${tdDeco}; white-space: nowrap;">${val}</span>`;
                        }
                    }

                    const tdStyle = `padding: 10px 14px; line-height: 1.4; color: ${colorStr}; font-weight: ${fw}; text-align: ${align}; ${isLongCol ? 'white-space: normal;' : 'white-space: nowrap;'}`;
                    contentHtml += `<td style="${tdStyle}">${val.replace(/\n/g, '<br>')}</td>`;
                });
                contentHtml += `</tr>`;
            });
            contentHtml += `</tbody></table></div></div>`;
        });
        contentHtml += `</div></div>`;
    }
    
    openClassDetail('', contentHtml, true, '95vw');
};

window.openDutyDetail = function(id) {
    if (event) event.stopPropagation();
    const row = window.globalDutyRows[id];
    if (!row || !row.c) return;
    
    const category = getVal(row.c[3]) || 'N/A';
    const branch = getVal(row.c[4]) || 'N/A';
    const taskDetail = getVal(row.c[6]) || '';
    const label = getVal(row.c[13]) || 'Duty';
    
    const html = `
        <div style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); display:flex; flex-direction:column; gap:16px; font-family: 'Inter', sans-serif;">
            <div style="background: rgba(0,0,0,0.02); padding: 16px; border-radius: 8px;">
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; font-weight: 600;">Duty Info</div>
                <div style="font-weight: 700; font-size: 1.15rem; color: var(--primary-color);">${label}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div style="border: 1px solid rgba(0,0,0,0.06); padding: 12px; border-radius: 8px; background: white;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Category</div>
                    <div style="font-weight: 600; color: var(--text-dark);">${category}</div>
                </div>
                <div style="border: 1px solid rgba(0,0,0,0.06); padding: 12px; border-radius: 8px; background: white;">
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Branch</div>
                    <div style="font-weight: 600; color: var(--text-dark);">${branch}</div>
                </div>
            </div>
            
            <div style="border: 1px solid rgba(0,0,0,0.06); padding: 16px; border-radius: 8px; background: white;">
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; font-weight: 600;">Details</div>
                <div style="font-weight: 500; color: var(--text-dark); white-space: pre-wrap; line-height: 1.6;">${taskDetail || '<span style="color: var(--text-muted); font-style: italic;">No additional details.</span>'}</div>
            </div>
        </div>
    `;
    
    openClassDetail('Duty Detail', html);
};

window.openCalEventDetail = function(id) {
    if (event) event.stopPropagation();
    const ev = globalCalendarEvents[id];
    if (!ev) return;
    
    const dateStr = ev.date ? ev.date.toLocaleDateString('en-GB') : '';
    const time = ev.time || 'N/A';
    const teacher = getShortName(ev.teacher) || ev.teacher || 'N/A';
    
    const rawData = {};
    if (ev.raw && ev.raw.c) {
        ev.raw.c.forEach((c, i) => {
            let label = window.calendarHeaders && window.calendarHeaders[i] ? window.calendarHeaders[i] : `Col ${i}`;
            let val = getVal(c);
            if (val && String(val).trim() !== '') {
                rawData[label] = val;
            }
        });
    }

    const countStudent = rawData['Count Student'] || '0';
    const status = rawData['Status'] || '';
    const branch = rawData['Branch'] || '';
    let studentName = rawData['Student Name'] || '';
    if (typeof studentName === 'string') {
        studentName = studentName.split(',').map(s => s.trim()).join('<br>');
    }
    const className = ev.className || 'Class Detail Information';
    const history = rawData['History'] || '';

    const createBox = (title, value, icon, fullWidth = false, inline = true) => {
        if (!value || value === 'N/A' || value === '') return '';
        const colSpan = fullWidth ? 'grid-column: 1 / -1;' : '';
        
        if (inline && !fullWidth) {
            return `
                <div style="border: 1px solid rgba(0,0,0,0.06); padding: 14px; border-radius: 8px; background: #fdfdfd; box-shadow: 0 1px 2px rgba(0,0,0,0.02); display: flex; justify-content: space-between; align-items: center; gap: 12px; ${colSpan}">
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px; white-space: nowrap;">
                        ${icon ? `<i class="fa-solid ${icon}" style="color: var(--primary-color); opacity: 0.8;"></i>` : ''} ${title}
                    </div>
                    <div style="font-weight: 600; color: var(--text-dark); font-size: 0.95rem; text-align: right; word-break: break-word;">${value}</div>
                </div>
            `;
        }

        return `
            <div style="border: 1px solid rgba(0,0,0,0.06); padding: 14px; border-radius: 8px; background: #fdfdfd; box-shadow: 0 1px 2px rgba(0,0,0,0.02); ${colSpan}">
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; font-weight: 700; display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px;">
                    ${icon ? `<i class="fa-solid ${icon}" style="color: var(--primary-color); opacity: 0.8;"></i>` : ''} ${title}
                </div>
                <div style="font-weight: 600; color: var(--text-dark); line-height: 1.6; font-size: 0.95rem; word-break: break-word;">${value}</div>
            </div>
        `;
    };

    let boxesHtml = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px; max-height: 70vh; overflow-y: auto; padding-right: 4px;">
            ${createBox('Status', status, 'fa-info-circle')}
            ${createBox('Branch', branch, 'fa-building')}
            ${createBox('Study Date', dateStr, 'fa-calendar-day')}
            ${createBox('Time', time, 'fa-clock')}
            ${createBox('Teacher', teacher, 'fa-chalkboard-user')}
            ${createBox('Student', countStudent, 'fa-users')}
            ${createBox('Student Name', studentName, 'fa-user-graduate', true, false)}
            ${createBox('History', history, 'fa-clock-rotate-left', true, false)}
        </div>
    `;

    const html = `
        <div style="background: rgba(255,255,255,0.95); padding: 24px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); display:flex; flex-direction:column; font-family: 'Inter', sans-serif; position: relative;">
            <button type="button" class="close-btn" onclick="closeClassDetail()" style="position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted); transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='var(--text-muted)'"><i class="fa-solid fa-xmark"></i></button>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary-dark); margin-bottom: 8px; padding-right: 24px;">${className}</div>
            ${boxesHtml}
        </div>
    `;
    
    openClassDetail('', html, true);
};

// Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;
    
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check success-icon"></i>' : '<i class="fa-solid fa-circle-exclamation error-icon"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-fadeout');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3000);
}

// Task Modal Logic
function openTaskModal(task = null, picName = '', monthStr = '') {
    if (event) event.stopPropagation();
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    
    // Reset form
    form.reset();
    document.getElementById('taskId').value = task ? task.id : '';
    document.getElementById('taskMonth').value = task ? task.month : monthStr;
    document.getElementById('taskCreatedDate').value = new Date().toLocaleDateString('en-GB');
    
    // Parse task.detail which we mapped from c[7] (Title). Wait, I need to parse the original task data.
    // In our payload, 'detail' mapped to c[7] (Title). But now we have separate 'Title' and 'Task Detail'.
    // The user's sheet has PIC, Category, Title, Task Detail, Deadline, Week.
    // Let's populate the fields:
    
    if (task) {
        document.getElementById('innerModalTaskTitle').innerText = 'Edit Task';
        
        document.getElementById('taskInputPic').value = getShortName(task.pic) || '';
        document.getElementById('taskCategory').value = task.category || '';
        document.getElementById('taskTitle').value = task.title || task.detail || ''; // fallback to detail if title was stored there previously
        document.getElementById('taskDetail').value = task.taskDetail || '';
        document.getElementById('taskWeek').value = task.week || '';
        
        document.getElementById('taskStatus').value = task.status || 'New';
        document.getElementById('taskOriginalStatus').value = task.status || 'New';
        if (task.deadline) {
            const parts = String(task.deadline).split('/');
            if (parts.length === 3) {
                document.getElementById('taskDeadline').value = `${parts[2]}-${parts[1]}-${parts[0]}`;
            } else if (parts.length === 2) {
                document.getElementById('taskDeadline').value = `${new Date().getFullYear()}-${parts[1]}-${parts[0]}`;
            }
        } else {
            document.getElementById('taskDeadline').value = '';
        }
        document.getElementById('taskResult').value = task.result || '';
        
        // Disable fields for Edit mode (except Task Detail which replaces Plan Detail, and Deadline)
        document.getElementById('taskInputPic').disabled = true;
        document.getElementById('taskWeek').disabled = true;
        
        // Enable fields for Edit
        document.getElementById('taskCategory').disabled = false;
        document.getElementById('taskTitle').disabled = false;
        document.getElementById('taskDetail').disabled = false;
        document.getElementById('taskDeadline').disabled = false;
    } else {
        document.getElementById('innerModalTaskTitle').innerText = 'Add New Task';
        
        document.getElementById('taskInputPic').value = picName || '';
        document.getElementById('taskCategory').value = '';
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDetail').value = '';
        document.getElementById('taskWeek').value = '';
        document.getElementById('taskDeadline').value = '';
        
        document.getElementById('taskStatus').value = 'New';
        
        // Enable fields for Add mode
        document.getElementById('taskInputPic').disabled = false;
        document.getElementById('taskCategory').disabled = false;
        document.getElementById('taskTitle').disabled = false;
        document.getElementById('taskDetail').disabled = false;
        document.getElementById('taskWeek').disabled = false;
        document.getElementById('taskDeadline').disabled = false;
    }

    modal.classList.add('show');
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('show');
}

function openTaskDetailModal(task, safeHTML) {
    const modal = document.getElementById('taskDetailModal');
    document.getElementById('tdmContent').innerHTML = safeHTML;
    
    // Store task info for quick update
    document.getElementById('tdmTaskId').value = task.id;
    document.getElementById('tdmTaskPic').value = task.pic;
    document.getElementById('tdmTaskMonth').value = task.month;
    document.getElementById('tdmTaskCategory').value = task.category || '';
    document.getElementById('tdmTaskTitle').value = task.title || '';
    document.getElementById('tdmTaskStatus').value = task.status;
    document.getElementById('tdmTaskDetail').value = task.taskDetail || task.detail || '';
    document.getElementById('tdmOriginalDeadline').value = task.deadline;
    document.getElementById('tdmOriginalResult').value = task.result;
    document.getElementById('tdmOriginalPending').value = task.pending;
    
    // Reset quick update form
    hideTaskQuickUpdate();
    
    // Toggle Process button visibility
    const processBtn = document.getElementById('tdmBtnProcess');
    if (processBtn) {
        if (task.status === 'New') {
            processBtn.style.display = 'block';
        } else {
            processBtn.style.display = 'none';
        }
    }
    
    modal.classList.add('show');
    if (event) event.stopPropagation();
}

function closeTaskDetailModal() {
    const modal = document.getElementById('taskDetailModal');
    modal.classList.remove('show');
}

function openOnethingModal(action, id, week, month, year, pic, existingContent) {
    document.getElementById('onethingAction').value = action;
    document.getElementById('onethingId').value = id;
    document.getElementById('onethingWeek').value = week;
    document.getElementById('onethingMonth').value = month;
    document.getElementById('onethingYear').value = year;
    document.getElementById('onethingPic').value = hrReverseMap[pic] || pic;
    
    document.getElementById('onethingContent').value = existingContent || '';
    
    if (action === 'edit') {
        document.getElementById('onethingModalTitle').innerText = 'Edit Onething - Week ' + week;
    } else {
        document.getElementById('onethingModalTitle').innerText = 'Add Onething - Week ' + week;
    }
    
    const modal = document.getElementById('onethingModal');
    modal.style.display = 'flex';
    // Trigger reflow
    void modal.offsetWidth;
    modal.classList.add('show');
}

function closeOnethingModal() {
    const modal = document.getElementById('onethingModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('onethingForm').reset();
    }, 300);
}

function showTaskQuickUpdate(action) {
    const form = document.getElementById('tdmQuickUpdateForm');
    const processFields = document.getElementById('tdmProcessFields');
    const completeFields = document.getElementById('tdmCompleteFields');
    const title = document.getElementById('tdmQuickUpdateTitle');
    const btn = document.getElementById('tdmActionButtons');
    
    btn.style.display = 'none';
    form.style.display = 'flex';
    form.setAttribute('data-action', action);
    
    if (action === 'process') {
        title.innerText = 'Mark Processing - Please enter details';
        processFields.style.display = 'flex';
        completeFields.style.display = 'none';
        
        document.getElementById('tdmInputPending').setAttribute('required', 'true');
        document.getElementById('tdmInputDeadline').setAttribute('required', 'true');
        document.getElementById('tdmInputResult').removeAttribute('required');
        
        // Pre-fill existing data
        document.getElementById('tdmInputPending').value = document.getElementById('tdmOriginalPending').value || '';
        const rawDeadline = document.getElementById('tdmOriginalDeadline').value;
        if (rawDeadline) {
            const parts = rawDeadline.split('/');
            if (parts.length === 3) {
                document.getElementById('tdmInputDeadline').value = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
    } else {
        title.innerText = 'Mark Completed - Please enter result';
        processFields.style.display = 'none';
        completeFields.style.display = 'flex';
        
        document.getElementById('tdmInputPending').removeAttribute('required');
        document.getElementById('tdmInputDeadline').removeAttribute('required');
        document.getElementById('tdmInputResult').setAttribute('required', 'true');
        
        document.getElementById('tdmInputResult').value = document.getElementById('tdmOriginalResult').value || '';
    }
}

function hideTaskQuickUpdate() {
    document.getElementById('tdmQuickUpdateForm').style.display = 'none';
    document.getElementById('tdmActionButtons').style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    const taskDeadlineInput = document.getElementById('taskDeadline');
    const taskWeekInput = document.getElementById('taskWeek');
    
    if (taskDeadlineInput && taskWeekInput) {
        taskDeadlineInput.addEventListener('change', () => {
            const dateStr = taskDeadlineInput.value;
            if (!dateStr) {
                taskWeekInput.value = '';
                return;
            }
            const d = new Date(dateStr);
            if (isNaN(d)) return;
            
            const year = d.getFullYear();
            const month = d.getMonth();
            const date = d.getDate();
            
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
            
            let firstTuesdayDate = 1;
            for (let day = 1; day <= 7; day++) {
                let tempD = new Date(year, month, day);
                if (tempD.getDay() === 2) {
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
            
            const cellIndex = firstDayOfMonth + date - 1;
            const rowIdx = Math.floor(cellIndex / 7);
            
            if (rowIdx >= w1RowIndex) {
                taskWeekInput.value = (rowIdx - w1RowIndex + 1);
            } else {
                taskWeekInput.value = '4';
            }
        });
    }

    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (window.GAS_WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
                showToast("Please configure window.GAS_WEB_APP_URL with your Google Apps Script URL first!", "error");
                return;
            }

            const btn = document.getElementById('saveTaskBtn');
            const spinner = document.getElementById('taskSpinner');
            btn.disabled = true;
            spinner.style.display = 'inline-block';
            
            const rawDate = document.getElementById('taskDeadline').value; // YYYY-MM-DD
            let formattedDate = '';
            let payloadMonth = document.getElementById('taskMonth').value;
            let payloadYear = '';

            if (rawDate) {
                const [y, m, d] = rawDate.split('-');
                formattedDate = `${d}/${m}/${y}`; // DD/MM/YYYY
                
                const mIndex = parseInt(m, 10) - 1;
                if (mIndex >= 0 && mIndex < 12) {
                    payloadMonth = "'" + m; // Force text format in Google Sheets
                }
                payloadYear = y;
            }

            const shortPic = document.getElementById('taskInputPic').value;
            const fullPic = hrReverseMap[shortPic] || shortPic;

            const action = document.getElementById('taskId').value ? 'edit' : 'add';
            const status = action === 'edit' ? document.getElementById('taskStatus').value : 'New';
            
            let actionName = 'Update';
            if (action === 'add') {
                actionName = status;
            } else {
                const originalStatus = document.getElementById('taskOriginalStatus').value;
                if (status !== originalStatus) {
                    actionName = status;
                }
            }
            
            const historyLine = `${getShortName(fullPic)} - ${actionName} (${getFormattedHistoryTime()})`;
            
            const payload = {
                action: action,
                id: document.getElementById('taskId').value,
                pic: fullPic,
                type: 'Task',
                month: payloadMonth,
                year: payloadYear,
                category: document.getElementById('taskCategory').value,
                title: document.getElementById('taskTitle').value,
                detail: document.getElementById('taskDetail').value,
                week: document.getElementById('taskWeek').value,
                status: status,
                deadline: formattedDate,
                result: document.getElementById('taskResult').value,
                createdDate: document.getElementById('taskCreatedDate').value,
                historyLine: historyLine
            };

            try {
                const response = await fetch(window.GAS_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                
                // no-cors doesn't allow reading response, assume success if no throw
                closeTaskModal();
                showToast("Task saved! Dashboard will reload.", "success");
                // Reload dashboard to fetch new data
                if (typeof fetchDashboardData === 'function') {
                    await fetchDashboardData();
                } else {
                    location.reload();
                }
            } catch (err) {
                console.error("Error saving task:", err);
                showToast("Failed to save task. Check console for details.", "error");
            } finally {
                btn.disabled = false;
                spinner.style.display = 'none';
            }
        });
    }

    const tdmQuickUpdateForm = document.getElementById('tdmQuickUpdateForm');
    if (tdmQuickUpdateForm) {
        tdmQuickUpdateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (window.GAS_WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
                showToast("Please configure window.GAS_WEB_APP_URL with your Google Apps Script URL first!", "error");
                return;
            }

            const btn = document.getElementById('tdmSaveBtn');
            const spinner = document.getElementById('tdmSpinner');
            btn.disabled = true;
            spinner.style.display = 'inline-block';
            
            const action = tdmQuickUpdateForm.getAttribute('data-action');
            let newStatus = action === 'process' ? 'Processing' : 'Completed';
            
            let formattedDate = document.getElementById('tdmOriginalDeadline').value; // Default to existing
            let payloadMonth = document.getElementById('tdmTaskMonth').value;
            let payloadYear = '';
            
            let dateToParse = null;
            if (action === 'process') {
                const rawDate = document.getElementById('tdmInputDeadline').value;
                if (rawDate) {
                    const [y, m, d] = rawDate.split('-');
                    formattedDate = `${d}/${m}/${y}`;
                    dateToParse = rawDate;
                }
            } else {
                if (formattedDate) {
                    const parts = formattedDate.split('/');
                    if (parts.length === 3) {
                        dateToParse = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    }
                }
            }
            
            if (dateToParse) {
                const [y, m, d] = dateToParse.split('-');
                const mIndex = parseInt(m, 10) - 1;
                if (mIndex >= 0 && mIndex < 12) {
                    payloadMonth = "'" + m; // Force text format in Google Sheets
                }
                payloadYear = y;
            }
            
            const actionType = tdmQuickUpdateForm.getAttribute('data-action');
            let actionName = actionType === 'process' ? 'Processing' : 'Completed';
            const pic = document.getElementById('tdmTaskPic').value;
            const historyLine = `${getShortName(pic)} - ${actionName} (${getFormattedHistoryTime()})`;
            
            const payload = {
                action: 'edit',
                id: document.getElementById('tdmTaskId').value,
                pic: pic,
                type: 'Task',
                month: payloadMonth,
                year: payloadYear,
                category: document.getElementById('tdmTaskCategory').value,
                title: document.getElementById('tdmTaskTitle').value,
                detail: actionType === 'process' ? document.getElementById('tdmInputPending').value : document.getElementById('tdmTaskDetail').value,
                status: newStatus,
                deadline: formattedDate,
                result: actionType === 'complete' ? document.getElementById('tdmInputResult').value : document.getElementById('tdmOriginalResult').value,
                historyLine: historyLine
            };

            try {
                const response = await fetch(window.GAS_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                closeTaskDetailModal();
                showToast("Task updated! Dashboard will reload.", "success");
                if (typeof fetchDashboardData === 'function') {
                    await fetchDashboardData();
                } else {
                    location.reload();
                }
            } catch (err) {
                console.error("Error updating task:", err);
                showToast("Failed to update task. Check console for details.", "error");
            } finally {
                btn.disabled = false;
                spinner.style.display = 'none';
            }
        });
    }
    const onethingForm = document.getElementById('onethingForm');
    if (onethingForm) {
        onethingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const spinner = document.getElementById('onethingSpinner');
            const saveBtn = document.getElementById('saveOnethingBtn');
            saveBtn.disabled = true;
            spinner.style.display = 'inline-block';
            
            let mStr = document.getElementById('onethingMonth').value;
            if (mStr && mStr.length === 2 && !mStr.startsWith("'")) {
                mStr = "'" + mStr;
            }
            
            const action = document.getElementById('onethingAction').value;
            const pic = document.getElementById('onethingPic').value;
            const actionName = action === 'add' ? 'New Onething' : 'Update Onething';
            const historyLine = `${getShortName(pic)} - ${actionName} (${getFormattedHistoryTime()})`;
            
            const payload = {
                action: action,
                id: document.getElementById('onethingId').value,
                pic: pic,
                type: 'Onething',
                week: document.getElementById('onethingWeek').value,
                month: mStr,
                year: document.getElementById('onethingYear').value,
                onething: document.getElementById('onethingContent').value,
                status: 'New',
                category: '',
                title: '',
                detail: '',
                deadline: '',
                result: '',
                createdDate: new Date().toISOString(),
                historyLine: historyLine
            };
            
            try {
                const response = await fetch(window.GAS_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                closeOnethingModal();
                showToast("Onething saved! Dashboard will reload.", "success");
                if (typeof fetchDashboardData === 'function') {
                    await fetchDashboardData();
                } else {
                    location.reload();
                }
            } catch (err) {
                console.error("Error saving onething:", err);
                showToast("Error saving. Check console.", "error");
            } finally {
                saveBtn.disabled = false;
                spinner.style.display = 'none';
            }
        });
    }
});

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
                // The user clarified that the Month column (c[57]) correctly represents the month's snapshot data.
                return row.c[57] && String(row.c[57].v).padStart(2, '0') === monthStr;
            });
            window.currentMonthFilteredRows = filteredRows;
            
            // Populate teacher filter
            const teacherSelect = document.getElementById('teacherFilter');
            if (teacherSelect) {
                const teachers = [...new Set(filteredRows.map(r => getShortName(getVal(r.c[9]))).filter(n => n && n !== '-'))].sort();
                teacherSelect.innerHTML = '<option value="all">All Teachers</option>' + teachers.map(t => `<option value="${t}">${t}</option>`).join('');
                teacherSelect.style.display = 'block';
            }

            updateMetricsCards(filteredRows, globalMetricsRow, monthStr);
            renderDashboardTable(filteredRows);
            renderTeacherObservations(filteredRows);
            if (typeof applyTeacherFilter === 'function') {
                applyTeacherFilter();
            } else {
                renderTeacherPerformance(filteredRows, monthStr);
            }
            if (typeof renderOperationTodayClasses === 'function') {
                renderOperationTodayClasses();
            }
            renderAcademicPerformance(filteredRows);
        }

        // Re-render role tasks when month changes
        if (globalLeaderRows.length > 0) {
            updateAllRolesTasksMetrics();
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
const DUTY_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dTcxPgSS2olUtgjjk2ZUvUo8e53Vi6J5Kk4bynKL0OE/gviz/tq?tqx=out:json&gid=585528165';
const ROADMAP_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dTcxPgSS2olUtgjjk2ZUvUo8e53Vi6J5Kk4bynKL0OE/gviz/tq?tqx=out:json&gid=882542672';
const FEES_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1dTcxPgSS2olUtgjjk2ZUvUo8e53Vi6J5Kk4bynKL0OE/gviz/tq?tqx=out:json&gid=1245774263';



function getFormattedHistoryTime() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}-${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

let hrMap = {};
let hrReverseMap = {};
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
                    hrReverseMap[row.c[5].v] = row.c[0].v;
                }
            });
            console.log("HR map built.");
            
            const picDatalist = document.getElementById('picDatalist');
            if (picDatalist) {
                picDatalist.innerHTML = '';
                const uniqueTitles = [...new Set(Object.values(hrMap))].sort();
                uniqueTitles.forEach(title => {
                    const option = document.createElement('option');
                    option.value = title;
                    picDatalist.appendChild(option);
                });
            }
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
        
        // renderTeacherTable has been replaced by renderTeacherPerformance in changeMonth
        // renderAcademicTable has been replaced by renderAcademicPerformance in changeMonth
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
            updateAllRolesTasksMetrics();
            
            renderWeeklyReports(globalLeaderRows, 'weekly-report-grid', currentMonthStr);
            
            // Populate category list for Task Modal
            const categoryList = document.getElementById('categoryList');
            if (categoryList) {
                const uniqueCategories = new Set();
                globalLeaderRows.forEach(row => {
                    const cat = getVal(row.c[6]);
                    if (cat) uniqueCategories.add(cat.trim());
                });
                categoryList.innerHTML = Array.from(uniqueCategories).sort().map(cat => `<option value="${cat}">`).join('');
            }
            
            console.log(`Retrieved leader data.`);
            
            const rmRes = await fetch(ROADMAP_SHEET_URL);
            const rmText = await rmRes.text();
            const rmJsonString = rmText.substring(rmText.indexOf('{'), rmText.lastIndexOf('}') + 1);
            const rmJson = JSON.parse(rmJsonString);
            window.globalCourseRoadmapCols = rmJson.table.cols;
            window.globalCourseRoadmapRows = rmJson.table.rows;
            console.log("Roadmap data loaded.");
            
            const feesRes = await fetch(FEES_SHEET_URL);
            const feesText = await feesRes.text();
            const feesJsonString = feesText.substring(feesText.indexOf('{'), feesText.lastIndexOf('}') + 1);
            const feesJson = JSON.parse(feesJsonString);
            window.globalFeesCols = feesJson.table.cols;
            window.globalFeesRows = feesJson.table.rows;
            console.log("Fees data loaded.");
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
            window.calendarHeaders = calJson.table.cols ? calJson.table.cols.map(c => c ? c.label : '') : [];
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
                        teacher: getVal(row.c[6]),
                        raw: row,
                        _eventId: globalCalendarEvents.length
                    });
                }
            });
            console.log(`Retrieved ${globalCalendarEvents.length} calendar events.`);
            renderCalendar(0); // Re-render with data
            renderOperationTodayClasses();
        } catch (err) {
            console.error("Error fetching calendar data:", err);
        }

        // Fetch Duty Data
        try {
            console.log("Loading duty data...");
            const dutyRes = await fetch(DUTY_SHEET_URL);
            const dutyText = await dutyRes.text();
            const dutyJsonString = dutyText.substring(dutyText.indexOf('{'), dutyText.lastIndexOf('}') + 1);
            const dutyJson = JSON.parse(dutyJsonString);
            window.globalDutyRows = dutyJson.table.rows || [];
            window.globalDutyRows.forEach((r, i) => r._dutyId = i);
            console.log(`Retrieved duty events.`);
        } catch (err) {
            console.error("Error fetching duty data:", err);
        }

        const today = new Date();
        selectCalendarDate(today.getFullYear(), today.getMonth(), today.getDate());
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
}

function updateMetricsCards(classRows, metricsRow, currentMonthStr) {
    const totalStudents = classRows.reduce((sum, row) => sum + parseInt(getVal(row.c[7]) || 0), 0);
    const totalTeachers = new Set(classRows.map(row => getVal(row.c[9]))).size;
    const totalClasses = classRows.length;
    
    let upcomingExams = 0;
    let lateProgress = 0;
    let missingLesson = 0;
    let missingClasses = [];

    classRows.forEach(row => {
        const c = row.c;
        const examDate = getVal(c[39]);
        const progress = (getVal(c[34]) || getVal(c[11]) || '').toLowerCase();
        
        if (examDate && examDate !== '-' && currentMonthStr && examDate.split('/')[1] === currentMonthStr) {
            upcomingExams++;
        }
        if (progress.includes('late') || progress.includes('trễ') || progress.includes('chậm') || progress.includes('behind')) {
            lateProgress++;
        }
        if (progress.includes('missing') || progress.includes('mất bài') || progress.includes('nghỉ')) {
            missingLesson++;
            let rawBranch = getVal(c[3]) || getVal(c[2]) || '';
            let branch = (rawBranch.includes('HD') || rawBranch.includes('Hưng Định') || rawBranch.includes('Hưng \u0110ịnh')) ? 'HD' : 'NQ';
            missingClasses.push({ branch: branch, name: getVal(c[6]) || getVal(c[1]) || 'Unknown' });
        }
    });
    
    missingClasses.sort((a, b) => {
        if (a.branch !== b.branch) return a.branch.localeCompare(b.branch);
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
    const missingStrList = missingClasses.map(m => m.name);

    document.querySelectorAll('.metric-data').forEach(div => {
        const title = div.querySelector('h3').textContent.trim().toLowerCase();
        const valEl = div.querySelector('.value');
        if (!valEl) return;
        
        if (title === 'total students') valEl.innerText = totalStudents.toLocaleString();
        if (title === 'total classes') valEl.innerText = totalClasses.toLocaleString();
        if (title === 'total teachers') valEl.innerText = totalTeachers.toLocaleString();
        if (title === 'active courses') valEl.innerText = totalClasses.toLocaleString();
        if (title === 'upcoming exams') valEl.innerText = upcomingExams.toLocaleString();
        if (title === 'late progress') valEl.innerText = lateProgress.toLocaleString();
        if (title === 'missing lesson') {
            valEl.innerText = missingLesson.toLocaleString();
            div.parentElement.title = missingStrList.length > 0 ? "Missing Classes:\n" + missingStrList.join('\n') : "No missing lessons";
        }
        if (title === 'program "story spark"') {
            const ssCount = classRows.filter(r => (getVal(r.c[6]) || '').toLowerCase().includes('story spark') || (getVal(r.c[1]) || '').toLowerCase().includes('ss')).length;
            valEl.innerText = ssCount.toLocaleString();
        }
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
        const teacher = getShortName(getVal(c[9]));
        const testDate = getVal(c[39]);
        const score = getVal(c[40]) || 'N/A';
        const progress = getVal(c[12]);
        const behavior = getVal(c[29]) || 'Good';

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
        const teacherName = getShortName(getVal(c[9])) || 'Unknown';
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
            const lesson = getVal(c[28]);
            const evaluation = getVal(c[25]);

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
        const start = getVal(c[10]);
        const end = getVal(c[11]);
        const status = getVal(c[2]) || '';
        const course = getVal(c[4]);
        const testDate = getVal(c[39]);

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
        const doanhThu = getVal(c[43]);
        const daThu = getVal(c[44]);
        const congNo = getVal(c[45]);

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

window.applyOperationTodayFilter = function() {
    renderOperationTodayClasses();
};

function renderOperationTodayClasses() {
    const grid = document.getElementById('operation-today-grid');
    const countEl = document.getElementById('operation-today-count');
    if (!grid || !countEl) return;

    if (!globalCalendarEvents || !globalClassRows) return;

    const filter = document.getElementById('operationTodayFilter') ? document.getElementById('operationTodayFilter').value : 'today';

    const today = new Date();
    const isToday = (d) => d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

    let targetRows = [];
    
    if (filter === 'today') {
        const todayEvents = globalCalendarEvents.filter(ev => ev.date && isToday(ev.date));
        todayEvents.forEach(ev => {
            const evClassName = String(ev.className || '').trim();
            for (let row of globalClassRows) {
                if (!row || !row.c) continue;
                const cName = String(getVal(row.c[6]) || getVal(row.c[1])).trim();
                if (cName && (cName === evClassName || cName.includes(evClassName) || evClassName.includes(cName))) {
                    targetRows.push({ ...row, todayTime: ev.time });
                    break;
                }
            }
        });
    } else {
        // All classes filtered by the globally selected month
        let rowsSource = window.currentMonthFilteredRows || globalClassRows;
        targetRows = rowsSource.filter(row => row && row.c && (getVal(row.c[2]) || '').includes('Teaching'));
    }

    countEl.innerText = `(${targetRows.length} Classes)`;
    grid.innerHTML = '';

    if (targetRows.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 20px; font-style: italic;">No classes found.</div>`;
        return;
    }

    const branchMap = {
        'Ngô Quyền (NQ)': {},
        'Hưng Định (HD)': {}
    };

    targetRows.forEach(row => {
        const c = row.c;
        let rawBranch = getVal(c[3]) || getVal(c[2]) || '';
        let branch = '';
        if (rawBranch.includes('HD') || rawBranch.includes('Hưng Định') || rawBranch.includes('Hưng \u0110ịnh')) {
            branch = 'Hưng Định (HD)';
        } else {
            branch = 'Ngô Quyền (NQ)';
        }
        
        const department = getVal(c[5]) || 'Unknown Department';
        if (!branchMap[branch][department]) {
            branchMap[branch][department] = { rows: [], count: 0 };
        }
        branchMap[branch][department].rows.push(row);
        branchMap[branch][department].count++;
    });

    const branches = ['Ngô Quyền (NQ)', 'Hưng Định (HD)'];

    branches.forEach(branch => {
        const departments = Object.keys(branchMap[branch]).sort((a, b) => a.localeCompare(b));
        if (departments.length === 0) return;

        let colorStr = branch === 'Ngô Quyền (NQ)' ? '#3498db' : '#2ecc71';
        let bgStr = branch === 'Ngô Quyền (NQ)' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(46, 204, 113, 0.1)';
        const totalClasses = Object.values(branchMap[branch]).reduce((acc, dept) => acc + dept.rows.length, 0);
        const totalStudents = Object.values(branchMap[branch]).reduce((acc, dept) => acc + dept.rows.reduce((sum, row) => sum + parseInt(getVal(row.c[7]) || 0), 0), 0);

        const branchHeader = document.createElement('div');
        branchHeader.style.gridColumn = '1 / -1';
        branchHeader.style.marginTop = '16px';
        branchHeader.style.paddingBottom = '8px';
        branchHeader.style.borderBottom = `2px solid ${colorStr}`;
        branchHeader.style.display = 'flex';
        branchHeader.style.alignItems = 'center';
        branchHeader.style.justifyContent = 'space-between';
        branchHeader.innerHTML = `
            <h3 style="color: ${colorStr}; margin: 0; font-size: 1.3rem;">
                <i class="fa-solid fa-building"></i> ${branch}
            </h3>
            <div style="display: flex; gap: 8px;">
                <span class="status-badge" style="background: ${bgStr}; color: ${colorStr}; font-size: 0.95rem; margin: 0;">
                    ${totalClasses} Classes
                </span>
                <span class="status-badge" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; font-size: 0.95rem; margin: 0;">
                    ${totalStudents} Students
                </span>
            </div>
        `;
        grid.appendChild(branchHeader);

        departments.forEach(department => {
            const data = branchMap[branch][department];
            const sortedRows = data.rows.sort((a, b) => {
                const classA = String(getVal(a.c[6]) || getVal(a.c[1]) || '');
                const classB = String(getVal(b.c[6]) || getVal(b.c[1]) || '');
                return classA.localeCompare(classB, undefined, { numeric: true, sensitivity: 'base' });
            });

            const deptTotalStudents = data.rows.reduce((sum, row) => sum + parseInt(getVal(row.c[7]) || 0), 0);

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
                                    <th style="padding: 8px; width: 35%;">Class</th>
                                    <th style="padding: 8px; width: 20%; text-align: left;">Teacher</th>
                                    <th style="padding: 8px; width: 15%; text-align: right;">Total</th>
                                    <th style="padding: 8px; width: 15%; text-align: right;">Collect</th>
                                    <th style="padding: 8px; width: 15%; text-align: right;">Debt</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedRows.map(row => {
                                    const c = row.c;
                                    const fullClassName = getVal(c[6]) || getVal(c[1]);
                                    const className = fullClassName.split(' - ')[0].trim();
                                    const teacherName = getShortName(getVal(c[9])) || '-';
                                    const studentCount = parseInt(getVal(c[7]) || 0);
                                    
                                    const scheduleStr = filter === 'today' && row.todayTime ? row.todayTime : (getVal(c[12]) || 'N/A');

                                    const totalFee = getVal(c[44]) || '0';
                                    const daThu = getVal(c[45]) || '0';
                                    const congNo = getVal(c[46]) || '0';
                                    const classIdStr = getVal(c[1]) || className;
                                    
                                    const safeClassId = classIdStr.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/[\n\r]/g, '').trim();
                                    const safeClassName = className.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/[\n\r]/g, '').trim();

                                    return `
                                        <tr style="cursor: pointer; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='rgba(99,102,241,0.03)'" onmouseout="this.style.backgroundColor='transparent'" onclick="window.openFeesDetail('${safeClassId}', '${safeClassName}')">
                                            <td style="padding: 10px 8px;">
                                                <div style="font-weight: 600; color: var(--primary-dark); font-size: 0.9rem;">${className}</div>
                                                <div style="color: #64748b; font-size: 0.75rem; margin-top: 4px;"><i class="fa-regular fa-clock"></i> ${scheduleStr} &nbsp;|&nbsp; <i class="fa-solid fa-users"></i> ${studentCount}</div>
                                            </td>
                                            <td style="padding: 10px 8px;">
                                                <div style="display: flex; align-items: center; gap: 6px;">
                                                    <span style="font-size: 0.85rem; font-weight: 500; color: var(--text-dark);">${teacherName}</span>
                                                </div>
                                            </td>
                                            <td style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 0.85rem;">
                                                ${totalFee}
                                            </td>
                                            <td style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 0.85rem; color: #16a34a;">
                                                ${daThu}
                                            </td>
                                            <td style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 0.85rem; color: #dc2626;">
                                                ${congNo}
                                            </td>
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
    });
}

function renderRoleTasks(rows, picName, containerId, monthStr) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const validRows = rows.filter(row => {
        if(!row || !row.c) return false;
        const type = getVal(row.c[2]);
        const pic = getShortName(getVal(row.c[4]));
        const rowMonth = getVal(row.c[22]);
        let rMonthStr = rowMonth;
        if (rowMonth && rowMonth.length === 1) rMonthStr = '0' + rowMonth;
        
        const monthMatches = !monthStr || rMonthStr === monthStr;
        return type === 'Task' && pic === picName && monthMatches;
    });

    // Render an empty calendar board if no tasks, but allow user to add tasks.

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
    leftDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; color: var(--text-dark);">${roleTitle}</h3>
            <button class="btn btn-primary" onclick="openTaskModal(null, '${picName}', '${monthStr}')" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 6px; border: none; background: var(--primary-color); color: white; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-plus"></i> Add Task
            </button>
        </div>
    `;
    
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
    if (typeof currentYearStr !== 'undefined' && typeof currentMonthStr !== 'undefined') {
        refDate = new Date(parseInt(currentYearStr), parseInt(monthStr || currentMonthStr) - 1, 1);
    } else {
        for (let row of validRows) {
            let d = parseDateStr(getVal(row.c[12]));
            if (d && !isNaN(d)) {
                refDate = d;
                break;
            }
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
        const d = parseDateStr(getVal(row.c[11]));
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
    
    let examDays = new Set();
    if (containerId === 'teacher-report-grid' && typeof globalClassRows !== 'undefined' && globalClassRows) {
        globalClassRows.forEach(row => {
            if (!row || !row.c) return;
            const tName = getShortName(getVal(row.c[9])) || '-';
            // Only add exam days for the specific teacher (picName)
            if (tName === picName || picName.includes(tName) || tName.includes(picName)) {
                const examDateStr = String(getVal(row.c[39]) || '');
                if (examDateStr && examDateStr !== '-') {
                    // Extract all DD/MM or DD/MM/YYYY dates from the string
                    const dateMatches = examDateStr.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-]\d{2,4})?/g);
                    if (dateMatches) {
                        dateMatches.forEach(dStr => {
                            const parts = dStr.split(/[\/\-]/);
                            if (parts.length >= 2) {
                                const dDay = parseInt(parts[0], 10);
                                const dMonth = parseInt(parts[1], 10) - 1;
                                if (dMonth === month && !isNaN(dDay)) {
                                    examDays.add(dDay);
                                }
                            }
                        });
                    }
                }
            }
        });
    }

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
                        el.style.border = el.dataset.origBorder || '';
                        if (!el.dataset.isExam) {
                            el.style.backgroundColor = '';
                            el.style.color = 'var(--primary-color)';
                        }
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
            const isExamDay = examDays.has(currentDate);
            
            let style = `width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto; border-radius: 50%;`;
            
            if (isExamDay) {
                style += ` background: linear-gradient(135deg, #fef08a, #facc15); color: #854d0e; box-shadow: 0 2px 4px rgba(250, 204, 21, 0.4); font-weight: 600;`;
            } else if (isToday) {
                style += ` background: var(--primary-color); color: white; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);`;
            }
            
            if (dayMap[currentDate]) {
                if (!isToday && !isExamDay) {
                    style += ` border: 2px solid var(--primary-light); color: var(--primary-color); font-weight: 600;`;
                }
                style += ` cursor: pointer; position: relative;`;
                const dateNum = currentDate;
                const tooltip = dayMap[currentDate].map(r => getVal(r.c[6]) || getVal(r.c[11])).join('&#10;');
                cell.innerHTML = `<div style="padding: 4px;" title="${tooltip}"><div style="${style}" class="cal-day-active" ${isExamDay ? 'data-is-exam="true"' : ''} id="${containerId}-day-${dateNum}" onclick="
                    document.querySelectorAll('#${containerId} .week-btn').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('#${containerId} .cal-day-active').forEach(el => { 
                        el.style.border = el.dataset.origBorder || ''; 
                        if (!el.dataset.isExam) {
                            el.style.backgroundColor=''; el.style.color='var(--primary-color)'; 
                        }
                    });
                    this.dataset.origBorder = this.style.border;
                    this.style.border='2px solid var(--primary-dark)';
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
    
    const completedTasksContainer = document.createElement('div');
    completedTasksContainer.id = `${containerId}-completed-panel`;
    completedTasksContainer.style.marginTop = '24px';
    leftDiv.appendChild(completedTasksContainer);
    
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
            let weekOneThing = '';
            let otAction = 'add';
            let otId = '';
            let otContentRaw = '';
            const { start, end } = date;
            const weekStart = new Date(start);
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(end);
            weekEnd.setHours(23, 59, 59, 999);
            const yearStr = weekStart.getFullYear().toString();
            const monthStr = String(month + 1).padStart(2, '0');
            
            if (typeof globalLeaderRows !== 'undefined' && globalLeaderRows) {
                const targetWeekStr = 'W' + index;
                const otRow = globalLeaderRows.find(r => {
                    if(!r || !r.c) return false;
                    const rType = getVal(r.c[2]);
                    const rPic = getShortName(getVal(r.c[4]));
                    let rMonthStr = getVal(r.c[22]);
                    if (rMonthStr && String(rMonthStr).length === 1) rMonthStr = '0' + rMonthStr;
                    const rWeek = getVal(r.c[21]);
                    const parsedWeek = parseFloat(String(rWeek).toUpperCase().replace('W', '').trim());
                    return rType === 'Onething' && rPic === picName && rMonthStr === monthStr && parsedWeek === index;
                });
                if (otRow) {
                    otId = getVal(otRow.c[0]) || '';
                    otAction = 'edit';
                    const otContent = getVal(otRow.c[5]);
                    if (otContent) {
                        otContentRaw = otContent;
                        weekOneThing = `<span class="category-badge" style="background: rgba(155, 89, 182, 0.1); color: #9b59b6; margin-left: 4px; font-size: 0.95rem; font-weight: 500; text-transform: none;"><i class="fa-solid fa-bullseye"></i> ${otContent}</span>`;
                    }
                }
            }
            
            const btnIcon = otAction === 'edit' ? '<i class="fa-solid fa-pen"></i>' : '<i class="fa-solid fa-plus"></i>';
            const btnTitle = otAction === 'edit' ? 'Edit Onething' : 'Add Onething';
            const hoverColor = otAction === 'edit' ? '#9b59b6' : '#10b981'; // Purple for edit, Green for add
            const escapedContent = otContentRaw.replace(/'/g, "\\'").replace(/"/g, "&quot;");
            
            const otBtn = `<button title="${btnTitle}" style="background: none; border: none; color: #a0aec0; font-size: 1.1rem; padding: 4px 8px; border-radius: 50%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;" onclick="openOnethingModal('${otAction}', '${otId}', '${index}', '${monthStr}', '${yearStr}', '${picName}', '${escapedContent}')" onmouseover="this.style.color='${hoverColor}'; this.style.background='rgba(0,0,0,0.05)';" onmouseout="this.style.color='#a0aec0'; this.style.background='none';">${btnIcon}</button>`;
            
            titleHtml = `<div style="display: flex; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;"><h3 style="color: var(--primary-color); margin: 0; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-list-check"></i> Week ${index} Tasks</h3>${weekOneThing}${otBtn}</div>`;
            
            targetRows = validRows.filter(row => {
                const d = parseDateStr(getVal(row.c[11]));
                return d && !isNaN(d) && d >= weekStart && d <= weekEnd;
            }).sort((a, b) => {
                const dA = parseDateStr(getVal(a.c[11]));
                const dB = parseDateStr(getVal(b.c[11]));
                if (!dA) return 1;
                if (!dB) return -1;
                return dA - dB;
            });
        } else if (type === 'all') {
            titleHtml = `<h3 style="color: var(--primary-color); margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-border-all"></i> All Month Tasks</h3>`;
            targetRows = validRows.filter(row => {
                const d = parseDateStr(getVal(row.c[11]));
                return d && !isNaN(d);
            }).sort((a, b) => {
                const dA = parseDateStr(getVal(a.c[11]));
                const dB = parseDateStr(getVal(b.c[11]));
                if (!dA) return 1;
                if (!dB) return -1;
                return dA - dB;
            });
        }
    } else if (date) {
        titleHtml = `<h3 style="color: var(--primary-color); margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="fa-regular fa-calendar"></i> ${date}/${month + 1}/${year} Tasks</h3>`;
        targetRows = validRows.filter(row => {
            const d = parseDateStr(getVal(row.c[11]));
            return d && !isNaN(d) && d.getDate() === date && d.getMonth() === month && d.getFullYear() === year;
        });
    } else {
        titleHtml = `<h3 style="color: var(--primary-color); margin-top: 0; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-inbox"></i> Unscheduled Tasks</h3>`;
        targetRows = validRows.filter(row => {
            const d = parseDateStr(getVal(row.c[11]));
            return !d || isNaN(d);
        });
    }

    const activeTasks = targetRows.filter(r => {
        const st = getVal(r.c[1]) || '';
        return !st.includes('Completed') && (st.includes('New') || st.includes('Processing') || st === '');
    });
    const completedTasks = targetRows.filter(r => {
        const st = getVal(r.c[1]) || '';
        return st.includes('Completed');
    });

    let listHtml = '';
    if (activeTasks.length === 0) {
        listHtml = '<p style="color: var(--text-muted);">No active tasks found.</p>';
    } else {
        activeTasks.forEach(row => {
            const c = row.c;
            const status = getVal(c[1]) || 'New';
            
            let statusBg = 'var(--bg-color)';
            let statusColor = 'var(--text-muted)';
            
            if (status.includes('Processing')) {
                statusBg = 'rgba(243, 156, 18, 0.1)';
                statusColor = 'var(--warning)';
            } else {
                statusBg = 'rgba(231, 76, 60, 0.1)';
                statusColor = 'var(--danger)'; // Red for new
            }

            const category = getVal(c[6]) || 'Task';
            const safeCategory = String(category).replace(/'/g, "&#39;");
            
            const tittle = getVal(c[7]) || 'Untitled Task';
            const safeTittle = String(tittle).replace(/'/g, "&#39;");
            
            const rawPlanDetail = getVal(c[8]) || 'No detail provided';
            const rawResult = getVal(c[9]) || 'No result provided';
            const rawHistory = getVal(c[18]) || 'No history recorded';
            
            let deadline = getVal(c[11]);
            if (deadline) {
                const parts = String(deadline).split('/');
                if (parts.length >= 2) deadline = `${parts[0]}/${parts[1]}`;
            }
            const rawDeadline = deadline || 'No deadline';
            
            const safePlanDetail = String(rawPlanDetail).replace(/\n/g, '<br/>');
            const safeResult = String(rawResult).replace(/\n/g, '<br/>');
            const safeDeadline = String(rawDeadline).replace(/\n/g, '<br/>');
            const safeHistory = String(rawHistory).replace(/\n/g, '<br/>');

            const shortPlan = String(tittle).length > 80 ? String(tittle).substring(0, 80) + '...' : String(tittle);
            
            const combinedHTML = `
                <div style="font-size: 1.1rem; line-height: 1.6; color: var(--text-dark);">
                    <h3 style="margin-top: 0; margin-bottom: 15px; color: var(--primary-dark); font-size: 1.3rem; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 10px;">${safeTittle}</h3>
                    <div style="display: flex; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 8px;">
                        <span class="status-badge" style="background: ${statusBg}; color: ${statusColor}; margin: 0;">${status}</span>
                        <span class="category-badge" style="margin: 0;"><i class="fa-solid fa-tag"></i> ${safeCategory}</span>
                        <span class="deadline-badge" style="margin-left: auto; margin-right: 0;"><i class="fa-regular fa-clock"></i> ${safeDeadline}</span>
                    </div>
                    <strong style="color: var(--primary); display: block; margin-bottom: 5px;">Plan Detail:</strong>
                    <p style="margin-top: 0; margin-bottom: 15px;">${safePlanDetail}</p>
                    <strong style="color: var(--info); display: block; margin-bottom: 5px;">Result:</strong>
                    <p style="margin-top: 0; margin-bottom: 15px;">${safeResult}</p>
                    <strong style="color: #64748b; display: block; margin-bottom: 5px;">History:</strong>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; font-size: 0.95rem; font-family: 'Consolas', monospace; color: #475569; max-height: 150px; overflow-y: auto;">${safeHistory}</div>
                </div>
            `;
            
            const taskId = getVal(c[0]) || '';
            const taskObjStr = JSON.stringify({
                id: taskId,
                pic: getVal(c[4]) || '',
                month: getVal(c[22]) || '',
                category: getVal(c[6]) || '',
                title: getVal(c[7]) || '',
                taskDetail: getVal(c[8]) || '',
                week: getVal(c[21]) || '',
                status: status,
                deadline: getVal(c[11]) || '',
                result: getVal(c[9]) || '',
                pending: getVal(c[8]) || ''
            }).replace(/"/g, '&quot;').replace(/'/g, "&#39;");

            const safeHTML = combinedHTML
                .replace(/"/g, '&quot;')
                .replace(/`/g, '\\`')
                .replace(/\n/g, ' ')
                .replace(/\r/g, ' ')
                .replace(/'/g, "&#39;");
            
            listHtml += `
                <div class="modern-card" style="border-left: 4px solid ${statusColor}; margin-bottom: 0; transition: transform 0.2s, box-shadow 0.2s; position: relative;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(0,0,0,0.08)'" onmouseout="this.style.transform='none'; this.style.boxShadow=''">
                    <div class="modern-card-header">
                        <span class="status-badge" style="background: ${statusBg}; color: ${statusColor};">${status}</span>
                        <span class="category-badge" style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><i class="fa-solid fa-tag"></i> ${safeCategory}</span>
                        <div style="margin-left: auto; display: flex; align-items: center; gap: 12px;">
                            <span class="deadline-badge" style="margin: 0;"><i class="fa-regular fa-clock"></i> ${deadline || 'No Deadline'}</span>
                            <button onclick="openTaskModal(${taskObjStr})" style="border: none; background: none; color: var(--primary); cursor: pointer; padding: 4px; font-size: 0.9rem;" title="Edit Task"><i class="fa-solid fa-pen"></i></button>
                        </div>
                    </div>
                    <div class="modern-card-body" style="font-size: 0.9rem; cursor: pointer;" onclick='openTaskDetailModal(${taskObjStr}, \`${safeHTML}\`)' title="Click to view details and quick update">
                        ${shortPlan}
                    </div>
                </div>
            `;
        });
    }

    if (activeTasks.length > 0) {
        detailPanel.innerHTML = titleHtml + `<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px;">${listHtml}</div>`;
    } else {
        detailPanel.innerHTML = titleHtml + listHtml;
    }
    
    // Update completed panel
    const completedPanel = document.getElementById(`${containerId.replace('-detail-panel', '-completed-panel')}`);
    if (completedPanel) {
        if (completedTasks.length > 0) {
            let compHtml = `<div style="background: #f8fafc; border: 1px dashed rgba(0,0,0,0.1); border-radius: 8px; padding: 16px;">`;
            compHtml += `<h4 style="margin-top: 0; margin-bottom: 12px; color: var(--success); font-size: 0.95rem; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-circle-check"></i> Completed Tasks (${completedTasks.length})</h4>`;
            compHtml += `<ul style="margin: 0; padding-left: 20px; color: var(--text-muted); font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px;">`;
            completedTasks.forEach(row => {
                const c = row.c;
                const category = getVal(c[6]) || 'Task';
                const safeCategory = String(category).replace(/'/g, "&#39;");
                
                const tittle = getVal(c[7]) || 'Untitled Task';
                const safeTittle = String(tittle).replace(/'/g, "&#39;");
                
                const rawPlanDetail = getVal(c[8]) || 'No detail provided';
                const rawResult = getVal(c[9]) || 'No result provided';
                
                let deadline = getVal(c[11]);
                if (deadline) {
                    const parts = String(deadline).split('/');
                    if (parts.length >= 2) deadline = `${parts[0]}/${parts[1]}`;
                }
                const rawDeadline = deadline || 'No deadline';
                
                const safePlanDetail = String(rawPlanDetail).replace(/\n/g, '<br/>');
                const safeResult = String(rawResult).replace(/\n/g, '<br/>');
                const safeDeadline = String(rawDeadline).replace(/\n/g, '<br/>');
                const rawHistory = getVal(c[18]) || 'No history recorded';
                const safeHistory = String(rawHistory).replace(/\n/g, '<br/>');

                const rawStatus = getVal(c[10]) || 'Completed';
                const safeStatus = String(rawStatus).replace(/'/g, "&#39;");
                const shortPlan = String(tittle).length > 50 ? String(tittle).substring(0, 50) + '...' : String(tittle);
                
                const combinedHTML = `
                    <div style="background: rgba(255,255,255,0.9); padding: 15px; border-radius: 8px; font-size: 1.1rem; line-height: 1.6; color: var(--text-dark); border: 1px solid rgba(0,0,0,0.1);">
                        <h3 style="margin-top: 0; margin-bottom: 15px; color: var(--primary-dark); font-size: 1.3rem; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 10px;">${safeTittle}</h3>
                        <div style="display: flex; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 8px;">
                            <span class="status-badge" style="background: rgba(46, 204, 113, 0.1); color: var(--success); margin: 0;">${safeStatus}</span>
                            <span class="category-badge" style="margin: 0;"><i class="fa-solid fa-tag"></i> ${safeCategory}</span>
                            <span class="deadline-badge" style="margin-left: auto; margin-right: 0;"><i class="fa-regular fa-clock"></i> ${safeDeadline}</span>
                        </div>
                        <strong style="color: var(--primary); display: block; margin-bottom: 5px;">Plan Detail:</strong>
                        <p style="margin-top: 0; margin-bottom: 15px;">${safePlanDetail}</p>
                        <strong style="color: var(--info); display: block; margin-bottom: 5px;">Result:</strong>
                        <p style="margin-top: 0; margin-bottom: 15px;">${safeResult}</p>
                        <strong style="color: #64748b; display: block; margin-bottom: 5px;">History:</strong>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; font-size: 0.95rem; font-family: 'Consolas', monospace; color: #475569; max-height: 150px; overflow-y: auto;">${safeHistory}</div>
                    </div>
                `;
                
                const safeHTML = combinedHTML
                    .replace(/"/g, '&quot;')
                    .replace(/`/g, '\\`')
                    .replace(/\n/g, ' ')
                    .replace(/\r/g, ' ')
                    .replace(/'/g, "&#39;");
                
                compHtml += `<li style="cursor: pointer; transition: color 0.2s; display: flex; align-items: flex-start; justify-content: space-between;" onmouseover="this.style.color='var(--success)'" onmouseout="this.style.color='var(--text-muted)'" onclick="openClassDetail('', \`${safeHTML}\`)" title="Click to view details"><del style="flex: 1; margin-right: 8px;">${shortPlan}</del> <span style="font-size: 0.8rem; background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px; white-space: nowrap;"><i class="fa-regular fa-clock"></i> ${deadline || 'N/A'}</span></li>`;
            });
            compHtml += `</ul></div>`;
            completedPanel.innerHTML = compHtml;
        } else {
            completedPanel.innerHTML = '';
        }
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
        const rowMonth = getVal(row.c[22]);
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
        let week = getVal(row.c[21]) || 'W1';
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
        tr.innerHTML = `<td style="font-weight: 700; color: #0284c7; vertical-align: middle; text-align: center; font-size: 1.05rem;">${pic}</td>`;
        
        weeks.forEach(week => {
            const cell = document.createElement('td');
            if (dataMap[pic][week]) {
                const contentDiv = document.createElement('div');
                contentDiv.className = 'report-table-cell-content';
                
                dataMap[pic][week].forEach(row => {
                    const c = row.c;
                    const win = getVal(c[14]);
                    const redFlag = getVal(c[15]);
                    const top5 = getVal(c[16]);
                    
                    const formatText = (text) => {
                        if (!text) return '';
                        let formatted = text.replace(/\n/g, '<br/>');
                        formatted = formatted.replace(/(?:^|<br\/>)\s*-\s+(.*?)(?=(?:<br\/>|$))/g, '<br/>• $1');
                        if (formatted.startsWith('<br/>')) formatted = formatted.substring(5);
                        return `<div style="margin-top: 2px; padding-left: 4px; color: var(--text-dark); line-height: 1.5;">${formatted}</div>`;
                    };

                    let html = '';
                    if (win) html += `
                        <div class="report-item" style="margin-bottom: 12px; background: white; padding: 10px; border-radius: 8px; border-left: 4px solid var(--success); box-shadow: 0 1px 3px rgba(0,0,0,0.05);" title="Win">
                            ${formatText(win)}
                        </div>`;
                    if (redFlag) html += `
                        <div class="report-item" style="margin-bottom: 12px; background: white; padding: 10px; border-radius: 8px; border-left: 4px solid var(--danger); box-shadow: 0 1px 3px rgba(0,0,0,0.05);" title="Red Flag">
                            ${formatText(redFlag)}
                        </div>`;
                    if (top5) html += `
                        <div class="report-item" style="margin-bottom: 12px; background: white; padding: 10px; border-radius: 8px; border-left: 4px solid var(--primary-color); box-shadow: 0 1px 3px rgba(0,0,0,0.05);" title="Top 5 Things">
                            ${formatText(top5)}
                        </div>`;
                    
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

function renderTeacherObservations(classRows) {
    const grid = document.getElementById('teacher-observation-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // Group by branch then department
    const branchMap = {
        'Ngô Quyền (NQ)': {},
        'Hưng Định (HD)': {}
    };
    
    let totalCompletedObs = 0;
    let totalPendingObs = 0;
    classRows.forEach(row => {
        const c = row.c;
        let rawBranch = getVal(c[3]) || '';
        let branch = '';
        if (rawBranch.includes('HD') || rawBranch.includes('Hưng Định')) {
            branch = 'Hưng Định (HD)';
        } else {
            branch = 'Ngô Quyền (NQ)';
        }
        
        const department = getVal(c[5]) || 'Unknown Department';
        if (!branchMap[branch][department]) {
            branchMap[branch][department] = {
                rows: [],
                observed: 0,
                pending: 0
            };
        }
        branchMap[branch][department].rows.push(row);
        
        const obs = getVal(c[13]) || '';
        if (obs && String(obs).trim() !== '') {
            branchMap[branch][department].observed++;
            totalCompletedObs++;
        } else {
            branchMap[branch][department].pending++;
            totalPendingObs++;
        }
    });

    const branches = ['Ngô Quyền (NQ)', 'Hưng Định (HD)'];
    let hasAnyData = false;
    
    branches.forEach(branch => {
        const departments = Object.keys(branchMap[branch]).sort((a, b) => a.localeCompare(b));
        if (departments.length === 0) return;
        hasAnyData = true;

        let colorStr = branch === 'Ngô Quyền (NQ)' ? '#3498db' : '#2ecc71';
        let bgStr = branch === 'Ngô Quyền (NQ)' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(46, 204, 113, 0.1)';
        const totalClasses = Object.values(branchMap[branch]).reduce((acc, dept) => acc + dept.rows.length, 0);
        const totalStudents = Object.values(branchMap[branch]).reduce((acc, dept) => acc + dept.rows.reduce((sum, row) => sum + parseInt(getVal(row.c[7]) || 0), 0), 0);

        const branchHeader = document.createElement('div');
        branchHeader.style.gridColumn = '1 / -1';
        branchHeader.style.marginTop = '16px';
        branchHeader.style.paddingBottom = '8px';
        branchHeader.style.borderBottom = `2px solid ${colorStr}`;
        branchHeader.style.display = 'flex';
        branchHeader.style.alignItems = 'center';
        branchHeader.style.justifyContent = 'space-between';
        branchHeader.innerHTML = `
            <h3 style="color: ${colorStr}; margin: 0; font-size: 1.3rem;">
                <i class="fa-solid fa-building"></i> ${branch}
            </h3>
            <div style="display: flex; gap: 8px;">
                <span class="status-badge" style="background: ${bgStr}; color: ${colorStr}; font-size: 0.95rem; margin: 0;">
                    ${totalClasses} Classes
                </span>
                <span class="status-badge" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; font-size: 0.95rem; margin: 0;">
                    ${totalStudents} Students
                </span>
            </div>
        `;
        grid.appendChild(branchHeader);

        departments.forEach(department => {
            const data = branchMap[branch][department];
            const sortedRows = data.rows.sort((a, b) => {
                const classA = String(getVal(a.c[6]) || '');
                const classB = String(getVal(b.c[6]) || '');
                return classA.localeCompare(classB, undefined, { numeric: true, sensitivity: 'base' });
            });

            let rowsHtml = '';
            sortedRows.forEach(row => {
                const c = row.c;
                const className = getVal(c[6]) || 'Unknown';
                const schedule = getVal(c[12]) || '-';
                const teacherName = getShortName(getVal(c[9])) || '-';
                const obs = getVal(c[13]) || '';
                const tScore = getVal(c[24]) || '-';
                const sEval = getVal(c[25]) || '-';
                const headComment = getVal(c[26]) || '-';
                
                let statusBadge = '';
                if (obs && String(obs).trim() !== '') {
                    statusBadge = `<span class="status-badge" style="background: rgba(46, 204, 113, 0.1); color: var(--success); font-size: 0.75rem;">Observed</span>`;
                } else {
                    statusBadge = `<span class="status-badge" style="background: rgba(243, 156, 18, 0.1); color: var(--warning); font-size: 0.75rem;">Pending</span>`;
                }

                let hasEval = sEval !== '-' && sEval !== '';
                let hasComment = headComment !== '-' && headComment !== '';
                
                let formattedEval = hasEval ? sEval.replace(/\n/g, '<br>') : 'No evaluation';
                let formattedComment = hasComment ? headComment.replace(/\n/g, '<br>') : 'No comment';
                
                let combinedHTML = `
                    <div style="background: rgba(255,255,255,0.9); padding: 15px; border-radius: 8px; font-size: 1.1rem; line-height: 1.6; color: var(--text-dark); border: 1px solid rgba(0,0,0,0.1);">
                        <h3 style="margin-top: 0; margin-bottom: 15px; color: var(--primary-dark); font-size: 1.3rem; border-bottom: 1px solid rgba(0,0,0,0.1); padding-bottom: 10px;">${className.split(' - ')[0]}</h3>
                        <strong style="color: var(--primary); display: block; margin-bottom: 5px;">Student Evaluation:</strong>
                        <p style="margin-top: 0; margin-bottom: 15px;">${formattedEval}</p>
                        <strong style="color: var(--warning); display: block; margin-bottom: 5px;">Head Comment:</strong>
                        <p style="margin-top: 0; margin-bottom: 0;">${formattedComment}</p>
                    </div>
                `;
                
                let safeHTML = combinedHTML
                    .replace(/"/g, '&quot;')
                    .replace(/`/g, '\\`')
                    .replace(/\n/g, ' ')
                    .replace(/\r/g, ' ');
                    
                let headIcon = (hasEval || hasComment)
                    ? `<i class="fa-solid fa-comments" style="color: var(--primary); cursor: pointer; font-size: 1.2rem;" onclick="openClassDetail('', \`${safeHTML}\`)"></i>`
                    : '-';

                const studentCount = parseInt(getVal(c[7]) || 0);
                const classTitleStr = className.split(' - ')[0];

                const achievement = getVal(c[30]) || '-';
                const redFlag = getVal(c[31]) || '-';
                const action = getVal(c[32]) || '-';

                let detailSafeHTML = '';
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
                    detailSafeHTML = modalContent.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\n/g, '').replace(/\r/g, ' ');
                }
                    
                let detailIcon = hasDetails
                    ? `<i class="fa-solid fa-chalkboard-user" style="color: var(--primary); cursor: pointer; font-size: 1.2rem;" onclick="openClassDetail('', '${detailSafeHTML}')"></i>`
                    : '-';

                rowsHtml += `
                    <tr>
                        <td style="padding: 10px 8px;">
                            <div style="font-weight: 600; color: var(--primary-dark); font-size: 0.9rem;">${classTitleStr}</div>
                            <div style="color: #64748b; font-size: 0.75rem; margin-top: 4px;"><i class="fa-regular fa-clock"></i> ${schedule} &nbsp;|&nbsp; <i class="fa-solid fa-users"></i> ${studentCount}</div>
                        </td>
                        <td style="padding: 8px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${teacherName}</td>
                        <td style="padding: 8px; text-align: center;">${statusBadge}</td>
                        <td style="padding: 8px; text-align: center;">${tScore}</td>
                        <td style="padding: 8px; text-align: center;">${headIcon}</td>
                        <td style="padding: 8px; text-align: center;">${detailIcon}</td>
                        <td style="padding: 8px; text-align: center;"><button class="icon-btn" onclick="openClassDetail('${classTitleStr}')"><i class="fa-solid fa-arrow-right"></i></button></td>
                    </tr>
                `;
            });

            const card = document.createElement('div');
            card.className = 'modern-card panel';
            card.style.margin = '0';
            card.innerHTML = `
                <div class="modern-card-header" style="justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.05); margin-bottom: 12px;">
                    <h3 style="margin: 0; font-size: 1.1rem; color: var(--primary-dark); display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-layer-group"></i> ${department}
                    </h3>
                    <div style="display: flex; gap: 8px;">
                        <span class="status-badge" style="background: rgba(46, 204, 113, 0.1); color: var(--success);"><i class="fa-solid fa-check"></i> ${data.observed} Observed</span>
                        <span class="status-badge" style="background: rgba(231, 76, 60, 0.1); color: var(--danger);"><i class="fa-solid fa-clock"></i> ${data.pending} Pending</span>
                    </div>
                </div>
                <div class="modern-card-body" style="padding: 0;">
                    <div style="overflow-x: auto;">
                        <table class="modern-table" style="width: 100%; font-size: 0.85rem; min-width: 450px; table-layout: fixed;">
                            <thead>
                                <tr>
                                    <th style="padding: 8px; width: 35%;">Class</th>
                                    <th style="padding: 8px; width: 20%; text-align: left;">Teacher</th>
                                    <th style="padding: 8px; width: 15%; text-align: center;">Status</th>
                                    <th style="padding: 8px; width: 10%; text-align: center;">T.Score</th>
                                    <th style="padding: 8px; width: 10%; text-align: center;">Head</th>
                                    <th style="padding: 8px; width: 10%; text-align: center;">Detail</th>
                                    <th style="padding: 8px; width: 5%;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    });

    if (!hasAnyData) {
        grid.innerHTML = '<p style="color: var(--text-muted);">No classes available.</p>';
    }
    
    const monthVal = typeof currentMonthIndex !== 'undefined' ? currentMonthIndex + 3 : 3;
    const monthStr = String(monthVal).padStart(2, '0');
    const prevMonthStr = (typeof currentMonthIndex !== 'undefined' && currentMonthIndex > 0) ? String(monthVal - 1).padStart(2, '0') : null;

    let prevCompletedObs = 0;
    let prevPendingObs = 0;

    if (prevMonthStr) {
        const prevClassRows = globalClassRows.filter(row => row.c[57] && String(row.c[57].v).padStart(2, '0') === prevMonthStr);
        prevClassRows.forEach(row => {
            const obs = getVal(row.c[13]) || '';
            if (obs && String(obs).trim() !== '') prevCompletedObs++;
            else prevPendingObs++;
        });
    }

    const formatTrend = (current, prev) => {
        if (!prevMonthStr) return `<i class="fa-solid fa-minus"></i> No previous data`;
        if (prev === 0) return current > 0 ? `<i class="fa-solid fa-arrow-up"></i> +100% vs last month` : `<i class="fa-solid fa-minus"></i> 0% vs last month`;
        const diff = current - prev;
        const pct = Math.round((diff / prev) * 100);
        if (pct > 0) return `<i class="fa-solid fa-arrow-up"></i> +${pct}% vs last month`;
        if (pct < 0) return `<i class="fa-solid fa-arrow-down"></i> ${pct}% vs last month`;
        return `<i class="fa-solid fa-minus"></i> 0% vs last month`;
    };

    const obsEl1 = document.getElementById('head-completed-obs');
    if(obsEl1) obsEl1.innerText = totalCompletedObs;
    
    const obsEl2 = document.getElementById('head-pending-obs');
    if(obsEl2) obsEl2.innerText = totalPendingObs;

    const getTrendEl = (id) => {
        const el = document.getElementById(id);
        if (el) return el.nextElementSibling;
        return null;
    };
    
    const trendObs1 = getTrendEl('head-completed-obs');
    if (trendObs1) {
        trendObs1.innerHTML = formatTrend(totalCompletedObs, prevCompletedObs);
        trendObs1.className = 'trend ' + (totalCompletedObs >= prevCompletedObs ? 'positive' : 'negative');
    }
    
    const trendObs2 = getTrendEl('head-pending-obs');
    if (trendObs2) {
        trendObs2.innerHTML = formatTrend(totalPendingObs, prevPendingObs);
        trendObs2.className = 'trend ' + (totalPendingObs <= prevPendingObs ? 'positive' : 'negative');
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
        
        let classList = ['cal-day-item'];
        if (isToday) classList.push('is-today');
        
        let tooltip = '';
        
        if (dayMap[i]) {
            // Day has events
            classList.push('has-events', 'cal-day-active');
            tooltip = dayMap[i].map(e => `${e.time} - ${e.className.split(' - ')[0]}`).join('&#10;');
            html += `<div style="padding: 4px;" title="${tooltip}" onclick="selectCalendarDate(${year}, ${month}, ${i})"><div class="${classList.join(' ')}" id="cal-day-${year}-${month}-${i}">${i}</div></div>`;
        } else {
            html += `<div style="padding: 4px;"><div class="${classList.join(' ')}" id="cal-day-${year}-${month}-${i}">${i}</div></div>`;
        }
    }
    grid.innerHTML = html;
}

function selectCalendarDate(year, month, day) {
    // Reset all day styles to remove active selection
    document.querySelectorAll('.cal-day-item').forEach(el => {
        el.classList.remove('is-selected');
    });
    
    // Highlight selected day
    const selectedEl = document.getElementById(`cal-day-${year}-${month}-${day}`);
    if (selectedEl) {
        selectedEl.classList.add('is-selected');
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('selected-date-display').innerText = `${monthNames[month]} ${day}, ${year}`;
    
    // Update duty person
    const dutyContent = document.getElementById('duty-content');
    if (dutyContent && window.globalDutyRows) {
        const selectedDateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
        const dutyEvents = window.globalDutyRows.filter(row => {
            if (!row || !row.c || !row.c[15]) return false;
            let dStr = '';
            if (row.c[15].f) {
                dStr = row.c[15].f;
            } else if (row.c[15].v) {
                const parts = String(row.c[15].v).replace('Date(', '').replace(')', '').split(',');
                if (parts.length >= 3) {
                    dStr = `${String(parts[2]).padStart(2, '0')}/${String(parseInt(parts[1])+1).padStart(2, '0')}/${parts[0]}`;
                }
            }
            return dStr === selectedDateStr;
        });
        
        if (dutyEvents.length > 0) {
            const renderDutyGroup = (groupDuties, title, color, isAcademic) => {
                if (groupDuties.length === 0) return '';
                
                const parsed = groupDuties.map(row => {
                    const label = getVal(row.c[13]) || '';
                    const branch = getVal(row.c[4]) || '';
                    const dutyType = getVal(row.c[2]) || '';
                    let timeMatch = label.match(/(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/);
                    let timeStr = timeMatch ? timeMatch[1] : '';
                    let namePart = label.indexOf('-') !== -1 ? label.substring(label.indexOf('-') + 1).trim() : label;
                    if (timeStr) {
                        namePart = namePart.replace(new RegExp('\\s*\\(?' + timeStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\)?\\s*'), '').trim();
                    }
                    return { branch, timeStr, namePart, label, dutyType, _dutyId: row._dutyId };
                });

                let html = `<div style="background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 12px; margin-bottom: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">`;
                html += `<div style="font-weight: 700; color: ${color}; font-size: 0.95rem; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(0,0,0,0.1); padding-bottom: 8px;">`;
                html += `<span>${title}</span>`;
                html += `</div>`;
                
                if (isAcademic) {
                    let nqSang = [], hdSang = [], nqChieu = [], hdChieu = [];
                    parsed.forEach(p => {
                        let isMorning = true;
                        if (p.timeStr) {
                            const startHour = parseInt(p.timeStr.split(':')[0]);
                            if (startHour >= 12) isMorning = false;
                        }
                        
                        let timeLabel = p.timeStr ? `<span style="font-weight: 600; color: var(--text-dark);">${p.timeStr}</span>` : '';
                        let wfhTag = p.dutyType && p.dutyType.toUpperCase() === 'WFH' ? ` <span style="font-weight: 700; color: #ea580c; font-size: 0.75rem;">(WFH)</span>` : '';
                        let displayStr = `<div onclick="openDutyDetail(${p._dutyId})" style="cursor: pointer; padding: 4px 0; transition: transform 0.2s;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='none'">${timeLabel} <span style="color: var(--text-dark); margin-left: 4px;">${p.namePart}</span>${wfhTag}</div>`;
                        
                        if (p.branch === 'NQ' || p.label.includes('NQ')) {
                            if (isMorning) nqSang.push(displayStr); else nqChieu.push(displayStr);
                        } else if (p.branch === 'HD' || p.branch === 'HĐ' || p.label.includes('HĐ') || p.label.includes('HD')) {
                            if (isMorning) hdSang.push(displayStr); else hdChieu.push(displayStr);
                        }
                    });

                    html += `<div style="display: flex; gap: 16px; font-size: 0.85rem;">`;
                    
                    // NQ Column
                    html += `<div style="flex: 1; padding-left: 12px; padding-right: 12px; border-right: 1px dashed rgba(0,0,0,0.1);">
                        <div style="font-size: 0.75rem; color: #0284c7; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Ngô Quyền</div>`;
                    if (nqSang.length > 0) {
                        html += `<div style="font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; background: rgba(0,0,0,0.03); padding: 2px 6px; border-radius: 4px; display: inline-block;">Morning</div>`;
                        html += `<div style="color: var(--text-dark); line-height: 1.6; margin-bottom: 10px; padding-left: 4px;">${nqSang.join('<br>')}</div>`;
                    }
                    if (nqChieu.length > 0) {
                        html += `<div style="font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; background: rgba(0,0,0,0.03); padding: 2px 6px; border-radius: 4px; display: inline-block;">Afternoon</div>`;
                        html += `<div style="color: var(--text-dark); line-height: 1.6; padding-left: 4px;">${nqChieu.join('<br>')}</div>`;
                    }
                    if (nqSang.length === 0 && nqChieu.length === 0) {
                        html += `<div style="color: var(--text-muted); font-style: italic;">-</div>`;
                    }
                    html += `</div>`;
                    
                    // HD Column
                    html += `<div style="flex: 1; padding-left: 12px;">
                        <div style="font-size: 0.75rem; color: #059669; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Hưng Định</div>`;
                    if (hdSang.length > 0) {
                        html += `<div style="font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; background: rgba(0,0,0,0.03); padding: 2px 6px; border-radius: 4px; display: inline-block;">Morning</div>`;
                        html += `<div style="color: var(--text-dark); line-height: 1.6; margin-bottom: 10px; padding-left: 4px;">${hdSang.join('<br>')}</div>`;
                    }
                    if (hdChieu.length > 0) {
                        html += `<div style="font-size: 0.75rem; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; background: rgba(0,0,0,0.03); padding: 2px 6px; border-radius: 4px; display: inline-block;">Afternoon</div>`;
                        html += `<div style="color: var(--text-dark); line-height: 1.6; padding-left: 4px;">${hdChieu.join('<br>')}</div>`;
                    }
                    if (hdSang.length === 0 && hdChieu.length === 0) {
                        html += `<div style="color: var(--text-muted); font-style: italic;">-</div>`;
                    }
                    html += `</div>`;
                    
                    html += `</div>`;
                    
                } else {
                    // Operation
                    let sang = [];
                    let chieu = [];
                    
                    parsed.forEach(p => {
                        let isMorning = true;
                        let t = p.timeStr || '';
                        if (t) {
                            const startHour = parseInt(t.split(':')[0]);
                            if (startHour >= 12) isMorning = false;
                        }
                        if (isMorning) sang.push(p);
                        else chieu.push(p);
                    });

                    const processOpGroup = (groupArr) => {
                        if (groupArr.length === 0) return null;
                        
                        let minStart = "24:00";
                        let maxEnd = "00:00";
                        
                        groupArr.forEach(p => {
                            if (p.timeStr && p.timeStr.includes('-')) {
                                const parts = p.timeStr.split('-');
                                const st = parts[0].trim();
                                const et = parts[1].trim();
                                if (st < minStart) minStart = st;
                                if (et > maxEnd) maxEnd = et;
                            }
                        });
                        
                        let groupTime = "Không rõ giờ";
                        if (minStart !== "24:00" && maxEnd !== "00:00") {
                            groupTime = `${minStart} - ${maxEnd}`;
                        }
                        
                        let nqList = [], hdList = [];
                        groupArr.forEach(p => {
                            let timeDiffText = '';
                            if (p.timeStr && p.timeStr !== groupTime) {
                                timeDiffText = `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">(${p.timeStr})</div>`;
                            }
                            let itemHtml = `<div onclick="openDutyDetail(${p._dutyId})" style="cursor: pointer; padding: 4px 0; transition: transform 0.2s;" onmouseover="this.style.transform='translateX(4px)'" onmouseout="this.style.transform='none'">
                                <span>${p.namePart}</span>
                                ${timeDiffText}
                            </div>`;
                            
                            if (p.branch === 'NQ' || p.label.includes('NQ')) nqList.push(itemHtml);
                            else if (p.branch === 'HD' || p.branch === 'HĐ' || p.label.includes('HĐ') || p.label.includes('HD')) hdList.push(itemHtml);
                        });
                        
                        return { groupTime, nqList, hdList };
                    };
                    
                    const morningGroup = processOpGroup(sang);
                    const afternoonGroup = processOpGroup(chieu);
                    
                    const renderOpGroupHTML = (g, isLast) => {
                        if (!g) return '';
                        const borderStyle = !isLast ? 'border-bottom: 1px dashed rgba(0,0,0,0.06); margin-bottom: 12px; padding-bottom: 12px;' : '';
                        let gHtml = `<div style="display: flex; gap: 16px; font-size: 0.85rem; ${borderStyle}">`;
                        
                        if (g.groupTime !== 'Không rõ giờ') {
                            gHtml += `<div style="width: 100px; flex-shrink: 0; padding-right: 12px; border-right: 1px dashed rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: var(--text-dark);">`;
                            gHtml += `<div style="font-weight: 700; font-size: 0.85rem; text-align: center; white-space: nowrap;"><i class="fa-regular fa-clock" style="font-size: 0.9rem; color: var(--text-muted); margin-right: 6px;"></i>${g.groupTime}</div>`;
                            gHtml += `</div>`;
                        } else {
                            gHtml += `<div style="width: 100px; flex-shrink: 0; padding-right: 12px; border-right: 1px dashed rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; color: var(--text-muted); text-align: center;">${g.groupTime}</div>`;
                        }
                        
                        gHtml += `<div style="flex: 1; padding-left: 12px; padding-right: 12px; border-right: 1px dashed rgba(0,0,0,0.1);">
                            <div style="font-size: 0.75rem; color: #0284c7; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Ngô Quyền</div>
                            <div style="color: var(--text-dark); line-height: 1.6;">${g.nqList.length > 0 ? g.nqList.join('') : '<span style="color: var(--text-muted); font-style: italic;">-</span>'}</div>
                        </div>`;
                        gHtml += `<div style="flex: 1; padding-left: 12px;">
                            <div style="font-size: 0.75rem; color: #059669; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Hưng Định</div>
                            <div style="color: var(--text-dark); line-height: 1.6;">${g.hdList.length > 0 ? g.hdList.join('') : '<span style="color: var(--text-muted); font-style: italic;">-</span>'}</div>
                        </div>`;
                        gHtml += `</div>`;
                        return gHtml;
                    };
                    
                    html += renderOpGroupHTML(morningGroup, !afternoonGroup);
                    html += renderOpGroupHTML(afternoonGroup, true);
                }
                
                html += `</div>`;
                return html;
            };

            const opDuties = dutyEvents.filter(r => { const d = getVal(r.c[3]) || ''; return d.toLowerCase() === 'operation'; });
            const acDuties = dutyEvents.filter(r => { const d = getVal(r.c[3]) || ''; return d.toLowerCase() === 'academic'; });
            
            let dutyHtml = '';
            dutyHtml += renderDutyGroup(opDuties, '<i class="fa-solid fa-briefcase" style="margin-right: 4px;"></i> Operation', 'var(--primary-dark)', false);
            dutyHtml += renderDutyGroup(acDuties, '<i class="fa-solid fa-graduation-cap" style="margin-right: 4px;"></i> Academic', '#d97706', true);
            
            if (!dutyHtml) dutyHtml = '<p style="margin: 0; color: var(--text-muted); font-style: italic;">Không có người trực.</p>';
            dutyContent.innerHTML = dutyHtml;
        } else {
            dutyContent.innerHTML = '<p style="margin: 0; color: var(--text-muted); font-style: italic;">Không có người trực.</p>';
        }
    }

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
        let nqClasses = 0, nqStudents = 0;
        let hdClasses = 0, hdStudents = 0;
        
        dayEvents.forEach(e => {
            const parts = e.className ? e.className.split(' - ')[0].split(' | ') : [];
            const branch = parts.length > 1 ? parts[0].trim() : '';
            const rawData = e.raw && e.raw.c ? e.raw.c : [];
            
            let studentCount = 0;
            if (window.calendarHeaders) {
                const idx = window.calendarHeaders.indexOf('Count Student');
                if (idx !== -1 && rawData[idx]) {
                    studentCount = parseInt(getVal(rawData[idx])) || 0;
                }
            }
            
            if (branch.includes('NQ')) {
                nqClasses++;
                nqStudents += studentCount;
            } else if (branch.includes('HD') || branch.includes('HĐ')) {
                hdClasses++;
                hdStudents += studentCount;
            }
        });

        if (nqHeaderEl) {
            nqHeaderEl.style.display = 'flex';
            nqHeaderEl.style.alignItems = 'center';
            nqHeaderEl.style.justifyContent = 'space-between';
            nqHeaderEl.innerHTML = `<span>Ngô Quyền (NQ)</span> <div><span style="font-size: 0.7rem; text-transform: none; background: rgba(2, 132, 199, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 600;">${nqClasses} Classes</span> <span style="font-size: 0.7rem; text-transform: none; background: rgba(2, 132, 199, 0.1); padding: 2px 6px; border-radius: 4px; margin-left: 4px; font-weight: 600;">${nqStudents} Students</span></div>`;
        }
        if (hdHeaderEl) {
            hdHeaderEl.style.display = 'flex';
            hdHeaderEl.style.alignItems = 'center';
            hdHeaderEl.style.justifyContent = 'space-between';
            hdHeaderEl.innerHTML = `<span>Hưng Định (HD)</span> <div><span style="font-size: 0.7rem; text-transform: none; background: rgba(5, 150, 105, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 600;">${hdClasses} Classes</span> <span style="font-size: 0.7rem; text-transform: none; background: rgba(5, 150, 105, 0.1); padding: 2px 6px; border-radius: 4px; margin-left: 4px; font-weight: 600;">${hdStudents} Students</span></div>`;
        }
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
        <div onclick="openCalEventDetail(${e._eventId})" class="daily-class-card" style="background: white; border-left: 3px solid ${leftBorder}; border-radius: 6px; padding: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 4px; transition: transform 0.2s; overflow: hidden; cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <div style="font-weight: 600; color: var(--text-dark); font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${cName}">${cName}</div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <div style="display: flex; align-items: center; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;" title="${getShortName(e.teacher)}">
                    <i class="fa-solid fa-chalkboard-user" style="margin-right: 4px;"></i> 
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${getShortName(e.teacher)}</span>
                </div>
                ${timeHtml}
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
            // Nothing here, we render time in the column below
        }

        const showTimeInCard = !hasSameTime;

        html += `
            <div style="display: flex; gap: 20px; margin-bottom: 24px; align-items: stretch;">
                <!-- Time Column -->
                <div style="flex: 0 0 150px; padding-right: 16px; border-right: 1px dashed rgba(0,0,0,0.1); display: flex; flex-direction: column; justify-content: center;">
                    ${groupBadgeTime ? `
                    <div style="background: rgba(99,102,241,0.05); padding: 8px 12px; border-radius: 8px; border-left: 3px solid var(--primary-color);">
                        <span style="color: var(--primary-color); font-weight: 700; font-size: 0.85rem; letter-spacing: 0.5px;">
                            <i class="fa-regular fa-clock" style="margin-right: 4px;"></i> ${groupBadgeTime}
                        </span>
                    </div>` : ''}
                </div>
                
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
function updateRoleTaskMetrics(roleName, prefix, monthStr, prevMonthStr) {
    if (!globalLeaderRows || globalLeaderRows.length === 0) return;

    // 1. Current Month Data
    const currentTasks = globalLeaderRows.filter(row => {
        if (!row || !row.c || getShortName(getVal(row.c[4])) !== roleName || getVal(row.c[2]) !== 'Task') return false;
        const deadline = getVal(row.c[11]) || '';
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
            const deadline = getVal(row.c[11]) || '';
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

function updateRoleTaskMetrics(roleName, prefix, monthStr, prevMonthStr) {
    if (!globalLeaderRows || globalLeaderRows.length === 0) return;

    // 1. Current Month Data
    const currentTasks = globalLeaderRows.filter(row => {
        if (!row || !row.c || getShortName(getVal(row.c[4])) !== roleName || getVal(row.c[2]) !== 'Task') return false;
        const deadline = getVal(row.c[11]) || '';
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
            const deadline = getVal(row.c[11]) || '';
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
window.applyTeacherFilter = function() {
    const tSelect = document.getElementById('teacherFilter');
    let selectedTeacher = 'all';
    if (tSelect) {
        selectedTeacher = tSelect.value;
    }
    
    let rowsToRender = window.currentMonthFilteredRows || [];
    if (selectedTeacher !== 'all') {
        rowsToRender = rowsToRender.filter(row => getShortName(getVal(row.c[9])) === selectedTeacher);
    }
    
    const monthVal = typeof currentMonthIndex !== 'undefined' ? currentMonthIndex + 3 : 3;
    const monthStr = String(monthVal).padStart(2, '0');
    renderTeacherPerformance(rowsToRender, monthStr);
}

function renderTeacherPerformance(classRows, currentMonthStr) {
    const grid = document.getElementById('teacher-performance-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const branchMap = {
        'Ngô Quyền (NQ)': {},
        'Hưng Định (HD)': {}
    };

    classRows.forEach(row => {
        const c = row.c;
        let rawBranch = getVal(c[3]) || '';
        let branch = '';
        if (rawBranch.includes('HD') || rawBranch.includes('Hưng Định')) {
            branch = 'Hưng Định (HD)';
        } else {
            branch = 'Ngô Quyền (NQ)';
        }
        
        const department = getVal(c[5]) || 'Unknown Department';
        if (!branchMap[branch][department]) {
            branchMap[branch][department] = { rows: [], count: 0 };
        }
        branchMap[branch][department].rows.push(row);
        branchMap[branch][department].count++;
    });

    const branches = ['Ngô Quyền (NQ)', 'Hưng Định (HD)'];
    let hasAnyData = false;

    branches.forEach(branch => {
        const departments = Object.keys(branchMap[branch]).sort((a, b) => a.localeCompare(b));
        if (departments.length === 0) return;
        hasAnyData = true;

        let colorStr = branch === 'Ngô Quyền (NQ)' ? '#3498db' : '#2ecc71';
        let bgStr = branch === 'Ngô Quyền (NQ)' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(46, 204, 113, 0.1)';
        const totalClasses = Object.values(branchMap[branch]).reduce((acc, dept) => acc + dept.rows.length, 0);
        const totalStudents = Object.values(branchMap[branch]).reduce((acc, dept) => acc + dept.rows.reduce((sum, row) => sum + parseInt(getVal(row.c[7]) || 0), 0), 0);

        const branchHeader = document.createElement('div');
        branchHeader.style.gridColumn = '1 / -1';
        branchHeader.style.marginTop = '16px';
        branchHeader.style.paddingBottom = '8px';
        branchHeader.style.borderBottom = `2px solid ${colorStr}`;
        branchHeader.style.display = 'flex';
        branchHeader.style.alignItems = 'center';
        branchHeader.style.justifyContent = 'space-between';
        branchHeader.innerHTML = `
            <h3 style="color: ${colorStr}; margin: 0; font-size: 1.3rem;">
                <i class="fa-solid fa-building"></i> ${branch}
            </h3>
            <div style="display: flex; gap: 8px;">
                <span class="status-badge" style="background: ${bgStr}; color: ${colorStr}; font-size: 0.95rem; margin: 0;">
                    ${totalClasses} Classes
                </span>
                <span class="status-badge" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6; font-size: 0.95rem; margin: 0;">
                    ${totalStudents} Students
                </span>
            </div>
        `;
        grid.appendChild(branchHeader);

        departments.forEach(department => {
            const data = branchMap[branch][department];
            const sortedRows = data.rows.sort((a, b) => {
                const classA = String(getVal(a.c[6]) || '');
                const classB = String(getVal(b.c[6]) || '');
                return classA.localeCompare(classB, undefined, { numeric: true, sensitivity: 'base' });
            });

            const deptTotalStudents = data.rows.reduce((sum, row) => sum + parseInt(getVal(row.c[7]) || 0), 0);

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
                                    <th style="padding: 8px; width: 35%;">Class</th>
                                    <th style="padding: 8px; width: 15%; text-align: left;">Teacher</th>
                                    <th style="padding: 8px; width: 10%; text-align: center;">Absence</th>
                                    <th style="padding: 8px; width: 15%; text-align: center;">Progress</th>
                                    <th style="padding: 8px; width: 15%; text-align: center;">Exam Date</th>
                                    <th style="padding: 8px; width: 10%; text-align: center;">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedRows.map(row => {
                                    const c = row.c;
                                    const className = getVal(c[6]) || getVal(c[1]);
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
                                    if (examDate !== '-' && currentMonthStr && examDate.split('/')[1] === currentMonthStr) {
                                        formattedExamDate = `<span style="display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fef08a, #facc15); color: #854d0e; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 0.75rem; box-shadow: 0 2px 4px rgba(250, 204, 21, 0.2);">${examDate}</span>`;
                                    }

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
                                        ? `<i class="fa-solid fa-chalkboard-user" style="color: var(--primary); cursor: pointer; font-size: 1.2rem;" onclick="openClassDetail('', '${safeHTML}')"></i>`
                                        : '-';

                                    let pColor = '';
                                    let pBg = '';
                                    const pLower = String(progress).toLowerCase();
                                    if (pLower.includes('late') || pLower.includes('trễ') || pLower.includes('chậm') || pLower.includes('behind')) {
                                        pColor = '#ef4444'; // red
                                        pBg = 'rgba(239, 68, 68, 0.1)';
                                    } else if (pLower.includes('on track') || pLower.includes('đúng tiến độ') || pLower.includes('kịp')) {
                                        pColor = '#10b981'; // green
                                        pBg = 'rgba(16, 185, 129, 0.1)';
                                    } else if (pLower.includes('missing') || pLower.includes('mất bài') || pLower.includes('nghỉ')) {
                                        pColor = '#8b5cf6'; // purple
                                        pBg = 'rgba(139, 92, 246, 0.1)';
                                    } else if (pLower.includes('ahead') || pLower.includes('vượt tiến độ') || pLower.includes('nhanh')) {
                                        pColor = '#3b82f6'; // blue
                                        pBg = 'rgba(59, 130, 246, 0.1)';
                                    } else {
                                        pColor = '#64748b'; // default gray
                                        pBg = 'rgba(100, 116, 139, 0.1)';
                                    }
                                    
                                    let pBadgeHtml = progress !== '-' && progress !== '' 
                                        ? `<span class="status-badge" style="margin: 0; background: ${pBg}; color: ${pColor}; font-size: 0.75rem; white-space: nowrap;">${progress}</span>` 
                                        : '-';

                                    return `
                                        <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
                                            <td style="padding: 12px 8px;">
                                                <div style="font-weight: 600; color: var(--primary-dark); font-size: 0.9rem;">${className.split(' - ')[0].trim()}</div>
                                                <div style="color: #64748b; font-size: 0.75rem; margin-top: 4px; display: flex; gap: 8px; align-items: center;">
                                                    <span style="white-space: nowrap;"><i class="fa-regular fa-clock"></i> ${schedule}</span> &nbsp;|&nbsp; <span style="white-space: nowrap;"><i class="fa-solid fa-users"></i> ${studentCount}</span>
                                                </div>
                                            </td>
                                            <td style="padding: 12px 8px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${teacherName}</td>
                                            <td style="padding: 12px 8px; text-align: center;">${absence}</td>
                                            <td style="padding: 12px 8px; text-align: center;">${pBadgeHtml}</td>
                                            <td style="padding: 12px 8px; text-align: center; font-size: 0.8rem;">${formattedExamDate}</td>
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
    });

    if (!hasAnyData) {
        grid.innerHTML = '<p style="color: var(--text-muted);">No classes available.</p>';
    }
}

function renderAcademicPerformance(classRows) {
    const grid = document.getElementById('academic-performance-grid');
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
    if (departments.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted);">No classes available.</p>';
        return;
    }

    departments.forEach(department => {
        const data = departmentMap[department];
        const sortedRows = data.rows.sort((a, b) => {
            const classA = String(getVal(a.c[6]) || '');
            const classB = String(getVal(b.c[6]) || '');
            return classA.localeCompare(classB, undefined, { numeric: true, sensitivity: 'base' });
        });

        const card = document.createElement('div');
        card.className = 'modern-card panel';
        card.style.margin = '0';
        card.innerHTML = `
            <div class="modern-card-header" style="justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid rgba(0,0,0,0.05); margin-bottom: 12px;">
                <h3 style="margin: 0; font-size: 1.1rem; color: var(--primary-dark); display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-layer-group"></i> ${department}
                </h3>
                <span class="status-badge" style="background: rgba(99, 102, 241, 0.1); color: var(--primary);">${data.count} Classes</span>
            </div>
            <div class="modern-card-body" style="padding: 0;">
                <div style="overflow-x: auto;">
                    <table class="modern-table" style="width: 100%; font-size: 0.85rem; min-width: 450px; table-layout: fixed;">
                        <thead>
                            <tr>
                                <th style="padding: 8px; width: 40%;">Class</th>
                                <th style="padding: 8px; width: 20%; text-align: left;">Teacher</th>
                                <th style="padding: 8px; width: 15%; text-align: center;">Aid</th>
                                <th style="padding: 8px; width: 15%; text-align: center;">Roadmap</th>
                                <th style="padding: 8px; width: 10%; text-align: center;">Exam</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sortedRows.map(row => {
                                const c = row.c;
                                const className = getVal(c[6]) || getVal(c[1]);
                                const schedule = getVal(c[12]) || '-';
                                const studentCount = parseInt(getVal(c[7]) || 0);
                                const course = getVal(c[4]) || '';
                                const teacherName = getShortName(getVal(c[9])) || '-';
                                const aid = getVal(c[36]) || '-';
                                const roadmap = getVal(c[37]) || '-';
                                const exam = getVal(c[38]) || '-';
                                
                                const getBadgeHtml = (text, type, courseName) => {
                                    if (!text || text === '-') return text;
                                    const cleanText = text.replace(/^\d+\.\s*/, '');
                                    const lower = cleanText.toLowerCase();
                                    const style = 'style="font-weight: 400; white-space: nowrap; cursor: pointer;"';
                                    
                                    let badgeClass = 'primary';
                                    if (lower.includes('ready') || lower.includes('done') || lower.includes('completed') || lower.includes('yes') || lower.includes('ok') || lower.includes('pass') || lower.includes('có')) badgeClass = 'success';
                                    else if (lower.includes('pending') || lower.includes('no') || lower.includes('late') || lower.includes('missing') || lower.includes('fail') || lower.includes('chưa')) badgeClass = 'danger';
                                    else if (lower.includes('review') || lower.includes('upgrading') || lower.includes('doing') || lower.includes('in progress') || lower.includes('đang')) badgeClass = 'warning';

                                    const safeText = text.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\n/g, '<br>').replace(/\r/g, ' ');
                                    let titleStr = '';
                                    if (type === 'roadmap') {
                                        return `<span class="stat-badge ${badgeClass}" ${style} onclick="window.openRoadmapDetail('${courseName}')">${cleanText}</span>`;
                                    } else if (type === 'aid') titleStr = 'Aid Detail';
                                    else if (type === 'exam') titleStr = 'Exam Detail';

                                    const badgeHtml = `<span class="stat-badge ${badgeClass}" ${style} onclick="openClassDetail('${titleStr}', '${safeText}')">${cleanText}</span>`;
                                    
                                    return badgeHtml;
                                };

                                return `
                                    <tr style="border-bottom: 1px solid rgba(0,0,0,0.05); transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='rgba(99,102,241,0.03)'" onmouseout="this.style.backgroundColor='transparent'">
                                        <td style="padding: 12px 8px;">
                                            <div style="font-weight: 600; color: var(--primary-dark); font-size: 0.9rem;">${className.split(' - ')[0].trim()}</div>
                                            <div style="color: #64748b; font-size: 0.75rem; margin-top: 4px; display: flex; gap: 8px; align-items: center;">
                                                <span style="white-space: nowrap;"><i class="fa-regular fa-clock"></i> ${schedule}</span> &nbsp;|&nbsp; <span style="white-space: nowrap;"><i class="fa-solid fa-users"></i> ${studentCount}</span>
                                            </div>
                                        </td>
                                        <td style="padding: 14px 12px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${teacherName}</td>
                                        <td style="padding: 14px 12px; text-align: center;">${getBadgeHtml(aid, 'aid')}</td>
                                        <td style="padding: 14px 12px; text-align: center;">${getBadgeHtml(roadmap, 'roadmap', course)}</td>
                                        <td style="padding: 14px 12px; text-align: center;">${getBadgeHtml(exam, 'exam')}</td>
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
