import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const AUTH_STATE_PATH = path.join(process.cwd(), 'reports', '.auth-state.json');

let accessToken = null;
let instanceUrl = null;

async function ensureAuth() {
  if (accessToken) return;

  const authState = JSON.parse(fs.readFileSync(AUTH_STATE_PATH, 'utf-8'));
  const cookies = authState.cookies || [];
  const sidCookie = cookies.find(c => c.name === 'sid' && c.domain.includes('salesforce'));

  if (!sidCookie) throw new Error('No SF session cookie found. Run browser login first.');

  instanceUrl = `https://${sidCookie.domain}`;
  accessToken = sidCookie.value;
}

async function api(method, path, body = null) {
  await ensureAuth();

  const opts = {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${instanceUrl}${path}`, opts);

  if (method === 'DELETE') {
    if (!res.ok) throw new Error(`DELETE failed: ${res.status} ${await res.text()}`);
    return { success: true };
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`API ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

export async function createRecord(sobjectName, fields) {
  const apiFields = { ...fields };
  if (apiFields.Birthdate?.includes('/')) {
    const [dd, mm, yyyy] = apiFields.Birthdate.split('/');
    apiFields.Birthdate = `${yyyy}-${mm}-${dd}`;
  }
  const data = await api('POST', `/services/data/v62.0/sobjects/${sobjectName}/`, apiFields);
  return { id: data.id, success: data.success, request: { operation: 'CREATE', sobject: sobjectName, fields: apiFields } };
}

export async function updateRecord(sobjectName, recordId, fields) {
  await api('PATCH', `/services/data/v62.0/sobjects/${sobjectName}/${recordId}`, fields);
  return { success: true, request: { operation: 'UPDATE', sobject: sobjectName, id: recordId, fields } };
}

export async function deleteRecord(sobjectName, recordId) {
  await api('DELETE', `/services/data/v62.0/sobjects/${sobjectName}/${recordId}`);
  return { success: true, request: { operation: 'DELETE', sobject: sobjectName, id: recordId } };
}

export async function query(soql) {
  const data = await api('GET', `/services/data/v62.0/query?q=${encodeURIComponent(soql)}`);
  return { ...data, request: { operation: 'SOQL', query: soql } };
}

export async function search(sosl) {
  const data = await api('GET', `/services/data/v62.0/search/?q=${encodeURIComponent(sosl)}`);
  return { ...data, request: { operation: 'SOSL', query: sosl } };
}

export async function resetAuth() {
  accessToken = null;
  instanceUrl = null;
}
