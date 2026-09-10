// --- KHỞI TẠO DỮ LIỆU BAN ĐẦU HỆ THỐNG ---
let studentList = JSON.parse(localStorage.getItem('studentList')) || [
    { ho_va_ten: "Nguyễn Văn A", ngay_sinh: "15/08/2010", lop_hoc: "10A1", ten_dang_nhap: "nguyenvana_10a1", mat_khau: "Abc@123" },
    { ho_va_ten: "Trần Thị B", ngay_sinh: "20/10/2010", lop_hoc: "10A1", ten_dang_nhap: "tranthib_10a1", mat_khau: "Abc@123" }
];

let questionList = JSON.parse(localStorage.getItem('questionList')) || [
    { cau_hoi_so: 1, dang_cau_hoi: 1, noi_dung_cau_hoi: "Đâu là thủ đô của Việt Nam?", cau_tra_loi_1: "Hà Nội", cau_tra_loi_2: "Huế", cau_tra_loi_3: "Đà Nẵng", cau_tra_loi_4: "TP.HCM", dap_an_1: "x", dap_an_2: "", dap_an_3: "", dap_an_4: "", dap_an_ngan: "" },
    { cau_hoi_so: 2, dang_cau_hoi: 2, noi_dung_cau_hoi: "Nước sôi ở 100 độ C đúng hay sai?", cau_tra_loi_1: "Đúng", cau_tra_loi_2: "Sai", cau_tra_loi_3: "", cau_tra_loi_4: "", dap_an_1: "x", dap_an_2: "", dap_an_3: "", dap_an_4: "", dap_an_ngan: "" },
    { cau_hoi_so: 3, dang_cau_hoi: 3, noi_dung_cau_hoi: "5 cộng 7 bằng mấy?", cau_tra_loi_1: "", cau_tra_loi_2: "", cau_tra_loi_3: "", cau_tra_loi_4: "", dap_an_1: "", dap_an_2: "", dap_an_3: "", dap_an_4: "", dap_an_ngan: "12" }
];

let examResults = JSON.parse(localStorage.getItem('examResults')) || [
    { ho_va_ten: "Nguyễn Văn A", lop_hoc: "10A1", ten_dang_nhap: "nguyenvana_10a1", diem_so: 10.0, so_cau_dung: 3, so_cau_sai: 0, thoi_gian_nop_bai: "10/09/2026 09:15:00" }
];

// --- KIỂM TRA PHIÊN ĐĂNG NHẬP KHI TẢI LẠI TRANG (F5 PERSISTENCE) ---
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

function checkSession() {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
        // Nếu đã đăng nhập -> Hiển thị thông tin & chuyển giao diện tương ứng
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('user-session').style.display = 'flex';
        document.getElementById('user-display-name').innerText = `Xin chào, ${savedUser.displayName}`;

        if (savedUser.role === 'student') {
            document.getElementById('student-badge').innerText = `${savedUser.displayName} - Lớp ${savedUser.lop_hoc}`;
            renderQuiz();
            showView('student-quiz-view');
        } else if (savedUser.role === 'teacher') {
            renderTeacherTables();
            showView('teacher-dashboard-view');
        }
    } else {
        // Chưa đăng nhập -> Hiện trang chủ landing
        document.getElementById('auth-buttons').style.display = 'flex';
        document.getElementById('user-session').style.display = 'none';
        showView('landing-view');
    }
}

// --- ĐĂNG NHẬP & ĐĂNG XUẤT ---
function studentLogin() {
    const username = document.getElementById('hs-username').value.trim();
    const found = studentList.find(s => s.ten_dang_nhap === username);
    
    if (found) {
        const userSession = {
            role: 'student',
            displayName: found.ho_va_ten,
            username: found.ten_dang_nhap,
            lop_hoc: found.lop_hoc
        };
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        closeModal('login-modal');
        checkSession();
    } else {
        alert('Tên đăng nhập không đúng! Thử lại với: nguyenvana_10a1');
    }
}

function teacherLogin() {
    const email = document.getElementById('gv-username').value.trim();
    if (!email) {
        alert('Vui lòng nhập Email!');
        return;
    }
    const userSession = {
        role: 'teacher',
        displayName: `GV. ${email.split('@')[0]}`
    };
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    closeModal('teacher-login-modal');
    checkSession();
}

function registerTeacher() {
    const name = document.getElementById('reg-gv-name').value.trim();
    if (!name) {
        alert('Vui lòng nhập đầy đủ họ tên!');
        return;
    }
    alert('Đăng ký thành công! Hệ thống đã tự động đăng nhập cho Thầy/Cô.');
    const userSession = {
        role: 'teacher',
        displayName: `GV. ${name}`
    };
    localStorage.setItem('currentUser', JSON.stringify(userSession));
    closeModal('register-modal');
    checkSession();
}

function logout() {
    localStorage.removeItem('currentUser');
    checkSession();
}

function goHome() {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!savedUser) {
        showView('landing-view');
    }
}

// --- QUẢN LÝ GIAO DIỆN & MODAL ---
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

function openModal(modalId) { document.getElementById(modalId).style.display = 'flex'; }
function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }

// --- KHU VỰC LÀM BÀI HỌC SINH ---
function renderQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';

    questionList.forEach((q) => {
        let html = `<div class="question-item">
            <div class="q-title">Câu ${q.cau_hoi_so}: ${q.noi_dung_cau_hoi}</div>`;

        if (parseInt(q.dang_cau_hoi) === 1) { // 4 đáp án
            html += `<div class="q-options">
                <label><input type="radio" name="q_${q.cau_hoi_so}" value="1"> A. ${q.cau_tra_loi_1}</label>
                <label><input type="radio" name="q_${q.cau_hoi_so}" value="2"> B. ${q.cau_tra_loi_2}</label>
                <label><input type="radio" name="q_${q.cau_hoi_so}" value="3"> C. ${q.cau_tra_loi_3}</label>
                <label><input type="radio" name="q_${q.cau_hoi_so}" value="4"> D. ${q.cau_tra_loi_4}</label>
            </div>`;
        } else if (parseInt(q.dang_cau_hoi) === 2) { // Đúng / Sai
            html += `<div class="q-options">
                <label><input type="radio" name="q_${q.cau_hoi_so}" value="1"> A. ${q.cau_tra_loi_1}</label>
                <label><input type="radio" name="q_${q.cau_hoi_so}" value="2"> B. ${q.cau_tra_loi_2}</label>
            </div>`;
        } else if (parseInt(q.dang_cau_hoi) === 3) { // Ngắn (max 4 ký tự)
            html += `<div>
                <input type="text" class="short-input" id="q_${q.cau_hoi_so}_ans" maxlength="4" placeholder="Tối đa 4 ký tự">
            </div>`;
        }
        html += `</div>`;
        container.innerHTML += html;
    });
}

function submitQuiz() {
    const userSession = JSON.parse(localStorage.getItem('currentUser'));
    let correctCount = 0;

    questionList.forEach(q => {
        if (parseInt(q.dang_cau_hoi) === 1 || parseInt(q.dang_cau_hoi) === 2) {
            const selected = document.querySelector(`input[name="q_${q.cau_hoi_so}"]:checked`);
            if (selected && q[`dap_an_${selected.value}`]?.toLowerCase() === 'x') {
                correctCount++;
            }
        } else if (parseInt(q.dang_cau_hoi) === 3) {
            const ansInput = document.getElementById(`q_${q.cau_hoi_so}_ans`);
            if (ansInput && ansInput.value.trim().toLowerCase() === String(q.dap_an_ngan).trim().toLowerCase()) {
                correctCount++;
            }
        }
    });

    const score = parseFloat(((correctCount / questionList.length) * 10).toFixed(1));
    const now = new Date().toLocaleString('vi-VN');

    examResults.push({
        ho_va_ten: userSession.displayName,
        lop_hoc: userSession.lop_hoc || "10A1",
        ten_dang_nhap: userSession.username || "hs_user",
        diem_so: score,
        so_cau_dung: correctCount,
        so_cau_sai: questionList.length - correctCount,
        thoi_gian_nop_bai: now
    });

    localStorage.setItem('examResults', JSON.stringify(examResults));
    alert(`Em đã hoàn thành bài thi!\nSố câu đúng: ${correctCount}/${questionList.length}\nĐiểm số: ${score}`);
}

// --- CHATBOT AI NOTEBOOKLM ---
function sendAIMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `<div class="msg msg-user">${text}</div>`;
    input.value = '';

    setTimeout(() => {
        let aiReply = "AI đang xử lý câu hỏi từ bài học...";
        if (text.includes("thủ đô")) {
            aiReply = "Thủ đô của Việt Nam là Hà Nội, trung tâm chính trị, văn hóa của cả nước.";
        } else if (text.includes("nước sôi")) {
            aiReply = "Đúng vậy, nước tinh khiết sôi ở 100 độ C ở điều kiện áp suất tiêu chuẩn.";
        } else {
            aiReply = `AI NotebookLM đã nhận thắc mắc "${text}". Em hãy kiểm tra lại tài liệu bài giảng hoặc nhắn cho Thầy/Cô nhé!`;
        }
        chatMessages.innerHTML += `<div class="msg msg-ai">${aiReply}</div>`;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 600);
}

// --- ĐỌC VÀ XUẤT FILE EXCEL / CSV (SHEETJS) ---
function handleStudentUpload(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(evt) {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        studentList = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        localStorage.setItem('studentList', JSON.stringify(studentList));
        renderTeacherTables();
        alert('Cập nhật thành công danh sách học sinh!');
    };
    reader.readAsArrayBuffer(file);
}

function handleQuestionUpload(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(evt) {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        questionList = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        localStorage.setItem('questionList', JSON.stringify(questionList));
        renderTeacherTables();
        alert('Cập nhật thành công ngân hàng câu hỏi!');
    };
    reader.readAsArrayBuffer(file);
}

function exportResults() {
    const ws = XLSX.utils.json_to_sheet(examResults);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KetQua");
    XLSX.writeFile(wb, "ket_qua_bai_lam.xlsx");
}

function renderTeacherTables() {
    // Bảng học sinh
    let sHtml = `<table><thead><tr><th>Họ và Tên</th><th>Ngày Sinh</th><th>Lớp</th><th>Tên Đăng Nhập</th></tr></thead><tbody>`;
    studentList.forEach(s => {
        sHtml += `<tr><td>${s.ho_va_ten||''}</td><td>${s.ngay_sinh||''}</td><td>${s.lop_hoc||''}</td><td>${s.ten_dang_nhap||''}</td></tr>`;
    });
    sHtml += `</tbody></table>`;
    document.getElementById('student-table-container').innerHTML = sHtml;

    // Bảng câu hỏi
    let qHtml = `<table><thead><tr><th>Câu</th><th>Dạng</th><th>Nội dung câu hỏi</th><th>Đáp án</th></tr></thead><tbody>`;
    questionList.forEach(q => {
        let dapAnText = q.dang_cau_hoi == 3 ? q.dap_an_ngan : 'Xem trong file';
        qHtml += `<tr><td>${q.cau_hoi_so}</td><td>Dạng ${q.dang_cau_hoi}</td><td>${q.noi_dung_cau_hoi}</td><td>${dapAnText}</td></tr>`;
    });
    qHtml += `</tbody></table>`;
    document.getElementById('question-table-container').innerHTML = qHtml;

    // Bảng kết quả
    let rHtml = `<table><thead><tr><th>Họ và Tên</th><th>Lớp</th><th>Điểm</th><th>Số câu đúng</th><th>Thời gian nộp</th></tr></thead><tbody>`;
    examResults.forEach(r => {
        rHtml += `<tr><td>${r.ho_va_ten}</td><td>${r.lop_hoc}</td><td><b>${r.diem_so}</b></td><td>${r.so_cau_dung}</td><td>${r.thoi_gian_nop_bai}</td></tr>`;
    });
    rHtml += `</tbody></table>`;
    document.getElementById('results-table-container').innerHTML = rHtml;
}
