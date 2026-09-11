// Dữ liệu mẫu (sẽ bị ghi đè khi dán text mới)
let studentList = [{ ho_va_ten: "Nguyễn Văn A", lop_hoc: "A1K29", ten_dang_nhap: "vana_a1k29", mat_khau: "123" }];

let questionList = JSON.parse(localStorage.getItem('htk_questions')) || [
    { cau_hoi_so: 1, noi_dung: "Ở tế bào nhân thực, bào quan nào chứa ADN?", chuyen_de: "Sinh học tế bào", dang_cau_hoi: 1, dap_an_a: "Riboxom", dap_an_b: "Ti thể", dap_an_c: "Lưới nội chất", dap_an_d: "Bộ máy Golgi", dap_an_dung: "B", giai_thich: "Ti thể và lục lạp là 2 bào quan có chứa ADN riêng." },
    { cau_hoi_so: 2, noi_dung: "Có bao nhiêu cách chọn 2 học sinh từ một tập thể gồm 37 học sinh?", chuyen_de: "Tổ hợp xác suất", dang_cau_hoi: 3, dap_an_dung: "666", giai_thich: "Dùng tổ hợp chập 2 của 37: C(2,37) = 666." }
];

let examResults = JSON.parse(localStorage.getItem('htk_results')) || [];

document.addEventListener('DOMContentLoaded', checkSession);

function checkSession() {
    const user = JSON.parse(localStorage.getItem('htk_user'));
    if (user) {
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('user-session').style.display = 'flex';
        document.getElementById('user-display-name').innerText = user.name.toUpperCase();

        if (user.role === 'student') {
            document.getElementById('student-badge').innerText = `USER: ${user.name} | LỚP: ${user.class}`;
            renderQuiz(); showView('student-quiz-view');
        } else {
            renderTeacherTables(); showView('teacher-dashboard-view');
        }
    } else {
        document.getElementById('auth-buttons').style.display = 'flex';
        document.getElementById('user-session').style.display = 'none';
        showView('landing-view');
    }
}

function studentLogin() {
    const un = document.getElementById('hs-username').value;
    const std = studentList.find(s => s.ten_dang_nhap === un);
    if (std) {
        localStorage.setItem('htk_user', JSON.stringify({role: 'student', name: std.ho_va_ten, class: std.lop_hoc, username: un}));
        closeModal('login-modal'); checkSession();
    } else { alert("Sai tên đăng nhập!"); }
}

function teacherLogin() {
    const gv = document.getElementById('gv-username').value || "Admin";
    localStorage.setItem('htk_user', JSON.stringify({role: 'teacher', name: `GV. ${gv}`}));
    closeModal('teacher-login-modal'); checkSession();
}

function logout() { localStorage.removeItem('htk_user'); checkSession(); }
function goHome() { if(!localStorage.getItem('htk_user')) showView('landing-view'); }
function showView(id) { document.querySelectorAll('.view-section').forEach(e => e.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// --- SMART TEXT PARSER (CỐT LÕI MỚI) ---
function processTextToQuestions() {
    const text = document.getElementById('raw-question-input').value;
    if (!text.trim()) return alert("Vui lòng dán nội dung vào khung!");

    // Tách các câu dựa trên từ khóa "Câu X:"
    const blocks = text.split(/(?=Câu\s*\d+\s*:)/gi).filter(b => b.trim());
    let parsedData = [];

    blocks.forEach((block, index) => {
        let q = { cau_hoi_so: index + 1, noi_dung: "", dang_cau_hoi: 1, dap_an_a: "", dap_an_b: "", dap_an_c: "", dap_an_d: "", dap_an_dung: "", giai_thich: "", chuyen_de: "Chưa phân loại" };
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);

        lines.forEach(line => {
            // Lấy nội dung câu hỏi & tag chuyên đề
            if (line.match(/^Câu\s*\d+\s*:/i)) {
                let content = line.replace(/^Câu\s*\d+\s*:\s*/i, '');
                const tagMatch = content.match(/\((.*?)\)$/);
                if (tagMatch) {
                    q.chuyen_de = tagMatch[1];
                    content = content.replace(/\((.*?)\)$/, '').trim();
                }
                q.noi_dung = content;
            } 
            // Lấy 4 đáp án
            else if (line.match(/^[A-D][\.\:]/i)) {
                q.dang_cau_hoi = 1;
                let opt = line.substring(0, 1).toUpperCase();
                let text = line.substring(2).trim();
                if (text.includes('(*)')) { q.dap_an_dung = opt; text = text.replace('(*)', '').trim(); }
                if (opt === 'A') q.dap_an_a = text;
                if (opt === 'B') q.dap_an_b = text;
                if (opt === 'C') q.dap_an_c = text;
                if (opt === 'D') q.dap_an_d = text;
            } 
            // Dạng Đúng/Sai
            else if (line.match(/^Đ\/S:/i)) {
                q.dang_cau_hoi = 2;
                let text = line.replace(/^Đ\/S:\s*/i, '');
                q.dap_an_dung = text.includes('(*)') ? text.replace('(*)', '').trim() : text.trim();
            } 
            // Dạng Điền ngắn
            else if (line.match(/^Đáp án:/i)) {
                q.dang_cau_hoi = 3;
                q.dap_an_dung = line.replace(/^Đáp án:\s*/i, '').trim();
            } 
            // Lời giải thích
            else if (line.match(/^Giải thích:/i)) {
                q.giai_thich = line.replace(/^Giải thích:\s*/i, '').trim();
            }
        });
        parsedData.push(q);
    });

    questionList = parsedData;
    localStorage.setItem('htk_questions', JSON.stringify(questionList));
    renderTeacherTables();
    document.getElementById('raw-question-input').value = "";
    alert(`Thành công! Đã nhận diện được ${parsedData.length} câu hỏi.`);
}

// --- RENDER BẢNG GIÁO VIÊN ---
function renderTeacherTables() {
    let qHtml = `<table><tr><th>Câu</th><th>Chuyên đề</th><th>Nội dung</th><th>Đáp án</th></tr>`;
    questionList.forEach(q => {
        let ans = q.dang_cau_hoi === 1 ? q.dap_an_dung : q.dap_an_dung;
        qHtml += `<tr><td>${q.cau_hoi_so}</td><td><span class="badge-info">${q.chuyen_de}</span></td><td>${q.noi_dung}</td><td><b>${ans}</b></td></tr>`;
    });
    qHtml += `</table>`;
    document.getElementById('question-table-container').innerHTML = qHtml;

    let rHtml = `<table><tr><th>Học sinh</th><th>Điểm</th><th>Số câu đúng</th><th>Chuyên đề yếu</th></tr>`;
    examResults.forEach(r => {
        rHtml += `<tr><td>${r.ho_va_ten} (${r.lop_hoc})</td><td><b>${r.diem}</b></td><td>${r.dung}/${r.tong}</td><td><span style="color:#ef4444; font-weight:600">${r.diem_yeu}</span></td></tr>`;
    });
    rHtml += `</table>`;
    document.getElementById('results-table-container').innerHTML = rHtml;
}

// --- LUỒNG LÀM BÀI HỌC SINH ---
function renderQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    questionList.forEach((q, i) => {
        let html = `<div class="question-item" id="q-block-${i}">
            <div class="q-tag">${q.chuyen_de}</div>
            <div class="q-title">Câu ${q.cau_hoi_so}: ${q.noi_dung}</div>`;
        
        if (q.dang_cau_hoi === 1) {
            html += `<div class="q-options">
                <label><input type="radio" name="q_${i}" value="A"> A. ${q.dap_an_a}</label>
                <label><input type="radio" name="q_${i}" value="B"> B. ${q.dap_an_b}</label>
                <label><input type="radio" name="q_${i}" value="C"> C. ${q.dap_an_c}</label>
                <label><input type="radio" name="q_${i}" value="D"> D. ${q.dap_an_d}</label>
            </div>`;
        } else if (q.dang_cau_hoi === 2) {
            html += `<div class="q-options">
                <label><input type="radio" name="q_${i}" value="Đúng"> Đúng</label>
                <label><input type="radio" name="q_${i}" value="Sai"> Sai</label>
            </div>`;
        } else {
            html += `<input type="text" class="short-input" id="q_${i}_ans" placeholder="Nhập đáp án...">`;
        }
        
        html += `<div class="explanation-box" id="exp-${i}" style="display:none;">
            <b>Giải thích:</b> ${q.giai_thich || 'Chưa có lời giải chi tiết.'}</div></div>`;
        container.innerHTML += html;
    });
}

function submitQuiz() {
    const user = JSON.parse(localStorage.getItem('htk_user'));
    let correctCount = 0;
    let weakTopics = {};

    questionList.forEach((q, i) => {
        let isCorrect = false;
        if (q.dang_cau_hoi === 1 || q.dang_cau_hoi === 2) {
            const selected = document.querySelector(`input[name="q_${i}"]:checked`);
            if (selected && selected.value.toUpperCase() === q.dap_an_dung.toUpperCase()) isCorrect = true;
        } else {
            const val = document.getElementById(`q_${i}_ans`).value.trim();
            if (val.toLowerCase() === q.dap_an_dung.toLowerCase()) isCorrect = true;
        }

        document.getElementById(`exp-${i}`).style.display = 'block';
        if (isCorrect) {
            correctCount++;
            document.getElementById(`q-block-${i}`).style.borderColor = "#22c55e";
        } else {
            document.getElementById(`q-block-${i}`).style.borderColor = "#ef4444";
            if (!weakTopics[q.chuyen_de]) weakTopics[q.chuyen_de] = 0;
            weakTopics[q.chuyen_de]++;
        }
    });

    let majorWeakness = "Không có";
    if (Object.keys(weakTopics).length > 0) {
        majorWeakness = Object.keys(weakTopics).reduce((a, b) => weakTopics[a] > weakTopics[b] ? a : b);
    }

    const score = ((correctCount / questionList.length) * 10).toFixed(1);
    
    examResults.push({
        ho_va_ten: user.name, lop_hoc: user.class,
        diem: score, dung: correctCount, tong: questionList.length,
        diem_yeu: majorWeakness
    });
    localStorage.setItem('htk_results', JSON.stringify(examResults));
    alert(`Nộp bài thành công!\nĐiểm của em: ${score}/10`);
}

function sendAIMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if(!text) return;
    const box = document.getElementById('chat-messages');
    box.innerHTML += `<div class="msg msg-user">${text}</div>`;
    input.value = '';
    
    setTimeout(() => {
        box.innerHTML += `<div class="msg msg-ai">AI ghi nhận thắc mắc: "${text}". Hãy xem kĩ phần giải thích ở dưới mỗi câu sai nhé!</div>`;
        box.scrollTop = box.scrollHeight;
    }, 500);
}
