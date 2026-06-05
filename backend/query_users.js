const bcrypt = require('bcrypt');
const hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

async function testAdmin() {
    const passwords = ['admin', 'password', '123456', 'admin123', 'admin@123', 'root', '123456789'];
    for (const p of passwords) {
        const match = await bcrypt.compare(p, hash);
        if (match) {
            console.log('Found:', p);
            return;
        }
    }
    console.log('Not found');
}
testAdmin();
