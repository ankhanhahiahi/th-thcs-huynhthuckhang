// --- Dữ liệu ban đầu ---
let studentList = JSON.parse(localStorage.getItem('studentList')) || [
    { ho_va_ten: "An Khánh", lop_hoc: "A1K29", ten_dang_nhap: "ankhanh_a1k29", mat_khau: "123" }
];

// Định dạng câu hỏi mới theo chuẩn Azota + Onluyen
let questionList = JSON.parse(localStorage.getItem('questionList')) || [
    { NoiDung: "Ở tế bào nhân thực, bào quan nào chứa ADN?", DapAnA: "Riboxom", DapAnB: "Ti thể", DapAnC: "Lưới nội chất", DapAnD: "Bộ máy Golgi", DapAnDung: "B", ChuyenDe: "Sinh học tế bào", MucDo: "Nhận biết", GiaiThich: "Ti thể và lục lạp là 2 bào quan có chứa ADN riêng." },
    { NoiDung: "Có bao nhiêu cách chọn 2 học sinh trực nhật từ một danh sách 37 học sinh?", DapAnA: "37", DapAnB: "74", DapAnC: "666", DapAnD: "1369", DapAnDung: "C", ChuyenDe: "Tổ hợp - Xác suất", MucDo: "Vận dụng", GiaiThich: "Sử dụng công thức tổ hợp chập 2 của 37: C(2, 37) = 666." }
];

let examResults = JSON.parse(localStorage.getItem('examResults')) || [];

document.addEventListener('DOMContentLoaded', () => { checkSession(); });

function checkSession() {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (savedUser) {
        document.getElementById('auth-buttons').style.display = 'none';
        document.getElementById('user-session').style.display = 'flex';
        document.getElementById('user-display-name').innerText = `[ ${savedUser.displayName.toUpperCase()} ]`;

        if (savedUser.role === 'student') {
            document.getElementById('student-badge').innerText = `USER: ${savedUser.displayName} \vert{} LỚP: ${savedUser.lop_hoc}`;
            renderQuiz();
            showView('student-quiz-view');
        } else if (savedUser.role === 'teacher') {
            renderTeacherTables();
            showView('teacher-dashboard-view');
        }
    } else {
        document.getElementById('auth-buttons').style.display = 'flex';
        document.getElementById('user-session').style.display = 'none';
        showView('landing-view');
    }
}

// ... (Giữ nguyên các hàm studentLogin, teacherLogin, registerTeacher, logout, goHome, showView, openModal, closeModal như cũ) ...

function renderQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';

    questionList.forEach((q, index) => {
        let html = `
        <div class="question-item" id="q-block-${index}">
            <div class="q-title">CÂU ${index + 1}:${q.NoiDung}</div>
            <div class="q-tag">Chuyên đề: ${q.ChuyenDe} \vert{} Mức độ: ${q.MucDo}</div>
            <div class="q-options">
                <label><input type="radio" name="q_${index}" value="A"> A. ${q.DapAnA}</label>
                <label><input type="radio" name="q_${index}" value="B"> B. ${q.DapAnB}</label>
                <label><input type="radio" name="q_${index}" value="C"> C. ${q.DapAnC}</label>
                <label><input type="radio" name="q_${index}" value="D"> D. ${q.DapAnD}</label>
            </div>
            <div class="explanation-box" id="exp-${index}" style="display:none;">
                <b>Giải thích:</b> ${q.GiaiThich || 'Không có giải thích chi tiết.'}
            </div>
        </div>`;
        container.innerHTML += html;
    });
}

function submitQuiz() {
    const userSession = JSON.parse(localStorage.getItem('currentUser'));
    let correctCount = 0;
    let weakTopics = {};

    questionList.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q_${index}"]:checked`);
        const expBox = document.getElementById(`exp-${index}`);
        expBox.style.display = 'block'; // Hiển thị giải thích sau khi nộp (Tính năng OLM)

        if (selected && selected.value === q.DapAnDung.toUpperCase().trim()) {
            correctCount++;
            document.getElementById(`q-block-${index}`).style.borderLeft = "4px solid green";
        } else {
            document.getElementById(`q-block-${index}`).style.borderLeft = "4px solid red";
            // Ghi nhận chuyên đề làm sai (Tính năng Onluyen)
            if (!weakTopics[q.ChuyenDe]) weakTopics[q.ChuyenDe] = 0;
            weakTopics[q.ChuyenDe]++;
        }
    });

    const score = parseFloat(((correctCount / questionList.length) * 10).toFixed(1));
    const now = new Date().toLocaleString('vi-VN');
    
    // Tìm chuyên đề sai nhiều nhất
    let majorWeakness = "Không có";
    if (Object.keys(weakTopics).length > 0) {
        majorWeakness = Object.keys(weakTopics).reduce((a, b) => weakTopics[a] > weakTopics[b] ? a : b);
    }

    examResults.push({
        ho_va_ten: userSession.displayName,
        lop_hoc: userSession.lop_hoc || "",
        diem_so: score,
        so_cau_dung: correctCount,
        diem_yeu: majorWeakness,
        thoi_gian_nop_bai: now
    });
    localStorage.setItem('examResults', JSON.stringify(examResults));

    alert(`KẾT QUẢMình hoàn toàn nhất trí! Tuy nhiên, dường như bạn chưa tải lên hoặc dán nội dung vào đoạn chat, nên hiện tại mình chưa nhìn thấy "những cái có sẵn" hay "file câu hỏi" mà bạn đang nhắc tới. 

Bạn gửi lại cho mình phần nội dung gốc nhé. Để làm lại file câu hỏi sao cho thật thuận tiện và dễ sử dụng, mình có thể giúp bạn tối ưu theo các hướng sau:

*   **Phân nhóm thông minh:** Sắp xếp lại các câu hỏi lộn xộn thành từng danh mục/chủ đề rõ ràng để người đọc dễ theo dõi mạch thông tin.
*   **Tối ưu hóa thao tác:** Xây dựng lại cấu trúc câu hỏi sao cho bạn có thể dễ dàng chuyển đổi thành các biểu mẫu trực tuyến, hoặc trình bày dưới dạng bảng tính (ví dụ: định dạng sẵn trên Google Sheets với các ô tick checkbox hoặc danh sách thả xuống - dropdown list) để thao tác thu thập dữ liệu nhanh gọn hơn.
*   **Tinh chỉnh văn phong:** Rà soát và rút gọn từ ngữ để câu hỏi đi thẳng vào trọng tâm, tránh gây hiểu lầm.

Bạn hãy gửi lại cho mình nội dung bạn đang có, đồng thời chia sẻ thêm một chút về mục đích sử dụng của bộ câu hỏi này (ví dụ: dùng để khảo sát ý kiến cho sự kiện lớp, form tuyển nhân sự CLB, hay bài tập...) nhé? Mình sẽ dựa vào đó để thiết kế lại một bản hoàn chỉnh nhất cho bạn!
