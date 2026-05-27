const API_URL = 'https://script.google.com/macros/s/AKfycbwbDgsW4bLZSUr_wUjeN7Mavf47hYajTw3aNs0xPCInwNAUi47UDQp_26Fdd4vjkDlZ/exec';

let vocabData = [];
let currentPage = 1;   // หน้าปัจจุบัน
const rowsPerPage = 10; // ตั้งค่าให้แสดงหน้าละ 10 คำ

// ฟังก์ชันดึงข้อมูลจาก Google Sheets (อัปเดตแก้ปัญหาโหลดช้า/ไม่ขึ้นตอนรีเฟรช)
async function fetchData() {
    try {
        // ใส่ ?t=${Date.now()} ห้อยท้ายเพื่อเคลียร์ Cache บังคับดึงข้อมูลใหม่เอี่ยมเสมอ
        const response = await fetch(`${API_URL}?t=${Date.now()}`);
        vocabData = await response.json();
        
        // แสดงตารางและสุ่มคำถาม
        renderList();
        pickRandomWord();
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('wordList').innerHTML = `<tr><td colspan="3" style="text-align: center; color: #F44336;">โหลดข้อมูลไม่สำเร็จ กรุณารีเฟรชอีกครั้ง</td></tr>`;
    }
}

// ฟังก์ชันแสดงรายการคำศัพท์แบบแบ่งหน้า (Pagination)
function renderList() {
    const list = document.getElementById('wordList');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageInfo = document.getElementById('pageInfo');

    if (!vocabData || vocabData.length === 0) {
        list.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">ยังไม่มีคำศัพท์ในระบบ แอดคำแรกได้เลย!</td></tr>`;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        pageInfo.textContent = "หน้า 1 จาก 1";
        return;
    }

    // กลับด้านข้อมูลเพื่อให้คำศัพท์ใหม่ล่าสุดขึ้นก่อน
    const reversedData = vocabData.slice().reverse();
    
    // คำนวณจำนวนหน้าทั้งหมด
    const totalPages = Math.ceil(reversedData.length / rowsPerPage);
    
    // คุมไม่ให้หน้าปัจจุบันเกินขอบเขตที่มีจริง
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    // หาจุดเริ่มต้นและจุดสิ้นสุดของข้อมูลในหน้านั้นๆ (ทีละ 10 คำ)
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = reversedData.slice(startIndex, endIndex);

    // เรนเดอร์ข้อมูลลงในตาราง
    list.innerHTML = pageData.map(item => `
        <tr>
            <td><strong>${item.word}</strong></td>
            <td style="color: var(--text-muted); font-style: italic;">${item.type}</td>
            <td>${item.meaning}</td>
        </tr>
    `).join('');

    // อัปเดตข้อความบอกเลขหน้า และสถานะของปุ่ม ก่อนหน้า/ถัดไป
    pageInfo.textContent = `หน้า ${currentPage} จาก ${totalPages}`;
    prevBtn.disabled = (currentPage === 1);
    nextBtn.disabled = (currentPage === totalPages);
}

// ระบบปุ่มควบคุมการเปลี่ยนหน้า
document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderList();
    }
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
    const totalPages = Math.ceil(vocabData.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderList();
    }
});


// --- ระบบมินิเกมสุ่มทายคำศัพท์ ---
let currentCorrectWord = ""; 

function pickRandomWord() {
    if (vocabData.length === 0) {
        document.getElementById('quizMeaning').textContent = "เพิ่มคำศัพท์ก่อนเริ่มเล่นทายคำน้า";
        return;
    }
    const randomIndex = Math.floor(Math.random() * vocabData.length);
    const randomItem = vocabData[randomIndex];
    
    currentCorrectWord = randomItem.word;
    
    document.getElementById('quizMeaning').textContent = randomItem.meaning;
    document.getElementById('quizType').textContent = `(${randomItem.type})`;
    document.getElementById('quizWord').textContent = randomItem.word;
    
    document.getElementById('flipCard').classList.remove('flipped');
    document.getElementById('guessInput').value = "";
}

document.getElementById('randomBtn').addEventListener('click', pickRandomWord);

function checkAnswer() {
    const userGuess = document.getElementById('guessInput').value.trim().toLowerCase();
    const actualWord = currentCorrectWord.trim().toLowerCase();
    
    // ดึงกล่องป๊อปอัปที่เราสร้างไว้แล้วมาใช้งาน
    const modal = document.getElementById('successModal');
    const modalTitle = document.querySelector('#successModal h2'); // ดึงหัวข้อมาเปลี่ยนด้วย
    const modalMsg = document.getElementById('modalMessage');

    if (!userGuess) {
        alert("พิมพ์คำก่อนน้อง เบลอหรอคะ 🥺");
        return;
    }

    if (userGuess === actualWord) {
        // --- กรณีตอบถูก ---
        modalTitle.innerHTML = "🎉 เริ่ดดดดด ! 🎉";
        modalMsg.innerHTML = `คำตอบของชีวิตเวอร์ เฉลยครืออ <br><strong style="color: var(--primary-color); font-size: 1.5rem;">"${currentCorrectWord}"</strong><br><br>โง่น้อยงงนิดนึง`;
        
        // โชว์ป๊อปอัป
        modal.classList.add('show');
        
        // จุดพลุฉลอง
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        // พลิกการ์ดเฉลย
        document.getElementById('flipCard').classList.add('flipped');
        
    } else {
        // --- กรณีตอบผิด ---
        modalTitle.innerHTML = "🥺 อุ๊ยยย...";
        modalMsg.innerHTML = "ว้ายยย ง่าวแต๊ง่าวว่า<br><br>สู้ๆ เดี๋ยวก็ตายละ ✌️";
        
        // โชว์ป๊อปอัป (แบบไม่มีพลุ)
        modal.classList.add('show');
        
        // คืนเคอร์เซอร์ไปที่ช่องพิมพ์ให้พิมพ์ใหม่
        document.getElementById('guessInput').focus();
    }
}

document.getElementById('checkBtn').addEventListener('click', checkAnswer);
document.getElementById('guessInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkAnswer();
    }
});


// --- ระบบฟอร์มเพิ่มคำศัพท์ ---
document.getElementById('addWordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const word = document.getElementById('word').value;
    const type = document.getElementById('type').value;
    const meaning = document.getElementById('meaning').value;
    const statusMsg = document.getElementById('statusMsg');

    statusMsg.textContent = "กำลังบันทึกข้อมูล...";
    statusMsg.classList.remove('hidden');
    statusMsg.style.color = "var(--text-muted)";

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ word, type, meaning }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' } 
        });
        
        statusMsg.classList.add('hidden');
        
        // คำนวณว่าเป็นคำที่เท่าไหร่
        const wordCount = vocabData.length + 1; 

        const modal = document.getElementById('successModal');
        const modalMsg = document.getElementById('modalMessage');
        
        modalMsg.innerHTML = `จำไม่ได้ก็ลองเคี้ยว ๆ<br> <strong>คำที่ ${wordCount}</strong> แล้วกลืนลงท้องนะ<br><br>คำศัพท์: <strong style="color: var(--primary-color); font-size: 1.3rem;">"${word}"</strong> ✌️✨`;
        
        modal.classList.add('show');
        
        // จุดพลุฉลอง
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            modal.classList.remove('show');
        });

        document.getElementById('addWordForm').reset();
        
        // ดึงข้อมูลใหม่มาอัปเดตตารางทันที
        fetchData(); 
        
    } catch (error) {
        statusMsg.textContent = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
        statusMsg.style.color = "#F44336"; 
    }
});

// บังคับให้โหลดข้อมูลทันทีที่เปิดหน้าเว็บขึ้นมาครั้งแรก (แก้ปัญหาตารางว่าง)
window.addEventListener('DOMContentLoaded', fetchData);

// --- ระบบปุ่มปิดป๊อปอัป (ส่วนกลาง) ---
document.getElementById('closeModalBtn').onclick = function() {
    // ซ่อนป๊อปอัป
    document.getElementById('successModal').classList.remove('show');
    
    // แถม: เคลียร์ช่องทายคำศัพท์ให้ว่าง และพร้อมพิมพ์คำต่อไปได้เลย
    const guessInput = document.getElementById('guessInput');
    if (guessInput) {
        guessInput.value = "";
        guessInput.focus();
    }
};