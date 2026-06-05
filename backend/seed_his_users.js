const bcrypt = require('bcrypt');
const { poolPromise } = require('./db');

const hisTeamMembers = [
    { username: 'hims', role: 'HIS_TEAM', fullName: 'HIM Specialist' },
    { username: 'his_tm', role: 'HIS_TEAM', fullName: 'HIS Team Manager' },
    { username: 'co_officer_1', role: 'HIS_TEAM', fullName: 'Coordination Officer 1' },
    { username: 'co_officer_2', role: 'HIS_TEAM', fullName: 'Coordination Officer 2' },
    { username: 'saida_officer_1', role: 'HIS_TEAM', fullName: 'Saida Officer 1' },
    { username: 'saida_officer_2', role: 'HIS_TEAM', fullName: 'Saida Officer 2' },
    { username: 'tripoli_officer', role: 'HIS_TEAM', fullName: 'Tripoli Officer' }
];

async function seedUsers() {
    try {
        const pool = await poolPromise;
        const defaultPassword = 'password123';
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);

        for (const member of hisTeamMembers) {
            // Check if user exists
            const checkUser = await pool.request()
                .input('Username', member.username)
                .query(`SELECT Id FROM Users WHERE Username = @Username`);

            let userId;
            if (checkUser.recordset.length === 0) {
                // Create user
                const insertUser = await pool.request()
                    .input('Username', member.username)
                    .input('PasswordHash', passwordHash)
                    .input('Role', member.role)
                    .query(`
                        INSERT INTO Users (Username, PasswordHash, Role)
                        OUTPUT INSERTED.Id
                        VALUES (@Username, @PasswordHash, @Role)
                    `);
                userId = insertUser.recordset[0].Id;
                console.log(`Created user: ${member.username}`);
            } else {
                userId = checkUser.recordset[0].Id;
                console.log(`User already exists: ${member.username}`);
            }

            // Check if availability exists
            const checkAvail = await pool.request()
                .input('UserId', userId)
                .query(`SELECT Id FROM Availabilities WHERE UserId = @UserId`);

            if (checkAvail.recordset.length === 0) {
                await pool.request()
                    .input('UserId', userId)
                    .query(`
                        INSERT INTO Availabilities (UserId, Status, Notes)
                        VALUES (@UserId, 'Online', '')
                    `);
                console.log(`Created default availability for: ${member.username}`);
            }
        }

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedUsers();
