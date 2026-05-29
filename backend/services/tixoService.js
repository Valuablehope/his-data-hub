// Using global fetch available in Node.js 18+

async function getTixoToken() {
    const loginUrl = `${process.env.TIXO_API_URL || 'http://localhost:3000'}/api/auth/login`;
    
    // We use global fetch API
    const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: process.env.TIXO_SERVICE_EMAIL || 'his-data-hub@yourdomain.com',
            password: process.env.TIXO_SERVICE_PASSWORD || 'your_secure_password'
        })
    });

    if (!response.ok) {
        throw new Error(`TIXO Auth Failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.success && data.token) {
        return data.token;
    } else {
        throw new Error('TIXO Auth Failed: Token not found in response');
    }
}

async function createTixoTicket({ title, description, category_id, priority, source_channel = 'HIS Data Hub', subcategory_id, space_id }) {
    try {
        const token = await getTixoToken();
        const ticketsUrl = `${process.env.TIXO_API_URL || 'http://localhost:3000'}/api/tickets`;

        const ticketPayload = {
            title,
            description,
            category_id,
            priority,
            source_channel,
        };

        if (subcategory_id) ticketPayload.subcategory_id = subcategory_id;
        if (space_id) ticketPayload.space_id = space_id;

        const response = await fetch(ticketsUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketPayload)
        });

        if (!response.ok) {
            const errData = await response.text();
            throw new Error(`Failed to create TIXO ticket: ${response.status} ${errData}`);
        }

        const data = await response.json();
        console.log(`Successfully created TIXO ticket. Reference Code: ${data.reference_code}, ID: ${data.id}`);
        return data;
    } catch (error) {
        console.error('Error integrating with TIXO:', error.message);
        throw error;
    }
}

module.exports = {
    createTixoTicket,
    getTixoToken
};
