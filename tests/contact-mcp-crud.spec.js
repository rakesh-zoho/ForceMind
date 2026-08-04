import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { setAllureMeta, apiStep, attachJson } from '../utils/reporter-utils.js';
import {
  createRecord,
  updateRecord,
  deleteRecord,
  query,
  search,
  resetAuth,
} from '../utils/sf-api-client.js';
import { loadData } from '../utils/data-factory.js';

const CONTACT_FIELDS = 'Id,FirstName,LastName,Email,Phone,Title,Department,Birthdate,AccountId';
const CLEANUP = process.env.CLEANUP !== 'false';

test.beforeAll(async () => {
  await resetAuth();
});

test.beforeEach(async () => {
  await setAllureMeta({
    epic: 'CRM',
    feature: 'Contact Management (MCP)',
    story: 'Contact CRUD via API',
    severity: 'critical',
  });
});

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== 'passed') {
    console.error(`FAILED: ${testInfo.title}`);
  }
});

test.describe('1. Contact Creation via MCP API', () => {

  test('MCP-01: Create Contact with Minimal Required Fields', async () => {
    const data = loadData('contact-mcp', 'minimalRequired');
    let recordId;

    await apiStep('Create Contact via API', async () => {
      const result = await createRecord('Contact', {
        FirstName: data.firstName,
        LastName: data.lastName,
      });
      recordId = result.id;
      await attachJson('Request', result.request);
      await attachJson('Response', { id: result.id, success: result.success, errors: result.errors });
      expect(result.success).toBe(true);
      expect(recordId).toBeTruthy();
    });

    await apiStep('Verify Contact via SOQL', async () => {
      const result = await query(`SELECT Id,FirstName,LastName FROM Contact WHERE Id = '${recordId}'`);
      await attachJson('SOQL Request', result.request);
      await attachJson('SOQL Response', { totalSize: result.totalSize, records: result.records });
      expect(result.totalSize).toBe(1);
      expect(result.records[0].FirstName).toBe(data.firstName);
      expect(result.records[0].LastName).toBe(data.lastName);
    });

    if (CLEANUP) {
      await apiStep('Cleanup - Delete Contact', async () => {
        const result = await deleteRecord('Contact', recordId);
        await attachJson('Request', result.request);
        await attachJson('Response', { success: result.success });
        const verify = await query(`SELECT Id FROM Contact WHERE Id = '${recordId}'`);
        expect(verify.totalSize).toBe(0);
      });
    }
  });

  test('MCP-02: Create Contact with All Standard Fields', async () => {
    const data = loadData('contact-mcp', 'allStandardFields');
    let recordId;

    await apiStep('Create Contact with all fields via API', async () => {
      const result = await createRecord('Contact', {
        FirstName: data.firstName,
        LastName: data.lastName,
        Phone: data.phone,
        Email: data.email,
        Title: data.title,
        Department: data.department,
        Birthdate: data.birthdate,
      });
      recordId = result.id;
      await attachJson('Request', result.request);
      await attachJson('Response', { id: result.id, success: result.success });
      expect(result.success).toBe(true);
    });

    await apiStep('Verify all field values via SOQL', async () => {
      const result = await query(`SELECT ${CONTACT_FIELDS} FROM Contact WHERE Id = '${recordId}'`);
      await attachJson('SOQL Request', result.request);
      await attachJson('SOQL Response', { totalSize: result.totalSize, records: result.records });
      expect(result.totalSize).toBe(1);
      const record = result.records[0];
      expect(record.FirstName).toBe(data.firstName);
      expect(record.LastName).toBe(data.lastName);
      expect(record.Phone).toBe(data.phone);
      expect(record.Email).toBe(data.email);
      expect(record.Title).toBe(data.title);
      expect(record.Department).toBe(data.department);
    });

    if (CLEANUP) {
      await apiStep('Cleanup - Delete Contact', async () => {
        await deleteRecord('Contact', recordId);
      });
    }
  });
});

test.describe('2. Contact Relationship via MCP API', () => {

  test('MCP-03: Create Contact Linked to Account', async () => {
    const data = loadData('contact-mcp', 'linkedToAccount');
    let recordId;
    let accountId;

    await apiStep('Query Test Account', async () => {
      const result = await query(`SELECT Id,Name FROM Account ORDER BY CreatedDate DESC LIMIT 1`);
      await attachJson('SOQL Request', result.request);
      await attachJson('SOQL Response', { totalSize: result.totalSize, records: result.records.map(r => ({ Id: r.Id, Name: r.Name })) });
      expect(result.totalSize).toBeGreaterThanOrEqual(1);
      accountId = result.records[0].Id;
    });

    await apiStep('Create Contact linked to Account via API', async () => {
      const result = await createRecord('Contact', {
        FirstName: data.firstName,
        LastName: data.lastName,
        Phone: data.phone,
        Email: data.email,
        AccountId: accountId,
      });
      recordId = result.id;
      await attachJson('Request', result.request);
      await attachJson('Response', { id: result.id, success: result.success });
      expect(result.success).toBe(true);
    });

    await apiStep('Verify AccountId populated via SOQL', async () => {
      const result = await query(`SELECT Id,FirstName,LastName,AccountId FROM Contact WHERE Id = '${recordId}'`);
      await attachJson('SOQL Request', result.request);
      await attachJson('SOQL Response', { totalSize: result.totalSize, records: result.records });
      expect(result.totalSize).toBe(1);
      expect(result.records[0].AccountId).toBe(accountId);
    });

    if (CLEANUP) {
      await apiStep('Cleanup - Delete Contact', async () => {
        await deleteRecord('Contact', recordId);
      });
    }
  });
});

test.describe('3. Contact Update via MCP API', () => {

  test('MCP-04: Update Contact Fields', async () => {
    const data = loadData('contact-mcp', 'updateFields');
    let recordId;
    const newEmail = `updated.${Date.now()}@newdomain.com`;
    const newPhone = '+1-555-111-2222';

    await apiStep('Create Contact for update testing', async () => {
      const result = await createRecord('Contact', {
        FirstName: data.firstName,
        LastName: data.lastName,
        Phone: data.phone,
        Email: data.email,
      });
      recordId = result.id;
      await attachJson('Request', result.request);
      await attachJson('Response', { id: result.id, success: result.success });
      expect(result.success).toBe(true);
    });

    await apiStep('Update Contact Email and Phone', async () => {
      const result = await updateRecord('Contact', recordId, {
        Email: newEmail,
        Phone: newPhone,
      });
      await attachJson('Request', result.request);
      await attachJson('Response', { success: result.success });
    });

    await apiStep('Verify updated values via SOQL', async () => {
      const result = await query(`SELECT Id,Email,Phone FROM Contact WHERE Id = '${recordId}'`);
      await attachJson('SOQL Request', result.request);
      await attachJson('SOQL Response', { totalSize: result.totalSize, records: result.records });
      expect(result.totalSize).toBe(1);
      expect(result.records[0].Email).toBe(newEmail);
      expect(result.records[0].Phone).toBe(newPhone);
    });

    if (CLEANUP) {
      await apiStep('Cleanup - Delete Contact', async () => {
        await deleteRecord('Contact', recordId);
      });
    }
  });
});

test.describe('4. Contact Deletion via MCP API', () => {

  test('MCP-05: Delete Contact and Verify', async () => {
    const data = loadData('contact-mcp', 'minimalRequired');
    let recordId;

    await apiStep('Create Contact for deletion testing', async () => {
      const result = await createRecord('Contact', {
        FirstName: data.firstName,
        LastName: data.lastName,
      });
      recordId = result.id;
      await attachJson('Request', result.request);
      await attachJson('Response', { id: result.id, success: result.success });
      expect(result.success).toBe(true);
    });

    await apiStep('Verify Contact exists before deletion', async () => {
      const result = await query(`SELECT Id FROM Contact WHERE Id = '${recordId}'`);
      await attachJson('SOQL Request', result.request);
      await attachJson('SOQL Response', { totalSize: result.totalSize });
      expect(result.totalSize).toBe(1);
    });

    await apiStep('Delete Contact', async () => {
      const result = await deleteRecord('Contact', recordId);
      await attachJson('Request', result.request);
      await attachJson('Response', { success: result.success });
    });

    await apiStep('Verify Contact deleted via SOQL', async () => {
      const result = await query(`SELECT Id FROM Contact WHERE Id = '${recordId}'`);
      await attachJson('SOQL Request', result.request);
      await attachJson('SOQL Response', { totalSize: result.totalSize });
      expect(result.totalSize).toBe(0);
    });
  });
});

test.describe('5. Contact Batch Operations via MCP API', () => {

  test('MCP-06: Create Multiple Contacts in Batch', async () => {
    const batchData = loadData('contact-mcp', 'batchCreate');
    const createdIds = [];

    await apiStep('Create 3 Contacts in batch', async () => {
      for (const item of batchData) {
        const result = await createRecord('Contact', {
          FirstName: item.firstName,
          LastName: item.lastName,
          Email: item.email,
        });
        await attachJson(`Create ${item.firstName}`, result.request);
        expect(result.success).toBe(true);
        createdIds.push(result.id);
      }
      await attachJson('Created IDs', { ids: createdIds, count: createdIds.length });
      expect(createdIds.length).toBe(3);
    });

    await apiStep('Verify all 3 Contacts exist via SOQL', async () => {
      const result = await query(`SELECT Id,FirstName,LastName FROM Contact WHERE Id IN ('${createdIds.join("','")}')`);
      await attachJson('SOQL Request', result.request);
      await attachJson('SOQL Response', { totalSize: result.totalSize, records: result.records });
      expect(result.totalSize).toBe(3);
    });

    if (CLEANUP) {
      await apiStep('Cleanup - Delete all batch Contacts', async () => {
        for (const id of createdIds) {
          await deleteRecord('Contact', id);
        }
        await attachJson('Deleted IDs', { ids: createdIds });
      });
    }
  });
});

test.describe('6. Contact Search via MCP API', () => {

  test('MCP-07: Search Contact via SOSL', async () => {
    const data = loadData('contact-mcp', 'soslSearch');
    let recordId;

    await apiStep('Create searchable Contact', async () => {
      const result = await createRecord('Contact', {
        FirstName: data.firstName,
        LastName: data.lastName,
        Email: data.email,
      });
      recordId = result.id;
      await attachJson('Request', result.request);
      await attachJson('Response', { id: result.id, success: result.success });
      expect(result.success).toBe(true);
    });

    await apiStep('Search Contact via SOSL', async () => {
      const soslQuery = `FIND {${data.searchTerm}} IN NAME FIELDS RETURNING Contact(Id,FirstName,LastName)`;
      const result = await search(soslQuery);
      await attachJson('SOSL Request', result.request);
      await attachJson('SOSL Response', { totalSize: result.totalSize, searchRecords: result.searchRecords });
      expect(result.searchRecords).toBeTruthy();
      const found = result.searchRecords.some(r => r.Id === recordId);
      expect(found).toBe(true);
    });

    if (CLEANUP) {
      await apiStep('Cleanup - Delete Contact', async () => {
        await deleteRecord('Contact', recordId);
      });
    }
  });
});

test.describe('7. Contact Edge Cases via MCP API', () => {

  test('MCP-08: Special Characters in Contact Fields', async () => {
    const data = loadData('contact-mcp', 'specialCharacters');
    let recordId;

    await apiStep('Create Contact with special characters', async () => {
      const result = await createRecord('Contact', {
        FirstName: data.firstName,
        LastName: data.lastName,
        Email: data.email,
      });
      recordId = result.id;
      await attachJson('Request', result.request);
      await attachJson('Response', { id: result.id, success: result.success });
      expect(result.success).toBe(true);
    });

    await apiStep('Verify special characters preserved via SOQL', async () => {
      const result = await query(`SELECT Id,FirstName,LastName FROM Contact WHERE Id = '${recordId}'`);
      await attachJson('SOQL Request', result.request);
      await attachJson('SOQL Response', { totalSize: result.totalSize, records: result.records });
      expect(result.totalSize).toBe(1);
      expect(result.records[0].FirstName).toBe(data.firstName);
      expect(result.records[0].LastName).toBe(data.lastName);
    });

    if (CLEANUP) {
      await apiStep('Cleanup - Delete Contact', async () => {
        await deleteRecord('Contact', recordId);
      });
    }
  });
});
