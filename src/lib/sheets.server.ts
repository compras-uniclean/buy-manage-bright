const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

export const SHEET_COMPRAS = "11PHeifywVE2hR1bT6mCnYyMHfvzLfVet6RwU3BIkJzs";
export const SHEET_ESTOQUE = "1aWpD8dRB0L91Gmbpw2WRZY3vpEI4njNZMr4LNyOMTSY";

function authHeaders() {
  const lov = process.env.LOVABLE_API_KEY;
  const key = process.env.GOOGLE_SHEETS_API_KEY;
  if (!lov) throw new Error("LOVABLE_API_KEY ausente");
  if (!key) throw new Error("GOOGLE_SHEETS_API_KEY ausente");
  return {
    Authorization: `Bearer ${lov}`,
    "X-Connection-Api-Key": key,
    "Content-Type": "application/json",
  };
}

export async function readRange(spreadsheetId: string, range: string) {
  const url = `${GATEWAY_URL}/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range).replace(/%21/g, "!").replace(/%3A/g, ":")}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets read failed [${res.status}]: ${body}`);
  }
  const data = (await res.json()) as { values?: string[][] };
  return data.values ?? [];
}

export async function updateRange(spreadsheetId: string, range: string, values: (string | number)[][]) {
  const url = `${GATEWAY_URL}/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range).replace(/%21/g, "!").replace(/%3A/g, ":")}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ values }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets update failed [${res.status}]: ${body}`);
  }
  return res.json();
}

export function rowsToObjects(values: string[][]): Record<string, string>[] {
  if (values.length < 1) return [];
  const headers = values[0];
  return values.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? "";
    });
    return obj;
  });
}
