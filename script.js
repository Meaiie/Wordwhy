// >>> เปลี่ยน URL ด้านล่างนี้เป็น Web App URL ของคุณ <<<
const API_URL = 'https://script.google.com/macros/s/AKfycbwbDgsW4bLZSUr_wUjeN7Mavf47hYajTw3aNs0xPCInwNAUi47UDQp_26Fdd4vjkDlZ/exec'; 

let vocabData = [];

// ฟังก์ชันดึงข้อมูลจาก Google Sheets
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        vocabData = await response.json();
        renderList();
        pickRandomWord();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// ฟังก์ชันแสดงรายการคำศัพท์ในตาราง
function renderList() {
    const list = document.getElementById('wordList');
    // .slice().reverse() เพื่อให้คำศัพท์ล่าสุดขึ้นก่อน
    list.innerHTML = vocabData.slice().reverse().map(item => `
        <tr>
            <td><strong>${item.word}</strong></td>
            <td style="color: var(--text-muted); font-style: italic;">${item.type}</td>
            <td>${item.meaning}</td>
        </tr>
    `).join('');
}

let currentCorrectWord = ""; // สร้างตัวแปรมาเก็บคำตอบที่ถูกต้องไว้ตรวจ

// ฟังก์ชันสุ่มคำศัพท์ (อัปเดตใหม่)
function pickRandomWord() {
    if (vocabData.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * vocabData.length);
    const randomItem = vocabData[randomIndex];
    
    currentCorrectWord = randomItem.word; // เก็บคำศัพท์ไว้ตรวจ
    
    // สลับให้ด้านหน้าโชว์ความหมาย ด้านหลังโชว์คำศัพท์
    document.getElementById('quizMeaning').textContent = randomItem.meaning;
    document.getElementById('quizType').textContent = `(${randomItem.type})`;
    document.getElementById('quizWord').textContent = randomItem.word;
    
    // รีเซ็ตการ์ดและช่องพิมพ์ให้พร้อมสำหรับคำถามใหม่
    document.getElementById('flipCard').classList.remove('flipped');
    document.getElementById('guessInput').value = "";
    document.getElementById('guessInput').focus();
}

// จัดการเมื่อกดปุ่มสุ่มคำใหม่
document.getElementById('randomBtn').addEventListener('click', pickRandomWord);

// --- ลบระบบคลิกการ์ดเพื่อพลิกออกไป เพราะเราจะให้พลิกตอนตอบถูกเท่านั้น ---

// ฟังก์ชันตรวจคำตอบ
function checkAnswer() {
    const userGuess = document.getElementById('guessInput').value.trim().toLowerCase();
    const actualWord = currentCorrectWord.trim().toLowerCase();

    if (!userGuess) {
        alert("พิมพ์คำศัพท์ก่อนตรวจน้าาา 🥺");
        return;
    }

    if (userGuess === actualWord) {
        // ตอบถูก!
        alert(`ปังมากกก! 🎉 ตอบถูกจ้า คำนั้นคือ "${currentCorrectWord}" เก่งเวอร์!`);
        document.getElementById('flipCard').classList.add('flipped'); // พลิกป้ายโชว์เฉลย
    } else {
        // ตอบผิด!
        alert("อุ๊ย ยังไม่ใช่น้าาา ลองคิดดูดีๆ อีกที สู้ๆ แกทำได้! ✌️");
        document.getElementById('guessInput').focus(); // ให้เคอร์เซอร์กลับไปที่ช่องพิมพ์เพื่อแก้คำตอบ
    }
}

// กดปุ่มส่งคำตอบ
document.getElementById('checkBtn').addEventListener('click', checkAnswer);

// กด Enter ในช่องพิมพ์เพื่อส่งคำตอบได้เลย (เพิ่มความสะดวก)
document.getElementById('guessInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // ป้องกันฟอร์มรีเฟรช
        checkAnswer();
    }
});

// จัดการฟอร์มเพิ่มคำศัพท์
document.getElementById('addWordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const word = document.getElementById('word').value;
    const type = document.getElementById('type').value;
    const meaning = document.getElementById('meaning').value;
    const statusMsg = document.getElementById('statusMsg');

    // แสดงสถานะกำลังบันทึก
    statusMsg.textContent = "กำลังบันทึกข้อมูล...";
    statusMsg.classList.remove('hidden');
    statusMsg.style.color = "var(--text-muted)";

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ word, type, meaning }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' } 
        });
        
        // ซ่อนข้อความ "กำลังบันทึก" 
        statusMsg.classList.add('hidden');
        
        // --- จุดที่เพิ่มใหม่: ให้หน้าต่างเด้งขึ้นมาบอก! ---
// ซ่อนข้อความ "กำลังบันทึก" 
        statusMsg.classList.add('hidden');
        
        // --- เริ่มระบบ ป๊อปอัป + นับคำ + จุดพลุ ---
        
        // คำนวณว่าเป็นคำที่เท่าไหร่ (เอาจำนวนคำที่มีอยู่เดิม + 1)
        const wordCount = vocabData.length + 1; 

        // ดึงกล่อง Modal มาใช้งาน
        const modal = document.getElementById('successModal');
        const modalMsg = document.getElementById('modalMessage');
        
        // ใส่ข้อความนับคำศัพท์เข้าไป
        modalMsg.innerHTML = `สำเร็จแล้ว! จำได้แน่แกกก<br>นี่คือ <strong>คำที่ ${wordCount}</strong> ของเราแล้วนะ!<br><br>คำศัพท์: <strong style="color: var(--primary-color); font-size: 1.3rem;">"${word}"</strong> ✌️✨`;
        
        // โชว์ป๊อปอัป
        modal.classList.add('show');
        
        // สั่งจุดพลุ Confetti!
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        // จัดการปุ่ม "ลุยต่อ!" เพื่อปิดป๊อปอัป
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            modal.classList.remove('show');
        });
        // --- จบระบบป๊อปอัป ---

        // ล้างข้อมูลในฟอร์มและดึงข้อมูลใหม่มาแสดง
        document.getElementById('addWordForm').reset();
        fetchData();
        
    } catch (error) {
        statusMsg.textContent = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
        statusMsg.style.color = "#F44336"; 
    }
});