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

// ฟังก์ชันสุ่มคำศัพท์
function pickRandomWord() {
    if (vocabData.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * vocabData.length);
    const randomItem = vocabData[randomIndex];
    
    document.getElementById('quizWord').textContent = randomItem.word;
    document.getElementById('quizType').textContent = `(${randomItem.type})`;
    document.getElementById('quizMeaning').textContent = randomItem.meaning;
    
    // รีเซ็ตการ์ดให้กลับมาหน้าแรกเสมอเมื่อสุ่มคำใหม่
    document.getElementById('flipCard').classList.remove('flipped');
}

// จัดการเมื่อกดปุ่มสุ่มคำใหม่
document.getElementById('randomBtn').addEventListener('click', pickRandomWord);

// จัดการเมื่อคลิกที่การ์ดให้พลิกดูความหมาย
document.getElementById('flipCard').addEventListener('click', function() {
    this.classList.toggle('flipped');
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
        alert(`สำเร็จแล้ว! จำเพิ่มได้ 1 คำ จำได้แน่แกกกก คำที่: "${word}" ✌️✨`);
        
        // ล้างข้อมูลในฟอร์มและดึงข้อมูลใหม่มาแสดง
        document.getElementById('addWordForm').reset();
        fetchData(); 
        
    } catch (error) {
        statusMsg.textContent = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
        statusMsg.style.color = "#F44336"; 
    }
});