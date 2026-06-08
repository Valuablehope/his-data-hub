const { poolPromise } = require('./db');

const SEED_DATA = [
    // ECHO_25055
    {
        projectCode: 'ECHO_25055', projectName: 'ECHO 25055',
        toolType: 'Reporting Tool', sortOrder: 1,
        linkLabel: 'ECHO 25055 - Reporting Tool .xlsx',
        linkUrl: 'https://assopuami.sharepoint.com/sites/LIB_Grants/_layouts/15/guestaccess.aspx?share=EYO9sG_xuQBPqtQVaSNUf4cBWOnyXfMMHgo_jWrTRlTenA&e=BOY7HP'
    },
    {
        projectCode: 'ECHO_25055', projectName: 'ECHO 25055',
        toolType: 'Budget Monitoring', sortOrder: 2,
        linkLabel: 'ECHO_Budget Monitoring Tool_25055',
        linkUrl: 'https://docs.google.com/spreadsheets/d/1GxRd6obF8sLun_b1tZ71mILCjtaXuuh6k0S1otzEe08/edit?gid=1372865961'
    },
    {
        projectCode: 'ECHO_25055', projectName: 'ECHO 25055',
        toolType: 'Finance', sortOrder: 3,
        linkLabel: '05. Finance',
        linkUrl: 'https://assopuami.sharepoint.com/sites/LIB_Grants/_layouts/15/guestaccess.aspx?share=IgAFu-z4VFAgT5qxGuYLKiuuAXCHOd9bAoIRigf6o5RFzzo&e=ZzD6E2'
    },

    // LHF_25078
    {
        projectCode: 'LHF_25078', projectName: 'LHF 25078',
        toolType: 'Reporting Tool', sortOrder: 1,
        linkLabel: 'LHF 25078 - Reporting Tool.xlsx',
        linkUrl: 'https://assopuami.sharepoint.com/sites/LIB_Grants/_layouts/15/guestaccess.aspx?share=Ef3bIbDBPPhGs30B2EJwJ0MBjSGUugyr6407NhhduCAiXA&e=Mwh25J'
    },
    {
        projectCode: 'LHF_25078', projectName: 'LHF 25078',
        toolType: 'Budget Monitoring', sortOrder: 2,
        linkLabel: 'LHF 25078 - BUDGET MONITORING TOOL - V1.0',
        linkUrl: 'https://docs.google.com/spreadsheets/d/1EgDjUPra9UWj2UcMWjym4sW9h9fxa2cmlHDi9jQpy9U/edit?gid=743194374'
    },

    // LHF_25079
    {
        projectCode: 'LHF_25079', projectName: 'LHF 25079',
        toolType: 'Reporting Tool', sortOrder: 1,
        linkLabel: 'LHF 25079 - Reporting Tool.xlsx',
        linkUrl: 'https://assopuami.sharepoint.com/sites/LIB_Grants/_layouts/15/guestaccess.aspx?share=EbuRtbVDU8JHuLhWuM8kaWEBQ57Bg6d6zqGI33IspvuIZg&e=t1mrWG'
    },
    {
        projectCode: 'LHF_25079', projectName: 'LHF 25079',
        toolType: 'Budget Monitoring', sortOrder: 2,
        linkLabel: 'LHF 25079 - BUDGET MONITORING TOOL - V1.0',
        linkUrl: 'https://docs.google.com/spreadsheets/d/1fjDz7lDS1ks7E7zCf6TywzOClXD2T25wCfodflDM4XA/edit?gid=1207837162'
    },
    {
        projectCode: 'LHF_25079', projectName: 'LHF 25079',
        toolType: 'Finance', sortOrder: 3,
        linkLabel: '05. Finance',
        linkUrl: 'https://assopuami.sharepoint.com/sites/LIB_Grants/_layouts/15/guestaccess.aspx?share=IgBdqQI1EXSRRpLR5VkwJuAhAd1ZEYZSzHC3mxdVtr_8mMI&e=EqYlUt'
    },

    // LHF_26001
    {
        projectCode: 'LHF_26001', projectName: 'LHF 26001',
        toolType: 'Reporting Tool', sortOrder: 1,
        linkLabel: 'LHF 26001 - Reporting Tool.xlsx',
        linkUrl: 'https://assopuami.sharepoint.com/sites/LIB_Grants/_layouts/15/guestaccess.aspx?share=IQBlFvz0ZdlkRK2pLzvicfqYAXiAjwlkMyQ0r_MJv8qWNn4&e=ikyNaD'
    },
    {
        projectCode: 'LHF_26001', projectName: 'LHF 26001',
        toolType: 'Finance', sortOrder: 3,
        linkLabel: '05. Finance',
        linkUrl: 'https://assopuami.sharepoint.com/sites/LIB_Grants/_layouts/15/guestaccess.aspx?share=IgA_NNfFx612T4ZNh7OmBX9aAW2pPe8wPtHx9oLtB1VO-CI&e=gnjmZn'
    },

    // AFD SAQIRH II
    {
        projectCode: 'AFD_SAQIRH_II', projectName: 'AFD SAQIRH II',
        toolType: 'Reporting Tool', sortOrder: 1,
        linkLabel: 'AFD-REPORTING TOOL - SAQIRH II (PUI).xlsx',
        linkUrl: 'https://assopuami.sharepoint.com/sites/LIB_Grants/_layouts/15/guestaccess.aspx?share=ES8inKNq10pMpPFQtCKEQ34BHEML0qvLo_7VmefkTVjVyw&e=tQ0ZCv'
    },
    {
        projectCode: 'AFD_SAQIRH_II', projectName: 'AFD SAQIRH II',
        toolType: 'Budget Monitoring', sortOrder: 2,
        linkLabel: 'AFD SAQIRH II - BUDGET MONITORING TOOL - V1.0',
        linkUrl: 'https://docs.google.com/spreadsheets/d/12YY1JZtNKuQiytsJOiyz__xzBwvsU1feI9qXvjPJm44/edit?gid=1207837162'
    },
    {
        projectCode: 'AFD_SAQIRH_II', projectName: 'AFD SAQIRH II',
        toolType: 'Finance', sortOrder: 3,
        linkLabel: '05. Finance',
        linkUrl: 'https://assopuami.sharepoint.com/sites/LIB_Grants/_layouts/15/guestaccess.aspx?share=IgAuW-oa9_zyTKi4tOMGSdVPAWs5MpAuXXa8C8nHqLV-AU4&e=hVrR8g'
    },

    // NDICI_2025
    {
        projectCode: 'NDICI_2025', projectName: 'NDICI 2025',
        toolType: 'Reporting Tool', sortOrder: 1,
        linkLabel: 'EU-2025.xlsx',
        linkUrl: 'https://assopuami.sharepoint.com/sites/LIB_Grants/_layouts/15/guestaccess.aspx?share=IQBz55TWBhj6Qrgqb8pZtutaAdzfSqzZeRCEfn-aLa5imDI&e=rfklSy'
    },
    {
        projectCode: 'NDICI_2025', projectName: 'NDICI 2025',
        toolType: 'Budget Monitoring', sortOrder: 2,
        linkLabel: 'EU 2025 - BUDGET MONITORING TOOL - V1.0',
        linkUrl: 'https://docs.google.com/spreadsheets/d/12y6UAstex4VjqDh-_bK5ZueUcEOZLzIBC00JxKwhy5Y/edit?gid=1800437284'
    },
    {
        projectCode: 'NDICI_2025', projectName: 'NDICI 2025',
        toolType: 'Finance', sortOrder: 3,
        linkLabel: '05. Finance',
        linkUrl: 'https://assopuami.sharepoint.com/sites/LIB_Grants/_layouts/15/guestaccess.aspx?share=IgBAJUQeff1DQZ6MEpkBlGN3AWNW6AFOworFvLFBYJEY1bI&e=524Kgb'
    },
];

async function seed() {
    try {
        const pool = await poolPromise;

        const existing = await pool.request().query('SELECT COUNT(*) AS cnt FROM ProjectLinks WHERE IsActive = 1');
        if (existing.recordset[0].cnt > 0) {
            console.log(`ProjectLinks already has ${existing.recordset[0].cnt} records. Skipping seed.`);
            process.exit(0);
        }

        for (const row of SEED_DATA) {
            await pool.request()
                .input('ProjectCode', row.projectCode)
                .input('ProjectName', row.projectName)
                .input('ToolType', row.toolType)
                .input('LinkLabel', row.linkLabel)
                .input('LinkUrl', row.linkUrl)
                .input('SortOrder', row.sortOrder)
                .query(`
                    INSERT INTO ProjectLinks (ProjectCode, ProjectName, ToolType, LinkLabel, LinkUrl, SortOrder)
                    VALUES (@ProjectCode, @ProjectName, @ToolType, @LinkLabel, @LinkUrl, @SortOrder)
                `);
            console.log(`  Inserted: [${row.projectCode}] ${row.toolType}`);
        }

        console.log(`\nSeed complete — ${SEED_DATA.length} records inserted.`);
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
}

seed();
