// โหลดข้อมูลเก่าจาก LocalStorage เมื่อเปิดเว็บ
let memos = JSON.parse(localStorage.getItem('myMemos')) || [];

// ขออนุญาตแจ้งเตือนบนเบราว์เซอร์ (Browser Notification)
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

// ฟังก์ชันแสดงผลรายการ Memo
function renderMemos() {
    const memoList = document.getElementById('memoList');
    memoList.innerHTML = '';

    memos.forEach((memo, index) => {
        const card = document.createElement('div');
        card.className = 'memo-card';

        let timeHtml = '';
        if (memo.time) {
            const formattedTime = new Date(memo.time).toLocaleString('th-TH');
            timeHtml = `<div class="reminder-badge">⏰ เตือนเมื่อ: ${formattedTime}</div>`;
        }

        card.innerHTML = `
            <div>
                <h3>${memo.title}</h3>
                <p>${memo.content}</p>
                ${timeHtml}
            </div>
            <button class="delete-btn" onclick="deleteMemo(${index})">ลบออก</button>
        `;
        memoList.appendChild(card);
    });
}

// ฟังก์ชันเพิ่ม Memo ใหม่
function addMemo() {
    const title = document.getElementById('memoTitle').value.trim();
    const content = document.getElementById('memoContent').value.trim();
    const time = document.getElementById('reminderTime').value;

    if (!title && !content) {
        alert('กรุณาใส่หัวข้อหรือรายละเอียดอย่างน้อย 1 อย่างครับ');
        return;
    }

    const newMemo = {
        id: Date.now(),
        title: title || 'ไม่มีหัวข้อ',
        content: content,
        time: time,
        notified: false // สถานะว่าแจ้งเตือนไปหรือยัง
    };

    memos.push(newMemo);
    saveAndRender();

    // ล้างค่าในช่องกรอก
    document.getElementById('memoTitle').value = '';
    document.getElementById('memoContent').value = '';
    document.getElementById('reminderTime').value = '';
}

// ฟังก์ชันลบ Memo
function deleteMemo(index) {
    memos.splice(index, 1);
    saveAndRender();
}

// บันทึกลง LocalStorage และอัปเดตหน้าจอ
function saveAndRender() {
    localStorage.setItem('myMemos', JSON.stringify(memos));
    renderMemos();
}

// ระบบตรวจสอบเวลาแจ้งเตือนทุกๆ 5 วินาที
setInterval(() => {
    const now = new Date().getTime();
    let updated = false;

    memos.forEach(memo => {
        if (memo.time && !memo.notified) {
            const reminderTimestamp = new Date(memo.time).getTime();
            if (now >= reminderTimestamp) {
                triggerAlert(memo);
                memo.notified = true;
                updated = true;
            }
        }
    });

    if (updated) {
        localStorage.setItem('myMemos', JSON.stringify(memos));
    }
}, 5000);

// ฟังก์ชันแสดงการแจ้งเตือน
function triggerAlert(memo) {
    // แจ้งเตือนผ่านระบบของเบราว์เซอร์ (ถ้าอนุญาตไว้)
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`⏰ เตือนความจำ: ${memo.title}`, {
            body: memo.content
        });
    }
    // แจ้งเตือนแบบ Pop-up บนหน้าเว็บ
    alert(`⏰ ถึงเวลาแล้ว!\nหัวข้อ: ${memo.title}\nรายละเอียด: ${memo.content}`);
}

// เรียกแสดงผลครั้งแรกตอนเปิดหน้าเว็บ
renderMemos();